import { apiClient }
    from "./apiClient";

import type { MessageSource }
    from "../types/MessageSource";

export interface AskQuestionRequest {

    gameId: string;

    question: string;

    signal?: AbortSignal;

}

export interface AskQuestionResponse {

    answer: string;

    sources: MessageSource[];

}

export class ChatService {

    async askQuestion(

    request: AskQuestionRequest

): Promise<AskQuestionResponse> {

    const {

        signal,

        ...body

    } = request;

    return apiClient.post<AskQuestionResponse>(

        "/api/chat",

        body,

        signal

    );

}

}

export const chatService =

    new ChatService();