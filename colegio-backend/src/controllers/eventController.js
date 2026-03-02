import Event from '../models/event.js';

// @desc    Obtener todos los eventos
// @route   GET /api/events
// @access  Public
export const getAllEvents = async (req, res) => {
  try {
    const {
      category,
      startDate,
      endDate,
      isPublic,
      limit = 100
    } = req.query;

    // Construir filtros dinámicos
    const filters = {};

    if (category) {
      filters.category = category;
    }

    if (isPublic !== undefined) {
      filters.isPublic = isPublic === 'true';
    }

    // Filtrar por rango de fechas
    if (startDate || endDate) {
      filters.startDate = {};
      if (startDate) {
        filters.startDate.$gte = new Date(startDate);
      }
      if (endDate) {
        filters.startDate.$lte = new Date(endDate);
      }
    }

    // Obtener eventos
    const events = await Event.find(filters)
      .populate('createdBy', 'name email')
      .sort({ startDate: 1 })
      .limit(parseInt(limit));

    res.status(200).json({
      success: true,
      count: events.length,
      data: events,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error al obtener eventos',
    });
  }
};

// @desc    Obtener un evento por ID
// @route   GET /api/events/:id
// @access  Public
export const getEventById = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id)
      .populate('createdBy', 'name email avatar');

    if (!event) {
      return res.status(404).json({
        success: false,
        message: 'Evento no encontrado',
      });
    }

    res.status(200).json({
      success: true,
      data: event,
    });
  } catch (error) {
    // Si el ID no es válido (CastError)
    if (error.name === 'CastError') {
      return res.status(400).json({
        success: false,
        message: 'ID de evento no válido',
      });
    }

    res.status(500).json({
      success: false,
      message: 'Error al obtener el evento',
    });
  }
};

// @desc    Crear un nuevo evento
// @route   POST /api/events
// @access  Private (requiere autenticación)
export const createEvent = async (req, res) => {
  try {
    // Agregar el usuario que crea el evento
    req.body.createdBy = req.user.id;

    const event = await Event.create(req.body);

    // Popular el campo createdBy antes de devolver
    await event.populate('createdBy', 'name email');

    res.status(201).json({
      success: true,
      message: 'Evento creado exitosamente',
      data: event,
    });
  } catch (error) {
    // Errores de validación de Mongoose
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
      message: 'Error al crear el evento',
    });
  }
};

// @desc    Actualizar un evento
// @route   PUT /api/events/:id
// @access  Private (requiere autenticación)
export const updateEvent = async (req, res) => {
  try {
    let event = await Event.findById(req.params.id);

    if (!event) {
      return res.status(404).json({
        success: false,
        message: 'Evento no encontrado',
      });
    }

    // Verificar permisos: solo el creador o admin pueden editar
    if (event.createdBy.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'No tienes permisos para editar este evento',
      });
    }

    // Actualizar el evento
    event = await Event.findByIdAndUpdate(
      req.params.id,
      req.body,
      {
        new: true, // Devolver el documento actualizado
        runValidators: true, // Ejecutar validaciones
      }
    ).populate('createdBy', 'name email');

    res.status(200).json({
      success: true,
      message: 'Evento actualizado exitosamente',
      data: event,
    });
  } catch (error) {
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
        message: 'ID de evento no válido',
      });
    }

    res.status(500).json({
      success: false,
      message: 'Error al actualizar el evento',
    });
  }
};

// @desc    Eliminar un evento
// @route   DELETE /api/events/:id
// @access  Private (requiere autenticación)
export const deleteEvent = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);

    if (!event) {
      return res.status(404).json({
        success: false,
        message: 'Evento no encontrado',
      });
    }

    // Verificar permisos: solo el creador o admin pueden eliminar
    if (event.createdBy.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'No tienes permisos para eliminar este evento',
      });
    }

    await event.deleteOne();

    res.status(200).json({
      success: true,
      message: 'Evento eliminado exitosamente',
      data: {},
    });
  } catch (error) {
    if (error.name === 'CastError') {
      return res.status(400).json({
        success: false,
        message: 'ID de evento no válido',
      });
    }

    res.status(500).json({
      success: false,
      message: 'Error al eliminar el evento',
    });
  }
};

// @desc    Obtener eventos próximos (siguiente semana)
// @route   GET /api/events/upcoming
// @access  Public
export const getUpcomingEvents = async (req, res) => {
  try {
    const now = new Date();
    const nextMonth = new Date();
    nextMonth.setDate(nextMonth.getDate() + 30);

    let events = await Event.find({
      startDate: { $gte: now, $lte: nextMonth },
      isPublic: true,
    })
      .populate('createdBy', 'name email')
      .sort({ startDate: 1 })
      .limit(10);

    // Si no hay eventos en los próximos 30 días, mostrar los más recientes
    if (events.length === 0) {
      events = await Event.find({
        isPublic: true,
      })
        .populate('createdBy', 'name email')
        .sort({ startDate: -1 })
        .limit(4);
    }

    res.status(200).json({
      success: true,
      count: events.length,
      data: events,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error al obtener eventos próximos',
    });
  }
};

// @desc    Obtener eventos por categoría
// @route   GET /api/events/category/:category
// @access  Public
export const getEventsByCategory = async (req, res) => {
  try {
    const { category } = req.params;
    const validCategories = ['academico', 'deportivo', 'cultural', 'reunion', 'festivo', 'otro'];

    if (!validCategories.includes(category)) {
      return res.status(400).json({
        success: false,
        message: 'Categoría no válida',
        validCategories,
      });
    }

    const events = await Event.find({
      category,
      isPublic: true
    })
      .populate('createdBy', 'name email')
      .sort({ startDate: 1 });

    res.status(200).json({
      success: true,
      count: events.length,
      data: events,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error al obtener eventos por categoría',
    });
  }
};

// @desc    Obtener eventos del mes actual
// @route   GET /api/events/month/:year/:month
// @access  Public
export const getEventsByMonth = async (req, res) => {
  try {
    const { year, month } = req.params;

    const yearNum = parseInt(year);
    const monthNum = parseInt(month);

    // month llega como 1-12
    const startOfMonth = new Date(yearNum, monthNum - 1, 1);
    const endOfMonth = new Date(yearNum, monthNum, 0, 23, 59, 59);

    console.log(`Buscando eventos: ${startOfMonth} → ${endOfMonth}`); // debug

    const events = await Event.find({
      startDate: { $gte: startOfMonth, $lte: endOfMonth },
      isPublic: true,
    })
      .populate('createdBy', 'name email')
      .sort({ startDate: 1 });

    res.status(200).json({
      success: true,
      count: events.length,
      month: `${year}-${month.toString().padStart(2, '0')}`,
      data: events,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error al obtener eventos del mes',
    });
  }
};

