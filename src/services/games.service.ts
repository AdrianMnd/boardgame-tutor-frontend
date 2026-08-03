import { apiClient } from "./apiClient";

import type { Game } from "../types/Game";

export class GameService {

    async getGames(): Promise<Game[]> {

        return apiClient.get<Game[]>(

            "/api/games"

        );

    }

}

export const gameService =
    new GameService();