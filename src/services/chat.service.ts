import axios from "axios";


const API_URL = "http://localhost:3000/api/chat";


export interface ChatResponse {

    answer: string;

}


export async function sendQuestion(
    gameId: number,
    question: string
): Promise<ChatResponse> {


    const response = await axios.post<ChatResponse>(
        API_URL,
        {
            gameId,
            question
        }
    );


    return response.data;

}