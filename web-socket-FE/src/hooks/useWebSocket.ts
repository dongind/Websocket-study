import { useEffect } from "react";
import { io } from "socket.io-client";

const useWebSocket = () => {
  const socket = io("ws://localhost:8080");

  useEffect(() => {
    socket.emit("init", { data: "hello world" });
    socket.on("message", (data: string) => {
      console.log(data);
    });

    return () => {
      socket.off("message");
    };
  });
  return { socket };
};

export default useWebSocket;
