import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { LeafletMap } from '../components/LeafletMap';
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
  Play,
  CheckCheck,
  Sparkles,
  Radio,
} from 'lucide-react';
import type { DriverDocuments } from '../types';
import { generateRoutePoints } from '../utils/mockData';

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
    setDriverPos,
  } = useApp();

  const [otpInput, setOtpInput] = useState('');
  const [otpError, setOtpError] = useState('');

  const docKeys: (keyof DriverDocuments)[] = ['license', 'rc', 'insurance', 'identity'];
  const verifiedCount = docKeys.filter((k) => driverDocs[k] === 'verified').length;

  const handleFileUpload = (docKey: keyof DriverDocuments) => {
    updateDriverDoc(docKey, 'uploaded');
    setTimeout(() => {
      updateDriverDoc(docKey, 'verified');
    }, 1500);
  };

  useEffect(() => {
    if (!currentRide) return;

    if (currentRide.status === 'accepted') {
      const interval = setInterval(() => {
        setDriverPos({
          lat: driverPos.lat + (currentRide.pickup.lat - driverPos.lat) * 0.1,
          lng: driverPos.lng + (currentRide.pickup.lng - driverPos.lng) * 0.1,
        });
      }, 1000);
      return () => clearInterval(interval);
    } else if (currentRide.status === 'in_transit') {
      const routePoints = generateRoutePoints(currentRide.pickup, currentRide.dropoff, 20);
      let stepIndex = 0;
      const interval = setInterval(() => {
        if (stepIndex < routePoints.length) {
          setDriverPos(routePoints[stepIndex]);
          stepIndex++;
        }
      }, 1500);
      return () => clearInterval(interval);
    }
  }, [currentRide?.status]);

  const handleVerifyOtpSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const success = verifyOtpAndStartTrip(otpInput);
    if (!success) {
      setOtpError('Invalid OTP code. Please ask rider for correct 4-digit code.');
    } else {
      setOtpError('');
      setOtpInput('');
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-6 space-y-6">
      {/* Header Banner & Online Toggle */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 shadow-2xl backdrop-blur-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center text-slate-950 font-black text-2xl shadow-xl shadow-emerald-500/20">
            VS
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-extrabold text-white">Driver Console</h1>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5" /> Verified Driver
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-1">Vikram Singh • KA-04-EV-7788 (White Swift Dzire)</p>
          </div>
        </div>

        {/* Online/Offline Toggle Button */}
        <div className="flex items-center gap-4 w-full md:w-auto justify-between md:justify-end">
          <div className="text-right">
            <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Driver Duty Status</p>
            <p className={`text-sm font-bold ${driverStats.isOnline ? 'text-emerald-400' : 'text-slate-500'}`}>
              {driverStats.isOnline ? '🟢 Online & Ready for Rides' : '🔴 Offline'}
            </p>
          </div>

          <button
            onClick={toggleDriverOnline}
            className={`px-6 py-3.5 rounded-2xl font-extrabold text-sm transition-all flex items-center gap-3 shadow-xl ${
              driverStats.isOnline
                ? 'bg-gradient-to-r from-emerald-500 to-teal-400 text-slate-950 hover:brightness-110 shadow-emerald-500/20'
                : 'bg-slate-800 text-slate-300 hover:bg-slate-700 border border-slate-700'
            }`}
          >
            <Power className={`w-5 h-5 ${driverStats.isOnline ? 'animate-pulse' : ''}`} />
            <span>{driverStats.isOnline ? 'GO OFFLINE' : 'GO ONLINE'}</span>
          </button>
        </div>
      </div>

      {/* Driver Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4 shadow-lg">
          <div className="flex items-center justify-between text-slate-400 text-xs font-medium">
            <span>Today's Earnings</span>
            <DollarSign className="w-4 h-4 text-emerald-400" />
          </div>
          <p className="text-2xl font-black text-white mt-2">₹{driverStats.todayEarnings}</p>
          <span className="text-[10px] text-emerald-400 font-semibold">+₹{currentRide?.status === 'completed' ? currentRide.fare : 0} from last ride</span>
        </div>

        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4 shadow-lg">
          <div className="flex items-center justify-between text-slate-400 text-xs font-medium">
            <span>Rides Completed</span>
            <CheckCircle2 className="w-4 h-4 text-amber-400" />
          </div>
          <p className="text-2xl font-black text-white mt-2">{driverStats.completedRides}</p>
          <span className="text-[10px] text-slate-400">Target: 10 rides today</span>
        </div>

        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4 shadow-lg">
          <div className="flex items-center justify-between text-slate-400 text-xs font-medium">
            <span>Acceptance Rate</span>
            <Award className="w-4 h-4 text-cyan-400" />
          </div>
          <p className="text-2xl font-black text-white mt-2">{driverStats.acceptanceRate}%</p>
          <span className="text-[10px] text-cyan-400 font-semibold">High Tier Bonus Eligible</span>
        </div>

        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4 shadow-lg">
          <div className="flex items-center justify-between text-slate-400 text-xs font-medium">
            <span>Driver Rating</span>
            <Sparkles className="w-4 h-4 text-yellow-400" />
          </div>
          <p className="text-2xl font-black text-white mt-2">⭐ {driverStats.rating}</p>
          <span className="text-[10px] text-slate-400">Based on 148 reviews</span>
        </div>
      </div>

      {/* Mandatory Document Upload Section */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 shadow-2xl space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <FileText className="w-5 h-5 text-amber-400" />
              <span>Mandatory Driver Verification Documents</span>
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Upload your documents to remain active on the Nani Cab driver network.
            </p>
          </div>
          <div className="text-right">
            <span className="text-xs font-bold text-slate-300">
              Verified: {verifiedCount} / {docKeys.length}
            </span>
            <div className="w-32 bg-slate-800 h-2 rounded-full overflow-hidden mt-1">
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
                className="bg-slate-950/70 border border-slate-800 rounded-2xl p-4 space-y-3 flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-bold text-sm text-slate-200">{doc.label}</span>
                    {status === 'verified' && (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3" /> Verified
                      </span>
                    )}
                    {status === 'uploaded' && (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/10 text-amber-400 border border-amber-500/30 flex items-center gap-1">
                        <Clock className="w-3 h-3 animate-spin" /> Reviewing
                      </span>
                    )}
                    {status === 'pending' && (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-500/10 text-rose-400 border border-rose-500/30 flex items-center gap-1">
                        <AlertCircle className="w-3 h-3" /> Action Required
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-slate-400">{doc.desc}</p>
                </div>

                <div className="pt-2 border-t border-slate-800/80">
                  {status === 'verified' ? (
                    <div className="text-xs font-semibold text-emerald-400 flex items-center justify-center gap-1 py-1">
                      <ShieldCheck className="w-4 h-4" /> Document Approved
                    </div>
                  ) : (
                    <button
                      onClick={() => handleFileUpload(doc.key)}
                      disabled={status === 'uploaded'}
                      className="w-full py-2 px-3 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-xl border border-slate-700 transition-all flex items-center justify-center gap-2"
                    >
                      <Upload className="w-3.5 h-3.5" />
                      <span>{status === 'uploaded' ? 'Re-uploading...' : 'Upload File (Mock)'}</span>
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Ride Requests & Active Navigation Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="space-y-6">
          {!driverStats.isOnline && (
            <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 text-center space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-slate-800 text-slate-400 flex items-center justify-center mx-auto">
                <Power className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-white">You are currently Offline</h3>
              <p className="text-xs text-slate-400 max-w-xs mx-auto">
                Switch your status to Online above to start receiving ride requests from nearby riders.
              </p>
            </div>
          )}

          {driverStats.isOnline && !currentRide && (
            <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 text-center space-y-4">
              <div className="relative w-16 h-16 mx-auto flex items-center justify-center">
                <div className="absolute inset-0 rounded-full bg-emerald-500/20 animate-ping-slow" />
                <div className="w-12 h-12 rounded-full bg-emerald-500/20 border border-emerald-400 text-emerald-400 flex items-center justify-center z-10">
                  <Radio className="w-6 h-6 animate-pulse" />
                </div>
              </div>
              <div>
                <h3 className="text-lg font-bold text-white">Searching for Nearby Rides...</h3>
                <p className="text-xs text-slate-400 mt-1">
                  Radar active near Manyata & Airport corridor. Open Rider tab in a new tab to create a booking!
                </p>
              </div>
            </div>
          )}

          {driverStats.isOnline && currentRide && currentRide.status === 'requested' && (
            <div className="bg-gradient-to-br from-amber-950/40 via-slate-900 to-slate-900 border-2 border-amber-500/80 rounded-3xl p-6 shadow-2xl space-y-5 animate-pulse">
              <div className="flex items-center justify-between">
                <span className="px-3 py-1 rounded-full text-xs font-black bg-amber-500 text-slate-950 tracking-wider uppercase flex items-center gap-1.5 shadow-lg shadow-amber-500/30">
                  <Sparkles className="w-3.5 h-3.5" /> Incoming Ride Request!
                </span>
                <span className="text-xs font-mono font-bold text-amber-400">Time to accept: 30s</span>
              </div>

              <div className="flex items-center gap-3 bg-slate-950/60 p-3 rounded-2xl border border-slate-800">
                <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-400 flex items-center justify-center font-bold">
                  <User className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-bold text-sm text-white">{currentRide.riderName}</h4>
                  <p className="text-xs text-slate-400">⭐ {currentRide.riderRating} • {currentRide.paymentMethod.toUpperCase()} Payment</p>
                </div>
                <div className="ml-auto text-right">
                  <span className="text-xl font-black text-emerald-400 block">₹{currentRide.fare}</span>
                  <span className="text-[10px] text-slate-400 font-semibold">{currentRide.distanceKm} km</span>
                </div>
              </div>

              <div className="space-y-2 text-xs">
                <div className="flex items-start gap-2.5">
                  <div className="w-4 h-4 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0 mt-0.5 font-bold text-[10px]">
                    A
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px] font-bold uppercase">Pickup</span>
                    <span className="text-slate-200 font-medium">{currentRide.pickup.name}</span>
                  </div>
                </div>

                <div className="flex items-start gap-2.5">
                  <div className="w-4 h-4 rounded-full bg-rose-500/20 text-rose-400 flex items-center justify-center shrink-0 mt-0.5 font-bold text-[10px]">
                    B
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px] font-bold uppercase">Dropoff</span>
                    <span className="text-slate-200 font-medium">{currentRide.dropoff.name}</span>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 pt-2">
                <button
                  onClick={() => rejectRide(currentRide.id)}
                  className="py-3 px-4 bg-slate-800 hover:bg-rose-950/60 hover:text-rose-400 border border-slate-700 rounded-xl text-xs font-bold text-slate-300 transition-all flex items-center justify-center gap-2"
                >
                  <X className="w-4 h-4" />
                  <span>Decline</span>
                </button>
                <button
                  onClick={() => acceptRide(currentRide.id)}
                  className="py-3 px-4 bg-gradient-to-r from-emerald-500 to-teal-400 hover:from-emerald-400 hover:to-teal-300 text-slate-950 font-black rounded-xl shadow-lg shadow-emerald-500/30 transition-all flex items-center justify-center gap-2"
                >
                  <Check className="w-4 h-4" />
                  <span>Accept Ride</span>
                </button>
              </div>
            </div>
          )}

          {currentRide && currentRide.status === 'accepted' && (
            <div className="bg-slate-900/90 border border-emerald-500/40 rounded-3xl p-6 shadow-2xl space-y-5">
              <div className="flex items-center justify-between">
                <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center gap-1.5">
                  <Navigation className="w-3.5 h-3.5 animate-pulse" /> Navigating to Pickup
                </span>
                <span className="text-xs font-bold text-slate-400">Fare: ₹{currentRide.fare}</span>
              </div>

              <div className="bg-slate-950/70 p-4 rounded-2xl border border-slate-800 space-y-3">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-400 font-medium">Rider: {currentRide.riderName}</span>
                  <a
                    href={`tel:${currentRide.riderPhone}`}
                    className="text-amber-400 font-bold flex items-center gap-1 hover:underline"
                  >
                    <Phone className="w-3.5 h-3.5" /> Call Rider
                  </a>
                </div>
                <div className="text-xs text-slate-300">
                  <span className="font-bold text-emerald-400">Pickup: </span>
                  {currentRide.pickup.name}
                </div>
              </div>

              <form onSubmit={handleVerifyOtpSubmit} className="space-y-3 pt-2">
                <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider">
                  Ask Rider for 4-Digit Trip OTP
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    maxLength={4}
                    value={otpInput}
                    onChange={(e) => setOtpInput(e.target.value)}
                    placeholder="Enter OTP"
                    className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-white font-mono font-bold text-center tracking-widest text-lg focus:outline-none focus:border-emerald-500"
                  />
                  <button
                    type="submit"
                    className="py-2.5 px-5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-extrabold rounded-xl text-xs transition-all shadow-md"
                  >
                    Start Ride
                  </button>
                </div>
                {otpError && <p className="text-xs text-rose-400 font-semibold">{otpError}</p>}
                <p className="text-[11px] text-slate-500">
                  Hint for demo test: Rider's OTP is <span className="font-mono font-bold text-amber-400">{currentRide.otp}</span>
                </p>
              </form>
            </div>
          )}

          {currentRide && currentRide.status === 'in_transit' && (
            <div className="bg-slate-900/90 border border-amber-500/40 rounded-3xl p-6 shadow-2xl space-y-5">
              <div className="flex items-center justify-between">
                <span className="px-3 py-1 rounded-full text-xs font-bold bg-amber-500/20 text-amber-400 border border-amber-500/30 flex items-center gap-1.5">
                  <Play className="w-3.5 h-3.5 fill-current animate-pulse" /> Trip in Progress
                </span>
                <span className="text-xs font-bold text-emerald-400">Total: ₹{currentRide.fare}</span>
              </div>

              <div className="bg-slate-950/70 p-4 rounded-2xl border border-slate-800 text-xs space-y-2">
                <div>
                  <span className="text-slate-400 block font-bold uppercase text-[10px]">Heading To Dropoff</span>
                  <span className="text-slate-200 font-bold text-sm">{currentRide.dropoff.name}</span>
                </div>
                <div className="flex items-center justify-between text-slate-400 pt-2 border-t border-slate-800">
                  <span>Distance: {currentRide.distanceKm} km</span>
                  <span>Est. Time: {currentRide.durationMins} mins</span>
                </div>
              </div>

              <button
                onClick={completeTrip}
                className="w-full py-4 bg-gradient-to-r from-emerald-500 to-teal-400 hover:brightness-110 text-slate-950 font-black rounded-2xl shadow-xl shadow-emerald-500/20 text-sm transition-all flex items-center justify-center gap-2"
              >
                <CheckCheck className="w-5 h-5" />
                <span>Complete Ride & Collect ₹{currentRide.fare}</span>
              </button>
            </div>
          )}

          {currentRide && currentRide.status === 'completed' && (
            <div className="bg-slate-900/90 border border-emerald-500/50 rounded-3xl p-6 shadow-2xl text-center space-y-4">
              <div className="w-14 h-14 rounded-2xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 flex items-center justify-center mx-auto">
                <CheckCheck className="w-8 h-8" />
              </div>
              <div>
                <h3 className="text-xl font-black text-white">Ride Completed!</h3>
                <p className="text-xs text-slate-400 mt-1">₹{currentRide.fare} added to today's earnings</p>
              </div>
            </div>
          )}
        </div>

        <div className="lg:col-span-2 min-h-[450px] lg:min-h-[550px] bg-slate-900/90 border border-slate-800 rounded-3xl p-2 shadow-2xl">
          <LeafletMap
            pickup={currentRide?.pickup}
            dropoff={currentRide?.dropoff}
            driverPos={driverPos}
          />
        </div>
      </div>
    </div>
  );
};
