import "./Chat.css";

import {
    useEffect,
    useRef,
    useState,
    useCallback
} from "react";

import { createPortal } from "react-dom";

import type { Game } from "../../types/Game";

import MessageComponent from "./Message";
import Icon from "../UI/Icon";

import { BookOpen, ChevronDown, Menu, Plus, Send, Square, Mic, MicOff } from "lucide-react";

import { useChat } from "../../hooks/useChat";
import { useSpeechRecognition } from "../../hooks/useSpeechRecognition";

interface Props {

    game: Game | null;

    onOpenManual: (

        page?: number,

        documentId?: string

    ) => void;

    onOpenSidebar: () => void;

}

function Chat({

    game,

    onOpenManual,

    onOpenSidebar

}: Props) {

    // Solo vive en memoria de este componente — no se guarda en
    // ningún sitio a propósito. Se resetea al recargar la página
    // (estado nuevo de React) y también al cambiar de juego (el
    // rango válido de jugadores es distinto en cada uno, así que
    // no tendría sentido arrastrarlo). NO se resetea al pulsar
    // "Nueva conversación" ni entre preguntas del mismo juego —
    // un grupo puede cambiar de número de jugadores sin querer
    // empezar una conversación nueva, y este selector siempre
    // visible permite corregirlo al momento.
    const [playerCount, setPlayerCount] =

        useState<number | null>(null);

    const [lastGameId, setLastGameId] =

        useState<string | undefined>(game?.id);

    if (game?.id !== lastGameId) {

        setLastGameId(game?.id);

        setPlayerCount(null);

    }

    const {

        messages,

        question,

        setQuestion,

        sendMessage,

        handleQuestionKeyDown,

        isLoading,

        errorMessage,

        startNewConversation,

        cancelGeneration

    } = useChat(game, playerCount);

    // Aviso para lectores de pantalla cuando llega una respuesta
    // nueva — el texto en sí va apareciendo progresivamente
    // (streaming), pero anunciar cada palabra según llega sería
    // ilegible, así que solo se avisa al empezar y al terminar.
    const [

        isManualMenuOpen,

        setIsManualMenuOpen

    ] = useState(false);

    // El botón que abre el menú de documentos — se necesita su
    // posición real en pantalla para colocar el menú mediante
    // un portal (ver más abajo, justo antes de por qué hace
    // falta un portal aquí).
    const manualButtonRef =
        useRef<HTMLButtonElement>(null);

    const [

        manualMenuPosition,

        setManualMenuPosition

    ] = useState<{ top: number; right: number } | null>(null);

    // Documentos del juego seleccionado — con `?? []` a
    // propósito: si el backend desplegado se queda
    // desincronizado (ej. una versión antigua sin soporte
    // multi-documento) y no manda este campo, la app degrada a
    // "un único documento implícito" en vez de romperse.
    const documents = game?.documents ?? [];

    const [

        liveAnnouncement,

        setLiveAnnouncement

    ] = useState("");

    // Patrón recomendado por React para "ajustar estado según
    // cambia otro valor" sin usar un efecto (ver
    // https://react.dev/learn/you-might-not-need-an-effect):
    // se compara con el valor del render anterior directamente
    // durante el render, en vez de reaccionar a posteriori en
    // un useEffect (que produciría un renderizado en cascada
    // innecesario).
    const [

        previousIsLoading,

        setPreviousIsLoading

    ] = useState(isLoading);

    if (isLoading !== previousIsLoading) {

        setPreviousIsLoading(isLoading);

        setLiveAnnouncement(

            isLoading

                ? "Generando respuesta…"

                : "Respuesta lista"

        );

    }

    // Este efecto sí es un efecto de verdad (programa un
    // temporizador, un sistema externo al propio render) — el
    // setState ocurre dentro del callback del timeout, no de
    // forma síncrona en el cuerpo del efecto.
    useEffect(() => {

        if (!liveAnnouncement) {

            return;

        }

        const timeout =

            setTimeout(

                () => setLiveAnnouncement(""),

                5000

            );

        return () => clearTimeout(timeout);

    }, [liveAnnouncement]);

    const handleVoiceResult =

        useCallback((transcript: string) => {

            setQuestion(previous =>

                previous.trim()

                    ? `${previous.trim()} ${transcript}`

                    : transcript

            );

        }, [setQuestion]);

    const {

        isSupported: isVoiceSupported,

        isListening,

        toggle: toggleVoice

    } = useSpeechRecognition({

        onResult: handleVoiceResult

    });

    const messagesEndRef =
        useRef<HTMLDivElement>(null);

    const textareaRef =
        useRef<HTMLTextAreaElement>(null);

    useEffect(() => {

        messagesEndRef.current?.scrollIntoView({

            behavior: "smooth"

        });

    }, [

        messages

    ]);

    useEffect(() => {

        const textarea =
            textareaRef.current;

        if (!textarea) {

            return;

        }

        const maxHeight = 180;

        textarea.style.height = "auto";

        const nextHeight =
            Math.min(

                textarea.scrollHeight,

                maxHeight

            );

        textarea.style.height =
            `${nextHeight}px`;

        textarea.style.overflowY =

            textarea.scrollHeight > maxHeight

                ? "auto"

                : "hidden";

    }, [

        question

    ]);

    useEffect(() => {

        if (!isLoading) {

            textareaRef.current?.focus();

        }

    }, [

        game?.id,

        isLoading

    ]);

    // Cierra el desplegable de documentos al clicar fuera de él.
    useEffect(() => {

        if (!isManualMenuOpen) {

            return;

        }

        function handleClickOutside(

            event: MouseEvent

        ) {

            const target = event.target as HTMLElement;

            // El propio menú ahora se renderiza mediante un
            // portal fuera de .manual-menu (ver más abajo, por
            // qué), así que target.closest(".manual-menu") ya
            // no encuentra los clics dentro del menú — hay que
            // comprobar también su propia clase.
            if (

                !target.closest(".manual-menu") &&
                !target.closest(".manual-menu-list")

            ) {

                setIsManualMenuOpen(false);

            }

        }

        document.addEventListener(

            "mousedown",

            handleClickOutside

        );

        return () =>

            document.removeEventListener(

                "mousedown",

                handleClickOutside

            );

    }, [isManualMenuOpen]);

    // Calcula dónde debe aparecer el menú de documentos, en
    // coordenadas de ventana (no del documento) — se usa
    // "position: fixed" en vez de "absolute" porque el menú se
    // renderiza mediante un portal directamente en <body>, fuera
    // del contenedor .chat. Hace falta un portal porque .chat
    // tiene overflow:hidden (necesario para sus esquinas
    // redondeadas) — cualquier elemento absoluto anidado dentro
    // se recorta contra ese límite en cuanto no cabe entero,
    // aunque tenga z-index alto. Sacarlo del árbol con un portal
    // es la forma correcta de evitarlo, en vez de quitar el
    // overflow:hidden (que rompería otras cosas).
    useEffect(() => {

        if (!isManualMenuOpen || !manualButtonRef.current) {

            setManualMenuPosition(null);

            return;

        }

        function updatePosition() {

            const button = manualButtonRef.current;

            if (!button) {

                return;

            }

            const rect =
                button.getBoundingClientRect();

            setManualMenuPosition({

                top: rect.bottom + 8,

                right: window.innerWidth - rect.right

            });

        }

        updatePosition();

        // Antes se cerraba el menú al detectar "resize" o
        // "scroll" (para evitar que quedara mal colocado). En
        // móvil esos eventos también los dispara el navegador al
        // mostrar/ocultar su propia barra de direcciones al
        // hacer scroll — cerrando el menú de forma molesta e
        // inesperada. En su lugar, solo se recalcula la
        // posición, sin cerrar.
        window.addEventListener("resize", updatePosition);

        return () => {

            window.removeEventListener("resize", updatePosition);

        };

    }, [isManualMenuOpen]);

    return (

        <section className="chat">

            <div className="chat-topbar">

                <button

                    className="chat-menu-button"

                    onClick={onOpenSidebar}

                    aria-label="Ver lista de juegos"

                >

                    <Icon

                        icon={Menu}

                        size={20}

                    />

                </button>

                <div className="chat-title">

                    <h2>

                        {game?.name}

                    </h2>

                    <span>

                        Pregunta cualquier duda sobre el reglamento

                    </span>

                </div>

                <div className="chat-topbar-actions">

                    {

                        // Uso siempre de la variable local
                        // `documents` (con `?? []` ya aplicado)
                        // en vez de `game.documents` directo —
                        // esto es justo lo que evita que un
                        // backend desincronizado (sin este
                        // campo) rompa toda la pantalla de chat.
                        documents.length > 1

                            ? (

                                <div className="manual-menu">

                                    <button

                                        ref={manualButtonRef}

                                        className="manual-button manual-button-multi"

                                        onClick={

                                            () =>

                                                setIsManualMenuOpen(

                                                    open => !open

                                                )

                                        }

                                        aria-haspopup="true"

                                        aria-expanded={isManualMenuOpen}

                                        aria-label="Ver documentos"

                                    >

                                        <Icon

                                            icon={BookOpen}

                                            size={16}

                                        />

                                        <span>

                                            Ver documentos

                                        </span>

                                        <Icon

                                            icon={ChevronDown}

                                            size={14}

                                        />

                                    </button>

                                    {

                                        isManualMenuOpen &&

                                        manualMenuPosition &&

                                        createPortal(

                                            <div

                                                className="manual-menu-list"

                                                role="menu"

                                                style={{

                                                    top: manualMenuPosition.top,

                                                    right: manualMenuPosition.right

                                                }}

                                            >

                                                {

                                                    documents.map(

                                                        document => (

                                                            <button

                                                                key={document.id}

                                                                role="menuitem"

                                                                onClick={() => {

                                                                    setIsManualMenuOpen(false);

                                                                    onOpenManual(

                                                                        undefined,

                                                                        document.id

                                                                    );

                                                                }}

                                                            >

                                                                {document.name}

                                                            </button>

                                                        )

                                                    )

                                                }

                                            </div>,

                                            document.body

                                        )

                                    }

                                </div>

                            )

                            : (

                                <button

                                    className="manual-button"

                                    onClick={() =>

                                        onOpenManual()

                                    }

                                    disabled={!game}

                                    aria-label="Ver manual completo"

                                >

                                    <Icon

                                        icon={BookOpen}

                                        size={16}

                                    />

                                    <span>

                                        Ver manual completo

                                    </span>

                                </button>

                            )

                    }

                    <button

                        className="new-chat-button"

                        onClick={startNewConversation}

                        aria-label="Nueva conversación"

                    >

                        <Icon

                            icon={Plus}

                            size={16}

                            className="new-chat-icon"

                        />

                        <span>

                            Nueva conversación

                        </span>

                    </button>

                </div>

            </div>

            <div

                role="status"

                aria-live="polite"

                className="visually-hidden"

            >

                {liveAnnouncement}

            </div>

            <div className="chat-messages">

                {

                    errorMessage && (

                        <div className="chat-error">

                            {errorMessage}

                        </div>

                    )

                }

                {

                    messages.length === 0 && (

                        <div className="chat-empty">

                            <h1>

                                {game?.name}

                            </h1>

                            <p>

                                Haz cualquier pregunta sobre el reglamento.

                            </p>

                            <div className="chat-suggestions">

                                <button

                                    onClick={() =>

                                        setQuestion(

                                            "¿Cómo se gana la partida?"

                                        )

                                    }

                                >

                                    ¿Cómo se gana la partida?

                                </button>

                                <button

                                    onClick={() =>

                                        setQuestion(

                                            "¿Cómo empieza una partida?"

                                        )

                                    }

                                >

                                    ¿Cómo empieza una partida?

                                </button>

                                <button

                                    onClick={() =>

                                        setQuestion(

                                            "Explícame el turno de un jugador."

                                        )

                                    }

                                >

                                    Explícame el turno

                                </button>

                            </div>

                        </div>

                    )

                }

                {

                    messages.map(

                        message => (

                            <MessageComponent

                                key={message.id}

                                message={message}

                                onOpenSource={

                                    (page, documentId) =>

                                        onOpenManual(

                                            page,

                                            documentId

                                        )

                                }

                            />

                        )

                    )

                }

                <div

                    ref={messagesEndRef}

                />

            </div>

            <div className="chat-player-count">

                <label htmlFor="chat-player-count-select">

                    Jugando con

                </label>

                <select

                    id="chat-player-count-select"

                    value={playerCount ?? ""}

                    onChange={event => {

                        const value = event.target.value;

                        setPlayerCount(

                            value === "" ? null : Number(value)

                        );

                    }}

                >

                    <option value="">

                        (sin especificar)

                    </option>

                    {

                        game &&

                        Array.from(

                            {

                                length:
                                    game.maxPlayers - game.minPlayers + 1

                            },

                            (_, index) => game.minPlayers + index

                        ).map(

                            count => (

                                <option key={count} value={count}>

                                    {count} jugadores

                                </option>

                            )

                        )

                    }

                </select>

            </div>

            <div className="chat-input">

                <textarea

                    ref={textareaRef}

                    rows={1}

                    value={question}

                    placeholder={

                        isListening

                            ? "Escuchando…"

                            : "Escribe tu pregunta…"

                    }

                    disabled={isLoading}

                    onChange={event =>

                        setQuestion(

                            event.target.value

                        )

                    }

                    onKeyDown={

                        handleQuestionKeyDown

                    }

                />

                {

                    isVoiceSupported && (

                        <button

                            className={

                                isListening

                                    ? "chat-voice-button listening"

                                    : "chat-voice-button"

                            }

                            onClick={toggleVoice}

                            disabled={isLoading}

                            aria-label={

                                isListening

                                    ? "Detener dictado por voz"

                                    : "Preguntar por voz"

                            }

                            type="button"

                        >

                            <Icon

                                icon={

                                    isListening

                                        ? MicOff

                                        : Mic

                                }

                                size={18}

                            />

                        </button>

                    )

                }

                {

                    isLoading

                        ?

                        <button

                            className="chat-send-button cancel"

                            onClick={cancelGeneration}

                        >

                            <Icon

                                icon={Square}

                                size={16}

                            />

                            <span>

                                Cancelar

                            </span>

                        </button>

                        :

                        <button

                            className="chat-send-button"

                            onClick={sendMessage}

                        >

                            <Icon

                                icon={Send}

                                size={16}

                            />

                            <span>

                                Enviar

                            </span>

                        </button>

                }

            </div>

        </section>

    );

}

export default Chat;