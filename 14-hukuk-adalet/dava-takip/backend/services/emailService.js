const nodemailer = require('nodemailer');
const logger = require('../utils/logger');

class EmailService {
  constructor() {
    this.transporter = nodemailer.createTransporter({
      host: process.env.EMAIL_HOST,
      port: process.env.EMAIL_PORT,
      secure: process.env.EMAIL_PORT === '465',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
      }
    });
  }

  async sendEmail(to, subject, html, attachments = []) {
    try {
      const mailOptions = {
        from: process.env.EMAIL_FROM,
        to,
        subject,
        html,
        attachments
      };

      const info = await this.transporter.sendMail(mailOptions);
      logger.info(`Email sent: ${info.messageId}`);
      return info;
    } catch (error) {
      logger.error('Email send error:', error);
      throw error;
    }
  }

  async sendWelcomeEmail(user) {
    const subject = 'Dava Takip Sistemi\'ne Hoş Geldiniz';
    const html = `
      <h2>Hoş Geldiniz ${user.name} ${user.surname}</h2>
      <p>Dava Takip Sistemi hesabınız başarıyla oluşturuldu.</p>
      <p>Giriş bilgileriniz:</p>
      <ul>
        <li>Email: ${user.email}</li>
        <li>Rol: ${this.getRoleName(user.role)}</li>
      </ul>
      <p>Sisteme giriş yapmak için <a href="${process.env.FRONTEND_URL}/login">buraya tıklayın</a>.</p>
      <hr>
      <p>Bu otomatik bir emaildir, lütfen yanıtlamayın.</p>
    `;

    return this.sendEmail(user.email, subject, html);
  }

  async sendPasswordResetEmail(user, resetToken) {
    const resetUrl = `${process.env.FRONTEND_URL}/reset-password?token=${resetToken}`;
    const subject = 'Şifre Sıfırlama Talebi';
    const html = `
      <h2>Şifre Sıfırlama</h2>
      <p>Merhaba ${user.name} ${user.surname},</p>
      <p>Şifrenizi sıfırlamak için aşağıdaki linke tıklayın:</p>
      <a href="${resetUrl}" style="display: inline-block; padding: 10px 20px; background-color: #007bff; color: white; text-decoration: none; border-radius: 5px;">Şifremi Sıfırla</a>
      <p>Bu link 1 saat süreyle geçerlidir.</p>
      <p>Eğer şifre sıfırlama talebinde bulunmadıysanız, bu emaili görmezden gelebilirsiniz.</p>
      <hr>
      <p>Link çalışmıyorsa: ${resetUrl}</p>
    `;

    return this.sendEmail(user.email, subject, html);
  }

  async sendHearingReminder(hearing, user, caseData) {
    const subject = `Duruşma Hatırlatması - ${caseData.caseNumber}`;
    const hearingDate = new Date(hearing.hearingDate);
    const html = `
      <h2>Duruşma Hatırlatması</h2>
      <p>Sayın ${user.name} ${user.surname},</p>
      <p>Aşağıdaki duruşmanız yaklaşmaktadır:</p>
      <table style="border-collapse: collapse; width: 100%;">
        <tr>
          <td style="padding: 8px; border: 1px solid #ddd;"><strong>Dava No:</strong></td>
          <td style="padding: 8px; border: 1px solid #ddd;">${caseData.caseNumber}</td>
        </tr>
        <tr>
          <td style="padding: 8px; border: 1px solid #ddd;"><strong>Dava Başlığı:</strong></td>
          <td style="padding: 8px; border: 1px solid #ddd;">${caseData.title}</td>
        </tr>
        <tr>
          <td style="padding: 8px; border: 1px solid #ddd;"><strong>Tarih:</strong></td>
          <td style="padding: 8px; border: 1px solid #ddd;">${hearingDate.toLocaleDateString('tr-TR')}</td>
        </tr>
        <tr>
          <td style="padding: 8px; border: 1px solid #ddd;"><strong>Saat:</strong></td>
          <td style="padding: 8px; border: 1px solid #ddd;">${hearing.hearingTime}</td>
        </tr>
        <tr>
          <td style="padding: 8px; border: 1px solid #ddd;"><strong>Mahkeme:</strong></td>
          <td style="padding: 8px; border: 1px solid #ddd;">${caseData.court.name}</td>
        </tr>
        ${hearing.courtRoom ? `
        <tr>
          <td style="padding: 8px; border: 1px solid #ddd;"><strong>Salon:</strong></td>
          <td style="padding: 8px; border: 1px solid #ddd;">${hearing.courtRoom}</td>
        </tr>
        ` : ''}
      </table>
      <p>Detaylar için <a href="${process.env.FRONTEND_URL}/cases/${caseData.id}">buraya tıklayın</a>.</p>
    `;

    return this.sendEmail(user.email, subject, html);
  }

  async sendTaskReminder(task, user, caseData) {
    const subject = `Görev Hatırlatması - ${task.title}`;
    const dueDate = new Date(task.dueDate);
    const html = `
      <h2>Görev Hatırlatması</h2>
      <p>Sayın ${user.name} ${user.surname},</p>
      <p>Aşağıdaki görevinizin son tarihi yaklaşmaktadır:</p>
      <table style="border-collapse: collapse; width: 100%;">
        <tr>
          <td style="padding: 8px; border: 1px solid #ddd;"><strong>Görev:</strong></td>
          <td style="padding: 8px; border: 1px solid #ddd;">${task.title}</td>
        </tr>
        ${task.description ? `
        <tr>
          <td style="padding: 8px; border: 1px solid #ddd;"><strong>Açıklama:</strong></td>
          <td style="padding: 8px; border: 1px solid #ddd;">${task.description}</td>
        </tr>
        ` : ''}
        <tr>
          <td style="padding: 8px; border: 1px solid #ddd;"><strong>Son Tarih:</strong></td>
          <td style="padding: 8px; border: 1px solid #ddd;">${dueDate.toLocaleDateString('tr-TR')} ${dueDate.toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' })}</td>
        </tr>
        <tr>
          <td style="padding: 8px; border: 1px solid #ddd;"><strong>Öncelik:</strong></td>
          <td style="padding: 8px; border: 1px solid #ddd;">${this.getPriorityLabel(task.priority)}</td>
        </tr>
        ${caseData ? `
        <tr>
          <td style="padding: 8px; border: 1px solid #ddd;"><strong>İlgili Dava:</strong></td>
          <td style="padding: 8px; border: 1px solid #ddd;">${caseData.caseNumber} - ${caseData.title}</td>
        </tr>
        ` : ''}
      </table>
      <p>Görevi tamamlamak için <a href="${process.env.FRONTEND_URL}/tasks/${task.id}">buraya tıklayın</a>.</p>
    `;

    return this.sendEmail(user.email, subject, html);
  }

  async sendDeadlineWarning(caseData, deadline, user) {
    const subject = `Süre Uyarısı - ${caseData.caseNumber}`;
    const deadlineDate = new Date(deadline);
    const daysRemaining = Math.ceil((deadlineDate - new Date()) / (1000 * 60 * 60 * 24));
    
    const html = `
      <h2>Önemli Süre Uyarısı</h2>
      <p>Sayın ${user.name} ${user.surname},</p>
      <p><strong style="color: red;">DİKKAT:</strong> Aşağıdaki davanın süresi dolmak üzere!</p>
      <table style="border-collapse: collapse; width: 100%;">
        <tr>
          <td style="padding: 8px; border: 1px solid #ddd;"><strong>Dava No:</strong></td>
          <td style="padding: 8px; border: 1px solid #ddd;">${caseData.caseNumber}</td>
        </tr>
        <tr>
          <td style="padding: 8px; border: 1px solid #ddd;"><strong>Dava Başlığı:</strong></td>
          <td style="padding: 8px; border: 1px solid #ddd;">${caseData.title}</td>
        </tr>
        <tr>
          <td style="padding: 8px; border: 1px solid #ddd;"><strong>Süre Bitiş Tarihi:</strong></td>
          <td style="padding: 8px; border: 1px solid #ddd;">${deadlineDate.toLocaleDateString('tr-TR')}</td>
        </tr>
        <tr>
          <td style="padding: 8px; border: 1px solid #ddd;"><strong>Kalan Gün:</strong></td>
          <td style="padding: 8px; border: 1px solid #ddd; color: ${daysRemaining <= 3 ? 'red' : 'orange'}; font-weight: bold;">${daysRemaining} gün</td>
        </tr>
      </table>
      <p>Hemen işlem yapmak için <a href="${process.env.FRONTEND_URL}/cases/${caseData.id}">buraya tıklayın</a>.</p>
    `;

    return this.sendEmail(user.email, subject, html);
  }

  async sendCaseAssignment(caseData, user) {
    const subject = `Yeni Dava Ataması - ${caseData.caseNumber}`;
    const html = `
      <h2>Yeni Dava Ataması</h2>
      <p>Sayın ${user.name} ${user.surname},</p>
      <p>Size yeni bir dava atanmıştır:</p>
      <table style="border-collapse: collapse; width: 100%;">
        <tr>
          <td style="padding: 8px; border: 1px solid #ddd;"><strong>Dava No:</strong></td>
          <td style="padding: 8px; border: 1px solid #ddd;">${caseData.caseNumber}</td>
        </tr>
        <tr>
          <td style="padding: 8px; border: 1px solid #ddd;"><strong>Başlık:</strong></td>
          <td style="padding: 8px; border: 1px solid #ddd;">${caseData.title}</td>
        </tr>
        <tr>
          <td style="padding: 8px; border: 1px solid #ddd;"><strong>Müvekkil:</strong></td>
          <td style="padding: 8px; border: 1px solid #ddd;">${caseData.client.name} ${caseData.client.surname || caseData.client.companyName}</td>
        </tr>
        <tr>
          <td style="padding: 8px; border: 1px solid #ddd;"><strong>Mahkeme:</strong></td>
          <td style="padding: 8px; border: 1px solid #ddd;">${caseData.court.name}</td>
        </tr>
        <tr>
          <td style="padding: 8px; border: 1px solid #ddd;"><strong>Öncelik:</strong></td>
          <td style="padding: 8px; border: 1px solid #ddd;">${this.getPriorityLabel(caseData.priority)}</td>
        </tr>
      </table>
      <p>Dava detaylarını görüntülemek için <a href="${process.env.FRONTEND_URL}/cases/${caseData.id}">buraya tıklayın</a>.</p>
    `;

    return this.sendEmail(user.email, subject, html);
  }

  getRoleName(role) {
    const roles = {
      admin: 'Yönetici',
      lawyer: 'Avukat',
      secretary: 'Sekreter',
      clerk: 'Katip',
      client: 'Müvekkil'
    };
    return roles[role] || role;
  }

  getPriorityLabel(priority) {
    const priorities = {
      low: 'Düşük',
      medium: 'Orta',
      high: 'Yüksek',
      urgent: 'Acil'
    };
    return priorities[priority] || priority;
  }
}

module.exports = new EmailService();