# Despliegue

## Vercel

El frontend está desplegado como build estático en [Vercel](https://vercel.com):

- Build: `npm run build` → genera `dist/`.
- Vercel sirve ese contenido directamente, sin servidor Node de por medio.

### Variables de entorno

```env
VITE_API_URL=https://<tu-backend>.onrender.com
VITE_SENTRY_DSN=
```

`VITE_API_URL` debe apuntar a la URL pública del backend desplegado (ver el [repositorio del backend](https://github.com/AdrianMnd/boardgame-tutor-backend)). `VITE_SENTRY_DSN` es opcional — monitorización de errores en producción (ver más abajo); si se deja vacío, la app funciona exactamente igual, solo que sin reportar errores a ningún sitio. **Importante en ambos casos**: al ser variables `VITE_*`, Vite las incrusta en el bundle **en tiempo de compilación** — cambiarlas en el panel de Vercel no tiene efecto hasta el siguiente despliegue. Ninguna debe contener secretos: cualquiera puede leerlas inspeccionando el bundle ya compilado.

### Monitorización de errores (opcional)

Con `VITE_SENTRY_DSN` configurada (proyecto gratuito de [sentry.io](https://sentry.io)), cualquier error de renderizado capturado por `ErrorBoundary`, además de errores globales no controlados, se reporta a Sentry — sin cambiar nada de lo que ve quien usa la app, solo añade visibilidad de qué está fallando en producción. El backend tiene su propia variable equivalente (`SENTRY_DSN`, ver [`docs/CONFIGURATION.md`](https://github.com/AdrianMnd/boardgame-tutor-backend/blob/master/docs/CONFIGURATION.md) del backend) — son proyectos de Sentry independientes, uno por repositorio.

## Si cambia la URL de producción del frontend

Si se renombra el proyecto en Vercel (cambia su URL `.vercel.app`) o se usa un dominio propio, hay que actualizar también la lista de orígenes permitidos por CORS en el backend (`src/index.ts`) — si no, el navegador bloqueará las peticiones con un error de CORS, no de conexión.

## Checklist antes de desplegar

```bash
npm run build
npm run lint
npm run test
npm run test:e2e
```

Ver [`docs/DEVELOPMENT.md`](./DEVELOPMENT.md) para el detalle de cada comando.
