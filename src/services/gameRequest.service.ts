import { apiClient } from "./apiClient";

export interface GameRequestInput {

    gameName: string;

    bggUrl?: string;

    files: File[];

}

export class GameRequestService {

    async submit(

        input: GameRequestInput

    ): Promise<void> {

        const formData = new FormData();

        formData.append("gameName", input.gameName);

        if (input.bggUrl) {

            formData.append("bggUrl", input.bggUrl);

        }

        for (const file of input.files) {

            formData.append("pdfs", file);

        }

        await apiClient.postFormData<void>(

            "/api/game-requests",

            formData

        );

    }

}

export const gameRequestService =
    new GameRequestService();
