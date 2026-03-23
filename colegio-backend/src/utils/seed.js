import mongoose from 'mongoose';
import crypto from 'crypto';
import dotenv from 'dotenv';
import User from '../models/user.js';

dotenv.config();

const seedSuperAdmin = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('MongoDB conectado');

        const superAdminExists = await User.findOne({ role: 'superadmin' });

        if (superAdminExists) {
            console.log('');
            console.log('Ya existe un superadmin:');
            console.log(`   Email: ${superAdminExists.email}`);
            console.log('   Si olvidaste la contraseña, ejecuta: npm run reset-admin');
            console.log('');
            process.exit(0);
        }

        const email = process.env.SUPERADMIN_EMAIL || process.env.ADMIN_EMAIL || 'superadmin@colegio.edu.co';
        const password = process.env.SUPERADMIN_PASSWORD || process.env.ADMIN_PASSWORD || crypto.randomBytes(16).toString('hex');
        const name = process.env.SUPERADMIN_NAME || 'Super Administrador';

        const superAdmin = await User.create({
            name,
            email,
            password,
            role: 'superadmin',
            isActive: true,
        });

        console.log('');
        console.log('✓ Superadmin creado exitosamente:');
        console.log('------------------------------------');
        console.log(`   Nombre: ${superAdmin.name}`);
        console.log(`   Email:  ${superAdmin.email}`);
        console.log(`   Pass:   ${password}`);
        console.log('------------------------------------');
        console.log('IMPORTANTE: Define SUPERADMIN_EMAIL y SUPERADMIN_PASSWORD en tu .env');
        console.log('            y cambia la contraseña después del primer login.');
        console.log('');

        process.exit(0);
    } catch (error) {
        console.error('Error al crear el superadmin:', error.message);
        process.exit(1);
    }
};

seedSuperAdmin();
