import express from 'express';
import cors from 'cors';
import { createServer } from 'http';
import { Server } from 'socket.io';
import cookieParser from 'cookie-parser';
import 'dotenv/config';
import {
  ClientToServerEvents,
  ServerToClientEvents,
} from '@hcl/shared';
import { RoomManager } from './game/RoomManager';
import { registerSocketHandlers } from './socket/handlers';
import { connectDB } from './db';
import authRoutes from './routes/authRoutes';
import userRoutes from './routes/userRoutes';

const PORT = process.env.PORT || 3001;
const CLIENT_URL = process.env.CLIENT_URL || 'http://localhost:3000';

connectDB();

const app = express();
app.use(cors({ origin: CLIENT_URL, credentials: true }));
app.use(express.json());
app.use(cookieParser());

app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/profile', userRoutes);

const roomManager = new RoomManager();

app.get('/health', (_req, res) => {
  res.json({ status: 'ok', rooms: roomManager.getRoomCount() });
});

const httpServer = createServer(app);
const io = new Server<ClientToServerEvents, ServerToClientEvents>(httpServer, {
  cors: { origin: CLIENT_URL, methods: ['GET', 'POST'], credentials: true },
  pingTimeout: 60000,
  pingInterval: 25000,
});
registerSocketHandlers(io, roomManager);

httpServer.listen(PORT, () => {
  console.log(`🏏 Handy Cricket League server running on port ${PORT}`);
});
