export interface AskQuestionResponse {

    answer: string;

    sources: {

        id: string;

        gameId: string;

        page: number;

        score: number;

        text: string;

    }[];

}