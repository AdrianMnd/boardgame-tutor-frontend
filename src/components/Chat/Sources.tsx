import "./Sources.css";

import Icon from "../UI/Icon";

import { FileText } from "lucide-react";

import type {
    MessageSource
} from "../../types/MessageSource";

interface Props {

    sources: MessageSource[];

    onOpenSource?: (

        page: number,

        documentId: string

    ) => void;

}

function Sources({

    sources,

    onOpenSource

}: Props) {

    if (sources.length === 0) {

        return null;

    }

    // El nombre del documento solo se muestra si estas fuentes
    // concretas vienen de más de un documento distinto — para
    // la gran mayoría de juegos (un único reglamento) no aporta
    // nada verlo repetido en cada fuente.
    const hasMultipleDocuments =

        new Set(

            sources.map(source => source.documentId)

        ).size > 1;

    return (

        <div className="sources">

            <details>

                <summary>

                    📚 Fuentes ({sources.length})

                </summary>

                <div className="sources-list">

                    {

                        sources.map(source => (

                            <button

                                key={source.id}

                                type="button"

                                className="source-card"

                                disabled={!onOpenSource}

                                onClick={() =>

                                    onOpenSource?.(

                                        source.page,

                                        source.documentId

                                    )

                                }

                            >

                                <div className="source-header">

                                    <span className="source-page">

                                        {

                                            hasMultipleDocuments

                                                ? `${source.documentName} — página ${source.page}`

                                                : `Página ${source.page}`

                                        }

                                    </span>

                                    <span className="source-score">

                                        {(source.score * 100).toFixed(0)}%

                                    </span>

                                </div>

                                <div className="source-text">

                                    {source.text}

                                </div>

                                {

                                    onOpenSource && (

                                        <div className="source-open-hint">

                                            <Icon

                                                icon={FileText}

                                                size={14}

                                            />

                                            {

                                                hasMultipleDocuments

                                                    ? `Ver en ${source.documentName}`

                                                    : "Ver en el reglamento"

                                            }

                                        </div>

                                    )

                                }

                            </button>

                        ))

                    }

                </div>

            </details>

        </div>

    );

}

export default Sources;
