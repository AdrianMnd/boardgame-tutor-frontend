import { useState } from "react";

import { useQuery } from "@tanstack/react-query";

import "./App.css";

import Layout from "./components/Layout/Layout";
import Header from "./components/Header/Header";
import Sidebar from "./components/Sidebar/Sidebar";
import Chat from "./components/Chat/Chat";
import Workspace from "./components/Layout/Workspace";
import SplashScreen from "./components/UI/SplashScreen";
import PdfViewer from "./components/PdfViewer/PdfViewer";

import { gamesService } from "./services/games.service";

import type { Game } from "./types/Game";

function App() {

    const [selectedGameId, setSelectedGameId] =
        useState<string | null>(null);

    const [manualState, setManualState] =
        useState<{ page?: number } | null>(null);

    const [isSidebarOpen, setIsSidebarOpen] =
        useState(false);

    const {

        data: games = [],

        isLoading,

        isError,

        refetch

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

    function openManual(

        page?: number

    ) {

        if (!selectedGame) {

            return;

        }

        // Los visores de PDF integrados en <iframe> de los
        // navegadores móviles no soportan de forma fiable el
        // salto a una página concreta (#page=N) — en cambio, el
        // visor nativo a pantalla completa del sistema sí lo
        // hace correctamente. Por eso en móvil se abre
        // directamente ahí en vez de en nuestro modal.
        const isMobile =

            window.matchMedia(
                "(max-width: 768px)"
            ).matches;

        if (isMobile) {

            const url =

                gamesService.getManualUrl(

                    selectedGame.id,

                    page

                );

            window.open(

                url,

                "_blank",

                "noopener,noreferrer"

            );

            return;

        }

        setManualState({ page });

    }

    if (isLoading) {

        return <SplashScreen variant="loading" />;

    }

    if (isError) {

        return (

            <SplashScreen
                variant="error"
                onRetry={() => refetch()}
            />

        );

    }

    return (

        <Layout>

            <Header

                onMenuClick={

                    () => setIsSidebarOpen(true)

                }

            />

            <Workspace>

                <Sidebar

                    games={games}

                    selectedGame={selectedGame}

                    isOpen={isSidebarOpen}

                    onClose={

                        () => setIsSidebarOpen(false)

                    }

                    onSelectGame={(game: Game) => {

                        setSelectedGameId(

                            game.id

                        );

                        setIsSidebarOpen(false);

                    }}

                />

                <Chat

                    game={selectedGame}

                    onOpenManual={

                        openManual

                    }

                    onOpenSidebar={

                        () => setIsSidebarOpen(true)

                    }

                />

            </Workspace>

            {

                manualState && selectedGame && (

                    <PdfViewer

                        game={selectedGame}

                        page={manualState.page}

                        onClose={

                            () =>

                                setManualState(null)

                        }

                    />

                )

            }

        </Layout>

    );

}

export default App;