import "./Header.css";

import {
    useEffect,
    useRef,
    useState
} from "react";

import { createPortal } from "react-dom";

import Icon from "../UI/Icon";

import {
    Menu,
    LogIn,
    LogOut
} from "lucide-react";

import logo from "../../assets/logo.svg";

import type { User } from "../../types/User";

interface Props {

    onMenuClick: () => void;

    onLogoClick: () => void;

    user: User | null;

    isAuthLoading: boolean;

    onLoginClick: () => void;

    onLogout: () => void;

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

    onLogout

}: Props) {

    const [isMenuOpen, setIsMenuOpen] = useState(false);

    const buttonRef = useRef<HTMLSpanElement>(null);

    const [position, setPosition] =

        useState<{ top: number; right: number } | null>(

            null

        );

    useEffect(() => {

        if (!isMenuOpen || !buttonRef.current) {

            setPosition(null);

            return;

        }

        function updatePosition() {

            const button = buttonRef.current;

            if (!button) {

                return;

            }

            const rect = button.getBoundingClientRect();

            setPosition({

                top: rect.bottom + 8,

                right: window.innerWidth - rect.right

            });

        }

        updatePosition();

        window.addEventListener("resize", updatePosition);

        return () =>
            window.removeEventListener("resize", updatePosition);

    }, [isMenuOpen]);

    useEffect(() => {

        if (!isMenuOpen) {

            return;

        }

        function handleClickOutside(

            event: MouseEvent

        ) {

            const target = event.target as HTMLElement;

            if (

                !target.closest(".profile-button") &&
                !target.closest(".profile-menu")

            ) {

                setIsMenuOpen(false);

            }

        }

        function handleEscape(

            event: KeyboardEvent

        ) {

            if (event.key === "Escape") {

                setIsMenuOpen(false);

            }

        }

        document.addEventListener("mousedown", handleClickOutside);
        document.addEventListener("keydown", handleEscape);

        return () => {

            document.removeEventListener("mousedown", handleClickOutside);
            document.removeEventListener("keydown", handleEscape);

        };

    }, [isMenuOpen]);

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

                                        ref={buttonRef}

                                        role="button"

                                        tabIndex={0}

                                        className="profile-button"

                                        aria-haspopup="true"

                                        aria-expanded={isMenuOpen}

                                        aria-label={

                                            `Menú de ${user.displayName}`

                                        }

                                        onClick={

                                            () => setIsMenuOpen(open => !open)

                                        }

                                        onKeyDown={event => {

                                            if (

                                                event.key === "Enter" ||
                                                event.key === " "

                                            ) {

                                                event.preventDefault();

                                                setIsMenuOpen(open => !open);

                                            }

                                        }}

                                    >

                                        <span className="profile-avatar">

                                            {initials(user.displayName) || "?"}

                                        </span>

                                    </span>

                                    {

                                        isMenuOpen &&

                                        position &&

                                        createPortal(

                                            <div

                                                className="profile-menu"

                                                role="menu"

                                                style={{

                                                    top: position.top,

                                                    right: position.right

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

                                                <button

                                                    type="button"

                                                    role="menuitem"

                                                    className="profile-menu-logout"

                                                    onClick={() => {

                                                        setIsMenuOpen(false);

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

                                <button

                                    className="header-login-button"

                                    onClick={onLoginClick}

                                >

                                    <Icon icon={LogIn} size={16} />

                                    <span>Iniciar sesión</span>

                                </button>

                            )

                }

            </div>

        </header>

    );

}

export default Header;
