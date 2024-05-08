import "./App.css";
import useWebSocket from "./hooks/useWebSocket";
import CRDTInput from "./components/CRDTInput";

function App() {
  const { socket } = useWebSocket();

  return (
    <>
      <CRDTInput socket={socket} />
    </>
  );
}

export default App;
