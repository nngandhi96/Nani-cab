import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { Car, Phone, LogOut, ShieldCheck, Activity, Zap, Clock, Compass } from 'lucide-react';

export const Navbar: React.FC = () => {
  const { phone, role, activeView, switchView, logout, driverStats, notification } = useApp();
  const [timeString, setTimeString] = useState('');

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setTimeString(
        now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })
      );
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <header className="sticky top-0 z-50 bg-[#070a12]/85 backdrop-blur-xl border-b border-slate-800/80 px-4 lg:px-8 py-3 transition-all">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
        {/* Brand Logo & Live City Indicator */}
        <div
          className="flex items-center gap-3 cursor-pointer group"
          onClick={() => switchView(role === 'driver' ? 'driver' : 'rider')}
        >
          <div className="relative">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-amber-500 via-amber-400 to-yellow-300 flex items-center justify-center shadow-lg shadow-amber-500/25 font-black text-slate-950 text-xl tracking-tighter group-hover:scale-105 transition-transform">
              NC
            </div>
            <span className="absolute -bottom-1 -right-1 w-3.5 h-3.5 bg-emerald-500 border-2 border-slate-950 rounded-full animate-pulse" />
          </div>

          <div>
            <div className="flex items-center gap-2">
              <span className="font-black text-xl text-white tracking-tight group-hover:text-amber-400 transition-colors">
                Nani Cab
              </span>
              <span className="text-[10px] font-extrabold uppercase tracking-widest px-2 py-0.5 rounded-full bg-gradient-to-r from-amber-500/20 to-yellow-500/20 text-amber-300 border border-amber-500/30 flex items-center gap-1">
                <Compass className="w-3 h-3 text-amber-400" /> Bengaluru
              </span>
            </div>
            <p className="text-[11px] text-slate-400 font-medium">Urban Mobility Platform</p>
          </div>
        </div>

        {/* Live Surge & Time Badge */}
        <div className="hidden lg:flex items-center gap-4">
          <div className="bg-slate-900/80 border border-slate-800 px-3.5 py-1.5 rounded-xl flex items-center gap-2 text-xs font-semibold text-slate-300">
            <Zap className="w-3.5 h-3.5 text-amber-400 fill-amber-400 animate-bounce" />
            <span>Demand Surge: <strong className="text-amber-400">1.2x Peak</strong></span>
          </div>

          <div className="bg-slate-900/80 border border-slate-800 px-3 py-1.5 rounded-xl flex items-center gap-2 text-xs font-mono text-slate-400">
            <Clock className="w-3.5 h-3.5 text-slate-500" />
            <span>{timeString || '12:00 PM'}</span>
          </div>
        </div>

        {/* Role Switcher & User Status */}
        {phone && (
          <div className="flex items-center gap-3">
            {/* Real-time Role Switcher Buttons */}
            <div className="bg-slate-950 p-1 rounded-2xl border border-slate-800 flex items-center gap-1 shadow-inner">
              <button
                onClick={() => switchView('rider')}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-extrabold transition-all ${
                  activeView === 'rider'
                    ? 'bg-gradient-to-r from-amber-500 to-yellow-400 text-slate-950 shadow-lg shadow-amber-500/20'
                    : 'text-slate-400 hover:text-white hover:bg-slate-900'
                }`}
              >
                <Car className="w-4 h-4" />
                <span>Rider Mode</span>
              </button>

              <button
                onClick={() => switchView('driver')}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-extrabold transition-all ${
                  activeView === 'driver'
                    ? 'bg-gradient-to-r from-emerald-500 to-teal-400 text-slate-950 shadow-lg shadow-emerald-500/20'
                    : 'text-slate-400 hover:text-white hover:bg-slate-900'
                }`}
              >
                <ShieldCheck className="w-4 h-4" />
                <span>Driver Mode</span>
                {driverStats.isOnline && (
                  <span className="w-2 h-2 rounded-full bg-emerald-950 animate-pulse border border-emerald-400" />
                )}
              </button>
            </div>

            {/* Profile Phone Badge */}
            <div className="hidden sm:flex items-center gap-2 px-3 py-2 rounded-xl bg-slate-900/90 border border-slate-800 text-xs text-slate-300 font-mono">
              <div className="w-5 h-5 rounded-lg bg-amber-500/20 text-amber-400 flex items-center justify-center shrink-0 font-sans">
                <Phone className="w-3 h-3" />
              </div>
              <span>{phone}</span>
            </div>

            {/* Logout button */}
            <button
              onClick={logout}
              title="Logout"
              className="p-2.5 rounded-xl text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 border border-slate-800 hover:border-rose-500/30 transition-all"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>

      {/* Global Real-time Notification Banner */}
      {notification && (
        <div className="mt-2.5 max-w-xl mx-auto bg-slate-900/95 border border-amber-500/50 text-amber-300 px-4 py-2 rounded-2xl text-xs font-semibold flex items-center justify-between shadow-2xl animate-bounce backdrop-blur-md">
          <div className="flex items-center gap-2.5">
            <Activity className="w-4 h-4 text-amber-400 animate-spin" />
            <span>{notification}</span>
          </div>
          <span className="text-[10px] text-slate-400 font-mono">Live Tab Sync</span>
        </div>
      )}
    </header>
  );
};

