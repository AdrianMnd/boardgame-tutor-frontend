import "./Sources.css";

import Icon from "../UI/Icon";

import { FileText } from "lucide-react";

import type {
    MessageSource
} from "../../types/MessageSource";

interface Props {

    sources: MessageSource[];

    onOpenSource?: (page: number) => void;

}

function Sources({

    sources,

    onOpenSource

}: Props) {

    if (sources.length === 0) {

        return null;

    }

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

                                        source.page

                                    )

                                }

                            >

                                <div className="source-header">

                                    <span className="source-page">

                                        Página {source.page}

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

                                            Ver en el reglamento

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
