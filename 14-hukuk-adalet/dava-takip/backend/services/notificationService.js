const { Notification } = require('../models');
const logger = require('../utils/logger');
const emailService = require('./emailService');

class NotificationService {
  async createNotification(data, options = {}) {
    try {
      const notification = await Notification.create(data, options);

      // Send real-time notification via Socket.io
      const io = global.io || require('../server').io;
      if (io) {
        io.to(`user:${data.userId}`).emit('notification:new', notification);
      }

      // Send email if enabled
      if (data.channels?.includes('email')) {
        await this.sendEmailNotification(notification);
      }

      return notification;
    } catch (error) {
      logger.error('Create notification error:', error);
      throw error;
    }
  }

  async createBulkNotifications(notifications, options = {}) {
    try {
      const created = await Notification.bulkCreate(notifications, options);

      // Send real-time notifications
      const io = global.io || require('../server').io;
      if (io) {
        created.forEach(notification => {
          io.to(`user:${notification.userId}`).emit('notification:new', notification);
        });
      }

      return created;
    } catch (error) {
      logger.error('Create bulk notifications error:', error);
      throw error;
    }
  }

  async markAsRead(notificationId, userId) {
    try {
      const notification = await Notification.findOne({
        where: { id: notificationId, userId }
      });

      if (!notification) {
        throw new Error('Notification not found');
      }

      notification.isRead = true;
      notification.readAt = new Date();
      await notification.save();

      // Send real-time update
      const io = global.io || require('../server').io;
      if (io) {
        io.to(`user:${userId}`).emit('notification:read', notificationId);
      }

      return notification;
    } catch (error) {
      logger.error('Mark notification as read error:', error);
      throw error;
    }
  }

  async markAllAsRead(userId) {
    try {
      await Notification.update(
        { isRead: true, readAt: new Date() },
        { where: { userId, isRead: false } }
      );

      // Send real-time update
      const io = global.io || require('../server').io;
      if (io) {
        io.to(`user:${userId}`).emit('notification:allRead');
      }

      return true;
    } catch (error) {
      logger.error('Mark all notifications as read error:', error);
      throw error;
    }
  }

  async sendEmailNotification(notification) {
    try {
      const { User } = require('../models');
      const user = await User.findByPk(notification.userId);

      if (!user || !user.settings?.notifications?.email) {
        return;
      }

      await emailService.sendEmail(
        user.email,
        notification.title,
        `
          <h2>${notification.title}</h2>
          <p>${notification.message}</p>
          <hr>
          <p>Bu bildirimi sistemde görüntülemek için <a href="${process.env.FRONTEND_URL}/notifications">buraya tıklayın</a>.</p>
        `
      );

      notification.isSent = true;
      notification.sentAt = new Date();
      await notification.save();
    } catch (error) {
      logger.error('Send email notification error:', error);
    }
  }

  async cleanupOldNotifications() {
    try {
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

      const deleted = await Notification.destroy({
        where: {
          isRead: true,
          readAt: { [Op.lt]: thirtyDaysAgo }
        }
      });

      logger.info(`Cleaned up ${deleted} old notifications`);
      return deleted;
    } catch (error) {
      logger.error('Cleanup notifications error:', error);
      throw error;
    }
  }

  async getUnreadCount(userId) {
    try {
      return await Notification.count({
        where: { userId, isRead: false }
      });
    } catch (error) {
      logger.error('Get unread count error:', error);
      throw error;
    }
  }
}

module.exports = new NotificationService();