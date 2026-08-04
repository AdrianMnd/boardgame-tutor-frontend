import "./Chat.css";

import {

    useEffect,

    useRef

} from "react";

import type { Game } from "../../types/Game";

import MessageComponent from "./Message";

import { useChat } from "../../hooks/useChat";

interface Props {

    game: Game | null;

}

function Chat({

    game

}: Props) {

    const {

        messages,

        question,

        setQuestion,

        sendMessage,

        handleQuestionKeyDown,

        isLoading,

        errorMessage

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

        if (!question) {

            textarea.style.height = "auto";

            return;

        }

        textarea.style.height = "auto";

        textarea.style.height =

            `${textarea.scrollHeight}px`;

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

            <div className="chat-messages">

                <h2>

                    {game?.name}

                </h2>

                {

                    errorMessage && (

                        <p className="chat-error">

                            {errorMessage}

                        </p>

                    )

                }

                {

                    messages.map(message => (

                        <MessageComponent

                            key={message.id}

                            message={message}

                        />

                    ))

                }

                <div

                    ref={messagesEndRef}

                />

            </div>

            <div className="chat-input">

                <textarea

                    ref={textareaRef}

                    value={question}

                    onChange={event =>

                        setQuestion(

                            event.target.value

                        )

                    }

                    onKeyDown={

                        handleQuestionKeyDown

                    }

                    rows={1}

                    placeholder="Pregunta sobre el juego..."

                    disabled={isLoading}

                />

                <button

                    onClick={sendMessage}

                    disabled={isLoading}

                >

                    {

                        isLoading

                            ? "Generando..."

                            : "Enviar"

                    }

                </button>

            </div>

        </section>

    );

}

export default Chat;