import { WebSocket, WebSocketServer } from "ws";
import { logger } from "./logger.js";
import { Server } from "http";

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
    const wss = new WebSocketServer({ server,path:"/ws",maxPayload: 1024 * 1024 }); // 1MB max payload
    
    wss.on('connection', (socket) => {
        logger.info('WebSocket client connected');
        sendJson(socket, { type: 'welcome', message: 'Welcome to the SportReporter!' });
        socket.on('error',logger.error);
    });

    const broadcastCreatedMatch = (match: any) => {
        broadcastJson(wss.clients, { type: 'matchCreated', data: match });
    }
    return {
        broadcastCreatedMatch
    }
}