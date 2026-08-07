import "./Sidebar.css";

import { useMemo, useState } from "react";

import Icon from "../UI/Icon";

import {
    Search,
    Users,
    Clock3
} from "lucide-react";

import type { Game } from "../../types/Game";

interface Props {

    games: Game[];

    selectedGame: Game | null;

    onSelectGame: (game: Game) => void;

}

function Sidebar({

    games,

    selectedGame,

    onSelectGame

}: Props) {

    const [

        search,

        setSearch

    ] = useState("");

    const filteredGames = useMemo(

        () => {

            const text =

                search.toLowerCase().trim();

            if (!text) {

                return games;

            }

            return games.filter(

                game =>

                    game.name
                        .toLowerCase()
                        .includes(text)

            );

        },

        [

            games,

            search

        ]

    );

    return (

        <aside className="sidebar">

            <header className="sidebar-header">

                <div>

                    <h2>

                        Juegos

                    </h2>

                    <span>

                        {filteredGames.length}

                    </span>

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

                                        🎲

                                    </div>

                                    <div>

                                        <h3>

                                            {game.name}

                                        </h3>

                                    </div>

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

    );

}

export default Sidebar;