import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Shield, Car, CheckCircle2, Lock, ArrowRight, Sparkles } from 'lucide-react';
import type { UserRole } from '../types';

export const AuthModal: React.FC = () => {
  const { activeView, login, selectRole } = useApp();
  
  const [phoneInput, setPhoneInput] = useState('');
  const [otpInput, setOtpInput] = useState('');
  const [step, setStep] = useState<'phone' | 'otp'>('phone');
  const [error, setError] = useState('');

  const handleSendOtp = (e: React.FormEvent) => {
    e.preventDefault();
    if (!phoneInput || phoneInput.length < 10) {
      setError('Please enter a valid 10-digit mobile number');
      return;
    }
    setError('');
    setStep('otp');
    setOtpInput('1234');
  };

  const handleVerifyOtp = (e: React.FormEvent) => {
    e.preventDefault();
    if (otpInput !== '1234' && otpInput.length !== 4) {
      setError('Invalid OTP. Use mock code 1234');
      return;
    }
    setError('');
    login(phoneInput.startsWith('+91') ? phoneInput : `+91 ${phoneInput}`);
  };

  const handleQuickDemo = (roleChoice: UserRole) => {
    const demoPhone = roleChoice === 'driver' ? '+91 98765 11111' : '+91 98765 22222';
    login(demoPhone);
    selectRole(roleChoice);
  };

  if (activeView !== 'auth' && activeView !== 'role_select') return null;

  return (
    <div className="min-h-[calc(100vh-70px)] flex items-center justify-center p-4 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-slate-900 via-slate-950 to-black">
      <div className="w-full max-w-md bg-slate-900/90 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl backdrop-blur-xl relative overflow-hidden">
        <div className="absolute -top-24 -right-24 w-48 h-48 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -left-24 w-48 h-48 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

        {activeView === 'auth' ? (
          <div>
            <div className="text-center mb-8">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-tr from-amber-500 to-yellow-400 text-slate-950 font-black text-3xl shadow-xl shadow-amber-500/20 mb-4">
                NC
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">Welcome to Nani Cab</h1>
              <p className="text-slate-400 text-sm mt-1">Book rides or earn as a driver instantly</p>
            </div>

            {step === 'phone' ? (
              <form onSubmit={handleSendOtp} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                    Mobile Number
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400 font-medium text-sm">
                      +91
                    </div>
                    <input
                      type="tel"
                      value={phoneInput}
                      onChange={(e) => setPhoneInput(e.target.value.replace(/\D/g, '').slice(0, 10))}
                      placeholder="98765 43210"
                      className="w-full pl-14 pr-4 py-3.5 bg-slate-950/80 border border-slate-800 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition-all font-mono"
                      autoFocus
                    />
                  </div>
                </div>

                {error && <p className="text-xs text-rose-400 font-medium">{error}</p>}

                <button
                  type="submit"
                  className="w-full py-3.5 px-4 bg-gradient-to-r from-amber-500 to-yellow-400 hover:from-amber-400 hover:to-yellow-300 text-slate-950 font-bold rounded-xl shadow-lg shadow-amber-500/20 transition-all flex items-center justify-center gap-2"
                >
                  <span>Send Verification Code</span>
                  <ArrowRight className="w-4 h-4" />
                </button>

                <div className="relative my-6">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-slate-800" />
                  </div>
                  <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-slate-900 px-3 text-slate-500 font-medium">Quick Demo Entry</span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => handleQuickDemo('rider')}
                    className="py-2.5 px-3 bg-slate-800/60 hover:bg-slate-800 border border-slate-700/60 rounded-xl text-xs font-semibold text-slate-200 transition-all flex items-center justify-center gap-2"
                  >
                    <Car className="w-3.5 h-3.5 text-amber-400" />
                    <span>Demo Rider</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => handleQuickDemo('driver')}
                    className="py-2.5 px-3 bg-slate-800/60 hover:bg-slate-800 border border-slate-700/60 rounded-xl text-xs font-semibold text-slate-200 transition-all flex items-center justify-center gap-2"
                  >
                    <Shield className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Demo Driver</span>
                  </button>
                </div>
              </form>
            ) : (
              <form onSubmit={handleVerifyOtp} className="space-y-4">
                <div className="text-center bg-slate-950/60 p-3 rounded-xl border border-slate-800/80 mb-2">
                  <p className="text-xs text-slate-400">Mock OTP sent to</p>
                  <p className="text-sm font-mono font-bold text-amber-400 mt-0.5">{phoneInput}</p>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                    Enter 4-Digit Mock OTP
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3.5 top-3.5 w-4 h-4 text-slate-500" />
                    <input
                      type="text"
                      maxLength={4}
                      value={otpInput}
                      onChange={(e) => setOtpInput(e.target.value)}
                      placeholder="1234"
                      className="w-full pl-10 pr-4 py-3.5 bg-slate-950/80 border border-slate-800 rounded-xl text-white text-center font-mono font-bold text-xl tracking-widest focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition-all"
                    />
                  </div>
                  <p className="text-[11px] text-slate-500 mt-1.5 text-center">Auto-filled mock OTP code: <span className="font-mono text-amber-400">1234</span></p>
                </div>

                {error && <p className="text-xs text-rose-400 font-medium text-center">{error}</p>}

                <button
                  type="submit"
                  className="w-full py-3.5 px-4 bg-gradient-to-r from-amber-500 to-yellow-400 text-slate-950 font-bold rounded-xl shadow-lg shadow-amber-500/20 transition-all flex items-center justify-center gap-2"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Verify & Continue</span>
                </button>

                <button
                  type="button"
                  onClick={() => setStep('phone')}
                  className="w-full text-xs text-slate-400 hover:text-white transition-all text-center pt-2"
                >
                  Change Mobile Number
                </button>
              </form>
            )}
          </div>
        ) : (
          <div className="py-2">
            <div className="text-center mb-6">
              <span className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-widest text-amber-400 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 mb-3">
                <Sparkles className="w-3.5 h-3.5" /> Step 2 of 2
              </span>
              <h2 className="text-2xl font-extrabold text-white tracking-tight">Select Your Role</h2>
              <p className="text-slate-400 text-xs mt-1">How would you like to use Nani Cab today?</p>
            </div>

            <div className="space-y-4">
              <button
                onClick={() => selectRole('driver')}
                className="w-full group p-5 bg-gradient-to-br from-slate-950 to-slate-900 hover:from-emerald-950/40 hover:to-slate-900 border border-slate-800 hover:border-emerald-500/50 rounded-2xl text-left transition-all shadow-lg hover:shadow-emerald-500/10 flex items-start gap-4 relative"
              >
                <div className="w-12 h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/20 group-hover:bg-emerald-500/20 flex items-center justify-center text-emerald-400 shrink-0 transition-all">
                  <Shield className="w-6 h-6" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-white text-base group-hover:text-emerald-400 transition-colors">
                      Option 1: I want to Drive
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                    Upload driver documents, accept ride requests from nearby riders, and earn money on every trip.
                  </p>
                  <div className="mt-3 flex items-center gap-2 text-[11px] font-semibold text-emerald-400">
                    <span>Driver Dashboard</span>
                    <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                  </div>
                </div>
              </button>

              <button
                onClick={() => selectRole('rider')}
                className="w-full group p-5 bg-gradient-to-br from-slate-950 to-slate-900 hover:from-amber-950/40 hover:to-slate-900 border border-slate-800 hover:border-amber-500/50 rounded-2xl text-left transition-all shadow-lg hover:shadow-amber-500/10 flex items-start gap-4 relative"
              >
                <div className="w-12 h-12 rounded-xl bg-amber-500/10 border border-amber-500/20 group-hover:bg-amber-500/20 flex items-center justify-center text-amber-400 shrink-0 transition-all">
                  <Car className="w-6 h-6" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-white text-base group-hover:text-amber-400 transition-colors">
                      Option 2: I want to Ride
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                    Set pickup & dropoff on interactive map, get instant fare estimation, and track your cab live.
                  </p>
                  <div className="mt-3 flex items-center gap-2 text-[11px] font-semibold text-amber-400">
                    <span>Customer Dashboard</span>
                    <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                  </div>
                </div>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
