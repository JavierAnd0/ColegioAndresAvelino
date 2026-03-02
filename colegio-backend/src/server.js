import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import connectDB from './config/database.js';

// Importar rutas
import eventRoutes from './routes/events.js';
import blogRoutes from './routes/blog.js';
import authRoutes from './routes/auth.js';
import uploadRoutes from './routes/upload.js';  // ← debe estar aquí arriba

dotenv.config();
connectDB();

const app = express();  // ← app se define aquí
const PORT = process.env.PORT || 5000;

// Middlewares
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true,
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Rutas  ← todo esto DESPUÉS de definir app
app.get('/', (req, res) => {
  res.json({
    message: '✅ API del Colegio funcionando',
    version: '1.0.0',
    endpoints: {
      events: '/api/events',
      blog: '/api/blog',
      auth: '/api/auth',
      upload: '/api/upload',
    }
  });
});

app.use('/api/events', eventRoutes);
app.use('/api/blog', blogRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/upload', uploadRoutes);  // ← DESPUÉS de que app existe

// 404
app.use((req, res) => {
  res.status(404).json({ success: false, message: 'Ruta no encontrada' });
});

// Error global
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    success: false,
    message: 'Error interno del servidor',
    error: process.env.NODE_ENV === 'development' ? err.message : undefined,
  });
});

app.listen(PORT, () => {
  console.log(`🚀 Servidor corriendo en http://localhost:${PORT}`);
  console.log(`📝 Entorno: ${process.env.NODE_ENV}`);
  console.log(`🌐 Frontend: ${process.env.FRONTEND_URL}`);
});
