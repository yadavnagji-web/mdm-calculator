import React, { useState } from 'react';
import { UserAccount, SchoolProfile } from '../types';
import { registerUser, loginUser } from '../utils/authStorage';
import { SAMPLE_SCHOOL_PROFILE } from '../utils/sampleData';
import { 
  Phone, 
  Lock, 
  User, 
  Building2, 
  CheckCircle2, 
  AlertCircle, 
  ShieldCheck, 
  Sparkles, 
  ArrowRight, 
  LogIn, 
  UserPlus 
} from 'lucide-react';

interface AuthScreenProps {
  onLoginSuccess: (user: UserAccount) => void;
}

export const AuthScreen: React.FC<AuthScreenProps> = ({ onLoginSuccess }) => {
  const [mode, setMode] = useState<'login' | 'register'>('login');
  
  // Login form states
  const [loginMobile, setLoginMobile] = useState('');
  const [loginPin, setLoginPin] = useState('');
  
  // Register form states
  const [regMobile, setRegMobile] = useState('');
  const [regPin, setRegPin] = useState('');
  const [regName, setRegName] = useState('');
  const [regSchool, setRegSchool] = useState('');
  const [regUdise, setRegUdise] = useState('');
  const [regBlock, setRegBlock] = useState('सांगानेर');
  const [regDistrict, setRegDistrict] = useState('जयपुर');
  const [regPrimaryEnrolled, setRegPrimaryEnrolled] = useState(48);
  const [regUpperPrimaryEnrolled, setRegUpperPrimaryEnrolled] = useState(36);

  // Status/Error messages
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    const res = loginUser(loginMobile, loginPin);
    if (res.success && res.user) {
      setSuccessMsg(res.message);
      setTimeout(() => onLoginSuccess(res.user!), 500);
    } else {
      setErrorMsg(res.message);
    }
  };

  const handleDemoLogin = () => {
    setErrorMsg('');
    const res = loginUser('9829012345', '1234');
    if (res.success && res.user) {
      onLoginSuccess(res.user);
    }
  };

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (!regMobile || regMobile.length !== 10) {
      setErrorMsg('कृपया 10 अंकों का सही मोबाइल नंबर दर्ज करें।');
      return;
    }
    if (!regPin || regPin.length < 4) {
      setErrorMsg('सुरक्षा पिन कम से कम 4 अंकों का होना चाहिए।');
      return;
    }
    if (!regSchool.trim()) {
      setErrorMsg('कृपया विद्यालय का नाम दर्ज करें।');
      return;
    }

    const newProfile: SchoolProfile = {
      id: `school_${regMobile}`,
      schoolName: regSchool.trim(),
      udiseCode: regUdise.trim() || '08120000000',
      block: regBlock.trim() || 'ब्लॉक',
      district: regDistrict.trim() || 'जिला',
      headmasterName: regName.trim() || 'संस्था प्रधान',
      inchargeName: 'पोषाहार प्रभारी',
      cchName1: 'कुक कम हेल्पर 1',
      cchName2: 'कुक कम हेल्पर 2',
      bankAccountNo: '00000000000',
      bankIfsc: 'SBIN0000000',
      bankName: 'भारतीय स्टेट बैंक',
      primaryEnrolled: Number(regPrimaryEnrolled) || 0,
      upperPrimaryEnrolled: Number(regUpperPrimaryEnrolled) || 0,
    };

    const newAccount: UserAccount = {
      mobileNumber: regMobile,
      pin: regPin,
      teacherName: regName || 'शिक्षक / संस्था प्रधान',
      role: 'headmaster',
      createdAt: new Date().toISOString(),
      lastLogin: new Date().toISOString(),
      profile: newProfile,
      academicYear: '2026-2027',
    };

    const res = registerUser(newAccount);
    if (res.success) {
      setSuccessMsg(res.message);
      setTimeout(() => onLoginSuccess(newAccount), 700);
    } else {
      setErrorMsg(res.message);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-900 via-teal-900 to-slate-950 flex flex-col justify-center items-center p-4">
      
      {/* Brand & Emblem Title */}
      <div className="text-center mb-6 space-y-2">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-amber-400 text-emerald-950 font-extrabold text-2xl shadow-xl border-4 border-amber-300">
          MDM
        </div>
        <h1 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight">
          राजस्थान स्कूल MDM व बाल गोपाल योजना पोर्टल
        </h1>
        <p className="text-xs sm:text-sm text-emerald-200">
          मोबाइल नंबर से सुरक्षित लॉगिन • पूरे साल (2026-27) का ऑटोमेटिक रिकॉर्ड व रिपोर्ट
        </p>
      </div>

      {/* Main Auth Card */}
      <div className="bg-white w-full max-w-md rounded-3xl shadow-2xl border border-emerald-500/20 overflow-hidden">
        
        {/* Tab Switcher: Login vs Register */}
        <div className="flex border-b border-slate-200 bg-slate-50 text-xs sm:text-sm font-bold">
          <button
            onClick={() => { setMode('login'); setErrorMsg(''); setSuccessMsg(''); }}
            className={`flex-1 py-3.5 flex items-center justify-center gap-1.5 transition-all ${
              mode === 'login'
                ? 'bg-white text-emerald-800 border-b-2 border-emerald-700 shadow-sm'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <LogIn className="w-4 h-4" />
            <span>लॉगिन (Login)</span>
          </button>

          <button
            onClick={() => { setMode('register'); setErrorMsg(''); setSuccessMsg(''); }}
            className={`flex-1 py-3.5 flex items-center justify-center gap-1.5 transition-all ${
              mode === 'register'
                ? 'bg-white text-emerald-800 border-b-2 border-emerald-700 shadow-sm'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <UserPlus className="w-4 h-4" />
            <span>नया खाता (Register)</span>
          </button>
        </div>

        {/* Alerts */}
        {errorMsg && (
          <div className="mx-6 mt-4 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {successMsg && (
          <div className="mx-6 mt-4 p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2 font-semibold">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{successMsg}</span>
          </div>
        )}

        {/* Login Mode */}
        {mode === 'login' ? (
          <form onSubmit={handleLogin} className="p-6 space-y-4">
            
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                पंजीकृत मोबाइल नंबर (10 Digit Mobile):
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                  <Phone className="w-4 h-4" />
                </div>
                <input
                  type="tel"
                  maxLength={10}
                  value={loginMobile}
                  onChange={(e) => setLoginMobile(e.target.value.replace(/\D/g, ''))}
                  placeholder="उदा. 98290XXXXX"
                  className="w-full pl-10 pr-3 py-2.5 border border-slate-300 rounded-xl text-slate-900 font-bold text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-slate-50/50"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                4-अंकीय सुरक्षा पिन (4-Digit PIN):
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  type="password"
                  maxLength={6}
                  value={loginPin}
                  onChange={(e) => setLoginPin(e.target.value)}
                  placeholder="पिन दर्ज करें"
                  className="w-full pl-10 pr-3 py-2.5 border border-slate-300 rounded-xl text-slate-900 font-mono font-bold text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-slate-50/50"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full bg-emerald-700 hover:bg-emerald-600 text-white font-bold py-3 rounded-xl shadow-lg transition-all flex items-center justify-center gap-2 active:scale-[0.99] text-sm"
            >
              <span>अपने विद्यालय खाते में लॉगिन करें</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            {/* Quick Demo Login Option */}
            <div className="pt-2">
              <button
                type="button"
                onClick={handleDemoLogin}
                className="w-full bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-300 font-bold py-2.5 rounded-xl text-xs flex items-center justify-center gap-1.5 transition-all shadow-sm"
              >
                <Sparkles className="w-4 h-4 text-amber-600" />
                <span>डेमो खाता से तुरंत देखें (Mobile: 9829012345 | PIN: 1234)</span>
              </button>
            </div>

            <div className="pt-3 text-center border-t border-slate-100">
              <p className="text-xs text-slate-500">
                नया विद्यालय जोड़ना चाहते हैं?{' '}
                <button
                  type="button"
                  onClick={() => setMode('register')}
                  className="text-emerald-700 font-bold hover:underline"
                >
                  यहाँ नया खाता बनाएं
                </button>
              </p>
            </div>

          </form>
        ) : (
          /* Register Mode */
          <form onSubmit={handleRegister} className="p-6 space-y-3.5 max-h-[75vh] overflow-y-auto text-xs">
            
            <div>
              <label className="block font-bold text-slate-700 mb-1">
                आपका मोबाइल नंबर (यूजर आईडी बनेगा):
              </label>
              <input
                type="tel"
                maxLength={10}
                value={regMobile}
                onChange={(e) => setRegMobile(e.target.value.replace(/\D/g, ''))}
                placeholder="10 अंकों का मोबाइल नंबर"
                className="w-full border border-slate-300 rounded-xl p-2.5 font-bold text-sm bg-slate-50"
                required
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">
                4-अंकीय लॉगिन पिन बनाएं (Security PIN):
              </label>
              <input
                type="password"
                maxLength={6}
                value={regPin}
                onChange={(e) => setRegPin(e.target.value)}
                placeholder="उदा. 1234 या 4567"
                className="w-full border border-slate-300 rounded-xl p-2.5 font-bold font-mono text-sm bg-slate-50"
                required
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">
                संस्था प्रधान / प्रभारी शिक्षक का नाम:
              </label>
              <input
                type="text"
                value={regName}
                onChange={(e) => setRegName(e.target.value)}
                placeholder="उदा. श्री रमेश कुमार"
                className="w-full border border-slate-300 rounded-xl p-2 font-medium"
                required
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">
                विद्यालय का पूरा नाम:
              </label>
              <input
                type="text"
                value={regSchool}
                onChange={(e) => setRegSchool(e.target.value)}
                placeholder="उदा. रा.उ.प्रा.वि. या रा.प्रा.वि."
                className="w-full border border-slate-300 rounded-xl p-2 font-medium"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block font-bold text-slate-700 mb-1">U-DISE कोड:</label>
                <input
                  type="text"
                  value={regUdise}
                  onChange={(e) => setRegUdise(e.target.value)}
                  placeholder="11 अंकों का कोड"
                  className="w-full border border-slate-300 rounded-xl p-2 font-mono"
                  required
                />
              </div>
              <div>
                <label className="block font-bold text-slate-700 mb-1">ब्लॉक:</label>
                <input
                  type="text"
                  value={regBlock}
                  onChange={(e) => setRegBlock(e.target.value)}
                  className="w-full border border-slate-300 rounded-xl p-2 font-medium"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2 bg-emerald-50/60 p-2.5 rounded-xl border border-emerald-200">
              <div>
                <label className="block font-bold text-emerald-950 mb-1">प्राथ. (1-5) नामांकन:</label>
                <input
                  type="number"
                  value={regPrimaryEnrolled}
                  onChange={(e) => setRegPrimaryEnrolled(parseInt(e.target.value, 10) || 0)}
                  className="w-full border border-slate-300 rounded-lg p-2 font-bold bg-white"
                />
              </div>
              <div>
                <label className="block font-bold text-emerald-950 mb-1">उच्च प्राथ.(6-8) नामांकन:</label>
                <input
                  type="number"
                  value={regUpperPrimaryEnrolled}
                  onChange={(e) => setRegUpperPrimaryEnrolled(parseInt(e.target.value, 10) || 0)}
                  className="w-full border border-slate-300 rounded-lg p-2 font-bold bg-white"
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full bg-emerald-700 hover:bg-emerald-600 text-white font-bold py-3 rounded-xl shadow-lg transition-all text-sm mt-2"
            >
              खाता बनाएं एवं सुरक्षित शुरू करें
            </button>

            <div className="text-center pt-2">
              <button
                type="button"
                onClick={() => setMode('login')}
                className="text-slate-500 font-semibold hover:underline"
              >
                पहले से खाता है? यहाँ लॉगिन करें
              </button>
            </div>

          </form>
        )}

      </div>

      {/* Trust & Data Security Badge */}
      <div className="mt-6 flex items-center gap-2 text-xs text-emerald-200/80">
        <ShieldCheck className="w-4 h-4 text-emerald-400" />
        <span>आपका डेटा आपके मोबाइल नंबर से एनक्रिप्टेड व पूरे शैक्षणिक सत्र 2026-27 के लिए सुरक्षित है</span>
      </div>

    </div>
  );
};
