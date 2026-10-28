import { SchoolProfile, DailyMDMEntry, StockOpeningAndReceipts, MDMNorms } from '../types';
import { calculateDailyMetrics, RAJASTHAN_WEEKLY_MENU, DEFAULT_RAJASTHAN_NORMS } from './mdmCalculations';

export const SAMPLE_SCHOOL_PROFILE: SchoolProfile = {
  id: 'school_01',
  schoolName: 'राजकीय उच्च प्राथमिक विद्यालय, आदर्श नगर',
  udiseCode: '08120504102',
  block: 'सांगानेर',
  district: 'जयपुर (राजस्थान)',
  headmasterName: 'श्री रामेश्वर लाल शर्मा',
  inchargeName: 'श्रीमती सुनीता चौधरी',
  cchName1: 'श्रीमती कमला देवी',
  cchName2: 'श्रीमती शांति देवी',
  bankAccountNo: '510204918234',
  bankIfsc: 'SBIN0031024',
  bankName: 'भारतीय स्टेट बैंक, सांगानेर',
  primaryEnrolled: 52,
  upperPrimaryEnrolled: 44,
};

export const SAMPLE_STOCK_OCTOBER: StockOpeningAndReceipts = {
  monthKey: '2026-10',
  openingWheatKg: 85.500,
  openingRiceKg: 40.250,
  openingMilkPowderKg: 12.000,
  openingSugarKg: 6.500,

  receivedWheatKg: 120.000, // FCI lifted during month
  receivedRiceKg: 50.000,
  receivedMilkPowderKg: 15.000, // RCDF / Department lifted
  receivedSugarKg: 10.000,

  openingCookingCash: 1840.50,
  receivedCookingCash: 12500.00,
  receivedCchCash: 4284.00,
};

/**
 * Generate a realistic month (31 days) of entries for Rajasthan schools
 */
export function generateSampleMonthEntries(year: number = 2026, monthIndex: number = 9, norms: MDMNorms = DEFAULT_RAJASTHAN_NORMS): DailyMDMEntry[] {
  const daysInMonth = new Date(year, monthIndex + 1, 0).getDate();
  const entries: DailyMDMEntry[] = [];

  for (let d = 1; d <= daysInMonth; d++) {
    const dateObj = new Date(year, monthIndex, d);
    const dayOfWeek = dateObj.getDay(); // 0 is Sunday
    const dateStr = `${year}-${String(monthIndex + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
    
    // Check if Sunday or sample holidays (e.g. Gandhi Jayanti on 2nd, Dussehra, Diwali breaks)
    let isWorkingDay = true;
    let holidayReason = '';

    if (dayOfWeek === 0) {
      isWorkingDay = false;
      holidayReason = 'रविवार (साप्ताहिक अवकाश)';
    } else if (d === 2) {
      isWorkingDay = false;
      holidayReason = 'गांधी जयंती / शास्त्री जयंती';
    } else if (d === 19 || d === 20) {
      isWorkingDay = false;
      holidayReason = 'दीपावली मध्यावधि अवकाश';
    }

    const menuInfo = RAJASTHAN_WEEKLY_MENU[dayOfWeek] || { name: 'रोटी - सब्जी', grain: 'wheat' as const };
    
    // Realistic attendance variations (around 80-85% of enrollment)
    const baseP = 42 + (d % 5) - 2;
    const baseUP = 34 + (d % 4) - 1;
    const primaryAtt = isWorkingDay ? Math.min(SAMPLE_SCHOOL_PROFILE.primaryEnrolled, Math.max(35, baseP)) : 0;
    const upperPrimaryAtt = isWorkingDay ? Math.min(SAMPLE_SCHOOL_PROFILE.upperPrimaryEnrolled, Math.max(28, baseUP)) : 0;

    const grainType = menuInfo.grain;
    const servedMilk = isWorkingDay; // Served daily on working days

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

    entries.push({
      date: dateStr,
      isWorkingDay,
      holidayReason: holidayReason || undefined,
      primaryAttendance: primaryAtt,
      upperPrimaryAttendance: upperPrimaryAtt,
      grainType,
      servedMilk,
      menuItem: isWorkingDay ? menuInfo.name : holidayReason,
      notes: '',
      ...metrics,
    });
  }

  return entries;
}
