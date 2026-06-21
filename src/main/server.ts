import express from 'express';
import { createServer } from 'http';
import { Server as SocketIOServer } from 'socket.io';
import productsRouter from './routes/products';
import ordersRouter from './routes/orders';
import cartRouter from './routes/cart';
import aiRouter from './routes/ai';
import unsplashRouter from './routes/unsplash';
import refundsRouter from './routes/refunds';
import reportsRouter from './routes/reports';
import settingsRouter from './routes/settings';

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

  app.use(express.json({ limit: '50mb' }));

  // Health check
  app.get('/api/health', (_req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
  });

  // API routes
  app.use('/api/products', productsRouter);
  app.use('/api/orders', ordersRouter);
  app.use('/api/cart', cartRouter);
  app.use('/api/ai', aiRouter);
  app.use('/api/unsplash', unsplashRouter);
  app.use('/api/refunds', refundsRouter);
  app.use('/api/reports', reportsRouter);
  app.use('/api/settings', settingsRouter);

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
