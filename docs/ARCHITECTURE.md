# Arquitectura del frontend

Detalles que no caben bien en el README — decisiones de diseño y cómo encajan las piezas.

## Consumo del streaming (SSE)

El backend responde a `/api/chat/stream` con *Server-Sent Events*. `chatService.askQuestionStream()` no usa `EventSource` (que solo soporta peticiones `GET`) — en su lugar hace un `fetch` normal con `POST` y lee el cuerpo de la respuesta como un stream, parseando a mano el formato `event: ...\ndata: ...\n\n`.

`useChat` consume ese stream con tres callbacks (`onSources`, `onChunk`, `onError`) y va actualizando el mensaje del asistente en cada fragmento — de ahí el efecto "máquina de escribir". Cancelar una respuesta a mitad usa un `AbortController` pasado a `fetch` — el navegador corta la conexión SSE y el texto generado hasta ese momento se queda tal cual, marcado como terminado.

## Por qué el visor de PDF no usa un `<iframe>`

La primera versión abría el PDF en un `<iframe>` apuntando a `documento.pdf#page=N` para saltar a la página fuente de cada respuesta. Funcionaba perfecto en escritorio, pero fallaba en Android — el visor de PDF integrado de Chromium en móvil no siempre respeta ese fragmento de URL.

La solución fue renderizar el PDF directamente con `pdf.js` (vía `react-pdf`), controlando la página mostrada mediante un prop (`pageNumber`) en vez de depender de una convención de URL. Un detalle de configuración con el que hay que tener cuidado: el *worker* de `pdf.js` tiene que ser exactamente la misma versión que usa `react-pdf` internamente — una discrepancia rompe la carga del PDF con un error poco descriptivo.

## Autenticación

`useAuth` guarda el JWT en `localStorage` y lo inyecta como cabecera `Authorization` en todas las peticiones autenticadas (`apiClient.setToken()`). Al cargar la aplicación, si hay un token guardado, se valida contra `GET /api/auth/me` antes de dar la sesión por buena — un token caducado o inválido simplemente vuelve al estado "sin sesión", sin romper nada.

El login es **opcional en todo momento**: la aplicación funciona igual de bien sin cuenta. Lo que cambia es dónde persisten los datos del usuario.

## Favoritos, categorías y conversaciones: local o sincronizado, según haya sesión

Los tres siguen el mismo patrón "dual": sin sesión, todo vive en `localStorage`; con sesión, se sincroniza con la cuenta a través de la API, y sigue funcionando entre dispositivos.

```text
useFavorites(user)      user=null → localStorage
useCategories(user)     user=cuenta → API, con actualización optimista
ConversationContext(user)
```

Un par de detalles de diseño que costó encontrar bien:

- **Actualización optimista con reversión**: al marcar un favorito o crear una categoría con sesión iniciada, el cambio se ve al instante en la interfaz, antes de que la petición a la API haya terminado — si la petición falla, se deshace el cambio local.
- **El streaming de una respuesta no debe disparar una petición por cada fragmento de texto**: guardar la conversación en la cuenta solo persiste el mensaje del usuario (inmediato, es su contenido final) y la respuesta del asistente **una vez completa** — nunca en cada actualización intermedia mientras llega el texto poco a poco.
- **Migración al registrarse**: los favoritos y categorías creados como invitado se migran automáticamente a la cuenta la primera vez que alguien se registra (no al iniciar sesión en una cuenta ya existente). El historial de conversaciones, de momento, no se migra — queda como posible mejora futura.

## Tema claro/oscuro

`useTheme` no autodetecta el tema del sistema operativo — la primera vez que se visita la aplicación se pregunta explícitamente (`ThemeChoiceModal`), y la elección se guarda en `localStorage` (por dispositivo, no por cuenta). El tema se aplica con un atributo `data-theme` en `<html>`, y toda la paleta de colores vive en variables CSS (`variables.css`) — los componentes nunca tienen colores fijos, siempre `var(--color-*)`.

## Persistencia local

Todo lo que "recuerda" la aplicación entre sesiones **sin cuenta** vive en `localStorage`: conversaciones, favoritos, categorías, tema elegido, y qué juegos ya se han visto (para el aviso de "novedades"). Todos los hooks que leen/escriben `localStorage` son resilientes a que no esté disponible o falle (Safari en modo privado, cuota agotada, JSON corrupto) — si falla la lectura o la escritura, la aplicación sigue funcionando, simplemente sin persistir ese dato en concreto.

## Aviso de juegos nuevos

`useNewGames` compara la fecha de creación de cada juego (`createdAt`, que ya manda la API) contra la última vez que se vieron novedades en este dispositivo. La primera vez que se usa la aplicación no se marca **ningún** juego existente como "nuevo" — solo lo que se añada al catálogo a partir de ese momento cuenta como novedad.

## Solicitud de juegos nuevos

El formulario exige sesión iniciada. Los PDF se mandan como `multipart/form-data`, no JSON — el cliente HTTP (`apiClient`) tiene un método aparte (`postFormData`) que deja que el navegador calcule el `Content-Type` con el `boundary` correcto, en vez de forzar `application/json` como en el resto de peticiones.

## Carga diferida (*code splitting*)

Dos partes de la aplicación se cargan solo cuando hacen falta, con `React.lazy` + `Suspense`:

- **El visor de PDF** (`react-pdf` + `pdfjs-dist`, ~420KB): solo se descarga al abrir un manual.
- **El chat** (`react-markdown` + `remark-gfm` y sus dependencias de parseo, ~165KB): solo se descarga al elegir un juego.

Esto reduce el paquete cargado en la primera visita de ~610KB a ~277KB. El resaltado de sintaxis de código (`rehype-highlight`, ~250KB) se quitó por completo — no tenía sentido real en una aplicación de reglas de juegos de mesa.

## Dictado por voz

`useSpeechRecognition` usa la Web Speech API nativa del navegador — no hay ningún proveedor de IA ni backend involucrado. La detección de soporte (`isSupported`) oculta el botón por completo en navegadores sin esta API, en vez de mostrar un botón que fallaría al pulsarlo.

## Panel de juegos en móvil

Por debajo de 768px, el `Sidebar` pasa a ser un panel deslizante (`position: fixed`). Por encima, es una columna fija siempre visible — el mismo componente, solo CSS condicionado por *media query*. El **ancho de esa columna** se define en un único sitio (la rejilla CSS del `Workspace`), no en el propio sidebar — tenerlo en los dos sitios a la vez fue la causa de un bug real en el que el sidebar acababa desbordándose sobre el chat.

## Pantalla de bienvenida

Al cargar la aplicación no se autoselecciona el primer juego del catálogo — se muestra una pantalla de bienvenida con accesos rápidos a los juegos favoritos.
