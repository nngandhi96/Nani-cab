import React from 'react';
import { useApp } from '../context/AppContext';
import { Shield, FileText, X, Check, Lock, MapPin, CreditCard, AlertCircle, Phone } from 'lucide-react';

export const LegalModal: React.FC = () => {
  const { legalModalOpen, legalModalTab, closeLegalModal, setLegalModalTab } = useApp();

  if (!legalModalOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fadeIn">
      <div 
        className="w-full max-w-3xl max-h-[90vh] bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl flex flex-col overflow-hidden text-slate-100 relative animate-scaleUp"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Glow Accents */}
        <div className="absolute -top-24 -right-24 w-56 h-56 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -left-24 w-56 h-56 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

        {/* Modal Header */}
        <div className="p-6 border-b border-slate-800 flex items-center justify-between bg-slate-950/60 relative z-10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-400">
              {legalModalTab === 'terms' ? <FileText className="w-5 h-5" /> : <Shield className="w-5 h-5" />}
            </div>
            <div>
              <h2 className="text-xl font-black text-white tracking-tight">
                {legalModalTab === 'terms' ? 'Terms of Service (सेवा की शर्तें)' : 'Privacy Policy (गोपनीयता नीति)'}
              </h2>
              <p className="text-xs text-slate-400 font-medium mt-0.5">
                Nani Cab — A Proprietary Product & Unit of MAKE MY VASH (MMV)
              </p>
            </div>
          </div>

          <button
            onClick={closeLegalModal}
            className="p-2 rounded-full text-slate-400 hover:text-white hover:bg-slate-800 transition-all border border-transparent hover:border-slate-700"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-slate-800 bg-slate-950/40 p-1.5 px-6 gap-2 shrink-0">
          <button
            onClick={() => setLegalModalTab('terms')}
            className={`flex-1 py-2.5 px-4 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 ${
              legalModalTab === 'terms'
                ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            <FileText className="w-4 h-4" />
            <span>Terms of Service</span>
          </button>
          <button
            onClick={() => setLegalModalTab('privacy')}
            className={`flex-1 py-2.5 px-4 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 ${
              legalModalTab === 'privacy'
                ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/20'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            <Shield className="w-4 h-4" />
            <span>Privacy Policy</span>
          </button>
        </div>

        {/* Modal Scrollable Body */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1 text-slate-300 text-sm leading-relaxed scrollbar-thin scrollbar-thumb-slate-700">
          {legalModalTab === 'terms' ? (
            <>
              {/* Terms Overview Badge */}
              <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-300 text-xs flex items-start gap-3">
                <AlertCircle className="w-5 h-5 shrink-0 text-amber-400 mt-0.5" />
                <div>
                  <strong className="block text-amber-200 font-bold mb-1">User Agreement Summary</strong>
                  By accessing or using the Nani Cab platform as a Rider or Driver partner, you agree to comply with these Terms of Service. Please read them carefully before booking or accepting rides.
                </div>
              </div>

              {/* Section 1 */}
              <section className="space-y-2">
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <span className="w-6 h-6 rounded-lg bg-slate-800 text-amber-400 font-mono text-xs flex items-center justify-center border border-slate-700">1</span>
                  Eligibility & Account Registration
                </h3>
                <p>
                  To use Nani Cab services, you must be at least 18 years old. When registering with your mobile number, you agree to provide accurate information and maintain sole responsibility for all activity under your OTP-verified profile.
                </p>
                <ul className="list-disc list-inside text-xs text-slate-400 space-y-1 pl-2">
                  <li>Riders must ensure valid contact numbers for OTP delivery.</li>
                  <li>Drivers must hold a valid Indian Commercial Driving License, Vehicle RC, and Active Insurance.</li>
                </ul>
              </section>

              {/* Section 2 */}
              <section className="space-y-2">
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <span className="w-6 h-6 rounded-lg bg-slate-800 text-amber-400 font-mono text-xs flex items-center justify-center border border-slate-700">2</span>
                  Ride Bookings & Fare Structure
                </h3>
                <p>
                  Fares are calculated dynamically based on distance, estimated trip duration, vehicle category (Auto, Bike, Mini, Sedan, SUV), and current demand surge multipliers in your area.
                </p>
                <div className="grid sm:grid-cols-2 gap-3 pt-1">
                  <div className="p-3 bg-slate-950/60 rounded-xl border border-slate-800 text-xs">
                    <strong className="text-white block mb-1">Payment Options:</strong>
                    Accepted methods include Cash, Direct UPI, and Cards. Cash payments must be settled immediately at trip end.
                  </div>
                  <div className="p-3 bg-slate-950/60 rounded-xl border border-slate-800 text-xs">
                    <strong className="text-white block mb-1">OTP Safety Verification:</strong>
                    Every ride requires a 4-digit PIN/OTP exchange with the driver before starting the trip.
                  </div>
                </div>
              </section>

              {/* Section 3 */}
              <section className="space-y-2">
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <span className="w-6 h-6 rounded-lg bg-slate-800 text-amber-400 font-mono text-xs flex items-center justify-center border border-slate-700">3</span>
                  Driver Partner Conduct & Document Verification
                </h3>
                <p>
                  Driver partners act as independent service providers. Nani Cab verifies submitted documentation (Driving License, Vehicle Registration, Insurance Policy, Identity Proof) prior to account activation.
                </p>
                <ul className="list-disc list-inside text-xs text-slate-400 space-y-1 pl-2">
                  <li>Zero tolerance policy for driving under the influence or unrefined behavior.</li>
                  <li>Drivers must maintain clean vehicles and abide by speed limits and safety guidelines.</li>
                </ul>
              </section>

              {/* Section 4 */}
              <section className="space-y-2">
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <span className="w-6 h-6 rounded-lg bg-slate-800 text-amber-400 font-mono text-xs flex items-center justify-center border border-slate-700">4</span>
                  Cancellations & Refunds
                </h3>
                <p>
                  Riders can cancel requested trips prior to driver arrival. Repeated cancellations after a driver has been dispatched may incur a nominal cancellation fee added to your next ride.
                </p>
              </section>

              {/* Section 5 */}
              <section className="space-y-2">
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <span className="w-6 h-6 rounded-lg bg-slate-800 text-amber-400 font-mono text-xs flex items-center justify-center border border-slate-700">5</span>
                  Limitation of Liability
                </h3>
                <p>
                  Nani Cab is a technology marketplace connecting riders with transport providers. While we perform stringent background and document verifications, Nani Cab is not liable for indirect or consequential damages arising from third-party actions during rides.
                </p>
              </section>
            </>
          ) : (
            <>
              {/* Privacy Overview Badge */}
              <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 text-xs flex items-start gap-3">
                <Lock className="w-5 h-5 shrink-0 text-emerald-400 mt-0.5" />
                <div>
                  <strong className="block text-emerald-200 font-bold mb-1">Data Protection Commitment</strong>
                  Your privacy is our priority. Nani Cab collects only essential data required to facilitate safe, reliable, and efficient rides. We do NOT sell your personal data to third parties.
                </div>
              </div>

              {/* Section 1 */}
              <section className="space-y-2">
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <span className="w-6 h-6 rounded-lg bg-slate-800 text-emerald-400 font-mono text-xs flex items-center justify-center border border-slate-700">1</span>
                  Information We Collect
                </h3>
                <p>
                  To deliver seamless mobility services, Nani Cab gathers the following categories of information:
                </p>
                <div className="grid sm:grid-cols-2 gap-3 pt-1 text-xs">
                  <div className="p-3 bg-slate-950/60 rounded-xl border border-slate-800 flex items-start gap-2.5">
                    <Phone className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                    <div>
                      <strong className="text-white block">Contact Information:</strong>
                      Mobile number used for account verification via SMS/OTP.
                    </div>
                  </div>
                  <div className="p-3 bg-slate-950/60 rounded-xl border border-slate-800 flex items-start gap-2.5">
                    <MapPin className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                    <div>
                      <strong className="text-white block">Location Data:</strong>
                      Pickup and dropoff GPS coordinates during active ride requests.
                    </div>
                  </div>
                  <div className="p-3 bg-slate-950/60 rounded-xl border border-slate-800 flex items-start gap-2.5">
                    <Shield className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                    <div>
                      <strong className="text-white block">Driver Verification Docs:</strong>
                      DL, RC, Insurance files stored securely for driver account validation.
                    </div>
                  </div>
                  <div className="p-3 bg-slate-950/60 rounded-xl border border-slate-800 flex items-start gap-2.5">
                    <CreditCard className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                    <div>
                      <strong className="text-white block">Transaction Details:</strong>
                      Fare amount, chosen payment mode, and trip history.
                    </div>
                  </div>
                </div>
              </section>

              {/* Section 2 */}
              <section className="space-y-2">
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <span className="w-6 h-6 rounded-lg bg-slate-800 text-emerald-400 font-mono text-xs flex items-center justify-center border border-slate-700">2</span>
                  How We Use Your Information
                </h3>
                <p>
                  Collected data is strictly used for core app features:
                </p>
                <ul className="list-disc list-inside text-xs text-slate-400 space-y-1 pl-2">
                  <li>Matching riders with nearby drivers in real-time.</li>
                  <li>Generating turn-by-turn route suggestions and fare estimates.</li>
                  <li>Verifying rider identity via OTP for driver safety.</li>
                  <li>Auditing driver credentials to ensure road safety compliance.</li>
                </ul>
              </section>

              {/* Section 3 */}
              <section className="space-y-2">
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <span className="w-6 h-6 rounded-lg bg-slate-800 text-emerald-400 font-mono text-xs flex items-center justify-center border border-slate-700">3</span>
                  Background GPS & Safety Tracking
                </h3>
                <p>
                  Location data is accessed while the app is active in the foreground or during active trips to provide live tracking to riders and calculate accurate fare distances. Drivers share location when turned "Online".
                </p>
              </section>

              {/* Section 4 */}
              <section className="space-y-2">
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <span className="w-6 h-6 rounded-lg bg-slate-800 text-emerald-400 font-mono text-xs flex items-center justify-center border border-slate-700">4</span>
                  Data Storage & Security Measures
                </h3>
                <p>
                  All sensitive payload transmissions use industry-standard SSL/TLS encryption. Profile records stored locally utilize browser secure storage keys. We never store credit card numbers or UPI PINs.
                </p>
              </section>

              {/* Section 5 */}
              <section className="space-y-2">
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <span className="w-6 h-6 rounded-lg bg-slate-800 text-emerald-400 font-mono text-xs flex items-center justify-center border border-slate-700">5</span>
                  Your Rights & Data Deletion
                </h3>
                <p>
                  You have full rights to request data inspection, update your contact information, or request complete account deletion at any time by logging out or contacting our support team at <span className="text-amber-400 font-mono">support@nanicab.com</span>.
                </p>
              </section>
            </>
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-4 px-6 border-t border-slate-800 bg-slate-950/80 flex items-center justify-between relative z-10">
          <div className="text-xs text-slate-400 flex items-center gap-1.5">
            <Shield className="w-4 h-4 text-emerald-400" />
            <span>Nani Cab • Unit of MAKE MY VASH (MMV)</span>
          </div>

          <button
            onClick={closeLegalModal}
            className="py-2.5 px-6 bg-gradient-to-r from-amber-500 via-amber-400 to-yellow-400 text-slate-950 font-black text-xs rounded-xl shadow-lg shadow-amber-500/20 hover:brightness-110 transition-all flex items-center gap-2"
          >
            <Check className="w-4 h-4" />
            <span>I Understand & Agree</span>
          </button>
        </div>
      </div>
    </div>
  );
};
