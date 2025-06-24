const { Team, Personnel, User } = require('../models');
const logger = require('../utils/logger');

const teamHandlers = (io, socket) => {
  // Join team room
  socket.on('team:join', async (teamId) => {
    try {
      // Verify user is part of the team
      const personnel = await Personnel.findOne({
        where: { 
          userId: socket.userId,
          teamId 
        }
      });

      if (personnel || ['coordinator', 'city_manager'].includes(socket.user.role)) {
        socket.join(`team:${teamId}`);
        
        // Notify team members
        socket.to(`team:${teamId}`).emit('team:member:joined', {
          userId: socket.userId,
          name: socket.user.firstName + ' ' + socket.user.lastName,
          timestamp: new Date()
        });

        socket.emit('team:joined', { teamId });
      } else {
        socket.emit('error', { message: 'Bu takıma erişim yetkiniz yok' });
      }
    } catch (error) {
      logger.error('Team join error:', error);
      socket.emit('error', { message: 'Takıma katılınamadı' });
    }
  });

  // Leave team room
  socket.on('team:leave', (teamId) => {
    socket.leave(`team:${teamId}`);
    
    // Notify team members
    socket.to(`team:${teamId}`).emit('team:member:left', {
      userId: socket.userId,
      name: socket.user.firstName + ' ' + socket.user.lastName,
      timestamp: new Date()
    });
  });

  // Team location update
  socket.on('team:location:update', async (data) => {
    try {
      const { teamId, coordinates } = data;

      // Verify user is team leader or coordinator
      const team = await Team.findByPk(teamId);
      if (!team || (team.leaderId !== socket.userId && !['coordinator', 'city_manager'].includes(socket.user.role))) {
        return socket.emit('error', { message: 'Yetkisiz işlem' });
      }

      await team.update({
        currentLocation: {
          type: 'Point',
          coordinates: [coordinates.longitude, coordinates.latitude]
        }
      });

      // Broadcast to team and coordinators
      io.to(`team:${teamId}`).emit('team:location:updated', {
        teamId,
        location: coordinates,
        updatedBy: socket.user.firstName + ' ' + socket.user.lastName,
        timestamp: new Date()
      });

      io.to(`disaster:${team.disasterId}`).emit('team:position:update', {
        teamId,
        teamName: team.name,
        location: coordinates
      });
    } catch (error) {
      logger.error('Team location update error:', error);
      socket.emit('error', { message: 'Takım konumu güncellenemedi' });
    }
  });

  // Team status update
  socket.on('team:status:update', async (data) => {
    try {
      const { teamId, status, notes } = data;

      const team = await Team.findByPk(teamId);
      if (!team || (team.leaderId !== socket.userId && !['coordinator', 'city_manager'].includes(socket.user.role))) {
        return socket.emit('error', { message: 'Yetkisiz işlem' });
      }

      await team.update({ 
        status,
        operationLog: [
          ...team.operationLog,
          {
            type: 'status_change',
            status,
            notes,
            userId: socket.userId,
            timestamp: new Date()
          }
        ]
      });

      // Broadcast status change
      io.to(`team:${teamId}`).emit('team:status:updated', {
        teamId,
        status,
        notes,
        updatedBy: socket.user.firstName + ' ' + socket.user.lastName
      });

      // Notify disaster room
      io.to(`disaster:${team.disasterId}`).emit('team:status:changed', {
        teamId,
        teamName: team.name,
        status
      });
    } catch (error) {
      logger.error('Team status update error:', error);
      socket.emit('error', { message: 'Takım durumu güncellenemedi' });
    }
  });

  // Emergency alert from team
  socket.on('team:emergency', async (data) => {
    try {
      const { teamId, message, priority = 'critical' } = data;

      const team = await Team.findByPk(teamId, {
        include: [{ model: User, as: 'leader' }]
      });

      if (!team) {
        return socket.emit('error', { message: 'Takım bulunamadı' });
      }

      // Log emergency
      await team.update({
        operationLog: [
          ...team.operationLog,
          {
            type: 'emergency',
            message,
            priority,
            userId: socket.userId,
            timestamp: new Date()
          }
        ]
      });

      // Broadcast emergency to all relevant parties
      const emergencyData = {
        teamId,
        teamName: team.name,
        message,
        priority,
        location: team.currentLocation,
        reportedBy: socket.user.firstName + ' ' + socket.user.lastName,
        timestamp: new Date()
      };

      // Notify team members
      io.to(`team:${teamId}`).emit('team:emergency:alert', emergencyData);

      // Notify coordinators
      io.broadcastToRoles(['coordinator', 'city_manager'], 'emergency:team', emergencyData);

      // Notify disaster room
      io.to(`disaster:${team.disasterId}`).emit('emergency:alert', emergencyData);

      socket.emit('team:emergency:sent', { success: true });
    } catch (error) {
      logger.error('Team emergency error:', error);
      socket.emit('error', { message: 'Acil durum bildirimi gönderilemedi' });
    }
  });

  // Team achievement update
  socket.on('team:achievement:report', async (data) => {
    try {
      const { teamId, type, count } = data;

      const team = await Team.findByPk(teamId);
      if (!team) {
        return socket.emit('error', { message: 'Takım bulunamadı' });
      }

      // Update achievements
      const achievements = { ...team.achievements };
      if (achievements[type] !== undefined) {
        achievements[type] += count;
      }

      await team.update({ 
        achievements,
        operationLog: [
          ...team.operationLog,
          {
            type: 'achievement',
            achievementType: type,
            count,
            userId: socket.userId,
            timestamp: new Date()
          }
        ]
      });

      // Broadcast achievement
      io.to(`team:${teamId}`).emit('team:achievement:updated', {
        teamId,
        type,
        newTotal: achievements[type],
        reportedBy: socket.user.firstName + ' ' + socket.user.lastName
      });

      // Update disaster statistics
      io.to(`disaster:${team.disasterId}`).emit('statistics:update', {
        type: 'team_achievement',
        teamId,
        achievementType: type,
        count
      });
    } catch (error) {
      logger.error('Team achievement error:', error);
      socket.emit('error', { message: 'Başarı raporu gönderilemedi' });
    }
  });
};

module.exports = teamHandlers;