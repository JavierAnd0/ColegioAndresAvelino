/**
 * Servicio de búsqueda de imágenes automáticas para blog.
 * Usa la API de Pexels (gratis, sin watermark, alta calidad).
 */

const PEXELS_API_KEY = process.env.PEXELS_API_KEY;
const PEXELS_BASE = 'https://api.pexels.com/v1';

// Mapeo categoría → búsqueda optimizada en inglés (mejores resultados)
const categorySearchMap = {
    noticias: 'school news education',
    eventos: 'school event celebration children',
    actividades: 'kids learning classroom activity',
    logros: 'achievement trophy students celebration',
    anuncios: 'school announcement bulletin board',
    general: 'elementary school children education',
};

/**
 * Extrae palabras clave del título para mejorar la búsqueda.
 * Filtra palabras cortas y conectores en español.
 */
function extractKeywords(title) {
    const stopWords = new Set([
        'el', 'la', 'los', 'las', 'un', 'una', 'unos', 'unas',
        'de', 'del', 'en', 'con', 'por', 'para', 'al', 'que',
        'se', 'su', 'sus', 'es', 'son', 'y', 'o', 'a', 'e',
        'como', 'más', 'muy', 'no', 'si', 'ya', 'fue', 'ha',
        'este', 'esta', 'estos', 'estas', 'ese', 'esa',
        'nuestro', 'nuestra', 'nuestros', 'nuestras',
    ]);

    return title
        .toLowerCase()
        .normalize('NFD').replace(/[\u0300-\u036f]/g, '') // quitar acentos
        .split(/\s+/)
        .filter(w => w.length > 2 && !stopWords.has(w))
        .slice(0, 3); // máximo 3 keywords
}

/**
 * Construye el query de búsqueda combinando categoría + título.
 */
function buildSearchQuery(category, title) {
    const base = categorySearchMap[category] || categorySearchMap.general;
    const keywords = extractKeywords(title || '');

    if (keywords.length > 0) {
        return `${base} ${keywords.join(' ')}`;
    }
    return base;
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
