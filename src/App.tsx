import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { Navigation, TabType } from './components/Navigation';
import { DailyEntryView } from './components/DailyEntryView';
import { DailyRegisterView } from './components/DailyRegisterView';
import { BalGopalView } from './components/BalGopalView';
import { MprReportView } from './components/MprReportView';
import { UcReportView } from './components/UcReportView';
import { CashbookView } from './components/CashbookView';
import { ComparativeAnalysisView } from './components/ComparativeAnalysisView';
import { SettingsModal } from './components/SettingsModal';
import { BloggerEmbedModal } from './components/BloggerEmbedModal';
import { AuthScreen } from './components/AuthScreen';

import { UserAccount, DailyMDMEntry, StockOpeningAndReceipts, SchoolProfile } from './types';
import { 
  getActiveSessionUser, 
  logoutUser, 
  getUserScopedProfile, 
  saveUserScopedProfile, 
  getUserScopedEntries, 
  saveUserScopedEntries, 
  getUserScopedStock, 
  saveUserScopedStock 
} from './utils/authStorage';
import { getSavedNorms, saveNorms, exportBackupJSON, importBackupJSON } from './utils/storage';
import { calculateDailyMetrics } from './utils/mdmCalculations';

export default function App() {
  const currentMonthKey = '2026-10'; // Default active month
  const [selectedMonth, setSelectedMonth] = useState<string>(currentMonthKey);
  const [activeTab, setActiveTab] = useState<TabType>('daily');

  // Auth User State
  const [currentUser, setCurrentUser] = useState<UserAccount | null>(getActiveSessionUser());
  const [norms, setNorms] = useState(getSavedNorms());

  // User-scoped data states
  const [profile, setProfile] = useState<SchoolProfile>(() => {
    const user = getActiveSessionUser();
    return user ? getUserScopedProfile(user.mobileNumber) : ({} as SchoolProfile);
  });

  const [entries, setEntries] = useState<DailyMDMEntry[]>(() => {
    const user = getActiveSessionUser();
    return user ? getUserScopedEntries(user.mobileNumber, selectedMonth, norms) : [];
  });

  const [stock, setStock] = useState<StockOpeningAndReceipts>(() => {
    const user = getActiveSessionUser();
    return user ? getUserScopedStock(user.mobileNumber, selectedMonth) : ({} as StockOpeningAndReceipts);
  });

  // Modals
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isBloggerModalOpen, setIsBloggerModalOpen] = useState(false);

  // Sync user data when currentUser or selectedMonth changes
  useEffect(() => {
    if (currentUser) {
      const p = getUserScopedProfile(currentUser.mobileNumber);
      const e = getUserScopedEntries(currentUser.mobileNumber, selectedMonth, norms);
      const s = getUserScopedStock(currentUser.mobileNumber, selectedMonth);
      setProfile(p);
      setEntries(e);
      setStock(s);
    }
  }, [currentUser, selectedMonth]);

  // If user is not logged in, show Auth / Registration screen
  if (!currentUser) {
    return (
      <AuthScreen
        onLoginSuccess={(user) => {
          setCurrentUser(user);
        }}
      />
    );
  }

  // Handlers
  const handleSaveEntry = (updatedEntry: DailyMDMEntry) => {
    const updatedEntries = entries.map((e) =>
      e.date === updatedEntry.date ? updatedEntry : e
    );
    setEntries(updatedEntries);
    saveUserScopedEntries(currentUser.mobileNumber, selectedMonth, updatedEntries);
  };

  const handleUpdateStock = (updatedStock: StockOpeningAndReceipts) => {
    setStock(updatedStock);
    saveUserScopedStock(currentUser.mobileNumber, selectedMonth, updatedStock);
  };

  const handleSaveProfile = (newProfile: SchoolProfile) => {
    setProfile(newProfile);
    saveUserScopedProfile(currentUser.mobileNumber, newProfile);
  };

  const handleSaveNorms = (newNorms: any) => {
    setNorms(newNorms);
    saveNorms(newNorms);
    // Recalculate entries with new norms
    const recomputed = entries.map((e) => {
      if (!e.isWorkingDay) return e;
      const metrics = calculateDailyMetrics(
        e.primaryAttendance,
        e.upperPrimaryAttendance,
        e.grainType,
        e.servedMilk,
        newNorms
      );
      return { ...e, ...metrics };
    });
    setEntries(recomputed);
    saveUserScopedEntries(currentUser.mobileNumber, selectedMonth, recomputed);
  };

  const handleLogout = () => {
    if (window.confirm('क्या आप अपने खाते से लॉगआउट करना चाहते हैं? आपका डेटा पूरी तरह सुरक्षित रहेगा।')) {
      logoutUser();
      setCurrentUser(null);
    }
  };

  const handleExportBackup = () => {
    exportBackupJSON(selectedMonth);
  };

  const handleImportBackup = (jsonStr: string) => {
    const ok = importBackupJSON(jsonStr);
    if (ok) {
      const p = getUserScopedProfile(currentUser.mobileNumber);
      const e = getUserScopedEntries(currentUser.mobileNumber, selectedMonth, norms);
      const s = getUserScopedStock(currentUser.mobileNumber, selectedMonth);
      setProfile(p);
      setEntries(e);
      setStock(s);
      alert('डेटा बैकअप सफलतापूर्वक रीस्टोर कर लिया गया है!');
    } else {
      alert('अमान्य बैकअप फाइल। कृपया सही JSON बैकअप चुनें।');
    }
  };

  const handleEditFromRegister = (dateStr: string) => {
    setActiveTab('daily');
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 font-sans">
      
      {/* Header */}
      <Header
        currentUser={currentUser}
        profile={profile}
        selectedMonth={selectedMonth}
        onMonthChange={setSelectedMonth}
        onOpenSettings={() => setIsSettingsOpen(true)}
        onOpenBloggerModal={() => setIsBloggerModalOpen(true)}
        onExportBackup={handleExportBackup}
        onImportBackup={handleImportBackup}
        onLogout={handleLogout}
      />

      {/* Navigation Tabs */}
      <Navigation activeTab={activeTab} onTabChange={setActiveTab} />

      {/* Main Tab Views */}
      <main className="flex-1 pb-16">
        {activeTab === 'daily' && (
          <DailyEntryView
            entries={entries}
            profile={profile}
            norms={norms}
            selectedMonth={selectedMonth}
            onSaveEntry={handleSaveEntry}
          />
        )}

        {activeTab === 'register' && (
          <DailyRegisterView
            entries={entries}
            profile={profile}
            selectedMonth={selectedMonth}
            onEditEntry={handleEditFromRegister}
          />
        )}

        {activeTab === 'balgopal' && (
          <BalGopalView
            entries={entries}
            profile={profile}
            stock={stock}
            norms={norms}
            selectedMonth={selectedMonth}
            onUpdateStock={handleUpdateStock}
          />
        )}

        {activeTab === 'mpr' && (
          <MprReportView
            entries={entries}
            profile={profile}
            stock={stock}
            norms={norms}
            selectedMonth={selectedMonth}
            onUpdateStock={handleUpdateStock}
          />
        )}

        {activeTab === 'uc' && (
          <UcReportView
            entries={entries}
            profile={profile}
            stock={stock}
            norms={norms}
            selectedMonth={selectedMonth}
          />
        )}

        {activeTab === 'cashbook' && (
          <CashbookView
            entries={entries}
            profile={profile}
            stock={stock}
            norms={norms}
            selectedMonth={selectedMonth}
          />
        )}

        {activeTab === 'benchmark' && (
          <ComparativeAnalysisView
            entries={entries}
            profile={profile}
            stock={stock}
            norms={norms}
            selectedMonth={selectedMonth}
          />
        )}
      </main>

      {/* Bottom Sticky Footer */}
      <footer className="no-print bg-white border-t border-slate-200 py-3 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <p>
            🔒 खाता: {currentUser.mobileNumber} ({currentUser.teacherName}) • शैक्षणिक सत्र 2026-27 के लिए डेटा सुरक्षित
          </p>
          <div className="flex items-center gap-3 font-semibold text-emerald-800">
            <button onClick={() => setIsBloggerModalOpen(true)} className="hover:underline">
              ब्लॉगर एम्बेड कोड
            </button>
            <span>•</span>
            <button onClick={() => setActiveTab('benchmark')} className="hover:underline">
              विभागीय मानक (100% शुद्धता)
            </button>
            <span>•</span>
            <button onClick={() => window.print()} className="hover:underline">
              प्रिंट A4
            </button>
          </div>
        </div>
      </footer>

      {/* Modals */}
      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        profile={profile}
        norms={norms}
        onSaveProfile={handleSaveProfile}
        onSaveNorms={handleSaveNorms}
      />

      <BloggerEmbedModal
        isOpen={isBloggerModalOpen}
        onClose={() => setIsBloggerModalOpen(false)}
      />

    </div>
  );
}
