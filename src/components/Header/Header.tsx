import "./Header.css";

import Icon from "../UI/Icon";

import {

    Dice5

} from "lucide-react";

function Header() {

    return (

        <header className="header">

            <div className="header-left">

                <div className="logo">

                    <Icon

                        icon={Dice5}

                        size={24}

                    />

                </div>

                <div>

                    <h1>

                        BoardGame Tutor

                    </h1>

                    <p>

                        Tu asistente inteligente para reglamentos

                    </p>

                </div>

            </div>

            <div className="header-right">

                <span className="status">

                    <span className="status-dot" />

                    IA conectada

                </span>

            </div>

        </header>

    );

}

export default Header;