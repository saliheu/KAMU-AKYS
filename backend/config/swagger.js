const swaggerJsdoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Mahkeme Randevu Sistemi API',
      version: '1.0.0',
      description: 'T.C. Adalet Bakanlığı Mahkeme Randevu Sistemi API Dokümantasyonu',
      contact: {
        name: 'API Destek',
        email: 'destek@adalet.gov.tr'
      },
      license: {
        name: 'Resmi Kullanım',
        url: 'https://www.adalet.gov.tr/kullanim-kosullari'
      }
    },
    servers: [
      {
        url: process.env.API_URL || 'http://localhost:3000',
        description: 'Development server'
      },
      {
        url: 'https://api.mahkemerandevu.adalet.gov.tr',
        description: 'Production server'
      }
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
          description: 'JWT token ile yetkilendirme'
        },
        eDevletAuth: {
          type: 'oauth2',
          flows: {
            authorizationCode: {
              authorizationUrl: 'https://giris.turkiye.gov.tr/oauth/authorize',
              tokenUrl: 'https://giris.turkiye.gov.tr/oauth/token',
              scopes: {
                'kimlik': 'Kimlik bilgilerine erişim',
                'iletisim': 'İletişim bilgilerine erişim'
              }
            }
          }
        }
      },
      schemas: {
        Error: {
          type: 'object',
          properties: {
            error: {
              type: 'string',
              description: 'Hata mesajı'
            },
            code: {
              type: 'string',
              description: 'Hata kodu'
            },
            details: {
              type: 'object',
              description: 'Detaylı hata bilgileri'
            }
          }
        },
        User: {
          type: 'object',
          properties: {
            id: {
              type: 'string',
              format: 'uuid',
              description: 'Kullanıcı ID'
            },
            tcKimlikNo: {
              type: 'string',
              pattern: '^[0-9]{11}$',
              description: 'TC Kimlik Numarası'
            },
            ad: {
              type: 'string',
              description: 'Ad'
            },
            soyad: {
              type: 'string',
              description: 'Soyad'
            },
            email: {
              type: 'string',
              format: 'email',
              description: 'E-posta adresi'
            },
            telefon: {
              type: 'string',
              pattern: '^[0-9]{10}$',
              description: 'Telefon numarası (5XX XXX XX XX)'
            },
            rol: {
              type: 'string',
              enum: ['vatandas', 'avukat', 'hakim', 'personel', 'admin'],
              description: 'Kullanıcı rolü'
            },
            aktif: {
              type: 'boolean',
              description: 'Hesap aktif durumu'
            },
            olusturmaTarihi: {
              type: 'string',
              format: 'date-time',
              description: 'Hesap oluşturma tarihi'
            }
          }
        },
        Court: {
          type: 'object',
          properties: {
            id: {
              type: 'string',
              format: 'uuid'
            },
            ad: {
              type: 'string',
              description: 'Mahkeme adı'
            },
            tur: {
              type: 'string',
              enum: ['asliye_hukuk', 'asliye_ceza', 'agir_ceza', 'sulh_hukuk', 'sulh_ceza', 'icra', 'aile', 'is', 'ticaret', 'fikri_mulkiyet', 'tuketici'],
              description: 'Mahkeme türü'
            },
            adres: {
              type: 'object',
              properties: {
                il: { type: 'string' },
                ilce: { type: 'string' },
                mahalle: { type: 'string' },
                cadde: { type: 'string' },
                bina_no: { type: 'string' },
                posta_kodu: { type: 'string' }
              }
            },
            telefon: {
              type: 'string'
            },
            email: {
              type: 'string',
              format: 'email'
            },
            koordinat: {
              type: 'object',
              properties: {
                lat: { type: 'number' },
                lng: { type: 'number' }
              }
            },
            calismaSaatleri: {
              type: 'object',
              properties: {
                hafta_ici: {
                  type: 'object',
                  properties: {
                    baslangic: { type: 'string', pattern: '^[0-9]{2}:[0-9]{2}$' },
                    bitis: { type: 'string', pattern: '^[0-9]{2}:[0-9]{2}$' }
                  }
                },
                cumartesi: {
                  type: 'object',
                  properties: {
                    baslangic: { type: 'string', pattern: '^[0-9]{2}:[0-9]{2}$' },
                    bitis: { type: 'string', pattern: '^[0-9]{2}:[0-9]{2}$' }
                  }
                }
              }
            }
          }
        },
        Appointment: {
          type: 'object',
          properties: {
            id: {
              type: 'string',
              format: 'uuid'
            },
            kullaniciId: {
              type: 'string',
              format: 'uuid'
            },
            mahkemeId: {
              type: 'string',
              format: 'uuid'
            },
            hakimId: {
              type: 'string',
              format: 'uuid'
            },
            randevuTarihi: {
              type: 'string',
              format: 'date'
            },
            randevuSaati: {
              type: 'string',
              pattern: '^[0-9]{2}:[0-9]{2}$'
            },
            islemTuru: {
              type: 'string',
              enum: ['dava_acma', 'durusma', 'evrak_teslimi', 'bilgi_alma', 'harç_odeme', 'diger'],
              description: 'İşlem türü'
            },
            durum: {
              type: 'string',
              enum: ['beklemede', 'onaylandi', 'iptal', 'tamamlandi'],
              description: 'Randevu durumu'
            },
            notlar: {
              type: 'string',
              description: 'Randevu notları'
            },
            olusturmaTarihi: {
              type: 'string',
              format: 'date-time'
            },
            guncellemeTarihi: {
              type: 'string',
              format: 'date-time'
            }
          }
        },
        LoginRequest: {
          type: 'object',
          required: ['tcKimlikNo', 'password'],
          properties: {
            tcKimlikNo: {
              type: 'string',
              pattern: '^[0-9]{11}$',
              description: 'TC Kimlik Numarası'
            },
            password: {
              type: 'string',
              minLength: 6,
              description: 'Şifre'
            }
          }
        },
        LoginResponse: {
          type: 'object',
          properties: {
            token: {
              type: 'string',
              description: 'JWT access token'
            },
            refreshToken: {
              type: 'string',
              description: 'Refresh token'
            },
            user: {
              $ref: '#/components/schemas/User'
            }
          }
        }
      },
      responses: {
        UnauthorizedError: {
          description: 'Yetkilendirme hatası',
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/Error'
              }
            }
          }
        },
        ValidationError: {
          description: 'Doğrulama hatası',
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/Error'
              }
            }
          }
        },
        NotFoundError: {
          description: 'Kayıt bulunamadı',
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/Error'
              }
            }
          }
        }
      }
    },
    tags: [
      {
        name: 'Auth',
        description: 'Kimlik doğrulama işlemleri'
      },
      {
        name: 'Appointments',
        description: 'Randevu yönetimi'
      },
      {
        name: 'Courts',
        description: 'Mahkeme bilgileri'
      },
      {
        name: 'Users',
        description: 'Kullanıcı yönetimi'
      },
      {
        name: 'Calendar',
        description: 'Takvim işlemleri'
      }
    ]
  },
  apis: ['./routes/*.js'], // API routes dosyaları
};

const swaggerSpec = swaggerJsdoc(options);

module.exports = {
  swaggerUi,
  swaggerSpec
};