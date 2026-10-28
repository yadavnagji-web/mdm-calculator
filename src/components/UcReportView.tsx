import React, { useState } from 'react';
import { DailyMDMEntry, SchoolProfile, StockOpeningAndReceipts, MDMNorms } from '../types';
import { formatInr, aggregateMonthlyEntries } from '../utils/mdmCalculations';
import { Award, Printer, CheckCircle, Calendar } from 'lucide-react';

interface UcReportViewProps {
  entries: DailyMDMEntry[];
  profile: SchoolProfile;
  stock: StockOpeningAndReceipts;
  norms: MDMNorms;
  selectedMonth: string;
}

export const UcReportView: React.FC<UcReportViewProps> = ({
  entries,
  profile,
  stock,
  norms,
  selectedMonth,
}) => {
  const [periodType, setPeriodType] = useState<'monthly' | 'quarterly' | 'annual'>('monthly');
  
  const totals = aggregateMonthlyEntries(entries);
  const cookingCostExpended = totals.totalCookingCost;
  
  const helperCount = (profile.primaryEnrolled + profile.upperPrimaryEnrolled) > 150 ? 3 : (profile.primaryEnrolled + profile.upperPrimaryEnrolled) > 50 ? 2 : 1;
  const cchCost = helperCount * norms.cchMonthlyHonorarium;

  // Multipliers based on period
  const multiplier = periodType === 'annual' ? 10 : periodType === 'quarterly' ? 3 : 1;

  const totalCookingReceived = stock.receivedCookingCash * multiplier;
  const totalCookingOpening = stock.openingCookingCash;
  const totalCookingAvail = totalCookingOpening + totalCookingReceived;
  const totalCookingExpended = cookingCostExpended * multiplier;
  const totalCookingClosing = totalCookingAvail - totalCookingExpended;

  const totalCchReceived = stock.receivedCchCash * multiplier;
  const totalCchExpended = cchCost * multiplier;
  const totalCchClosing = Math.max(0, totalCchReceived - totalCchExpended);

  // Sugar cost for Bal Gopal scheme (say approx ₹44/kg)
  const sugarKg = (totals.totalSugarGrams / 1000) * multiplier;
  const sugarCost = Math.round(sugarKg * 44);

  const grandTotalExpended = totalCookingExpended + totalCchExpended + sugarCost;
  const grandTotalAvailable = totalCookingAvail + totalCchReceived + sugarCost;

  const monthName = new Date(`${selectedMonth}-01`).toLocaleDateString('hi-IN', {
    month: 'long',
    year: 'numeric',
  });

  const periodTitle =
    periodType === 'annual'
      ? 'वार्षिक उपयोगिता प्रमाण पत्र (Annual UC - सत्र 2026-27)'
      : periodType === 'quarterly'
      ? `त्रैमासिक उपयोगिता प्रमाण पत्र (Quarterly UC) — ${monthName}`
      : `मासिक उपयोगिता प्रमाण पत्र (Monthly UC) — माह: ${monthName}`;

  return (
    <div className="max-w-7xl mx-auto px-4 py-6 space-y-6">
      
      {/* Top Banner */}
      <div className="no-print bg-white rounded-2xl border border-slate-200 p-4 sm:p-5 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-500 text-slate-900 flex items-center justify-center font-bold text-lg shadow shrink-0">
            📜
          </div>
          <div>
            <h2 className="text-base sm:text-lg font-bold text-slate-900">
              उपयोगिता प्रमाण पत्र (Utilization Certificate - UC)
            </h2>
            <p className="text-xs text-slate-500">
              विभागीय एवं ब्लॉक कार्यालय ऑडिट हेतु मानक प्रपत्र (फॉर्म जी.एफ.आर. 12-सी आधारित)
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Period Selector */}
          <div className="bg-slate-100 p-1 rounded-xl flex items-center text-xs font-semibold">
            <button
              onClick={() => setPeriodType('monthly')}
              className={`px-3 py-1.5 rounded-lg transition-all ${
                periodType === 'monthly' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500'
              }`}
            >
              मासिक यूसी
            </button>
            <button
              onClick={() => setPeriodType('quarterly')}
              className={`px-3 py-1.5 rounded-lg transition-all ${
                periodType === 'quarterly' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500'
              }`}
            >
              त्रैमासिक यूसी
            </button>
            <button
              onClick={() => setPeriodType('annual')}
              className={`px-3 py-1.5 rounded-lg transition-all ${
                periodType === 'annual' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500'
              }`}
            >
              वार्षिक यूसी
            </button>
          </div>

          <button
            onClick={() => window.print()}
            className="bg-emerald-700 hover:bg-emerald-600 text-white text-xs font-bold px-4 py-2 rounded-xl flex items-center gap-1.5 shadow transition-all"
          >
            <Printer className="w-4 h-4" />
            <span>यूसी A4 प्रिंट करें</span>
          </button>
        </div>
      </div>

      {/* Official A4 Print Document */}
      <div className="print-container bg-white rounded-2xl border border-slate-200 p-6 md:p-8 shadow-sm space-y-6">
        
        {/* Certificate Header */}
        <div className="text-center pb-4 border-b-2 border-slate-900 space-y-1">
          <p className="text-xs font-bold text-slate-600 uppercase tracking-widest">
            कार्यालय संस्था प्रधान • स्कूल शिक्षा विभाग राजस्थान
          </p>
          <h1 className="text-lg md:text-xl font-extrabold text-slate-900">
            {profile.schoolName}
          </h1>
          <p className="text-xs text-slate-700 font-semibold">
            ब्लॉक: {profile.block} | जिला: {profile.district} | U-DISE कोड: {profile.udiseCode}
          </p>
          <div className="inline-block bg-slate-100 border border-slate-400 px-4 py-1 rounded text-xs font-bold text-slate-900 mt-2">
            {periodTitle}
          </div>
        </div>

        {/* Certificate Subject Text */}
        <div className="text-xs text-slate-800 space-y-2 leading-relaxed bg-slate-50 p-4 border border-slate-300 rounded">
          <p>
            <strong>विषय:</strong> प्रधानमंत्री पोषण शक्ति निर्माण (PM-POSHAN / MDM) एवं मुख्यमंत्री बाल गोपाल योजना के अंतर्गत प्राप्त राशि का उपयोगिता प्रमाण पत्र प्रेषण बाबत।
          </p>
          <p>
            प्रमाणित किया जाता है कि विद्यालय <strong>{profile.schoolName}</strong> (U-DISE: {profile.udiseCode}) को संबंधित अवधि हेतु आवंटित कुकिंग कन्वर्जन राशि, कुक-कम-हेल्पर मानदेय एवं बाल गोपाल योजनांतर्गत सामग्री राशि का मदवार आय-व्यय विवरण निम्नानुसार है:
          </p>
        </div>

        {/* Financial Table */}
        <table className="w-full text-xs border border-slate-400 text-right">
          <thead className="bg-slate-100 text-slate-900 font-bold">
            <tr>
              <th className="p-2 border border-slate-400 text-center w-10">क्र.सं.</th>
              <th className="p-2 border border-slate-400 text-left">योजना / मद का नाम</th>
              <th className="p-2 border border-slate-400">प्रारंभिक अवशेष (₹)</th>
              <th className="p-2 border border-slate-400">प्राप्त राशि / ग्रांट (₹)</th>
              <th className="p-2 border border-slate-400">कुल उपलब्ध राशि (₹)</th>
              <th className="p-2 border border-slate-400">वास्तविक व्यय राशि (₹)</th>
              <th className="p-2 border border-slate-400">अंतिम अवशेष राशि (₹)</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td className="p-2 border border-slate-400 text-center">1</td>
              <td className="p-2 border border-slate-400 text-left font-bold">
                MDM कुकिंग कन्वर्जन राशि (दाल, तेल, सब्जी, मसाला, ईंधन)
              </td>
              <td className="p-2 border border-slate-400 font-mono">{formatInr(totalCookingOpening)}</td>
              <td className="p-2 border border-slate-400 font-mono">{formatInr(totalCookingReceived)}</td>
              <td className="p-2 border border-slate-400 font-mono font-semibold">{formatInr(totalCookingAvail)}</td>
              <td className="p-2 border border-slate-400 font-mono font-bold text-rose-700">{formatInr(totalCookingExpended)}</td>
              <td className="p-2 border border-slate-400 font-mono font-extrabold text-emerald-800">{formatInr(totalCookingClosing)}</td>
            </tr>
            <tr>
              <td className="p-2 border border-slate-400 text-center">2</td>
              <td className="p-2 border border-slate-400 text-left font-bold">
                कुक-कम-हेल्पर (CCH) मानदेय भुगतान
              </td>
              <td className="p-2 border border-slate-400 font-mono">₹0.00</td>
              <td className="p-2 border border-slate-400 font-mono">{formatInr(totalCchReceived)}</td>
              <td className="p-2 border border-slate-400 font-mono font-semibold">{formatInr(totalCchReceived)}</td>
              <td className="p-2 border border-slate-400 font-mono font-bold text-rose-700">{formatInr(totalCchExpended)}</td>
              <td className="p-2 border border-slate-400 font-mono font-extrabold text-emerald-800">{formatInr(totalCchClosing)}</td>
            </tr>
            <tr>
              <td className="p-2 border border-slate-400 text-center">3</td>
              <td className="p-2 border border-slate-400 text-left font-bold">
                मुख्यमंत्री बाल गोपाल योजना (चीनी क्रय एवं अन्य व्यय)
              </td>
              <td className="p-2 border border-slate-400 font-mono">₹0.00</td>
              <td className="p-2 border border-slate-400 font-mono">{formatInr(sugarCost)}</td>
              <td className="p-2 border border-slate-400 font-mono font-semibold">{formatInr(sugarCost)}</td>
              <td className="p-2 border border-slate-400 font-mono font-bold text-rose-700">{formatInr(sugarCost)}</td>
              <td className="p-2 border border-slate-400 font-mono font-extrabold text-emerald-800">₹0.00</td>
            </tr>
          </tbody>
          <tfoot className="bg-slate-200 text-slate-900 font-bold border-t-2 border-slate-500">
            <tr>
              <td colSpan={2} className="p-2.5 border border-slate-500 text-center font-extrabold">
                महायोग (Grand Total):
              </td>
              <td className="p-2.5 border border-slate-500 font-mono">{formatInr(totalCookingOpening)}</td>
              <td className="p-2.5 border border-slate-500 font-mono">{formatInr(totalCookingReceived + totalCchReceived + sugarCost)}</td>
              <td className="p-2.5 border border-slate-500 font-mono">{formatInr(grandTotalAvailable)}</td>
              <td className="p-2.5 border border-slate-500 font-mono text-rose-800 font-extrabold">{formatInr(grandTotalExpended)}</td>
              <td className="p-2.5 border border-slate-500 font-mono text-emerald-950 font-extrabold">{formatInr(totalCookingClosing + totalCchClosing)}</td>
            </tr>
          </tfoot>
        </table>

        {/* Legal Declaration / Form GFR 12-C text */}
        <div className="space-y-4 pt-4 text-xs text-slate-800 leading-relaxed text-justify">
          <p>
            1. प्रमाणित किया जाता है कि योजनांतर्गत अवधि में कुल व्यय राशि <strong>{formatInr(grandTotalExpended)}</strong> का उपयोग पूर्णतः सरकार द्वारा निर्धारित नियमों, पोषण मानकों एवं स्वीकृत मदों के अनुसार ही किया गया है।
          </p>
          <p>
            2. विद्यालय में खाद्यान्न स्टॉक पंजी, दैनिक छात्र उपस्थिति रजिस्टर, बाल गोपाल दूध वितरण पंजी एवं व्यय वाउचर संधारित हैं जिनका आंतरिक सत्यापन विद्यालय प्रबंधन समिति (SMC) द्वारा कर लिया गया है।
          </p>
          <p>
            3. अंतिम अवशेष राशि <strong>{formatInr(totalCookingClosing + totalCchClosing)}</strong> विद्यालय के अधिकृत बैंक खाते <strong>({profile.bankName || 'SBI'} - A/C No: {profile.bankAccountNo})</strong> में आगामी अवधि हेतु सुरक्षित जमा है।
          </p>
        </div>

        {/* Verification Signatures */}
        <div className="grid grid-cols-3 text-center text-xs font-bold text-slate-900 pt-10">
          <div>
            <p className="border-t border-slate-400 pt-1 w-44 mx-auto">हस्ताक्षर पोषाहार प्रभारी</p>
            <p className="text-[10px] text-slate-500 font-normal mt-0.5">{profile.inchargeName || 'प्रभारी शिक्षक'}</p>
          </div>
          <div>
            <p className="border-t border-slate-400 pt-1 w-44 mx-auto">हस्ताक्षर अध्यक्ष / सदस्य SMC</p>
            <p className="text-[10px] text-slate-500 font-normal mt-0.5">विद्यालय विकास एवं प्रबंध समिति</p>
          </div>
          <div>
            <p className="border-t border-slate-400 pt-1 w-44 mx-auto">हस्ताक्षर संस्था प्रधान (मय मोहर)</p>
            <p className="text-[10px] text-slate-500 font-normal mt-0.5">{profile.headmasterName || 'संस्था प्रधान'}</p>
          </div>
        </div>

      </div>

    </div>
  );
};
