'use client'
import React, { useState } from 'react';
import Link from 'next/link';

interface Product {
  id: number;
  name: string;
  description: string;
  image: string;
  link: string;
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

  const products: Product[] = [
    {
      id: 1,
      name: "Authentic Gemstones",
      description: "Authentic Gemstones for Meditation & Well-being",
      image: "/authentic-gemstones.svg",
      link: "https://store.sobhagya.in/collections/gemstone"
    },
    {
      id: 2,
      name: "Rudraksh Collection",
      description: "Most loved astrology services for trusted guidance",
      image: "/rudraksh-collection.svg",
      link: "https://store.sobhagya.in/collections/rudraksh-collection"
    },
    {
      id: 3,
      name: "God Idols",
      description: "Gifts of Faith & Inner Harmony",
      image: "/god-idols.png",
      link: "https://store.sobhagya.in/collections/gog-idols"
    },
    {
      id: 4,
      name: "Bracelets",
      description: "Crafted to Resonate with Your Inner Self",
      image: "/spiritual-bracelets.svg",
      link: "https://store.sobhagya.in/collections/bracelets"
    },
    {
      id: 5,
      name: "Spiritual Products",
      description: "Elevate Your Spirit: Tools for a Deeper Spiritual Journey",
      image: "/spiritual-products.svg",
      link: "https://store.sobhagya.in/collections/spiritual-jewellery-collection"
    },
    {
      id: 6,
      name: "Pooja Items",
      description: "Create a Divine Atmosphere for Your Daily Puja",
      image: "/pooja-items.svg",
      link: "https://store.sobhagya.in/collections/pooja-items"
    }
  ];

  return (
    <section className="bg-white w-full py-16">
      <div className="max-w-7xl mx-auto px-4">
        {/* Enhanced Main Heading */}
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-4 relative" style={{ fontFamily: "EB Garamond" }}>
            <span className="text-[#F7971E]">
              Our Products
            </span>
          </h2>
          <div className="w-24 h-1 bg-[#F7971E] rounded-full mx-auto"></div>
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
            className={`absolute z-10 bg-white rounded-full flex items-center justify-center shadow-lg hover:shadow-xl transition-all duration-300 border-2 border-[#F7971E] hover:bg-[#F7971E] hover:text-white text-[#F7971E] ${
              isMobile ? 'left-2 w-8 h-8 top-48' : 'left-4 w-12 h-12 top-48'
            }`}
            aria-label="Previous products"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className={isMobile ? "h-4 w-4" : "h-7 w-7"} fill="none" viewBox="0 0 24 24" stroke="currentColor">
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
                  <div key={index} className="min-w-full flex justify-center px-4">
                    <div className="group w-full max-w-sm">
                      <div
                        className="bg-white rounded-xl border border-gray-200 h-96 transition-all duration-300 relative overflow-hidden shadow-lg hover:shadow-2xl hover:border-[#F7971E] cursor-pointer"
                        onClick={() => window.open(product.link, '_blank')}
                      >
                        {/* Product Image */}
                        <div className="w-full h-72 overflow-hidden relative">
                          <img
                            src={product.image}
                            alt={product.name}
                            className={`w-full h-full object-cover group-hover:scale-110 transition-transform duration-500 ${product.name === "Spiritual Products" ? "object-bottom" : ""
                              }`}
                          />

                          {/* Hover Overlay with Visit Collection Text */}
                          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-300 flex items-center justify-center">
                            <div className="text-center transform translate-y-4 group-hover:translate-y-0 transition-transform duration-300">
                              <span className="text-white font-bold text-xl block mb-2">
                                <span className="bg-gradient-to-r from-white to-[#F7971E] bg-clip-text text-transparent">
                                  Visit Collection
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
                  </div>
                ))
              ) : (
                // Desktop: 3 cards view
                <>
                  {/* First 3 Products */}
                  <div className="min-w-full flex gap-6 justify-center">
                    {products.slice(0, 3).map((product, index) => (
                      <div key={index} className="group w-80">
                        <div
                          className="bg-white rounded-xl border border-gray-200 h-96 transition-all duration-300 relative overflow-hidden shadow-lg hover:shadow-2xl hover:border-[#F7971E] cursor-pointer"
                          onClick={() => window.open(product.link, '_blank')}
                        >
                          {/* Product Image */}
                          <div className="w-full h-72 overflow-hidden relative">
                            <img
                              src={product.image}
                              alt={product.name}
                              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                            />

                            {/* Hover Overlay with Visit Collection Text */}
                            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-300 flex items-center justify-center">
                              <div className="text-center transform translate-y-4 group-hover:translate-y-0 transition-transform duration-300">
                                <span className="text-white font-bold text-xl block mb-2">
                                  <span className="bg-gradient-to-r from-white to-[#F7971E] bg-clip-text text-transparent">
                                    Visit Collection
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
                          onClick={() => window.open(product.link, '_blank')}
                        >
                          {/* Product Image */}
                          <div className="w-full h-72 overflow-hidden relative">
                            <img
                              src={product.image}
                              alt={product.name}
                              className={`w-full h-full object-cover group-hover:scale-110 transition-transform duration-500 ${product.name === "Spiritual Products" ? "object-bottom" : ""
                                }`}
                            />

                            {/* Hover Overlay with Visit Collection Text */}
                            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-300 flex items-center justify-center">
                              <div className="text-center transform translate-y-4 group-hover:translate-y-0 transition-transform duration-300">
                                <span className="text-white font-bold text-xl block mb-2">
                                  <span className="bg-gradient-to-r from-white to-[#F7971E] bg-clip-text text-transparent">
                                    Visit Collection
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
            className={`absolute z-10 bg-white rounded-full flex items-center justify-center shadow-lg hover:shadow-xl transition-all duration-300 border-2 border-[#F7971E] hover:bg-[#F7971E] hover:text-white text-[#F7971E] ${
              isMobile ? 'right-2 w-8 h-8 top-48' : 'right-4 w-12 h-12 top-48'
            }`}
            aria-label="Next products"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className={isMobile ? "h-4 w-4" : "h-7 w-7"} fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>

          {/* Enhanced Dots indicator */}
          <div className="flex justify-center mt-4 mb-2">
            {isMobile ? (
              // Mobile: Simple clean indicator
              <div className="flex items-center space-x-2">
                {products.map((_, index) => (
                  <div
                    key={index}
                    className={`rounded-full transition-all duration-300 ${
                      productIndex === index ? 'bg-[#F7971E] w-2 h-2' : 'bg-gray-300 w-1.5 h-1.5'
                    }`}
                  />
                ))}
              </div>
            ) : (
              <div className="flex space-x-2">
                <button
                  onClick={() => setProductIndex(0)}
                  className={`rounded-full transition-all duration-300 w-3 h-3 ${productIndex === 0 ? 'bg-[#F7971E]' : 'bg-gray-300 hover:bg-gray-400'}`}
                  aria-label="Go to first set of products"
                />
                <button
                  onClick={() => setProductIndex(1)}
                  className={`rounded-full transition-all duration-300 w-3 h-3 ${productIndex === 1 ? 'bg-[#F7971E]' : 'bg-gray-300 hover:bg-gray-400'}`}
                  aria-label="Go to second set of products"
                />
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};

export default OurProducts;
