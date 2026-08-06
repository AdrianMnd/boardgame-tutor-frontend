import { useState } from "react";

import { useQuery } from "@tanstack/react-query";

import "./App.css";

import Layout from "./components/Layout/Layout";
import Header from "./components/Header/Header";
import Sidebar from "./components/Sidebar/Sidebar";
import Chat from "./components/Chat/Chat";
import Workspace
    from "./components/Layout/Workspace";

import { gamesService } from "./services/games.service";

import type { Game } from "./types/Game";

function App() {

    const [selectedGameId, setSelectedGameId] =
        useState<string | null>(null);

    const {

        data: games = [],

        isLoading,

        isError

    } = useQuery<Game[]>({

        queryKey: ["games"],

        queryFn: () =>

            gamesService.listGames()

    });

    const selectedGame =

        games.find(

            game =>

                game.id === selectedGameId

        )

        ?? games[0]

        ?? null;

    if (isLoading) {

        return <p>Cargando juegos...</p>;

    }

    if (isError) {

        return <p>Error cargando juegos</p>;

    }

    return (

        <Layout>

            <Header />

            <Workspace>

                <Sidebar

                    games={games}

                    selectedGame={selectedGame}

                    onSelectGame={(game: Game) =>

                        setSelectedGameId(

                            game.id

                        )

                    }

                />

                <Chat

                    game={selectedGame}

                />

            </Workspace>

        </Layout>

    );

}

export default App;