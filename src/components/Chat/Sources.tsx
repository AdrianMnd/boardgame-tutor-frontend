import "./Sources.css";

import type {
    MessageSource
} from "../../types/MessageSource";

interface Props {

    sources: MessageSource[];

}

function Sources({

    sources

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

                            <div

                                key={source.id}

                                className="source-card"

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

                            </div>

                        ))

                    }

                </div>

            </details>

        </div>

    );

}

export default Sources;