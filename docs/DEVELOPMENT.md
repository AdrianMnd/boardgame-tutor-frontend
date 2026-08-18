# Desarrollo

## Puesta en marcha

```bash
npm install
cp .env.example .env.local
npm run dev
```

Arranca en `http://localhost:5173` (puerto por defecto de Vite). Necesitas el [backend](https://github.com/AdrianMnd/boardgame-tutor-backend) corriendo en paralelo (`npm run dev`, por defecto en `http://localhost:3000`) con `VITE_API_URL` en tu `.env.local` apuntando a esa URL.

## Tras modificar código

```bash
npm run build   # tsc -b + vite build — falla si hay errores de tipos
npm run lint     # ESLint
npm run test     # tests unitarios (Vitest + Testing Library)
```

`npm run build` es el que se ejecuta en CI — cualquier error de tipos que no se detecte aquí en local se detectará ahí.

## Tests end-to-end (Playwright)

```bash
npx playwright install chromium   # primera vez
npm run test:e2e
```

No necesitan ningún backend real corriendo — `playwright.config.ts` arranca automáticamente un backend simulado en memoria (`e2e/mock-server/server.cjs`) y la propia app apuntando a él. Corren en serie, no en paralelo, a propósito: el backend simulado guarda su estado en memoria compartido entre todos los tests del proceso.

`npm run test:e2e:ui` abre el modo interactivo de Playwright — útil para depurar un test que falla, viendo paso a paso qué hace el navegador.

## Antes de dar por buena una entrega

```bash
npm run build
npm run lint
npm run test
npm run test:e2e
```

Las cuatro se ejecutan también automáticamente en CI (GitHub Actions) en cada `push`/PR a `dev` o `master`.

## Estructura del proyecto

Ver la sección "Estructura" del [README](../README.md) para el mapa de carpetas. Para el porqué de las decisiones de diseño (streaming, visor de PDF, persistencia dual local/cuenta, carga diferida...), ver [`docs/ARCHITECTURE.md`](./ARCHITECTURE.md).
