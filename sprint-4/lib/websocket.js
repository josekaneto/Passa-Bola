// WebSocket utility for managing Socket.io connections
import { io } from 'socket.io-client';

let socket = null;

export const getSocket = (token, userId) => {
  if (!socket || !socket.connected) {
    const serverUrl = typeof window !== 'undefined' ? window.location.origin : '';
    socket = io(serverUrl, {
      auth: {
        token,
        userId
      },
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionAttempts: 5
    });

    socket.on('connect', () => {
      console.log('WebSocket connected');
    });

    socket.on('disconnect', () => {
      console.log('WebSocket disconnected');
    });

    socket.on('error', (error) => {
      console.error('WebSocket error:', error);
    });
  }
  return socket;
};

export const disconnectSocket = () => {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
};

