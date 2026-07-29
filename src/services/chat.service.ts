import axios from "axios";

const API_URL = "http://localhost:3000/api/chat";


interface ChatResponse {
    answer: string;
}


export async function sendQuestion(
    game: string,
    question: string
): Promise<ChatResponse> {

    const response = await axios.post<ChatResponse>(
        API_URL,
        {
            game,
            question
        }
    );

    return response.data;
}