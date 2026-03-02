import mongoose from 'mongoose';

const connectDB = async () => {
  try {
    // Conectar a MongoDB (sin opciones obsoletas)
    const conn = await mongoose.connect(process.env.MONGODB_URI);

    console.log(`✅ MongoDB conectado exitosamente`);
    console.log(`📍 Host: ${conn.connection.host}`);
    console.log(`📊 Database: ${conn.connection.name}`);
    
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