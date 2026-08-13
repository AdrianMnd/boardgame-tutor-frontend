import { Component, type ErrorInfo, type ReactNode } from "react";

import "./ErrorBoundary.css";

interface Props {

    children: ReactNode;

}

interface State {

    hasError: boolean;

}

/**
 * Los límites de error de React solo se pueden implementar
 * como componentes de clase — no existe equivalente con hooks
 * (a fecha de React 19).
 *
 * Sin esto, un error inesperado durante el renderizado de
 * cualquier componente deja toda la aplicación en blanco, sin
 * ningún mensaje ni forma de recuperarse salvo recargar a
 * ciegas. Con esto, se muestra un mensaje claro y un botón para
 * recargar.
 */
export class ErrorBoundary
    extends Component<Props, State> {

    constructor(props: Props) {

        super(props);

        this.state = { hasError: false };

    }

    static getDerivedStateFromError(): State {

        return { hasError: true };

    }

    componentDidCatch(

        error: Error,

        info: ErrorInfo

    ): void {

        console.error(

            "Error no controlado en la aplicación:",

            error,

            info.componentStack

        );

    }

    render() {

        if (!this.state.hasError) {

            return this.props.children;

        }

        return (

            <div className="error-boundary">

                <div className="error-boundary-card">

                    <h1>

                        Algo ha ido mal

                    </h1>

                    <p>

                        Ha ocurrido un error inesperado. Prueba a recargar

                        la página — si el problema persiste, vuelve más

                        tarde.

                    </p>

                    <button

                        onClick={

                            () => window.location.reload()

                        }

                    >

                        Recargar página

                    </button>

                </div>

            </div>

        );

    }

}
