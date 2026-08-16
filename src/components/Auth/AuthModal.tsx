import "./AuthModal.css";

import { useState } from "react";

import Icon from "../UI/Icon";

import { X, LogIn, UserPlus } from "lucide-react";

import { useFocusTrap } from "../../hooks/useFocusTrap";

import { ApiError } from "../../services/apiError";

import type { User } from "../../types/User";

type Mode = "login" | "register";

interface Props {

    isOpen: boolean;

    onClose: () => void;

    onAuthenticated: (

        user: User,

        mode: Mode

    ) => void;

    login: (

        email: string,

        password: string

    ) => Promise<User>;

    register: (

        email: string,

        password: string,

        displayName: string

    ) => Promise<User>;

}

function friendlyErrorMessage(

    error: unknown

): string {

    if (error instanceof ApiError) {

        const body = error.body as { message?: string } | undefined;

        if (typeof body?.message === "string") {

            return body.message;

        }

    }

    return "Ha ocurrido un error. Inténtalo de nuevo.";

}

function AuthModal({

    isOpen,

    onClose,

    onAuthenticated,

    login,

    register

}: Props) {

    const dialogRef =
        useFocusTrap(isOpen);

    const [mode, setMode] =
        useState<Mode>("login");

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [displayName, setDisplayName] = useState("");

    const [error, setError] = useState<string | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Vuelve a "login" cada vez que el modal se cierra, sea cual
    // sea el motivo (botón de cerrar, clic fuera, o tras
    // autenticarse con éxito) — así la próxima vez que se abra
    // siempre empieza por "Iniciar sesión", en vez de quedarse
    // atascado en "Crear cuenta" si la última vez se usó para
    // registrarse. El componente no se desmonta al cerrarse
    // (solo deja de pintar nada), así que su estado interno
    // sobrevive entre aperturas si no se resetea explícitamente.
    // Se ajusta aquí, durante el render, en vez de en un efecto
    // — la propia condición (mode !== "login") evita cualquier
    // bucle, porque en cuanto se resetea deja de cumplirse.
    if (!isOpen && mode !== "login") {

        setMode("login");

    }

    if (!isOpen) {

        return null;

    }

    function resetForm() {

        setEmail("");
        setPassword("");
        setDisplayName("");
        setError(null);

    }

    function switchMode(

        nextMode: Mode

    ) {

        setMode(nextMode);

        resetForm();

    }

    function handleClose() {

        resetForm();

        onClose();

    }

    async function handleSubmit(

        event: React.FormEvent

    ) {

        event.preventDefault();

        setError(null);

        setIsSubmitting(true);

        try {

            const user =

                mode === "login"

                    ? await login(email, password)

                    : await register(email, password, displayName);

            resetForm();

            onAuthenticated(user, mode);

        }
        catch (submitError) {

            setError(

                friendlyErrorMessage(submitError)

            );

        }
        finally {

            setIsSubmitting(false);

        }

    }

    return (

        <div

            className="auth-overlay"

            onClick={handleClose}

        >

            <div

                ref={dialogRef as React.RefObject<HTMLDivElement>}

                className="auth-modal"

                role="dialog"

                aria-modal="true"

                aria-labelledby="auth-modal-title"

                onClick={

                    event => event.stopPropagation()

                }

            >

                <button

                    className="auth-close-button"

                    onClick={handleClose}

                    aria-label="Cerrar"

                >

                    <Icon icon={X} size={18} />

                </button>

                <div className="auth-tabs">

                    <button

                        type="button"

                        className={

                            mode === "login"

                                ? "auth-tab active"

                                : "auth-tab"

                        }

                        onClick={() => switchMode("login")}

                    >

                        Iniciar sesión

                    </button>

                    <button

                        type="button"

                        className={

                            mode === "register"

                                ? "auth-tab active"

                                : "auth-tab"

                        }

                        onClick={() => switchMode("register")}

                    >

                        Crear cuenta

                    </button>

                </div>

                <h2

                    id="auth-modal-title"

                    className="auth-title"

                >

                    {

                        mode === "login"

                            ? "Bienvenido de nuevo"

                            : "Crea tu cuenta"

                    }

                </h2>

                <p className="auth-subtitle">

                    {

                        mode === "login"

                            ? "Inicia sesión para tener tus favoritos y categorías en cualquier dispositivo."

                            : "Es gratis, y puedes seguir usando la app sin cuenta si lo prefieres."

                    }

                </p>

                <form

                    className="auth-form"

                    onSubmit={handleSubmit}

                >

                    {

                        mode === "register" && (

                            <label className="auth-field">

                                <span>Nombre</span>

                                <input

                                    type="text"

                                    autoComplete="name"

                                    required

                                    value={displayName}

                                    onChange={

                                        event =>
                                            setDisplayName(event.target.value)

                                    }

                                />

                            </label>

                        )

                    }

                    <label className="auth-field">

                        <span>Email</span>

                        <input

                            type="email"

                            autoComplete="email"

                            required

                            value={email}

                            onChange={

                                event => setEmail(event.target.value)

                            }

                        />

                    </label>

                    <label className="auth-field">

                        <span>Contraseña</span>

                        <input

                            type="password"

                            autoComplete={

                                mode === "login"

                                    ? "current-password"

                                    : "new-password"

                            }

                            required

                            minLength={

                                mode === "register" ? 8 : undefined

                            }

                            value={password}

                            onChange={

                                event => setPassword(event.target.value)

                            }

                        />

                        {

                            mode === "register" && (

                                <span className="auth-hint">

                                    Al menos 8 caracteres

                                </span>

                            )

                        }

                    </label>

                    {

                        error && (

                            <p

                                className="auth-error"

                                role="alert"

                            >

                                {error}

                            </p>

                        )

                    }

                    <button

                        type="submit"

                        className="auth-submit"

                        disabled={isSubmitting}

                    >

                        <Icon

                            icon={mode === "login" ? LogIn : UserPlus}

                            size={17}

                        />

                        {

                            isSubmitting

                                ? "Un momento..."

                                : mode === "login"

                                    ? "Iniciar sesión"

                                    : "Crear cuenta"

                        }

                    </button>

                </form>

            </div>

        </div>

    );

}

export default AuthModal;
