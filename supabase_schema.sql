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
    
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Create Driver Locations Table
CREATE TABLE IF NOT EXISTS public.driver_locations (
    driver_id TEXT PRIMARY KEY,
    driver_name TEXT NOT NULL,
    lat FLOAT8 NOT NULL,
    lng FLOAT8 NOT NULL,
    is_online BOOLEAN DEFAULT true,
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Disable Row Level Security (RLS) or add permissive public policies for demo app
ALTER TABLE public.rides ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.driver_locations ENABLE ROW LEVEL SECURITY;

-- Allow read/write for all users (anon) for demo
CREATE POLICY "Allow public read/write on rides" ON public.rides 
    FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "Allow public read/write on driver_locations" ON public.driver_locations 
    FOR ALL USING (true) WITH CHECK (true);

-- 4. Enable Supabase Realtime for instant live updates across devices
ALTER PUBLICATION supabase_realtime ADD TABLE public.rides;
ALTER PUBLICATION supabase_realtime ADD TABLE public.driver_locations;
