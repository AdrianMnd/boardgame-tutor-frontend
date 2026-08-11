import { useState, useRef } from "react";

import { chatService } from "../services/chat.service";

import { useConversation } from "./useConversation";

import type { Game } from "../types/Game";
import type { Message } from "../types/Message";

import { ApiError }
    from "../services/apiError";

export function useChat(
    game: Game | null
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
                updateAssistantMessage({

                    ...loadingMessage,

                    content:

                        "No he podido generar una respuesta.",

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

                updateAssistantMessage({

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

            updateAssistantMessage({

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
