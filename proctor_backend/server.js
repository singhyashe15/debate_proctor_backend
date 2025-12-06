import express from "express"
import { app, server } from './socket.js'
import cors from "cors";

app.use(express.json());
const port = 3000 || process.env.PORT;

app.use(cors({
  origin: process.env.FRONTEND_URL,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'], // Allow necessary methods
  allowedHeaders: ['Content-Type', 'Authorization'], // Allow necessary headers
  optionsSuccessStatus: 200
}));


server.listen(port,()=>{
  console.log("server listening on port" + port);
})