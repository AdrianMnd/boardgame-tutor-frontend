import "./Message.css";
import type { Message as MessageType } from "../../types/Message";

interface Props {
    message: MessageType;
}

function Message({ message }: Props) {

    return (
        <div
            className={
                message.role === "user" ? "message user" : "message assistant"
            }
        >
            {message.content}
        </div>
    );

}

export default Message;