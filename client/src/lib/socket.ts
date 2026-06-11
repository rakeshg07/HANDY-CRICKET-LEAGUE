'use client';

import { io, Socket } from 'socket.io-client';
import { ClientToServerEvents, ServerToClientEvents } from '@hcl/shared';
import Cookies from 'js-cookie';

const SERVER_URL = process.env.NEXT_PUBLIC_SERVER_URL || 'http://localhost:3001';

let socket: Socket<ServerToClientEvents, ClientToServerEvents> | null = null;

export function getSocket(): Socket<ServerToClientEvents, ClientToServerEvents> {
  if (!socket) {
    socket = io(SERVER_URL, {
      autoConnect: false,
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
      withCredentials: true,
    });
    
    // Dynamically update auth token before connecting
    socket.on('connect_error', (err) => {
      console.error('Socket connect error:', err.message);
    });
  }
  return socket;
}

export function connectSocket(): Socket<ServerToClientEvents, ClientToServerEvents> {
  const s = getSocket();
  if (!s.connected) s.connect();
  return s;
}

export function disconnectSocket(): void {
  if (socket?.connected) {
    socket.disconnect();
  }
}
