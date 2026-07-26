import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { LeafletMap } from '../components/LeafletMap';
import { PRESET_LOCATIONS, VEHICLE_OPTIONS, calculateDistance, calculateFare } from '../utils/mockData';
import {
  Car,
  Phone,
  Star,
  CheckCircle2,
  Radio,
  Sparkles,
  RotateCcw,
  Check,
} from 'lucide-react';
import type { VehicleType, LocationPoint } from '../types';

export const RiderDashboard: React.FC = () => {
  const {
    currentRide,
    riderPickup,
    riderDropoff,
    selectedVehicle,
    setRiderPickup,
    setRiderDropoff,
    setSelectedVehicle,
    bookRide,
    cancelRide,
    resetRide,
    driverPos,
  } = useApp();

  const [paymentMethod, setPaymentMethod] = useState<'cash' | 'upi' | 'card'>('upi');
  const [pickMode, setPickMode] = useState<'none' | 'pickup' | 'dropoff'>('none');
  const [userRating, setUserRating] = useState(5);
  const [ratingSubmitted, setRatingSubmitted] = useState(false);

  const distance = calculateDistance(
    riderPickup.lat,
    riderPickup.lng,
    riderDropoff.lat,
    riderDropoff.lng
  );

  const handleMapClick = (lat: number, lng: number) => {
    if (pickMode === 'pickup') {
      const customLoc: LocationPoint = {
        name: `Custom Map Pin (${lat.toFixed(3)}, ${lng.toFixed(3)})`,
        address: 'Selected location on map',
        lat,
        lng,
      };
      setRiderPickup(customLoc);
      setPickMode('none');
    } else if (pickMode === 'dropoff') {
      const customLoc: LocationPoint = {
        name: `Custom Map Pin (${lat.toFixed(3)}, ${lng.toFixed(3)})`,
        address: 'Selected location on map',
        lat,
        lng,
      };
      setRiderDropoff(customLoc);
      setPickMode('none');
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-6 space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Console Column */}
        <div className="lg:col-span-5 space-y-6">
          {(!currentRide || currentRide.status === 'idle') && (
            <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 shadow-2xl space-y-6 backdrop-blur-xl">
              <div>
                <h1 className="text-2xl font-extrabold text-white tracking-tight">Book Your Ride</h1>
                <p className="text-xs text-slate-400 mt-1">Select pickup & destination to view fare estimates</p>
              </div>

              <div className="space-y-4 relative">
                <div className="absolute left-[19px] top-9 bottom-9 w-0.5 bg-gradient-to-b from-emerald-500 via-amber-500 to-rose-500 z-0" />

                <div className="relative z-10">
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="text-[11px] font-bold text-emerald-400 uppercase tracking-wider flex items-center gap-1.5">
                      <span className="w-2.5 h-2.5 rounded-full bg-emerald-400" /> Pickup Location
                    </label>
                    <button
                      onClick={() => setPickMode(pickMode === 'pickup' ? 'none' : 'pickup')}
                      className={`text-[11px] font-semibold px-2 py-0.5 rounded-md border transition-all ${
                        pickMode === 'pickup'
                          ? 'bg-emerald-500 text-slate-950 border-emerald-400 font-bold'
                          : 'bg-slate-800 text-slate-300 border-slate-700 hover:text-white'
                      }`}
                    >
                      {pickMode === 'pickup' ? 'Click Map Now...' : '🎯 Click Map'}
                    </button>
                  </div>
                  <select
                    value={riderPickup.name}
                    onChange={(e) => {
                      const found = PRESET_LOCATIONS.find((loc) => loc.name === e.target.value);
                      if (found) setRiderPickup(found);
                    }}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-3 text-xs text-white focus:outline-none focus:border-amber-500 font-medium"
                  >
                    {PRESET_LOCATIONS.map((loc) => (
                      <option key={'p-' + loc.name} value={loc.name}>
                        {loc.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="relative z-10">
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="text-[11px] font-bold text-rose-400 uppercase tracking-wider flex items-center gap-1.5">
                      <span className="w-2.5 h-2.5 rounded-full bg-rose-400" /> Dropoff Location
                    </label>
                    <button
                      onClick={() => setPickMode(pickMode === 'dropoff' ? 'none' : 'dropoff')}
                      className={`text-[11px] font-semibold px-2 py-0.5 rounded-md border transition-all ${
                        pickMode === 'dropoff'
                          ? 'bg-rose-500 text-white border-rose-400 font-bold'
                          : 'bg-slate-800 text-slate-300 border-slate-700 hover:text-white'
                      }`}
                    >
                      {pickMode === 'dropoff' ? 'Click Map Now...' : '🎯 Click Map'}
                    </button>
                  </div>
                  <select
                    value={riderDropoff.name}
                    onChange={(e) => {
                      const found = PRESET_LOCATIONS.find((loc) => loc.name === e.target.value);
                      if (found) setRiderDropoff(found);
                    }}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-3 text-xs text-white focus:outline-none focus:border-amber-500 font-medium"
                  >
                    {PRESET_LOCATIONS.map((loc) => (
                      <option key={'d-' + loc.name} value={loc.name}>
                        {loc.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="bg-slate-950/60 p-3 rounded-2xl border border-slate-800 flex items-center justify-between text-xs">
                <span className="text-slate-400">Total Route Distance:</span>
                <span className="font-mono font-bold text-amber-400 text-sm">{distance} km</span>
              </div>

              <div className="space-y-3">
                <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider">
                  Select Cab Category
                </label>
                <div className="space-y-2.5">
                  {VEHICLE_OPTIONS.map((v) => {
                    const fare = calculateFare(distance, v.id);
                    const isSelected = selectedVehicle === v.id;

                    return (
                      <div
                        key={v.id}
                        onClick={() => setSelectedVehicle(v.id as VehicleType)}
                        className={`p-3.5 rounded-2xl border transition-all cursor-pointer flex items-center justify-between gap-3 ${
                          isSelected
                            ? 'bg-gradient-to-r from-amber-950/40 to-slate-900 border-amber-500/80 shadow-lg shadow-amber-500/10'
                            : 'bg-slate-950/40 border-slate-800 hover:border-slate-700'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <span className="text-2xl">{v.icon}</span>
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="font-bold text-sm text-white">{v.name}</span>
                              <span className="text-[10px] text-slate-400 font-semibold">{v.eta} min away</span>
                            </div>
                            <p className="text-[11px] text-slate-400">{v.description}</p>
                          </div>
                        </div>

                        <div className="text-right shrink-0">
                          <span className="font-black text-base text-amber-400 block">₹{fare}</span>
                          <span className="text-[10px] text-slate-500">{v.capacity} Seats</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="space-y-2">
                <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider">
                  Payment Method
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { id: 'upi', label: 'UPI / GPay' },
                    { id: 'cash', label: 'Cash' },
                    { id: 'card', label: 'Card' },
                  ].map((pm) => (
                    <button
                      key={pm.id}
                      type="button"
                      onClick={() => setPaymentMethod(pm.id as any)}
                      className={`py-2 px-2 rounded-xl text-xs font-bold border transition-all ${
                        paymentMethod === pm.id
                          ? 'bg-amber-500/20 text-amber-400 border-amber-500/50'
                          : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white'
                      }`}
                    >
                      {pm.label}
                    </button>
                  ))}
                </div>
              </div>

              <button
                onClick={() => bookRide(paymentMethod)}
                className="w-full py-4 bg-gradient-to-r from-amber-500 to-yellow-400 hover:from-amber-400 hover:to-yellow-300 text-slate-950 font-black text-base rounded-2xl shadow-xl shadow-amber-500/20 transition-all flex items-center justify-center gap-2"
              >
                <Car className="w-5 h-5" />
                <span>BOOK CAB NOW (₹{calculateFare(distance, selectedVehicle)})</span>
              </button>
            </div>
          )}

          {currentRide && currentRide.status !== 'idle' && (
            <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 shadow-2xl space-y-6 backdrop-blur-xl">
              {currentRide.status === 'requested' && (
                <div className="text-center space-y-5 py-4">
                  <div className="relative w-20 h-20 mx-auto flex items-center justify-center">
                    <div className="absolute inset-0 rounded-full bg-amber-500/20 animate-ping-slow" />
                    <div className="w-14 h-14 rounded-full bg-amber-500/20 border border-amber-400 text-amber-400 flex items-center justify-center z-10">
                      <Radio className="w-7 h-7 animate-pulse" />
                    </div>
                  </div>

                  <div>
                    <h2 className="text-xl font-black text-white">Connecting to Nearby Drivers...</h2>
                    <p className="text-xs text-slate-400 mt-1">
                      Searching for available cabs near {currentRide.pickup.name.split(',')[0]}
                    </p>
                  </div>

                  <div className="bg-slate-950/60 p-3 rounded-2xl border border-slate-800 text-xs text-slate-300 flex items-center justify-between">
                    <span>Fare: <strong className="text-amber-400 font-mono">₹{currentRide.fare}</strong></span>
                    <span>Distance: <strong className="text-slate-200">{currentRide.distanceKm} km</strong></span>
                  </div>

                  <button
                    onClick={cancelRide}
                    className="w-full py-3 bg-slate-800 hover:bg-rose-950/50 hover:text-rose-400 border border-slate-700 text-slate-300 font-bold rounded-xl text-xs transition-all"
                  >
                    Cancel Booking Request
                  </button>
                </div>
              )}

              {(currentRide.status === 'accepted' || currentRide.status === 'in_transit') && (
                <div className="space-y-5">
                  <div className="flex items-center justify-between">
                    <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center gap-1.5">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      {currentRide.status === 'accepted' ? 'Driver on the Way!' : 'Trip In Transit'}
                    </span>
                    <span className="text-xs font-mono font-bold text-amber-400">Total: ₹{currentRide.fare}</span>
                  </div>

                  <div className="bg-slate-950/80 p-4 rounded-2xl border border-slate-800 space-y-4">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-amber-500 to-yellow-400 text-slate-950 font-black text-xl flex items-center justify-center shrink-0">
                        VS
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <h4 className="font-bold text-base text-white">{currentRide.driverName}</h4>
                          <span className="text-xs font-bold text-amber-400">⭐ {currentRide.driverRating}</span>
                        </div>
                        <p className="text-xs text-slate-400 mt-0.5">{currentRide.vehicleModel}</p>
                      </div>
                    </div>

                    <div className="flex items-center justify-between bg-slate-900 px-3.5 py-2.5 rounded-xl border border-slate-800/80">
                      <div>
                        <span className="text-[10px] text-slate-500 font-bold uppercase block">Vehicle Plate</span>
                        <span className="font-mono font-black text-sm text-emerald-400">{currentRide.vehiclePlate}</span>
                      </div>
                      <a
                        href={`tel:${currentRide.driverPhone}`}
                        className="py-1.5 px-3 bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 border border-amber-500/30 rounded-lg text-xs font-bold flex items-center gap-1.5"
                      >
                        <Phone className="w-3.5 h-3.5" /> Call Driver
                      </a>
                    </div>
                  </div>

                  <div className="bg-gradient-to-r from-amber-500/10 to-yellow-500/10 border border-amber-500/40 p-4 rounded-2xl text-center space-y-1">
                    <span className="text-[10px] font-extrabold uppercase text-amber-400 tracking-wider block">
                      Share Start-Trip OTP with Driver
                    </span>
                    <p className="font-mono font-black text-3xl text-amber-300 tracking-widest">{currentRide.otp}</p>
                    <p className="text-[11px] text-slate-400">Provide this 4-digit code when driver arrives</p>
                  </div>
                </div>
              )}

              {currentRide.status === 'completed' && (
                <div className="space-y-5 text-center">
                  <div className="w-16 h-16 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-400 flex items-center justify-center mx-auto">
                    <Sparkles className="w-8 h-8" />
                  </div>

                  <div>
                    <h2 className="text-xl font-black text-white">You Have Arrived!</h2>
                    <p className="text-xs text-slate-400 mt-1">
                      Thanks for riding with Nani Cab. Total paid: <strong className="text-amber-400">₹{currentRide.fare}</strong>
                    </p>
                  </div>

                  {!ratingSubmitted ? (
                    <div className="bg-slate-950/80 p-4 rounded-2xl border border-slate-800 space-y-3">
                      <p className="text-xs font-bold text-slate-300">Rate Driver Vikram Singh</p>
                      <div className="flex items-center justify-center gap-2">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <button
                            key={star}
                            onClick={() => setUserRating(star)}
                            className="p-1 hover:scale-125 transition-transform"
                          >
                            <Star
                              className={`w-7 h-7 ${
                                star <= userRating ? 'text-amber-400 fill-amber-400' : 'text-slate-600'
                              }`}
                            />
                          </button>
                        ))}
                      </div>
                      <button
                        onClick={() => setRatingSubmitted(true)}
                        className="w-full py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-xl text-xs shadow-md"
                      >
                        Submit Rating
                      </button>
                    </div>
                  ) : (
                    <div className="p-3 bg-emerald-500/10 border border-emerald-500/30 rounded-2xl text-emerald-400 text-xs font-bold flex items-center justify-center gap-2">
                      <Check className="w-4 h-4" /> Thank you for rating!
                    </div>
                  )}

                  <button
                    onClick={resetRide}
                    className="w-full py-3.5 bg-slate-800 hover:bg-slate-700 text-white font-bold rounded-2xl text-xs transition-all flex items-center justify-center gap-2"
                  >
                    <RotateCcw className="w-4 h-4" />
                    <span>Book Another Ride</span>
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Right Column: Interactive Map */}
        <div className="lg:col-span-7 min-h-[480px] lg:min-h-[620px] bg-slate-900/90 border border-slate-800 rounded-3xl p-2 shadow-2xl">
          <LeafletMap
            pickup={riderPickup}
            dropoff={riderDropoff}
            driverPos={currentRide?.status !== 'idle' ? driverPos : undefined}
            onMapClick={handleMapClick}
          />
        </div>
      </div>
    </div>
  );
};
