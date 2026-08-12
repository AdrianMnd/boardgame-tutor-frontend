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
import WelcomePage from "./components/Welcome/WelcomePage";

import { gamesService } from "./services/games.service";

import { useFavorites } from "./hooks/useFavorites";

import type { Game } from "./types/Game";

function App() {

    const [selectedGameId, setSelectedGameId] =
        useState<string | null>(null);

    const [manualState, setManualState] =
        useState<{ page?: number } | null>(null);

    const [isSidebarOpen, setIsSidebarOpen] =
        useState(false);

    const {

        isFavorite,

        toggleFavorite

    } = useFavorites();

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

    // A diferencia de antes, si no se ha elegido ningún juego
    // todavía no se cae automáticamente al primero del catálogo
    // — se muestra la pantalla de bienvenida en su lugar.
    const selectedGame =

        games.find(

            game =>

                game.id === selectedGameId

        )

        ?? null;

    const favoriteGames =

        games.filter(

            game => isFavorite(game.id)

        );

    function openManual(

        page?: number

    ) {

        if (!selectedGame) {

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

                onLogoClick={

                    () => setSelectedGameId(null)

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

                    isFavorite={isFavorite}

                    onToggleFavorite={toggleFavorite}

                />

                {

                    selectedGame

                        ? (

                            <Chat

                                game={selectedGame}

                                onOpenManual={

                                    openManual

                                }

                                onOpenSidebar={

                                    () => setIsSidebarOpen(true)

                                }

                            />

                        )
                        : (

                            <WelcomePage

                                favoriteGames={favoriteGames}

                                onSelectGame={(game: Game) =>

                                    setSelectedGameId(game.id)

                                }

                                onOpenSidebar={

                                    () => setIsSidebarOpen(true)

                                }

                            />

                        )

                }

            </Workspace>

            {

                manualState && selectedGame && (

                    <PdfViewer

                        key={`${selectedGame.id}-${manualState.page ?? "full"}`}

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