const nodemailer = require('nodemailer');
const { htmlToText } = require('html-to-text');
const logger = require('../utils/logger');
const { cache } = require('../config/redis');
const path = require('path');
const fs = require('fs').promises;

class EmailService {
  constructor() {
    // Create transporter
    this.transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST || 'smtp.gmail.com',
      port: process.env.SMTP_PORT || 587,
      secure: process.env.SMTP_SECURE === 'true',
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS
      },
      tls: {
        rejectUnauthorized: process.env.NODE_ENV === 'production'
      }
    });

    // Verify transporter
    this.transporter.verify((error, success) => {
      if (error) {
        logger.error('Email transporter verification failed', { error: error.message });
      } else {
        logger.info('Email transporter is ready');
      }
    });

    // Email templates directory
    this.templatesDir = path.join(__dirname, '../templates/emails');
  }

  // Load email template
  async loadTemplate(templateName) {
    try {
      const templatePath = path.join(this.templatesDir, `${templateName}.html`);
      const template = await fs.readFile(templatePath, 'utf-8');
      return template;
    } catch (error) {
      logger.error('Failed to load email template', { 
        templateName, 
        error: error.message 
      });
      throw error;
    }
  }

  // Replace template variables
  replaceTemplateVariables(template, variables) {
    let result = template;
    Object.entries(variables).forEach(([key, value]) => {
      const regex = new RegExp(`{{${key}}}`, 'g');
      result = result.replace(regex, value);
    });
    return result;
  }

  // Send email
  async sendEmail(to, subject, html, attachments = []) {
    try {
      // Check if email is in suppression list
      const suppressionKey = `email_suppression:${to}`;
      const isSuppressed = await cache.exists(suppressionKey);
      if (isSuppressed) {
        logger.info('Email suppressed', { to, reason: 'User unsubscribed' });
        return;
      }

      // Rate limiting per email address
      const rateLimitKey = `email_rate:${to}`;
      const limited = await cache.rateLimit(rateLimitKey, 10, 3600); // 10 emails per hour
      if (!limited) {
        logger.warn('Email rate limit exceeded', { to });
        throw new Error('E-posta gönderim limiti aşıldı');
      }

      const mailOptions = {
        from: `${process.env.EMAIL_FROM_NAME || 'Mahkeme Randevu Sistemi'} <${process.env.EMAIL_FROM || process.env.SMTP_USER}>`,
        to,
        subject,
        html,
        text: htmlToText(html),
        attachments,
        headers: {
          'X-Priority': '3',
          'X-Mailer': 'Mahkeme Randevu Sistemi'
        }
      };

      const info = await this.transporter.sendMail(mailOptions);

      logger.info('Email sent successfully', {
        to,
        subject,
        messageId: info.messageId
      });

      // Log email in database
      const { query } = require('../config/database');
      await query(
        `INSERT INTO email_log (alici, konu, durum, message_id) 
         VALUES ($1, $2, $3, $4)`,
        [to, subject, 'gonderildi', info.messageId]
      );

      return info;
    } catch (error) {
      logger.error('Failed to send email', {
        to,
        subject,
        error: error.message
      });

      // Log failed email
      const { query } = require('../config/database');
      await query(
        `INSERT INTO email_log (alici, konu, durum, hata_mesaji) 
         VALUES ($1, $2, $3, $4)`,
        [to, subject, 'basarisiz', error.message]
      );

      throw error;
    }
  }

  // Send welcome email
  async sendWelcomeEmail(email, name) {
    try {
      const template = await this.loadTemplate('welcome');
      const html = this.replaceTemplateVariables(template, {
        name,
        loginUrl: `${process.env.FRONTEND_URL}/login`,
        supportEmail: process.env.SUPPORT_EMAIL || 'destek@mahkemerandevu.gov.tr'
      });

      await this.sendEmail(
        email,
        'Mahkeme Randevu Sistemine Hoş Geldiniz',
        html
      );
    } catch (error) {
      logger.error('Failed to send welcome email', { email, error: error.message });
    }
  }

  // Send appointment confirmation
  async sendAppointmentConfirmation(email, appointmentData) {
    try {
      const template = await this.loadTemplate('appointment-confirmation');
      const html = this.replaceTemplateVariables(template, {
        name: appointmentData.ad,
        appointmentCode: appointmentData.randevuKodu,
        courtName: appointmentData.mahkemeAd,
        date: appointmentData.tarih,
        time: appointmentData.saat,
        trackingUrl: `${process.env.FRONTEND_URL}/randevu/${appointmentData.randevuKodu}`,
        cancelUrl: `${process.env.FRONTEND_URL}/randevu/${appointmentData.randevuKodu}/iptal`
      });

      // Create calendar attachment
      const icsContent = this.createICSFile(appointmentData);
      const attachments = [{
        filename: 'randevu.ics',
        content: icsContent,
        contentType: 'text/calendar'
      }];

      await this.sendEmail(
        email,
        `Randevu Onayı - ${appointmentData.randevuKodu}`,
        html,
        attachments
      );
    } catch (error) {
      logger.error('Failed to send appointment confirmation', { 
        email, 
        error: error.message 
      });
    }
  }

  // Send appointment reminder
  async sendAppointmentReminder(email, appointmentData) {
    try {
      const template = await this.loadTemplate('appointment-reminder');
      const html = this.replaceTemplateVariables(template, {
        name: appointmentData.ad,
        appointmentCode: appointmentData.randevuKodu,
        courtName: appointmentData.mahkemeAd,
        courtAddress: appointmentData.mahkemeAdres,
        date: appointmentData.tarih,
        time: appointmentData.saat,
        trackingUrl: `${process.env.FRONTEND_URL}/randevu/${appointmentData.randevuKodu}`
      });

      await this.sendEmail(
        email,
        `Randevu Hatırlatması - Yarın ${appointmentData.saat}`,
        html
      );
    } catch (error) {
      logger.error('Failed to send appointment reminder', { 
        email, 
        error: error.message 
      });
    }
  }

  // Send appointment cancellation
  async sendAppointmentCancellation(email, cancellationData) {
    try {
      const template = await this.loadTemplate('appointment-cancellation');
      const html = this.replaceTemplateVariables(template, {
        name: cancellationData.ad,
        appointmentCode: cancellationData.randevuKodu,
        reason: cancellationData.iptalNedeni || 'Belirtilmemiş',
        rebookUrl: `${process.env.FRONTEND_URL}/randevu/yeni`
      });

      await this.sendEmail(
        email,
        `Randevu İptali - ${cancellationData.randevuKodu}`,
        html
      );
    } catch (error) {
      logger.error('Failed to send appointment cancellation', { 
        email, 
        error: error.message 
      });
    }
  }

  // Send appointment update
  async sendAppointmentUpdate(email, updateData) {
    try {
      const template = await this.loadTemplate('appointment-update');
      const html = this.replaceTemplateVariables(template, {
        name: updateData.ad,
        appointmentCode: updateData.randevuKodu,
        newDate: updateData.yeniTarih,
        newTime: updateData.yeniSaat,
        trackingUrl: `${process.env.FRONTEND_URL}/randevu/${updateData.randevuKodu}`
      });

      await this.sendEmail(
        email,
        `Randevu Güncellendi - ${updateData.randevuKodu}`,
        html
      );
    } catch (error) {
      logger.error('Failed to send appointment update', { 
        email, 
        error: error.message 
      });
    }
  }

  // Send password reset email
  async sendPasswordResetEmail(email, resetToken) {
    try {
      const template = await this.loadTemplate('password-reset');
      const resetUrl = `${process.env.FRONTEND_URL}/sifre-sifirla?token=${resetToken}`;
      
      const html = this.replaceTemplateVariables(template, {
        resetUrl,
        expiryTime: '1 saat'
      });

      await this.sendEmail(
        email,
        'Şifre Sıfırlama Talebi',
        html
      );
    } catch (error) {
      logger.error('Failed to send password reset email', { 
        email, 
        error: error.message 
      });
    }
  }

  // Send verification email
  async sendVerificationEmail(email, verificationToken) {
    try {
      const template = await this.loadTemplate('email-verification');
      const verifyUrl = `${process.env.FRONTEND_URL}/dogrula/email?token=${verificationToken}`;
      
      const html = this.replaceTemplateVariables(template, {
        verifyUrl
      });

      await this.sendEmail(
        email,
        'E-posta Adresinizi Doğrulayın',
        html
      );
    } catch (error) {
      logger.error('Failed to send verification email', { 
        email, 
        error: error.message 
      });
    }
  }

  // Send lawyer approval notification
  async sendLawyerApprovalNotification(email, approvalData) {
    try {
      const template = await this.loadTemplate('lawyer-approval');
      const html = this.replaceTemplateVariables(template, {
        name: approvalData.ad,
        status: approvalData.onayDurumu === 'onaylandi' ? 'onaylandı' : 'reddedildi',
        loginUrl: `${process.env.FRONTEND_URL}/login`
      });

      await this.sendEmail(
        email,
        'Avukat Kaydı Değerlendirme Sonucu',
        html
      );
    } catch (error) {
      logger.error('Failed to send lawyer approval notification', { 
        email, 
        error: error.message 
      });
    }
  }

  // Create ICS file for calendar
  createICSFile(appointmentData) {
    const startDate = new Date(`${appointmentData.tarih}T${appointmentData.saat}`);
    const endDate = new Date(startDate.getTime() + 30 * 60000); // 30 minutes

    const icsContent = `BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//Mahkeme Randevu Sistemi//TR
METHOD:REQUEST
BEGIN:VEVENT
UID:${appointmentData.randevuKodu}@mahkemerandevu.gov.tr
DTSTART:${this.formatDateToICS(startDate)}
DTEND:${this.formatDateToICS(endDate)}
SUMMARY:Mahkeme Randevusu - ${appointmentData.mahkemeAd}
DESCRIPTION:Randevu Kodu: ${appointmentData.randevuKodu}
LOCATION:${appointmentData.mahkemeAd}
STATUS:CONFIRMED
BEGIN:VALARM
TRIGGER:-PT1H
DESCRIPTION:Mahkeme randevunuz 1 saat sonra
ACTION:DISPLAY
END:VALARM
END:VEVENT
END:VCALENDAR`;

    return icsContent;
  }

  // Format date for ICS
  formatDateToICS(date) {
    return date.toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '');
  }

  // Send bulk emails
  async sendBulkEmails(recipients, subject, template, commonVariables = {}) {
    const results = {
      success: 0,
      failed: 0,
      errors: []
    };

    for (const recipient of recipients) {
      try {
        const html = this.replaceTemplateVariables(template, {
          ...commonVariables,
          ...recipient.variables
        });

        await this.sendEmail(recipient.email, subject, html);
        results.success++;
      } catch (error) {
        results.failed++;
        results.errors.push({
          email: recipient.email,
          error: error.message
        });
      }

      // Add delay to avoid rate limits
      await new Promise(resolve => setTimeout(resolve, 100));
    }

    logger.info('Bulk email sending completed', results);
    return results;
  }

  // Add email to suppression list
  async addToSuppressionList(email, reason = 'user_request') {
    const suppressionKey = `email_suppression:${email}`;
    await cache.set(suppressionKey, { reason, date: new Date() }, 0); // No expiry
    
    logger.info('Email added to suppression list', { email, reason });
  }

  // Remove from suppression list
  async removeFromSuppressionList(email) {
    const suppressionKey = `email_suppression:${email}`;
    await cache.del(suppressionKey);
    
    logger.info('Email removed from suppression list', { email });
  }
}

// Export singleton instance
module.exports = new EmailService();