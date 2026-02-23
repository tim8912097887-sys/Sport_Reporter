import { WebSocket, WebSocketServer } from "ws";
import { logger } from "./logger.js";
import { Server } from "http";
import { socketArcjet } from "./arcjet.js";

interface HearbeatWebSocket extends WebSocket {
    isAlive: boolean;
}

interface SubscribeWebSocket extends HearbeatWebSocket {
    subscriptions?: Set<number>;
}

type MessagePayload = {
    type: string
    matchId?: number
}

// Store subscription group
const matchGroup = new Map();

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

const subscription = (socket: WebSocket,matchId: number) => {
    if(!matchGroup.has(matchId)) {
         matchGroup.set(matchId,new Set());
    }
    matchGroup.get(matchId).add(socket);
}

const unSubscription = (socket: WebSocket,matchId: number) => {
    if(!matchGroup.has(matchId)) {
         logger.warn("UnSubscription: there's no subscription");
        return;
    } 
    matchGroup.get(matchId).delete(socket);
    // Delete group if no member
    if(!matchGroup.get(matchId).size) matchGroup.delete(matchId);
}

const clearSubscription = (socket: SubscribeWebSocket) => {
    const subscriptions = socket.subscriptions;
    if(!subscriptions || !subscriptions.size) {
        logger.warn("Clear Subscription: there's no subscription to clear");
        return;
    } 
    for(const matchId of subscriptions) {
        unSubscription(socket,matchId);
    }
}

const broadCastToSubscriber = (matchId: number,payload: unknown) => {

    if(!matchGroup.has(matchId)) {
        logger.warn(`BroadCastToSubscriber: there's no subscription to match ${matchId}`);
        return;
    }
    
    const subscribers = matchGroup.get(matchId);
    for(const client of subscribers) {
        sendJson(client,payload)
    }
}

const handleMessage = (socket: SubscribeWebSocket,message: MessagePayload) => {

    if(message.type === "subscription" && Number.isInteger(message.matchId)) {
        subscription(socket,message.matchId as number);
        socket.subscriptions?.add(message.matchId as number);
        sendJson(socket,{ type: "subscribed",matchId: message.matchId });
        return;
    }

    if(message.type === "unSubscription" && Number.isInteger(message.matchId)) {
        unSubscription(socket,message.matchId as number);
        socket.subscriptions?.delete(message.matchId as number);
        sendJson(socket,{ type: "unSubscribed",matchId: message.matchId });
        return;
    }


}

export const attachWebSocketServer = (server: Server) => {
    // Note: Remove 'server' from the options because we will handle the upgrade manually
    const wss = new WebSocketServer({ 
        noServer: true, // This allows us to handle the 'upgrade' event manually
        path: "/ws",
        maxPayload: 1024 * 1024 
    });

    // Intercept the HTTP Upgrade request
    server.on('upgrade', async (req, socket, head) => {
        const { pathname } = new URL(req.url || '', `http://${req.headers.host}`);

        // Only handle our specific path
        if (pathname === '/ws') {
            try {
                // Run Arcjet protection
                const decision = await socketArcjet.protect(req);

                if (decision.isDenied()) {
                    logger.warn(`Arcjet blocked connection: ${decision.reason.type}`);
                    
                    // Send a standard HTTP response before closing the socket
                    const status = decision.reason.isRateLimit() ? 429 : 403;
                    const message = decision.reason.isRateLimit() ? 'Too Many Requests' : 'Forbidden';
                    
                    socket.write(`HTTP/1.1 ${status} ${message}\r\n\r\n`);
                    socket.destroy();
                    return;
                }

                // Hand over the socket to the WS server if allowed
                wss.handleUpgrade(req, socket, head, (ws) => {
                    wss.emit('connection', ws, req);
                });
            } catch (err) {
                logger.error('Arcjet error during handshake:', err);
                socket.destroy();
            }
        } else {
            // Path doesn't match, clean up the socket
            socket.destroy();
        }
    });

    wss.on('connection', (socket: SubscribeWebSocket) => {
        socket.isAlive = true;
        socket.subscriptions = new Set();
        // Check socket health
        socket.on('pong', () => { socket.isAlive = true; });
        
        logger.info('WebSocket client connected');
        sendJson(socket, { type: 'welcome', message: 'Welcome to the SportReporter!' });
        
        socket.on('close',() => {
            logger.info("Socket close");
            // Clear socket subscription
            clearSubscription(socket);
        })
        socket.on('message',(rawData: string) => {
            logger.info("Socket recieved message");
            try {
                const data = JSON.parse(rawData);
                handleMessage(socket,data);
            } catch (error) {
                logger.error("Failed to parse message JSON:", error);
                sendJson(socket, { type: "error", message: "Invalid JSON format" });
            }
        })
        socket.on('error', (error) => {
            logger.error(`Socket Error: ${error}`);
            socket.terminate();
        });
    });

    // Heartbeat mechanism
    const interval = setInterval(() => {
        wss.clients.forEach(client => {
            const socket = client as HearbeatWebSocket;
            if (socket.isAlive === false) return socket.terminate();
            socket.isAlive = false;
            socket.ping();
        })
    }, 30000);

    wss.on('close', () => clearInterval(interval));

    const broadcastCreatedMatch = (match: any) => {
        broadcastJson(wss.clients, { type: 'matchCreated', data: match });
    }

    const broadcastComment = (matchId: number,comment: unknown) => {
        broadCastToSubscriber(matchId,{ type: "commentary",data: comment });
    }
    return { broadcastCreatedMatch,broadcastComment };
}