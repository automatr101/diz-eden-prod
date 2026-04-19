
-- Fix function search path
CREATE OR REPLACE FUNCTION public.update_updated_at()
RETURNS TRIGGER AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END;
$$ LANGUAGE plpgsql
SET search_path = public;

-- Fix permissive insert policy on bookings - require at least a valid guest email
DROP POLICY "Anyone can create booking" ON public.bookings;
CREATE POLICY "Anyone can create booking"
  ON public.bookings FOR INSERT WITH CHECK (
    guest_email IS NOT NULL AND guest_email <> '' AND guest_name IS NOT NULL AND guest_name <> ''
  );
