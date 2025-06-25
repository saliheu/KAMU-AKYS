const { query, transaction } = require('../config/database');
const logger = require('../utils/logger');

class Lawyer {
  constructor(data) {
    this.id = data.id;
    this.kullaniciId = data.kullanici_id;
    this.baroNo = data.baro_no;
    this.baroIl = data.baro_il;
    this.uzmanlikAlanlari = data.uzmanlik_alanlari;
    this.deneyimYili = data.deneyim_yili;
    this.ofisAdresi = data.ofis_adresi;
    this.websitesi = data.websitesi;
    this.aktif = data.aktif;
    this.onayDurumu = data.onay_durumu;
    this.onayTarihi = data.onay_tarihi;
    this.olusturmaTarihi = data.olusturma_tarihi;
    this.guncellemeTarihi = data.guncelleme_tarihi;
    
    // User details if joined
    this.ad = data.ad;
    this.soyad = data.soyad;
    this.email = data.email;
    this.telefon = data.telefon;
  }

  // Create lawyers table
  static async createTable() {
    const createTableQuery = `
      CREATE TYPE IF NOT EXISTS avukat_uzmanlik AS ENUM (
        'ceza', 'hukuk', 'idare', 'vergi', 'is', 
        'aile', 'ticaret', 'gayrimenkul', 'miras', 
        'icra_iflas', 'fikri_mulkiyet', 'sigorta',
        'saglik', 'tuketici', 'bilisim', 'diger'
      );

      CREATE TYPE IF NOT EXISTS onay_durumu AS ENUM (
        'beklemede', 'onaylandi', 'reddedildi'
      );

      CREATE TABLE IF NOT EXISTS avukatlar (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        kullanici_id UUID NOT NULL REFERENCES kullanicilar(id) ON DELETE CASCADE,
        baro_no VARCHAR(20) NOT NULL,
        baro_il VARCHAR(50) NOT NULL,
        uzmanlik_alanlari avukat_uzmanlik[],
        deneyim_yili INTEGER DEFAULT 0,
        ofis_adresi JSONB,
        websitesi VARCHAR(255),
        aktif BOOLEAN DEFAULT true,
        onay_durumu onay_durumu DEFAULT 'beklemede',
        onay_tarihi TIMESTAMP,
        olusturma_tarihi TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        guncelleme_tarihi TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        CONSTRAINT baro_no_format CHECK (baro_no ~ '^[0-9]{4,20}$'),
        CONSTRAINT deneyim_yili_check CHECK (deneyim_yili >= 0),
        UNIQUE(baro_no, baro_il)
      );

      CREATE INDEX IF NOT EXISTS idx_avukatlar_kullanici ON avukatlar(kullanici_id);
      CREATE INDEX IF NOT EXISTS idx_avukatlar_baro_il ON avukatlar(baro_il);
      CREATE INDEX IF NOT EXISTS idx_avukatlar_onay ON avukatlar(onay_durumu);
      CREATE INDEX IF NOT EXISTS idx_avukatlar_aktif ON avukatlar(aktif);
      CREATE INDEX IF NOT EXISTS idx_avukatlar_uzmanlik ON avukatlar USING GIN(uzmanlik_alanlari);
    `;

    try {
      await query(createTableQuery);
      logger.info('Avukatlar tablosu oluşturuldu');
    } catch (error) {
      logger.error('Avukatlar tablosu oluşturma hatası:', error);
      throw error;
    }
  }

  // Find lawyer by ID
  static async findById(id) {
    try {
      const result = await query(
        `SELECT a.*, k.ad, k.soyad, k.email, k.telefon, k.tc_kimlik_no
         FROM avukatlar a
         JOIN kullanicilar k ON a.kullanici_id = k.id
         WHERE a.id = $1`,
        [id]
      );
      return result.rows[0] ? new Lawyer(result.rows[0]) : null;
    } catch (error) {
      logger.error('Avukat bulma hatası:', error);
      throw error;
    }
  }

  // Find lawyer by user ID
  static async findByUserId(userId) {
    try {
      const result = await query(
        `SELECT a.*, k.ad, k.soyad, k.email, k.telefon
         FROM avukatlar a
         JOIN kullanicilar k ON a.kullanici_id = k.id
         WHERE a.kullanici_id = $1`,
        [userId]
      );
      return result.rows[0] ? new Lawyer(result.rows[0]) : null;
    } catch (error) {
      logger.error('Kullanıcı ID ile avukat bulma hatası:', error);
      throw error;
    }
  }

  // Find lawyer by baro no
  static async findByBaroNo(baroNo, baroIl) {
    try {
      const result = await query(
        `SELECT a.*, k.ad, k.soyad, k.email, k.telefon
         FROM avukatlar a
         JOIN kullanicilar k ON a.kullanici_id = k.id
         WHERE a.baro_no = $1 AND a.baro_il = $2`,
        [baroNo, baroIl]
      );
      return result.rows[0] ? new Lawyer(result.rows[0]) : null;
    } catch (error) {
      logger.error('Baro no ile avukat bulma hatası:', error);
      throw error;
    }
  }

  // Search lawyers
  static async search(filters = {}) {
    try {
      let queryText = `
        SELECT a.*, k.ad, k.soyad, k.email, k.telefon
        FROM avukatlar a
        JOIN kullanicilar k ON a.kullanici_id = k.id
        WHERE a.onay_durumu = 'onaylandi' AND a.aktif = true
      `;
      const values = [];
      let paramIndex = 1;

      if (filters.baroIl) {
        queryText += ` AND a.baro_il = $${paramIndex}`;
        values.push(filters.baroIl);
        paramIndex++;
      }

      if (filters.uzmanlik) {
        queryText += ` AND $${paramIndex} = ANY(a.uzmanlik_alanlari)`;
        values.push(filters.uzmanlik);
        paramIndex++;
      }

      if (filters.minDeneyim) {
        queryText += ` AND a.deneyim_yili >= $${paramIndex}`;
        values.push(filters.minDeneyim);
        paramIndex++;
      }

      if (filters.search) {
        queryText += ` AND (k.ad ILIKE $${paramIndex} OR k.soyad ILIKE $${paramIndex} OR a.ofis_adresi::text ILIKE $${paramIndex})`;
        values.push(`%${filters.search}%`);
        paramIndex++;
      }

      queryText += ' ORDER BY a.deneyim_yili DESC, k.ad, k.soyad';

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
      return result.rows.map(row => new Lawyer(row));
    } catch (error) {
      logger.error('Avukat arama hatası:', error);
      throw error;
    }
  }

  // Create new lawyer
  static async create(lawyerData) {
    return await transaction(async (client) => {
      try {
        // Check if user exists and has correct role
        const userCheck = await client.query(
          'SELECT id, rol FROM kullanicilar WHERE id = $1',
          [lawyerData.kullaniciId]
        );

        if (userCheck.rows.length === 0) {
          throw new Error('Kullanıcı bulunamadı');
        }

        if (userCheck.rows[0].rol !== 'avukat') {
          // Update user role to avukat
          await client.query(
            'UPDATE kullanicilar SET rol = $1 WHERE id = $2',
            ['avukat', lawyerData.kullaniciId]
          );
        }

        // Create lawyer record
        const result = await client.query(
          `INSERT INTO avukatlar 
           (kullanici_id, baro_no, baro_il, uzmanlik_alanlari, deneyim_yili, ofis_adresi, websitesi)
           VALUES ($1, $2, $3, $4, $5, $6, $7)
           RETURNING *`,
          [
            lawyerData.kullaniciId,
            lawyerData.baroNo,
            lawyerData.baroIl,
            lawyerData.uzmanlikAlanlari || [],
            lawyerData.deneyimYili || 0,
            lawyerData.ofisAdresi ? JSON.stringify(lawyerData.ofisAdresi) : null,
            lawyerData.websitesi
          ]
        );

        const newLawyer = new Lawyer(result.rows[0]);
        logger.info('Yeni avukat oluşturuldu', { lawyerId: newLawyer.id });
        return newLawyer;
      } catch (error) {
        logger.error('Avukat oluşturma hatası:', error);
        throw error;
      }
    });
  }

  // Update lawyer
  async update(updateData) {
    try {
      const fields = [];
      const values = [];
      let index = 1;

      if (updateData.uzmanlikAlanlari !== undefined) {
        fields.push(`uzmanlik_alanlari = $${index++}`);
        values.push(updateData.uzmanlikAlanlari);
      }
      if (updateData.deneyimYili !== undefined) {
        fields.push(`deneyim_yili = $${index++}`);
        values.push(updateData.deneyimYili);
      }
      if (updateData.ofisAdresi !== undefined) {
        fields.push(`ofis_adresi = $${index++}`);
        values.push(JSON.stringify(updateData.ofisAdresi));
      }
      if (updateData.websitesi !== undefined) {
        fields.push(`websitesi = $${index++}`);
        values.push(updateData.websitesi);
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
        UPDATE avukatlar 
        SET ${fields.join(', ')}
        WHERE id = $${index}
        RETURNING *
      `;

      const result = await query(updateQuery, values);
      Object.assign(this, new Lawyer(result.rows[0]));
      
      logger.info('Avukat güncellendi', { lawyerId: this.id });
      return this;
    } catch (error) {
      logger.error('Avukat güncelleme hatası:', error);
      throw error;
    }
  }

  // Approve lawyer registration
  async approve() {
    try {
      const result = await query(
        `UPDATE avukatlar 
         SET onay_durumu = 'onaylandi',
             onay_tarihi = CURRENT_TIMESTAMP,
             guncelleme_tarihi = CURRENT_TIMESTAMP
         WHERE id = $1 AND onay_durumu = 'beklemede'
         RETURNING *`,
        [this.id]
      );

      if (result.rows.length === 0) {
        throw new Error('Avukat onaylanamadı');
      }

      Object.assign(this, new Lawyer(result.rows[0]));
      logger.info('Avukat onaylandı', { lawyerId: this.id });
      return this;
    } catch (error) {
      logger.error('Avukat onaylama hatası:', error);
      throw error;
    }
  }

  // Reject lawyer registration
  async reject(reason) {
    try {
      const result = await query(
        `UPDATE avukatlar 
         SET onay_durumu = 'reddedildi',
             onay_tarihi = CURRENT_TIMESTAMP,
             guncelleme_tarihi = CURRENT_TIMESTAMP
         WHERE id = $1 AND onay_durumu = 'beklemede'
         RETURNING *`,
        [this.id]
      );

      if (result.rows.length === 0) {
        throw new Error('Avukat reddedilemedi');
      }

      Object.assign(this, new Lawyer(result.rows[0]));
      logger.info('Avukat reddedildi', { lawyerId: this.id, reason });
      return this;
    } catch (error) {
      logger.error('Avukat reddetme hatası:', error);
      throw error;
    }
  }

  // Get lawyer's clients (users who have appointments with this lawyer)
  async getClients() {
    try {
      const result = await query(
        `SELECT DISTINCT k.id, k.ad, k.soyad, k.email, k.telefon,
          COUNT(r.id) as randevu_sayisi,
          MAX(r.randevu_tarihi) as son_randevu
         FROM randevular r
         JOIN kullanicilar k ON r.kullanici_id = k.id
         JOIN avukat_randevulari ar ON r.id = ar.randevu_id
         WHERE ar.avukat_id = $1
         GROUP BY k.id, k.ad, k.soyad, k.email, k.telefon
         ORDER BY son_randevu DESC`,
        [this.id]
      );
      return result.rows;
    } catch (error) {
      logger.error('Avukat müvekkilleri getirme hatası:', error);
      throw error;
    }
  }

  // Get lawyer's appointment statistics
  async getStatistics(startDate, endDate) {
    try {
      const result = await query(
        `SELECT 
          COUNT(DISTINCT r.id) as toplam_randevu,
          COUNT(DISTINCT r.kullanici_id) as benzersiz_muvekkil,
          COUNT(DISTINCT r.mahkeme_id) as farkli_mahkeme,
          COUNT(CASE WHEN r.durum = 'tamamlandi' THEN 1 END) as tamamlanan_randevu
         FROM randevular r
         JOIN avukat_randevulari ar ON r.id = ar.randevu_id
         WHERE ar.avukat_id = $1
         AND r.randevu_tarihi BETWEEN $2 AND $3`,
        [this.id, startDate, endDate]
      );
      return result.rows[0];
    } catch (error) {
      logger.error('Avukat istatistikleri getirme hatası:', error);
      throw error;
    }
  }

  // Get pending approvals (static method for admin)
  static async getPendingApprovals() {
    try {
      const result = await query(
        `SELECT a.*, k.ad, k.soyad, k.email, k.telefon, k.tc_kimlik_no
         FROM avukatlar a
         JOIN kullanicilar k ON a.kullanici_id = k.id
         WHERE a.onay_durumu = 'beklemede'
         ORDER BY a.olusturma_tarihi`
      );
      return result.rows.map(row => new Lawyer(row));
    } catch (error) {
      logger.error('Bekleyen onayları getirme hatası:', error);
      throw error;
    }
  }

  // Verify lawyer with bar association
  async verifyWithBar() {
    try {
      // This would integrate with actual bar association APIs
      // For now, it's a placeholder
      logger.info('Baro doğrulaması başlatıldı', { 
        lawyerId: this.id,
        baroNo: this.baroNo,
        baroIl: this.baroIl
      });
      
      // Simulate verification
      return {
        verified: true,
        verificationDate: new Date(),
        details: {
          baroNo: this.baroNo,
          baroIl: this.baroIl,
          status: 'active'
        }
      };
    } catch (error) {
      logger.error('Baro doğrulama hatası:', error);
      throw error;
    }
  }
}

// Create junction table for lawyer appointments
Lawyer.createJunctionTable = async () => {
  const createTableQuery = `
    CREATE TABLE IF NOT EXISTS avukat_randevulari (
      id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
      randevu_id UUID NOT NULL REFERENCES randevular(id) ON DELETE CASCADE,
      avukat_id UUID NOT NULL REFERENCES avukatlar(id) ON DELETE CASCADE,
      rol VARCHAR(50) DEFAULT 'vekil',
      olusturma_tarihi TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      UNIQUE(randevu_id, avukat_id)
    );

    CREATE INDEX IF NOT EXISTS idx_avukat_randevulari_randevu ON avukat_randevulari(randevu_id);
    CREATE INDEX IF NOT EXISTS idx_avukat_randevulari_avukat ON avukat_randevulari(avukat_id);
  `;

  try {
    await query(createTableQuery);
    logger.info('Avukat randevuları junction tablosu oluşturuldu');
  } catch (error) {
    logger.error('Avukat randevuları tablosu oluşturma hatası:', error);
    throw error;
  }
};

module.exports = Lawyer;