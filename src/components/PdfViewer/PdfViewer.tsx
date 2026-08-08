import "./PdfViewer.css";

import { useEffect } from "react";

import Icon from "../UI/Icon";

import {
    X,
    ExternalLink
} from "lucide-react";

import { gamesService } from "../../services/games.service";

import type { Game } from "../../types/Game";

interface Props {

    game: Game;

    page?: number;

    onClose: () => void;

}

function PdfViewer({

    game,

    page,

    onClose

}: Props) {

    const pdfUrl =
        gamesService.getManualUrl(
            game.id,
            page
        );

    useEffect(() => {

        function handleKeyDown(

            event: KeyboardEvent

        ) {

            if (event.key === "Escape") {

                onClose();

            }

        }

        document.addEventListener(
            "keydown",
            handleKeyDown
        );

        return () =>

            document.removeEventListener(

                "keydown",

                handleKeyDown

            );

    }, [onClose]);

    return (

        <div

            className="pdf-overlay"

            onClick={onClose}

        >

            <section

                className="pdf-viewer"

                onClick={

                    event =>

                        event.stopPropagation()

                }

            >

                <div className="pdf-viewer-header">

                    <div>

                        <h2>

                            {game.name}

                        </h2>

                        <p>

                            {

                                page

                                    ? `Reglamento — página ${page}`

                                    : "Reglamento completo"

                            }

                        </p>

                    </div>

                    <div className="pdf-viewer-actions">

                        <a

                            className="pdf-viewer-external"

                            href={pdfUrl}

                            target="_blank"

                            rel="noreferrer"

                        >

                            <Icon

                                icon={ExternalLink}

                                size={16}

                            />

                            <span>

                                Abrir en pestaña nueva

                            </span>

                        </a>

                        <button

                            className="pdf-viewer-close"

                            onClick={onClose}

                            aria-label="Cerrar"

                        >

                            <Icon

                                icon={X}

                                size={20}

                            />

                        </button>

                    </div>

                </div>

                <div className="pdf-viewer-content">

                    <iframe

                        key={pdfUrl}

                        src={pdfUrl}

                        title={`Reglamento de ${game.name}`}

                        className="pdf-viewer-frame"

                    />

                </div>

            </section>

        </div>

    );

}

export default PdfViewer;
