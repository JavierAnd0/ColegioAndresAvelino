/**
 * Servicio de búsqueda de imágenes automáticas para blog.
 * Usa la API de Pexels (gratis, sin watermark, alta calidad).
 */

const PEXELS_API_KEY = process.env.PEXELS_API_KEY;
const PEXELS_BASE = 'https://api.pexels.com/v1';

// Mapeo categoría de blog → búsqueda optimizada en inglés
const categorySearchMap = {
    noticias: 'school news education',
    eventos: 'school event celebration children',
    actividades: 'kids learning classroom activity',
    logros: 'achievement trophy students celebration',
    anuncios: 'school announcement bulletin board',
    general: 'elementary school children education',
};

// Mapeo tipo de actividad → query especializado para Pexels
const activityTypeMap = {
    cuento:       'children storybook fairy tale illustration colorful',
    colorear:     'children coloring drawing art craft crayons',
    numeros:      'children math numbers counting learning colorful',
    rompecabezas: 'children puzzle game pieces colorful fun',
    juego:        'children playing game fun learning activity',
    lectura:      'children reading book library story',
    otro:         'kids education learning activity school fun',
};

// Traducción de términos educativos comunes español→inglés para mejorar el query
const esEnDict = {
    // animales
    animales: 'animals', perro: 'dog', gato: 'cat', leon: 'lion', elefante: 'elephant',
    pajaro: 'bird', pez: 'fish', mariposa: 'butterfly',
    // naturaleza
    flores: 'flowers', arboles: 'trees', mar: 'sea', rio: 'river', bosque: 'forest',
    // números y matemáticas
    suma: 'addition', resta: 'subtraction', multiplicacion: 'multiplication',
    numeros: 'numbers', formas: 'shapes', colores: 'colors',
    // personajes y cuentos
    princesa: 'princess', principe: 'prince', dragon: 'dragon', hada: 'fairy',
    bruja: 'witch', castillo: 'castle', pirata: 'pirate', robot: 'robot',
    // lugares
    selva: 'jungle', granja: 'farm', ciudad: 'city', espacio: 'space', oceano: 'ocean',
    // conceptos
    familia: 'family', amigos: 'friends', escuela: 'school', comida: 'food',
    musica: 'music', deporte: 'sport', arte: 'art',
};

const stopWords = new Set([
    'el', 'la', 'los', 'las', 'un', 'una', 'unos', 'unas',
    'de', 'del', 'en', 'con', 'por', 'para', 'al', 'que',
    'se', 'su', 'sus', 'es', 'son', 'y', 'o', 'a', 'e',
    'como', 'mas', 'muy', 'no', 'si', 'ya', 'fue', 'ha',
    'este', 'esta', 'estos', 'estas', 'ese', 'esa',
    'nuestro', 'nuestra', 'nuestros', 'nuestras',
    'del', 'al', 'lo', 'le', 'les', 'nos',
]);

/**
 * Extrae keywords del título priorizando traducción al inglés via diccionario.
 * Las palabras traducidas dan mejores resultados en Pexels.
 */
function extractKeywords(title) {
    const normalized = title
        .toLowerCase()
        .normalize('NFD').replace(/[\u0300-\u036f]/g, '');

    const words = normalized.split(/\s+/).filter(w => w.length > 2 && !stopWords.has(w));

    const translated = [];
    const untranslated = [];

    for (const w of words) {
        if (esEnDict[w]) {
            translated.push(esEnDict[w]);
        } else {
            untranslated.push(w);
        }
    }

    // Priorizar palabras traducidas; completar con originales si hace falta
    return [...translated, ...untranslated].slice(0, 3);
}

/**
 * Construye el query para búsqueda de imágenes de blog (categoría genérica).
 */
function buildSearchQuery(category, title) {
    const base = categorySearchMap[category] || categorySearchMap.general;
    const keywords = extractKeywords(title || '');
    return keywords.length > 0 ? `${base} ${keywords.join(' ')}` : base;
}

/**
 * Construye el query para búsqueda de imágenes de actividades educativas.
 * Usa queries especializados por tipo y prioriza contexto infantil/educativo.
 */
function buildActivityQuery(type, title) {
    const base = activityTypeMap[type] || activityTypeMap.otro;
    const keywords = extractKeywords(title || '');
    // Para actividades solo agregar las keywords traducidas (inglés)
    // para no contaminar el query con palabras en español
    const translated = keywords.filter(k => /^[a-z]/.test(k));
    return translated.length > 0 ? `${base} ${translated.join(' ')}` : base;
}

/**
 * Busca imágenes en Pexels.
 * @param {string} query - Términos de búsqueda
 * @param {number} count - Cantidad de resultados (1-5)
 * @returns {Array<{url: string, alt: string, photographer: string, thumbnailUrl: string}>}
 */
export async function searchImages(query, count = 3) {
    if (!PEXELS_API_KEY) {
        console.warn('PEXELS_API_KEY no configurada. Imágenes automáticas deshabilitadas.');
        return [];
    }

    try {
        const url = `${PEXELS_BASE}/search?query=${encodeURIComponent(query)}&per_page=${count}&orientation=landscape&size=medium`;

        const response = await fetch(url, {
            headers: { Authorization: PEXELS_API_KEY },
        });

        if (!response.ok) {
            console.error(`Pexels API error: ${response.status}`);
            return [];
        }

        const data = await response.json();

        return (data.photos || []).map(photo => ({
            url: photo.src.large2x || photo.src.large,
            thumbnailUrl: photo.src.medium,
            alt: photo.alt || query,
            photographer: photo.photographer,
            pexelsUrl: photo.url, // atribución
        }));
    } catch (error) {
        console.error('Error buscando imágenes:', error.message);
        return [];
    }
}

/**
 * Busca imágenes sugeridas para un post del blog.
 * @param {string} category - Categoría del post
 * @param {string} title - Título del post
 * @param {number} count - Cantidad de sugerencias
 */
export async function suggestBlogImages(category, title, count = 3) {
    const query = buildSearchQuery(category, title);
    return searchImages(query, count);
}

/**
 * Busca imágenes sugeridas para una actividad educativa.
 * Usa queries especializados por tipo de actividad (cuento, numeros, colorear, etc.)
 * @param {string} type - Tipo de actividad
 * @param {string} title - Título de la actividad
 * @param {number} count - Cantidad de sugerencias
 */
export async function suggestActivityImages(type, title, count = 6) {
    const query = buildActivityQuery(type, title);
    return searchImages(query, count);
}

/**
 * Obtiene una imagen automática para un post sin imagen.
 * Devuelve la primera imagen encontrada.
 */
export async function getAutoImage(category, title) {
    const images = await suggestBlogImages(category, title, 1);
    if (images.length > 0) {
        return {
            url: images[0].url,
            alt: title || category,
        };
    }
    return null;
}
