'use client';
import * as Sentry from '@sentry/nextjs';
import { useEffect } from 'react';

export default function GlobalError({ error, reset }) {
  useEffect(() => {
    Sentry.captureException(error);
  }, [error]);

  return (
    <html lang="es">
      <body>
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '100vh',
          fontFamily: 'sans-serif',
          textAlign: 'center',
          padding: '2rem',
        }}>
          <h2 style={{ fontSize: '1.5rem', marginBottom: '1rem' }}>
            Algo salió mal
          </h2>
          <p style={{ color: '#666', marginBottom: '1.5rem' }}>
            Ocurrió un error inesperado. Por favor intenta de nuevo.
          </p>
          <button
            onClick={reset}
            style={{
              padding: '0.5rem 1.5rem',
              background: '#2563eb',
              color: 'white',
              border: 'none',
              borderRadius: '0.375rem',
              cursor: 'pointer',
              fontSize: '1rem',
            }}
          >
            Intentar de nuevo
          </button>
        </div>
      </body>
    </html>
  );
}
