import "./Sources.css";

import {

    useState

} from "react";

import type {

    MessageSource

} from "../../types/MessageSource";

interface Props {

    sources: MessageSource[];

}

function Sources({

    sources

}: Props) {

    const [

        expanded,

        setExpanded

    ] = useState<Set<string>>(

        new Set()

    );

    if (

        sources.length === 0

    ) {

        return null;

    }

    function toggle(

        id: string

    ) {

        setExpanded(previous => {

            const next =

                new Set(previous);

            if (

                next.has(id)

            ) {

                next.delete(id);

            }

            else {

                next.add(id);

            }

            return next;

        });

    }

    return (

        <section className="sources">

            <h4>

                Fuentes consultadas

            </h4>

            {

                sources.map(source => {

                    const percentage =

                        Math.round(

                            source.score * 100

                        );

                    const preview =

                        source.text.length > 220

                            ? source.text.substring(

                                0,

                                220

                            ) + "..."

                            : source.text;

                    const open =

                        expanded.has(

                            source.id

                        );

                    return (

                        <article

                            key={source.id}

                            className="source-card"

                        >

                            <div className="source-header">

                                <div>

                                    <strong>

                                        📄 Página {source.page}

                                    </strong>

                                </div>

                                <div>

                                    {percentage}%

                                </div>

                            </div>

                            <div className="source-score">

                                <div

                                    className="source-score-bar"

                                    style={{

                                        width:

                                            `${percentage}%`

                                    }}

                                />

                            </div>

                            <p>

                                {

                                    open

                                        ? source.text

                                        : preview

                                }

                            </p>

                            {

                                source.text.length > 220 && (

                                    <button

                                        className="source-toggle"

                                        onClick={() =>

                                            toggle(

                                                source.id

                                            )

                                        }

                                    >

                                        {

                                            open

                                                ? "Ver menos"

                                                : "Ver completo"

                                        }

                                    </button>

                                )

                            }

                        </article>

                    );

                })

            }

        </section>

    );

}

export default Sources;