export interface UserAccount {
  mobileNumber: string; // 10 digit Indian mobile number (primary key)
  pin: string; // 4-digit security PIN for instant mobile login
  teacherName: string;
  role: 'headmaster' | 'incharge' | 'peeo';
  createdAt: string;
  lastLogin: string;
  profile: SchoolProfile;
  academicYear: string; // e.g. "2026-2027"
}

export interface SchoolProfile {
  id: string;
  schoolName: string;
  udiseCode: string;
  block: string;
  district: string;
  headmasterName: string;
  inchargeName: string;
  cchName1: string;
  cchName2?: string;
  bankAccountNo: string;
  bankIfsc: string;
  bankName: string;
  primaryEnrolled: number;
  upperPrimaryEnrolled: number;
}

export interface MDMNorms {
  primaryGrainGrams: number; // 100g
  upperPrimaryGrainGrams: number; // 150g
  primaryCookingCost: number; // 6.78
  upperPrimaryCookingCost: number; // 10.17
  primaryMilkPowderGrams: number; // 15g
  upperPrimaryMilkPowderGrams: number; // 20g
  primarySugarGrams: number; // 8.4g
  upperPrimarySugarGrams: number; // 10.2g
  primaryPreparedMilkMl: number; // 150ml
  upperPrimaryPreparedMilkMl: number; // 200ml
  cchMonthlyHonorarium: number; // 2142
}

export interface DailyMDMEntry {
  date: string; // YYYY-MM-DD
  isWorkingDay: boolean;
  holidayReason?: string;
  primaryAttendance: number;
  upperPrimaryAttendance: number;
  grainType: 'wheat' | 'rice' | 'mixed';
  servedMilk: boolean; // Bal Gopal milk served today
  menuItem: string;
  notes?: string;
  
  // Computed values
  totalStudents: number;
  wheatGrams: number;
  riceGrams: number;
  cookingCost: number;
  milkPowderGrams: number;
  sugarGrams: number;
  preparedMilkMl: number;
}

export interface StockOpeningAndReceipts {
  monthKey: string; // YYYY-MM
  openingWheatKg: number;
  openingRiceKg: number;
  openingMilkPowderKg: number;
  openingSugarKg: number;
  
  receivedWheatKg: number;
  receivedRiceKg: number;
  receivedMilkPowderKg: number;
  receivedSugarKg: number;

  openingCookingCash: number;
  receivedCookingCash: number;
  receivedCchCash: number;
}

export interface ComparativeBenchmark {
  metric: string;
  formula: string;
  appResult: string;
  excelBenchmarkResult: string;
  status: 'MATCHED' | 'DISCREPANCY';
  notes: string;
}
