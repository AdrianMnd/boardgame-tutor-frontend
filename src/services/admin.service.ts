import { apiClient } from "./apiClient";

export interface GameRequestListItem {

    id: string;

    requesterName: string;

    requesterEmail: string;

    gameName: string;

    bggUrl?: string;

    pdfLinks: string[];

    coverLink?: string;

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

export interface PasswordResetRequestItem {

    id: string;

    email: string;

    resolved: boolean;

    createdAt: string;

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

    async clearGameRequests(): Promise<void> {

        await apiClient.delete<void>(

            "/api/admin/game-requests"

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

    async clearRatings(): Promise<void> {

        await apiClient.delete<void>(

            "/api/admin/ratings"

        );

    }

    async listPasswordResetRequests(): Promise<PasswordResetRequestItem[]> {

        return apiClient.get<PasswordResetRequestItem[]>(

            "/api/admin/password-reset-requests"

        );

    }

    async markPasswordResetRequestResolved(

        id: string

    ): Promise<void> {

        await apiClient.patch<void>(

            `/api/admin/password-reset-requests/${id}/resolved`,

            {}

        );

    }

}

export const adminService =
    new AdminService();
