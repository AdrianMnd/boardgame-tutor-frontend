import "./Sidebar.css";
import type { Game } from "../../types/Game"

interface SidebarProps {
    games: Game[];

    selectedGame: Game | null;

    onSelectGame: (game: Game) => void;

 }

function Sidebar({

    games,

    selectedGame,

    onSelectGame

}: SidebarProps) {

    return (
        <aside className="sidebar">
            <h2>Juegos</h2>
            <ul>
                {games.map((game) => (
                    <li
                        key={game.id}
                        onClick={() => onSelectGame(game)}
                        className={
                            selectedGame?.id === game.id
                                ? "selected"
                                : ""
                        }
                    >
                        <strong>{game.name}</strong>
                        <br />
                        <small>{game.description}</small>
                    </li>
                ))}
            </ul>
        </aside>

    );
}

export default Sidebar;