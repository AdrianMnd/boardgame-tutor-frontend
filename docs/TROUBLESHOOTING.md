# Troubleshooting

## No aparecen juegos

Comprobar `VITE_API_URL` (en `.env.local` o, en producción, en el panel de Vercel — recuerda que un cambio ahí exige volver a desplegar). Abrir esa URL + `/api/games` directamente en el navegador: si responde con la lista de juegos, el problema está en el frontend (revisar la consola); si no responde, el problema está en el backend — ver su [`docs/TROUBLESHOOTING.md`](https://github.com/AdrianMnd/boardgame-tutor-backend/blob/master/docs/TROUBLESHOOTING.md).

## Error de CORS en la consola del navegador

El origen del frontend no está permitido en el backend. En local, revisar que el backend tenga `FRONTEND_URL` apuntando a tu `http://localhost:5173`. En producción, si cambió la URL del frontend, hay que actualizar la lista de orígenes permitidos en el backend.

## El visor de PDF no abre, o se queda en blanco

Casi siempre es una discrepancia de versión entre `pdfjs-dist` y el *worker* que usa `react-pdf` internamente (ver [`docs/ARCHITECTURE.md`](./ARCHITECTURE.md)). Revisar que ambas versiones coincidan en `package.json`, y que `public/pdfjs-wasm/` se haya copiado correctamente (`scripts/copy-pdfjs-wasm.cjs`, se ejecuta automáticamente antes de `dev`/`build`).

## El dictado por voz no aparece

Es intencionado en navegadores sin soporte para la Web Speech API (Firefox, entre otros) — el botón se oculta en vez de mostrarse roto.

## Los favoritos/categorías/conversaciones no se guardan entre visitas

- **Sin sesión iniciada**: viven en `localStorage`. Si el navegador está en modo privado, o `localStorage` está deshabilitado/lleno, no persistirán entre sesiones.
- **Con sesión iniciada**: deberían sincronizarse con la cuenta. Si no lo hacen, revisar la consola por errores de red hacia el backend, y confirmar que el token de sesión no ha caducado (`GET /api/auth/me` debería responder `200`, no `401`).

## El aviso de "juegos nuevos" muestra un número que no esperaba

Se compara contra la última vez que se vio el catálogo **en este dispositivo concreto** (`localStorage`, no sincronizado con la cuenta). Si nunca se ha usado la aplicación en este navegador, la primera visita no debería mostrar ningún juego como "nuevo".

## Los tests E2E fallan solo en mi máquina, no en CI (o viceversa)

- **`ERR_CONNECTION_REFUSED` hacia `127.0.0.1`**: en Windows, `vite preview` sin `--host` explícito puede escuchar en una interfaz de red distinta a la que usa Playwright — la configuración actual ya fuerza `--host 127.0.0.1` para evitar esto.
- **Un test falla de forma intermitente, no siempre**: comprobar si hace una aserción justo después de un clic sin esperar confirmación de que React ya procesó ese cambio (ver los comentarios en `e2e/*.spec.ts` — este patrón ya causó varios falsos negativos durante el desarrollo).

## No aparece "Panel de administración" en el menú de perfil

`user.isAdmin` viene del backend (`GET /api/auth/me`), no se calcula en el frontend. Comprobar que `ADMIN_EMAIL` está configurada en el backend y coincide exactamente con el email de la cuenta con la que se ha iniciado sesión.

## El texto a voz no lee nada

Comprobar que el conmutador (icono de altavoz, junto al de dictado) está activado — es opcional y empieza desactivado. Si está activado y sigue sin leer nada, puede que el navegador no soporte `speechSynthesis` (el botón se oculta en ese caso, igual que con el dictado de entrada).

## El dictado por voz se corta solo, o no manda la pregunta automáticamente

Si esto ocurre, comprobar que `useSpeechRecognition` tiene `continuous: true` (no `false`) — con `false` el navegador corta la grabación tras la más mínima pausa al hablar, un problema real reportado en escritorio. El envío automático depende del callback `onEnd` estar conectado a `sendMessage()` en `Chat.tsx`.

## Verificación completa antes de dar por buena una entrega

```bash
npm run build
npm run lint
npm run test
npm run test:e2e
```
