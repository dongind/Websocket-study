import { useEffect, useRef, useState } from "react";

const WS_URL = "ws://localhost:8080/";

const MAX_RETRY_COUNT = 5;
const MIN_INTERVAL = 1000;
const MAX_JITTER = 200;

const ONERROR_CODE = 4000;
const NORMAL_CODE = 1000;

export interface WebSocketDTO {
  type: "SPRINT" | "PROJECT";
  data: string;
}

const useWebSocket = () => {
  const isMounted = useRef(true);
  const retryCount = useRef(0);
  const websocket = useRef<WebSocket | null>(null);
  const [sprintData, setSprintData] = useState<string>("");
  const [projectData, setProjectData] = useState<string>("");
  const isWebSocketOpen = (webSocket: WebSocket) =>
    webSocket && webSocket.readyState === WebSocket.OPEN;

  // 초기화
  useEffect(() => {
    retryCount.current = 0;
    isMounted.current = true;
  }, []);

  useEffect(() => {
    websocket.current = new WebSocket(WS_URL);

    const setupWebSocket = (wsInstance: WebSocket) => {
      wsInstance.onopen = () => {
        retryCount.current = 0;
        console.log("info : WebSocket 연결");
      };

      wsInstance.onmessage = (event: MessageEvent) => {
        if (isMounted.current && isWebSocketOpen(wsInstance)) {
          const resData: WebSocketDTO = JSON.parse(event.data);
          const { type, data } = resData;
          switch (type) {
            case "PROJECT":
              setProjectData(data);
              console.log("save : received Project Data");
              break;
            case "SPRINT":
              setSprintData(data);
              console.log("save : received Sprint Data");
              break;
            default:
              console.log(`${type} is not proper type`);
          }
        }
      };

      wsInstance.onerror = (event) => {
        if (isMounted.current) {
          console.log(`error : WebSocket Error \n ${JSON.stringify(event)}`);
          wsInstance.close(ONERROR_CODE);
        }
      };

      wsInstance.onclose = (event) => {
        if (isMounted.current) {
          console.log(`info : Websocket closed ${(event.code, event.reason)}`);
        }

        if (event.code !== NORMAL_CODE) {
          if (event.code === ONERROR_CODE) {
            let interval = MIN_INTERVAL * Math.pow(2, retryCount.current);
            const jitter = Math.floor(
              Math.random() * (MAX_JITTER * 2 + 1) - MAX_JITTER
            );
            interval += jitter;

            if (retryCount.current < MAX_RETRY_COUNT) {
              setTimeout(() => {
                websocket.current = new WebSocket(WS_URL);
                setupWebSocket(websocket.current);
                retryCount.current++;
              }, interval);
            }
          }
        }
      };
    };

    setupWebSocket(websocket.current);

    return () => {
      if (websocket.current && isWebSocketOpen(websocket.current)) {
        console.log("info : Websocket close");
        isMounted.current = false;
        websocket.current.close();
      }
    };
  }, []);

  return { sprintData, projectData, websocket, isWebSocketOpen };
};

export default useWebSocket;
