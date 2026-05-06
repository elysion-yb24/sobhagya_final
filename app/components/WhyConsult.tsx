'use client'
import { motion, useReducedMotion, useScroll, useTransform } from 'framer-motion';
import {
  ArrowRight,
  Sparkles,
  Star,
  Brain,
  Heart,
  Crown,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';
import { useTilt } from '@/app/hooks/useTilt';
import { useScrollParallax } from '@/app/hooks/useScrollParallax';

const cosmicJourney = [
  {
    phase: 'Discovery',
    icon: Star,
    title: 'Birth Chart Analysis',
    description:
      'Uncover your cosmic blueprint and your unique planetary influences.',
    color: '#F7971D',
    step: '01',
  },
  {
    phase: 'Understanding',
    icon: Brain,
    title: 'Personality Insights',
    description:
      'Discover strengths, blind spots and hidden potential in your placements.',
    color: '#A66BFF',
    step: '02',
  },
  {
    phase: 'Guidance',
    icon: Heart,
    title: 'Life Path Direction',
    description: "Navigate life's challenges with celestial wisdom.",
    color: '#FF6E91',
    step: '03',
  },
  {
    phase: 'Transformation',
    icon: Crown,
    title: 'Personal Growth',
    description: 'Transform your life with proven remedies and practices.',
    color: '#23B27D',
    step: '04',
  },
];

const benefits = [
  {
    img: '/relationship-harmony.svg',
    title: 'Relationship Harmony',
    desc: 'Understand compatibility, resolve conflicts, build stronger bonds.',
    stat: '92%',
    statLabel: 'report better relationships',
  },
  {
    img: '/career-excellence.svg',
    title: 'Career Excellence',
    desc: 'Discover natural talents and the right career timing.',
    stat: '8 in 10',
    statLabel: 'saw a career breakthrough',
  },
  {
    img: '/health-and-wellness.svg',
    title: 'Health & Wellness',
    desc: 'Lifestyle guidance aligned with your cosmic energy.',
    stat: '50K+',
    statLabel: 'wellness consultations',
  },
  {
    img: '/effective-remedies.svg',
    title: 'Effective Remedies',
    desc: 'Mantras, gemstones and spiritual practices, personalised.',
    stat: '1.2M+',
    statLabel: 'remedies prescribed',
  },
];

// DiceBear "avataaars" generates illustrated cartoon avatars deterministically
// from a seed. We constrain `mouth` and `eyes` to cheerful options so every
// testimonial avatar reads as warm and welcoming — without these, the seed can
// land on grimacing or closed-eye combinations.
const dicebearAvatar = (seed: string) => {
  const params = new URLSearchParams({
    seed,
    radius: '50',
    backgroundColor: 'fcd7a1,ffd5dc,ffe7b8,fff2d8',
    mouth: 'smile,twinkle',
    eyes: 'happy,wink,default',
    eyebrows: 'default,defaultNatural,raisedExcited,raisedExcitedNatural',
  });
  return `https://api.dicebear.com/7.x/avataaars/svg?${params.toString()}`;
};

const testimonials = [
  {
    name: 'Priya Sharma',
    sign: 'Libra',
    rating: 5,
    text: 'The astrologer helped me understand my career path. Now I run my own successful business.',
    avatar: dicebearAvatar('Priya Sharma'),
  },
  {
    name: 'Rajesh Kumar',
    sign: 'Aries',
    rating: 5,
    text: 'Compatibility analysis saved my marriage. We are happier than ever now.',
    avatar: dicebearAvatar('Rajesh Kumar'),
  },
  {
    name: 'Meera Patel',
    sign: 'Cancer',
    rating: 5,
    text: 'Found my life purpose through birth chart reading. Everything makes sense now!',
    avatar: dicebearAvatar('Meera Patel'),
  },
];

interface BenefitCardProps {
  benefit: (typeof benefits)[number];
  index: number;
}

const BenefitCard: React.FC<BenefitCardProps> = ({ benefit, index }) => {
  const reduced = useReducedMotion() ?? false;
  const tilt = useTilt({ max: 8, perspective: 900, scale: 1.02, disabled: reduced });
  const [isMobile, setIsMobile] = useState(false);
  const [isFlipped, setIsFlipped] = useState(false);

  useEffect(() => {
    const update = () => setIsMobile(window.matchMedia('(pointer: coarse)').matches);
    update();
    window.addEventListener('resize', update);
    return () => window.removeEventListener('resize', update);
  }, []);

  const onActivate = () => {
    if (reduced) return;
    setIsFlipped((f) => !f);
  };

  return (
    <motion.div
      ref={tilt.ref}
      onMouseMove={isMobile ? undefined : tilt.onMouseMove}
      onMouseLeave={() => {
        tilt.onMouseLeave?.();
        if (!isMobile) setIsFlipped(false);
      }}
      onMouseEnter={() => {
        if (!isMobile && !reduced) setIsFlipped(true);
      }}
      onClick={() => {
        if (isMobile) onActivate();
      }}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onActivate();
        }
        if (e.key === 'Escape') setIsFlipped(false);
      }}
      role="button"
      tabIndex={0}
      aria-pressed={isFlipped}
      aria-label={`${benefit.title} — ${benefit.desc}`}
      style={tilt.style}
      className={`flip-card outline-none focus-visible:ring-2 focus-visible:ring-[#F7941D] cursor-pointer rounded-2xl ${
        isFlipped ? 'is-flipped' : ''
      }`}
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.2 }}
      transition={{ duration: 0.6, delay: index * 0.1 }}
    >
      <div className="flip-card-inner h-[180px] sm:h-[200px]">
        {/* FRONT */}
        <div className="flip-card-face bg-white rounded-2xl border border-orange-100 shadow-md p-5 flex items-start gap-4 sm:gap-6">
          <div className="w-14 h-14 sm:w-16 sm:h-16 flex items-center justify-center flex-shrink-0 bg-orange-50 rounded-xl ring-1 ring-orange-100">
            <Image src={benefit.img} alt={benefit.title} width={48} height={48} className="w-12 h-12" />
          </div>
          <div>
            <h3
              className="text-base sm:text-lg font-bold text-[#745802] mb-1.5"
              style={{ fontFamily: 'Poppins' }}
            >
              {benefit.title}
            </h3>
            <p className="text-gray-600 leading-relaxed text-xs sm:text-sm" style={{ fontFamily: 'Poppins' }}>
              {benefit.desc}
            </p>
          </div>
        </div>

        {/* BACK */}
        <div
          className="flip-card-face flip-card-back rounded-2xl shadow-lg p-5 flex flex-col items-center justify-center text-white text-center"
          style={{
            background:
              'linear-gradient(135deg, #F7971D 0%, #ECB212 100%)',
          }}
        >
          <div
            className="text-4xl sm:text-5xl font-extrabold tabular-nums"
            style={{ fontFamily: 'EB Garamond' }}
          >
            {benefit.stat}
          </div>
          <div className="text-xs sm:text-sm font-semibold mt-1 px-2">
            {benefit.statLabel}
          </div>
          <div className="mt-2 text-[11px] sm:text-xs opacity-90 font-medium">
            {benefit.title}
          </div>
        </div>
      </div>
    </motion.div>
  );
};

interface AnimatedAvatarProps {
  src: string;
  name: string;
  sign: string;
}

const AnimatedAvatar: React.FC<AnimatedAvatarProps> = ({ src, name, sign }) => {
  const [failed, setFailed] = useState(false);
  const reduced = useReducedMotion() ?? false;

  const initials = name
    .split(' ')
    .map((w) => w[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();

  // Map zodiac sign → glyph (simple Unicode astrological symbols)
  const signGlyph: Record<string, string> = {
    Aries: '♈',
    Taurus: '♉',
    Gemini: '♊',
    Cancer: '♋',
    Leo: '♌',
    Virgo: '♍',
    Libra: '♎',
    Scorpio: '♏',
    Sagittarius: '♐',
    Capricorn: '♑',
    Aquarius: '♒',
    Pisces: '♓',
  };
  const glyph = signGlyph[sign] ?? '✦';

  if (!failed) {
    return (
      <div className="relative w-12 h-12 flex-shrink-0">
        {/* Subtle saffron ring keeps the brand feel around the cartoon avatar */}
        <span
          aria-hidden
          className="absolute inset-0 rounded-full"
          style={{
            background:
              'conic-gradient(from 0deg, #F7941D, #ECB212, #FFCC70, #F7941D)',
          }}
        />
        <div className="absolute inset-[2px] rounded-full overflow-hidden bg-white">
          {/* Plain <img> — DiceBear returns SVG and does not need the
              Next/Image remote-image allowlist. */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={src}
            alt={name}
            loading="lazy"
            referrerPolicy="no-referrer"
            className="w-full h-full object-cover"
            onError={() => setFailed(true)}
          />
        </div>
      </div>
    );
  }

  // Animated fallback — rotating gradient ring + initials + orbiting sign glyph
  return (
    <div className="relative w-12 h-12 flex-shrink-0">
      {/* Rotating conic gradient ring */}
      <motion.span
        aria-hidden
        className="absolute inset-0 rounded-full"
        style={{
          background:
            'conic-gradient(from 0deg, #F7941D, #ECB212, #FFCC70, #F7941D)',
        }}
        animate={reduced ? {} : { rotate: 360 }}
        transition={{ duration: 6, repeat: Infinity, ease: 'linear' }}
      />
      {/* Inner gradient disc with initials */}
      <div
        className="absolute inset-[2px] rounded-full flex items-center justify-center text-white font-bold"
        style={{
          background: 'linear-gradient(135deg, #F7941D 0%, #ECB212 100%)',
          fontSize: '15px',
          letterSpacing: '0.5px',
          textShadow: '0 1px 2px rgba(0,0,0,0.18)',
        }}
      >
        {initials}
      </div>
      {/* Soft pulsing halo */}
      {!reduced && (
        <motion.span
          aria-hidden
          className="absolute inset-0 rounded-full pointer-events-none"
          animate={{
            boxShadow: [
              '0 0 0 rgba(247,148,29,0)',
              '0 0 14px rgba(247,148,29,0.55)',
              '0 0 0 rgba(247,148,29,0)',
            ],
          }}
          transition={{ duration: 2.4, repeat: Infinity, ease: 'easeInOut' }}
        />
      )}
      {/* Orbiting zodiac glyph */}
      {!reduced ? (
        <motion.div
          aria-hidden
          className="absolute inset-0"
          animate={{ rotate: 360 }}
          transition={{ duration: 8, repeat: Infinity, ease: 'linear' }}
        >
          <span
            className="absolute -top-1 left-1/2 -translate-x-1/2 w-4 h-4 rounded-full bg-white text-[#7A4A0F] text-[10px] font-bold flex items-center justify-center shadow"
            style={{ lineHeight: 1 }}
          >
            {glyph}
          </span>
        </motion.div>
      ) : (
        <span
          aria-hidden
          className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-white text-[#7A4A0F] text-[10px] font-bold flex items-center justify-center shadow"
          style={{ lineHeight: 1 }}
        >
          {glyph}
        </span>
      )}
    </div>
  );
};

const TestimonialCoverflow: React.FC = () => {
  const [index, setIndex] = useState(0);
  const reduced = useReducedMotion() ?? false;
  const len = testimonials.length;

  useEffect(() => {
    if (reduced) return;
    const t = setInterval(() => setIndex((p) => (p + 1) % len), 6000);
    return () => clearInterval(t);
  }, [len, reduced]);

  const next = () => setIndex((p) => (p + 1) % len);
  const prev = () => setIndex((p) => (p - 1 + len) % len);

  return (
    <div
      className="relative h-[280px] sm:h-[320px] flex items-center justify-center select-none"
      style={{ perspective: '1600px' }}
    >
      {testimonials.map((t, i) => {
        let offset = i - index;
        if (offset > len / 2) offset -= len;
        if (offset < -len / 2) offset += len;
        const abs = Math.abs(offset);
        const isFocused = abs === 0;
        const visible = abs <= 1;

        const translateX = offset * 200;
        const rotateY = reduced ? 0 : offset * -25;
        const translateZ = abs === 0 ? 0 : -150;
        const scale = abs === 0 ? 1 : 0.85;
        const opacity = visible ? (abs === 0 ? 1 : 0.55) : 0;

        return (
          <motion.div
            key={t.name}
            className="absolute top-1/2 left-1/2 w-[260px] sm:w-[340px]"
            style={{
              transformStyle: 'preserve-3d',
              pointerEvents: visible ? 'auto' : 'none',
            }}
            initial={false}
            animate={{
              x: `calc(-50% + ${translateX}px)`,
              y: '-50%',
              rotateY,
              z: translateZ,
              scale,
              opacity,
              zIndex: 30 - abs,
            }}
            transition={{ type: 'spring', stiffness: 180, damping: 26 }}
            onClick={() => !isFocused && setIndex(i)}
          >
            <div
              className={`bg-white rounded-2xl border border-orange-100 p-5 sm:p-6 ${
                isFocused
                  ? 'shadow-[0_30px_60px_-20px_rgba(247,154,24,0.45)] ring-1 ring-[#F79A18]/30'
                  : 'shadow-md cursor-pointer'
              }`}
            >
              <div className="flex items-center gap-3 mb-3">
                <AnimatedAvatar src={t.avatar} name={t.name} sign={t.sign} />
                <div>
                  <div className="font-bold text-[#745802]">{t.name}</div>
                  <div className="text-xs text-[#F7941D] font-semibold">{t.sign}</div>
                </div>
                <div className="ml-auto flex">
                  {Array.from({ length: t.rating }).map((_, k) => (
                    <Star key={k} size={14} className="text-[#F7941D] fill-[#F7941D]" />
                  ))}
                </div>
              </div>
              <p className="text-gray-600 text-sm leading-relaxed italic">
                &ldquo;{t.text}&rdquo;
              </p>
            </div>
          </motion.div>
        );
      })}

      {/* Controls */}
      <button
        onClick={prev}
        aria-label="Previous testimonial"
        className="absolute left-2 sm:left-6 top-1/2 -translate-y-1/2 z-40 w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-white border border-orange-200 shadow-md flex items-center justify-center text-[#F7941D] hover:scale-110 transition-transform"
      >
        <ChevronLeft size={18} />
      </button>
      <button
        onClick={next}
        aria-label="Next testimonial"
        className="absolute right-2 sm:right-6 top-1/2 -translate-y-1/2 z-40 w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-white border border-orange-200 shadow-md flex items-center justify-center text-[#F7941D] hover:scale-110 transition-transform"
      >
        <ChevronRight size={18} />
      </button>
    </div>
  );
};

const CosmicJourneyPath: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const reduced = useReducedMotion() ?? false;
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ['start 80%', 'end 30%'],
  });
  const pathLength = useTransform(scrollYProgress, [0, 1], [0, 1]);

  return (
    <div ref={containerRef} className="relative max-w-5xl mx-auto py-8 sm:py-12">
      <h2
        className="text-2xl sm:text-3xl md:text-4xl font-bold text-[#745802] text-center mb-8 sm:mb-12"
        style={{ fontFamily: 'EB Garamond' }}
      >
        Your Cosmic Journey, in Four Phases
      </h2>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6 relative">
        {/* SVG path overlay (desktop) */}
        <svg
          aria-hidden
          className="absolute inset-0 w-full h-full hidden md:block pointer-events-none"
          viewBox="0 0 800 200"
          preserveAspectRatio="none"
        >
          <motion.path
            d="M 100 100 C 250 30, 350 170, 500 100 S 700 30, 750 100"
            stroke="url(#cosmicGradient)"
            strokeWidth="3"
            fill="none"
            strokeLinecap="round"
            style={{ pathLength: reduced ? 1 : pathLength }}
          />
          <defs>
            <linearGradient id="cosmicGradient" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="#F7971D" />
              <stop offset="50%" stopColor="#A66BFF" />
              <stop offset="100%" stopColor="#23B27D" />
            </linearGradient>
          </defs>
        </svg>

        {cosmicJourney.map((p, i) => {
          const Icon = p.icon;
          return (
            <motion.div
              key={p.step}
              className="relative bg-white rounded-2xl border border-orange-100 p-4 sm:p-5 shadow-md text-center z-10"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.3 }}
              transition={{ duration: 0.6, delay: i * 0.15 }}
            >
              <div
                className="w-12 h-12 mx-auto mb-2 rounded-full flex items-center justify-center text-white shadow-lg"
                style={{ background: p.color }}
              >
                <Icon size={20} />
              </div>
              <div
                className="text-[10px] font-extrabold uppercase tracking-wider mb-0.5"
                style={{ color: p.color }}
              >
                Phase {p.step}
              </div>
              <div
                className="text-sm sm:text-base font-bold text-[#745802] mb-1"
                style={{ fontFamily: 'Poppins' }}
              >
                {p.title}
              </div>
              <div className="text-[11px] sm:text-xs text-gray-500 leading-snug">
                {p.description}
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
};

const WhyConsult: React.FC = () => {
  const router = useRouter();
  const reduced = useReducedMotion() ?? false;
  const { ref: pulseRef, y: pulseY } = useScrollParallax(0.3);

  return (
    <section className="bg-white w-full sacred-pattern">
      {/* Hero */}
      <motion.div
        className="relative section-spacing overflow-hidden"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8 }}
      >
        {/* Bg pulse with parallax */}
        <motion.div
          ref={pulseRef as React.RefObject<HTMLDivElement>}
          className="absolute inset-0"
          style={{ y: pulseY }}
        >
          <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-orange-50 via-white to-orange-50" />
          {!reduced && (
            <motion.div
              aria-hidden
              className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[600px] h-[600px] rounded-full"
              style={{
                background:
                  'radial-gradient(closest-side, rgba(247,148,29,0.18), transparent)',
              }}
              animate={{ scale: [1, 1.05, 1], opacity: [0.7, 1, 0.7] }}
              transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
            />
          )}
        </motion.div>

        <div className="relative z-10 section-container text-center">
          <motion.div
            className="inline-flex items-center px-6 py-3 bg-[#F7971D] text-white rounded-full text-sm font-medium mb-6 shadow-lg shadow-orange-500/30"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ duration: 0.5, delay: 0.3, type: 'spring' }}
          >
            <Sparkles className="w-4 h-4 mr-2" />
            Professional Astrology Services
          </motion.div>

          <h1
            className="text-3xl sm:text-4xl md:text-5xl lg:text-7xl font-bold text-[#745802] mb-4 sm:mb-6 leading-tight"
            style={{ fontFamily: 'EB Garamond', perspective: '1200px' }}
          >
            <motion.span
              className="inline-block"
              initial={reduced ? false : { opacity: 0, y: 24, rotateX: -45 }}
              animate={{ opacity: 1, y: 0, rotateX: 0 }}
              transition={{ type: 'spring', stiffness: 130, damping: 18, delay: 0.5 }}
              style={{ transformStyle: 'preserve-3d' }}
            >
              Why Consult our
            </motion.span>
            <motion.span
              className="block text-[#F7971D]"
              initial={reduced ? false : { opacity: 0, y: 24, rotateX: -45 }}
              animate={{ opacity: 1, y: 0, rotateX: 0 }}
              transition={{ type: 'spring', stiffness: 130, damping: 18, delay: 0.65 }}
              style={{ transformStyle: 'preserve-3d' }}
            >
              Astrologers?
            </motion.span>
          </h1>

          <motion.p
            className="text-base sm:text-lg md:text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed px-2"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.85 }}
            style={{ fontFamily: 'Poppins' }}
          >
            Discover how celestial wisdom can transform your life. Get personalized
            guidance, accurate predictions, and life-changing insights from
            certified professionals.
          </motion.p>
        </div>
      </motion.div>

      <div className="section-container">
        {/* Section 1: The Power of Astrology */}
        <motion.div
          className="max-w-5xl mx-auto mb-8 sm:mb-14 md:mb-18"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
        >
          <div className="grid lg:grid-cols-2 gap-6 sm:gap-8 lg:gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              viewport={{ once: true }}
            >
              <h2
                className="text-2xl sm:text-3xl md:text-4xl font-bold text-[#745802] mb-4 sm:mb-6"
                style={{ fontFamily: 'EB Garamond' }}
              >
                The Power of Astrological Wisdom
              </h2>
              <p
                className="text-base sm:text-lg text-gray-600 leading-relaxed mb-4 sm:mb-6"
                style={{ fontFamily: 'Poppins' }}
              >
                Astrology is not just about predicting the future—it&apos;s about
                understanding yourself at a deeper level. Your birth chart is a
                cosmic blueprint that reveals your unique personality, strengths,
                challenges, and life purpose.
              </p>
              <p
                className="text-base sm:text-lg text-gray-600 leading-relaxed mb-4 sm:mb-6"
                style={{ fontFamily: 'Poppins' }}
              >
                Through careful analysis of planetary positions, astrologers
                provide insights that help you make informed decisions, understand
                relationships better, and navigate life&apos;s challenges with
                confidence.
              </p>
            </motion.div>

            <motion.div
              className="relative"
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.4 }}
              viewport={{ once: true }}
            >
              <div className="relative w-full h-56 sm:h-72 lg:h-80 bg-gradient-to-br from-orange-100 to-orange-50 rounded-2xl overflow-hidden">
                <motion.div
                  className="absolute inset-0 bg-[#F7971D] opacity-10 rounded-2xl"
                  animate={reduced ? {} : { scale: [1, 1.1, 1] }}
                  transition={{ duration: 3, repeat: Infinity }}
                />
                <Image
                  src="/the-power-of-astrological-wisdom.svg"
                  alt="The Power of Astrological Wisdom"
                  width={400}
                  height={320}
                  className="w-full h-full object-cover"
                />
              </div>
            </motion.div>
          </div>
        </motion.div>

        {/* Cosmic Journey path */}
        <CosmicJourneyPath />

        {/* Benefits — 3D flip cards */}
        <motion.div
          className="max-w-6xl mx-auto mb-8 sm:mb-14 md:mb-18"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
        >
          <div className="text-center mb-10 sm:mb-12 md:mb-16">
            <h2
              className="text-2xl sm:text-3xl md:text-4xl font-bold text-[#745802] mb-3 sm:mb-4"
              style={{ fontFamily: 'EB Garamond' }}
            >
              Transform Your Life Through Astrology
            </h2>
            <p
              className="text-base sm:text-lg text-gray-600 max-w-3xl mx-auto px-2"
              style={{ fontFamily: 'Poppins' }}
            >
              Hover or tap a card to see the impact our community has felt.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-6 sm:gap-8 md:gap-10">
            {benefits.map((b, i) => (
              <BenefitCard key={b.title} benefit={b} index={i} />
            ))}
          </div>
        </motion.div>

        {/* Testimonials coverflow */}
        <motion.div
          className="max-w-6xl mx-auto mb-12 sm:mb-16"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
        >
          <div className="text-center mb-6 sm:mb-8">
            <h2
              className="text-2xl sm:text-3xl md:text-4xl font-bold text-[#745802] mb-2 sm:mb-3"
              style={{ fontFamily: 'EB Garamond' }}
            >
              Lives Touched by the Stars
            </h2>
            <p className="text-sm sm:text-base text-gray-600" style={{ fontFamily: 'Poppins' }}>
              Real stories from people we&apos;ve guided.
            </p>
          </div>
          <TestimonialCoverflow />
        </motion.div>

        {/* CTA */}
        <motion.div
          className="text-center mb-8 sm:mb-14 md:mb-18"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
        >
          <motion.div
            className="bg-gradient-to-r from-orange-50 to-orange-100 rounded-2xl sm:rounded-3xl p-6 sm:p-8 md:p-12 border-2 border-orange-200 max-w-4xl mx-auto shadow-lg"
            whileHover={reduced ? undefined : { scale: 1.02 }}
            transition={{ duration: 0.3 }}
          >
            <h3
              className="text-2xl sm:text-3xl md:text-4xl font-bold text-[#745802] mb-4 sm:mb-6"
              style={{ fontFamily: 'EB Garamond' }}
            >
              Ready to Discover Your Cosmic Path?
            </h3>
            <p
              className="text-base sm:text-lg text-gray-600 mb-6 sm:mb-8 max-w-2xl mx-auto px-2"
              style={{ fontFamily: 'Poppins' }}
            >
              Connect with our certified astrologers and unlock the secrets written
              in your stars. Begin your journey of self-discovery today.
            </p>

            <motion.button
              type="button"
              onClick={() => router.push('/call-with-astrologer')}
              className="bg-[#F7971D] text-white px-6 sm:px-8 py-3 sm:py-4 rounded-xl font-semibold text-base sm:text-lg shadow-lg hover:shadow-xl transition-all duration-300 flex items-center justify-center mx-auto group hover:bg-orange-600"
              style={{ fontFamily: 'Poppins' }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              Connect with our Astrologers
              <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform duration-300" />
            </motion.button>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
};

export default WhyConsult;
