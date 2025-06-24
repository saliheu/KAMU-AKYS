const { Notification, User } = require('../models');
const emailService = require('./emailService');
const logger = require('../utils/logger');
const { getRedis } = require('../config/redis');

class NotificationService {
  async createNotification(userId, type, title, message, options = {}) {
    try {
      const notification = await Notification.create({
        userId,
        type,
        title,
        message,
        relatedId: options.relatedId,
        relatedType: options.relatedType,
        priority: options.priority || 'medium',
        expiresAt: options.expiresAt
      });

      // Send real-time notification if user is online
      const io = require('../server').io;
      io.to(`user-${userId}`).emit('notification', {
        id: notification.id,
        type: notification.type,
        title: notification.title,
        message: notification.message,
        createdAt: notification.createdAt
      });

      // Send email if enabled
      if (options.sendEmail) {
        const user = await User.findByPk(userId);
        if (user && user.preferences?.emailNotifications) {
          await this.sendEmailNotification(user, notification);
        }
      }

      return notification;
    } catch (error) {
      logger.error('Create notification error:', error);
      throw error;
    }
  }

  async sendEmailNotification(user, notification) {
    try {
      const html = `
        <h2>${notification.title}</h2>
        <p>${notification.message}</p>
        <p><a href="${process.env.FRONTEND_URL}/notifications">Tüm bildirimleri görüntüle</a></p>
      `;

      await emailService.sendMail(
        user.email,
        notification.title,
        html
      );

      await notification.update({ emailSent: true });
    } catch (error) {
      logger.error('Send email notification error:', error);
    }
  }

  async sendBorrowingConfirmation(user, book, borrowing) {
    await this.createNotification(
      user.id,
      'due_reminder',
      'Kitap Ödünç Aldınız',
      `${book.title} kitabını başarıyla ödünç aldınız. İade tarihi: ${new Date(borrowing.dueDate).toLocaleDateString('tr-TR')}`,
      {
        relatedId: borrowing.id,
        relatedType: 'borrowing',
        sendEmail: true
      }
    );

    if (user.preferences?.emailNotifications) {
      await emailService.sendBorrowingConfirmation(user, book, borrowing);
    }
  }

  async sendRenewalConfirmation(user, book, borrowing) {
    await this.createNotification(
      user.id,
      'due_reminder',
      'Ödünç Süresi Uzatıldı',
      `${book.title} kitabının ödünç süresi uzatıldı. Yeni iade tarihi: ${new Date(borrowing.dueDate).toLocaleDateString('tr-TR')}`,
      {
        relatedId: borrowing.id,
        relatedType: 'borrowing'
      }
    );
  }

  async sendDueReminder(user, book, borrowing, daysUntilDue) {
    await this.createNotification(
      user.id,
      'due_reminder',
      'İade Tarihi Yaklaşıyor',
      `${book.title} kitabının iade tarihine ${daysUntilDue} gün kaldı.`,
      {
        relatedId: borrowing.id,
        relatedType: 'borrowing',
        priority: daysUntilDue <= 1 ? 'high' : 'medium',
        sendEmail: daysUntilDue <= 3
      }
    );

    if (user.preferences?.emailNotifications && daysUntilDue <= 3) {
      await emailService.sendDueReminder(user, book, borrowing, daysUntilDue);
    }
  }

  async sendOverdueNotice(user, book, borrowing, overdueDays, fine) {
    await this.createNotification(
      user.id,
      'overdue_notice',
      'Gecikmiş İade',
      `${book.title} kitabının iadesi ${overdueDays} gün gecikmiş. Ceza tutarı: ${fine} TL`,
      {
        relatedId: borrowing.id,
        relatedType: 'borrowing',
        priority: 'high',
        sendEmail: true
      }
    );

    if (user.preferences?.emailNotifications) {
      await emailService.sendOverdueNotice(user, book, borrowing, overdueDays, fine);
    }
  }

  async sendReservationReady(user, book, reservation) {
    await this.createNotification(
      user.id,
      'reservation_ready',
      'Rezervasyonunuz Hazır',
      `${book.title} kitabı sizin için hazır. Teslim alma son tarihi: ${new Date(reservation.pickupDeadline).toLocaleDateString('tr-TR')}`,
      {
        relatedId: reservation.id,
        relatedType: 'reservation',
        priority: 'high',
        sendEmail: true
      }
    );

    if (user.preferences?.emailNotifications) {
      await emailService.sendReservationReady(user, book, reservation);
    }
  }

  async sendNewBookNotification(users, book, categories) {
    const bulkNotifications = users.map(user => ({
      userId: user.id,
      type: 'new_book',
      title: 'Yeni Kitap',
      message: `İlgilendiğiniz kategoride yeni kitap: ${book.title}`,
      relatedId: book.id,
      relatedType: 'book',
      createdAt: new Date(),
      updatedAt: new Date()
    }));

    await Notification.bulkCreate(bulkNotifications);

    // Send emails to users who have email notifications enabled
    const emailUsers = users.filter(u => u.preferences?.emailNotifications);
    
    for (const user of emailUsers) {
      await emailService.sendNewBookNotification(user, book, categories);
    }
  }

  async sendFineNotification(user, totalFine, borrowings) {
    await this.createNotification(
      user.id,
      'fine_notice',
      'Ödenmemiş Ceza',
      `Toplam ${totalFine} TL ödenmemiş cezanız bulunmaktadır.`,
      {
        relatedType: 'fine',
        priority: 'high',
        sendEmail: true
      }
    );

    if (user.preferences?.emailNotifications) {
      await emailService.sendFineNotification(user, totalFine, borrowings);
    }
  }

  async sendMembershipExpiry(user, daysUntilExpiry) {
    await this.createNotification(
      user.id,
      'account_update',
      'Üyelik Yenileme',
      `Üyeliğinizin sona ermesine ${daysUntilExpiry} gün kaldı.`,
      {
        priority: daysUntilExpiry <= 7 ? 'high' : 'medium',
        sendEmail: daysUntilExpiry <= 7
      }
    );

    if (user.preferences?.emailNotifications && daysUntilExpiry <= 7) {
      await emailService.sendMembershipExpiry(user, daysUntilExpiry);
    }
  }

  async markAsRead(notificationId, userId) {
    const notification = await Notification.findOne({
      where: {
        id: notificationId,
        userId
      }
    });

    if (!notification) {
      throw new Error('Bildirim bulunamadı');
    }

    await notification.update({
      isRead: true,
      readAt: new Date()
    });

    return notification;
  }

  async markAllAsRead(userId) {
    await Notification.update(
      {
        isRead: true,
        readAt: new Date()
      },
      {
        where: {
          userId,
          isRead: false
        }
      }
    );
  }

  async deleteNotification(notificationId, userId) {
    const notification = await Notification.findOne({
      where: {
        id: notificationId,
        userId
      }
    });

    if (!notification) {
      throw new Error('Bildirim bulunamadı');
    }

    await notification.destroy();
  }

  async getUserNotifications(userId, options = {}) {
    const {
      page = 1,
      limit = 20,
      unreadOnly = false,
      type
    } = options;

    const where = { userId };
    
    if (unreadOnly) {
      where.isRead = false;
    }
    
    if (type) {
      where.type = type;
    }

    const offset = (page - 1) * limit;

    const { rows: notifications, count } = await Notification.findAndCountAll({
      where,
      order: [['createdAt', 'DESC']],
      limit: parseInt(limit),
      offset
    });

    return {
      notifications,
      pagination: {
        total: count,
        page: parseInt(page),
        pages: Math.ceil(count / limit),
        limit: parseInt(limit)
      }
    };
  }

  async getUnreadCount(userId) {
    return Notification.count({
      where: {
        userId,
        isRead: false
      }
    });
  }

  // Scheduled notification jobs
  async sendDailyReminders() {
    logger.info('Starting daily reminder job');

    // Due reminders
    const dueBorrowings = await Borrowing.findAll({
      where: {
        status: 'active',
        dueDate: {
          [Op.between]: [
            new Date(),
            new Date(Date.now() + 3 * 24 * 60 * 60 * 1000)
          ]
        }
      },
      include: ['user', 'book']
    });

    for (const borrowing of dueBorrowings) {
      const daysUntilDue = Math.ceil(
        (new Date(borrowing.dueDate) - new Date()) / (1000 * 60 * 60 * 24)
      );
      
      await this.sendDueReminder(
        borrowing.user,
        borrowing.book,
        borrowing,
        daysUntilDue
      );
    }

    // Overdue notices
    const overdueBorrowings = await Borrowing.findAll({
      where: {
        status: 'active',
        dueDate: { [Op.lt]: new Date() }
      },
      include: ['user', 'book']
    });

    for (const borrowing of overdueBorrowings) {
      const overdueDays = Math.floor(
        (new Date() - new Date(borrowing.dueDate)) / (1000 * 60 * 60 * 24)
      );
      
      const fine = Borrowing.calculateFine(borrowing.dueDate);
      
      await this.sendOverdueNotice(
        borrowing.user,
        borrowing.book,
        borrowing,
        overdueDays,
        fine
      );
    }

    logger.info('Daily reminder job completed');
  }

  async cleanupExpiredNotifications() {
    const deleted = await Notification.destroy({
      where: {
        expiresAt: { [Op.lt]: new Date() }
      }
    });

    logger.info(`Cleaned up ${deleted} expired notifications`);
  }
}

module.exports = new NotificationService();