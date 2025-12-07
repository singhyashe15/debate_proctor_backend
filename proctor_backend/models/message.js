import pool from "../config/db.js";

const MessageTable = async () => {
  try {
    await pool.query(`
      CREATE TABLE messages (
        id SERIAL PRIMARY KEY,           
        messageId INT NOT NULL,           
        debaterId VARCHAR(50) NOT NULL,
        debaterName VARCHAR(100) NOT NULL,
        message TEXT NOT NULL,
        timestamp TIMESTAMP NOT NULL,
        factCheckStatus VARCHAR(50) NOT NULL,
        round INT NOT NULL,
        debateId VARCHAR(100) NOT NULL
      );
    `)
  } catch (e) {
    console.error("Error Creating User Table:", e);
  }
}

export default MessageTable;