import React, { useState } from 'react';
import { DailyMDMEntry, SchoolProfile, StockOpeningAndReceipts, MDMNorms } from '../types';
import { formatKg, formatInr, aggregateMonthlyEntries } from '../utils/mdmCalculations';
import { Printer, Edit3, CheckCircle, FileText, Download } from 'lucide-react';

interface MprReportViewProps {
  entries: DailyMDMEntry[];
  profile: SchoolProfile;
  stock: StockOpeningAndReceipts;
  norms: MDMNorms;
  selectedMonth: string;
  onUpdateStock: (stock: StockOpeningAndReceipts) => void;
}

export const MprReportView: React.FC<MprReportViewProps> = ({
  entries,
  profile,
  stock,
  norms,
  selectedMonth,
  onUpdateStock,
}) => {
  const [isEditing, setIsEditing] = useState(false);
  
  // Stock & Financial States
  const [openingWheat, setOpeningWheat] = useState(stock.openingWheatKg);
  const [receivedWheat, setReceivedWheat] = useState(stock.receivedWheatKg);
  const [openingRice, setOpeningRice] = useState(stock.openingRiceKg);
  const [receivedRice, setReceivedRice] = useState(stock.receivedRiceKg);

  const [openingCookingCash, setOpeningCookingCash] = useState(stock.openingCookingCash);
  const [receivedCookingCash, setReceivedCookingCash] = useState(stock.receivedCookingCash);
  const [receivedCchCash, setReceivedCchCash] = useState(stock.receivedCchCash);

  const totals = aggregateMonthlyEntries(entries);

  // Consumptions in KG
  const consumedWheatKg = totals.totalWheatGrams / 1000;
  const consumedRiceKg = totals.totalRiceGrams / 1000;
  const totalConsumedGrainKg = consumedWheatKg + consumedRiceKg;

  // Grain Balances
  const totalAvailWheatKg = openingWheat + receivedWheat;
  const closingWheatKg = Math.max(0, totalAvailWheatKg - consumedWheatKg);

  const totalAvailRiceKg = openingRice + receivedRice;
  const closingRiceKg = Math.max(0, totalAvailRiceKg - consumedRiceKg);

  // Financial Calculations
  const cookingCostExpended = totals.totalCookingCost;
  const totalAvailCookingCash = openingCookingCash + receivedCookingCash;
  const closingCookingCash = totalAvailCookingCash - cookingCostExpended;

  // CCH Calculation (assuming 2 helpers if enrolled > 50)
  const totalEnrolled = profile.primaryEnrolled + profile.upperPrimaryEnrolled;
  const helperCount = totalEnrolled > 150 ? 3 : totalEnrolled > 50 ? 2 : 1;
  const cchMonthlyCost = helperCount * norms.cchMonthlyHonorarium;

  const monthName = new Date(`${selectedMonth}-01`).toLocaleDateString('hi-IN', {
    month: 'long',
    year: 'numeric',
  });

  const handleSaveStock = () => {
    onUpdateStock({
      ...stock,
      openingWheatKg: Number(openingWheat) || 0,
      receivedWheatKg: Number(receivedWheat) || 0,
      openingRiceKg: Number(openingRice) || 0,
      receivedRiceKg: Number(receivedRice) || 0,
      openingCookingCash: Number(openingCookingCash) || 0,
      receivedCookingCash: Number(receivedCookingCash) || 0,
      receivedCchCash: Number(receivedCchCash) || 0,
    });
    setIsEditing(false);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-6 space-y-6">
      
      {/* Action Banner */}
      <div className="no-print bg-white rounded-2xl border border-slate-200 p-4 sm:p-5 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-700 text-white flex items-center justify-center font-bold text-lg shadow shrink-0">
            📑
          </div>
          <div>
            <h2 className="text-base sm:text-lg font-bold text-slate-900">
              मासिक प्रगति प्रतिवेदन (MPR - PM POSHAN): {monthName}
            </h2>
            <p className="text-xs text-slate-500">
              राजस्थान सरकार, स्कूल शिक्षा विभाग के मानक प्रपत्र के अनुसार स्वतः जनरेटेड
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => setIsEditing(!isEditing)}
            className="bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-semibold px-3 py-2 rounded-xl border border-slate-300 transition-all flex items-center gap-1.5"
          >
            <Edit3 className="w-3.5 h-3.5" />
            <span>{isEditing ? 'संपादन बंद करें' : 'आवक / बजट राशि बदलें'}</span>
          </button>

          <button
            onClick={() => window.print()}
            className="bg-emerald-700 hover:bg-emerald-600 text-white text-xs font-bold px-4 py-2 rounded-xl flex items-center gap-1.5 shadow transition-all"
          >
            <Printer className="w-4 h-4" />
            <span>सरकारी A4 फॉर्मेट प्रिंट करें</span>
          </button>
        </div>
      </div>

      {/* Edit Opening / Receipt Panel */}
      {isEditing && (
        <div className="no-print bg-amber-50/70 border border-amber-200 rounded-2xl p-5 shadow-sm space-y-4">
          <h3 className="text-xs font-bold text-amber-950 uppercase tracking-wider">
            खाद्यान्न आवक (FCI Lifting) एवं कुकिंग कन्वर्जन बजट प्रविष्टि
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">गेहूँ प्रारंभिक शेष (kg):</label>
              <input
                type="number"
                step="0.001"
                value={openingWheat}
                onChange={(e) => setOpeningWheat(parseFloat(e.target.value) || 0)}
                className="w-full border border-amber-300 rounded-lg p-2 text-sm bg-white font-bold"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">माह में प्राप्त गेहूँ (kg):</label>
              <input
                type="number"
                step="0.001"
                value={receivedWheat}
                onChange={(e) => setReceivedWheat(parseFloat(e.target.value) || 0)}
                className="w-full border border-amber-300 rounded-lg p-2 text-sm bg-white font-bold"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">चावल प्रारंभिक शेष (kg):</label>
              <input
                type="number"
                step="0.001"
                value={openingRice}
                onChange={(e) => setOpeningRice(parseFloat(e.target.value) || 0)}
                className="w-full border border-amber-300 rounded-lg p-2 text-sm bg-white font-bold"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">माह में प्राप्त चावल (kg):</label>
              <input
                type="number"
                step="0.001"
                value={receivedRice}
                onChange={(e) => setReceivedRice(parseFloat(e.target.value) || 0)}
                className="w-full border border-amber-300 rounded-lg p-2 text-sm bg-white font-bold"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">कुकिंग राशि प्रारंभिक शेष (₹):</label>
              <input
                type="number"
                step="0.01"
                value={openingCookingCash}
                onChange={(e) => setOpeningCookingCash(parseFloat(e.target.value) || 0)}
                className="w-full border border-amber-300 rounded-lg p-2 text-sm bg-white font-bold"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">माह में प्राप्त कुकिंग राशि (₹):</label>
              <input
                type="number"
                step="0.01"
                value={receivedCookingCash}
                onChange={(e) => setReceivedCookingCash(parseFloat(e.target.value) || 0)}
                className="w-full border border-amber-300 rounded-lg p-2 text-sm bg-white font-bold"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">कुक-कम-हेल्पर प्राप्त राशि (₹):</label>
              <input
                type="number"
                step="0.01"
                value={receivedCchCash}
                onChange={(e) => setReceivedCchCash(parseFloat(e.target.value) || 0)}
                className="w-full border border-amber-300 rounded-lg p-2 text-sm bg-white font-bold"
              />
            </div>
          </div>

          <div className="flex justify-end pt-2">
            <button
              onClick={handleSaveStock}
              className="bg-emerald-700 hover:bg-emerald-600 text-white font-bold text-xs px-5 py-2 rounded-xl shadow"
            >
              डेटा सुरक्षित करें
            </button>
          </div>
        </div>
      )}

      {/* Official A4 Print Form Container */}
      <div className="print-container bg-white rounded-2xl border border-slate-200 p-6 md:p-8 shadow-sm space-y-6">
        
        {/* Rajasthan Govt Emblem & Proforma Header */}
        <div className="text-center pb-4 border-b-2 border-slate-900 space-y-1">
          <p className="text-xs font-bold tracking-widest text-slate-600 uppercase">
            राजस्थान सरकार • स्कूल शिक्षा विभाग
          </p>
          <h1 className="text-lg md:text-xl font-extrabold text-slate-900">
            प्रधानमंत्री पोषण शक्ति निर्माण योजना (PM-POSHAN / MDM)
          </h1>
          <h2 className="text-sm font-bold text-slate-800 bg-slate-100 inline-block px-4 py-1 rounded border border-slate-300">
            मासिक प्रगति प्रतिवेदन (Monthly Progress Report - MPR) — माह: {monthName}
          </h2>
        </div>

        {/* School Master Info Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-xs border border-slate-300 p-3 bg-slate-50/50">
          <div><span className="font-bold">विद्यालय:</span> {profile.schoolName}</div>
          <div><span className="font-bold">U-DISE कोड:</span> {profile.udiseCode}</div>
          <div><span className="font-bold">ब्लॉक:</span> {profile.block}</div>
          <div><span className="font-bold">जिला:</span> {profile.district}</div>
          <div><span className="font-bold">प्राथ. नामांकन:</span> {profile.primaryEnrolled}</div>
          <div><span className="font-bold">उच्च प्राथ. नामांकन:</span> {profile.upperPrimaryEnrolled}</div>
          <div><span className="font-bold">कुल नामांकन:</span> {totalEnrolled}</div>
          <div><span className="font-bold">माह के कार्य दिवस:</span> {totals.workingDays} दिवस</div>
        </div>

        {/* Section 1: Benefited Students & Attendance */}
        <div className="space-y-2">
          <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wide bg-slate-200 p-1.5 border border-slate-300">
            1. छात्र नामांकन एवं वास्तविक पोषाहार लाभान्वित विवरण
          </h3>
          <table className="w-full text-xs border border-slate-300 text-center">
            <thead className="bg-slate-100 font-bold">
              <tr>
                <th className="p-2 border border-slate-300 text-left">कक्षा वर्ग</th>
                <th className="p-2 border border-slate-300">कुल नामांकन</th>
                <th className="p-2 border border-slate-300">माह में कार्य दिवस</th>
                <th className="p-2 border border-slate-300">कुल लाभान्वित छात्र उपस्थिति</th>
                <th className="p-2 border border-slate-300">औसत दैनिक उपस्थिति</th>
                <th className="p-2 border border-slate-300">लाभान्वित प्रतिशत (%)</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className="p-2 border border-slate-300 text-left font-bold">प्राथमिक (कक्षा 1 से 5)</td>
                <td className="p-2 border border-slate-300">{profile.primaryEnrolled}</td>
                <td className="p-2 border border-slate-300">{totals.workingDays}</td>
                <td className="p-2 border border-slate-300 font-bold">{totals.totalPrimaryBenefited}</td>
                <td className="p-2 border border-slate-300">
                  {totals.workingDays > 0 ? (totals.totalPrimaryBenefited / totals.workingDays).toFixed(1) : 0}
                </td>
                <td className="p-2 border border-slate-300 font-semibold">
                  {profile.primaryEnrolled > 0 && totals.workingDays > 0
                    ? ((totals.totalPrimaryBenefited / (profile.primaryEnrolled * totals.workingDays)) * 100).toFixed(1) + '%'
                    : '-'}
                </td>
              </tr>
              <tr>
                <td className="p-2 border border-slate-300 text-left font-bold">उच्च प्राथमिक (कक्षा 6 से 8)</td>
                <td className="p-2 border border-slate-300">{profile.upperPrimaryEnrolled}</td>
                <td className="p-2 border border-slate-300">{totals.workingDays}</td>
                <td className="p-2 border border-slate-300 font-bold">{totals.totalUpperPrimaryBenefited}</td>
                <td className="p-2 border border-slate-300">
                  {totals.workingDays > 0 ? (totals.totalUpperPrimaryBenefited / totals.workingDays).toFixed(1) : 0}
                </td>
                <td className="p-2 border border-slate-300 font-semibold">
                  {profile.upperPrimaryEnrolled > 0 && totals.workingDays > 0
                    ? ((totals.totalUpperPrimaryBenefited / (profile.upperPrimaryEnrolled * totals.workingDays)) * 100).toFixed(1) + '%'
                    : '-'}
                </td>
              </tr>
            </tbody>
            <tfoot className="bg-slate-200 font-bold">
              <tr>
                <td className="p-2 border border-slate-400 text-left">कुल योग (Total):</td>
                <td className="p-2 border border-slate-400">{totalEnrolled}</td>
                <td className="p-2 border border-slate-400">{totals.workingDays}</td>
                <td className="p-2 border border-slate-400 text-emerald-950 font-extrabold">{totals.totalStudentsBenefited}</td>
                <td className="p-2 border border-slate-400">
                  {totals.workingDays > 0 ? (totals.totalStudentsBenefited / totals.workingDays).toFixed(1) : 0}
                </td>
                <td className="p-2 border border-slate-400 text-emerald-900">
                  {totalEnrolled > 0 && totals.workingDays > 0
                    ? ((totals.totalStudentsBenefited / (totalEnrolled * totals.workingDays)) * 100).toFixed(1) + '%'
                    : '-'}
                </td>
              </tr>
            </tfoot>
          </table>
        </div>

        {/* Section 2: Foodgrains Consumption (Wheat & Rice) */}
        <div className="space-y-2">
          <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wide bg-slate-200 p-1.5 border border-slate-300">
            2. खाद्यान्न (Foodgrains) आवंटन, प्राप्ति एवं उपभोग विवरण (किग्रा में)
          </h3>
          <table className="w-full text-xs border border-slate-300 text-right">
            <thead className="bg-slate-100 font-bold text-slate-900">
              <tr>
                <th className="p-2 border border-slate-300 text-left">खाद्यान्न मद</th>
                <th className="p-2 border border-slate-300">प्रारंभिक शेष (Opening)</th>
                <th className="p-2 border border-slate-300">माह में प्राप्त (Lifting)</th>
                <th className="p-2 border border-slate-300">कुल उपलब्धता (Total)</th>
                <th className="p-2 border border-slate-300">माह में उपभोग (Consumed)</th>
                <th className="p-2 border border-slate-300">अंतिम शेष (Closing)</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className="p-2 border border-slate-300 text-left font-bold">गेहूँ (Wheat)</td>
                <td className="p-2 border border-slate-300 font-mono">{openingWheat.toFixed(3)}</td>
                <td className="p-2 border border-slate-300 font-mono">{receivedWheat.toFixed(3)}</td>
                <td className="p-2 border border-slate-300 font-mono font-semibold">{totalAvailWheatKg.toFixed(3)}</td>
                <td className="p-2 border border-slate-300 font-mono text-rose-700 font-bold">{consumedWheatKg.toFixed(3)}</td>
                <td className="p-2 border border-slate-300 font-mono text-emerald-800 font-extrabold">{closingWheatKg.toFixed(3)}</td>
              </tr>
              <tr>
                <td className="p-2 border border-slate-300 text-left font-bold">चावल (Rice)</td>
                <td className="p-2 border border-slate-300 font-mono">{openingRice.toFixed(3)}</td>
                <td className="p-2 border border-slate-300 font-mono">{receivedRice.toFixed(3)}</td>
                <td className="p-2 border border-slate-300 font-mono font-semibold">{totalAvailRiceKg.toFixed(3)}</td>
                <td className="p-2 border border-slate-300 font-mono text-rose-700 font-bold">{consumedRiceKg.toFixed(3)}</td>
                <td className="p-2 border border-slate-300 font-mono text-emerald-800 font-extrabold">{closingRiceKg.toFixed(3)}</td>
              </tr>
            </tbody>
            <tfoot className="bg-slate-200 font-bold">
              <tr>
                <td className="p-2 border border-slate-400 text-left">कुल खाद्यान्न योग:</td>
                <td className="p-2 border border-slate-400 font-mono">{(openingWheat + openingRice).toFixed(3)}</td>
                <td className="p-2 border border-slate-400 font-mono">{(receivedWheat + receivedRice).toFixed(3)}</td>
                <td className="p-2 border border-slate-400 font-mono">{(totalAvailWheatKg + totalAvailRiceKg).toFixed(3)}</td>
                <td className="p-2 border border-slate-400 font-mono text-rose-800 font-extrabold">{totalConsumedGrainKg.toFixed(3)}</td>
                <td className="p-2 border border-slate-400 font-mono text-emerald-900 font-extrabold">{(closingWheatKg + closingRiceKg).toFixed(3)}</td>
              </tr>
            </tfoot>
          </table>
        </div>

        {/* Section 3: Cooking Conversion Cost Ledger */}
        <div className="space-y-2">
          <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wide bg-slate-200 p-1.5 border border-slate-300">
            3. कुकिंग कन्वर्जन सामग्री राशि विवरण (रुपयों में)
          </h3>
          <table className="w-full text-xs border border-slate-300 text-right">
            <thead className="bg-slate-100 font-bold text-slate-900">
              <tr>
                <th className="p-2 border border-slate-300 text-left">विवरण / मद</th>
                <th className="p-2 border border-slate-300">प्राथमिक (दर: ₹{norms.primaryCookingCost})</th>
                <th className="p-2 border border-slate-300">उच्च प्राथमिक (दर: ₹{norms.upperPrimaryCookingCost})</th>
                <th className="p-2 border border-slate-300">कुल योग (₹)</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className="p-2 border border-slate-300 text-left">कुल लाभान्वित छात्र संख्या</td>
                <td className="p-2 border border-slate-300 font-bold">{totals.totalPrimaryBenefited}</td>
                <td className="p-2 border border-slate-300 font-bold">{totals.totalUpperPrimaryBenefited}</td>
                <td className="p-2 border border-slate-300 font-extrabold text-slate-900">{totals.totalStudentsBenefited}</td>
              </tr>
              <tr>
                <td className="p-2 border border-slate-300 text-left font-bold">माह का कुल कुकिंग व्यय (Meals × Rate)</td>
                <td className="p-2 border border-slate-300 font-mono">
                  {formatInr(totals.totalPrimaryBenefited * norms.primaryCookingCost)}
                </td>
                <td className="p-2 border border-slate-300 font-mono">
                  {formatInr(totals.totalUpperPrimaryBenefited * norms.upperPrimaryCookingCost)}
                </td>
                <td className="p-2 border border-slate-300 font-mono font-extrabold text-rose-700">
                  {formatInr(cookingCostExpended)}
                </td>
              </tr>
            </tbody>
          </table>

          {/* Cooking Cash Ledger Flow */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-xs border border-slate-300 p-2.5 bg-slate-50 font-medium">
            <div>प्रारंभिक शेष: <span className="font-bold font-mono">{formatInr(openingCookingCash)}</span></div>
            <div>माह में प्राप्त: <span className="font-bold font-mono">{formatInr(receivedCookingCash)}</span></div>
            <div>कुल व्यय: <span className="font-bold font-mono text-rose-700">{formatInr(cookingCostExpended)}</span></div>
            <div>अंतिम अवशेष: <span className="font-bold font-mono text-emerald-800">{formatInr(closingCookingCash)}</span></div>
          </div>
        </div>

        {/* Section 4: Cook-cum-Helper Honorarium */}
        <div className="space-y-2">
          <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wide bg-slate-200 p-1.5 border border-slate-300">
            4. कुक-कम-हेल्पर (CCH) मानदेय भुगतान विवरण
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-2 text-xs border border-slate-300 p-3 bg-white">
            <div>
              <span className="font-bold">कार्यरत कुक संख्या:</span> {helperCount} ({profile.cchName1} {profile.cchName2 ? `, ${profile.cchName2}` : ''})
            </div>
            <div>
              <span className="font-bold">निर्धारित मानदेय दर:</span> ₹{norms.cchMonthlyHonorarium} प्रति कुक/माह
            </div>
            <div>
              <span className="font-bold">माह का कुल मानदेय दायित्व:</span> <span className="font-bold font-mono text-emerald-900">{formatInr(cchMonthlyCost)}</span>
            </div>
          </div>
        </div>

        {/* Certificate Declaration & Signatures */}
        <div className="pt-4 space-y-8">
          <p className="text-[11px] text-slate-700 italic text-justify leading-relaxed">
            प्रमाणित किया जाता है कि माह <strong>{monthName}</strong> में PM पोषण (MDM) योजनांतर्गत सभी कार्य दिवसों में मीनू अनुसार गुणवत्तापूर्ण, स्वच्छ व ताजा गर्म भोजन तैयार कर पात्र नामांकित विद्यार्थियों को परोसा गया। खाद्यान्न उपभोग एवं व्यय की गई राशि विद्यालय के दैनिक MDM रजिस्टर व रोकड़ बही से मिलान कर ली गई है एवं पूर्णतः सही है।
          </p>

          <div className="grid grid-cols-3 text-center text-xs font-bold text-slate-900 pt-6">
            <div>
              <p className="border-t border-slate-400 pt-1 w-44 mx-auto">हस्ताक्षर पोषाहार प्रभारी</p>
              <p className="text-[10px] text-slate-500 font-normal mt-0.5">{profile.inchargeName || 'प्रभारी शिक्षक'}</p>
            </div>
            <div>
              <p className="border-t border-slate-400 pt-1 w-44 mx-auto">हस्ताक्षर विद्यालय SMC अध्यक्ष</p>
              <p className="text-[10px] text-slate-500 font-normal mt-0.5">अध्यक्ष / सदस्य</p>
            </div>
            <div>
              <p className="border-t border-slate-400 pt-1 w-44 mx-auto">हस्ताक्षर संस्था प्रधान (सील सहित)</p>
              <p className="text-[10px] text-slate-500 font-normal mt-0.5">{profile.headmasterName || 'संस्था प्रधान'}</p>
            </div>
          </div>
        </div>

      </div>

    </div>
  );
};
