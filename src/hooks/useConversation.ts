import {
    useConversationContext
} from "../contexts/ConversationContext";

import type { MessageSource } from "../types/MessageSource";


export function useConversation(
    gameId: string | undefined
) {


    const {
        getMessages,
        addMessage
    } = useConversationContext();



    const messages =
        gameId
            ? getMessages(gameId)
            : [];




    function addUserMessage(
        content: string
    ) {

        if (!gameId) return;


        addMessage(

            gameId,

            {
                id: Date.now(),

                role: "user",

                content

            }

        );

    }




    function addAssistantMessage(
        content: string,
        sources: MessageSource[] = []
    ) {

        if (!gameId) return;


        addMessage(

            gameId,

            {
                id: Date.now(),

                role: "assistant",

                content,

                sources

            }

        );

    }



    return {

        messages,

        addUserMessage,

        addAssistantMessage

    };

}