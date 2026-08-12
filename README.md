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
npm run dev       # servidor de desarrollo
npm run build     # compilar para producción
npm run lint      # ESLint
npm run preview   # servir la build de producción en local
```

## Estructura

```text
src/
├── assets/            # logo e imágenes propias
├── components/
│   ├── Chat/           # conversación, mensajes, fuentes
│   ├── Header/          # cabecera + menú móvil
│   ├── Layout/            # estructura general y workspace
│   ├── Sidebar/            # panel de juegos (drawer en móvil, favoritos)
│   ├── PdfViewer/           # visor de PDF con pdf.js
│   ├── Welcome/              # pantalla de bienvenida
│   └── UI/                    # componentes reutilizables
├── hooks/            # useChat, useConversation, useFavorites, useSpeechRecognition
├── services/          # clientes HTTP (games, chat)
└── types/               # tipos compartidos
```

## Seguridad de configuración

`VITE_API_URL` se incrusta en el bundle de producción durante la compilación — no debe contener secretos, y hay que recompilar (no solo redesplegar) si cambia.

## Más documentación

[`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md) — decisiones de diseño con más detalle: cómo se consume el streaming, por qué el visor de PDF no usa un `<iframe>`, persistencia local, dictado por voz.

## Licencia

ISC — ver [LICENSE](./LICENSE).
