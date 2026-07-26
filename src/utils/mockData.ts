import type { LocationPoint, VehicleOption, VehicleType } from '../types';

export const PRESET_LOCATIONS: LocationPoint[] = [
  {
    name: 'Kempegowda Int. Airport (BLR T1)',
    address: 'Devanahalli, Airport Road, Bengaluru 560300',
    lat: 13.1986,
    lng: 77.7066,
    category: 'airport',
  },
  {
    name: 'Manyata Embassy Business Park',
    address: 'Outer Ring Road, Nagavara, Bengaluru 560045',
    lat: 13.0468,
    lng: 77.6202,
    category: 'techpark',
  },
  {
    name: 'KSR Bengaluru Central Railway (Majestic)',
    address: 'Majestic Metro Station, Bengaluru 560023',
    lat: 12.9781,
    lng: 77.5697,
    category: 'station',
  },
  {
    name: 'Indiranagar 100ft Road Metro Hub',
    address: '100 Feet Rd, HAL 2nd Stage, Indiranagar 560038',
    lat: 12.9784,
    lng: 77.6408,
    category: 'general',
  },
  {
    name: 'Koramangala Sony World Signal',
    address: '80 Feet Rd, 4th Block, Koramangala 560034',
    lat: 12.9352,
    lng: 77.6245,
    category: 'general',
  },
  {
    name: 'Electronic City Phase 1 Toll Plaza',
    address: 'Elevated Expressway Exit, Electronic City 560100',
    lat: 12.8452,
    lng: 77.6602,
    category: 'techpark',
  },
  {
    name: 'Whitefield ITPL Main Entrance',
    address: 'International Tech Park, Whitefield 560066',
    lat: 12.9863,
    lng: 77.7337,
    category: 'techpark',
  },
  {
    name: 'Phoenix Marketcity Mall',
    address: 'Mahadevapura, Hoodi, Whitefield Rd 560048',
    lat: 12.9958,
    lng: 77.6964,
    category: 'mall',
  },
  {
    name: 'MG Road Metro Station',
    address: 'MG Road, Haridevpur, Shanthala Nagar 560001',
    lat: 12.9756,
    lng: 77.6066,
    category: 'station',
  },
];

export const VEHICLE_OPTIONS: VehicleOption[] = [
  {
    id: 'auto',
    name: 'Nani Auto EV',
    tagline: 'Pocket friendly, open-air city rides',
    description: 'Electric 3-wheeler, bypass heavy city traffic quickly',
    baseFare: 35,
    perKm: 11,
    capacity: 3,
    bags: 1,
    eta: 2,
    icon: '🛺',
    badge: 'Popular',
  },
  {
    id: 'bike',
    name: 'Nani Bike',
    tagline: 'Single helmet, lightning fast',
    description: 'Zip through traffic jams, zero hassle solo ride',
    baseFare: 25,
    perKm: 9,
    capacity: 1,
    bags: 1,
    eta: 1,
    icon: '🏍️',
    badge: 'Lowest Price',
  },
  {
    id: 'mini',
    name: 'Nani Mini AC',
    tagline: 'Comfy AC hatchbacks for everyday trips',
    description: 'WagonR, Swift hatchback with climate control',
    baseFare: 55,
    perKm: 14,
    capacity: 4,
    bags: 2,
    eta: 3,
    icon: '🚗',
  },
  {
    id: 'sedan',
    name: 'Nani Prime Sedan',
    tagline: 'Top-rated drivers, spacious legroom & boot',
    description: 'Swift Dzire, Etios with high comfort seats & WiFi',
    baseFare: 85,
    perKm: 18,
    capacity: 4,
    bags: 3,
    eta: 4,
    icon: '🚘',
    badge: 'Top Rated',
  },
  {
    id: 'suv',
    name: 'Nani XL SUV',
    tagline: '6-Seater SUVs for group travel & extra luggage',
    description: 'Ertiga, Innova Crysta for airport trips & family',
    baseFare: 140,
    perKm: 26,
    capacity: 6,
    bags: 5,
    eta: 6,
    icon: '🚙',
    badge: 'Extra Large',
  },
];

export const HOTSPOT_SURGE_ZONES = [
  { name: 'Airport Corridor Surge', lat: 13.1986, lng: 77.7066, radiusMeters: 4000, surgeText: '⚡ 1.4x Surge' },
  { name: 'Manyata Tech Park Hotspot', lat: 13.0468, lng: 77.6202, radiusMeters: 2500, surgeText: '⚡ 1.2x Surge' },
  { name: 'Koramangala Club Zone', lat: 12.9352, lng: 77.6245, radiusMeters: 2000, surgeText: '⚡ 1.3x Surge' },
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

export function calculateFare(distanceKm: number, vehicleId: VehicleType, surgeMultiplier = 1.0): number {
  const option = VEHICLE_OPTIONS.find((v) => v.id === vehicleId) || VEHICLE_OPTIONS[2];
  const rawTotal = (option.baseFare + distanceKm * option.perKm) * surgeMultiplier;
  return Math.round(rawTotal);
}

export function generateRoutePoints(
  start: { lat: number; lng: number },
  end: { lat: number; lng: number },
  steps = 50
) {
  const points = [];
  for (let i = 0; i <= steps; i++) {
    const ratio = i / steps;
    // Curved s-curve interpolation for realistic road appearance
    const curveOffset = Math.sin(ratio * Math.PI) * 0.0035;
    points.push({
      lat: start.lat + (end.lat - start.lat) * ratio + curveOffset,
      lng: start.lng + (end.lng - start.lng) * ratio,
    });
  }
  return points;
}

