import mongoose from 'mongoose';
import crypto from 'crypto';
import dotenv from 'dotenv';
import User from '../models/user.js';

dotenv.config();

const seedAdmin = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('MongoDB conectado');

        const adminExists = await User.findOne({ role: 'admin' });

        if (adminExists) {
            console.log('Ya existe un usuario admin:');
            console.log(`   Email: ${adminExists.email}`);
            console.log('   Si olvidaste la contraseña, elimina el usuario desde MongoDB Atlas y vuelve a ejecutar este script.');
            process.exit(0);
        }

        // Tomar credenciales del .env o generar una contraseña segura
        const adminEmail = process.env.ADMIN_EMAIL || 'admin@colegio.edu.co';
        const adminPassword = process.env.ADMIN_PASSWORD || crypto.randomBytes(16).toString('hex');
        const adminName = process.env.ADMIN_NAME || 'Administrador';

        const admin = await User.create({
            name: adminName,
            email: adminEmail,
            password: adminPassword,
            role: 'admin',
            bio: 'Administrador del sistema',
            isActive: true,
        });

        console.log('');
        console.log('Usuario admin creado exitosamente:');
        console.log('------------------------------------');
        console.log(`   Nombre: ${admin.name}`);
        console.log(`   Email:  ${admin.email}`);
        console.log(`   Pass:   ${adminPassword}`);
        console.log('------------------------------------');
        console.log('IMPORTANTE: Cambia la contraseña despues del primer login.');
        console.log('TIP: Define ADMIN_EMAIL y ADMIN_PASSWORD en tu .env para no usar valores por defecto.');
        console.log('');

        process.exit(0);
    } catch (error) {
        console.error('Error al crear el admin:', error.message);
        process.exit(1);
    }
};

seedAdmin();
