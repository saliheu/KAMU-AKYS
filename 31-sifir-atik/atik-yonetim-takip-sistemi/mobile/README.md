# Sıfır Atık Mobil Uygulaması

React Native ile geliştirilmiş kapsamlı atık yönetimi mobil uygulaması.

## Özellikler
- ✅ QR kod okuma ile atık girişi
- ✅ Fotoğraf ekleme ve yükleme
- ✅ Offline çalışma desteği (Realm DB)
- ✅ Push bildirimleri
- ✅ Konum bazlı atık noktası bulma
- ✅ Kullanıcı kimlik doğrulama
- ✅ Atık geçmişi takibi
- ✅ Puan sistemi
- ✅ Harita üzerinde toplama noktaları
- ✅ Otomatik veri senkronizasyonu

## Teknolojiler
- React Native 0.73.0
- TypeScript
- React Navigation 6
- React Native Maps
- React Native Camera & QR Scanner
- Realm Database (Offline desteği)
- React Native Offline
- React Hook Form
- Axios
- Push Notifications (Firebase)

## Kurulum

### Ön Gereksinimler
- Node.js >= 18
- React Native CLI
- Xcode (iOS için)
- Android Studio (Android için)
- CocoaPods (iOS için)

### Adımlar

1. Bağımlılıkları yükleyin:
```bash
npm install
```

2. Environment dosyasını oluşturun:
```bash
cp .env.example .env
# .env dosyasını düzenleyin ve API_URL'i ayarlayın
```

3. iOS için:
```bash
cd ios && pod install
cd ..
npm run ios
```

4. Android için:
```bash
npm run android
```

## Proje Yapısı
```
mobile/
├── src/
│   ├── App.tsx                 # Ana uygulama bileşeni
│   ├── contexts/              # Context providers
│   │   ├── AuthContext.tsx    # Kimlik doğrulama
│   │   └── DatabaseContext.tsx # Offline veritabanı
│   ├── navigation/            # Navigasyon yapısı
│   │   ├── RootNavigator.tsx
│   │   ├── AuthNavigator.tsx
│   │   └── MainNavigator.tsx
│   ├── screens/               # Uygulama ekranları
│   │   ├── auth/             # Giriş ekranları
│   │   └── main/             # Ana ekranlar
│   ├── services/              # API servisleri
│   │   ├── api.ts
│   │   ├── authService.ts
│   │   ├── wasteService.ts
│   │   ├── mapService.ts
│   │   └── syncService.ts
│   ├── types/                 # TypeScript tipleri
│   └── utils/                 # Yardımcı fonksiyonlar
├── android/                   # Android native kod
├── ios/                       # iOS native kod
└── package.json
```

## Özellik Detayları

### Offline Desteği
- Realm DB kullanılarak offline veri saklama
- Otomatik senkronizasyon
- Çevrimdışı modda tüm özellikler kullanılabilir

### QR Kod Tarama
- Atık noktası QR kodları
- Konteyner QR kodları
- Otomatik veri doldurma

### Konum Servisleri
- Yakındaki toplama noktalarını gösterme
- Doluluk oranı takibi
- Yol tarifi entegrasyonu

### Güvenlik
- JWT token tabanlı kimlik doğrulama
- Güvenli veri saklama
- API isteklerinde otomatik token yönetimi

## Geliştirme

### Komutlar
```bash
npm start          # Metro bundler başlat
npm run android    # Android uygulamasını çalıştır
npm run ios        # iOS uygulamasını çalıştır
npm test           # Testleri çalıştır
npm run lint       # Kod kalitesi kontrolü
```

### API Entegrasyonu
Uygulama, backend API ile iletişim kurar. Backend'in çalışıyor olması gerekir:
- Default API URL: http://localhost:5000/api
- .env dosyasından yapılandırılabilir

## Lisans
MIT