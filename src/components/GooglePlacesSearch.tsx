/// <reference types="google.maps" />
import React, { useState, useEffect, useRef } from 'react';
import type { LocationPoint } from '../types';
import { PRESET_LOCATIONS } from '../utils/mockData';
import { Search, MapPin, Sparkles, Navigation, X } from 'lucide-react';


interface GooglePlacesSearchProps {
  label: string;
  value: LocationPoint;
  onChangeLocation: (loc: LocationPoint) => void;
  iconBgColor?: string;
  dotColor?: string;
  placeholder?: string;
}

export const GooglePlacesSearch: React.FC<GooglePlacesSearchProps> = ({
  label,
  value,
  onChangeLocation,
  iconBgColor = 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40',
  dotColor = 'bg-emerald-400',
  placeholder = 'Search location or landmark...',
}) => {
  const [query, setQuery] = useState(value.name || '');
  const [isOpen, setIsOpen] = useState(false);
  const [googlePredictions, setGooglePredictions] = useState<
    { description: string; placeId: string; mainText: string; secondaryText: string }[]
  >([]);
  const containerRef = useRef<HTMLDivElement>(null);
  const autocompleteServiceRef = useRef<google.maps.places.AutocompleteService | null>(null);
  const placesServiceRef = useRef<google.maps.places.PlacesService | null>(null);

  // Sync external value with local query state
  useEffect(() => {
    setQuery(value.name || '');
  }, [value]);

  // Click outside listener
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Initialize Google Autocomplete service if window.google is ready
  useEffect(() => {
    if (window.google && window.google.maps && window.google.maps.places) {
      autocompleteServiceRef.current = new window.google.maps.places.AutocompleteService();
      const dummyElement = document.createElement('div');
      placesServiceRef.current = new window.google.maps.places.PlacesService(dummyElement);
    }
  }, []);

  const handleInputChange = (text: string) => {
    setQuery(text);
    setIsOpen(true);

    if (autocompleteServiceRef.current && text.trim().length > 1) {
      autocompleteServiceRef.current.getPlacePredictions(
        {
          input: text,
          componentRestrictions: { country: 'in' },
        },
        (predictions: any, status: any) => {
          if (
            status === window.google.maps.places.PlacesServiceStatus.OK &&
            predictions
          ) {
            setGooglePredictions(
              predictions.map((p: any) => ({
                description: p.description,
                placeId: p.place_id,
                mainText: p.structured_formatting.main_text,
                secondaryText: p.structured_formatting.secondary_text || p.description,
              }))
            );
          } else {
            setGooglePredictions([]);
          }
        }
      );
    } else {
      setGooglePredictions([]);
    }
  };

  const selectGooglePlace = (placeId: string, mainText: string, description: string) => {
    if (placesServiceRef.current) {
      placesServiceRef.current.getDetails(
        { placeId },
        (place: any, status: any) => {


        if (
          status === window.google.maps.places.PlacesServiceStatus.OK &&
          place &&
          place.geometry &&
          place.geometry.location
        ) {
          const newLoc: LocationPoint = {
            name: mainText,
            address: place.formatted_address || description,
            lat: place.geometry.location.lat(),
            lng: place.geometry.location.lng(),
            category: 'general',
          };
          onChangeLocation(newLoc);
          setQuery(mainText);
          setIsOpen(false);
        }
      });
    }
  };

  const selectPresetLocation = (loc: LocationPoint) => {
    onChangeLocation(loc);
    setQuery(loc.name);
    setIsOpen(false);
  };

  // Filter preset locations when query matches
  const filteredPresets = PRESET_LOCATIONS.filter((loc) =>
    loc.name.toLowerCase().includes(query.toLowerCase()) ||
    loc.address.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <div ref={containerRef} className="relative w-full">
      <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
        {label}
      </label>
      <div className="relative flex items-center">
        <div className={`w-8 h-8 rounded-xl border flex items-center justify-center mr-2 shrink-0 ${iconBgColor}`}>
          <span className={`w-2.5 h-2.5 rounded-full ${dotColor}`} />
        </div>

        <input
          type="text"
          value={query}
          onFocus={() => setIsOpen(true)}
          onChange={(e) => handleInputChange(e.target.value)}
          placeholder={placeholder}
          className="w-full bg-slate-900/90 border border-slate-800 focus:border-amber-400 focus:ring-1 focus:ring-amber-400 rounded-xl px-3.5 py-2.5 text-sm text-white font-semibold placeholder:text-slate-500 transition outline-none pr-8"
        />

        {query ? (
          <button
            type="button"
            onClick={() => {
              setQuery('');
              setIsOpen(true);
            }}
            className="absolute right-3 text-slate-500 hover:text-slate-300 p-1"
          >
            <X className="w-4 h-4" />
          </button>
        ) : (
          <Search className="absolute right-3 w-4 h-4 text-slate-500 pointer-events-none" />
        )}
      </div>

      {/* Autocomplete Dropdown */}
      {isOpen && (
        <div className="absolute z-[500] left-0 right-0 top-full mt-1.5 bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden max-h-72 overflow-y-auto backdrop-blur-xl">
          {/* Live Google Places Predictions */}
          {googlePredictions.length > 0 && (
            <div className="p-2 border-b border-slate-800/80">
              <div className="px-2 py-1 text-[10px] font-extrabold text-amber-400 tracking-wider uppercase flex items-center gap-1">
                <Sparkles className="w-3 h-3 text-amber-400" />
                <span>Google Places Suggestions</span>
              </div>
              {googlePredictions.map((pred) => (
                <button
                  key={pred.placeId}
                  type="button"
                  onClick={() => selectGooglePlace(pred.placeId, pred.mainText, pred.description)}
                  className="w-full text-left p-2.5 rounded-xl hover:bg-amber-500/15 flex items-start gap-2.5 transition group"
                >
                  <MapPin className="w-4 h-4 text-amber-400 mt-0.5 shrink-0 group-hover:scale-110 transition-transform" />
                  <div>
                    <div className="text-xs font-bold text-white group-hover:text-amber-300">
                      {pred.mainText}
                    </div>
                    <div className="text-[11px] text-slate-400 line-clamp-1">
                      {pred.secondaryText}
                    </div>
                  </div>
                </button>
              ))}
            </div>
          )}

          {/* Quick Preset Hubs */}
          <div className="p-2">
            <div className="px-2 py-1 text-[10px] font-extrabold text-slate-400 tracking-wider uppercase flex items-center gap-1">
              <Navigation className="w-3 h-3 text-slate-400" />
              <span>Popular Bangalore Hubs</span>
            </div>

            {filteredPresets.length > 0 ? (
              filteredPresets.map((loc) => (
                <button
                  key={loc.name}
                  type="button"
                  onClick={() => selectPresetLocation(loc)}
                  className="w-full text-left p-2.5 rounded-xl hover:bg-slate-800/80 flex items-start gap-2.5 transition group"
                >
                  <span className="text-sm shrink-0 mt-0.5">
                    {loc.category === 'airport'
                      ? '✈️'
                      : loc.category === 'station'
                      ? '🚆'
                      : loc.category === 'techpark'
                      ? '🏢'
                      : loc.category === 'mall'
                      ? '🛍️'
                      : '📍'}
                  </span>
                  <div>
                    <div className="text-xs font-bold text-slate-200 group-hover:text-amber-400">
                      {loc.name}
                    </div>
                    <div className="text-[11px] text-slate-400 line-clamp-1">
                      {loc.address}
                    </div>
                  </div>
                </button>
              ))
            ) : (
              <div className="p-3 text-center text-xs text-slate-500">
                No matching location found. Press enter to set address.
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
