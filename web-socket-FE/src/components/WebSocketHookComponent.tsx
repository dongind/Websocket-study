import { useEffect, useRef } from "react";
import useWebSocket from "../hooks/useWebSocket";

const WebSocketHookComponent: React.FC = () => {
  const { sprintData, projectData, websocket, isWebSocketOpen } =
    useWebSocket();

  const inputMessage = useRef<string>("");

  const handleInputChange: React.ChangeEventHandler<HTMLInputElement> = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    inputMessage.current = event.target.value;
  };

  const handleSendMessage: React.MouseEventHandler<HTMLButtonElement> = ({
    currentTarget,
  }: React.MouseEvent) => {
    if (!websocket.current || !isWebSocketOpen(websocket.current))
      throw Error("not activated websocket");

    websocket.current.send(
      JSON.stringify({
        type: currentTarget.id,
        message: inputMessage.current,
      })
    );
    inputMessage.current = "";
  };

  useEffect(() => {
    console.log("sprint : ", sprintData);
    console.log("project : ", projectData);
  });

  return (
    <div>
      <h1>WebSocket Example</h1>
      <input type="text" onChange={handleInputChange} />
      <button onClick={handleSendMessage} id="PROJECT">
        PROJECT
      </button>
      <button onClick={handleSendMessage} id="SPRINT">
        SPRINT
      </button>
      <div>
        <h2>PROJECT DATA :</h2>
        <p>{projectData}</p>
        <h2>SPRINT DATA :</h2>
        <p>{sprintData}</p>
      </div>
    </div>
  );
};

export default WebSocketHookComponent;
