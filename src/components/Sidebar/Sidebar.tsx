import "./Sidebar.css";

const games = [
  "Catan",
  "Terraforming Mars",
  "Ark Nova",
  "Wingspan",
];

function Sidebar() {
  return (
    <aside className="sidebar">
      <h2>Juegos</h2>

      <ul>
        {games.map((game) => (
          <li key={game}>{game}</li>
        ))}
      </ul>
    </aside>
  );
}

export default Sidebar;