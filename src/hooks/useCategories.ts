import {
    useCallback,
    useEffect,
    useState
} from "react";

const STORAGE_KEY = "boardgame-tutor-categories";

export interface Category {

    id: string;

    name: string;

    gameIds: string[];

}

function readCategories(): Category[] {

    try {

        const raw =
            localStorage.getItem(STORAGE_KEY);

        if (!raw) {

            return [];

        }

        const parsed = JSON.parse(raw);

        if (!Array.isArray(parsed)) {

            return [];

        }

        // Filtra cualquier entrada que no tenga la forma
        // esperada, en vez de romper toda la lista por un solo
        // registro corrupto.
        return parsed.filter(

            (entry): entry is Category =>

                typeof entry === "object" &&
                entry !== null &&
                typeof entry.id === "string" &&
                typeof entry.name === "string" &&
                Array.isArray(entry.gameIds)

        );

    }
    catch {

        // localStorage no disponible, o contenido corrupto: se
        // empieza sin categorías en vez de romper la app.
        return [];

    }

}

function createCategoryId(): string {

    // crypto.randomUUID existe en todos los navegadores
    // modernos servidos por HTTPS (o localhost) — pero por si
    // acaso algún entorno no lo tuviera disponible, se cae a
    // una alternativa simple basada en tiempo + aleatorio.
    if (

        typeof crypto !== "undefined" &&
        typeof crypto.randomUUID === "function"

    ) {

        return crypto.randomUUID();

    }

    return `cat-${Date.now()}-${Math.random().toString(36).slice(2)}`;

}

/**
 * Categorías personalizadas del usuario (ej. "Juegos de
 * cartas") con los juegos asignados a cada una — persistidas en
 * localStorage, igual que useFavorites. Un mismo juego puede
 * pertenecer a varias categorías a la vez.
 */
export function useCategories() {

    const [categories, setCategories] =

        useState<Category[]>(

            () => readCategories()

        );

    useEffect(() => {

        try {

            localStorage.setItem(

                STORAGE_KEY,

                JSON.stringify(categories)

            );

        }
        catch {

            // Almacenamiento lleno o no disponible: se ignora,
            // las categorías simplemente no persistirán esta vez.

        }

    }, [categories]);

    const createCategory = useCallback(

        (name: string): string => {

            const id = createCategoryId();

            setCategories(previous => [

                ...previous,

                { id, name, gameIds: [] }

            ]);

            return id;

        },

        []

    );

    const renameCategory = useCallback(

        (

            categoryId: string,

            name: string

        ) => {

            setCategories(previous =>

                previous.map(

                    category =>

                        category.id === categoryId

                            ? { ...category, name }

                            : category

                )

            );

        },

        []

    );

    const deleteCategory = useCallback(

        (categoryId: string) => {

            setCategories(previous =>

                previous.filter(

                    category => category.id !== categoryId

                )

            );

        },

        []

    );

    const toggleGameInCategory = useCallback(

        (

            categoryId: string,

            gameId: string

        ) => {

            setCategories(previous =>

                previous.map(category => {

                    if (category.id !== categoryId) {

                        return category;

                    }

                    const alreadyIn =
                        category.gameIds.includes(gameId);

                    return {

                        ...category,

                        gameIds:

                            alreadyIn

                                ? category.gameIds.filter(

                                    id => id !== gameId

                                )

                                : [...category.gameIds, gameId]

                    };

                })

            );

        },

        []

    );

    const isGameInCategory = useCallback(

        (

            categoryId: string,

            gameId: string

        ): boolean => {

            return (

                categories

                    .find(category => category.id === categoryId)

                    ?.gameIds.includes(gameId)

                ?? false

            );

        },

        [categories]

    );

    return {

        categories,

        createCategory,

        renameCategory,

        deleteCategory,

        toggleGameInCategory,

        isGameInCategory

    };

}
