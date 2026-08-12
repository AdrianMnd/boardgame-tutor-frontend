import "./Header.css";

import Icon from "../UI/Icon";

import {
    Sparkles,
    Menu
} from "lucide-react";

import logo from "../../assets/logo.svg";

interface Props {

    onMenuClick: () => void;

    onLogoClick: () => void;

}

function Header({

    onMenuClick,

    onLogoClick

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

                <button

                    className="header-brand"

                    onClick={onLogoClick}

                    aria-label="Ir a la pantalla de inicio"

                >

                    <div className="header-logo">

                        <img

                            src={logo}

                            alt=""

                            width={50}

                            height={50}

                        />

                    </div>

                    <div className="header-title">

                        <h1>

                            BoardGame Tutor

                        </h1>

                        <p>

                            Resuelve dudas de reglamento al instante

                        </p>

                    </div>

                </button>

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