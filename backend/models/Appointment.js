const { query, transaction } = require('../config/database');
const logger = require('../utils/logger');
const { cache } = require('../config/redis');

class Appointment {
  constructor(data) {
    this.id = data.id;
    this.kullaniciId = data.kullanici_id;
    this.mahkemeId = data.mahkeme_id;
    this.hakimId = data.hakim_id;
    this.randevuTarihi = data.randevu_tarihi;
    this.randevuSaati = data.randevu_saati;
    this.islemTuru = data.islem_turu;
    this.durum = data.durum;
    this.notlar = data.notlar;
    this.iptalNedeni = data.iptal_nedeni;
    this.randevuKodu = data.randevu_kodu;
    this.hatirlatmaGonderildi = data.hatirlatma_gonderildi;
    this.olusturmaTarihi = data.olusturma_tarihi;
    this.guncellemeTarihi = data.guncelleme_tarihi;
  }

  // Create appointments table
  static async createTable() {
    const createTableQuery = `
      CREATE TYPE IF NOT EXISTS islem_turu AS ENUM (
        'dava_acma', 'durusma', 'evrak_teslimi', 
        'bilgi_alma', 'harc_odeme', 'uzlasma', 
        'taniklik', 'bilirkisi', 'diger'
      );

      CREATE TABLE IF NOT EXISTS randevular (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        kullanici_id UUID NOT NULL REFERENCES kullanicilar(id),
        mahkeme_id UUID NOT NULL REFERENCES mahkemeler(id),
        hakim_id UUID REFERENCES hakimler(id),
        randevu_tarihi DATE NOT NULL,
        randevu_saati TIME NOT NULL,
        islem_turu islem_turu NOT NULL,
        durum appointment_status NOT NULL DEFAULT 'beklemede',
        notlar TEXT,
        iptal_nedeni TEXT,
        randevu_kodu VARCHAR(10) UNIQUE,
        hatirlatma_gonderildi BOOLEAN DEFAULT false,
        olusturma_tarihi TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        guncelleme_tarihi TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        CONSTRAINT randevu_gecmis_check CHECK (
          randevu_tarihi >= CURRENT_DATE OR durum IN ('iptal', 'tamamlandi')
        ),
        CONSTRAINT randevu_saati_check CHECK (
          randevu_saati >= '08:00'::TIME AND randevu_saati <= '17:30'::TIME
        )
      );

      CREATE INDEX IF NOT EXISTS idx_randevular_kullanici ON randevular(kullanici_id);
      CREATE INDEX IF NOT EXISTS idx_randevular_mahkeme ON randevular(mahkeme_id);
      CREATE INDEX IF NOT EXISTS idx_randevular_hakim ON randevular(hakim_id);
      CREATE INDEX IF NOT EXISTS idx_randevular_tarih ON randevular(randevu_tarihi);
      CREATE INDEX IF NOT EXISTS idx_randevular_durum ON randevular(durum);
      CREATE INDEX IF NOT EXISTS idx_randevular_kod ON randevular(randevu_kodu);
      CREATE INDEX IF NOT EXISTS idx_randevular_tarih_saat ON randevular(randevu_tarihi, randevu_saati);
    `;

    try {
      await query(createTableQuery);
      logger.info('Randevular tablosu oluşturuldu');
    } catch (error) {
      logger.error('Randevular tablosu oluşturma hatası:', error);
      throw error;
    }
  }

  // Generate unique appointment code
  static generateAppointmentCode() {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let code = '';
    for (let i = 0; i < 8; i++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return code;
  }

  // Find appointment by ID
  static async findById(id) {
    try {
      const result = await query(
        `SELECT r.*, 
          k.ad as kullanici_ad, k.soyad as kullanici_soyad, k.tc_kimlik_no,
          m.ad as mahkeme_ad, m.tur as mahkeme_tur,
          h.ad as hakim_ad, h.soyad as hakim_soyad
         FROM randevular r
         JOIN kullanicilar k ON r.kullanici_id = k.id
         JOIN mahkemeler m ON r.mahkeme_id = m.id
         LEFT JOIN hakimler hk ON r.hakim_id = hk.id
         LEFT JOIN kullanicilar h ON hk.kullanici_id = h.id
         WHERE r.id = $1`,
        [id]
      );
      return result.rows[0] ? new Appointment(result.rows[0]) : null;
    } catch (error) {
      logger.error('Randevu bulma hatası:', error);
      throw error;
    }
  }

  // Find appointment by code
  static async findByCode(code) {
    try {
      const result = await query(
        'SELECT * FROM randevular WHERE randevu_kodu = $1',
        [code]
      );
      return result.rows[0] ? new Appointment(result.rows[0]) : null;
    } catch (error) {
      logger.error('Randevu kodu ile bulma hatası:', error);
      throw error;
    }
  }

  // Create new appointment
  static async create(appointmentData) {
    return await transaction(async (client) => {
      try {
        // Check if slot is available
        const slotCheck = await client.query(
          `SELECT COUNT(*) as count 
           FROM randevular 
           WHERE mahkeme_id = $1 
           AND randevu_tarihi = $2 
           AND randevu_saati = $3 
           AND durum IN ('beklemede', 'onaylandi')
           ${appointmentData.hakimId ? 'AND hakim_id = $4' : ''}`,
          appointmentData.hakimId 
            ? [appointmentData.mahkemeId, appointmentData.randevuTarihi, appointmentData.randevuSaati, appointmentData.hakimId]
            : [appointmentData.mahkemeId, appointmentData.randevuTarihi, appointmentData.randevuSaati]
        );

        if (parseInt(slotCheck.rows[0].count) > 0) {
          throw new Error('Bu tarih ve saat için randevu dolu');
        }

        // Check user's existing appointments
        const userCheck = await client.query(
          `SELECT COUNT(*) as count 
           FROM randevular 
           WHERE kullanici_id = $1 
           AND randevu_tarihi = $2 
           AND durum IN ('beklemede', 'onaylandi')`,
          [appointmentData.kullaniciId, appointmentData.randevuTarihi]
        );

        if (parseInt(userCheck.rows[0].count) >= 2) {
          throw new Error('Aynı gün için en fazla 2 randevu alabilirsiniz');
        }

        // Generate unique appointment code
        let appointmentCode;
        let codeExists = true;
        while (codeExists) {
          appointmentCode = Appointment.generateAppointmentCode();
          const codeCheck = await client.query(
            'SELECT EXISTS(SELECT 1 FROM randevular WHERE randevu_kodu = $1)',
            [appointmentCode]
          );
          codeExists = codeCheck.rows[0].exists;
        }

        // Create appointment
        const result = await client.query(
          `INSERT INTO randevular 
           (kullanici_id, mahkeme_id, hakim_id, randevu_tarihi, randevu_saati, 
            islem_turu, durum, notlar, randevu_kodu)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
           RETURNING *`,
          [
            appointmentData.kullaniciId,
            appointmentData.mahkemeId,
            appointmentData.hakimId,
            appointmentData.randevuTarihi,
            appointmentData.randevuSaati,
            appointmentData.islemTuru,
            appointmentData.durum || 'beklemede',
            appointmentData.notlar,
            appointmentCode
          ]
        );

        const newAppointment = new Appointment(result.rows[0]);

        // Clear cache for this user and court
        await cache.delPattern(`appointments:user:${appointmentData.kullaniciId}:*`);
        await cache.delPattern(`appointments:court:${appointmentData.mahkemeId}:*`);
        await cache.delPattern(`slots:${appointmentData.mahkemeId}:${appointmentData.randevuTarihi}`);

        logger.info('Yeni randevu oluşturuldu', { 
          appointmentId: newAppointment.id,
          code: appointmentCode 
        });

        return newAppointment;
      } catch (error) {
        logger.error('Randevu oluşturma hatası:', error);
        throw error;
      }
    });
  }

  // Update appointment
  async update(updateData) {
    return await transaction(async (client) => {
      try {
        const fields = [];
        const values = [];
        let index = 1;

        // Build dynamic update query
        if (updateData.randevuTarihi !== undefined) {
          fields.push(`randevu_tarihi = $${index++}`);
          values.push(updateData.randevuTarihi);
        }
        if (updateData.randevuSaati !== undefined) {
          fields.push(`randevu_saati = $${index++}`);
          values.push(updateData.randevuSaati);
        }
        if (updateData.islemTuru !== undefined) {
          fields.push(`islem_turu = $${index++}`);
          values.push(updateData.islemTuru);
        }
        if (updateData.durum !== undefined) {
          fields.push(`durum = $${index++}`);
          values.push(updateData.durum);
        }
        if (updateData.notlar !== undefined) {
          fields.push(`notlar = $${index++}`);
          values.push(updateData.notlar);
        }
        if (updateData.iptalNedeni !== undefined) {
          fields.push(`iptal_nedeni = $${index++}`);
          values.push(updateData.iptalNedeni);
        }
        if (updateData.hakimId !== undefined) {
          fields.push(`hakim_id = $${index++}`);
          values.push(updateData.hakimId);
        }

        if (fields.length === 0) {
          return this;
        }

        // If changing date/time, check availability
        if (updateData.randevuTarihi || updateData.randevuSaati) {
          const slotCheck = await client.query(
            `SELECT COUNT(*) as count 
             FROM randevular 
             WHERE mahkeme_id = $1 
             AND randevu_tarihi = $2 
             AND randevu_saati = $3 
             AND durum IN ('beklemede', 'onaylandi')
             AND id != $4
             ${updateData.hakimId || this.hakimId ? 'AND hakim_id = $5' : ''}`,
            updateData.hakimId || this.hakimId
              ? [this.mahkemeId, updateData.randevuTarihi || this.randevuTarihi, 
                 updateData.randevuSaati || this.randevuSaati, this.id, 
                 updateData.hakimId || this.hakimId]
              : [this.mahkemeId, updateData.randevuTarihi || this.randevuTarihi, 
                 updateData.randevuSaati || this.randevuSaati, this.id]
          );

          if (parseInt(slotCheck.rows[0].count) > 0) {
            throw new Error('Bu tarih ve saat için randevu dolu');
          }
        }

        fields.push(`guncelleme_tarihi = CURRENT_TIMESTAMP`);
        values.push(this.id);

        const updateQuery = `
          UPDATE randevular 
          SET ${fields.join(', ')}
          WHERE id = $${index}
          RETURNING *
        `;

        const result = await client.query(updateQuery, values);
        Object.assign(this, new Appointment(result.rows[0]));

        // Clear cache
        await cache.delPattern(`appointments:*`);
        
        logger.info('Randevu güncellendi', { appointmentId: this.id });
        return this;
      } catch (error) {
        logger.error('Randevu güncelleme hatası:', error);
        throw error;
      }
    });
  }

  // Cancel appointment
  async cancel(reason) {
    try {
      const result = await query(
        `UPDATE randevular 
         SET durum = 'iptal', 
             iptal_nedeni = $1,
             guncelleme_tarihi = CURRENT_TIMESTAMP
         WHERE id = $2 AND durum IN ('beklemede', 'onaylandi')
         RETURNING *`,
        [reason, this.id]
      );

      if (result.rows.length === 0) {
        throw new Error('Randevu iptal edilemedi');
      }

      Object.assign(this, new Appointment(result.rows[0]));

      // Clear cache
      await cache.delPattern(`appointments:*`);
      
      logger.info('Randevu iptal edildi', { appointmentId: this.id });
      return this;
    } catch (error) {
      logger.error('Randevu iptal hatası:', error);
      throw error;
    }
  }

  // Complete appointment
  async complete() {
    try {
      const result = await query(
        `UPDATE randevular 
         SET durum = 'tamamlandi',
             guncelleme_tarihi = CURRENT_TIMESTAMP
         WHERE id = $1 AND durum = 'onaylandi'
         RETURNING *`,
        [this.id]
      );

      if (result.rows.length === 0) {
        throw new Error('Randevu tamamlanamadı');
      }

      Object.assign(this, new Appointment(result.rows[0]));
      
      logger.info('Randevu tamamlandı', { appointmentId: this.id });
      return this;
    } catch (error) {
      logger.error('Randevu tamamlama hatası:', error);
      throw error;
    }
  }

  // Find appointments by criteria
  static async find(filters = {}) {
    try {
      // Check cache first
      const cacheKey = `appointments:${JSON.stringify(filters)}`;
      const cached = await cache.get(cacheKey);
      if (cached) {
        return cached.map(data => new Appointment(data));
      }

      let queryText = `
        SELECT r.*, 
          k.ad as kullanici_ad, k.soyad as kullanici_soyad,
          m.ad as mahkeme_ad, m.tur as mahkeme_tur,
          h.ad as hakim_ad, h.soyad as hakim_soyad
        FROM randevular r
        JOIN kullanicilar k ON r.kullanici_id = k.id
        JOIN mahkemeler m ON r.mahkeme_id = m.id
        LEFT JOIN hakimler hk ON r.hakim_id = hk.id
        LEFT JOIN kullanicilar h ON hk.kullanici_id = h.id
        WHERE 1=1
      `;
      const values = [];
      let paramIndex = 1;

      if (filters.kullaniciId) {
        queryText += ` AND r.kullanici_id = $${paramIndex}`;
        values.push(filters.kullaniciId);
        paramIndex++;
      }

      if (filters.mahkemeId) {
        queryText += ` AND r.mahkeme_id = $${paramIndex}`;
        values.push(filters.mahkemeId);
        paramIndex++;
      }

      if (filters.hakimId) {
        queryText += ` AND r.hakim_id = $${paramIndex}`;
        values.push(filters.hakimId);
        paramIndex++;
      }

      if (filters.durum) {
        queryText += ` AND r.durum = $${paramIndex}`;
        values.push(filters.durum);
        paramIndex++;
      }

      if (filters.islemTuru) {
        queryText += ` AND r.islem_turu = $${paramIndex}`;
        values.push(filters.islemTuru);
        paramIndex++;
      }

      if (filters.tarihBaslangic) {
        queryText += ` AND r.randevu_tarihi >= $${paramIndex}`;
        values.push(filters.tarihBaslangic);
        paramIndex++;
      }

      if (filters.tarihBitis) {
        queryText += ` AND r.randevu_tarihi <= $${paramIndex}`;
        values.push(filters.tarihBitis);
        paramIndex++;
      }

      queryText += ' ORDER BY r.randevu_tarihi, r.randevu_saati';

      if (filters.limit) {
        queryText += ` LIMIT $${paramIndex}`;
        values.push(filters.limit);
        paramIndex++;
      }

      if (filters.offset) {
        queryText += ` OFFSET $${paramIndex}`;
        values.push(filters.offset);
      }

      const result = await query(queryText, values);
      const appointments = result.rows.map(row => new Appointment(row));

      // Cache the results
      await cache.set(cacheKey, result.rows, 300); // 5 minutes

      return appointments;
    } catch (error) {
      logger.error('Randevu arama hatası:', error);
      throw error;
    }
  }

  // Get appointments needing reminder
  static async getAppointmentsNeedingReminder() {
    try {
      const result = await query(
        `SELECT r.*, k.email, k.telefon, k.ad, k.soyad,
          m.ad as mahkeme_ad, m.adres
         FROM randevular r
         JOIN kullanicilar k ON r.kullanici_id = k.id
         JOIN mahkemeler m ON r.mahkeme_id = m.id
         WHERE r.durum = 'onaylandi'
         AND r.hatirlatma_gonderildi = false
         AND r.randevu_tarihi = CURRENT_DATE + INTERVAL '1 day'`
      );
      return result.rows.map(row => new Appointment(row));
    } catch (error) {
      logger.error('Hatırlatma randevuları getirme hatası:', error);
      throw error;
    }
  }

  // Mark reminder as sent
  async markReminderSent() {
    try {
      await query(
        'UPDATE randevular SET hatirlatma_gonderildi = true WHERE id = $1',
        [this.id]
      );
      this.hatirlatmaGonderildi = true;
      logger.info('Randevu hatırlatması gönderildi olarak işaretlendi', { 
        appointmentId: this.id 
      });
    } catch (error) {
      logger.error('Hatırlatma işaretleme hatası:', error);
      throw error;
    }
  }

  // Check if user can create appointment
  static async canUserCreateAppointment(userId, date) {
    try {
      const result = await query(
        `SELECT COUNT(*) as count 
         FROM randevular 
         WHERE kullanici_id = $1 
         AND randevu_tarihi = $2 
         AND durum IN ('beklemede', 'onaylandi')`,
        [userId, date]
      );
      return parseInt(result.rows[0].count) < 2;
    } catch (error) {
      logger.error('Kullanıcı randevu kontrolü hatası:', error);
      throw error;
    }
  }
}

module.exports = Appointment;