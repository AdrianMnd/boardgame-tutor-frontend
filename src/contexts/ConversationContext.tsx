import {
    createContext,
    useContext,
    useState
} from "react";

import type { ReactNode } from "react";
import { createMessageId } from "../utils/createMessageId";
import type { Message } from "../types/Message";
import type { Conversation } from "../types/Conversation";

interface ConversationContextType {

    conversations: Conversation[];

    getMessages: (
        gameId: string
    ) => Message[];

    addMessage: (
        gameId: string,
        message: Message
    ) => void;

    updateMessage: (
        gameId: string,
        message: Message
    ) => void;

}

const ConversationContext =
    createContext<ConversationContextType | null>(null);

const welcomeMessage = (): Message => ({

    id: createMessageId(),

    role: "assistant",

    content:
        "Hola. Pregúntame cualquier duda sobre este juego."

});

export function ConversationProvider({
    children
}: {
    children: ReactNode;
}) {

    const [conversations, setConversations] =
        useState<Conversation[]>([]);

    function getMessages(
        gameId: string
    ): Message[] {

        const conversation =
            conversations.find(
                item =>
                    item.gameId === gameId
            );

        if (!conversation) {

            return [
                welcomeMessage()
            ];

        }

        return conversation.messages;

    }

    function addMessage(
        gameId: string,
        message: Message
    ) {

        setConversations(previous => {

            const conversation =
                previous.find(
                    item =>
                        item.gameId === gameId
                );

            if (!conversation) {

                return [

                    ...previous,

                    {
                        gameId,

                        messages: [
                            welcomeMessage(),
                            message
                        ]
                    }

                ];

            }

            return previous.map(item =>

                item.gameId === gameId

                    ?

                    {
                        ...item,

                        messages: [
                            ...item.messages,
                            message
                        ]
                    }

                    :

                    item

            );

        });

    }

    function updateMessage(
        gameId: string,
        message: Message
    ) {

        setConversations(previous =>

            previous.map(conversation =>

                conversation.gameId !== gameId

                    ?

                    conversation

                    :

                    {

                        ...conversation,

                        messages:

                            conversation.messages.map(current =>

                                current.id === message.id

                                    ?

                                    message

                                    :

                                    current

                            )

                    }

            )

        );

    }

    return (

        <ConversationContext.Provider

            value={{

                conversations,

                getMessages,

                addMessage,

                updateMessage

            }}

        >

            {children}

        </ConversationContext.Provider>

    );

}

// eslint-disable-next-line react-refresh/only-export-components
export function useConversationContext() {

    const context =
        useContext(
            ConversationContext
        );

    if (!context) {

        throw new Error(

            "useConversationContext debe usarse dentro de ConversationProvider"

        );

    }

    return context;

}