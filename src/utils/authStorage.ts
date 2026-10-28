import { UserAccount, SchoolProfile, DailyMDMEntry, StockOpeningAndReceipts, MDMNorms } from '../types';
import { DEFAULT_BLANK_PROFILE, DEFAULT_BLANK_STOCK, generateCleanMonthEntries } from './sampleData';

const AUTH_KEYS = {
  USERS_REGISTRY: 'raj_mdm_users_registry',
  ACTIVE_SESSION: 'raj_mdm_active_session_mobile',
};

/**
 * Get all registered user accounts from device storage
 * Production mode: no hardcoded demo users.
 */
export function getAllRegisteredUsers(): Record<string, UserAccount> {
  try {
    const raw = localStorage.getItem(AUTH_KEYS.USERS_REGISTRY);
    if (raw) return JSON.parse(raw);
  } catch (e) {
    console.error('Error reading users registry', e);
  }
  return {};
}

/**
 * Register a new teacher account
 */
export function registerUser(account: UserAccount): { success: boolean; message: string } {
  const cleanMobile = account.mobileNumber.replace(/\D/g, '');
  if (cleanMobile.length !== 10) {
    return { success: false, message: 'कृपया वैध 10 अंकों का मोबाइल नंबर दर्ज करें।' };
  }
  if (!account.pin || account.pin.length < 4) {
    return { success: false, message: 'सुरक्षा पिन (PIN) कम से कम 4 अंकों का होना चाहिए।' };
  }

  const registry = getAllRegisteredUsers();
  if (registry[cleanMobile]) {
    return { success: false, message: 'यह मोबाइल नंबर पहले से पंजीकृत है! कृपया लॉगिन करें।' };
  }

  account.mobileNumber = cleanMobile;
  account.createdAt = new Date().toISOString();
  account.lastLogin = new Date().toISOString();
  
  registry[cleanMobile] = account;
  localStorage.setItem(AUTH_KEYS.USERS_REGISTRY, JSON.stringify(registry));

  // Initialize initial user storage
  saveUserScopedProfile(cleanMobile, account.profile);
  setActiveSession(cleanMobile);

  return { success: true, message: 'पंजीकरण सफल रहा! आपका विद्यालय खाता सक्रिय हो गया है।' };
}

/**
 * Login user with mobile number and PIN
 */
export function loginUser(mobile: string, pin: string): { success: boolean; user?: UserAccount; message: string } {
  const cleanMobile = mobile.replace(/\D/g, '');
  const registry = getAllRegisteredUsers();
  const user = registry[cleanMobile];

  if (!user) {
    return { success: false, message: 'यह मोबाइल नंबर पंजीकृत नहीं है। कृपया पहले नया खाता बनाएं।' };
  }

  if (user.pin !== pin.trim()) {
    return { success: false, message: 'गलत सुरक्षा पिन (PIN)! कृपया सही 4-अंकीय पिन दर्ज करें।' };
  }

  // Update last login
  user.lastLogin = new Date().toISOString();
  registry[cleanMobile] = user;
  localStorage.setItem(AUTH_KEYS.USERS_REGISTRY, JSON.stringify(registry));

  setActiveSession(cleanMobile);
  return { success: true, user, message: 'सफलतापूर्वक लॉगिन हो गया!' };
}

/**
 * Active Session management
 */
export function getActiveSessionUser(): UserAccount | null {
  try {
    const activeMobile = localStorage.getItem(AUTH_KEYS.ACTIVE_SESSION);
    if (!activeMobile) return null;
    const registry = getAllRegisteredUsers();
    return registry[activeMobile] || null;
  } catch (e) {
    console.error('Error fetching active session', e);
    return null;
  }
}

export function setActiveSession(mobile: string): void {
  localStorage.setItem(AUTH_KEYS.ACTIVE_SESSION, mobile);
}

export function logoutUser(): void {
  localStorage.removeItem(AUTH_KEYS.ACTIVE_SESSION);
}

/**
 * User-Scoped Data Helpers
 */
function getUserKey(mobile: string, keyName: string): string {
  return `raj_mdm_u_${mobile}_${keyName}`;
}

export function getUserScopedProfile(mobile: string): SchoolProfile {
  try {
    const raw = localStorage.getItem(getUserKey(mobile, 'profile'));
    if (raw) return JSON.parse(raw);
    const registry = getAllRegisteredUsers();
    if (registry[mobile]?.profile) return registry[mobile].profile;
  } catch (e) {
    console.error('Error getting user profile', e);
  }
  return DEFAULT_BLANK_PROFILE;
}

export function saveUserScopedProfile(mobile: string, profile: SchoolProfile): void {
  localStorage.setItem(getUserKey(mobile, 'profile'), JSON.stringify(profile));
  const registry = getAllRegisteredUsers();
  if (registry[mobile]) {
    registry[mobile].profile = profile;
    localStorage.setItem(AUTH_KEYS.USERS_REGISTRY, JSON.stringify(registry));
  }
}

export function getUserScopedEntries(mobile: string, monthKey: string, norms: MDMNorms): DailyMDMEntry[] {
  try {
    const raw = localStorage.getItem(getUserKey(mobile, `entries_${monthKey}`));
    if (raw) return JSON.parse(raw);
  } catch (e) {
    console.error('Error reading user monthly entries', e);
  }

  // Clean empty month entries ready for entry
  const [yearStr, monthStr] = monthKey.split('-');
  const year = parseInt(yearStr, 10) || new Date().getFullYear();
  const monthIndex = (parseInt(monthStr, 10) || (new Date().getMonth() + 1)) - 1;
  const entries = generateCleanMonthEntries(year, monthIndex);
  saveUserScopedEntries(mobile, monthKey, entries);
  return entries;
}

export function saveUserScopedEntries(mobile: string, monthKey: string, entries: DailyMDMEntry[]): void {
  localStorage.setItem(getUserKey(mobile, `entries_${monthKey}`), JSON.stringify(entries));
}

export function getUserScopedStock(mobile: string, monthKey: string): StockOpeningAndReceipts {
  try {
    const raw = localStorage.getItem(getUserKey(mobile, `stock_${monthKey}`));
    if (raw) return JSON.parse(raw);
  } catch (e) {
    console.error('Error reading user stock', e);
  }
  return DEFAULT_BLANK_STOCK(monthKey);
}

export function saveUserScopedStock(mobile: string, monthKey: string, stock: StockOpeningAndReceipts): void {
  localStorage.setItem(getUserKey(mobile, `stock_${monthKey}`), JSON.stringify(stock));
}
