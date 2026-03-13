import cron from 'node-cron';
import { fetchAllSources } from '../services/rssFetcher.js';

/**
 * Inicia el cron job para actualizar actividades educativas desde RSS.
 * Se ejecuta cada lunes a las 6:00 AM.
 */
export function startActivityCron() {
    // Cada lunes a las 6:00 AM
    const task = cron.schedule('0 6 * * 1', async () => {
        console.log('[Activity Cron] Iniciando fetch de actividades...');
        try {
            const result = await fetchAllSources();
            console.log(`[Activity Cron] Resultado: ${result.totalNew} nuevas, ${result.totalUpdated} actualizadas`);
            if (result.errors.length > 0) {
                console.warn('[Activity Cron] Errores:', result.errors);
            }
        } catch (error) {
            console.error('[Activity Cron] Error fatal:', error.message);
        }
    });

    console.log('[Activity Cron] Programado: cada lunes a las 6:00 AM');
    return task;
}
