
import express from "express";
import { Server } from "socket.io";
import http from "http";
import dotenv from "dotenv";
import pool from "./config/db.js";

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

  socket.on('sendMsg', async ({ debateId, message }) => {
    try {
      const query = `
      INSERT INTO messages 
        (messageId, debaterId, debaterName, message, timestamp, factCheckStatus, round, debateId)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      RETURNING *;
    `;

      const values = [
        message.messageId,
        message.debaterId,
        message.debaterName,
        message.message,
        message.timestamp,
        message.factCheckStatus,
        message.round,
        debateId
      ];

      const result = await pool.query(query, values);
      const savedMessage = result.rows[0];

      console.log("Saved in DB:", savedMessage);

      // Broadcast to room
      socket.to(debateId).emit('real-time-sync-message', savedMessage);

    } catch (error) {
      console.error("DB Insert Error:", error.message);
    }
  });

  socket.on("disconnect", () => {
    console.log(`Socket ${socket.id} disconnected`);
  });
})

export { app, server };