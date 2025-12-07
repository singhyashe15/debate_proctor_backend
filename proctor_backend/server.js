import express from "express"
import { app, server } from './socket.js'
import cors from "cors";
import pool from "./config/db.js";
import MessageTable from "./models/message.js";

app.use(express.json());
const port = 3000 || process.env.PORT;

app.use(cors({
  origin: process.env.FRONTEND_URL,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'], // Allow necessary methods
  allowedHeaders: ['Content-Type', 'Authorization'], // Allow necessary headers
  optionsSuccessStatus: 200
}));

pool.connect()
  .then(() => console.log("✅ Connected to Debate detabase"))
  .catch((err) => console.error("Database Connection Error:", err));

MessageTable();

server.listen(port,()=>{
  console.log("server listening on port" + port);
})