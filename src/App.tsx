import { useState, lazy, Suspense } from "react";

import { useQuery } from "@tanstack/react-query";

import "./App.css";

import Layout from "./components/Layout/Layout";
import Header from "./components/Header/Header";
import Sidebar from "./components/Sidebar/Sidebar";
import Chat from "./components/Chat/Chat";
import Workspace from "./components/Layout/Workspace";
import SplashScreen from "./components/UI/SplashScreen";
import WelcomePage from "./components/Welcome/WelcomePage";
import AuthModal from "./components/Auth/AuthModal";

import { gamesService } from "./services/games.service";

import { useFavorites } from "./hooks/useFavorites";
import { useCategories } from "./hooks/useCategories";
import { useAuth } from "./hooks/useAuth";

import type { Game } from "./types/Game";
import type { User } from "./types/User";

// react-pdf + pdfjs-dist pesan bastante (~300KB adicionales) y
// solo se necesitan cuando alguien abre un manual — cargarlo de
// forma diferida evita que ese peso retrase la carga inicial de
// la aplicación, que es lo que se usa el 100% de las veces
// (nadie abre la app solo para ver un PDF).
const PdfViewer = lazy(

    () => import("./components/PdfViewer/PdfViewer")

);

function App() {

    const [selectedGameId, setSelectedGameId] =
        useState<string | null>(null);

    const [manualState, setManualState] =
        useState<{ page?: number; documentId?: string } | null>(null);

    const [isSidebarOpen, setIsSidebarOpen] =
        useState(false);

    const [isAuthModalOpen, setIsAuthModalOpen] =
        useState(false);

    const {

        user,

        isLoading: isAuthLoading,

        login,

        register,

        logout

    } = useAuth();

    const {

        isFavorite,

        toggleFavorite,

        migrateLocalFavorites

    } = useFavorites(user);

    const {

        categories,

        createCategory,

        renameCategory,

        deleteCategory,

        toggleGameInCategory,

        isGameInCategory,

        migrateLocalCategories

    } = useCategories(user);

    async function handleAuthenticated(

        _authenticatedUser: User,

        mode: "login" | "register"

    ) {

        setIsAuthModalOpen(false);

        // Solo se migran los datos locales justo tras un
        // registro nuevo — nunca en un login normal, para no
        // mezclar los datos de "invitado" de este navegador con
        // los que ya tuviera una cuenta existente.
        if (mode === "register") {

            await Promise.all([

                migrateLocalFavorites(),

                migrateLocalCategories()

            ]);

        }

    }

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

        page?: number,

        documentId?: string

    ) {

        if (!selectedGame) {

            return;

        }

        setManualState({ page, documentId });

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

                user={user}

                isAuthLoading={isAuthLoading}

                onLoginClick={

                    () => setIsAuthModalOpen(true)

                }

                onLogout={logout}

            />

            <AuthModal

                isOpen={isAuthModalOpen}

                onClose={

                    () => setIsAuthModalOpen(false)

                }

                onAuthenticated={handleAuthenticated}

                login={login}

                register={register}

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

                    categories={categories}

                    onCreateCategory={createCategory}

                    onRenameCategory={renameCategory}

                    onDeleteCategory={deleteCategory}

                    onToggleGameInCategory={toggleGameInCategory}

                    isGameInCategory={isGameInCategory}

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

                    <Suspense

                        fallback={

                            <div

                                className="pdf-loading-overlay"

                                role="status"

                                aria-live="polite"

                            >

                                Cargando visor de PDF…

                            </div>

                        }

                    >

                        <PdfViewer

                            key={`${selectedGame.id}-${manualState.documentId ?? "default"}-${manualState.page ?? "full"}`}

                            game={selectedGame}

                            page={manualState.page}

                            documentId={manualState.documentId}

                            onClose={

                                () =>

                                    setManualState(null)

                            }

                        />

                    </Suspense>

                )

            }

        </Layout>

    );

}

export default App;