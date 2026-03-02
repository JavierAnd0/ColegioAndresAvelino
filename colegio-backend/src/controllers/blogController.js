import BlogPost from '../models/blogpost.js';

// @desc    Obtener todos los posts del blog
// @route   GET /api/blog
// @access  Public
export const getAllPosts = async (req, res) => {
  try {
    const { 
      status = 'publicado',
      category,
      tag,
      search,
      limit = 20,
      page = 1 
    } = req.query;

    // Construir filtros
    const filters = {};

    // Solo mostrar posts publicados al público (a menos que sea admin)
    if (!req.user || req.user.role !== 'admin') {
      filters.status = 'publicado';
      filters.publishedAt = { $lte: new Date() };
    } else if (status) {
      filters.status = status;
    }

    if (category) {
      filters.category = category;
    }

    if (tag) {
      filters.tags = tag;
    }

    // Búsqueda por texto en título o contenido
    if (search) {
      filters.$or = [
        { title: { $regex: search, $options: 'i' } },
        { excerpt: { $regex: search, $options: 'i' } },
        { content: { $regex: search, $options: 'i' } },
      ];
    }

    // Paginación
    const limitNum = parseInt(limit);
    const skip = (parseInt(page) - 1) * limitNum;

    // Obtener posts
    const posts = await BlogPost.find(filters)
      .populate('author', 'name email avatar bio')
      .sort({ publishedAt: -1 })
      .limit(limitNum)
      .skip(skip);

    // Contar total para paginación
    const total = await BlogPost.countDocuments(filters);

    res.status(200).json({
      success: true,
      count: posts.length,
      total,
      page: parseInt(page),
      pages: Math.ceil(total / limitNum),
      data: posts,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error al obtener posts',
    });
  }
};

// @desc    Obtener un post por ID o slug
// @route   GET /api/blog/:identifier
// @access  Public
export const getPostByIdOrSlug = async (req, res) => {
  try {
    const { identifier } = req.params;
    
    // Intentar buscar por ID o por slug
    let post;
    
    if (identifier.match(/^[0-9a-fA-F]{24}$/)) {
      // Es un ID válido de MongoDB
      post = await BlogPost.findById(identifier);
    } else {
      // Es un slug
      post = await BlogPost.findOne({ slug: identifier });
    }

    if (!post) {
      return res.status(404).json({
        success: false,
        message: 'Post no encontrado',
      });
    }

    // Verificar si el post está publicado (a menos que sea el autor o admin)
    if (post.status !== 'publicado' || post.publishedAt > new Date()) {
      if (!req.user || (req.user.id !== post.author.toString() && req.user.role !== 'admin')) {
        return res.status(403).json({
          success: false,
          message: 'Este post no está disponible',
        });
      }
    }

    // Popular el autor
    await post.populate('author', 'name email avatar bio');

    // Incrementar vistas (solo si está publicado y no es el autor)
    if (post.status === 'publicado' && (!req.user || req.user.id !== post.author._id.toString())) {
      await post.incrementViews();
    }

    res.status(200).json({
      success: true,
      data: post,
    });
  } catch (error) {
    if (error.name === 'CastError') {
      return res.status(400).json({
        success: false,
        message: 'ID o slug no válido',
      });
    }

    res.status(500).json({
      success: false,
      message: 'Error al obtener el post',
    });
  }
};

// @desc    Crear un nuevo post
// @route   POST /api/blog
// @access  Private (requiere autenticación)
export const createPost = async (req, res) => {
  try {
    // Agregar el autor
    req.body.author = req.user.id;

    const post = await BlogPost.create(req.body);

    // Popular el autor antes de devolver
    await post.populate('author', 'name email avatar');

    res.status(201).json({
      success: true,
      message: 'Post creado exitosamente',
      data: post,
    });
  } catch (error) {
    // Error de slug duplicado
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: 'Ya existe un post con ese título (slug duplicado)',
      });
    }

    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({
        success: false,
        message: 'Error de validación',
        errors: messages,
      });
    }

    res.status(500).json({
      success: false,
      message: 'Error al crear el post',
    });
  }
};

// @desc    Actualizar un post
// @route   PUT /api/blog/:id
// @access  Private (requiere autenticación)
export const updatePost = async (req, res) => {
  try {
    let post = await BlogPost.findById(req.params.id);

    if (!post) {
      return res.status(404).json({
        success: false,
        message: 'Post no encontrado',
      });
    }

    // Verificar permisos: solo el autor, editor o admin pueden editar
    const canEdit = 
      post.author.toString() === req.user.id || 
      req.user.role === 'admin' || 
      req.user.role === 'editor';

    if (!canEdit) {
      return res.status(403).json({
        success: false,
        message: 'No tienes permisos para editar este post',
      });
    }

    // Si se cambia el título, regenerar el slug
    if (req.body.title && req.body.title !== post.title) {
      delete req.body.slug; // Dejar que el modelo lo regenere
    }

    // Si se publica el post por primera vez, establecer publishedAt
    // (findByIdAndUpdate no ejecuta pre('save'), hay que hacerlo manualmente)
    if (req.body.status === 'publicado' && !post.publishedAt) {
      req.body.publishedAt = new Date();
    }

    // Actualizar el post
    post = await BlogPost.findByIdAndUpdate(
      req.params.id,
      req.body,
      {
        new: true,
        runValidators: true,
      }
    ).populate('author', 'name email avatar');

    res.status(200).json({
      success: true,
      message: 'Post actualizado exitosamente',
      data: post,
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: 'Ya existe un post con ese título (slug duplicado)',
      });
    }

    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({
        success: false,
        message: 'Error de validación',
        errors: messages,
      });
    }

    if (error.name === 'CastError') {
      return res.status(400).json({
        success: false,
        message: 'ID de post no válido',
      });
    }

    res.status(500).json({
      success: false,
      message: 'Error al actualizar el post',
    });
  }
};

// @desc    Eliminar un post
// @route   DELETE /api/blog/:id
// @access  Private (requiere autenticación)
export const deletePost = async (req, res) => {
  try {
    const post = await BlogPost.findById(req.params.id);

    if (!post) {
      return res.status(404).json({
        success: false,
        message: 'Post no encontrado',
      });
    }

    // Verificar permisos: solo el autor o admin pueden eliminar
    if (post.author.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'No tienes permisos para eliminar este post',
      });
    }

    await post.deleteOne();

    res.status(200).json({
      success: true,
      message: 'Post eliminado exitosamente',
      data: {},
    });
  } catch (error) {
    if (error.name === 'CastError') {
      return res.status(400).json({
        success: false,
        message: 'ID de post no válido',
      });
    }

    res.status(500).json({
      success: false,
      message: 'Error al eliminar el post',
    });
  }
};

// @desc    Obtener posts destacados
// @route   GET /api/blog/featured
// @access  Public
export const getFeaturedPosts = async (req, res) => {
  try {
    // 1. Intentar posts destacados (isFeatured + publicado + publishedAt)
    let posts = await BlogPost.getFeatured();

    // 2. Fallback: posts recientes publicados con publishedAt
    if (posts.length === 0) {
      posts = await BlogPost.getRecent(3);
    }

    // 3. Fallback: posts publicados sin importar publishedAt
    //    (cubre posts que se marcaron como 'publicado' pero no tienen fecha)
    if (posts.length === 0) {
      posts = await BlogPost.find({ status: 'publicado' })
        .sort({ createdAt: -1 })
        .limit(3)
        .populate('author', 'name email');
    }

    res.status(200).json({
      success: true,
      count: posts.length,
      data: posts,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error al obtener posts destacados',
    });
  }
};

// @desc    Obtener posts recientes
// @route   GET /api/blog/recent
// @access  Public
export const getRecentPosts = async (req, res) => {
  try {
    const { limit = 10 } = req.query;
    const posts = await BlogPost.getRecent(parseInt(limit));

    res.status(200).json({
      success: true,
      count: posts.length,
      data: posts,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error al obtener posts recientes',
    });
  }
};

// @desc    Dar like a un post
// @route   POST /api/blog/:id/like
// @access  Public
export const likePost = async (req, res) => {
  try {
    const post = await BlogPost.findById(req.params.id);

    if (!post) {
      return res.status(404).json({
        success: false,
        message: 'Post no encontrado',
      });
    }

    await post.incrementLikes();

    res.status(200).json({
      success: true,
      message: 'Like agregado',
      likes: post.likes,
    });
  } catch (error) {
    if (error.name === 'CastError') {
      return res.status(400).json({
        success: false,
        message: 'ID de post no válido',
      });
    }

    res.status(500).json({
      success: false,
      message: 'Error al dar like',
    });
  }
};

// @desc    Obtener posts por categoría
// @route   GET /api/blog/category/:category
// @access  Public
export const getPostsByCategory = async (req, res) => {
  try {
    const { category } = req.params;
    const validCategories = ['noticias', 'eventos', 'actividades', 'logros', 'anuncios', 'general'];

    if (!validCategories.includes(category)) {
      return res.status(400).json({
        success: false,
        message: 'Categoría no válida',
        validCategories,
      });
    }

    const posts = await BlogPost.find({
      category,
      status: 'publicado',
      publishedAt: { $lte: new Date() },
    })
      .populate('author', 'name email avatar')
      .sort({ publishedAt: -1 })
      .limit(20);

    res.status(200).json({
      success: true,
      count: posts.length,
      data: posts,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error al obtener posts por categoría',
    });
  }
};

// @desc    Obtener posts por tag
// @route   GET /api/blog/tag/:tag
// @access  Public
export const getPostsByTag = async (req, res) => {
  try {
    const { tag } = req.params;

    const posts = await BlogPost.find({
      tags: tag.toLowerCase(),
      status: 'publicado',
      publishedAt: { $lte: new Date() },
    })
      .populate('author', 'name email avatar')
      .sort({ publishedAt: -1 })
      .limit(20);

    res.status(200).json({
      success: true,
      count: posts.length,
      tag,
      data: posts,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error al obtener posts por tag',
    });
  }
};

// @desc    Obtener todos los tags únicos
// @route   GET /api/blog/tags/all
// @access  Public
export const getAllTags = async (req, res) => {
  try {
    const tags = await BlogPost.distinct('tags', {
      status: 'publicado',
      publishedAt: { $lte: new Date() },
    });

    res.status(200).json({
      success: true,
      count: tags.length,
      data: tags,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error al obtener tags',
    });
  }
};