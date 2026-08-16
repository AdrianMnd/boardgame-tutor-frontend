import { apiClient } from "./apiClient";

export interface ApiCategory {

    id: string;

    name: string;

    gameIds: string[];

}

export class CategoriesService {

    async list(): Promise<ApiCategory[]> {

        return apiClient.get<ApiCategory[]>(

            "/api/categories"

        );

    }

    async create(

        name: string

    ): Promise<ApiCategory> {

        return apiClient.post<ApiCategory>(

            "/api/categories",

            { name }

        );

    }

    async rename(

        categoryId: string,

        name: string

    ): Promise<void> {

        await apiClient.patch<void>(

            `/api/categories/${categoryId}`,

            { name }

        );

    }

    async delete(

        categoryId: string

    ): Promise<void> {

        await apiClient.delete<void>(

            `/api/categories/${categoryId}`

        );

    }

    async addGame(

        categoryId: string,

        gameId: string

    ): Promise<void> {

        await apiClient.post<void>(

            `/api/categories/${categoryId}/games/${gameId}`,

            {}

        );

    }

    async removeGame(

        categoryId: string,

        gameId: string

    ): Promise<void> {

        await apiClient.delete<void>(

            `/api/categories/${categoryId}/games/${gameId}`

        );

    }

}

export const categoriesService =
    new CategoriesService();
