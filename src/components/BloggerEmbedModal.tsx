import React, { useState } from 'react';
import { X, Copy, Check, Code2, Globe, Share2, Sparkles } from 'lucide-react';

interface BloggerEmbedModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const BloggerEmbedModal: React.FC<BloggerEmbedModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  const [copiedCode, setCopiedCode] = useState(false);
  const currentUrl = window.location.origin || 'https://your-mdm-app.vercel.app';

  const embedSnippet = `<!-- राजस्थान स्कूल MDM व बाल गोपाल योजना प्रो कैलकुलेटर (Blogger Embed Code) -->
<div style="width: 100%; min-height: 900px; position: relative; border-radius: 16px; overflow: hidden; box-shadow: 0 10px 25px -5px rgba(0,0,0,0.1); border: 1px solid #e2e8f0;">
  <iframe 
    src="${currentUrl}" 
    title="Rajasthan School MDM & Bal Gopal Yojana Calculator" 
    style="width: 100%; height: 950px; border: none; display: block;" 
    allow="clipboard-write"
    loading="lazy">
  </iframe>
</div>
<p style="text-align: center; font-size: 12px; color: #64748b; margin-top: 8px;">
  साभार: राजस्थान स्कूल शिक्षा PM-POSHAN व बाल गोपाल योजना ऑटो रिपोर्ट जनरेटर
</p>`;

  const handleCopy = () => {
    navigator.clipboard.writeText(embedSnippet);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in">
      <div className="bg-white w-full max-w-2xl rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="bg-gradient-to-r from-purple-800 to-indigo-900 text-white p-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Code2 className="w-5 h-5 text-amber-300" />
            <h3 className="font-bold text-base">ब्लॉगर (Blogger) पर लाइव पब्लिश व वायरल गाइड</h3>
          </div>
          <button
            onClick={onClose}
            className="text-white/80 hover:text-white p-1 rounded-lg hover:bg-white/10 transition-all"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto space-y-5 text-xs text-slate-700">
          
          <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 space-y-1">
            <h4 className="font-bold text-emerald-950 text-sm flex items-center gap-1.5">
              <span>🚀 ब्लॉगर पर 1 मिनट में लाइव कैसे करें?</span>
            </h4>
            <p className="text-emerald-800 leading-relaxed">
              आपको केवल नीचे दिया गया कोड कॉपी करके अपने ब्लॉगर ब्लॉग के किसी भी पेज या पोस्ट में पेस्ट करना है। यह मोबाइल और कंप्यूटर दोनों पर ऑटोमैटिक फुल-स्क्रीन खुलेगा।
            </p>
          </div>

          {/* Code Box */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-bold text-slate-900 uppercase tracking-wide">
                1. रेस्पॉन्सिव एम्बेड कोड (Iframe Code):
              </span>
              <button
                onClick={handleCopy}
                className="bg-purple-700 hover:bg-purple-600 text-white px-3 py-1.5 rounded-lg font-bold flex items-center gap-1.5 shadow transition-all"
              >
                {copiedCode ? <Check className="w-3.5 h-3.5 text-amber-300" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedCode ? 'कोड कॉपी हो गया!' : 'कोड कॉपी करें'}</span>
              </button>
            </div>

            <pre className="bg-slate-900 text-emerald-300 p-4 rounded-xl overflow-x-auto font-mono text-[11px] leading-relaxed select-all border border-slate-800 max-h-48">
              {embedSnippet}
            </pre>
          </div>

          {/* Step by step guide */}
          <div className="space-y-2 border-t border-slate-200 pt-3">
            <h4 className="font-bold text-slate-900 uppercase">2. ब्लॉगर में लगाने के आसान 4 स्टेप्स:</h4>
            <ol className="list-decimal pl-4 space-y-1.5 leading-relaxed text-slate-600">
              <li>अपने <strong>Blogger Dashboard</strong> (blogger.com) में लॉगिन करें।</li>
              <li>बाईं तरफ <strong>Pages</strong> (पेज) पर क्लिक करके <strong>New Page</strong> बनाएं।</li>
              <li>ऊपर बाईं तरफ पेंसिल ✏️ आइकन पर क्लिक करके <strong>HTML View (&lt;&gt;)</strong> चुनें।</li>
              <li>ऊपर कॉपी किया गया कोड पेस्ट करें और <strong>Publish</strong> (प्रकाशित) कर दें!</li>
            </ol>
          </div>

          {/* Viral Strategy for Teachers */}
          <div className="bg-purple-50 border border-purple-200 rounded-xl p-4 space-y-2">
            <h4 className="font-bold text-purple-950 text-sm flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-purple-700" />
              <span>टूल को वायरल करने के लिए जरूरी सेटिंग्स:</span>
            </h4>
            <ul className="list-disc pl-4 space-y-1 text-purple-900 leading-relaxed">
              <li>
                <strong>WhatsApp ग्रुप शेयरिंग:</strong> इस ऐप में हर दैनिक रिपोर्ट के साथ स्वतः एक WhatsApp शेयर बटन लगा हुआ है, जिससे हर शिक्षक जब अपने स्कूल की रिपोर्ट साझा करेगा, तो आपके ब्लॉग की लिंक साथ जाएगी।
              </li>
              <li>
                <strong>जीरो लॉगिन झंझट:</strong> शिक्षकों को कोई पासवर्ड या लॉगिन नहीं करना पड़ता, जिससे 100% शिक्षक इसे तुरंत इस्तेमाल कर लेते हैं।
              </li>
              <li>
                <strong>PWA मोबाइल ऐप:</strong> शिक्षक इसे अपने फोन में बिना प्ले-स्टोर के "Add to Home Screen" करके ऐप की तरह चला सकते हैं।
              </li>
            </ul>
          </div>

        </div>

        {/* Footer */}
        <div className="bg-slate-100 p-4 border-t border-slate-200 flex justify-end">
          <button
            onClick={onClose}
            className="bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs px-5 py-2 rounded-xl transition-all"
          >
            समझ गया / बंद करें
          </button>
        </div>

      </div>
    </div>
  );
};
