"use client";

import { useEffect, useState } from "react";
import { LANGUAGES, type Language } from "../../lib/astrology/types";

const KEY = "astro:lang";

export function useLanguage(): [Language, (l: Language) => void] {
  const [lang, setLang] = useState<Language>("en");
  useEffect(() => {
    const saved = (typeof window !== "undefined" && localStorage.getItem(KEY)) as Language | null;
    if (saved) setLang(saved);
  }, []);
  function set(l: Language) {
    setLang(l);
    try { localStorage.setItem(KEY, l); } catch { /* ignore */ }
  }
  return [lang, set];
}

export default function LanguagePicker() {
  const [lang, setLang] = useLanguage();
  return (
    <select
      value={lang}
      onChange={(e) => setLang(e.target.value as Language)}
      className="rounded-md border border-[#E5C99F] bg-white px-2 py-1 text-xs text-[#333]"
      title="Response language"
    >
      {LANGUAGES.map((l) => (
        <option key={l.code} value={l.code}>{l.label}</option>
      ))}
    </select>
  );
}
