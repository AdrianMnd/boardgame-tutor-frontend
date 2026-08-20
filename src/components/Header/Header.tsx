import "./Header.css";

import { useRef, useState } from "react";

import { createPortal } from "react-dom";

import Icon from "../UI/Icon";
import ThemeToggle from "../Theme/ThemeToggle";

import {
    Menu,
    LogIn,
    LogOut,
    Settings,
    SlidersHorizontal,
    Gamepad2,
    Bell,
    ShieldCheck
} from "lucide-react";

import logo from "../../assets/logo.svg";

import { usePositionedMenu } from "../../hooks/usePositionedMenu";
import { useNewGames } from "../../hooks/useNewGames";

import type { User } from "../../types/User";
import type { Game } from "../../types/Game";
import type { Theme } from "../../hooks/useTheme";

interface Props {

    onMenuClick: () => void;

    onLogoClick: () => void;

    user: User | null;

    isAuthLoading: boolean;

    onLoginClick: () => void;

    onLogout: () => void;

    onEditProfileClick: () => void;

    onAdminPanelClick: () => void;

    onGameRequestClick: () => void;

    games: Game[];

    theme: Theme;

    onThemeChange: (theme: Theme) => void;

}

function initials(

    displayName: string

): string {

    return displayName

        .trim()

        .split(/\s+/)

        .slice(0, 2)

        .map(word => word[0]?.toUpperCase() ?? "")

        .join("");

}

function Header({

    onMenuClick,

    onLogoClick,

    user,

    isAuthLoading,

    onLoginClick,

    onLogout,

    onEditProfileClick,

    onAdminPanelClick,

    onGameRequestClick,

    games,

    theme,

    onThemeChange

}: Props) {

    const {

        isOpen: isProfileMenuOpen,

        toggle: toggleProfileMenu,

        close: closeProfileMenu,

        buttonRef: profileButtonRef,

        position: profileMenuPosition

    } = usePositionedMenu(

        ".profile-button",

        ".profile-menu"

    );

    const {

        isOpen: isSettingsMenuOpen,

        toggle: toggleSettingsMenu,

        close: closeSettingsMenu,

        buttonRef: settingsButtonRef,

        position: settingsMenuPosition

    } = usePositionedMenu(

        ".header-settings-button",

        ".header-settings-menu"

    );

    const {

        isOpen: isGameRequestHintOpen,

        toggle: toggleGameRequestHint,

        close: closeGameRequestHint,

        buttonRef: gameRequestButtonRef,

        position: gameRequestHintPosition

    } = usePositionedMenu(

        ".header-game-request-button",

        ".header-game-request-hint"

    );

    const { newGames, markAllAsSeen } = useNewGames(games);

    // Foto fija de la lista, capturada solo la PRIMERA vez que
    // se abre el panel en esta sesión (no en cada apertura): si
    // se recapturara cada vez, la segunda apertura leería
    // newGames ya vacío (recién marcado como visto la primera
    // vez) y el aviso "desaparecería para siempre" en cuanto se
    // cerrara el panel una vez — justo el comportamiento confuso
    // que se quería evitar. Con esto, sigue disponible el resto
    // de la sesión, aunque la insignia numérica ya no vuelva a
    // aparecer una vez vista (eso sigue leyendo newGames en
    // vivo, así que se apaga en cuanto se marca como visto).
    const hasCapturedThisSession = useRef(false);

    const [newGamesSnapshot, setNewGamesSnapshot] =

        useState<Game[]>([]);

    const {

        isOpen: isNewGamesPanelOpen,

        toggle: toggleNewGamesPanel,

        buttonRef: newGamesButtonRef,

        position: newGamesPanelPosition

    } = usePositionedMenu(

        ".header-new-games-button",

        ".header-new-games-panel"

    );

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

                <span className="header-game-request-wrapper">

                    <span

                        ref={

                            user

                                ? null

                                : gameRequestButtonRef

                        }

                        role="button"

                        tabIndex={0}

                        className="header-game-request-button"

                        aria-haspopup={user ? undefined : "true"}

                        aria-expanded={

                            user ? undefined : isGameRequestHintOpen

                        }

                        onClick={

                            user

                                ? onGameRequestClick

                                : toggleGameRequestHint

                        }

                        onKeyDown={event => {

                            if (

                                event.key === "Enter" ||
                                event.key === " "

                            ) {

                                event.preventDefault();

                                if (user) {

                                    onGameRequestClick();

                                }
                                else {

                                    toggleGameRequestHint();

                                }

                            }

                        }}

                    >

                        <Icon icon={Gamepad2} size={16} />

                        <span>Solicitar juego</span>

                    </span>

                    {

                        !user &&

                        isGameRequestHintOpen &&

                        gameRequestHintPosition &&

                        createPortal(

                            <div

                                className="header-game-request-hint"

                                role="menu"

                                style={{

                                    top: gameRequestHintPosition.top,

                                    right: gameRequestHintPosition.right

                                }}

                            >

                                <p>

                                    Inicia sesión para poder solicitar un

                                    juego nuevo para el catálogo.

                                </p>

                                <button

                                    type="button"

                                    onClick={() => {

                                        closeGameRequestHint();

                                        onLoginClick();

                                    }}

                                >

                                    <Icon icon={LogIn} size={14} />

                                    Iniciar sesión

                                </button>

                            </div>,

                            document.body

                        )

                    }

                </span>

                <span className="header-new-games-wrapper">

                    <span

                        ref={newGamesButtonRef}

                        role="button"

                        tabIndex={0}

                        className="header-new-games-button"

                        aria-haspopup="true"

                        aria-expanded={isNewGamesPanelOpen}

                        aria-label={

                            newGames.length > 0

                                ? `Novedades — ${newGames.length} juegos nuevos`

                                : "Novedades"

                        }

                        onClick={() => {

                            if (!hasCapturedThisSession.current) {

                                setNewGamesSnapshot(newGames);

                                markAllAsSeen();

                                hasCapturedThisSession.current = true;

                            }

                            toggleNewGamesPanel();

                        }}

                        onKeyDown={event => {

                            if (

                                event.key === "Enter" ||
                                event.key === " "

                            ) {

                                event.preventDefault();

                                if (!hasCapturedThisSession.current) {

                                    setNewGamesSnapshot(newGames);

                                    markAllAsSeen();

                                    hasCapturedThisSession.current = true;

                                }

                                toggleNewGamesPanel();

                            }

                        }}

                    >

                        <Icon icon={Bell} size={17} />

                        {

                            newGames.length > 0 && (

                                <span className="header-new-games-badge">

                                    {

                                        newGames.length > 9

                                            ? "9+"

                                            : newGames.length

                                    }

                                </span>

                            )

                        }

                    </span>

                    {

                        isNewGamesPanelOpen &&

                        newGamesPanelPosition &&

                        createPortal(

                            <div

                                className="header-new-games-panel"

                                role="menu"

                                style={{

                                    top: newGamesPanelPosition.top,

                                    right: newGamesPanelPosition.right

                                }}

                            >

                                <p className="header-new-games-title">

                                    Novedades

                                </p>

                                {

                                    newGamesSnapshot.length === 0

                                        ? (

                                            <p className="header-new-games-empty">

                                                No hay juegos nuevos desde tu

                                                última visita.

                                            </p>

                                        )

                                        : (

                                            <ul className="header-new-games-list">

                                                {

                                                    newGamesSnapshot.map(

                                                        game => (

                                                            <li key={game.id}>

                                                                <span className="header-new-games-name">

                                                                    {game.name}

                                                                </span>

                                                                <span className="header-new-games-date">

                                                                    {

                                                                        game.createdAt

                                                                            ? new Date(

                                                                                game.createdAt

                                                                            ).toLocaleDateString("es-ES", {

                                                                                day: "numeric",

                                                                                month: "short",

                                                                                year: "numeric"

                                                                            })

                                                                            : ""

                                                                    }

                                                                </span>

                                                            </li>

                                                        )

                                                    )

                                                }

                                            </ul>

                                        )

                                }

                            </div>,

                            document.body

                        )

                    }

                </span>

                {

                    isAuthLoading

                        ? null

                        : user

                            ? (

                                <span className="profile-button-wrapper">

                                    <span

                                        ref={profileButtonRef}

                                        role="button"

                                        tabIndex={0}

                                        className="profile-button"

                                        aria-haspopup="true"

                                        aria-expanded={isProfileMenuOpen}

                                        aria-label={

                                            `Menú de ${user.displayName}`

                                        }

                                        onClick={toggleProfileMenu}

                                        onKeyDown={event => {

                                            if (

                                                event.key === "Enter" ||
                                                event.key === " "

                                            ) {

                                                event.preventDefault();

                                                toggleProfileMenu();

                                            }

                                        }}

                                    >

                                        <span className="profile-avatar">

                                            {initials(user.displayName) || "?"}

                                        </span>

                                    </span>

                                    {

                                        isProfileMenuOpen &&

                                        profileMenuPosition &&

                                        createPortal(

                                            <div

                                                className="profile-menu"

                                                role="menu"

                                                style={{

                                                    top: profileMenuPosition.top,

                                                    right: profileMenuPosition.right

                                                }}

                                            >

                                                <div className="profile-menu-header">

                                                    <span className="profile-avatar large">

                                                        {initials(user.displayName) || "?"}

                                                    </span>

                                                    <div>

                                                        <p className="profile-menu-name">

                                                            {user.displayName}

                                                        </p>

                                                        <p className="profile-menu-email">

                                                            {user.email}

                                                        </p>

                                                    </div>

                                                </div>

                                                <p className="profile-menu-section-label">

                                                    Tema

                                                </p>

                                                <ThemeToggle

                                                    theme={theme}

                                                    onChange={onThemeChange}

                                                />

                                                <button

                                                    type="button"

                                                    role="menuitem"

                                                    className="profile-menu-edit"

                                                    onClick={() => {

                                                        closeProfileMenu();

                                                        onEditProfileClick();

                                                    }}

                                                >

                                                    <Icon icon={Settings} size={15} />

                                                    Editar perfil

                                                </button>

                                                {

                                                    user.isAdmin && (

                                                        <button

                                                            type="button"

                                                            role="menuitem"

                                                            className="profile-menu-admin"

                                                            onClick={() => {

                                                                closeProfileMenu();

                                                                onAdminPanelClick();

                                                            }}

                                                        >

                                                            <Icon icon={ShieldCheck} size={15} />

                                                            Panel de administración

                                                        </button>

                                                    )

                                                }

                                                <button

                                                    type="button"

                                                    role="menuitem"

                                                    className="profile-menu-logout"

                                                    onClick={() => {

                                                        closeProfileMenu();

                                                        onLogout();

                                                    }}

                                                >

                                                    <Icon icon={LogOut} size={15} />

                                                    Cerrar sesión

                                                </button>

                                            </div>,

                                            document.body

                                        )

                                    }

                                </span>

                            )

                            : (

                                <>

                                    <span className="header-settings-wrapper">

                                        <span

                                            ref={settingsButtonRef}

                                            role="button"

                                            tabIndex={0}

                                            className="header-settings-button"

                                            aria-haspopup="true"

                                            aria-expanded={isSettingsMenuOpen}

                                            aria-label="Ajustes"

                                            onClick={toggleSettingsMenu}

                                            onKeyDown={event => {

                                                if (

                                                    event.key === "Enter" ||
                                                    event.key === " "

                                                ) {

                                                    event.preventDefault();

                                                    toggleSettingsMenu();

                                                }

                                            }}

                                        >

                                            <Icon icon={SlidersHorizontal} size={17} />

                                        </span>

                                        {

                                            isSettingsMenuOpen &&

                                            settingsMenuPosition &&

                                            createPortal(

                                                <div

                                                    className="header-settings-menu"

                                                    role="menu"

                                                    style={{

                                                        top: settingsMenuPosition.top,

                                                        right: settingsMenuPosition.right

                                                    }}

                                                >

                                                    <p className="profile-menu-section-label">

                                                        Tema

                                                    </p>

                                                    <ThemeToggle

                                                        theme={theme}

                                                        onChange={

                                                            nextTheme => {

                                                                onThemeChange(nextTheme);

                                                                closeSettingsMenu();

                                                            }

                                                        }

                                                    />

                                                </div>,

                                                document.body

                                            )

                                        }

                                    </span>

                                    <button

                                        className="header-login-button"

                                        onClick={onLoginClick}

                                    >

                                        <Icon icon={LogIn} size={16} />

                                        <span>Iniciar sesión</span>

                                    </button>

                                </>

                            )

                }

            </div>

        </header>

    );

}

export default Header;
