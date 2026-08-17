import "./Header.css";

import { createPortal } from "react-dom";

import Icon from "../UI/Icon";
import ThemeToggle from "../Theme/ThemeToggle";

import {
    Menu,
    LogIn,
    LogOut,
    Settings,
    SlidersHorizontal
} from "lucide-react";

import logo from "../../assets/logo.svg";

import { usePositionedMenu } from "../../hooks/usePositionedMenu";

import type { User } from "../../types/User";
import type { Theme } from "../../hooks/useTheme";

interface Props {

    onMenuClick: () => void;

    onLogoClick: () => void;

    user: User | null;

    isAuthLoading: boolean;

    onLoginClick: () => void;

    onLogout: () => void;

    onEditProfileClick: () => void;

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
