export type UserRole = 'rider' | 'driver' | null;

export type MapEngine = 'google' | 'leaflet';

export type DriverDocumentStatus = 'pending' | 'uploaded' | 'verified';


export interface DriverDocuments {
  license: DriverDocumentStatus;
  rc: DriverDocumentStatus;
  insurance: DriverDocumentStatus;
  identity: DriverDocumentStatus;
}

export type VehicleType = 'auto' | 'bike' | 'mini' | 'sedan' | 'suv';

export interface VehicleOption {
  id: VehicleType;
  name: string;
  tagline: string;
  description: string;
  baseFare: number;
  perKm: number;
  capacity: number;
  bags: number;
  eta: number; // minutes away
  icon: string;
  badge?: string;
  surgeMultiplier?: number;
}

export interface LocationPoint {
  name: string;
  address: string;
  lat: number;
  lng: number;
  category?: 'airport' | 'station' | 'techpark' | 'mall' | 'general';
}

export type RideStatus = 
  | 'idle' 
  | 'searching' 
  | 'requested' 
  | 'accepted' 
  | 'arriving' 
  | 'in_transit' 
  | 'completed' 
  | 'cancelled';

export interface RideRequest {
  id: string;
  riderId: string;
  riderName: string;
  riderPhone: string;
  riderRating: number;
  pickup: LocationPoint;
  dropoff: LocationPoint;
  distanceKm: number;
  durationMins: number;
  vehicleType: VehicleType;
  fare: number;
  otp: string;
  status: RideStatus;
  paymentMethod: 'cash' | 'upi' | 'card';
  surgeMultiplier?: number;
  
  // Assigned Driver details
  driverId?: string;
  driverName?: string;
  driverPhone?: string;
  driverRating?: number;
  vehicleModel?: string;
  vehiclePlate?: string;
  driverLat?: number;
  driverLng?: number;
  
  createdAt: number;
}

export interface DriverStats {
  todayEarnings: number;
  completedRides: number;
  acceptanceRate: number;
  rating: number;
  isOnline: boolean;
  hoursOnline?: number;
}

