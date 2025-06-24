const nodemailer = require('nodemailer');
const { User, Notification } = require('../models');
const { Op } = require('sequelize');
const { logger } = require('../utils/logger');
const Bull = require('bull');

// Create mail transporter
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: process.env.SMTP_PORT,
  secure: process.env.SMTP_PORT === '465',
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS
  }
});

// Create notification queue
const notificationQueue = new Bull('notifications', {
  redis: {
    host: process.env.REDIS_HOST,
    port: process.env.REDIS_PORT
  }
});

// Process notification queue
notificationQueue.process(async (job) => {
  const { type, data } = job.data;
  
  switch (type) {
    case 'email':
      await sendEmail(data);
      break;
    case 'sms':
      await sendSMS(data);
      break;
    case 'push':
      await sendPushNotification(data);
      break;
  }
});

const sendAlertNotifications = async (alert, rule) => {
  try {
    // Get users to notify
    const users = await getUsersToNotify(rule);

    for (const user of users) {
      // Check user notification preferences
      if (shouldNotifyUser(user, alert, rule)) {
        // Create notification record
        const notification = await Notification.create({
          userId: user.id,
          type: 'alert',
          channel: 'email',
          title: `Hava Kalitesi Uyarısı: ${alert.severity.toUpperCase()}`,
          message: alert.message,
          data: {
            alertId: alert.id,
            stationId: alert.stationId,
            severity: alert.severity,
            pollutant: alert.pollutant,
            value: alert.value
          }
        });

        // Queue notification
        if (user.notificationPreferences.email) {
          await notificationQueue.add('notification', {
            type: 'email',
            data: {
              to: user.email,
              subject: notification.title,
              html: generateAlertEmailTemplate(alert, user),
              notificationId: notification.id
            }
          });
        }

        if (user.notificationPreferences.push) {
          await notificationQueue.add('notification', {
            type: 'push',
            data: {
              userId: user.id,
              title: notification.title,
              body: notification.message,
              data: notification.data,
              notificationId: notification.id
            }
          });
        }
      }
    }

    // Send to additional emails if configured
    if (rule.notificationRecipients.emails?.length > 0) {
      for (const email of rule.notificationRecipients.emails) {
        await notificationQueue.add('notification', {
          type: 'email',
          data: {
            to: email,
            subject: `Hava Kalitesi Uyarısı: ${alert.severity.toUpperCase()}`,
            html: generateAlertEmailTemplate(alert)
          }
        });
      }
    }
  } catch (error) {
    logger.error('Error sending alert notifications:', error);
  }
};

const getUsersToNotify = async (rule) => {
  const where = {
    isActive: true,
    [Op.or]: []
  };

  // Add role-based recipients
  if (rule.notificationRecipients.roles?.length > 0) {
    where[Op.or].push({
      role: { [Op.in]: rule.notificationRecipients.roles }
    });
  }

  // Add specific user IDs
  if (rule.notificationRecipients.userIds?.length > 0) {
    where[Op.or].push({
      id: { [Op.in]: rule.notificationRecipients.userIds }
    });
  }

  if (where[Op.or].length === 0) {
    delete where[Op.or];
  }

  return User.findAll({ where });
};

const shouldNotifyUser = (user, alert, rule) => {
  // Check if user wants this type of alert
  const prefs = user.notificationPreferences;
  if (!prefs.alertTypes.includes(alert.severity)) {
    return false;
  }

  // Check notification channels
  return prefs.email || prefs.sms || prefs.push;
};

const sendEmail = async (data) => {
  try {
    const info = await transporter.sendMail({
      from: `"Hava Kalitesi İzleme Sistemi" <${process.env.SMTP_USER}>`,
      to: data.to,
      subject: data.subject,
      html: data.html
    });

    if (data.notificationId) {
      await Notification.update(
        { 
          status: 'sent',
          sentAt: new Date()
        },
        { where: { id: data.notificationId } }
      );
    }

    logger.info(`Email sent: ${info.messageId}`);
  } catch (error) {
    logger.error('Error sending email:', error);
    
    if (data.notificationId) {
      await Notification.update(
        { 
          status: 'failed',
          error: error.message
        },
        { where: { id: data.notificationId } }
      );
    }
    
    throw error;
  }
};

const sendSMS = async (data) => {
  // Implement SMS sending logic here
  logger.info('SMS sending not implemented yet');
};

const sendPushNotification = async (data) => {
  // Implement push notification logic here
  logger.info('Push notification not implemented yet');
};

const generateAlertEmailTemplate = (alert, user = null) => {
  const severityColors = {
    low: '#4CAF50',
    medium: '#FF9800',
    high: '#F44336',
    critical: '#9C27B0'
  };

  const aqiCategories = {
    good: { label: 'İyi', color: '#00E400' },
    moderate: { label: 'Orta', color: '#FFFF00' },
    unhealthy_sensitive: { label: 'Hassas Gruplar İçin Sağlıksız', color: '#FF7E00' },
    unhealthy: { label: 'Sağlıksız', color: '#FF0000' },
    very_unhealthy: { label: 'Çok Sağlıksız', color: '#8F3F97' },
    hazardous: { label: 'Tehlikeli', color: '#7E0023' }
  };

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <title>Hava Kalitesi Uyarısı</title>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background-color: ${severityColors[alert.severity]}; color: white; padding: 20px; text-align: center; }
        .content { background-color: #f4f4f4; padding: 20px; margin-top: 20px; }
        .alert-box { background-color: white; padding: 15px; margin: 10px 0; border-left: 4px solid ${severityColors[alert.severity]}; }
        .footer { text-align: center; margin-top: 20px; font-size: 12px; color: #666; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>Hava Kalitesi Uyarısı</h1>
          <h2>${alert.severity.toUpperCase()} SEVİYE</h2>
        </div>
        
        <div class="content">
          ${user ? `<p>Sayın ${user.name},</p>` : ''}
          
          <div class="alert-box">
            <h3>${alert.message}</h3>
            <p><strong>İstasyon:</strong> ${alert.station?.name || 'N/A'}</p>
            <p><strong>Tarih/Saat:</strong> ${new Date(alert.triggeredAt).toLocaleString('tr-TR')}</p>
            ${alert.pollutant ? `<p><strong>Kirletici:</strong> ${alert.pollutant.toUpperCase()}</p>` : ''}
            ${alert.value ? `<p><strong>Ölçülen Değer:</strong> ${alert.value} μg/m³</p>` : ''}
            ${alert.threshold ? `<p><strong>Eşik Değer:</strong> ${alert.threshold} μg/m³</p>` : ''}
          </div>
          
          <h3>Öneriler:</h3>
          <ul>
            ${getSeverityRecommendations(alert.severity).map(rec => `<li>${rec}</li>`).join('')}
          </ul>
          
          <p>Detaylı bilgi için sisteme giriş yapabilirsiniz.</p>
        </div>
        
        <div class="footer">
          <p>Bu e-posta Hava Kalitesi İzleme Sistemi tarafından otomatik olarak gönderilmiştir.</p>
        </div>
      </div>
    </body>
    </html>
  `;
};

const getSeverityRecommendations = (severity) => {
  const recommendations = {
    low: [
      'Hava kalitesi kabul edilebilir seviyede.',
      'Outdoor aktiviteler için uygundur.'
    ],
    medium: [
      'Hassas gruplar (çocuklar, yaşlılar, solunum hastası olanlar) açık havada uzun süreli aktivitelerden kaçınmalı.',
      'Genel popülasyon için risk düşük.'
    ],
    high: [
      'Hassas gruplar açık hava aktivitelerini sınırlandırmalı.',
      'Herkes uzun süreli ve yoğun açık hava aktivitelerinden kaçınmalı.',
      'Pencereler kapalı tutulmalı.'
    ],
    critical: [
      'Acil durum koşulları - Tüm popülasyon etkilenebilir.',
      'Herkes açık hava aktivitelerinden kaçınmalı.',
      'Hassas gruplar kapalı alanlarda kalmalı.',
      'Hava filtreleme sistemleri kullanılmalı.'
    ]
  };

  return recommendations[severity] || recommendations.medium;
};

const sendStationOfflineNotifications = async (alert, station) => {
  try {
    // Notify all admins and operators
    const users = await User.findAll({
      where: {
        isActive: true,
        role: { [Op.in]: ['super_admin', 'admin', 'operator'] }
      }
    });

    for (const user of users) {
      if (user.notificationPreferences.email) {
        await notificationQueue.add('notification', {
          type: 'email',
          data: {
            to: user.email,
            subject: 'İstasyon Çevrimdışı Uyarısı',
            html: `
              <h2>İstasyon Çevrimdışı</h2>
              <p>${station.name} istasyonu çevrimdışı durumda.</p>
              <p>Son veri alınma zamanı: ${station.lastDataReceived ? new Date(station.lastDataReceived).toLocaleString('tr-TR') : 'Bilinmiyor'}</p>
              <p>Lütfen durumu kontrol edin.</p>
            `
          }
        });
      }
    }
  } catch (error) {
    logger.error('Error sending station offline notifications:', error);
  }
};

module.exports = {
  sendAlertNotifications,
  sendStationOfflineNotifications,
  sendEmail,
  generateAlertEmailTemplate
};