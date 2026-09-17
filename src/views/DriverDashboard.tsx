import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import {
  ShieldCheck,
  CheckCircle2,
  Clock,
  AlertCircle,
  Upload,
  Power,
  TrendingUp,
  DollarSign,
  Award,
  Sparkles,
  Check,
  X,
  Phone,
  CornerUpRight,
  CheckCheck,
  FileText,
  Navigation,
  RotateCcw,
} from 'lucide-react';
import { MapWrapper } from '../components/MapWrapper';
import { sounds } from '../utils/audio';
import type { DriverDocumentStatus } from '../types';

type DocKey = 'license' | 'rc' | 'insurance' | 'identity';

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

  const docKeys: DocKey[] = ['license', 'rc', 'insurance', 'identity'];
  const verifiedCount = docKeys.filter((k) => driverDocs[k] === 'verified').length;
  const isFullyCompliant = verifiedCount === 4;

  const handleFileUpload = (docKey: DocKey) => {
    updateDriverDoc(docKey, 'uploaded', {
      docNo:
        docKey === 'license'
          ? 'KA04-20220019283'
          : docKey === 'rc'
          ? 'RC-KA04EV7788-991'
          : docKey === 'insurance'
          ? 'HDFC-ERGO-COMM-88910'
          : 'UIDAI-XXXX-XXXX-4819',
      issuedBy: 'Submitted by Driver',
      lastUpdated: new Date().toISOString().split('T')[0],
      rejectionReason: undefined,
    });
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
              {isFullyCompliant ? (
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5" /> Admin Verified
                </span>
              ) : (
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase bg-amber-500/15 text-amber-400 border border-amber-500/30 flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5" /> Compliance Pending ({verifiedCount}/4)
                </span>
              )}
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
            className={`px-6 py-3.5 rounded-2xl font-black text-xs tracking-wider transition-all flex items-center gap-2.5 shadow-xl cursor-pointer ${
              driverStats.isOnline
                ? 'bg-gradient-to-r from-emerald-500 to-teal-400 text-slate-950 hover:brightness-110 shadow-emerald-500/25'
                : isFullyCompliant
                ? 'bg-slate-800 text-slate-300 hover:bg-emerald-600 hover:text-slate-950 border border-slate-700'
                : 'bg-slate-900 text-slate-500 border border-slate-800 hover:border-amber-500/40'
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
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <FileText className="w-5 h-5 text-amber-400" />
              <span>Mandatory Driver License & Vehicle Credentials</span>
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              {isFullyCompliant
                ? 'All documents are verified by Admin. You are eligible for passenger bookings.'
                : 'Admin verification is mandatory. Upload required documents to get fleet clearance.'}
            </p>
          </div>
          <div className="text-left sm:text-right">
            <span className="text-xs font-bold text-slate-300 font-mono">
              Admin Verified: {verifiedCount} / {docKeys.length}
            </span>
            <div className="w-36 bg-slate-900 h-2 rounded-full overflow-hidden mt-1 border border-slate-800">
              <div
                className={`h-full transition-all duration-500 ${
                  isFullyCompliant ? 'bg-emerald-500' : 'bg-amber-500'
                }`}
                style={{ width: `${(verifiedCount / docKeys.length) * 100}%` }}
              />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { key: 'license' as const, label: 'Driving License', desc: 'Commercial Transport DL' },
            { key: 'rc' as const, label: 'Vehicle RC', desc: 'Registration Certificate' },
            { key: 'insurance' as const, label: 'Vehicle Insurance', desc: 'Commercial Policy' },
            { key: 'identity' as const, label: 'Government ID', desc: 'Aadhaar / Police Verification' },
          ].map((doc) => {
            const status: DriverDocumentStatus = driverDocs[doc.key] || 'pending';
            const detail = driverDocs.details?.[doc.key];

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
                      <span className="px-2 py-0.5 rounded-full text-[9px] font-extrabold uppercase bg-amber-500/10 text-amber-400 border border-amber-500/30 flex items-center gap-1 animate-pulse">
                        <Clock className="w-3 h-3" /> Reviewing
                      </span>
                    )}
                    {status === 'rejected' && (
                      <span className="px-2 py-0.5 rounded-full text-[9px] font-extrabold uppercase bg-rose-500/10 text-rose-400 border border-rose-500/30 flex items-center gap-1">
                        <X className="w-3 h-3" /> Rejected
                      </span>
                    )}
                    {status === 'pending' && (
                      <span className="px-2 py-0.5 rounded-full text-[9px] font-extrabold uppercase bg-slate-800 text-slate-400 border border-slate-700 flex items-center gap-1">
                        <AlertCircle className="w-3 h-3" /> Required
                      </span>
                    )}
                  </div>
                  <p className="text-[11px] text-slate-400">{doc.desc}</p>

                  {status === 'rejected' && detail?.rejectionReason && (
                    <div className="mt-2 p-2 bg-rose-950/50 border border-rose-800/50 rounded-xl text-[10px] text-rose-300">
                      <strong className="block text-rose-400">Admin Note:</strong>
                      {detail.rejectionReason}
                    </div>
                  )}
                </div>

                <div className="pt-2 border-t border-slate-800">
                  {status === 'verified' ? (
                    <div className="text-[11px] font-bold text-emerald-400 flex items-center justify-center gap-1 py-1">
                      <ShieldCheck className="w-3.5 h-3.5" /> Approved by Admin
                    </div>
                  ) : status === 'uploaded' ? (
                    <div className="text-[11px] font-medium text-amber-400/90 flex items-center justify-center gap-1 py-1">
                      <Clock className="w-3.5 h-3.5 animate-spin" /> Awaiting Admin Approval
                    </div>
                  ) : (
                    <button
                      onClick={() => handleFileUpload(doc.key)}
                      className="w-full py-2 px-3 bg-slate-900 hover:bg-slate-800 text-slate-200 text-xs font-bold rounded-xl border border-slate-800 hover:border-amber-500/40 transition-all flex items-center justify-center gap-2 cursor-pointer"
                    >
                      {status === 'rejected' ? (
                        <>
                          <RotateCcw className="w-3.5 h-3.5 text-amber-400" />
                          <span>Re-upload Certificate</span>
                        </>
                      ) : (
                        <>
                          <Upload className="w-3.5 h-3.5 text-amber-400" />
                          <span>Upload Certificate</span>
                        </>
                      )}
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
              <h3 className="text-base font-bold text-slate-300">You are currently Offline</h3>
              <p className="text-xs text-slate-500">
                {!isFullyCompliant
                  ? 'Admin document verification is required before turning on duty.'
                  : 'Toggle "GO ONLINE" button above to start receiving ride requests in Bengaluru.'}
              </p>
            </div>
          )}

          {/* Incoming Ride Request Popup Card */}
          {currentRide && currentRide.status === 'requested' && (
            <div className="glass-panel-dark border-2 border-amber-500/80 rounded-3xl p-6 shadow-2xl space-y-5 animate-pulse relative overflow-hidden">
              <div className="absolute top-0 right-0 bg-amber-500 text-slate-950 font-black text-[10px] px-3 py-1 rounded-bl-2xl">
                {requestTimer}s Auto-Expire
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full bg-amber-400 animate-ping" />
                  <h3 className="text-lg font-black text-white">New Booking Request!</h3>
                </div>
                <span className="text-2xl font-black text-amber-400 font-mono">₹{currentRide.fare}</span>
              </div>

              <div className="bg-slate-950/80 p-4 rounded-2xl border border-slate-800 space-y-3 text-xs">
                <div>
                  <span className="text-slate-400 block text-[10px] uppercase font-bold">Pickup</span>
                  <p className="font-semibold text-white mt-0.5">{currentRide.pickup.name}</p>
                </div>
                <div className="border-t border-slate-850 pt-2">
                  <span className="text-slate-400 block text-[10px] uppercase font-bold">Dropoff</span>
                  <p className="font-semibold text-amber-300 mt-0.5">{currentRide.dropoff.name}</p>
                </div>
                <div className="flex justify-between items-center pt-2 border-t border-slate-800 text-slate-400">
                  <span>Distance: <strong className="text-white font-mono">{currentRide.distanceKm} km</strong></span>
                  <span>Est Time: <strong className="text-white font-mono">{currentRide.durationMins} mins</strong></span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() => rejectRide(currentRide.id)}
                  className="py-3 px-4 bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 font-bold rounded-2xl text-xs transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  <X className="w-4 h-4" />
                  <span>Decline</span>
                </button>
                <button
                  onClick={handleAcceptRide}
                  className="py-3 px-4 bg-gradient-to-r from-emerald-500 to-teal-400 hover:brightness-110 text-slate-950 font-black rounded-2xl text-xs transition-all shadow-xl shadow-emerald-500/25 flex items-center justify-center gap-2 cursor-pointer"
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
                    className="py-3 px-5 bg-gradient-to-r from-emerald-500 to-teal-400 text-slate-950 font-black rounded-2xl text-xs transition-all shadow-lg cursor-pointer"
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
                className="w-full py-4 bg-gradient-to-r from-emerald-500 to-teal-400 hover:brightness-110 text-slate-950 font-black rounded-2xl shadow-xl shadow-emerald-500/25 text-sm transition-all flex items-center justify-center gap-2 cursor-pointer"
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
