# BoardGame Tutor — Frontend

[![CI](https://github.com/AdrianMnd/boardgame-tutor-frontend/actions/workflows/ci.yml/badge.svg)](https://github.com/AdrianMnd/boardgame-tutor-frontend/actions/workflows/ci.yml)

🔗 **[Ver demo en vivo](https://boardgametutor.vercel.app)**

Aplicación web en React que permite elegir un juego de mesa, preguntarle en lenguaje natural sobre sus reglas y consultar el reglamento en PDF, saltando directamente a la página que se usó como fuente de cada respuesta.

Repositorio del backend: [boardgame-tutor-backend](https://github.com/AdrianMnd/boardgame-tutor-backend)

## Capturas

| Bienvenida y favoritos | Conversación con fuentes |
|---|---|
| ![Pantalla de bienvenida](docs/screenshots/bienvenida.png) | ![Conversación con fuentes citadas](docs/screenshots/conversacion.png) |

| Visor de PDF integrado | Vista móvil |
|---|---|
| ![Visor de PDF con pdf.js](docs/screenshots/pdf-viewer.png) | ![Panel de juegos en móvil](docs/screenshots/movil.png) |

## Características

- **Respuestas en streaming**: el texto aparece progresivamente (Server-Sent Events), no hay que esperar a la respuesta completa.
- **Pregunta por voz**: dictado con la Web Speech API nativa del navegador, sin backend ni coste adicional.
- **Visor de PDF integrado** (`pdf.js`, no un `<iframe>`): salta a la página exacta usada como fuente de cada respuesta, de forma fiable en cualquier dispositivo — incluidos navegadores móviles, donde el visor nativo del sistema no siempre respeta ese salto.
- **Juegos favoritos**: persistidos en `localStorage`, siempre visibles al principio de la lista.
- **Pantalla de bienvenida**: recibe al usuario con un acceso directo a sus juegos favoritos, en vez de forzar la entrada a un juego concreto.
- **Totalmente responsive**: panel de juegos como *drawer* deslizante en móvil, diseño adaptado desde 320px hasta escritorio.
- **Accesible**: navegación por teclado con atrapado de foco en diálogos (patrón WAI-ARIA), avisos `aria-live` para las respuestas del chat, contraste de color verificado (WCAG AA), enlace de salto al contenido.
- **Carga diferida del visor de PDF**: `react-pdf` (~420KB) solo se descarga al abrir un manual, no en la carga inicial de la app.
- **Recuperación ante errores**: un `ErrorBoundary` evita que un fallo inesperado deje la pantalla en blanco.
- **Tema oscuro** con paleta índigo/púrpura e identidad visual propia.
- **Cero usos de `any`** en TypeScript.

## Tecnologías

- React 19 + TypeScript
- Vite
- TanStack React Query
- `react-pdf` / `pdfjs-dist`
- React Markdown + remark-gfm + rehype-highlight
- lucide-react

## Puesta en marcha local

```bash
npm install
cp .env.example .env.local
npm run dev
```

Necesitas el [backend](https://github.com/AdrianMnd/boardgame-tutor-backend) corriendo (por defecto en `http://localhost:3000`) para que la aplicación tenga datos con los que funcionar.

## Scripts

```bash
npm run dev          # servidor de desarrollo
npm run build        # compilar para producción
npm run lint         # ESLint
npm run test         # tests unitarios (Vitest + Testing Library)
npm run test:watch   # tests unitarios en modo watch
npm run test:e2e     # tests end-to-end (Playwright)
npm run test:e2e:ui  # tests E2E en modo interactivo (útil para depurar)
npm run preview      # servir la build de producción en local
```

### Tests end-to-end (Playwright)

Los tests de `e2e/` no tocan ningún servicio externo — arrancan
automáticamente un backend simulado en memoria
(`e2e/mock-server/server.cjs`) y la propia app apuntando a él, así
que se pueden ejecutar sin credenciales de Postgres, B2, Gemini
ni Resend. Corren en serie (no en paralelo) a propósito: el
backend simulado guarda su estado en memoria compartido, y con
varios tests a la vez podrían pisarse entre sí de formas difíciles
de reproducir.

```bash
npx playwright install chromium   # primera vez, instala el navegador
npm run test:e2e
```


## Estructura

```text
src/
├── assets/            # logo e imágenes propias
├── components/
│   ├── Chat/           # conversación, mensajes, fuentes
│   ├── ErrorBoundary/   # captura errores inesperados de renderizado
│   ├── Header/           # cabecera + menú móvil
│   ├── Layout/            # estructura general y workspace
│   ├── Sidebar/            # panel de juegos (drawer en móvil, favoritos)
│   ├── PdfViewer/           # visor de PDF con pdf.js (carga diferida)
│   ├── Welcome/              # pantalla de bienvenida
│   └── UI/                    # componentes reutilizables
│   (cada componente con tests trae su carpeta __tests__/)
├── hooks/            # useChat, useConversation, useFavorites,
│                     # useFocusTrap, useSpeechRecognition
├── services/          # clientes HTTP (games, chat)
├── test/               # configuración global de Vitest
└── types/               # tipos compartidos
```

## Seguridad de configuración

`VITE_API_URL` se incrusta en el bundle de producción durante la compilación — no debe contener secretos, y hay que recompilar (no solo redesplegar) si cambia.

## Más documentación

[`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md) — decisiones de diseño con más detalle: cómo se consume el streaming, por qué el visor de PDF no usa un `<iframe>`, persistencia local, dictado por voz.

## Licencia

ISC — ver [LICENSE](./LICENSE).
