// Utility functions for storing and fetching kundli and gun milan calculations

const KUNDLI_STORAGE_KEY = 'sobhagya-kundli-history';
const GUN_MILAN_STORAGE_KEY = 'sobhagya-gun-milan-history';
const MAX_HISTORY = 3;

export interface KundliCalculation {
  id: string;
  timestamp: string;
  formData: {
    name: string;
    gender: string;
    dateOfBirth: string;
    timeOfBirth: string;
    placeOfBirth: string;
  };
  kundliData: any;
}

export interface GunMilanCalculation {
  id: string;
  timestamp: string;
  boyData: {
    name: string;
    dateOfBirth: string;
    timeOfBirth: string;
    state: string;
  };
  girlData: {
    name: string;
    dateOfBirth: string;
    timeOfBirth: string;
    state: string;
  };
  result: any;
}

// Save Kundli calculation (keeps only last 3)
export const saveKundliCalculation = (formData: any, kundliData: any): void => {
  if (typeof window === 'undefined') return;

  try {
    const calculation: KundliCalculation = {
      id: `kundli-${Date.now()}-${Math.random().toString(36).substring(2, 11)}`,
      timestamp: new Date().toISOString(),
      formData,
      kundliData,
    };

    const existing = getKundliCalculations();
    const updated = [calculation, ...existing].slice(0, MAX_HISTORY);
    
    localStorage.setItem(KUNDLI_STORAGE_KEY, JSON.stringify(updated));
  } catch (error) {
    console.error('Error saving Kundli calculation:', error);
  }
};

// Get all Kundli calculations (last 3)
export const getKundliCalculations = (): KundliCalculation[] => {
  if (typeof window === 'undefined') return [];

  try {
    const stored = localStorage.getItem(KUNDLI_STORAGE_KEY);
    if (!stored) return [];
    
    return JSON.parse(stored) as KundliCalculation[];
  } catch (error) {
    console.error('Error fetching Kundli calculations:', error);
    return [];
  }
};

// Get specific Kundli calculation by ID
export const getKundliCalculationById = (id: string): KundliCalculation | null => {
  const calculations = getKundliCalculations();
  return calculations.find(calc => calc.id === id) || null;
};

// Delete Kundli calculation
export const deleteKundliCalculation = (id: string): void => {
  if (typeof window === 'undefined') return;

  try {
    const existing = getKundliCalculations();
    const updated = existing.filter(calc => calc.id !== id);
    localStorage.setItem(KUNDLI_STORAGE_KEY, JSON.stringify(updated));
  } catch (error) {
    console.error('Error deleting Kundli calculation:', error);
  }
};

// Save Gun Milan calculation (keeps only last 3)
export const saveGunMilanCalculation = (boyData: any, girlData: any, result: any): void => {
  if (typeof window === 'undefined') return;

  try {
    const calculation: GunMilanCalculation = {
      id: `gun-milan-${Date.now()}-${Math.random().toString(36).substring(2, 11)}`,
      timestamp: new Date().toISOString(),
      boyData,
      girlData,
      result,
    };

    const existing = getGunMilanCalculations();
    const updated = [calculation, ...existing].slice(0, MAX_HISTORY);
    
    localStorage.setItem(GUN_MILAN_STORAGE_KEY, JSON.stringify(updated));
  } catch (error) {
    console.error('Error saving Gun Milan calculation:', error);
  }
};

// Get all Gun Milan calculations (last 3)
export const getGunMilanCalculations = (): GunMilanCalculation[] => {
  if (typeof window === 'undefined') return [];

  try {
    const stored = localStorage.getItem(GUN_MILAN_STORAGE_KEY);
    if (!stored) return [];
    
    return JSON.parse(stored) as GunMilanCalculation[];
  } catch (error) {
    console.error('Error fetching Gun Milan calculations:', error);
    return [];
  }
};

// Get specific Gun Milan calculation by ID
export const getGunMilanCalculationById = (id: string): GunMilanCalculation | null => {
  const calculations = getGunMilanCalculations();
  return calculations.find(calc => calc.id === id) || null;
};

// Delete Gun Milan calculation
export const deleteGunMilanCalculation = (id: string): void => {
  if (typeof window === 'undefined') return;

  try {
    const existing = getGunMilanCalculations();
    const updated = existing.filter(calc => calc.id !== id);
    localStorage.setItem(GUN_MILAN_STORAGE_KEY, JSON.stringify(updated));
  } catch (error) {
    console.error('Error deleting Gun Milan calculation:', error);
  }
};

