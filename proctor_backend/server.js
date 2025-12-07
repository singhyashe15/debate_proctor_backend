// proctor_backend/server.js
import express from "express";
import { app, server } from './socket.js';
import cors from "cors";
import pool from "./config/db.js";
import MessageTable from "./models/message.js";

app.use(express.json());
const port = process.env.PORT || 3000;

app.use(cors({
  origin: process.env.FRONTEND_URL, // Ensure this matches your Vite frontend URL (e.g., http://localhost:5173)
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  optionsSuccessStatus: 200
}));

// --- Database Setup ---
// Create Debates Table if it doesn't exist
const createDebatesTable = async () => {
  const query = `
    CREATE TABLE IF NOT EXISTS debates (
      id VARCHAR(255) PRIMARY KEY,
      topic_title VARCHAR(255),
      topic_category VARCHAR(255),
      debater1_id VARCHAR(255),
      debater1_name VARCHAR(255),
      debater1_position VARCHAR(50),
      debater2_id VARCHAR(255),
      debater2_name VARCHAR(255),
      debater2_position VARCHAR(50),
      status VARCHAR(50) DEFAULT 'live',
      current_round INT DEFAULT 1,
      total_rounds INT DEFAULT 3,
      current_turn VARCHAR(50) DEFAULT 'debater1',
      time_remaining INT DEFAULT 600,
      started_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
  `;
  await pool.query(query);
  console.log("✅ Debates Table Ready");
};

pool.connect()
  .then(() => {
    console.log("✅ Connected to Debate database");
    createDebatesTable();
    MessageTable(); // Ensure your message table is also created
  })
  .catch((err) => console.error("Database Connection Error:", err));

// --- API Endpoints ---

// 1. Create a new Debate (Challenge)
app.post("/api/debates", async (req, res) => {
  const { id, topic, debater1, debater2, position } = req.body;
  
  try {
    const query = `
      INSERT INTO debates (id, topic_title, topic_category, debater1_id, debater1_name, debater1_position, debater2_id, debater2_name, debater2_position)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
      RETURNING *;
    `;
    // If user selected 'for', debater2 is 'against'
    const d1Pos = position;
    const d2Pos = position === 'for' ? 'against' : 'for';

    const values = [
      id, topic.title, topic.category,
      debater1.id, debater1.username, d1Pos,
      debater2?.id || 'pending', debater2?.username || 'Waiting...', d2Pos
    ];

    const result = await pool.query(query, values);
    console.log("Created Debate:", result.rows[0]);
    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error("Error creating debate:", error);
    res.status(500).json({ error: "Failed to create debate" });
  }
});

// 2. Get Debate by ID
app.get("/api/debates/:id", async (req, res) => {
  const { id } = req.params
  console.log("id" + id);
  
  try {
    const result = await pool.query("SELECT * FROM debates WHERE id = $1", [id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Debate not found" });
    }
    
    // Transform DB snake_case to frontend camelCase
    const row = result.rows[0];
    const debateData = {
      id: row.id,
      topic: { title: row.topic_title, category: row.topic_category },
      debater1: { id: row.debater1_id, username: row.debater1_name, position: row.debater1_position },
      debater2: { id: row.debater2_id, username: row.debater2_name, position: row.debater2_position },
      status: row.status,
      currentRound: row.current_round,
      totalRounds: row.total_rounds,
      currentTurn: row.current_turn,
      timeRemaining: row.time_remaining,
      startedAt: row.started_at
    };

    res.json(debateData);
  } catch (error) {
    console.error("Error fetching debate:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

server.listen(port, () => {
  console.log("Server listening on port " + port);
});