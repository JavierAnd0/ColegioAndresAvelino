import 'dotenv/config';
import connectDB from './config/database.js';
import app from './app.js';

connectDB().catch((err) => {
  console.error('Error conectando a MongoDB:', err.message);
});

export default app;
