import "./Chat.css";

import {
    useEffect,
    useRef,
    useCallback
} from "react";

import type { Game } from "../../types/Game";

import MessageComponent from "./Message";
import Icon from "../UI/Icon";

import { BookOpen, Menu, Plus, Send, Square, Mic, MicOff } from "lucide-react";

import { useChat } from "../../hooks/useChat";
import { useSpeechRecognition } from "../../hooks/useSpeechRecognition";

interface Props {

    game: Game | null;

    onOpenManual: (page?: number) => void;

    onOpenSidebar: () => void;

}

function Chat({

    game,

    onOpenManual,

    onOpenSidebar

}: Props) {

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

    } = useChat(game);

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

                                    page =>

                                        onOpenManual(

                                            page

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