import express from 'express';
import { createServer } from 'http';
import { Server as SocketIOServer } from 'socket.io';
import productsRouter from './routes/products';
import ordersRouter from './routes/orders';
import cartRouter from './routes/cart';

let io: SocketIOServer | null = null;

export function getIO(): SocketIOServer | null {
  return io;
}

export async function startServer(port: number): Promise<void> {
  const app = express();
  const httpServer = createServer(app);

  io = new SocketIOServer(httpServer, {
    cors: {
      origin: '*',
      methods: ['GET', 'POST'],
    },
  });

  app.use(express.json());

  // Health check
  app.get('/api/health', (_req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
  });

  // API routes
  app.use('/api/products', productsRouter);
  app.use('/api/orders', ordersRouter);
  app.use('/api/cart', cartRouter);

  // Socket.io connection handling
  io.on('connection', (socket) => {
    console.log(`Client connected: ${socket.id}`);

    socket.on('disconnect', () => {
      console.log(`Client disconnected: ${socket.id}`);
    });
  });

  return new Promise((resolve) => {
    httpServer.listen(port, '127.0.0.1', () => {
      console.log(`APEX POS server running on http://127.0.0.1:${port}`);
      resolve();
    });
  });
}
