import pool from "../config/db.js";

const MessageTable = async () => {

  const createQuery = `
    CREATE TABLE IF NOT EXISTS messages (
      id SERIAL PRIMARY KEY,
      messageid VARCHAR(255) NOT NULL,
      debaterid VARCHAR(255) NOT NULL,
      debatername VARCHAR(255) NOT NULL,
      message TEXT NOT NULL,
      timestamp TIMESTAMP NOT NULL,
      factcheckstatus VARCHAR(50),
      round INT,
      debateid VARCHAR(255) NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
  `;
  
  try {
    await pool.query(createQuery);
    console.log("✅ Messages Table Ready");
  } catch (error) {
    console.error("❌ Error creating messages table:", error);
  }
};

export default MessageTable;