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
    console.error(`❌ Error conectando a MongoDB:`);
    console.error(`   Mensaje: ${error.message}`);
    
    // Si es error de autenticación
    if (error.message.includes('authentication')) {
      console.error('   💡 Verifica tu usuario y contraseña en el .env');
    }
    
    // Si es error de red/IP
    if (error.message.includes('ENOTFOUND') || error.message.includes('timeout')) {
      console.error('   💡 Verifica tu conexión a internet y la IP whitelist en MongoDB Atlas');
    }
    
    process.exit(1);
  }
};

// Manejar eventos de conexión
mongoose.connection.on('disconnected', () => {
  console.log('⚠️  MongoDB desconectado');
});

mongoose.connection.on('error', (err) => {
  console.error(`❌ Error de MongoDB: ${err.message}`);
});

export default connectDB;