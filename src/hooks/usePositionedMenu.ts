import {
    useEffect,
    useRef,
    useState
} from "react";

/**
 * Lógica compartida entre los menús flotantes de la cabecera
 * (perfil, ajustes sin sesión...): calcula su posición respecto
 * al botón que los abre, y los cierra al clicar fuera o pulsar
 * Escape. Se le pasan los selectores CSS del botón y del propio
 * menú para que el "clic fuera" sepa qué NO cuenta como fuera.
 */
export function usePositionedMenu(

    triggerSelector: string,

    menuSelector: string

) {

    const [isOpen, setIsOpen] = useState(false);

    const buttonRef = useRef<HTMLSpanElement>(null);

    const [position, setPosition] =

        useState<{ top: number; right: number } | null>(

            null

        );

    useEffect(() => {

        if (!isOpen || !buttonRef.current) {

            setPosition(null);

            return;

        }

        function updatePosition() {

            const button = buttonRef.current;

            if (!button) {

                return;

            }

            const rect = button.getBoundingClientRect();

            // El ancho mayor que usa cualquiera de los paneles
            // que comparten este hook (280px, el de novedades) —
            // sirve de límite conservador para que ninguno se
            // salga por la izquierda en pantallas estrechas. En
            // escritorio, con espacio de sobra, esto no cambia
            // nada (el cálculo normal ya deja margen suficiente).
            const MAX_PANEL_WIDTH = 280;

            const SAFETY_MARGIN = 12;

            const naturalRight =
                window.innerWidth - rect.right;

            const maxSafeRight =
                Math.max(

                    SAFETY_MARGIN,

                    window.innerWidth - MAX_PANEL_WIDTH - SAFETY_MARGIN

                );

            setPosition({

                top: rect.bottom + 8,

                right: Math.min(naturalRight, maxSafeRight)

            });

        }

        updatePosition();

        window.addEventListener("resize", updatePosition);

        return () =>
            window.removeEventListener("resize", updatePosition);

    }, [isOpen]);

    useEffect(() => {

        if (!isOpen) {

            return;

        }

        function handleClickOutside(

            event: MouseEvent

        ) {

            const target = event.target as HTMLElement;

            if (

                !target.closest(triggerSelector) &&
                !target.closest(menuSelector)

            ) {

                setIsOpen(false);

            }

        }

        function handleEscape(

            event: KeyboardEvent

        ) {

            if (event.key === "Escape") {

                setIsOpen(false);

            }

        }

        document.addEventListener("mousedown", handleClickOutside);
        document.addEventListener("keydown", handleEscape);

        return () => {

            document.removeEventListener("mousedown", handleClickOutside);
            document.removeEventListener("keydown", handleEscape);

        };

    }, [isOpen, triggerSelector, menuSelector]);

    return {

        isOpen,

        toggle: () => setIsOpen(open => !open),

        close: () => setIsOpen(false),

        buttonRef,

        position

    };

}
