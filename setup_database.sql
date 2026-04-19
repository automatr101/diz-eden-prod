-- Drop existing tables to start fresh
DROP TABLE IF EXISTS bookings CASCADE;
DROP TABLE IF EXISTS blocked_dates CASCADE;
DROP TABLE IF EXISTS reviews CASCADE;
DROP TABLE IF EXISTS settings CASCADE;

-- Create helper function for booking reference
CREATE OR REPLACE FUNCTION generate_booking_reference()
RETURNS TEXT AS $$
DECLARE
    chars TEXT := 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    result TEXT := 'DE-';
    i INTEGER := 0;
BEGIN
    FOR i IN 1..8 LOOP
        result := result || substr(chars, floor(random() * 36)::int + 1, 1);
    END LOOP;
    RETURN result;
END;
$$ LANGUAGE plpgsql;

-- Table: bookings
CREATE TABLE bookings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    guest_name TEXT NOT NULL,
    guest_email TEXT NOT NULL,
    guest_phone TEXT,
    check_in DATE NOT NULL,
    check_out DATE NOT NULL,
    num_guests INTEGER NOT NULL,
    num_nights INTEGER NOT NULL,
    nightly_rate DECIMAL(10,2) NOT NULL,
    cleaning_fee DECIMAL(10,2),
    service_fee DECIMAL(10,2),
    total_amount DECIMAL(10,2) NOT NULL,
    currency TEXT DEFAULT 'GHS',
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending','confirmed','cancelled','refunded')),
    stripe_session_id TEXT UNIQUE,
    stripe_payment_id TEXT,
    special_requests TEXT,
    booking_reference TEXT UNIQUE DEFAULT generate_booking_reference(),
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- Table: blocked_dates
CREATE TABLE blocked_dates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    date DATE NOT NULL UNIQUE,
    reason TEXT,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- Table: reviews
CREATE TABLE reviews (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    guest_name TEXT NOT NULL,
    rating INTEGER CHECK (rating BETWEEN 1 AND 5),
    comment TEXT,
    published BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- Table: settings
CREATE TABLE settings (
    key TEXT PRIMARY KEY,
    value TEXT NOT NULL
);

-- Seed default settings
INSERT INTO settings (key, value) VALUES
('nightly_rate', '1800.00'),
('cleaning_fee', '200.00'),
('max_guests', '4'),
('owner_email', 'bewinwisdom@gmail.com')
ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value;

-- RLS Policies
ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE blocked_dates ENABLE ROW LEVEL SECURITY;
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE settings ENABLE ROW LEVEL SECURITY;

-- bookings: public INSERT, authenticated-only SELECT/UPDATE.
CREATE POLICY "Enable insert for anonymous users" ON bookings FOR INSERT WITH CHECK (true);
CREATE POLICY "Enable read access for authenticated users" ON bookings FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Enable update for authenticated users" ON bookings FOR UPDATE USING (auth.role() = 'authenticated');

-- blocked_dates: public SELECT, authenticated-only INSERT/UPDATE/DELETE.
CREATE POLICY "Enable read access for all users" ON blocked_dates FOR SELECT USING (true);
CREATE POLICY "Enable insert for authenticated users" ON blocked_dates FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Enable update for authenticated users" ON blocked_dates FOR UPDATE USING (auth.role() = 'authenticated');
CREATE POLICY "Enable delete for authenticated users" ON blocked_dates FOR DELETE USING (auth.role() = 'authenticated');

-- reviews: public SELECT (published=true only), authenticated-only manage.
CREATE POLICY "Enable read access for published reviews" ON reviews FOR SELECT USING (published = true OR auth.role() = 'authenticated');
CREATE POLICY "Enable insert for authenticated users" ON reviews FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Enable update for authenticated users" ON reviews FOR UPDATE USING (auth.role() = 'authenticated');
CREATE POLICY "Enable delete for authenticated users" ON reviews FOR DELETE USING (auth.role() = 'authenticated');

-- settings: public SELECT, authenticated-only write.
CREATE POLICY "Enable read access for all users" ON settings FOR SELECT USING (true);
CREATE POLICY "Enable insert for authenticated users" ON settings FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Enable update for authenticated users" ON settings FOR UPDATE USING (auth.role() = 'authenticated');
CREATE POLICY "Enable delete for authenticated users" ON settings FOR DELETE USING (auth.role() = 'authenticated');
