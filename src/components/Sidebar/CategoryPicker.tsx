import "./CategoryPicker.css";

import {
    useCallback,
    useEffect,
    useRef,
    useState
} from "react";

import { createPortal } from "react-dom";

import Icon from "../UI/Icon";

import { Check, FolderPlus, Plus, X } from "lucide-react";

import type { Category } from "../../hooks/useCategories";

interface Props {

    game: {

        id: string;

        name: string;

    };

    categories: Category[];

    isGameInCategory: (

        categoryId: string,

        gameId: string

    ) => boolean;

    onToggleGameInCategory: (

        categoryId: string,

        gameId: string

    ) => void;

    onCreateCategory: (name: string) => Promise<string>;

    // Controlado desde el padre (Sidebar) — así solo puede haber
    // un selector abierto a la vez entre todas las tarjetas de
    // juego, en vez de que cada uno lleve su propio estado
    // independiente y se vayan acumulando abiertos.
    isOpen: boolean;

    // Recibe (gameId, open) en vez de solo (open) — así Sidebar
    // puede pasar SIEMPRE la misma función (estable, con
    // useCallback) a todas las tarjetas por igual, sin crear una
    // función nueva por cada juego en cada render.
    onOpenChange: (

        gameId: string,

        isOpen: boolean

    ) => void;

}

/**
 * Botón + menú flotante para asignar un juego a una o varias
 * categorías personalizadas. Igual que el desplegable de
 * documentos, el menú se renderiza mediante un portal
 * directamente en <body> — .sidebar-games tiene overflow-y:auto
 * para poder hacer scroll de la lista, y eso recortaría un menú
 * anidado que no cupiera entero, sin importar el z-index.
 */
function CategoryPicker({

    game,

    categories,

    isGameInCategory,

    onToggleGameInCategory,

    onCreateCategory,

    isOpen,

    onOpenChange

}: Props) {

    const [newCategoryName, setNewCategoryName] = useState("");

    // Estable mientras game.id y onOpenChange (ya estable desde
    // Sidebar) no cambien — así los efectos de abajo pueden
    // depender de esto sin recrear sus listeners en cada render.
    const setOpen = useCallback(

        (open: boolean) => onOpenChange(game.id, open),

        [game.id, onOpenChange]

    );


    const buttonRef =
        useRef<HTMLSpanElement>(null);

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

            const rect =
                button.getBoundingClientRect();

            setPosition({

                top: rect.bottom + 8,

                right: window.innerWidth - rect.right

            });

        }

        updatePosition();

        // Antes se cerraba el menú al detectar "resize" o
        // "scroll" (para evitar que quedara mal colocado si la
        // página cambiaba de tamaño). En móvil, abrir el
        // teclado para escribir en el campo de texto dispara
        // ambos eventos — cerrando el menú antes de que el
        // usuario pudiera escribir nada. En su lugar, solo se
        // recalcula la posición, sin cerrar.
        window.addEventListener("resize", updatePosition);

        return () => {

            window.removeEventListener("resize", updatePosition);

        };

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

                !target.closest(".category-picker") &&
                !target.closest(".category-picker-menu")

            ) {

                setOpen(false);

            }

        }

        function handleEscape(

            event: KeyboardEvent

        ) {

            if (event.key === "Escape") {

                setOpen(false);

            }

        }

        document.addEventListener("mousedown", handleClickOutside);
        document.addEventListener("keydown", handleEscape);

        return () => {

            document.removeEventListener(

                "mousedown",

                handleClickOutside

            );

            document.removeEventListener(

                "keydown",

                handleEscape

            );

        };

    }, [isOpen, setOpen]);

    async function handleCreateAndAssign() {

        const name = newCategoryName.trim();

        if (!name) {

            return;

        }

        setNewCategoryName("");

        const newId = await onCreateCategory(name);

        onToggleGameInCategory(newId, game.id);

    }

    return (

        <span className="category-picker">

            <span

                ref={buttonRef}

                role="button"

                tabIndex={0}

                className="category-picker-button"

                aria-label={`Gestionar categorías de ${game.name}`}

                aria-haspopup="true"

                aria-expanded={isOpen}

                onClick={event => {

                    event.stopPropagation();

                    setOpen(!isOpen);

                }}

                onKeyDown={event => {

                    if (event.key === "Enter" || event.key === " ") {

                        event.preventDefault();

                        event.stopPropagation();

                        setOpen(!isOpen);

                    }

                }}

            >

                <Icon

                    icon={FolderPlus}

                    size={16}

                />

            </span>

            {

                isOpen &&

                position &&

                createPortal(

                    <div

                        className="category-picker-menu"

                        role="menu"

                        style={{

                            top: position.top,

                            right: position.right

                        }}

                        onClick={

                            event => event.stopPropagation()

                        }

                    >

                        <div className="category-picker-header">

                            <p className="category-picker-title">

                                Añadir "{game.name}" a...

                            </p>

                            <button

                                type="button"

                                className="category-picker-close"

                                aria-label="Cerrar"

                                onClick={

                                    () => setOpen(false)

                                }

                            >

                                <Icon icon={X} size={14} />

                            </button>

                        </div>

                        {

                            categories.length === 0 && (

                                <p className="category-picker-empty">

                                    Todavía no tienes categorías.

                                </p>

                            )

                        }

                        {

                            categories.map(

                                category => {

                                    const checked =

                                        isGameInCategory(

                                            category.id,

                                            game.id

                                        );

                                    return (

                                        <button

                                            key={category.id}

                                            type="button"

                                            role="menuitemcheckbox"

                                            aria-checked={checked}

                                            className="category-picker-item"

                                            onClick={

                                                () =>

                                                    onToggleGameInCategory(

                                                        category.id,

                                                        game.id

                                                    )

                                            }

                                        >

                                            <span

                                                className={

                                                    checked

                                                        ? "category-picker-check checked"

                                                        : "category-picker-check"

                                                }

                                            >

                                                {

                                                    checked && (

                                                        <Icon

                                                            icon={Check}

                                                            size={12}

                                                        />

                                                    )

                                                }

                                            </span>

                                            <span>

                                                {category.name}

                                            </span>

                                        </button>

                                    );

                                }

                            )

                        }

                        <div className="category-picker-create">

                            <input

                                type="text"

                                placeholder="Nueva categoría..."

                                value={newCategoryName}

                                onChange={

                                    event =>

                                        setNewCategoryName(

                                            event.target.value

                                        )

                                }

                                onKeyDown={

                                    event => {

                                        if (event.key === "Enter") {

                                            event.preventDefault();

                                            handleCreateAndAssign();

                                        }

                                    }

                                }

                            />

                            <button

                                type="button"

                                aria-label="Crear categoría"

                                disabled={!newCategoryName.trim()}

                                onClick={handleCreateAndAssign}

                            >

                                <Icon

                                    icon={Plus}

                                    size={16}

                                />

                            </button>

                        </div>

                    </div>,

                    document.body

                )

            }

        </span>

    );

}

export default CategoryPicker;
