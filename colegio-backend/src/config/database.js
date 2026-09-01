import * as Sentry from '@sentry/node';
import mongoose from 'mongoose';

let cachedConnection = null;

const connectDB = async () => {
  // Reutilizar conexión activa en entornos Serverless
  if (mongoose.connection.readyState >= 1) {
    return mongoose.connection;
  }

  if (cachedConnection) {
    return cachedConnection;
  }

  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI, {
      serverSelectionTimeoutMS: 5000,
    });
    cachedConnection = conn;

    console.log(`✅ MongoDB conectado exitosamente`);
    console.log(`📍 Host: ${conn.connection.host}`);
    console.log(`📊 Database: ${conn.connection.name}`);

    // Migración: eliminar índice viejo name_1 (unique solo por nombre)
    // para reemplazarlo por name_1_jornada_1 (unique por nombre+jornada)
    try {
      const gradesCollection = conn.connection.collection('grades');
      const indexes = await gradesCollection.indexes();
      const oldIndex = indexes.find(i => i.name === 'name_1' && i.unique);
      if (oldIndex) {
        await gradesCollection.dropIndex('name_1');
        console.log('🔄 Índice viejo name_1 eliminado (migrado a name+jornada)');
      }
    } catch {
      // Si no existe el índice o la colección, no pasa nada
    }

    return conn;
  } catch (error) {
    Sentry.captureException(error);
    console.error('❌ Error conectando a MongoDB:', error.message);
    if (process.env.NODE_ENV !== 'production') {
      process.exit(1);
    }
    throw error;
  }
};

// Manejar eventos de conexión
mongoose.connection.on('disconnected', () => {
  console.log('⚠️  MongoDB desconectado');
  cachedConnection = null;
});

mongoose.connection.on('error', (err) => {
  Sentry.captureException(err);
});

export default connectDB;