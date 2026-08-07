import "./Message.css";

import { useState } from "react";

import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeHighlight from "rehype-highlight";

import "highlight.js/styles/github-dark.css";

import Avatar from "../UI/Avatar";
import Icon from "../UI/Icon";
import Sources from "./Sources";

import {
    Clock3,
    Copy,
    Check
} from "lucide-react";

import type {
    Message as MessageType
} from "../../types/Message";

interface Props {

    message: MessageType;

}

function formatTime(

    value: Date | string | undefined

): string | null {

    if (!value) {

        return null;

    }

    const date =

        value instanceof Date

            ? value

            : new Date(value);

    if (Number.isNaN(date.getTime())) {

        return null;

    }

    return date.toLocaleTimeString(

        [],

        {

            hour: "2-digit",

            minute: "2-digit"

        }

    );

}

function Message({

    message

}: Props) {

    const [

        copied,

        setCopied

    ] = useState(false);

    const time = formatTime(message.createdAt);

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

                    <div className="message-author">

                        <strong>

                            {

                                assistant

                                    ? "BoardGame Tutor"

                                    : "Tú"

                            }

                        </strong>

                    </div>

                    {

                        time && (

                            <div className="message-time">

                                <Icon

                                    icon={Clock3}

                                    size={14}

                                />

                                {time}

                            </div>

                        )

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

                            assistant && (

                                <Sources

                                    sources={

                                        message.sources ?? []

                                    }

                                />

                            )

                        }

                        {

                            assistant && (

                                <footer className="message-toolbar">

                                    <button

                                        onClick={copy}

                                    >

                                        <Icon

                                            icon={

                                                copied

                                                    ? Check

                                                    : Copy

                                            }

                                            size={16}

                                        />

                                        {

                                            copied

                                                ? "Copiado"

                                                : "Copiar respuesta"

                                        }

                                    </button>

                                </footer>

                            )

                        }

                    </>

                }

            </div>

        </article>

    );

}

export default Message;