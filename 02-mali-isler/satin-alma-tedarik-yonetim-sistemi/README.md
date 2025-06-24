<<<<<<< HEAD
# Satın Alma ve Tedarik Yönetim Sistemi

Bu modül **mali işler** kategorisi altında kamu kurumları için geliştirilmiş açık kaynak **satın alma tedarik yönetim sistemi** projesidir.

## 🚀 Proje Özellikleri

### Temel Özellikler
- ✅ Satın alma talep yönetimi
- ✅ Tedarikçi kayıt ve yönetimi
- ✅ İhale süreç yönetimi
- ✅ Teklif toplama ve değerlendirme
- ✅ Sözleşme yönetimi
- ✅ Sipariş takibi
- ✅ Raporlama ve analitik
- ✅ Kullanıcı yetkilendirme sistemi

### Teknik Özellikler
- RESTful API mimarisi
- JWT tabanlı kimlik doğrulama
- Role-based access control (RBAC)
- Gerçek zamanlı bildirimler
- Responsive tasarım
- Docker desteği

## 🛠️ Teknoloji Yığını

### Backend
- **Node.js** (v18+)
- **Express.js** - Web framework
- **PostgreSQL** - Veritabanı
- **Sequelize** - ORM
- **Redis** - Cache ve session yönetimi
- **JWT** - Kimlik doğrulama
- **Bcrypt** - Şifre hashleme

### Frontend
- **React** (v18+)
- **React Router** - Routing
- **React Query** - Server state yönetimi
- **React Hook Form** - Form yönetimi
- **Tailwind CSS** - Styling
- **Recharts** - Grafikler
- **Lucide React** - İkonlar

### DevOps
- **Docker** & **Docker Compose**
- **Nginx** - Reverse proxy
- **GitHub Actions** - CI/CD

## 📋 Gereksinimler

- Docker ve Docker Compose
- Node.js 18+ (lokal geliştirme için)
- PostgreSQL 15+ (lokal geliştirme için)
- Redis (lokal geliştirme için)

## 🚀 Hızlı Başlangıç

### Docker ile Kurulum (Önerilen)

1. Repoyu klonlayın:
```bash
git clone https://github.com/kullaniciadi/satin-alma-tedarik-yonetim-sistemi.git
cd satin-alma-tedarik-yonetim-sistemi
```

2. Docker Compose ile servisleri başlatın:
```bash
docker-compose up -d
```

3. Tarayıcınızda açın:
- Frontend: http://localhost:3000
- Backend API: http://localhost:8000

### Test Hesabı
- E-posta: admin@kamu.gov.tr
- Şifre: Admin123!

## 📁 Proje Yapısı

```
satin-alma-tedarik-yonetim-sistemi/
├── backend/
│   ├── src/
│   │   ├── config/         # Yapılandırma dosyaları
│   │   ├── controllers/    # İş mantığı
│   │   ├── models/         # Veritabanı modelleri
│   │   ├── routes/         # API rotaları
│   │   ├── middleware/     # Express middleware
│   │   ├── services/       # Servis katmanı
│   │   └── utils/          # Yardımcı fonksiyonlar
│   ├── Dockerfile
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── components/     # React bileşenleri
│   │   ├── pages/          # Sayfa bileşenleri
│   │   ├── services/       # API servisleri
│   │   ├── hooks/          # Custom React hooks
│   │   └── contexts/       # React context
│   ├── Dockerfile
│   └── package.json
├── database/
│   └── init.sql           # Veritabanı başlangıç scripti
└── docker-compose.yml
```

## 🔧 API Endpoints

### Kimlik Doğrulama
- `POST /api/auth/login` - Giriş yap
- `POST /api/auth/register` - Kayıt ol
- `POST /api/auth/logout` - Çıkış yap

### Satın Alma Talepleri
- `GET /api/purchase-requests` - Talepleri listele
- `POST /api/purchase-requests` - Yeni talep oluştur
- `PUT /api/purchase-requests/:id` - Talep güncelle
- `DELETE /api/purchase-requests/:id` - Talep sil

### Tedarikçiler
- `GET /api/suppliers` - Tedarikçileri listele
- `POST /api/suppliers` - Yeni tedarikçi ekle
- `PUT /api/suppliers/:id` - Tedarikçi güncelle

### İhaleler
- `GET /api/tenders` - İhaleleri listele
- `POST /api/tenders` - Yeni ihale oluştur
- `PUT /api/tenders/:id` - İhale güncelle

## 🔐 Kullanıcı Rolleri

1. **Admin** - Tam yetki
2. **Satın Alma Müdürü** - Onaylama ve yönetim yetkisi
3. **Satın Alma Uzmanı** - İhale ve sipariş yönetimi
4. **Muhasebe** - Mali işlemler ve raporlama
5. **Kullanıcı** - Talep oluşturma ve görüntüleme

## 📊 Veritabanı Şeması

Sistem aşağıdaki ana tablolardan oluşur:
- **Users** - Kullanıcı bilgileri
- **Suppliers** - Tedarikçi bilgileri
- **PurchaseRequests** - Satın alma talepleri
- **Tenders** - İhale bilgileri
- **Bids** - Teklifler
- **Contracts** - Sözleşmeler
- **PurchaseOrders** - Satın alma siparişleri
- **OrderItems** - Sipariş kalemleri

## 🧪 Test

```bash
# Backend testleri
cd backend
npm test

# Frontend testleri
cd frontend
npm test
```

## 📈 Performans

- Redis cache ile hızlı veri erişimi
- Sayfalama ve lazy loading
- Optimize edilmiş SQL sorguları
- Gzip compression
- Rate limiting

## 🔒 Güvenlik

- JWT token tabanlı kimlik doğrulama
- Bcrypt ile şifre hashleme
- CORS koruması
- SQL injection koruması
- XSS koruması
- Rate limiting
- Input validation

## 🤝 Katkıda Bulunma

Projeye katkıda bulunmak için:

1. Fork edin
2. Feature branch oluşturun (`git checkout -b feature/yeni-ozellik`)
3. Değişikliklerinizi commit edin (`git commit -am 'Yeni özellik eklendi'`)
4. Branch'e push edin (`git push origin feature/yeni-ozellik`)
5. Pull Request açın

## 📝 Lisans

Bu proje MIT lisansı altında yayınlanmıştır. Detaylar için [LICENSE](LICENSE) dosyasına bakınız.

## 📞 İletişim

Proje hakkında sorularınız için issue açabilir veya proje ekibiyle iletişime geçebilirsiniz.

## 🙏 Teşekkürler

Bu proje, Türkiye'deki kamu kurumlarının dijital dönüşümüne katkı sağlamak amacıyla geliştirilmiştir.
=======
# Türkiye Cumhuriyeti Kamu Kurumları Açık Kaynak Yazılım Seti

🇹🇷 Türkiye kamu kurumlarının dijital dönüşümü için açık kaynak yazılım çözümleri

Bu repo, kamu kurumlarının ortak yazılım ihtiyaçlarını karşılamak üzere geliştirilecek açık kaynak yazılım projelerinin iskelet yapısını içermektedir.

📋 **Toplam: 30 Ana Kategori, 150+ Proje**

📖 Detaylı bilgi için [GENEL_PROJE_DOKUMANI.md](GENEL_PROJE_DOKUMANI.md) dosyasına bakınız.

## Misyonumuz
Kamu kurumlarının ortak ihtiyaçlarını karşılayan, güvenli, ölçeklenebilir ve sürdürülebilir açık kaynak yazılım çözümleri geliştirmek.

## Değerlerimiz
- 🔒 Güvenlik ve Gizlilik
- 🌐 Açıklık ve Şeffaflık  
- 🤝 İşbirliği ve Topluluk
- 🚀 İnovasyon ve Kalite
- 🇹🇷 Ulusal Teknoloji Egemenliği

## Proje Kategorileri

### 1. İnsan Kaynakları Yönetimi Sistemleri
- İzin Yönetim Sistemi
- Personel Bilgi Yönetim Sistemi  
- Vardiya ve Mesai Yönetim Sistemi
- Eğitim Yönetim Sistemi

### 2. Mali İşler ve Muhasebe Yazılımları
- Bütçe Yönetim Sistemi
- Muhasebe ve Mali Raporlama Sistemi
- Satın Alma ve Tedarik Yönetim Sistemi
- Bordro ve Maaş Yönetim Sistemi

### 3. Envanter ve Demirbaş Yönetimi
- Demirbaş Takip Sistemi
- Stok Yönetim Sistemi
- Araç Filo Yönetim Sistemi

### 4. Belge Yönetim Sistemleri
- Elektronik Belge Yönetim Sistemi (EBYS)
- Evrak Takip Sistemi
- İmza Sirküleri Sistemi

### 5. İletişim ve Koordinasyon Araçları
- İç İletişim Platformu
- Toplantı Yönetim Sistemi
- Proje Yönetim Sistemi

### 6. Vatandaş Hizmetleri
- Randevu Yönetim Sistemi
- Dilekçe ve Şikayet Yönetim Sistemi
- Bilgi Edinme Sistemi

### 7. Operasyonel Yazılımlar
- Çay Ocağı Yönetim Sistemi
- Güvenlik Yönetim Sistemi
- Temizlik ve Bakım Yönetim Sistemi
- Yemekhane Yönetim Sistemi
- Kütüphane Yönetim Sistemi

### 8. Raporlama ve Analitik Araçları
- İş Zekası ve Raporlama Sistemi
- Performans Yönetim Sistemi

### 9. Teknik Altyapı Yazılımları
- Sistem İzleme ve Yönetim Sistemi
- Yedekleme ve Arşivleme Sistemi
- Kullanıcı ve Yetki Yönetim Sistemi

### 10. Bulut ve Veri Yönetimi Sistemleri
- Bulut Depolama Sistemi
- Dosya Paylaşım Platformu
- Yedekleme ve Senkronizasyon Sistemi
- Veri Gölü Platformu
- Büyük Veri Analitik Sistemi
- Nesne Depolama Sistemi
- Bulut Hesaplama Platformu
- Konteyner Orkestrasyon Sistemi

### 11. Sağlık ve Pandemi Yönetimi
- Salgın Takip ve Erken Uyarı Sistemi
- Aşı Takip ve Randevu Sistemi
- Temaslı Takip Sistemi
- Sağlık Veri Analitik Platformu
- Hastane Doluluk İzleme Sistemi

### 12. Akıllı Şehir Sistemleri
- Trafik Yoğunluk İzleme Sistemi
- Otopark Yönetim Sistemi
- Çevre Kirliliği İzleme Platformu
- Enerji Tüketimi İzleme Sistemi
- Akıllı Aydınlatma Kontrol Sistemi

### 13. E-Öğrenme ve Eğitim
- Uzaktan Eğitim Platformu
- Sınav Yönetim Sistemi
- Öğrenci Takip Sistemi
- Dijital Kütüphane Platformu
- İnteraktif Eğitim İçerik Yönetimi

### 14. Hukuk ve Adalet Sistemleri
- Dava Takip Sistemi
- Elektronik Tebligat Sistemi
- Hukuki Doküman Yönetimi
- Mahkeme Randevu Sistemi
- İcra Takip Platformu

### 15. Afet ve Acil Durum Yönetimi
- Afet Koordinasyon Merkezi
- Acil Durum Haberleşme Sistemi
- Kayıp Kişi Takip Sistemi
- Yardım Dağıtım Koordinasyon Platformu
- Risk Haritalama Sistemi

### 16. Tarım ve Hayvancılık
- Çiftçi Kayıt Sistemi
- Ürün Takip ve İzlenebilirlik Sistemi
- Hayvan Kimlik Sistemi
- Zirai İlaç Takip Sistemi
- Hava Durumu ve Erken Uyarı Sistemi

### 17. Çevre ve Doğa Koruma
- Atık Yönetim Sistemi
- Su Kalitesi İzleme Platformu
- Hava Kalitesi İzleme Sistemi
- Geri Dönüşüm Takip Sistemi
- Karbon Ayak İzi Hesaplama

### 18. Ulaştırma ve Lojistik
- Toplu Taşıma Yönetim Sistemi
- Araç Takip ve Rota Optimizasyonu
- Yük Taşımacılığı Koordinasyon Platformu
- Denizcilik İşlemleri Yönetimi
- Havalimanı Operasyon Sistemi

### 19. Enerji Yönetimi
- Elektrik Tüketim İzleme Sistemi
- Yenilenebilir Enerji Takip Platformu
- Enerji Verimliliği Analiz Sistemi
- Akıllı Sayaç Yönetimi
- Enerji Dağıtım Optimizasyonu

### 20. Sosyal Hizmetler
- Sosyal Yardım Takip Sistemi
- Engelli Vatandaş Hizmetleri Platformu
- Yaşlı Bakım Takip Sistemi
- Çocuk Koruma Sistemi
- Aile Danışmanlığı Yönetimi

### 21. Kültür ve Turizm
- Müze ve Ören Yeri Yönetimi
- Kültürel Etkinlik Takvimi
- Turist Bilgilendirme Sistemi
- Sanal Müze Platformu
- Kültürel Miras Envanter Sistemi

### 22. Spor ve Gençlik
- Spor Tesisi Rezervasyon Sistemi
- Sporcu Lisans ve Takip Sistemi
- Gençlik Kampı Yönetimi
- Spor Müsabaka Organizasyon Platformu
- Antrenör Eğitim Takip Sistemi

### 23. İstatistik ve Veri Toplama
- Anket ve Form Yönetim Sistemi
- Nüfus Sayım Platformu
- İstatistiki Veri Görselleştirme
- Veri Toplama Mobil Uygulaması
- Açık Veri Portalı

### 24. Gümrük ve Ticaret
- Gümrük İşlemleri Otomasyonu
- İhracat/İthalat Takip Sistemi
- Ticaret Sicili Yönetimi
- E-Fatura Entegrasyon Platformu
- Dış Ticaret İstatistik Sistemi

### 25. Belediye Hizmetleri
- Mezarlık Bilgi Sistemi
- Nikah Salonu Rezervasyon Sistemi
- İmar Durumu Sorgulama
- Zabıta Yönetim Sistemi
- Kent Konseyi Platformu

### 26. Vergi ve Gelir Yönetimi
- Vergi Beyan Sistemi
- Tahsilat Takip Platformu
- Vergi Borcu Yapılandırma
- E-Haciz Sistemi
- Gelir Analiz ve Tahmin Sistemi

### 27. İstihdam ve İş Gücü
- İş Arayan-İşveren Eşleştirme Platformu
- Mesleki Yeterlilik Takip Sistemi
- İşsizlik Sigortası Yönetimi
- Staj ve İşbaşı Eğitim Takibi
- İş Sağlığı ve Güvenliği Yönetimi

### 28. Ar-Ge ve İnovasyon
- Proje Başvuru ve Takip Sistemi
- Patent ve Fikri Mülkiyet Yönetimi
- Ar-Ge Laboratuvar Yönetimi
- İnovasyon Fikir Havuzu
- Teknoloji Transfer Ofisi Platformu

### 29. Medya ve İletişim
- Basın Bülteni Dağıtım Sistemi
- Sosyal Medya Yönetim Platformu
- Kurumsal TV/Radyo Yayın Sistemi
- Dijital Arşiv Yönetimi
- Halkla İlişkiler Takip Sistemi

### 30. Özel Güvenlik ve İstihbarat
- Olay Yönetim ve Raporlama Sistemi
- Kriz Masası Koordinasyon Platformu
- Güvenlik Kamera Analitik Sistemi
- Siber Tehdit İstihbarat Platformu
- Kritik Altyapı İzleme Sistemi
>>>>>>> fbe91c75f5140b6e9958ed0e079971848227ffcf
