import { useEffect, useState } from "react";

const EXIT_WINDOW_MS = 2000;

/**
 * Patrón habitual en apps móviles/PWA: la primera pulsación del
 * botón "atrás" del navegador no navega a la página anterior —
 * muestra un aviso y espera una segunda pulsación en los
 * próximos segundos para confirmar que sí se quiere salir. Sin
 * esto, cualquier pulsación accidental de "atrás" saca de la
 * aplicación directamente, sin ninguna confirmación.
 *
 * Funciona empujando una entrada extra al historial del
 * navegador al montar — la primera pulsación de "atrás" consume
 * esa entrada extra (activando popstate, pero sin salir de
 * verdad); si no se confirma a tiempo, se vuelve a empujar otra
 * entrada para que la próxima pulsación repita el mismo aviso.
 */
export function useBackButtonExitWarning() {

    const [showWarning, setShowWarning] =
        useState(false);

    useEffect(() => {

        window.history.pushState(null, "", window.location.href);

        let lastPressAt = 0;

        function handlePopState() {

            const now = Date.now();

            if (now - lastPressAt < EXIT_WINDOW_MS) {

                // Segunda pulsación a tiempo: se deja navegar de
                // verdad, no se vuelve a empujar nada al historial.
                return;

            }

            lastPressAt = now;

            setShowWarning(true);

            window.history.pushState(null, "", window.location.href);

            window.setTimeout(() => setShowWarning(false), EXIT_WINDOW_MS);

        }

        window.addEventListener("popstate", handlePopState);

        return () => {

            window.removeEventListener("popstate", handlePopState);

        };

    }, []);

    return { showExitWarning: showWarning };

}
