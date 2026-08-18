# Despliegue

## Vercel

El frontend está desplegado como build estático en [Vercel](https://vercel.com):

- Build: `npm run build` → genera `dist/`.
- Vercel sirve ese contenido directamente, sin servidor Node de por medio.

### Variable de entorno

```env
VITE_API_URL=https://<tu-backend>.onrender.com
```

Debe apuntar a la URL pública del backend desplegado (ver el [repositorio del backend](https://github.com/AdrianMnd/boardgame-tutor-backend)). **Importante**: al ser una variable `VITE_*`, Vite la incrusta en el bundle **en tiempo de compilación** — cambiarla en el panel de Vercel no tiene efecto hasta el siguiente despliegue. No debe contener secretos: cualquiera puede leerla inspeccionando el bundle ya compilado.

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
