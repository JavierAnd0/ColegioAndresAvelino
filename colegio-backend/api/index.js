import { createRequire } from 'module';
const require = createRequire(import.meta.url);

// Forzar que Vercel NFT trace cloudinary y sus dependencias internas
// NFT solo puede seguir require() estáticos, no los require() dinámicos
// internos de cloudinary. Al hacer require() aquí, NFT incluye todos los archivos.
require('cloudinary');

import connectDB from '../src/config/database.js';
import app from '../src/app.js';

// Conectar a MongoDB en el arranque serverless
connectDB().catch((err) => {
  console.error('Error inicial conectando a MongoDB:', err.message);
});

export default app;
