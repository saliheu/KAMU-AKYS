const axios = require('axios');
const logger = require('../utils/logger');
const { cache } = require('../config/redis');
const crypto = require('crypto');

class SMSService {
  constructor() {
    // SMS provider configuration (Turkcell, Vodafone, or custom provider)
    this.provider = process.env.SMS_PROVIDER || 'netgsm';
    this.apiUrl = process.env.SMS_API_URL;
    this.username = process.env.SMS_USERNAME;
    this.password = process.env.SMS_PASSWORD;
    this.originator = process.env.SMS_ORIGINATOR || 'ADALET';
    
    // Create axios instance
    this.client = axios.create({
      baseURL: this.apiUrl,
      timeout: 10000,
      headers: {
        'Content-Type': 'application/json'
      }
    });
  }

  // Format phone number (remove spaces, add country code)
  formatPhoneNumber(phone) {
    // Remove all non-numeric characters
    let cleaned = phone.replace(/\D/g, '');
    
    // Add Turkey country code if not present
    if (cleaned.length === 10 && cleaned.startsWith('5')) {
      cleaned = '90' + cleaned;
    } else if (cleaned.length === 11 && cleaned.startsWith('0')) {
      cleaned = '9' + cleaned;
    }
    
    return cleaned;
  }

  // Validate phone number
  validatePhoneNumber(phone) {
    const formatted = this.formatPhoneNumber(phone);
    
    // Turkish mobile number validation
    if (!/^90[5][0-9]{9}$/.test(formatted)) {
      throw new Error('Geçersiz telefon numarası formatı');
    }
    
    return formatted;
  }

  // Send SMS via provider
  async sendSMS(phone, message) {
    try {
      const formattedPhone = this.validatePhoneNumber(phone);
      
      // Check if phone is in DND (Do Not Disturb) list
      const dndKey = `sms_dnd:${formattedPhone}`;
      const isDND = await cache.exists(dndKey);
      if (isDND) {
        logger.info('SMS blocked - DND list', { phone: formattedPhone });
        return { success: false, reason: 'DND' };
      }

      // Rate limiting
      const rateLimitKey = `sms_rate:${formattedPhone}`;
      const limited = await cache.rateLimit(rateLimitKey, 5, 3600); // 5 SMS per hour
      if (!limited) {
        logger.warn('SMS rate limit exceeded', { phone: formattedPhone });
        throw new Error('SMS gönderim limiti aşıldı');
      }

      // Send based on provider
      let result;
      switch (this.provider) {
        case 'netgsm':
          result = await this.sendViaNetGSM(formattedPhone, message);
          break;
        case 'iletimerkezi':
          result = await this.sendViaIletiMerkezi(formattedPhone, message);
          break;
        case 'turkcell':
          result = await this.sendViaTurkcell(formattedPhone, message);
          break;
        default:
          throw new Error('Desteklenmeyen SMS sağlayıcısı');
      }

      // Log SMS
      await this.logSMS(formattedPhone, message, result);

      return result;
    } catch (error) {
      logger.error('SMS sending failed', {
        phone,
        error: error.message
      });
      
      // Log failed SMS
      await this.logSMS(phone, message, { success: false, error: error.message });
      
      throw error;
    }
  }

  // Send via NetGSM
  async sendViaNetGSM(phone, message) {
    try {
      const response = await this.client.post('/sms/send', {
        usercode: this.username,
        password: this.password,
        gsmno: phone,
        message: message,
        msgheader: this.originator,
        filter: '0',
        startdate: '',
        stopdate: ''
      });

      const result = response.data;
      
      if (result.code === '00' || result.code === '01' || result.code === '02') {
        return {
          success: true,
          messageId: result.jobID,
          credit: result.credit
        };
      } else {
        throw new Error(`NetGSM Error: ${result.code}`);
      }
    } catch (error) {
      logger.error('NetGSM API error', { error: error.message });
      throw error;
    }
  }

  // Send via İleti Merkezi
  async sendViaIletiMerkezi(phone, message) {
    try {
      const response = await this.client.post('/send-sms', {
        username: this.username,
        password: this.password,
        text: message,
        receipents: {
          number: [phone]
        },
        sender: this.originator
      });

      const result = response.data;
      
      if (result.status.code === 200) {
        return {
          success: true,
          messageId: result.order.id
        };
      } else {
        throw new Error(`İleti Merkezi Error: ${result.status.message}`);
      }
    } catch (error) {
      logger.error('İleti Merkezi API error', { error: error.message });
      throw error;
    }
  }

  // Send via Turkcell
  async sendViaTurkcell(phone, message) {
    try {
      // Generate authentication hash
      const timestamp = Date.now();
      const hash = crypto
        .createHash('sha256')
        .update(`${this.username}${this.password}${timestamp}`)
        .digest('hex');

      const response = await this.client.post('/sms/submit', {
        authentication: {
          username: this.username,
          timestamp: timestamp,
          hash: hash
        },
        message: {
          sender: this.originator,
          text: message,
          recipients: [phone]
        }
      });

      const result = response.data;
      
      if (result.response.status === 0) {
        return {
          success: true,
          messageId: result.response.messageId
        };
      } else {
        throw new Error(`Turkcell Error: ${result.response.description}`);
      }
    } catch (error) {
      logger.error('Turkcell API error', { error: error.message });
      throw error;
    }
  }

  // Send verification SMS
  async sendVerificationSMS(phone, code) {
    const message = `Mahkeme Randevu Sistemi doğrulama kodunuz: ${code}. Bu kod 5 dakika geçerlidir.`;
    return await this.sendSMS(phone, message);
  }

  // Send appointment SMS
  async sendAppointmentSMS(phone, message) {
    const fullMessage = `MAHKEME RANDEVU: ${message}`;
    return await this.sendSMS(phone, fullMessage);
  }

  // Send reminder SMS
  async sendReminderSMS(phone, appointmentData) {
    const message = `HATIRLATMA: Yarın saat ${appointmentData.saat} ${appointmentData.mahkemeAd} randevunuz var. Kod: ${appointmentData.randevuKodu}`;
    return await this.sendSMS(phone, message);
  }

  // Send OTP
  async sendOTP(phone) {
    // Generate 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    
    // Store OTP in cache
    const otpKey = `sms_otp:${phone}`;
    await cache.set(otpKey, otp, 300); // 5 minutes
    
    // Send OTP
    const message = `Tek kullanımlık şifreniz: ${otp}. 5 dakika içinde kullanınız.`;
    const result = await this.sendSMS(phone, message);
    
    return { ...result, otp: process.env.NODE_ENV === 'development' ? otp : undefined };
  }

  // Verify OTP
  async verifyOTP(phone, otp) {
    const otpKey = `sms_otp:${phone}`;
    const storedOTP = await cache.get(otpKey);
    
    if (!storedOTP) {
      throw new Error('OTP süresi dolmuş veya bulunamadı');
    }
    
    if (storedOTP !== otp) {
      // Increment failed attempts
      const attemptsKey = `sms_otp_attempts:${phone}`;
      const attempts = await cache.incr(attemptsKey);
      
      if (attempts >= 3) {
        // Block for 1 hour after 3 failed attempts
        await cache.del(otpKey);
        await cache.set(`sms_otp_blocked:${phone}`, true, 3600);
        throw new Error('Çok fazla hatalı deneme. 1 saat sonra tekrar deneyin.');
      }
      
      throw new Error('Hatalı OTP');
    }
    
    // OTP is valid, delete it
    await cache.del(otpKey);
    await cache.del(`sms_otp_attempts:${phone}`);
    
    return true;
  }

  // Get SMS status
  async getSMSStatus(messageId) {
    try {
      let status;
      
      switch (this.provider) {
        case 'netgsm':
          status = await this.getNetGSMStatus(messageId);
          break;
        case 'iletimerkezi':
          status = await this.getIletiMerkeziStatus(messageId);
          break;
        case 'turkcell':
          status = await this.getTurkcellStatus(messageId);
          break;
        default:
          throw new Error('Desteklenmeyen SMS sağlayıcısı');
      }
      
      return status;
    } catch (error) {
      logger.error('Get SMS status failed', {
        messageId,
        error: error.message
      });
      throw error;
    }
  }

  // Log SMS to database
  async logSMS(phone, message, result) {
    try {
      const { query } = require('../config/database');
      
      await query(
        `INSERT INTO sms_log (telefon, mesaj, durum, mesaj_id, hata_mesaji, saglayici)
         VALUES ($1, $2, $3, $4, $5, $6)`,
        [
          phone,
          message,
          result.success ? 'gonderildi' : 'basarisiz',
          result.messageId || null,
          result.error || null,
          this.provider
        ]
      );
    } catch (error) {
      logger.error('SMS logging failed', { error: error.message });
    }
  }

  // Send bulk SMS
  async sendBulkSMS(recipients, message) {
    const results = {
      success: 0,
      failed: 0,
      errors: []
    };

    for (const phone of recipients) {
      try {
        await this.sendSMS(phone, message);
        results.success++;
      } catch (error) {
        results.failed++;
        results.errors.push({
          phone,
          error: error.message
        });
      }

      // Add delay to avoid rate limits
      await new Promise(resolve => setTimeout(resolve, 200));
    }

    logger.info('Bulk SMS sending completed', results);
    return results;
  }

  // Add to DND list
  async addToDNDList(phone, reason = 'user_request') {
    const formattedPhone = this.formatPhoneNumber(phone);
    const dndKey = `sms_dnd:${formattedPhone}`;
    await cache.set(dndKey, { reason, date: new Date() }, 0); // No expiry
    
    logger.info('Phone added to DND list', { phone: formattedPhone, reason });
  }

  // Remove from DND list
  async removeFromDNDList(phone) {
    const formattedPhone = this.formatPhoneNumber(phone);
    const dndKey = `sms_dnd:${formattedPhone}`;
    await cache.del(dndKey);
    
    logger.info('Phone removed from DND list', { phone: formattedPhone });
  }

  // Get SMS statistics
  async getStatistics(startDate, endDate) {
    try {
      const { query } = require('../config/database');
      
      const result = await query(
        `SELECT 
          COUNT(*) as toplam,
          COUNT(CASE WHEN durum = 'gonderildi' THEN 1 END) as basarili,
          COUNT(CASE WHEN durum = 'basarisiz' THEN 1 END) as basarisiz,
          saglayici,
          DATE(olusturma_tarihi) as tarih
         FROM sms_log
         WHERE olusturma_tarihi BETWEEN $1 AND $2
         GROUP BY saglayici, DATE(olusturma_tarihi)
         ORDER BY tarih DESC`,
        [startDate, endDate]
      );
      
      return result.rows;
    } catch (error) {
      logger.error('Get SMS statistics failed', { error: error.message });
      throw error;
    }
  }
}

// Export singleton instance
module.exports = new SMSService();