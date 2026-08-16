import {
    describe,
    it,
    expect,
    vi
} from "vitest";

import {
    render,
    screen
} from "@testing-library/react";

import userEvent from "@testing-library/user-event";

import Sidebar from "../Sidebar";

import type { Game } from "../../../types/Game";

const games: Game[] = [

    {

        id: "catan",

        name: "Catan",

        language: "es",

        version: "1.0",

        minPlayers: 3,

        maxPlayers: 4,

        year: 1995

    },

    {

        id: "zombicide",

        name: "Zombicide",

        language: "es",

        version: "1.0",

        minPlayers: 1,

        maxPlayers: 6,

        year: 2021

    },

    {

        id: "nemesis",

        name: "Nemesis",

        language: "es",

        version: "1.0",

        minPlayers: 1,

        maxPlayers: 5,

        year: 2018

    }

];

function renderSidebar(

    overrides: Partial<

        React.ComponentProps<typeof Sidebar>

    > = {}

) {

    const props: React.ComponentProps<typeof Sidebar> = {

        games,

        selectedGame: null,

        onSelectGame: vi.fn(),

        isOpen: true,

        onClose: vi.fn(),

        isFavorite: () => false,

        onToggleFavorite: vi.fn(),

        categories: [],

        onCreateCategory: vi.fn(() => Promise.resolve("new-category-id")),

        onRenameCategory: vi.fn(),

        onDeleteCategory: vi.fn(),

        onToggleGameInCategory: vi.fn(),

        isGameInCategory: () => false,

        ...overrides

    };

    render(<Sidebar {...props} />);

    return props;

}

describe("Sidebar", () => {

    it("muestra todos los juegos por defecto", () => {

        renderSidebar();

        expect(screen.getByText("Catan")).toBeInTheDocument();
        expect(screen.getByText("Zombicide")).toBeInTheDocument();
        expect(screen.getByText("Nemesis")).toBeInTheDocument();

    });

    it("filtra los juegos al buscar por nombre", async () => {

        const user = userEvent.setup();

        renderSidebar();

        await user.type(

            screen.getByLabelText("Buscar juego"),

            "zomb"

        );

        expect(

            screen.getByText("Zombicide")

        ).toBeInTheDocument();

        expect(

            screen.queryByText("Catan")

        ).not.toBeInTheDocument();

        expect(

            screen.queryByText("Nemesis")

        ).not.toBeInTheDocument();

    });

    it("la búsqueda no distingue mayúsculas/minúsculas", async () => {

        const user = userEvent.setup();

        renderSidebar();

        await user.type(

            screen.getByLabelText("Buscar juego"),

            "CATAN"

        );

        expect(

            screen.getByText("Catan")

        ).toBeInTheDocument();

    });

    it("los juegos favoritos aparecen primero en la lista", () => {

        renderSidebar({

            isFavorite: (id: string) => id === "nemesis"

        });

        const names =

            screen

                .getAllByRole("heading", { level: 3 })

                .map(el => el.textContent);

        expect(names[0]).toBe("Nemesis");

    });

    it("llama a onSelectGame al hacer clic en una tarjeta", async () => {

        const user = userEvent.setup();

        const { onSelectGame } = renderSidebar();

        await user.click(

            screen.getByText("Catan")

        );

        expect(onSelectGame).toHaveBeenCalledWith(

            games[0]

        );

    });

    it("llama a onToggleFavorite al pulsar la estrella, sin seleccionar el juego", async () => {

        const user = userEvent.setup();

        const { onToggleFavorite, onSelectGame } =

            renderSidebar();

        await user.click(

            screen.getByLabelText(

                "Marcar Catan como favorito"

            )

        );

        expect(onToggleFavorite).toHaveBeenCalledWith("catan");

        expect(onSelectGame).not.toHaveBeenCalled();

    });

});
