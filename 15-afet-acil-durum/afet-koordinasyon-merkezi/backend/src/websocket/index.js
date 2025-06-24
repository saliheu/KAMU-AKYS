const jwt = require('jsonwebtoken');
const { User } = require('../models');
const logger = require('../utils/logger');
const disasterHandlers = require('./disaster.handlers');
const teamHandlers = require('./team.handlers');
const helpRequestHandlers = require('./helpRequest.handlers');

const authenticateSocket = async (socket, next) => {
  try {
    const token = socket.handshake.auth.token;
    
    if (!token) {
      return next(new Error('Authentication error'));
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findByPk(decoded.userId, {
      attributes: { exclude: ['password', 'refreshToken'] }
    });

    if (!user || !user.isActive) {
      return next(new Error('Authentication error'));
    }

    socket.userId = user.id;
    socket.user = user.toJSON();
    next();
  } catch (error) {
    logger.error('Socket authentication error:', error);
    next(new Error('Authentication error'));
  }
};

const setupSocketHandlers = (io) => {
  // Authentication middleware
  io.use(authenticateSocket);

  io.on('connection', (socket) => {
    logger.info(`User ${socket.user.email} connected via WebSocket`);

    // Join user's personal room
    socket.join(`user:${socket.userId}`);

    // Join institution room if applicable
    if (socket.user.institutionId) {
      socket.join(`institution:${socket.user.institutionId}`);
    }

    // Join role-based room
    socket.join(`role:${socket.user.role}`);

    // Send connection success
    socket.emit('connected', {
      userId: socket.userId,
      message: 'WebSocket bağlantısı başarılı'
    });

    // Register handlers
    disasterHandlers(io, socket);
    teamHandlers(io, socket);
    helpRequestHandlers(io, socket);

    // Handle location updates
    socket.on('location:update', async (data) => {
      try {
        const { latitude, longitude } = data;
        
        // Update user location in database
        await User.update(
          { 
            location: {
              type: 'Point',
              coordinates: [longitude, latitude]
            }
          },
          { where: { id: socket.userId } }
        );

        // Broadcast to relevant rooms
        if (socket.user.teamId) {
          io.to(`team:${socket.user.teamId}`).emit('team:member:location', {
            userId: socket.userId,
            location: { latitude, longitude },
            timestamp: new Date()
          });
        }

        socket.emit('location:updated', { success: true });
      } catch (error) {
        logger.error('Location update error:', error);
        socket.emit('error', { message: 'Konum güncellenemedi' });
      }
    });

    // Handle room subscriptions
    socket.on('subscribe', (rooms) => {
      if (Array.isArray(rooms)) {
        rooms.forEach(room => {
          // Validate room access based on user role
          if (validateRoomAccess(socket.user, room)) {
            socket.join(room);
            logger.info(`User ${socket.user.email} joined room: ${room}`);
          }
        });
      }
    });

    socket.on('unsubscribe', (rooms) => {
      if (Array.isArray(rooms)) {
        rooms.forEach(room => {
          socket.leave(room);
          logger.info(`User ${socket.user.email} left room: ${room}`);
        });
      }
    });

    // Handle disconnect
    socket.on('disconnect', () => {
      logger.info(`User ${socket.user.email} disconnected from WebSocket`);
    });
  });

  // Utility function to broadcast to specific rooms
  io.broadcastToRoles = (roles, event, data) => {
    roles.forEach(role => {
      io.to(`role:${role}`).emit(event, data);
    });
  };

  io.broadcastToInstitution = (institutionId, event, data) => {
    io.to(`institution:${institutionId}`).emit(event, data);
  };

  io.broadcastToUser = (userId, event, data) => {
    io.to(`user:${userId}`).emit(event, data);
  };

  io.broadcastToDisaster = (disasterId, event, data) => {
    io.to(`disaster:${disasterId}`).emit(event, data);
  };

  return io;
};

const validateRoomAccess = (user, room) => {
  // Implement room access validation based on user role
  const [type, id] = room.split(':');
  
  switch (type) {
    case 'disaster':
      // All authenticated users can subscribe to disaster updates
      return true;
    case 'team':
      // Only team members and coordinators
      return ['coordinator', 'city_manager', 'field_officer'].includes(user.role);
    case 'institution':
      // Only same institution or coordinators
      return user.institutionId === id || user.role === 'coordinator';
    default:
      return false;
  }
};

module.exports = setupSocketHandlers;