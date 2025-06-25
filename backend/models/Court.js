const { query, transaction } = require('../config/database');
const logger = require('../utils/logger');

class Court {
  constructor(data) {
    this.id = data.id;
    this.ad = data.ad;
    this.tur = data.tur;
    this.adres = data.adres;
    this.telefon = data.telefon;
    this.email = data.email;
    this.koordinat = data.koordinat;
    this.calismaSaatleri = data.calisma_saatleri;
    this.aktif = data.aktif;
    this.uyapKodu = data.uyap_kodu;
    this.olusturmaTarihi = data.olusturma_tarihi;
    this.guncellemeTarihi = data.guncelleme_tarihi;
  }

  // Create courts table
  static async createTable() {
    const createTableQuery = `
      CREATE TYPE IF NOT EXISTS mahkeme_turu AS ENUM (
        'asliye_hukuk', 'asliye_ceza', 'agir_ceza', 
        'sulh_hukuk', 'sulh_ceza', 'icra', 
        'aile', 'is', 'ticaret', 'fikri_mulkiyet', 
        'tuketici', 'kadastro', 'idare'
      );

      CREATE TABLE IF NOT EXISTS mahkemeler (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        ad VARCHAR(255) NOT NULL,
        tur mahkeme_turu NOT NULL,
        adres JSONB NOT NULL,
        telefon VARCHAR(20),
        email VARCHAR(255),
        koordinat JSONB,
        calisma_saatleri JSONB,
        kapasite INTEGER DEFAULT 100,
        aktif BOOLEAN DEFAULT true,
        uyap_kodu VARCHAR(50) UNIQUE,
        olusturma_tarihi TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        guncelleme_tarihi TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        CONSTRAINT email_check CHECK (email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\\.[A-Za-z]{2,}$')
      );

      CREATE INDEX IF NOT EXISTS idx_mahkemeler_tur ON mahkemeler(tur);
      CREATE INDEX IF NOT EXISTS idx_mahkemeler_aktif ON mahkemeler(aktif);
      CREATE INDEX IF NOT EXISTS idx_mahkemeler_adres_il ON mahkemeler((adres->>'il'));
      CREATE INDEX IF NOT EXISTS idx_mahkemeler_adres_ilce ON mahkemeler((adres->>'ilce'));
    `;

    try {
      await query(createTableQuery);
      logger.info('Mahkemeler tablosu oluşturuldu');
    } catch (error) {
      logger.error('Mahkemeler tablosu oluşturma hatası:', error);
      throw error;
    }
  }

  // Find court by ID
  static async findById(id) {
    try {
      const result = await query(
        'SELECT * FROM mahkemeler WHERE id = $1',
        [id]
      );
      return result.rows[0] ? new Court(result.rows[0]) : null;
    } catch (error) {
      logger.error('Mahkeme bulma hatası:', error);
      throw error;
    }
  }

  // Find courts by criteria
  static async find(filters = {}) {
    try {
      let queryText = 'SELECT * FROM mahkemeler WHERE 1=1';
      const values = [];
      let paramIndex = 1;

      if (filters.tur) {
        queryText += ` AND tur = $${paramIndex}`;
        values.push(filters.tur);
        paramIndex++;
      }

      if (filters.il) {
        queryText += ` AND adres->>'il' = $${paramIndex}`;
        values.push(filters.il);
        paramIndex++;
      }

      if (filters.ilce) {
        queryText += ` AND adres->>'ilce' = $${paramIndex}`;
        values.push(filters.ilce);
        paramIndex++;
      }

      if (filters.aktif !== undefined) {
        queryText += ` AND aktif = $${paramIndex}`;
        values.push(filters.aktif);
        paramIndex++;
      }

      if (filters.search) {
        queryText += ` AND (ad ILIKE $${paramIndex} OR adres::text ILIKE $${paramIndex})`;
        values.push(`%${filters.search}%`);
        paramIndex++;
      }

      queryText += ' ORDER BY ad';

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
      return result.rows.map(row => new Court(row));
    } catch (error) {
      logger.error('Mahkeme arama hatası:', error);
      throw error;
    }
  }

  // Create new court
  static async create(courtData) {
    try {
      const result = await query(
        `INSERT INTO mahkemeler 
         (ad, tur, adres, telefon, email, koordinat, calisma_saatleri, kapasite, uyap_kodu)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
         RETURNING *`,
        [
          courtData.ad,
          courtData.tur,
          JSON.stringify(courtData.adres),
          courtData.telefon,
          courtData.email,
          courtData.koordinat ? JSON.stringify(courtData.koordinat) : null,
          courtData.calismaSaatleri ? JSON.stringify(courtData.calismaSaatleri) : null,
          courtData.kapasite || 100,
          courtData.uyapKodu
        ]
      );

      const newCourt = new Court(result.rows[0]);
      logger.info('Yeni mahkeme oluşturuldu', { courtId: newCourt.id });
      return newCourt;
    } catch (error) {
      logger.error('Mahkeme oluşturma hatası:', error);
      throw error;
    }
  }

  // Update court
  async update(updateData) {
    try {
      const fields = [];
      const values = [];
      let index = 1;

      // Build dynamic update query
      if (updateData.ad !== undefined) {
        fields.push(`ad = $${index++}`);
        values.push(updateData.ad);
      }
      if (updateData.tur !== undefined) {
        fields.push(`tur = $${index++}`);
        values.push(updateData.tur);
      }
      if (updateData.adres !== undefined) {
        fields.push(`adres = $${index++}`);
        values.push(JSON.stringify(updateData.adres));
      }
      if (updateData.telefon !== undefined) {
        fields.push(`telefon = $${index++}`);
        values.push(updateData.telefon);
      }
      if (updateData.email !== undefined) {
        fields.push(`email = $${index++}`);
        values.push(updateData.email);
      }
      if (updateData.koordinat !== undefined) {
        fields.push(`koordinat = $${index++}`);
        values.push(JSON.stringify(updateData.koordinat));
      }
      if (updateData.calismaSaatleri !== undefined) {
        fields.push(`calisma_saatleri = $${index++}`);
        values.push(JSON.stringify(updateData.calismaSaatleri));
      }
      if (updateData.kapasite !== undefined) {
        fields.push(`kapasite = $${index++}`);
        values.push(updateData.kapasite);
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
        UPDATE mahkemeler 
        SET ${fields.join(', ')}
        WHERE id = $${index}
        RETURNING *
      `;

      const result = await query(updateQuery, values);
      Object.assign(this, new Court(result.rows[0]));
      
      logger.info('Mahkeme güncellendi', { courtId: this.id });
      return this;
    } catch (error) {
      logger.error('Mahkeme güncelleme hatası:', error);
      throw error;
    }
  }

  // Get court judges
  async getJudges() {
    try {
      const result = await query(
        `SELECT k.*, h.sicil_no, h.unvan
         FROM hakimler h
         JOIN kullanicilar k ON h.kullanici_id = k.id
         WHERE h.mahkeme_id = $1 AND k.aktif = true`,
        [this.id]
      );
      return result.rows;
    } catch (error) {
      logger.error('Mahkeme hakimleri getirme hatası:', error);
      throw error;
    }
  }

  // Get available time slots for a specific date
  async getAvailableSlots(date, judgeId = null) {
    try {
      // Get court working hours
      const dayOfWeek = new Date(date).getDay();
      const workingHours = this.calismaSaatleri;
      
      if (!workingHours) {
        return [];
      }

      let startTime, endTime;
      if (dayOfWeek === 0) {
        // Sunday - closed
        return [];
      } else if (dayOfWeek === 6) {
        // Saturday
        if (!workingHours.cumartesi) return [];
        startTime = workingHours.cumartesi.baslangic;
        endTime = workingHours.cumartesi.bitis;
      } else {
        // Weekday
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

      // Get existing appointments for the date
      let queryText = `
        SELECT randevu_saati 
        FROM randevular 
        WHERE mahkeme_id = $1 
        AND randevu_tarihi = $2 
        AND durum IN ('beklemede', 'onaylandi')
      `;
      const values = [this.id, date];

      if (judgeId) {
        queryText += ' AND hakim_id = $3';
        values.push(judgeId);
      }

      const result = await query(queryText, values);
      const bookedSlots = result.rows.map(row => row.randevu_saati);

      // Return available slots
      return slots.filter(slot => !bookedSlots.includes(slot));
    } catch (error) {
      logger.error('Müsait slot getirme hatası:', error);
      throw error;
    }
  }

  // Get court statistics
  async getStatistics(startDate, endDate) {
    try {
      const result = await query(
        `SELECT 
          COUNT(*) as toplam_randevu,
          COUNT(CASE WHEN durum = 'tamamlandi' THEN 1 END) as tamamlanan,
          COUNT(CASE WHEN durum = 'iptal' THEN 1 END) as iptal_edilen,
          COUNT(CASE WHEN durum = 'beklemede' THEN 1 END) as bekleyen,
          COUNT(CASE WHEN durum = 'onaylandi' THEN 1 END) as onaylanan
         FROM randevular
         WHERE mahkeme_id = $1
         AND randevu_tarihi BETWEEN $2 AND $3`,
        [this.id, startDate, endDate]
      );
      return result.rows[0];
    } catch (error) {
      logger.error('Mahkeme istatistikleri getirme hatası:', error);
      throw error;
    }
  }

  // Calculate distance from coordinates
  calculateDistance(lat, lng) {
    if (!this.koordinat || !this.koordinat.lat || !this.koordinat.lng) {
      return null;
    }

    const R = 6371; // Earth's radius in kilometers
    const dLat = (this.koordinat.lat - lat) * Math.PI / 180;
    const dLon = (this.koordinat.lng - lng) * Math.PI / 180;
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(lat * Math.PI / 180) * Math.cos(this.koordinat.lat * Math.PI / 180) *
      Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
  }
}

module.exports = Court;