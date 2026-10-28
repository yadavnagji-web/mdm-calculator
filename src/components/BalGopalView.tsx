import React, { useState } from 'react';
import { DailyMDMEntry, SchoolProfile, StockOpeningAndReceipts, MDMNorms } from '../types';
import { formatKg, aggregateMonthlyEntries } from '../utils/mdmCalculations';
import { Milk, Printer, PlusCircle, AlertCircle, Sparkles, CheckCircle2 } from 'lucide-react';

interface BalGopalViewProps {
  entries: DailyMDMEntry[];
  profile: SchoolProfile;
  stock: StockOpeningAndReceipts;
  norms: MDMNorms;
  selectedMonth: string;
  onUpdateStock: (stock: StockOpeningAndReceipts) => void;
}

export const BalGopalView: React.FC<BalGopalViewProps> = ({
  entries,
  profile,
  stock,
  norms,
  selectedMonth,
  onUpdateStock,
}) => {
  const [isEditingStock, setIsEditingStock] = useState(false);
  const [openingMilk, setOpeningMilk] = useState(stock.openingMilkPowderKg);
  const [receivedMilk, setReceivedMilk] = useState(stock.receivedMilkPowderKg);
  const [openingSugar, setOpeningSugar] = useState(stock.openingSugarKg);
  const [receivedSugar, setReceivedSugar] = useState(stock.receivedSugarKg);

  const totals = aggregateMonthlyEntries(entries);
  
  // Consumed in KG
  const consumedMilkKg = totals.totalMilkPowderGrams / 1000;
  const consumedSugarKg = totals.totalSugarGrams / 1000;

  // Total Available
  const totalAvailMilkKg = openingMilk + receivedMilk;
  const totalAvailSugarKg = openingSugar + receivedSugar;

  // Closing Balance
  const closingMilkKg = Math.max(0, totalAvailMilkKg - consumedMilkKg);
  const closingSugarKg = Math.max(0, totalAvailSugarKg - consumedSugarKg);

  const monthName = new Date(`${selectedMonth}-01`).toLocaleDateString('hi-IN', {
    month: 'long',
    year: 'numeric',
  });

  const handleSaveStock = () => {
    onUpdateStock({
      ...stock,
      openingMilkPowderKg: Number(openingMilk) || 0,
      receivedMilkPowderKg: Number(receivedMilk) || 0,
      openingSugarKg: Number(openingSugar) || 0,
      receivedSugarKg: Number(receivedSugar) || 0,
    });
    setIsEditingStock(false);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-6 space-y-6">
      
      {/* Header Banner */}
      <div className="no-print bg-gradient-to-r from-sky-700 via-blue-700 to-indigo-800 text-white rounded-2xl p-5 shadow-md flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-white text-sky-700 flex items-center justify-center font-bold text-2xl shadow">
            🥛
          </div>
          <div>
            <h2 className="text-base sm:text-lg font-bold">
              मुख्यमंत्री बाल गोपाल योजना (MMBGY) - मासिक स्टॉक व वितरण रजिस्टर
            </h2>
            <p className="text-xs text-sky-100 mt-0.5">
              दूध पाउडर, चीनी एवं तैयार पौष्टिक गर्म दूध वितरण का सम्पूर्ण लेखा-जोखा • माह: {monthName}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsEditingStock(!isEditingStock)}
            className="bg-white/20 hover:bg-white/30 text-white text-xs font-semibold px-3 py-2 rounded-xl backdrop-blur transition-all border border-white/20"
          >
            {isEditingStock ? 'कैंसिल करें' : 'आवक / स्टॉक बदलें'}
          </button>
          
          <button
            onClick={() => window.print()}
            className="bg-amber-400 hover:bg-amber-300 text-sky-950 text-xs font-bold px-3.5 py-2 rounded-xl flex items-center gap-1.5 shadow transition-all"
          >
            <Printer className="w-4 h-4" />
            <span>प्रिंट A4</span>
          </button>
        </div>
      </div>

      {/* Stock Edit Panel (if open) */}
      {isEditingStock && (
        <div className="no-print bg-sky-50 border border-sky-200 rounded-2xl p-5 shadow-sm space-y-4">
          <h3 className="text-xs font-bold text-sky-950 uppercase tracking-wider flex items-center gap-2">
            <PlusCircle className="w-4 h-4 text-sky-700" />
            <span>स्टॉक एवं आवक प्रविष्टि (Stock In & Opening Balance)</span>
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                दूध पाउडर प्रारंभिक शेष (kg):
              </label>
              <input
                type="number"
                step="0.001"
                value={openingMilk}
                onChange={(e) => setOpeningMilk(parseFloat(e.target.value) || 0)}
                className="w-full border border-sky-300 rounded-lg p-2 text-sm bg-white font-bold"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                माह में प्राप्त दूध पाउडर (kg):
              </label>
              <input
                type="number"
                step="0.001"
                value={receivedMilk}
                onChange={(e) => setReceivedMilk(parseFloat(e.target.value) || 0)}
                className="w-full border border-sky-300 rounded-lg p-2 text-sm bg-white font-bold"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                चीनी प्रारंभिक शेष (kg):
              </label>
              <input
                type="number"
                step="0.001"
                value={openingSugar}
                onChange={(e) => setOpeningSugar(parseFloat(e.target.value) || 0)}
                className="w-full border border-sky-300 rounded-lg p-2 text-sm bg-white font-bold"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                माह में प्राप्त/क्रय चीनी (kg):
              </label>
              <input
                type="number"
                step="0.001"
                value={receivedSugar}
                onChange={(e) => setReceivedSugar(parseFloat(e.target.value) || 0)}
                className="w-full border border-sky-300 rounded-lg p-2 text-sm bg-white font-bold"
              />
            </div>
          </div>

          <div className="flex justify-end pt-2">
            <button
              onClick={handleSaveStock}
              className="bg-sky-700 hover:bg-sky-600 text-white font-bold text-xs px-5 py-2 rounded-xl shadow"
            >
              स्टॉक सुरक्षित करें
            </button>
          </div>
        </div>
      )}

      {/* Stock Cards (KPIs) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 no-print">
        
        {/* Milk Powder Balance */}
        <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-sm space-y-1">
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wide">
            दूध पाउडर अंतिम शेष (Closing)
          </span>
          <div className="text-2xl font-extrabold text-sky-700">
            {closingMilkKg.toFixed(3)} <span className="text-xs font-normal text-slate-500">किग्रा</span>
          </div>
          <div className="text-[11px] text-slate-600 flex justify-between pt-1 border-t border-slate-100">
            <span>कुल उपलब्ध: {totalAvailMilkKg.toFixed(3)} kg</span>
            <span className="text-rose-600">खपत: {consumedMilkKg.toFixed(3)} kg</span>
          </div>
        </div>

        {/* Sugar Balance */}
        <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-sm space-y-1">
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wide">
            चीनी अंतिम शेष (Closing)
          </span>
          <div className="text-2xl font-extrabold text-amber-700">
            {closingSugarKg.toFixed(3)} <span className="text-xs font-normal text-slate-500">किग्रा</span>
          </div>
          <div className="text-[11px] text-slate-600 flex justify-between pt-1 border-t border-slate-100">
            <span>कुल उपलब्ध: {totalAvailSugarKg.toFixed(3)} kg</span>
            <span className="text-rose-600">खपत: {consumedSugarKg.toFixed(3)} kg</span>
          </div>
        </div>

        {/* Total Milk Prepared */}
        <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-sm space-y-1">
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wide">
            कुल तैयार दूध (Prepared Milk)
          </span>
          <div className="text-2xl font-extrabold text-slate-900">
            {(totals.totalPreparedMilkMl / 1000).toFixed(1)} <span className="text-xs font-normal text-slate-500">लीटर</span>
          </div>
          <div className="text-[11px] text-slate-600 pt-1 border-t border-slate-100">
            दूध वितरण दिवस: {totals.milkDistributionDays} दिवस
          </div>
        </div>

        {/* Benefited Students */}
        <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-sm space-y-1">
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wide">
            कुल लाभान्वित उपस्थिति
          </span>
          <div className="text-2xl font-extrabold text-emerald-700">
            {totals.totalStudentsBenefited} <span className="text-xs font-normal text-slate-500">छात्र उपस्थिति</span>
          </div>
          <div className="text-[11px] text-slate-600 pt-1 border-t border-slate-100">
            प्राथ: {totals.totalPrimaryBenefited} | उच्च प्राथ: {totals.totalUpperPrimaryBenefited}
          </div>
        </div>

      </div>

      {/* Official Rajasthan Govt Bal Gopal Abstract (Print-Ready) */}
      <div className="print-container bg-white rounded-2xl border border-slate-200 p-5 md:p-6 shadow-sm overflow-x-auto space-y-5">
        
        <div className="text-center pb-3 border-b-2 border-slate-800 space-y-1">
          <h3 className="text-base sm:text-lg font-bold text-slate-900">
            कार्यालय संस्था प्रधान - {profile.schoolName}
          </h3>
          <p className="text-xs text-slate-700 font-medium">
            ब्लॉक: {profile.block} | जिला: {profile.district} | U-DISE कोड: {profile.udiseCode}
          </p>
          <div className="inline-block bg-sky-100 border border-sky-300 px-3 py-1 rounded text-xs font-bold text-sky-950">
            मुख्यमंत्री बाल गोपाल योजना (MMBGY) मासिक सार पत्रक — माह: {monthName}
          </div>
        </div>

        {/* Table 1: Stock Summary */}
        <div className="space-y-2">
          <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
            भाग 1: दूध पाउडर एवं चीनी स्टॉक विवरण
          </h4>
          <table className="w-full text-xs border border-slate-300">
            <thead className="bg-slate-100 text-slate-900 font-bold">
              <tr>
                <th className="p-2 border border-slate-300 text-left">मद का नाम</th>
                <th className="p-2 border border-slate-300 text-right">प्रारंभिक शेष (kg)</th>
                <th className="p-2 border border-slate-300 text-right">माह में प्राप्त (kg)</th>
                <th className="p-2 border border-slate-300 text-right">कुल योग (kg)</th>
                <th className="p-2 border border-slate-300 text-right">माह में कुल खपत (kg)</th>
                <th className="p-2 border border-slate-300 text-right">माह के अंत में अवशेष (kg)</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className="p-2 border border-slate-300 font-bold">दूध पाउडर (Milk Powder)</td>
                <td className="p-2 border border-slate-300 text-right font-mono">{openingMilk.toFixed(3)}</td>
                <td className="p-2 border border-slate-300 text-right font-mono">{receivedMilk.toFixed(3)}</td>
                <td className="p-2 border border-slate-300 text-right font-mono font-semibold">{totalAvailMilkKg.toFixed(3)}</td>
                <td className="p-2 border border-slate-300 text-right font-mono text-rose-700 font-bold">{consumedMilkKg.toFixed(3)}</td>
                <td className="p-2 border border-slate-300 text-right font-mono text-emerald-800 font-extrabold">{closingMilkKg.toFixed(3)}</td>
              </tr>
              <tr>
                <td className="p-2 border border-slate-300 font-bold">चीनी (Sugar)</td>
                <td className="p-2 border border-slate-300 text-right font-mono">{openingSugar.toFixed(3)}</td>
                <td className="p-2 border border-slate-300 text-right font-mono">{receivedSugar.toFixed(3)}</td>
                <td className="p-2 border border-slate-300 text-right font-mono font-semibold">{totalAvailSugarKg.toFixed(3)}</td>
                <td className="p-2 border border-slate-300 text-right font-mono text-rose-700 font-bold">{consumedSugarKg.toFixed(3)}</td>
                <td className="p-2 border border-slate-300 text-right font-mono text-emerald-800 font-extrabold">{closingSugarKg.toFixed(3)}</td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Table 2: Level-wise Distribution Norms & Actuals */}
        <div className="space-y-2 pt-2">
          <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
            भाग 2: वर्ग-वार छात्र लाभान्वित एवं मानक उपभोग विवरण
          </h4>
          <table className="w-full text-xs border border-slate-300">
            <thead className="bg-slate-100 text-slate-900 font-bold">
              <tr>
                <th className="p-2 border border-slate-300 text-left">कक्षा स्तर</th>
                <th className="p-2 border border-slate-300 text-center">दूध वितरण दिवस</th>
                <th className="p-2 border border-slate-300 text-center">कुल लाभान्वित छात्र</th>
                <th className="p-2 border border-slate-300 text-right">दूध पाउडर दर</th>
                <th className="p-2 border border-slate-300 text-right">कुल पाउडर खपत</th>
                <th className="p-2 border border-slate-300 text-right">चीनी दर</th>
                <th className="p-2 border border-slate-300 text-right">कुल चीनी खपत</th>
                <th className="p-2 border border-slate-300 text-right">तैयार दूध (L)</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className="p-2 border border-slate-300 font-bold">प्राथमिक (कक्षा 1 से 5)</td>
                <td className="p-2 border border-slate-300 text-center">{totals.milkDistributionDays}</td>
                <td className="p-2 border border-slate-300 text-center font-bold">{totals.totalPrimaryBenefited}</td>
                <td className="p-2 border border-slate-300 text-right">15 ग्राम</td>
                <td className="p-2 border border-slate-300 text-right font-mono">
                  {((totals.totalPrimaryBenefited * norms.primaryMilkPowderGrams) / 1000).toFixed(3)} kg
                </td>
                <td className="p-2 border border-slate-300 text-right">8.4 ग्राम</td>
                <td className="p-2 border border-slate-300 text-right font-mono">
                  {((totals.totalPrimaryBenefited * norms.primarySugarGrams) / 1000).toFixed(3)} kg
                </td>
                <td className="p-2 border border-slate-300 text-right font-mono">
                  {((totals.totalPrimaryBenefited * norms.primaryPreparedMilkMl) / 1000).toFixed(1)} L
                </td>
              </tr>
              <tr>
                <td className="p-2 border border-slate-300 font-bold">उच्च प्राथमिक (कक्षा 6 से 8)</td>
                <td className="p-2 border border-slate-300 text-center">{totals.milkDistributionDays}</td>
                <td className="p-2 border border-slate-300 text-center font-bold">{totals.totalUpperPrimaryBenefited}</td>
                <td className="p-2 border border-slate-300 text-right">20 ग्राम</td>
                <td className="p-2 border border-slate-300 text-right font-mono">
                  {((totals.totalUpperPrimaryBenefited * norms.upperPrimaryMilkPowderGrams) / 1000).toFixed(3)} kg
                </td>
                <td className="p-2 border border-slate-300 text-right">10.2 ग्राम</td>
                <td className="p-2 border border-slate-300 text-right font-mono">
                  {((totals.totalUpperPrimaryBenefited * norms.upperPrimarySugarGrams) / 1000).toFixed(3)} kg
                </td>
                <td className="p-2 border border-slate-300 text-right font-mono">
                  {((totals.totalUpperPrimaryBenefited * norms.upperPrimaryPreparedMilkMl) / 1000).toFixed(1)} L
                </td>
              </tr>
            </tbody>
            <tfoot className="bg-slate-200 text-slate-900 font-bold">
              <tr>
                <td className="p-2 border border-slate-400">कुल योग (Total):</td>
                <td className="p-2 border border-slate-400 text-center">{totals.milkDistributionDays}</td>
                <td className="p-2 border border-slate-400 text-center text-emerald-950 font-extrabold">{totals.totalStudentsBenefited}</td>
                <td className="p-2 border border-slate-400 text-right">-</td>
                <td className="p-2 border border-slate-400 text-right font-mono text-sky-950 font-extrabold">
                  {consumedMilkKg.toFixed(3)} kg
                </td>
                <td className="p-2 border border-slate-400 text-right">-</td>
                <td className="p-2 border border-slate-400 text-right font-mono text-sky-950 font-extrabold">
                  {consumedSugarKg.toFixed(3)} kg
                </td>
                <td className="p-2 border border-slate-400 text-right font-mono text-sky-950 font-extrabold">
                  {(totals.totalPreparedMilkMl / 1000).toFixed(1)} L
                </td>
              </tr>
            </tfoot>
          </table>
        </div>

        {/* Certificate Text & Signatures */}
        <div className="pt-4 space-y-8">
          <p className="text-[11px] text-slate-700 italic text-justify leading-relaxed">
            प्रमाणित किया जाता है कि मुख्यमंत्री बाल गोपाल योजना के अंतर्गत माह <strong>{monthName}</strong> में निर्धारित मेनू व रोस्टर के अनुसार छात्रों को स्वच्छ, शुद्ध व गर्म दूध तैयार कर वितरित किया गया तथा उपरोक्त स्टॉक व उपभोग आंकड़े विद्यालय के वास्तविक दैनिक वितरण रजिस्टर के अनुसार पूर्णतः सत्य एवं प्रमाणित हैं।
          </p>

          <div className="grid grid-cols-2 text-center text-xs font-bold text-slate-900 pt-6">
            <div>
              <p className="border-t border-slate-400 pt-1 w-48 mx-auto">हस्ताक्षर बाल गोपाल योजना प्रभारी</p>
            </div>
            <div>
              <p className="border-t border-slate-400 pt-1 w-48 mx-auto">हस्ताक्षर संस्था प्रधान (मय सील)</p>
            </div>
          </div>
        </div>

      </div>

    </div>
  );
};
