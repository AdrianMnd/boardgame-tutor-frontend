import * as Sentry from "@sentry/react";

/**
 * Monitorización de errores en producción — opcional del todo.
 * Sin VITE_SENTRY_DSN configurada, esta función no hace nada y
 * la aplicación funciona exactamente igual que sin Sentry
 * instalado. Sentry.init() ya configura por sí solo la captura
 * de errores globales (window.onerror, promesas rechazadas sin
 * capturar) — lo único que se añade a mano es la captura dentro
 * de ErrorBoundary, para los errores de renderizado de React,
 * que Sentry no puede ver por su cuenta.
 */
export function initSentry(): void {

    const dsn = import.meta.env.VITE_SENTRY_DSN;

    if (!dsn) {

        return;

    }

    Sentry.init({

        dsn,

        environment: import.meta.env.MODE,

        // Igual que en el backend: sin trazas de rendimiento a
        // propósito, el valor está en saber que algo se ha
        // roto, no en perfilar cada interacción.
        tracesSampleRate: 0

    });

}

export function captureError(

    error: unknown

): void {

    if (!import.meta.env.VITE_SENTRY_DSN) {

        return;

    }

    Sentry.captureException(error);

}
