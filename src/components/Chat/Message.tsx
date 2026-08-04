import "./Message.css";

import type { Message as MessageType } from "../../types/Message";

import Sources from "./Sources";

interface Props {

    message: MessageType;

}

function Message({

    message

}: Props) {

    return (

        <div

            className={

                message.role === "user"

                    ? "message user"

                    : "message assistant"

            }

        >

            {

                message.isLoading

                    ?

                    <div className="thinking">

                        <span>Pensando</span>

                        <span className="thinking-dots">

                            <span></span>

                            <span></span>

                            <span></span>

                        </span>

                    </div>

                    :

                    <>

                        <div>

                            {message.content}

                        </div>

                        <Sources

                            sources={

                                message.sources ?? []

                            }

                        />

                    </>

            }

        </div>

    );

}

export default Message;