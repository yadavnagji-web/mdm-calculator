import React, { useState, useRef } from 'react';
import { DailyMDMEntry, SchoolProfile, MDMNorms } from '../types';
import { formatKg, formatInr, aggregateMonthlyEntries, calculateDailyMetrics } from '../utils/mdmCalculations';
import { 
  Printer, 
  Calendar, 
  Download, 
  Upload, 
  CheckCircle2, 
  Sparkles, 
  FileSpreadsheet, 
  RotateCcw,
  Zap,
  ArrowDown,
  Info
} from 'lucide-react';

interface DailyRegisterViewProps {
  entries: DailyMDMEntry[];
  profile: SchoolProfile;
  norms: MDMNorms;
  selectedMonth: string;
  onEditEntry: (date: string) => void;
  onUpdateEntry: (entry: DailyMDMEntry) => void;
  onUpdateAllEntries: (entries: DailyMDMEntry[]) => void;
}

export const DailyRegisterView: React.FC<DailyRegisterViewProps> = ({
  entries,
  profile,
  norms,
  selectedMonth,
  onEditEntry,
  onUpdateEntry,
  onUpdateAllEntries,
}) => {
  const [filter, setFilter] = useState<'all' | 'working' | 'holidays'>('all');
  const [uploadMessage, setUploadMessage] = useState<string | null>(null);
  const [quickPrimary, setQuickPrimary] = useState<string>('');
  const [quickUpper, setQuickUpper] = useState<string>('');
  const [showQuickFill, setShowQuickFill] = useState<boolean>(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const filteredEntries = entries.filter((e) => {
    if (filter === 'working') return e.isWorkingDay;
    if (filter === 'holidays') return !e.isWorkingDay;
    return true;
  });

  const totals = aggregateMonthlyEntries(entries);

  const monthDate = new Date(`${selectedMonth}-01`);
  const monthName = monthDate.toLocaleDateString('hi-IN', {
    month: 'long',
    year: 'numeric',
  });

  // Direct Inline Cell Change
  const handleCellChange = (
    index: number,
    field: 'primary' | 'upperPrimary',
    valStr: string
  ) => {
    const entry = entries[index];
    if (!entry) return;

    const val = Math.max(0, parseInt(valStr, 10) || 0);
    const newPrimary = field === 'primary' ? val : entry.primaryAttendance;
    const newUpperPrimary = field === 'upperPrimary' ? val : entry.upperPrimaryAttendance;

    const metrics = calculateDailyMetrics(
      newPrimary,
      newUpperPrimary,
      entry.grainType,
      entry.servedMilk,
      norms
    );

    const updated: DailyMDMEntry = {
      ...entry,
      primaryAttendance: newPrimary,
      upperPrimaryAttendance: newUpperPrimary,
      ...metrics,
    };

    onUpdateEntry(updated);
  };

  // Excel Keyboard Navigation (Arrow keys, Enter, Tab)
  const handleKeyDown = (
    e: React.KeyboardEvent<HTMLInputElement>,
    index: number,
    field: 'primary' | 'upperPrimary'
  ) => {
    if (e.key === 'ArrowDown' || e.key === 'Enter') {
      e.preventDefault();
      const nextId = `cell-${field}-${index + 1}`;
      const nextElem = document.getElementById(nextId) as HTMLInputElement | null;
      if (nextElem) {
        nextElem.focus();
        nextElem.select();
      }
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      const prevId = `cell-${field}-${index - 1}`;
      const prevElem = document.getElementById(prevId) as HTMLInputElement | null;
      if (prevElem) {
        prevElem.focus();
        prevElem.select();
      }
    } else if (e.key === 'ArrowRight' && field === 'primary') {
      const nextElem = document.getElementById(`cell-upperPrimary-${index}`) as HTMLInputElement | null;
      if (nextElem) {
        nextElem.focus();
        nextElem.select();
      }
    } else if (e.key === 'ArrowLeft' && field === 'upperPrimary') {
      const prevElem = document.getElementById(`cell-primary-${index}`) as HTMLInputElement | null;
      if (prevElem) {
        prevElem.focus();
        prevElem.select();
      }
    }
  };

  // Multi-cell Paste Support (Ctrl+V column from Excel)
  const handlePaste = (
    e: React.ClipboardEvent<HTMLInputElement>,
    startIndex: number,
    field: 'primary' | 'upperPrimary'
  ) => {
    const pasteData = e.clipboardData.getData('text');
    if (!pasteData) return;

    // Check if multi-line data is pasted
    const lines = pasteData.split(/\r?\n/).map((l) => l.trim()).filter((l) => l.length > 0);
    if (lines.length > 1) {
      e.preventDefault();
      const updatedEntries = [...entries];

      lines.forEach((line, offset) => {
        const targetIdx = startIndex + offset;
        if (targetIdx < updatedEntries.length) {
          const entry = updatedEntries[targetIdx];
          if (entry.isWorkingDay) {
            // Check for tab-separated (e.g. copied both columns from Excel)
            const parts = line.split('\t');
            let pVal = entry.primaryAttendance;
            let upVal = entry.upperPrimaryAttendance;

            if (parts.length >= 2) {
              pVal = Math.max(0, parseInt(parts[0], 10) || 0);
              upVal = Math.max(0, parseInt(parts[1], 10) || 0);
            } else {
              const num = Math.max(0, parseInt(line, 10) || 0);
              if (field === 'primary') pVal = num;
              else upVal = num;
            }

            const metrics = calculateDailyMetrics(
              pVal,
              upVal,
              entry.grainType,
              entry.servedMilk,
              norms
            );

            updatedEntries[targetIdx] = {
              ...entry,
              primaryAttendance: pVal,
              upperPrimaryAttendance: upVal,
              ...metrics,
            };
          }
        }
      });

      onUpdateAllEntries(updatedEntries);
      setUploadMessage(`✓ एक्सेल से ${lines.length} दिवसों की उपस्थिति सफलतापूर्वक पेस्ट हो गई!`);
      setTimeout(() => setUploadMessage(null), 4000);
    }
  };

  // Quick Fill Average Attendance for all working days
  const handleApplyQuickFill = () => {
    const p = Math.max(0, parseInt(quickPrimary, 10) || 0);
    const up = Math.max(0, parseInt(quickUpper, 10) || 0);

    if (p === 0 && up === 0) {
      alert('कृपया प्राथमिक या उच्च प्राथमिक की कोई संख्या दर्ज करें।');
      return;
    }

    const updated = entries.map((e) => {
      if (!e.isWorkingDay) return e;
      const metrics = calculateDailyMetrics(p, up, e.grainType, e.servedMilk, norms);
      return {
        ...e,
        primaryAttendance: p,
        upperPrimaryAttendance: up,
        ...metrics,
      };
    });

    onUpdateAllEntries(updated);
    setShowQuickFill(false);
    setUploadMessage(`✓ सभी ${totals.workingDays} कार्यदिवसों में औसत उपस्थिति भर दी गई है!`);
    setTimeout(() => setUploadMessage(null), 5000);
  };

  // Clear / Reset All Entries for this month
  const handleResetMonth = () => {
    if (window.confirm('क्या आप इस माह की सभी दैनिक उपस्थिति को खाली (0) करना चाहते हैं?')) {
      const cleared = entries.map((e) => {
        const metrics = calculateDailyMetrics(0, 0, e.grainType, false, norms);
        return {
          ...e,
          primaryAttendance: 0,
          upperPrimaryAttendance: 0,
          ...metrics,
        };
      });
      onUpdateAllEntries(cleared);
    }
  };

  // Working Day / Holiday Toggle
  const handleToggleDayStatus = (index: number) => {
    const entry = entries[index];
    if (!entry) return;

    const newIsWorking = !entry.isWorkingDay;
    const newP = newIsWorking ? (entry.primaryAttendance || profile.primaryEnrolled || 40) : 0;
    const newUp = newIsWorking ? (entry.upperPrimaryAttendance || profile.upperPrimaryEnrolled || 30) : 0;

    const metrics = calculateDailyMetrics(
      newP,
      newUp,
      entry.grainType,
      newIsWorking,
      norms
    );

    const updated: DailyMDMEntry = {
      ...entry,
      isWorkingDay: newIsWorking,
      holidayReason: newIsWorking ? undefined : (entry.holidayReason || 'अवकाश'),
      primaryAttendance: newP,
      upperPrimaryAttendance: newUp,
      ...metrics,
    };

    onUpdateEntry(updated);
  };

  // Grain Change
  const handleGrainChange = (index: number, grain: 'wheat' | 'rice' | 'mixed') => {
    const entry = entries[index];
    if (!entry) return;

    const metrics = calculateDailyMetrics(
      entry.primaryAttendance,
      entry.upperPrimaryAttendance,
      grain,
      entry.servedMilk,
      norms
    );

    onUpdateEntry({
      ...entry,
      grainType: grain,
      ...metrics,
    });
  };

  // Milk Served Toggle
  const handleMilkToggle = (index: number) => {
    const entry = entries[index];
    if (!entry) return;

    const newMilk = !entry.servedMilk;
    const metrics = calculateDailyMetrics(
      entry.primaryAttendance,
      entry.upperPrimaryAttendance,
      entry.grainType,
      newMilk,
      norms
    );

    onUpdateEntry({
      ...entry,
      servedMilk: newMilk,
      ...metrics,
    });
  };

  // 1. Download Excel/CSV Template
  const handleDownloadExcel = () => {
    const header = [
      'दिनांक',
      'वार',
      'कार्यदिवस(1=हाँ/0=अवकाश)',
      'कक्षा_1_से_5_उपस्थिति',
      'कक्षा_6_से_8_उपस्थिति',
      'अनाज(wheat/rice/mixed)',
      'दूध_वितरण(1=हाँ/0=नहीं)',
      'अवकाश_विवरण'
    ].join(',');

    const rows = entries.map((e) => {
      const d = new Date(e.date);
      const dayName = d.toLocaleDateString('hi-IN', { weekday: 'short' });
      return [
        e.date,
        dayName,
        e.isWorkingDay ? '1' : '0',
        e.isWorkingDay ? e.primaryAttendance : '0',
        e.isWorkingDay ? e.upperPrimaryAttendance : '0',
        e.grainType || 'wheat',
        e.servedMilk ? '1' : '0',
        `"${(e.holidayReason || '').replace(/"/g, '""')}"`
      ].join(',');
    });

    const csvContent = '\uFEFF' + [header, ...rows].join('\r\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `MDM_Attendance_${selectedMonth}_${profile.schoolName || 'School'}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  // 2. Upload Filled Excel/CSV Sheet
  const handleUploadExcel = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const text = event.target?.result as string;
        if (!text) throw new Error('फाइल खाली है');

        const lines = text.split(/\r?\n/).filter((l) => l.trim().length > 0);
        if (lines.length < 2) throw new Error('फाइल में पर्याप्त डेटा नहीं है');

        const parsedMap: Record<string, {
          isWorking: boolean;
          primary: number;
          upperPrimary: number;
          grain: 'wheat' | 'rice' | 'mixed';
          servedMilk: boolean;
          reason?: string;
        }> = {};

        for (let i = 1; i < lines.length; i++) {
          const line = lines[i].trim();
          if (!line) continue;

          const cols: string[] = [];
          let current = '';
          let inQuotes = false;
          for (let c = 0; c < line.length; c++) {
            const ch = line[c];
            if (ch === '"') inQuotes = !inQuotes;
            else if (ch === ',' && !inQuotes) {
              cols.push(current.trim());
              current = '';
            } else current += ch;
          }
          cols.push(current.trim());

          if (cols.length >= 3) {
            let dateStr = cols[0].replace(/^["']|["']$/g, '').trim();
            if (dateStr.includes('/') || (dateStr.includes('-') && dateStr.split('-')[0].length === 2)) {
              const parts = dateStr.includes('/') ? dateStr.split('/') : dateStr.split('-');
              if (parts.length === 3 && parts[2].length === 4) {
                dateStr = `${parts[2]}-${parts[1].padStart(2, '0')}-${parts[0].padStart(2, '0')}`;
              }
            }

            const isWorking = cols[2].replace(/^["']|["']$/g, '').trim() === '1';
            const primary = Math.max(0, parseInt(cols[3] || '0', 10) || 0);
            const upperPrimary = Math.max(0, parseInt(cols[4] || '0', 10) || 0);

            let grain: 'wheat' | 'rice' | 'mixed' = 'wheat';
            const rawGrain = (cols[5] || '').toLowerCase();
            if (rawGrain.includes('rice') || rawGrain.includes('चावल')) grain = 'rice';
            else if (rawGrain.includes('mix') || rawGrain.includes('खिचड़ी')) grain = 'mixed';

            const servedMilk = (cols[6] || '').trim() === '1' || (cols[6] || '').toLowerCase() === 'true';
            const reason = cols[7] ? cols[7].replace(/^["']|["']$/g, '').trim() : undefined;

            parsedMap[dateStr] = {
              isWorking,
              primary,
              upperPrimary,
              grain,
              servedMilk,
              reason,
            };
          }
        }

        let count = 0;
        const newEntries = entries.map((entry) => {
          const match = parsedMap[entry.date];
          if (!match) return entry;

          count++;
          const metrics = calculateDailyMetrics(
            match.isWorking ? match.primary : 0,
            match.isWorking ? match.upperPrimary : 0,
            match.grain,
            match.isWorking ? match.servedMilk : false,
            norms
          );

          return {
            ...entry,
            isWorkingDay: match.isWorking,
            holidayReason: match.isWorking ? undefined : (match.reason || entry.holidayReason || 'अवकाश'),
            primaryAttendance: match.isWorking ? match.primary : 0,
            upperPrimaryAttendance: match.isWorking ? match.upperPrimary : 0,
            grainType: match.grain,
            servedMilk: match.isWorking ? match.servedMilk : false,
            ...metrics,
          };
        });

        onUpdateAllEntries(newEntries);
        setUploadMessage(`✓ एक्सेल शीट से ${count} दिवसों का रिकॉर्ड सफलतापूर्वक अपलोड और परिकलित हो गया!`);
        setTimeout(() => setUploadMessage(null), 5000);
      } catch (err: any) {
        alert('एक्सेल शीट पढ़ने में त्रुटि: ' + (err.message || 'अमान्य प्रारूप'));
      }
    };
    reader.readAsText(file);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  return (
    <div className="max-w-[1400px] mx-auto px-2 sm:px-4 py-4 space-y-4">
      
      {/* Excel Ribbon & Control Bar */}
      <div className="no-print bg-white rounded-2xl border-2 border-emerald-600/30 p-3 sm:p-4 shadow-sm space-y-3">
        
        <div className="flex flex-col xl:flex-row items-start xl:items-center justify-between gap-3">
          
          {/* Title & Month */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-700 text-white flex items-center justify-center font-black shadow shrink-0">
              <FileSpreadsheet className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-black text-slate-900 tracking-tight">
                  MDM व बाल गोपाल मासिक एक्सेल स्प्रेडशीट
                </h2>
                <span className="bg-emerald-100 text-emerald-800 text-[11px] px-2 py-0.5 rounded-full font-bold border border-emerald-300">
                  {monthName}
                </span>
              </div>
              <p className="text-xs text-slate-500">
                सीधे तारीख-वार कक्षा 1-5 व 6-8 की उपस्थिति दर्ज करें; खाद्यान्न, कुकिंग राशि व दूध स्वतः परिकलित होंगे।
              </p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap items-center gap-2 w-full xl:w-auto justify-start xl:justify-end">
            
            {/* Quick Fill Button */}
            <button
              onClick={() => setShowQuickFill(!showQuickFill)}
              className="bg-amber-500 hover:bg-amber-400 text-emerald-950 text-xs font-bold px-3 py-2 rounded-xl flex items-center gap-1.5 shadow transition-all"
              title="पूरे महीने में एक साथ औसत उपस्थिति भरें"
            >
              <Zap className="w-3.5 h-3.5 fill-current" />
              <span>त्वरित औसत भराव</span>
            </button>

            {/* Download Excel */}
            <button
              onClick={handleDownloadExcel}
              className="bg-emerald-700 hover:bg-emerald-600 text-white text-xs font-bold px-3 py-2 rounded-xl flex items-center gap-1.5 shadow transition-all"
              title="एक्सेल शीट डाउनलोड करें"
            >
              <Download className="w-3.5 h-3.5 text-emerald-200" />
              <span>📥 एक्सेल डाउनलोड</span>
            </button>

            {/* Upload Excel */}
            <button
              onClick={() => fileInputRef.current?.click()}
              className="bg-teal-700 hover:bg-teal-600 text-white text-xs font-bold px-3 py-2 rounded-xl flex items-center gap-1.5 shadow transition-all"
              title="भरी हुई एक्सेल शीट अपलोड करें"
            >
              <Upload className="w-3.5 h-3.5 text-amber-300" />
              <span>📤 एक्सेल अपलोड</span>
            </button>
            <input
              type="file"
              ref={fileInputRef}
              accept=".csv, .txt"
              onChange={handleUploadExcel}
              className="hidden"
            />

            {/* Print A4 */}
            <button
              onClick={() => window.print()}
              className="bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold px-3 py-2 rounded-xl flex items-center gap-1.5 shadow transition-all"
            >
              <Printer className="w-3.5 h-3.5 text-amber-300" />
              <span>🖨️ A4 प्रिंट</span>
            </button>

            {/* Reset */}
            <button
              onClick={handleResetMonth}
              className="bg-rose-100 hover:bg-rose-200 text-rose-800 text-xs font-bold p-2 rounded-xl transition-all"
              title="इस माह की उपस्थिति रीसेट करें"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>

          </div>

        </div>

        {/* Quick Fill Drawer */}
        {showQuickFill && (
          <div className="bg-amber-50 border border-amber-300 rounded-xl p-3 flex flex-wrap items-center justify-between gap-3 animate-in slide-in-from-top-2">
            <div className="flex flex-wrap items-center gap-3">
              <span className="text-xs font-bold text-amber-950 flex items-center gap-1">
                <Zap className="w-4 h-4 text-amber-600 fill-current" />
                <span>पूरे माह के सभी शिक्षण दिवसों में औसत उपस्थिति भरें:</span>
              </span>

              <div className="flex items-center gap-1.5">
                <span className="text-xs text-amber-900 font-semibold">प्राथ. (1-5):</span>
                <input
                  type="number"
                  min="0"
                  value={quickPrimary}
                  onChange={(e) => setQuickPrimary(e.target.value)}
                  placeholder="उदा. 45"
                  className="w-20 bg-white border border-amber-300 rounded px-2 py-1 text-xs font-bold text-slate-900 text-center focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
              </div>

              <div className="flex items-center gap-1.5">
                <span className="text-xs text-amber-900 font-semibold">उच्च (6-8):</span>
                <input
                  type="number"
                  min="0"
                  value={quickUpper}
                  onChange={(e) => setQuickUpper(e.target.value)}
                  placeholder="उदा. 38"
                  className="w-20 bg-white border border-amber-300 rounded px-2 py-1 text-xs font-bold text-slate-900 text-center focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
              </div>

              <button
                onClick={handleApplyQuickFill}
                className="bg-emerald-800 hover:bg-emerald-700 text-white text-xs font-bold px-3 py-1.5 rounded-lg shadow"
              >
                ✓ लागू करें
              </button>
            </div>

            <button
              onClick={() => setShowQuickFill(false)}
              className="text-xs font-bold text-amber-800 hover:text-amber-950"
            >
              बंद करें ✕
            </button>
          </div>
        )}

        {/* Upload Success Alert */}
        {uploadMessage && (
          <div className="bg-emerald-50 border-2 border-emerald-500 rounded-xl p-2.5 flex items-center gap-2 text-emerald-950 font-bold text-xs animate-in fade-in">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{uploadMessage}</span>
          </div>
        )}

        {/* Tip Banner */}
        <div className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 flex items-center justify-between text-xs text-slate-600 flex-wrap gap-2">
          <div className="flex items-center gap-2">
            <span className="bg-emerald-600 text-white text-[10px] px-1.5 py-0.5 rounded font-black uppercase">
              Excel टिप्स
            </span>
            <span>
              संख्या लिखकर <strong>Enter (↓)</strong> दबाने से अगली तारीख पर पहुंचेंगे; <strong>Tab (→)</strong> से उच्च प्राथमिक कॉलम में जाएंगे।
            </span>
          </div>

          <div className="flex items-center gap-1 font-bold text-[11px]">
            <span className="text-slate-500">कुल दिवस:</span>
            <span className="text-slate-900">{entries.length}</span>
            <span className="text-slate-400">|</span>
            <span className="text-emerald-700">शिक्षण: {totals.workingDays}</span>
            <span className="text-slate-400">|</span>
            <span className="text-rose-700">अवकाश: {entries.length - totals.workingDays}</span>
          </div>
        </div>

      </div>

      {/* Real Excel Grid Sheet */}
      <div className="print-container bg-white rounded-2xl border border-slate-300 shadow-sm overflow-hidden">
        
        {/* Printable Official Header */}
        <div className="print-only text-center p-4 border-b-2 border-slate-900 space-y-1">
          <h3 className="text-lg font-black uppercase text-slate-900">
            कार्यालय संस्था प्रधान — {profile.schoolName || 'राजकीय उच्च प्राथमिक विद्यालय'}
          </h3>
          <p className="text-xs text-slate-700 font-bold">
            ब्लॉक: {profile.block || '------'} | जिला: {profile.district || '------'} | U-DISE कोड: {profile.udiseCode || '------'}
          </p>
          <div className="inline-block bg-slate-100 border border-slate-400 px-3 py-1 rounded text-xs font-black text-slate-900">
            दैनिक पोषाहार एवं बाल गोपाल दूध वितरण मासिक पंजी — माह: {monthName}
          </div>
        </div>

        {/* Excel Spreadsheet Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            
            {/* Excel Header Row */}
            <thead>
              <tr className="bg-emerald-800 text-white font-extrabold text-center border-b border-emerald-950 text-[11.5px]">
                <th className="p-2 border border-emerald-700 w-10">#</th>
                <th className="p-2 border border-emerald-700 w-16">दिनांक</th>
                <th className="p-2 border border-emerald-700 w-14">वार</th>
                <th className="p-2 border border-emerald-700 w-20">दिवस प्रकार</th>
                <th className="p-2 border border-emerald-700 w-24 bg-emerald-900 text-amber-300 font-black">
                  ✏️ प्राथ. (1-5)
                </th>
                <th className="p-2 border border-emerald-700 w-24 bg-emerald-900 text-amber-300 font-black">
                  ✏️ उच्च (6-8)
                </th>
                <th className="p-2 border border-emerald-700 w-16 bg-emerald-950 font-black">कुल छात्र</th>
                <th className="p-2 border border-emerald-700 w-20">अनाज</th>
                <th className="p-2 border border-emerald-700 w-20 text-right">गेहूँ (kg)</th>
                <th className="p-2 border border-emerald-700 w-20 text-right">चावल (kg)</th>
                <th className="p-2 border border-emerald-700 w-24 text-right bg-emerald-950 text-amber-300 font-black">
                  कुकिंग व्यय (₹)
                </th>
                <th className="p-2 border border-emerald-700 w-14 text-center">दूध</th>
                <th className="p-2 border border-emerald-700 w-20 text-right">पाउडर (kg)</th>
                <th className="p-2 border border-emerald-700 w-16 text-right">चीनी (g)</th>
                <th className="p-2 border border-emerald-700 w-20 text-right font-black">दूध (L)</th>
              </tr>
            </thead>

            {/* Excel Data Rows */}
            <tbody className="divide-y divide-slate-200">
              {entries.map((entry, idx) => {
                const dObj = new Date(entry.date);
                const dayNum = dObj.getDate();
                const dayName = dObj.toLocaleDateString('hi-IN', { weekday: 'short' });
                const isSunday = dObj.getDay() === 0;

                return (
                  <tr
                    key={entry.date}
                    className={`transition-colors ${
                      !entry.isWorkingDay
                        ? 'bg-rose-50/70 text-rose-950'
                        : isSunday
                        ? 'bg-amber-50/50'
                        : idx % 2 === 0
                        ? 'bg-white hover:bg-emerald-50/40'
                        : 'bg-slate-50/60 hover:bg-emerald-50/40'
                    }`}
                  >
                    {/* Index */}
                    <td className="p-1.5 border border-slate-300 text-center font-bold text-slate-500 font-mono text-[11px]">
                      {idx + 1}
                    </td>

                    {/* Date */}
                    <td className="p-1.5 border border-slate-300 text-center font-black text-slate-900 font-mono">
                      {String(dayNum).padStart(2, '0')}/{String(dObj.getMonth() + 1).padStart(2, '0')}
                    </td>

                    {/* Weekday */}
                    <td className={`p-1.5 border border-slate-300 text-center font-bold text-[11px] ${
                      isSunday ? 'text-rose-700' : 'text-slate-700'
                    }`}>
                      {dayName}
                    </td>

                    {/* Working Day Toggle */}
                    <td className="p-1 border border-slate-300 text-center">
                      <button
                        onClick={() => handleToggleDayStatus(idx)}
                        className={`no-print text-[10px] font-black px-2 py-0.5 rounded transition-all shadow-xs ${
                          entry.isWorkingDay
                            ? 'bg-emerald-100 text-emerald-900 hover:bg-emerald-200 border border-emerald-300'
                            : 'bg-rose-100 text-rose-900 hover:bg-rose-200 border border-rose-300'
                        }`}
                        title="कार्यदिवस या अवकाश टॉगल करें"
                      >
                        {entry.isWorkingDay ? '🟢 शिक्षण' : '🔴 अवकाश'}
                      </button>
                      <span className="print-only text-[10px] font-bold">
                        {entry.isWorkingDay ? 'शिक्षण' : 'अवकाश'}
                      </span>
                    </td>

                    {/* IF HOLIDAY */}
                    {!entry.isWorkingDay ? (
                      <td colSpan={11} className="p-1.5 border border-slate-300 text-center">
                        <div className="flex items-center justify-center gap-2">
                          <span className="text-rose-800 font-bold italic text-xs">
                            — अवकाश: {entry.holidayReason || 'साप्ताहिक अवकाश'} —
                          </span>
                        </div>
                      </td>
                    ) : (
                      <>
                        {/* CLASS 1-5 PRIMARY ATTENDANCE - EXCEL CELL */}
                        <td className="p-0.5 border border-slate-300 bg-emerald-50/40">
                          <input
                            type="number"
                            id={`cell-primary-${idx}`}
                            min="0"
                            value={entry.primaryAttendance === 0 ? '' : entry.primaryAttendance}
                            placeholder="0"
                            onFocus={(e) => e.target.select()}
                            onChange={(e) => handleCellChange(idx, 'primary', e.target.value)}
                            onKeyDown={(e) => handleKeyDown(e, idx, 'primary')}
                            onPaste={(e) => handlePaste(e, idx, 'primary')}
                            className="no-print w-full text-center font-black text-slate-900 bg-white border border-emerald-400 rounded px-1 py-1 text-xs focus:ring-2 focus:ring-emerald-600 focus:outline-none shadow-xs font-mono"
                          />
                          <span className="print-only font-bold text-center block font-mono">
                            {entry.primaryAttendance}
                          </span>
                        </td>

                        {/* CLASS 6-8 UPPER PRIMARY ATTENDANCE - EXCEL CELL */}
                        <td className="p-0.5 border border-slate-300 bg-emerald-50/40">
                          <input
                            type="number"
                            id={`cell-upperPrimary-${idx}`}
                            min="0"
                            value={entry.upperPrimaryAttendance === 0 ? '' : entry.upperPrimaryAttendance}
                            placeholder="0"
                            onFocus={(e) => e.target.select()}
                            onChange={(e) => handleCellChange(idx, 'upperPrimary', e.target.value)}
                            onKeyDown={(e) => handleKeyDown(e, idx, 'upperPrimary')}
                            onPaste={(e) => handlePaste(e, idx, 'upperPrimary')}
                            className="no-print w-full text-center font-black text-slate-900 bg-white border border-emerald-400 rounded px-1 py-1 text-xs focus:ring-2 focus:ring-emerald-600 focus:outline-none shadow-xs font-mono"
                          />
                          <span className="print-only font-bold text-center block font-mono">
                            {entry.upperPrimaryAttendance}
                          </span>
                        </td>

                        {/* TOTAL BENEFITED (FORMULA) */}
                        <td className="p-1.5 border border-slate-300 text-center font-black text-emerald-950 bg-emerald-100/40 font-mono text-xs">
                          {entry.totalStudents}
                        </td>

                        {/* GRAIN TYPE SELECTOR */}
                        <td className="p-1 border border-slate-300 text-center">
                          <select
                            value={entry.grainType}
                            onChange={(e) => handleGrainChange(idx, e.target.value as any)}
                            className="no-print w-full bg-white border border-slate-300 rounded p-0.5 text-[10.5px] font-bold focus:ring-1 focus:ring-emerald-500 focus:outline-none"
                          >
                            <option value="wheat">गेहूँ</option>
                            <option value="rice">चावल</option>
                            <option value="mixed">मिश्रित</option>
                          </select>
                          <span className="print-only text-[10px]">
                            {entry.grainType === 'wheat' ? 'गेहूँ' : entry.grainType === 'rice' ? 'चावल' : 'खिचड़ी'}
                          </span>
                        </td>

                        {/* WHEAT KG */}
                        <td className="p-1.5 border border-slate-300 text-right font-mono font-medium text-[11px]">
                          {entry.wheatGrams > 0 ? formatKg(entry.wheatGrams) : '-'}
                        </td>

                        {/* RICE KG */}
                        <td className="p-1.5 border border-slate-300 text-right font-mono font-medium text-[11px]">
                          {entry.riceGrams > 0 ? formatKg(entry.riceGrams) : '-'}
                        </td>

                        {/* COOKING COST ₹ */}
                        <td className="p-1.5 border border-slate-300 text-right font-mono font-black text-emerald-950 text-xs bg-emerald-50/30">
                          {formatInr(entry.cookingCost)}
                        </td>

                        {/* MILK SERVED TOGGLE */}
                        <td className="p-1 border border-slate-300 text-center">
                          <button
                            onClick={() => handleMilkToggle(idx)}
                            className={`no-print text-[10px] font-bold px-1.5 py-0.5 rounded ${
                              entry.servedMilk ? 'bg-sky-100 text-sky-800' : 'bg-slate-100 text-slate-500'
                            }`}
                          >
                            {entry.servedMilk ? '🥛 हाँ' : 'नहीं'}
                          </button>
                          <span className="print-only text-[10px]">
                            {entry.servedMilk ? 'हाँ' : '-'}
                          </span>
                        </td>

                        {/* MILK POWDER KG */}
                        <td className="p-1.5 border border-slate-300 text-right font-mono text-sky-950 text-[11px]">
                          {entry.servedMilk ? formatKg(entry.milkPowderGrams) : '-'}
                        </td>

                        {/* SUGAR G */}
                        <td className="p-1.5 border border-slate-300 text-right font-mono text-sky-950 text-[11px]">
                          {entry.servedMilk ? Math.round(entry.sugarGrams) : '-'}
                        </td>

                        {/* PREPARED MILK LITERS */}
                        <td className="p-1.5 border border-slate-300 text-right font-mono text-sky-950 font-black text-xs">
                          {entry.servedMilk ? (entry.preparedMilkMl / 1000).toFixed(1) : '-'}
                        </td>
                      </>
                    )}
                  </tr>
                );
              })}
            </tbody>

            {/* Excel Grand Totals Row */}
            <tfoot className="bg-slate-900 text-white font-black border-t-2 border-slate-950 text-xs">
              <tr>
                <td colSpan={4} className="p-2.5 border border-slate-800 text-center bg-slate-950 text-amber-300 font-black">
                  मासिक कुल योग (शिक्षण दिवस: {totals.workingDays})
                </td>
                
                {/* Total Primary */}
                <td className="p-2 border border-slate-800 text-center font-mono font-black text-amber-300 text-sm bg-emerald-950">
                  {totals.totalPrimaryBenefited}
                </td>

                {/* Total Upper Primary */}
                <td className="p-2 border border-slate-800 text-center font-mono font-black text-amber-300 text-sm bg-emerald-950">
                  {totals.totalUpperPrimaryBenefited}
                </td>

                {/* Total Benefited Students */}
                <td className="p-2 border border-slate-800 text-center font-mono font-black text-emerald-300 text-sm bg-black">
                  {totals.totalStudentsBenefited}
                </td>

                {/* Menu space */}
                <td className="p-2 border border-slate-800 text-center text-slate-400 text-[10px]">
                  योग
                </td>

                {/* Total Wheat */}
                <td className="p-2 border border-slate-800 text-right font-mono font-bold text-slate-200">
                  {formatKg(totals.totalWheatGrams)}
                </td>

                {/* Total Rice */}
                <td className="p-2 border border-slate-800 text-right font-mono font-bold text-slate-200">
                  {formatKg(totals.totalRiceGrams)}
                </td>

                {/* Total Cooking Cost */}
                <td className="p-2 border border-slate-800 text-right font-mono font-black text-amber-300 text-sm bg-emerald-950">
                  {formatInr(totals.totalCookingCost)}
                </td>

                {/* Milk space */}
                <td className="p-2 border border-slate-800 text-center text-sky-300 text-[10px]">
                  {totals.milkDistributionDays} दिन
                </td>

                {/* Total Milk Powder */}
                <td className="p-2 border border-slate-800 text-right font-mono font-bold text-sky-200">
                  {formatKg(totals.totalMilkPowderGrams)}
                </td>

                {/* Total Sugar */}
                <td className="p-2 border border-slate-800 text-right font-mono font-bold text-sky-200">
                  {Math.round(totals.totalSugarGrams)} g
                </td>

                {/* Total Prepared Milk */}
                <td className="p-2 border border-slate-800 text-right font-mono font-black text-sky-300 text-sm">
                  {(totals.totalPreparedMilkMl / 1000).toFixed(1)} L
                </td>
              </tr>
            </tfoot>

          </table>
        </div>

        {/* Signature Box for Print */}
        <div className="print-only pt-8 mt-6 grid grid-cols-3 text-center text-xs font-bold text-slate-900 border-t border-slate-400">
          <div>
            <p className="mt-8 border-t border-slate-400 pt-1">प्रभारी (मिड-डे मील)</p>
          </div>
          <div>
            <p className="mt-8 border-t border-slate-400 pt-1">कनिष्ठ सहायक / लेखाकार</p>
          </div>
          <div>
            <p className="mt-8 border-t border-slate-400 pt-1">संस्था प्रधान (मय मोहर)</p>
          </div>
        </div>

      </div>

    </div>
  );
};