import {
    useCallback,
    useEffect,
    useState
} from "react";

import { favoritesService } from "../services/favorites.service";

import type { User } from "../types/User";

const STORAGE_KEY = "boardgame-tutor-favorites";

function readLocalFavorites(): Set<string> {

    try {

        const raw =
            localStorage.getItem(STORAGE_KEY);

        if (!raw) {

            return new Set();

        }

        const parsed = JSON.parse(raw);

        return new Set(

            Array.isArray(parsed)
                ? parsed
                : []

        );

    }
    catch {

        return new Set();

    }

}

/**
 * Juegos marcados como favoritos. Sin sesión iniciada, viven en
 * localStorage (puramente locales al navegador, como siempre).
 * Con sesión, viven en el servidor — así se conservan al
 * cambiar de dispositivo.
 */
export function useFavorites(

    user: User | null

) {

    const [favorites, setFavorites] =

        useState<Set<string>>(

            () =>

                user

                    ? new Set()

                    : readLocalFavorites()

        );

    // Recuerda para qué usuario (o "sin sesión", con null) están
    // cargados los favoritos actuales — permite detectar el
    // cambio durante el propio render en vez de en un efecto
    // (evita el aviso de "setState síncrono dentro de un
    // efecto": la rama local no tiene nada asíncrono de verdad,
    // así que no necesita ser un efecto). De paso, isLoading se
    // deriva de esto en vez de ser su propio estado — así no
    // hace falta ningún setState solo para marcarlo, ni al
    // principio del efecto ni fuera de él.
    const [loadedFor, setLoadedFor] =
        useState<string | null>(user?.id ?? null);

    const isLoading =
        Boolean(user) && loadedFor !== (user?.id ?? null);

    if (!user && loadedFor !== null) {

        setLoadedFor(null);

        setFavorites(readLocalFavorites());

    }

    // La carga desde la API sí es un efecto de verdad (una
    // petición de red), así que se queda aquí — pero ya no
    // llama a setState de forma síncrona al principio, solo
    // dentro de los callbacks async (.then/.catch).
    useEffect(() => {

        if (!user || loadedFor === user.id) {

            return;

        }

        let cancelled = false;

        favoritesService.list()

            .then(gameIds => {

                if (!cancelled) {

                    setFavorites(new Set(gameIds));

                    setLoadedFor(user.id);

                }

            })

            .catch(() => {

                if (!cancelled) {

                    // Se marca como "cargado" igualmente, para
                    // no reintentar en bucle si el servidor
                    // sigue fallando — el usuario puede
                    // reintentar marcando/desmarcando algo.
                    setLoadedFor(user.id);

                }

            });

        return () => {

            cancelled = true;

        };

    }, [user, loadedFor]);

    useEffect(() => {

        if (user) {

            return;

        }

        try {

            localStorage.setItem(

                STORAGE_KEY,

                JSON.stringify([...favorites])

            );

        }
        catch {

            // Almacenamiento lleno o no disponible: se ignora.

        }

    }, [favorites, user]);

    const isFavorite = useCallback(

        (gameId: string) =>

            favorites.has(gameId),

        [favorites]

    );

    const toggleFavorite = useCallback(

        (gameId: string) => {

            const wasFavorite = favorites.has(gameId);

            setFavorites(previous => {

                const next = new Set(previous);

                if (next.has(gameId)) {

                    next.delete(gameId);

                }
                else {

                    next.add(gameId);

                }

                return next;

            });

            if (!user) {

                return;

            }

            const request =

                wasFavorite

                    ? favoritesService.remove(gameId)

                    : favoritesService.add(gameId);

            request.catch(() => {

                setFavorites(previous => {

                    const next = new Set(previous);

                    if (wasFavorite) {

                        next.add(gameId);

                    }
                    else {

                        next.delete(gameId);

                    }

                    return next;

                });

            });

        },

        [favorites, user]

    );

    const migrateLocalFavorites = useCallback(

        async (): Promise<void> => {

            const local = readLocalFavorites();

            if (local.size === 0) {

                return;

            }

            await Promise.all(

                [...local].map(

                    gameId => favoritesService.add(gameId)

                )

            );

            localStorage.removeItem(STORAGE_KEY);

            setFavorites(local);

        },

        []

    );

    return {

        favorites,

        isFavorite,

        toggleFavorite,

        isLoading,

        migrateLocalFavorites

    };

}
