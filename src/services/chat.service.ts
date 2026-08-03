import { apiClient } from "./apiClient";

import type { AskQuestionRequest } from "../types/AskQuestionRequest";
import type { AskQuestionResponse } from "../types/AskQuestionResponse";

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