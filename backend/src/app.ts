import express from 'express';
import http from 'http';
import morgan from 'morgan';
import { errorHandler } from '@middleware/errorHandler.js';
import { notFoundHandler } from '@middleware/notFoundHandler.js';
import { router as matchRouter } from './routes/match.js';
import { attachWebSocketServer } from './utils/socket.js';

export const app = express();

// Use for WebSocket integration
export const server = http.createServer(app);
// Body parser middleware
app.use(express.json());
// HTTP request logger middleware
app.use(morgan(':method :url :status :res[content-length] - :response-time ms'));

// API routes
app.use("/api/match",matchRouter);
// Healthy check endpoint
app.get('/health', (_, res) => {
  res.send('OK');
});

// Initialize Websocket
const { broadcastCreatedMatch } = attachWebSocketServer(server);
// Attach for use
app.locals.broadcastCreatedMatch = broadcastCreatedMatch;
// Error handling middleware
app.use(errorHandler);
// 404 Not Found handler
app.use(notFoundHandler);