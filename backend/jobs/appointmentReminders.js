const cron = require('node-cron');
const Appointment = require('../models/Appointment');
const emailService = require('../services/emailService');
const smsService = require('../services/smsService');
const logger = require('../utils/logger');
const { query } = require('../config/database');
const { cache } = require('../config/redis');

class AppointmentReminderJob {
  constructor() {
    this.jobName = 'AppointmentReminder';
    this.isRunning = false;
  }

  // Initialize the job
  init() {
    // Run every hour at minute 0
    this.job = cron.schedule('0 * * * *', async () => {
      await this.run();
    }, {
      scheduled: false,
      timezone: 'Europe/Istanbul'
    });

    logger.info(`${this.jobName} job initialized`);
  }

  // Start the job
  start() {
    this.job.start();
    logger.info(`${this.jobName} job started`);
  }

  // Stop the job
  stop() {
    this.job.stop();
    logger.info(`${this.jobName} job stopped`);
  }

  // Run the reminder job
  async run() {
    if (this.isRunning) {
      logger.warn(`${this.jobName} job is already running`);
      return;
    }

    this.isRunning = true;
    const startTime = Date.now();

    try {
      logger.info(`${this.jobName} job started`);

      // Get appointments that need reminders
      const appointments = await this.getAppointmentsNeedingReminder();
      
      if (appointments.length === 0) {
        logger.info('No appointments need reminders');
        return;
      }

      logger.info(`Found ${appointments.length} appointments needing reminders`);

      // Process each appointment
      const results = {
        success: 0,
        failed: 0,
        errors: []
      };

      for (const appointment of appointments) {
        try {
          await this.sendReminder(appointment);
          results.success++;
        } catch (error) {
          results.failed++;
          results.errors.push({
            appointmentId: appointment.id,
            error: error.message
          });
        }
      }

      const duration = Date.now() - startTime;
      logger.info(`${this.jobName} job completed`, {
        duration: `${duration}ms`,
        processed: appointments.length,
        ...results
      });

      // Log job execution
      await this.logJobExecution(results, duration);

    } catch (error) {
      logger.error(`${this.jobName} job failed`, { error: error.message });
      
      // Log failed job execution
      await this.logJobExecution({ error: error.message }, Date.now() - startTime);
    } finally {
      this.isRunning = false;
    }
  }

  // Get appointments needing reminder
  async getAppointmentsNeedingReminder() {
    try {
      // Get user preferences for reminder timing
      const reminderQuery = `
        WITH randevu_hatirlatma AS (
          SELECT 
            r.*,
            k.email,
            k.telefon,
            k.ad,
            k.soyad,
            m.ad as mahkeme_ad,
            m.adres as mahkeme_adres,
            COALESCE(kt.hatirlatma_suresi, 24) as hatirlatma_suresi,
            COALESCE(kt.email_bildirimleri, true) as email_bildirimleri,
            COALESCE(kt.sms_bildirimleri, true) as sms_bildirimleri
          FROM randevular r
          JOIN kullanicilar k ON r.kullanici_id = k.id
          JOIN mahkemeler m ON r.mahkeme_id = m.id
          LEFT JOIN kullanici_tercihleri kt ON k.id = kt.kullanici_id
          WHERE r.durum IN ('beklemede', 'onaylandi')
          AND r.hatirlatma_gonderildi = false
        )
        SELECT * FROM randevu_hatirlatma
        WHERE randevu_tarihi = CURRENT_DATE + INTERVAL '1 day'
        AND EXTRACT(HOUR FROM CURRENT_TIME) = (24 - hatirlatma_suresi)
      `;

      const result = await query(reminderQuery);
      return result.rows;
    } catch (error) {
      logger.error('Failed to get appointments needing reminder', { 
        error: error.message 
      });
      throw error;
    }
  }

  // Send reminder for an appointment
  async sendReminder(appointment) {
    const lockKey = `reminder_lock:${appointment.id}`;
    
    // Try to acquire lock to prevent duplicate reminders
    const lockAcquired = await cache.lock.acquire(lockKey, 300); // 5 minutes
    if (!lockAcquired) {
      logger.info('Reminder already being processed', { 
        appointmentId: appointment.id 
      });
      return;
    }

    try {
      const reminderData = {
        ad: appointment.ad,
        randevuKodu: appointment.randevu_kodu,
        mahkemeAd: appointment.mahkeme_ad,
        mahkemeAdres: appointment.mahkeme_adres,
        tarih: appointment.randevu_tarihi,
        saat: appointment.randevu_saati
      };

      // Send email reminder if enabled
      if (appointment.email && appointment.email_bildirimleri) {
        await emailService.sendAppointmentReminder(
          appointment.email,
          reminderData
        );
      }

      // Send SMS reminder if enabled
      if (appointment.telefon && appointment.sms_bildirimleri) {
        await smsService.sendReminderSMS(
          appointment.telefon,
          reminderData
        );
      }

      // Mark reminder as sent
      await query(
        'UPDATE randevular SET hatirlatma_gonderildi = true WHERE id = $1',
        [appointment.id]
      );

      // Create notification record
      await query(
        `INSERT INTO bildirimler (kullanici_id, baslik, mesaj, tur)
         VALUES ($1, $2, $3, $4)`,
        [
          appointment.kullanici_id,
          'Randevu Hatırlatması',
          `Yarın saat ${appointment.randevu_saati} ${appointment.mahkeme_ad} randevunuz bulunmaktadır.`,
          'appointment_reminder'
        ]
      );

      logger.info('Reminder sent successfully', {
        appointmentId: appointment.id,
        code: appointment.randevu_kodu
      });

    } catch (error) {
      logger.error('Failed to send reminder', {
        appointmentId: appointment.id,
        error: error.message
      });
      throw error;
    } finally {
      // Release lock
      await cache.lock.release(lockKey, lockAcquired);
    }
  }

  // Send morning summary to court staff
  async sendDailySummary() {
    try {
      const summaryQuery = `
        SELECT 
          m.id as mahkeme_id,
          m.ad as mahkeme_ad,
          m.email as mahkeme_email,
          COUNT(r.id) as toplam_randevu,
          COUNT(CASE WHEN r.durum = 'onaylandi' THEN 1 END) as onaylanan,
          COUNT(CASE WHEN r.durum = 'beklemede' THEN 1 END) as bekleyen,
          json_agg(json_build_object(
            'saat', r.randevu_saati,
            'islem_turu', r.islem_turu,
            'durum', r.durum,
            'kullanici', k.ad || ' ' || k.soyad
          ) ORDER BY r.randevu_saati) as randevular
        FROM mahkemeler m
        LEFT JOIN randevular r ON m.id = r.mahkeme_id 
          AND r.randevu_tarihi = CURRENT_DATE
        LEFT JOIN kullanicilar k ON r.kullanici_id = k.id
        WHERE m.aktif = true
        GROUP BY m.id, m.ad, m.email
        HAVING COUNT(r.id) > 0
      `;

      const result = await query(summaryQuery);

      for (const court of result.rows) {
        if (court.mahkeme_email) {
          await emailService.sendDailySummary(
            court.mahkeme_email,
            {
              mahkemeAd: court.mahkeme_ad,
              tarih: new Date().toLocaleDateString('tr-TR'),
              toplamRandevu: court.toplam_randevu,
              onaylanan: court.onaylanan,
              bekleyen: court.bekleyen,
              randevular: court.randevular
            }
          );
        }
      }

      logger.info('Daily summaries sent to courts');
    } catch (error) {
      logger.error('Failed to send daily summaries', { 
        error: error.message 
      });
    }
  }

  // Check for no-shows and mark appointments
  async checkNoShows() {
    try {
      const noShowQuery = `
        UPDATE randevular
        SET durum = 'tamamlandi',
            notlar = COALESCE(notlar || E'\\n', '') || 'Otomatik tamamlandı - Randevu saati geçti'
        WHERE durum = 'onaylandi'
        AND randevu_tarihi < CURRENT_DATE
        OR (randevu_tarihi = CURRENT_DATE AND randevu_saati < CURRENT_TIME - INTERVAL '1 hour')
        RETURNING id, kullanici_id
      `;

      const result = await query(noShowQuery);

      if (result.rows.length > 0) {
        logger.info(`Marked ${result.rows.length} appointments as completed (no-show)`);

        // Create notifications for no-shows
        for (const appointment of result.rows) {
          await query(
            `INSERT INTO bildirimler (kullanici_id, baslik, mesaj, tur)
             VALUES ($1, $2, $3, $4)`,
            [
              appointment.kullanici_id,
              'Randevu Tamamlandı',
              'Randevunuz otomatik olarak tamamlandı olarak işaretlendi.',
              'appointment_completed'
            ]
          );
        }
      }
    } catch (error) {
      logger.error('Failed to check no-shows', { error: error.message });
    }
  }

  // Log job execution
  async logJobExecution(results, duration) {
    try {
      await query(
        `INSERT INTO job_log (job_name, durum, sonuc, sure_ms)
         VALUES ($1, $2, $3, $4)`,
        [
          this.jobName,
          results.error ? 'basarisiz' : 'basarili',
          JSON.stringify(results),
          duration
        ]
      );
    } catch (error) {
      logger.error('Failed to log job execution', { error: error.message });
    }
  }

  // Get job statistics
  async getStatistics(days = 7) {
    try {
      const statsQuery = `
        SELECT 
          COUNT(*) as toplam_calisma,
          COUNT(CASE WHEN durum = 'basarili' THEN 1 END) as basarili,
          COUNT(CASE WHEN durum = 'basarisiz' THEN 1 END) as basarisiz,
          AVG(sure_ms) as ortalama_sure,
          MAX(sure_ms) as max_sure,
          MIN(sure_ms) as min_sure
        FROM job_log
        WHERE job_name = $1
        AND olusturma_tarihi >= CURRENT_DATE - INTERVAL '%s days'
      `;

      const result = await query(statsQuery, [this.jobName, days]);
      return result.rows[0];
    } catch (error) {
      logger.error('Failed to get job statistics', { error: error.message });
      throw error;
    }
  }
}

// Create and export singleton instance
const appointmentReminderJob = new AppointmentReminderJob();

// Daily summary job (runs at 7:00 AM)
const dailySummaryJob = cron.schedule('0 7 * * *', async () => {
  logger.info('Daily summary job started');
  await appointmentReminderJob.sendDailySummary();
}, {
  scheduled: false,
  timezone: 'Europe/Istanbul'
});

// No-show check job (runs every day at 8:00 PM)
const noShowJob = cron.schedule('0 20 * * *', async () => {
  logger.info('No-show check job started');
  await appointmentReminderJob.checkNoShows();
}, {
  scheduled: false,
  timezone: 'Europe/Istanbul'
});

module.exports = {
  appointmentReminderJob,
  dailySummaryJob,
  noShowJob
};