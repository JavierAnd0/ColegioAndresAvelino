import connectDB from '../src/config/database.js';
import app from '../src/app.js';

// Conectar a MongoDB en el arranque serverless
connectDB().catch((err) => {
  console.error('Error inicial conectando a MongoDB:', err.message);
});

export default app;
