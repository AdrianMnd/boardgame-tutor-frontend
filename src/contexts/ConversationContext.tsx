import {
    createContext,
    useContext,
    useState
} from "react";

import type { ReactNode } from "react";

import type { Message } from "../types/Message";
import type { Conversation } from "../types/Conversation";


interface ConversationContextType {

    conversations: Conversation[];

    getMessages: (
        gameId: number
    ) => Message[];

    addMessage: (
        gameId: number,
        message: Message
    ) => void;

}


const ConversationContext =
    createContext<ConversationContextType | null>(null);



const welcomeMessage: Message = {

    id: 1,

    role: "assistant",

    content:
        "Hola. Pregúntame cualquier duda sobre este juego."

};



export function ConversationProvider({
    children
}: {
    children: ReactNode;
}) {


    const [conversations, setConversations] =
        useState<Conversation[]>([]);



    function getMessages(
        gameId: number
    ): Message[] {


        const conversation =
            conversations.find(
                item =>
                    item.gameId === gameId
            );


        if (!conversation) {

            return [
                welcomeMessage
            ];

        }


        return conversation.messages;

    }




    function addMessage(
        gameId: number,
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
                            welcomeMessage,
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



    return (

        <ConversationContext.Provider

            value={{

                conversations,

                getMessages,

                addMessage

            }}

        >

            {children}

        </ConversationContext.Provider>

    );

}



// eslint-disable-next-line react-refresh/only-export-components
export function useConversationContext() {


    const context =
        useContext(ConversationContext);



    if (!context) {

        throw new Error(
            "useConversationContext debe usarse dentro de ConversationProvider"
        );

    }


    return context;

}