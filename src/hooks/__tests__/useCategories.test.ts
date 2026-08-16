import {
    describe,
    it,
    expect,
    beforeEach
} from "vitest";

import { renderHook, act } from "@testing-library/react";

import { useCategories } from "../useCategories";

const STORAGE_KEY = "boardgame-tutor-categories";

describe("useCategories", () => {

    beforeEach(() => {

        localStorage.clear();

    });

    it("empieza sin categorías si no hay nada guardado", () => {

        const { result } = renderHook(() => useCategories(null));

        expect(result.current.categories).toEqual([]);

    });

    it("crea una categoría nueva, vacía", async () => {

        const { result } = renderHook(() => useCategories(null));

        await act(async () => {

            await result.current.createCategory("Juegos de cartas");

        });

        expect(result.current.categories).toHaveLength(1);
        expect(result.current.categories[0].name).toBe("Juegos de cartas");
        expect(result.current.categories[0].gameIds).toEqual([]);

    });

    it("createCategory devuelve el id de la categoría creada, para poder usarlo enseguida", async () => {

        const { result } = renderHook(() => useCategories(null));

        let categoryId = "";

        await act(async () => {

            categoryId = await result.current.createCategory("Cooperativos");

        });

        expect(categoryId).not.toBe("");
        expect(result.current.categories[0].id).toBe(categoryId);

    });

    it("añade un juego a una categoría", async () => {

        const { result } = renderHook(() => useCategories(null));

        let categoryId = "";

        await act(async () => {

            categoryId = await result.current.createCategory("Cartas");

        });

        act(() => {

            result.current.toggleGameInCategory(categoryId, "arkhamlcg");

        });

        expect(

            result.current.isGameInCategory(categoryId, "arkhamlcg")

        ).toBe(true);

        expect(result.current.categories[0].gameIds).toEqual(["arkhamlcg"]);

    });

    it("quita un juego de una categoría al alternarlo de nuevo", async () => {

        const { result } = renderHook(() => useCategories(null));

        let categoryId = "";

        await act(async () => {

            categoryId = await result.current.createCategory("Cartas");

        });

        act(() => {

            result.current.toggleGameInCategory(categoryId, "arkhamlcg");

        });

        act(() => {

            result.current.toggleGameInCategory(categoryId, "arkhamlcg");

        });

        expect(

            result.current.isGameInCategory(categoryId, "arkhamlcg")

        ).toBe(false);

    });

    it("un mismo juego puede pertenecer a varias categorías a la vez", async () => {

        const { result } = renderHook(() => useCategories(null));

        let cartasId = "";
        let cooperativosId = "";

        await act(async () => {

            cartasId = await result.current.createCategory("Cartas");
            cooperativosId = await result.current.createCategory("Cooperativos");

        });

        act(() => {

            result.current.toggleGameInCategory(cartasId, "arkhamlcg");
            result.current.toggleGameInCategory(cooperativosId, "arkhamlcg");

        });

        expect(result.current.isGameInCategory(cartasId, "arkhamlcg")).toBe(true);
        expect(result.current.isGameInCategory(cooperativosId, "arkhamlcg")).toBe(true);

    });

    it("cambiar un juego en una categoría no afecta a las demás", async () => {

        const { result } = renderHook(() => useCategories(null));

        let cartasId = "";
        let cooperativosId = "";

        await act(async () => {

            cartasId = await result.current.createCategory("Cartas");
            cooperativosId = await result.current.createCategory("Cooperativos");

        });

        act(() => {

            result.current.toggleGameInCategory(cartasId, "catan");

        });

        expect(result.current.isGameInCategory(cartasId, "catan")).toBe(true);
        expect(result.current.isGameInCategory(cooperativosId, "catan")).toBe(false);
        expect(result.current.categories.find(c => c.id === cooperativosId)?.gameIds).toEqual([]);

    });

    it("renombra una categoría sin tocar sus juegos", async () => {

        const { result } = renderHook(() => useCategories(null));

        let categoryId = "";

        await act(async () => {

            categoryId = await result.current.createCategory("Cartas");

        });

        act(() => {

            result.current.toggleGameInCategory(categoryId, "arkhamlcg");

        });

        act(() => {

            result.current.renameCategory(categoryId, "Juegos de cartas");

        });

        const category =
            result.current.categories.find(c => c.id === categoryId);

        expect(category?.name).toBe("Juegos de cartas");
        expect(category?.gameIds).toEqual(["arkhamlcg"]);

    });

    it("elimina una categoría", async () => {

        const { result } = renderHook(() => useCategories(null));

        let categoryId = "";

        await act(async () => {

            categoryId = await result.current.createCategory("Cartas");

        });

        act(() => {

            result.current.deleteCategory(categoryId);

        });

        expect(result.current.categories).toEqual([]);

    });

    it("persiste las categorías en localStorage", async () => {

        const { result } = renderHook(() => useCategories(null));

        await act(async () => {

            await result.current.createCategory("Cartas");

        });

        const stored =
            JSON.parse(localStorage.getItem(STORAGE_KEY) ?? "[]");

        expect(stored).toHaveLength(1);
        expect(stored[0].name).toBe("Cartas");

    });

    it("recupera las categorías guardadas en una sesión anterior", () => {

        localStorage.setItem(

            STORAGE_KEY,

            JSON.stringify([

                { id: "cat-1", name: "Cartas", gameIds: ["arkhamlcg"] }

            ])

        );

        const { result } = renderHook(() => useCategories(null));

        expect(result.current.categories).toHaveLength(1);
        expect(result.current.isGameInCategory("cat-1", "arkhamlcg")).toBe(true);

    });

    it("no rompe la app si localStorage tiene contenido corrupto", () => {

        localStorage.setItem(

            STORAGE_KEY,

            "esto no es JSON válido {{{"

        );

        const { result } = renderHook(() => useCategories(null));

        expect(result.current.categories).toEqual([]);

    });

    it("filtra entradas guardadas con forma incorrecta, sin descartar las válidas", () => {

        localStorage.setItem(

            STORAGE_KEY,

            JSON.stringify([

                { id: "cat-1", name: "Válida", gameIds: [] },
                { id: "cat-2" }, // sin name ni gameIds — corrupta
                "esto ni siquiera es un objeto"

            ])

        );

        const { result } = renderHook(() => useCategories(null));

        expect(result.current.categories).toHaveLength(1);
        expect(result.current.categories[0].name).toBe("Válida");

    });

});
