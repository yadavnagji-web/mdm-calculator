import { SchoolProfile, DailyMDMEntry, StockOpeningAndReceipts, MDMNorms } from '../types';
import { DEFAULT_BLANK_PROFILE, DEFAULT_BLANK_STOCK, generateCleanMonthEntries } from './sampleData';
import { DEFAULT_RAJASTHAN_NORMS } from './mdmCalculations';

const STORAGE_KEYS = {
  PROFILE: 'raj_mdm_school_profile',
  NORMS: 'raj_mdm_norms',
  ENTRIES: 'raj_mdm_daily_entries_', // append monthKey e.g. 2026-10
  STOCK: 'raj_mdm_stock_', // append monthKey
};

export function getSavedProfile(): SchoolProfile {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.PROFILE);
    if (raw) return JSON.parse(raw);
  } catch (e) {
    console.error('Failed reading school profile', e);
  }
  return DEFAULT_BLANK_PROFILE;
}

export function saveProfile(profile: SchoolProfile): void {
  localStorage.setItem(STORAGE_KEYS.PROFILE, JSON.stringify(profile));
}

export function getSavedNorms(): MDMNorms {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.NORMS);
    if (raw) return { ...DEFAULT_RAJASTHAN_NORMS, ...JSON.parse(raw) };
  } catch (e) {
    console.error('Failed reading norms', e);
  }
  return DEFAULT_RAJASTHAN_NORMS;
}

export function saveNorms(norms: MDMNorms): void {
  localStorage.setItem(STORAGE_KEYS.NORMS, JSON.stringify(norms));
}

export function getMonthlyEntries(monthKey: string): DailyMDMEntry[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.ENTRIES + monthKey);
    if (raw) return JSON.parse(raw);
  } catch (e) {
    console.error('Failed reading daily entries for ' + monthKey, e);
  }
  
  // Default to sample generated entries for the current/selected month
  const [yearStr, monthStr] = monthKey.split('-');
  const year = parseInt(yearStr, 10) || 2026;
  const monthIndex = (parseInt(monthStr, 10) || 10) - 1;
  const entries = generateCleanMonthEntries(year, monthIndex);
  saveMonthlyEntries(monthKey, entries);
  return entries;
}

export function saveMonthlyEntries(monthKey: string, entries: DailyMDMEntry[]): void {
  localStorage.setItem(STORAGE_KEYS.ENTRIES + monthKey, JSON.stringify(entries));
}

export function getStockData(monthKey: string): StockOpeningAndReceipts {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.STOCK + monthKey);
    if (raw) return JSON.parse(raw);
  } catch (e) {
    console.error('Failed reading stock data for ' + monthKey, e);
  }
  return DEFAULT_BLANK_STOCK(monthKey);
}

export function saveStockData(monthKey: string, stock: StockOpeningAndReceipts): void {
  localStorage.setItem(STORAGE_KEYS.STOCK + monthKey, JSON.stringify(stock));
}

/**
 * Export full backup as JSON file download
 */
export function exportBackupJSON(monthKey: string): void {
  const profile = getSavedProfile();
  const norms = getSavedNorms();
  const entries = getMonthlyEntries(monthKey);
  const stock = getStockData(monthKey);

  const data = {
    appName: 'Rajasthan School MDM & Bal Gopal Yojana Calculator',
    version: '2.0.0',
    exportDate: new Date().toISOString(),
    monthKey,
    profile,
    norms,
    entries,
    stock,
  };

  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `MDM_Backup_${profile.udiseCode || 'school'}_${monthKey}.json`;
  a.click();
  URL.revokeObjectURL(url);
}

/**
 * Import backup from JSON file
 */
export function importBackupJSON(jsonStr: string): boolean {
  try {
    const data = JSON.parse(jsonStr);
    if (data.profile) saveProfile(data.profile);
    if (data.norms) saveNorms(data.norms);
    if (data.monthKey && data.entries) saveMonthlyEntries(data.monthKey, data.entries);
    if (data.monthKey && data.stock) saveStockData(data.monthKey, data.stock);
    return true;
  } catch (e) {
    console.error('Import failed', e);
    return false;
  }
}
