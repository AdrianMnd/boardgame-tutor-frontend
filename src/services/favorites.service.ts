import { apiClient } from "./apiClient";

export class FavoritesService {

    async list(): Promise<string[]> {

        const result =

            await apiClient.get<{ gameIds: string[] }>(

                "/api/favorites"

            );

        return result.gameIds;

    }

    async add(

        gameId: string

    ): Promise<void> {

        await apiClient.post<void>(

            `/api/favorites/${gameId}`,

            {}

        );

    }

    async remove(

        gameId: string

    ): Promise<void> {

        await apiClient.delete<void>(

            `/api/favorites/${gameId}`

        );

    }

}

export const favoritesService =
    new FavoritesService();
