import 'dotenv/config';
import mongoose from 'mongoose';
import connectDB from '../config/database.js';
import RssSource from '../models/rssSource.js';

const sources = [
    {
        name: 'Orientación Andújar',
        url: 'https://www.orientacionandujar.es/feed/',
        defaultType: 'colorear',
        defaultGrades: [0, 1, 2, 3],
        isActive: true,
    },
    {
        name: 'Imagenes Educativas',
        url: 'https://www.imageneseducativas.com/feed/',
        defaultType: 'otro',
        defaultGrades: [0, 1, 2, 3, 4, 5],
        isActive: true,
    },
    {
        name: 'Educación 3.0',
        url: 'https://www.educaciontrespuntocero.com/feed/',
        defaultType: 'lectura',
        defaultGrades: [3, 4, 5],
        isActive: true,
    },
    {
        name: 'Actividades Infantil',
        url: 'https://actividadesinfantil.com/feed/',
        defaultType: 'juego',
        defaultGrades: [0, 1, 2],
        isActive: true,
    },
];

async function seedRss() {
    await connectDB();

    // Desactivar fuentes que dan error 403
    const result = await RssSource.updateMany(
        { name: { $in: ['Family Education', 'Using English'] } },
        { $set: { isActive: false } }
    );
    if (result.modifiedCount > 0) {
        console.log(`Desactivadas ${result.modifiedCount} fuentes con errores 403`);
    }

    for (const src of sources) {
        const exists = await RssSource.findOne({ url: src.url });
        if (exists) {
            console.log(`Ya existe: ${src.name}`);
            continue;
        }
        await RssSource.create(src);
        console.log(`Creada: ${src.name}`);
    }

    console.log('\nFuentes RSS actualizadas.');
    const all = await RssSource.find({});
    console.log('\nTodas las fuentes:');
    all.forEach(s => {
        console.log(`  ${s.isActive ? '✅' : '❌'} ${s.name} — ${s.url}`);
    });

    await mongoose.disconnect();
    process.exit(0);
}

seedRss().catch(err => {
    console.error('Error:', err);
    process.exit(1);
});
