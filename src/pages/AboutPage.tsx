import React, { useState } from 'react';
import {
  ShieldCheck,
  MapPin,
  Sparkles,
  Users,
  CheckCircle2,
  FileText,
  AlertTriangle,
  Lock,
} from 'lucide-react';

export const AboutPage: React.FC = () => {
  const [activeSection, setActiveSection] = useState<'about' | 'privacy' | 'terms'>('about');

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10 bg-[#f6f7f3]">
      {/* Header */}
      <div className="text-center space-y-3">
        <div className="flex justify-center mb-1">
          <img
            src="/assets/aistudio/FixMyRAK_Coastal_Community_Logo_d0e1428a.png"
            alt="FixMyRAK Logo"
            className="w-20 h-20 sm:w-24 sm:h-24 object-contain rounded-3xl shadow-sm bg-white p-2 border border-[#e4e9e1]"
          />
        </div>
        <span className="text-[10px] font-bold text-[#819087] uppercase tracking-widest block">
          Civic Transparency & Mission
        </span>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-[#143d35] font-manrope tracking-tight">
          About FixMyRAK
        </h1>
        <p className="text-[#74817b] text-xs sm:text-sm max-w-xl mx-auto leading-relaxed">
          Your Community. Your Voice. A Better RAK. Dedicated to fostering civic infrastructure visibility and community collaboration across the Emirate of Ras Al Khaimah.
        </p>
      </div>

      {/* Navigation Pills */}
      <div className="flex items-center justify-center gap-2 border-b border-[#e4e9e1] pb-4">
        <button
          onClick={() => setActiveSection('about')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            activeSection === 'about'
              ? 'bg-[#143d35] text-white shadow-xs'
              : 'bg-[#f6f7f3] text-[#74817b] hover:bg-[#e8f1e9] border border-[#e4e9e1]'
          }`}
        >
          Mission & Operations
        </button>
        <button
          onClick={() => setActiveSection('privacy')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            activeSection === 'privacy'
              ? 'bg-[#143d35] text-white shadow-xs'
              : 'bg-[#f6f7f3] text-[#74817b] hover:bg-[#e8f1e9] border border-[#e4e9e1]'
          }`}
        >
          Privacy Policy
        </button>
        <button
          onClick={() => setActiveSection('terms')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            activeSection === 'terms'
              ? 'bg-[#143d35] text-white shadow-xs'
              : 'bg-[#f6f7f3] text-[#74817b] hover:bg-[#e8f1e9] border border-[#e4e9e1]'
          }`}
        >
          Terms of Use & Disclaimer
        </button>
      </div>

      {/* Section 1: About & Mission */}
      {activeSection === 'about' && (
        <div className="space-y-8 animate-in fade-in">
          {/* Transparency Highlight Banner */}
          <div className="p-5 rounded-3xl bg-amber-50 border border-amber-200/80 text-amber-950 text-xs leading-relaxed space-y-2">
            <div className="flex items-center gap-2 font-black text-amber-900 text-sm">
              <ShieldCheck className="w-5 h-5 text-amber-700 shrink-0" />
              <span>Public Civic Transparency Notice</span>
            </div>
            <p>
              FixMyRAK is an independent civic reporting initiative created for residents, businesses, and visitors of Ras Al Khaimah, UAE.
              Reports submitted to this platform are published for public tracking, neighborhood awareness, and constructive community improvement.
              FixMyRAK is not an official government dispatch system and does not claim official government affiliation unless an authorized municipal integration is established.
            </p>
            <div className="font-bold text-amber-800 pt-1">
              🚨 For immediate emergency assistance or urgent road safety hazards, always dial <strong>999</strong> directly.
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white p-6 rounded-3xl border border-slate-200 space-y-2">
              <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold mb-3">
                <Users className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-sm text-slate-900">Community Empowerment</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Giving residents of Al Nakheel, Al Hamra, Corniche Al Qawasim, and Mina Al Arab a simple, transparent way to speak up about shared spaces.
              </p>
            </div>

            <div className="bg-white p-6 rounded-3xl border border-slate-200 space-y-2">
              <div className="w-10 h-10 rounded-xl bg-teal-100 text-teal-700 flex items-center justify-center font-bold mb-3">
                <Sparkles className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-sm text-slate-900">Google Gemini AI</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Utilizing cutting-edge Gemini 3.8 Flash models on the server to automatically categorize problems, enhance clarity, and prevent duplicate reports.
              </p>
            </div>

            <div className="bg-white p-6 rounded-3xl border border-slate-200 space-y-2">
              <div className="w-10 h-10 rounded-xl bg-sky-100 text-sky-700 flex items-center justify-center font-bold mb-3">
                <MapPin className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-sm text-slate-900">Real-Time Geolocation</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Pinpointing defective infrastructure on interactive Ras Al Khaimah maps with status markers to make triage swift and accountable.
              </p>
            </div>
          </div>

          {/* Issue Lifecycle */}
          <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 space-y-4">
            <h3 className="text-base font-black text-slate-900">
              The FixMyRAK Lifecycle
            </h3>
            <div className="space-y-4 text-xs text-slate-600">
              <div className="flex gap-3">
                <span className="font-black text-emerald-600">01.</span>
                <p>
                  <strong>Report Submission:</strong> Citizen submits a photo, detailed description, and map coordinates. Report receives status <span className="font-bold text-amber-700">Submitted</span>.
                </p>
              </div>
              <div className="flex gap-3">
                <span className="font-black text-emerald-600">02.</span>
                <p>
                  <strong>Municipal Review:</strong> Coordinators evaluate the hazard, review photograph evidence, and move status to <span className="font-bold text-sky-700">Under Review</span>.
                </p>
              </div>
              <div className="flex gap-3">
                <span className="font-black text-emerald-600">03.</span>
                <p>
                  <strong>Active Maintenance:</strong> Field crews are scheduled or dispatched. Status moves to <span className="font-bold text-violet-700">In Progress</span> with an administrative status note.
                </p>
              </div>
              <div className="flex gap-3">
                <span className="font-black text-emerald-600">04.</span>
                <p>
                  <strong>Resolution:</strong> The defect is repaired and verified. Status is marked <span className="font-bold text-emerald-700">Resolved</span>, and the citizen receives an in-app notification.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Section 2: Privacy Policy */}
      {activeSection === 'privacy' && (
        <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 space-y-6 text-xs text-slate-600 leading-relaxed animate-in fade-in">
          <div className="flex items-center gap-2 text-slate-900 font-bold text-base">
            <Lock className="w-5 h-5 text-emerald-600" />
            <h2>Privacy Policy</h2>
          </div>
          <p>
            At FixMyRAK, we are committed to protecting the privacy of community members who report infrastructure defects in Ras Al Khaimah, UAE.
          </p>

          <h3 className="font-bold text-slate-900 text-sm">1. Information We Collect</h3>
          <p>
            When you register, we collect your display name and email address via Firebase Authentication. When you submit a report, we store the problem title, description, attached photographs, and geographic location coordinates.
          </p>

          <h3 className="font-bold text-slate-900 text-sm">2. Public vs. Private Data</h3>
          <p>
            Report descriptions, incident photographs, categories, and map coordinates are published openly to facilitate community awareness and municipal visibility. Your private email address is never displayed publicly.
          </p>

          <h3 className="font-bold text-slate-900 text-sm">3. Security & Cloud Firestore</h3>
          <p>
            Data is stored securely on Google Cloud Firestore with Attribute-Based Access Control (ABAC) rules. Access to administrative controls is restricted to authorized credentials.
          </p>
        </div>
      )}

      {/* Section 3: Terms of Use */}
      {activeSection === 'terms' && (
        <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 space-y-6 text-xs text-slate-600 leading-relaxed animate-in fade-in">
          <div className="flex items-center gap-2 text-slate-900 font-bold text-base">
            <FileText className="w-5 h-5 text-emerald-600" />
            <h2>Terms of Service & Usage Guidelines</h2>
          </div>

          <h3 className="font-bold text-slate-900 text-sm">1. Accurate & Constructive Submissions</h3>
          <p>
            Users agree to submit truthful, genuine reports concerning physical infrastructure in Ras Al Khaimah. Submissions containing abusive language, harassment, advertisements, or false emergencies will be flagged and removed.
          </p>

          <h3 className="font-bold text-slate-900 text-sm">2. No Emergency Replacement</h3>
          <p>
            FixMyRAK is not a substitute for UAE police, ambulance, or civil defense emergency response. For life-threatening emergencies or urgent accidents, immediately contact 999.
          </p>

          <h3 className="font-bold text-slate-900 text-sm">3. Content Ownership</h3>
          <p>
            By uploading photographs to FixMyRAK, you grant the platform a non-exclusive license to display the image publicly for civic coordination and municipal maintenance purposes.
          </p>
        </div>
      )}
    </div>
  );
};
