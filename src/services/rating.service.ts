import { apiClient } from "./apiClient";

export class RatingService {

    async rate(

        gameId: string,

        question: string,

        answer: string,

        rating: "up" | "down"

    ): Promise<void> {

        await apiClient.post<void>(

            "/api/ratings",

            { gameId, question, answer, rating }

        );

    }

}

export const ratingService =
    new RatingService();
