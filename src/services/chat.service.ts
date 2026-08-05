import { apiClient }
    from "./apiClient";

import type { MessageSource }
    from "../types/MessageSource";

export interface AskQuestionRequest {

    gameId: string;

    question: string;

}

export interface AskQuestionResponse {

    answer: string;

    sources: MessageSource[];

}

export class ChatService {

    async askQuestion(

        request: AskQuestionRequest

    ): Promise<AskQuestionResponse> {

        return apiClient.post<AskQuestionResponse>(

            "/api/chat",

            request

        );

    }

}

export const chatService =

    new ChatService();