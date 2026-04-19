
-- PROPERTIES TABLE
CREATE TABLE public.properties (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  slug TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  tagline TEXT,
  description TEXT,
  location TEXT,
  bedrooms INTEGER NOT NULL,
  bathrooms INTEGER NOT NULL,
  max_guests INTEGER NOT NULL,
  floor_area_m2 INTEGER,
  base_price DECIMAL(10,2) NOT NULL,
  cleaning_fee DECIMAL(10,2) DEFAULT 0,
  published BOOLEAN DEFAULT true,
  amenities JSONB DEFAULT '[]',
  house_rules JSONB DEFAULT '[]',
  images JSONB DEFAULT '[]',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- BOOKINGS TABLE
CREATE TABLE public.bookings (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  property_id UUID REFERENCES public.properties(id) ON DELETE CASCADE,
  guest_name TEXT NOT NULL,
  guest_email TEXT NOT NULL,
  guest_phone TEXT,
  check_in DATE NOT NULL,
  check_out DATE NOT NULL,
  num_guests INTEGER NOT NULL DEFAULT 1,
  num_nights INTEGER NOT NULL,
  nightly_rate DECIMAL(10,2) NOT NULL,
  cleaning_fee DECIMAL(10,2) DEFAULT 0,
  service_fee DECIMAL(10,2) DEFAULT 0,
  total_amount DECIMAL(10,2) NOT NULL,
  currency TEXT DEFAULT 'usd',
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending','confirmed','cancelled','refunded')),
  stripe_session_id TEXT UNIQUE,
  stripe_payment_id TEXT,
  special_requests TEXT,
  booking_reference TEXT UNIQUE NOT NULL DEFAULT ('DE-' || upper(substring(gen_random_uuid()::text, 1, 8))),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- BLOCKED DATES TABLE
CREATE TABLE public.blocked_dates (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  property_id UUID REFERENCES public.properties(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  reason TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(property_id, date)
);

-- REVIEWS TABLE
CREATE TABLE public.reviews (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  property_id UUID REFERENCES public.properties(id) ON DELETE CASCADE,
  booking_id UUID REFERENCES public.bookings(id) ON DELETE SET NULL,
  guest_name TEXT NOT NULL,
  rating INTEGER NOT NULL CHECK (rating BETWEEN 1 AND 5),
  comment TEXT,
  published BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- INDEXES
CREATE INDEX idx_bookings_property_id ON public.bookings(property_id);
CREATE INDEX idx_bookings_check_in ON public.bookings(check_in);
CREATE INDEX idx_bookings_check_out ON public.bookings(check_out);
CREATE INDEX idx_bookings_status ON public.bookings(status);
CREATE INDEX idx_blocked_dates_property_date ON public.blocked_dates(property_id, date);

-- UPDATED_AT TRIGGER
CREATE OR REPLACE FUNCTION public.update_updated_at()
RETURNS TRIGGER AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_properties_updated
  BEFORE UPDATE ON public.properties
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

CREATE TRIGGER trg_bookings_updated
  BEFORE UPDATE ON public.bookings
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

-- ENABLE RLS
ALTER TABLE public.properties ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.blocked_dates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;

-- Properties: public read
CREATE POLICY "Public can read published properties"
  ON public.properties FOR SELECT USING (published = true);

CREATE POLICY "Auth users can manage properties"
  ON public.properties FOR ALL USING (auth.role() = 'authenticated');

-- Bookings: anyone can insert, auth can read/update
CREATE POLICY "Anyone can create booking"
  ON public.bookings FOR INSERT WITH CHECK (true);

CREATE POLICY "Auth users can read all bookings"
  ON public.bookings FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Auth users can update bookings"
  ON public.bookings FOR UPDATE USING (auth.role() = 'authenticated');

-- Blocked dates: public read, auth write
CREATE POLICY "Public can read blocked dates"
  ON public.blocked_dates FOR SELECT USING (true);

CREATE POLICY "Auth users can manage blocked dates"
  ON public.blocked_dates FOR ALL USING (auth.role() = 'authenticated');

-- Reviews: public read published, auth manage
CREATE POLICY "Public can read published reviews"
  ON public.reviews FOR SELECT USING (published = true);

CREATE POLICY "Auth users can manage reviews"
  ON public.reviews FOR ALL USING (auth.role() = 'authenticated');
