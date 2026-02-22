import { WebSocket, WebSocketServer } from "ws";
import { logger } from "./logger.js";
import { Server } from "http";

interface HearbeatWebSocket extends WebSocket {
    isAlive: boolean;
}
const sendJson = (socket: WebSocket, data: any) => {
    // Gaurd clauses
    if (socket.readyState !== WebSocket.OPEN) {
        logger.warn('WebSocket is not open. Ready state:', socket.readyState);
        return;
    }
    socket.send(JSON.stringify(data));
};

const broadcastJson = (sockets: Set<WebSocket>, data: any) => {
    const jsonData = JSON.stringify(data);
    logger.info(`Broadcast start`);
    sockets.forEach(socket => {
        if (socket.readyState !== WebSocket.OPEN) {
            logger.warn('WebSocket is not open. Ready state:', socket.readyState);
            return;
        }
        socket.send(jsonData);
    });
    logger.info(`Broadcast end`);
}

export const attachWebSocketServer = (server: Server) => {
    const wss = new WebSocketServer({ server,path:"/ws",maxPayload: 1024 * 1024,clientTracking: true }); // 1MB max payload
    
    wss.on('connection', (socket: HearbeatWebSocket) => {
        socket.isAlive = true;
        socket.on('pong',() => { socket.isAlive = true; });
        logger.info('WebSocket client connected');
        sendJson(socket, { type: 'welcome', message: 'Welcome to the SportReporter!' });
        socket.on('error',logger.error);
    });

    // Heartbeat mechanism to detect and close dead connections
    const interval = setInterval(() => {
        wss.clients.forEach(client => {
            const socket = client as HearbeatWebSocket;
            if (socket.isAlive === false) return socket.terminate();
            socket.isAlive = false;
            socket.ping();
        })
    },30000); // Check every 30 seconds
    wss.on('close',() => clearInterval(interval));
    const broadcastCreatedMatch = (match: any) => {
        broadcastJson(wss.clients, { type: 'matchCreated', data: match });
    }
    return {
        broadcastCreatedMatch
    }
}