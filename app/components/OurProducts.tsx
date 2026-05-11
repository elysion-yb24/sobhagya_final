"use client";

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import SectionHeader from "./ui/SectionHeader";

interface Product {
  id: number;
  name: string;
  description: string;
  image: string;
  link: string;
  price: number;
  compareAtPrice?: number;
}

const products: Product[] = [
  {
    id: 1,
    name: "Metal Dhan Yog Bracelet",
    description: "Silver-plated prosperity bracelet with Tiger Eye, Pyrite, Citrine & Clear Quartz.",
    image: "https://cdn.shopify.com/s/files/1/0803/0063/8426/files/1_89e75ba4-dcd4-4338-bf80-0c9be0986ee4.webp?v=1774965810",
    link: "https://ramvarna.com/products/metal-dhan-yog-bracelet-silver",
    price: 1099,
    compareAtPrice: 1500,
  },
  {
    id: 2,
    name: "Dhan Yog Bracelet",
    description: "Wealth-attracting blend of Green Onyx, Pyrite, Citrine & Tiger Eye gemstones.",
    image: "https://cdn.shopify.com/s/files/1/0803/0063/8426/files/IMG_4124.jpg?v=1770792204",
    link: "https://ramvarna.com/products/dhan-yog-bracelet",
    price: 799,
    compareAtPrice: 1999,
  },
  {
    id: 3,
    name: "7 Horses Pyrite Frame",
    description: "Raw Pyrite Surya Dev frame for career growth, fame and prosperity (7.5×7.5 in).",
    image: "https://cdn.shopify.com/s/files/1/0803/0063/8426/files/Screenshot2026-03-29at1.55.22PM.png?v=1774773381",
    link: "https://ramvarna.com/products/7-horses-on-raw-pyrite-frame",
    price: 999,
    compareAtPrice: 2199,
  },
  {
    id: 4,
    name: "5 Mukhi Rudraksha Bracelet",
    description: "Certified 5 Mukhi Rudraksha with silver capping for peace, focus and balance.",
    image: "https://cdn.shopify.com/s/files/1/0803/0063/8426/files/IMG_4109.jpg?v=1770793068",
    link: "https://ramvarna.com/products/5-mukhi-rudraksha-bracelet-with-capping-quality-improvement-for-durability-looks",
    price: 699,
    compareAtPrice: 1500,
  },
  {
    id: 5,
    name: "Rose Quartz Love Bracelet",
    description: "Hand-picked rose quartz beads — the Stone of Unconditional Love and healing.",
    image: "https://cdn.shopify.com/s/files/1/0803/0063/8426/files/IMG_4155.jpg?v=1771225996",
    link: "https://ramvarna.com/products/rose-quartz-bracelet-premium-love-emotional-healing-for-men-and-women",
    price: 699,
    compareAtPrice: 1599,
  },
  {
    id: 6,
    name: "5 Mukhi Rudraksha",
    description: "Original Nepali 5 Mukhi Rudraksha bead (22mm) for peace, harmony & focus.",
    image: "https://cdn.shopify.com/s/files/1/0803/0063/8426/files/IMG_4030.jpg?v=1770792624",
    link: "https://ramvarna.com/products/5-mukhi-rudraksha-original-nepali-rudraksha-for-peace-harmony",
    price: 799,
    compareAtPrice: 2000,
  },
];

const formatINR = (n: number) =>
  new Intl.NumberFormat('en-IN', { maximumFractionDigits: 0 }).format(Math.round(n));

const discountPct = (p: Product) =>
  p.compareAtPrice && p.compareAtPrice > p.price
    ? Math.round(((p.compareAtPrice - p.price) / p.compareAtPrice) * 100)
    : 0;

const GOLD = '#C9A227';
const GOLD_DEEP = '#A07C18';
const GOLD_SOFT = '#E8D9A2';

const ProductCard: React.FC<{ product: Product }> = ({ product }) => {
  const reduced = useReducedMotion();
  const pct = discountPct(product);

  return (
    <motion.a
      href={product.link}
      target="_blank"
      rel="noopener noreferrer"
      whileHover={reduced ? {} : { y: -4 }}
      transition={{ type: 'spring', stiffness: 280, damping: 24 }}
      className="group relative block h-full"
    >
      <div className="relative h-full bg-white rounded-2xl overflow-hidden border border-[#EFE3C2] shadow-[0_4px_20px_rgba(160,124,24,0.06)] hover:shadow-[0_18px_45px_rgba(160,124,24,0.18)] transition-shadow duration-500">
        {/* Image */}
        <div className="relative w-full aspect-[4/5] overflow-hidden bg-gradient-to-b from-[#FBF6E7] to-[#FFFDF7]">
          <img
            src={product.image}
            alt={product.name}
            loading="lazy"
            className="w-full h-full object-cover transition-transform duration-[900ms] ease-out group-hover:scale-[1.06]"
            onError={(e) => {
              const t = e.target as HTMLImageElement;
              if (!t.dataset.fallback) {
                t.dataset.fallback = "1";
                t.src = "/spiritual-products.svg";
              }
            }}
          />

          {/* Discount tag — minimal gold pill */}
          {pct > 0 && (
            <div className="absolute top-3 left-3">
              <span
                className="inline-flex items-center text-[10px] font-semibold tracking-[0.12em] uppercase px-2.5 py-1 rounded-full text-white shadow-sm"
                style={{
                  background: `linear-gradient(135deg, ${GOLD_DEEP}, ${GOLD})`,
                }}
              >
                Save {pct}%
              </span>
            </div>
          )}

          {/* Soft gold glaze on hover */}
          <div
            className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
            style={{
              background:
                'linear-gradient(180deg, rgba(255,253,243,0) 60%, rgba(201,162,39,0.08) 100%)',
            }}
          />
        </div>

        {/* Info */}
        <div className="px-5 pt-4 pb-5">
          {/* Tiny gold accent line */}
          <div
            className="h-px w-8 mb-3 transition-all duration-500 group-hover:w-16"
            style={{
              background: `linear-gradient(90deg, ${GOLD}, transparent)`,
            }}
          />

          <h3
            className="font-medium text-[15px] sm:text-base text-[#2A2418] leading-snug line-clamp-1 mb-1.5 transition-colors duration-300"
            style={{ fontFamily: 'Poppins' }}
          >
            <span className="group-hover:text-[#A07C18] transition-colors duration-300">
              {product.name}
            </span>
          </h3>

          <p className="text-[12.5px] text-[#7A6F58] leading-relaxed line-clamp-2 mb-4 min-h-[36px]">
            {product.description}
          </p>

          <div className="flex items-end justify-between">
            <div className="flex items-baseline gap-2">
              <span
                className="font-semibold text-lg tracking-tight"
                style={{ color: GOLD_DEEP }}
              >
                ₹{formatINR(product.price)}
              </span>
              {product.compareAtPrice && product.compareAtPrice > product.price && (
                <span className="text-[#B8AC8E] text-[13px] line-through">
                  ₹{formatINR(product.compareAtPrice)}
                </span>
              )}
            </div>

            <span
              className="inline-flex items-center gap-1 text-[11px] font-semibold tracking-[0.14em] uppercase transition-all duration-300 group-hover:gap-2"
              style={{ color: GOLD_DEEP }}
            >
              View
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </span>
          </div>
        </div>

        {/* Gold underline that slides in on hover */}
        <div
          className="absolute bottom-0 left-0 h-[2px] w-0 group-hover:w-full transition-all duration-700 ease-out"
          style={{
            background: `linear-gradient(90deg, transparent, ${GOLD}, transparent)`,
          }}
        />
      </div>
    </motion.a>
  );
};

const OurProducts: React.FC = () => {
  const [productIndex, setProductIndex] = useState(0);
  const [isMobile, setIsMobile] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const reduced = useReducedMotion();

  useEffect(() => {
    const checkScreenSize = () => setIsMobile(window.innerWidth < 768);
    checkScreenSize();
    window.addEventListener('resize', checkScreenSize);
    return () => window.removeEventListener('resize', checkScreenSize);
  }, []);

  const desktopSlides: Product[][] = [products.slice(0, 3), products.slice(3, 6)];
  const totalSlides = isMobile ? products.length : desktopSlides.length;

  const next = () => setProductIndex((p) => (p + 1) % totalSlides);
  const prev = () => setProductIndex((p) => (p - 1 + totalSlides) % totalSlides);

  useEffect(() => {
    if (productIndex >= totalSlides) setProductIndex(0);
  }, [totalSlides, productIndex]);

  useEffect(() => {
    if (isPaused || reduced) return;
    const id = setInterval(() => setProductIndex((p) => (p + 1) % totalSlides), 5500);
    return () => clearInterval(id);
  }, [isPaused, totalSlides, reduced]);

  const slideVariants = {
    enter: { x: 40, opacity: 0 },
    center: { x: 0, opacity: 1 },
    exit: { x: -40, opacity: 0 },
  };

  return (
    <section className="relative w-full section-spacing overflow-hidden">
      {/* Calm gold-cream backdrop */}
      <div
        aria-hidden
        className="absolute inset-0 -z-10"
        style={{
          background:
            'linear-gradient(180deg, #FFFFFF 0%, #FFFCF2 45%, #FFF8E6 100%)',
        }}
      />
      {/* Subtle radial gold glow */}
      <div
        aria-hidden
        className="absolute inset-x-0 top-0 h-[480px] -z-10 opacity-60"
        style={{
          background:
            'radial-gradient(ellipse at 50% 0%, rgba(201,162,39,0.10) 0%, rgba(201,162,39,0) 60%)',
        }}
      />
      {/* Faint top + bottom gold hairlines */}
      <div
        aria-hidden
        className="absolute top-0 inset-x-0 h-px"
        style={{
          background:
            'linear-gradient(90deg, transparent, rgba(201,162,39,0.35), transparent)',
        }}
      />
      <div
        aria-hidden
        className="absolute bottom-0 inset-x-0 h-px"
        style={{
          background:
            'linear-gradient(90deg, transparent, rgba(201,162,39,0.25), transparent)',
        }}
      />

      <div className="relative section-container">
        <SectionHeader
          tag="RamVarna"
          title="Spiritual Essentials"
          subtitle={
            <span>
              Hand-picked spiritual essentials from our sister brand{' '}
              <a
                href="https://ramvarna.com"
                target="_blank"
                rel="noopener noreferrer"
                className="font-semibold hover:underline"
                style={{ color: GOLD_DEEP }}
              >
                ramvarna.com
              </a>
            </span>
          }
          center
        />

        <div
          className="relative"
          onMouseEnter={() => setIsPaused(true)}
          onMouseLeave={() => setIsPaused(false)}
        >
          {/* Prev */}
          <button
            onClick={prev}
            className="hidden sm:flex absolute -left-2 lg:-left-6 top-1/2 -translate-y-1/2 z-20 w-11 h-11 lg:w-12 lg:h-12 rounded-full items-center justify-center bg-white border transition-all duration-300 hover:scale-105 min-h-0"
            style={{
              borderColor: GOLD_SOFT,
              color: GOLD_DEEP,
              boxShadow: '0 6px 18px rgba(160,124,24,0.12)',
            }}
            aria-label="Previous"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>

          <div className="relative min-h-[480px] sm:min-h-[520px] flex items-center justify-center px-2 sm:px-10">
            <AnimatePresence mode="popLayout" initial={false}>
              <motion.div
                key={`${isMobile ? 'm' : 'd'}-${productIndex}`}
                variants={slideVariants}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
                className="w-full"
              >
                {isMobile ? (
                  <div className="flex justify-center px-4">
                    <div className="w-full max-w-[340px]">
                      <ProductCard product={products[productIndex]} />
                    </div>
                  </div>
                ) : (
                  <div className="grid grid-cols-3 gap-7 lg:gap-9 max-w-6xl mx-auto">
                    {desktopSlides[productIndex].map((p) => (
                      <ProductCard key={p.id} product={p} />
                    ))}
                  </div>
                )}
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Next */}
          <button
            onClick={next}
            className="hidden sm:flex absolute -right-2 lg:-right-6 top-1/2 -translate-y-1/2 z-20 w-11 h-11 lg:w-12 lg:h-12 rounded-full items-center justify-center bg-white border transition-all duration-300 hover:scale-105 min-h-0"
            style={{
              borderColor: GOLD_SOFT,
              color: GOLD_DEEP,
              boxShadow: '0 6px 18px rgba(160,124,24,0.12)',
            }}
            aria-label="Next"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>

          {/* Mobile arrows + dots row */}
          <div className="flex sm:hidden justify-center items-center gap-4 mt-2">
            <button
              onClick={prev}
              className="w-10 h-10 rounded-full flex items-center justify-center bg-white border min-h-0"
              style={{ borderColor: GOLD_SOFT, color: GOLD_DEEP }}
              aria-label="Previous"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <button
              onClick={next}
              className="w-10 h-10 rounded-full flex items-center justify-center bg-white border min-h-0"
              style={{ borderColor: GOLD_SOFT, color: GOLD_DEEP }}
              aria-label="Next"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>

          {/* Slim dots */}
          <div className="flex justify-center mt-7 sm:mt-10 space-x-2">
            {Array.from({ length: totalSlides }).map((_, i) => (
              <button
                key={i}
                onClick={() => setProductIndex(i)}
                className="rounded-full transition-all duration-500 min-h-0"
                style={{
                  width: i === productIndex ? 28 : 8,
                  height: 8,
                  background:
                    i === productIndex
                      ? `linear-gradient(90deg, ${GOLD}, ${GOLD_DEEP})`
                      : '#E8DDB8',
                }}
                aria-label={`Go to ${isMobile ? 'product' : 'set'} ${i + 1}`}
              />
            ))}
          </div>
        </div>

        {/* Refined gold CTA */}
        <div className="flex justify-center mt-12 sm:mt-14">
          <a
            href="https://ramvarna.com/collections"
            target="_blank"
            rel="noopener noreferrer"
            className="group/cta relative inline-flex items-center gap-2.5 px-8 sm:px-10 py-3.5 rounded-full text-[13px] sm:text-sm font-semibold tracking-[0.12em] uppercase text-white overflow-hidden transition-transform duration-300 hover:scale-[1.02]"
            style={{
              background: `linear-gradient(135deg, ${GOLD_DEEP} 0%, ${GOLD} 50%, ${GOLD_DEEP} 100%)`,
              boxShadow: '0 10px 30px rgba(160,124,24,0.30)',
            }}
          >
            <span className="relative z-10">Explore the Collection</span>
            <svg className="relative z-10 w-4 h-4 transition-transform duration-300 group-hover/cta:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
            </svg>
            {/* Soft gold sheen */}
            <span
              aria-hidden
              className="absolute inset-0 -translate-x-full group-hover/cta:translate-x-full transition-transform duration-1000 ease-out pointer-events-none"
              style={{
                background:
                  'linear-gradient(120deg, transparent 0%, rgba(255,255,255,0.35) 50%, transparent 100%)',
              }}
            />
          </a>
        </div>
      </div>
    </section>
  );
};

export default OurProducts;
