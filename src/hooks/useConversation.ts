import { useEffect } from "react";

import {
    useConversationContext
} from "../contexts/ConversationContext";

import { createMessageId }
    from "../utils/createMessageId";

import type {
    Message
} from "../types/Message";

import type {
    MessageSource
} from "../types/MessageSource";

export function useConversation(

    gameId: string | undefined

) {

    const {

        getMessages,

        addMessage,

        updateMessage,

        persistMessage,

        clearConversation,

        ensureLoaded

    } = useConversationContext();

    useEffect(() => {

        if (gameId) {

            ensureLoaded(gameId);

        }

    }, [gameId, ensureLoaded]);

    const messages =

        gameId

            ? getMessages(

                gameId

            )

            : [];

    function addUserMessage(

        content: string

    ) {

        if (!gameId) {

            return;

        }

        addMessage(

            gameId,

            {

                id:

                    createMessageId(),

                role:

                    "user",

                content,

                createdAt:

                    new Date()

            }

        );

        persistMessage(gameId, "user", content);

    }

    function addAssistantMessage(

        content: string,

        sources: MessageSource[] = []

    ) {

        if (!gameId) {

            return null;

        }

        const message: Message = {

            id:

                createMessageId(),

            role:

                "assistant",

            content,

            sources,

            createdAt:

                new Date()

        };

        addMessage(

            gameId,

            message

        );

        return message;

    }

    function addLoadingMessage() {

        if (!gameId) {

            return null;

        }

        const message: Message = {

            id:

                createMessageId(),

            role:

                "assistant",

            content:

                "Pensando...",

            isLoading:

                true,

            createdAt:

                new Date()

        };

        addMessage(

            gameId,

            message

        );

        return message;

    }

    function updateAssistantMessage(

        message: Message

    ) {

        if (!gameId) {

            return;

        }

        updateMessage(

            gameId,

            message

        );

    }

    function finalizeAssistantMessage(

        message: Message

    ) {

        if (!gameId) {

            return;

        }

        updateMessage(

            gameId,

            message

        );

        persistMessage(

            gameId,

            "assistant",

            message.content,

            message.sources

        );

    }

    function startNewConversation() {

        if (!gameId) {

            return;

        }

        clearConversation(

            gameId

        );

    }

    return {

        messages,

        addUserMessage,

        addAssistantMessage,

        addLoadingMessage,

        updateAssistantMessage,

        finalizeAssistantMessage,

        startNewConversation

    };

}
