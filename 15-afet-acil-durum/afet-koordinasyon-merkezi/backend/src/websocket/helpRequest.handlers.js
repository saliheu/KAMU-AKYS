const { HelpRequest, Team, Location } = require('../models');
const logger = require('../utils/logger');

const helpRequestHandlers = (io, socket) => {
  // Subscribe to help request updates for a disaster
  socket.on('helpRequests:subscribe', (disasterId) => {
    if (['coordinator', 'city_manager', 'field_officer', 'ngo_representative'].includes(socket.user.role)) {
      socket.join(`help_requests:${disasterId}`);
      socket.emit('helpRequests:subscribed', { disasterId });
    }
  });

  // Create new help request (citizen)
  socket.on('helpRequest:create', async (data) => {
    try {
      const {
        disasterId,
        requestType,
        urgency,
        description,
        numberOfPeople,
        hasChildren,
        hasElderly,
        hasDisabled,
        hasInjured,
        coordinates,
        address,
        landmark
      } = data;

      // Create location if coordinates provided
      let locationId = null;
      if (coordinates) {
        const location = await Location.create({
          disasterId,
          name: `Yardım Talebi - ${socket.user.firstName} ${socket.user.lastName}`,
          type: 'other',
          coordinates: {
            type: 'Point',
            coordinates: [coordinates.longitude, coordinates.latitude]
          },
          address
        });
        locationId = location.id;
      }

      const helpRequest = await HelpRequest.create({
        disasterId,
        requestType,
        urgency,
        status: 'pending',
        requesterName: `${socket.user.firstName} ${socket.user.lastName}`,
        requesterPhone: socket.user.phoneNumber,
        requesterEmail: socket.user.email,
        numberOfPeople,
        hasChildren,
        hasElderly,
        hasDisabled,
        hasInjured,
        locationId,
        exactLocation: coordinates ? {
          type: 'Point',
          coordinates: [coordinates.longitude, coordinates.latitude]
        } : null,
        address,
        landmark,
        description,
        source: 'app',
        isVerified: socket.user.role !== 'citizen'
      });

      // Notify relevant personnel
      io.to(`help_requests:${disasterId}`).emit('helpRequest:new', {
        helpRequest: helpRequest.toJSON(),
        priority: urgency === 'critical' ? 'high' : 'normal'
      });

      // Notify coordinators for critical requests
      if (urgency === 'critical') {
        io.broadcastToRoles(['coordinator', 'city_manager'], 'helpRequest:critical', {
          helpRequest: helpRequest.toJSON()
        });
      }

      socket.emit('helpRequest:created', {
        success: true,
        helpRequestId: helpRequest.id,
        message: 'Yardım talebiniz alındı'
      });
    } catch (error) {
      logger.error('Help request creation error:', error);
      socket.emit('error', { message: 'Yardım talebi oluşturulamadı' });
    }
  });

  // Assign help request to team
  socket.on('helpRequest:assign', async (data) => {
    try {
      if (!['coordinator', 'city_manager', 'field_officer'].includes(socket.user.role)) {
        return socket.emit('error', { message: 'Yetkisiz işlem' });
      }

      const { helpRequestId, teamId } = data;

      const [helpRequest, team] = await Promise.all([
        HelpRequest.findByPk(helpRequestId),
        Team.findByPk(teamId)
      ]);

      if (!helpRequest || !team) {
        return socket.emit('error', { message: 'Talep veya takım bulunamadı' });
      }

      await helpRequest.update({
        assignedTeamId: teamId,
        assignedById: socket.userId,
        assignedAt: new Date(),
        status: 'assigned'
      });

      // Notify team members
      io.to(`team:${teamId}`).emit('helpRequest:assigned', {
        helpRequest: helpRequest.toJSON(),
        assignedBy: socket.user.firstName + ' ' + socket.user.lastName
      });

      // Update help request subscribers
      io.to(`help_requests:${helpRequest.disasterId}`).emit('helpRequest:updated', {
        helpRequestId,
        status: 'assigned',
        assignedTeam: {
          id: team.id,
          name: team.name
        }
      });

      socket.emit('helpRequest:assignment:success', {
        helpRequestId,
        teamId
      });
    } catch (error) {
      logger.error('Help request assignment error:', error);
      socket.emit('error', { message: 'Talep ataması yapılamadı' });
    }
  });

  // Update help request status
  socket.on('helpRequest:status:update', async (data) => {
    try {
      const { helpRequestId, status, notes } = data;

      const helpRequest = await HelpRequest.findByPk(helpRequestId, {
        include: [{ model: Team, as: 'assignedTeam' }]
      });

      if (!helpRequest) {
        return socket.emit('error', { message: 'Yardım talebi bulunamadı' });
      }

      // Check permissions
      const canUpdate = ['coordinator', 'city_manager'].includes(socket.user.role) ||
        (helpRequest.assignedTeam && helpRequest.assignedTeam.leaderId === socket.userId);

      if (!canUpdate) {
        return socket.emit('error', { message: 'Yetkisiz işlem' });
      }

      const updateData = { status };
      if (status === 'completed') {
        updateData.completedAt = new Date();
        updateData.completionNotes = notes;
      }

      await helpRequest.update(updateData);

      // Broadcast status update
      io.to(`help_requests:${helpRequest.disasterId}`).emit('helpRequest:status:changed', {
        helpRequestId,
        status,
        updatedBy: socket.user.firstName + ' ' + socket.user.lastName,
        timestamp: new Date()
      });

      // Notify assigned team
      if (helpRequest.assignedTeamId) {
        io.to(`team:${helpRequest.assignedTeamId}`).emit('helpRequest:status:updated', {
          helpRequestId,
          status,
          notes
        });
      }

      socket.emit('helpRequest:status:update:success', {
        helpRequestId,
        status
      });
    } catch (error) {
      logger.error('Help request status update error:', error);
      socket.emit('error', { message: 'Durum güncellenemedi' });
    }
  });

  // Real-time help request tracking
  socket.on('helpRequest:track', async (helpRequestId) => {
    try {
      const helpRequest = await HelpRequest.findByPk(helpRequestId);
      
      if (!helpRequest) {
        return socket.emit('error', { message: 'Yardım talebi bulunamadı' });
      }

      // Check if user can track this request
      const canTrack = socket.user.role !== 'citizen' || 
        helpRequest.requesterEmail === socket.user.email;

      if (!canTrack) {
        return socket.emit('error', { message: 'Bu talebi görüntüleme yetkiniz yok' });
      }

      socket.join(`help_request:${helpRequestId}`);
      socket.emit('helpRequest:tracking:started', {
        helpRequestId,
        currentStatus: helpRequest.status
      });
    } catch (error) {
      logger.error('Help request tracking error:', error);
      socket.emit('error', { message: 'Takip başlatılamadı' });
    }
  });
};

module.exports = helpRequestHandlers;