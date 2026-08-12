import "./PdfViewer.css";
import "react-pdf/dist/Page/AnnotationLayer.css";
import "react-pdf/dist/Page/TextLayer.css";

import {
    useEffect,
    useState,
    useRef
} from "react";

import { Document, Page, pdfjs } from "react-pdf";

// Vite: se importa el fichero del worker como recurso estático
// y se usa la URL resultante. Se fija pdfjs-dist como
// dependencia directa en la MISMA versión que usa react-pdf
// internamente — una discrepancia de versión entre el worker y
// la librería principal rompe la carga del PDF.
import pdfWorkerUrl from "pdfjs-dist/build/pdf.worker.min.mjs?url";

pdfjs.GlobalWorkerOptions.workerSrc = pdfWorkerUrl;

import Icon from "../UI/Icon";

import {
    X,
    ExternalLink,
    ChevronLeft,
    ChevronRight
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
            game.id
        );

    const [currentPage, setCurrentPage] =
        useState(page ?? 1);

    const [totalPages, setTotalPages] =
        useState<number | null>(null);

    const [loadError, setLoadError] =
        useState(false);

    const containerRef =
        useRef<HTMLDivElement>(null);

    const [pageWidth, setPageWidth] =
        useState(600);

    // El ancho de página se ajusta al contenedor disponible,
    // para que se vea bien tanto en un modal ancho de escritorio
    // como en la pantalla estrecha de un móvil.
    useEffect(() => {

        function updateWidth() {

            const width =
                containerRef.current?.clientWidth;

            if (width) {

                setPageWidth(

                    Math.min(width - 32, 900)

                );

            }

        }

        updateWidth();

        window.addEventListener("resize", updateWidth);

        return () =>

            window.removeEventListener("resize", updateWidth);

    }, []);

    // Si se abre desde una fuente distinta (otra página) sin
    // desmontar el componente, la página actual se actualiza.

    useEffect(() => {

        function handleKeyDown(

            event: KeyboardEvent

        ) {

            if (event.key === "Escape") {

                onClose();

            }
            else if (

                event.key === "ArrowRight" &&

                totalPages &&

                currentPage < totalPages

            ) {

                setCurrentPage(p => p + 1);

            }
            else if (

                event.key === "ArrowLeft" &&

                currentPage > 1

            ) {

                setCurrentPage(p => p - 1);

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

    }, [onClose, currentPage, totalPages]);

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

                                totalPages

                                    ? `Reglamento — página ${currentPage} de ${totalPages}`

                                    : "Reglamento"

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

                <div

                    className="pdf-viewer-content"

                    ref={containerRef}

                >

                    {

                        loadError

                            ?

                            <div className="pdf-viewer-error">

                                <p>

                                    No se ha podido cargar el reglamento aquí.

                                </p>

                                <a

                                    href={pdfUrl}

                                    target="_blank"

                                    rel="noreferrer"

                                >

                                    Abrir en una pestaña nueva

                                </a>

                            </div>

                            :

                            <Document

                                file={pdfUrl}

                                onLoadSuccess={

                                    ({ numPages }) =>

                                        setTotalPages(numPages)

                                }

                                onLoadError={

                                    () => setLoadError(true)

                                }

                                loading={

                                    <p className="pdf-viewer-loading">

                                        Cargando reglamento…

                                    </p>

                                }

                            >

                                <Page

                                    pageNumber={currentPage}

                                    width={pageWidth}

                                    loading={

                                        <p className="pdf-viewer-loading">

                                            Cargando página…

                                        </p>

                                    }

                                />

                            </Document>

                    }

                </div>

                {

                    totalPages && totalPages > 1 && (

                        <div className="pdf-viewer-nav">

                            <button

                                onClick={

                                    () =>

                                        setCurrentPage(p =>

                                            Math.max(1, p - 1)

                                        )

                                }

                                disabled={currentPage <= 1}

                                aria-label="Página anterior"

                            >

                                <Icon

                                    icon={ChevronLeft}

                                    size={18}

                                />

                            </button>

                            <span>

                                {currentPage} / {totalPages}

                            </span>

                            <button

                                onClick={

                                    () =>

                                        setCurrentPage(p =>

                                            Math.min(

                                                totalPages,

                                                p + 1

                                            )

                                        )

                                }

                                disabled={currentPage >= totalPages}

                                aria-label="Página siguiente"

                            >

                                <Icon

                                    icon={ChevronRight}

                                    size={18}

                                />

                            </button>

                        </div>

                    )

                }

            </section>

        </div>

    );

}

export default PdfViewer;
