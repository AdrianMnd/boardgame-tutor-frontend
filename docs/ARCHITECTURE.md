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

## Recuperación de contraseña olvidada

Un flujo de tres estados dentro del propio `AuthModal`, en modo "login": enlace "¿Has olvidado tu contraseña?" → formulario (solo el email) → confirmación. No es un `mailto:` como en un diseño anterior de esto — manda una solicitud real al backend (`POST /api/password-reset-requests`), que el administrador ve en su panel y resuelve manualmente (no hay recuperación automática por correo — ver [`docs/CONFIGURATION.md`](https://github.com/AdrianMnd/boardgame-tutor-backend/blob/master/docs/CONFIGURATION.md) del backend).

El estado se resetea junto con el resto del modal al cerrarse — reabrir el login siempre empieza por el enlace, nunca deja el formulario o la confirmación anterior a medias.

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

El formulario exige sesión iniciada. Los PDF (y opcionalmente una imagen de portada, campo `cover`) se mandan como `multipart/form-data`, no JSON — el cliente HTTP (`apiClient`) tiene un método aparte (`postFormData`) que deja que el navegador calcule el `Content-Type` con el `boundary` correcto, en vez de forzar `application/json` como en el resto de peticiones. La portada es completamente opcional — el formulario funciona igual sin ella, y el panel de administración solo muestra el enlace "Ver portada" cuando la solicitud la incluyó.

## Carga diferida (*code splitting*)

Dos partes de la aplicación se cargan solo cuando hacen falta, con `React.lazy` + `Suspense`:

- **El visor de PDF** (`react-pdf` + `pdfjs-dist`, ~420KB): solo se descarga al abrir un manual.
- **El chat** (`react-markdown` + `remark-gfm` y sus dependencias de parseo, ~165KB): solo se descarga al elegir un juego.

Esto reduce el paquete cargado en la primera visita de ~610KB a ~277KB. El resaltado de sintaxis de código (`rehype-highlight`, ~250KB) se quitó por completo — no tenía sentido real en una aplicación de reglas de juegos de mesa.

## Dictado por voz

`useSpeechRecognition` usa la Web Speech API nativa del navegador — no hay ningún proveedor de IA ni backend involucrado. La detección de soporte (`isSupported`) oculta el botón por completo en navegadores sin esta API, en vez de mostrar un botón que fallaría al pulsarlo.

**`continuous: true`, no `false`.** Con `false` (el valor inicial), el navegador corta la grabación sola tras la más mínima pausa al hablar — un problema real reportado en escritorio, donde el micrófono es más sensible. Con `continuous: true`, sigue escuchando hasta que se pulsa el botón de parar o hasta que el propio navegador decide cortar tras un silencio prolongado. Como contrapartida, `onresult` puede llegar varias veces a lo largo de una misma grabación (una por cada frase que se va finalizando) — por eso el resultado se **acumula** en el componente que lo consume, en vez de sustituirse cada vez.

**Envío automático al terminar de grabar.** El *hook* acepta un callback opcional `onEnd`, guardado en un `ref` (igual que `onResult`, para no tener que recrear el objeto `SpeechRecognition` en cada render) y llamado cuando la grabación termina de verdad — nunca en cada pausa intermedia dentro de la propia grabación. `Chat.tsx` lo conecta directamente a `sendMessage()`, que ya no hace nada si la pregunta está vacía, así que no hace falta comprobarlo antes de llamarlo.

## Texto a voz (leer las respuestas)

`useTextToSpeech` es el equivalente de salida — `window.speechSynthesis`, también nativo del navegador, también sin backend ni coste. Antes de leer una respuesta, se limpia el markdown con una función propia (`stripMarkdownForSpeech`): quitar negrita/cursiva/encabezados/listas/enlaces evita que se lean símbolos sueltos como "asterisco asterisco".

Solo lee una respuesta cuando termina con éxito de verdad — nunca al cancelarla ni si hubo un error. Esto se resuelve pasando un callback opcional a `useChat(game, playerCount, onAnswerComplete)`, que se llama exactamente en el mismo punto donde se persiste la versión final del mensaje (ver la sección de guardar la conversación, arriba) — no en cada fragmento del streaming.

La preferencia de activar/desactivar se guarda en `localStorage` (por dispositivo, igual que el tema) — completamente opcional, pensado para quien no quiere estar escuchando explicaciones y solo quiere leer.

## Modo "jugando con N jugadores"

Un `<select>` siempre visible junto a la caja de preguntas, acotado al rango real del juego (`minPlayers`–`maxPlayers`, que ya manda la API) — nunca se puede elegir un número inválido para ese juego en concreto.

Vive **solo en memoria del componente** `Chat`, a propósito — nunca en `localStorage`. Se resetea al cambiar de juego (el rango válido es distinto en cada uno, con el mismo patrón de "ajuste en render" que el resto del proyecto), pero **no** se resetea al pulsar "Nueva conversación" ni entre preguntas: un grupo puede cambiar de número de jugadores sin querer empezar una conversación nueva, y el selector, siempre visible, permite corregirlo al momento si hiciera falta. Recargar la página sí lo resetea (nace de cero en cada carga), que es la forma natural de evitar que un número de una sesión de juego anterior se arrastre silenciosamente a una posterior.

## Valoración de respuestas

Dos botones (👍/👎) junto a "Copiar respuesta", solo en mensajes del asistente ya completos. `Chat.tsx` calcula la pregunta que originó cada respuesta por posición en el array de mensajes (`messages[index - 1]`) y la pasa a `Message` junto con el `gameId`, para poder mandar la valoración completa.

Actualización optimista (se ve el cambio al instante) y de un solo sentido — una vez valorada, los botones se deshabilitan, no se puede cambiar de opinión ni valorar dos veces la misma respuesta. Si la petición fallara en segundo plano, no se revierte ni se avisa — es una señal de baja importancia, no merece complicar la interfaz por un fallo puntual de red.

## PWA y caché

La app es instalable (`vite-plugin-pwa`, con manifest e iconos generados a partir del propio logo). La estrategia de caché es deliberadamente selectiva, no "cachear todo":

- **Portadas y manuales PDF**: caché primero — una vez consultado un reglamento, se puede reabrir sin conexión. Es el caso de uso real que motivó esto: muchas partidas ocurren con mal wifi en casa de alguien.
- **Lista de juegos**: red primero con reserva en caché — prioriza estar al día, pero no deja la app vacía sin conexión.
- **Todo lo demás** (chat, autenticación, favoritos...): sin ninguna regla de caché, va directo a la red — necesitan estar al día de verdad, cachearlos daría una falsa sensación de que funcionan sin conexión cuando no es el caso.

Un detalle de compatibilidad: Safari en iOS no soporta la etiqueta estándar `mobile-web-app-capable` (solo la versión `apple-mobile-web-app-capable`), así que `index.html` incluye ambas — la estándar porque Chrome/Edge la piden explícitamente (y avisan por consola si falta), la de Apple porque sigue siendo la única que iOS entiende.

## Panel de administración

Un enlace en el menú de perfil ("Panel de administración"), visible **solo si `user.isAdmin`** — ese campo lo calcula el propio backend (comparando el email de la cuenta contra `ADMIN_EMAIL`, un secreto que el frontend nunca conoce) y viaja en la respuesta de `/api/auth/me`. El frontend nunca decide por sí mismo quién es administrador, solo respeta lo que le dice el backend.

`AdminPanelModal` reutiliza el mismo patrón de "ajuste en render" que el resto de modales del proyecto para recargar sus datos cada vez que se abre (el modal sigue montado entre aperturas, así que `isOpen` por sí solo no basta para saber cuándo volver a pedir los datos). Combina cuatro secciones en un único panel — solicitudes de juegos, solicitudes de restablecer contraseña, resumen de valoraciones, y el formulario para restablecer contraseñas manualmente — con cargas independientes entre sí: si una falla, las demás siguen funcionando con normalidad.

**Orden y separación visual**, ajustados tras pruebas reales: el formulario de restablecer contraseña se movió al final del todo (antes quedaba visualmente "en medio", entre las solicitudes de juegos y las valoraciones, algo que no se notó hasta verlo en uso real), con un separador propio (`.admin-reset-password-form-separated`) para que no quede pegado al bloque anterior.

**Vaciar solicitudes y valoraciones**: un botón "Vaciar todas" en cada una de las dos listas, con confirmación del navegador (`window.confirm()`) antes de llamar al endpoint — es una acción destructiva sin deshacer, así que la confirmación no es opcional. Pensado para cuando el panel acumula demasiadas ya gestionadas y deja de ser práctico de revisar.

## Panel de juegos en móvil

Por debajo de 768px, el `Sidebar` pasa a ser un panel deslizante (`position: fixed`). Por encima, es una columna fija siempre visible — el mismo componente, solo CSS condicionado por *media query*. El **ancho de esa columna** se define en un único sitio (la rejilla CSS del `Workspace`), no en el propio sidebar — tenerlo en los dos sitios a la vez fue la causa de un bug real en el que el sidebar acababa desbordándose sobre el chat.

Dos ajustes adicionales llegaron después de las primeras pruebas reales en móvil:

- **Título de la cabecera**: con los botones nuevos (novedades, solicitar juego, ajustes, sesión) compitiendo por espacio en pantallas estrechas, el texto del título llegó a recortarse a "Board...". Se resolvió ocultándolo del todo por debajo de 900px (el icono de la marca ya es suficiente identidad visual ahí), en vez de seguir intentando encogerlo.
- **Paneles desbordados**: los paneles de "Solicitar juego" y "Novedades" se posicionan calculando su distancia al borde derecho a partir del botón que los abre (`usePositionedMenu`) — pero esos dos botones no son los más a la derecha de la cabecera, así que en pantallas estrechas el panel (con ancho fijo) podía empezar fuera de la pantalla por la izquierda. Se arregló en el propio *hook* compartido, limitando esa distancia a un máximo seguro — afecta a los cuatro paneles que lo usan, no solo a esos dos.

Un tercer ajuste llegó tras añadir el botón de silenciar la voz de salida (sección "Texto a voz"): en la caja de preguntas, una regla CSS genérica (`.chat-input button { min-width: 120px; padding: 0 26px; }`, pensada solo para el botón de "Enviar" con su texto) también estiraba los botones de icono (micrófono, silenciar voz) a un ancho mínimo de 120px en anchos de pantalla intermedios, donde la regla compacta específica de móvil todavía no entraba en juego — se veían más anchos de lo esperado frente al resto. Arreglado dándoles a esos dos botones su propio `min-width` explícito, inmune a la regla genérica en cualquier tamaño de pantalla.

## Doble pulsación de "atrás" para salir

En navegador y en móvil, pulsar "atrás" navegaba directamente a la página anterior sin ningún aviso — un problema real al usar la app como PWA en móvil, donde ese gesto es fácil de disparar sin querer. `useBackButtonExitWarning` implementa el patrón habitual en apps nativas: al montar, empuja una entrada extra al historial del navegador; la primera pulsación de "atrás" consume esa entrada (dispara `popstate`, pero no llega a salir de verdad) y muestra un aviso ("Vuelve a pulsar atrás para salir") durante 2 segundos, volviendo a empujar otra entrada para que la próxima pulsación repita el mismo aviso. Si la segunda pulsación llega dentro de esos 2 segundos, no se vuelve a empujar nada — se deja navegar de verdad.

## Pantalla de bienvenida

Al cargar la aplicación no se autoselecciona el primer juego del catálogo — se muestra una pantalla de bienvenida con accesos rápidos a los juegos favoritos.

Con varios favoritos y una pantalla baja, el contenido puede desbordar el alto disponible — `justify-content: center` centra el contenido, y si se desborda, puede dejar la parte de arriba (el logo) inaccesible aunque técnicamente haya *scroll* (un problema conocido de CSS: centrar contenido que no cabe no garantiza que el principio siga siendo alcanzable). Se cambió a `justify-content: safe center`, que cae automáticamente a alinear desde el principio en vez de centrar cuando no hay espacio suficiente, sin cambiar nada en el caso normal donde sí cabe.

## Notificaciones de juegos nuevos: por qué son persistentes durante la sesión

`useNewGames` marca todo como visto (`markAllAsSeen()`) al abrir el panel de la campana — pero si eso ocurriera en **cada** apertura, la segunda vez que se abriera el panel en la misma sesión ya no habría nada que mostrar (la lista en vivo estaría vacía, recién marcada como vista la primera vez), aunque no se hubiera recargado la página. `Header.tsx` evita esto con un `ref` que solo permite la captura de la foto fija (ver la sección de aviso de juegos nuevos, arriba) **una vez por sesión** — reabrir el panel más tarde sigue mostrando los mismos juegos, aunque la insignia numérica ya se haya apagado (esa sí sigue leyendo el valor en vivo, así que desaparece tras la primera vista, que es el comportamiento esperado de cualquier aviso).

## Monitorización de errores

`VITE_SENTRY_DSN` (opcional, ver `docs/DEPLOYMENT.md`) activa `@sentry/react`. `initSentry()` se llama al principio de `main.tsx`, antes de montar la aplicación. La captura de errores de renderizado se integra dentro del `ErrorBoundary` ya existente (`componentDidCatch` llama a `captureError`, además de seguir mostrando la pantalla de "Algo ha ido mal" de siempre) — no se creó ningún componente nuevo ni se cambió su arquitectura. Sin la variable, `captureError` no hace nada — verificado explícitamente (los tests existentes de `ErrorBoundary` siguen pasando sin cambios).
