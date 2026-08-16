import "./AuthModal.css";
import "./EditProfileModal.css";

import { useState } from "react";

import Icon from "../UI/Icon";

import { X } from "lucide-react";

import { useFocusTrap } from "../../hooks/useFocusTrap";

import { ApiError } from "../../services/apiError";

import type { User } from "../../types/User";

interface Props {

    isOpen: boolean;

    onClose: () => void;

    user: User;

    updateDisplayName: (

        displayName: string

    ) => Promise<User>;

    updateEmail: (

        email: string,

        currentPassword: string

    ) => Promise<User>;

    updatePassword: (

        currentPassword: string,

        newPassword: string

    ) => Promise<void>;

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

/**
 * Tres secciones independientes (nombre, email, contraseña),
 * cada una con su propio botón "Guardar" — así se puede
 * actualizar solo una cosa sin tener que rellenar las demás.
 * Nombre no pide contraseña (riesgo bajo); email y contraseña sí
 * la piden, porque son datos sensibles de la cuenta.
 */
function EditProfileModal({

    isOpen,

    onClose,

    user,

    updateDisplayName,

    updateEmail,

    updatePassword

}: Props) {

    const dialogRef =
        useFocusTrap(isOpen);

    const [displayName, setDisplayName] = useState(user.displayName);
    const [nameError, setNameError] = useState<string | null>(null);
    const [nameSuccess, setNameSuccess] = useState(false);
    const [isSavingName, setIsSavingName] = useState(false);

    const [email, setEmail] = useState(user.email);
    const [emailPassword, setEmailPassword] = useState("");
    const [emailError, setEmailError] = useState<string | null>(null);
    const [emailSuccess, setEmailSuccess] = useState(false);
    const [isSavingEmail, setIsSavingEmail] = useState(false);

    const [currentPassword, setCurrentPassword] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [passwordError, setPasswordError] = useState<string | null>(null);
    const [passwordSuccess, setPasswordSuccess] = useState(false);
    const [isSavingPassword, setIsSavingPassword] = useState(false);

    if (!isOpen) {

        return null;

    }

    function handleClose() {

        onClose();

    }

    async function handleSaveName(

        event: React.FormEvent

    ) {

        event.preventDefault();

        setNameError(null);
        setNameSuccess(false);
        setIsSavingName(true);

        try {

            await updateDisplayName(displayName);

            setNameSuccess(true);

        }
        catch (error) {

            setNameError(friendlyErrorMessage(error));

        }
        finally {

            setIsSavingName(false);

        }

    }

    async function handleSaveEmail(

        event: React.FormEvent

    ) {

        event.preventDefault();

        setEmailError(null);
        setEmailSuccess(false);
        setIsSavingEmail(true);

        try {

            await updateEmail(email, emailPassword);

            setEmailPassword("");

            setEmailSuccess(true);

        }
        catch (error) {

            setEmailError(friendlyErrorMessage(error));

        }
        finally {

            setIsSavingEmail(false);

        }

    }

    async function handleSavePassword(

        event: React.FormEvent

    ) {

        event.preventDefault();

        setPasswordError(null);
        setPasswordSuccess(false);
        setIsSavingPassword(true);

        try {

            await updatePassword(currentPassword, newPassword);

            setCurrentPassword("");
            setNewPassword("");
            setPasswordSuccess(true);

        }
        catch (error) {

            setPasswordError(friendlyErrorMessage(error));

        }
        finally {

            setIsSavingPassword(false);

        }

    }

    return (

        <div

            className="auth-overlay"

            onClick={handleClose}

        >

            <div

                ref={dialogRef as React.RefObject<HTMLDivElement>}

                className="auth-modal edit-profile-modal"

                role="dialog"

                aria-modal="true"

                aria-labelledby="edit-profile-title"

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

                <h2

                    id="edit-profile-title"

                    className="auth-title"

                >

                    Tu cuenta

                </h2>

                <p className="auth-subtitle">

                    Cambia tus datos cuando quieras.

                </p>

                <form

                    className="auth-form"

                    onSubmit={handleSaveName}

                >

                    <label className="auth-field">

                        <span>Nombre</span>

                        <input

                            type="text"

                            required

                            value={displayName}

                            onChange={

                                event => {

                                    setDisplayName(event.target.value);

                                    setNameSuccess(false);

                                }

                            }

                        />

                    </label>

                    {

                        nameError && (

                            <p className="auth-error" role="alert">

                                {nameError}

                            </p>

                        )

                    }

                    <button

                        type="submit"

                        className="auth-submit"

                        disabled={

                            isSavingName ||
                            displayName.trim() === user.displayName

                        }

                    >

                        {

                            isSavingName

                                ? "Guardando..."

                                : nameSuccess

                                    ? "Guardado"

                                    : "Guardar nombre"

                        }

                    </button>

                </form>

                <hr className="edit-profile-divider" />

                <form

                    className="auth-form"

                    onSubmit={handleSaveEmail}

                >

                    <label className="auth-field">

                        <span>Email</span>

                        <input

                            type="email"

                            required

                            value={email}

                            onChange={

                                event => {

                                    setEmail(event.target.value);

                                    setEmailSuccess(false);

                                }

                            }

                        />

                    </label>

                    <label className="auth-field">

                        <span>Contraseña actual</span>

                        <input

                            type="password"

                            autoComplete="current-password"

                            required

                            placeholder="Para confirmar el cambio"

                            value={emailPassword}

                            onChange={

                                event => setEmailPassword(event.target.value)

                            }

                        />

                    </label>

                    {

                        emailError && (

                            <p className="auth-error" role="alert">

                                {emailError}

                            </p>

                        )

                    }

                    <button

                        type="submit"

                        className="auth-submit"

                        disabled={

                            isSavingEmail ||
                            !emailPassword ||
                            email.trim() === user.email

                        }

                    >

                        {

                            isSavingEmail

                                ? "Guardando..."

                                : emailSuccess

                                    ? "Guardado"

                                    : "Guardar email"

                        }

                    </button>

                </form>

                <hr className="edit-profile-divider" />

                <form

                    className="auth-form"

                    onSubmit={handleSavePassword}

                >

                    <label className="auth-field">

                        <span>Contraseña actual</span>

                        <input

                            type="password"

                            autoComplete="current-password"

                            required

                            value={currentPassword}

                            onChange={

                                event => setCurrentPassword(event.target.value)

                            }

                        />

                    </label>

                    <label className="auth-field">

                        <span>Contraseña nueva</span>

                        <input

                            type="password"

                            autoComplete="new-password"

                            required

                            minLength={8}

                            value={newPassword}

                            onChange={

                                event => setNewPassword(event.target.value)

                            }

                        />

                        <span className="auth-hint">

                            Al menos 8 caracteres

                        </span>

                    </label>

                    {

                        passwordError && (

                            <p className="auth-error" role="alert">

                                {passwordError}

                            </p>

                        )

                    }

                    <button

                        type="submit"

                        className="auth-submit"

                        disabled={

                            isSavingPassword ||
                            !currentPassword ||
                            !newPassword

                        }

                    >

                        {

                            isSavingPassword

                                ? "Guardando..."

                                : passwordSuccess

                                    ? "Guardado"

                                    : "Cambiar contraseña"

                        }

                    </button>

                </form>

            </div>

        </div>

    );

}

export default EditProfileModal;
