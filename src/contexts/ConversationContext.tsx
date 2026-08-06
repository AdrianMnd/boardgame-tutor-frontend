import {
    createContext,
    useContext,
    useEffect,
    useState
} from "react";

import type {
    ReactNode
} from "react";

import type {
    Message
} from "../types/Message";

import type {
    Conversation
} from "../types/Conversation";

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

    clearConversation: (

        gameId: string

    ) => void;

}

const ConversationContext =
    createContext<ConversationContextType | null>(null);

const STORAGE_KEY =
    "boardgame-tutor-conversations";


export function ConversationProvider({

    children

}: {

    children: ReactNode;

}) {

    const [

        conversations,

        setConversations

    ] = useState<Conversation[]>(() => {

        try {

            const stored =

                localStorage.getItem(

                    STORAGE_KEY

                );

            if (!stored) {

                return [];

            }

            return JSON.parse(

                stored

            ) as Conversation[];

        }

        catch {

            return [];

        }

    });

    useEffect(() => {

        localStorage.setItem(

            STORAGE_KEY,

            JSON.stringify(

                conversations

            )

        );

    }, [

        conversations

    ]);

    function getMessages(

        gameId: string

    ): Message[] {

        const conversation =

            conversations.find(

                item =>

                    item.gameId === gameId

            );

        if (!conversation) {

            return [];
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

                            message

                        ]

                    }

                ];

            }

            return previous.map(item =>

                item.gameId === gameId

                    ? {

                        ...item,

                        messages: [

                            ...item.messages,

                            message

                        ]

                    }

                    : item

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

                    ? conversation

                    : {

                        ...conversation,

                        messages:

                            conversation.messages.map(current =>

                                current.id === message.id

                                    ? message

                                    : current

                            )

                    }

            )

        );

    }

    function clearConversation(

        gameId: string

    ) {

        setConversations(previous =>

            previous.filter(

                conversation =>

                    conversation.gameId !== gameId

            )

        );

    }

    return (

        <ConversationContext.Provider

            value={{

                conversations,

                getMessages,

                addMessage,

                updateMessage,

                clearConversation

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