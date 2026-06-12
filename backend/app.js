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

const corsOptions = {
  origin: env.CORS_ORIGIN,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
};

app.use(cors(corsOptions));

app.get('/', (req, res) => {
  res.status(200).json({ ok: true, service: 'chat-app-api' });
});

app.get('/health', (req, res) => {
  res.status(200).json({ ok: true });
});

const httpServer = createServer(app);
app.use('/api/auth', authRoutes);
app.use('/api/user', requireAuth, userRoutes);

const io = new Server(httpServer, {
  cors: {
    origin: env.CORS_ORIGIN,
    credentials: true,
  }
});

// Sockets ke middleware...
io.use(socketAuth);

io.on("connection", (socket) => {
  console.log("User connected", socket.id);

  socket.join(`user:${socket.user.id}`);  // ROOM CREATE 

  chatHandlers(socket, io);
});

app.use((req, res) => {
  res.status(404).json({ message: `Route not found: ${req.method} ${req.originalUrl}` });
});

httpServer.listen(PORT, () => {
  console.log(`API listening on port ${PORT}`);
})
