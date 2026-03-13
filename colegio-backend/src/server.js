import 'dotenv/config';

import connectDB from './config/database.js';
import app from './app.js';
import { startActivityCron } from './cron/activityCron.js';

connectDB();

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
  console.log(`Entorno: ${process.env.NODE_ENV || 'development'}`);
  const allowedOrigins = process.env.CORS_ORIGINS
    ? process.env.CORS_ORIGINS.split(',').map(o => o.trim())
    : ['http://localhost:3000'];
  console.log(`CORS origenes permitidos: ${allowedOrigins.join(', ')}`);

  // Iniciar cron de actividades educativas
  startActivityCron();
});
