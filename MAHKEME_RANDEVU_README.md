# Mahkeme Randevu Sistemi - Frontend

T.C. Adalet Bakanl11 Mahkeme Randevu Sistemi'nin modern React tabanl1 frontend uygulamas1d1r.

## =� �zellikler

### = Kimlik Dorulama
- E-Devlet entegrasyonu ile g�venli giri_
- JWT token tabanl1 authentication
- Otomatik token yenileme
- Remember me �zellii

### =� Randevu Y�netimi
- Mahkeme se�imi (il, t�r, mahkeme)
- M�sait tarih ve saat g�r�nt�leme
- 3 ad1ml1 randevu alma s�reci
- Randevu iptal etme ve dei_tirme
- Randevu ge�mi_i ve takibi

### <� Mahkeme Destei
- Hukuk Mahkemesi
- Ceza Mahkemesi
- Ticaret Mahkemesi
- 0_ Mahkemesi
- Aile Mahkemesi
- 0dare Mahkemesi
- Vergi Mahkemesi
- 0cra M�d�rl��
- Tapu M�d�rl��
- Noterlik

### =� Kullan1c1 Deneyimi
- Responsive tasar1m (mobil uyumlu)
- T�rk�e aray�z
- Kolay navigasyon
- Ger�ek zamanl1 bildirimler
- Hata y�netimi

## =� Teknoloji Stack

### Frontend
- **React 18** - Modern UI framework
- **Redux Toolkit** - State management
- **React Router v6** - Client-side routing
- **Axios** - HTTP client
- **Redux Persist** - State persistence

### Styling
- **CSS3** - Custom styling
- **Flexbox/Grid** - Layout
- **CSS Variables** - Theme management
- **Media Queries** - Responsive design

### Development Tools
- **React Scripts** - Build tools
- **ESLint** - Code linting
- **Prettier** - Code formatting

## =� Proje Yap1s1

```
src/
   components/          # Yeniden kullan1labilir bile_enler
      Layout/         # Ana layout bile_enleri
      Auth/           # Kimlik dorulama bile_enleri
      Calendar/       # Takvim bile_enleri
      Forms/          # Form bile_enleri
      UI/             # Genel UI bile_enleri
   pages/              # Sayfa bile_enleri
      Auth/           # Giri_ sayfalar1
      Dashboard/      # Ana sayfa
      Appointments/   # Randevu sayfalar1
   store/              # Redux store
      slices/         # Redux slices
      store.js        # Store konfig�rasyonu
   services/           # API servisleri
      api.js          # Axios konfig�rasyonu
      authService.js  # Kimlik dorulama servisi
      appointmentService.js # Randevu servisi
   utils/              # Yard1mc1 fonksiyonlar
      constants.js    # Sabitler
      formatters.js   # Formatters
   App.js              # Ana uygulama
   index.js            # Giri_ noktas1
   index.css           # Global styles
```

## =� Kurulum

### Gereksinimler
- Node.js >= 16.0.0
- npm >= 8.0.0

### Kurulum Ad1mlar1

1. **Projeyi klonlay1n**
```bash
git clone <repository-url>
cd mahkeme-randevu-sistemi
```

2. **Ba1ml1l1klar1 y�kleyin**
```bash
npm install
```

3. **Ortam dei_kenlerini ayarlay1n**
```bash
# .env dosyas1 olu_turun
REACT_APP_API_BASE_URL=http://localhost:3001/api
REACT_APP_ENVIRONMENT=development
```

4. **Uygulamay1 ba_lat1n**
```bash
npm start
```

Uygulama `http://localhost:3000` adresinde �al1_acakt1r.

## =' Available Scripts

```bash
# Geli_tirme sunucusunu ba_lat
npm start

# Prod�ksiyon build'i olu_tur
npm run build

# Testleri �al1_t1r
npm test

# Code linting
npm run lint

# Code formatting
npm run format

# Bundle analizi
npm run analyze
```

## =� 0leti_im

- **E-mail:** destek@mahkeme.gov.tr
- **Telefon:** 444 1 XXX
- **Destek Saatleri:** Pazartesi - Cuma 09:00 - 17:00

## =� Olu_turulan Dosyalar

Bu projede a_a1daki dosyalar olu_turulmu_tur:

### Bile_enler (Components)
- `/src/components/Layout/Layout.js` - Ana layout bile_eni
- `/src/components/Layout/Layout.css` - Layout stilleri
- `/src/components/Auth/ProtectedRoute.js` - Route koruma bile_eni
- `/src/components/Calendar/AppointmentCalendar.js` - Randevu takvimi
- `/src/components/Calendar/AppointmentCalendar.css` - Takvim stilleri
- `/src/components/Forms/AppointmentForm.js` - Randevu formu
- `/src/components/Forms/AppointmentForm.css` - Form stilleri
- `/src/components/UI/LoadingSpinner.js` - Y�kleme animasyonu
- `/src/components/UI/LoadingSpinner.css` - Spinner stilleri

### Sayfalar (Pages)
- `/src/pages/Auth/LoginPage.js` - Giri_ sayfas1
- `/src/pages/Auth/LoginPage.css` - Giri_ sayfas1 stilleri
- `/src/pages/Dashboard/DashboardPage.js` - Ana sayfa
- `/src/pages/Dashboard/DashboardPage.css` - Ana sayfa stilleri
- `/src/pages/Appointments/AppointmentBooking.js` - Randevu alma sayfas1
- `/src/pages/Appointments/AppointmentBooking.css` - Randevu alma stilleri
- `/src/pages/Appointments/MyAppointments.js` - Randevular1m sayfas1
- `/src/pages/Appointments/MyAppointments.css` - Randevular1m stilleri

### Store (Redux)
- `/src/store/store.js` - Redux store konfig�rasyonu
- `/src/store/slices/authSlice.js` - Kimlik dorulama state
- `/src/store/slices/appointmentSlice.js` - Randevu state

### Servisler (Services)
- `/src/services/api.js` - Axios API konfig�rasyonu
- `/src/services/authService.js` - Kimlik dorulama servisleri
- `/src/services/appointmentService.js` - Randevu servisleri

### Yard1mc1lar (Utils)
- `/src/utils/constants.js` - Uygulama sabitleri
- `/src/utils/formatters.js` - Tarih/saat formatters

### Ana Dosyalar
- `/src/App.js` - Ana uygulama bile_eni
- `/src/App.css` - Ana uygulama stilleri
- `/src/index.js` - Giri_ noktas1
- `/src/index.css` - Global stiller
- `/package.json` - Proje ba1ml1l1klar1