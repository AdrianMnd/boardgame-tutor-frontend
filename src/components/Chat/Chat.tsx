import "./Chat.css";

function Chat() {
  return (
    <section className="chat">
      <div className="chat-messages">
        <h2>Conversación</h2>
      </div>

      <div className="chat-input">
        <input placeholder="Pregunta sobre un juego..." />
        <button>Enviar</button>
      </div>
    </section>
  );
}

export default Chat;