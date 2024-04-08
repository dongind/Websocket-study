import { useEffect, useState } from "react";

const WebSocketComponent: React.FC = () => {
  const [socket, setSocket] = useState<WebSocket | null>(null);
  const [message, setMessage] = useState<string>("");
  const [received, setReceived] = useState<string>("");

  useEffect(() => {
    // connecting websocket
    const ws = new WebSocket("ws://localhost:8080/");

    ws.onopen = () => {
      console.log("WebSocket Connected");
    };

    ws.onmessage = async (event: MessageEvent<any>) => {
      setReceived(await event.data.text());
    };

    ws.onclose = () => {
      console.log("WebSocket disconnected");
    };

    setSocket(ws);

    return () => {
      ws.close();
    };
  }, []);

  const sendMessage = () => {
    if (socket) {
      socket.send(message);
      setMessage("");
    }
  };

  const handleInputChange: React.ChangeEventHandler<HTMLInputElement> = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    setMessage(event.target.value);
  };

  return (
    <div>
      <h1>WebSocket Example</h1>
      <input type="text" value={message} onChange={handleInputChange} />
      <button onClick={sendMessage}>Send</button>
      <div>
        <h2>Received Message:</h2>
        <p>{received}</p>
      </div>
    </div>
  );
};

export default WebSocketComponent;
