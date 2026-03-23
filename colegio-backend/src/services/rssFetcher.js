import Parser from 'rss-parser';
import RssSource from '../models/rssSource.js';
import Activity, { getWeekMonday } from '../models/activity.js';
import { getActivityImagePool } from './imageSearch.js';

const parser = new Parser({
    timeout: 10000,
    headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    },
    customFields: {
        item: [
            ['media:thumbnail', 'mediaThumbnail'],
            ['media:content', 'mediaContent'],
        ],
    },
});

/**
 * Elimina tags HTML de un string
 */
function stripHtml(html) {
    if (!html) return '';
    return html.replace(/<[^>]*>/g, '').replace(/&nbsp;/g, ' ').replace(/\s+/g, ' ').trim();
}

/**
 * Intenta extraer URL de imagen del item RSS
 */
function extractImageUrl(item) {
    // enclosure (podcast/media standard)
    if (item.enclosure?.url) return item.enclosure.url;
    // media:thumbnail
    if (item.mediaThumbnail?.$.url) return item.mediaThumbnail.$.url;
    // media:content
    if (item.mediaContent?.$.url) return item.mediaContent.$.url;
    // Buscar primer <img> en content
    const content = item['content:encoded'] || item.content || '';
    const imgMatch = content.match(/<img[^>]+src=["']([^"']+)["']/);
    if (imgMatch) return imgMatch[1];
    return '';
}

/**
 * Fetch y procesa todas las fuentes RSS activas
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
            errors.push(`${sourceName}: ${result.reason.message || 'Error desconocido'}`);
            console.error(`[RSS Fetcher] Error con "${sourceName}":`, result.reason.message);
        }
    }

    console.log(`[RSS Fetcher] Completado: ${totalNew} nuevas, ${totalUpdated} actualizadas, ${errors.length} errores`);
    return { totalNew, totalUpdated, errors };
}

/**
 * Fetch y procesa una sola fuente RSS
 */
async function fetchSingleSource(source, monday) {
    const feed = await parser.parseURL(source.url);
    const items = feed.items || [];

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

        const rawDescription = stripHtml(item.contentSnippet || item.content || '');
        const description = rawDescription.slice(0, 500);
        const rssImage    = extractImageUrl(item);
        const imageUrl    = rssImage || (fallbackPool.length > 0 ? fallbackPool[poolIndex++ % fallbackPool.length] : '');

        operations.push({
            updateOne: {
                filter: { externalUrl },
                update: {
                    $setOnInsert: {
                        title,
                        description,
                        externalUrl,
                        imageUrl,
                        type: source.defaultType || 'otro',
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
