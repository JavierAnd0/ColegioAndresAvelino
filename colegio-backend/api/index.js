import '../src/instrument.mjs';
import connectDB from '../src/config/database.js';
import app from '../src/app.js';

// La conexión se cachea dentro de connectDB(), así que en invocaciones
// "warm" (contenedor reutilizado) esto no vuelve a conectar.
let dbReady;

function ensureDB() {
  if (!dbReady) {
    dbReady = connectDB().catch((err) => {
      // Si falla, permitir reintentar en la próxima invocación
      dbReady = undefined;
      throw err;
    });
  }
  return dbReady;
}

export default async function handler(req, res) {
  try {
    await ensureDB();
  } catch (err) {
    res.statusCode = 500;
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify({ success: false, message: 'No se pudo conectar a la base de datos' }));
    return;
  }
  return app(req, res);
}
