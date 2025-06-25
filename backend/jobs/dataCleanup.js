const cron = require('node-cron');
const { query, transaction } = require('../config/database');
const { cache } = require('../config/redis');
const logger = require('../utils/logger');
const fs = require('fs').promises;
const path = require('path');

class DataCleanupJob {
  constructor() {
    this.jobName = 'DataCleanup';
    this.isRunning = false;
  }

  // Initialize the job
  init() {
    // Run every day at 2:00 AM
    this.job = cron.schedule('0 2 * * *', async () => {
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

  // Run the cleanup job
  async run() {
    if (this.isRunning) {
      logger.warn(`${this.jobName} job is already running`);
      return;
    }

    this.isRunning = true;
    const startTime = Date.now();

    try {
      logger.info(`${this.jobName} job started`);

      const results = {
        oldAppointments: await this.cleanOldAppointments(),
        expiredSessions: await this.cleanExpiredSessions(),
        oldLogs: await this.cleanOldLogs(),
        tempFiles: await this.cleanTempFiles(),
        oldNotifications: await this.cleanOldNotifications(),
        failedLoginAttempts: await this.cleanFailedLoginAttempts(),
        orphanedRecords: await this.cleanOrphanedRecords(),
        cacheCleanup: await this.cleanupCache()
      };

      const duration = Date.now() - startTime;
      logger.info(`${this.jobName} job completed`, {
        duration: `${duration}ms`,
        results
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

  // Clean old appointments (older than 1 year)
  async cleanOldAppointments() {
    try {
      const result = await query(
        `DELETE FROM randevular 
         WHERE randevu_tarihi < CURRENT_DATE - INTERVAL '1 year'
         AND durum IN ('iptal', 'tamamlandi')
         RETURNING id`
      );

      const deletedCount = result.rows.length;
      if (deletedCount > 0) {
        logger.info(`Deleted ${deletedCount} old appointments`);
      }

      return { deletedCount };
    } catch (error) {
      logger.error('Failed to clean old appointments', { error: error.message });
      return { error: error.message };
    }
  }

  // Clean expired sessions
  async cleanExpiredSessions() {
    try {
      // Clean database sessions
      const dbResult = await query(
        `DELETE FROM oturumlar 
         WHERE son_aktivite < CURRENT_TIMESTAMP - INTERVAL '7 days'
         OR bitis_zamani < CURRENT_TIMESTAMP
         RETURNING id`
      );

      // Clean Redis sessions
      const redisKeys = await cache.client.keys('session:*');
      let redisDeleted = 0;

      for (const key of redisKeys) {
        const ttl = await cache.client.ttl(key);
        if (ttl === -1) { // No expiry set
          await cache.client.del(key);
          redisDeleted++;
        }
      }

      return {
        databaseDeleted: dbResult.rows.length,
        redisDeleted
      };
    } catch (error) {
      logger.error('Failed to clean expired sessions', { error: error.message });
      return { error: error.message };
    }
  }

  // Clean old logs
  async cleanOldLogs() {
    try {
      // Clean database logs older than 90 days
      const tables = ['email_log', 'sms_log', 'api_kullanim_log', 'giris_denemeleri'];
      const results = {};

      for (const table of tables) {
        const result = await query(
          `DELETE FROM ${table} 
           WHERE olusturma_tarihi < CURRENT_DATE - INTERVAL '90 days'
           RETURNING id`
        );
        results[table] = result.rows.length;
      }

      // Clean old log files
      const logsDir = path.join(process.cwd(), 'logs');
      const files = await fs.readdir(logsDir);
      let filesDeleted = 0;

      for (const file of files) {
        const filePath = path.join(logsDir, file);
        const stats = await fs.stat(filePath);
        const daysSinceModified = (Date.now() - stats.mtime) / (1000 * 60 * 60 * 24);

        if (daysSinceModified > 30 && file.endsWith('.gz')) {
          await fs.unlink(filePath);
          filesDeleted++;
        }
      }

      return {
        ...results,
        logFilesDeleted: filesDeleted
      };
    } catch (error) {
      logger.error('Failed to clean old logs', { error: error.message });
      return { error: error.message };
    }
  }

  // Clean temporary files
  async cleanTempFiles() {
    try {
      const tempDirs = [
        path.join(process.cwd(), 'temp'),
        path.join(process.cwd(), 'uploads', 'temp')
      ];

      let totalDeleted = 0;

      for (const dir of tempDirs) {
        try {
          const files = await fs.readdir(dir);

          for (const file of files) {
            const filePath = path.join(dir, file);
            const stats = await fs.stat(filePath);
            const hoursSinceModified = (Date.now() - stats.mtime) / (1000 * 60 * 60);

            if (hoursSinceModified > 24) {
              await fs.unlink(filePath);
              totalDeleted++;
            }
          }
        } catch (error) {
          // Directory might not exist
          if (error.code !== 'ENOENT') {
            throw error;
          }
        }
      }

      return { deletedFiles: totalDeleted };
    } catch (error) {
      logger.error('Failed to clean temp files', { error: error.message });
      return { error: error.message };
    }
  }

  // Clean old notifications
  async cleanOldNotifications() {
    try {
      // Delete read notifications older than 30 days
      const readResult = await query(
        `DELETE FROM bildirimler 
         WHERE okundu = true 
         AND olusturma_tarihi < CURRENT_DATE - INTERVAL '30 days'
         RETURNING id`
      );

      // Delete unread notifications older than 90 days
      const unreadResult = await query(
        `DELETE FROM bildirimler 
         WHERE okundu = false 
         AND olusturma_tarihi < CURRENT_DATE - INTERVAL '90 days'
         RETURNING id`
      );

      return {
        readDeleted: readResult.rows.length,
        unreadDeleted: unreadResult.rows.length
      };
    } catch (error) {
      logger.error('Failed to clean old notifications', { error: error.message });
      return { error: error.message };
    }
  }

  // Clean failed login attempts
  async cleanFailedLoginAttempts() {
    try {
      const result = await query(
        `DELETE FROM giris_denemeleri 
         WHERE olusturma_tarihi < CURRENT_DATE - INTERVAL '30 days'
         RETURNING id`
      );

      // Clean Redis brute force keys
      const bruteForceKeys = await cache.client.keys('brute_force:*');
      let redisDeleted = 0;

      for (const key of bruteForceKeys) {
        const ttl = await cache.client.ttl(key);
        if (ttl === -1) {
          await cache.client.del(key);
          redisDeleted++;
        }
      }

      return {
        databaseDeleted: result.rows.length,
        redisDeleted
      };
    } catch (error) {
      logger.error('Failed to clean failed login attempts', { error: error.message });
      return { error: error.message };
    }
  }

  // Clean orphaned records
  async cleanOrphanedRecords() {
    return await transaction(async (client) => {
      try {
        const results = {};

        // Delete appointments with non-existent users
        const appointmentsResult = await client.query(
          `DELETE FROM randevular r
           WHERE NOT EXISTS (
             SELECT 1 FROM kullanicilar k WHERE k.id = r.kullanici_id
           )
           RETURNING id`
        );
        results.orphanedAppointments = appointmentsResult.rows.length;

        // Delete notifications with non-existent users
        const notificationsResult = await client.query(
          `DELETE FROM bildirimler b
           WHERE NOT EXISTS (
             SELECT 1 FROM kullanicilar k WHERE k.id = b.kullanici_id
           )
           RETURNING id`
        );
        results.orphanedNotifications = notificationsResult.rows.length;

        // Delete lawyer profiles with non-existent users
        const lawyersResult = await client.query(
          `DELETE FROM avukatlar a
           WHERE NOT EXISTS (
             SELECT 1 FROM kullanicilar k WHERE k.id = a.kullanici_id
           )
           RETURNING id`
        );
        results.orphanedLawyers = lawyersResult.rows.length;

        // Delete judge profiles with non-existent users
        const judgesResult = await client.query(
          `DELETE FROM hakimler h
           WHERE NOT EXISTS (
             SELECT 1 FROM kullanicilar k WHERE k.id = h.kullanici_id
           )
           RETURNING id`
        );
        results.orphanedJudges = judgesResult.rows.length;

        return results;
      } catch (error) {
        logger.error('Failed to clean orphaned records', { error: error.message });
        throw error;
      }
    });
  }

  // Clean up cache
  async cleanupCache() {
    try {
      const patterns = [
        'rate_limit:*',
        'throttle:*',
        'appointments:*',
        'courts:*',
        'slots:*'
      ];

      let totalDeleted = 0;

      for (const pattern of patterns) {
        const keys = await cache.client.keys(pattern);
        
        for (const key of keys) {
          const ttl = await cache.client.ttl(key);
          
          // Delete keys with no expiry or very long expiry
          if (ttl === -1 || ttl > 86400 * 7) { // 7 days
            await cache.client.del(key);
            totalDeleted++;
          }
        }
      }

      // Get Redis memory info
      const info = await cache.client.info('memory');
      const memoryMatch = info.match(/used_memory_human:(\S+)/);
      const memoryUsed = memoryMatch ? memoryMatch[1] : 'unknown';

      return {
        keysDeleted: totalDeleted,
        memoryUsed
      };
    } catch (error) {
      logger.error('Failed to cleanup cache', { error: error.message });
      return { error: error.message };
    }
  }

  // Archive old data before deletion
  async archiveOldData() {
    try {
      const archiveDir = path.join(process.cwd(), 'archives');
      await fs.mkdir(archiveDir, { recursive: true });

      const timestamp = new Date().toISOString().split('T')[0];
      const archivePath = path.join(archiveDir, `archive_${timestamp}.json`);

      // Get old appointments
      const appointments = await query(
        `SELECT * FROM randevular 
         WHERE randevu_tarihi < CURRENT_DATE - INTERVAL '1 year'
         AND durum IN ('iptal', 'tamamlandi')`
      );

      // Get old logs
      const logs = await query(
        `SELECT * FROM email_log 
         WHERE olusturma_tarihi < CURRENT_DATE - INTERVAL '90 days'
         UNION ALL
         SELECT * FROM sms_log 
         WHERE olusturma_tarihi < CURRENT_DATE - INTERVAL '90 days'`
      );

      const archiveData = {
        timestamp: new Date().toISOString(),
        appointments: appointments.rows,
        logs: logs.rows
      };

      await fs.writeFile(archivePath, JSON.stringify(archiveData, null, 2));

      logger.info('Old data archived', { archivePath });
      return { archivePath };
    } catch (error) {
      logger.error('Failed to archive old data', { error: error.message });
      return { error: error.message };
    }
  }

  // Vacuum database tables
  async vacuumDatabase() {
    try {
      const tables = [
        'randevular',
        'kullanicilar',
        'mahkemeler',
        'bildirimler',
        'email_log',
        'sms_log'
      ];

      for (const table of tables) {
        await query(`VACUUM ANALYZE ${table}`);
      }

      logger.info('Database vacuum completed');
      return { vacuumedTables: tables };
    } catch (error) {
      logger.error('Failed to vacuum database', { error: error.message });
      return { error: error.message };
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

  // Get cleanup statistics
  async getStatistics(days = 30) {
    try {
      const statsQuery = `
        SELECT 
          DATE(olusturma_tarihi) as tarih,
          COUNT(*) as calisma_sayisi,
          AVG(sure_ms) as ortalama_sure,
          SUM(CASE WHEN durum = 'basarili' THEN 1 ELSE 0 END) as basarili,
          SUM(CASE WHEN durum = 'basarisiz' THEN 1 ELSE 0 END) as basarisiz
        FROM job_log
        WHERE job_name = $1
        AND olusturma_tarihi >= CURRENT_DATE - INTERVAL '%s days'
        GROUP BY DATE(olusturma_tarihi)
        ORDER BY tarih DESC
      `;

      const result = await query(statsQuery, [this.jobName, days]);
      return result.rows;
    } catch (error) {
      logger.error('Failed to get cleanup statistics', { error: error.message });
      throw error;
    }
  }
}

// Create and export singleton instance
const dataCleanupJob = new DataCleanupJob();

// Weekly archive job (runs every Sunday at 3:00 AM)
const archiveJob = cron.schedule('0 3 * * 0', async () => {
  logger.info('Archive job started');
  await dataCleanupJob.archiveOldData();
}, {
  scheduled: false,
  timezone: 'Europe/Istanbul'
});

// Monthly vacuum job (runs on the 1st of every month at 4:00 AM)
const vacuumJob = cron.schedule('0 4 1 * *', async () => {
  logger.info('Vacuum job started');
  await dataCleanupJob.vacuumDatabase();
}, {
  scheduled: false,
  timezone: 'Europe/Istanbul'
});

module.exports = {
  dataCleanupJob,
  archiveJob,
  vacuumJob
};