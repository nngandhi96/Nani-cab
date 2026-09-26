import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { Car, LogOut, ShieldCheck, Activity, Zap, Clock, Compass, FileText, Sun, Moon } from 'lucide-react';



export const Navbar: React.FC = () => {
  const {
    phone,
    role,
    activeView,
    switchView,
    logout,
    driverStats,
    notification,
    openLegalModal,
    theme,
    toggleTheme,
    userProfile,
    setProfileModalOpen,
  } = useApp();
  const [timeString, setTimeString] = useState('');



  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setTimeString(
        now.toLocaleTimeString('en-US', {
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
          hour12: true,
        })
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
            <img
              src="/logo.png"
              alt="Nani Cab Logo"
              className="w-10 h-10 rounded-2xl object-cover shadow-lg shadow-amber-500/25 group-hover:scale-105 transition-transform border border-amber-500/30"
            />
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
            <p className="text-[11px] text-slate-400 font-medium">A unit of MAKE MY VASH (MMV)</p>
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

        {/* Right Side Action Cluster */}
        <div className="flex items-center gap-2.5">
          {phone && (
            <>
              {/* Real-time Role Switcher Buttons */}
              <div className="bg-slate-950 p-1 rounded-2xl border border-slate-800 flex items-center gap-1 shadow-inner">
                <button
                  onClick={() => switchView('rider')}
                  className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-extrabold transition-all cursor-pointer ${
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
                  className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-extrabold transition-all cursor-pointer ${
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

              {/* User Profile Button */}
              <button
                onClick={() => setProfileModalOpen(true)}
                title="View & Edit Profile (प्रोफ़ाइल देखें)"
                className="flex items-center gap-2 px-3 py-1.5 rounded-2xl bg-slate-900/90 hover:bg-slate-800/90 border border-slate-800 hover:border-amber-500/40 text-xs text-slate-200 transition-all shadow-sm group cursor-pointer"
              >
                <div className="relative">
                  <div className="w-7 h-7 rounded-full bg-gradient-to-tr from-amber-500 via-yellow-400 to-emerald-400 p-0.5 shadow-sm">
                    <div className="w-full h-full bg-slate-950 rounded-full flex items-center justify-center font-black text-[10px] text-amber-400 font-mono">
                      {(role === 'driver' ? 'VS' : (userProfile.name ? userProfile.name.split(' ').map(n => n[0]).join('').slice(0, 2) : 'RS')).toUpperCase()}
                    </div>
                  </div>
                  <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-emerald-500 border border-slate-950 rounded-full" />
                </div>

                <div className="text-left hidden sm:block">
                  <div className="flex items-center gap-1.5">
                    <span className="font-extrabold text-xs text-slate-200 group-hover:text-amber-400 transition-colors">
                      {role === 'driver' ? 'Vikram Singh' : userProfile.name}
                    </span>
                    <span className="text-[10px] font-black text-amber-400 flex items-center gap-0.5">
                      ★ {role === 'driver' ? driverStats.rating : userProfile.rating}
                    </span>
                  </div>
                  <span className="text-[10px] text-slate-400 font-mono block -mt-0.5">
                    {phone || userProfile.phone}
                  </span>
                </div>
              </button>


              {/* Terms & Privacy button */}
              <button
                onClick={() => openLegalModal('terms')}
                title="Terms & Privacy Policy"
                className="hidden md:flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs text-slate-400 hover:text-amber-400 hover:bg-slate-900 border border-slate-800 hover:border-amber-500/30 transition-all font-semibold cursor-pointer"
              >
                <FileText className="w-3.5 h-3.5" />
                <span>Legal</span>
              </button>
            </>
          )}

          {/* Theme Switcher Button (Dark 🌙 / Light ☀️) */}
          <button
            onClick={toggleTheme}
            title={theme === 'dark' ? 'Switch to Light Mode (सफेद थीम)' : 'Switch to Dark Mode (डार्क थीम)'}
            aria-label="Toggle Theme"
            className="flex items-center gap-2 px-3 py-2 rounded-xl bg-slate-900/90 border border-slate-800 hover:border-amber-500/40 text-slate-300 hover:text-amber-400 transition-all shadow-md group cursor-pointer"
          >
            {theme === 'dark' ? (
              <>
                <Sun className="w-4 h-4 text-amber-400 group-hover:rotate-90 transition-transform duration-300" />
                <span className="hidden sm:inline text-xs font-bold text-slate-300 group-hover:text-amber-300">Light</span>
              </>
            ) : (
              <>
                <Moon className="w-4 h-4 text-indigo-500 group-hover:-rotate-12 transition-transform duration-300" />
                <span className="hidden sm:inline text-xs font-bold text-slate-700 group-hover:text-indigo-600">Dark</span>
              </>
            )}
          </button>

          {phone && (
            <button
              onClick={logout}
              title="Logout"
              className="p-2.5 rounded-xl text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 border border-slate-800 hover:border-rose-500/30 transition-all cursor-pointer"
            >
              <LogOut className="w-4 h-4" />
            </button>
          )}
        </div>

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

