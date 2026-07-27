import React from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { Navbar } from './components/Navbar';
import { AuthModal } from './components/AuthModal';
import { MobileBottomNav } from './components/MobileBottomNav';
import { LegalModal } from './components/LegalModal';
import { DriverDashboard } from './views/DriverDashboard';
import { RiderDashboard } from './views/RiderDashboard';
import { MadhubaniBackground } from './components/MadhubaniBackground';

const MainContent: React.FC = () => {
  const { activeView, openLegalModal } = useApp();

  return (
    <div className="min-h-screen bg-[#070a12] text-slate-100 flex flex-col font-sans selection:bg-amber-400 selection:text-slate-950 pb-16 sm:pb-0 relative overflow-x-hidden">
      {/* Traditional Madhubani Painting Watermark Background (14% opacity) */}
      <MadhubaniBackground opacity={0.14} />

      <Navbar />

      <main className="flex-1 relative z-10">
        {activeView === 'auth' || activeView === 'role_select' ? (
          <AuthModal />
        ) : activeView === 'driver' ? (
          <DriverDashboard />
        ) : (
          <RiderDashboard />
        )}
      </main>

      <LegalModal />

      {/* Global Footer */}
      <footer className="border-t border-slate-800/80 bg-slate-950/80 py-4 px-6 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
          <p>© {new Date().getFullYear()} Nani Cab — A proprietary product of MAKE MY VASH (MMV). All rights reserved.</p>
          <div className="flex items-center gap-4">
            <button 
              onClick={() => openLegalModal('terms')}
              className="hover:text-amber-400 transition-colors font-medium cursor-pointer"
            >
              Terms of Service (सेवा की शर्तें)
            </button>
            <span>•</span>
            <button 
              onClick={() => openLegalModal('privacy')}
              className="hover:text-emerald-400 transition-colors font-medium cursor-pointer"
            >
              Privacy Policy (गोपनीयता नीति)
            </button>
          </div>
        </div>
      </footer>

      <MobileBottomNav />
    </div>
  );
};


export function App() {
  return (
    <AppProvider>
      <MainContent />
    </AppProvider>
  );
}

export default App;
