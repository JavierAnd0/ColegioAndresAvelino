import mongoose from 'mongoose';

const blogPostSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'El título del post es obligatorio'],
      trim: true,
      maxlength: [200, 'El título no puede tener más de 200 caracteres'],
    },
    slug: {
      type: String,
      unique: true,
      lowercase: true,
      trim: true,
    },
    excerpt: {
      type: String,
      required: [true, 'El extracto/resumen es obligatorio'],
      trim: true,
      maxlength: [300, 'El extracto no puede tener más de 300 caracteres'],
    },
    content: {
      type: String,
      required: [true, 'El contenido del post es obligatorio'],
    },
    featuredImage: {
      url: {
        type: String,
        default: '',
      },
      alt: {
        type: String,
        default: '',
      },
    },
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    category: {
      type: String,
      enum: {
        values: ['noticias', 'eventos', 'actividades', 'logros', 'anuncios', 'general'],
        message: '{VALUE} no es una categoría válida',
      },
      default: 'general',
    },
    tags: [{
      type: String,
      trim: true,
      lowercase: true,
    }],
    status: {
      type: String,
      enum: {
        values: ['borrador', 'publicado', 'archivado'],
        message: '{VALUE} no es un estado válido',
      },
      default: 'borrador',
    },
    publishedAt: {
      type: Date,
    },
    views: {
      type: Number,
      default: 0,
      min: 0,
    },
    likes: {
      type: Number,
      default: 0,
      min: 0,
    },
    isFeatured: {
      type: Boolean,
      default: false, // Post destacado en página principal
    },
    seo: {
      metaTitle: {
        type: String,
        maxlength: [60, 'El meta título no puede tener más de 60 caracteres'],
      },
      metaDescription: {
        type: String,
        maxlength: [160, 'La meta descripción no puede tener más de 160 caracteres'],
      },
    },
  },
  {
    timestamps: true, // createdAt y updatedAt
  }
);

// Índices para optimizar búsquedas
blogPostSchema.index({ slug: 1 });
blogPostSchema.index({ status: 1 });
blogPostSchema.index({ category: 1 });
blogPostSchema.index({ publishedAt: -1 }); // Orden descendente para posts más recientes
blogPostSchema.index({ tags: 1 });
blogPostSchema.index({ isFeatured: 1 });

// Método virtual para obtener la URL del post
blogPostSchema.virtual('url').get(function() {
  return `/blog/${this.slug}`;
});

// Método virtual para verificar si está publicado
blogPostSchema.virtual('isPublished').get(function() {
  return this.status === 'publicado' && this.publishedAt <= new Date();
});

// Método virtual para tiempo de lectura estimado (basado en palabras)
blogPostSchema.virtual('readingTime').get(function() {
  const wordsPerMinute = 200;
  const wordCount = this.content.split(/\s+/).length;
  const minutes = Math.ceil(wordCount / wordsPerMinute);
  return `${minutes} min de lectura`;
});

// Asegurar que los virtuals se incluyan en JSON
blogPostSchema.set('toJSON', { virtuals: true });
blogPostSchema.set('toObject', { virtuals: true });

// Middleware pre-save: Generar slug automáticamente si no existe
blogPostSchema.pre('save', function(next) {
  if (!this.slug) {
    // Crear slug desde el título
    this.slug = this.title
      .toLowerCase()
      .normalize('NFD') // Normalizar caracteres especiales
      .replace(/[\u0300-\u036f]/g, '') // Eliminar acentos
      .replace(/[^a-z0-9\s-]/g, '') // Eliminar caracteres especiales
      .replace(/\s+/g, '-') // Espacios a guiones
      .replace(/-+/g, '-') // Múltiples guiones a uno solo
      .trim();
  }
  
  // Si se publica por primera vez, establecer publishedAt
  if (this.status === 'publicado' && !this.publishedAt) {
    this.publishedAt = new Date();
  }
  
  next();
});

// Middleware pre-save: Generar SEO automático si no existe
blogPostSchema.pre('save', function(next) {
  if (!this.seo.metaTitle) {
    this.seo.metaTitle = this.title.substring(0, 60);
  }
  if (!this.seo.metaDescription) {
    this.seo.metaDescription = this.excerpt.substring(0, 160);
  }
  next();
});

// Método de instancia para incrementar vistas
blogPostSchema.methods.incrementViews = function() {
  this.views += 1;
  return this.save();
};

// Método de instancia para incrementar likes
blogPostSchema.methods.incrementLikes = function() {
  this.likes += 1;
  return this.save();
};

// Método estático para obtener posts destacados
blogPostSchema.statics.getFeatured = function() {
  return this.find({ 
    isFeatured: true, 
    status: 'publicado',
    publishedAt: { $lte: new Date() }
  })
  .sort({ publishedAt: -1 })
  .limit(3)
  .populate('author', 'name email');
};

// Método estático para obtener posts recientes
blogPostSchema.statics.getRecent = function(limit = 10) {
  return this.find({ 
    status: 'publicado',
    publishedAt: { $lte: new Date() }
  })
  .sort({ publishedAt: -1 })
  .limit(limit)
  .populate('author', 'name email');
};

const BlogPost = mongoose.model('BlogPost', blogPostSchema);

export default BlogPost;