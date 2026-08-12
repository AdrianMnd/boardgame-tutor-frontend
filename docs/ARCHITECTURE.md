# Arquitectura del frontend

Detalles que no caben bien en el README — decisiones de diseño y cómo encajan las piezas.

## Consumo del streaming (SSE)

El backend responde a `/api/chat/stream` con *Server-Sent Events*. `chatService.askQuestionStream()` no usa `EventSource` (que solo soporta peticiones `GET`) — en su lugar hace un `fetch` normal con `POST` y lee el cuerpo de la respuesta como un stream, parseando a mano el formato `event: ...\ndata: ...\n\n`.

`useChat` consume ese stream con tres callbacks (`onSources`, `onChunk`, `onError`) y va actualizando el mensaje del asistente en cada fragmento — de ahí el efecto "máquina de escribir". El estado `isLoading` del mensaje se pone a `false` en cuanto llega el primer fragmento, no al terminar, para que el indicador de carga desaparezca en cuanto hay texto real que mostrar.

Cancelar una respuesta a mitad (botón "Cancelar") usa un `AbortController` pasado a `fetch` — el navegador corta la conexión SSE y el texto generado hasta ese momento se queda tal cual, marcado como terminado.

## Por qué el visor de PDF no usa un `<iframe>`

La primera versión abría el PDF en un `<iframe>` apuntando a `documento.pdf#page=N` para saltar a la página fuente de cada respuesta. Funcionaba perfecto en navegadores de escritorio, pero fallaba en Android — el visor de PDF integrado de Chromium en móvil no siempre respeta ese fragmento de URL.

La solución fue renderizar el PDF directamente con `pdf.js` (vía `react-pdf`), controlando la página mostrada mediante un prop (`pageNumber`) en vez de depender de una convención de URL. Esto funciona igual en cualquier plataforma porque ya no depende de qué visor de PDF tenga instalado o integrado el navegador — el propio código decide qué página se ve.

Un detalle de configuración con el que hay que tener cuidado: el *worker* de `pdf.js` tiene que ser exactamente la misma versión que usa `react-pdf` internamente (`pdfjs-dist` se instala como dependencia directa, fijada a esa versión) — una discrepancia de versión entre el worker y la librería principal rompe la carga del PDF con un error poco descriptivo.

## Persistencia local

No hay backend de usuarios ni base de datos para preferencias — todo lo que "recuerda" la aplicación entre sesiones vive en `localStorage` del navegador:

- **Conversaciones** (`ConversationContext` + `useConversation`): el historial de mensajes por juego.
- **Favoritos** (`useFavorites`): el conjunto de IDs de juegos marcados, usado para ordenarlos primero en el listado y para los accesos rápidos de la pantalla de bienvenida.

Ambos hooks son resilientes a `localStorage` no disponible o con contenido corrupto (Safari en modo privado, cuota agotada, JSON inválido): si falla la lectura **o la escritura**, la aplicación sigue funcionando, simplemente sin persistencia esa sesión.

## Dictado por voz

`useSpeechRecognition` usa la Web Speech API nativa del navegador (`SpeechRecognition` / `webkitSpeechRecognition`) — no hay ningún proveedor de IA ni backend involucrado en el reconocimiento de voz en sí. La detección de soporte (`isSupported`) oculta el botón por completo en navegadores sin esta API (Firefox, entre otros), en vez de mostrar un botón que fallaría al pulsarlo.

## Panel de juegos en móvil

Por debajo de 768px, el `Sidebar` deja de ocupar espacio en el flujo normal del documento y pasa a ser un panel deslizante (`position: fixed`) que se abre con el botón de menú del header. Seleccionar un juego, o tocar fuera del panel, lo cierra automáticamente. Por encima de 768px es simplemente una columna fija siempre visible — el mismo componente, sin ninguna rama de código distinta, solo CSS condicionado por *media query*.

## Pantalla de bienvenida

Al cargar la aplicación no se autoselecciona el primer juego del catálogo — se muestra una pantalla de bienvenida con accesos rápidos a los juegos favoritos. El logo/título del header es clicable y devuelve a esta pantalla en cualquier momento, la única forma de "salir" de la conversación de un juego concreto sin cerrar la aplicación.
