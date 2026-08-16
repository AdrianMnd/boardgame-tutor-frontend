import "./Sidebar.css";

import { useCallback, useEffect, useMemo, useState } from "react";

import Icon from "../UI/Icon";

import CategoryPicker from "./CategoryPicker";

import {
    Search,
    Users,
    Clock3,
    Dices,
    X,
    Star,
    Plus,
    LayoutGrid
} from "lucide-react";

import type { Game } from "../../types/Game";
import type { Category } from "../../hooks/useCategories";

import { useFocusTrap } from "../../hooks/useFocusTrap";

interface Props {

    games: Game[];

    selectedGame: Game | null;

    onSelectGame: (game: Game) => void;

    isOpen: boolean;

    onClose: () => void;

    isFavorite: (gameId: string) => boolean;

    onToggleFavorite: (gameId: string) => void;

    categories: Category[];

    onCreateCategory: (name: string) => Promise<string>;

    onRenameCategory: (categoryId: string, name: string) => void;

    onDeleteCategory: (categoryId: string) => void;

    onToggleGameInCategory: (categoryId: string, gameId: string) => void;

    isGameInCategory: (categoryId: string, gameId: string) => boolean;

}

type ActiveTab = "all" | "favorites" | string;

function GameCover({ game }: { game: Game }) {

    const [failed, setFailed] = useState(false);

    if (!game.coverUrl || failed) {

        return (

            <div className="game-icon-fallback">

                <Icon
                    icon={Dices}
                    size={22}
                />

            </div>

        );

    }

    return (

        <img

            src={game.coverUrl}

            alt=""

            onError={() => setFailed(true)}

        />

    );

}

function Sidebar({

    games,

    selectedGame,

    onSelectGame,

    isOpen,

    onClose,

    isFavorite,

    onToggleFavorite,

    categories,

    onCreateCategory,

    onRenameCategory,

    onDeleteCategory,

    onToggleGameInCategory,

    isGameInCategory

}: Props) {

    const dialogRef =
        useFocusTrap(isOpen);

    useEffect(() => {

        if (!isOpen) {

            return;

        }

        function handleKeyDown(

            event: KeyboardEvent

        ) {

            if (event.key === "Escape") {

                onClose();

            }

        }

        document.addEventListener(

            "keydown",

            handleKeyDown

        );

        return () =>

            document.removeEventListener(

                "keydown",

                handleKeyDown

            );

    }, [isOpen, onClose]);

    const [

        search,

        setSearch

    ] = useState("");

    const [activeTab, setActiveTab] =
        useState<ActiveTab>("all");

    // El id del juego cuyo CategoryPicker está abierto ahora
    // mismo (null si ninguno) — vive aquí, no dentro de cada
    // CategoryPicker, precisamente para que abrir uno cierre
    // automáticamente cualquier otro que estuviera abierto.
    const [openCategoryPickerGameId, setOpenCategoryPickerGameId] =
        useState<string | null>(null);

    // Referencia estable — se pasa como prop a cada
    // CategoryPicker, así el efecto que escucha "clic fuera" /
    // Escape dentro de CategoryPicker puede depender de esta
    // función sin recrear sus listeners en cada render de
    // Sidebar (una función nueva en cada render forzaría eso).
    const handleCategoryPickerOpenChange = useCallback(

        (

            gameId: string,

            open: boolean

        ) => {

            setOpenCategoryPickerGameId(

                open ? gameId : null

            );

        },

        []

    );

    // Si cambia la lista de juegos visibles (buscar, cambiar de
    // pestaña...) y el que tenía el selector abierto deja de
    // estar en pantalla, se cierra en vez de quedarse "flotando"
    // sin la tarjeta a la que pertenecía.
    if (

        openCategoryPickerGameId !== null &&
        !games.some(game => game.id === openCategoryPickerGameId)

    ) {

        setOpenCategoryPickerGameId(null);

    }

    // Si cambia la categoría activa, no te quedas viendo una
    // pestaña fantasma — vuelve a "Todos". Se ajusta durante el
    // render (patrón recomendado por React para esto, ver
    // https://react.dev/learn/you-might-not-need-an-effect) en
    // vez de en un efecto — la propia condición evita cualquier
    // bucle, porque en cuanto activeTab pasa a "all" deja de
    // cumplirse.
    if (

        activeTab !== "all" &&
        activeTab !== "favorites" &&
        !categories.some(category => category.id === activeTab)

    ) {

        setActiveTab("all");

    }

    const [isCreatingCategory, setIsCreatingCategory] =
        useState(false);

    const [newCategoryName, setNewCategoryName] =
        useState("");

    const [renamingCategoryId, setRenamingCategoryId] =
        useState<string | null>(null);

    const [renameValue, setRenameValue] =
        useState("");

    function commitRename() {

        const name = renameValue.trim();

        if (renamingCategoryId && name) {

            onRenameCategory(renamingCategoryId, name);

        }

        setRenamingCategoryId(null);

    }

    async function handleCreateCategory() {

        const name = newCategoryName.trim();

        if (!name) {

            setIsCreatingCategory(false);

            return;

        }

        setNewCategoryName("");
        setIsCreatingCategory(false);

        const id = await onCreateCategory(name);

        setActiveTab(id);

    }

    const filteredGames = useMemo(

        () => {

            const text =

                search.toLowerCase().trim();

            const searched =

                text

                    ? games.filter(

                        game =>

                            game.name
                                .toLowerCase()
                                .includes(text)

                    )

                    : games;

            const byTab =

                activeTab === "all"

                    ? searched

                    : activeTab === "favorites"

                        ? searched.filter(

                            game => isFavorite(game.id)

                        )

                        : searched.filter(

                            game =>

                                isGameInCategory(activeTab, game.id)

                        );

            return [...byTab].sort(

                (a, b) => {

                    const favA = isFavorite(a.id) ? 0 : 1;

                    const favB = isFavorite(b.id) ? 0 : 1;

                    return favA - favB;

                }

            );

        },

        [

            games,

            search,

            isFavorite,

            activeTab,

            isGameInCategory

        ]

    );

    return (

        <>

            {

                isOpen && (

                    <div

                        className="sidebar-backdrop"

                        onClick={onClose}

                    />

                )

            }

            <aside

                ref={dialogRef as React.RefObject<HTMLElement>}

                role={isOpen ? "dialog" : undefined}

                aria-modal={isOpen ? true : undefined}

                aria-label="Lista de juegos"

                tabIndex={-1}

                className={

                    isOpen

                        ? "sidebar open"

                        : "sidebar"

                }

            >

            <header className="sidebar-header">

                <div>

                    <h2>

                        Juegos

                    </h2>

                    <div className="sidebar-header-actions">

                        <span>

                            {filteredGames.length}

                        </span>

                        <button

                            className="sidebar-close-button"

                            onClick={onClose}

                            aria-label="Cerrar lista de juegos"

                        >

                            <Icon

                                icon={X}

                                size={20}

                            />

                        </button>

                    </div>

                </div>

            </header>

            <div

                className="sidebar-tabs"

                role="tablist"

                aria-label="Filtrar juegos por categoría"

            >

                <button

                    role="tab"

                    aria-selected={activeTab === "all"}

                    className={

                        activeTab === "all"

                            ? "sidebar-tab active"

                            : "sidebar-tab"

                    }

                    onClick={() => setActiveTab("all")}

                >

                    Todos

                </button>

                <button

                    role="tab"

                    aria-selected={activeTab === "favorites"}

                    className={

                        activeTab === "favorites"

                            ? "sidebar-tab active"

                            : "sidebar-tab"

                    }

                    onClick={() => setActiveTab("favorites")}

                >

                    <Icon icon={Star} size={13} />

                    Favoritos

                </button>

                {

                    categories.map(

                        category => (

                            <div

                                key={category.id}

                                className={

                                    activeTab === category.id

                                        ? "sidebar-tab-wrapper active"

                                        : "sidebar-tab-wrapper"

                                }

                            >

                                {

                                    renamingCategoryId === category.id

                                        ? (

                                            <input

                                                type="text"

                                                autoFocus

                                                className="sidebar-tab-rename-input"

                                                value={renameValue}

                                                onChange={

                                                    event =>

                                                        setRenameValue(

                                                            event.target.value

                                                        )

                                                }

                                                onKeyDown={

                                                    event => {

                                                        if (event.key === "Enter") {

                                                            commitRename();

                                                        }
                                                        else if (event.key === "Escape") {

                                                            setRenamingCategoryId(null);

                                                        }

                                                    }

                                                }

                                                onBlur={commitRename}

                                            />

                                        )

                                        : (

                                            <button

                                                role="tab"

                                                aria-selected={activeTab === category.id}

                                                className="sidebar-tab"

                                                onClick={

                                                    () => setActiveTab(category.id)

                                                }

                                                onDoubleClick={

                                                    () => {

                                                        setRenamingCategoryId(category.id);

                                                        setRenameValue(category.name);

                                                    }

                                                }

                                                title="Doble clic para renombrar"

                                            >

                                                {category.name}

                                            </button>

                                        )

                                }

                                <button

                                    type="button"

                                    className="sidebar-tab-delete"

                                    aria-label={

                                        `Eliminar la categoría ${category.name}`

                                    }

                                    onClick={

                                        () =>

                                            onDeleteCategory(category.id)

                                    }

                                >

                                    <Icon icon={X} size={12} />

                                </button>

                            </div>

                        )

                    )

                }

                {

                    isCreatingCategory

                        ? (

                            <input

                                type="text"

                                autoFocus

                                className="sidebar-tab-new-input"

                                placeholder="Nombre..."

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

                                            handleCreateCategory();

                                        }
                                        else if (event.key === "Escape") {

                                            setIsCreatingCategory(false);

                                            setNewCategoryName("");

                                        }

                                    }

                                }

                                onBlur={handleCreateCategory}

                            />

                        )

                        : (

                            <button

                                type="button"

                                className="sidebar-tab-add"

                                aria-label="Crear categoría nueva"

                                onClick={

                                    () => setIsCreatingCategory(true)

                                }

                            >

                                <Icon icon={Plus} size={14} />

                            </button>

                        )

                }

            </div>

            <div className="sidebar-search">

                <Icon

                    icon={Search}

                    size={18}

                />

                <input

                    type="text"

                    aria-label="Buscar juego"

                    placeholder="Buscar juego..."

                    value={search}

                    onChange={event =>

                        setSearch(

                            event.target.value

                        )

                    }

                />

            </div>

            <div className="sidebar-games">

                {

                    filteredGames.length === 0 && (

                        <div className="sidebar-empty">

                            <Icon
                                icon={

                                    activeTab === "all"

                                        ? Dices

                                        : LayoutGrid

                                }
                                size={26}
                            />

                            <p>
                                {
                                    search
                                        ? "Ningún juego coincide con tu búsqueda."
                                        : activeTab === "favorites"
                                            ? "Todavía no tienes juegos favoritos."
                                            : activeTab !== "all"
                                                ? "Todavía no hay juegos en esta categoría."
                                                : "Todavía no hay juegos disponibles."
                                }
                            </p>

                        </div>

                    )

                }

                {

                    filteredGames.map(

                        game => (

                            <button

                                key={game.id}

                                className={

                                    selectedGame?.id === game.id

                                        ? "game-card selected"

                                        : "game-card"

                                }

                                onClick={() =>

                                    onSelectGame(

                                        game

                                    )

                                }

                            >

                                <div className="game-card-header">

                                    <div className="game-icon">

                                        <GameCover game={game} />

                                    </div>

                                    <div className="game-card-title">

                                        <h3>

                                            {game.name}

                                        </h3>

                                    </div>

                                    <CategoryPicker

                                        game={game}

                                        categories={categories}

                                        isGameInCategory={isGameInCategory}

                                        onToggleGameInCategory={onToggleGameInCategory}

                                        onCreateCategory={onCreateCategory}

                                        isOpen={openCategoryPickerGameId === game.id}

                                        onOpenChange={handleCategoryPickerOpenChange}

                                    />

                                    <span

                                        role="button"

                                        tabIndex={0}

                                        className={

                                            isFavorite(game.id)

                                                ? "favorite-button active"

                                                : "favorite-button"

                                        }

                                        aria-label={

                                            isFavorite(game.id)

                                                ? `Quitar ${game.name} de favoritos`

                                                : `Marcar ${game.name} como favorito`

                                        }

                                        aria-pressed={isFavorite(game.id)}

                                        onClick={event => {

                                            event.stopPropagation();

                                            onToggleFavorite(game.id);

                                        }}

                                        onKeyDown={event => {

                                            if (

                                                event.key === "Enter" ||
                                                event.key === " "

                                            ) {

                                                event.preventDefault();
                                                event.stopPropagation();

                                                onToggleFavorite(game.id);

                                            }

                                        }}

                                    >

                                        <Icon

                                            icon={Star}

                                            size={16}

                                        />

                                    </span>

                                </div>

                                <div className="game-meta">

                                    <div>

                                        <Icon

                                            icon={Users}

                                            size={15}

                                        />

                                        <span>

                                            {game.minPlayers}

                                            {" - "}
                                            {game.maxPlayers}
                                            {"  "}
                                            jugadores

                                        </span>

                                    </div>

                                    <div>

                                        <Icon

                                            icon={Clock3}

                                            size={15}

                                        />

                                        <span>

                                            {" Año:"}
                                            {"  "}
                                            {game.year}

                                        </span>

                                    </div>

                                </div>

                            </button>

                        )

                    )

                }

            </div>

        </aside>

        </>

    );

}

export default Sidebar;
