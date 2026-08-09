import "./Header.css";

import Icon from "../UI/Icon";

import {
    Bot,
    Sparkles
} from "lucide-react";

function Header() {

    return (

        <header className="header">

            <div className="header-left">

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