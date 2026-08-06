import "./Message.css";

import { useState } from "react";

import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeHighlight from "rehype-highlight";

import "highlight.js/styles/github.css";

import Avatar from "../UI/Avatar";
import Icon from "../UI/Icon";
import Sources from "./Sources";

import {
    Clock3,
    Copy
} from "lucide-react";

import type {
    Message as MessageType
} from "../../types/Message";

interface Props {

    message: MessageType;

}

function Message({

    message

}: Props) {

    const [

        copied,

        setCopied

    ] = useState(false);

    async function copy() {

        await navigator.clipboard.writeText(

            message.content

        );

        setCopied(true);

        setTimeout(

            () =>

                setCopied(false),

            2000

        );

    }

    const assistant =

        message.role === "assistant";

    return (

        <article

            className={

                assistant

                    ? "message assistant"

                    : "message user"

            }

        >

            <Avatar

                role={message.role}

            />

            <div className="message-body">

                <header className="message-header">

                    <div>

                        <strong>

                            {

                                assistant

                                    ? "BoardGame Tutor"

                                    : "Tú"

                            }

                        </strong>

                    </div>

                    {

                        message.createdAt &&

                        <div className="message-time">

                            <Icon

                                icon={Clock3}

                                size={14}

                            />

                            {

                                message.createdAt.toLocaleTimeString(

                                    [],

                                    {

                                        hour: "2-digit",

                                        minute: "2-digit"

                                    }

                                )

                            }

                        </div>

                    }

                </header>

                {

                    message.isLoading

                    ?

                    <div className="thinking">

                        <span>

                            Pensando

                        </span>

                        <span className="thinking-dots">

                            <span />

                            <span />

                            <span />

                        </span>

                    </div>

                    :

                    <>

                        <div className="message-content">

                            <ReactMarkdown

                                remarkPlugins={[

                                    remarkGfm

                                ]}

                                rehypePlugins={[

                                    rehypeHighlight

                                ]}

                            >

                                {

                                    message.content

                                }

                            </ReactMarkdown>

                        </div>

                        {

                            assistant &&

                            <Sources

                                sources={

                                    message.sources ?? []

                                }

                            />

                        }

                        {

                            assistant &&

                            <footer className="message-toolbar">

                                <button

                                    onClick={copy}

                                >

                                    <Icon

                                        icon={Copy}

                                        size={15}

                                    />

                                    {

                                        copied

                                            ? "Copiado"

                                            : "Copiar respuesta"

                                    }

                                </button>

                            </footer>

                        }

                    </>

                }

            </div>

        </article>

    );

}

export default Message;