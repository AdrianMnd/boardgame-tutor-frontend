import "./SplashScreen.css";

import Icon from "./Icon";

import {
    Bot,
    WifiOff,
    RotateCw
} from "lucide-react";

interface Props {

    variant: "loading" | "error";

    onRetry?: () => void;

}

function SplashScreen({

    variant,

    onRetry

}: Props) {

    const isError =
        variant === "error";

    return (

        <div className="splash">

            <div className="splash-card">

                <div
                    className={
                        isError
                            ? "splash-mark splash-mark-error"
                            : "splash-mark"
                    }
                >

                    <Icon
                        icon={isError ? WifiOff : Bot}
                        size={30}
                    />

                    {
                        !isError && (
                            <span className="splash-ring" />
                        )
                    }

                </div>

                <h1>
                    {
                        isError
                            ? "No hemos podido conectar"
                            : "Preparando tu mesa de juego"
                    }
                </h1>

                <p>
                    {
                        isError
                            ? "Revisa tu conexión o inténtalo de nuevo en unos segundos."
                            : "Cargando la biblioteca de reglamentos…"
                    }
                </p>

                {
                    isError
                        ?
                        <button
                            className="splash-retry"
                            onClick={onRetry}
                        >
                            <Icon
                                icon={RotateCw}
                                size={16}
                            />
                            Reintentar
                        </button>
                        :
                        <div className="splash-dots">
                            <span />
                            <span />
                            <span />
                        </div>
                }

            </div>

        </div>

    );

}

export default SplashScreen;
