import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import {
  User,
  Phone,
  MapPin,
  Star,
  ShieldCheck,
  Calendar,
  X,
  Edit2,
  Check,
  CreditCard,
  Car,
  Award,
  Sparkles,
  LogOut,
} from 'lucide-react';
import { MadhubaniBackground } from './MadhubaniBackground';

export const UserProfileModal: React.FC = () => {
  const {
    role,
    phone,
    userProfile,
    updateUserProfile,
    profileModalOpen,
    setProfileModalOpen,
    switchView,
    logout,
    driverStats,
  } = useApp();


  const [isEditing, setIsEditing] = useState(false);
  const [nameInput, setNameInput] = useState(userProfile.name);
  const [emailInput, setEmailInput] = useState(userProfile.email);
  const [cityInput, setCityInput] = useState(userProfile.city);
  const [emergencyInput, setEmergencyInput] = useState(userProfile.emergencyContact);
  const [upiInput, setUpiInput] = useState(userProfile.upiId || '');
  const [savedSuccess, setSavedSuccess] = useState(false);

  if (!profileModalOpen) return null;

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    updateUserProfile({
      name: nameInput.trim() || userProfile.name,
      email: emailInput.trim() || userProfile.email,
      city: cityInput.trim() || userProfile.city,
      emergencyContact: emergencyInput.trim() || userProfile.emergencyContact,
      upiId: upiInput.trim() || userProfile.upiId,
    });
    setIsEditing(false);
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  const isDriver = role === 'driver';
  const displayName = isDriver ? 'Vikram Singh' : userProfile.name;
  const displayRating = isDriver ? driverStats.rating : userProfile.rating;
  const displayRides = isDriver ? driverStats.completedRides : userProfile.totalRides;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xl animate-fade-in">
      <div className="w-full max-w-xl bg-slate-950 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl relative overflow-hidden max-h-[92vh] overflow-y-auto">
        {/* Subtle Watermark */}
        <MadhubaniBackground opacity={0.08} variant="login" />

        {/* Ambient Glows */}
        <div className="absolute -top-24 -right-24 w-56 h-56 bg-amber-500/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -left-24 w-56 h-56 bg-emerald-500/15 rounded-full blur-3xl pointer-events-none" />

        {/* Close Button */}
        <button
          onClick={() => {
            setProfileModalOpen(false);
            setIsEditing(false);
          }}
          className="absolute top-5 right-5 p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-900 border border-transparent hover:border-slate-800 transition-all cursor-pointer z-20"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="relative z-10">
          {/* Header Profile Summary */}
          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-5 pb-6 border-b border-slate-800/80">
            {/* Avatar Pill */}
            <div className="relative">
              <div className="w-20 h-20 rounded-3xl bg-gradient-to-tr from-amber-500 via-yellow-400 to-emerald-400 p-0.5 shadow-xl shadow-amber-500/20">
                <div className="w-full h-full bg-slate-950 rounded-[22px] flex items-center justify-center text-2xl font-black text-amber-400 tracking-wider font-mono">
                  {displayName
                    .split(' ')
                    .map((n) => n[0])
                    .join('')
                    .toUpperCase()
                    .slice(0, 2)}
                </div>
              </div>
              <span className="absolute -bottom-1 -right-1 w-5 h-5 bg-emerald-500 border-2 border-slate-950 rounded-full flex items-center justify-center text-slate-950">
                <Check className="w-3 h-3 stroke-[3]" />
              </span>
            </div>

            {/* User Meta */}
            <div className="flex-1 text-center sm:text-left space-y-1.5">
              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
                <h2 className="text-2xl font-black text-white tracking-tight">{displayName}</h2>
                <span className="text-[10px] font-extrabold uppercase px-2.5 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 flex items-center gap-1">
                  <ShieldCheck className="w-3 h-3" /> KYC Verified
                </span>
                <span className="text-[10px] font-extrabold uppercase px-2.5 py-0.5 rounded-full bg-amber-500/15 text-amber-400 border border-amber-500/30">
                  {isDriver ? 'Fleet Partner' : 'Premier Rider'}
                </span>
              </div>

              <p className="text-xs text-slate-400 font-mono flex items-center justify-center sm:justify-start gap-1.5">
                <Phone className="w-3.5 h-3.5 text-slate-500" />
                <span>{phone || userProfile.phone}</span>
                <span className="text-slate-600">•</span>
                <MapPin className="w-3.5 h-3.5 text-slate-500" />
                <span>{userProfile.city}</span>
              </p>

              {/* Quick Actions in Header */}
              <div className="pt-1 flex items-center justify-center sm:justify-start gap-3">
                <button
                  onClick={() => setIsEditing(!isEditing)}
                  className="text-xs font-bold text-amber-400 hover:text-amber-300 flex items-center gap-1.5 px-3 py-1 rounded-lg bg-amber-500/10 border border-amber-500/20 hover:border-amber-500/40 transition-all cursor-pointer"
                >
                  <Edit2 className="w-3 h-3" />
                  <span>{isEditing ? 'Cancel Edit' : 'Edit Profile'}</span>
                </button>

                {savedSuccess && (
                  <span className="text-xs text-emerald-400 font-semibold flex items-center gap-1 animate-fade-in">
                    <Check className="w-3.5 h-3.5" /> Updated successfully!
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* User Scorecard Metric Strip */}
          <div className="grid grid-cols-3 gap-3 my-6">
            <div className="bg-slate-900/70 border border-slate-800/80 rounded-2xl p-3.5 text-center">
              <div className="flex items-center justify-center gap-1 text-amber-400 font-black text-lg">
                <Star className="w-4 h-4 fill-amber-400" />
                <span>{displayRating}</span>
              </div>
              <span className="text-[10px] uppercase tracking-wider font-extrabold text-slate-400">Rating</span>
            </div>

            <div className="bg-slate-900/70 border border-slate-800/80 rounded-2xl p-3.5 text-center">
              <div className="flex items-center justify-center gap-1 text-white font-black text-lg font-mono">
                <span>{displayRides}</span>
              </div>
              <span className="text-[10px] uppercase tracking-wider font-extrabold text-slate-400">Total Rides</span>
            </div>

            <div className="bg-slate-900/70 border border-slate-800/80 rounded-2xl p-3.5 text-center">
              <div className="flex items-center justify-center gap-1 text-emerald-400 font-black text-lg">
                <Award className="w-4 h-4" />
                <span>Tier 1</span>
              </div>
              <span className="text-[10px] uppercase tracking-wider font-extrabold text-slate-400">Member Status</span>
            </div>
          </div>

          {/* Edit Form or Read-only Cards */}
          {isEditing ? (
            <form onSubmit={handleSave} className="space-y-4 mb-6">
              <div>
                <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
                  Full Name
                </label>
                <input
                  type="text"
                  value={nameInput}
                  onChange={(e) => setNameInput(e.target.value)}
                  className="w-full px-4 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-white text-sm focus:outline-none focus:border-amber-400"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
                  Email Address
                </label>
                <input
                  type="email"
                  value={emailInput}
                  onChange={(e) => setEmailInput(e.target.value)}
                  className="w-full px-4 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-white text-sm focus:outline-none focus:border-amber-400"
                  required
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
                    City / Zone
                  </label>
                  <input
                    type="text"
                    value={cityInput}
                    onChange={(e) => setCityInput(e.target.value)}
                    className="w-full px-4 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-white text-sm focus:outline-none focus:border-amber-400"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
                    Emergency SOS Contact
                  </label>
                  <input
                    type="tel"
                    value={emergencyInput}
                    onChange={(e) => setEmergencyInput(e.target.value)}
                    className="w-full px-4 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-white text-sm font-mono focus:outline-none focus:border-amber-400"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
                  Default UPI ID
                </label>
                <input
                  type="text"
                  value={upiInput}
                  onChange={(e) => setUpiInput(e.target.value)}
                  placeholder="username@upi"
                  className="w-full px-4 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-white text-sm font-mono focus:outline-none focus:border-amber-400"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsEditing(false)}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-slate-400 hover:text-white bg-slate-900 border border-slate-800 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl text-xs font-extrabold bg-gradient-to-r from-amber-500 to-yellow-400 text-slate-950 shadow-lg shadow-amber-500/20 hover:brightness-110 transition-all cursor-pointer flex items-center gap-1.5"
                >
                  <Check className="w-4 h-4 stroke-[3]" />
                  <span>Save Profile</span>
                </button>
              </div>
            </form>
          ) : (
            <div className="space-y-3 mb-6">
              {/* Account Details Box */}
              <div className="bg-slate-900/60 border border-slate-800/80 rounded-2xl p-4 space-y-3">
                <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                  <User className="w-3.5 h-3.5 text-amber-400" /> Account & Contact Info
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div>
                    <span className="text-slate-500">Email:</span>
                    <p className="font-semibold text-slate-200 mt-0.5 truncate">{userProfile.email}</p>
                  </div>
                  <div>
                    <span className="text-slate-500">Member Since:</span>
                    <p className="font-semibold text-slate-200 mt-0.5 flex items-center gap-1">
                      <Calendar className="w-3 h-3 text-slate-400" /> {userProfile.memberSince}
                    </p>
                  </div>
                  <div>
                    <span className="text-slate-500">Emergency SOS:</span>
                    <p className="font-semibold text-rose-400 mt-0.5 font-mono">
                      {userProfile.emergencyContact} (Verified)
                    </p>
                  </div>
                  <div>
                    <span className="text-slate-500">Default UPI / Pay:</span>
                    <p className="font-semibold text-emerald-400 mt-0.5 font-mono flex items-center gap-1">
                      <CreditCard className="w-3 h-3" /> {userProfile.upiId || 'UPI Auto-pay Active'}
                    </p>
                  </div>
                </div>
              </div>

              {/* Driver Specific Box */}
              {isDriver && (
                <div className="bg-emerald-950/20 border border-emerald-500/30 rounded-2xl p-4 space-y-2">
                  <h3 className="text-xs font-extrabold uppercase tracking-wider text-emerald-400 flex items-center gap-1.5">
                    <Car className="w-3.5 h-3.5" /> Assigned Commercial Vehicle
                  </h3>
                  <div className="grid grid-cols-2 gap-3 text-xs">
                    <div>
                      <span className="text-slate-400">Model:</span>
                      <p className="font-bold text-white">White Swift Dzire (AC)</p>
                    </div>
                    <div>
                      <span className="text-slate-400">Registration:</span>
                      <p className="font-bold text-amber-300 font-mono">KA-04-EV-7788</p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Bottom Actions */}
          <div className="flex items-center justify-between pt-4 border-t border-slate-800/80">
            <button
              onClick={() => {
                setProfileModalOpen(false);
                switchView(isDriver ? 'rider' : 'driver');
              }}
              className="text-xs font-bold text-slate-300 hover:text-white flex items-center gap-1.5 px-4 py-2 rounded-xl bg-slate-900 border border-slate-800 hover:border-slate-700 transition-all cursor-pointer"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span>Switch to {isDriver ? 'Rider Mode' : 'Driver Mode'}</span>
            </button>

            <button
              onClick={() => {
                setProfileModalOpen(false);
                logout();
              }}
              className="text-xs font-bold text-rose-400 hover:text-rose-300 flex items-center gap-1.5 px-4 py-2 rounded-xl bg-rose-500/10 border border-rose-500/20 hover:border-rose-500/40 transition-all cursor-pointer"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Logout</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
