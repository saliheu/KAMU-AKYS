const { verifyToken } = require('../utils/auth');
const { logger } = require('../utils/logger');

const clients = new Map();

const initializeWebSocket = (wss) => {
  wss.on('connection', (ws, req) => {
    logger.info('New WebSocket connection');
    
    let userId = null;

    ws.on('message', async (message) => {
      try {
        const data = JSON.parse(message);
        
        if (data.type === 'auth') {
          try {
            const decoded = verifyToken(data.token);
            userId = decoded.id;
            clients.set(userId, ws);
            
            ws.send(JSON.stringify({
              type: 'auth_success',
              message: 'Authentication successful'
            }));
            
            logger.info(`User ${userId} authenticated via WebSocket`);
          } catch (error) {
            ws.send(JSON.stringify({
              type: 'auth_error',
              message: 'Authentication failed'
            }));
            ws.close();
          }
        }
        
        if (data.type === 'subscribe') {
          // Handle subscription to specific hospitals or departments
          ws.subscriptions = data.channels || [];
        }
      } catch (error) {
        logger.error('WebSocket message error:', error);
      }
    });

    ws.on('close', () => {
      if (userId) {
        clients.delete(userId);
        logger.info(`User ${userId} disconnected`);
      }
    });

    ws.on('error', (error) => {
      logger.error('WebSocket error:', error);
    });
  });

  return wss;
};

const broadcast = (type, data, channels = []) => {
  const message = JSON.stringify({ type, data, timestamp: new Date() });
  
  clients.forEach((client, userId) => {
    if (client.readyState === 1) { // WebSocket.OPEN
      // If channels specified, only send to subscribed clients
      if (channels.length > 0 && client.subscriptions) {
        const hasSubscription = channels.some(channel => 
          client.subscriptions.includes(channel)
        );
        if (hasSubscription) {
          client.send(message);
        }
      } else {
        // Broadcast to all connected clients
        client.send(message);
      }
    }
  });
};

const sendToUser = (userId, type, data) => {
  const client = clients.get(userId);
  if (client && client.readyState === 1) {
    client.send(JSON.stringify({ type, data, timestamp: new Date() }));
  }
};

module.exports = {
  initializeWebSocket,
  broadcast,
  sendToUser
};