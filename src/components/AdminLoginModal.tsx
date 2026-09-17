import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { ShieldCheck, Lock, Mail, ArrowRight, X, KeyRound, AlertTriangle } from 'lucide-react';
import { MadhubaniBackground } from './MadhubaniBackground';

export const AdminLoginModal: React.FC = () => {
  const { showAdminLogin, setShowAdminLogin, adminLogin } = useApp();

  const [adminId, setAdminId] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  if (!showAdminLogin) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!adminId || !password) {
      setError('Please enter Admin ID and Security Passcode');
      return;
    }

    setLoading(true);
    setError('');

    setTimeout(() => {
      const success = adminLogin(adminId, password);
      setLoading(false);
      if (!success) {
        setError('Invalid Admin Credentials. Check credentials or use quick-fill below.');
      } else {
        setAdminId('');
        setPassword('');
      }
    }, 400);
  };

  const handleQuickDemoAdmin = () => {
    setAdminId('admin@nanicab.com');
    setPassword('NaniAdmin@2026');
    setError('');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-xl animate-fade-in">
      <div className="w-full max-w-md bg-slate-950 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl relative overflow-hidden">
        {/* Subtle Watermark */}
        <MadhubaniBackground opacity={0.08} variant="login" />

        {/* Ambient Glows */}
        <div className="absolute -top-20 -right-20 w-48 h-48 bg-purple-500/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-20 -left-20 w-48 h-48 bg-amber-500/15 rounded-full blur-3xl pointer-events-none" />

        {/* Close Button */}
        <button
          onClick={() => {
            setShowAdminLogin(false);
            setError('');
          }}
          className="absolute top-5 right-5 p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-900 border border-transparent hover:border-slate-800 transition-all cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="relative z-10">
          <div className="text-center mb-6">
            <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-tr from-purple-600 via-indigo-500 to-amber-400 text-white font-black text-2xl shadow-xl shadow-purple-500/20 mb-3">
              <ShieldCheck className="w-7 h-7" />
            </div>
            <div className="flex items-center justify-center gap-1.5 mb-1">
              <span className="text-[10px] font-extrabold uppercase tracking-widest px-2.5 py-0.5 rounded-full bg-purple-500/10 text-purple-400 border border-purple-500/30">
                Restricted Master Console
              </span>
            </div>
            <h2 className="text-2xl font-black text-white tracking-tight">Admin Gateway</h2>
            <p className="text-slate-400 text-xs mt-1">
              Authorized personnel only. Driver certificate verification & system administration.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2 flex items-center justify-between">
                <span>Admin Identifier / Email</span>
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                  <Mail className="w-4 h-4" />
                </div>
                <input
                  type="text"
                  value={adminId}
                  onChange={(e) => setAdminId(e.target.value)}
                  placeholder="admin@nanicab.com"
                  className="w-full pl-10 pr-4 py-3 bg-slate-900/90 border border-slate-800 rounded-2xl text-white placeholder-slate-600 focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 transition-all text-sm font-mono"
                  autoFocus
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2 flex items-center justify-between">
                <span>Master Security Key / Password</span>
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full pl-10 pr-4 py-3 bg-slate-900/90 border border-slate-800 rounded-2xl text-white placeholder-slate-600 focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 transition-all text-sm font-mono"
                />
              </div>
            </div>

            {error && (
              <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 flex items-center gap-2 text-xs text-rose-300">
                <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 px-4 bg-gradient-to-r from-purple-600 via-indigo-600 to-amber-500 hover:brightness-110 text-white font-black text-sm rounded-2xl shadow-xl shadow-purple-600/25 transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              {loading ? (
                <span>Authenticating Admin...</span>
              ) : (
                <>
                  <KeyRound className="w-4 h-4" />
                  <span>Access Verification Console</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>

            {/* Quick Demo Fill */}
            <div className="pt-3 border-t border-slate-800/80">
              <button
                type="button"
                onClick={handleQuickDemoAdmin}
                className="w-full py-2.5 px-3 bg-slate-900/90 hover:bg-slate-800 border border-slate-800 hover:border-purple-500/40 rounded-xl text-xs font-bold text-slate-300 transition-all flex items-center justify-center gap-2"
              >
                <span>🔑 Auto-Fill Admin Demo Credentials</span>
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
