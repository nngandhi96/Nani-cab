export type UserRole = 'rider' | 'driver' | null;

export type DriverDocumentStatus = 'pending' | 'uploaded' | 'verified';

export interface DriverDocuments {
  license: DriverDocumentStatus;
  rc: DriverDocumentStatus;
  insurance: DriverDocumentStatus;
  identity: DriverDocumentStatus;
}

export type VehicleType = 'bike' | 'mini' | 'sedan' | 'suv';

export interface VehicleOption {
  id: VehicleType;
  name: string;
  description: string;
  baseFare: number;
  perKm: number;
  capacity: number;
  eta: number; // minutes away
  icon: string;
}

export interface LocationPoint {
  name: string;
  address: string;
  lat: number;
  lng: number;
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
}
