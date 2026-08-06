import { useState, useRef } from "react";

import { useMutation } from "@tanstack/react-query";

import { chatService } from "../services/chat.service";

import { useConversation } from "./useConversation";

import type { Game } from "../types/Game";

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

    const mutation = useMutation({

        mutationFn: (

    request: {

        question: string;

        signal: AbortSignal;

    }

) =>

    chatService.askQuestion({

        gameId:

            game!.id,

        question:

            request.question,

        signal:

            request.signal

    }),

        onSuccess: () => {

            setErrorMessage(
                null
            );

        },

        onError: (

    error

) => {

    if (

        error instanceof ApiError

    ) {

        if (

            typeof error.body === "string"

        ) {

            setErrorMessage(

                error.body

            );

            return;

        }

    }

    setErrorMessage(

        "No se pudo obtener respuesta del servidor."

    );

}

    });

    async function sendMessage() {

        if (

            !question.trim()

            ||

            !game

            ||

            mutation.isPending

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

        try {

            abortController.current =

                new AbortController();

            const response =

            await mutation.mutateAsync({

                question:

                    currentQuestion,

                signal:

                    abortController.current.signal

            });

            updateAssistantMessage({

                ...loadingMessage,

                content:

                    response.answer,

                sources:

                    response.sources,

                isLoading:

                    false

            });

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

                "Respuesta cancelada.",

            isLoading:

                false

        });

        return;

    }

    updateAssistantMessage({

        ...loadingMessage,

        content:

            errorMessage

            ??

            "Lo siento, ha ocurrido un error.",

        isLoading:

            false

    });

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

        isLoading:

            mutation.isPending,

        errorMessage

    };

}