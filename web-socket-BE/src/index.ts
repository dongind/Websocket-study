import { Socket } from "dgram";
import express from "express";
import { createServer } from "http";
import { Server } from "socket.io";

const app = express();
const server = createServer(app);
const io = new Server(server);

io.on("connection", (socket) => {
  io.emit("message", socket.id);
  socket.on("message", (data) => {
    io.emit("message", data);
  });
  socket.on("yjs", (data) => {
    socket.broadcast.emit("yjs", data);
  });
});

server.listen(8080);
