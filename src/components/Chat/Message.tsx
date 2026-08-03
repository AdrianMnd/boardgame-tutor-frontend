import "./Message.css";

import type { Message as MessageType } from "../../types/Message";

import Sources from "./Sources";

interface Props {

    message: MessageType;

}

function Message({

    message

}: Props) {
console.log(
    message.sources?.map(source => source.id)
);
    return (

        <div

            className={

                message.role === "user"

                    ? "message user"

                    : "message assistant"

            }

        >

            <div>

                {message.content}

            </div>

            <Sources

                sources={

                    message.sources ?? []

                }

            />

        </div>

    );

}

export default Message;