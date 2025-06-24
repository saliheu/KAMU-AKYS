const nodemailer = require('nodemailer');
const logger = require('../utils/logger');

class EmailService {
  constructor() {
    this.transporter = nodemailer.createTransporter({
      host: process.env.EMAIL_HOST,
      port: process.env.EMAIL_PORT,
      secure: process.env.EMAIL_PORT == 465,
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
      }
    });
  }

  async sendMail(to, subject, html, attachments = []) {
    try {
      const mailOptions = {
        from: process.env.EMAIL_FROM || 'Digital Library <noreply@digitallibrary.gov>',
        to,
        subject,
        html,
        attachments
      };

      const info = await this.transporter.sendMail(mailOptions);
      logger.info(`Email sent: ${info.messageId}`);
      return info;
    } catch (error) {
      logger.error('Email sending error:', error);
      throw error;
    }
  }

  async sendVerificationEmail(user) {
    const verificationUrl = `${process.env.FRONTEND_URL}/verify-email/${user.emailVerificationToken}`;
    
    const html = `
      <h2>Hoş Geldiniz ${user.name}!</h2>
      <p>Dijital Kütüphane'ye kayıt olduğunuz için teşekkür ederiz.</p>
      <p>E-posta adresinizi doğrulamak için lütfen aşağıdaki bağlantıya tıklayın:</p>
      <a href="${verificationUrl}" style="display: inline-block; padding: 10px 20px; background-color: #007bff; color: white; text-decoration: none; border-radius: 5px;">E-postayı Doğrula</a>
      <p>Veya bu bağlantıyı tarayıcınıza kopyalayın:</p>
      <p>${verificationUrl}</p>
      <p>Bu bağlantı 24 saat geçerlidir.</p>
      <hr>
      <p>Eğer bu hesabı siz oluşturmadıysanız, bu e-postayı görmezden gelebilirsiniz.</p>
    `;

    return this.sendMail(
      user.email,
      'E-posta Adresinizi Doğrulayın - Dijital Kütüphane',
      html
    );
  }

  async sendPasswordResetEmail(user, resetToken) {
    const resetUrl = `${process.env.FRONTEND_URL}/reset-password/${resetToken}`;
    
    const html = `
      <h2>Şifre Sıfırlama</h2>
      <p>Merhaba ${user.name},</p>
      <p>Şifrenizi sıfırlamak için bir istek aldık. Aşağıdaki bağlantıya tıklayarak yeni şifrenizi oluşturabilirsiniz:</p>
      <a href="${resetUrl}" style="display: inline-block; padding: 10px 20px; background-color: #dc3545; color: white; text-decoration: none; border-radius: 5px;">Şifreyi Sıfırla</a>
      <p>Veya bu bağlantıyı tarayıcınıza kopyalayın:</p>
      <p>${resetUrl}</p>
      <p>Bu bağlantı 1 saat geçerlidir.</p>
      <hr>
      <p>Eğer şifre sıfırlama talebinde bulunmadıysanız, bu e-postayı görmezden gelebilirsiniz.</p>
    `;

    return this.sendMail(
      user.email,
      'Şifre Sıfırlama - Dijital Kütüphane',
      html
    );
  }

  async sendBorrowingConfirmation(user, book, borrowing) {
    const html = `
      <h2>Kitap Ödünç Alma Onayı</h2>
      <p>Merhaba ${user.name},</p>
      <p>Aşağıdaki kitabı başarıyla ödünç aldınız:</p>
      <div style="border: 1px solid #ddd; padding: 15px; margin: 15px 0; border-radius: 5px;">
        <h3>${book.title}</h3>
        ${book.authors?.length ? `<p><strong>Yazar(lar):</strong> ${book.authors.map(a => a.fullName).join(', ')}</p>` : ''}
        <p><strong>Ödünç Alma Tarihi:</strong> ${new Date(borrowing.borrowDate).toLocaleDateString('tr-TR')}</p>
        <p><strong>İade Tarihi:</strong> ${new Date(borrowing.dueDate).toLocaleDateString('tr-TR')}</p>
      </div>
      <p>Lütfen kitabı belirtilen tarihte veya öncesinde iade etmeyi unutmayın.</p>
      <p>İyi okumalar dileriz!</p>
    `;

    return this.sendMail(
      user.email,
      `Kitap Ödünç Alma - ${book.title}`,
      html
    );
  }

  async sendDueReminder(user, book, borrowing, daysUntilDue) {
    const html = `
      <h2>İade Tarihi Hatırlatması</h2>
      <p>Merhaba ${user.name},</p>
      <p>Ödünç aldığınız kitabın iade tarihi yaklaşıyor:</p>
      <div style="border: 1px solid #ffc107; padding: 15px; margin: 15px 0; border-radius: 5px; background-color: #fff3cd;">
        <h3>${book.title}</h3>
        <p><strong>İade Tarihi:</strong> ${new Date(borrowing.dueDate).toLocaleDateString('tr-TR')}</p>
        <p><strong>Kalan Gün:</strong> ${daysUntilDue}</p>
      </div>
      <p>Kitabı zamanında iade etmezseniz günlük ceza uygulanacaktır.</p>
      <p>Sürenizi uzatmak isterseniz, hesabınıza giriş yaparak yenileme işlemi yapabilirsiniz.</p>
    `;

    return this.sendMail(
      user.email,
      `İade Hatırlatması - ${book.title}`,
      html
    );
  }

  async sendOverdueNotice(user, book, borrowing, overdueDays, fine) {
    const html = `
      <h2>Gecikmiş İade Bildirimi</h2>
      <p>Merhaba ${user.name},</p>
      <p style="color: #dc3545;"><strong>Ödünç aldığınız kitabın iade süresi dolmuştur!</strong></p>
      <div style="border: 1px solid #dc3545; padding: 15px; margin: 15px 0; border-radius: 5px; background-color: #f8d7da;">
        <h3>${book.title}</h3>
        <p><strong>İade Tarihi:</strong> ${new Date(borrowing.dueDate).toLocaleDateString('tr-TR')}</p>
        <p><strong>Gecikme Süresi:</strong> ${overdueDays} gün</p>
        <p><strong>Ceza Tutarı:</strong> ${fine} TL</p>
      </div>
      <p>Lütfen kitabı en kısa sürede iade edin. Gecikme cezası her gün artmaya devam edecektir.</p>
    `;

    return this.sendMail(
      user.email,
      `ACİL: Gecikmiş İade - ${book.title}`,
      html
    );
  }

  async sendReservationReady(user, book, reservation) {
    const html = `
      <h2>Rezervasyonunuz Hazır!</h2>
      <p>Merhaba ${user.name},</p>
      <p>Rezerve ettiğiniz kitap artık sizin için hazır:</p>
      <div style="border: 1px solid #28a745; padding: 15px; margin: 15px 0; border-radius: 5px; background-color: #d4edda;">
        <h3>${book.title}</h3>
        <p><strong>Teslim Alma Son Tarihi:</strong> ${new Date(reservation.pickupDeadline).toLocaleDateString('tr-TR')}</p>
      </div>
      <p>Lütfen belirtilen tarihe kadar kütüphaneye gelerek kitabınızı teslim alın.</p>
      <p>Belirtilen süre içinde teslim alınmayan kitaplar bir sonraki kişiye verilecektir.</p>
    `;

    return this.sendMail(
      user.email,
      `Rezervasyonunuz Hazır - ${book.title}`,
      html
    );
  }

  async sendNewBookNotification(user, book, categories) {
    const html = `
      <h2>Yeni Kitap: ${book.title}</h2>
      <p>Merhaba ${user.name},</p>
      <p>İlgilendiğiniz kategorilerde yeni bir kitap eklendi:</p>
      <div style="border: 1px solid #17a2b8; padding: 15px; margin: 15px 0; border-radius: 5px;">
        <h3>${book.title}</h3>
        ${book.authors?.length ? `<p><strong>Yazar(lar):</strong> ${book.authors.map(a => a.fullName).join(', ')}</p>` : ''}
        ${categories?.length ? `<p><strong>Kategoriler:</strong> ${categories.map(c => c.name).join(', ')}</p>` : ''}
        ${book.description ? `<p>${book.description.substring(0, 200)}...</p>` : ''}
      </div>
      <p><a href="${process.env.FRONTEND_URL}/books/${book.id}" style="color: #007bff;">Kitabı İncele</a></p>
    `;

    return this.sendMail(
      user.email,
      `Yeni Kitap: ${book.title}`,
      html
    );
  }

  async sendMembershipExpiry(user, daysUntilExpiry) {
    const html = `
      <h2>Üyelik Yenileme Hatırlatması</h2>
      <p>Merhaba ${user.name},</p>
      <p>Üyeliğinizin sona ermesine <strong>${daysUntilExpiry} gün</strong> kaldı.</p>
      <p>Üyelik bitiş tarihi: ${new Date(user.membershipExpiry).toLocaleDateString('tr-TR')}</p>
      <p>Dijital Kütüphane hizmetlerinden kesintisiz yararlanmaya devam etmek için üyeliğinizi yenilemeyi unutmayın.</p>
      <p><a href="${process.env.FRONTEND_URL}/membership" style="display: inline-block; padding: 10px 20px; background-color: #28a745; color: white; text-decoration: none; border-radius: 5px;">Üyeliği Yenile</a></p>
    `;

    return this.sendMail(
      user.email,
      'Üyelik Yenileme Hatırlatması - Dijital Kütüphane',
      html
    );
  }

  async sendFineNotification(user, totalFine, borrowings) {
    const html = `
      <h2>Ödenmemiş Ceza Bildirimi</h2>
      <p>Merhaba ${user.name},</p>
      <p>Hesabınızda toplam <strong>${totalFine} TL</strong> ödenmemiş ceza bulunmaktadır.</p>
      <h3>Ceza Detayları:</h3>
      <ul>
        ${borrowings.map(b => `
          <li>
            <strong>${b.book.title}</strong><br>
            İade Tarihi: ${new Date(b.dueDate).toLocaleDateString('tr-TR')}<br>
            Ceza: ${b.fine} TL
          </li>
        `).join('')}
      </ul>
      <p>Yeni kitap ödünç alabilmek için lütfen cezalarınızı ödeyin.</p>
      <p><a href="${process.env.FRONTEND_URL}/fines" style="color: #007bff;">Cezaları Görüntüle ve Öde</a></p>
    `;

    return this.sendMail(
      user.email,
      'Ödenmemiş Ceza Bildirimi - Dijital Kütüphane',
      html
    );
  }

  async sendWeeklyNewsletter(user, data) {
    const { newBooks, popularBooks, upcomingEvents, readingTip } = data;

    const html = `
      <h2>Haftalık Kütüphane Bülteni</h2>
      <p>Merhaba ${user.name},</p>
      
      ${newBooks?.length ? `
        <h3>Bu Hafta Eklenen Kitaplar</h3>
        <ul>
          ${newBooks.slice(0, 5).map(book => `
            <li>
              <strong>${book.title}</strong>
              ${book.authors?.length ? ` - ${book.authors[0].fullName}` : ''}
            </li>
          `).join('')}
        </ul>
      ` : ''}
      
      ${popularBooks?.length ? `
        <h3>En Çok Okunanlar</h3>
        <ol>
          ${popularBooks.slice(0, 5).map(book => `
            <li>
              <strong>${book.title}</strong>
              (${book.borrowCount} kez ödünç alındı)
            </li>
          `).join('')}
        </ol>
      ` : ''}
      
      ${upcomingEvents?.length ? `
        <h3>Yaklaşan Etkinlikler</h3>
        <ul>
          ${upcomingEvents.map(event => `
            <li>
              <strong>${event.title}</strong><br>
              ${new Date(event.date).toLocaleDateString('tr-TR')} - ${event.time}
            </li>
          `).join('')}
        </ul>
      ` : ''}
      
      ${readingTip ? `
        <h3>Haftanın Okuma İpucu</h3>
        <p>${readingTip}</p>
      ` : ''}
      
      <hr>
      <p style="font-size: 12px; color: #666;">
        Bu bülten tercihlerinize göre gönderilmiştir. 
        <a href="${process.env.FRONTEND_URL}/settings/notifications">E-posta tercihlerini güncelle</a>
      </p>
    `;

    return this.sendMail(
      user.email,
      'Haftalık Kütüphane Bülteni',
      html
    );
  }
}

module.exports = new EmailService();