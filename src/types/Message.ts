import type { MessageSource } from "./MessageSource";

export interface Message {

    id: number;

    role: "user" | "assistant";

    content: string;

    sources?: MessageSource[];

}