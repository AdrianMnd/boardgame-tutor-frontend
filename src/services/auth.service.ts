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

}

export const authService =
    new AuthService();
