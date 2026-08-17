import {
    useCallback,
    useEffect,
    useState
} from "react";

export type Theme = "light" | "dark";

const STORAGE_KEY = "boardgame-tutor-theme";

function readStoredTheme(): Theme | null {

    try {

        const stored =
            localStorage.getItem(STORAGE_KEY);

        return stored === "light" || stored === "dark"
            ? stored
            : null;

    }
    catch {

        return null;

    }

}

/**
 * El tema es null hasta que la persona elige explícitamente
 * (ver ThemeChoiceModal) — no se detecta automáticamente por el
 * sistema operativo, se pregunta la primera vez. Mientras no
 * haya elección, la app se ve con el tema oscuro que trae por
 * defecto :root (variables.css), sin aplicar ningún atributo
 * todavía.
 */
export function useTheme() {

    const [theme, setThemeState] =
        useState<Theme | null>(

            () => readStoredTheme()

        );

    useEffect(() => {

        if (theme) {

            document.documentElement.setAttribute(

                "data-theme",

                theme

            );

        }

    }, [theme]);

    const setTheme = useCallback(

        (newTheme: Theme) => {

            try {

                localStorage.setItem(STORAGE_KEY, newTheme);

            }
            catch {

                // Almacenamiento no disponible: el tema se
                // aplica igualmente para esta sesión, solo que
                // no se recordará la próxima vez.

            }

            setThemeState(newTheme);

        },

        []

    );

    const toggleTheme = useCallback(() => {

        setTheme(theme === "light" ? "dark" : "light");

    }, [theme, setTheme]);

    return {

        theme: theme ?? "dark",

        hasChosenTheme: theme !== null,

        setTheme,

        toggleTheme

    };

}
