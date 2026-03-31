import * as Sentry from '@sentry/node';
import Parser from 'rss-parser';
import RssSource from '../models/rssSource.js';
import Activity, { getWeekMonday } from '../models/activity.js';
import { getActivityImagePool } from './imageSearch.js';

const parser = new Parser({
    timeout: 15000,
    headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'application/rss+xml, application/atom+xml, application/xml, text/xml, */*',
    },
    customFields: {
        item: [
            ['media:thumbnail', 'mediaThumbnail'],
            ['media:content', 'mediaContent'],
            ['content:encoded', 'contentEncoded'],
        ],
    },
});

// Palabras clave para auto-detectar el tipo de actividad
const TYPE_KEYWORDS = {
    cuento:       ['cuento', 'historia', 'fábula', 'fabula', 'cuentito', 'relato'],
    colorear:     ['colorear', 'pintar', 'coloring', 'manualidad', 'dibujo para colorear'],
    numeros:      ['número', 'numeros', 'números', 'matemática', 'matemáticas', 'math', 'suma', 'resta', 'contar', 'multiplicar', 'dividir', 'aritmética', 'cálculo', 'fracciones'],
    rompecabezas: ['rompecabezas', 'puzzle', 'adivinanza', 'acertijo', 'crucigrama'],
    juego:        ['juego', 'jugar', 'game', 'interactivo', 'actividad interactiva', 'quiz', 'concurso'],
    lectura:      ['lectura', 'leer', 'comprensión lectora', 'reading', 'poema', 'poesía', 'poesia', 'texto'],
};

/**
 * Detecta el tipo de actividad basado en palabras clave en título y descripción.
 */
function detectType(title, description, defaultType) {
    const text = `${title} ${description}`.toLowerCase();
    for (const [type, keywords] of Object.entries(TYPE_KEYWORDS)) {
        if (keywords.some((kw) => text.includes(kw))) {
            return type;
        }
    }
    return defaultType || 'otro';
}

/**
 * Limpia HTML y entidades HTML de un string.
 */
function stripHtml(html) {
    if (!html) return '';
    return html
        .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '')
        .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '')
        .replace(/<[^>]*>/g, ' ')
        .replace(/&nbsp;/g, ' ')
        .replace(/&amp;/g, '&')
        .replace(/&lt;/g, '<')
        .replace(/&gt;/g, '>')
        .replace(/&quot;/g, '"')
        .replace(/&#\d+;/g, '')
        .replace(/\s+/g, ' ')
        .trim();
}

/**
 * Extrae la URL de imagen del item RSS probando múltiples campos.
 */
function extractImageUrl(item) {
    if (item.enclosure?.url && /\.(jpg|jpeg|png|webp|gif)/i.test(item.enclosure.url)) {
        return item.enclosure.url;
    }
    if (item.mediaThumbnail?.$?.url) return item.mediaThumbnail.$.url;
    if (item.mediaContent?.$?.medium === 'image' && item.mediaContent.$.url) {
        return item.mediaContent.$.url;
    }
    if (item.mediaContent?.$?.url) return item.mediaContent.$.url;

    // Buscar primer <img> en el contenido HTML
    const html = item.contentEncoded || item['content:encoded'] || item.content || '';
    const imgMatch = html.match(/<img[^>]+src=["']([^"']+)["']/i);
    if (imgMatch) return imgMatch[1];

    return '';
}

/**
 * Extrae la descripción más completa disponible en el item RSS.
 */
function extractDescription(item) {
    const candidates = [
        item.contentEncoded,
        item['content:encoded'],
        item.content,
        item.contentSnippet,
        item.summary,
        item.description,
    ];

    for (const src of candidates) {
        if (!src) continue;
        const clean = stripHtml(src);
        if (clean.length > 50) {
            return clean.slice(0, 600);
        }
    }
    return '';
}

/**
 * Fetch y procesa todas las fuentes RSS activas.
 * @returns {{ totalNew: number, totalUpdated: number, errors: string[] }}
 */
export async function fetchAllSources() {
    const sources = await RssSource.find({ isActive: true });
    if (sources.length === 0) {
        return { totalNew: 0, totalUpdated: 0, errors: ['No hay fuentes RSS activas'] };
    }

    const monday = getWeekMonday(new Date());
    let totalNew = 0;
    let totalUpdated = 0;
    const errors = [];

    const results = await Promise.allSettled(
        sources.map((source) => fetchSingleSource(source, monday))
    );

    for (let i = 0; i < results.length; i++) {
        const result = results[i];
        if (result.status === 'fulfilled') {
            totalNew += result.value.newCount;
            totalUpdated += result.value.updatedCount;
        } else {
            const sourceName = sources[i].name;
            const errMsg = result.reason?.message || 'Error desconocido';
            errors.push(`${sourceName}: ${errMsg}`);
            Sentry.captureException(result.reason, { extra: { source: sourceName } });
        }
    }

    console.log(`[RSS Fetcher] Completado: ${totalNew} nuevas, ${totalUpdated} actualizadas, ${errors.length} errores`);
    return { totalNew, totalUpdated, errors };
}

/**
 * Fetch y procesa una sola fuente RSS.
 */
async function fetchSingleSource(source, monday) {
    const feed = await parser.parseURL(source.url);
    const items = (feed.items || []).filter((item) => item.link && item.title?.trim());

    if (items.length === 0) {
        source.lastFetched = new Date();
        await source.save();
        return { newCount: 0, updatedCount: 0 };
    }

    // Pre-fetch un pool de imágenes de Pexels para repartir entre items sin imagen propia.
    // Así cada ítem recibe una foto diferente en lugar de repetir la misma.
    const fallbackPool = await getActivityImagePool(source.defaultType || 'otro', 5);
    let poolIndex = 0;

    const operations = [];

    for (const item of items) {
        const externalUrl = item.link;
        if (!externalUrl) continue;

        const title = (item.title || '').trim().slice(0, 200);
        if (!title) continue;

        const description = extractDescription(item);
        const rssImage = extractImageUrl(item);
        const imageUrl = rssImage || (fallbackPool.length > 0 ? fallbackPool[poolIndex++ % fallbackPool.length] : '');
        const type = detectType(title, description, source.defaultType);

        operations.push({
            updateOne: {
                filter: { externalUrl },
                update: {
                    $setOnInsert: {
                        title,
                        description,
                        externalUrl,
                        imageUrl,
                        type,
                        targetGrades: source.defaultGrades || [],
                        source: source.name,
                        sourceType: 'rss',
                        status: 'pending',
                        rssSource: source._id,
                        weekOf: monday,
                        isActive: true,
                        isFeatured: false,
                    },
                },
                upsert: true,
            },
        });
    }

    let newCount = 0;
    let updatedCount = 0;

    if (operations.length > 0) {
        const result = await Activity.bulkWrite(operations, { ordered: false });
        newCount = result.upsertedCount || 0;
        updatedCount = result.modifiedCount || 0;
    }

    source.lastFetched = new Date();
    await source.save();

    return { newCount, updatedCount };
}

/**
 * Valida y prueba una URL de feed RSS sin guardarla.
 * @returns {{ valid: boolean, feedTitle: string, itemCount: number, sampleItems: string[], error?: string }}
 */
export async function validateFeedUrl(url) {
    try {
        const feed = await parser.parseURL(url);
        const items = feed.items || [];
        return {
            valid: true,
            feedTitle: feed.title || '',
            itemCount: items.length,
            sampleItems: items.slice(0, 3).map((item) => item.title || '(sin título)'),
        };
    } catch (err) {
        return {
            valid: false,
            feedTitle: '',
            itemCount: 0,
            sampleItems: [],
            error: err.message || 'No se pudo leer el feed RSS',
        };
    }
}
