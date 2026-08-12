# BoardGame Tutor — Frontend

Aplicación web en React que permite elegir un juego de mesa, preguntarle en lenguaje natural sobre sus reglas y consultar el reglamento en PDF, saltando directamente a la página que se usó como fuente de cada respuesta.

Repositorio del backend: [boardgame-tutor-backend](https://github.com/AdrianMnd/boardgame-tutor-backend)

## Características

- **Respuestas en streaming**: el texto aparece progresivamente (Server-Sent Events), no hay que esperar a la respuesta completa.
- **Pregunta por voz**: dictado con la Web Speech API nativa del navegador, sin backend ni coste adicional.
- **Visor de PDF integrado** (`pdf.js`, no un `<iframe>`): salta a la página exacta usada como fuente de cada respuesta, de forma fiable en cualquier dispositivo — incluidos navegadores móviles, donde el visor nativo del sistema no siempre respeta ese salto.
- **Totalmente responsive**: panel de juegos como *drawer* deslizante en móvil, diseño adaptado desde 320px hasta escritorio.
- **Tema oscuro** con paleta índigo/púrpura.
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
├── components/
│   ├── Chat/         # conversación, mensajes, fuentes
│   ├── Header/        # cabecera + menú móvil
│   ├── Layout/         # estructura general y workspace
│   ├── Sidebar/        # panel de juegos (drawer en móvil)
│   ├── PdfViewer/       # visor de PDF con pdf.js
│   └── UI/              # componentes reutilizables
├── hooks/            # useChat, useConversation, useSpeechRecognition
├── services/          # clientes HTTP (games, chat)
└── types/               # tipos compartidos
```

## Seguridad de configuración

`VITE_API_URL` se incrusta en el bundle de producción durante la compilación — no debe contener secretos, y hay que recompilar (no solo redesplegar) si cambia.

## Licencia

ISC — ver [LICENSE](./LICENSE).
