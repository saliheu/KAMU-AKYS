const { Notification, User } = require('../models');
const twilioClient = require('twilio')(
  process.env.TWILIO_ACCOUNT_SID,
  process.env.TWILIO_AUTH_TOKEN
);
const nodemailer = require('nodemailer');
const logger = require('../utils/logger');

// Email transporter
const emailTransporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: process.env.SMTP_PORT,
  secure: process.env.SMTP_SECURE === 'true',
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS
  }
});

const processNotification = async (job) => {
  const { notificationId } = job.data;

  try {
    const notification = await Notification.findByPk(notificationId, {
      include: [{ model: User }]
    });

    if (!notification) {
      throw new Error('Notification not found');
    }

    const deliveryStatus = { ...notification.deliveryStatus };

    // Send via different channels
    for (const channel of notification.channels) {
      try {
        switch (channel) {
          case 'email':
            await sendEmail(notification, notification.User);
            deliveryStatus.email = 'sent';
            break;
            
          case 'sms':
            await sendSMS(notification, notification.User);
            deliveryStatus.sms = 'sent';
            break;
            
          case 'push':
            await sendPushNotification(notification, notification.User);
            deliveryStatus.push = 'sent';
            break;
            
          case 'in_app':
            // Already handled by WebSocket
            deliveryStatus.in_app = 'sent';
            break;
        }
      } catch (error) {
        logger.error(`Failed to send notification via ${channel}:`, error);
        deliveryStatus[channel] = 'failed';
      }
    }

    // Update delivery status
    await notification.update({ deliveryStatus });

    return { success: true, deliveryStatus };
  } catch (error) {
    logger.error('Notification processing error:', error);
    throw error;
  }
};

const sendEmail = async (notification, user) => {
  if (!user.email) return;

  const mailOptions = {
    from: process.env.EMAIL_FROM,
    to: user.email,
    subject: notification.title,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background-color: #f44336; color: white; padding: 20px; text-align: center;">
          <h1 style="margin: 0;">Afet Koordinasyon Merkezi</h1>
        </div>
        <div style="padding: 20px; background-color: #f5f5f5;">
          <h2>${notification.title}</h2>
          <p style="color: #666; line-height: 1.6;">${notification.message}</p>
          ${notification.actionUrl ? `
            <div style="margin-top: 20px;">
              <a href="${notification.actionUrl}" 
                 style="background-color: #2196F3; color: white; padding: 10px 20px; 
                        text-decoration: none; border-radius: 5px; display: inline-block;">
                İşlem Yap
              </a>
            </div>
          ` : ''}
        </div>
        <div style="background-color: #333; color: white; padding: 10px; text-align: center; font-size: 12px;">
          <p>Bu e-posta Afet Koordinasyon Merkezi tarafından gönderilmiştir.</p>
        </div>
      </div>
    `
  };

  await emailTransporter.sendMail(mailOptions);
};

const sendSMS = async (notification, user) => {
  if (!user.phoneNumber || !process.env.TWILIO_PHONE_NUMBER) return;

  const message = `${notification.title}\n\n${notification.message}`;
  
  await twilioClient.messages.create({
    body: message.substring(0, 160), // SMS limit
    from: process.env.TWILIO_PHONE_NUMBER,
    to: user.phoneNumber.startsWith('+') ? user.phoneNumber : `+90${user.phoneNumber}`
  });
};

const sendPushNotification = async (notification, user) => {
  // Implement push notification logic here
  // This would integrate with services like Firebase Cloud Messaging
  logger.info(`Push notification would be sent to user ${user.id}`);
};

module.exports = {
  processNotification
};