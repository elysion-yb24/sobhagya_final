"use client";

import type { KundliLang } from "../../lib/astrology/types";

interface Props {
  lang: KundliLang;
  onChange: (l: KundliLang) => void;
  disabled?: boolean;
  ariaLabel?: string;
}

// Compact EN | हि switch used by /free-kundli and /services/gun-milan.
// AstrologyAPI's textual endpoints officially honour only English and
// Hindi for Accept-Language, so the switch is binary.
export default function LangToggle({ lang, onChange, disabled, ariaLabel }: Props) {
  return (
    <div
      role="group"
      aria-label={ariaLabel ?? "Response language"}
      className="inline-flex overflow-hidden rounded-md border border-[#E5C99F]"
    >
      {(["en", "hi"] as const).map((l) => {
        const selected = lang === l;
        return (
          <button
            key={l}
            type="button"
            onClick={() => onChange(l)}
            aria-pressed={selected}
            disabled={disabled}
            className={
              "px-2.5 py-1 text-[11px] font-semibold transition-colors " +
              (selected
                ? "bg-[#F7941D] text-white"
                : "bg-white text-[#6b4a1f] hover:text-[#F7941D]") +
              (disabled ? " opacity-50 cursor-not-allowed" : "")
            }
            title={l === "en" ? "English" : "हिन्दी"}
          >
            {l === "en" ? "EN" : "हि"}
          </button>
        );
      })}
    </div>
  );
}
