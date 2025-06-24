-- Enable PostGIS extension
CREATE EXTENSION IF NOT EXISTS postgis;
CREATE EXTENSION IF NOT EXISTS postgis_topology;
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create initial tables if needed
-- This file can be used for initial database setup

-- Example: Create spatial indexes
-- CREATE INDEX idx_disasters_epicenter ON "Disasters" USING GIST (epicenter);
-- CREATE INDEX idx_disasters_affected_area ON "Disasters" USING GIST ("affectedArea");
-- CREATE INDEX idx_locations_coordinates ON "Locations" USING GIST (coordinates);
-- CREATE INDEX idx_help_requests_location ON "HelpRequests" USING GIST ("exactLocation");

-- Insert initial data
-- Example: Default institution
INSERT INTO "Institutions" (id, name, type, code, "contactInfo", "isActive", "createdAt", "updatedAt")
VALUES 
  ('11111111-1111-1111-1111-111111111111', 'AFAD Genel Müdürlüğü', 'government', 'AFAD-GM', 
   '{"phone": ["0312 258 23 23"], "email": ["bilgi@afad.gov.tr"], "address": {"city": "Ankara", "district": "Çankaya"}}',
   true, NOW(), NOW())
ON CONFLICT (id) DO NOTHING;

-- Example: Default super admin user (password: Admin123!)
INSERT INTO "Users" (id, email, password, "firstName", "lastName", "phoneNumber", role, "institutionId", "isActive", "isVerified", "createdAt", "updatedAt")
VALUES 
  ('00000000-0000-0000-0000-000000000000', 'admin@afad.gov.tr', 
   '$2a$10$YKxQqO7XqN9qM9M9Q9M9Q.xqxqxqxqxqxqxqxqxqxqxqxqxqxqx', -- This is a placeholder, real bcrypt hash needed
   'Sistem', 'Yöneticisi', '03122582323', 'super_admin', 
   '11111111-1111-1111-1111-111111111111', true, true, NOW(), NOW())
ON CONFLICT (id) DO NOTHING;

-- Create useful database functions
CREATE OR REPLACE FUNCTION calculate_distance(lat1 float, lon1 float, lat2 float, lon2 float)
RETURNS float AS $$
BEGIN
    -- Haversine formula for distance calculation
    RETURN 6371 * acos(
        cos(radians(lat1)) * cos(radians(lat2)) * 
        cos(radians(lon2) - radians(lon1)) + 
        sin(radians(lat1)) * sin(radians(lat2))
    );
END;
$$ LANGUAGE plpgsql;

-- Function to find nearby locations
CREATE OR REPLACE FUNCTION find_nearby_locations(center_point geography, radius_km float)
RETURNS TABLE(id uuid, name text, distance float) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        l.id,
        l.name,
        ST_Distance(l.coordinates, center_point) / 1000 as distance
    FROM "Locations" l
    WHERE ST_DWithin(l.coordinates, center_point, radius_km * 1000)
    ORDER BY distance;
END;
$$ LANGUAGE plpgsql;

-- Trigger to update timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW."updatedAt" = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply trigger to all tables
DO $$
DECLARE
    t text;
BEGIN
    FOR t IN 
        SELECT table_name 
        FROM information_schema.columns 
        WHERE column_name = 'updatedAt' 
        AND table_schema = 'public'
    LOOP
        EXECUTE format('CREATE TRIGGER update_%I_updated_at BEFORE UPDATE ON %I FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();', t, t);
    END LOOP;
END;
$$ LANGUAGE plpgsql;