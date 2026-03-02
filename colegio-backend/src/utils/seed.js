import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from '../models/user.js';

dotenv.config();

const seedAdmin = async () => {
    try {
        // Conectar a MongoDB
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('✅ MongoDB conectado');

        // Verificar si ya existe un admin
        const adminExists = await User.findOne({ role: 'admin' });

        if (adminExists) {
            console.log('⚠️  Ya existe un usuario admin:');
            console.log(`   Email: ${adminExists.email}`);
            console.log('   Si olvidaste la contraseña, elimina el usuario desde MongoDB Atlas y vuelve a ejecutar este script.');
            process.exit(0);
        }

        // Crear usuario admin
        const admin = await User.create({
            name: 'Administrador',
            email: 'admin@colegio.edu.co',
            password: 'Admin123456',
            role: 'admin',
            bio: 'Administrador del sistema',
            isActive: true,
        });

        console.log('');
        console.log('🎉 Usuario admin creado exitosamente:');
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        console.log(`   Nombre: ${admin.name}`);
        console.log(`   Email:  ${admin.email}`);
        console.log(`   Rol:    ${admin.role}`);
        console.log(`   Pass:   Admin123456`);
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        console.log('⚠️  IMPORTANTE: Cambia la contraseña después del primer login.');
        console.log('');

        process.exit(0);
    } catch (error) {
        console.error('❌ Error al crear el admin:', error.message);
        process.exit(1);
    }
};

seedAdmin();