import "./Message.css";

import ReactMarkdown
    from "react-markdown";

import remarkGfm
    from "remark-gfm";

import rehypeHighlight
    from "rehype-highlight";

import "highlight.js/styles/github-dark.css";

import type { Message as MessageType }
    from "../../types/Message";

import Sources
    from "./Sources";

import {

    useState

} from "react";

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

    async function copyAnswer() {

        await navigator.clipboard.writeText(

            message.content

        );

        setCopied(true);

        window.setTimeout(

            () =>

                setCopied(false),

            2000

        );

    }

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

                        <ReactMarkdown

                            remarkPlugins={[

                                remarkGfm

                            ]}

                            rehypePlugins={[

                                rehypeHighlight

                            ]}

                        >

                            {message.content}

                        </ReactMarkdown>

                        {

                            message.role === "assistant"

                            &&

                            <div className="message-toolbar">

                                <button

                                    onClick={copyAnswer}

                                >

                                    {

                                        copied

                                            ? "✅ Copiado"

                                            : "📋 Copiar"

                                    }

                                </button>

                            </div>

                        }

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