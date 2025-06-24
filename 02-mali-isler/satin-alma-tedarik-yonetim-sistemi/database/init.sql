-- Satın Alma ve Tedarik Yönetim Sistemi - Veritabanı Başlangıç Script'i

-- Extension'ları etkinleştir
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Enum type'ları oluştur
CREATE TYPE user_role AS ENUM ('admin', 'satinalma_muduru', 'satinalma_uzmani', 'muhasebe', 'kullanici');
CREATE TYPE supplier_category AS ENUM ('malzeme', 'hizmet', 'yapim');
CREATE TYPE request_type AS ENUM ('mal_alimi', 'hizmet_alimi', 'yapim_isi');
CREATE TYPE urgency_level AS ENUM ('normal', 'acil', 'cok_acil');
CREATE TYPE currency_type AS ENUM ('TRY', 'USD', 'EUR');
CREATE TYPE request_status AS ENUM ('taslak', 'onay_bekliyor', 'onaylandi', 'reddedildi', 'ihale_asamasinda', 'tamamlandi', 'iptal');
CREATE TYPE tender_method AS ENUM ('acik_ihale', 'kapali_zarf', 'pazarlik_usulu', 'dogrudan_temin');
CREATE TYPE tender_status AS ENUM ('hazirlaniyor', 'ilan_edildi', 'teklif_toplama', 'degerlendirme', 'sonuclandi', 'iptal');
CREATE TYPE bid_status AS ENUM ('teslim_edildi', 'degerlendiriliyor', 'kabul', 'red', 'geri_cekildi');
CREATE TYPE payment_method AS ENUM ('pesin', 'vadeli', 'kismi');
CREATE TYPE contract_status AS ENUM ('taslak', 'imza_bekliyor', 'aktif', 'askida', 'tamamlandi', 'feshedildi');
CREATE TYPE order_status AS ENUM ('beklemede', 'onaylandi', 'kismen_teslim', 'teslim_alindi', 'iptal');

-- Index'ler için fonksiyon
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Varsayılan admin kullanıcısı için şifre hash'i oluştur
-- Şifre: Admin123! (bcrypt hash)
INSERT INTO "Users" (
    id,
    "sicilNo",
    email,
    password,
    "firstName",
    "lastName",
    department,
    role,
    "isActive",
    "createdAt",
    "updatedAt"
) VALUES (
    uuid_generate_v4(),
    'ADM001',
    'admin@kamu.gov.tr',
    '$2a$10$YGqDn7h1kYV7TfM2JKrQBuEilLqzqT7pAIcZeF5VpCBm8INzFJGgG',
    'Sistem',
    'Yöneticisi',
    'Bilgi İşlem',
    'admin',
    true,
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
) ON CONFLICT DO NOTHING;

-- Örnek tedarikçiler
INSERT INTO "Suppliers" (
    id,
    "companyName",
    "taxNumber",
    "taxOffice",
    address,
    city,
    district,
    phone,
    email,
    "contactPerson",
    "contactPhone",
    category,
    "isActive",
    rating,
    documents,
    "createdAt",
    "updatedAt"
) VALUES 
(
    uuid_generate_v4(),
    'ABC Teknoloji A.Ş.',
    '12345678901',
    'Büyük Mükellefler',
    'Teknokent Mah. İnovasyon Cad. No:1',
    'İstanbul',
    'Sarıyer',
    '02123456789',
    'info@abcteknoloji.com',
    'Ahmet Yılmaz',
    '05321234567',
    'malzeme',
    true,
    4.5,
    '[]',
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
),
(
    uuid_generate_v4(),
    'XYZ Hizmetleri Ltd. Şti.',
    '98765432109',
    'Kadıköy',
    'İş Merkezi Mah. Ticaret Sok. No:25',
    'İstanbul',
    'Kadıköy',
    '02169876543',
    'bilgi@xyzhizmet.com',
    'Ayşe Demir',
    '05339876543',
    'hizmet',
    true,
    4.2,
    '[]',
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
) ON CONFLICT DO NOTHING;

-- Performans için index'ler
CREATE INDEX IF NOT EXISTS idx_users_email ON "Users"(email);
CREATE INDEX IF NOT EXISTS idx_users_sicilno ON "Users"("sicilNo");
CREATE INDEX IF NOT EXISTS idx_suppliers_taxnumber ON "Suppliers"("taxNumber");
CREATE INDEX IF NOT EXISTS idx_purchase_requests_status ON "PurchaseRequests"(status);
CREATE INDEX IF NOT EXISTS idx_purchase_requests_requester ON "PurchaseRequests"("requesterId");
CREATE INDEX IF NOT EXISTS idx_tenders_status ON "Tenders"(status);
CREATE INDEX IF NOT EXISTS idx_contracts_status ON "Contracts"(status);
CREATE INDEX IF NOT EXISTS idx_orders_status ON "PurchaseOrders"(status);

-- Trigger'ları oluştur
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON "Users"
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_suppliers_updated_at BEFORE UPDATE ON "Suppliers"
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_purchase_requests_updated_at BEFORE UPDATE ON "PurchaseRequests"
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_tenders_updated_at BEFORE UPDATE ON "Tenders"
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_contracts_updated_at BEFORE UPDATE ON "Contracts"
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_orders_updated_at BEFORE UPDATE ON "PurchaseOrders"
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();