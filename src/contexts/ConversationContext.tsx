import {
    createContext,
    useCallback,
    useContext,
    useEffect,
    useState
} from "react";

import type {
    ReactNode
} from "react";

import { conversationsService } from "../services/conversations.service";

import type {
    Message
} from "../types/Message";

import type {
    Conversation
} from "../types/Conversation";

import type {
    User
} from "../types/User";

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

    persistMessage: (

        gameId: string,

        role: "user" | "assistant",

        content: string,

        sources?: unknown

    ) => void;

    clearConversation: (

        gameId: string

    ) => void;

    ensureLoaded: (

        gameId: string

    ) => void;

}

const ConversationContext =
    createContext<ConversationContextType | null>(null);

const STORAGE_KEY =
    "boardgame-tutor-conversations";

function reviveConversations(

    raw: unknown

): Conversation[] {

    if (!Array.isArray(raw)) {

        return [];

    }

    return raw.map(conversation => ({

        ...conversation,

        messages: Array.isArray(conversation?.messages)

            ? conversation.messages.map(

                (message: Message) => ({

                    ...message,

                    createdAt:

                        message.createdAt

                            ? new Date(message.createdAt)

                            : message.createdAt

                })

            )

            : []

    }));

}

function readLocalConversations(): Conversation[] {

    try {

        const stored =

            localStorage.getItem(

                STORAGE_KEY

            );

        if (!stored) {

            return [];

        }

        return reviveConversations(

            JSON.parse(stored)

        );

    }

    catch {

        return [];

    }

}

export function ConversationProvider({

    children,

    user

}: {

    children: ReactNode;

    user: User | null;

}) {

    const [
        conversations,
        setConversations
    ] = useState<Conversation[]>(

        () =>

            user

                ? []

                : readLocalConversations()

    );

    const [loadedGameIds, setLoadedGameIds] =
        useState<Set<string>>(new Set());

    if (!user && loadedGameIds.size > 0) {

        setLoadedGameIds(new Set());

        setConversations(readLocalConversations());

    }

    useEffect(() => {

        if (user) {

            return;

        }

        try {

            localStorage.setItem(

                STORAGE_KEY,

                JSON.stringify(

                    conversations

                )

            );

        }
        catch {

            // localStorage lleno, deshabilitado o no disponible:
            // se ignora — la conversación se sigue viendo en
            // esta sesión, simplemente no persiste para la
            // próxima.

        }

    }, [

        conversations,

        user

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

    const persistMessage = useCallback(

        (

            gameId: string,

            role: "user" | "assistant",

            content: string,

            sources?: unknown

        ) => {

            if (!user) {

                return;

            }

            conversationsService

                .addMessage(gameId, role, content, sources)

                .catch(() => {});

        },

        [user]

    );

    function clearConversation(

        gameId: string

    ) {

        setConversations(previous =>

            previous.filter(

                conversation =>
                    conversation.gameId !== gameId

            )

        );

        if (user) {

            conversationsService

                .clear(gameId)

                .catch(() => {});

        }

    }

    const ensureLoaded = useCallback(

        (gameId: string) => {

            if (!user || loadedGameIds.has(gameId)) {

                return;

            }

            setLoadedGameIds(previous => {

                const next = new Set(previous);

                next.add(gameId);

                return next;

            });

            conversationsService

                .list(gameId)

                .then(apiMessages => {

                    const messages: Message[] =

                        apiMessages.map(message => ({

                            id: message.id,

                            role: message.role,

                            content: message.content,

                            sources:

                                message.sources as Message["sources"],

                            createdAt: new Date(message.createdAt)

                        }));

                    setConversations(previous => {

                        const withoutThisGame =

                            previous.filter(

                                item => item.gameId !== gameId

                            );

                        return [

                            ...withoutThisGame,

                            { gameId, messages }

                        ];

                    });

                })

                .catch(() => {});

        },

        [user, loadedGameIds]

    );

    return (

        <ConversationContext.Provider

            value={{

                conversations,

                getMessages,

                addMessage,

                updateMessage,

                persistMessage,

                clearConversation,

                ensureLoaded

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
