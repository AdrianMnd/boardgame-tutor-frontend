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

}

export const adminService =
    new AdminService();
