import {
    useCallback,
    useEffect,
    useState
} from "react";

import { categoriesService } from "../services/categories.service";

import type { User } from "../types/User";

const STORAGE_KEY = "boardgame-tutor-categories";

export interface Category {

    id: string;

    name: string;

    gameIds: string[];

}

function readLocalCategories(): Category[] {

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

        return [];

    }

}

function createLocalCategoryId(): string {

    if (

        typeof crypto !== "undefined" &&
        typeof crypto.randomUUID === "function"

    ) {

        return crypto.randomUUID();

    }

    return `cat-${Date.now()}-${Math.random().toString(36).slice(2)}`;

}

/**
 * Categorías personalizadas del usuario. Sin sesión, viven en
 * localStorage; con sesión, en el servidor — mismo patrón dual
 * que useFavorites.
 *
 * `createCategory` es asíncrono (a diferencia de la versión
 * puramente local de antes) porque, con sesión iniciada, el id
 * lo genera el servidor — no se puede saber de antemano.
 */
export function useCategories(

    user: User | null

) {

    const [categories, setCategories] =

        useState<Category[]>(

            () =>

                user

                    ? []

                    : readLocalCategories()

        );

    // Mismo patrón que en useFavorites — ver los comentarios
    // allí para el porqué de separar la rama local (síncrona,
    // ajustada en el render) de la rama de la API (async, en un
    // efecto de verdad), y de derivar isLoading en vez de
    // guardarlo como su propio estado.
    const [loadedFor, setLoadedFor] =
        useState<string | null>(user?.id ?? null);

    const isLoading =
        Boolean(user) && loadedFor !== (user?.id ?? null);

    if (!user && loadedFor !== null) {

        setLoadedFor(null);

        setCategories(readLocalCategories());

    }

    useEffect(() => {

        if (!user || loadedFor === user.id) {

            return;

        }

        let cancelled = false;

        categoriesService.list()

            .then(apiCategories => {

                if (!cancelled) {

                    setCategories(apiCategories);

                    setLoadedFor(user.id);

                }

            })

            .catch(() => {

                if (!cancelled) {

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

                JSON.stringify(categories)

            );

        }
        catch {

            // Almacenamiento lleno o no disponible: se ignora.

        }

    }, [categories, user]);

    const createCategory = useCallback(

        async (

            name: string

        ): Promise<string> => {

            if (user) {

                const created =
                    await categoriesService.create(name);

                setCategories(previous => [...previous, created]);

                return created.id;

            }

            const id = createLocalCategoryId();

            setCategories(previous => [

                ...previous,

                { id, name, gameIds: [] }

            ]);

            return id;

        },

        [user]

    );

    const renameCategory = useCallback(

        (

            categoryId: string,

            name: string

        ) => {

            const previousCategories = categories;

            setCategories(previous =>

                previous.map(

                    category =>

                        category.id === categoryId

                            ? { ...category, name }

                            : category

                )

            );

            if (!user) {

                return;

            }

            categoriesService

                .rename(categoryId, name)

                .catch(() => {

                    setCategories(previousCategories);

                });

        },

        [categories, user]

    );

    const deleteCategory = useCallback(

        (categoryId: string) => {

            const previousCategories = categories;

            setCategories(previous =>

                previous.filter(

                    category => category.id !== categoryId

                )

            );

            if (!user) {

                return;

            }

            categoriesService

                .delete(categoryId)

                .catch(() => {

                    setCategories(previousCategories);

                });

        },

        [categories, user]

    );

    const toggleGameInCategory = useCallback(

        (

            categoryId: string,

            gameId: string

        ) => {

            const category =
                categories.find(c => c.id === categoryId);

            const wasIn =
                category?.gameIds.includes(gameId) ?? false;

            setCategories(previous =>

                previous.map(entry => {

                    if (entry.id !== categoryId) {

                        return entry;

                    }

                    return {

                        ...entry,

                        gameIds:

                            wasIn

                                ? entry.gameIds.filter(id => id !== gameId)

                                : [...entry.gameIds, gameId]

                    };

                })

            );

            if (!user) {

                return;

            }

            const request =

                wasIn

                    ? categoriesService.removeGame(categoryId, gameId)

                    : categoriesService.addGame(categoryId, gameId);

            request.catch(() => {

                setCategories(previous =>

                    previous.map(entry => {

                        if (entry.id !== categoryId) {

                            return entry;

                        }

                        return {

                            ...entry,

                            gameIds:

                                wasIn

                                    ? [...entry.gameIds, gameId]

                                    : entry.gameIds.filter(id => id !== gameId)

                        };

                    })

                );

            });

        },

        [categories, user]

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

    const migrateLocalCategories = useCallback(

        async (): Promise<void> => {

            const local = readLocalCategories();

            if (local.length === 0) {

                return;

            }

            const migrated: Category[] = [];

            for (const category of local) {

                const created =

                    await categoriesService.create(

                        category.name

                    );

                for (const gameId of category.gameIds) {

                    await categoriesService.addGame(

                        created.id,

                        gameId

                    );

                }

                migrated.push({

                    ...created,

                    gameIds: category.gameIds

                });

            }

            localStorage.removeItem(STORAGE_KEY);

            setCategories(migrated);

        },

        []

    );

    return {

        categories,

        createCategory,

        renameCategory,

        deleteCategory,

        toggleGameInCategory,

        isGameInCategory,

        isLoading,

        migrateLocalCategories

    };

}
