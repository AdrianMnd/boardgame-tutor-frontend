import "../Auth/AuthModal.css";
import "./ThemeChoiceModal.css";

import Icon from "../UI/Icon";

import { Sun, Moon } from "lucide-react";

import type { Theme } from "../../hooks/useTheme";

interface Props {

    isOpen: boolean;

    onChoose: (theme: Theme) => void;

}

/**
 * Se muestra una única vez, la primera vez que alguien entra —
 * sin botón de cerrar ni clic-fuera-para-cerrar a propósito: es
 * una elección, no algo que deba poder ignorarse a medias. El
 * tema se puede cambiar después en cualquier momento desde el
 * menú de perfil.
 */
function ThemeChoiceModal({

    isOpen,

    onChoose

}: Props) {

    if (!isOpen) {

        return null;

    }

    return (

        <div className="auth-overlay">

            <div

                className="auth-modal theme-choice-modal"

                role="dialog"

                aria-modal="true"

                aria-labelledby="theme-choice-title"

            >

                <h2

                    id="theme-choice-title"

                    className="auth-title"

                >

                    ¿Qué tema prefieres?

                </h2>

                <p className="auth-subtitle">

                    Puedes cambiarlo cuando quieras desde tu perfil.

                </p>

                <div className="theme-choice-options">

                    <button

                        type="button"

                        className="theme-choice-option"

                        onClick={() => onChoose("light")}

                    >

                        <span className="theme-choice-preview light">

                            <Icon icon={Sun} size={22} />

                        </span>

                        Claro

                    </button>

                    <button

                        type="button"

                        className="theme-choice-option"

                        onClick={() => onChoose("dark")}

                    >

                        <span className="theme-choice-preview dark">

                            <Icon icon={Moon} size={22} />

                        </span>

                        Oscuro

                    </button>

                </div>

            </div>

        </div>

    );

}

export default ThemeChoiceModal;
