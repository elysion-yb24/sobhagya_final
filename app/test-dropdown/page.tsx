'use client';

import { useState } from 'react';
import { ChevronDown } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function TestDropdown() {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">Dropdown Test Page</h1>
        
        <div className="bg-white p-8 rounded-lg shadow-lg">
          <h2 className="text-xl font-semibold mb-4">Test Services Dropdown</h2>
          
          <div className="relative inline-block">
            <button
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              className={`relative text-base font-semibold px-4 py-2 rounded transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-orange-200 flex items-center gap-2 ${
                isDropdownOpen 
                  ? 'text-orange-600 bg-orange-50 border border-orange-200' 
                  : 'text-gray-700 hover:text-orange-600'
              }`}
            >
              <span>Services</span>
              <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${isDropdownOpen ? 'rotate-180' : ''}`} />
            </button>
            
            <AnimatePresence>
              {isDropdownOpen && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.2 }}
                  className="absolute top-full left-0 mt-2 w-48 bg-white rounded-lg shadow-xl border border-gray-200 py-2 z-[9999]"
                  style={{ boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)' }}
                >
                  <div className="px-4 py-3 text-gray-700 hover:text-orange-600 hover:bg-orange-50 transition-colors duration-200 text-sm font-medium cursor-pointer">
                    Kundli
                  </div>
                  <div className="px-4 py-3 text-gray-700 hover:text-orange-600 hover:bg-orange-50 transition-colors duration-200 text-sm font-medium cursor-pointer">
                    Gun Milan
                  </div>
                  <div className="border-t border-gray-100 my-1"></div>
                  <div className="px-4 py-3 text-gray-700 hover:text-orange-600 hover:bg-orange-50 transition-colors duration-200 text-sm font-medium cursor-pointer">
                    View All Services
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
          
          <div className="mt-4 text-sm text-gray-600">
            Dropdown state: {isDropdownOpen ? 'Open' : 'Closed'}
          </div>
        </div>
      </div>
    </div>
  );
}
