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

  const products: Product[] = [
    {
      id: 1,
      name: "Authentic Gemstones",
      description: "Authentic Gemstones for Meditation & Well-being",
      image: "/authentic-gemstoness.png",
      link: "https://store.sobhagya.in/collections/gemstone"
    },
    {
      id: 2,
      name: "Rudraksh Collection",
      description: "Most loved astrology services for trusted guidance",
      image: "/rudraksha-collection.png",
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
      image: "/spiritual-bracelets.png",
      link: "https://store.sobhagya.in/collections/bracelets"
    },
    {
      id: 5,
      name: "Spiritual Products",
      description: "Elevate Your Spirit: Tools for a Deeper Spiritual Journey",
      image: "/spiritual-products.png",
      link: "https://store.sobhagya.in/collections/spiritual-jewellery-collection"
    },
    {
      id: 6,
      name: "Pooja Items",
      description: "Create a Divine Atmosphere for Your Daily Puja",
      image: "/pooja-items.png",
      link: "https://store.sobhagya.in/collections/pooja-items"
    }
  ];

  return (
    <section className="bg-white w-full py-16">
      <div className="max-w-7xl mx-auto px-4">
        {/* Enhanced Main Heading */}
        <div className="text-center mb-16">
          <h2 className="text-5xl md:text-4xl font-bold mb-4 relative">
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
            onClick={() => setProductIndex(prev => prev === 0 ? 1 : 0)}
            className="absolute left-4 top-1/2 -translate-y-1/2 z-10 bg-white rounded-full w-14 h-14 flex items-center justify-center shadow-lg hover:shadow-xl transition-all duration-300 border-2 border-[#F7971E] hover:bg-[#F7971E] hover:text-white"
            aria-label="Previous products"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>

          {/* Products Container */}
          <div className="overflow-hidden">
            <div 
              className="flex transition-transform duration-500 ease-out"
              style={{ transform: `translateX(-${productIndex * 100}%)` }}
            >
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
            </div>
          </div>

          {/* Next button */}
          <button
            onClick={() => setProductIndex(prev => prev === 0 ? 1 : 0)}
            className="absolute right-4 top-1/2 -translate-y-1/2 z-10 bg-white rounded-full w-14 h-14 flex items-center justify-center shadow-lg hover:shadow-xl transition-all duration-300 border-2 border-[#F7971E] hover:bg-[#F7971E] hover:text-white"
            aria-label="Next products"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>

          {/* Enhanced Dots indicator */}
          <div className="flex justify-center mt-12 mb-6 space-x-4">
            <button
              onClick={() => setProductIndex(0)}
              className={`w-4 h-4 rounded-full transition-all duration-300 ${productIndex === 0 ? 'bg-[#F7971E] scale-125' : 'bg-gray-300 hover:bg-gray-400'}`}
              aria-label="Go to first set of products"
            />
            <button
              onClick={() => setProductIndex(1)}
              className={`w-4 h-4 rounded-full transition-all duration-300 ${productIndex === 1 ? 'bg-[#F7971E] scale-125' : 'bg-gray-300 hover:bg-gray-400'}`}
              aria-label="Go to second set of products"
            />
          </div>
        </div>
      </div>
    </section>
  );
};

export default OurProducts;
