import type {

    MessageSource

} from "./MessageSource";

export interface Message {

    id: string;

    role: "user" | "assistant";

    content: string;

    createdAt: Date;

    isLoading?: boolean;

    sources?: MessageSource[];

}