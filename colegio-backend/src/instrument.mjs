import 'dotenv/config';
import * as Sentry from '@sentry/node';
import { nodeProfilingIntegration } from '@sentry/profiling-node';

Sentry.init({
  dsn: process.env.SENTRY_DSN,
  integrations: [nodeProfilingIntegration()],
  tracesSampleRate: process.env.NODE_ENV === 'production' ? 0.2 : 1.0,
  profileSessionSampleRate: 1.0,
  profileLifecycle: 'trace',
  environment: process.env.NODE_ENV || 'development',
  // Deshabilitar en tests para no contaminar el dashboard
  enabled: process.env.NODE_ENV !== 'test' && !!process.env.SENTRY_DSN,
});
