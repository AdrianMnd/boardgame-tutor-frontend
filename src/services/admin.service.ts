import { apiClient } from "./apiClient";

export interface GameRequestListItem {

    id: string;

    requesterName: string;

    requesterEmail: string;

    gameName: string;

    bggUrl?: string;

    pdfLinks: string[];

    reviewed: boolean;

    createdAt: string;

}

export interface RatingSummaryByGame {

    gameId: string;

    gameName: string;

    up: number;

    down: number;

}

export interface RecentNegativeRating {

    gameId: string;

    gameName: string;

    question: string;

    answer: string;

    createdAt: string;

}

export interface RatingsSummary {

    byGame: RatingSummaryByGame[];

    recentNegative: RecentNegativeRating[];

}

export class AdminService {

    async listGameRequests(): Promise<GameRequestListItem[]> {

        return apiClient.get<GameRequestListItem[]>(

            "/api/admin/game-requests"

        );

    }

    async markGameRequestReviewed(

        id: string

    ): Promise<void> {

        await apiClient.patch<void>(

            `/api/admin/game-requests/${id}/reviewed`,

            {}

        );

    }

    async resetUserPassword(

        email: string

    ): Promise<string> {

        const result =

            await apiClient.post<{ temporaryPassword: string }>(

                "/api/admin/users/reset-password",

                { email }

            );

        return result.temporaryPassword;

    }

    async getRatingsSummary(): Promise<RatingsSummary> {

        return apiClient.get<RatingsSummary>(

            "/api/admin/ratings/summary"

        );

    }

}

export const adminService =
    new AdminService();
