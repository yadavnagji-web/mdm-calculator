import React from 'react';
import { SchoolProfile, UserAccount } from '../types';
import { Share2, Settings, Download, Upload, Code2, LogOut, UserCircle2, Sparkles } from 'lucide-react';
import { shareAppWithTeachers } from '../utils/shareUtils';

interface HeaderProps {
  currentUser: UserAccount;
  profile: SchoolProfile;
  selectedMonth: string;
  onMonthChange: (month: string) => void;
  onOpenSettings: () => void;
  onOpenBloggerModal: () => void;
  onExportBackup: () => void;
  onImportBackup: (json: string) => void;
  onLogout: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentUser,
  profile,
  selectedMonth,
  onMonthChange,
  onOpenSettings,
  onOpenBloggerModal,
  onExportBackup,
  onImportBackup,
  onLogout,
}) => {
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const content = event.target?.result as string;
        if (content) onImportBackup(content);
      };
      reader.readAsText(file);
    }
  };

  return (
    <header className="no-print bg-gradient-to-r from-emerald-800 via-teal-800 to-cyan-900 text-white shadow-lg sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 py-2.5">
        <div className="flex flex-col md:flex-row items-center justify-between gap-3">
          
          {/* Brand & School Details */}
          <div className="flex items-center gap-3 w-full md:w-auto">
            <div className="w-11 h-11 rounded-xl bg-amber-400 text-emerald-950 flex flex-col items-center justify-center font-bold shadow-md shrink-0 border-2 border-amber-300">
              <span className="text-[10px] uppercase tracking-tighter">राज.</span>
              <span className="text-sm font-extrabold leading-none">MDM</span>
            </div>
            
            <div className="truncate">
              <div className="flex items-center gap-2">
                <h1 className="text-base md:text-lg font-bold tracking-tight truncate">
                  {profile.schoolName || 'राजकीय विद्यालय'}
                </h1>
                <span className="bg-emerald-600/60 text-emerald-100 text-[11px] px-2 py-0.5 rounded-full border border-emerald-400/30 shrink-0 font-medium">
                  U-DISE: {profile.udiseCode || '---------'}
                </span>
              </div>
              
              <div className="text-[11px] text-emerald-200/90 truncate flex items-center gap-2 mt-0.5">
                <span className="bg-emerald-950/40 px-1.5 py-0.2 rounded text-amber-300 font-semibold">
                  सत्र: {currentUser.academicYear || '2026-27'}
                </span>
                <span>•</span>
                <span className="flex items-center gap-1">
                  <UserCircle2 className="w-3 h-3 text-emerald-300" />
                  <span>{currentUser.teacherName || 'शिक्षक'} (📱 {currentUser.mobileNumber})</span>
                </span>
              </div>
            </div>
          </div>

          {/* Month Selector & Action Controls */}
          <div className="flex flex-wrap items-center gap-2 w-full md:w-auto justify-end">
            
            {/* Month Picker */}
            <div className="bg-emerald-950/60 backdrop-blur border border-emerald-500/30 rounded-lg px-2.5 py-1.5 flex items-center gap-1.5 shadow-inner">
              <span className="text-xs text-emerald-200 font-medium">माह:</span>
              <input
                type="month"
                value={selectedMonth}
                onChange={(e) => onMonthChange(e.target.value)}
                className="bg-transparent text-white font-semibold text-xs md:text-sm focus:outline-none cursor-pointer"
              />
            </div>

            {/* Blogger Embed Code Button */}
            <button
              onClick={onOpenBloggerModal}
              title="ब्लॉगर या वेबसाइट पर लगाने का कोड प्राप्त करें"
              className="bg-purple-700/80 hover:bg-purple-600 text-white text-xs px-2.5 py-1.5 rounded-lg font-medium flex items-center gap-1 shadow transition-all border border-purple-400/40"
            >
              <Code2 className="w-3.5 h-3.5 text-amber-300" />
              <span className="hidden sm:inline">ब्लॉगर एम्बेड</span>
            </button>

            {/* Viral WhatsApp Share Button */}
            <button
              onClick={shareAppWithTeachers}
              title="साथी शिक्षकों के साथ साझा करें"
              className="bg-green-600 hover:bg-green-500 text-white text-xs px-3 py-1.5 rounded-lg font-semibold flex items-center gap-1 shadow-md hover:shadow-lg transition-all border border-green-400/50"
            >
              <Share2 className="w-3.5 h-3.5" />
              <span>शेयर</span>
            </button>

            {/* Backup & Restore Buttons */}
            <div className="flex items-center gap-1">
              <button
                onClick={onExportBackup}
                title="वार्षिक बैकअप डाउनलोड करें (JSON)"
                className="bg-emerald-700/80 hover:bg-emerald-600 text-white text-xs p-1.5 rounded-lg shadow transition-all border border-emerald-500/30"
              >
                <Download className="w-3.5 h-3.5" />
              </button>
              
              <button
                onClick={() => fileInputRef.current?.click()}
                title="बैकअप रीस्टोर करें"
                className="bg-emerald-700/80 hover:bg-emerald-600 text-white text-xs p-1.5 rounded-lg shadow transition-all border border-emerald-500/30"
              >
                <Upload className="w-3.5 h-3.5" />
              </button>
              <input
                type="file"
                ref={fileInputRef}
                accept=".json"
                onChange={handleFileChange}
                className="hidden"
              />
            </div>

            {/* Settings Button */}
            <button
              onClick={onOpenSettings}
              title="विद्यालय विवरण व दरें बदलें"
              className="bg-amber-500 hover:bg-amber-400 text-emerald-950 font-bold text-xs px-2.5 py-1.5 rounded-lg flex items-center gap-1 shadow-md transition-all"
            >
              <Settings className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">सेटिंग्स</span>
            </button>

            {/* Logout / Switch Account Button */}
            <button
              onClick={onLogout}
              title="खाता लॉगआउट करें या दूसरा स्कूल बदलें"
              className="bg-rose-700/80 hover:bg-rose-600 text-white text-xs px-2.5 py-1.5 rounded-lg font-semibold flex items-center gap-1 shadow transition-all border border-rose-500/40"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">लॉगआउट</span>
            </button>

          </div>

        </div>
      </div>
    </header>
  );
};
