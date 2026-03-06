const { createServer } = require('http');
const { parse } = require('url');
const next = require('next');
const { Server } = require('socket.io');
const Redis = require('ioredis');

const dev = process.env.NODE_ENV !== 'production';
const hostname = 'localhost';
let port = parseInt(process.env.PORT || '3000', 10);

// Initialize Next.js
const app = next({ dev, hostname, port });
const handle = app.getRequestHandler();

// Initialize Redis with lazy connect and error handling
const redisUrl = process.env.REDIS_URL || 'redis://localhost:6379';
const useRedis = process.env.NO_REDIS !== 'true';

let publisher, subscriber;

if (useRedis) {
  const redisOptions = {
    maxRetriesPerRequest: 1,
    retryStrategy: (times) => {
      if (times > 3) {
        console.warn('Redis unreachable. Falling back to local mode.');
        return null; // Stop retrying
      }
      return Math.min(times * 100, 2000);
    }
  };

  publisher = new Redis(redisUrl, redisOptions);
  subscriber = new Redis(redisUrl, redisOptions);
  
  publisher.on('error', (err) => {
    // Silently log or ignore if we want to run without Redis
    if (err.code === 'ECONNREFUSED') {
      console.warn('Redis Publisher connection refused. Continuing in local-only mode.');
    } else {
      console.error('Redis Publisher Error:', err);
    }
  });
  
  subscriber.on('error', (err) => {
    if (err.code === 'ECONNREFUSED') {
      console.warn('Redis Subscriber connection refused. Continuing in local-only mode.');
    } else {
      console.error('Redis Subscriber Error:', err);
    }
  });
} else {
  console.log('Running in NO_REDIS mode. InMemory fallback.');
}

app.prepare().then(() => {
  const server = createServer(async (req, res) => {
    try {
      const parsedUrl = parse(req.url, true);
      await handle(req, res, parsedUrl);
    } catch (err) {
      console.error('Error occurred handling', req.url, err);
      res.statusCode = 500;
      res.end('internal server error');
    }
  });

  const io = new Server(server, {
    path: '/api/socket',
    addTrailingSlash: false,
    cors: {
      origin: '*',
      methods: ['GET', 'POST'],
    },
  });

  // Redis Pub/Sub for scaling (optional for single instance, good for future)
  if (useRedis && subscriber) {
    subscriber.subscribe('scg-stream');
    
    subscriber.on('message', (channel, message) => {
      if (channel === 'scg-stream') {
        const data = JSON.parse(message);
        // Broadcast to specific room (session)
        io.to(data.sessionId).emit('scg-data', data.payload);
      }
    });
  }

  io.on('connection', (socket) => {
    console.log('Client connected:', socket.id);

    socket.on('join-session', (sessionId) => {
      socket.join(sessionId);
      console.log(`Socket ${socket.id} joined session ${sessionId}`);
    });

    socket.on('leave-session', (sessionId) => {
      socket.leave(sessionId);
      console.log(`Socket ${socket.id} left session ${sessionId}`);
    });

    socket.on('scg-data', async (payload) => {
      const { sessionId, data } = payload;
      
      // 1. Direct broadcast (fastest)
      // data is now ScgTuple[] or legacy AccelerometerDataPoint[]
      socket.to(sessionId).emit('scg-data', data);

      // 2. Publish to Redis (for scaling across instances)
      if (publisher) {
        await publisher.publish('scg-stream', JSON.stringify({ sessionId, payload: { data } }));
      }
      
      // 3. Optional: Buffer data in Redis List for history/saving
      // await publisher.rpush(`session:${sessionId}:raw`, JSON.stringify(data));
    });

    socket.on('disconnect', () => {
      console.log('Client disconnected:', socket.id);
    });
  });

  const startServer = (p) => {
    server.listen(p, (err) => {
      if (err) {
        if (err.code === 'EADDRINUSE') {
          console.log(`Port ${p} is in use, trying ${p + 1}...`);
          startServer(p + 1);
        } else {
          throw err;
        }
      } else {
        console.log(`> Ready on http://${hostname}:${p}`);
        // Update port for other components if needed
        port = p;
      }
    });
  };

  startServer(port);
});
