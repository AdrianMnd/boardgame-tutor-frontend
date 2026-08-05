import { useState } from "react";

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

        updateAssistantMessage

    } = useConversation(
        game?.id
    );

    const mutation = useMutation({

        mutationFn: (

            question: string

        ) =>

            chatService.askQuestion({

                gameId:

                    game!.id,

                question

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

            const response =

                await mutation.mutateAsync(

                    currentQuestion

                );

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

        catch {

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

        isLoading:

            mutation.isPending,

        errorMessage

    };

}