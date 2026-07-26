import React, { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import type { LocationPoint } from '../types';
import { generateRoutePoints } from '../utils/mockData';

interface LeafletMapProps {
  pickup?: LocationPoint;
  dropoff?: LocationPoint;
  driverPos?: { lat: number; lng: number };
  onMapClick?: (lat: number, lng: number) => void;
  interactive?: boolean;
}

const createCustomIcon = (type: 'pickup' | 'dropoff' | 'driver') => {
  if (type === 'pickup') {
    return L.divIcon({
      className: 'custom-map-icon',
      html: `
        <div style="position: relative; display: flex; align-items: center; justify-content: center; width: 36px; height: 36px;">
          <div style="position: absolute; width: 36px; height: 36px; background: rgba(16, 185, 129, 0.25); border-radius: 50%; animation: ping-slow 2s infinite ease-in-out;"></div>
          <div style="width: 24px; height: 24px; background: #10b981; border: 3px solid #064e3b; border-radius: 50%; box-shadow: 0 4px 12px rgba(16, 185, 129, 0.5); display: flex; align-items: center; justify-content: center; color: white; font-weight: bold; font-size: 11px;">
            A
          </div>
        </div>
      `,
      iconSize: [36, 36],
      iconAnchor: [18, 18],
    });
  } else if (type === 'dropoff') {
    return L.divIcon({
      className: 'custom-map-icon',
      html: `
        <div style="position: relative; display: flex; align-items: center; justify-content: center; width: 36px; height: 36px;">
          <div style="position: absolute; width: 36px; height: 36px; background: rgba(244, 63, 94, 0.25); border-radius: 50%; animation: ping-slow 2s infinite ease-in-out;"></div>
          <div style="width: 24px; height: 24px; background: #f43f5e; border: 3px solid #881337; border-radius: 50%; box-shadow: 0 4px 12px rgba(244, 63, 94, 0.5); display: flex; align-items: center; justify-content: center; color: white; font-weight: bold; font-size: 11px;">
            B
          </div>
        </div>
      `,
      iconSize: [36, 36],
      iconAnchor: [18, 18],
    });
  } else {
    return L.divIcon({
      className: 'custom-map-icon',
      html: `
        <div style="position: relative; display: flex; align-items: center; justify-content: center; width: 44px; height: 44px;">
          <div style="position: absolute; width: 44px; height: 44px; background: rgba(245, 158, 11, 0.2); border-radius: 50%; animation: ping-slow 1.5s infinite ease-in-out;"></div>
          <div style="width: 34px; height: 34px; background: #f59e0b; border: 2px solid #78350f; border-radius: 50%; box-shadow: 0 6px 16px rgba(245, 158, 11, 0.6); display: flex; align-items: center; justify-content: center; font-size: 18px; transform: rotate(0deg); transition: all 0.3s ease;">
            🚕
          </div>
        </div>
      `,
      iconSize: [44, 44],
      iconAnchor: [22, 22],
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

const MapBoundsUpdater: React.FC<{ pickup?: LocationPoint; dropoff?: LocationPoint }> = ({ pickup, dropoff }) => {
  const map = useMap();

  useEffect(() => {
    if (pickup && dropoff) {
      const bounds = L.latLngBounds(
        [pickup.lat, pickup.lng],
        [dropoff.lat, dropoff.lng]
      );
      map.fitBounds(bounds, { padding: [50, 50] });
    } else if (pickup) {
      map.setView([pickup.lat, pickup.lng], 13);
    }
  }, [map, pickup, dropoff]);

  return null;
};

export const LeafletMap: React.FC<LeafletMapProps> = ({
  pickup,
  dropoff,
  driverPos,
  onMapClick,
  interactive = true,
}) => {
  const defaultCenter = pickup
    ? [pickup.lat, pickup.lng]
    : [12.9716, 77.5946];

  const routePoints = pickup && dropoff ? generateRoutePoints(pickup, dropoff) : [];

  return (
    <div className="w-full h-full relative rounded-2xl overflow-hidden border border-slate-800 shadow-2xl">
      <MapContainer
        center={defaultCenter as [number, number]}
        zoom={12}
        scrollWheelZoom={interactive}
        zoomControl={false}
        className="w-full h-full dark-tiles"
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        <MapEventsHandler onMapClick={onMapClick} />
        <MapBoundsUpdater pickup={pickup} dropoff={dropoff} />

        {pickup && (
          <Marker position={[pickup.lat, pickup.lng]} icon={createCustomIcon('pickup')}>
            <Popup>
              <div className="text-xs">
                <span className="font-bold text-emerald-400 block">Pickup Location (A)</span>
                <span className="text-slate-300">{pickup.name}</span>
              </div>
            </Popup>
          </Marker>
        )}

        {dropoff && (
          <Marker position={[dropoff.lat, dropoff.lng]} icon={createCustomIcon('dropoff')}>
            <Popup>
              <div className="text-xs">
                <span className="font-bold text-rose-400 block">Dropoff Location (B)</span>
                <span className="text-slate-300">{dropoff.name}</span>
              </div>
            </Popup>
          </Marker>
        )}

        {driverPos && (
          <Marker position={[driverPos.lat, driverPos.lng]} icon={createCustomIcon('driver')}>
            <Popup>
              <div className="text-xs font-bold text-amber-400">
                🚖 Driver Vikram Singh (Swift Dzire)
              </div>
            </Popup>
          </Marker>
        )}

        {routePoints.length > 0 && (
          <Polyline
            positions={routePoints.map((p) => [p.lat, p.lng])}
            pathOptions={{
              color: '#f59e0b',
              weight: 5,
              opacity: 0.85,
              dashArray: '1, 10',
              lineCap: 'round',
            }}
          />
        )}
      </MapContainer>

      <div className="absolute top-3 left-3 z-[400] bg-slate-900/90 border border-slate-700/60 backdrop-blur-md px-3 py-1.5 rounded-xl text-[11px] font-medium text-slate-300 flex items-center gap-2 shadow-lg">
        <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
        <span>OpenStreetMap Live Engine</span>
      </div>
    </div>
  );
};
