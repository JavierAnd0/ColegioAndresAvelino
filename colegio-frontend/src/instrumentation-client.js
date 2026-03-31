import * as Sentry from '@sentry/nextjs';

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  environment: process.env.NODE_ENV || 'development',
  tracesSampleRate: process.env.NODE_ENV === 'production' ? 0.2 : 1.0,

  // Session Replay: graba sesiones cuando ocurre un error
  replaysSessionSampleRate: 0.1,
  replaysOnErrorSampleRate: 1.0,
  integrations: [
    Sentry.replayIntegration({
      maskAllText: true,
      blockAllMedia: false,
    }),
  ],

  enabled: process.env.NODE_ENV !== 'test' && !!process.env.NEXT_PUBLIC_SENTRY_DSN,
});

export const onRouterTransitionStart = Sentry.captureRouterTransitionStart;
