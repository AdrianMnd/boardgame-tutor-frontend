import type { MessageSource } from "../../types/MessageSource";

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

        <div className="message-sources">

            <strong>

                Fuentes

            </strong>

            <ul>

                {

                    sources.map(source => (

                        <li key={source.id}>

                            Página {source.page}

                            {" · "}

                            {(source.score * 100).toFixed(0)}%

                        </li>

                    ))

                }

            </ul>

        </div>

    );

}

export default Sources;