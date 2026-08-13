import {
    useEffect,
    useRef
} from "react";

const FOCUSABLE_SELECTOR =

    'a[href], button:not([disabled]), textarea:not([disabled]), ' +
    'input:not([disabled]), select:not([disabled]), ' +
    '[tabindex]:not([tabindex="-1"])';

/**
 * Atrapa el foco de teclado dentro de un diálogo mientras está
 * abierto (patrón estándar de accesibilidad para modales — ver
 * WAI-ARIA Authoring Practices, "Dialog (Modal)"):
 *
 * - Al abrirse, mueve el foco dentro del diálogo.
 * - Tab/Shift+Tab no puede salir del diálogo mientras esté abierto.
 * - Al cerrarse, devuelve el foco al elemento que lo abrió.
 *
 * Sin esto, un usuario de teclado puede seguir tabulando por el
 * contenido de detrás de un modal — algo confuso y, para
 * usuarios de lector de pantalla, prácticamente inutilizable.
 */
export function useFocusTrap(

    isOpen: boolean

) {

    const containerRef =
        useRef<HTMLElement>(null);

    const previouslyFocused =
        useRef<HTMLElement | null>(null);

    useEffect(() => {

        if (!isOpen) {

            return;

        }

        previouslyFocused.current =

            document.activeElement instanceof HTMLElement
                ? document.activeElement
                : null;

        const container = containerRef.current;

        if (!container) {

            return;

        }

        const getFocusable = () =>

            Array.from(

                container.querySelectorAll<HTMLElement>(

                    FOCUSABLE_SELECTOR

                )

            );

        // Mueve el foco dentro del diálogo al abrirse — al
        // propio contenedor si no hay nada enfocable todavía
        // (ej. mientras el PDF sigue cargando).
        const focusables = getFocusable();

        (focusables[0] ?? container).focus();

        function handleKeyDown(

            event: KeyboardEvent

        ) {

            if (event.key !== "Tab") {

                return;

            }

            const items = getFocusable();

            if (items.length === 0) {

                event.preventDefault();

                return;

            }

            const first = items[0];

            const last = items[items.length - 1];

            if (event.shiftKey && document.activeElement === first) {

                event.preventDefault();

                last.focus();

            }
            else if (!event.shiftKey && document.activeElement === last) {

                event.preventDefault();

                first.focus();

            }

        }

        document.addEventListener(

            "keydown",

            handleKeyDown

        );

        return () => {

            document.removeEventListener(

                "keydown",

                handleKeyDown

            );

            // Devuelve el foco a quien abrió el diálogo — sin
            // esto, tras cerrar, el foco del teclado se queda
            // "perdido" al principio del documento.
            previouslyFocused.current?.focus();

        };

    }, [isOpen]);

    return containerRef;

}
