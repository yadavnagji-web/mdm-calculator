import { MDMNorms, DailyMDMEntry } from '../types';

export const DEFAULT_RAJASTHAN_NORMS: MDMNorms = {
  primaryGrainGrams: 100, // 100g per primary student
  upperPrimaryGrainGrams: 150, // 150g per upper primary student
  primaryCookingCost: 6.78, // Effective May 2025 onwards (₹6.78)
  upperPrimaryCookingCost: 10.17, // Effective May 2025 onwards (₹10.17)
  primaryMilkPowderGrams: 15.0, // 15 grams MMBGY
  upperPrimaryMilkPowderGrams: 20.0, // 20 grams MMBGY
  primarySugarGrams: 8.4, // 8.4 grams MMBGY
  upperPrimarySugarGrams: 10.2, // 10.2 grams MMBGY
  primaryPreparedMilkMl: 150, // 150 ml
  upperPrimaryPreparedMilkMl: 200, // 200 ml
  cchMonthlyHonorarium: 2142, // Standard cook-cum-helper monthly honorarium
};

export const RAJASTHAN_WEEKLY_MENU: Record<number, { name: string; grain: 'wheat' | 'rice' | 'mixed' }> = {
  1: { name: 'रोटी - दाल / मौसमी सब्जी', grain: 'wheat' }, // Monday
  2: { name: 'दाल - चावल (सोयाबीन युक्त)', grain: 'rice' }, // Tuesday
  3: { name: 'रोटी - दाल / चना मसाला', grain: 'wheat' }, // Wednesday
  4: { name: 'सब्जीयुक्त खिचड़ी / पौष्टिक तहरी', grain: 'mixed' }, // Thursday
  5: { name: 'रोटी - हरी मौसमी सब्जी / दाल', grain: 'wheat' }, // Friday
  6: { name: 'दाल - बाटी / मसाला नमकीन खिचड़ी', grain: 'wheat' }, // Saturday
  0: { name: 'रविवार (अवकाश)', grain: 'wheat' }, // Sunday
};

/**
 * Calculates all daily consumption metrics based on attendance and government norms
 */
export function calculateDailyMetrics(
  primaryAtt: number,
  upperPrimaryAtt: number,
  grainType: 'wheat' | 'rice' | 'mixed',
  servedMilk: boolean,
  norms: MDMNorms = DEFAULT_RAJASTHAN_NORMS
) {
  const pAtt = Math.max(0, Number(primaryAtt) || 0);
  const upAtt = Math.max(0, Number(upperPrimaryAtt) || 0);
  const totalStudents = pAtt + upAtt;

  // Grain consumption in grams
  const totalGrainGrams = (pAtt * norms.primaryGrainGrams) + (upAtt * norms.upperPrimaryGrainGrams);
  
  let wheatGrams = 0;
  let riceGrams = 0;

  if (grainType === 'wheat') {
    wheatGrams = totalGrainGrams;
    riceGrams = 0;
  } else if (grainType === 'rice') {
    wheatGrams = 0;
    riceGrams = totalGrainGrams;
  } else {
    // Mixed (e.g. Khichdi: typically 50% wheat/dalia or 50% rice)
    wheatGrams = Math.round(totalGrainGrams * 0.5);
    riceGrams = totalGrainGrams - wheatGrams;
  }

  // Cooking conversion cost (in Rupees)
  const cookingCost = (pAtt * norms.primaryCookingCost) + (upAtt * norms.upperPrimaryCookingCost);

  // Bal Gopal Milk Scheme Metrics
  let milkPowderGrams = 0;
  let sugarGrams = 0;
  let preparedMilkMl = 0;

  if (servedMilk) {
    milkPowderGrams = (pAtt * norms.primaryMilkPowderGrams) + (upAtt * norms.upperPrimaryMilkPowderGrams);
    sugarGrams = (pAtt * norms.primarySugarGrams) + (upAtt * norms.upperPrimarySugarGrams);
    preparedMilkMl = (pAtt * norms.primaryPreparedMilkMl) + (upAtt * norms.upperPrimaryPreparedMilkMl);
  }

  return {
    totalStudents,
    wheatGrams: Math.round(wheatGrams * 100) / 100,
    riceGrams: Math.round(riceGrams * 100) / 100,
    cookingCost: Math.round(cookingCost * 100) / 100,
    milkPowderGrams: Math.round(milkPowderGrams * 100) / 100,
    sugarGrams: Math.round(sugarGrams * 100) / 100,
    preparedMilkMl: Math.round(preparedMilkMl),
  };
}

/**
 * Aggregates monthly totals from an array of daily entries
 */
export function aggregateMonthlyEntries(entries: DailyMDMEntry[]) {
  return entries.reduce(
    (acc, curr) => {
      if (curr.isWorkingDay) {
        acc.workingDays += 1;
        acc.totalPrimaryBenefited += curr.primaryAttendance;
        acc.totalUpperPrimaryBenefited += curr.upperPrimaryAttendance;
        acc.totalStudentsBenefited += curr.totalStudents;
        acc.totalWheatGrams += curr.wheatGrams;
        acc.totalRiceGrams += curr.riceGrams;
        acc.totalCookingCost += curr.cookingCost;
        if (curr.servedMilk) {
          acc.milkDistributionDays += 1;
          acc.totalMilkPowderGrams += curr.milkPowderGrams;
          acc.totalSugarGrams += curr.sugarGrams;
          acc.totalPreparedMilkMl += curr.preparedMilkMl;
        }
      }
      return acc;
    },
    {
      workingDays: 0,
      totalPrimaryBenefited: 0,
      totalUpperPrimaryBenefited: 0,
      totalStudentsBenefited: 0,
      totalWheatGrams: 0,
      totalRiceGrams: 0,
      totalCookingCost: 0,
      milkDistributionDays: 0,
      totalMilkPowderGrams: 0,
      totalSugarGrams: 0,
      totalPreparedMilkMl: 0,
    }
  );
}

/**
 * Format number to 2 or 3 decimals or Indian currency
 */
export function formatKg(grams: number): string {
  return (grams / 1000).toFixed(3);
}

export function formatInr(amount: number): string {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 2,
  }).format(amount);
}
