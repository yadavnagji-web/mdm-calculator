import React, { useState, useRef } from 'react';
import { DailyMDMEntry, SchoolProfile, MDMNorms } from '../types';
import { formatKg, formatInr, aggregateMonthlyEntries, calculateDailyMetrics } from '../utils/mdmCalculations';
import { 
  Printer, 
  Calendar, 
  Download, 
  Upload, 
  CheckCircle2, 
  Edit3, 
  Sparkles, 
  FileSpreadsheet, 
  Info,
  Check,
  AlertCircle
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
  const [isExcelMode, setIsExcelMode] = useState<boolean>(true);
  const [uploadMessage, setUploadMessage] = useState<string | null>(null);
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

  // Handler for direct inline attendance change
  const handleAttendanceChange = (
    entry: DailyMDMEntry,
    field: 'primary' | 'upperPrimary',
    valStr: string
  ) => {
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

  // Handler for direct grain toggle
  const handleGrainChange = (entry: DailyMDMEntry, grainType: 'wheat' | 'rice' | 'mixed') => {
    const metrics = calculateDailyMetrics(
      entry.primaryAttendance,
      entry.upperPrimaryAttendance,
      grainType,
      entry.servedMilk,
      norms
    );

    onUpdateEntry({
      ...entry,
      grainType,
      ...metrics,
    });
  };

  // Handler for Working Day vs Holiday toggle
  const handleWorkingDayToggle = (entry: DailyMDMEntry) => {
    const newIsWorking = !entry.isWorkingDay;
    const newPrimary = newIsWorking ? (entry.primaryAttendance || profile.primaryEnrolled || 0) : 0;
    const newUpperPrimary = newIsWorking ? (entry.upperPrimaryAttendance || profile.upperPrimaryEnrolled || 0) : 0;

    const metrics = calculateDailyMetrics(
      newPrimary,
      newUpperPrimary,
      entry.grainType,
      newIsWorking ? entry.servedMilk : false,
      norms
    );

    onUpdateEntry({
      ...entry,
      isWorkingDay: newIsWorking,
      holidayReason: newIsWorking ? undefined : (entry.holidayReason || 'अवकाश'),
      primaryAttendance: newPrimary,
      upperPrimaryAttendance: newUpperPrimary,
      ...metrics,
    });
  };

  // Handler for Holiday Reason change
  const handleHolidayReasonChange = (entry: DailyMDMEntry, reason: string) => {
    onUpdateEntry({
      ...entry,
      holidayReason: reason,
    });
  };

  // 1. Download Excel/CSV Template
  const handleDownloadExcelTemplate = () => {
    const header = [
      'दिनांक(YYYY-MM-DD)',
      'वार',
      'कार्यदिवस(1=हाँ/0=अवकाश)',
      'प्राथमिक_उपस्थिति(1-5)',
      'उच्च_प्राथमिक_उपस्थिति(6-8)',
      'अनाज(wheat/rice/mixed)',
      'दूध_वितरण(1=हाँ/0=नहीं)',
      'अवकाश_कारण'
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
    link.setAttribute('download', `MDM_Attendance_Format_${selectedMonth}_${profile.schoolName || 'School'}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  // 2. Upload Filled Excel/CSV Sheet
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const text = event.target?.result as string;
        if (!text) throw new Error('फाइल खाली है');

        const lines = text.split(/\r?\n/).filter((l) => l.trim().length > 0);
        if (lines.length < 2) throw new Error('फाइल में पर्याप्त डेटा नहीं है');

        // Create map of parsed entries
        const parsedMap: Record<string, {
          isWorking: boolean;
          primary: number;
          upperPrimary: number;
          grain: 'wheat' | 'rice' | 'mixed';
          servedMilk: boolean;
          reason?: string;
        }> = {};

        // Parse each row (skip header at index 0)
        for (let i = 1; i < lines.length; i++) {
          const line = lines[i].trim();
          if (!line) continue;

          // Split by comma taking quoted strings into account
          const cols: string[] = [];
          let current = '';
          let inQuotes = false;
          for (let c = 0; c < line.length; c++) {
            const ch = line[c];
            if (ch === '"') {
              inQuotes = !inQuotes;
            } else if (ch === ',' && !inQuotes) {
              cols.push(current.trim());
              current = '';
            } else {
              current += ch;
            }
          }
          cols.push(current.trim());

          if (cols.length >= 3) {
            let dateStr = cols[0].replace(/^["']|["']$/g, '').trim();
            // Handle DD-MM-YYYY or DD/MM/YYYY formatting
            if (dateStr.includes('/') || (dateStr.includes('-') && dateStr.split('-')[0].length === 2)) {
              const parts = dateStr.includes('/') ? dateStr.split('/') : dateStr.split('-');
              if (parts.length === 3) {
                if (parts[2].length === 4) {
                  dateStr = `${parts[2]}-${parts[1].padStart(2, '0')}-${parts[0].padStart(2, '0')}`;
                }
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

        // Apply to existing entries
        let updatedCount = 0;
        const newEntries = entries.map((entry) => {
          const match = parsedMap[entry.date];
          if (!match) return entry;

          updatedCount++;
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
        setUploadMessage(`✓ एक्सेल शीट से ${updatedCount} दिवसों की उपस्थिति सफलतापूर्वक अपलोड व परिकलित हो गई!`);
        setTimeout(() => setUploadMessage(null), 6000);
      } catch (err: any) {
        alert('एक्सेल शीट पढ़ने में त्रुटि: ' + (err.message || 'अमान्य प्रारूप'));
      }
    };
    reader.readAsText(file);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-6 space-y-6">
      
      {/* Top Banner & Excel Quick Tools */}
      <div className="no-print bg-white rounded-2xl border border-slate-200 p-4 sm:p-5 shadow-sm space-y-4">
        
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
          <div>
            <h2 className="text-base sm:text-lg font-bold text-slate-900 flex items-center gap-2">
              <Calendar className="w-5 h-5 text-emerald-700" />
              <span>मासिक दैनिक वितरण पंजी (MDM Daily Register): {monthName}</span>
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              प्रत्येक दिवस की छात्र उपस्थिति सीधे नीचे तालिका में एक्सेल की तरह भरें या एक्सेल शीट डाउनलोड/अपलोड करें।
            </p>
          </div>

          {/* Quick Action Buttons */}
          <div className="flex flex-wrap items-center gap-2 w-full lg:w-auto justify-start lg:justify-end">
            
            {/* Excel Mode Toggle */}
            <button
              onClick={() => setIsExcelMode(!isExcelMode)}
              className={`text-xs font-bold px-3 py-2 rounded-xl flex items-center gap-1.5 transition-all border ${
                isExcelMode
                  ? 'bg-emerald-800 text-white border-emerald-900 shadow-md ring-2 ring-emerald-400/40'
                  : 'bg-slate-100 text-slate-700 border-slate-300 hover:bg-slate-200'
              }`}
              title="सीधे तालिका में लिखने की सुविधा ऑन/ऑफ करें"
            >
              <Edit3 className="w-4 h-4 text-amber-300" />
              <span>{isExcelMode ? '✓ एक्सेल प्रविष्टि मोड ऑन' : 'एक्सेल मोड ऑन करें'}</span>
            </button>

            {/* Download Excel Template */}
            <button
              onClick={handleDownloadExcelTemplate}
              className="bg-sky-700 hover:bg-sky-600 text-white text-xs font-bold px-3 py-2 rounded-xl flex items-center gap-1.5 shadow transition-all border border-sky-800"
              title="इस माह की तैयार एक्सेल शीट डाउनलोड करें"
            >
              <Download className="w-4 h-4 text-sky-200" />
              <span>📥 एक्सेल फॉर्मेट डाउनलोड</span>
            </button>

            {/* Upload Excel Sheet */}
            <button
              onClick={() => fileInputRef.current?.click()}
              className="bg-emerald-700 hover:bg-emerald-600 text-white text-xs font-bold px-3 py-2 rounded-xl flex items-center gap-1.5 shadow transition-all border border-emerald-800"
              title="भरी हुई एक्सेल/CSV शीट अपलोड करें"
            >
              <Upload className="w-4 h-4 text-amber-300" />
              <span>📤 एक्सेल शीट अपलोड</span>
            </button>
            <input
              type="file"
              ref={fileInputRef}
              accept=".csv, .txt"
              onChange={handleFileUpload}
              className="hidden"
            />

            {/* Print Button */}
            <button
              onClick={() => window.print()}
              className="bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold px-3.5 py-2 rounded-xl flex items-center gap-1.5 shadow transition-all"
            >
              <Printer className="w-4 h-4" />
              <span>प्रिंट A4</span>
            </button>
          </div>
        </div>

        {/* Upload Success Banner */}
        {uploadMessage && (
          <div className="bg-emerald-50 border-2 border-emerald-500 rounded-xl p-3 flex items-center gap-3 text-emerald-900 font-semibold text-xs animate-in fade-in">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
            <span>{uploadMessage}</span>
          </div>
        )}

        {/* Instructions helper pill */}
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-2.5 flex items-center justify-between text-[11.5px] text-amber-900 flex-wrap gap-2">
          <div className="flex items-center gap-1.5">
            <Sparkles className="w-4 h-4 text-amber-600 shrink-0" />
            <span>
              <strong>त्वरित सुझाव:</strong> नीचे प्राथमिक (1-5) और उच्च प्राथमिक (6-8) के बॉक्स में सीधे संख्या लिखें; खाद्यान्न, कुकिंग राशि व दूध की मात्रा तुरंत अपने आप परिकलित होकर सेव हो जाएगी!
            </span>
          </div>

          {/* Filter Pills */}
          <div className="bg-white/80 border border-amber-300 p-0.5 rounded-lg flex items-center text-[11px] font-bold">
            <button
              onClick={() => setFilter('all')}
              className={`px-2 py-1 rounded ${filter === 'all' ? 'bg-amber-600 text-white' : 'text-slate-600'}`}
            >
              सभी ({entries.length})
            </button>
            <button
              onClick={() => setFilter('working')}
              className={`px-2 py-1 rounded ${filter === 'working' ? 'bg-emerald-700 text-white' : 'text-slate-600'}`}
            >
              कार्यदिवस ({totals.workingDays})
            </button>
            <button
              onClick={() => setFilter('holidays')}
              className={`px-2 py-1 rounded ${filter === 'holidays' ? 'bg-rose-700 text-white' : 'text-slate-600'}`}
            >
              अवकाश ({entries.length - totals.workingDays})
            </button>
          </div>
        </div>

      </div>

      {/* Official A4 Print Layout Wrapper */}
      <div className="print-container bg-white rounded-2xl border border-slate-200 p-4 sm:p-6 shadow-sm overflow-x-auto">
        
        {/* Printable Official Header */}
        <div className="text-center pb-4 mb-4 border-b-2 border-slate-800 space-y-1">
          <h3 className="text-base sm:text-lg font-bold text-slate-900 uppercase">
            कार्यालय संस्था प्रधान - {profile.schoolName || 'राजकीय विद्यालय'}
          </h3>
          <p className="text-xs text-slate-700 font-medium">
            ब्लॉक: {profile.block || '------'} | जिला: {profile.district || '------'} | U-DISE कोड: {profile.udiseCode || '------'}
          </p>
          <div className="inline-block bg-slate-100 border border-slate-300 px-3 py-1 rounded text-xs font-bold text-slate-900">
            दैनिक पोषाहार व बाल गोपाल दूध वितरण मासिक पंजी — माह: {monthName}
          </div>
        </div>

        {/* Table */}
        <table className="w-full text-left text-xs border border-slate-300">
          <thead className="bg-slate-100 text-slate-800 font-bold border-b border-slate-300">
            <tr>
              <th className="p-2 border border-slate-300 text-center w-10">दिनांक</th>
              <th className="p-2 border border-slate-300 text-center w-14">वार</th>
              <th className="p-2 border border-slate-300 text-center w-16">स्थिति</th>
              <th className="p-2 border border-slate-300 text-center w-20 bg-emerald-50 text-emerald-950 font-extrabold">
                प्राथ.(1-5)
              </th>
              <th className="p-2 border border-slate-300 text-center w-20 bg-emerald-50 text-emerald-950 font-extrabold">
                उच्च(6-8)
              </th>
              <th className="p-2 border border-slate-300 text-center w-14 font-extrabold">कुल छात्र</th>
              <th className="p-2 border border-slate-300 text-center w-24">अनाज / मेनू</th>
              <th className="p-2 border border-slate-300 text-right w-16">गेहूँ (kg)</th>
              <th className="p-2 border border-slate-300 text-right w-16">चावल (kg)</th>
              <th className="p-2 border border-slate-300 text-right w-20">कुकिंग व्यय (₹)</th>
              <th className="p-2 border border-slate-300 text-right w-16">दूध पाउडर (kg)</th>
              <th className="p-2 border border-slate-300 text-right w-14">चीनी (g)</th>
              <th className="p-2 border border-slate-300 text-right w-16">तैयार दूध (L)</th>
              <th className="p-2 border border-slate-300 text-center no-print w-16">विस्तृत</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200">
            {filteredEntries.map((entry) => {
              const dObj = new Date(entry.date);
              const dayNum = dObj.getDate();
              const dayName = dObj.toLocaleDateString('hi-IN', { weekday: 'short' });

              return (
                <tr
                  key={entry.date}
                  className={`${
                    !entry.isWorkingDay ? 'bg-rose-50/60 text-rose-900' : 'hover:bg-slate-50'
                  }`}
                >
                  <td className="p-2 border border-slate-300 text-center font-bold">
                    {String(dayNum).padStart(2, '0')}
                  </td>
                  <td className="p-2 border border-slate-300 text-center font-medium">
                    {dayName}
                  </td>

                  {/* Working Day Toggle Status */}
                  <td className="p-1.5 border border-slate-300 text-center">
                    <button
                      onClick={() => handleWorkingDayToggle(entry)}
                      title="कार्यदिवस व अवकाश बदलने के लिए क्लिक करें"
                      className={`no-print text-[10px] font-bold px-2 py-0.5 rounded transition-all ${
                        entry.isWorkingDay
                          ? 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200'
                          : 'bg-rose-100 text-rose-800 hover:bg-rose-200'
                      }`}
                    >
                      {entry.isWorkingDay ? 'शिक्षण' : 'अवकाश'}
                    </button>
                    <span className="print-only text-[11px] font-bold">
                      {entry.isWorkingDay ? 'शिक्षण' : 'अवकाश'}
                    </span>
                  </td>

                  {!entry.isWorkingDay ? (
                    <td colSpan={10} className="p-2 border border-slate-300 text-center">
                      <div className="flex items-center justify-center gap-2">
                        <span className="font-semibold text-rose-700 italic">
                          — अवकाश:
                        </span>
                        <input
                          type="text"
                          value={entry.holidayReason || 'साप्ताहिक अवकाश'}
                          onChange={(e) => handleHolidayReasonChange(entry, e.target.value)}
                          className="no-print bg-white/80 border border-rose-300 rounded px-2 py-0.5 text-xs text-rose-900 w-44 focus:outline-none focus:ring-1 focus:ring-rose-500"
                        />
                        <span className="print-only font-bold text-rose-800">
                          {entry.holidayReason || 'साप्ताहिक अवकाश'}
                        </span>
                        <span className="font-semibold text-rose-700 italic">—</span>
                      </div>
                    </td>
                  ) : (
                    <>
                      {/* Primary Attendance - Inline Excel Input */}
                      <td className="p-1 border border-slate-300 text-center bg-emerald-50/50">
                        {isExcelMode ? (
                          <input
                            type="number"
                            min="0"
                            value={entry.primaryAttendance === 0 ? '' : entry.primaryAttendance}
                            placeholder="0"
                            onChange={(e) => handleAttendanceChange(entry, 'primary', e.target.value)}
                            className="w-full text-center font-bold text-slate-900 bg-white border border-emerald-300 rounded py-1 px-1 focus:ring-2 focus:ring-emerald-500 focus:outline-none text-xs shadow-inner"
                          />
                        ) : (
                          <span className="font-bold text-slate-900">{entry.primaryAttendance}</span>
                        )}
                        <span className="print-only font-bold">{entry.primaryAttendance}</span>
                      </td>

                      {/* Upper Primary Attendance - Inline Excel Input */}
                      <td className="p-1 border border-slate-300 text-center bg-emerald-50/50">
                        {isExcelMode ? (
                          <input
                            type="number"
                            min="0"
                            value={entry.upperPrimaryAttendance === 0 ? '' : entry.upperPrimaryAttendance}
                            placeholder="0"
                            onChange={(e) => handleAttendanceChange(entry, 'upperPrimary', e.target.value)}
                            className="w-full text-center font-bold text-slate-900 bg-white border border-emerald-300 rounded py-1 px-1 focus:ring-2 focus:ring-emerald-500 focus:outline-none text-xs shadow-inner"
                          />
                        ) : (
                          <span className="font-bold text-slate-900">{entry.upperPrimaryAttendance}</span>
                        )}
                        <span className="print-only font-bold">{entry.upperPrimaryAttendance}</span>
                      </td>

                      {/* Total Benefited */}
                      <td className="p-2 border border-slate-300 text-center font-extrabold text-emerald-950 bg-slate-50">
                        {entry.totalStudents}
                      </td>

                      {/* Grain Selector / Menu */}
                      <td className="p-1 border border-slate-300 text-center">
                        <select
                          value={entry.grainType}
                          onChange={(e) => handleGrainChange(entry, e.target.value as any)}
                          className="no-print w-full bg-white border border-slate-300 rounded p-0.5 text-[11px] font-medium focus:ring-1 focus:ring-emerald-500 focus:outline-none"
                        >
                          <option value="wheat">गेहूँ</option>
                          <option value="rice">चावल</option>
                          <option value="mixed">मिश्रित</option>
                        </select>
                        <span className="print-only text-[11px]">
                          {entry.grainType === 'wheat' ? 'गेहूँ' : entry.grainType === 'rice' ? 'चावल' : 'खिचड़ी'}
                        </span>
                      </td>

                      {/* Computed Wheat */}
                      <td className="p-2 border border-slate-300 text-right font-mono font-medium">
                        {entry.wheatGrams > 0 ? formatKg(entry.wheatGrams) : '-'}
                      </td>

                      {/* Computed Rice */}
                      <td className="p-2 border border-slate-300 text-right font-mono font-medium">
                        {entry.riceGrams > 0 ? formatKg(entry.riceGrams) : '-'}
                      </td>

                      {/* Computed Cooking Cost */}
                      <td className="p-2 border border-slate-300 text-right font-mono font-extrabold text-emerald-800">
                        {formatInr(entry.cookingCost)}
                      </td>

                      {/* Milk Powder */}
                      <td className="p-2 border border-slate-300 text-right font-mono text-sky-900">
                        {entry.servedMilk ? formatKg(entry.milkPowderGrams) : '-'}
                      </td>

                      {/* Sugar */}
                      <td className="p-2 border border-slate-300 text-right font-mono text-sky-900">
                        {entry.servedMilk ? Math.round(entry.sugarGrams) : '-'}
                      </td>

                      {/* Prepared Milk Liters */}
                      <td className="p-2 border border-slate-300 text-right font-mono text-sky-900 font-bold">
                        {entry.servedMilk ? (entry.preparedMilkMl / 1000).toFixed(1) : '-'}
                      </td>
                    </>
                  )}

                  {/* Actions / Details */}
                  <td className="p-2 border border-slate-300 text-center no-print">
                    <button
                      onClick={() => onEditEntry(entry.date)}
                      className="text-emerald-700 hover:text-emerald-900 font-bold hover:underline text-[11px]"
                      title="दैनिक मेनू व विस्तृत विवरण बदलें"
                    >
                      विस्तृत
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>

          {/* Grand Totals Footer */}
          <tfoot className="bg-slate-200 text-slate-900 font-bold border-t-2 border-slate-400">
            <tr>
              <td colSpan={3} className="p-2.5 border border-slate-400 text-center">
                मासिक कुल योग:
              </td>
              <td className="p-2.5 border border-slate-400 text-center font-extrabold text-emerald-950">
                {totals.totalPrimaryBenefited}
              </td>
              <td className="p-2.5 border border-slate-400 text-center font-extrabold text-emerald-950">
                {totals.totalUpperPrimaryBenefited}
              </td>
              <td className="p-2.5 border border-slate-400 text-center text-emerald-950 font-black text-sm">
                {totals.totalStudentsBenefited}
              </td>
              <td className="p-2.5 border border-slate-400 font-medium text-slate-700 text-center text-[11px]">
                कार्यदिवस: {totals.workingDays}
              </td>
              <td className="p-2.5 border border-slate-400 text-right font-mono font-bold">
                {formatKg(totals.totalWheatGrams)}
              </td>
              <td className="p-2.5 border border-slate-400 text-right font-mono font-bold">
                {formatKg(totals.totalRiceGrams)}
              </td>
              <td className="p-2.5 border border-slate-400 text-right font-mono font-black text-emerald-950 text-sm">
                {formatInr(totals.totalCookingCost)}
              </td>
              <td className="p-2.5 border border-slate-400 text-right font-mono text-sky-950 font-bold">
                {formatKg(totals.totalMilkPowderGrams)}
              </td>
              <td className="p-2.5 border border-slate-400 text-right font-mono text-sky-950 font-bold">
                {Math.round(totals.totalSugarGrams)}
              </td>
              <td className="p-2.5 border border-slate-400 text-right font-mono text-sky-950 font-black">
                {(totals.totalPreparedMilkMl / 1000).toFixed(1)}
              </td>
              <td className="p-2.5 border border-slate-400 no-print"></td>
            </tr>
          </tfoot>
        </table>

        {/* Signature Box for Print */}
        <div className="pt-8 mt-6 grid grid-cols-3 text-center text-xs font-bold text-slate-900">
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