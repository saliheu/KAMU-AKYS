const { Disaster, Location } = require('../models');
const logger = require('../utils/logger');

const disasterHandlers = (io, socket) => {
  // Subscribe to disaster updates
  socket.on('disaster:subscribe', async (disasterId) => {
    try {
      const disaster = await Disaster.findByPk(disasterId);
      if (disaster) {
        socket.join(`disaster:${disasterId}`);
        socket.emit('disaster:subscribed', { 
          disasterId,
          status: disaster.status 
        });
      }
    } catch (error) {
      logger.error('Disaster subscribe error:', error);
      socket.emit('error', { message: 'Afet takibi başlatılamadı' });
    }
  });

  // Unsubscribe from disaster updates
  socket.on('disaster:unsubscribe', (disasterId) => {
    socket.leave(`disaster:${disasterId}`);
    socket.emit('disaster:unsubscribed', { disasterId });
  });

  // Update disaster status (coordinator only)
  socket.on('disaster:update:status', async (data) => {
    try {
      if (!['coordinator', 'city_manager'].includes(socket.user.role)) {
        return socket.emit('error', { message: 'Yetkisiz işlem' });
      }

      const { disasterId, status, notes } = data;
      
      const disaster = await Disaster.findByPk(disasterId);
      if (!disaster) {
        return socket.emit('error', { message: 'Afet bulunamadı' });
      }

      await disaster.update({ status });

      // Broadcast to all subscribers
      io.to(`disaster:${disasterId}`).emit('disaster:status:updated', {
        disasterId,
        status,
        updatedBy: socket.user.firstName + ' ' + socket.user.lastName,
        timestamp: new Date()
      });

      // Log the update
      logger.info(`Disaster ${disasterId} status updated to ${status} by ${socket.user.email}`);
    } catch (error) {
      logger.error('Disaster status update error:', error);
      socket.emit('error', { message: 'Durum güncellenemedi' });
    }
  });

  // Report new affected area
  socket.on('disaster:area:report', async (data) => {
    try {
      const { disasterId, coordinates, name, description, damageLevel } = data;

      const location = await Location.create({
        disasterId,
        name,
        type: 'district',
        coordinates: {
          type: 'Point',
          coordinates: [coordinates.longitude, coordinates.latitude]
        },
        damageAssessment: {
          level: damageLevel,
          assessmentDate: new Date(),
          assessedBy: socket.userId,
          details: { description }
        }
      });

      // Broadcast to relevant users
      io.to(`disaster:${disasterId}`).emit('disaster:area:new', {
        location: location.toJSON(),
        reportedBy: socket.user.firstName + ' ' + socket.user.lastName
      });

      socket.emit('disaster:area:reported', { 
        success: true,
        locationId: location.id 
      });
    } catch (error) {
      logger.error('Area report error:', error);
      socket.emit('error', { message: 'Bölge raporu gönderilemedi' });
    }
  });

  // Real-time casualty updates
  socket.on('disaster:casualties:update', async (data) => {
    try {
      if (!['coordinator', 'city_manager', 'field_officer'].includes(socket.user.role)) {
        return socket.emit('error', { message: 'Yetkisiz işlem' });
      }

      const { disasterId, casualties } = data;
      
      const disaster = await Disaster.findByPk(disasterId);
      if (!disaster) {
        return socket.emit('error', { message: 'Afet bulunamadı' });
      }

      await disaster.update({ casualties });

      // Broadcast critical update
      io.to(`disaster:${disasterId}`).emit('disaster:casualties:updated', {
        disasterId,
        casualties,
        updatedBy: socket.user.firstName + ' ' + socket.user.lastName,
        timestamp: new Date()
      });

      // Also notify coordinators
      io.broadcastToRoles(['coordinator', 'city_manager'], 'disaster:critical:update', {
        type: 'casualties',
        disasterId,
        data: casualties
      });
    } catch (error) {
      logger.error('Casualties update error:', error);
      socket.emit('error', { message: 'Kayıp bilgileri güncellenemedi' });
    }
  });
};

module.exports = disasterHandlers;