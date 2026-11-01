import React from 'react';
import { ShieldCheck } from 'lucide-react';

interface FooterProps {
  setCurrentTab: (tab: string) => void;
}

export const Footer: React.FC<FooterProps> = ({ setCurrentTab }) => {
  return (
    <footer className="bg-[#f6f7f3] text-[#74817b] pt-12 pb-8 border-t border-[#e4e9e1]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 pb-10 border-b border-[#e4e9e1]">
          {/* Brand Col */}
          <div className="md:col-span-1 space-y-3">
            <div
              className="flex items-center gap-3 cursor-pointer group"
              onClick={() => setCurrentTab('home')}
            >
              <img
                src={`${import.meta.env.BASE_URL}assets/aistudio/FixMyRAK_Coastal_Community_Logo_d0e1428a.png`}
                alt="FixMyRAK Logo"
                className="w-12 h-12 object-contain rounded-xl bg-white border border-[#e4e9e1] p-1 shadow-xs group-hover:scale-105 transition-transform"
              />
              <div>
                <span className="text-xl font-extrabold tracking-tight text-[#143d35] font-manrope block leading-tight">
                  FixMy<span className="text-[#e97950]">RAK</span>
                </span>
                <span className="text-[10px] text-[#74817b] block font-medium mt-0.5">
                  Your Community. Your Voice. A Better RAK.
                </span>
              </div>
            </div>
            <p className="text-xs text-[#74817b] leading-relaxed pt-1">
              Made with care for the community of Ras Al Khaimah, United Arab Emirates.
            </p>
            <div className="text-[11px] text-[#89958d] flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[#72a879]"></span>
              <span>Ras Al Khaimah &bull; UAE</span>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-[#143d35] mb-3 font-manrope">
              Navigation
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <button
                  onClick={() => setCurrentTab('home')}
                  className="hover:text-[#143d35] transition-colors"
                >
                  Home Overview
                </button>
              </li>
              <li>
                <button
                  onClick={() => setCurrentTab('explore')}
                  className="hover:text-[#143d35] transition-colors"
                >
                  Explore Public Reports
                </button>
              </li>
              <li>
                <button
                  onClick={() => setCurrentTab('map')}
                  className="hover:text-[#143d35] transition-colors"
                >
                  Interactive RAK Map
                </button>
              </li>
              <li>
                <button
                  onClick={() => setCurrentTab('dashboard')}
                  className="hover:text-[#143d35] transition-colors"
                >
                  My Reports
                </button>
              </li>
              <li>
                <button
                  onClick={() => setCurrentTab('report')}
                  className="hover:text-[#e97950] transition-colors font-semibold text-[#143d35]"
                >
                  ＋ Report an Issue
                </button>
              </li>
              <li>
                <button
                  onClick={() => setCurrentTab('feedback')}
                  className="hover:text-[#143d35] transition-colors"
                >
                  Community Feedback
                </button>
              </li>
            </ul>
          </div>

          {/* Focus Areas */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-[#143d35] mb-3 font-manrope">
              Categories
            </h4>
            <ul className="space-y-2 text-xs text-[#74817b]">
              <li>Water Saving</li>
              <li>Electricity Saving</li>
              <li>Recycling</li>
              <li>Greener Living</li>
              <li>Roads and Potholes</li>
              <li>Streetlights</li>
              <li>Pavements & Walkways</li>
              <li>Public Facilities</li>
              <li>Other Infrastructure</li>
            </ul>
          </div>

          {/* Civic Disclaimer */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-[#143d35] mb-3 font-manrope flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-[#143d35]" />
              Civic Disclaimer
            </h4>
            <p className="text-[11px] text-[#74817b] leading-relaxed mb-3">
              FixMyRAK is a community-shared transparency platform. Submissions are public for neighborhood awareness and are not sent directly to local authorities.
            </p>
            <div className="p-2.5 rounded-xl bg-[#fff0e8] border border-[#ffedd5] text-[11px] text-[#c2410c] font-medium">
              🚨 For immediate life-threatening emergencies in Ras Al Khaimah, please dial <strong>999</strong> directly.
            </div>
          </div>
        </div>

        {/* Bottom row */}
        <div className="pt-6 flex flex-col sm:flex-row items-center justify-between text-[11px] text-[#89958d] gap-3">
          <p>
            Photo: <a href="https://commons.wikimedia.org/wiki/File:Beach_Sunset_at_RAK.jpg" target="_blank" rel="noreferrer" className="hover:text-[#143d35] underline">Beach Sunset at RAK</a> by SumanGNepal via Wikimedia Commons, CC BY-SA 4.0 &bull; &copy; {new Date().getFullYear()} FixMyRAK
          </p>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setCurrentTab('about')}
              className="hover:text-[#143d35] transition-colors"
            >
              Privacy Policy
            </button>
            <span>&bull;</span>
            <button
              onClick={() => setCurrentTab('about')}
              className="hover:text-[#143d35] transition-colors"
            >
              Terms of Use
            </button>
            <span>&bull;</span>
            <button
              onClick={() => setCurrentTab('about')}
              className="hover:text-[#143d35] transition-colors"
            >
              About & Transparency
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
};
