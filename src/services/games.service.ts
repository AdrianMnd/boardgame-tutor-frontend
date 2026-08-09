import { apiClient, API_URL } from "./apiClient";

import type { Game } from "../types/Game";

export interface ImportGameRequest {

    url: string;

}

export class GamesService {

    async listGames(): Promise<Game[]> {

        return apiClient.get<Game[]>(
            "/api/games"
        );

    }

    async importGame(

        request: ImportGameRequest

    ): Promise<void> {

        await apiClient.post<void>(

            "/api/games/import",

            request

        );

    }

    async deleteGame(

        id: string

    ): Promise<void> {

        await apiClient.delete<void>(

            `/api/games/${id}`

        );

    }

    getManualUrl(

        id: string,

        page?: number

    ): string {

        const base =
            `${API_URL}/api/games/${id}/manual`;

        return page
            ? `${base}#page=${page}`
            : base;

    }

}

export const gamesService =

    new GamesService();