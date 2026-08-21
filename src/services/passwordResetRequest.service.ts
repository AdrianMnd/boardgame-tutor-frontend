import { apiClient } from "./apiClient";

export class PasswordResetRequestService {

    async request(

        email: string

    ): Promise<void> {

        await apiClient.post<void>(

            "/api/password-reset-requests",

            { email }

        );

    }

}

export const passwordResetRequestService =
    new PasswordResetRequestService();
