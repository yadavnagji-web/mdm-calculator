import React, { useState } from 'react';
import { DailyMDMEntry, SchoolProfile } from '../types';
import { formatKg, formatInr, aggregateMonthlyEntries } from '../utils/mdmCalculations';
import { Printer, Filter, Calendar, FileSpreadsheet } from 'lucide-react';

interface DailyRegisterViewProps {
  entries: DailyMDMEntry[];
  profile: SchoolProfile;
  selectedMonth: string;
  onEditEntry: (date: string) => void;
}

export const DailyRegisterView: React.FC<DailyRegisterViewProps> = ({
  entries,
  profile,
  selectedMonth,
  onEditEntry,
}) => {
  const [filter, setFilter] = useState<'all' | 'working' | 'holidays'>('all');

  const filteredEntries = entries.filter((e) => {
    if (filter === 'working') return e.isWorkingDay;
    if (filter === 'holidays') return !e.isWorkingDay;
    return true;
  });

  const totals = aggregateMonthlyEntries(entries);

  const monthName = new Date(`${selectedMonth}-01`).toLocaleDateString('hi-IN', {
    month: 'long',
    year: 'numeric',
  });

  return (
    <div className="max-w-7xl mx-auto px-4 py-6 space-y-6">
      
      {/* Top Header & Actions */}
      <div className="no-print bg-white rounded-2xl border border-slate-200 p-4 sm:p-5 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shadow-sm">
        <div>
          <h2 className="text-base sm:text-lg font-bold text-slate-900 flex items-center gap-2">
            <Calendar className="w-5 h-5 text-emerald-700" />
            <span>मासिक दैनिक वितरण पंजी (MDM Daily Register): {monthName}</span>
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            माह के प्रत्येक दिवस की छात्र उपस्थिति, खाद्यान्न, दूध पाउडर व कुकिंग लागत का विस्तृत विवरण
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
          {/* Filter Pills */}
          <div className="bg-slate-100 p-1 rounded-xl flex items-center text-xs font-semibold">
            <button
              onClick={() => setFilter('all')}
              className={`px-3 py-1.5 rounded-lg transition-all ${
                filter === 'all' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500'
              }`}
            >
              सभी दिवस ({entries.length})
            </button>
            <button
              onClick={() => setFilter('working')}
              className={`px-3 py-1.5 rounded-lg transition-all ${
                filter === 'working' ? 'bg-white text-emerald-800 shadow-sm' : 'text-slate-500'
              }`}
            >
              शिक्षण दिवस ({totals.workingDays})
            </button>
            <button
              onClick={() => setFilter('holidays')}
              className={`px-3 py-1.5 rounded-lg transition-all ${
                filter === 'holidays' ? 'bg-white text-rose-800 shadow-sm' : 'text-slate-500'
              }`}
            >
              अवकाश ({entries.length - totals.workingDays})
            </button>
          </div>

          {/* Print Button */}
          <button
            onClick={() => window.print()}
            className="bg-emerald-700 hover:bg-emerald-600 text-white text-xs font-bold px-3.5 py-2 rounded-xl flex items-center gap-1.5 shadow transition-all"
          >
            <Printer className="w-4 h-4" />
            <span>प्रिंट A4</span>
          </button>
        </div>
      </div>

      {/* Official A4 Print Layout Wrapper */}
      <div className="print-container bg-white rounded-2xl border border-slate-200 p-4 sm:p-6 shadow-sm overflow-x-auto">
        
        {/* Printable Official Header */}
        <div className="text-center pb-4 mb-4 border-b-2 border-slate-800 space-y-1">
          <h3 className="text-base sm:text-lg font-bold text-slate-900 uppercase">
            कार्यालय संस्था प्रधान - {profile.schoolName}
          </h3>
          <p className="text-xs text-slate-700 font-medium">
            ब्लॉक: {profile.block} | जिला: {profile.district} | U-DISE कोड: {profile.udiseCode}
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
              <th className="p-2 border border-slate-300 text-center w-16">वार</th>
              <th className="p-2 border border-slate-300 text-center w-12">प्राथ.(1-5)</th>
              <th className="p-2 border border-slate-300 text-center w-12">उच्च(6-8)</th>
              <th className="p-2 border border-slate-300 text-center w-12">कुल छात्र</th>
              <th className="p-2 border border-slate-300">दैनिक मेनू / विवरण</th>
              <th className="p-2 border border-slate-300 text-right w-16">गेहूँ (kg)</th>
              <th className="p-2 border border-slate-300 text-right w-16">चावल (kg)</th>
              <th className="p-2 border border-slate-300 text-right w-20">कुकिंग व्यय (₹)</th>
              <th className="p-2 border border-slate-300 text-right w-16">दूध पाउडर (kg)</th>
              <th className="p-2 border border-slate-300 text-right w-14">चीनी (g)</th>
              <th className="p-2 border border-slate-300 text-right w-16">तैयार दूध (L)</th>
              <th className="p-2 border border-slate-300 text-center no-print w-14">संशोधन</th>
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
                    !entry.isWorkingDay ? 'bg-rose-50/50 text-rose-900' : 'hover:bg-slate-50'
                  }`}
                >
                  <td className="p-2 border border-slate-300 text-center font-bold">
                    {String(dayNum).padStart(2, '0')}
                  </td>
                  <td className="p-2 border border-slate-300 text-center font-medium">
                    {dayName}
                  </td>

                  {!entry.isWorkingDay ? (
                    <td colSpan={10} className="p-2 border border-slate-300 text-center font-semibold text-rose-700 italic">
                      — अवकाश: {entry.holidayReason || 'साप्ताहिक अवकाश'} —
                    </td>
                  ) : (
                    <>
                      <td className="p-2 border border-slate-300 text-center font-semibold">
                        {entry.primaryAttendance}
                      </td>
                      <td className="p-2 border border-slate-300 text-center font-semibold">
                        {entry.upperPrimaryAttendance}
                      </td>
                      <td className="p-2 border border-slate-300 text-center font-bold text-emerald-900">
                        {entry.totalStudents}
                      </td>
                      <td className="p-2 border border-slate-300 truncate max-w-[150px]">
                        {entry.menuItem}
                      </td>
                      <td className="p-2 border border-slate-300 text-right font-mono">
                        {entry.wheatGrams > 0 ? formatKg(entry.wheatGrams) : '-'}
                      </td>
                      <td className="p-2 border border-slate-300 text-right font-mono">
                        {entry.riceGrams > 0 ? formatKg(entry.riceGrams) : '-'}
                      </td>
                      <td className="p-2 border border-slate-300 text-right font-mono font-semibold text-emerald-800">
                        {formatInr(entry.cookingCost)}
                      </td>
                      <td className="p-2 border border-slate-300 text-right font-mono text-sky-900">
                        {entry.servedMilk ? formatKg(entry.milkPowderGrams) : '-'}
                      </td>
                      <td className="p-2 border border-slate-300 text-right font-mono text-sky-900">
                        {entry.servedMilk ? Math.round(entry.sugarGrams) : '-'}
                      </td>
                      <td className="p-2 border border-slate-300 text-right font-mono text-sky-900 font-semibold">
                        {entry.servedMilk ? (entry.preparedMilkMl / 1000).toFixed(1) : '-'}
                      </td>
                    </>
                  )}

                  <td className="p-2 border border-slate-300 text-center no-print">
                    <button
                      onClick={() => onEditEntry(entry.date)}
                      className="text-emerald-700 hover:text-emerald-900 font-bold hover:underline"
                    >
                      बदलें
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>

          {/* Grand Totals Footer */}
          <tfoot className="bg-slate-200 text-slate-900 font-bold border-t-2 border-slate-400">
            <tr>
              <td colSpan={2} className="p-2.5 border border-slate-400 text-center">
                मासिक कुल योग:
              </td>
              <td className="p-2.5 border border-slate-400 text-center">
                {totals.totalPrimaryBenefited}
              </td>
              <td className="p-2.5 border border-slate-400 text-center">
                {totals.totalUpperPrimaryBenefited}
              </td>
              <td className="p-2.5 border border-slate-400 text-center text-emerald-950 font-extrabold">
                {totals.totalStudentsBenefited}
              </td>
              <td className="p-2.5 border border-slate-400 font-medium text-slate-700">
                कुल कार्य दिवस: {totals.workingDays}
              </td>
              <td className="p-2.5 border border-slate-400 text-right font-mono">
                {formatKg(totals.totalWheatGrams)}
              </td>
              <td className="p-2.5 border border-slate-400 text-right font-mono">
                {formatKg(totals.totalRiceGrams)}
              </td>
              <td className="p-2.5 border border-slate-400 text-right font-mono font-extrabold text-emerald-900">
                {formatInr(totals.totalCookingCost)}
              </td>
              <td className="p-2.5 border border-slate-400 text-right font-mono text-sky-950">
                {formatKg(totals.totalMilkPowderGrams)}
              </td>
              <td className="p-2.5 border border-slate-400 text-right font-mono text-sky-950">
                {Math.round(totals.totalSugarGrams)}
              </td>
              <td className="p-2.5 border border-slate-400 text-right font-mono text-sky-950 font-extrabold">
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
