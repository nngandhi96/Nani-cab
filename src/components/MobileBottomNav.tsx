import React from 'react';
import { useApp } from '../context/AppContext';
import { Car, ShieldCheck, LogOut, FileText } from 'lucide-react';


export const MobileBottomNav: React.FC = () => {
  const { phone, activeView, switchView, logout, driverStats, openLegalModal } = useApp();

  if (!phone) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 bg-[#070a12]/95 backdrop-blur-xl border-t border-slate-800 px-4 py-2 flex items-center justify-around sm:hidden">
      <button
        onClick={() => switchView('rider')}
        className={`flex flex-col items-center gap-1 px-4 py-1.5 rounded-xl transition-all ${
          activeView === 'rider'
            ? 'text-amber-400 font-black'
            : 'text-slate-500 hover:text-slate-300'
        }`}
      >
        <Car className="w-5 h-5" />
        <span className="text-[10px] font-bold">Rider</span>
      </button>

      <button
        onClick={() => switchView('driver')}
        className={`flex flex-col items-center gap-1 px-4 py-1.5 rounded-xl transition-all relative ${
          activeView === 'driver'
            ? 'text-emerald-400 font-black'
            : 'text-slate-500 hover:text-slate-300'
        }`}
      >
        <div className="relative">
          <ShieldCheck className="w-5 h-5" />
          {driverStats.isOnline && (
            <span className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full bg-emerald-400 animate-pulse border border-slate-950" />
          )}
        </div>
        <span className="text-[10px] font-bold">Driver</span>
      </button>

      <button
        onClick={() => openLegalModal('terms')}
        className="flex flex-col items-center gap-1 px-4 py-1.5 rounded-xl text-slate-500 hover:text-amber-400 transition-all"
      >
        <FileText className="w-5 h-5" />
        <span className="text-[10px] font-bold">Legal</span>
      </button>

      <button
        onClick={logout}
        className="flex flex-col items-center gap-1 px-4 py-1.5 rounded-xl text-slate-500 hover:text-rose-400 transition-all"
      >
        <LogOut className="w-5 h-5" />
        <span className="text-[10px] font-bold">Logout</span>
      </button>
    </div>
  );
};

