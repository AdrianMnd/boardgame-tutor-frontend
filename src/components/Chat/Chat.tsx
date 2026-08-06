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

                <header className="chat-header">

                <div>

                    <h2>

                        {game?.name}

                    </h2>

                    <p>

                        Pregunta cualquier duda sobre el reglamento.

                    </p>

                </div>

                <button

                    className="new-chat-button"

                    onClick={startNewConversation}

                >

                    🗑 Nueva conversación

                </button>

                </header>

                {

                    errorMessage && (

                        <p className="chat-error">

                            {errorMessage}

                        </p>

                    )

                }

                {
                    messages.length === 0 && (

        <div className="chat-empty">

            <h3>

                {game?.name}

            </h3>

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