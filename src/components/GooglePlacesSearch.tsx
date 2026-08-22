/// <reference types="google.maps" />
import React, { useState, useEffect, useRef, useCallback } from 'react';
import type { LocationPoint } from '../types';
import { PRESET_LOCATIONS } from '../utils/mockData';
import { Search, MapPin, Sparkles, Navigation, X, Loader2, Globe } from 'lucide-react';

interface GooglePlacesSearchProps {
  label: string;
  value: LocationPoint;
  onChangeLocation: (loc: LocationPoint) => void;
  iconBgColor?: string;
  dotColor?: string;
  placeholder?: string;
}

interface PlaceResult {
  id: string;
  name: string;
  address: string;
  lat: number;
  lng: number;
  source: 'google' | 'osm' | 'preset';
}

export const GooglePlacesSearch: React.FC<GooglePlacesSearchProps> = ({
  label,
  value,
  onChangeLocation,
  iconBgColor = 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40',
  dotColor = 'bg-emerald-400',
  placeholder = 'Search location, city, area or landmark...',
}) => {
  const [query, setQuery] = useState(value.name || '');
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<PlaceResult[]>([]);
  const containerRef = useRef<HTMLDivElement>(null);
  const debounceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

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

  // OpenStreetMap Nominatim Live Geocoding Search
  const searchNominatim = async (searchText: string): Promise<PlaceResult[]> => {
    try {
      const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
        searchText
      )}&countrycodes=in&limit=6&addressdetails=1`;
      const res = await fetch(url, {
        headers: {
          'Accept-Language': 'en-IN,en',
        },
      });
      if (!res.ok) return [];
      const data = await res.json();
      return (data || []).map((item: any) => {
        const parts = [
          item.address?.suburb || item.address?.neighbourhood || item.address?.residential,
          item.address?.city || item.address?.town || item.address?.village || item.address?.county,
          item.address?.state,
        ].filter(Boolean);

        const shortName = item.name || item.display_name.split(',')[0];
        const secondary = parts.length > 0 ? parts.join(', ') : item.display_name;

        return {
          id: `osm-${item.place_id}`,
          name: shortName,
          address: secondary,
          lat: parseFloat(item.lat),
          lng: parseFloat(item.lon),
          source: 'osm',
        };
      });
    } catch {
      return [];
    }
  };

  const performSearch = useCallback((text: string) => {
    const trimmed = text.trim();
    if (trimmed.length < 2) {
      setResults([]);
      setLoading(false);
      return;
    }

    setLoading(true);

    // 1. Try Google Autocomplete if available
    if (autocompleteServiceRef.current && window.google?.maps?.places) {
      autocompleteServiceRef.current.getPlacePredictions(
        {
          input: trimmed,
          componentRestrictions: { country: 'in' },
        },
        (predictions: any, status: any) => {
          if (status === window.google.maps.places.PlacesServiceStatus.OK && predictions?.length) {
            const googleResults: PlaceResult[] = predictions.map((p: any) => ({
              id: p.place_id,
              name: p.structured_formatting?.main_text || p.description.split(',')[0],
              address: p.structured_formatting?.secondary_text || p.description,
              lat: 0, // Resolved on click
              lng: 0,
              source: 'google',
            }));
            setResults(googleResults);
            setLoading(false);
          } else {
            // Fallback to Nominatim if Google Autocomplete returns 0 or fails
            searchNominatim(trimmed).then((osmResults) => {
              setResults(osmResults);
              setLoading(false);
            });
          }
        }
      );
    } else {
      // 2. Free OpenStreetMap (Nominatim) search
      searchNominatim(trimmed).then((osmResults) => {
        setResults(osmResults);
        setLoading(false);
      });
    }
  }, []);

  const handleInputChange = (text: string) => {
    setQuery(text);
    setIsOpen(true);

    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    debounceTimerRef.current = setTimeout(() => {
      performSearch(text);
    }, 350);
  };

  const selectResult = (result: PlaceResult) => {
    if (result.source === 'google' && placesServiceRef.current && window.google) {
      setLoading(true);
      placesServiceRef.current.getDetails({ placeId: result.id }, (place: any, status: any) => {
        setLoading(false);
        if (status === window.google.maps.places.PlacesServiceStatus.OK && place?.geometry?.location) {
          const newLoc: LocationPoint = {
            name: result.name,
            address: place.formatted_address || result.address,
            lat: place.geometry.location.lat(),
            lng: place.geometry.location.lng(),
            category: 'general',
          };
          onChangeLocation(newLoc);
          setQuery(result.name);
          setIsOpen(false);
        }
      });
    } else {
      const newLoc: LocationPoint = {
        name: result.name,
        address: result.address,
        lat: result.lat,
        lng: result.lng,
        category: 'general',
      };
      onChangeLocation(newLoc);
      setQuery(result.name);
      setIsOpen(false);
    }
  };

  const selectPresetLocation = (loc: LocationPoint) => {
    onChangeLocation(loc);
    setQuery(loc.name);
    setIsOpen(false);
  };

  // If user presses Enter or wants to submit whatever is typed
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      if (results.length > 0) {
        selectResult(results[0]);
      } else if (query.trim()) {
        setLoading(true);
        searchNominatim(query.trim()).then((found) => {
          setLoading(false);
          if (found.length > 0) {
            selectResult(found[0]);
          } else {
            // Direct fallback coordinates
            const fallbackLoc: LocationPoint = {
              name: query.trim(),
              address: query.trim(),
              lat: value.lat || 28.6139,
              lng: value.lng || 77.209,
              category: 'general',
            };
            onChangeLocation(fallbackLoc);
            setIsOpen(false);
          }
        });
      }
    }
  };

  // Filter preset locations when query matches
  const filteredPresets = PRESET_LOCATIONS.filter(
    (loc) =>
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
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          className="w-full bg-slate-900/90 border border-slate-800 focus:border-amber-400 focus:ring-1 focus:ring-amber-400 rounded-xl px-3.5 py-2.5 text-sm text-white font-semibold placeholder:text-slate-500 transition outline-none pr-8"
        />

        <div className="absolute right-3 flex items-center gap-1.5">
          {loading ? (
            <Loader2 className="w-4 h-4 text-amber-400 animate-spin" />
          ) : query ? (
            <button
              type="button"
              onClick={() => {
                setQuery('');
                setResults([]);
                setIsOpen(true);
              }}
              className="text-slate-500 hover:text-slate-300 p-1"
            >
              <X className="w-4 h-4" />
            </button>
          ) : (
            <Search className="w-4 h-4 text-slate-500 pointer-events-none" />
          )}
        </div>
      </div>

      {/* Autocomplete Dropdown */}
      {isOpen && (
        <div className="absolute z-[500] left-0 right-0 top-full mt-1.5 bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden max-h-72 overflow-y-auto backdrop-blur-xl divide-y divide-slate-800/60">
          {/* Live Search Results (OpenStreetMap Nominatim / Google Places) */}
          {results.length > 0 && (
            <div className="p-2">
              <div className="px-2 py-1 text-[10px] font-extrabold text-amber-400 tracking-wider uppercase flex items-center justify-between">
                <div className="flex items-center gap-1">
                  <Sparkles className="w-3 h-3 text-amber-400" />
                  <span>Search Suggestions</span>
                </div>
                <span className="text-[9px] text-slate-500 lowercase flex items-center gap-1">
                  <Globe className="w-2.5 h-2.5" />
                  {results[0]?.source === 'google' ? 'Google Places' : 'Live India GPS'}
                </span>
              </div>

              {results.map((res) => (
                <button
                  key={res.id}
                  type="button"
                  onClick={() => selectResult(res)}
                  className="w-full text-left p-2.5 rounded-xl hover:bg-amber-500/15 flex items-start gap-2.5 transition group"
                >
                  <MapPin className="w-4 h-4 text-amber-400 mt-0.5 shrink-0 group-hover:scale-110 transition-transform" />
                  <div className="min-w-0 flex-1">
                    <div className="text-xs font-bold text-white group-hover:text-amber-300 truncate">
                      {res.name}
                    </div>
                    <div className="text-[11px] text-slate-400 line-clamp-1 truncate">
                      {res.address}
                    </div>
                  </div>
                </button>
              ))}
            </div>
          )}

          {/* Quick Hubs / Presets */}
          <div className="p-2">
            <div className="px-2 py-1 text-[10px] font-extrabold text-slate-400 tracking-wider uppercase flex items-center gap-1">
              <Navigation className="w-3 h-3 text-slate-400" />
              <span>{query.trim().length > 1 ? 'Quick Presets' : 'Popular Hubs & Landmarks'}</span>
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
                  <div className="min-w-0 flex-1">
                    <div className="text-xs font-bold text-slate-200 group-hover:text-amber-400 truncate">
                      {loc.name}
                    </div>
                    <div className="text-[11px] text-slate-400 line-clamp-1 truncate">
                      {loc.address}
                    </div>
                  </div>
                </button>
              ))
            ) : results.length === 0 && !loading ? (
              <button
                type="button"
                onClick={() => {
                  const customLoc: LocationPoint = {
                    name: query.trim(),
                    address: query.trim(),
                    lat: value.lat || 28.6139,
                    lng: value.lng || 77.209,
                    category: 'general',
                  };
                  onChangeLocation(customLoc);
                  setIsOpen(false);
                }}
                className="w-full text-left p-3 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 transition text-amber-300 text-xs font-bold flex items-center gap-2"
              >
                <MapPin className="w-4 h-4 text-amber-400 shrink-0" />
                <span>Use custom address: &quot;{query}&quot;</span>
              </button>
            ) : null}
          </div>
        </div>
      )}
    </div>
  );
};

