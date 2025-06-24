# İhracat İthalat Takip Sistemi

Gümrük ve ticaret işlemleri için kapsamlı ihracat/ithalat takip ve yönetim sistemi.

## Özellikler

- ✅ Gümrük beyannamesi yönetimi
- ✅ GTİP kodu sorgulama ve doğrulama
- ✅ Kargo ve lojistik takibi
- ✅ Gümrük vergisi hesaplama
- ✅ E-fatura entegrasyonu
- ✅ Döviz kuru takibi ve dönüşüm
- ✅ Ticaret istatistikleri ve raporlama
- ✅ Firma ve ürün yönetimi
- ✅ Belge yönetimi (fatura, konşimento, vb.)
- ✅ TCGB ve GTB entegrasyonu

## Teknolojiler

### Backend
- Node.js + Express.js
- PostgreSQL
- Redis
- SOAP/XML (gümrük servisleri)
- Bull Queue
- Socket.io

### Frontend
- React + TypeScript
- Redux Toolkit
- Material-UI
- React Query
- ApexCharts

### Entegrasyonlar
- Gümrük API'leri
- TCMB Döviz Kurları
- E-fatura Servisleri
- Kargo Takip API'leri

## Kurulum

```bash
# Backend
cd backend
npm install
cp .env.example .env
npm run dev

# Frontend
cd frontend
npm install
npm run dev
```

## API Endpoints

- `POST /api/declarations` - Beyanname oluşturma
- `GET /api/gtip/:code` - GTİP kodu sorgulama
- `POST /api/customs/calculate` - Vergi hesaplama
- `GET /api/shipments/:trackingNo` - Kargo takibi
- `GET /api/exchange-rates` - Döviz kurları
- `GET /api/reports/trade-balance` - Ticaret dengesi raporu

## Varsayılan Kullanıcı
- Email: admin@gumruk.gov.tr
- Şifre: Admin123!

## Lisans
MIT