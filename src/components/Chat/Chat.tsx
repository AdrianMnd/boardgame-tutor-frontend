import "./Chat.css";

import { useState } from "react";

import type { Game } from "../../types/Game";
import type { Message } from "../../types/Message";

import MessageComponent from "./Message";

interface Props {

    game: Game | null;

}

function Chat({ game }: Props) {

    const [messages, setMessages] = useState<Message[]>([
        {
            id: 1,
            role: "assistant",
            content: "Hola. Pregúntame cualquier duda sobre este juego."
        }
    ]);

    const [question, setQuestion] = useState("");

    const sendMessage = () => {

        if (!question.trim()) return;

        const userMessage: Message = {

            id: Date.now(),

            role: "user",

            content: question

        };

        const assistantMessage: Message = {

            id: Date.now() + 1,

            role: "assistant",

            content: "Esta respuesta es simulada. Más adelante responderá la IA."

        };

        setMessages(previous => [
            ...previous,
            userMessage,
            assistantMessage
        ]);

        setQuestion("");

    };

    return (

        <section className="chat">

            <div className="chat-messages">

                <h2>{game?.name}</h2>

                {messages.map(message => (

                    <MessageComponent
                        key={message.id}
                        message={message}
                    />

                ))}

            </div>

            <div className="chat-input">

                <input

                    value={question}

                    onChange={(e) => setQuestion(e.target.value)}

                    placeholder="Pregunta sobre el juego..."

                />

                <button onClick={sendMessage}>

                    Enviar

                </button>

            </div>

        </section>

    );

}

export default Chat;