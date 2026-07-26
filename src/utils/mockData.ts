import type { LocationPoint, VehicleOption } from '../types';

export const PRESET_LOCATIONS: LocationPoint[] = [
  {
    name: 'Kempegowda International Airport (BLR)',
    address: 'Devanahalli, Bengaluru, Karnataka 560300',
    lat: 13.1986,
    lng: 77.7066,
  },
  {
    name: 'Manyata Tech Park',
    address: 'Nagavara, Hebbal Outer Ring Rd, Bengaluru 560045',
    lat: 13.0468,
    lng: 77.6202,
  },
  {
    name: 'KSR Bengaluru Central Railway Station',
    address: 'Majestic, Bengaluru, Karnataka 560023',
    lat: 12.9781,
    lng: 77.5697,
  },
  {
    name: 'Indiranagar 100 Feet Road',
    address: 'Indiranagar, Bengaluru, Karnataka 560038',
    lat: 12.9784,
    lng: 77.6408,
  },
  {
    name: 'Koramangala Sony World Signal',
    address: '80 Feet Rd, Koramangala 4th Block, Bengaluru 560034',
    lat: 12.9352,
    lng: 77.6245,
  },
  {
    name: 'Electronic City Phase 1',
    address: 'Hosur Rd, Electronic City, Bengaluru 560100',
    lat: 12.8452,
    lng: 77.6602,
  },
  {
    name: 'Whitefield ITPL',
    address: 'ITPL Main Rd, Whitefield, Bengaluru 560066',
    lat: 12.9863,
    lng: 77.7337,
  }
];

export const VEHICLE_OPTIONS: VehicleOption[] = [
  {
    id: 'bike',
    name: 'Nani Bike',
    description: 'Fastest through traffic, solo ride',
    baseFare: 30,
    perKm: 9,
    capacity: 1,
    eta: 2,
    icon: '🏍️'
  },
  {
    id: 'mini',
    name: 'Nani Mini',
    description: 'Comfy AC Hatchbacks for everyday trips',
    baseFare: 50,
    perKm: 14,
    capacity: 4,
    eta: 4,
    icon: '🚗'
  },
  {
    id: 'sedan',
    name: 'Nani Sedan',
    description: 'Top-rated drivers, spacious legroom',
    baseFare: 80,
    perKm: 18,
    capacity: 4,
    eta: 3,
    icon: '🚘'
  },
  {
    id: 'suv',
    name: 'Nani XL SUV',
    description: '6-Seater SUVs for extra luggage & groups',
    baseFare: 130,
    perKm: 25,
    capacity: 6,
    eta: 6,
    icon: '🚙'
  }
];

export function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371;
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLon = (lon2 - lon1) * (Math.PI / 180);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * (Math.PI / 180)) *
      Math.cos(lat2 * (Math.PI / 180)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const d = R * c;
  return Math.round(d * 10) / 10;
}

export function calculateFare(distanceKm: number, vehicleId: string): number {
  const option = VEHICLE_OPTIONS.find((v) => v.id === vehicleId) || VEHICLE_OPTIONS[1];
  const total = option.baseFare + distanceKm * option.perKm;
  return Math.round(total);
}

export function generateRoutePoints(start: { lat: number; lng: number }, end: { lat: number; lng: number }, steps = 50) {
  const points = [];
  for (let i = 0; i <= steps; i++) {
    const ratio = i / steps;
    const curveOffset = Math.sin(ratio * Math.PI) * 0.003;
    points.push({
      lat: start.lat + (end.lat - start.lat) * ratio + curveOffset,
      lng: start.lng + (end.lng - start.lng) * ratio,
    });
  }
  return points;
}
