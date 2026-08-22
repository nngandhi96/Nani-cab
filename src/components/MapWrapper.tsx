import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { GoogleMapComponent } from './GoogleMapComponent';
import { LeafletMap } from './LeafletMap';
import type { LocationPoint } from '../types';
import { Key, Check, X, ExternalLink } from 'lucide-react';


interface MapWrapperProps {
  pickup?: LocationPoint;
  dropoff?: LocationPoint;
  driverPos?: { lat: number; lng: number };
  onMapClick?: (lat: number, lng: number) => void;
  interactive?: boolean;
  showSurgeHotspots?: boolean;
}

export const MapWrapper: React.FC<MapWrapperProps> = ({
  pickup,
  dropoff,
  driverPos,
  onMapClick,
  interactive = true,
  showSurgeHotspots = false,
}) => {
  const { mapEngine, setMapEngine, googleApiKey, setGoogleApiKey, driverHeading, currentRide, selectedVehicle } = useApp();
  const [keyModalOpen, setKeyModalOpen] = useState(false);
  const [inputKey, setInputKey] = useState(googleApiKey);
  const [googleLoadFailed, setGoogleLoadFailed] = useState(false);

  const vehicleType = currentRide?.vehicleType || selectedVehicle;
  const vehicleIcons: Record<string, string> = {
    auto: '🛺',
    bike: '🏍️',
    mini: '🚗',
    sedan: '🚘',
    suv: '🚙',
  };
  const vehicleEmoji = vehicleIcons[vehicleType] || '🚖';

  const handleSaveKey = (e: React.FormEvent) => {
    e.preventDefault();
    setGoogleApiKey(inputKey.trim());
    setGoogleLoadFailed(false);
    if (inputKey.trim()) {
      setMapEngine('google');
    }
    setKeyModalOpen(false);
  };

  const currentEngineIsGoogle = mapEngine === 'google' && !!googleApiKey && !googleLoadFailed;

  return (
    <div className="w-full h-full relative rounded-3xl overflow-hidden group">
      {/* Map Engine Renderer */}
      {currentEngineIsGoogle ? (
        <GoogleMapComponent
          apiKey={googleApiKey}
          pickup={pickup}
          dropoff={dropoff}
          driverPos={driverPos}
          onMapClick={onMapClick}
          interactive={interactive}
          showSurgeHotspots={showSurgeHotspots}
          onScriptError={() => {
            setGoogleLoadFailed(true);
            setMapEngine('leaflet');
          }}
        />
      ) : (
        <LeafletMap
          pickup={pickup}
          dropoff={dropoff}
          driverPos={driverPos}
          driverHeading={driverHeading}
          vehicleIcon={vehicleEmoji}
          onMapClick={onMapClick}
          interactive={interactive}
          showSurgeHotspots={showSurgeHotspots}
        />
      )}

      {/* Floating Map Engine Switcher Badge */}
      <div className="absolute top-4 right-4 z-[450] flex items-center gap-2">
        <div className="bg-slate-950/85 border border-slate-800/90 backdrop-blur-md px-3 py-1.5 rounded-full shadow-2xl flex items-center gap-2">
          <button
            type="button"
            onClick={() => {
              if (!googleApiKey) {
                setKeyModalOpen(true);
              } else {
                setGoogleLoadFailed(false);
                setMapEngine('google');
              }
            }}
            className={`px-2.5 py-1 rounded-full text-[11px] font-extrabold transition-all flex items-center gap-1.5 ${
              mapEngine === 'google' && !googleLoadFailed
                ? 'bg-amber-500 text-slate-950 shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <span>Google Maps</span>
          </button>

          <button
            type="button"
            onClick={() => setMapEngine('leaflet')}
            className={`px-2.5 py-1 rounded-full text-[11px] font-extrabold transition-all flex items-center gap-1.5 ${
              mapEngine === 'leaflet' || googleLoadFailed
                ? 'bg-slate-800 text-emerald-400 border border-slate-700 shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <span>OSM / Leaflet</span>
          </button>

          <button
            type="button"
            onClick={() => setKeyModalOpen(true)}
            title="Configure Google Maps API Key"
            className="p-1 text-slate-400 hover:text-amber-400 transition"
          >
            <Key className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* API Key Modal Overlay */}
      {keyModalOpen && (
        <div className="fixed inset-0 z-[1000] bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 max-w-md w-full shadow-2xl relative animate-in fade-in zoom-in-95 duration-200">
            <button
              onClick={() => setKeyModalOpen(false)}
              className="absolute top-4 right-4 p-1 text-slate-400 hover:text-white rounded-lg"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-2xl bg-amber-500/20 border border-amber-500/40 text-amber-400 flex items-center justify-center font-bold">
                🗺️
              </div>
              <div>
                <h3 className="text-base font-extrabold text-white">Google Maps API Settings</h3>
                <p className="text-xs text-slate-400">Configure your Google Cloud API key</p>
              </div>
            </div>

            <form onSubmit={handleSaveKey} className="space-y-4">
              <div>
                <label className="text-xs font-bold text-slate-300 block mb-1.5">
                  VITE_GOOGLE_MAPS_API_KEY
                </label>
                <input
                  type="text"
                  value={inputKey}
                  onChange={(e) => setInputKey(e.target.value)}
                  placeholder="AIzaSy..."
                  className="w-full bg-slate-950 border border-slate-800 focus:border-amber-400 focus:ring-1 focus:ring-amber-400 rounded-xl px-3.5 py-2.5 text-xs font-mono text-amber-300 outline-none placeholder:text-slate-600"
                />
              </div>

              <div className="p-3 rounded-2xl bg-slate-950/60 border border-slate-800/80 text-[11px] text-slate-400 space-y-1">
                <div className="font-bold text-slate-300">Required APIs on Google Cloud Console:</div>
                <ul className="list-disc pl-4 space-y-0.5">
                  <li>Maps JavaScript API</li>
                  <li>Places API (for Location Autocomplete)</li>
                  <li>Directions API (for real routing)</li>
                </ul>
                <a
                  href="https://console.cloud.google.com/google/maps-apis/overview"
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1 text-amber-400 hover:underline pt-1 text-[11px] font-semibold"
                >
                  <span>Google Cloud Console</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setGoogleApiKey('');
                    setInputKey('');
                    setMapEngine('leaflet');
                    setKeyModalOpen(false);
                  }}
                  className="flex-1 py-2.5 rounded-xl border border-slate-800 text-slate-300 text-xs font-bold hover:bg-slate-800 transition"
                >
                  Use Leaflet / OSM
                </button>

                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-400 text-slate-950 text-xs font-bold hover:brightness-110 shadow-lg shadow-amber-500/20 transition flex items-center justify-center gap-1.5"
                >
                  <Check className="w-4 h-4" />
                  <span>Save & Activate</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
