const axios = require('axios');
const crypto = require('crypto');
const logger = require('../utils/logger');
const { cache } = require('../config/redis');

class UYAPService {
  constructor() {
    this.baseURL = process.env.UYAP_API_URL || 'https://uyap.adalet.gov.tr/api';
    this.apiKey = process.env.UYAP_API_KEY;
    this.apiSecret = process.env.UYAP_API_SECRET;
    this.timeout = 30000; // 30 seconds
    
    // Create axios instance
    this.client = axios.create({
      baseURL: this.baseURL,
      timeout: this.timeout,
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      }
    });

    // Add request interceptor for authentication
    this.client.interceptors.request.use(
      config => this.addAuthentication(config),
      error => Promise.reject(error)
    );

    // Add response interceptor for error handling
    this.client.interceptors.response.use(
      response => response,
      error => this.handleError(error)
    );
  }

  // Add authentication headers
  addAuthentication(config) {
    const timestamp = Date.now().toString();
    const nonce = crypto.randomBytes(16).toString('hex');
    const signature = this.generateSignature(config.method, config.url, timestamp, nonce);

    config.headers['X-UYAP-API-Key'] = this.apiKey;
    config.headers['X-UYAP-Timestamp'] = timestamp;
    config.headers['X-UYAP-Nonce'] = nonce;
    config.headers['X-UYAP-Signature'] = signature;

    return config;
  }

  // Generate HMAC signature
  generateSignature(method, url, timestamp, nonce) {
    const message = `${method.toUpperCase()}${url}${timestamp}${nonce}`;
    return crypto
      .createHmac('sha256', this.apiSecret)
      .update(message)
      .digest('hex');
  }

  // Handle API errors
  handleError(error) {
    if (error.response) {
      // UYAP API returned an error
      logger.error('UYAP API error', {
        status: error.response.status,
        data: error.response.data,
        url: error.config.url
      });

      const errorMessage = error.response.data?.hata?.mesaj || 'UYAP servisi hatası';
      const errorCode = error.response.data?.hata?.kod || 'UYAP_ERROR';

      const customError = new Error(errorMessage);
      customError.code = errorCode;
      customError.status = error.response.status;

      throw customError;
    } else if (error.request) {
      // Request was made but no response
      logger.error('UYAP API no response', {
        url: error.config?.url,
        message: error.message
      });
      
      const customError = new Error('UYAP servisine bağlanılamadı');
      customError.code = 'UYAP_CONNECTION_ERROR';
      
      throw customError;
    } else {
      // Something else happened
      logger.error('UYAP API request error', { message: error.message });
      throw error;
    }
  }

  // Citizen verification
  async verifyCitizen(tcKimlikNo, ad, soyad, dogumYili) {
    try {
      const cacheKey = `uyap:citizen:${tcKimlikNo}`;
      const cached = await cache.get(cacheKey);
      if (cached) {
        return cached;
      }

      const response = await this.client.post('/kimlik/dogrula', {
        tcKimlikNo,
        ad: ad.toUpperCase(),
        soyad: soyad.toUpperCase(),
        dogumYili
      });

      const result = response.data;

      // Cache for 24 hours
      await cache.set(cacheKey, result, 86400);

      logger.info('UYAP citizen verification completed', { tcKimlikNo });
      return result;
    } catch (error) {
      logger.error('UYAP citizen verification failed', { 
        tcKimlikNo, 
        error: error.message 
      });
      throw error;
    }
  }

  // Lawyer verification
  async verifyLawyer(baroNo, tcKimlikNo) {
    try {
      const cacheKey = `uyap:lawyer:${baroNo}:${tcKimlikNo}`;
      const cached = await cache.get(cacheKey);
      if (cached) {
        return cached;
      }

      const response = await this.client.post('/avukat/dogrula', {
        baroNo,
        tcKimlikNo
      });

      const result = response.data;

      // Cache for 24 hours
      await cache.set(cacheKey, result, 86400);

      logger.info('UYAP lawyer verification completed', { baroNo });
      return result;
    } catch (error) {
      logger.error('UYAP lawyer verification failed', { 
        baroNo, 
        error: error.message 
      });
      throw error;
    }
  }

  // Get case information
  async getCaseInfo(dosyaNo, mahkemeId) {
    try {
      const cacheKey = `uyap:case:${dosyaNo}:${mahkemeId}`;
      const cached = await cache.get(cacheKey);
      if (cached) {
        return cached;
      }

      const response = await this.client.get('/dava/bilgi', {
        params: {
          dosyaNo,
          mahkemeId
        }
      });

      const result = response.data;

      // Cache for 1 hour
      await cache.set(cacheKey, result, 3600);

      logger.info('UYAP case info retrieved', { dosyaNo, mahkemeId });
      return result;
    } catch (error) {
      logger.error('UYAP get case info failed', { 
        dosyaNo, 
        error: error.message 
      });
      throw error;
    }
  }

  // Get hearing schedule
  async getHearingSchedule(mahkemeId, tarih) {
    try {
      const response = await this.client.get('/durusma/takvim', {
        params: {
          mahkemeId,
          tarih
        }
      });

      logger.info('UYAP hearing schedule retrieved', { mahkemeId, tarih });
      return response.data;
    } catch (error) {
      logger.error('UYAP get hearing schedule failed', { 
        mahkemeId, 
        error: error.message 
      });
      throw error;
    }
  }

  // Submit document
  async submitDocument(dosyaNo, mahkemeId, document) {
    try {
      const response = await this.client.post('/evrak/gonder', {
        dosyaNo,
        mahkemeId,
        belge: {
          tur: document.type,
          icerik: document.content, // Base64 encoded
          dosyaAdi: document.fileName,
          imza: document.signature // E-imza
        }
      });

      logger.info('UYAP document submitted', { 
        dosyaNo, 
        mahkemeId,
        documentType: document.type 
      });
      
      return response.data;
    } catch (error) {
      logger.error('UYAP submit document failed', { 
        dosyaNo, 
        error: error.message 
      });
      throw error;
    }
  }

  // Get court list
  async getCourtList(il, ilce) {
    try {
      const cacheKey = `uyap:courts:${il}:${ilce || 'all'}`;
      const cached = await cache.get(cacheKey);
      if (cached) {
        return cached;
      }

      const response = await this.client.get('/mahkeme/liste', {
        params: {
          il,
          ilce
        }
      });

      const result = response.data;

      // Cache for 7 days
      await cache.set(cacheKey, result, 604800);

      logger.info('UYAP court list retrieved', { il, ilce });
      return result;
    } catch (error) {
      logger.error('UYAP get court list failed', { 
        il, 
        ilce,
        error: error.message 
      });
      throw error;
    }
  }

  // Get judge information
  async getJudgeInfo(sicilNo) {
    try {
      const cacheKey = `uyap:judge:${sicilNo}`;
      const cached = await cache.get(cacheKey);
      if (cached) {
        return cached;
      }

      const response = await this.client.get('/hakim/bilgi', {
        params: {
          sicilNo
        }
      });

      const result = response.data;

      // Cache for 24 hours
      await cache.set(cacheKey, result, 86400);

      logger.info('UYAP judge info retrieved', { sicilNo });
      return result;
    } catch (error) {
      logger.error('UYAP get judge info failed', { 
        sicilNo, 
        error: error.message 
      });
      throw error;
    }
  }

  // Create appointment request in UYAP
  async createAppointmentRequest(appointmentData) {
    try {
      const response = await this.client.post('/randevu/olustur', {
        tcKimlikNo: appointmentData.tcKimlikNo,
        mahkemeId: appointmentData.mahkemeId,
        islemTuru: appointmentData.islemTuru,
        tarih: appointmentData.tarih,
        saat: appointmentData.saat,
        notlar: appointmentData.notlar
      });

      logger.info('UYAP appointment request created', { 
        mahkemeId: appointmentData.mahkemeId,
        uyapReferansNo: response.data.referansNo
      });

      return response.data;
    } catch (error) {
      logger.error('UYAP create appointment failed', { 
        error: error.message 
      });
      throw error;
    }
  }

  // Cancel appointment in UYAP
  async cancelAppointmentRequest(uyapReferansNo, iptalNedeni) {
    try {
      const response = await this.client.post('/randevu/iptal', {
        referansNo: uyapReferansNo,
        iptalNedeni
      });

      logger.info('UYAP appointment cancelled', { uyapReferansNo });
      return response.data;
    } catch (error) {
      logger.error('UYAP cancel appointment failed', { 
        uyapReferansNo,
        error: error.message 
      });
      throw error;
    }
  }

  // Get fee information
  async getFeeInfo(islemTuru, mahkemeId) {
    try {
      const cacheKey = `uyap:fee:${islemTuru}:${mahkemeId}`;
      const cached = await cache.get(cacheKey);
      if (cached) {
        return cached;
      }

      const response = await this.client.get('/harc/bilgi', {
        params: {
          islemTuru,
          mahkemeId
        }
      });

      const result = response.data;

      // Cache for 1 day
      await cache.set(cacheKey, result, 86400);

      logger.info('UYAP fee info retrieved', { islemTuru, mahkemeId });
      return result;
    } catch (error) {
      logger.error('UYAP get fee info failed', { 
        islemTuru,
        error: error.message 
      });
      throw error;
    }
  }

  // Verify e-signature
  async verifyESignature(document, signature) {
    try {
      const response = await this.client.post('/eimza/dogrula', {
        belge: document, // Base64 encoded
        imza: signature
      });

      logger.info('UYAP e-signature verified');
      return response.data;
    } catch (error) {
      logger.error('UYAP verify e-signature failed', { 
        error: error.message 
      });
      throw error;
    }
  }

  // Get statistics
  async getStatistics(mahkemeId, startDate, endDate) {
    try {
      const response = await this.client.get('/istatistik/mahkeme', {
        params: {
          mahkemeId,
          baslangicTarihi: startDate,
          bitisTarihi: endDate
        }
      });

      logger.info('UYAP statistics retrieved', { 
        mahkemeId, 
        startDate, 
        endDate 
      });
      
      return response.data;
    } catch (error) {
      logger.error('UYAP get statistics failed', { 
        mahkemeId,
        error: error.message 
      });
      throw error;
    }
  }

  // Health check
  async healthCheck() {
    try {
      const response = await this.client.get('/sistem/durum');
      return {
        status: 'healthy',
        uyapStatus: response.data
      };
    } catch (error) {
      return {
        status: 'unhealthy',
        error: error.message
      };
    }
  }
}

// Export singleton instance
module.exports = new UYAPService();