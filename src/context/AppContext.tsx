import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import type {
  UserRole,
  MapEngine,
  DriverDocuments,
  DriverDocumentStatus,
  DriverStats,
  RideRequest,
  LocationPoint,
  VehicleType,
  DriverApplicant,
  ThemeMode,
  UserProfile,
} from '../types';


import {
  PRESET_LOCATIONS,
  INITIAL_DRIVER_APPLICANTS,
  calculateDistance,
  calculateFare,
  generateRoutePoints,
} from '../utils/mockData';
import {
  supabase,
  isSupabaseConfigured,
  mapDbRowToRide,
  mapRideToDbRow,
  mapDbRowToDriverApplicant,
  mapDriverApplicantToDbRow,
} from '../lib/supabase';

interface AppContextType {
  // Auth & Navigation
  role: UserRole;
  phone: string;
  isLoggedIn: boolean;
  activeView: 'auth' | 'role_select' | 'rider' | 'driver' | 'admin';
  login: (phone: string) => void;
  selectRole: (role: UserRole) => void;
  logout: () => void;
  switchView: (view: 'rider' | 'driver' | 'admin') => void;

  // Admin Portal & Authentication
  isAdminLoggedIn: boolean;
  showAdminLogin: boolean;
  setShowAdminLogin: (show: boolean) => void;
  openAdminPortal: () => void;
  adminLogin: (emailOrId: string, passOrPin: string) => boolean;
  adminLogout: () => void;

  // Admin Driver Verification State & Actions
  driverApplicants: DriverApplicant[];
  verifyDriverDoc: (driverId: string, docKey: 'license' | 'rc' | 'insurance' | 'identity') => void;
  rejectDriverDoc: (driverId: string, docKey: 'license' | 'rc' | 'insurance' | 'identity', reason: string) => void;
  requestReuploadDoc: (driverId: string, docKey: 'license' | 'rc' | 'insurance' | 'identity', reason?: string) => void;
  approveAllDriverDocs: (driverId: string) => void;

  // Theme State
  theme: ThemeMode;
  toggleTheme: () => void;
  setTheme: (theme: ThemeMode) => void;

  // User Profile State
  userProfile: UserProfile;
  updateUserProfile: (updates: Partial<UserProfile>) => void;
  profileModalOpen: boolean;
  setProfileModalOpen: (open: boolean) => void;


  // Map Engine & API Key State
  mapEngine: MapEngine;
  setMapEngine: (engine: MapEngine) => void;
  googleApiKey: string;
  setGoogleApiKey: (key: string) => void;

  // Driver Document State
  driverDocs: DriverDocuments;
  updateDriverDoc: (docKey: keyof DriverDocuments, status: DriverDocumentStatus, details?: any) => void;

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
  setDriverPos: (
    pos: { lat: number; lng: number } | ((prev: { lat: number; lng: number }) => { lat: number; lng: number })
  ) => void;
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
  license: 'uploaded',
  rc: 'uploaded',
  insurance: 'uploaded',
  identity: 'uploaded',
  details: {
    license: { status: 'uploaded', docNo: 'KA04-20220019283', expiry: '2032-08-15', issuedBy: 'RTO Yeshwanthpur' },
    rc: { status: 'uploaded', docNo: 'RC-KA04EV7788-991', expiry: '2035-11-20', issuedBy: 'Transport Dept Karnataka' },
    insurance: { status: 'uploaded', docNo: 'HDFC-ERGO-COMM-88910', expiry: '2027-04-30', issuedBy: 'HDFC ERGO General' },
    identity: { status: 'uploaded', docNo: 'UIDAI-XXXX-XXXX-4819', issuedBy: 'Govt of India' },
  },
};

const DEFAULT_STATS: DriverStats = {
  todayEarnings: 1240,
  completedRides: 5,
  acceptanceRate: 94,
  rating: 4.85,
  isOnline: false,
};

const DEFAULT_USER_PROFILE: UserProfile = {
  name: 'Rahul Sharma',
  phone: '+91 98765 43210',
  email: 'rahul.sharma@nanicab.in',
  city: 'Bengaluru, Karnataka',
  rating: 4.92,
  totalRides: 48,
  memberSince: 'March 2024',
  emergencyContact: '+91 98765 00001',
  upiId: 'rahul@oksbi',
};

const AppContext = createContext<AppContextType | undefined>(undefined);


const BROADCAST_CHANNEL_NAME = 'nani_cab_realtime_v1';

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [phone, setPhone] = useState<string>(() => localStorage.getItem('nani_phone') || '');
  const [role, setRole] = useState<UserRole>(() => (localStorage.getItem('nani_role') as UserRole) || null);

  // Check URL query param or hash for secret admin access
  const [isAdminLoggedIn, setIsAdminLoggedIn] = useState<boolean>(() => {
    return sessionStorage.getItem('nani_admin_auth') === 'true';
  });

  const [showAdminLogin, setShowAdminLogin] = useState<boolean>(false);

  const [activeView, setActiveView] = useState<'auth' | 'role_select' | 'rider' | 'driver' | 'admin'>(() => {
    if (typeof window !== 'undefined') {
      const isUrlAdmin =
        window.location.search.includes('admin') ||
        window.location.hash.includes('admin') ||
        window.location.pathname.includes('/admin');

      if (isUrlAdmin) {
        if (sessionStorage.getItem('nani_admin_auth') === 'true') {
          return 'admin';
        }
      }
    }

    const savedRole = localStorage.getItem('nani_role');
    const savedPhone = localStorage.getItem('nani_phone');
    if (!savedPhone) return 'auth';
    if (savedRole === 'driver') return 'driver';
    if (savedRole === 'rider') return 'rider';
    return 'role_select';
  });

  // Admin Driver Applicants State
  const [driverApplicants, setDriverApplicants] = useState<DriverApplicant[]>(() => {
    const saved = localStorage.getItem('nani_driver_applicants');
    return saved ? JSON.parse(saved) : INITIAL_DRIVER_APPLICANTS;
  });

  // Theme Mode State ('dark' | 'light')
  const [theme, setThemeState] = useState<ThemeMode>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('nani_theme') as ThemeMode;
      if (saved === 'dark' || saved === 'light') return saved;
      if (window.matchMedia && window.matchMedia('(prefers-color-scheme: light)').matches) {
        return 'light';
      }
    }
    return 'dark';
  });

  const setTheme = (newTheme: ThemeMode) => {
    setThemeState(newTheme);
    localStorage.setItem('nani_theme', newTheme);
    if (typeof document !== 'undefined') {
      if (newTheme === 'light') {
        document.documentElement.classList.add('light');
        document.documentElement.classList.remove('dark');
        document.documentElement.setAttribute('data-theme', 'light');
      } else {
        document.documentElement.classList.add('dark');
        document.documentElement.classList.remove('light');
        document.documentElement.setAttribute('data-theme', 'dark');
      }
    }
    if (broadcastChannelRef.current) {
      broadcastChannelRef.current.postMessage({ type: 'SYNC_THEME', payload: newTheme });
    }
  };

  const toggleTheme = () => {
    setTheme(theme === 'dark' ? 'light' : 'dark');
  };

  useEffect(() => {
    if (typeof document !== 'undefined') {
      if (theme === 'light') {
        document.documentElement.classList.add('light');
        document.documentElement.classList.remove('dark');
        document.documentElement.setAttribute('data-theme', 'light');
      } else {
        document.documentElement.classList.add('dark');
        document.documentElement.classList.remove('light');
        document.documentElement.setAttribute('data-theme', 'dark');
      }
    }
  }, [theme]);

  // User Profile State
  const [userProfile, setUserProfile] = useState<UserProfile>(() => {
    const saved = localStorage.getItem('nani_user_profile');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {}
    }
    const currentPhone = localStorage.getItem('nani_phone');
    return {
      ...DEFAULT_USER_PROFILE,
      phone: currentPhone || DEFAULT_USER_PROFILE.phone,
    };
  });

  const [profileModalOpen, setProfileModalOpen] = useState<boolean>(false);

  const updateUserProfile = (updates: Partial<UserProfile>) => {
    setUserProfile((prev) => {
      const next = { ...prev, ...updates };
      localStorage.setItem('nani_user_profile', JSON.stringify(next));
      if (broadcastChannelRef.current) {
        broadcastChannelRef.current.postMessage({ type: 'SYNC_USER_PROFILE', payload: next });
      }
      return next;
    });
  };

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

  // Setup Local BroadcastChannel for Cross-tab Instant Sync
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
        } else if (type === 'SYNC_DRIVER_DOCS') {
          setDriverDocs(payload);
          localStorage.setItem('nani_driver_docs', JSON.stringify(payload));
        } else if (type === 'SYNC_APPLICANTS') {
          setDriverApplicants(payload);
          localStorage.setItem('nani_driver_applicants', JSON.stringify(payload));
        } else if (type === 'SYNC_THEME') {
          setThemeState(payload);
          localStorage.setItem('nani_theme', payload);
          if (typeof document !== 'undefined') {
            if (payload === 'light') {
              document.documentElement.classList.add('light');
              document.documentElement.classList.remove('dark');
              document.documentElement.setAttribute('data-theme', 'light');
            } else {
              document.documentElement.classList.add('dark');
              document.documentElement.classList.remove('light');
              document.documentElement.setAttribute('data-theme', 'dark');
            }
          }
        } else if (type === 'SYNC_USER_PROFILE') {
          setUserProfile(payload);
          localStorage.setItem('nani_user_profile', JSON.stringify(payload));
        }


      };

      return () => {
        channel.close();
      };
    }
  }, []);

  // Listen to URL changes for hidden admin gateway
  useEffect(() => {
    const handleUrlCheck = () => {
      const isUrlAdmin =
        window.location.search.includes('admin') ||
        window.location.hash.includes('admin') ||
        window.location.pathname.includes('/admin');

      if (isUrlAdmin) {
        const isAuth = sessionStorage.getItem('nani_admin_auth') === 'true';
        if (isAuth) {
          setActiveView('admin');
        } else {
          setShowAdminLogin(true);
        }
      }
    };

    handleUrlCheck();
    window.addEventListener('popstate', handleUrlCheck);
    window.addEventListener('hashchange', handleUrlCheck);
    return () => {
      window.removeEventListener('popstate', handleUrlCheck);
      window.removeEventListener('hashchange', handleUrlCheck);
    };
  }, []);

  // Setup Supabase Realtime Subscriptions
  useEffect(() => {
    if (!isSupabaseConfigured || !supabase) return;

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

    // Setup Rides Realtime Subscription
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

    // Setup Driver Applicants KYC & Verification Realtime Subscription
    supabase
      .from('driver_applicants')
      .select('*')
      .order('id', { ascending: true })
      .then(({ data, error }) => {
        if (!error && data && data.length > 0) {
          const fetchedApplicants = data.map(mapDbRowToDriverApplicant);
          setDriverApplicants(fetchedApplicants);
          localStorage.setItem('nani_driver_applicants', JSON.stringify(fetchedApplicants));

          // If DRV-101 is present, sync DRV-101 driver docs
          const drv101 = fetchedApplicants.find((a) => a.id === 'DRV-101');
          if (drv101) {
            setDriverDocs({
              license: drv101.docs.license.status,
              rc: drv101.docs.rc.status,
              insurance: drv101.docs.insurance.status,
              identity: drv101.docs.identity.status,
              details: drv101.docs,
            });
          }
        }
      });

    const applicantsChannel = supabase
      .channel('supabase_realtime_driver_applicants')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'driver_applicants' },
        (payload) => {
          if (payload.new) {
            const updated = mapDbRowToDriverApplicant(payload.new);
            setDriverApplicants((prev) => {
              const exists = prev.some((a) => a.id === updated.id);
              const nextList = exists
                ? prev.map((a) => (a.id === updated.id ? updated : a))
                : [...prev, updated];
              localStorage.setItem('nani_driver_applicants', JSON.stringify(nextList));
              return nextList;
            });

            if (updated.id === 'DRV-101') {
              setDriverDocs({
                license: updated.docs.license.status,
                rc: updated.docs.rc.status,
                insurance: updated.docs.insurance.status,
                identity: updated.docs.identity.status,
                details: updated.docs,
              });
            }
          }
        }
      )
      .subscribe();

    return () => {
      supabase?.removeChannel(rideChannel);
      supabase?.removeChannel(applicantsChannel);
    };
  }, []);


  // Simulated GPS Driver Movement & Navigation
  useEffect(() => {
    if (!currentRide) return;

    // A. Driver moving towards pickup
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

    // B. Driver cruising along route to dropoff
    if (currentRide.status === 'in_transit') {
      const points = generateRoutePoints(currentRide.pickup, currentRide.dropoff, 60);
      let stepIndex = 0;

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

  // Auth Functions
  const login = (inputPhone: string) => {
    setPhone(inputPhone);
    localStorage.setItem('nani_phone', inputPhone);
    setUserProfile((prev) => {
      const next = { ...prev, phone: inputPhone };
      localStorage.setItem('nani_user_profile', JSON.stringify(next));
      return next;
    });
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

  const switchView = (view: 'rider' | 'driver' | 'admin') => {
    if (view === 'admin') {
      if (isAdminLoggedIn) {
        setActiveView('admin');
      } else {
        setShowAdminLogin(true);
      }
      return;
    }
    setRole(view);
    localStorage.setItem('nani_role', view);
    setActiveView(view);
  };

  // Admin Authentication Functions
  const adminLogin = (emailOrId: string, passOrPin: string): boolean => {
    const cleanId = emailOrId.trim().toLowerCase();
    const cleanPass = passOrPin.trim();

    const isValid =
      (cleanId === 'admin@nanicab.com' && (cleanPass === 'NaniAdmin@2026' || cleanPass === 'admin123')) ||
      (cleanId === 'admin' && (cleanPass === '987654' || cleanPass === 'admin123')) ||
      (cleanId === 'nanicab' && cleanPass === 'admin2026');

    if (isValid) {
      setIsAdminLoggedIn(true);
      sessionStorage.setItem('nani_admin_auth', 'true');
      setShowAdminLogin(false);
      setActiveView('admin');
      return true;
    }
    return false;
  };

  const adminLogout = () => {
    setIsAdminLoggedIn(false);
    sessionStorage.removeItem('nani_admin_auth');
    if (activeView === 'admin') {
      const savedRole = localStorage.getItem('nani_role');
      const savedPhone = localStorage.getItem('nani_phone');
      if (!savedPhone) setActiveView('auth');
      else if (savedRole === 'driver') setActiveView('driver');
      else if (savedRole === 'rider') setActiveView('rider');
      else setActiveView('role_select');
    }
  };

  const openAdminPortal = () => {
    if (isAdminLoggedIn) {
      setActiveView('admin');
    } else {
      setShowAdminLogin(true);
    }
  };

  // Admin Driver Document Verification Actions
  const updateApplicantAndSync = (updatedApplicants: DriverApplicant[]) => {
    setDriverApplicants(updatedApplicants);
    localStorage.setItem('nani_driver_applicants', JSON.stringify(updatedApplicants));
    broadcast('SYNC_APPLICANTS', updatedApplicants);

    if (isSupabaseConfigured && supabase) {
      const client = supabase;
      updatedApplicants.forEach((app) => {
        client
          .from('driver_applicants')
          .upsert(mapDriverApplicantToDbRow(app))
          .then(({ error }) => {
            if (error) console.error('Supabase applicant upsert error:', error);
          });
      });
    }

  };


  const syncDriverDocsState = (newDocs: DriverDocuments) => {
    setDriverDocs(newDocs);
    localStorage.setItem('nani_driver_docs', JSON.stringify(newDocs));
    broadcast('SYNC_DRIVER_DOCS', newDocs);
  };

  const verifyDriverDoc = (driverId: string, docKey: 'license' | 'rc' | 'insurance' | 'identity') => {
    const updated = driverApplicants.map((applicant) => {
      if (applicant.id === driverId) {
        const updatedDocs = {
          ...applicant.docs,
          [docKey]: {
            ...applicant.docs[docKey],
            status: 'verified' as DriverDocumentStatus,
            rejectionReason: undefined,
            lastUpdated: new Date().toISOString().split('T')[0],
          },
        };

        const allVerified =
          updatedDocs.license.status === 'verified' &&
          updatedDocs.rc.status === 'verified' &&
          updatedDocs.insurance.status === 'verified' &&
          updatedDocs.identity.status === 'verified';

        return {
          ...applicant,
          overallStatus: (allVerified ? 'verified' : 'pending') as 'verified' | 'pending' | 'rejected',
          docs: updatedDocs,
        };
      }
      return applicant;
    });

    updateApplicantAndSync(updated);

    // If updating current logged-in driver (DRV-101)
    if (driverId === 'DRV-101') {
      const nextDocs: DriverDocuments = {
        ...driverDocs,
        [docKey]: 'verified',
        details: {
          ...driverDocs.details,
          [docKey]: {
            ...driverDocs.details?.[docKey],
            status: 'verified',
            rejectionReason: undefined,
            lastUpdated: new Date().toISOString().split('T')[0],
          },
        },
      };
      syncDriverDocsState(nextDocs);
    }

    const msg = `✅ Admin Verified ${docKey.toUpperCase()} for Driver ${driverId}`;
    setNotification(msg);
    broadcast('SYNC_NOTIFICATION', msg);
    setTimeout(() => setNotification(null), 4000);
  };

  const rejectDriverDoc = (
    driverId: string,
    docKey: 'license' | 'rc' | 'insurance' | 'identity',
    reason: string
  ) => {
    const updated = driverApplicants.map((applicant) => {
      if (applicant.id === driverId) {
        const updatedDocs = {
          ...applicant.docs,
          [docKey]: {
            ...applicant.docs[docKey],
            status: 'rejected' as DriverDocumentStatus,
            rejectionReason: reason || 'Document image is blurred or details do not match commercial compliance.',
            lastUpdated: new Date().toISOString().split('T')[0],
          },
        };

        return {
          ...applicant,
          overallStatus: 'rejected' as const,
          docs: updatedDocs,
        };
      }
      return applicant;
    });

    updateApplicantAndSync(updated);

    // If updating current logged-in driver
    if (driverId === 'DRV-101') {
      const nextDocs: DriverDocuments = {
        ...driverDocs,
        [docKey]: 'rejected',
        details: {
          ...driverDocs.details,
          [docKey]: {
            ...driverDocs.details?.[docKey],
            status: 'rejected',
            rejectionReason: reason,
            lastUpdated: new Date().toISOString().split('T')[0],
          },
        },
      };
      syncDriverDocsState(nextDocs);
    }

    const msg = `❌ Admin Rejected ${docKey.toUpperCase()} for Driver ${driverId}`;
    setNotification(msg);
    broadcast('SYNC_NOTIFICATION', msg);
    setTimeout(() => setNotification(null), 4000);
  };

  const requestReuploadDoc = (
    driverId: string,
    docKey: 'license' | 'rc' | 'insurance' | 'identity',
    reason?: string
  ) => {
    const updated = driverApplicants.map((applicant) => {
      if (applicant.id === driverId) {
        const updatedDocs = {
          ...applicant.docs,
          [docKey]: {
            ...applicant.docs[docKey],
            status: 'pending' as DriverDocumentStatus,
            rejectionReason: reason,
            lastUpdated: new Date().toISOString().split('T')[0],
          },
        };
        return {
          ...applicant,
          overallStatus: 'pending' as const,
          docs: updatedDocs,
        };
      }
      return applicant;
    });

    updateApplicantAndSync(updated);

    if (driverId === 'DRV-101') {
      const nextDocs: DriverDocuments = {
        ...driverDocs,
        [docKey]: 'pending',
        details: {
          ...driverDocs.details,
          [docKey]: {
            ...driverDocs.details?.[docKey],
            status: 'pending',
            rejectionReason: reason,
            lastUpdated: new Date().toISOString().split('T')[0],
          },
        },
      };
      syncDriverDocsState(nextDocs);
    }
  };

  const approveAllDriverDocs = (driverId: string) => {
    const updated = driverApplicants.map((applicant) => {
      if (applicant.id === driverId) {
        return {
          ...applicant,
          overallStatus: 'verified' as const,
          docs: {
            license: { ...applicant.docs.license, status: 'verified' as const, rejectionReason: undefined },
            rc: { ...applicant.docs.rc, status: 'verified' as const, rejectionReason: undefined },
            insurance: { ...applicant.docs.insurance, status: 'verified' as const, rejectionReason: undefined },
            identity: { ...applicant.docs.identity, status: 'verified' as const, rejectionReason: undefined },
          },
        };
      }
      return applicant;
    });

    updateApplicantAndSync(updated);

    if (driverId === 'DRV-101') {
      const nextDocs: DriverDocuments = {
        license: 'verified',
        rc: 'verified',
        insurance: 'verified',
        identity: 'verified',
        details: {
          license: { ...driverDocs.details?.license, status: 'verified', rejectionReason: undefined },
          rc: { ...driverDocs.details?.rc, status: 'verified', rejectionReason: undefined },
          insurance: { ...driverDocs.details?.insurance, status: 'verified', rejectionReason: undefined },
          identity: { ...driverDocs.details?.identity, status: 'verified', rejectionReason: undefined },
        },
      };
      syncDriverDocsState(nextDocs);
    }

    const msg = `⚡ 1-Click All Documents Approved for Driver ${driverId}!`;
    setNotification(msg);
    broadcast('SYNC_NOTIFICATION', msg);
    setTimeout(() => setNotification(null), 4000);
  };

  const updateDriverDoc = (
    docKey: keyof DriverDocuments,
    status: DriverDocumentStatus,
    docDetails?: any
  ) => {
    const updated: DriverDocuments = {
      ...driverDocs,
      [docKey]: status,
      details: {
        ...driverDocs.details,
        [docKey]: {
          ...driverDocs.details?.[docKey as keyof typeof driverDocs.details],
          status,
          ...(docDetails || {}),
          lastUpdated: new Date().toISOString().split('T')[0],
        },
      },
    };
    syncDriverDocsState(updated);

    // Also update driver applicant in admin list
    const updatedApplicants = driverApplicants.map((app) => {
      if (app.id === 'DRV-101') {
        const updatedDocs = {
          ...app.docs,
          [docKey]: {
            ...app.docs[docKey as keyof typeof app.docs],
            status,
            ...(docDetails || {}),
            lastUpdated: new Date().toISOString().split('T')[0],
          },
        };
        const allVerified =
          updatedDocs.license.status === 'verified' &&
          updatedDocs.rc.status === 'verified' &&
          updatedDocs.insurance.status === 'verified' &&
          updatedDocs.identity.status === 'verified';

        return {
          ...app,
          overallStatus: (allVerified ? 'verified' : 'pending') as 'verified' | 'pending' | 'rejected',
          docs: updatedDocs,
        };
      }
      return app;
    });

    updateApplicantAndSync(updatedApplicants);
  };

  const toggleDriverOnline = () => {
    // Compliance Guard: Verify all 4 documents before allowing driver to go online
    const isCompliant =
      driverDocs.license === 'verified' &&
      driverDocs.rc === 'verified' &&
      driverDocs.insurance === 'verified' &&
      driverDocs.identity === 'verified';

    if (!driverStats.isOnline && !isCompliant) {
      const msg = '⚠️ Compliance Alert: Admin verification required for all 4 certificates before going online!';
      setNotification(msg);
      broadcast('SYNC_NOTIFICATION', msg);
      setTimeout(() => setNotification(null), 5000);
      return;
    }

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

        // Admin
        isAdminLoggedIn,
        showAdminLogin,
        setShowAdminLogin,
        openAdminPortal,
        adminLogin,
        adminLogout,
        driverApplicants,
        verifyDriverDoc,
        rejectDriverDoc,
        requestReuploadDoc,
        approveAllDriverDocs,

        mapEngine,
        setMapEngine,
        googleApiKey,
        setGoogleApiKey,

        theme,
        toggleTheme,
        setTheme,

        userProfile,
        updateUserProfile,
        profileModalOpen,
        setProfileModalOpen,

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
