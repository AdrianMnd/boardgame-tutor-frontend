import {
    useCallback,
    useMemo,
    useState
} from "react";

import type { Game } from "../types/Game";

const STORAGE_KEY =
    "boardgame-tutor-last-seen-games";

/**
 * Solo local en este dispositivo, a propósito — no viaja con la
 * cuenta. Es una marca de "hasta aquí ya lo he visto", no un
 * dato de la cuenta en sí, así que no hacía falta la
 * complejidad de sincronizarlo con el backend.
 */
export function useNewGames(

    games: Game[]

) {

    const [lastSeenAt, setLastSeenAt] =

        useState<string | null>(

            () => {

                try {

                    return localStorage.getItem(STORAGE_KEY);

                }
                catch {

                    return null;

                }

            }

        );

    const markAllAsSeen = useCallback(() => {

        const now = new Date().toISOString();

        try {

            localStorage.setItem(STORAGE_KEY, now);

        }
        catch {

            // localStorage no disponible: el aviso de "nuevos"
            // simplemente no se recordará entre visitas en este
            // dispositivo, sin romper nada más.

        }

        setLastSeenAt(now);

    }, []);

    // La primera vez que se usa la app en este dispositivo no
    // hay ninguna fecha guardada — se toma "ahora" como punto de
    // partida, para no marcar de golpe TODO el catálogo actual
    // como "nuevo". Se ajusta aquí, durante el render (la propia
    // condición evita cualquier bucle: en cuanto deja de ser
    // null, deja de cumplirse), en vez de en un efecto.
    if (lastSeenAt === null) {

        markAllAsSeen();

    }

    const newGames = useMemo(() => {

        if (!lastSeenAt) {

            return [];

        }

        return games

            .filter(

                game =>

                    game.createdAt &&
                    game.createdAt > lastSeenAt

            )

            .sort(

                (a, b) =>

                    (b.createdAt ?? "").localeCompare(

                        a.createdAt ?? ""

                    )

            );

    }, [games, lastSeenAt]);

    return {

        newGames,

        markAllAsSeen

    };

}
