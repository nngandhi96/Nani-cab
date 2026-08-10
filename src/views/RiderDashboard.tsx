import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { MapWrapper } from '../components/MapWrapper';
import { GooglePlacesSearch } from '../components/GooglePlacesSearch';
import { VEHICLE_OPTIONS, calculateDistance, calculateFare } from '../utils/mockData';
import { sounds } from '../utils/audio';

import {
  Car,
  Phone,
  Star,
  CheckCircle2,
  Radio,
  Sparkles,
  RotateCcw,
  Check,
  Navigation,
  Shield,
  Copy,
  Zap,
  Users,
  Briefcase,
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
  const [tipAmount, setTipAmount] = useState<number>(0);
  const [ratingSubmitted, setRatingSubmitted] = useState(false);

  // Safety Center & OTP Copy state
  const [showSafetyModal, setShowSafetyModal] = useState(false);
  const [otpCopied, setOtpCopied] = useState(false);


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
        address: 'Selected location on live map',
        lat,
        lng,
        category: 'general',
      };
      setRiderPickup(customLoc);
      setPickMode('none');
    } else if (pickMode === 'dropoff') {
      const customLoc: LocationPoint = {
        name: `Custom Map Pin (${lat.toFixed(3)}, ${lng.toFixed(3)})`,
        address: 'Selected location on live map',
        lat,
        lng,
        category: 'general',
      };
      setRiderDropoff(customLoc);
      setPickMode('none');
    }
  };

  const handleBookClick = () => {
    sounds.playRequestBeep();
    bookRide(paymentMethod);
  };

  const handleCopyOtp = (otp: string) => {
    navigator.clipboard.writeText(otp);
    setOtpCopied(true);
    setTimeout(() => setOtpCopied(false), 2000);
  };

  return (

    <div className="max-w-7xl mx-auto px-4 py-6 space-y-6">
      {/* Top Banner Ticker */}
      <div className="bg-gradient-to-r from-amber-500/10 via-amber-400/5 to-slate-900 border border-amber-500/30 rounded-2xl px-4 py-3 flex flex-col sm:flex-row items-center justify-between gap-3 shadow-lg">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/40 flex items-center justify-center font-bold shrink-0">
            <Zap className="w-4 h-4" />
          </div>
          <div>
            <h4 className="text-xs font-black text-white flex items-center gap-2">
              <span>Nani Premium Fleet Guarantee</span>
              <span className="text-[10px] bg-amber-500/20 text-amber-300 border border-amber-500/30 px-2 py-0.5 rounded-full font-bold">
                ⚡ Low Wait Times
              </span>
            </h4>
            <p className="text-[11px] text-slate-400">
              Clean AC cabs, top-rated commercial drivers, 0 cancellation penalty.
            </p>
          </div>
        </div>

        <button
          onClick={() => setShowSafetyModal(true)}
          className="py-1.5 px-3 bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-200 rounded-xl text-xs font-bold flex items-center gap-1.5 shrink-0 transition-all"
        >
          <Shield className="w-3.5 h-3.5 text-emerald-400" />
          <span>Safety Center</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Console Column */}
        <div className="lg:col-span-5 space-y-6">
          {(!currentRide || currentRide.status === 'idle') && (
            <div className="glass-panel-dark border border-slate-800/80 rounded-3xl p-6 shadow-2xl space-y-6 backdrop-blur-2xl">
              <div>
                <h1 className="text-2xl font-black text-white tracking-tight">Book Your Ride</h1>
                <p className="text-xs text-slate-400 mt-1">Enter destination & choose your vehicle category</p>
              </div>

              {/* Location Selector Inputs */}
              <div className="space-y-4 relative">
                <div className="absolute left-[19px] top-10 bottom-10 w-0.5 bg-gradient-to-b from-emerald-500 via-amber-500 to-rose-500 z-0" />

                {/* Pickup Location Autocomplete Input */}
                <div className="relative z-20">
                  <div className="flex items-center justify-between mb-1.5">
                    <button
                      type="button"
                      onClick={() => setPickMode(pickMode === 'pickup' ? 'none' : 'pickup')}
                      className={`text-[10px] font-extrabold px-2.5 py-1 rounded-lg border transition-all ml-auto ${
                        pickMode === 'pickup'
                          ? 'bg-emerald-500 text-slate-950 border-emerald-400 shadow-md'
                          : 'bg-slate-900 text-slate-300 border-slate-800 hover:text-white'
                      }`}
                    >
                      {pickMode === 'pickup' ? '🎯 Click Map...' : '🎯 Pin on Map'}
                    </button>
                  </div>

                  <GooglePlacesSearch
                    label="Pickup Location"
                    value={riderPickup}
                    onChangeLocation={(loc) => setRiderPickup(loc)}
                    iconBgColor="bg-emerald-500/20 text-emerald-400 border-emerald-500/40"
                    dotColor="bg-emerald-400"
                    placeholder="Search pickup landmark, airport, tech park..."
                  />
                </div>

                {/* Dropoff Location Autocomplete Input */}
                <div className="relative z-10">
                  <div className="flex items-center justify-between mb-1.5">
                    <button
                      type="button"
                      onClick={() => setPickMode(pickMode === 'dropoff' ? 'none' : 'dropoff')}
                      className={`text-[10px] font-extrabold px-2.5 py-1 rounded-lg border transition-all ml-auto ${
                        pickMode === 'dropoff'
                          ? 'bg-rose-500 text-white border-rose-400 shadow-md'
                          : 'bg-slate-900 text-slate-300 border-slate-800 hover:text-white'
                      }`}
                    >
                      {pickMode === 'dropoff' ? '🎯 Click Map...' : '🎯 Pin on Map'}
                    </button>
                  </div>

                  <GooglePlacesSearch
                    label="Dropoff Location"
                    value={riderDropoff}
                    onChangeLocation={(loc) => setRiderDropoff(loc)}
                    iconBgColor="bg-rose-500/20 text-rose-400 border-rose-500/40"
                    dotColor="bg-rose-400"
                    placeholder="Search dropoff landmark or address..."
                  />
                </div>
              </div>


              {/* Distance Summary Card */}
              <div className="bg-slate-950/80 p-3.5 rounded-2xl border border-slate-800 flex items-center justify-between text-xs">
                <span className="text-slate-400 font-medium flex items-center gap-1.5">
                  <Navigation className="w-3.5 h-3.5 text-amber-400" /> Estimated Distance:
                </span>
                <div className="flex items-center gap-2">
                  <span className="font-mono font-black text-amber-400 text-base">{distance} km</span>
                  <span className="text-[10px] text-slate-500 font-bold">({Math.round(distance * 2.8)} mins)</span>
                </div>
              </div>

              {/* Vehicle Options Grid */}
              <div className="space-y-3">
                <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider">
                  Select Vehicle Category
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
                            ? 'bg-gradient-to-r from-amber-950/50 via-slate-900 to-slate-900 border-amber-500/90 shadow-xl shadow-amber-500/10 scale-[1.01]'
                            : 'bg-slate-950/60 border-slate-800 hover:border-slate-700'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <span className="text-3xl p-1 bg-slate-900 rounded-xl border border-slate-800">{v.icon}</span>
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="font-bold text-sm text-white">{v.name}</span>
                              {v.badge && (
                                <span className="text-[9px] font-extrabold uppercase px-2 py-0.5 rounded-full bg-amber-500/15 text-amber-400 border border-amber-500/30">
                                  {v.badge}
                                </span>
                              )}
                            </div>
                            <p className="text-[11px] text-slate-400 mt-0.5">{v.tagline}</p>
                            <div className="flex items-center gap-3 text-[10px] text-slate-500 mt-1 font-semibold">
                              <span className="flex items-center gap-1">
                                <Users className="w-3 h-3 text-slate-400" /> {v.capacity} Seats
                              </span>
                              <span className="flex items-center gap-1">
                                <Briefcase className="w-3 h-3 text-slate-400" /> {v.bags} Bags
                              </span>
                              <span className="text-amber-400 font-bold">⚡ {v.eta} min away</span>
                            </div>
                          </div>
                        </div>

                        <div className="text-right shrink-0">
                          <span className="font-black text-lg text-amber-400 block">₹{fare}</span>
                          <span className="text-[10px] text-slate-500 font-medium">Incl. Taxes</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Payment Method Selector */}
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
                      className={`py-2.5 px-2 rounded-xl text-xs font-extrabold border transition-all ${
                        paymentMethod === pm.id
                          ? 'bg-amber-500/20 text-amber-300 border-amber-500/60 shadow-md'
                          : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white'
                      }`}
                    >
                      {pm.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Action Button */}
              <button
                onClick={handleBookClick}
                className="w-full py-4 bg-gradient-to-r from-amber-500 via-amber-400 to-yellow-400 hover:brightness-110 text-slate-950 font-black text-base rounded-2xl shadow-xl shadow-amber-500/25 transition-all flex items-center justify-center gap-2"
              >
                <Car className="w-5 h-5" />
                <span>CONFIRM & BOOK CAB (₹{calculateFare(distance, selectedVehicle)})</span>
              </button>
            </div>
          )}

          {/* Active Ride Tracking State */}
          {currentRide && currentRide.status !== 'idle' && (
            <div className="glass-panel-dark border border-slate-800/80 rounded-3xl p-6 shadow-2xl space-y-6 backdrop-blur-2xl">
              {currentRide.status === 'requested' && (
                <div className="text-center space-y-5 py-4">
                  <div className="relative w-20 h-20 mx-auto flex items-center justify-center">
                    <div className="absolute inset-0 rounded-full bg-amber-500/20 animate-ping-radar" />
                    <div className="w-14 h-14 rounded-full bg-amber-500/20 border border-amber-400 text-amber-400 flex items-center justify-center z-10 shadow-xl shadow-amber-500/30">
                      <Radio className="w-7 h-7 animate-pulse" />
                    </div>
                  </div>

                  <div>
                    <h2 className="text-xl font-black text-white">Connecting to Nearby Cabs...</h2>
                    <p className="text-xs text-slate-400 mt-1">
                      Searching for available top drivers near {currentRide.pickup.name.split(',')[0]}
                    </p>
                  </div>

                  <div className="bg-slate-950/80 p-3.5 rounded-2xl border border-slate-800 text-xs text-slate-300 flex items-center justify-between">
                    <span>Estimated Fare: <strong className="text-amber-400 font-mono text-sm">₹{currentRide.fare}</strong></span>
                    <span>Distance: <strong className="text-slate-200">{currentRide.distanceKm} km</strong></span>
                  </div>

                  <button
                    onClick={cancelRide}
                    className="w-full py-3 bg-slate-900 hover:bg-rose-950/60 hover:text-rose-400 border border-slate-800 text-slate-300 font-bold rounded-2xl text-xs transition-all"
                  >
                    Cancel Booking Request
                  </button>
                </div>
              )}

              {(currentRide.status === 'accepted' || currentRide.status === 'in_transit') && (
                <div className="space-y-5">
                  <div className="flex items-center justify-between">
                    <span className="px-3 py-1 rounded-full text-xs font-extrabold bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 flex items-center gap-1.5">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      {currentRide.status === 'accepted' ? 'Driver Arriving Soon' : 'Trip In Transit'}
                    </span>
                    <span className="text-xs font-mono font-black text-amber-400 text-sm">Fare: ₹{currentRide.fare}</span>
                  </div>

                  {/* Driver Profile Card */}
                  <div className="bg-slate-950/90 p-4 rounded-2xl border border-slate-800 space-y-4 shadow-xl">
                    <div className="flex items-center gap-4">
                      <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-amber-500 to-yellow-400 text-slate-950 font-black text-2xl flex items-center justify-center shrink-0 shadow-lg shadow-amber-500/20">
                        VS
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <h4 className="font-bold text-base text-white">{currentRide.driverName}</h4>
                          <span className="text-xs font-bold text-amber-400 flex items-center gap-1 bg-amber-500/10 px-2 py-0.5 rounded-full border border-amber-500/20">
                            ⭐ {currentRide.driverRating}
                          </span>
                        </div>
                        <p className="text-xs text-slate-400 mt-0.5">{currentRide.vehicleModel}</p>
                      </div>
                    </div>

                    <div className="flex items-center justify-between bg-slate-900 px-4 py-3 rounded-xl border border-slate-800">
                      <div>
                        <span className="text-[9px] text-slate-500 font-extrabold uppercase tracking-wider block">Vehicle Plate</span>
                        <span className="font-mono font-black text-base text-emerald-400">{currentRide.vehiclePlate}</span>
                      </div>
                      <a
                        href={`tel:${currentRide.driverPhone}`}
                        className="py-2 px-3.5 bg-amber-500/15 hover:bg-amber-500/25 text-amber-400 border border-amber-500/30 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all"
                      >
                        <Phone className="w-3.5 h-3.5" /> Call Driver
                      </a>
                    </div>
                  </div>

                  {/* OTP Security Code Card */}
                  <div className="bg-gradient-to-r from-amber-500/15 via-yellow-500/10 to-slate-950 border border-amber-500/40 p-4 rounded-2xl text-center space-y-2 relative overflow-hidden">
                    <div className="flex items-center justify-between text-amber-400">
                      <span className="text-[10px] font-extrabold uppercase tracking-wider block">
                        Start-Trip Security OTP
                      </span>
                      <button
                        onClick={() => handleCopyOtp(currentRide.otp)}
                        className="text-[10px] font-bold underline flex items-center gap-1 text-slate-300 hover:text-white"
                      >
                        <Copy className="w-3 h-3" /> {otpCopied ? 'Copied!' : 'Copy OTP'}
                      </button>
                    </div>

                    <p className="font-mono font-black text-4xl text-amber-300 tracking-widest py-1">{currentRide.otp}</p>
                    <p className="text-[11px] text-slate-400">Share this 4-digit code with Vikram when cab arrives</p>
                  </div>
                </div>
              )}

              {/* Completed Ride Summary Card */}
              {currentRide.status === 'completed' && (
                <div className="space-y-5 text-center">
                  <div className="w-16 h-16 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-400 flex items-center justify-center mx-auto shadow-xl shadow-emerald-500/30">
                    <Sparkles className="w-8 h-8" />
                  </div>

                  <div>
                    <h2 className="text-2xl font-black text-white">You Have Arrived!</h2>
                    <p className="text-xs text-slate-400 mt-1">
                      Thanks for riding with Nani Cab. Total paid: <strong className="text-amber-400 text-sm font-mono">₹{currentRide.fare + tipAmount}</strong>
                    </p>
                  </div>

                  {/* Rating & Tip Section */}
                  {!ratingSubmitted ? (
                    <div className="bg-slate-950/90 p-5 rounded-2xl border border-slate-800 space-y-4">
                      <p className="text-xs font-bold text-slate-300 uppercase tracking-wider">Rate Your Trip Experience</p>

                      <div className="flex items-center justify-center gap-2">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <button
                            key={star}
                            onClick={() => setUserRating(star)}
                            className="p-1 hover:scale-125 transition-transform"
                          >
                            <Star
                              className={`w-8 h-8 ${
                                star <= userRating ? 'text-amber-400 fill-amber-400' : 'text-slate-700'
                              }`}
                            />
                          </button>
                        ))}
                      </div>

                      {/* Add Driver Tip */}
                      <div className="space-y-2 pt-2 border-t border-slate-800">
                        <label className="block text-[11px] font-bold text-slate-400 uppercase">
                          Add Tip for Driver Vikram
                        </label>
                        <div className="grid grid-cols-4 gap-2">
                          {[0, 20, 50, 100].map((amt) => (
                            <button
                              key={amt}
                              onClick={() => setTipAmount(amt)}
                              className={`py-1.5 px-2 rounded-xl text-xs font-bold border transition-all ${
                                tipAmount === amt
                                  ? 'bg-amber-500/20 text-amber-300 border-amber-500/50'
                                  : 'bg-slate-900 border-slate-800 text-slate-400'
                              }`}
                            >
                              {amt === 0 ? 'No Tip' : `₹${amt}`}
                            </button>
                          ))}
                        </div>
                      </div>

                      <button
                        onClick={() => {
                          sounds.playSuccessFanfare();
                          setRatingSubmitted(true);
                        }}
                        className="w-full py-3 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black rounded-xl text-xs shadow-lg"
                      >
                        Submit Feedback & Tip
                      </button>
                    </div>
                  ) : (
                    <div className="p-4 bg-emerald-500/10 border border-emerald-500/40 rounded-2xl text-emerald-400 text-xs font-extrabold flex items-center justify-center gap-2">
                      <Check className="w-4 h-4" /> Thank you! Feedback recorded successfully.
                    </div>
                  )}

                  <button
                    onClick={resetRide}
                    className="w-full py-4 bg-slate-900 hover:bg-slate-800 text-white font-black rounded-2xl text-xs transition-all flex items-center justify-center gap-2 border border-slate-800"
                  >
                    <RotateCcw className="w-4 h-4" />
                    <span>Book Another Ride</span>
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Right Column: Interactive Dark Vector Map */}
        <div className="lg:col-span-7 min-h-[500px] lg:min-h-[660px] bg-slate-900/90 border border-slate-800/80 rounded-3xl p-2 shadow-2xl">
          <MapWrapper
            pickup={riderPickup}
            dropoff={riderDropoff}
            driverPos={currentRide?.status !== 'idle' ? driverPos : undefined}
            onMapClick={handleMapClick}
          />
        </div>

      </div>

      {/* Safety Center Modal */}
      {showSafetyModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="max-w-md w-full glass-panel-dark border border-slate-800 rounded-3xl p-6 space-y-5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Shield className="w-6 h-6 text-emerald-400" />
                <h3 className="text-lg font-black text-white">Nani Safety Toolkit</h3>
              </div>
              <button
                onClick={() => setShowSafetyModal(false)}
                className="p-1 rounded-xl text-slate-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3">
              <div className="p-4 bg-rose-950/40 border border-rose-500/40 rounded-2xl flex items-center justify-between">
                <div>
                  <h4 className="font-bold text-sm text-rose-300">Emergency SOS Alert</h4>
                  <p className="text-xs text-slate-400">Instantly dispatch GPS location to local authorities</p>
                </div>
                <button
                  onClick={() => alert('SOS Triggered! Emergency team & contacts notified with live GPS coordinates.')}
                  className="px-3.5 py-2 bg-rose-600 hover:bg-rose-500 text-white font-black text-xs rounded-xl shadow-lg"
                >
                  SOS 112
                </button>
              </div>

              <div className="p-4 bg-slate-900 border border-slate-800 rounded-2xl flex items-center justify-between">
                <div>
                  <h4 className="font-bold text-sm text-white">Share Ride Status</h4>
                  <p className="text-xs text-slate-400">Send live tracking link to friends or family</p>
                </div>
                <button
                  onClick={() => alert('Live Tracking Link copied to clipboard!')}
                  className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs rounded-xl border border-slate-700"
                >
                  Share Link
                </button>
              </div>
            </div>

            <button
              onClick={() => setShowSafetyModal(false)}
              className="w-full py-3 bg-slate-800 text-slate-300 font-bold text-xs rounded-xl"
            >
              Close Toolkit
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

