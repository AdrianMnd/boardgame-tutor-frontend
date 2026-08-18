import { apiClient } from "./apiClient";

export interface ApiConversationMessage {

    id: string;

    role: "user" | "assistant";

    content: string;

    sources?: unknown;

    createdAt: string;

}

export class ConversationsService {

    async list(

        gameId: string

    ): Promise<ApiConversationMessage[]> {

        return apiClient.get<ApiConversationMessage[]>(

            `/api/conversations/${gameId}`

        );

    }

    async addMessage(

        gameId: string,

        role: "user" | "assistant",

        content: string,

        sources?: unknown

    ): Promise<ApiConversationMessage> {

        return apiClient.post<ApiConversationMessage>(

            `/api/conversations/${gameId}/messages`,

            { role, content, sources }

        );

    }

    async clear(

        gameId: string

    ): Promise<void> {

        await apiClient.delete<void>(

            `/api/conversations/${gameId}`

        );

    }

}

export const conversationsService =
    new ConversationsService();
