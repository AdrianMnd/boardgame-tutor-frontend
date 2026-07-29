import { useState } from "react";
import { games } from "./utils/consts/games";
import type { Game } from "./types/Game";

import "./App.css";

import Layout from "./components/Layout/Layout";
import Header from "./components/Header/Header";
import Sidebar from "./components/Sidebar/Sidebar";
import Chat from "./components/Chat/Chat";

function App() {

  const [selectedGame, setSelectedGame] = useState<Game | null>(games[0]);

  return (
    <Layout>
      <Header />

      <main className="main-content">
        <Sidebar
                    games={games}
                    selectedGame={selectedGame}
                    onSelectGame={setSelectedGame}
                />
                <Chat
                    game={selectedGame}
                />
      </main>
    </Layout>
  );
}

export default App;