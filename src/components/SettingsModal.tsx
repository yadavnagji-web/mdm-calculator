import React, { useState } from 'react';
import { SchoolProfile, MDMNorms } from '../types';
import { DEFAULT_RAJASTHAN_NORMS } from '../utils/mdmCalculations';
import { X, Save, RotateCcw, Building2, Sliders, Check } from 'lucide-react';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  profile: SchoolProfile;
  norms: MDMNorms;
  onSaveProfile: (profile: SchoolProfile) => void;
  onSaveNorms: (norms: MDMNorms) => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  profile,
  norms,
  onSaveProfile,
  onSaveNorms,
}) => {
  if (!isOpen) return null;

  const [activeTab, setActiveTab] = useState<'school' | 'norms'>('school');
  const [formData, setFormData] = useState<SchoolProfile>({ ...profile });
  const [normData, setNormData] = useState<MDMNorms>({ ...norms });
  const [savedSuccess, setSavedSuccess] = useState(false);

  const handleProfileChange = (field: keyof SchoolProfile, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleNormChange = (field: keyof MDMNorms, value: any) => {
    setNormData((prev) => ({ ...prev, [field]: parseFloat(value) || 0 }));
  };

  const handleSave = () => {
    onSaveProfile(formData);
    onSaveNorms(normData);
    setSavedSuccess(true);
    setTimeout(() => {
      setSavedSuccess(false);
      onClose();
    }, 1000);
  };

  const handleResetNorms = () => {
    setNormData({ ...DEFAULT_RAJASTHAN_NORMS });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in">
      <div className="bg-white w-full max-w-2xl rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Modal Header */}
        <div className="bg-gradient-to-r from-emerald-800 to-teal-900 text-white p-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sliders className="w-5 h-5 text-amber-300" />
            <h3 className="font-bold text-base">विद्यालय विवरण एवं विभागीय मानक सेटिंग्स</h3>
          </div>
          <button
            onClick={onClose}
            className="text-white/80 hover:text-white p-1 rounded-lg hover:bg-white/10 transition-all"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Controls */}
        <div className="flex border-b border-slate-200 bg-slate-50 text-xs font-bold">
          <button
            onClick={() => setActiveTab('school')}
            className={`flex-1 py-3 text-center border-b-2 transition-all ${
              activeTab === 'school'
                ? 'border-emerald-700 text-emerald-800 bg-white'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            🏫 विद्यालय प्रोफाइल व नामांकन
          </button>
          <button
            onClick={() => setActiveTab('norms')}
            className={`flex-1 py-3 text-center border-b-2 transition-all ${
              activeTab === 'norms'
                ? 'border-emerald-700 text-emerald-800 bg-white'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            ⚖️ MDM व बाल गोपाल योजना दरें (Norms)
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-4 flex-1">
          {activeTab === 'school' ? (
            <div className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">विद्यालय का पूरा नाम:</label>
                  <input
                    type="text"
                    value={formData.schoolName}
                    onChange={(e) => handleProfileChange('schoolName', e.target.value)}
                    className="w-full border border-slate-300 rounded-lg p-2.5 font-medium focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">U-DISE कोड:</label>
                  <input
                    type="text"
                    value={formData.udiseCode}
                    onChange={(e) => handleProfileChange('udiseCode', e.target.value)}
                    className="w-full border border-slate-300 rounded-lg p-2.5 font-medium focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">ब्लॉक / पंचायत समिति:</label>
                  <input
                    type="text"
                    value={formData.block}
                    onChange={(e) => handleProfileChange('block', e.target.value)}
                    className="w-full border border-slate-300 rounded-lg p-2.5 font-medium focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">जिला:</label>
                  <input
                    type="text"
                    value={formData.district}
                    onChange={(e) => handleProfileChange('district', e.target.value)}
                    className="w-full border border-slate-300 rounded-lg p-2.5 font-medium focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">संस्था प्रधान का नाम:</label>
                  <input
                    type="text"
                    value={formData.headmasterName}
                    onChange={(e) => handleProfileChange('headmasterName', e.target.value)}
                    className="w-full border border-slate-300 rounded-lg p-2.5 font-medium focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">MDM प्रभारी शिक्षक का नाम:</label>
                  <input
                    type="text"
                    value={formData.inchargeName}
                    onChange={(e) => handleProfileChange('inchargeName', e.target.value)}
                    className="w-full border border-slate-300 rounded-lg p-2.5 font-medium focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-slate-50 p-3 rounded-xl border border-slate-200">
                <div>
                  <label className="block font-bold text-emerald-900 mb-1">प्राथमिक कुल नामांकन (1-5):</label>
                  <input
                    type="number"
                    value={formData.primaryEnrolled}
                    onChange={(e) => handleProfileChange('primaryEnrolled', parseInt(e.target.value, 10) || 0)}
                    className="w-full border border-slate-300 rounded-lg p-2.5 font-bold text-slate-800 bg-white"
                  />
                </div>
                <div>
                  <label className="block font-bold text-emerald-900 mb-1">उच्च प्राथमिक कुल नामांकन (6-8):</label>
                  <input
                    type="number"
                    value={formData.upperPrimaryEnrolled}
                    onChange={(e) => handleProfileChange('upperPrimaryEnrolled', parseInt(e.target.value, 10) || 0)}
                    className="w-full border border-slate-300 rounded-lg p-2.5 font-bold text-slate-800 bg-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">कुक-कम-हेल्पर 1 का नाम:</label>
                  <input
                    type="text"
                    value={formData.cchName1}
                    onChange={(e) => handleProfileChange('cchName1', e.target.value)}
                    className="w-full border border-slate-300 rounded-lg p-2.5 font-medium"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">कुक-कम-हेल्पर 2 का नाम (वैकल्पिक):</label>
                  <input
                    type="text"
                    value={formData.cchName2 || ''}
                    onChange={(e) => handleProfileChange('cchName2', e.target.value)}
                    className="w-full border border-slate-300 rounded-lg p-2.5 font-medium"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 bg-slate-50 p-3 rounded-xl border border-slate-200">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">बैंक खाता संख्या:</label>
                  <input
                    type="text"
                    value={formData.bankAccountNo}
                    onChange={(e) => handleProfileChange('bankAccountNo', e.target.value)}
                    className="w-full border border-slate-300 rounded-lg p-2 font-mono"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">IFSC कोड:</label>
                  <input
                    type="text"
                    value={formData.bankIfsc}
                    onChange={(e) => handleProfileChange('bankIfsc', e.target.value)}
                    className="w-full border border-slate-300 rounded-lg p-2 font-mono"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">बैंक व शाखा:</label>
                  <input
                    type="text"
                    value={formData.bankName}
                    onChange={(e) => handleProfileChange('bankName', e.target.value)}
                    className="w-full border border-slate-300 rounded-lg p-2 font-medium"
                  />
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-4 text-xs">
              <div className="bg-amber-50 border border-amber-200 p-3 rounded-xl text-amber-900 leading-relaxed">
                💡 <strong>सूचना:</strong> यदि भविष्य में राजस्थान सरकार द्वारा कुकिंग कन्वर्जन दर या दूध के मानकों में कोई परिवर्तन किया जाता है, तो आप यहाँ से दरें बदल सकते हैं। पूरा ऐप नई दरों के आधार पर ही स्वतः गणना करेगा।
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 space-y-3">
                  <h4 className="font-bold text-slate-900 uppercase">प्राथमिक स्तर (कक्षा 1 से 5)</h4>
                  <div>
                    <label className="block text-slate-600 mb-1">कुकिंग कन्वर्जन दर (₹ प्रति छात्र):</label>
                    <input
                      type="number"
                      step="0.01"
                      value={normData.primaryCookingCost}
                      onChange={(e) => handleNormChange('primaryCookingCost', e.target.value)}
                      className="w-full border border-slate-300 rounded-lg p-2 font-bold font-mono"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-600 mb-1">खाद्यान्न मात्रा (ग्राम प्रति छात्र):</label>
                    <input
                      type="number"
                      value={normData.primaryGrainGrams}
                      onChange={(e) => handleNormChange('primaryGrainGrams', e.target.value)}
                      className="w-full border border-slate-300 rounded-lg p-2 font-bold font-mono"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-600 mb-1">दूध पाउडर (ग्राम प्रति छात्र):</label>
                    <input
                      type="number"
                      step="0.1"
                      value={normData.primaryMilkPowderGrams}
                      onChange={(e) => handleNormChange('primaryMilkPowderGrams', e.target.value)}
                      className="w-full border border-slate-300 rounded-lg p-2 font-bold font-mono"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-600 mb-1">चीनी (ग्राम प्रति छात्र):</label>
                    <input
                      type="number"
                      step="0.1"
                      value={normData.primarySugarGrams}
                      onChange={(e) => handleNormChange('primarySugarGrams', e.target.value)}
                      className="w-full border border-slate-300 rounded-lg p-2 font-bold font-mono"
                    />
                  </div>
                </div>

                <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 space-y-3">
                  <h4 className="font-bold text-slate-900 uppercase">उच्च प्राथमिक स्तर (कक्षा 6 से 8)</h4>
                  <div>
                    <label className="block text-slate-600 mb-1">कुकिंग कन्वर्जन दर (₹ प्रति छात्र):</label>
                    <input
                      type="number"
                      step="0.01"
                      value={normData.upperPrimaryCookingCost}
                      onChange={(e) => handleNormChange('upperPrimaryCookingCost', e.target.value)}
                      className="w-full border border-slate-300 rounded-lg p-2 font-bold font-mono"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-600 mb-1">खाद्यान्न मात्रा (ग्राम प्रति छात्र):</label>
                    <input
                      type="number"
                      value={normData.upperPrimaryGrainGrams}
                      onChange={(e) => handleNormChange('upperPrimaryGrainGrams', e.target.value)}
                      className="w-full border border-slate-300 rounded-lg p-2 font-bold font-mono"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-600 mb-1">दूध पाउडर (ग्राम प्रति छात्र):</label>
                    <input
                      type="number"
                      step="0.1"
                      value={normData.upperPrimaryMilkPowderGrams}
                      onChange={(e) => handleNormChange('upperPrimaryMilkPowderGrams', e.target.value)}
                      className="w-full border border-slate-300 rounded-lg p-2 font-bold font-mono"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-600 mb-1">चीनी (ग्राम प्रति छात्र):</label>
                    <input
                      type="number"
                      step="0.1"
                      value={normData.upperPrimarySugarGrams}
                      onChange={(e) => handleNormChange('upperPrimarySugarGrams', e.target.value)}
                      className="w-full border border-slate-300 rounded-lg p-2 font-bold font-mono"
                    />
                  </div>
                </div>
              </div>

              <div className="flex justify-start">
                <button
                  onClick={handleResetNorms}
                  className="text-rose-700 hover:text-rose-900 font-bold flex items-center gap-1.5 hover:underline"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>विभागीय मूल मानक दरें (Default) पुनः स्थापित करें</span>
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="bg-slate-100 p-4 border-t border-slate-200 flex justify-end gap-2">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-slate-700 font-bold text-xs hover:bg-slate-200 transition-all"
          >
            बंद करें
          </button>
          <button
            onClick={handleSave}
            className="bg-emerald-700 hover:bg-emerald-600 text-white font-bold text-xs px-5 py-2 rounded-xl shadow flex items-center gap-1.5 transition-all"
          >
            {savedSuccess ? <Check className="w-4 h-4 text-emerald-200" /> : <Save className="w-4 h-4" />}
            <span>{savedSuccess ? 'सेव हो गया!' : 'सेटिंग्स सुरक्षित करें'}</span>
          </button>
        </div>

      </div>
    </div>
  );
};
