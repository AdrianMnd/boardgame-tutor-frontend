import { apiClient } from "./apiClient";

import type { User } from "../types/User";

export interface AuthResponse {

    token: string;

    user: User;

}

export class AuthService {

    async register(

        email: string,

        password: string,

        displayName: string

    ): Promise<AuthResponse> {

        return apiClient.post<AuthResponse>(

            "/api/auth/register",

            { email, password, displayName }

        );

    }

    async login(

        email: string,

        password: string

    ): Promise<AuthResponse> {

        return apiClient.post<AuthResponse>(

            "/api/auth/login",

            { email, password }

        );

    }

    async me(): Promise<User> {

        return apiClient.get<User>(

            "/api/auth/me"

        );

    }

    async updateDisplayName(

        displayName: string

    ): Promise<User> {

        return apiClient.patch<User>(

            "/api/auth/me",

            { displayName }

        );

    }

    async updateEmail(

        email: string,

        currentPassword: string

    ): Promise<User> {

        return apiClient.patch<User>(

            "/api/auth/me/email",

            { email, currentPassword }

        );

    }

    async updatePassword(

        currentPassword: string,

        newPassword: string

    ): Promise<void> {

        await apiClient.patch<void>(

            "/api/auth/me/password",

            { currentPassword, newPassword }

        );

    }

}

export const authService =
    new AuthService();
