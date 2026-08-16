import {
    useCallback,
    useEffect,
    useState
} from "react";

import { apiClient } from "../services/apiClient";
import { authService } from "../services/auth.service";

import type { User } from "../types/User";

const TOKEN_STORAGE_KEY = "boardgame-tutor-auth-token";

/**
 * El login es opcional en toda la app — sin cuenta, favoritos y
 * categorías siguen funcionando en localStorage como siempre
 * (ver useFavorites/useCategories). Con cuenta, se guardan en
 * el servidor y se conservan al cambiar de dispositivo.
 */
export function useAuth() {

    const [user, setUser] =
        useState<User | null>(null);

    // Se inicializa directamente a partir de si hay un token
    // guardado, en vez de fijarlo dentro del efecto — así, si
    // no hay token, nunca hace falta ningún setState síncrono
    // para "apagar" la carga (ya nace en false).
    const [isLoading, setIsLoading] =

        useState(

            () => Boolean(localStorage.getItem(TOKEN_STORAGE_KEY))

        );

    useEffect(() => {

        const token =
            localStorage.getItem(TOKEN_STORAGE_KEY);

        if (!token) {

            return;

        }

        apiClient.setToken(token);

        authService.me()

            .then(setUser)

            .catch(() => {

                localStorage.removeItem(TOKEN_STORAGE_KEY);

                apiClient.setToken(null);

            })

            .finally(() => setIsLoading(false));

    }, []);

    const login = useCallback(

        async (

            email: string,

            password: string

        ): Promise<User> => {

            const { token, user: loggedInUser } =
                await authService.login(email, password);

            localStorage.setItem(TOKEN_STORAGE_KEY, token);

            apiClient.setToken(token);

            setUser(loggedInUser);

            return loggedInUser;

        },

        []

    );

    const register = useCallback(

        async (

            email: string,

            password: string,

            displayName: string

        ): Promise<User> => {

            const { token, user: newUser } =
                await authService.register(email, password, displayName);

            localStorage.setItem(TOKEN_STORAGE_KEY, token);

            apiClient.setToken(token);

            setUser(newUser);

            return newUser;

        },

        []

    );

    const logout = useCallback(() => {

        localStorage.removeItem(TOKEN_STORAGE_KEY);

        apiClient.setToken(null);

        setUser(null);

    }, []);

    return {

        user,

        isLoading,

        login,

        register,

        logout

    };

}
