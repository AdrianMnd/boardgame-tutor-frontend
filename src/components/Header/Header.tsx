import "./Header.css";

function Header() {

    return (

        <header className="header">

            <div className="header-left">

                <div className="logo">

                    🎲

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

    <div className="status">

        <span className="status-dot" />

        IA conectada

    </div>

</div>

        </header>

    );

}

export default Header;