const { query, transaction } = require('../config/database');
const logger = require('../utils/logger');

class Judge {
  constructor(data) {
    this.id = data.id;
    this.kullaniciId = data.kullanici_id;
    this.sicilNo = data.sicil_no;
    this.mahkemeId = data.mahkeme_id;
    this.unvan = data.unvan;
    this.uzmanlikAlanlari = data.uzmanlik_alanlari;
    this.atanmaTarihi = data.atanma_tarihi;
    this.aktif = data.aktif;
    this.olusturmaTarihi = data.olusturma_tarihi;
    this.guncellemeTarihi = data.guncelleme_tarihi;
    
    // User details if joined
    this.ad = data.ad;
    this.soyad = data.soyad;
    this.email = data.email;
    this.telefon = data.telefon;
  }

  // Create judges table
  static async createTable() {
    const createTableQuery = `
      CREATE TABLE IF NOT EXISTS hakimler (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        kullanici_id UUID NOT NULL REFERENCES kullanicilar(id) ON DELETE CASCADE,
        sicil_no VARCHAR(20) UNIQUE NOT NULL,
        mahkeme_id UUID REFERENCES mahkemeler(id),
        unvan VARCHAR(100),
        uzmanlik_alanlari TEXT[],
        atanma_tarihi DATE,
        aktif BOOLEAN DEFAULT true,
        olusturma_tarihi TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        guncelleme_tarihi TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        CONSTRAINT sicil_no_format CHECK (sicil_no ~ '^[0-9]{4,20}$')
      );

      CREATE INDEX IF NOT EXISTS idx_hakimler_kullanici ON hakimler(kullanici_id);
      CREATE INDEX IF NOT EXISTS idx_hakimler_mahkeme ON hakimler(mahkeme_id);
      CREATE INDEX IF NOT EXISTS idx_hakimler_sicil ON hakimler(sicil_no);
      CREATE INDEX IF NOT EXISTS idx_hakimler_aktif ON hakimler(aktif);
    `;

    try {
      await query(createTableQuery);
      logger.info('Hakimler tablosu oluşturuldu');
    } catch (error) {
      logger.error('Hakimler tablosu oluşturma hatası:', error);
      throw error;
    }
  }

  // Find judge by ID
  static async findById(id) {
    try {
      const result = await query(
        `SELECT h.*, k.ad, k.soyad, k.email, k.telefon, k.tc_kimlik_no
         FROM hakimler h
         JOIN kullanicilar k ON h.kullanici_id = k.id
         WHERE h.id = $1`,
        [id]
      );
      return result.rows[0] ? new Judge(result.rows[0]) : null;
    } catch (error) {
      logger.error('Hakim bulma hatası:', error);
      throw error;
    }
  }

  // Find judge by user ID
  static async findByUserId(userId) {
    try {
      const result = await query(
        `SELECT h.*, k.ad, k.soyad, k.email, k.telefon
         FROM hakimler h
         JOIN kullanicilar k ON h.kullanici_id = k.id
         WHERE h.kullanici_id = $1`,
        [userId]
      );
      return result.rows[0] ? new Judge(result.rows[0]) : null;
    } catch (error) {
      logger.error('Kullanıcı ID ile hakim bulma hatası:', error);
      throw error;
    }
  }

  // Find judge by sicil no
  static async findBySicilNo(sicilNo) {
    try {
      const result = await query(
        `SELECT h.*, k.ad, k.soyad, k.email, k.telefon
         FROM hakimler h
         JOIN kullanicilar k ON h.kullanici_id = k.id
         WHERE h.sicil_no = $1`,
        [sicilNo]
      );
      return result.rows[0] ? new Judge(result.rows[0]) : null;
    } catch (error) {
      logger.error('Sicil no ile hakim bulma hatası:', error);
      throw error;
    }
  }

  // Find judges by court
  static async findByCourtId(courtId) {
    try {
      const result = await query(
        `SELECT h.*, k.ad, k.soyad, k.email, k.telefon
         FROM hakimler h
         JOIN kullanicilar k ON h.kullanici_id = k.id
         WHERE h.mahkeme_id = $1 AND h.aktif = true
         ORDER BY k.ad, k.soyad`,
        [courtId]
      );
      return result.rows.map(row => new Judge(row));
    } catch (error) {
      logger.error('Mahkeme hakimleri bulma hatası:', error);
      throw error;
    }
  }

  // Create new judge
  static async create(judgeData) {
    return await transaction(async (client) => {
      try {
        // Check if user exists and has correct role
        const userCheck = await client.query(
          'SELECT id, rol FROM kullanicilar WHERE id = $1',
          [judgeData.kullaniciId]
        );

        if (userCheck.rows.length === 0) {
          throw new Error('Kullanıcı bulunamadı');
        }

        if (userCheck.rows[0].rol !== 'hakim') {
          // Update user role to hakim
          await client.query(
            'UPDATE kullanicilar SET rol = $1 WHERE id = $2',
            ['hakim', judgeData.kullaniciId]
          );
        }

        // Create judge record
        const result = await client.query(
          `INSERT INTO hakimler 
           (kullanici_id, sicil_no, mahkeme_id, unvan, uzmanlik_alanlari, atanma_tarihi)
           VALUES ($1, $2, $3, $4, $5, $6)
           RETURNING *`,
          [
            judgeData.kullaniciId,
            judgeData.sicilNo,
            judgeData.mahkemeId,
            judgeData.unvan || 'Hakim',
            judgeData.uzmanlikAlanlari || [],
            judgeData.atanmaTarihi || new Date()
          ]
        );

        const newJudge = new Judge(result.rows[0]);
        logger.info('Yeni hakim oluşturuldu', { judgeId: newJudge.id });
        return newJudge;
      } catch (error) {
        logger.error('Hakim oluşturma hatası:', error);
        throw error;
      }
    });
  }

  // Update judge
  async update(updateData) {
    try {
      const fields = [];
      const values = [];
      let index = 1;

      if (updateData.mahkemeId !== undefined) {
        fields.push(`mahkeme_id = $${index++}`);
        values.push(updateData.mahkemeId);
      }
      if (updateData.unvan !== undefined) {
        fields.push(`unvan = $${index++}`);
        values.push(updateData.unvan);
      }
      if (updateData.uzmanlikAlanlari !== undefined) {
        fields.push(`uzmanlik_alanlari = $${index++}`);
        values.push(updateData.uzmanlikAlanlari);
      }
      if (updateData.aktif !== undefined) {
        fields.push(`aktif = $${index++}`);
        values.push(updateData.aktif);
      }

      if (fields.length === 0) {
        return this;
      }

      fields.push(`guncelleme_tarihi = CURRENT_TIMESTAMP`);
      values.push(this.id);

      const updateQuery = `
        UPDATE hakimler 
        SET ${fields.join(', ')}
        WHERE id = $${index}
        RETURNING *
      `;

      const result = await query(updateQuery, values);
      Object.assign(this, new Judge(result.rows[0]));
      
      logger.info('Hakim güncellendi', { judgeId: this.id });
      return this;
    } catch (error) {
      logger.error('Hakim güncelleme hatası:', error);
      throw error;
    }
  }

  // Get judge's appointments
  async getAppointments(filters = {}) {
    try {
      let queryText = `
        SELECT r.*, 
          k.ad as kullanici_ad, k.soyad as kullanici_soyad, k.tc_kimlik_no,
          m.ad as mahkeme_ad
        FROM randevular r
        JOIN kullanicilar k ON r.kullanici_id = k.id
        JOIN mahkemeler m ON r.mahkeme_id = m.id
        WHERE r.hakim_id = $1
      `;
      const values = [this.id];
      let paramIndex = 2;

      if (filters.durum) {
        queryText += ` AND r.durum = $${paramIndex}`;
        values.push(filters.durum);
        paramIndex++;
      }

      if (filters.tarih) {
        queryText += ` AND r.randevu_tarihi = $${paramIndex}`;
        values.push(filters.tarih);
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

      const result = await query(queryText, values);
      return result.rows;
    } catch (error) {
      logger.error('Hakim randevuları getirme hatası:', error);
      throw error;
    }
  }

  // Get judge's schedule for a specific date
  async getSchedule(date) {
    try {
      const result = await query(
        `SELECT 
          r.randevu_saati,
          r.islem_turu,
          r.durum,
          k.ad || ' ' || k.soyad as kullanici_adi
         FROM randevular r
         JOIN kullanicilar k ON r.kullanici_id = k.id
         WHERE r.hakim_id = $1 
         AND r.randevu_tarihi = $2
         AND r.durum IN ('beklemede', 'onaylandi')
         ORDER BY r.randevu_saati`,
        [this.id, date]
      );
      return result.rows;
    } catch (error) {
      logger.error('Hakim takvimi getirme hatası:', error);
      throw error;
    }
  }

  // Get judge statistics
  async getStatistics(startDate, endDate) {
    try {
      const result = await query(
        `SELECT 
          COUNT(*) as toplam_randevu,
          COUNT(CASE WHEN durum = 'tamamlandi' THEN 1 END) as tamamlanan,
          COUNT(CASE WHEN durum = 'iptal' THEN 1 END) as iptal_edilen,
          COUNT(DISTINCT kullanici_id) as benzersiz_vatandas,
          COUNT(DISTINCT DATE_TRUNC('day', randevu_tarihi)) as calisilan_gun
         FROM randevular
         WHERE hakim_id = $1
         AND randevu_tarihi BETWEEN $2 AND $3`,
        [this.id, startDate, endDate]
      );
      return result.rows[0];
    } catch (error) {
      logger.error('Hakim istatistikleri getirme hatası:', error);
      throw error;
    }
  }

  // Get available time slots for judge
  async getAvailableSlots(date) {
    try {
      // Get court working hours
      const courtResult = await query(
        `SELECT m.calisma_saatleri
         FROM hakimler h
         JOIN mahkemeler m ON h.mahkeme_id = m.id
         WHERE h.id = $1`,
        [this.id]
      );

      if (courtResult.rows.length === 0 || !courtResult.rows[0].calisma_saatleri) {
        return [];
      }

      const workingHours = courtResult.rows[0].calisma_saatleri;
      const dayOfWeek = new Date(date).getDay();
      
      let startTime, endTime;
      if (dayOfWeek === 0) {
        return []; // Sunday - closed
      } else if (dayOfWeek === 6) {
        if (!workingHours.cumartesi) return [];
        startTime = workingHours.cumartesi.baslangic;
        endTime = workingHours.cumartesi.bitis;
      } else {
        if (!workingHours.hafta_ici) return [];
        startTime = workingHours.hafta_ici.baslangic;
        endTime = workingHours.hafta_ici.bitis;
      }

      // Generate time slots (30-minute intervals)
      const slots = [];
      const [startHour, startMinute] = startTime.split(':').map(Number);
      const [endHour, endMinute] = endTime.split(':').map(Number);
      
      for (let hour = startHour; hour < endHour; hour++) {
        for (let minute = 0; minute < 60; minute += 30) {
          if (hour === startHour && minute < startMinute) continue;
          if (hour === endHour - 1 && minute + 30 > endMinute) continue;
          
          const time = `${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}`;
          slots.push(time);
        }
      }

      // Get booked slots
      const bookedResult = await query(
        `SELECT randevu_saati 
         FROM randevular 
         WHERE hakim_id = $1 
         AND randevu_tarihi = $2 
         AND durum IN ('beklemede', 'onaylandi')`,
        [this.id, date]
      );

      const bookedSlots = bookedResult.rows.map(row => row.randevu_saati.slice(0, 5));

      // Return available slots
      return slots.filter(slot => !bookedSlots.includes(slot));
    } catch (error) {
      logger.error('Hakim müsait slot getirme hatası:', error);
      throw error;
    }
  }

  // Transfer judge to another court
  async transferToCourt(newCourtId) {
    return await transaction(async (client) => {
      try {
        // Update judge's court
        await client.query(
          `UPDATE hakimler 
           SET mahkeme_id = $1, 
               atanma_tarihi = CURRENT_DATE,
               guncelleme_tarihi = CURRENT_TIMESTAMP
           WHERE id = $2`,
          [newCourtId, this.id]
        );

        // Cancel future appointments
        await client.query(
          `UPDATE randevular 
           SET durum = 'iptal',
               iptal_nedeni = 'Hakim başka mahkemeye atandı',
               guncelleme_tarihi = CURRENT_TIMESTAMP
           WHERE hakim_id = $1 
           AND randevu_tarihi > CURRENT_DATE
           AND durum IN ('beklemede', 'onaylandi')`,
          [this.id]
        );

        this.mahkemeId = newCourtId;
        this.atanmaTarihi = new Date();

        logger.info('Hakim transfer edildi', { 
          judgeId: this.id, 
          newCourtId: newCourtId 
        });

        return this;
      } catch (error) {
        logger.error('Hakim transfer hatası:', error);
        throw error;
      }
    });
  }
}

module.exports = Judge;