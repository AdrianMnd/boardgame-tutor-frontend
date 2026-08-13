import { useState } from "react";

import {
    describe,
    it,
    expect
} from "vitest";

import {
    render,
    screen
} from "@testing-library/react";

import userEvent from "@testing-library/user-event";

import { useFocusTrap } from "../useFocusTrap";

interface DialogProps {

    isOpen: boolean;

    onClose: () => void;

}

/**
 * Reproduce el patrón real que usa la app (Sidebar): el
 * componente permanece montado, solo cambia el prop `isOpen` —
 * a diferencia de PdfViewer, que se monta/desmonta entero.
 */
function PersistentDialog({

    isOpen,

    onClose

}: DialogProps) {

    const ref = useFocusTrap(isOpen);

    return (

        <div

            ref={ref as React.RefObject<HTMLDivElement>}

            tabIndex={-1}

            data-testid="dialog"

            style={{

                display: isOpen ? "block" : "none"

            }}

        >

            <button>Primero</button>
            <button>Segundo</button>
            <button>Tercero</button>

            <button onClick={onClose}>

                Cerrar

            </button>

        </div>

    );

}

function TestApp() {

    const [open, setOpen] = useState(false);

    return (

        <div>

            <button

                onClick={() => setOpen(true)}

            >

                Abrir diálogo

            </button>

            <PersistentDialog

                isOpen={open}

                onClose={() => setOpen(false)}

            />

        </div>

    );

}

describe("useFocusTrap", () => {

    it("mueve el foco al primer elemento enfocable al abrirse", async () => {

        const user = userEvent.setup();

        render(<TestApp />);

        await user.click(

            screen.getByText("Abrir diálogo")

        );

        expect(

            screen.getByText("Primero")

        ).toHaveFocus();

    });

    it("Tab desde el último elemento vuelve al primero (no escapa del diálogo)", async () => {

        const user = userEvent.setup();

        render(<TestApp />);

        await user.click(

            screen.getByText("Abrir diálogo")

        );

        await user.tab();
        await user.tab();
        await user.tab();

        expect(

            screen.getByText("Cerrar")

        ).toHaveFocus();

        await user.tab();

        expect(

            screen.getByText("Primero")

        ).toHaveFocus();

    });

    it("Shift+Tab desde el primer elemento va al último (no escapa del diálogo)", async () => {

        const user = userEvent.setup();

        render(<TestApp />);

        await user.click(

            screen.getByText("Abrir diálogo")

        );

        expect(

            screen.getByText("Primero")

        ).toHaveFocus();

        await user.tab({ shift: true });

        expect(

            screen.getByText("Cerrar")

        ).toHaveFocus();

    });

    it("devuelve el foco al botón que abrió el diálogo, al cerrarse", async () => {

        const user = userEvent.setup();

        render(<TestApp />);

        const openButton =

            screen.getByText("Abrir diálogo");

        await user.click(openButton);

        expect(

            screen.getByText("Primero")

        ).toHaveFocus();

        await user.click(

            screen.getByText("Cerrar")

        );

        expect(openButton).toHaveFocus();

    });

});
