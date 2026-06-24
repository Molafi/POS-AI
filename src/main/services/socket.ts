import { Server as SocketIOServer } from 'socket.io';
import { Server as HTTPServer } from 'http';

let io: SocketIOServer | null = null;

export function initSocketServer(httpServer: HTTPServer): SocketIOServer {
  io = new SocketIOServer(httpServer, {
    cors: {
      origin: '*',
      methods: ['GET', 'POST'],
    },
    transports: ['websocket', 'polling'],
  });

  io.on('connection', (socket) => {
    console.log(`Socket client connected: ${socket.id}`);

    socket.on('disconnect', () => {
      console.log(`Socket client disconnected: ${socket.id}`);
    });

    socket.on('error', (error) => {
      console.error(`Socket error from ${socket.id}:`, error);
    });
  });

  console.log('Socket.io server initialized');
  return io;
}

export function getSocketIO(): SocketIOServer | null {
  return io;
}

export function broadcastOrderCreated(order: unknown): void {
  if (io) {
    io.emit('order:created', order);
  }
}

export function broadcastStockUpdated(productId: string, stock: number): void {
  if (io) {
    io.emit('stock:updated', { productId, stock });
  }
}

export function broadcastProductChanged(product: unknown): void {
  if (io) {
    io.emit('product:changed', product);
  }
}

export function getConnectedClients(): number {
  if (!io) return 0;
  return io.engine.clientsCount;
}

export function destroySocketServer(): void {
  if (io) {
    io.close();
    io = null;
  }
}
