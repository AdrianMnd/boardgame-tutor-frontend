import "./Sidebar.css";

import { useMemo, useState } from "react";

import Icon from "../UI/Icon";

import {

    Calendar,

    Dice5,

    Languages,

    Search,

    Users

} from "lucide-react";

import type {

    Game

} from "../../types/Game";

interface SidebarProps {

    games: Game[];

    selectedGame: Game | null;

    onSelectGame: (
        game: Game
    ) => void;

}

function Sidebar({

    games,

    selectedGame,

    onSelectGame

}: SidebarProps) {

    const [

        search,

        setSearch

    ] = useState("");

    const filteredGames =

        useMemo(

            () =>

                games.filter(game =>

                    game.name

                        .toLowerCase()

                        .includes(

                            search.toLowerCase()

                        )

                ),

            [

                games,

                search

            ]

        );

    function languageName(

        language: string

    ) {

        switch (language) {

            case "es":

                return "Español";

            case "en":

                return "English";

            default:

                return language;

        }

    }

    return (

        <aside className="sidebar">

            <div className="sidebar-header">

    <div>

        <h2>Juegos</h2>

    </div>

    <span>

        {filteredGames.length}

    </span>

</div>

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

                    filteredGames.map(game => (

                        <button

                            key={game.id}

                            className={

                                selectedGame?.id === game.id

                                    ?

                                    "game-card selected"

                                    :

                                    "game-card"

                            }

                            onClick={() =>

                                onSelectGame(

                                    game

                                )

                            }

                        >

                            <div className="game-card-header">

                                <div className="game-icon">

                                    <Icon

                                        icon={Dice5}

                                        size={22}

                                    />

                                </div>

                                <div>

                                    <h3>

                                        {game.name}

                                    </h3>

                                    <p>

                                        v{game.version}

                                    </p>

                                </div>

                            </div>

                            <div className="game-meta">

                                {

                                    game.minPlayers &&

                                    game.maxPlayers &&

                                    <div>

                                        <Icon

                                            icon={Users}

                                            size={15}

                                        />

                                        <span>

                                            {

                                                game.minPlayers

                                            }

                                            –

                                            {

                                                game.maxPlayers

                                            }

                                            jugadores

                                        </span>

                                    </div>

                                }

                                {

                                    game.year &&

                                    <div>

                                        <Icon

                                            icon={Calendar}

                                            size={15}

                                        />

                                        <span>

                                            {

                                                game.year

                                            }

                                        </span>

                                    </div>

                                }

                                <div>

                                    <Icon

                                        icon={Languages}

                                        size={15}

                                    />

                                    <span>

                                        {

                                            languageName(

                                                game.language

                                            )

                                        }

                                    </span>

                                </div>

                            </div>

                        </button>

                    ))

                }

            </div>

        </aside>

    );

}

export default Sidebar;