import {
    useConversationContext
} from "../contexts/ConversationContext";


export function useConversation(
    gameId: number | undefined
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
        content: string
    ) {

        if (!gameId) return;


        addMessage(

            gameId,

            {
                id: Date.now(),

                role: "assistant",

                content

            }

        );

    }



    return {

        messages,

        addUserMessage,

        addAssistantMessage

    };

}