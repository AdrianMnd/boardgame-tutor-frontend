import "./WelcomePage.css";

import Icon from "../UI/Icon";

import {
    Star,
    MessageCircleQuestion,
    Menu
} from "lucide-react";

import logo from "../../assets/logo.svg";

import type { Game } from "../../types/Game";

interface Props {

    favoriteGames: Game[];

    onSelectGame: (game: Game) => void;

    onOpenSidebar: () => void;

}

function WelcomePage({

    favoriteGames,

    onSelectGame,

    onOpenSidebar

}: Props) {

    return (

        <div className="welcome-page">

            <div className="welcome-content">

                <img

                    src={logo}

                    alt=""

                    className="welcome-logo"

                />

                <h1>

                    Bienvenido a BoardGame Tutor

                </h1>

                <p>

                    Elige un juego de la lista y pregunta cualquier duda

                    sobre sus reglas — la IA responde citando la página

                    exacta del reglamento que ha usado como fuente.

                </p>

                {

                    favoriteGames.length > 0 && (

                        <div className="welcome-favorites">

                            <h2>

                                <Icon

                                    icon={Star}

                                    size={16}

                                />

                                Tus favoritos

                            </h2>

                            <div className="welcome-favorites-list">

                                {

                                    favoriteGames.map(

                                        game => (

                                            <button

                                                key={game.id}

                                                onClick={() =>

                                                    onSelectGame(game)

                                                }

                                            >

                                                {game.name}

                                            </button>

                                        )

                                    )

                                }

                            </div>

                        </div>

                    )

                }

                <button

                    className="welcome-cta"

                    onClick={onOpenSidebar}

                >

                    <Icon

                        icon={Menu}

                        size={18}

                    />

                    Ver todos los juegos

                </button>

                <div className="welcome-hint">

                    <Icon

                        icon={MessageCircleQuestion}

                        size={15}

                    />

                    <span>

                        En escritorio, la lista de juegos siempre está

                        visible a la izquierda.

                    </span>

                </div>

            </div>

        </div>

    );

}

export default WelcomePage;
