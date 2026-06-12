import dotenv from 'dotenv';
dotenv.config();
import express from 'express';
import { createServer } from 'http';
import { Server } from "socket.io";
import cors from 'cors';
import authRoutes from './http/routes/auth.routes.js';
import userRoutes from './http/routes/user.routes.js';
import env from './env.js';
import { socketAuth } from './socket/middleware/socket.auth.js';
import chatHandlers from './socket/handlers/chat.handlers.js';
import requireAuth from './http/middlewares/requireAuth.js';

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const PORT = env.PORT || 4444;

// Allows: explicit origins from CORS_ORIGIN env var + all Vercel preview deployments for this project
const allowedOrigins = env.CORS_ORIGIN; // array parsed in env.js

function isOriginAllowed(origin) {
  if (!origin) return true; // allow Postman / curl / server-to-server
  if (allowedOrigins.includes(origin)) return true;
  // Vercel creates a new preview URL for every push — allow all of them
  if (/^https:\/\/chat-app-1k5r.*\.vercel\.app$/.test(origin)) return true;
  return false;
}

const corsOptions = {
  origin: (origin, callback) => {
    if (isOriginAllowed(origin)) {
      callback(null, true);
    } else {
      console.warn(`CORS blocked origin: ${origin}`);
      callback(new Error(`CORS: origin not allowed`));
    }
  },
  credentials: true,
};

app.use(cors(corsOptions));

const httpServer = createServer(app);
app.use('/api/auth', authRoutes);
app.use('/api/user', requireAuth, userRoutes);

const io = new Server(httpServer, {
    cors: corsOptions
});

// Sockets middleware
io.use(socketAuth);

io.on("connection", (socket) => {
    console.log("User connected", socket.id);

    socket.join(`user:${socket.user.id}`);  // ROOM CREATE 

    chatHandlers(socket, io);
});

httpServer.listen(PORT, () => {
    console.log(`http://localhost:${PORT}`);
})