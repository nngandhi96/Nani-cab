import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import type {
  UserRole,
  MapEngine,
  DriverDocuments,
  DriverStats,
  RideRequest,
  LocationPoint,
  VehicleType,
} from '../types';
import { PRESET_LOCATIONS, calculateDistance, calculateFare, generateRoutePoints } from '../utils/mockData';
import { supabase, isSupabaseConfigured, mapDbRowToRide, mapRideToDbRow } from '../lib/supabase';

interface AppContextType {
  // Auth & Navigation
  role: UserRole;
  phone: string;
  isLoggedIn: boolean;
  activeView: 'auth' | 'role_select' | 'rider' | 'driver';
  login: (phone: string) => void;
  selectRole: (role: UserRole) => void;
  logout: () => void;
  switchView: (view: 'rider' | 'driver') => void;

  // Map Engine & API Key State
  mapEngine: MapEngine;
  setMapEngine: (engine: MapEngine) => void;
  googleApiKey: string;
  setGoogleApiKey: (key: string) => void;

  // Driver Document State
  driverDocs: DriverDocuments;
  updateDriverDoc: (docKey: keyof DriverDocuments, status: DriverDocuments[keyof DriverDocuments]) => void;


  // Driver Online & Stats State
  driverStats: DriverStats;
  toggleDriverOnline: () => void;

  // Ride State
  currentRide: RideRequest | null;
  riderPickup: LocationPoint;
  riderDropoff: LocationPoint;
  selectedVehicle: VehicleType;
  setRiderPickup: (loc: LocationPoint) => void;
  setRiderDropoff: (loc: LocationPoint) => void;
  setSelectedVehicle: (v: VehicleType) => void;
  
  // Actions
  bookRide: (paymentMethod: 'cash' | 'upi' | 'card') => void;
  acceptRide: (rideId: string) => void;
  rejectRide: (rideId: string) => void;
  verifyOtpAndStartTrip: (otp: string) => boolean;
  completeTrip: () => void;
  cancelRide: () => void;
  resetRide: () => void;

  // Driver Real-time simulation location & heading
  driverPos: { lat: number; lng: number };
  driverHeading: number;
  setDriverPos: (pos: { lat: number; lng: number } | ((prev: { lat: number; lng: number }) => { lat: number; lng: number })) => void;
  setDriverHeading: (heading: number) => void;

  // Notifications
  notification: string | null;
  setNotification: (msg: string | null) => void;

  // Legal & Privacy Modal State
  legalModalOpen: boolean;
  legalModalTab: 'terms' | 'privacy';
  openLegalModal: (tab?: 'terms' | 'privacy') => void;
  closeLegalModal: () => void;
  setLegalModalTab: (tab: 'terms' | 'privacy') => void;
}

const DEFAULT_DOCS: DriverDocuments = {
  license: 'pending',
  rc: 'pending',
  insurance: 'pending',
  identity: 'pending',
};

const DEFAULT_STATS: DriverStats = {
  todayEarnings: 1240,
  completedRides: 5,
  acceptanceRate: 94,
  rating: 4.8,
  isOnline: true,
};

const AppContext = createContext<AppContextType | undefined>(undefined);

const BROADCAST_CHANNEL_NAME = 'nani_cab_realtime_v1';

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [phone, setPhone] = useState<string>(() => localStorage.getItem('nani_phone') || '');
  const [role, setRole] = useState<UserRole>(() => (localStorage.getItem('nani_role') as UserRole) || null);
  const [activeView, setActiveView] = useState<'auth' | 'role_select' | 'rider' | 'driver'>(() => {
    const savedRole = localStorage.getItem('nani_role');
    const savedPhone = localStorage.getItem('nani_phone');
    if (!savedPhone) return 'auth';
    if (savedRole === 'driver') return 'driver';
    if (savedRole === 'rider') return 'rider';
    return 'role_select';
  });

  // Map Engine & Google Maps API Key State
  const [googleApiKey, setGoogleApiKeyState] = useState<string>(() => {
    return localStorage.getItem('nani_google_api_key') || import.meta.env.VITE_GOOGLE_MAPS_API_KEY || '';
  });

  const [mapEngine, setMapEngineState] = useState<MapEngine>(() => {
    const savedEngine = localStorage.getItem('nani_map_engine') as MapEngine;
    if (savedEngine === 'google' || savedEngine === 'leaflet') return savedEngine;
    return 'google';
  });

  const setMapEngine = (engine: MapEngine) => {
    setMapEngineState(engine);
    localStorage.setItem('nani_map_engine', engine);
  };

  const setGoogleApiKey = (key: string) => {
    setGoogleApiKeyState(key);
    localStorage.setItem('nani_google_api_key', key);
  };

  const [driverDocs, setDriverDocs] = useState<DriverDocuments>(() => {

    const saved = localStorage.getItem('nani_driver_docs');
    return saved ? JSON.parse(saved) : DEFAULT_DOCS;
  });

  const [driverStats, setDriverStats] = useState<DriverStats>(() => {
    const saved = localStorage.getItem('nani_driver_stats');
    return saved ? JSON.parse(saved) : DEFAULT_STATS;
  });

  const [riderPickup, setRiderPickup] = useState<LocationPoint>(PRESET_LOCATIONS[1]);
  const [riderDropoff, setRiderDropoff] = useState<LocationPoint>(PRESET_LOCATIONS[0]);
  const [selectedVehicle, setSelectedVehicle] = useState<VehicleType>('sedan');

  const [currentRide, setCurrentRide] = useState<RideRequest | null>(() => {
    const saved = localStorage.getItem('nani_current_ride');
    return saved ? JSON.parse(saved) : null;
  });

  const [driverPos, setDriverPos] = useState<{ lat: number; lng: number }>({
    lat: 13.048,
    lng: 77.618,
  });

  const [driverHeading, setDriverHeading] = useState<number>(0);

  const [notification, setNotification] = useState<string | null>(null);

  // Legal Modal state
  const [legalModalOpen, setLegalModalOpen] = useState<boolean>(false);
  const [legalModalTab, setLegalModalTab] = useState<'terms' | 'privacy'>('terms');

  const openLegalModal = (tab: 'terms' | 'privacy' = 'terms') => {
    setLegalModalTab(tab);
    setLegalModalOpen(true);
  };

  const closeLegalModal = () => {
    setLegalModalOpen(false);
  };

  const broadcastChannelRef = useRef<BroadcastChannel | null>(null);

  // 1. Setup Local BroadcastChannel (Browser tabs fallback)
  useEffect(() => {
    if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
      const channel = new BroadcastChannel(BROADCAST_CHANNEL_NAME);
      broadcastChannelRef.current = channel;

      channel.onmessage = (event) => {
        const { type, payload } = event.data;
        if (type === 'SYNC_RIDE') {
          setCurrentRide(payload);
          if (payload) localStorage.setItem('nani_current_ride', JSON.stringify(payload));
          else localStorage.removeItem('nani_current_ride');
        } else if (type === 'SYNC_DRIVER_POS') {
          if (payload?.pos) {
            setDriverPos(payload.pos);
            if (typeof payload.heading === 'number') setDriverHeading(payload.heading);
          } else {
            setDriverPos(payload);
          }
        } else if (type === 'SYNC_NOTIFICATION') {
          setNotification(payload);
          setTimeout(() => setNotification(null), 4000);
        }
      };

      return () => {
        channel.close();
      };
    }
  }, []);

  // 2. Setup Supabase Realtime Subscriptions (Cross-device real-time sync)
  useEffect(() => {
    if (!isSupabaseConfigured || !supabase) return;

    // Fetch active ride on initial load
    supabase
      .from('rides')
      .select('*')
      .neq('status', 'completed')
      .neq('status', 'cancelled')
      .order('created_at', { ascending: false })
      .limit(1)
      .then(({ data, error }) => {
        if (!error && data && data.length > 0) {
          const fetchedRide = mapDbRowToRide(data[0]);
          setCurrentRide(fetchedRide);
          localStorage.setItem('nani_current_ride', JSON.stringify(fetchedRide));
        }
      });

    // Realtime channel for rides table updates
    const rideChannel = supabase
      .channel('supabase_realtime_rides')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'rides' },
        (payload) => {
          if (payload.eventType === 'DELETE') {
            setCurrentRide(null);
            localStorage.removeItem('nani_current_ride');
          } else if (payload.new) {
            const updatedRide = mapDbRowToRide(payload.new);
            setCurrentRide(updatedRide);
            localStorage.setItem('nani_current_ride', JSON.stringify(updatedRide));
          }
        }
      )
      .subscribe();

    // Realtime channel for driver locations
    const driverLocChannel = supabase
      .channel('supabase_realtime_driver_loc')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'driver_locations' },
        (payload) => {
          const newLoc = payload.new as any;
          if (newLoc && newLoc.lat && newLoc.lng) {
            setDriverPos({
              lat: Number(newLoc.lat),
              lng: Number(newLoc.lng),
            });
          }
        }
      )
      .subscribe();

    return () => {
      if (supabase) {
        supabase.removeChannel(rideChannel);
        supabase.removeChannel(driverLocChannel);
      }
    };
  }, []);

  // 3. Centralized Autonomous Vehicle Movement Simulation (Moves smoothly along route)
  useEffect(() => {
    if (!currentRide) return;

    // A. Driver moving towards pickup when ride is accepted
    if (currentRide.status === 'accepted') {
      const targetPickup = currentRide.pickup;
      const interval = setInterval(() => {
        setDriverPos((prev) => {
          const dLat = targetPickup.lat - prev.lat;
          const dLng = targetPickup.lng - prev.lng;
          const dist = Math.sqrt(dLat * dLat + dLng * dLng);

          if (dist < 0.0002) {
            return prev;
          }

          const nextLat = prev.lat + dLat * 0.15;
          const nextLng = prev.lng + dLng * 0.15;
          const heading = (Math.atan2(dLng, dLat) * (180 / Math.PI) + 360) % 360;
          setDriverHeading(heading);

          const nextPos = { lat: nextLat, lng: nextLng };
          broadcast('SYNC_DRIVER_POS', { pos: nextPos, heading });
          return nextPos;
        });
      }, 700);

      return () => clearInterval(interval);
    }

    // B. Driver cruising along the route to destination when in_transit
    if (currentRide.status === 'in_transit') {
      const points = generateRoutePoints(currentRide.pickup, currentRide.dropoff, 60);
      let stepIndex = 0;

      // Check if driver is already partially through
      let minDistance = Infinity;
      points.forEach((pt: { lat: number; lng: number }, idx: number) => {
        const d = Math.hypot(pt.lat - driverPos.lat, pt.lng - driverPos.lng);
        if (d < minDistance) {
          minDistance = d;
          stepIndex = idx;
        }
      });

      const interval = setInterval(() => {
        if (stepIndex < points.length) {
          const currentPoint = points[stepIndex];
          const nextPoint = points[Math.min(stepIndex + 1, points.length - 1)];

          const dLat = nextPoint.lat - currentPoint.lat;
          const dLng = nextPoint.lng - currentPoint.lng;
          const heading =
            dLat === 0 && dLng === 0
              ? 0
              : (Math.atan2(dLng, dLat) * (180 / Math.PI) + 360) % 360;

          setDriverHeading(heading);
          setDriverPos(currentPoint);
          broadcast('SYNC_DRIVER_POS', { pos: currentPoint, heading });
          stepIndex++;
        }
      }, 700);

      return () => clearInterval(interval);
    }
  }, [currentRide?.status, currentRide?.id]);

  const broadcast = (type: string, payload: any) => {
    if (broadcastChannelRef.current) {
      broadcastChannelRef.current.postMessage({ type, payload });
    }
  };

  const syncRideState = async (ride: RideRequest | null) => {
    setCurrentRide(ride);
    if (ride) {
      localStorage.setItem('nani_current_ride', JSON.stringify(ride));
      if (isSupabaseConfigured && supabase) {
        try {
          const dbRow = mapRideToDbRow(ride);
          await supabase.from('rides').upsert(dbRow);
        } catch (err) {
          console.error('Supabase ride upsert error:', err);
        }
      }
    } else {
      const existingRideId = currentRide?.id;
      localStorage.removeItem('nani_current_ride');
      if (isSupabaseConfigured && supabase && existingRideId) {
        try {
          await supabase.from('rides').delete().eq('id', existingRideId);
        } catch (err) {
          console.error('Supabase ride delete error:', err);
        }
      }
    }
    broadcast('SYNC_RIDE', ride);
  };

  const login = (inputPhone: string) => {
    setPhone(inputPhone);
    localStorage.setItem('nani_phone', inputPhone);
    setActiveView('role_select');
  };

  const selectRole = (selectedRole: UserRole) => {
    setRole(selectedRole);
    if (selectedRole) {
      localStorage.setItem('nani_role', selectedRole);
      setActiveView(selectedRole);
    }
  };

  const logout = () => {
    setPhone('');
    setRole(null);
    localStorage.removeItem('nani_phone');
    localStorage.removeItem('nani_role');
    setActiveView('auth');
  };

  const switchView = (view: 'rider' | 'driver') => {
    setRole(view);
    localStorage.setItem('nani_role', view);
    setActiveView(view);
  };

  const updateDriverDoc = (docKey: keyof DriverDocuments, status: DriverDocuments[keyof DriverDocuments]) => {
    const updated = { ...driverDocs, [docKey]: status };
    setDriverDocs(updated);
    localStorage.setItem('nani_driver_docs', JSON.stringify(updated));
  };

  const toggleDriverOnline = () => {
    const updated = { ...driverStats, isOnline: !driverStats.isOnline };
    setDriverStats(updated);
    localStorage.setItem('nani_driver_stats', JSON.stringify(updated));
  };

  const bookRide = (paymentMethod: 'cash' | 'upi' | 'card') => {
    const dist = calculateDistance(
      riderPickup.lat,
      riderPickup.lng,
      riderDropoff.lat,
      riderDropoff.lng
    );
    const fare = calculateFare(dist, selectedVehicle);
    const mockOtp = Math.floor(1000 + Math.random() * 9000).toString();

    // Spawn driver close to rider's pickup (~600m)
    const initialDriverPos = {
      lat: riderPickup.lat + 0.005,
      lng: riderPickup.lng + 0.004,
    };
    setDriverPos(initialDriverPos);
    setDriverHeading(45);

    const newRide: RideRequest = {
      id: 'RIDE-' + Math.floor(10000 + Math.random() * 90000),
      riderId: 'RIDER-99',
      riderName: 'Rahul Sharma',
      riderPhone: phone || '+91 98765 43210',
      riderRating: 4.9,
      pickup: riderPickup,
      dropoff: riderDropoff,
      distanceKm: dist,
      durationMins: Math.round(dist * 2.5),
      vehicleType: selectedVehicle,
      fare,
      otp: mockOtp,
      status: 'requested',
      paymentMethod,
      driverLat: initialDriverPos.lat,
      driverLng: initialDriverPos.lng,
      driverHeading: 45,
      createdAt: Date.now(),
    };

    syncRideState(newRide);

    const msg = `🚨 New Ride Booked! ${riderPickup.name.split(',')[0]} ➔ ${riderDropoff.name.split(',')[0]} (₹${fare})`;
    setNotification(msg);
    broadcast('SYNC_NOTIFICATION', msg);
    setTimeout(() => setNotification(null), 5000);
  };

  const acceptRide = (rideId: string) => {
    if (!currentRide || currentRide.id !== rideId) return;

    const updatedRide: RideRequest = {
      ...currentRide,
      status: 'accepted',
      driverId: 'DRIVER-404',
      driverName: 'Vikram Singh',
      driverPhone: '+91 91234 56789',
      driverRating: 4.85,
      vehicleModel: 'White Swift Dzire (AC)',
      vehiclePlate: 'KA-04-EV-7788',
      driverLat: driverPos.lat || currentRide.pickup.lat + 0.005,
      driverLng: driverPos.lng || currentRide.pickup.lng + 0.004,
      driverHeading: driverHeading || 45,
    };

    syncRideState(updatedRide);

    const msg = '✨ Ride Accepted by Driver Vikram Singh!';
    setNotification(msg);
    broadcast('SYNC_NOTIFICATION', msg);
    setTimeout(() => setNotification(null), 5000);
  };

  const rejectRide = (rideId: string) => {
    if (!currentRide || currentRide.id !== rideId) return;
    syncRideState(null);
    const msg = '❌ Ride Request Rejected by Driver';
    setNotification(msg);
    broadcast('SYNC_NOTIFICATION', msg);
    setTimeout(() => setNotification(null), 4000);
  };

  const verifyOtpAndStartTrip = (inputOtp: string): boolean => {
    if (!currentRide) return false;
    if (inputOtp.trim() === currentRide.otp) {
      const updated: RideRequest = {
        ...currentRide,
        status: 'in_transit',
      };
      syncRideState(updated);
      const msg = '🚖 OTP Verified! Trip is now in progress.';
      setNotification(msg);
      broadcast('SYNC_NOTIFICATION', msg);
      setTimeout(() => setNotification(null), 4000);
      return true;
    }
    return false;
  };

  const completeTrip = () => {
    if (!currentRide) return;
    const fareEarned = currentRide.fare;

    const updatedStats: DriverStats = {
      ...driverStats,
      todayEarnings: driverStats.todayEarnings + fareEarned,
      completedRides: driverStats.completedRides + 1,
    };
    setDriverStats(updatedStats);
    localStorage.setItem('nani_driver_stats', JSON.stringify(updatedStats));

    const updatedRide: RideRequest = {
      ...currentRide,
      status: 'completed',
    };
    syncRideState(updatedRide);

    const msg = `🎉 Trip Completed! Collected ₹${fareEarned}`;
    setNotification(msg);
    broadcast('SYNC_NOTIFICATION', msg);
    setTimeout(() => setNotification(null), 5000);
  };

  const cancelRide = () => {
    if (!currentRide) return;
    const updated: RideRequest = {
      ...currentRide,
      status: 'cancelled',
    };
    syncRideState(updated);
    setTimeout(() => {
      syncRideState(null);
    }, 2000);
  };

  const resetRide = () => {
    syncRideState(null);
  };

  const updateDriverPos = (
    posOrUpdater: { lat: number; lng: number } | ((prev: { lat: number; lng: number }) => { lat: number; lng: number })
  ) => {
    setDriverPos((prev) => {
      const nextPos = typeof posOrUpdater === 'function' ? posOrUpdater(prev) : posOrUpdater;
      broadcast('SYNC_DRIVER_POS', nextPos);

      if (isSupabaseConfigured && supabase) {
        (async () => {
          try {
            const { error } = await supabase
              .from('driver_locations')
              .upsert({
                driver_id: 'DRIVER-404',
                driver_name: 'Vikram Singh',
                lat: nextPos.lat,
                lng: nextPos.lng,
                is_online: true,
                updated_at: new Date().toISOString(),
              });
            if (error) console.error('Supabase driver location upsert error:', error);
          } catch (err) {
            console.error('Supabase driver location upsert error:', err);
          }
        })();
      }
      return nextPos;
    });
  };

  return (
    <AppContext.Provider
      value={{
        role,
        phone,
        isLoggedIn: !!phone,
        activeView,
        login,
        selectRole,
        logout,
        switchView,

        mapEngine,
        setMapEngine,
        googleApiKey,
        setGoogleApiKey,

        driverDocs,

        updateDriverDoc,

        driverStats,
        toggleDriverOnline,

        currentRide,
        riderPickup,
        riderDropoff,
        selectedVehicle,
        setRiderPickup,
        setRiderDropoff,
        setSelectedVehicle,

        bookRide,
        acceptRide,
        rejectRide,
        verifyOtpAndStartTrip,
        completeTrip,
        cancelRide,
        resetRide,

        driverPos,
        driverHeading,
        setDriverPos: updateDriverPos,
        setDriverHeading,

        notification,
        setNotification,

        legalModalOpen,
        legalModalTab,
        openLegalModal,
        closeLegalModal,
        setLegalModalTab,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};

