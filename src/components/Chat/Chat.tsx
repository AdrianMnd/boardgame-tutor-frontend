import "./Chat.css";

import type { Game } from "../../types/Game";

import MessageComponent from "./Message";

import { useChat } from "../../hooks/useChat";


interface Props {

    game: Game | null;

}



function Chat({ game }: Props) {


    const {

        messages,

        question,

        setQuestion,

        sendMessage,

        isLoading,

        errorMessage

    } = useChat(game);



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

                    onChange={(e) =>
                        setQuestion(e.target.value)
                    }

                    placeholder="Pregunta sobre el juego..."

                    disabled={isLoading}

                />



                <button

                    onClick={sendMessage}

                    disabled={isLoading}

                >

                    {
                        isLoading
                            ? "Pensando..."
                            : "Enviar"
                    }


                </button>


            </div>


        </section>

    );

}



export default Chat;