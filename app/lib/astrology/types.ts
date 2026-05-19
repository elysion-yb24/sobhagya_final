export type Language =
  | "en" | "hi" | "te" | "ta" | "ml" | "kn" | "mr" | "bn" | "gu" | "fr" | "es";

export const LANGUAGES: { code: Language; label: string }[] = [
  { code: "en", label: "English" },
  { code: "hi", label: "हिन्दी" },
  { code: "te", label: "తెలుగు" },
  { code: "ta", label: "தமிழ்" },
  { code: "ml", label: "മലയാളം" },
  { code: "kn", label: "ಕನ್ನಡ" },
  { code: "mr", label: "मराठी" },
  { code: "bn", label: "বাংলা" },
  { code: "gu", label: "ગુજરાતી" },
  { code: "fr", label: "Français" },
  { code: "es", label: "Español" },
];

export interface BirthDetails {
  name?: string;
  gender?: "male" | "female" | "other";
  day: number;
  month: number;
  year: number;
  hour: number;
  min: number;
  lat: number;
  lon: number;
  tzone: number;
  place?: string;
}

export interface MatchDetails {
  m_day: number; m_month: number; m_year: number;
  m_hour: number; m_min: number;
  m_lat: number; m_lon: number; m_tzone: number;
  f_day: number; f_month: number; f_year: number;
  f_hour: number; f_min: number;
  f_lat: number; f_lon: number; f_tzone: number;
}

export type ChartId =
  | "D1" | "D2" | "D3" | "D4" | "D7" | "D9" | "D10" | "D12"
  | "D16" | "D20" | "D24" | "D27" | "D30" | "D40" | "D45" | "D60"
  | "chalit" | "moon" | "sun";

export const VEDIC_CHART_IDS: ChartId[] = [
  "D1", "D2", "D3", "D4", "D7", "D9", "D10", "D12",
  "D16", "D20", "D24", "D27", "D30", "D40", "D45", "D60",
  "chalit", "moon", "sun",
];

export const CHART_ID_LABELS: Record<ChartId, string> = {
  D1: "D1 - Rashi (Birth)",
  D2: "D2 - Hora (Wealth)",
  D3: "D3 - Drekkana (Siblings)",
  D4: "D4 - Chaturthamsa (Fortune)",
  D7: "D7 - Saptamsa (Children)",
  D9: "D9 - Navamsa (Spouse)",
  D10: "D10 - Dasamsa (Career)",
  D12: "D12 - Dwadasamsa (Parents)",
  D16: "D16 - Shodasamsa (Vehicles)",
  D20: "D20 - Vimsamsa (Spirituality)",
  D24: "D24 - Chaturvimsamsa (Education)",
  D27: "D27 - Bhamsa (Strengths)",
  D30: "D30 - Trimsamsa (Misfortunes)",
  D40: "D40 - Khavedamsa (Maternal)",
  D45: "D45 - Akshavedamsa (Paternal)",
  D60: "D60 - Shashtiamsa (Past Karma)",
  chalit: "Chalit Chart",
  moon: "Moon Chart",
  sun: "Sun Chart",
};

export type ZodiacSign =
  | "aries" | "taurus" | "gemini" | "cancer"
  | "leo" | "virgo" | "libra" | "scorpio"
  | "sagittarius" | "capricorn" | "aquarius" | "pisces";

export const ZODIAC_SIGNS: ZodiacSign[] = [
  "aries", "taurus", "gemini", "cancer",
  "leo", "virgo", "libra", "scorpio",
  "sagittarius", "capricorn", "aquarius", "pisces",
];

export const ZODIAC_SYMBOLS: Record<ZodiacSign, string> = {
  aries: "♈", taurus: "♉", gemini: "♊", cancer: "♋",
  leo: "♌", virgo: "♍", libra: "♎", scorpio: "♏",
  sagittarius: "♐", capricorn: "♑", aquarius: "♒", pisces: "♓",
};
