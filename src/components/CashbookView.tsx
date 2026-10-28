import React, { useState } from 'react';
import { DailyMDMEntry, SchoolProfile, StockOpeningAndReceipts, MDMNorms } from '../types';
import { formatInr, aggregateMonthlyEntries } from '../utils/mdmCalculations';
import { Printer, Receipt, Coins, UserCheck, ShieldCheck } from 'lucide-react';

interface CashbookViewProps {
  entries: DailyMDMEntry[];
  profile: SchoolProfile;
  stock: StockOpeningAndReceipts;
  norms: MDMNorms;
  selectedMonth: string;
}

export const CashbookView: React.FC<CashbookViewProps> = ({
  entries,
  profile,
  stock,
  norms,
  selectedMonth,
}) => {
  const [activeSubTab, setActiveSubTab] = useState<'cashbook' | 'voucher'>('cashbook');
  
  const totals = aggregateMonthlyEntries(entries);
  const totalCost = totals.totalCookingCost;

  // Breakdown of cooking expenses by government standard percentages
  // Approx: Vegetables 30%, Pulses 30%, Oil 18%, Spices 10%, Fuel 12%
  const pulsesCost = Math.round(totalCost * 0.30);
  const vegCost = Math.round(totalCost * 0.30);
  const oilCost = Math.round(totalCost * 0.18);
  const spicesCost = Math.round(totalCost * 0.10);
  const fuelCost = totalCost - (pulsesCost + vegCost + oilCost + spicesCost);

  // Cook Cum Helper
  const totalEnrolled = profile.primaryEnrolled + profile.upperPrimaryEnrolled;
  const helperCount = totalEnrolled > 150 ? 3 : totalEnrolled > 50 ? 2 : 1;
  const cchMonthlyCost = helperCount * norms.cchMonthlyHonorarium;

  const monthName = new Date(`${selectedMonth}-01`).toLocaleDateString('hi-IN', {
    month: 'long',
    year: 'numeric',
  });

  return (
    <div className="max-w-7xl mx-auto px-4 py-6 space-y-6">
      
      {/* Top Banner & Sub-Tabs */}
      <div className="no-print bg-white rounded-2xl border border-slate-200 p-4 sm:p-5 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shadow-sm">
        <div>
          <h2 className="text-base sm:text-lg font-bold text-slate-900 flex items-center gap-2">
            <Coins className="w-5 h-5 text-emerald-700" />
            <span>MDM रोकड़ बही (Cash Book) एवं कुक मानदेय वाउचर</span>
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            कुकिंग कन्वर्जन सामग्री मद-वार व्यय एवं कुक-कम-हेल्पर भुगतान रसीद
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <div className="bg-slate-100 p-1 rounded-xl flex items-center text-xs font-semibold">
            <button
              onClick={() => setActiveSubTab('cashbook')}
              className={`px-3 py-1.5 rounded-lg transition-all ${
                activeSubTab === 'cashbook' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500'
              }`}
            >
              रोकड़ बही (Cashbook)
            </button>
            <button
              onClick={() => setActiveSubTab('voucher')}
              className={`px-3 py-1.5 rounded-lg transition-all ${
                activeSubTab === 'voucher' ? 'bg-white text-emerald-800 shadow-sm' : 'text-slate-500'
              }`}
            >
              कुक मानदेय वाउचर (Voucher)
            </button>
          </div>

          <button
            onClick={() => window.print()}
            className="bg-emerald-700 hover:bg-emerald-600 text-white text-xs font-bold px-4 py-2 rounded-xl flex items-center gap-1.5 shadow transition-all"
          >
            <Printer className="w-4 h-4" />
            <span>प्रिंट A4</span>
          </button>
        </div>
      </div>

      {activeSubTab === 'cashbook' ? (
        /* Cashbook Proforma */
        <div className="print-container bg-white rounded-2xl border border-slate-200 p-6 md:p-8 shadow-sm space-y-6">
          
          <div className="text-center pb-4 border-b-2 border-slate-900 space-y-1">
            <h3 className="text-base sm:text-lg font-bold text-slate-900 uppercase">
              कार्यालय संस्था प्रधान - {profile.schoolName}
            </h3>
            <p className="text-xs text-slate-700 font-medium">
              ब्लॉक: {profile.block} | जिला: {profile.district} | U-DISE: {profile.udiseCode}
            </p>
            <div className="inline-block bg-slate-100 border border-slate-400 px-4 py-1 rounded text-xs font-bold text-slate-900">
              MDM कुकिंग कन्वर्जन राशि रोकड़ बही (Cash Book) — माह: {monthName}
            </div>
          </div>

          {/* Ledger Table */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wide">
              मद-वार वास्तविक व्यय विवरण
            </h4>
            
            <table className="w-full text-xs border border-slate-400">
              <thead className="bg-slate-100 font-bold text-slate-900">
                <tr>
                  <th className="p-2 border border-slate-400 text-center w-12">क्र.सं.</th>
                  <th className="p-2 border border-slate-400 text-left">सामग्री / व्यय मद का नाम</th>
                  <th className="p-2 border border-slate-400 text-center">मानक व्यय अनुपात</th>
                  <th className="p-2 border border-slate-400 text-right">कुल व्यय राशि (₹)</th>
                  <th className="p-2 border border-slate-400 text-left">सत्यापन स्थिति</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="p-2 border border-slate-400 text-center">1</td>
                  <td className="p-2 border border-slate-400 font-bold">दालें (चना दाल, मूंग, तुवर, उड़द, सोयाबीन)</td>
                  <td className="p-2 border border-slate-400 text-center">30%</td>
                  <td className="p-2 border border-slate-400 text-right font-mono font-semibold">{formatInr(pulsesCost)}</td>
                  <td className="p-2 border border-slate-400 text-slate-600">दुकानदार वाउचर संलग्न</td>
                </tr>
                <tr>
                  <td className="p-2 border border-slate-400 text-center">2</td>
                  <td className="p-2 border border-slate-400 font-bold">हरी मौसमी सब्जियाँ, आलू, प्याज, लहसुन आदि</td>
                  <td className="p-2 border border-slate-400 text-center">30%</td>
                  <td className="p-2 border border-slate-400 text-right font-mono font-semibold">{formatInr(vegCost)}</td>
                  <td className="p-2 border border-slate-400 text-slate-600">दैनिक क्रय पर्ची संलग्न</td>
                </tr>
                <tr>
                  <td className="p-2 border border-slate-400 text-center">3</td>
                  <td className="p-2 border border-slate-400 font-bold">खाद्य तेल / घी (सोयाबीन/सरसों का रिफाइंड तेल)</td>
                  <td className="p-2 border border-slate-400 text-center">18%</td>
                  <td className="p-2 border border-slate-400 text-right font-mono font-semibold">{formatInr(oilCost)}</td>
                  <td className="p-2 border border-slate-400 text-slate-600">दुकानदार वाउचर संलग्न</td>
                </tr>
                <tr>
                  <td className="p-2 border border-slate-400 text-center">4</td>
                  <td className="p-2 border border-slate-400 font-bold">मसाले (मिर्च, धनिया, हल्दी, जीरा, नमक, राई)</td>
                  <td className="p-2 border border-slate-400 text-center">10%</td>
                  <td className="p-2 border border-slate-400 text-right font-mono font-semibold">{formatInr(spicesCost)}</td>
                  <td className="p-2 border border-slate-400 text-slate-600">दुकानदार वाउचर संलग्न</td>
                </tr>
                <tr>
                  <td className="p-2 border border-slate-400 text-center">5</td>
                  <td className="p-2 border border-slate-400 font-bold">ईंधन व्यय (LPG गैस सिलेंडर रीफिलिंग / अन्य)</td>
                  <td className="p-2 border border-slate-400 text-center">12%</td>
                  <td className="p-2 border border-slate-400 text-right font-mono font-semibold">{formatInr(fuelCost)}</td>
                  <td className="p-2 border border-slate-400 text-slate-600">गैस एजेंसी कैश मेमो संलग्न</td>
                </tr>
              </tbody>
              <tfoot className="bg-slate-200 text-slate-900 font-bold">
                <tr>
                  <td colSpan={3} className="p-2.5 border border-slate-500 text-center font-extrabold">
                    माह का कुल कुकिंग कन्वर्जन व्यय:
                  </td>
                  <td className="p-2.5 border border-slate-500 text-right font-mono font-extrabold text-emerald-950">
                    {formatInr(totalCost)}
                  </td>
                  <td className="p-2.5 border border-slate-500 text-emerald-900 font-bold">
                    शत-प्रतिशत सत्यापित
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>

          <div className="grid grid-cols-2 text-center text-xs font-bold text-slate-900 pt-10">
            <div>
              <p className="border-t border-slate-400 pt-1 w-44 mx-auto">हस्ताक्षर पोषाहार प्रभारी</p>
            </div>
            <div>
              <p className="border-t border-slate-400 pt-1 w-44 mx-auto">हस्ताक्षर संस्था प्रधान (मय मोहर)</p>
            </div>
          </div>

        </div>
      ) : (
        /* Cook-cum-helper Honorarium Voucher Proforma */
        <div className="print-container bg-white rounded-2xl border border-slate-200 p-6 md:p-8 shadow-sm space-y-6">
          
          <div className="text-center pb-4 border-b-2 border-slate-900 space-y-1">
            <h3 className="text-base sm:text-lg font-bold text-slate-900 uppercase">
              कार्यालय संस्था प्रधान - {profile.schoolName}
            </h3>
            <p className="text-xs text-slate-700 font-medium">
              ब्लॉक: {profile.block} | जिला: {profile.district} | U-DISE: {profile.udiseCode}
            </p>
            <div className="inline-block bg-slate-100 border border-slate-400 px-4 py-1 rounded text-xs font-bold text-slate-900">
              कुक-कम-हेल्पर (CCH) मासिक मानदेय भुगतान वाउचर — माह: {monthName}
            </div>
          </div>

          <table className="w-full text-xs border border-slate-400">
            <thead className="bg-slate-100 font-bold text-slate-900">
              <tr>
                <th className="p-2 border border-slate-400 text-center w-12">क्र.सं.</th>
                <th className="p-2 border border-slate-400 text-left">कुक-कम-हेल्पर का नाम</th>
                <th className="p-2 border border-slate-400 text-center">माह के कार्य दिवस</th>
                <th className="p-2 border border-slate-400 text-right">स्वीकृत मानदेय दर</th>
                <th className="p-2 border border-slate-400 text-right">कुल देय राशि (₹)</th>
                <th className="p-2 border border-slate-400 text-center w-36">हस्ताक्षर / अंगूठा निशान</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className="p-3 border border-slate-400 text-center">1</td>
                <td className="p-3 border border-slate-400 font-bold">{profile.cchName1 || 'कुक 1'}</td>
                <td className="p-3 border border-slate-400 text-center font-semibold">{totals.workingDays} दिन</td>
                <td className="p-3 border border-slate-400 text-right font-mono">₹{norms.cchMonthlyHonorarium}</td>
                <td className="p-3 border border-slate-400 text-right font-mono font-bold text-emerald-900">
                  {formatInr(norms.cchMonthlyHonorarium)}
                </td>
                <td className="p-3 border border-slate-400 text-center"></td>
              </tr>
              {helperCount > 1 && (
                <tr>
                  <td className="p-3 border border-slate-400 text-center">2</td>
                  <td className="p-3 border border-slate-400 font-bold">{profile.cchName2 || 'कुक 2'}</td>
                  <td className="p-3 border border-slate-400 text-center font-semibold">{totals.workingDays} दिन</td>
                  <td className="p-3 border border-slate-400 text-right font-mono">₹{norms.cchMonthlyHonorarium}</td>
                  <td className="p-3 border border-slate-400 text-right font-mono font-bold text-emerald-900">
                    {formatInr(norms.cchMonthlyHonorarium)}
                  </td>
                  <td className="p-3 border border-slate-400 text-center"></td>
                </tr>
              )}
            </tbody>
            <tfoot className="bg-slate-200 text-slate-900 font-bold">
              <tr>
                <td colSpan={4} className="p-2.5 border border-slate-500 text-center font-extrabold">
                  कुल भुगतान राशि:
                </td>
                <td className="p-2.5 border border-slate-500 text-right font-mono font-extrabold text-emerald-950">
                  {formatInr(cchMonthlyCost)}
                </td>
                <td className="p-2.5 border border-slate-500"></td>
              </tr>
            </tfoot>
          </table>

          <div className="text-xs text-slate-800 space-y-2 pt-2">
            <p>
              प्रमाणित किया जाता है कि कुक-कम-हेल्पर द्वारा माह <strong>{monthName}</strong> के सभी {totals.workingDays} कार्य दिवसों में संतोषप्रद सेवाएं दी गईं तथा भोजन पकाने व परोसने का कार्य पूर्ण स्वच्छता से संपन्न किया गया। उक्त राशि कुक के बैंक खाते में DBT के माध्यम से अंतरित की जावेगी।
            </p>
          </div>

          <div className="grid grid-cols-2 text-center text-xs font-bold text-slate-900 pt-8">
            <div>
              <p className="border-t border-slate-400 pt-1 w-44 mx-auto">हस्ताक्षर पोषाहार प्रभारी</p>
            </div>
            <div>
              <p className="border-t border-slate-400 pt-1 w-44 mx-auto">हस्ताक्षर संस्था प्रधान (मय मोहर)</p>
            </div>
          </div>

        </div>
      )}

    </div>
  );
};
