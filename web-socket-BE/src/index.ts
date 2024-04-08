import express, { Request, Response } from "express";
import http from "http";
import WebSocket from "ws";

const app = express();

app.get("/welcome", (req: Request, res: Response) => {
  res.send("welcome");
});

const server = app.listen("8080", () => {
  console.log(`
  ################################################
  🛡️  Server listening on port: 1234 🛡️
  ################################################
  `);
});

const wss = new WebSocket.Server({ server });

wss.on("connection", (ws: WebSocket) => {
  ws.on("message", (message: string) => {
    const receivedData = JSON.parse(message);
    console.log(`Received message from client : ${message}`);

    wss.clients.forEach((client: WebSocket) => {
      client.send(
        JSON.stringify({
          type: receivedData.type,
          data: receivedData.message,
        })
      );
    });
  });
});
