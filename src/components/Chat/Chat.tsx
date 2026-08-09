import "./Chat.css";

import {
    useEffect,
    useRef
} from "react";

import type { Game } from "../../types/Game";

import MessageComponent from "./Message";
import Icon from "../UI/Icon";

import { BookOpen } from "lucide-react";

import { useChat } from "../../hooks/useChat";

interface Props {

    game: Game | null;

    onOpenManual: (page?: number) => void;

}

function Chat({

    game,

    onOpenManual

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

                    >

                        <Icon

                            icon={BookOpen}

                            size={16}

                        />

                        Ver manual completo

                    </button>

                    <button

                        className="new-chat-button"

                        onClick={startNewConversation}

                    >

                        Nueva conversación

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

                    placeholder="Escribe tu pregunta…"

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

                    isLoading

                        ?

                        <button

                            onClick={cancelGeneration}

                        >

                            Cancelar

                        </button>

                        :

                        <button

                            onClick={sendMessage}

                        >

                            Enviar

                        </button>

                }

            </div>

        </section>

    );

}

export default Chat;