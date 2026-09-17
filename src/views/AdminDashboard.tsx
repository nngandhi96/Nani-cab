import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import {
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Search,
  Filter,
  FileText,
  Car,
  Phone,
  LogOut,
  Sparkles,
  Check,
  X,
  RotateCcw,
  Eye,
  Calendar,
  Building2,
  UserCheck,
  FileCheck2,
} from 'lucide-react';
import type { DriverApplicant, DriverDocumentStatus } from '../types';
import { MadhubaniBackground } from '../components/MadhubaniBackground';

export const AdminDashboard: React.FC = () => {
  const {
    adminLogout,
    driverApplicants,
    verifyDriverDoc,
    rejectDriverDoc,
    requestReuploadDoc,
    approveAllDriverDocs,
  } = useApp();

  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'verified' | 'rejected'>('all');
  const [selectedDriver, setSelectedDriver] = useState<DriverApplicant | null>(null);
  const [rejectingDocKey, setRejectingDocKey] = useState<'license' | 'rc' | 'insurance' | 'identity' | null>(null);
  const [customRejectionReason, setCustomRejectionReason] = useState('');

  // Compute Live Admin Statistics
  const totalDrivers = driverApplicants.length;
  const verifiedDrivers = driverApplicants.filter((d) => d.overallStatus === 'verified').length;
  const pendingDrivers = driverApplicants.filter((d) => d.overallStatus === 'pending').length;
  const rejectedDrivers = driverApplicants.filter((d) => d.overallStatus === 'rejected').length;

  // Filter Drivers
  const filteredDrivers = driverApplicants.filter((driver) => {
    const matchesStatus =
      statusFilter === 'all' ? true : driver.overallStatus === statusFilter;
    const q = searchQuery.toLowerCase().trim();
    const matchesSearch =
      !q ||
      driver.name.toLowerCase().includes(q) ||
      driver.vehiclePlate.toLowerCase().includes(q) ||
      driver.phone.toLowerCase().includes(q) ||
      driver.city.toLowerCase().includes(q);

    return matchesStatus && matchesSearch;
  });

  // Keep selected driver data in sync with state updates
  const activeDriver = selectedDriver
    ? driverApplicants.find((d) => d.id === selectedDriver.id) || selectedDriver
    : null;

  const handleOpenInspect = (driver: DriverApplicant) => {
    setSelectedDriver(driver);
    setRejectingDocKey(null);
    setCustomRejectionReason('');
  };

  const handleConfirmReject = (driverId: string, docKey: 'license' | 'rc' | 'insurance' | 'identity') => {
    const reason =
      customRejectionReason.trim() ||
      'Document copy is unclear/expired. Please re-upload a clear commercial certificate.';
    rejectDriverDoc(driverId, docKey, reason);
    setRejectingDocKey(null);
    setCustomRejectionReason('');
  };

  const getDocStatusBadge = (status: DriverDocumentStatus) => {
    switch (status) {
      case 'verified':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
            <CheckCircle2 className="w-3 h-3" /> Verified
          </span>
        );
      case 'uploaded':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase bg-amber-500/15 text-amber-400 border border-amber-500/30 animate-pulse">
            <Clock className="w-3 h-3" /> Awaiting Review
          </span>
        );
      case 'rejected':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase bg-rose-500/15 text-rose-400 border border-rose-500/30">
            <X className="w-3 h-3" /> Rejected
          </span>
        );
      case 'pending':
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase bg-slate-800 text-slate-400 border border-slate-700">
            <AlertTriangle className="w-3 h-3" /> Missing
          </span>
        );
    }
  };

  return (
    <div className="min-h-screen bg-[#070a12] text-slate-100 pb-16 relative">
      {/* Background Watermark */}
      <MadhubaniBackground opacity={0.08} />

      {/* Admin Top Navigation Bar */}
      <header className="sticky top-0 z-40 bg-slate-950/90 backdrop-blur-2xl border-b border-purple-900/30 px-4 lg:px-8 py-3.5 shadow-2xl">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-purple-600 via-indigo-500 to-amber-400 flex items-center justify-center text-white font-black text-xl shadow-lg shadow-purple-500/30">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="font-black text-lg text-white tracking-tight">Nani Cab Admin HQ</h1>
                <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full bg-purple-500/15 text-purple-300 border border-purple-500/30 tracking-wider">
                  Driver Compliance & Verification
                </span>
              </div>
              <p className="text-[11px] text-slate-400">Make My Vash (MMV) Commercial Operations Portal</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-purple-950/40 border border-purple-800/40 text-xs text-purple-300 font-mono">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
              <span>Admin: <strong>Master Verifier</strong></span>
            </div>

            <button
              onClick={adminLogout}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-900 hover:bg-rose-500/15 text-slate-300 hover:text-rose-300 border border-slate-800 hover:border-rose-500/30 transition-all text-xs font-bold cursor-pointer"
            >
              <LogOut className="w-4 h-4" />
              <span>Exit Admin Portal</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Admin Content */}
      <main className="max-w-7xl mx-auto px-4 py-8 space-y-8 relative z-10">
        {/* KPI Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="glass-panel p-5 rounded-3xl border border-slate-800 shadow-xl relative overflow-hidden">
            <div className="flex items-center justify-between text-slate-400 text-xs font-bold">
              <span>Total Fleet Drivers</span>
              <Car className="w-4 h-4 text-purple-400" />
            </div>
            <p className="text-3xl font-black text-white mt-2 font-mono">{totalDrivers}</p>
            <p className="text-[11px] text-slate-400 mt-1">Across Bengaluru Zones</p>
          </div>

          <div className="glass-panel p-5 rounded-3xl border border-emerald-500/20 bg-emerald-950/10 shadow-xl relative overflow-hidden">
            <div className="flex items-center justify-between text-emerald-400 text-xs font-bold">
              <span>Verified & Compliant</span>
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            </div>
            <p className="text-3xl font-black text-emerald-400 mt-2 font-mono">{verifiedDrivers}</p>
            <p className="text-[11px] text-emerald-500/80 mt-1">Authorized for Duty & Rides</p>
          </div>

          <div className="glass-panel p-5 rounded-3xl border border-amber-500/20 bg-amber-950/10 shadow-xl relative overflow-hidden">
            <div className="flex items-center justify-between text-amber-400 text-xs font-bold">
              <span>Pending Reviews</span>
              <Clock className="w-4 h-4 text-amber-400 animate-spin" />
            </div>
            <p className="text-3xl font-black text-amber-400 mt-2 font-mono">{pendingDrivers}</p>
            <p className="text-[11px] text-amber-500/80 mt-1">Require Admin Document Action</p>
          </div>

          <div className="glass-panel p-5 rounded-3xl border border-rose-500/20 bg-rose-950/10 shadow-xl relative overflow-hidden">
            <div className="flex items-center justify-between text-rose-400 text-xs font-bold">
              <span>Rejected / Flagged</span>
              <AlertTriangle className="w-4 h-4 text-rose-400" />
            </div>
            <p className="text-3xl font-black text-rose-400 mt-2 font-mono">{rejectedDrivers}</p>
            <p className="text-[11px] text-rose-500/80 mt-1">Re-upload Required from Driver</p>
          </div>
        </div>

        {/* Section Header & Filters */}
        <div className="glass-panel-dark border border-slate-800 rounded-3xl p-6 shadow-2xl space-y-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h2 className="text-xl font-black text-white flex items-center gap-2">
                <FileCheck2 className="w-5 h-5 text-amber-400" />
                <span>Driver Certificate Verification Queue</span>
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Inspect Driving Licenses, Vehicle RCs, Insurance Policies, and Background Clearance.
              </p>
            </div>

            {/* Filter Tabs */}
            <div className="flex items-center gap-1.5 bg-slate-950 p-1.5 rounded-2xl border border-slate-800 self-start md:self-auto overflow-x-auto max-w-full">
              <button
                onClick={() => setStatusFilter('all')}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
                  statusFilter === 'all'
                    ? 'bg-purple-600 text-white shadow-md'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                All ({totalDrivers})
              </button>
              <button
                onClick={() => setStatusFilter('pending')}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
                  statusFilter === 'pending'
                    ? 'bg-amber-500 text-slate-950 shadow-md'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Pending Review ({pendingDrivers})
              </button>
              <button
                onClick={() => setStatusFilter('verified')}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
                  statusFilter === 'verified'
                    ? 'bg-emerald-500 text-slate-950 shadow-md'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Approved ({verifiedDrivers})
              </button>
              <button
                onClick={() => setStatusFilter('rejected')}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
                  statusFilter === 'rejected'
                    ? 'bg-rose-500 text-white shadow-md'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Rejected ({rejectedDrivers})
              </button>
            </div>
          </div>

          {/* Search Input Bar */}
          <div className="relative">
            <Search className="absolute left-4 top-3.5 w-4 h-4 text-slate-500" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search driver by name, vehicle plate (e.g. KA-04-EV-7788), phone number, or city..."
              className="w-full pl-11 pr-4 py-3 bg-slate-950/80 border border-slate-800 rounded-2xl text-white placeholder-slate-600 focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 text-xs sm:text-sm font-sans transition-all"
            />
          </div>
        </div>

        {/* Drivers List */}
        <div className="space-y-4">
          {filteredDrivers.length === 0 ? (
            <div className="glass-panel-dark border border-slate-800 rounded-3xl p-12 text-center space-y-3">
              <Filter className="w-10 h-10 text-slate-600 mx-auto" />
              <h3 className="text-base font-bold text-slate-300">No Drivers Match Filter</h3>
              <p className="text-xs text-slate-500">Try changing the search query or status filter above.</p>
            </div>
          ) : (
            filteredDrivers.map((driver) => {
              const docList = [
                { key: 'license' as const, name: 'Driving License', data: driver.docs.license },
                { key: 'rc' as const, name: 'Vehicle RC', data: driver.docs.rc },
                { key: 'insurance' as const, name: 'Insurance', data: driver.docs.insurance },
                { key: 'identity' as const, name: 'Aadhaar / ID', data: driver.docs.identity },
              ];

              const verifiedCount = docList.filter((d) => d.data.status === 'verified').length;

              return (
                <div
                  key={driver.id}
                  className="glass-panel-dark border border-slate-800/90 hover:border-purple-500/40 rounded-3xl p-6 shadow-xl transition-all space-y-5"
                >
                  <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                    <div className="flex items-start gap-4">
                      <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-slate-800 to-slate-950 border border-slate-700 flex items-center justify-center text-amber-400 font-black text-xl shadow-md shrink-0">
                        {driver.name
                          .split(' ')
                          .map((n) => n[0])
                          .join('')
                          .slice(0, 2)}
                      </div>
                      <div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <h3 className="text-lg font-bold text-white">{driver.name}</h3>
                          <span className="text-xs font-mono font-bold px-2 py-0.5 rounded-lg bg-slate-900 border border-slate-700 text-slate-300">
                            {driver.vehiclePlate}
                          </span>
                          {driver.overallStatus === 'verified' && (
                            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                              Fleet Approved
                            </span>
                          )}
                          {driver.overallStatus === 'pending' && (
                            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase bg-amber-500/15 text-amber-400 border border-amber-500/30 animate-pulse">
                              Pending Review
                            </span>
                          )}
                          {driver.overallStatus === 'rejected' && (
                            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase bg-rose-500/15 text-rose-400 border border-rose-500/30">
                              Action Required
                            </span>
                          )}
                        </div>

                        <div className="flex items-center gap-4 text-xs text-slate-400 mt-1 flex-wrap">
                          <span className="flex items-center gap-1">
                            <Car className="w-3.5 h-3.5 text-slate-500" />
                            <span>{driver.vehicleModel}</span>
                          </span>
                          <span className="flex items-center gap-1">
                            <Phone className="w-3.5 h-3.5 text-slate-500" />
                            <span className="font-mono">{driver.phone}</span>
                          </span>
                          <span className="text-slate-500">•</span>
                          <span>{driver.city}</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 self-end lg:self-auto">
                      {verifiedCount < 4 && (
                        <button
                          onClick={() => approveAllDriverDocs(driver.id)}
                          className="px-4 py-2.5 bg-gradient-to-r from-emerald-500 to-teal-400 hover:brightness-110 text-slate-950 font-black rounded-xl text-xs transition-all shadow-lg shadow-emerald-500/20 flex items-center gap-1.5 cursor-pointer"
                        >
                          <Sparkles className="w-3.5 h-3.5" />
                          <span>1-Click Approve All</span>
                        </button>
                      )}

                      <button
                        onClick={() => handleOpenInspect(driver)}
                        className="px-4 py-2.5 bg-purple-600/20 hover:bg-purple-600/30 text-purple-300 border border-purple-500/40 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>Inspect Certificates</span>
                      </button>
                    </div>
                  </div>

                  {/* 4 Document Status Tiles */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 pt-3 border-t border-slate-800/80">
                    {docList.map((doc) => (
                      <div
                        key={doc.key}
                        className="bg-slate-950/80 border border-slate-800/80 rounded-2xl p-3.5 flex flex-col justify-between space-y-2"
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold text-slate-200">{doc.name}</span>
                          {getDocStatusBadge(doc.data.status)}
                        </div>

                        <div className="text-[11px] font-mono text-slate-400 truncate">
                          {doc.data.docNo || 'No Document #'}
                        </div>

                        {doc.data.status === 'rejected' && doc.data.rejectionReason && (
                          <p className="text-[10px] text-rose-400 bg-rose-950/40 border border-rose-800/40 p-1.5 rounded-lg">
                            Reason: {doc.data.rejectionReason}
                          </p>
                        )}

                        <div className="pt-2 flex items-center justify-between text-[10px] border-t border-slate-900">
                          {doc.data.status === 'verified' ? (
                            <span className="text-emerald-400 font-bold flex items-center gap-1">
                              <Check className="w-3 h-3" /> Approved by Admin
                            </span>
                          ) : (
                            <div className="flex items-center gap-2 w-full justify-end">
                              <button
                                onClick={() => verifyDriverDoc(driver.id, doc.key)}
                                className="px-2 py-1 bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-400 border border-emerald-500/40 rounded-lg font-bold flex items-center gap-1 transition-all cursor-pointer"
                                title="Approve this certificate"
                              >
                                <Check className="w-3 h-3" /> Approve
                              </button>
                              <button
                                onClick={() => {
                                  setSelectedDriver(driver);
                                  setRejectingDocKey(doc.key);
                                }}
                                className="px-2 py-1 bg-rose-500/20 hover:bg-rose-500/30 text-rose-400 border border-rose-500/40 rounded-lg font-bold flex items-center gap-1 transition-all cursor-pointer"
                                title="Reject this certificate"
                              >
                                <X className="w-3 h-3" /> Reject
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </main>

      {/* Detailed Document Inspection Modal */}
      {activeDriver && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-xl animate-fade-in overflow-y-auto">
          <div className="w-full max-w-4xl bg-slate-950 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl relative my-8">
            <button
              onClick={() => {
                setSelectedDriver(null);
                setRejectingDocKey(null);
              }}
              className="absolute top-5 right-5 p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-900 transition-all cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Modal Header */}
            <div className="flex items-center gap-4 mb-6 pb-4 border-b border-slate-800">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-purple-600 to-amber-400 flex items-center justify-center text-white font-black text-lg">
                <UserCheck className="w-6 h-6" />
              </div>
              <div>
                <h2 className="text-xl font-black text-white">Certificate Inspector: {activeDriver.name}</h2>
                <p className="text-xs text-slate-400">
                  Vehicle: <strong className="text-amber-400">{activeDriver.vehiclePlate}</strong> ({activeDriver.vehicleModel}) • Phone: {activeDriver.phone}
                </p>
              </div>
            </div>

            {/* Rejection Prompt Box if rejecting a doc */}
            {rejectingDocKey && (
              <div className="mb-6 p-4 rounded-2xl bg-rose-950/40 border border-rose-500/40 space-y-3">
                <div className="flex items-center gap-2 text-xs font-bold text-rose-300">
                  <AlertTriangle className="w-4 h-4 text-rose-400" />
                  <span>Specify Reason for Rejecting {rejectingDocKey.toUpperCase()} Certificate</span>
                </div>
                <input
                  type="text"
                  value={customRejectionReason}
                  onChange={(e) => setCustomRejectionReason(e.target.value)}
                  placeholder="e.g. Expired insurance policy date, plate number mismatch, or blurry image..."
                  className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-white text-xs placeholder-slate-500 focus:outline-none focus:border-rose-500"
                  autoFocus
                />
                <div className="flex justify-end gap-2">
                  <button
                    onClick={() => {
                      setRejectingDocKey(null);
                      setCustomRejectionReason('');
                    }}
                    className="px-3 py-1.5 text-xs text-slate-400 hover:text-white rounded-lg"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => handleConfirmReject(activeDriver.id, rejectingDocKey)}
                    className="px-4 py-1.5 bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs rounded-xl transition-all shadow-md"
                  >
                    Confirm Rejection
                  </button>
                </div>
              </div>
            )}

            {/* Certificate Details Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[
                { key: 'license' as const, title: '1. Commercial Driving License', icon: FileText, doc: activeDriver.docs.license },
                { key: 'rc' as const, title: '2. Vehicle RC Registration', icon: Car, doc: activeDriver.docs.rc },
                { key: 'insurance' as const, title: '3. Commercial Insurance Policy', icon: ShieldCheck, doc: activeDriver.docs.insurance },
                { key: 'identity' as const, title: '4. Aadhaar / Police Verification', icon: UserCheck, doc: activeDriver.docs.identity },
              ].map(({ key, title, icon: Icon, doc }) => (
                <div
                  key={key}
                  className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 space-y-4 relative"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-sm text-white flex items-center gap-2">
                      <Icon className="w-4 h-4 text-purple-400" />
                      {title}
                    </span>
                    {getDocStatusBadge(doc.status)}
                  </div>

                  <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800/80 space-y-2 text-xs">
                    <div className="flex justify-between">
                      <span className="text-slate-500">Document No:</span>
                      <span className="font-mono font-bold text-amber-300">{doc.docNo || 'Pending Submission'}</span>
                    </div>
                    {doc.expiry && (
                      <div className="flex justify-between">
                        <span className="text-slate-500">Expiry Date:</span>
                        <span className="font-mono text-slate-300 flex items-center gap-1">
                          <Calendar className="w-3 h-3 text-slate-500" /> {doc.expiry}
                        </span>
                      </div>
                    )}
                    {doc.issuedBy && (
                      <div className="flex justify-between">
                        <span className="text-slate-500">Authority:</span>
                        <span className="text-slate-300 flex items-center gap-1">
                          <Building2 className="w-3 h-3 text-slate-500" /> {doc.issuedBy}
                        </span>
                      </div>
                    )}
                    {doc.lastUpdated && (
                      <div className="flex justify-between">
                        <span className="text-slate-500">Last Modified:</span>
                        <span className="font-mono text-slate-400">{doc.lastUpdated}</span>
                      </div>
                    )}
                    {doc.status === 'rejected' && doc.rejectionReason && (
                      <div className="pt-2 border-t border-slate-800 text-rose-400">
                        <span className="font-bold">Rejection Note: </span>
                        {doc.rejectionReason}
                      </div>
                    )}
                  </div>

                  {/* Inspector Action Buttons */}
                  <div className="flex items-center gap-2 pt-2">
                    <button
                      onClick={() => verifyDriverDoc(activeDriver.id, key)}
                      className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                        doc.status === 'verified'
                          ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                          : 'bg-emerald-600 hover:bg-emerald-500 text-slate-950 font-black shadow-md'
                      }`}
                    >
                      <Check className="w-3.5 h-3.5" />
                      <span>{doc.status === 'verified' ? 'Verified' : 'Approve'}</span>
                    </button>

                    <button
                      onClick={() => setRejectingDocKey(key)}
                      className="py-2 px-3 bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 border border-rose-500/40 rounded-xl text-xs font-bold flex items-center justify-center gap-1 transition-all cursor-pointer"
                    >
                      <X className="w-3.5 h-3.5" />
                      <span>Reject</span>
                    </button>

                    <button
                      onClick={() => requestReuploadDoc(activeDriver.id, key)}
                      className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white rounded-xl text-xs transition-all cursor-pointer"
                      title="Request Re-upload"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Bottom Actions */}
            <div className="mt-6 pt-4 border-t border-slate-800 flex items-center justify-between">
              <span className="text-xs text-slate-400">
                Compliance status changes synchronize immediately with driver's active mobile console.
              </span>
              <button
                onClick={() => approveAllDriverDocs(activeDriver.id)}
                className="py-2.5 px-5 bg-gradient-to-r from-emerald-500 to-teal-400 hover:brightness-110 text-slate-950 font-black text-xs rounded-xl shadow-xl shadow-emerald-500/20 flex items-center gap-2 cursor-pointer"
              >
                <Sparkles className="w-4 h-4" />
                <span>Approve All Certificates</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
