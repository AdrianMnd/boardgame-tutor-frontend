import "../Auth/AuthModal.css";
import "./AdminPanelModal.css";

import { useEffect, useState } from "react";

import Icon from "../UI/Icon";

import {
    X,
    ExternalLink,
    FileText,
    Check
} from "lucide-react";

import { adminService } from "../../services/admin.service";

import type { GameRequestListItem } from "../../services/admin.service";

interface Props {

    isOpen: boolean;

    onClose: () => void;

}

function formatDate(

    iso: string

): string {

    return new Date(iso).toLocaleDateString("es-ES", {

        day: "numeric",

        month: "short",

        year: "numeric"

    });

}

function AdminPanelModal({

    isOpen,

    onClose

}: Props) {

    const [requests, setRequests] = useState<GameRequestListItem[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [markingId, setMarkingId] = useState<string | null>(null);

    const [resetEmail, setResetEmail] = useState("");
    const [resetResult, setResetResult] = useState<string | null>(null);
    const [resetError, setResetError] = useState<string | null>(null);
    const [isResetting, setIsResetting] = useState(false);

    // Detecta la transición cerrado→abierto DURANTE el render
    // (no dentro de un efecto) para disparar una carga nueva
    // cada vez que se abre — el modal sigue montado entre
    // aperturas (isOpen es solo un prop), así que sin esto no
    // habría forma de saber que hay que volver a pedir los
    // datos la segunda vez que se abre.
    const [wasOpen, setWasOpen] = useState(false);

    if (isOpen && !wasOpen) {

        setWasOpen(true);

        setIsLoading(true);

        setError(null);

    }
    else if (!isOpen && wasOpen) {

        setWasOpen(false);

    }

    useEffect(() => {

        if (!isOpen || !isLoading) {

            return;

        }

        adminService.listGameRequests()

            .then(setRequests)

            .catch(() => {

                setError(

                    "No se han podido cargar las solicitudes. Inténtalo de nuevo."

                );

            })

            .finally(() => setIsLoading(false));

    }, [isOpen, isLoading]);

    if (!isOpen) {

        return null;

    }

    async function handleResetPassword(

        event: React.FormEvent

    ) {

        event.preventDefault();

        setIsResetting(true);

        setResetError(null);

        setResetResult(null);

        try {

            const temporaryPassword =

                await adminService.resetUserPassword(resetEmail.trim());

            setResetResult(temporaryPassword);

            setResetEmail("");

        }
        catch {

            setResetError(

                "No se ha podido restablecer — comprueba que el email es correcto."

            );

        }
        finally {

            setIsResetting(false);

        }

    }

    async function handleMarkReviewed(

        id: string

    ) {

        setMarkingId(id);

        try {

            await adminService.markGameRequestReviewed(id);

            setRequests(previous =>

                previous.map(request =>

                    request.id === id

                        ? { ...request, reviewed: true }

                        : request

                )

            );

        }
        catch {

            setError(

                "No se ha podido marcar como revisada. Inténtalo de nuevo."

            );

        }
        finally {

            setMarkingId(null);

        }

    }

    const pendingCount =

        requests.filter(request => !request.reviewed).length;

    return (

        <div

            className="auth-overlay"

            onClick={onClose}

        >

            <div

                className="auth-modal admin-panel-modal"

                role="dialog"

                aria-modal="true"

                aria-labelledby="admin-panel-title"

                onClick={

                    event => event.stopPropagation()

                }

            >

                <button

                    className="auth-close-button"

                    onClick={onClose}

                    aria-label="Cerrar"

                >

                    <Icon icon={X} size={18} />

                </button>

                <h2

                    id="admin-panel-title"

                    className="auth-title"

                >

                    Solicitudes de juegos

                </h2>

                <p className="auth-subtitle">

                    {

                        pendingCount > 0

                            ? `${pendingCount} pendiente${pendingCount === 1 ? "" : "s"} de revisar`

                            : "No hay solicitudes pendientes"

                    }

                </p>

                <form

                    className="admin-reset-password-form"

                    onSubmit={handleResetPassword}

                >

                    <label htmlFor="admin-reset-email">

                        Restablecer contraseña de una cuenta

                    </label>

                    <div className="admin-reset-password-row">

                        <input

                            id="admin-reset-email"

                            type="email"

                            placeholder="email@ejemplo.com"

                            required

                            value={resetEmail}

                            onChange={

                                event => setResetEmail(event.target.value)

                            }

                        />

                        <button

                            type="submit"

                            disabled={isResetting}

                        >

                            {

                                isResetting

                                    ? "Un momento…"

                                    : "Restablecer"

                            }

                        </button>

                    </div>

                    {

                        resetError && (

                            <p className="auth-error" role="alert">

                                {resetError}

                            </p>

                        )

                    }

                    {

                        resetResult && (

                            <p

                                className="admin-reset-password-result"

                                role="status"

                            >

                                Contraseña temporal generada:{" "}

                                <code>{resetResult}</code>

                                {" "}— comunícasela por tu correo personal,

                                no por aquí.

                            </p>

                        )

                    }

                </form>

                {

                    isLoading && (

                        <p className="admin-panel-status">

                            Cargando…

                        </p>

                    )

                }

                {

                    error && (

                        <p className="auth-error" role="alert">

                            {error}

                        </p>

                    )

                }

                {

                    !isLoading && !error && requests.length === 0 && (

                        <p className="admin-panel-status">

                            Todavía no ha llegado ninguna solicitud.

                        </p>

                    )

                }

                <ul className="admin-request-list">

                    {

                        requests.map(request => (

                            <li

                                key={request.id}

                                className={

                                    request.reviewed

                                        ? "admin-request-item reviewed"

                                        : "admin-request-item"

                                }

                            >

                                <div className="admin-request-header">

                                    <span className="admin-request-game-name">

                                        {request.gameName}

                                    </span>

                                    <span className="admin-request-date">

                                        {formatDate(request.createdAt)}

                                    </span>

                                </div>

                                <p className="admin-request-requester">

                                    {request.requesterName} · {request.requesterEmail}

                                </p>

                                {

                                    request.bggUrl && (

                                        <a

                                            className="admin-request-link"

                                            href={request.bggUrl}

                                            target="_blank"

                                            rel="noopener noreferrer"

                                        >

                                            <Icon icon={ExternalLink} size={14} />

                                            Ver en BoardGameGeek

                                        </a>

                                    )

                                }

                                {

                                    request.pdfLinks.length > 0 && (

                                        <ul className="admin-request-pdfs">

                                            {

                                                request.pdfLinks.map(

                                                    (link, index) => (

                                                        <li key={link}>

                                                            <a

                                                                className="admin-request-link"

                                                                href={link}

                                                                target="_blank"

                                                                rel="noopener noreferrer"

                                                            >

                                                                <Icon icon={FileText} size={14} />

                                                                PDF {index + 1}

                                                            </a>

                                                        </li>

                                                    )

                                                )

                                            }

                                        </ul>

                                    )

                                }

                                {

                                    request.reviewed

                                        ? (

                                            <span className="admin-request-reviewed-badge">

                                                <Icon icon={Check} size={14} />

                                                Revisada

                                            </span>

                                        )

                                        : (

                                            <button

                                                type="button"

                                                className="admin-request-review-button"

                                                disabled={markingId === request.id}

                                                onClick={

                                                    () => handleMarkReviewed(request.id)

                                                }

                                            >

                                                {

                                                    markingId === request.id

                                                        ? "Marcando…"

                                                        : "Marcar como revisada"

                                                }

                                            </button>

                                        )

                                }

                            </li>

                        ))

                    }

                </ul>

            </div>

        </div>

    );

}

export default AdminPanelModal;
