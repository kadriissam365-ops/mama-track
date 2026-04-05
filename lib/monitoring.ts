type ErrorLevel = 'error' | 'warning' | 'info';

export function captureError(error: unknown, context?: Record<string, unknown>, level: ErrorLevel = 'error') {
  if (process.env.NODE_ENV === 'development') {
    console.error('[MamaTrack Error]', error, context);
    return;
  }
  // TODO: Intégrer Sentry ici quand configuré
  // Sentry.captureException(error, { extra: context, level });
  console.error('[Error]', error);
}

export function captureMessage(message: string, context?: Record<string, unknown>) {
  if (process.env.NODE_ENV === 'development') {
    console.log('[MamaTrack]', message, context);
  }
}
