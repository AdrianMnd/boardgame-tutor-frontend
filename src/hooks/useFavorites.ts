import {
    useCallback,
    useEffect,
    useState
} from "react";

const STORAGE_KEY = "boardgame-tutor-favorites";

function readFavorites(): Set<string> {

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

        // localStorage no disponible, o contenido corrupto:
        // se empieza sin favoritos en vez de romper la app.
        return new Set();

    }

}

/**
 * Juegos marcados como favoritos por el usuario, persistidos en
 * localStorage — no hay backend de por medio, son preferencias
 * puramente locales al navegador.
 */
export function useFavorites() {

    const [favorites, setFavorites] =

        useState<Set<string>>(
            () => readFavorites()
        );

    useEffect(() => {

        try {

            localStorage.setItem(

                STORAGE_KEY,

                JSON.stringify([...favorites])

            );

        }
        catch {

            // Almacenamiento lleno o no disponible: se ignora,
            // los favoritos simplemente no persistirán esta vez.

        }

    }, [favorites]);

    const isFavorite = useCallback(

        (gameId: string) =>

            favorites.has(gameId),

        [favorites]

    );

    const toggleFavorite = useCallback(

        (gameId: string) => {

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

        },

        []

    );

    return {

        favorites,

        isFavorite,

        toggleFavorite

    };

}
