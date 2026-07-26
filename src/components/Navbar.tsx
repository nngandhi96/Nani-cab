import React from 'react';
import { useApp } from '../context/AppContext';
import { Car, Phone, LogOut, ShieldCheck, Activity } from 'lucide-react';

export const Navbar: React.FC = () => {
  const { phone, role, activeView, switchView, logout, driverStats, notification } = useApp();

  return (
    <header className="sticky top-0 z-50 bg-slate-900/90 backdrop-blur-md border-b border-slate-800 px-4 lg:px-8 py-3 transition-all">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
        {/* Brand Logo */}
        <div className="flex items-center gap-3 cursor-pointer" onClick={() => switchView(role === 'driver' ? 'driver' : 'rider')}>
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-amber-500 to-yellow-300 flex items-center justify-center shadow-lg shadow-amber-500/20 font-black text-slate-950 text-xl tracking-wider">
            NC
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-xl text-white tracking-tight">Nani Cab</span>
              <span className="text-[10px] uppercase font-bold tracking-widest px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/30">
                Unified
              </span>
            </div>
            <p className="text-xs text-slate-400 font-medium">Urban Mobility Ecosystem</p>
          </div>
        </div>

        {/* Role Switcher & User Status */}
        {phone && (
          <div className="flex items-center gap-3">
            {/* Real-time Role Switcher Buttons */}
            <div className="bg-slate-950/80 p-1 rounded-xl border border-slate-800 flex items-center gap-1 shadow-inner">
              <button
                onClick={() => switchView('rider')}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  activeView === 'rider'
                    ? 'bg-gradient-to-r from-amber-500 to-yellow-400 text-slate-950 shadow-md font-bold'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
                }`}
              >
                <Car className="w-3.5 h-3.5" />
                <span>Rider Mode</span>
              </button>

              <button
                onClick={() => switchView('driver')}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  activeView === 'driver'
                    ? 'bg-gradient-to-r from-emerald-500 to-teal-400 text-slate-950 shadow-md font-bold'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
                }`}
              >
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>Driver Mode</span>
                {driverStats.isOnline && (
                  <span className="w-2 h-2 rounded-full bg-emerald-950 animate-pulse border border-emerald-400" />
                )}
              </button>
            </div>

            {/* Profile Info Badge */}
            <div className="hidden md:flex items-center gap-2.5 px-3 py-1.5 rounded-xl bg-slate-800/50 border border-slate-700/60 text-xs text-slate-300">
              <div className="w-6 h-6 rounded-full bg-slate-700 flex items-center justify-center text-slate-300">
                <Phone className="w-3 h-3" />
              </div>
              <span className="font-mono font-medium">{phone}</span>
            </div>

            {/* Logout button */}
            <button
              onClick={logout}
              title="Logout"
              className="p-2 rounded-xl text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 border border-transparent hover:border-rose-500/20 transition-all"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>

      {/* Global Real-time Notification Banner */}
      {notification && (
        <div className="mt-2 max-w-xl mx-auto bg-slate-800/95 border border-amber-500/40 text-amber-300 px-4 py-2 rounded-xl text-xs font-medium flex items-center justify-between shadow-2xl animate-bounce">
          <div className="flex items-center gap-2">
            <Activity className="w-4 h-4 text-amber-400 animate-spin" />
            <span>{notification}</span>
          </div>
          <span className="text-[10px] text-slate-400">Synced across tabs</span>
        </div>
      )}
    </header>
  );
};
