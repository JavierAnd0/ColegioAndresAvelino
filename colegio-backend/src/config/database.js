import * as Sentry from '@sentry/node';
import mongoose from 'mongoose';

const connectDB = async () => {
  try {
    // Conectar a MongoDB (sin opciones obsoletas)
    const conn = await mongoose.connect(process.env.MONGODB_URI);

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
    
  } catch (error) {
    Sentry.captureException(error);
    process.exit(1);
  }
};

// Manejar eventos de conexión
mongoose.connection.on('disconnected', () => {
  console.log('⚠️  MongoDB desconectado');
});

mongoose.connection.on('error', (err) => {
  Sentry.captureException(err);
});

export default connectDB;