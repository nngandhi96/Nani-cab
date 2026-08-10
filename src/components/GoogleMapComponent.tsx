/// <reference types="google.maps" />
import React, { useEffect, useRef, useState } from 'react';
import type { LocationPoint } from '../types';
import { HOTSPOT_SURGE_ZONES, generateRoutePoints } from '../utils/mockData';


interface GoogleMapComponentProps {
  apiKey: string;
  pickup?: LocationPoint;
  dropoff?: LocationPoint;
  driverPos?: { lat: number; lng: number };
  onMapClick?: (lat: number, lng: number) => void;
  interactive?: boolean;
  showSurgeHotspots?: boolean;
  onScriptError?: () => void;
}

// Dark modern Uber/Nani Cab style map JSON
const DARK_MAP_STYLE: google.maps.MapTypeStyle[] = [
  { elementType: 'geometry', stylers: [{ color: '#0f172a' }] },
  { elementType: 'labels.text.stroke', stylers: [{ color: '#0f172a' }] },
  { elementType: 'labels.text.fill', stylers: [{ color: '#94a3b8' }] },
  {
    featureType: 'administrative.locality',
    elementType: 'labels.text.fill',
    stylers: [{ color: '#cbd5e1' }],
  },
  {
    featureType: 'poi',
    elementType: 'labels.text.fill',
    stylers: [{ color: '#64748b' }],
  },
  {
    featureType: 'poi.park',
    elementType: 'geometry',
    stylers: [{ color: '#132338' }],
  },
  {
    featureType: 'poi.park',
    elementType: 'labels.text.fill',
    stylers: [{ color: '#334155' }],
  },
  {
    featureType: 'road',
    elementType: 'geometry',
    stylers: [{ color: '#1e293b' }],
  },
  {
    featureType: 'road',
    elementType: 'geometry.stroke',
    stylers: [{ color: '#0f172a' }],
  },
  {
    featureType: 'road',
    elementType: 'labels.text.fill',
    stylers: [{ color: '#64748b' }],
  },
  {
    featureType: 'road.highway',
    elementType: 'geometry',
    stylers: [{ color: '#334155' }],
  },
  {
    featureType: 'road.highway',
    elementType: 'geometry.stroke',
    stylers: [{ color: '#1e293b' }],
  },
  {
    featureType: 'road.highway',
    elementType: 'labels.text.fill',
    stylers: [{ color: '#f59e0b' }],
  },
  {
    featureType: 'transit',
    elementType: 'geometry',
    stylers: [{ color: '#1e293b' }],
  },
  {
    featureType: 'transit.station',
    elementType: 'labels.text.fill',
    stylers: [{ color: '#94a3b8' }],
  },
  {
    featureType: 'water',
    elementType: 'geometry',
    stylers: [{ color: '#030712' }],
  },
  {
    featureType: 'water',
    elementType: 'labels.text.fill',
    stylers: [{ color: '#38bdf8' }],
  },
  {
    featureType: 'water',
    elementType: 'labels.text.stroke',
    stylers: [{ color: '#030712' }],
  },
];

export const GoogleMapComponent: React.FC<GoogleMapComponentProps> = ({
  apiKey,
  pickup,
  dropoff,
  driverPos,
  onMapClick,
  interactive = true,
  showSurgeHotspots = false,
  onScriptError,
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<google.maps.Map | null>(null);
  const markersRef = useRef<google.maps.Marker[]>([]);
  const circlesRef = useRef<google.maps.Circle[]>([]);
  const polylineRef = useRef<google.maps.Polyline | null>(null);
  const directionsRendererRef = useRef<google.maps.DirectionsRenderer | null>(null);

  const [isLoaded, setIsLoaded] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);

  // Load Google Maps Script dynamically
  useEffect(() => {
    if (!apiKey) {
      setLoadError('Google Maps API key missing');
      if (onScriptError) onScriptError();
      return;
    }

    if (window.google && window.google.maps) {
      setIsLoaded(true);
      return;
    }

    const existingScript = document.getElementById('google-maps-js-script');
    if (existingScript) {
      existingScript.addEventListener('load', () => setIsLoaded(true));
      existingScript.addEventListener('error', () => {
        setLoadError('Failed to load Google Maps script');
        if (onScriptError) onScriptError();
      });
      return;
    }

    const script = document.createElement('script');
    script.id = 'google-maps-js-script';
    script.src = `https://maps.googleapis.com/maps/api/js?key=${encodeURIComponent(
      apiKey
    )}&libraries=places,geometry`;
    script.async = true;
    script.defer = true;

    script.onload = () => {
      setIsLoaded(true);
    };

    script.onerror = () => {
      setLoadError('Google Maps script load error');
      if (onScriptError) onScriptError();
    };

    document.head.appendChild(script);
  }, [apiKey, onScriptError]);

  // Initialize Map
  useEffect(() => {
    if (!isLoaded || !mapContainerRef.current || mapInstanceRef.current) return;

    try {
      const defaultCenter = pickup
        ? { lat: pickup.lat, lng: pickup.lng }
        : { lat: 12.9716, lng: 77.5946 };

      const map = new window.google.maps.Map(mapContainerRef.current, {
        center: defaultCenter,
        zoom: 13,
        styles: DARK_MAP_STYLE,
        disableDefaultUI: true,
        zoomControl: true,
        gestureHandling: interactive ? 'greedy' : 'none',
      });

      mapInstanceRef.current = map;

      // Click event
      map.addListener('click', (e: google.maps.MapMouseEvent) => {
        if (onMapClick && e.latLng) {
          onMapClick(e.latLng.lat(), e.latLng.lng());
        }
      });
    } catch (err) {
      console.error('Google Map initialization error:', err);
      setLoadError('Error initializing Google Map');
      if (onScriptError) onScriptError();
    }
  }, [isLoaded, interactive, onMapClick, pickup, onScriptError]);

  // Update Markers & Overlays
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!isLoaded || !map) return;

    // Clear old markers
    markersRef.current.forEach((m) => m.setMap(null));
    markersRef.current = [];

    // Clear old circles
    circlesRef.current.forEach((c) => c.setMap(null));
    circlesRef.current = [];

    // Clear polyline & directions
    if (polylineRef.current) polylineRef.current.setMap(null);
    if (directionsRendererRef.current) directionsRendererRef.current.setMap(null);

    const bounds = new window.google.maps.LatLngBounds();
    let hasBounds = false;

    // 1. Pickup Marker (Green A)
    if (pickup) {
      const pickupPos = { lat: pickup.lat, lng: pickup.lng };
      const pickupMarker = new window.google.maps.Marker({
        position: pickupPos,
        map,
        title: `Pickup: ${pickup.name}`,
        icon: {
          path: window.google.maps.SymbolPath.CIRCLE,
          scale: 12,
          fillColor: '#10b981',
          fillOpacity: 1,
          strokeColor: '#ffffff',
          strokeWeight: 3,
        },
      });

      const infoWindow = new window.google.maps.InfoWindow({
        content: `<div style="color: #0f172a; padding: 4px; font-weight: 600;">
          <div style="color: #059669; font-size: 11px; font-weight: 800; text-transform: uppercase;">🟢 Pickup Spot (A)</div>
          <div style="font-size: 13px; font-weight: 700; margin-top: 2px;">${pickup.name}</div>
          <div style="font-size: 11px; color: #475569; margin-top: 2px;">${pickup.address}</div>
        </div>`,
      });

      pickupMarker.addListener('click', () => infoWindow.open(map, pickupMarker));
      markersRef.current.push(pickupMarker);
      bounds.extend(pickupPos);
      hasBounds = true;
    }

    // 2. Dropoff Marker (Rose B)
    if (dropoff) {
      const dropoffPos = { lat: dropoff.lat, lng: dropoff.lng };
      const dropoffMarker = new window.google.maps.Marker({
        position: dropoffPos,
        map,
        title: `Dropoff: ${dropoff.name}`,
        icon: {
          path: window.google.maps.SymbolPath.CIRCLE,
          scale: 12,
          fillColor: '#f43f5e',
          fillOpacity: 1,
          strokeColor: '#ffffff',
          strokeWeight: 3,
        },
      });

      const infoWindow = new window.google.maps.InfoWindow({
        content: `<div style="color: #0f172a; padding: 4px; font-weight: 600;">
          <div style="color: #e11d48; font-size: 11px; font-weight: 800; text-transform: uppercase;">🔴 Dropoff Destination (B)</div>
          <div style="font-size: 13px; font-weight: 700; margin-top: 2px;">${dropoff.name}</div>
          <div style="font-size: 11px; color: #475569; margin-top: 2px;">${dropoff.address}</div>
        </div>`,
      });

      dropoffMarker.addListener('click', () => infoWindow.open(map, dropoffMarker));
      markersRef.current.push(dropoffMarker);
      bounds.extend(dropoffPos);
      hasBounds = true;
    }

    // 3. Driver Marker (Yellow Cab)
    if (driverPos) {
      const driverMarker = new window.google.maps.Marker({
        position: driverPos,
        map,
        title: 'Assigned Driver: Vikram Singh',
        icon: {
          path: window.google.maps.SymbolPath.FORWARD_CLOSED_ARROW,
          scale: 7,
          fillColor: '#f59e0b',
          fillOpacity: 1,
          strokeColor: '#ffffff',
          strokeWeight: 2,
        },
      });

      const infoWindow = new window.google.maps.InfoWindow({
        content: `<div style="color: #0f172a; padding: 4px;">
          <div style="color: #d97706; font-size: 12px; font-weight: 800;">🚖 Vikram Singh (Dzire)</div>
          <div style="font-size: 11px; font-family: monospace; color: #334155; margin-top: 2px;">KA-04-EV-7788</div>
        </div>`,
      });

      driverMarker.addListener('click', () => infoWindow.open(map, driverMarker));
      markersRef.current.push(driverMarker);
      bounds.extend(driverPos);
      hasBounds = true;
    }

    // 4. Nearby Cabs
    if (pickup) {
      const nearbyCabs = [
        { lat: pickup.lat + 0.006, lng: pickup.lng + 0.005 },
        { lat: pickup.lat - 0.004, lng: pickup.lng + 0.008 },
        { lat: pickup.lat + 0.005, lng: pickup.lng - 0.006 },
      ];

      nearbyCabs.forEach((pos, idx) => {
        const cabMarker = new window.google.maps.Marker({
          position: pos,
          map,
          title: `Available Cab (${idx + 2} mins away)`,
          icon: {
            path: window.google.maps.SymbolPath.CIRCLE,
            scale: 6,
            fillColor: '#f59e0b',
            fillOpacity: 0.8,
            strokeColor: '#0f172a',
            strokeWeight: 1.5,
          },
        });
        markersRef.current.push(cabMarker);
      });
    }

    // 5. Hotspot Surge Circles
    if (showSurgeHotspots) {
      HOTSPOT_SURGE_ZONES.forEach((zone) => {
        const circle = new window.google.maps.Circle({
          map,
          center: { lat: zone.lat, lng: zone.lng },
          radius: zone.radiusMeters,
          fillColor: '#f59e0b',
          fillOpacity: 0.15,
          strokeColor: '#f59e0b',
          strokeOpacity: 0.8,
          strokeWeight: 1.5,
        });
        circlesRef.current.push(circle);
      });
    }

    // 6. Route Line Rendering (Directions Service or Curved Polyline)
    if (pickup && dropoff) {
      const directionsService = new window.google.maps.DirectionsService();

      directionsService.route(
        {
          origin: { lat: pickup.lat, lng: pickup.lng },
          destination: { lat: dropoff.lat, lng: dropoff.lng },
          travelMode: window.google.maps.TravelMode.DRIVING,
        },
        (result: any, status: any) => {
          if (status === window.google.maps.DirectionsStatus.OK && result) {


            const directionsRenderer = new window.google.maps.DirectionsRenderer({
              map,
              directions: result,
              suppressMarkers: true,
              polylineOptions: {
                strokeColor: '#f59e0b',
                strokeWeight: 5,
                strokeOpacity: 0.85,
              },
            });
            directionsRendererRef.current = directionsRenderer;
          } else {
            // Fallback to generated interpolated polyline if Directions API quota / routing fails
            const points = generateRoutePoints(pickup, dropoff, 60);
            const path = points.map((p) => ({ lat: p.lat, lng: p.lng }));

            const polyline = new window.google.maps.Polyline({
              path,
              geodesic: true,
              strokeColor: '#f59e0b',
              strokeOpacity: 0.9,
              strokeWeight: 5,
            });
            polyline.setMap(map);
            polylineRef.current = polyline;
          }
        }
      );
    }

    // 7. Fit Bounds
    if (hasBounds) {
      map.fitBounds(bounds, { top: 60, right: 60, bottom: 60, left: 60 });
    }
  }, [isLoaded, pickup, dropoff, driverPos, showSurgeHotspots]);

  if (loadError) {
    return (
      <div className="w-full h-full flex flex-col items-center justify-center p-6 bg-slate-950 text-slate-300 rounded-3xl border border-slate-800 text-center">
        <div className="w-12 h-12 rounded-full bg-rose-500/10 border border-rose-500/30 flex items-center justify-center text-rose-400 text-xl mb-3">
          🗺️
        </div>
        <h4 className="text-base font-bold text-white mb-1">Google Maps Loading Notice</h4>
        <p className="text-xs text-slate-400 max-w-sm mb-4">
          {loadError}. Please check your API key in settings or switch to OpenStreetMap.
        </p>
        {onScriptError && (
          <button
            onClick={onScriptError}
            className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold rounded-xl shadow-lg transition"
          >
            Switch to OpenStreetMap (Leaflet)
          </button>
        )}
      </div>
    );
  }

  return (
    <div className="w-full h-full relative rounded-3xl overflow-hidden border border-slate-800/80 shadow-2xl bg-[#090d16]">
      {!isLoaded && (
        <div className="absolute inset-0 z-10 bg-slate-950/90 backdrop-blur-md flex flex-col items-center justify-center gap-3 text-slate-300">
          <div className="w-8 h-8 border-3 border-amber-400 border-t-transparent rounded-full animate-spin" />
          <span className="text-xs font-semibold text-amber-400">Loading Google Maps...</span>
        </div>
      )}
      <div ref={mapContainerRef} className="w-full h-full" />
    </div>
  );
};
