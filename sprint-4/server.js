const { createServer } = require('http');
const { parse } = require('url');
const next = require('next');
const { Server } = require('socket.io');
const jwt = require('jsonwebtoken');

const dev = process.env.NODE_ENV !== 'production';
const hostname = process.env.HOSTNAME || 'localhost';
const port = parseInt(process.env.PORT || '3000', 10);

const app = next({ dev, hostname, port });
const handle = app.getRequestHandler();

app.prepare().then(() => {
  const httpServer = createServer(async (req, res) => {
    try {
      const parsedUrl = parse(req.url, true);
      await handle(req, res, parsedUrl);
    } catch (err) {
      console.error('Error occurred handling', req.url, err);
      res.statusCode = 500;
      res.end('internal server error');
    }
  });

  // Create Socket.io server
  const io = new Server(httpServer, {
    cors: {
      origin: '*',
      methods: ['GET', 'POST']
    },
    path: '/socket.io'
  });

  // Store connected users by userId
  const connectedUsers = new Map();

  // Authentication middleware for Socket.io
  io.use((socket, next) => {
    const token = socket.handshake.auth?.token;
    const userId = socket.handshake.auth?.userId;

    if (!token || !userId) {
      return next(new Error('Authentication error'));
    }

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback-secret-key');
      if (decoded.userId !== userId) {
        return next(new Error('Authentication error'));
      }
      socket.userId = userId;
      next();
    } catch (err) {
      next(new Error('Authentication error'));
    }
  });

  io.on('connection', (socket) => {
    const userId = socket.userId;
    console.log(`User ${userId} connected`);

    // Store user connection
    connectedUsers.set(userId, socket.id);

    // Join user's personal room for notifications
    socket.join(`user:${userId}`);

    // Handle sending contact messages
    socket.on('send_message', async (data) => {
      try {
        // Broadcast to admin or save to database
        // For now, we'll emit to all admins
        io.to('admin').emit('new_contact_message', {
          ...data,
          timestamp: new Date().toISOString()
        });
        
        // Confirm to sender
        socket.emit('message_sent', { success: true });
      } catch (error) {
        socket.emit('message_error', { error: 'Failed to send message' });
      }
    });

    // Handle accepting invitation
    socket.on('accept_invitation', async (data) => {
      // This will be handled by the REST API, but we emit the notification
      const { invitationId } = data;
      socket.emit('invitation_accepted', { invitationId });
    });

    // Handle declining invitation
    socket.on('decline_invitation', async (data) => {
      // This will be handled by the REST API, but we emit the notification
      const { invitationId } = data;
      socket.emit('invitation_declined', { invitationId });
    });

    socket.on('disconnect', () => {
      console.log(`User ${userId} disconnected`);
      connectedUsers.delete(userId);
    });
  });

  // Make io available globally for API routes
  global.io = io;

  httpServer.listen(port, (err) => {
    if (err) throw err;
    console.log(`> Ready on http://${hostname}:${port}`);
  });
});

