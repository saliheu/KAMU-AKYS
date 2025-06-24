-- Sıfır Atık Yönetim Sistemi - Veritabanı Başlangıç Script'i

-- Extension'ları etkinleştir
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "postgis"; -- Konum bazlı özellikler için

-- Enum type'ları oluştur
CREATE TYPE user_role AS ENUM ('admin', 'yonetici', 'sorumlu', 'personel');
CREATE TYPE institution_type AS ENUM ('bakanlık', 'belediye', 'üniversite', 'hastane', 'okul', 'diğer');
CREATE TYPE waste_type AS ENUM ('organik', 'kağıt', 'plastik', 'cam', 'metal', 'elektronik', 'tehlikeli', 'pil', 'yağ', 'tıbbi', 'diğer');
CREATE TYPE waste_unit AS ENUM ('kg', 'litre', 'adet');
CREATE TYPE entry_type AS ENUM ('manual', 'qr', 'sensor', 'bulk');
CREATE TYPE container_status AS ENUM ('aktif', 'dolu', 'bakımda', 'arızalı', 'pasif');
CREATE TYPE collection_status AS ENUM ('planlandı', 'toplandı', 'teslim_edildi', 'iptal');
CREATE TYPE destination_type AS ENUM ('geri_dönüşüm', 'bertaraf', 'enerji_geri_kazanım', 'depolama');
CREATE TYPE report_type AS ENUM ('günlük', 'haftalık', 'aylık', 'yıllık', 'özel', 'bakanlık', 'belediye');
CREATE TYPE report_status AS ENUM ('taslak', 'onay_bekliyor', 'onaylandı', 'gönderildi');

-- Index'ler için fonksiyon
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Varsayılan kurum verisi
INSERT INTO "Institutions" (
    id,
    name,
    type,
    "taxNumber",
    address,
    city,
    district,
    phone,
    email,
    "responsiblePerson",
    "isActive",
    settings,
    "createdAt",
    "updatedAt"
) VALUES (
    uuid_generate_v4(),
    'Çevre ve Şehircilik Bakanlığı',
    'bakanlık',
    '12345678901',
    'Mustafa Kemal Mahallesi Eskişehir Devlet Yolu 9. Km',
    'Ankara',
    'Çankaya',
    '03124101000',
    'bilgi@csb.gov.tr',
    'Sistem Yöneticisi',
    true,
    '{"wasteCategories": ["organik", "kağıt", "plastik", "cam", "metal", "elektronik", "tehlikeli", "diğer"]}',
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
) ON CONFLICT DO NOTHING;

-- Varsayılan admin kullanıcısı (Şifre: Admin123!)
INSERT INTO "Users" (
    id,
    "sicilNo",
    email,
    password,
    "firstName",
    "lastName",
    phone,
    "institutionId",
    department,
    role,
    "isActive",
    preferences,
    "createdAt",
    "updatedAt"
) VALUES (
    uuid_generate_v4(),
    'ADM001',
    'admin@sifiratik.gov.tr',
    '$2a$10$YGqDn7h1kYV7TfM2JKrQBuEilLqzqT7pAIcZeF5VpCBm8INzFJGgG',
    'Sistem',
    'Yöneticisi',
    '05551234567',
    (SELECT id FROM "Institutions" WHERE email = 'bilgi@csb.gov.tr' LIMIT 1),
    'Bilgi İşlem',
    'admin',
    true,
    '{"notifications": {"email": true, "sms": false, "push": true}}',
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
) ON CONFLICT DO NOTHING;

-- Örnek geri dönüşüm firması
INSERT INTO "RecyclingCompanies" (
    id,
    "companyName",
    "taxNumber",
    "licenseNumber",
    "licenseExpiry",
    "authorizedWasteTypes",
    address,
    city,
    district,
    phone,
    email,
    "contactPerson",
    capacity,
    rating,
    "isActive",
    "createdAt",
    "updatedAt"
) VALUES (
    uuid_generate_v4(),
    'Yeşil Geri Dönüşüm A.Ş.',
    '98765432109',
    'GD-2024-001',
    '2025-12-31',
    '["kağıt", "plastik", "cam", "metal"]',
    'Organize Sanayi Bölgesi 1. Cadde No:10',
    'İstanbul',
    'Tuzla',
    '02164441234',
    'info@yesilgeridonusum.com',
    'Ahmet Yılmaz',
    '{"kağıt": 50, "plastik": 30, "cam": 20, "metal": 25}',
    4.5,
    true,
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
) ON CONFLICT DO NOTHING;

-- Performans için index'ler
CREATE INDEX IF NOT EXISTS idx_users_email ON "Users"(email);
CREATE INDEX IF NOT EXISTS idx_users_sicilno ON "Users"("sicilNo");
CREATE INDEX IF NOT EXISTS idx_institutions_taxnumber ON "Institutions"("taxNumber");
CREATE INDEX IF NOT EXISTS idx_waste_entries_institution ON "WasteEntries"("institutionId");
CREATE INDEX IF NOT EXISTS idx_waste_entries_date ON "WasteEntries"("createdAt");
CREATE INDEX IF NOT EXISTS idx_waste_entries_type ON "WasteEntries"("wasteType");
CREATE INDEX IF NOT EXISTS idx_waste_collections_date ON "WasteCollections"("collectionDate");
CREATE INDEX IF NOT EXISTS idx_reports_period ON "Reports"((data->>'startDate'), (data->>'endDate'));

-- Spatial index for location-based queries
CREATE INDEX IF NOT EXISTS idx_waste_points_location ON "WastePoints" USING GIST (coordinates);

-- Trigger'ları oluştur
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON "Users"
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_institutions_updated_at BEFORE UPDATE ON "Institutions"
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_waste_entries_updated_at BEFORE UPDATE ON "WasteEntries"
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_waste_collections_updated_at BEFORE UPDATE ON "WasteCollections"
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_reports_updated_at BEFORE UPDATE ON "Reports"
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();