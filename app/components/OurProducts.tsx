"use client";

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import SectionHeader from "./ui/SectionHeader";
import { useTilt } from "@/app/hooks/useTilt";

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

interface ProductCardProps {
  product: Product;
  featured?: boolean;
  showInfoStrip?: boolean;
}

const ProductCard: React.FC<ProductCardProps> = ({
  product,
  featured = false,
  showInfoStrip = true,
}) => {
  const reduced = useReducedMotion();
  const tilt = useTilt({ max: 10, perspective: 900, scale: 1.02, disabled: reduced ?? false });
  const pct = discountPct(product);

  return (
    <div
      ref={tilt.ref}
      onMouseMove={tilt.onMouseMove}
      onMouseLeave={tilt.onMouseLeave}
      style={tilt.style}
      className={`group h-full ${featured && !reduced ? "animate-float-y" : ""}`}
    >
      <div
        className="bg-white rounded-2xl border border-gray-200 h-[340px] xs:h-[360px] sm:h-[400px] transition-all duration-300 relative overflow-hidden shadow-lg hover:shadow-2xl hover:border-[#F7971E] cursor-pointer astro-card"
        onClick={() => window.open(product.link, '_blank', 'noopener,noreferrer')}
      >
        {/* Product Image with depth */}
        <div
          className="w-full h-[260px] xs:h-[280px] sm:h-72 overflow-hidden relative"
          style={{ transform: 'translateZ(30px)', transformStyle: 'preserve-3d' }}
        >
          <img
            src={product.image}
            alt={product.name}
            loading="lazy"
            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
            onError={(e) => {
              const t = e.target as HTMLImageElement;
              if (!t.dataset.fallback) {
                t.dataset.fallback = "1";
                t.src = "/spiritual-products.svg";
              }
            }}
          />

          {/* Discount badge — pulse + glint */}
          {pct > 0 && (
            <motion.div
              className="absolute top-2 left-2 z-10 text-white text-[10px] font-black px-2.5 py-1 rounded-full shadow-lg overflow-hidden"
              style={{
                background:
                  'linear-gradient(135deg, #ef4444 0%, #f97316 50%, #ef4444 100%)',
              }}
              animate={
                reduced ? {} : { scale: [1, 1.08, 1] }
              }
              transition={{ duration: 2.4, repeat: Infinity, ease: 'easeInOut' }}
            >
              <span className="relative z-10">{`-${pct}%`}</span>
              {!reduced && (
                <span
                  aria-hidden
                  className="absolute inset-0 animate-gradient-shift"
                  style={{
                    background:
                      'linear-gradient(120deg, transparent 0%, rgba(255,255,255,0.55) 50%, transparent 100%)',
                  }}
                />
              )}
            </motion.div>
          )}

          {/* Hover Overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-300 flex items-center justify-center">
            <div className="text-center transform translate-y-4 group-hover:translate-y-0 transition-transform duration-300">
              <span className="text-white font-bold text-xl block mb-2">
                <span className="bg-gradient-to-r from-white to-[#F7971E] bg-clip-text text-transparent">
                  Shop Now
                </span>
              </span>
              <svg className="w-6 h-6 text-white mx-auto animate-pulse" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </div>
          </div>
        </div>

        {/* Product Info strip */}
        {showInfoStrip && (
          <div
            className="absolute bottom-0 left-0 right-0 bg-white/95 backdrop-blur-sm px-3 py-2.5 flex flex-col items-center justify-center min-h-[80px] sm:min-h-[100px] border-t border-orange-100"
            style={{ transform: 'translateZ(15px)', transformStyle: 'preserve-3d' }}
          >
            <h3
              className="font-bold text-base sm:text-lg text-center leading-tight transition-all duration-300 group-hover:scale-105 line-clamp-1"
              style={{ fontFamily: "Poppins" }}
            >
              <span className="bg-gradient-to-r from-[#556B2F] to-[#F7971E] bg-clip-text text-transparent group-hover:from-[#F7971E] group-hover:to-[#556B2F] transition-all duration-300">
                {product.name}
              </span>
            </h3>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="font-extrabold text-[#F7971E] text-base sm:text-lg">{`₹${formatINR(product.price)}`}</span>
              {product.compareAtPrice && product.compareAtPrice > product.price && (
                <span className="text-gray-400 text-xs line-through">{`₹${formatINR(product.compareAtPrice)}`}</span>
              )}
            </div>
          </div>
        )}

        {/* Hover Border */}
        <div className="absolute inset-0 rounded-2xl border-2 border-[#F7971E] opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
      </div>
    </div>
  );
};

const OurProducts: React.FC = () => {
  const [productIndex, setProductIndex] = useState(0);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkScreenSize = () => setIsMobile(window.innerWidth < 768);
    checkScreenSize();
    window.addEventListener('resize', checkScreenSize);
    return () => window.removeEventListener('resize', checkScreenSize);
  }, []);

  // Slides: mobile = 6 single-card slides; desktop = 2 slides of 3 cards each
  const desktopSlides: Product[][] = [products.slice(0, 3), products.slice(3, 6)];
  const totalSlides = isMobile ? products.length : desktopSlides.length;

  const next = () => setProductIndex((p) => (p + 1) % totalSlides);
  const prev = () => setProductIndex((p) => (p - 1 + totalSlides) % totalSlides);

  // Keep index valid when switching breakpoints
  useEffect(() => {
    if (productIndex >= totalSlides) setProductIndex(0);
  }, [totalSlides, productIndex]);

  const slideVariants = {
    enter: { x: 80, opacity: 0 },
    center: { x: 0, opacity: 1 },
    exit: { x: -80, opacity: 0 },
  };
  const slideTransition = { type: 'spring' as const, stiffness: 140, damping: 22 };

  return (
    <section className="bg-white w-full section-spacing om-watermark">
      <div className="section-container">
        <SectionHeader
          tag="RamVarna"
          title="Spiritual Essentials"
          subtitle={
            <span>
              Hand-picked spiritual essentials from our sister brand{' '}
              <a href="https://ramvarna.com" target="_blank" rel="noopener noreferrer" className="text-[#F7971E] font-semibold hover:underline">
                ramvarna.com
              </a>
            </span>
          }
          center
        />

        <div className="relative overflow-hidden">
          {/* Previous */}
          <button
            onClick={prev}
            className="absolute left-0 xs:left-1 sm:left-3 md:left-6 lg:left-8 top-1/2 -translate-y-1/2 z-10 bg-white rounded-full w-7 h-7 xs:w-8 xs:h-8 sm:w-10 sm:h-10 md:w-11 md:h-11 lg:w-12 lg:h-12 flex items-center justify-center shadow-lg hover:shadow-xl transition-all duration-300 border-2 border-[#F7971E] hover:bg-[#F7971E] hover:text-white text-[#F7971E] min-h-0"
            aria-label="Previous products"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 sm:h-5 sm:w-5 md:h-6 md:w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>

          {/* Slide stage */}
          <div className="relative min-h-[400px] sm:min-h-[440px] flex items-center justify-center">
            <AnimatePresence mode="popLayout" initial={false}>
              <motion.div
                key={`${isMobile ? 'm' : 'd'}-${productIndex}`}
                variants={slideVariants}
                initial="enter"
                animate="center"
                exit="exit"
                transition={slideTransition}
                className="w-full"
              >
                {isMobile ? (
                  <div className="flex justify-center px-6 sm:px-4">
                    <div className="w-full max-w-[320px]">
                      <ProductCard
                        product={products[productIndex]}
                        featured
                      />
                    </div>
                  </div>
                ) : (
                  <div className="flex gap-6 justify-center">
                    {desktopSlides[productIndex].map((p, i) => (
                      <div key={p.id} className="w-full max-w-[320px]">
                        <ProductCard product={p} featured={i === 1} />
                      </div>
                    ))}
                  </div>
                )}
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Next */}
          <button
            onClick={next}
            className="absolute right-0 xs:right-1 sm:right-3 md:right-6 lg:right-8 top-1/2 -translate-y-1/2 z-10 bg-white rounded-full w-7 h-7 xs:w-8 xs:h-8 sm:w-10 sm:h-10 md:w-11 md:h-11 lg:w-12 lg:h-12 flex items-center justify-center shadow-lg hover:shadow-xl transition-all duration-300 border-2 border-[#F7971E] hover:bg-[#F7971E] hover:text-white text-[#F7971E] min-h-0"
            aria-label="Next products"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 sm:h-5 sm:w-5 md:h-6 md:w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>

          {/* Dots */}
          <div className="flex justify-center mt-6 sm:mt-10 mb-2 sm:mb-4 space-x-2">
            {Array.from({ length: totalSlides }).map((_, i) => (
              <button
                key={i}
                onClick={() => setProductIndex(i)}
                className={`rounded-full transition-all duration-300 min-h-0 ${
                  i === productIndex
                    ? 'bg-[#F7971E] w-6 h-2.5 sm:w-8 sm:h-3'
                    : 'bg-gray-300 hover:bg-gray-400 w-2.5 h-2.5 sm:w-3 sm:h-3'
                }`}
                aria-label={`Go to ${isMobile ? 'product' : 'set'} ${i + 1}`}
              />
            ))}
          </div>
        </div>

        <div className="flex justify-center mt-8 sm:mt-10">
          <a
            href="https://ramvarna.com/collections"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 bg-gradient-to-r from-[#F7971E] to-orange-600 text-white font-bold text-sm sm:text-base px-6 sm:px-8 py-3 rounded-full shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-300"
          >
            Shop all on RamVarna
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
            </svg>
          </a>
        </div>
      </div>
    </section>
  );
};

export default OurProducts;
