import "./Header.css";

import Icon from "../UI/Icon";

import {
    Bot,
    Sparkles,
    Menu
} from "lucide-react";

interface Props {

    onMenuClick: () => void;

}

function Header({

    onMenuClick

}: Props) {

    return (

        <header className="header">

            <div className="header-left">

                <button

                    className="header-menu-button"

                    onClick={onMenuClick}

                    aria-label="Abrir lista de juegos"

                >

                    <Icon
                        icon={Menu}
                        size={22}
                    />

                </button>

                <div className="header-logo">

                    <Icon
                        icon={Bot}
                        size={26}
                    />

                </div>

                <div className="header-title">

                    <h1>

                        BoardGame Tutor

                    </h1>

                    <p>

                        Tu asistente para reglamentos de juegos de mesa

                    </p>

                </div>

            </div>

            <div className="header-right">

                <div className="header-status">

                    <Icon
                        icon={Sparkles}
                        size={16}
                    />

                    <span>

                        IA preparada

                    </span>

                </div>

            </div>

        </header>

    );

}

export default Header;