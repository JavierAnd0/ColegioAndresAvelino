import * as Sentry from '@sentry/node';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { apiLimiter } from './middleware/rateLimit.js';

// Importar rutas
import eventRoutes from './routes/events.js';
import blogRoutes from './routes/blog.js';
import authRoutes from './routes/auth.js';
import uploadRoutes from './routes/upload.js';
import honorRoutes from './routes/honor.js';
import periodRoutes from './routes/periods.js';
import gradeRoutes from './routes/grades.js';
import activityRoutes from './routes/activities.js';
import teacherRoutes from './routes/teachers.js';
import carouselRoutes from './routes/carousel.js';
import heroRoutes from './routes/hero.js';
import heroSlidesRoutes from './routes/heroSlides.js';

const app = express();

// Necesario para que express-rate-limit detecte correctamente la IP
// cuando el servidor está detrás de un proxy (nginx, Vercel, etc.)
app.set('trust proxy', 1);

// Headers de seguridad HTTP (protege contra XSS, clickjacking, sniffing, etc.)
app.use(helmet({
  crossOriginResourcePolicy: { policy: 'cross-origin' },
}));

// CORS - orígenes permitidos según entorno
// En .env: CORS_ORIGINS=http://localhost:3000,https://tucolegio.com
const allowedOrigins = process.env.CORS_ORIGINS
  ? process.env.CORS_ORIGINS.split(',').map(o => o.trim())
  : ['http://localhost:3000'];

app.use(cors({
  origin: (origin, callback) => {
    // Permitir requests sin origin (Postman, curl, server-to-server)
    if (!origin) return callback(null, true);
    if (allowedOrigins.includes(origin)) {
      return callback(null, true);
    }
    callback(new Error('Origen no permitido por CORS'));
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

// Limitar tamaño del body para prevenir payload DoS
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true, limit: '1mb' }));

// Rate limiting global para todas las rutas /api
app.use('/api', apiLimiter);

// Rutas
app.get('/', (req, res) => {
  res.json({
    message: 'API del Colegio funcionando',
    version: '1.0.0',
    endpoints: {
      events: '/api/events',
      blog: '/api/blog',
      auth: '/api/auth',
      upload: '/api/upload',
      honor: '/api/honor',
      grades: '/api/grades',
      activities: '/api/activities',
      teachers: '/api/teachers',
    }
  });
});

app.use('/api/events', eventRoutes);
app.use('/api/blog', blogRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/api/honor', honorRoutes);
app.use('/api/periods', periodRoutes);
app.use('/api/grades', gradeRoutes);
app.use('/api/activities', activityRoutes);
app.use('/api/teachers', teacherRoutes);
app.use('/api/carousel', carouselRoutes);
app.use('/api/hero', heroRoutes);
app.use('/api/hero-slides', heroSlidesRoutes);

// 404
app.use((req, res) => {
  res.status(404).json({ success: false, message: 'Ruta no encontrada' });
});

// Sentry captura los errores antes del error handler personalizado
Sentry.setupExpressErrorHandler(app);

// Error global - nunca exponer detalles internos en producción
app.use((err, req, res, next) => {
  // Error de CORS
  if (err.message === 'Origen no permitido por CORS') {
    return res.status(403).json({ success: false, message: 'Origen no permitido' });
  }

  res.status(500).json({
    success: false,
    message: 'Error interno del servidor',
    ...(process.env.NODE_ENV === 'development' && { error: err.message }),
  });
});

export default app;
