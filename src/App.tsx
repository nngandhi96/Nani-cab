import React from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { Navbar } from './components/Navbar';
import { AuthModal } from './components/AuthModal';
import { DriverDashboard } from './views/DriverDashboard';
import { RiderDashboard } from './views/RiderDashboard';

const MainContent: React.FC = () => {
  const { activeView } = useApp();

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-amber-500 selection:text-slate-950">
      <Navbar />

      <main className="flex-1">
        {activeView === 'auth' || activeView === 'role_select' ? (
          <AuthModal />
        ) : activeView === 'driver' ? (
          <DriverDashboard />
        ) : (
          <RiderDashboard />
        )}
      </main>
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
