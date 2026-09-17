import type { LocationPoint, VehicleOption, VehicleType, DriverApplicant } from '../types';

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

export const INITIAL_DRIVER_APPLICANTS: DriverApplicant[] = [
  {
    id: 'DRV-101',
    name: 'Vikram Singh',
    phone: '+91 98765 11111',
    vehicleModel: 'Maruti Swift Dzire AC',
    vehiclePlate: 'KA-04-EV-7788',
    vehicleType: 'sedan',
    city: 'Bengaluru (Nagavara / Manyata)',
    rating: 4.85,
    completedRides: 148,
    registeredAt: '2026-02-14',
    overallStatus: 'pending',
    docs: {
      license: {
        status: 'uploaded',
        docNo: 'KA04-20220019283',
        expiry: '2032-08-15',
        issuedBy: 'RTO Yeshwanthpur, Bengaluru',
        lastUpdated: '2026-02-24',
      },
      rc: {
        status: 'uploaded',
        docNo: 'RC-KA04EV7788-991',
        expiry: '2035-11-20',
        issuedBy: 'Transport Dept Karnataka',
        lastUpdated: '2026-02-24',
      },
      insurance: {
        status: 'uploaded',
        docNo: 'HDFC-ERGO-COMM-88910',
        expiry: '2027-04-30',
        issuedBy: 'HDFC ERGO General Insurance',
        lastUpdated: '2026-02-24',
      },
      identity: {
        status: 'uploaded',
        docNo: 'UIDAI-XXXX-XXXX-4819',
        issuedBy: 'Govt of India / Police Verified',
        lastUpdated: '2026-02-24',
      },
    },
  },
  {
    id: 'DRV-102',
    name: 'Rajesh M. Kumar',
    phone: '+91 98450 67123',
    vehicleModel: 'Maruti WagonR Green CNG',
    vehiclePlate: 'KA-01-MJ-1290',
    vehicleType: 'mini',
    city: 'Bengaluru (Koramangala / HSR)',
    rating: 4.92,
    completedRides: 312,
    registeredAt: '2026-01-10',
    overallStatus: 'verified',
    docs: {
      license: {
        status: 'verified',
        docNo: 'KA01-20190048123',
        expiry: '2030-05-19',
        issuedBy: 'RTO Koramangala',
        lastUpdated: '2026-01-11',
      },
      rc: {
        status: 'verified',
        docNo: 'RC-KA01MJ1290-334',
        expiry: '2034-03-12',
        issuedBy: 'Transport Dept Karnataka',
        lastUpdated: '2026-01-11',
      },
      insurance: {
        status: 'verified',
        docNo: 'BAJAJ-ALLIANZ-771829',
        expiry: '2027-02-18',
        issuedBy: 'Bajaj Allianz Commercial',
        lastUpdated: '2026-01-11',
      },
      identity: {
        status: 'verified',
        docNo: 'UIDAI-XXXX-XXXX-9901',
        issuedBy: 'Govt of India',
        lastUpdated: '2026-01-11',
      },
    },
  },
  {
    id: 'DRV-103',
    name: 'Amit Yadav',
    phone: '+91 97312 88450',
    vehicleModel: 'Maruti Ertiga Hybrid (6 Seater)',
    vehiclePlate: 'KA-05-AB-4321',
    vehicleType: 'suv',
    city: 'Bengaluru (Airport Corridor / Hebbal)',
    rating: 4.78,
    completedRides: 89,
    registeredAt: '2026-02-20',
    overallStatus: 'pending',
    docs: {
      license: {
        status: 'verified',
        docNo: 'KA05-20210088712',
        expiry: '2031-10-10',
        issuedBy: 'RTO Jayanagar',
        lastUpdated: '2026-02-21',
      },
      rc: {
        status: 'uploaded',
        docNo: 'RC-KA05AB4321-889',
        expiry: '2036-09-01',
        issuedBy: 'Transport Dept Karnataka',
        lastUpdated: '2026-02-22',
      },
      insurance: {
        status: 'rejected',
        docNo: 'TATA-AIG-EXPIRED-001',
        expiry: '2025-12-31',
        issuedBy: 'Tata AIG Insurance',
        rejectionReason: 'Policy expired on Dec 31, 2025. Please upload active commercial comprehensive insurance policy.',
        lastUpdated: '2026-02-23',
      },
      identity: {
        status: 'uploaded',
        docNo: 'UIDAI-XXXX-XXXX-3342',
        issuedBy: 'Govt of India',
        lastUpdated: '2026-02-22',
      },
    },
  },
  {
    id: 'DRV-104',
    name: 'Priya Verma',
    phone: '+91 99001 54321',
    vehicleModel: 'Mahindra Treo Electric Auto',
    vehiclePlate: 'KA-03-EV-8822',
    vehicleType: 'auto',
    city: 'Bengaluru (Indiranagar / MG Road)',
    rating: 4.96,
    completedRides: 420,
    registeredAt: '2025-12-05',
    overallStatus: 'verified',
    docs: {
      license: {
        status: 'verified',
        docNo: 'KA03-20200034190',
        expiry: '2030-11-15',
        issuedBy: 'RTO Indiranagar',
        lastUpdated: '2025-12-06',
      },
      rc: {
        status: 'verified',
        docNo: 'RC-KA03EV8822-110',
        expiry: '2035-08-20',
        issuedBy: 'Transport Dept Karnataka',
        lastUpdated: '2025-12-06',
      },
      insurance: {
        status: 'verified',
        docNo: 'ICICI-LOMBARD-EV-6651',
        expiry: '2027-01-25',
        issuedBy: 'ICICI Lombard General',
        lastUpdated: '2025-12-06',
      },
      identity: {
        status: 'verified',
        docNo: 'UIDAI-XXXX-XXXX-1288',
        issuedBy: 'Govt of India',
        lastUpdated: '2025-12-06',
      },
    },
  },
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
