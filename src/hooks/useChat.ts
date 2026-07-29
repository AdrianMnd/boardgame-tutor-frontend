import { useState } from "react";

import { useMutation } from "@tanstack/react-query";

import { sendQuestion } from "../services/chat.service";

import { useConversation } from "./useConversation";

import type { Game } from "../types/Game";


export function useChat(
    game: Game | null
) {


    const [question, setQuestion] =
        useState("");



    const [errorMessage, setErrorMessage] =
        useState<string | null>(null);



    const {

        messages,

        addUserMessage,

        addAssistantMessage

    } = useConversation(game?.id);




    const mutation = useMutation({


        mutationFn: ({

            gameId,

            question

        }: {

            gameId: number;

            question: string;

        }) =>

            sendQuestion(
                gameId,
                question
            ),



        onError: () => {


            setErrorMessage(
                "No se pudo obtener respuesta del servidor."
            );


        },


        onSuccess: () => {


            setErrorMessage(null);


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



        try {


            const response =
                await mutation.mutateAsync({


                    gameId: game.id,


                    question:
                        currentQuestion


                });



            addAssistantMessage(
                response.answer
            );


        }

        catch {


            addAssistantMessage(
                "Lo siento, ha ocurrido un error."
            );


        }


    }




    return {


        messages,


        question,


        setQuestion,


        sendMessage,


        isLoading:
            mutation.isPending,


        errorMessage


    };


}