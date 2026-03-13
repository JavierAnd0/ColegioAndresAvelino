import mongoose from 'mongoose';

const ACTIVITY_TYPES = ['cuento', 'colorear', 'numeros', 'rompecabezas', 'juego', 'lectura', 'otro'];

const rssSourceSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: [true, 'El nombre de la fuente es obligatorio'],
            trim: true,
            maxlength: [100, 'El nombre no puede tener más de 100 caracteres'],
        },
        url: {
            type: String,
            required: [true, 'La URL del feed RSS es obligatoria'],
            unique: true,
            trim: true,
        },
        isActive: {
            type: Boolean,
            default: true,
        },
        defaultType: {
            type: String,
            enum: {
                values: ACTIVITY_TYPES,
                message: '{VALUE} no es un tipo de actividad válido',
            },
            default: 'otro',
        },
        defaultGrades: {
            type: [Number],
            default: [],
            validate: {
                validator: (arr) => arr.every((n) => Number.isInteger(n) && n >= 0 && n <= 11),
                message: 'Los grados deben ser números enteros entre 0 y 11',
            },
        },
        lastFetched: {
            type: Date,
            default: null,
        },
    },
    { timestamps: true }
);

rssSourceSchema.index({ isActive: 1 });

const RssSource = mongoose.model('RssSource', rssSourceSchema);
export { ACTIVITY_TYPES };
export default RssSource;
