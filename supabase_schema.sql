-- ===================================================
-- NANI CAB SUPABASE REALTIME DATABASE SCHEMA
-- Execute this script in your Supabase SQL Editor:
-- https://supabase.com/dashboard/project/_/sql/new
-- ===================================================

-- 1. Create Rides Table
CREATE TABLE IF NOT EXISTS public.rides (
    id TEXT PRIMARY KEY,
    rider_id TEXT NOT NULL,
    rider_name TEXT NOT NULL,
    rider_phone TEXT NOT NULL,
    rider_rating NUMERIC DEFAULT 4.9,
    
    pickup_name TEXT NOT NULL,
    pickup_address TEXT,
    pickup_lat FLOAT8 NOT NULL,
    pickup_lng FLOAT8 NOT NULL,
    
    dropoff_name TEXT NOT NULL,
    dropoff_address TEXT,
    dropoff_lat FLOAT8 NOT NULL,
    dropoff_lng FLOAT8 NOT NULL,
    
    distance_km FLOAT8 NOT NULL,
    duration_mins INT4 NOT NULL,
    vehicle_type TEXT NOT NULL,
    fare NUMERIC NOT NULL,
    otp TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'requested',
    payment_method TEXT NOT NULL DEFAULT 'cash',
    surge_multiplier FLOAT8 DEFAULT 1.0,
    
    -- Driver details (populated when accepted)
    driver_id TEXT,
    driver_name TEXT,
    driver_phone TEXT,
    driver_rating NUMERIC,
    vehicle_model TEXT,
    vehicle_plate TEXT,
    driver_lat FLOAT8,
    driver_lng FLOAT8,
    driver_heading FLOAT8,
    
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Ensure driver_heading column exists if table was created previously
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' AND table_name = 'rides' AND column_name = 'driver_heading'
    ) THEN
        ALTER TABLE public.rides ADD COLUMN driver_heading FLOAT8;
    END IF;
END $$;

-- 2. Create Driver Locations Table
CREATE TABLE IF NOT EXISTS public.driver_locations (
    driver_id TEXT PRIMARY KEY,
    driver_name TEXT NOT NULL,
    lat FLOAT8 NOT NULL,
    lng FLOAT8 NOT NULL,
    heading FLOAT8 DEFAULT 0,
    is_online BOOLEAN DEFAULT true,
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Ensure heading column exists if table was created previously
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' AND table_name = 'driver_locations' AND column_name = 'heading'
    ) THEN
        ALTER TABLE public.driver_locations ADD COLUMN heading FLOAT8 DEFAULT 0;
    END IF;
END $$;

-- 3. Create Driver Applicants Table (for Admin KYC verification & document status)
CREATE TABLE IF NOT EXISTS public.driver_applicants (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    phone TEXT NOT NULL,
    avatar_url TEXT,
    vehicle_model TEXT NOT NULL,
    vehicle_plate TEXT NOT NULL,
    vehicle_type TEXT NOT NULL,
    city TEXT NOT NULL,
    rating NUMERIC DEFAULT 5.0,
    completed_rides INT4 DEFAULT 0,
    registered_at TIMESTAMPTZ DEFAULT NOW(),
    overall_status TEXT NOT NULL DEFAULT 'pending', -- 'pending' | 'verified' | 'rejected'
    docs JSONB NOT NULL DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Enable Row Level Security (RLS) & Permissive demo policies
ALTER TABLE public.rides ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.driver_locations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.driver_applicants ENABLE ROW LEVEL SECURITY;

-- Allow read/write for all users (anon) for demo
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Allow public read/write on rides' AND tablename = 'rides') THEN
        CREATE POLICY "Allow public read/write on rides" ON public.rides FOR ALL USING (true) WITH CHECK (true);
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Allow public read/write on driver_locations' AND tablename = 'driver_locations') THEN
        CREATE POLICY "Allow public read/write on driver_locations" ON public.driver_locations FOR ALL USING (true) WITH CHECK (true);
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Allow public read/write on driver_applicants' AND tablename = 'driver_applicants') THEN
        CREATE POLICY "Allow public read/write on driver_applicants" ON public.driver_applicants FOR ALL USING (true) WITH CHECK (true);
    END IF;
END $$;

-- 5. Enable Supabase Realtime for instant live updates across devices
DO $$
BEGIN
    -- Add tables to supabase_realtime publication safely if not already added
    IF NOT EXISTS (
        SELECT 1 FROM pg_publication_tables 
        WHERE pubname = 'supabase_realtime' AND schemaname = 'public' AND tablename = 'rides'
    ) THEN
        ALTER PUBLICATION supabase_realtime ADD TABLE public.rides;
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM pg_publication_tables 
        WHERE pubname = 'supabase_realtime' AND schemaname = 'public' AND tablename = 'driver_locations'
    ) THEN
        ALTER PUBLICATION supabase_realtime ADD TABLE public.driver_locations;
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM pg_publication_tables 
        WHERE pubname = 'supabase_realtime' AND schemaname = 'public' AND tablename = 'driver_applicants'
    ) THEN
        ALTER PUBLICATION supabase_realtime ADD TABLE public.driver_applicants;
    END IF;
EXCEPTION
    WHEN OTHERS THEN
        -- Fallback in case publication does not exist or user lacks permission
        NULL;
END $$;

-- 6. Seed Initial Driver Applicants (Idempotent: updates if exists)
INSERT INTO public.driver_applicants (
    id, name, phone, vehicle_model, vehicle_plate, vehicle_type, city, rating, completed_rides, registered_at, overall_status, docs
) VALUES
(
    'DRV-101',
    'Vikram Singh',
    '+91 98765 11111',
    'Maruti Swift Dzire AC',
    'KA-04-EV-7788',
    'sedan',
    'Bengaluru (Nagavara / Manyata)',
    4.85,
    148,
    '2026-02-14',
    'pending',
    '{
      "license": { "status": "uploaded", "docNo": "KA04-20220019283", "expiry": "2032-08-15", "issuedBy": "RTO Yeshwanthpur, Bengaluru", "lastUpdated": "2026-02-24" },
      "rc": { "status": "uploaded", "docNo": "RC-KA04EV7788-991", "expiry": "2035-11-20", "issuedBy": "Transport Dept Karnataka", "lastUpdated": "2026-02-24" },
      "insurance": { "status": "uploaded", "docNo": "HDFC-ERGO-COMM-88910", "expiry": "2027-04-30", "issuedBy": "HDFC ERGO General Insurance", "lastUpdated": "2026-02-24" },
      "identity": { "status": "uploaded", "docNo": "UIDAI-XXXX-XXXX-4819", "issuedBy": "Govt of India / Police Verified", "lastUpdated": "2026-02-24" }
    }'::jsonb
),
(
    'DRV-102',
    'Rajesh M. Kumar',
    '+91 98450 67123',
    'Maruti WagonR Green CNG',
    'KA-01-MJ-1290',
    'mini',
    'Bengaluru (Koramangala / HSR)',
    4.92,
    312,
    '2026-01-10',
    'verified',
    '{
      "license": { "status": "verified", "docNo": "KA01-20190048123", "expiry": "2030-05-19", "issuedBy": "RTO Koramangala", "lastUpdated": "2026-01-11" },
      "rc": { "status": "verified", "docNo": "RC-KA01MJ1290-334", "expiry": "2034-03-12", "issuedBy": "Transport Dept Karnataka", "lastUpdated": "2026-01-11" },
      "insurance": { "status": "verified", "docNo": "BAJAJ-ALLIANZ-771829", "expiry": "2027-02-18", "issuedBy": "Bajaj Allianz Commercial", "lastUpdated": "2026-01-11" },
      "identity": { "status": "verified", "docNo": "UIDAI-XXXX-XXXX-9901", "issuedBy": "Govt of India", "lastUpdated": "2026-01-11" }
    }'::jsonb
),
(
    'DRV-103',
    'Amit Yadav',
    '+91 97312 88450',
    'Maruti Ertiga Hybrid (6 Seater)',
    'KA-05-AB-4321',
    'suv',
    'Bengaluru (Airport Corridor / Hebbal)',
    4.78,
    89,
    '2026-02-20',
    'pending',
    '{
      "license": { "status": "verified", "docNo": "KA05-20210088712", "expiry": "2031-10-10", "issuedBy": "RTO Jayanagar", "lastUpdated": "2026-02-21" },
      "rc": { "status": "uploaded", "docNo": "RC-KA05AB4321-889", "expiry": "2036-09-01", "issuedBy": "Transport Dept Karnataka", "lastUpdated": "2026-02-22" },
      "insurance": { "status": "rejected", "docNo": "TATA-AIG-EXPIRED-001", "expiry": "2025-12-31", "issuedBy": "Tata AIG Insurance", "rejectionReason": "Policy expired on Dec 31, 2025. Please upload active commercial comprehensive insurance policy.", "lastUpdated": "2026-02-23" },
      "identity": { "status": "uploaded", "docNo": "UIDAI-XXXX-XXXX-3342", "issuedBy": "Govt of India", "lastUpdated": "2026-02-22" }
    }'::jsonb
),
(
    'DRV-104',
    'Priya Verma',
    '+91 99001 54321',
    'Mahindra Treo Electric Auto',
    'KA-03-EV-8822',
    'auto',
    'Bengaluru (Indiranagar / MG Road)',
    4.96,
    420,
    '2025-12-05',
    'verified',
    '{
      "license": { "status": "verified", "docNo": "KA03-20200034190", "expiry": "2030-11-15", "issuedBy": "RTO Indiranagar", "lastUpdated": "2025-12-06" },
      "rc": { "status": "verified", "docNo": "RC-KA03EV8822-110", "expiry": "2035-08-20", "issuedBy": "Transport Dept Karnataka", "lastUpdated": "2025-12-06" },
      "insurance": { "status": "verified", "docNo": "ICICI-LOMBARD-EV-6651", "expiry": "2027-01-25", "issuedBy": "ICICI Lombard General", "lastUpdated": "2025-12-06" },
      "identity": { "status": "verified", "docNo": "UIDAI-XXXX-XXXX-7721", "issuedBy": "Govt of India", "lastUpdated": "2025-12-06" }
    }'::jsonb
)
ON CONFLICT (id) DO UPDATE SET
    name = EXCLUDED.name,
    phone = EXCLUDED.phone,
    vehicle_model = EXCLUDED.vehicle_model,
    vehicle_plate = EXCLUDED.vehicle_plate,
    vehicle_type = EXCLUDED.vehicle_type,
    city = EXCLUDED.city,
    rating = EXCLUDED.rating,
    completed_rides = EXCLUDED.completed_rides,
    overall_status = EXCLUDED.overall_status,
    docs = EXCLUDED.docs,
    updated_at = NOW();
