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

// Se define fuera del componente (referencia estable) — si se
// pasara un objeto literal nuevo en cada render, react-pdf
// recargaría el PDF entero cada vez sin motivo.
//
// wasmUrl le dice a pdf.js dónde están los ficheros WASM que
// necesita para decodificar imágenes JPEG2000 (formato JPX,
// usado en algunos PDFs para portadas/ilustraciones). Sin esto,
// esas páginas fallan al renderizar con errores de "OpenJPEG
// failed to initialize" en la consola — el PDF entero o algunas
// páginas concretas se quedan en blanco.
const PDF_DOCUMENT_OPTIONS = {

    wasmUrl: "/pdfjs-wasm/"

};

import Icon from "../UI/Icon";

import {
    X,
    ExternalLink,
    ChevronLeft,
    ChevronRight
} from "lucide-react";

import { gamesService } from "../../services/games.service";

import { useFocusTrap } from "../../hooks/useFocusTrap";

import type { Game } from "../../types/Game";

interface Props {

    game: Game;

    page?: number;

    documentId?: string;

    onClose: () => void;

}

function PdfViewer({

    game,

    page,

    documentId,

    onClose

}: Props) {

    const activeDocument =

        documentId

            ? game.documents.find(

                document => document.id === documentId

            )

            : game.documents[0];

    const pdfUrl =
        gamesService.getManualUrl(
            game.id,

            activeDocument?.id

        );

    const [currentPage, setCurrentPage] =
        useState(page ?? 1);

    const [totalPages, setTotalPages] =
        useState<number | null>(null);

    const [loadError, setLoadError] =
        useState(false);

    const containerRef =
        useRef<HTMLDivElement>(null);

    // PdfViewer solo existe en el DOM mientras está abierto (lo
    // monta/desmonta App.tsx condicionalmente) — siempre actúa
    // como diálogo modal mientras está montado.
    const dialogRef =
        useFocusTrap(true);

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

                ref={dialogRef as React.RefObject<HTMLElement>}

                role="dialog"

                aria-modal="true"

                aria-labelledby="pdf-viewer-title"

                tabIndex={-1}

                className="pdf-viewer"

                onClick={

                    event =>

                        event.stopPropagation()

                }

            >

                <div className="pdf-viewer-header">

                    <div>

                        <h2 id="pdf-viewer-title">

                            {game.name}

                            {

                                game.documents.length > 1 &&

                                activeDocument && (

                                    <span className="pdf-viewer-document-badge">

                                        {activeDocument.name}

                                    </span>

                                )

                            }

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

                                options={PDF_DOCUMENT_OPTIONS}

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
