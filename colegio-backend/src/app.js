import express from 'express';
import cors from 'cors';
import helmet from 'helmet';

// Importar rutas
import eventRoutes from './routes/events.js';
import blogRoutes from './routes/blog.js';
import authRoutes from './routes/auth.js';
import uploadRoutes from './routes/upload.js';
import honorRoutes from './routes/honor.js';
import gradeRoutes from './routes/grades.js';

const app = express();

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
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

// Limitar tamaño del body para prevenir payload DoS
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true, limit: '1mb' }));

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
    }
  });
});

app.use('/api/events', eventRoutes);
app.use('/api/blog', blogRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/api/honor', honorRoutes);
app.use('/api/grades', gradeRoutes);

// 404
app.use((req, res) => {
  res.status(404).json({ success: false, message: 'Ruta no encontrada' });
});

// Error global - nunca exponer detalles internos en producción
app.use((err, req, res, next) => {
  console.error(err.stack);

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
