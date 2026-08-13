import {
    describe,
    it,
    expect,
    vi,
    afterEach
} from "vitest";

import {
    render,
    screen
} from "@testing-library/react";

import { ErrorBoundary } from "../ErrorBoundary";

function ThrowsError(): never {

    throw new Error("Error de prueba");

}

function WorksFine() {

    return (

        <p>Todo va bien</p>

    );

}

describe("ErrorBoundary", () => {

    // React (y jsdom) escriben el error en consola aunque lo
    // capture el ErrorBoundary — se silencia solo en estos
    // tests para no ensuciar la salida, no afecta a la
    // aserción real (que sigue comprobando el fallback visible).
    const consoleErrorSpy =

        vi.spyOn(console, "error")

            .mockImplementation(() => {});

    afterEach(() => {

        consoleErrorSpy.mockClear();

    });

    it("muestra a los hijos con normalidad cuando no hay ningún error", () => {

        render(

            <ErrorBoundary>

                <WorksFine />

            </ErrorBoundary>

        );

        expect(

            screen.getByText("Todo va bien")

        ).toBeInTheDocument();

    });

    it("muestra el mensaje de error en vez de dejar la pantalla en blanco", () => {

        render(

            <ErrorBoundary>

                <ThrowsError />

            </ErrorBoundary>

        );

        expect(

            screen.getByText("Algo ha ido mal")

        ).toBeInTheDocument();

        expect(

            screen.queryByText("Todo va bien")

        ).not.toBeInTheDocument();

    });

    it("ofrece un botón para recargar la página", () => {

        render(

            <ErrorBoundary>

                <ThrowsError />

            </ErrorBoundary>

        );

        expect(

            screen.getByRole(

                "button",

                { name: "Recargar página" }

            )

        ).toBeInTheDocument();

    });

    it("registra el error en consola para poder depurarlo", () => {

        render(

            <ErrorBoundary>

                <ThrowsError />

            </ErrorBoundary>

        );

        expect(consoleErrorSpy).toHaveBeenCalled();

    });

});
