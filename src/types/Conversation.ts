import type { Message } from "./Message";

export interface Conversation {

    gameId: string;

    messages: Message[];

}