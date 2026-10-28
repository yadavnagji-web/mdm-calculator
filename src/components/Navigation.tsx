import React from 'react';
import { 
  CalendarDays, 
  TableProperties, 
  Milk, 
  FileSpreadsheet, 
  Award, 
  ReceiptText, 
  Scale 
} from 'lucide-react';

export type TabType = 'daily' | 'register' | 'balgopal' | 'mpr' | 'uc' | 'cashbook' | 'benchmark';

interface NavigationProps {
  activeTab: TabType;
  onTabChange: (tab: TabType) => void;
}

export const Navigation: React.FC<NavigationProps> = ({ activeTab, onTabChange }) => {
  const tabs: { id: TabType; label: string; icon: React.ReactNode; badge?: string }[] = [
    { id: 'daily', label: 'दैनिक उपस्थिति व SMS', icon: <CalendarDays className="w-4 h-4" /> },
    { id: 'register', label: 'मासिक पंजी (Register)', icon: <TableProperties className="w-4 h-4" /> },
    { id: 'balgopal', label: 'बाल गोपाल दूध योजना', icon: <Milk className="w-4 h-4" /> },
    { id: 'mpr', label: 'मासिक प्रतिवेदन (MPR)', icon: <FileSpreadsheet className="w-4 h-4" />, badge: 'A4 Print' },
    { id: 'uc', label: 'उपयोगिता प्रमाण पत्र (UC)', icon: <Award className="w-4 h-4" /> },
    { id: 'cashbook', label: 'रोकड़ बही व वाउचर', icon: <ReceiptText className="w-4 h-4" /> },
    { id: 'benchmark', label: 'विभागीय मानक सत्यापन', icon: <Scale className="w-4 h-4" />, badge: '100% शुद्ध' },
  ];

  return (
    <nav className="no-print bg-white border-b border-slate-200 sticky top-[73px] z-30 shadow-sm overflow-x-auto scrollbar-none">
      <div className="max-w-7xl mx-auto px-4 flex space-x-1 sm:space-x-2 py-2">
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className={`flex items-center gap-1.5 px-3 py-2 text-xs sm:text-sm font-semibold rounded-lg whitespace-nowrap transition-all duration-150 ${
                isActive
                  ? 'bg-emerald-700 text-white shadow-md'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <span className={isActive ? 'text-amber-300' : 'text-slate-500'}>
                {tab.icon}
              </span>
              <span>{tab.label}</span>
              {tab.badge && (
                <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-bold uppercase tracking-wider ${
                  isActive ? 'bg-amber-400 text-emerald-950' : 'bg-emerald-100 text-emerald-800'
                }`}>
                  {tab.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>
    </nav>
  );
};
