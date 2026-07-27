import { createClient, SupabaseClient } from '@supabase/supabase-js';
import type { RideRequest } from '../types';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

export const isSupabaseConfigured = Boolean(supabaseUrl && supabaseAnonKey);

export const supabase: SupabaseClient | null = isSupabaseConfigured
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;

if (!isSupabaseConfigured) {
  console.info(
    'ℹ️ Supabase credentials not set. Falling back to local state & BroadcastChannel for demo mode.'
  );
}

// Convert Database DB Row -> App RideRequest object
export function mapDbRowToRide(row: any): RideRequest {
  return {
    id: row.id,
    riderId: row.rider_id,
    riderName: row.rider_name,
    riderPhone: row.rider_phone,
    riderRating: row.rider_rating || 4.9,
    pickup: {
      name: row.pickup_name,
      address: row.pickup_address || '',
      lat: Number(row.pickup_lat),
      lng: Number(row.pickup_lng),
    },
    dropoff: {
      name: row.dropoff_name,
      address: row.dropoff_address || '',
      lat: Number(row.dropoff_lat),
      lng: Number(row.dropoff_lng),
    },
    distanceKm: Number(row.distance_km),
    durationMins: Number(row.duration_mins),
    vehicleType: row.vehicle_type,
    fare: Number(row.fare),
    otp: row.otp,
    status: row.status,
    paymentMethod: row.payment_method,
    surgeMultiplier: row.surge_multiplier || 1.0,

    driverId: row.driver_id || undefined,
    driverName: row.driver_name || undefined,
    driverPhone: row.driver_phone || undefined,
    driverRating: row.driver_rating ? Number(row.driver_rating) : undefined,
    vehicleModel: row.vehicle_model || undefined,
    vehiclePlate: row.vehicle_plate || undefined,
    driverLat: row.driver_lat ? Number(row.driver_lat) : undefined,
    driverLng: row.driver_lng ? Number(row.driver_lng) : undefined,

    createdAt: row.created_at ? new Date(row.created_at).getTime() : Date.now(),
  };
}

// Convert App RideRequest object -> Database DB Row
export function mapRideToDbRow(ride: RideRequest) {
  return {
    id: ride.id,
    rider_id: ride.riderId,
    rider_name: ride.riderName,
    rider_phone: ride.riderPhone,
    rider_rating: ride.riderRating,
    pickup_name: ride.pickup.name,
    pickup_address: ride.pickup.address || '',
    pickup_lat: ride.pickup.lat,
    pickup_lng: ride.pickup.lng,
    dropoff_name: ride.dropoff.name,
    dropoff_address: ride.dropoff.address || '',
    dropoff_lat: ride.dropoff.lat,
    dropoff_lng: ride.dropoff.lng,
    distance_km: ride.distanceKm,
    duration_mins: ride.durationMins,
    vehicle_type: ride.vehicleType,
    fare: ride.fare,
    otp: ride.otp,
    status: ride.status,
    payment_method: ride.paymentMethod,
    surge_multiplier: ride.surgeMultiplier || 1.0,
    driver_id: ride.driverId || null,
    driver_name: ride.driverName || null,
    driver_phone: ride.driverPhone || null,
    driver_rating: ride.driverRating || null,
    vehicle_model: ride.vehicleModel || null,
    vehicle_plate: ride.vehiclePlate || null,
    driver_lat: ride.driverLat || null,
    driver_lng: ride.driverLng || null,
    updated_at: new Date().toISOString(),
  };
}
