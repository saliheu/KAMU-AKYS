const { query, transaction } = require('../config/database');
const bcrypt = require('bcryptjs');
const { v4: uuidv4 } = require('uuid');
const logger = require('../utils/logger');

class User {
  constructor(data) {
    this.id = data.id;
    this.tcKimlikNo = data.tc_kimlik_no;
    this.ad = data.ad;
    this.soyad = data.soyad;
    this.email = data.email;
    this.telefon = data.telefon;
    this.rol = data.rol;
    this.aktif = data.aktif;
    this.eDevletDogrulama = data.e_devlet_dogrulama;
    this.olusturmaTarihi = data.olusturma_tarihi;
    this.guncellemeTarihi = data.guncelleme_tarihi;
    this.sonGiris = data.son_giris;
  }

  // Create users table
  static async createTable() {
    const createTableQuery = `
      CREATE TABLE IF NOT EXISTS kullanicilar (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        tc_kimlik_no VARCHAR(11) UNIQUE NOT NULL,
        ad VARCHAR(100) NOT NULL,
        soyad VARCHAR(100) NOT NULL,
        email VARCHAR(255) UNIQUE,
        telefon VARCHAR(10),
        sifre_hash VARCHAR(255),
        rol user_role NOT NULL DEFAULT 'vatandas',
        aktif BOOLEAN DEFAULT true,
        e_devlet_dogrulama BOOLEAN DEFAULT false,
        email_dogrulama BOOLEAN DEFAULT false,
        telefon_dogrulama BOOLEAN DEFAULT false,
        profil_resmi TEXT,
        adres JSONB,
        son_giris TIMESTAMP,
        olusturma_tarihi TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        guncelleme_tarihi TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        CONSTRAINT tc_kimlik_no_check CHECK (tc_kimlik_no ~ '^[0-9]{11}$'),
        CONSTRAINT telefon_check CHECK (telefon ~ '^[0-9]{10}$')
      );

      CREATE INDEX IF NOT EXISTS idx_kullanicilar_tc ON kullanicilar(tc_kimlik_no);
      CREATE INDEX IF NOT EXISTS idx_kullanicilar_email ON kullanicilar(email);
      CREATE INDEX IF NOT EXISTS idx_kullanicilar_rol ON kullanicilar(rol);
      CREATE INDEX IF NOT EXISTS idx_kullanicilar_aktif ON kullanicilar(aktif);
    `;

    try {
      await query(createTableQuery);
      logger.info('Kullanıcılar tablosu oluşturuldu');
    } catch (error) {
      logger.error('Kullanıcılar tablosu oluşturma hatası:', error);
      throw error;
    }
  }

  // Find user by ID
  static async findById(id) {
    try {
      const result = await query(
        'SELECT * FROM kullanicilar WHERE id = $1',
        [id]
      );
      return result.rows[0] ? new User(result.rows[0]) : null;
    } catch (error) {
      logger.error('Kullanıcı bulma hatası:', error);
      throw error;
    }
  }

  // Find user by TC Kimlik No
  static async findByTcKimlikNo(tcKimlikNo) {
    try {
      const result = await query(
        'SELECT * FROM kullanicilar WHERE tc_kimlik_no = $1',
        [tcKimlikNo]
      );
      return result.rows[0] ? new User(result.rows[0]) : null;
    } catch (error) {
      logger.error('TC Kimlik No ile kullanıcı bulma hatası:', error);
      throw error;
    }
  }

  // Find user by email
  static async findByEmail(email) {
    try {
      const result = await query(
        'SELECT * FROM kullanicilar WHERE email = $1',
        [email]
      );
      return result.rows[0] ? new User(result.rows[0]) : null;
    } catch (error) {
      logger.error('Email ile kullanıcı bulma hatası:', error);
      throw error;
    }
  }

  // Create new user
  static async create(userData) {
    return await transaction(async (client) => {
      try {
        // Validate TC Kimlik No
        if (!User.validateTcKimlikNo(userData.tcKimlikNo)) {
          throw new Error('Geçersiz TC Kimlik Numarası');
        }

        // Hash password if provided
        let passwordHash = null;
        if (userData.password) {
          const salt = await bcrypt.genSalt(10);
          passwordHash = await bcrypt.hash(userData.password, salt);
        }

        // Insert user
        const result = await client.query(
          `INSERT INTO kullanicilar 
           (tc_kimlik_no, ad, soyad, email, telefon, sifre_hash, rol, aktif, e_devlet_dogrulama)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
           RETURNING *`,
          [
            userData.tcKimlikNo,
            userData.ad,
            userData.soyad,
            userData.email,
            userData.telefon,
            passwordHash,
            userData.rol || 'vatandas',
            userData.aktif !== false,
            userData.eDevletDogrulama || false
          ]
        );

        const newUser = new User(result.rows[0]);

        // Create related profile based on role
        if (userData.rol === 'avukat') {
          await client.query(
            `INSERT INTO avukatlar (kullanici_id, baro_no, baro_il)
             VALUES ($1, $2, $3)`,
            [newUser.id, userData.baroNo, userData.baroIl]
          );
        } else if (userData.rol === 'hakim') {
          await client.query(
            `INSERT INTO hakimler (kullanici_id, sicil_no, mahkeme_id)
             VALUES ($1, $2, $3)`,
            [newUser.id, userData.sicilNo, userData.mahkemeId]
          );
        }

        logger.info('Yeni kullanıcı oluşturuldu', { userId: newUser.id });
        return newUser;
      } catch (error) {
        logger.error('Kullanıcı oluşturma hatası:', error);
        throw error;
      }
    });
  }

  // Update user
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
      if (updateData.soyad !== undefined) {
        fields.push(`soyad = $${index++}`);
        values.push(updateData.soyad);
      }
      if (updateData.email !== undefined) {
        fields.push(`email = $${index++}`);
        values.push(updateData.email);
      }
      if (updateData.telefon !== undefined) {
        fields.push(`telefon = $${index++}`);
        values.push(updateData.telefon);
      }
      if (updateData.aktif !== undefined) {
        fields.push(`aktif = $${index++}`);
        values.push(updateData.aktif);
      }
      if (updateData.password !== undefined) {
        const salt = await bcrypt.genSalt(10);
        const passwordHash = await bcrypt.hash(updateData.password, salt);
        fields.push(`sifre_hash = $${index++}`);
        values.push(passwordHash);
      }

      if (fields.length === 0) {
        return this;
      }

      fields.push(`guncelleme_tarihi = CURRENT_TIMESTAMP`);
      values.push(this.id);

      const updateQuery = `
        UPDATE kullanicilar 
        SET ${fields.join(', ')}
        WHERE id = $${index}
        RETURNING *
      `;

      const result = await query(updateQuery, values);
      Object.assign(this, new User(result.rows[0]));
      
      logger.info('Kullanıcı güncellendi', { userId: this.id });
      return this;
    } catch (error) {
      logger.error('Kullanıcı güncelleme hatası:', error);
      throw error;
    }
  }

  // Delete user (soft delete)
  async delete() {
    try {
      await query(
        'UPDATE kullanicilar SET aktif = false WHERE id = $1',
        [this.id]
      );
      this.aktif = false;
      logger.info('Kullanıcı silindi', { userId: this.id });
      return true;
    } catch (error) {
      logger.error('Kullanıcı silme hatası:', error);
      throw error;
    }
  }

  // Verify password
  static async verifyPassword(password, hash) {
    return await bcrypt.compare(password, hash);
  }

  // Update last login
  async updateLastLogin() {
    try {
      await query(
        'UPDATE kullanicilar SET son_giris = CURRENT_TIMESTAMP WHERE id = $1',
        [this.id]
      );
      this.sonGiris = new Date();
    } catch (error) {
      logger.error('Son giriş güncelleme hatası:', error);
    }
  }

  // Get user appointments
  async getAppointments(filters = {}) {
    try {
      let queryText = `
        SELECT r.*, m.ad as mahkeme_adi, h.ad as hakim_adi, h.soyad as hakim_soyadi
        FROM randevular r
        LEFT JOIN mahkemeler m ON r.mahkeme_id = m.id
        LEFT JOIN hakimler hk ON r.hakim_id = hk.id
        LEFT JOIN kullanicilar h ON hk.kullanici_id = h.id
        WHERE r.kullanici_id = $1
      `;
      const values = [this.id];
      let paramIndex = 2;

      if (filters.durum) {
        queryText += ` AND r.durum = $${paramIndex}`;
        values.push(filters.durum);
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

      queryText += ' ORDER BY r.randevu_tarihi DESC, r.randevu_saati DESC';

      const result = await query(queryText, values);
      return result.rows;
    } catch (error) {
      logger.error('Kullanıcı randevuları getirme hatası:', error);
      throw error;
    }
  }

  // Validate TC Kimlik No (basic validation)
  static validateTcKimlikNo(tcNo) {
    if (!/^\d{11}$/.test(tcNo)) return false;
    
    // TC Kimlik No algorithm validation
    const digits = tcNo.split('').map(Number);
    const oddSum = digits[0] + digits[2] + digits[4] + digits[6] + digits[8];
    const evenSum = digits[1] + digits[3] + digits[5] + digits[7];
    const tenthDigit = ((oddSum * 7) - evenSum) % 10;
    const eleventhDigit = (digits.slice(0, 10).reduce((a, b) => a + b, 0)) % 10;
    
    return digits[9] === tenthDigit && digits[10] === eleventhDigit;
  }

  // Convert to JSON (remove sensitive data)
  toJSON() {
    const obj = { ...this };
    delete obj.sifre_hash;
    return obj;
  }
}

module.exports = User;