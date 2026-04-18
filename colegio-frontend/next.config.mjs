import { withSentryConfig } from '@sentry/nextjs';

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactCompiler: true,
};

export default withSentryConfig(nextConfig, {
  org: 'javier-andrade',
  project: 'javascript-nextjs',

  // Token de autenticación para subir source maps (definir en .env o en el panel de deploy)
  authToken: process.env.SENTRY_AUTH_TOKEN,

  // Silenciar warnings cuando no hay token (entorno local / sin token configurado)
  silent: !process.env.SENTRY_AUTH_TOKEN,

  // Source maps completos para mejor stack traces en Sentry
  widenClientFileUpload: true,

  // Ruta tunnel para evitar que ad-blockers bloqueen los reportes
  tunnelRoute: '/monitoring',

  // Oculta source maps del bundle público
  hideSourceMaps: true,

  // Evita logs de Sentry en el bundle del cliente
  disableLogger: true,

  // Monitoreo automático de Vercel Crons
  automaticVercelMonitors: true,
});
