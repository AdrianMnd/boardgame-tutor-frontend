import {
    describe,
    it,
    expect,
    beforeEach
} from "vitest";

import { renderHook, act, waitFor } from "@testing-library/react";

import { useNewGames } from "../useNewGames";

import type { Game } from "../../types/Game";

const STORAGE_KEY = "boardgame-tutor-last-seen-games";

function makeGame(

    overrides: Partial<Game>

): Game {

    return {

        id: "catan",

        name: "Catan",

        language: "es",

        version: "1.0",

        minPlayers: 3,

        maxPlayers: 4,

        year: 1995,

        ...overrides

    };

}

describe("useNewGames", () => {

    beforeEach(() => {

        localStorage.clear();

    });

    it("en la primera visita (sin fecha guardada), no marca ningún juego existente como nuevo", async () => {

        const games = [

            makeGame({ id: "catan", createdAt: "2020-01-01T00:00:00.000Z" }),
            makeGame({ id: "wingspan", createdAt: "2024-06-01T00:00:00.000Z" })

        ];

        const { result } = renderHook(() => useNewGames(games));

        expect(result.current.newGames).toEqual([]);

        await waitFor(() => {

            expect(localStorage.getItem(STORAGE_KEY)).not.toBeNull();

        });

    });

    it("marca como nuevo un juego añadido después de la última fecha guardada", () => {

        localStorage.setItem(STORAGE_KEY, "2024-01-01T00:00:00.000Z");

        const games = [

            makeGame({ id: "catan", name: "Catan", createdAt: "2020-01-01T00:00:00.000Z" }),
            makeGame({ id: "wingspan", name: "Wingspan", createdAt: "2024-06-01T00:00:00.000Z" })

        ];

        const { result } = renderHook(() => useNewGames(games));

        expect(result.current.newGames).toHaveLength(1);
        expect(result.current.newGames[0].name).toBe("Wingspan");

    });

    it("ordena los juegos nuevos del más reciente al más antiguo", () => {

        localStorage.setItem(STORAGE_KEY, "2024-01-01T00:00:00.000Z");

        const games = [

            makeGame({ id: "a", name: "Antiguo de los nuevos", createdAt: "2024-02-01T00:00:00.000Z" }),
            makeGame({ id: "b", name: "El más reciente", createdAt: "2024-06-01T00:00:00.000Z" })

        ];

        const { result } = renderHook(() => useNewGames(games));

        expect(result.current.newGames.map(g => g.name)).toEqual([

            "El más reciente",

            "Antiguo de los nuevos"

        ]);

    });

    it("markAllAsSeen limpia la lista de nuevos y actualiza la fecha guardada", () => {

        localStorage.setItem(STORAGE_KEY, "2024-01-01T00:00:00.000Z");

        const games = [

            makeGame({ id: "wingspan", createdAt: "2024-06-01T00:00:00.000Z" })

        ];

        const { result } = renderHook(() => useNewGames(games));

        expect(result.current.newGames).toHaveLength(1);

        act(() => {

            result.current.markAllAsSeen();

        });

        expect(result.current.newGames).toEqual([]);

        expect(localStorage.getItem(STORAGE_KEY)).not.toBe("2024-01-01T00:00:00.000Z");

    });

    it("ignora los juegos sin createdAt en vez de romper (backend antiguo desincronizado)", () => {

        localStorage.setItem(STORAGE_KEY, "2024-01-01T00:00:00.000Z");

        const games = [

            makeGame({ id: "sin-fecha", createdAt: undefined })

        ];

        const { result } = renderHook(() => useNewGames(games));

        expect(result.current.newGames).toEqual([]);

    });

});
