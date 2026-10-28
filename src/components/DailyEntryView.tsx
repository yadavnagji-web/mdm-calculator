import React, { useState } from 'react';
import { DailyMDMEntry, SchoolProfile, MDMNorms } from '../types';
import { calculateDailyMetrics, RAJASTHAN_WEEKLY_MENU, formatKg, formatInr } from '../utils/mdmCalculations';
import { generateShalaDarpanSMS, generateWhatsAppMessage, shareOnWhatsApp } from '../utils/shareUtils';
import { 
  Users, 
  Utensils, 
  Coins, 
  Milk, 
  Copy, 
  Share2, 
  Check, 
  Calendar, 
  CheckCircle2, 
  AlertCircle 
} from 'lucide-react';

interface DailyEntryViewProps {
  entries: DailyMDMEntry[];
  profile: SchoolProfile;
  norms: MDMNorms;
  selectedMonth: string;
  onSaveEntry: (entry: DailyMDMEntry) => void;
}

export const DailyEntryView: React.FC<DailyEntryViewProps> = ({
  entries,
  profile,
  norms,
  selectedMonth,
  onSaveEntry,
}) => {
  // Default to today or the latest entry in this month
  const todayStr = new Date().toISOString().split('T')[0];
  const initialDate = todayStr.startsWith(selectedMonth) ? todayStr : (entries[0]?.date || `${selectedMonth}-01`);

  const [currentDate, setCurrentDate] = useState<string>(initialDate);
  const [copiedSMS, setCopiedSMS] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Find existing entry or init new one
  const existingEntry = entries.find((e) => e.date === currentDate);
  const dayOfWeek = new Date(currentDate).getDay();
  const defaultMenu = RAJASTHAN_WEEKLY_MENU[dayOfWeek] || { name: 'रोटी - सब्जी', grain: 'wheat' as const };

  const [isWorkingDay, setIsWorkingDay] = useState<boolean>(
    existingEntry ? existingEntry.isWorkingDay : dayOfWeek !== 0
  );
  const [holidayReason, setHolidayReason] = useState<string>(
    existingEntry?.holidayReason || (dayOfWeek === 0 ? 'रविवार (साप्ताहिक अवकाश)' : '')
  );
  const [primaryAtt, setPrimaryAtt] = useState<number>(existingEntry?.primaryAttendance || 0);
  const [upperPrimaryAtt, setUpperPrimaryAtt] = useState<number>(existingEntry?.upperPrimaryAttendance || 0);
  const [grainType, setGrainType] = useState<'wheat' | 'rice' | 'mixed'>(
    existingEntry?.grainType || defaultMenu.grain
  );
  const [servedMilk, setServedMilk] = useState<boolean>(
    existingEntry !== undefined ? existingEntry.servedMilk : dayOfWeek !== 0
  );
  const [menuItem, setMenuItem] = useState<string>(existingEntry?.menuItem || defaultMenu.name);

  // When date changes, load that date's data
  const handleDateSelect = (newDate: string) => {
    setCurrentDate(newDate);
    const match = entries.find((e) => e.date === newDate);
    const dow = new Date(newDate).getDay();
    const menu = RAJASTHAN_WEEKLY_MENU[dow] || { name: 'रोटी - सब्जी', grain: 'wheat' as const };

    if (match) {
      setIsWorkingDay(match.isWorkingDay);
      setHolidayReason(match.holidayReason || '');
      setPrimaryAtt(match.primaryAttendance);
      setUpperPrimaryAtt(match.upperPrimaryAttendance);
      setGrainType(match.grainType);
      setServedMilk(match.servedMilk);
      setMenuItem(match.menuItem);
    } else {
      setIsWorkingDay(dow !== 0);
      setHolidayReason(dow === 0 ? 'रविवार (साप्ताहिक अवकाश)' : '');
      setPrimaryAtt(0);
      setUpperPrimaryAtt(0);
      setGrainType(menu.grain);
      setServedMilk(dow !== 0);
      setMenuItem(menu.name);
    }
  };

  // Instant calculated preview
  const metrics = isWorkingDay
    ? calculateDailyMetrics(primaryAtt, upperPrimaryAtt, grainType, servedMilk, norms)
    : {
        totalStudents: 0,
        wheatGrams: 0,
        riceGrams: 0,
        cookingCost: 0,
        milkPowderGrams: 0,
        sugarGrams: 0,
        preparedMilkMl: 0,
      };

  const previewEntry: DailyMDMEntry = {
    date: currentDate,
    isWorkingDay,
    holidayReason: holidayReason || undefined,
    primaryAttendance: isWorkingDay ? Number(primaryAtt) || 0 : 0,
    upperPrimaryAttendance: isWorkingDay ? Number(upperPrimaryAtt) || 0 : 0,
    grainType,
    servedMilk: isWorkingDay && servedMilk,
    menuItem: isWorkingDay ? menuItem : (holidayReason || 'अवकाश'),
    ...metrics,
  };

  const handleSave = () => {
    onSaveEntry(previewEntry);
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 2500);
  };

  const smsText = generateShalaDarpanSMS(previewEntry, profile);
  const waText = generateWhatsAppMessage(previewEntry, profile);

  const handleCopySMS = () => {
    navigator.clipboard.writeText(smsText);
    setCopiedSMS(true);
    setTimeout(() => setCopiedSMS(false), 2000);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-6 space-y-6">
      
      {/* Top Welcome / Quick Instruction Alert */}
      <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 flex flex-col md:flex-row items-start md:items-center justify-between gap-3 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-emerald-600 text-white flex items-center justify-center font-bold text-lg shrink-0">
            📝
          </div>
          <div>
            <h2 className="text-sm md:text-base font-bold text-emerald-950">
              दैनिक MDM व बाल गोपाल योजना उपस्थिति प्रविष्टि
            </h2>
            <p className="text-xs text-emerald-800">
              केवल कक्षा 1-5 व 6-8 की छात्र संख्या दर्ज करें। खाद्यान्न, दूध पाउडर, चीनी व कुकिंग राशि स्वतः तैयार होगी।
            </p>
          </div>
        </div>

        {/* Quick Date Switcher */}
        <div className="flex items-center gap-2 w-full md:w-auto">
          <span className="text-xs font-semibold text-emerald-900 whitespace-nowrap">दिनांक चुनें:</span>
          <input
            type="date"
            value={currentDate}
            onChange={(e) => handleDateSelect(e.target.value)}
            className="border border-emerald-300 rounded-lg px-3 py-1.5 text-xs md:text-sm font-semibold bg-white text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500 w-full md:w-auto shadow-sm"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Column: Entry Form */}
        <div className="lg:col-span-7 bg-white rounded-2xl border border-slate-200 shadow-sm p-5 md:p-6 space-y-5">
          
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <Calendar className="w-5 h-5 text-emerald-600" />
              <span className="font-bold text-slate-800 text-base">
                प्रविष्टि: {new Date(currentDate).toLocaleDateString('hi-IN', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
              </span>
            </div>
            
            {/* Working Day Toggle */}
            <label className="flex items-center gap-2 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={isWorkingDay}
                onChange={(e) => setIsWorkingDay(e.target.checked)}
                className="w-4 h-4 text-emerald-600 rounded border-slate-300 focus:ring-emerald-500 cursor-pointer"
              />
              <span className={`text-xs font-bold ${isWorkingDay ? 'text-emerald-700' : 'text-rose-600'}`}>
                {isWorkingDay ? 'शिक्षण दिवस (खुला)' : 'अवकाश (Holiday)'}
              </span>
            </label>
          </div>

          {!isWorkingDay ? (
            <div className="bg-rose-50 border border-rose-200 rounded-xl p-4 space-y-3">
              <label className="block text-xs font-bold text-rose-900">
                अवकाश का विवरण / कारण:
              </label>
              <input
                type="text"
                value={holidayReason}
                onChange={(e) => setHolidayReason(e.target.value)}
                placeholder="उदा. रविवार / राजकीय अवकाश / स्थानीय अवकाश"
                className="w-full border border-rose-300 rounded-lg px-3 py-2 text-sm bg-white text-slate-800 focus:outline-none focus:ring-2 focus:ring-rose-500"
              />
            </div>
          ) : (
            <>
              {/* Attendance Inputs */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                
                {/* Primary (1-5) */}
                <div className="bg-amber-50/60 border border-amber-200/80 rounded-xl p-4 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-amber-950 uppercase tracking-wide">
                      प्राथमिक (कक्षा 1 से 5)
                    </span>
                    <span className="text-[11px] text-amber-800 font-medium">
                      नामांकन: {profile.primaryEnrolled || 0}
                    </span>
                  </div>
                  
                  <div className="relative">
                    <input
                      type="number"
                      min="0"
                      max={profile.primaryEnrolled || 200}
                      value={primaryAtt === 0 ? '' : primaryAtt}
                      onChange={(e) => setPrimaryAtt(Math.max(0, parseInt(e.target.value, 10) || 0))}
                      placeholder="उपस्थिति दर्ज करें"
                      className="w-full border border-amber-300 rounded-lg px-3 py-2.5 text-lg font-bold text-slate-900 bg-white focus:outline-none focus:ring-2 focus:ring-amber-500 shadow-inner"
                    />
                    <span className="absolute right-3 top-3 text-xs text-slate-400 font-semibold">छात्र</span>
                  </div>
                  <div className="text-[11px] text-amber-900 flex justify-between font-medium">
                    <span>गेहूँ: 100g/छात्र</span>
                    <span>कुकिंग: ₹{norms.primaryCookingCost}/छात्र</span>
                  </div>
                </div>

                {/* Upper Primary (6-8) */}
                <div className="bg-blue-50/60 border border-blue-200/80 rounded-xl p-4 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-blue-950 uppercase tracking-wide">
                      उच्च प्राथमिक (कक्षा 6 से 8)
                    </span>
                    <span className="text-[11px] text-blue-800 font-medium">
                      नामांकन: {profile.upperPrimaryEnrolled || 0}
                    </span>
                  </div>
                  
                  <div className="relative">
                    <input
                      type="number"
                      min="0"
                      max={profile.upperPrimaryEnrolled || 200}
                      value={upperPrimaryAtt === 0 ? '' : upperPrimaryAtt}
                      onChange={(e) => setUpperPrimaryAtt(Math.max(0, parseInt(e.target.value, 10) || 0))}
                      placeholder="उपस्थिति दर्ज करें"
                      className="w-full border border-blue-300 rounded-lg px-3 py-2.5 text-lg font-bold text-slate-900 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-inner"
                    />
                    <span className="absolute right-3 top-3 text-xs text-slate-400 font-semibold">छात्र</span>
                  </div>
                  <div className="text-[11px] text-blue-900 flex justify-between font-medium">
                    <span>गेहूँ: 150g/छात्र</span>
                    <span>कुकिंग: ₹{norms.upperPrimaryCookingCost}/छात्र</span>
                  </div>
                </div>

              </div>

              {/* Menu & Grain Selection */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                
                {/* Grain Type */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700">खाद्यान्न का प्रकार:</label>
                  <select
                    value={grainType}
                    onChange={(e) => setGrainType(e.target.value as any)}
                    className="w-full border border-slate-300 rounded-lg px-3 py-2 text-xs md:text-sm font-semibold bg-white text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  >
                    <option value="wheat">गेहूँ (Wheat)</option>
                    <option value="rice">चावल (Rice)</option>
                    <option value="mixed">मिश्रित / खिचड़ी (50% गेहूँ + 50% चावल)</option>
                  </select>
                </div>

                {/* Menu Item */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700">आज का मेनू (Weekly Schedule):</label>
                  <input
                    type="text"
                    value={menuItem}
                    onChange={(e) => setMenuItem(e.target.value)}
                    className="w-full border border-slate-300 rounded-lg px-3 py-2 text-xs md:text-sm font-medium bg-white text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>

              </div>

              {/* Bal Gopal Yojana Toggle */}
              <div className="bg-sky-50 border border-sky-200 rounded-xl p-3.5 flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-sky-600 text-white flex items-center justify-center font-bold">
                    🥛
                  </div>
                  <div>
                    <h4 className="text-xs md:text-sm font-bold text-sky-950">
                      मुख्यमंत्री बाल गोपाल योजना (दूध वितरण)
                    </h4>
                    <p className="text-[11px] text-sky-800">
                      1-5: 15g पाउडर, 8.4g चीनी | 6-8: 20g पाउडर, 10.2g चीनी
                    </p>
                  </div>
                </div>

                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={servedMilk}
                    onChange={(e) => setServedMilk(e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-slate-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-sky-600"></div>
                </label>
              </div>
            </>
          )}

          {/* Action Buttons */}
          <div className="flex flex-wrap items-center gap-3 pt-3 border-t border-slate-100">
            <button
              onClick={handleSave}
              className="flex-1 bg-emerald-700 hover:bg-emerald-600 text-white font-bold py-2.5 px-4 rounded-xl flex items-center justify-center gap-2 shadow-md transition-all active:scale-[0.99]"
            >
              {saveSuccess ? (
                <>
                  <CheckCircle2 className="w-4 h-4 text-emerald-200" />
                  <span>सफलतापूर्वक सुरक्षित!</span>
                </>
              ) : (
                <>
                  <Check className="w-4 h-4" />
                  <span>दैनिक उपस्थिति सुरक्षित करें</span>
                </>
              )}
            </button>

            <button
              onClick={() => shareOnWhatsApp(waText)}
              className="bg-green-600 hover:bg-green-500 text-white font-bold py-2.5 px-4 rounded-xl flex items-center justify-center gap-2 shadow transition-all"
            >
              <Share2 className="w-4 h-4" />
              <span>WhatsApp रिपोर्ट</span>
            </button>
          </div>

        </div>

        {/* Right Column: Instant Live Calculations Preview & SMS Generator */}
        <div className="lg:col-span-5 space-y-4">
          
          {/* Quick Metrics Summary Cards */}
          <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center justify-between">
              <span>आज की रियल-टाइम गणना</span>
              <span className="text-emerald-700 font-bold">दिनांक: {currentDate}</span>
            </h3>

            <div className="grid grid-cols-2 gap-3">
              
              {/* Total Students */}
              <div className="bg-slate-50 rounded-xl p-3 border border-slate-100">
                <div className="flex items-center gap-1.5 text-slate-500 text-xs font-medium mb-1">
                  <Users className="w-3.5 h-3.5 text-emerald-600" />
                  <span>कुल लाभान्वित</span>
                </div>
                <div className="text-xl font-extrabold text-slate-900">
                  {metrics.totalStudents} <span className="text-xs font-normal text-slate-500">छात्र</span>
                </div>
                <div className="text-[10px] text-slate-500 mt-0.5">
                  प्राथ: {primaryAtt} | उच्च प्राथ: {upperPrimaryAtt}
                </div>
              </div>

              {/* Cooking Cost */}
              <div className="bg-slate-50 rounded-xl p-3 border border-slate-100">
                <div className="flex items-center gap-1.5 text-slate-500 text-xs font-medium mb-1">
                  <Coins className="w-3.5 h-3.5 text-amber-600" />
                  <span>कुकिंग लागत</span>
                </div>
                <div className="text-xl font-extrabold text-emerald-700">
                  {formatInr(metrics.cookingCost)}
                </div>
                <div className="text-[10px] text-slate-500 mt-0.5">
                  कन्वर्जन दर लागू
                </div>
              </div>

              {/* Grain Consumption */}
              <div className="bg-slate-50 rounded-xl p-3 border border-slate-100">
                <div className="flex items-center gap-1.5 text-slate-500 text-xs font-medium mb-1">
                  <Utensils className="w-3.5 h-3.5 text-amber-700" />
                  <span>खाद्यान्न खपत</span>
                </div>
                <div className="text-xl font-extrabold text-slate-900">
                  {formatKg(metrics.wheatGrams + metrics.riceGrams)} <span className="text-xs font-normal text-slate-500">किग्रा</span>
                </div>
                <div className="text-[10px] text-slate-500 mt-0.5">
                  गेहूँ: {formatKg(metrics.wheatGrams)} | चावल: {formatKg(metrics.riceGrams)}
                </div>
              </div>

              {/* Milk Consumption */}
              <div className="bg-slate-50 rounded-xl p-3 border border-slate-100">
                <div className="flex items-center gap-1.5 text-slate-500 text-xs font-medium mb-1">
                  <Milk className="w-3.5 h-3.5 text-sky-600" />
                  <span>बाल गोपाल दूध</span>
                </div>
                <div className="text-xl font-extrabold text-sky-800">
                  {(metrics.preparedMilkMl / 1000).toFixed(1)} <span className="text-xs font-normal text-slate-500">लीटर</span>
                </div>
                <div className="text-[10px] text-slate-500 mt-0.5">
                  पाउडर: {formatKg(metrics.milkPowderGrams)} kg | चीनी: {metrics.sugarGrams}g
                </div>
              </div>

            </div>

          </div>

          {/* Shala Darpan SMS Assistant Card */}
          <div className="bg-gradient-to-br from-slate-900 to-emerald-950 text-white rounded-2xl p-5 shadow-md space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                <h4 className="text-xs font-bold uppercase tracking-wider text-emerald-300">
                  शाला दर्पण दैनिक SMS कोड
                </h4>
              </div>
              
              <button
                onClick={handleCopySMS}
                className="bg-emerald-600 hover:bg-emerald-500 text-white text-xs px-2.5 py-1.5 rounded-lg flex items-center gap-1.5 font-semibold transition-all shadow"
              >
                {copiedSMS ? <Check className="w-3.5 h-3.5 text-amber-300" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedSMS ? 'कॉपी हो गया!' : 'SMS कॉपी करें'}</span>
              </button>
            </div>

            <div className="bg-black/40 border border-emerald-500/30 rounded-xl p-3 font-mono text-xs text-emerald-200 select-all break-all">
              {smsText}
            </div>

            <p className="text-[11px] text-slate-300">
              💡 यह SMS कोड कॉपी करके अपने मोबाइल से विभाग के नंबर (15544 / शाला दर्पण गेटवे) पर भेज सकते हैं।
            </p>
          </div>

        </div>

      </div>

    </div>
  );
};
