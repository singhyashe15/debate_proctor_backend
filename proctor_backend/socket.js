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
    origin: process.env.FRONTEND_URL,
    methods: ["GET", "POST", "DELETE", "PUT"],
  },
});

io.on("connection", (socket) => {
  console.log(`✅ Socket connected: ${socket.id}`);

  // Join debate room
  socket.on('join-debate', (debateRoomId) => {
    console.log(`🔔 Socket ${socket.id} attempting to join room: ${debateRoomId}`);
    
    if (socket.rooms.has(debateRoomId)) {
      console.log(`⚠️ Already in room: ${debateRoomId}`);
      return;
    }
    
    socket.join(debateRoomId);
    console.log(`👥 Socket ${socket.id} SUCCESSFULLY joined room: ${debateRoomId}`);
    
    const roomSize = io.sockets.adapter.rooms.get(debateRoomId)?.size || 0;
    console.log(`📊 Room ${debateRoomId} now has ${roomSize} connected users`);
    
    // List all sockets in the room
    const socketsInRoom = Array.from(io.sockets.adapter.rooms.get(debateRoomId) || []);
    console.log(`🔍 Sockets in room ${debateRoomId}:`, socketsInRoom);
  });

  // Send message
  socket.on('sendMsg', async ({ debateId, message }) => {
    console.log(`\n📬 ====== RECEIVED sendMsg EVENT ======`);
    console.log(`🔑 Socket ID: ${socket.id}`);
    console.log(`🏠 Debate Room: ${debateId}`);
    console.log(`💬 Message:`, message);
    console.log(`🔍 Socket is in rooms:`, Array.from(socket.rooms));
    
    try {
      // Check if socket is actually in the room
      if (!socket.rooms.has(debateId)) {
        console.error(`❌ ERROR: Socket ${socket.id} is NOT in room ${debateId}`);
        console.log(`   Current rooms:`, Array.from(socket.rooms));
        socket.emit('error', { message: 'Not in debate room. Please refresh.' });
        return;
      }

      console.log(`💾 Attempting to save message to database...`);
      
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

      console.log(`✅ Message saved to DB with ID: ${savedMessage.messageid}`);
      console.log(`📡 Broadcasting to room: ${debateId}`);
      
      // Get room info before emitting
      const roomSize = io.sockets.adapter.rooms.get(debateId)?.size || 0;
      console.log(`📊 Broadcasting to ${roomSize} users in room ${debateId}`);

      // Broadcast to EVERYONE in the room
      io.to(debateId).emit('real-time-sync-message', savedMessage);
      
      console.log(`✅ Broadcast complete!`);
      console.log(`====================================\n`);

    } catch (error) {
      console.error(`❌ ERROR in sendMsg handler:`, error.message);
      console.error(`   Stack:`, error.stack);
      socket.emit('error', { message: 'Failed to save message' });
    }
  });

  socket.on("disconnect", () => {
    console.log(`❌ Socket ${socket.id} disconnected`);
  });
});

export { app, server };