// Author: Hareesh Kumar Gajulapalli
const WebSocket = require('ws');

// Get port fon  environment variables or default 8080 if that doesn't exist.
// If this is deployed in cloed then environment variable is set automcatically by cloud and network rules are created automatically.
const port = process.env.PORT || 8080

const wss = new WebSocket.Server({ port: port });
const clients = new Map(); // Map uniqueId -> WebSocket connection

console.log(`Signaling server started on port ${port}`);

wss.on('listening', () => {
    console.log(`Signaling server listening on port ${port}`);
});

wss.on('connection', (ws) => {
    // Assign a unique ID (or get one from the client)
    // For simplicity, let's assume the client sends its ID first
    let clientId = null;

    console.log('Client connected (IP: ' + ws._socket.remoteAddress + ')');

    ws.on('message', (message) => {
        let parsedMessage;
        try {
            parsedMessage = JSON.parse(message);
            console.log('Received:', parsedMessage);

            // First message should identify the client
            if (parsedMessage.type === 'identify' && parsedMessage.id) {
                clientId = parsedMessage.id;
                clients.set(clientId, ws);
                console.log(`Client identified as ${clientId}`);
                // Sending confirmation back
                ws.send(JSON.stringify({ type: 'identified', id: clientId }));
                return;
            }

            // Ensure client is identified before processing other messages
            if (!clientId) {
                console.warn('Received message from unidentified client');
                return;
            }

            console.log(`Received from ${clientId}:`, parsedMessage.type, 'Target:', parsedMessage.target || 'N/A');

            // Add sender ID to the message before relaying
            parsedMessage.sender = clientId;

            const targetId = parsedMessage.target;
            const targetClient = clients.get(targetId);

            if (targetClient && targetClient.readyState === WebSocket.OPEN) {
                console.log(`Relaying message from ${clientId} to ${targetId}`);
                targetClient.send(JSON.stringify(parsedMessage));
            } else {
                console.warn(`Target client ${targetId} not found or not open.`);
                // Sending an error back to the sender
                ws.send(JSON.stringify({ type: 'error', message: `User ${targetId} not found or offline.` }));
            }

        } catch (e) {
            console.error('Failed to parse message or invalid message format:', message, e);
        }
    });

    ws.on('close', () => {
        console.log(`Client ${clientId} disconnected`);
        if (clientId) {
            clients.delete(clientId);
        } else {
            console.log('Unidentified client disconnected');
        }
    });

    ws.on('error', (error) => {
        console.error(`WebSocket error for client ${clientId}:`, error);
        if (clientId) {
            clients.delete(clientId);
        }
    });
});

wss.on('error', (error) => {
    console.error('Websocket Server Error:', error);
});