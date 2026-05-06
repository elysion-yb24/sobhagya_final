"use client";
import { RashiSign } from "@/types";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { motion, useReducedMotion } from "framer-motion";
import Lottie, { LottieRefCurrentProps } from "lottie-react";
import { useState, useEffect, useRef } from "react";
import SectionHeader from "./ui/SectionHeader";

interface RashiSignWithTraits extends RashiSign {
  traits: [string, string];
  element: "Fire" | "Earth" | "Air" | "Water";
}

const rashiSigns: RashiSignWithTraits[] = [
  { name: "Aries", hindiName: "मेष", image: "/aries.json", traits: ["Fiery", "Bold"], element: "Fire" },
  { name: "Taurus", hindiName: "वृषभ", image: "/taurus.json", traits: ["Grounded", "Steady"], element: "Earth" },
  { name: "Gemini", hindiName: "मिथुन", image: "/gemini (1).json", traits: ["Curious", "Witty"], element: "Air" },
  { name: "Cancer", hindiName: "कर्क", image: "/cancer.json", traits: ["Caring", "Intuitive"], element: "Water" },
  { name: "Leo", hindiName: "सिंह", image: "/leo.json", traits: ["Radiant", "Loyal"], element: "Fire" },
  { name: "Virgo", hindiName: "कन्या", image: "/virgo.json", traits: ["Refined", "Analytical"], element: "Earth" },
  { name: "Libra", hindiName: "तुला", image: "/libra.json", traits: ["Balanced", "Charming"], element: "Air" },
  { name: "Scorpio", hindiName: "वृश्चिक", image: "/scorpio.json", traits: ["Intense", "Magnetic"], element: "Water" },
  { name: "Sagittarius", hindiName: "धनु", image: "/sagittarius.json", traits: ["Free", "Optimistic"], element: "Fire" },
  { name: "Capricorn", hindiName: "मकर", image: "/capricorn.json", traits: ["Driven", "Ambitious"], element: "Earth" },
  { name: "Aquarius", hindiName: "कुंभ", image: "/aquarius.json", traits: ["Visionary", "Inventive"], element: "Air" },
  { name: "Pisces", hindiName: "मीन", image: "/pisces.json", traits: ["Empathic", "Dreamy"], element: "Water" },
];

// Lazy Lottie that exposes ref-controlled playback
const RashiLottie: React.FC<{
  src: string;
  play: boolean;
  oneShot: boolean;
  reduced: boolean;
}> = ({ src, play, oneShot, reduced }) => {
  const [animationData, setAnimationData] = useState<unknown | null>(null);
  const [loading, setLoading] = useState(true);
  const lottieRef = useRef<LottieRefCurrentProps>(null);
  const playedOnce = useRef(false);

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      try {
        const res = await fetch(src);
        const data = await res.json();
        if (!cancelled) setAnimationData(data);
      } catch (err) {
        console.error("Error loading rashi animation:", err);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    load();
    return () => {
      cancelled = true;
    };
  }, [src]);

  useEffect(() => {
    const lottie = lottieRef.current;
    if (!lottie || !animationData || reduced) return;
    if (oneShot) {
      // Mobile path — play once when prop says so
      if (play && !playedOnce.current) {
        lottie.goToAndPlay(0);
        playedOnce.current = true;
      }
      return;
    }
    // Desktop path — play on hover, stop on leave
    if (play) {
      lottie.play();
    } else {
      lottie.stop();
    }
  }, [play, animationData, oneShot, reduced]);

  if (loading) {
    return (
      <div className="w-10 h-10 sm:w-12 sm:h-12 flex items-center justify-center">
        <div className="w-6 h-6 border-2 border-orange-400 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }
  if (!animationData) {
    return (
      <div className="w-10 h-10 sm:w-12 sm:h-12 flex items-center justify-center bg-gray-200 rounded-full">
        <span className="text-xs text-gray-500">?</span>
      </div>
    );
  }

  return (
    <div className="w-10 h-10 sm:w-12 sm:h-12 flex items-center justify-center">
      <Lottie
        lottieRef={lottieRef}
        animationData={animationData}
        loop={!oneShot}
        autoplay={false}
        style={{ width: "100%", height: "100%" }}
      />
    </div>
  );
};

const ELEMENT_COLOR: Record<RashiSignWithTraits["element"], string> = {
  Fire: "#F26C2A",
  Earth: "#7B5B2A",
  Air: "#5B8AB0",
  Water: "#3F8FB6",
};

const RashiSection: React.FC = () => {
  const router = useRouter();
  const reduced = useReducedMotion() ?? false;
  const sectionRef = useRef<HTMLElement>(null);

  const [hoverIndex, setHoverIndex] = useState<number | null>(null);
  const [flippedIndex, setFlippedIndex] = useState<number | null>(null);
  const [isMobile, setIsMobile] = useState(false);
  const [inView, setInView] = useState(false);

  useEffect(() => {
    const update = () =>
      setIsMobile(window.matchMedia("(pointer: coarse)").matches);
    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, []);

  // Trigger one-shot Lottie when section enters view (mobile path)
  useEffect(() => {
    const node = sectionRef.current;
    if (!node) return;
    const obs = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setInView(true);
          obs.disconnect();
        }
      },
      { threshold: 0.15 }
    );
    obs.observe(node);
    return () => obs.disconnect();
  }, []);

  // ESC unflips
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setFlippedIndex(null);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  // Twinkle stars — generated on the client only to avoid SSR/CSR
  // hydration mismatches from Math.random()
  const [stars, setStars] = useState<
    { left: number; top: number; size: number; delay: number; duration: number }[]
  >([]);
  useEffect(() => {
    setStars(
      Array.from({ length: 30 }).map(() => ({
        left: Math.random() * 100,
        top: Math.random() * 100,
        size: 2 + Math.random() * 3,
        delay: Math.random() * 3,
        duration: 2.4 + Math.random() * 2.4,
      }))
    );
  }, []);

  const activeIndex = flippedIndex ?? hoverIndex;

  const handleCardClick = (i: number, name: string) => {
    if (reduced) {
      router.push(`/services/horoscope/${name.toLowerCase()}`);
      return;
    }
    setFlippedIndex((prev) => (prev === i ? null : i));
  };

  const handleKey = (e: React.KeyboardEvent, i: number, name: string) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      handleCardClick(i, name);
    }
  };

  return (
    <section
      ref={sectionRef}
      className="bg-[#E691261A] section-spacing relative overflow-hidden"
    >
      {/* Twinkle stars backdrop — client-only to avoid hydration mismatch */}
      {!reduced && stars.length > 0 && (
        <div className="absolute inset-0 pointer-events-none z-0">
          {stars.map((s, i) => (
            <span
              key={i}
              className="absolute rounded-full bg-[#F7941D]/45 animate-twinkle-soft"
              style={{
                left: `${s.left}%`,
                top: `${s.top}%`,
                width: `${s.size}px`,
                height: `${s.size}px`,
                animationDelay: `${s.delay}s`,
                animationDuration: `${s.duration}s`,
              }}
            />
          ))}
        </div>
      )}

      {/* Mandala backdrop */}
      <div className="absolute inset-0 flex justify-center items-center opacity-5 pointer-events-none select-none z-0">
        <Image
          src="/sobhagya-logo.svg"
          alt="Astrology Icon"
          width={300}
          height={300}
          className="object-contain animate-mandala-spin"
        />
      </div>

      <div className="section-container relative z-10">
        <SectionHeader
          tag="Daily Insights"
          title="Astrology Insights for Your Rashi Today"
          subtitle="Get accurate predictions, guidance, and remedies for love, career, health, and more"
          center
        />

        <div
          className="grid grid-cols-3 xs:grid-cols-3 sm:grid-cols-4 md:grid-cols-4 lg:grid-cols-6 gap-3 xs:gap-4 sm:gap-6 md:gap-8 max-w-6xl mx-auto"
          style={{ perspective: "1400px" }}
          onMouseLeave={() => setHoverIndex(null)}
        >
          {rashiSigns.map((rashi, i) => {
            const isFlipped = flippedIndex === i;
            const isHovered = hoverIndex === i;
            const distance =
              activeIndex == null ? 0 : Math.abs(i - activeIndex);
            const groupTilt =
              activeIndex == null || activeIndex === i || reduced || isMobile
                ? 0
                : Math.max(-6, Math.min(6, (i - activeIndex) * -3));

            // Lottie play logic
            const shouldPlay = reduced
              ? false
              : isMobile
              ? inView
              : isHovered || isFlipped;

            return (
              <motion.div
                key={rashi.name}
                role="button"
                tabIndex={0}
                aria-pressed={isFlipped}
                aria-label={`${rashi.name} (${rashi.hindiName}) — view daily horoscope`}
                onClick={() => handleCardClick(i, rashi.name)}
                onKeyDown={(e) => handleKey(e, i, rashi.name)}
                onMouseEnter={() => setHoverIndex(i)}
                className={`relative cursor-pointer outline-none focus-visible:ring-2 focus-visible:ring-[#F7941D] flip-card ${
                  isFlipped ? "is-flipped" : ""
                }`}
                style={{
                  height: "150px",
                  transformStyle: "preserve-3d",
                }}
                animate={{
                  rotateY: groupTilt,
                  scale: distance === 0 && (isHovered || isFlipped) ? 1.05 : 1,
                }}
                transition={{ type: "spring", stiffness: 220, damping: 22 }}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.2 }}
              >
                <div className="flip-card-inner">
                  {/* FRONT */}
                  <div
                    className="flip-card-face bg-white p-3 xs:p-4 sm:p-5 md:p-6 rounded-xl shadow-md group astro-card border border-orange-100 flex flex-col items-center justify-center"
                    style={{
                      borderTopColor: ELEMENT_COLOR[rashi.element],
                      borderTopWidth: "3px",
                    }}
                  >
                    <div className="w-10 h-10 sm:w-12 sm:h-12 mb-2 flex items-center justify-center mx-auto">
                      <RashiLottie
                        src={rashi.image || "/default-image.png"}
                        play={shouldPlay}
                        oneShot={isMobile}
                        reduced={reduced}
                      />
                    </div>
                    <div className="text-[#373737] text-sm sm:text-base font-medium mb-0.5 text-center">
                      {rashi.hindiName}
                    </div>
                    <div className="text-[#373737] text-xs font-medium text-center">
                      {rashi.name}
                    </div>
                  </div>

                  {/* BACK */}
                  <div
                    className="flip-card-face flip-card-back rounded-xl text-white p-3 flex flex-col items-center justify-center text-center shadow-md"
                    style={{
                      background: `linear-gradient(135deg, ${ELEMENT_COLOR[rashi.element]} 0%, #F7941D 100%)`,
                    }}
                  >
                    <div className="text-[10px] font-bold uppercase tracking-wider opacity-90">
                      {rashi.element}
                    </div>
                    <div className="text-sm font-bold mt-0.5">
                      {rashi.name}
                    </div>
                    <div className="flex flex-wrap justify-center gap-1 mt-1.5">
                      {rashi.traits.map((t) => (
                        <span
                          key={t}
                          className="text-[10px] bg-white/25 backdrop-blur px-1.5 py-0.5 rounded-full font-semibold"
                        >
                          {t}
                        </span>
                      ))}
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        router.push(
                          `/services/horoscope/${rashi.name.toLowerCase()}`
                        );
                      }}
                      className="mt-2 text-[10px] font-bold bg-white text-[#7A4A0F] px-2.5 py-1 rounded-full hover:scale-105 transition-transform"
                    >
                      View Horoscope →
                    </button>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default RashiSection;
