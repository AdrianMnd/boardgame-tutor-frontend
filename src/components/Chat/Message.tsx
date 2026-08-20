import "./Message.css";

import { useState } from "react";

import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

import Avatar from "../UI/Avatar";
import Icon from "../UI/Icon";
import Sources from "./Sources";

import { ratingService } from "../../services/rating.service";

import {
    Clock3,
    Copy,
    Check,
    ThumbsUp,
    ThumbsDown
} from "lucide-react";

import type {
    Message as MessageType
} from "../../types/Message";

interface Props {

    message: MessageType;

    /**
     * Opcionales — solo hacen falta para poder valorar la
     * respuesta (👍/👎). Sin ellos (por ejemplo, si algún día se
     * usa este componente en otro contexto), los botones de
     * valoración simplemente no se muestran.
     */
    gameId?: string;

    question?: string;

    onOpenSource?: (

        page: number,

        documentId?: string

    ) => void;

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

    message,

    gameId,

    question,

    onOpenSource

}: Props) {

    const [rated, setRated] =
        useState<"up" | "down" | null>(null);

    function rate(

        value: "up" | "down"

    ) {

        if (!gameId || !question || rated) {

            return;

        }

        // Actualización optimista — se ve el cambio al instante,
        // sin esperar a la petición. Es una señal de feedback de
        // bajo riesgo, no algo crítico: si la petición fallara
        // en segundo plano, no merece la pena complicar la
        // interfaz para reflejarlo ni pedir que se reintente.
        setRated(value);

        ratingService

            .rate(gameId, question, message.content, value)

            .catch(() => {});

    }

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

                                    onOpenSource={

                                        onOpenSource

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

                                    {

                                        gameId && question && (

                                            <div

                                                className="message-rating"

                                                role="group"

                                                aria-label="Valorar esta respuesta"

                                            >

                                                <button

                                                    className={

                                                        rated === "up"

                                                            ? "message-rating-button active"

                                                            : "message-rating-button"

                                                    }

                                                    onClick={() => rate("up")}

                                                    disabled={rated !== null}

                                                    aria-label="Respuesta útil"

                                                    aria-pressed={rated === "up"}

                                                >

                                                    <Icon icon={ThumbsUp} size={15} />

                                                </button>

                                                <button

                                                    className={

                                                        rated === "down"

                                                            ? "message-rating-button active"

                                                            : "message-rating-button"

                                                    }

                                                    onClick={() => rate("down")}

                                                    disabled={rated !== null}

                                                    aria-label="Respuesta no útil"

                                                    aria-pressed={rated === "down"}

                                                >

                                                    <Icon icon={ThumbsDown} size={15} />

                                                </button>

                                                {

                                                    rated && (

                                                        <span className="message-rating-thanks">

                                                            ¡Gracias!

                                                        </span>

                                                    )

                                                }

                                            </div>

                                        )

                                    }

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