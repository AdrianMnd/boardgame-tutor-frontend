import "./Sidebar.css";

import { useMemo, useState } from "react";

import Icon from "../UI/Icon";

import {
    Search,
    Users,
    Clock3,
    Dices,
    X,
    Star
} from "lucide-react";

import type { Game } from "../../types/Game";

interface Props {

    games: Game[];

    selectedGame: Game | null;

    onSelectGame: (game: Game) => void;

    isOpen: boolean;

    onClose: () => void;

    isFavorite: (gameId: string) => boolean;

    onToggleFavorite: (gameId: string) => void;

}

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

    onToggleFavorite

}: Props) {

    const [

        search,

        setSearch

    ] = useState("");

    const filteredGames = useMemo(

        () => {

            const text =

                search.toLowerCase().trim();

            const base =

                text

                    ? games.filter(

                        game =>

                            game.name
                                .toLowerCase()
                                .includes(text)

                    )

                    : games;

            // Los favoritos siempre van primero — el orden entre
            // ellos (y entre el resto) se conserva tal como
            // vienen del catálogo, para no reordenar cada vez
            // que cambie algo sin motivo aparente.
            return [...base].sort(

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

            isFavorite

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

            <div className="sidebar-search">

                <Icon

                    icon={Search}

                    size={18}

                />

                <input

                    type="text"

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
                                icon={Dices}
                                size={26}
                            />

                            <p>
                                {
                                    search
                                        ? "Ningún juego coincide con tu búsqueda."
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