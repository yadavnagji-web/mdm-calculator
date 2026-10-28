import { SchoolProfile, DailyMDMEntry, StockOpeningAndReceipts, MDMNorms } from '../types';
import { RAJASTHAN_WEEKLY_MENU, DEFAULT_RAJASTHAN_NORMS } from './mdmCalculations';

export const DEFAULT_BLANK_PROFILE: SchoolProfile = {
  id: '',
  schoolName: 'राजकीय विद्यालय',
  udiseCode: '',
  block: '',
  district: '',
  headmasterName: '',
  inchargeName: '',
  cchName1: '',
  cchName2: '',
  bankAccountNo: '',
  bankIfsc: '',
  bankName: '',
  primaryEnrolled: 0,
  upperPrimaryEnrolled: 0,
};

export const DEFAULT_BLANK_STOCK = (monthKey: string): StockOpeningAndReceipts => ({
  monthKey,
  openingWheatKg: 0,
  openingRiceKg: 0,
  openingMilkPowderKg: 0,
  openingSugarKg: 0,
  receivedWheatKg: 0,
  receivedRiceKg: 0,
  receivedMilkPowderKg: 0,
  receivedSugarKg: 0,
  openingCookingCash: 0,
  receivedCookingCash: 0,
  receivedCchCash: 0,
});

/**
 * Generate a clean, empty month (ready for teacher daily entry)
 */
export function generateCleanMonthEntries(year: number, monthIndex: number): DailyMDMEntry[] {
  const daysInMonth = new Date(year, monthIndex + 1, 0).getDate();
  const entries: DailyMDMEntry[] = [];

  for (let d = 1; d <= daysInMonth; d++) {
    const dateObj = new Date(year, monthIndex, d);
    const dayOfWeek = dateObj.getDay(); // 0 is Sunday
    const dateStr = `${year}-${String(monthIndex + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
    
    const isSunday = dayOfWeek === 0;
    const menuInfo = RAJASTHAN_WEEKLY_MENU[dayOfWeek] || { name: 'रोटी - सब्जी', grain: 'wheat' as const };

    entries.push({
      date: dateStr,
      isWorkingDay: !isSunday,
      holidayReason: isSunday ? 'रविवार (साप्ताहिक अवकाश)' : undefined,
      primaryAttendance: 0,
      upperPrimaryAttendance: 0,
      totalStudents: 0,
      grainType: menuInfo.grain,
      servedMilk: !isSunday,
      menuItem: !isSunday ? menuInfo.name : 'रविवार (साप्ताहिक अवकाश)',
      wheatGrams: 0,
      riceGrams: 0,
      cookingCost: 0,
      milkPowderGrams: 0,
      sugarGrams: 0,
      preparedMilkMl: 0,
      notes: '',
    });
  }

  return entries;
}
