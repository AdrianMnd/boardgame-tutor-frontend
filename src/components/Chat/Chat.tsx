import "./Chat.css";

import { useState } from "react";

import type { Game } from "../../types/Game";
import type { Message } from "../../types/Message";
import { sendQuestion } from "../../services/chat.service";

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

    const sendMessage = async () => {

    if (!question.trim() || !game) return;


    const userMessage: Message = {

        id: Date.now(),

        role: "user",

        content: question

    };


    setMessages(previous => [
        ...previous,
        userMessage
    ]);


    setQuestion("");


    try {

        const response = await sendQuestion(
            game.name,
            question
        );


        const assistantMessage: Message = {

            id: Date.now() + 1,

            role: "assistant",

            content: response.answer

        };


        setMessages(previous => [
            ...previous,
            assistantMessage
        ]);


    } catch (error) { // eslint-disable-line @typescript-eslint/no-unused-vars
        const errorMessage: Message = {

            id: Date.now() + 2,

            role: "assistant",

            content: "Error al conectar con el servidor."

        };


        setMessages(previous => [
            ...previous,
            errorMessage
        ]);

    }

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