import { useState, useRef } from "react";

import { chatService } from "../services/chat.service";

import { useConversation } from "./useConversation";

import type { Game } from "../types/Game";
import type { Message } from "../types/Message";

import { ApiError }
    from "../services/apiError";

export function useChat(
    game: Game | null,
    playerCount: number | null = null
) {

    const [

        question,

        setQuestion

    ] = useState("");

    const [

        errorMessage,

        setErrorMessage

    ] = useState<string | null>(null);

    const [

        isLoading,

        setIsLoading

    ] = useState(false);

    const {

        messages,

        addUserMessage,

        addLoadingMessage,

        updateAssistantMessage,

        finalizeAssistantMessage,

        startNewConversation

    } = useConversation(
        game?.id
    );

    const abortController =

    useRef<AbortController | null>(

        null

    );

    async function sendMessage() {

        if (

            !question.trim()

            ||

            !game

            ||

            isLoading

        ) {

            return;

        }

        const currentQuestion =

            question.trim();

        // Se construye ANTES de añadir la pregunta actual a la
        // conversación — es el historial previo, no incluye la
        // propia pregunta que se está mandando ahora (esa va
        // aparte, en su propio campo). Se descartan los mensajes
        // sin contenido real (la burbuja de "Pensando...") y
        // cualquier error o cancelación sin texto útil.
        const history =

            messages

                .filter(

                    message =>

                        !message.isLoading &&
                        message.content.trim().length > 0

                )

                .map(message => ({

                    role: message.role,

                    content: message.content

                }));

        addUserMessage(

            currentQuestion

        );

        setQuestion("");

        const loadingMessage =

            addLoadingMessage();

        if (!loadingMessage) {

            return;

        }

        setIsLoading(true);

        setErrorMessage(null);

        let content = "";

        let sources: Message["sources"] = [];

        try {

            abortController.current =

                new AbortController();

            await chatService.askQuestionStream(

                {

                    gameId:

                        game.id,

                    question:

                        currentQuestion,

                    history,

                    playerCount:

                        playerCount ?? undefined,

                    signal:

                        abortController.current.signal

                },

                {

                    onSources: receivedSources => {

                        sources = receivedSources;

                    },

                    onChunk: text => {

                        content += text;

                        updateAssistantMessage({

                            ...loadingMessage,

                            content,

                            sources,

                            isLoading: false

                        });

                    },

                    onError: message => {

                        throw new Error(message);

                    }

                }

            );

            if (!content) {

                // El stream terminó sin ningún fragmento de
                // texto (raro, pero por seguridad no se deja
                // el mensaje colgado en "Pensando...").
                finalizeAssistantMessage({

                    ...loadingMessage,

                    content:

                        "No he podido generar una respuesta.",

                    sources,

                    isLoading: false

                });

            }
            else {

                // El streaming terminó con contenido real — esta
                // es la versión definitiva de la respuesta, así
                // que aquí (y solo aquí, no en cada fragmento
                // intermedio de onChunk) se guarda de verdad.
                finalizeAssistantMessage({

                    ...loadingMessage,

                    content,

                    sources,

                    isLoading: false

                });

            }

        }
        catch (error) {

            if (

                error instanceof DOMException

                &&

                error.name === "AbortError"

            ) {

                finalizeAssistantMessage({

                    ...loadingMessage,

                    content:

                        content || "Respuesta cancelada.",

                    sources,

                    isLoading: false

                });

                setIsLoading(false);

                return;

            }

            const message =

                error instanceof ApiError

                &&

                typeof error.body === "string"

                &&

                error.body

                    ? error.body

                    : error instanceof Error

                        ? error.message

                        : "No se pudo obtener respuesta del servidor.";

            setErrorMessage(message);

            finalizeAssistantMessage({

                ...loadingMessage,

                content:

                    content || "Lo siento, ha ocurrido un error.",

                sources,

                isLoading: false

            });

        }
        finally {

            setIsLoading(false);

        }

    }

    function cancelGeneration() {

    abortController.current?.abort();

}

    function handleQuestionKeyDown(
        event: React.KeyboardEvent<HTMLTextAreaElement>
    ) {

        if (

            event.key !== "Enter"

            ||

            event.shiftKey

        ) {

            return;

        }

        event.preventDefault();

        void sendMessage();

    }

    return {

        messages,

        question,

        setQuestion,

        sendMessage,

        handleQuestionKeyDown,

        startNewConversation,

        cancelGeneration,

        isLoading,

        errorMessage

    };

}
