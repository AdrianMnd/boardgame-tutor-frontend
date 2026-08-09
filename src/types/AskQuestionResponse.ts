import type { MessageSource } from "./MessageSource";

export interface AskQuestionResponse {

    answer: string;

    sources: MessageSource[];

}