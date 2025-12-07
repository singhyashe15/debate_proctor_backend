import pg from "pg"
import dotenv from "dotenv";
dotenv.config()
const { Pool } = pg;

const pool = new Pool({
  connectionString: `postgresql://${process.env.DB_USER}:${process.env.DB_PASSWORD}@${process.env.DB_HOST}/${process.env.DB_NAME}?sslmode=require&channel_binding=require`,
  ssl: {
    rejectUnauthorized: false, // Required for Neon
  },
});

export default pool;