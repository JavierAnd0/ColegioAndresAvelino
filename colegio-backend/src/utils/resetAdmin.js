import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from '../models/user.js';

dotenv.config();

const resetAdmin = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('MongoDB conectado');

        const email = process.env.SUPERADMIN_EMAIL || process.env.ADMIN_EMAIL || 'superadmin@colegio.edu.co';
        const password = process.env.SUPERADMIN_PASSWORD || process.env.ADMIN_PASSWORD;

        if (!password) {
            console.error('Error: define SUPERADMIN_PASSWORD en tu .env antes de ejecutar este script.');
            process.exit(1);
        }

        let superAdmin = await User.findOne({ role: 'superadmin' });

        if (superAdmin) {
            superAdmin.email = email;
            superAdmin.password = password;
            superAdmin.isActive = true;
            await superAdmin.save();
            console.log('');
            console.log('✓ Contraseña del superadmin reseteada:');
        } else {
            superAdmin = await User.create({
                name: process.env.SUPERADMIN_NAME || 'Super Administrador',
                email,
                password,
                role: 'superadmin',
                isActive: true,
            });
            console.log('');
            console.log('✓ Superadmin recreado:');
        }

        console.log('------------------------------------');
        console.log(`   Email: ${email}`);
        console.log(`   Pass:  ${password}`);
        console.log('------------------------------------');
        console.log('');

        process.exit(0);
    } catch (error) {
        console.error('Error:', error.message);
        process.exit(1);
    }
};

resetAdmin();
