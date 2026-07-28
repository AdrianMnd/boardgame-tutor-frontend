import "./App.css";

import Layout from "./components/Layout/Layout";
import Header from "./components/Header/Header";
import Sidebar from "./components/Sidebar/Sidebar";
import Chat from "./components/Chat/Chat";

function App() {
  return (
    <Layout>
      <Header />

      <main className="main-content">
        <Sidebar />
        <Chat />
      </main>
    </Layout>
  );
}

export default App;