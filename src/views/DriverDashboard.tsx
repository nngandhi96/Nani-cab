import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { MapWrapper } from '../components/MapWrapper';
import { sounds } from '../utils/audio';

import {
  FileText,
  Upload,
  CheckCircle2,
  AlertCircle,
  Power,
  Clock,
  DollarSign,
  User,
  Phone,
  ShieldCheck,
  Award,
  Navigation,
  Check,
  X,
  CheckCheck,
  Sparkles,
  Radio,
  TrendingUp,
  CornerUpRight,
} from 'lucide-react';
import type { DriverDocuments } from '../types';

export const DriverDashboard: React.FC = () => {
  const {
    driverDocs,
    updateDriverDoc,
    driverStats,
    toggleDriverOnline,
    currentRide,
    acceptRide,
    rejectRide,
    verifyOtpAndStartTrip,
    completeTrip,
    driverPos,
  } = useApp();

  const [otpInput, setOtpInput] = useState('');
  const [otpError, setOtpError] = useState('');
  const [requestTimer, setRequestTimer] = useState(30);

  const docKeys: (keyof DriverDocuments)[] = ['license', 'rc', 'insurance', 'identity'];
  const verifiedCount = docKeys.filter((k) => driverDocs[k] === 'verified').length;

  const handleFileUpload = (docKey: keyof DriverDocuments) => {
    updateDriverDoc(docKey, 'uploaded');
    setTimeout(() => {
      updateDriverDoc(docKey, 'verified');
    }, 1500);
  };

  // Sound chime and countdown timer for incoming ride request
  useEffect(() => {
    if (currentRide && currentRide.status === 'requested') {
      sounds.playRequestBeep();
      setRequestTimer(30);
      const timer = setInterval(() => {
        setRequestTimer((prev) => (prev > 0 ? prev - 1 : 0));
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [currentRide?.status, currentRide?.id]);



  const handleAcceptRide = () => {
    sounds.playAcceptChime();
    if (currentRide) acceptRide(currentRide.id);
  };

  const handleVerifyOtpSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const success = verifyOtpAndStartTrip(otpInput);
    if (!success) {
      setOtpError('Invalid OTP code. Please ask rider for correct 4-digit code.');
    } else {
      sounds.playAcceptChime();
      setOtpError('');
      setOtpInput('');
    }
  };

  const handleCompleteTrip = () => {
    sounds.playSuccessFanfare();
    completeTrip();
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-6 space-y-6">
      {/* Header Banner & Duty Toggle Switch */}
      <div className="glass-panel-dark border border-slate-800/80 rounded-3xl p-6 shadow-2xl backdrop-blur-2xl flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center text-slate-950 font-black text-2xl shadow-xl shadow-emerald-500/25 shrink-0">
            VS
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-black text-white">Driver Cockpit</h1>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5" /> Commercial Gold
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-1">Vikram Singh • KA-04-EV-7788 (White Swift Dzire AC)</p>
          </div>
        </div>

        {/* Online/Offline Toggle Button */}
        <div className="flex items-center gap-4 w-full md:w-auto justify-between md:justify-end">
          <div className="text-right">
            <p className="text-[10px] font-extrabold uppercase tracking-widest text-slate-400">Duty Radar</p>
            <p className={`text-sm font-bold ${driverStats.isOnline ? 'text-emerald-400' : 'text-slate-500'}`}>
              {driverStats.isOnline ? '🟢 Online & Scanning Rides' : '🔴 Offline Mode'}
            </p>
          </div>

          <button
            onClick={toggleDriverOnline}
            className={`px-6 py-3.5 rounded-2xl font-black text-xs tracking-wider transition-all flex items-center gap-2.5 shadow-xl ${
              driverStats.isOnline
                ? 'bg-gradient-to-r from-emerald-500 to-teal-400 text-slate-950 hover:brightness-110 shadow-emerald-500/25'
                : 'bg-slate-800 text-slate-300 hover:bg-slate-700 border border-slate-700'
            }`}
          >
            <Power className={`w-4 h-4 ${driverStats.isOnline ? 'animate-pulse' : ''}`} />
            <span>{driverStats.isOnline ? 'GO OFFLINE' : 'GO ONLINE'}</span>
          </button>
        </div>
      </div>

      {/* Driver KPI Stat Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="glass-panel p-4 rounded-2xl border border-slate-800 shadow-lg">
          <div className="flex items-center justify-between text-slate-400 text-xs font-semibold">
            <span>Today's Earnings</span>
            <DollarSign className="w-4 h-4 text-emerald-400" />
          </div>
          <p className="text-2xl font-black text-white mt-2 font-mono">₹{driverStats.todayEarnings}</p>
          <span className="text-[10px] text-emerald-400 font-bold flex items-center gap-1 mt-1">
            <TrendingUp className="w-3 h-3" /> Target 82% Completed
          </span>
        </div>

        <div className="glass-panel p-4 rounded-2xl border border-slate-800 shadow-lg">
          <div className="flex items-center justify-between text-slate-400 text-xs font-semibold">
            <span>Rides Completed</span>
            <CheckCircle2 className="w-4 h-4 text-amber-400" />
          </div>
          <p className="text-2xl font-black text-white mt-2 font-mono">{driverStats.completedRides}</p>
          <span className="text-[10px] text-slate-400 font-medium">Goal: 10 trips today</span>
        </div>

        <div className="glass-panel p-4 rounded-2xl border border-slate-800 shadow-lg">
          <div className="flex items-center justify-between text-slate-400 text-xs font-semibold">
            <span>Acceptance Rate</span>
            <Award className="w-4 h-4 text-cyan-400" />
          </div>
          <p className="text-2xl font-black text-white mt-2 font-mono">{driverStats.acceptanceRate}%</p>
          <span className="text-[10px] text-cyan-400 font-bold">Top Tier Incentive Unlocked</span>
        </div>

        <div className="glass-panel p-4 rounded-2xl border border-slate-800 shadow-lg">
          <div className="flex items-center justify-between text-slate-400 text-xs font-semibold">
            <span>Driver Rating</span>
            <Sparkles className="w-4 h-4 text-yellow-400" />
          </div>
          <p className="text-2xl font-black text-white mt-2 font-mono">⭐ {driverStats.rating}</p>
          <span className="text-[10px] text-slate-400 font-medium">148 Commercial Trips</span>
        </div>
      </div>

      {/* Mandatory Document Verification Card */}
      <div className="glass-panel-dark border border-slate-800/80 rounded-3xl p-6 shadow-2xl space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <FileText className="w-5 h-5 text-amber-400" />
              <span>Mandatory Driver License & Vehicle Credentials</span>
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Verified documents keep your profile active on Nani Cab Commercial Network.
            </p>
          </div>
          <div className="text-right">
            <span className="text-xs font-bold text-slate-300 font-mono">
              Verified: {verifiedCount} / {docKeys.length}
            </span>
            <div className="w-32 bg-slate-900 h-2 rounded-full overflow-hidden mt-1 border border-slate-800">
              <div
                className="bg-emerald-500 h-full transition-all duration-500"
                style={{ width: `${(verifiedCount / docKeys.length) * 100}%` }}
              />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { key: 'license' as const, label: 'Driving License', desc: 'Valid Commercial DL' },
            { key: 'rc' as const, label: 'Vehicle RC', desc: 'Registration Certificate' },
            { key: 'insurance' as const, label: 'Vehicle Insurance', desc: 'Comprehensive Policy' },
            { key: 'identity' as const, label: 'Government ID', desc: 'Aadhaar / PAN Card' },
          ].map((doc) => {
            const status = driverDocs[doc.key];
            return (
              <div
                key={doc.key}
                className="bg-slate-950/80 border border-slate-800/80 rounded-2xl p-4 space-y-3 flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-bold text-xs text-slate-200">{doc.label}</span>
                    {status === 'verified' && (
                      <span className="px-2 py-0.5 rounded-full text-[9px] font-extrabold uppercase bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3" /> Verified
                      </span>
                    )}
                    {status === 'uploaded' && (
                      <span className="px-2 py-0.5 rounded-full text-[9px] font-extrabold uppercase bg-amber-500/10 text-amber-400 border border-amber-500/30 flex items-center gap-1">
                        <Clock className="w-3 h-3 animate-spin" /> Reviewing
                      </span>
                    )}
                    {status === 'pending' && (
                      <span className="px-2 py-0.5 rounded-full text-[9px] font-extrabold uppercase bg-rose-500/10 text-rose-400 border border-rose-500/30 flex items-center gap-1">
                        <AlertCircle className="w-3 h-3" /> Required
                      </span>
                    )}
                  </div>
                  <p className="text-[11px] text-slate-400">{doc.desc}</p>
                </div>

                <div className="pt-2 border-t border-slate-800">
                  {status === 'verified' ? (
                    <div className="text-[11px] font-bold text-emerald-400 flex items-center justify-center gap-1 py-1">
                      <ShieldCheck className="w-3.5 h-3.5" /> Approved
                    </div>
                  ) : (
                    <button
                      onClick={() => handleFileUpload(doc.key)}
                      disabled={status === 'uploaded'}
                      className="w-full py-2 px-3 bg-slate-900 hover:bg-slate-800 text-slate-200 text-xs font-bold rounded-xl border border-slate-800 transition-all flex items-center justify-center gap-2"
                    >
                      <Upload className="w-3.5 h-3.5" />
                      <span>{status === 'uploaded' ? 'Reviewing...' : 'Upload Mock'}</span>
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Ride Request & Turn-By-Turn HUD Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="space-y-6">
          {!driverStats.isOnline && (
            <div className="glass-panel-dark border border-slate-800 rounded-3xl p-6 text-center space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-slate-900 text-slate-500 flex items-center justify-center mx-auto border border-slate-800">
                <Power className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-white">Duty Status: Offline</h3>
              <p className="text-xs text-slate-400 max-w-xs mx-auto">
                Toggle "GO ONLINE" above to connect to Nani Cab dispatch radar.
              </p>
            </div>
          )}

          {driverStats.isOnline && !currentRide && (
            <div className="glass-panel-dark border border-slate-800 rounded-3xl p-6 text-center space-y-4">
              <div className="relative w-16 h-16 mx-auto flex items-center justify-center">
                <div className="absolute inset-0 rounded-full bg-emerald-500/20 animate-ping-radar" />
                <div className="w-12 h-12 rounded-full bg-emerald-500/20 border border-emerald-400 text-emerald-400 flex items-center justify-center z-10 shadow-xl shadow-emerald-500/30">
                  <Radio className="w-6 h-6 animate-pulse" />
                </div>
              </div>
              <div>
                <h3 className="text-lg font-black text-white">Scanning Hotspot Surge Zones...</h3>
                <p className="text-xs text-slate-400 mt-1">
                  Radar active near Airport & Manyata Corridor. Open Rider Mode in a new tab to create a booking!
                </p>
              </div>
            </div>
          )}

          {/* Incoming Ride Request Modal Card */}
          {driverStats.isOnline && currentRide && currentRide.status === 'requested' && (
            <div className="bg-gradient-to-br from-amber-950/60 via-slate-950 to-slate-900 border-2 border-amber-500/90 rounded-3xl p-6 shadow-2xl space-y-5">
              <div className="flex items-center justify-between">
                <span className="px-3 py-1 rounded-full text-[10px] font-black bg-amber-500 text-slate-950 tracking-wider uppercase flex items-center gap-1.5 shadow-lg">
                  <Sparkles className="w-3.5 h-3.5" /> Incoming Booking!
                </span>
                <div className="flex items-center gap-1 text-xs font-mono font-black text-amber-400 bg-amber-500/10 px-2.5 py-1 rounded-full border border-amber-500/30">
                  <Clock className="w-3.5 h-3.5 animate-spin" /> {requestTimer}s
                </div>
              </div>

              <div className="flex items-center gap-3 bg-slate-950/80 p-3.5 rounded-2xl border border-slate-800">
                <div className="w-10 h-10 rounded-xl bg-amber-500/15 border border-amber-500/30 text-amber-400 flex items-center justify-center font-bold">
                  <User className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-bold text-sm text-white">{currentRide.riderName}</h4>
                  <p className="text-[11px] text-slate-400">⭐ {currentRide.riderRating} • {currentRide.paymentMethod.toUpperCase()}</p>
                </div>
                <div className="ml-auto text-right">
                  <span className="text-2xl font-black text-emerald-400 block font-mono">₹{currentRide.fare}</span>
                  <span className="text-[10px] text-slate-400 font-bold">{currentRide.distanceKm} km trip</span>
                </div>
              </div>

              <div className="space-y-2 text-xs">
                <div className="flex items-start gap-2.5">
                  <div className="w-4 h-4 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0 mt-0.5 font-bold text-[10px]">
                    A
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[9px] font-bold uppercase">Pickup</span>
                    <span className="text-slate-200 font-semibold">{currentRide.pickup.name}</span>
                  </div>
                </div>

                <div className="flex items-start gap-2.5">
                  <div className="w-4 h-4 rounded-full bg-rose-500/20 text-rose-400 flex items-center justify-center shrink-0 mt-0.5 font-bold text-[10px]">
                    B
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[9px] font-bold uppercase">Dropoff</span>
                    <span className="text-slate-200 font-semibold">{currentRide.dropoff.name}</span>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 pt-2">
                <button
                  onClick={() => rejectRide(currentRide.id)}
                  className="py-3 px-4 bg-slate-900 hover:bg-rose-950/70 hover:text-rose-400 border border-slate-800 rounded-2xl text-xs font-bold text-slate-300 transition-all flex items-center justify-center gap-2"
                >
                  <X className="w-4 h-4" />
                  <span>Decline</span>
                </button>
                <button
                  onClick={handleAcceptRide}
                  className="py-3 px-4 bg-gradient-to-r from-emerald-500 to-teal-400 hover:brightness-110 text-slate-950 font-black rounded-2xl shadow-xl shadow-emerald-500/30 transition-all flex items-center justify-center gap-2 text-sm"
                >
                  <Check className="w-4 h-4" />
                  <span>Accept Ride</span>
                </button>
              </div>
            </div>
          )}

          {/* Navigation Mode: En Route to Pickup */}
          {currentRide && currentRide.status === 'accepted' && (
            <div className="glass-panel-dark border border-emerald-500/40 rounded-3xl p-6 shadow-2xl space-y-5">
              {/* Turn-by-Turn HUD Banner */}
              <div className="bg-emerald-950/60 border border-emerald-500/40 p-3.5 rounded-2xl flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-500 text-slate-950 flex items-center justify-center shrink-0 font-black">
                  <CornerUpRight className="w-6 h-6" />
                </div>
                <div>
                  <span className="text-[10px] font-extrabold uppercase text-emerald-400 tracking-wider block">GPS Navigation HUD</span>
                  <p className="text-xs font-bold text-white">In 200m, turn right onto Outer Ring Road</p>
                </div>
              </div>

              <div className="bg-slate-950/80 p-4 rounded-2xl border border-slate-800 space-y-3">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-400 font-medium">Rider Name: <strong className="text-white">{currentRide.riderName}</strong></span>
                  <a
                    href={`tel:${currentRide.riderPhone}`}
                    className="text-amber-400 font-bold flex items-center gap-1 hover:underline"
                  >
                    <Phone className="w-3.5 h-3.5" /> Call Rider
                  </a>
                </div>
                <div className="text-xs text-slate-300">
                  <span className="font-bold text-emerald-400">Pickup Location: </span>
                  {currentRide.pickup.name}
                </div>
              </div>

              {/* OTP Form */}
              <form onSubmit={handleVerifyOtpSubmit} className="space-y-3 pt-2">
                <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider">
                  Ask Rider for 4-Digit Security OTP
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    maxLength={4}
                    value={otpInput}
                    onChange={(e) => setOtpInput(e.target.value)}
                    placeholder="1234"
                    className="flex-1 bg-slate-950 border border-slate-800 rounded-2xl px-4 py-3 text-white font-mono font-black text-center tracking-widest text-xl focus:outline-none focus:border-emerald-500"
                  />
                  <button
                    type="submit"
                    className="py-3 px-5 bg-gradient-to-r from-emerald-500 to-teal-400 text-slate-950 font-black rounded-2xl text-xs transition-all shadow-lg"
                  >
                    Start Ride
                  </button>
                </div>
                {otpError && <p className="text-xs text-rose-400 font-semibold">{otpError}</p>}
              </form>
            </div>
          )}

          {/* Navigation Mode: Trip In Transit */}
          {currentRide && currentRide.status === 'in_transit' && (
            <div className="glass-panel-dark border border-amber-500/40 rounded-3xl p-6 shadow-2xl space-y-5">
              {/* Turn-by-Turn HUD Banner */}
              <div className="bg-amber-950/60 border border-amber-500/40 p-3.5 rounded-2xl flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-amber-500 text-slate-950 flex items-center justify-center shrink-0 font-black">
                  <Navigation className="w-6 h-6 animate-pulse" />
                </div>
                <div>
                  <span className="text-[10px] font-extrabold uppercase text-amber-400 tracking-wider block">Live Route Navigation</span>
                  <p className="text-xs font-bold text-white">Heading to Dropoff: {currentRide.dropoff.name.split(',')[0]}</p>
                </div>
              </div>

              <div className="bg-slate-950/80 p-4 rounded-2xl border border-slate-800 text-xs space-y-2">
                <div className="flex items-center justify-between text-slate-400">
                  <span>Distance Remaining: <strong className="text-white font-mono">{currentRide.distanceKm} km</strong></span>
                  <span>Est Duration: <strong className="text-amber-400 font-mono">{currentRide.durationMins} mins</strong></span>
                </div>
                <div className="flex items-center justify-between text-slate-400 pt-2 border-t border-slate-800">
                  <span>Payment Mode: <strong className="text-emerald-400 font-bold uppercase">{currentRide.paymentMethod}</strong></span>
                  <span>Fare: <strong className="text-amber-400 font-mono text-sm">₹{currentRide.fare}</strong></span>
                </div>
              </div>

              <button
                onClick={handleCompleteTrip}
                className="w-full py-4 bg-gradient-to-r from-emerald-500 to-teal-400 hover:brightness-110 text-slate-950 font-black rounded-2xl shadow-xl shadow-emerald-500/25 text-sm transition-all flex items-center justify-center gap-2"
              >
                <CheckCheck className="w-5 h-5" />
                <span>Complete Trip & Collect ₹{currentRide.fare}</span>
              </button>
            </div>
          )}

          {currentRide && currentRide.status === 'completed' && (
            <div className="glass-panel-dark border border-emerald-500/50 rounded-3xl p-6 shadow-2xl text-center space-y-4">
              <div className="w-14 h-14 rounded-2xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 flex items-center justify-center mx-auto shadow-xl">
                <CheckCheck className="w-8 h-8" />
              </div>
              <div>
                <h3 className="text-xl font-black text-white">Trip Completed!</h3>
                <p className="text-xs text-slate-400 mt-1 font-medium">₹{currentRide.fare} added to today's earnings</p>
              </div>
            </div>
          )}
        </div>

        {/* Right Column: Driver Live Dark Vector Map with Surge Heatmap */}
        <div className="lg:col-span-2 min-h-[480px] lg:min-h-[580px] bg-slate-900/90 border border-slate-800/80 rounded-3xl p-2 shadow-2xl">
          <MapWrapper
            pickup={currentRide?.pickup}
            dropoff={currentRide?.dropoff}
            driverPos={driverPos}
            showSurgeHotspots={true}
          />
        </div>

      </div>
    </div>
  );
};

