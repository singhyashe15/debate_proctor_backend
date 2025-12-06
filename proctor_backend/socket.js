import express from "express";
import { Server } from "socket.io";
import http from "http";
import dotenv from "dotenv";
import { log } from "console";

dotenv.config();

const app = express();
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: process.env.FRONTEND_URL, // Allow all origins (use specific domain in production)
    methods: ["GET", "POST", "DELETE", "PUT"],
  },
});

io.on("connection", (socket) => {
  socket.on('debate-room', (debateRoomId) => {
    console.log(debateRoomId)
    if (socket.rooms.has(debateRoomId)) {
      console.log(`Already in room: ${debateRoomId}`);
      return; // prevent rejoin
    }
    socket.join(debateRoomId);
  })

  socket.on('sendMsg', ({ debateId, message }) => {
    console.log(message);
    
    socket.to(debateId).emit('real-time-sync-message', message);

    //testing phase
  })
})

export { app, server };
