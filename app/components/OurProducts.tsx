'use client'
import React, { useState } from 'react';

interface Product {
  id: number;
  name: string;
  description: string;
  image: string;
  link: string;
  price: number;
  compareAtPrice?: number;
}

const OurProducts = () => {
  const [productIndex, setProductIndex] = useState(0);
  const [isMobile, setIsMobile] = useState(false);

  // Check if screen is mobile
  React.useEffect(() => {
    const checkScreenSize = () => {
      setIsMobile(window.innerWidth < 768);
    };

    checkScreenSize();
    window.addEventListener('resize', checkScreenSize);
    return () => window.removeEventListener('resize', checkScreenSize);
  }, []);

  // Real RamVarna featured products — verified against ramvarna.com (2026).
  // Direct product links + Shopify CDN images keep the showcase in sync with
  // the live store. Prices reflect the lowest available variant on ramvarna.com.
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
      description: "Raw Pyrite Surya Dev frame for career growth, fame and prosperity (7.5\u00d77.5 in).",
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
      description: "Hand-picked rose quartz beads \u2014 the Stone of Unconditional Love and healing.",
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

  const formatINR = (n: number) => new Intl.NumberFormat('en-IN', { maximumFractionDigits: 0 }).format(Math.round(n));
  const discountPct = (p: Product) =>
    p.compareAtPrice && p.compareAtPrice > p.price
      ? Math.round(((p.compareAtPrice - p.price) / p.compareAtPrice) * 100)
      : 0;

  return (
    <section className="bg-white w-full section-spacing om-watermark">
      <div className="section-container">
        {/* Enhanced Main Heading */}
        <div className="text-center mb-6 sm:mb-10 md:mb-14">
          <h2 className="section-heading text-[#F7971E] mb-3 sm:mb-4">
            Featured from RamVarna
          </h2>
          <p className="text-gray-600 text-sm sm:text-base max-w-2xl mx-auto px-4">
            Hand-picked spiritual essentials from our sister brand <a href="https://ramvarna.com" target="_blank" rel="noopener noreferrer" className="text-[#F7971E] font-semibold hover:underline">ramvarna.com</a>.
          </p>
          <div className="sacred-divider mx-auto max-w-[100px] sm:max-w-[120px] mt-4" />
        </div>

        {/* Products Slider - 3 Cards at a Time */}
        <div className="relative overflow-hidden">
          {/* Previous button */}
          <button
            onClick={() => {
              if (isMobile) {
                setProductIndex(prev => prev === 0 ? products.length - 1 : prev - 1);
              } else {
                setProductIndex(prev => prev === 0 ? 1 : 0);
              }
            }}
            className="absolute left-0 xs:left-1 sm:left-3 md:left-6 lg:left-8 top-1/2 -translate-y-1/2 z-10 bg-white rounded-full w-7 h-7 xs:w-8 xs:h-8 sm:w-10 sm:h-10 md:w-11 md:h-11 lg:w-12 lg:h-12 flex items-center justify-center shadow-lg hover:shadow-xl transition-all duration-300 border-2 border-[#F7971E] hover:bg-[#F7971E] hover:text-white text-[#F7971E]"
            aria-label="Previous products"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 sm:h-5 sm:w-5 md:h-6 md:w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>

          {/* Products Container */}
          <div className="overflow-hidden">
            <div
              className="flex transition-transform duration-500 ease-out"
              style={{
                transform: `translateX(-${isMobile ? productIndex * 100 : productIndex * 100}%)`
              }}
            >
              {isMobile ? (
                // Mobile: Single card view
                products.map((product, index) => (
                  <div key={index} className="min-w-full flex justify-center px-6 sm:px-4">
                    <div className="group w-full max-w-[320px] xs:max-w-sm">
                      <div
                        className="bg-white rounded-xl border border-gray-200 h-[340px] xs:h-[360px] sm:h-96 transition-all duration-300 relative overflow-hidden shadow-lg hover:shadow-2xl hover:border-[#F7971E] cursor-pointer astro-card"
                        onClick={() => window.open(product.link, '_blank', 'noopener,noreferrer')}
                      >
                        {/* Product Image */}
                        <div className="w-full h-[260px] xs:h-[280px] sm:h-72 overflow-hidden relative">
                          <img
                            src={product.image}
                            alt={product.name}
                            loading="lazy"
                            className={`w-full h-full object-cover group-hover:scale-110 transition-transform duration-500 ${product.name === "Spiritual Products" ? "object-bottom" : ""
                              }`}
                            onError={(e) => {
                              const t = e.target as HTMLImageElement;
                              if (!t.dataset.fallback) {
                                t.dataset.fallback = "1";
                                t.src = "/spiritual-products.svg";
                              }
                            }}
                          />

                          {/* Discount badge */}
                          {discountPct(product) > 0 && (
                            <div className="absolute top-2 left-2 z-10 bg-gradient-to-r from-red-500 to-orange-500 text-white text-[10px] font-black px-2 py-1 rounded-full shadow-lg">
                              {`-${discountPct(product)}%`}
                            </div>
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

                        {/* Product Info - Name + Price in Bottom White Area */}
                        <div className="absolute bottom-0 left-0 right-0 bg-white/95 backdrop-blur-sm px-3 py-2.5 flex flex-col items-center justify-center min-h-[70px] border-t border-orange-100">
                          <h3
                            className="font-bold text-base sm:text-[15px] text-center leading-tight transition-all duration-300 group-hover:scale-105 line-clamp-1"
                            style={{ fontFamily: "Poppins" }}
                          >
                            <span className="bg-gradient-to-r from-[#556B2F] to-[#F7971E] bg-clip-text text-transparent group-hover:from-[#F7971E] group-hover:to-[#556B2F] transition-all duration-300">
                              {product.name}
                            </span>
                          </h3>
                          <div className="flex items-baseline gap-2 mt-1">
                            <span className="font-extrabold text-[#F7971E] text-base">{`₹${formatINR(product.price)}`}</span>
                            {product.compareAtPrice && product.compareAtPrice > product.price && (
                              <span className="text-gray-400 text-xs line-through">{`₹${formatINR(product.compareAtPrice)}`}</span>
                            )}
                          </div>
                        </div>

                        {/* Hover Effect Border */}
                        <div className="absolute inset-0 rounded-xl border-2 border-[#F7971E] opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"></div>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                // Desktop: 3 cards view
                <>
                  {/* First 3 Products */}
                  <div className="min-w-full flex gap-6 justify-center">
                    {products.slice(0, 3).map((product, index) => (
                      <div key={index} className="group w-full max-w-[320px]">
                        <div
                          className="bg-white rounded-xl border border-gray-200 h-96 transition-all duration-300 relative overflow-hidden shadow-lg hover:shadow-2xl hover:border-[#F7971E] cursor-pointer"
                          onClick={() => window.open(product.link, '_blank', 'noopener,noreferrer')}
                        >
                          {/* Product Image */}
                          <div className="w-full h-72 overflow-hidden relative">
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

                            {/* Discount badge */}
                            {discountPct(product) > 0 && (
                              <div className="absolute top-2 left-2 z-10 bg-gradient-to-r from-red-500 to-orange-500 text-white text-[10px] font-black px-2 py-1 rounded-full shadow-lg">
                                {`-${discountPct(product)}%`}
                              </div>
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

                          {/* Product Info - Centered in Bottom White Area */}
                          <div className="absolute bottom-0 left-0 right-0 bg-white/95 p-4 flex items-center justify-center min-h-[60px]">
                            <h3
                              className="font-bold text-xl text-center transition-all duration-300 group-hover:scale-105"
                              style={{ fontFamily: "Poppins" }}
                            >
                              <span className="bg-gradient-to-r from-[#556B2F] to-[#F7971E] bg-clip-text text-transparent group-hover:from-[#F7971E] group-hover:to-[#556B2F] transition-all duration-300">
                                {product.name}
                              </span>
                            </h3>
                          </div>

                          {/* Hover Effect Border */}
                          <div className="absolute inset-0 rounded-xl border-2 border-[#F7971E] opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"></div>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Next 3 Products */}
                  <div className="min-w-full flex gap-6 justify-center">
                    {products.slice(3, 6).map((product, index) => (
                      <div key={index + 3} className="group w-80">
                        <div
                          className="bg-white rounded-xl border border-gray-200 h-96 transition-all duration-300 relative overflow-hidden shadow-lg hover:shadow-2xl hover:border-[#F7971E] cursor-pointer"
                          onClick={() => window.open(product.link, '_blank', 'noopener,noreferrer')}
                        >
                          {/* Product Image */}
                          <div className="w-full h-72 overflow-hidden relative">
                            <img
                              src={product.image}
                              alt={product.name}
                              loading="lazy"
                              className={`w-full h-full object-cover group-hover:scale-110 transition-transform duration-500 ${product.name === "Spiritual Products" ? "object-bottom" : ""
                                }`}
                              onError={(e) => {
                                const t = e.target as HTMLImageElement;
                                if (!t.dataset.fallback) {
                                  t.dataset.fallback = "1";
                                  t.src = "/spiritual-products.svg";
                                }
                              }}
                            />

                            {/* Discount badge */}
                            {discountPct(product) > 0 && (
                              <div className="absolute top-2 left-2 z-10 bg-gradient-to-r from-red-500 to-orange-500 text-white text-[10px] font-black px-2 py-1 rounded-full shadow-lg">
                                {`-${discountPct(product)}%`}
                              </div>
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

                          {/* Product Info - Centered in Bottom White Area */}
                          <div className="absolute bottom-0 left-0 right-0 bg-white/95 p-4 flex items-center justify-center min-h-[60px]">
                            <h3
                              className="font-bold text-xl text-center transition-all duration-300 group-hover:scale-105"
                              style={{ fontFamily: "Poppins" }}
                            >
                              <span className="bg-gradient-to-r from-[#556B2F] to-[#F7971E] bg-clip-text text-transparent group-hover:from-[#F7971E] group-hover:to-[#556B2F] transition-all duration-300">
                                {product.name}
                              </span>
                            </h3>
                          </div>

                          {/* Hover Effect Border */}
                          <div className="absolute inset-0 rounded-xl border-2 border-[#F7971E] opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"></div>
                        </div>
                      </div>
                    ))}
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Next button */}
          <button
            onClick={() => {
              if (isMobile) {
                setProductIndex(prev => prev === products.length - 1 ? 0 : prev + 1);
              } else {
                setProductIndex(prev => prev === 0 ? 1 : 0);
              }
            }}
            className="absolute right-0 xs:right-1 sm:right-3 md:right-6 lg:right-8 top-1/2 -translate-y-1/2 z-10 bg-white rounded-full w-7 h-7 xs:w-8 xs:h-8 sm:w-10 sm:h-10 md:w-11 md:h-11 lg:w-12 lg:h-12 flex items-center justify-center shadow-lg hover:shadow-xl transition-all duration-300 border-2 border-[#F7971E] hover:bg-[#F7971E] hover:text-white text-[#F7971E]"
            aria-label="Next products"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 sm:h-5 sm:w-5 md:h-6 md:w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>

          {/* Enhanced Dots indicator */}
          <div className="flex justify-center mt-6 sm:mt-10 mb-2 sm:mb-4 space-x-2">
            {isMobile ? (
              // Mobile: Show dots for each product (smaller)
              products.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setProductIndex(index)}
                  className={`rounded-full w-2.5 h-2.5 sm:w-3 sm:h-3 transition-all duration-300 ${productIndex === index
                      ? 'bg-[#F7971E]' 
                      : 'bg-gray-300 hover:bg-gray-400' 
                    }`}
                  aria-label={`Go to product ${index + 1}`}
                />

              ))
            ) : (
             
              <>
                <button
                  onClick={() => setProductIndex(0)}
                  className={`rounded-full w-3 h-3 transition-all duration-300 ${productIndex === 0 ? 'bg-[#F7971E]' : 'bg-gray-300 hover:bg-gray-400'}`}
                  aria-label="Go to first set of products"
                />
                <button
                  onClick={() => setProductIndex(1)}
                  className={`rounded-full w-3 h-3 transition-all duration-300 ${productIndex === 1 ? 'bg-[#F7971E]' : 'bg-gray-300 hover:bg-gray-400'}`}
                  aria-label="Go to second set of products"
                />
              </>
            )}
          </div>
        </div>

        {/* Shop All CTA */}
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
