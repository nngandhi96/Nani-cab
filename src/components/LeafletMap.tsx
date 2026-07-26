import React, { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline, Circle, useMap, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import type { LocationPoint } from '../types';
import { generateRoutePoints, HOTSPOT_SURGE_ZONES } from '../utils/mockData';

interface LeafletMapProps {
  pickup?: LocationPoint;
  dropoff?: LocationPoint;
  driverPos?: { lat: number; lng: number };
  onMapClick?: (lat: number, lng: number) => void;
  interactive?: boolean;
  showSurgeHotspots?: boolean;
}

const createCustomIcon = (type: 'pickup' | 'dropoff' | 'driver' | 'nearby_cab', heading = 0) => {
  if (type === 'pickup') {
    return L.divIcon({
      className: 'custom-map-icon',
      html: `
        <div style="position: relative; display: flex; align-items: center; justify-content: center; width: 44px; height: 44px;">
          <div style="position: absolute; width: 44px; height: 44px; background: rgba(16, 185, 129, 0.2); border-radius: 50%; animation: ping-radar 2.5s infinite ease-in-out;"></div>
          <div style="position: absolute; width: 28px; height: 28px; background: rgba(16, 185, 129, 0.35); border-radius: 50%;"></div>
          <div style="width: 26px; height: 26px; background: linear-gradient(135deg, #10b981, #059669); border: 2.5px solid #ffffff; border-radius: 50%; box-shadow: 0 8px 18px rgba(16, 185, 129, 0.6); display: flex; align-items: center; justify-content: center; color: white; font-weight: 800; font-size: 12px;">
            A
          </div>
        </div>
      `,
      iconSize: [44, 44],
      iconAnchor: [22, 22],
    });
  } else if (type === 'dropoff') {
    return L.divIcon({
      className: 'custom-map-icon',
      html: `
        <div style="position: relative; display: flex; align-items: center; justify-content: center; width: 44px; height: 44px;">
          <div style="position: absolute; width: 44px; height: 44px; background: rgba(244, 63, 94, 0.2); border-radius: 50%; animation: ping-radar 2.5s infinite ease-in-out;"></div>
          <div style="position: absolute; width: 28px; height: 28px; background: rgba(244, 63, 94, 0.35); border-radius: 50%;"></div>
          <div style="width: 26px; height: 26px; background: linear-gradient(135deg, #f43f5e, #e11d48); border: 2.5px solid #ffffff; border-radius: 50%; box-shadow: 0 8px 18px rgba(244, 63, 94, 0.6); display: flex; align-items: center; justify-content: center; color: white; font-weight: 800; font-size: 12px;">
            B
          </div>
        </div>
      `,
      iconSize: [44, 44],
      iconAnchor: [22, 22],
    });
  } else if (type === 'nearby_cab') {
    return L.divIcon({
      className: 'custom-map-icon',
      html: `
        <div style="width: 28px; height: 28px; background: #0f172a; border: 2px solid #f59e0b; border-radius: 50%; box-shadow: 0 4px 12px rgba(245, 158, 11, 0.4); display: flex; align-items: center; justify-content: center; font-size: 13px;">
          🚕
        </div>
      `,
      iconSize: [28, 28],
      iconAnchor: [14, 14],
    });
  } else {
    return L.divIcon({
      className: 'custom-map-icon',
      html: `
        <div style="position: relative; display: flex; align-items: center; justify-content: center; width: 50px; height: 50px; transform: rotate(${heading}deg); transition: transform 0.4s ease;">
          <div style="position: absolute; width: 50px; height: 50px; background: rgba(245, 158, 11, 0.25); border-radius: 50%; animation: ping-radar 2s infinite ease-in-out;"></div>
          <div style="width: 38px; height: 38px; background: linear-gradient(135deg, #f59e0b, #d97706); border: 3px solid #ffffff; border-radius: 50%; box-shadow: 0 8px 24px rgba(245, 158, 11, 0.7); display: flex; align-items: center; justify-content: center; font-size: 20px;">
            🚖
          </div>
        </div>
      `,
      iconSize: [50, 50],
      iconAnchor: [25, 25],
    });
  }
};

const MapEventsHandler: React.FC<{ onMapClick?: (lat: number, lng: number) => void }> = ({ onMapClick }) => {
  useMapEvents({
    click(e) {
      if (onMapClick) {
        onMapClick(e.latlng.lat, e.latlng.lng);
      }
    },
  });
  return null;
};

const MapBoundsUpdater: React.FC<{ pickup?: LocationPoint; dropoff?: LocationPoint; driverPos?: { lat: number; lng: number } }> = ({ pickup, dropoff, driverPos }) => {
  const map = useMap();

  useEffect(() => {
    if (pickup && dropoff) {
      const points: [number, number][] = [[pickup.lat, pickup.lng], [dropoff.lat, dropoff.lng]];
      if (driverPos) points.push([driverPos.lat, driverPos.lng]);
      const bounds = L.latLngBounds(points);
      map.fitBounds(bounds, { padding: [60, 60], maxZoom: 15 });
    } else if (pickup) {
      map.setView([pickup.lat, pickup.lng], 14);
    }
  }, [map, pickup, dropoff, driverPos]);

  return null;
};

export const LeafletMap: React.FC<LeafletMapProps> = ({
  pickup,
  dropoff,
  driverPos,
  onMapClick,
  interactive = true,
  showSurgeHotspots = false,
}) => {
  const defaultCenter = pickup
    ? [pickup.lat, pickup.lng]
    : [12.9716, 77.5946];

  const routePoints = pickup && dropoff ? generateRoutePoints(pickup, dropoff, 60) : [];

  // Nearby simulated cabs scattered around pickup
  const nearbyCabs = pickup
    ? [
        { lat: pickup.lat + 0.006, lng: pickup.lng + 0.005 },
        { lat: pickup.lat - 0.004, lng: pickup.lng + 0.008 },
        { lat: pickup.lat + 0.005, lng: pickup.lng - 0.006 },
      ]
    : [];

  return (
    <div className="w-full h-full relative rounded-3xl overflow-hidden border border-slate-800/80 shadow-2xl bg-[#090d16]">
      <MapContainer
        center={defaultCenter as [number, number]}
        zoom={13}
        scrollWheelZoom={interactive}
        zoomControl={false}
        className="w-full h-full"
      >
        {/* Standard OpenStreetMap High-Definition Light Tiles */}
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          maxZoom={19}
        />


        <MapEventsHandler onMapClick={onMapClick} />
        <MapBoundsUpdater pickup={pickup} dropoff={dropoff} driverPos={driverPos} />

        {/* Hotspot surge circles overlay */}
        {showSurgeHotspots &&
          HOTSPOT_SURGE_ZONES.map((zone) => (
            <Circle
              key={zone.name}
              center={[zone.lat, zone.lng]}
              radius={zone.radiusMeters}
              pathOptions={{
                color: '#f59e0b',
                fillColor: '#f59e0b',
                fillOpacity: 0.15,
                weight: 1.5,
                dashArray: '4, 8',
              }}
            >
              <Popup>
                <div className="text-xs">
                  <span className="font-extrabold text-amber-400 block">{zone.name}</span>
                  <span className="text-slate-300 font-medium">{zone.surgeText}</span>
                </div>
              </Popup>
            </Circle>
          ))}

        {/* Nearby Cabs on Radar */}
        {nearbyCabs.map((cab, idx) => (
          <Marker key={`nearby-${idx}`} position={[cab.lat, cab.lng]} icon={createCustomIcon('nearby_cab')}>
            <Popup>
              <div className="text-[11px] font-semibold text-slate-300">
                🚕 Available Cab ({idx + 2} mins away)
              </div>
            </Popup>
          </Marker>
        ))}

        {/* Pickup Marker */}
        {pickup && (
          <Marker position={[pickup.lat, pickup.lng]} icon={createCustomIcon('pickup')}>
            <Popup>
              <div className="text-xs p-1">
                <span className="font-extrabold text-emerald-400 block uppercase tracking-wider text-[10px]">
                  🟢 Pickup Spot (A)
                </span>
                <span className="font-bold text-white text-sm block mt-0.5">{pickup.name}</span>
                <span className="text-slate-400 text-[11px] mt-0.5 block">{pickup.address}</span>
              </div>
            </Popup>
          </Marker>
        )}

        {/* Dropoff Marker */}
        {dropoff && (
          <Marker position={[dropoff.lat, dropoff.lng]} icon={createCustomIcon('dropoff')}>
            <Popup>
              <div className="text-xs p-1">
                <span className="font-extrabold text-rose-400 block uppercase tracking-wider text-[10px]">
                  🔴 Dropoff Destination (B)
                </span>
                <span className="font-bold text-white text-sm block mt-0.5">{dropoff.name}</span>
                <span className="text-slate-400 text-[11px] mt-0.5 block">{dropoff.address}</span>
              </div>
            </Popup>
          </Marker>
        )}

        {/* Live Assigned Driver Marker */}
        {driverPos && (
          <Marker position={[driverPos.lat, driverPos.lng]} icon={createCustomIcon('driver')}>
            <Popup>
              <div className="text-xs p-1">
                <span className="font-extrabold text-amber-400 block text-xs">
                  🚖 Vikram Singh (White Swift Dzire)
                </span>
                <span className="text-slate-300 font-mono text-[11px] block mt-0.5">Plate: KA-04-EV-7788</span>
              </div>
            </Popup>
          </Marker>
        )}

        {/* Route Line Layers */}
        {routePoints.length > 0 && (
          <>
            {/* Outer Glow Polyline */}
            <Polyline
              positions={routePoints.map((p) => [p.lat, p.lng])}
              pathOptions={{
                color: '#f59e0b',
                weight: 8,
                opacity: 0.3,
                lineCap: 'round',
                lineJoin: 'round',
              }}
            />
            {/* Core Animated Polyline */}
            <Polyline
              positions={routePoints.map((p) => [p.lat, p.lng])}
              pathOptions={{
                color: '#fbbf24',
                weight: 4,
                opacity: 0.9,
                dashArray: '8, 12',
                className: 'animated-polyline',
                lineCap: 'round',
                lineJoin: 'round',
              }}
            />
          </>
        )}
      </MapContainer>

      {/* Floating Status Badges Overlay */}
      <div className="absolute top-4 left-4 z-[400] flex items-center gap-2">
        <div className="bg-slate-950/85 border border-slate-800/80 backdrop-blur-md px-3.5 py-1.5 rounded-full text-xs font-semibold text-slate-200 flex items-center gap-2 shadow-xl">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span>CARTO Vector Radar</span>
        </div>

        {showSurgeHotspots && (
          <div className="bg-amber-500/20 border border-amber-500/40 text-amber-300 backdrop-blur-md px-3 py-1.5 rounded-full text-xs font-bold flex items-center gap-1.5 shadow-xl">
            <span>⚡ High Demand Heatmap</span>
          </div>
        )}
      </div>
    </div>
  );
};

