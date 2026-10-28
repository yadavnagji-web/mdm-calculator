import { DailyMDMEntry, SchoolProfile } from '../types';
import { formatKg, formatInr } from './mdmCalculations';

/**
 * Generates official Shala Darpan daily SMS string
 * Standard Rajasthan format:
 * MDM <UDISE> <Date> <P_Att> <UP_Att> <Milk_P> <Milk_UP>
 */
export function generateShalaDarpanSMS(entry: DailyMDMEntry, profile: SchoolProfile): string {
  if (!entry.isWorkingDay) {
    return `MDM ${profile.udiseCode} ${entry.date} HOLIDAY (${entry.holidayReason || 'अवकाश'})`;
  }
  const milkP = entry.servedMilk ? entry.primaryAttendance : 0;
  const milkUP = entry.servedMilk ? entry.upperPrimaryAttendance : 0;
  return `MDM ${profile.udiseCode} ${entry.date} P:${entry.primaryAttendance} UP:${entry.upperPrimaryAttendance} MILK:${milkP + milkUP}`;
}

/**
 * Creates rich WhatsApp share message for teachers, HM, and PEEO
 */
export function generateWhatsAppMessage(entry: DailyMDMEntry, profile: SchoolProfile): string {
  const dateFormatted = new Date(entry.date).toLocaleDateString('hi-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });

  if (!entry.isWorkingDay) {
    return `🏫 *${profile.schoolName}*\n📅 दिनांक: ${dateFormatted}\n\n🛑 *आज शाला में अवकाश रहा:*\nकारण: ${entry.holidayReason || 'साप्ताहिक अवकाश'}\n\n_Generated via Rajasthan School MDM Pro Calculator_`;
  }

  const grainTotalKg = formatKg(entry.wheatGrams + entry.riceGrams);
  const milkTotalKg = formatKg(entry.milkPowderGrams);
  const sugarTotalKg = formatKg(entry.sugarGrams);
  const milkLitres = (entry.preparedMilkMl / 1000).toFixed(1);

  return `🍛 *दैनिक MDM व बाल गोपाल रिपोर्ट*\n🏫 *${profile.schoolName}*\n📍 U-DISE: ${profile.udiseCode} | दिनांक: ${dateFormatted}\n\n👥 *लाभान्वित छात्र संख्या:*\n• प्राथमिक (1-5): *${entry.primaryAttendance} छात्र*\n• उच्च प्राथमिक (6-8): *${entry.upperPrimaryAttendance} छात्र*\n• कुल छात्र: *${entry.totalStudents} छात्र*\n\n🥣 *मेनू:* ${entry.menuItem}\n⚖️ *खाद्यान्न खपत:* ${grainTotalKg} किग्रा (${entry.grainType === 'wheat' ? 'गेहूँ' : entry.grainType === 'rice' ? 'चावल' : 'मिश्रित'})\n💰 *कुकिंग कन्वर्जन लागत:* ${formatInr(entry.cookingCost)}\n\n🥛 *मुख्यमंत्री बाल गोपाल योजना:*\n• दूध पाउडर खपत: *${milkTotalKg} किग्रा*\n• चीनी खपत: *${sugarTotalKg} किग्रा*\n• तैयार दूध: *${milkLitres} लीटर*\n\n📲 *शाला दर्पण SMS कोड:* \`${generateShalaDarpanSMS(entry, profile)}\`\n\n🔗 _अपने स्कूल का हिसाब मिनटों में करें और सरकारी रिपोर्ट डाउनलोड करें_`;
}

/**
 * Open WhatsApp with pre-filled message
 */
export function shareOnWhatsApp(message: string): void {
  const encoded = encodeURIComponent(message);
  window.open(`https://api.whatsapp.com/send?text=${encoded}`, '_blank');
}

/**
 * Share App with other teacher groups
 */
export function shareAppWithTeachers(): void {
  const shareText = `🇮🇳 *राजस्थान के सभी शिक्षकों के लिए विशेष वेब टूल!*\n\n✅ MDM दैनिक उपस्थिति एवं कन्वर्जन लागत गणना\n✅ मुख्यमंत्री बाल गोपाल योजना (दूध पाउडर, चीनी व दूध लीटर हिसाब)\n✅ 1-क्लिक में सरकारी मानक MPR (मासिक प्रगति प्रतिवेदन) PDF\n✅ उपयोगिता प्रमाण पत्र (UC), रोकड़ बही व स्टॉक रजिस्टर\n✅ 100% निशुल्क, बिना इंटरनेट भी चलता है और मोबाइल-फ्रेंडली!\n\n👇 अभी उपयोग करें:\n${window.location.origin || 'https://mdm-calculator.web.app'}`;
  
  shareOnWhatsApp(shareText);
}
