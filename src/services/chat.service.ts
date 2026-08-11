import { apiClient, API_URL }
    from "./apiClient";

import { ApiError }
    from "./apiError";

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

export interface StreamChatEvents {

    onSources?: (sources: MessageSource[]) => void;

    onChunk?: (text: string) => void;

    onError?: (message: string) => void;

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

    /**
     * Igual que askQuestion, pero consumiendo la respuesta como
     * Server-Sent Events a medida que se genera (ver
     * ChatController.askStream en el backend para el protocolo
     * exacto). Los eventos se entregan por callback en vez de
     * devolverse todos de golpe, para poder ir actualizando la
     * UI fragmento a fragmento.
     */
    async askQuestionStream(

        request: AskQuestionRequest,

        events: StreamChatEvents

    ): Promise<void> {

        const response =

            await fetch(

                `${API_URL}/api/chat/stream`,

                {

                    method: "POST",

                    headers: {

                        "Content-Type": "application/json"

                    },

                    body: JSON.stringify({

                        gameId: request.gameId,

                        question: request.question

                    }),

                    signal: request.signal

                }

            );

        if (!response.ok || !response.body) {

            const text =

                await response.text().catch(() => "");

            throw new ApiError(

                response.status,

                text

            );

        }

        const reader = response.body.getReader();

        const decoder = new TextDecoder();

        let buffer = "";

        while (true) {

            const { done, value } = await reader.read();

            if (done) {

                break;

            }

            buffer += decoder.decode(value, { stream: true });

            const frames = buffer.split("\n\n");

            // El último trozo puede estar incompleto todavía.
            buffer = frames.pop() ?? "";

            for (const frame of frames) {

                this.dispatchFrame(frame, events);

            }

        }

    }

    private dispatchFrame(

        frame: string,

        events: StreamChatEvents

    ): void {

        const eventLine =

            frame.split("\n").find(

                line => line.startsWith("event:")

            );

        const dataLine =

            frame.split("\n").find(

                line => line.startsWith("data:")

            );

        if (!eventLine || !dataLine) {

            return;

        }

        const eventName =
            eventLine.slice("event:".length).trim();

        let data: unknown;

        try {

            data = JSON.parse(

                dataLine.slice("data:".length).trim()

            );

        }
        catch {

            return;

        }

        if (eventName === "sources") {

            events.onSources?.(

                data as MessageSource[]

            );

        }
        else if (eventName === "chunk") {

            events.onChunk?.(

                (data as { text: string }).text

            );

        }
        else if (eventName === "error") {

            events.onError?.(

                (data as { message: string }).message

            );

        }

    }

}

export const chatService =

    new ChatService();