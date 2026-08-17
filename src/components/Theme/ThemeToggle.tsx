import "./ThemeToggle.css";

import Icon from "../UI/Icon";

import { Sun, Moon } from "lucide-react";

import type { Theme } from "../../hooks/useTheme";

interface Props {

    theme: Theme;

    onChange: (theme: Theme) => void;

}

function ThemeToggle({

    theme,

    onChange

}: Props) {

    return (

        <div

            className="theme-toggle"

            role="group"

            aria-label="Tema de la aplicación"

        >

            <button

                type="button"

                className={

                    theme === "light"

                        ? "theme-toggle-option active"

                        : "theme-toggle-option"

                }

                aria-pressed={theme === "light"}

                onClick={() => onChange("light")}

            >

                <Icon icon={Sun} size={14} />

                Claro

            </button>

            <button

                type="button"

                className={

                    theme === "dark"

                        ? "theme-toggle-option active"

                        : "theme-toggle-option"

                }

                aria-pressed={theme === "dark"}

                onClick={() => onChange("dark")}

            >

                <Icon icon={Moon} size={14} />

                Oscuro

            </button>

        </div>

    );

}

export default ThemeToggle;
