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

            setPosition({

                top: rect.bottom + 8,

                right: window.innerWidth - rect.right

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
