import "../Auth/AuthModal.css";
import "./GameRequestModal.css";

import { useState } from "react";

import Icon from "../UI/Icon";

import {
    X,
    Send,
    Paperclip,
    Check
} from "lucide-react";

import { gameRequestService } from "../../services/gameRequest.service";
import { ApiError } from "../../services/apiError";

interface Props {

    isOpen: boolean;

    onClose: () => void;

}

const MAX_FILES = 10;

const MAX_FILE_SIZE_BYTES = 150 * 1024 * 1024;

const MAX_COVER_SIZE_BYTES = 10 * 1024 * 1024;

function formatFileSize(

    bytes: number

): string {

    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;

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

function GameRequestModal({

    isOpen,

    onClose

}: Props) {

    const [gameName, setGameName] = useState("");
    const [bggUrl, setBggUrl] = useState("");
    const [files, setFiles] = useState<File[]>([]);
    const [coverImage, setCoverImage] = useState<File | null>(null);

    const [error, setError] = useState<string | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isSubmitted, setIsSubmitted] = useState(false);

    if (!isOpen) {

        return null;

    }

    function resetAndClose() {

        setGameName("");
        setBggUrl("");
        setFiles([]);
        setCoverImage(null);
        setError(null);
        setIsSubmitted(false);

        onClose();

    }

    function handleFilesSelected(

        event: React.ChangeEvent<HTMLInputElement>

    ) {

        const selected =
            Array.from(event.target.files ?? []);

        event.target.value = "";

        const combined = [...files, ...selected];

        if (combined.length > MAX_FILES) {

            setError(

                `Puedes adjuntar como máximo ${MAX_FILES} archivos.`

            );

            return;

        }

        const tooLarge =

            selected.find(

                file => file.size > MAX_FILE_SIZE_BYTES

            );

        if (tooLarge) {

            setError(

                `"${tooLarge.name}" supera el tamaño máximo por archivo (150 MB).`

            );

            return;

        }

        setError(null);

        setFiles(combined);

    }

    function removeFile(

        index: number

    ) {

        setFiles(previous =>

            previous.filter(

                (_file, i) => i !== index

            )

        );

    }

    function handleCoverSelected(

        event: React.ChangeEvent<HTMLInputElement>

    ) {

        const selected =
            event.target.files?.[0];

        event.target.value = "";

        if (!selected) {

            return;

        }

        if (!selected.type.startsWith("image/")) {

            setError("La portada debe ser una imagen.");

            return;

        }

        if (selected.size > MAX_COVER_SIZE_BYTES) {

            setError(

                `La imagen de portada supera el tamaño máximo (10 MB).`

            );

            return;

        }

        setError(null);

        setCoverImage(selected);

    }

    function removeCoverImage() {

        setCoverImage(null);

    }

    async function handleSubmit(

        event: React.FormEvent

    ) {

        event.preventDefault();

        setError(null);

        setIsSubmitting(true);

        try {

            await gameRequestService.submit({

                gameName,

                bggUrl:
                    bggUrl.trim() || undefined,

                files,

                coverImage: coverImage ?? undefined

            });

            setIsSubmitted(true);

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

            onClick={resetAndClose}

        >

            <div

                className="auth-modal game-request-modal"

                role="dialog"

                aria-modal="true"

                aria-labelledby="game-request-title"

                onClick={

                    event => event.stopPropagation()

                }

            >

                <button

                    className="auth-close-button"

                    onClick={resetAndClose}

                    aria-label="Cerrar"

                >

                    <Icon icon={X} size={18} />

                </button>

                {

                    isSubmitted

                        ? (

                            <div className="game-request-success">

                                <span className="game-request-success-icon">

                                    <Icon icon={Check} size={28} />

                                </span>

                                <h2

                                    id="game-request-title"

                                    className="auth-title"

                                >

                                    ¡Solicitud enviada!

                                </h2>

                                <p className="auth-subtitle">

                                    Gracias por tu propuesta — la revisaremos y,

                                    si todo encaja, añadiremos el juego al catálogo

                                    en cuanto podamos.

                                </p>

                                <button

                                    type="button"

                                    className="auth-submit"

                                    onClick={resetAndClose}

                                >

                                    Cerrar

                                </button>

                            </div>

                        )

                        : (

                            <>

                                <h2

                                    id="game-request-title"

                                    className="auth-title"

                                >

                                    Solicitar un juego

                                </h2>

                                <p className="auth-subtitle">

                                    ¿Echas en falta algún juego en el catálogo?

                                    Cuéntanos cuál y lo revisaremos.

                                </p>

                                <form

                                    className="auth-form"

                                    onSubmit={handleSubmit}

                                >

                                    <label className="auth-field">

                                        <span>Nombre del juego</span>

                                        <input

                                            type="text"

                                            required

                                            value={gameName}

                                            onChange={

                                                event =>
                                                    setGameName(event.target.value)

                                            }

                                        />

                                    </label>

                                    <label className="auth-field">

                                        <span>Enlace a BoardGameGeek (opcional)</span>

                                        <input

                                            type="url"

                                            placeholder="https://boardgamegeek.com/boardgame/..."

                                            value={bggUrl}

                                            onChange={

                                                event =>
                                                    setBggUrl(event.target.value)

                                            }

                                        />

                                    </label>

                                    <label className="auth-field">

                                        <span>Reglamentos en PDF (opcional)</span>

                                        <span className="auth-hint game-request-pdf-hint">

                                            Puedes aportar los reglamentos en PDF que

                                            dispongas de este juego — si no tienes

                                            ninguno, no pasa nada, los buscaremos

                                            nosotros.

                                        </span>

                                        <label className="game-request-file-picker">

                                            <Icon icon={Paperclip} size={16} />

                                            Añadir PDF

                                            <input

                                                type="file"

                                                accept="application/pdf"

                                                multiple

                                                onChange={handleFilesSelected}

                                                hidden

                                            />

                                        </label>

                                    </label>

                                    {

                                        files.length > 0 && (

                                            <ul className="game-request-file-list">

                                                {

                                                    files.map(

                                                        (file, index) => (

                                                            <li key={`${file.name}-${index}`}>

                                                                <span className="game-request-file-name">

                                                                    {file.name}

                                                                </span>

                                                                <span className="game-request-file-size">

                                                                    {formatFileSize(file.size)}

                                                                </span>

                                                                <button

                                                                    type="button"

                                                                    aria-label={`Quitar ${file.name}`}

                                                                    onClick={

                                                                        () => removeFile(index)

                                                                    }

                                                                >

                                                                    <Icon icon={X} size={13} />

                                                                </button>

                                                            </li>

                                                        )

                                                    )

                                                }

                                            </ul>

                                        )

                                    }

                                    <label className="auth-field">

                                        <span>Portada del juego (opcional)</span>

                                        <span className="auth-hint game-request-pdf-hint">

                                            Una imagen de la caja o portada del juego,

                                            si tienes una a mano.

                                        </span>

                                        {

                                            coverImage

                                                ? (

                                                    <div className="game-request-cover-selected">

                                                        <span className="game-request-file-name">

                                                            {coverImage.name}

                                                        </span>

                                                        <span className="game-request-file-size">

                                                            {formatFileSize(coverImage.size)}

                                                        </span>

                                                        <button

                                                            type="button"

                                                            aria-label="Quitar portada"

                                                            onClick={removeCoverImage}

                                                        >

                                                            <Icon icon={X} size={13} />

                                                        </button>

                                                    </div>

                                                )
                                                : (

                                                    <label className="game-request-file-picker">

                                                        <Icon icon={Paperclip} size={16} />

                                                        Añadir portada

                                                        <input

                                                            type="file"

                                                            accept="image/*"

                                                            onChange={handleCoverSelected}

                                                            hidden

                                                        />

                                                    </label>

                                                )

                                        }

                                    </label>

                                    {

                                        error && (

                                            <p className="auth-error" role="alert">

                                                {error}

                                            </p>

                                        )

                                    }

                                    <button

                                        type="submit"

                                        className="auth-submit"

                                        disabled={isSubmitting}

                                    >

                                        <Icon icon={Send} size={16} />

                                        {

                                            isSubmitting

                                                ? "Enviando..."

                                                : "Enviar solicitud"

                                        }

                                    </button>

                                </form>

                            </>

                        )

                }

            </div>

        </div>

    );

}

export default GameRequestModal;
