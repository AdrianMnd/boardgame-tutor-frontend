import {
    describe,
    it,
    expect,
    beforeEach
} from "vitest";

import { renderHook, act } from "@testing-library/react";

import { useFavorites } from "../useFavorites";

const STORAGE_KEY = "boardgame-tutor-favorites";

describe("useFavorites", () => {

    beforeEach(() => {

        localStorage.clear();

    });

    it("empieza sin favoritos si no hay nada guardado", () => {

        const { result } = renderHook(() => useFavorites(null));

        expect(result.current.favorites.size).toBe(0);
        expect(result.current.isFavorite("catan")).toBe(false);

    });

    it("marca un juego como favorito al alternarlo", () => {

        const { result } = renderHook(() => useFavorites(null));

        act(() => {

            result.current.toggleFavorite("catan");

        });

        expect(result.current.isFavorite("catan")).toBe(true);
        expect(result.current.favorites.has("catan")).toBe(true);

    });

    it("quita un favorito al alternarlo de nuevo", () => {

        const { result } = renderHook(() => useFavorites(null));

        act(() => {

            result.current.toggleFavorite("catan");

        });

        expect(result.current.isFavorite("catan")).toBe(true);

        act(() => {

            result.current.toggleFavorite("catan");

        });

        expect(result.current.isFavorite("catan")).toBe(false);

    });

    it("permite varios favoritos independientes a la vez", () => {

        const { result } = renderHook(() => useFavorites(null));

        act(() => {

            result.current.toggleFavorite("catan");
            result.current.toggleFavorite("zombicide");

        });

        expect(result.current.isFavorite("catan")).toBe(true);
        expect(result.current.isFavorite("zombicide")).toBe(true);
        expect(result.current.isFavorite("nemesis")).toBe(false);
        expect(result.current.favorites.size).toBe(2);

    });

    it("persiste los favoritos en localStorage", () => {

        const { result } = renderHook(() => useFavorites(null));

        act(() => {

            result.current.toggleFavorite("catan");

        });

        const stored =
            JSON.parse(

                localStorage.getItem(STORAGE_KEY) ?? "[]"

            );

        expect(stored).toEqual(["catan"]);

    });

    it("recupera los favoritos guardados en una sesión anterior", () => {

        localStorage.setItem(

            STORAGE_KEY,

            JSON.stringify(["catan", "nemesis"])

        );

        const { result } = renderHook(() => useFavorites(null));

        expect(result.current.isFavorite("catan")).toBe(true);
        expect(result.current.isFavorite("nemesis")).toBe(true);
        expect(result.current.favorites.size).toBe(2);

    });

    it("no rompe la app si localStorage tiene contenido corrupto", () => {

        localStorage.setItem(

            STORAGE_KEY,

            "esto no es JSON válido {{{"

        );

        const { result } = renderHook(() => useFavorites(null));

        // En vez de lanzar una excepción, debe arrancar sin
        // favoritos, como si no hubiera nada guardado.
        expect(result.current.favorites.size).toBe(0);

    });

    it("no rompe la app si el contenido guardado no es un array", () => {

        localStorage.setItem(

            STORAGE_KEY,

            JSON.stringify({ no: "es un array" })

        );

        const { result } = renderHook(() => useFavorites(null));

        expect(result.current.favorites.size).toBe(0);

    });

});
