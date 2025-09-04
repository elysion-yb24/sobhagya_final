'use client';

import { motion } from 'framer-motion';
import { useEffect, useRef } from 'react';

interface Planet {
  planet: string;
  sign: string;
  degree: string;
  status: string;
  house: number;
  isRetrograde?: boolean;
  isCombust?: boolean;
}

interface KundliChartProps {
  planetaryPositions: Planet[];
  personalInfo: any;
  language: 'english' | 'hindi';
}

const KundliChart = ({ planetaryPositions, personalInfo, language }: KundliChartProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Hindi translations
  const translations = {
    english: {
      title: 'Birth Chart (Kundli)',
      personalInfo: 'Personal Information',
      planetaryPositions: 'Planetary Positions',
      houseMeanings: 'House Meanings',
      planet: 'Planet',
      sign: 'Sign',
      degree: 'Degree',
      house: 'House',
      status: 'Status',
      houses: {
        1: '1st House:',
        2: '2nd House:',
        3: '3rd House:',
        4: '4th House:',
        5: '5th House:',
        6: '6th House:',
        7: '7th House:',
        8: '8th House:',
        9: '9th House:',
        10: '10th House:',
        11: '11th House:',
        12: '12th House:'
      },
      meanings: {
        1: 'Self, personality, appearance',
        2: 'Wealth, family, speech',
        3: 'Courage, siblings, communication',
        4: 'Mother, home, property',
        5: 'Children, intelligence, creativity',
        6: 'Enemies, health, obstacles',
        7: 'Marriage, partnerships',
        8: 'Longevity, transformation',
        9: 'Religion, guru, fortune',
        10: 'Career, profession, status',
        11: 'Gains, income, friends',
        12: 'Expenses, losses, spirituality'
      }
    },
    hindi: {
      title: 'जन्म कुंडली',
      personalInfo: 'व्यक्तिगत जानकारी',
      planetaryPositions: 'ग्रहों की स्थिति',
      houseMeanings: 'भावों का अर्थ',
      planet: 'ग्रह',
      sign: 'राशि',
      degree: 'अंश',
      house: 'भाव',
      status: 'स्थिति',
      houses: {
        1: 'प्रथम भाव:',
        2: 'द्वितीय भाव:',
        3: 'तृतीय भाव:',
        4: 'चतुर्थ भाव:',
        5: 'पंचम भाव:',
        6: 'षष्ठ भाव:',
        7: 'सप्तम भाव:',
        8: 'अष्टम भाव:',
        9: 'नवम भाव:',
        10: 'दशम भाव:',
        11: 'एकादश भाव:',
        12: 'द्वादश भाव:'
      },
      meanings: {
        1: 'स्वयं, व्यक्तित्व, रूप',
        2: 'धन, परिवार, वाणी',
        3: 'साहस, भाई-बहन, संचार',
        4: 'माता, घर, संपत्ति',
        5: 'संतान, बुद्धि, रचनात्मकता',
        6: 'शत्रु, स्वास्थ्य, बाधाएं',
        7: 'विवाह, साझेदारी',
        8: 'आयु, परिवर्तन',
        9: 'धर्म, गुरु, भाग्य',
        10: 'कैरियर, व्यवसाय, पद',
        11: 'लाभ, आय, मित्र',
        12: 'खर्च, हानि, आध्यात्मिकता'
      }
    }
  };

  const t = translations[language];

  // Get planet abbreviation
  const getPlanetAbbr = (planet: string) => {
    const planetAbbr: { [key: string]: string } = {
      'Sun': 'Su',
      'Moon': 'Mo',
      'Mars': 'Ma',
      'Mercury': 'Me',
      'Jupiter': 'Ju',
      'Venus': 'Ve',
      'Saturn': 'Sa',
      'Rahu': 'Ra',
      'Ketu': 'Ke'
    };
    return planetAbbr[planet] || planet;
  };

  // Get planet color
  const getPlanetColor = (planet: string) => {
    const planetColors: { [key: string]: string } = {
      'Sun': '#FF6B35',      // Orange
      'Moon': '#4A90E2',     // Blue
      'Mars': '#E74C3C',     // Red
      'Mercury': '#27AE60',  // Green
      'Jupiter': '#F39C12',  // Orange/Yellow
      'Venus': '#E91E63',    // Pink
      'Saturn': '#7F8C8D',   // Gray
      'Rahu': '#9B59B6',     // Purple
      'Ketu': '#34495E'      // Dark Blue
    };
    return planetColors[planet] || '#000000';
  };

  // Get planet name in Hindi
  const getPlanetName = (planet: string) => {
    const planetNames: { [key: string]: { english: string; hindi: string } } = {
      'Sun': { english: 'Sun', hindi: 'सूर्य' },
      'Moon': { english: 'Moon', hindi: 'चंद्र' },
      'Mars': { english: 'Mars', hindi: 'मंगल' },
      'Mercury': { english: 'Mercury', hindi: 'बुध' },
      'Jupiter': { english: 'Jupiter', hindi: 'गुरु' },
      'Venus': { english: 'Venus', hindi: 'शुक्र' },
      'Saturn': { english: 'Saturn', hindi: 'शनि' },
      'Rahu': { english: 'Rahu', hindi: 'राहु' },
      'Ketu': { english: 'Ketu', hindi: 'केतु' }
    };
    return planetNames[planet] || { english: planet, hindi: planet };
  };

  // Get sign name in Hindi
  const getSignName = (sign: string) => {
    const signNames: { [key: string]: { english: string; hindi: string } } = {
      'Aries': { english: 'Aries', hindi: 'मेष' },
      'Taurus': { english: 'Taurus', hindi: 'वृषभ' },
      'Gemini': { english: 'Gemini', hindi: 'मिथुन' },
      'Cancer': { english: 'Cancer', hindi: 'कर्क' },
      'Leo': { english: 'Leo', hindi: 'सिंह' },
      'Virgo': { english: 'Virgo', hindi: 'कन्या' },
      'Libra': { english: 'Libra', hindi: 'तुला' },
      'Scorpio': { english: 'Scorpio', hindi: 'वृश्चिक' },
      'Sagittarius': { english: 'Sagittarius', hindi: 'धनु' },
      'Capricorn': { english: 'Capricorn', hindi: 'मकर' },
      'Aquarius': { english: 'Aquarius', hindi: 'कुंभ' },
      'Pisces': { english: 'Pisces', hindi: 'मीन' }
    };
    return signNames[sign] || { english: sign, hindi: sign };
  };

  // Draw the Kundli chart on canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Fixed size for better consistency - increased for better spacing
    const size = 500;
    
    // Set canvas size with high DPI for crisp rendering
    const dpr = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();
    
    canvas.width = size * dpr;
    canvas.height = size * dpr;
    canvas.style.width = size + 'px';
    canvas.style.height = size + 'px';
    
    ctx.scale(dpr, dpr);

    // Clear canvas
    ctx.clearRect(0, 0, size, size);

    // Enable text smoothing for crisp rendering
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = 'high';

    // Set background
    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(0, 0, size, size);

    // Draw main square
    ctx.strokeStyle = '#374151';
    ctx.lineWidth = 2;
    ctx.lineCap = 'square';
    ctx.lineJoin = 'miter';
    ctx.strokeRect(0, 0, size, size);

    // Draw diagonals (to form North Indian diamond chart)
    ctx.beginPath();
    ctx.moveTo(0, size/2);
    ctx.lineTo(size/2, 0);
    ctx.lineTo(size, size/2);
    ctx.lineTo(size/2, size);
    ctx.closePath();
    ctx.stroke();

    // Draw center cross
    ctx.beginPath();
    ctx.moveTo(size/2, 0);
    ctx.lineTo(size/2, size);
    ctx.moveTo(0, size/2);
    ctx.lineTo(size, size/2);
    ctx.stroke();

    // Draw diagonal lines
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(size, size);
    ctx.moveTo(size, 0);
    ctx.lineTo(0, size);
    ctx.stroke();

    // House positions (center points for each house) - Proper Kundli layout
    const housePositions = [
      { x: size/2, y: 70 },      // House 1 - Top
      { x: size-90, y: 90 },     // House 2 - Top Right
      { x: size-70, y: size/2 }, // House 3 - Right
      { x: size-90, y: size-90 }, // House 4 - Bottom Right
      { x: size/2, y: size-70 }, // House 5 - Bottom
      { x: 90, y: size-90 },     // House 6 - Bottom Left
      { x: 70, y: size/2 },      // House 7 - Left
      { x: 90, y: 90 },          // House 8 - Top Left
      { x: size/2, y: 150 },     // House 9 - Center Top
      { x: size-150, y: size/2 }, // House 10 - Center Right
      { x: size/2, y: size-150 }, // House 11 - Center Bottom
      { x: 150, y: size/2 }      // House 12 - Center Left
    ];

    // Draw house numbers - positioned in corners to avoid cutting lines
    ctx.fillStyle = '#374151';
    ctx.font = 'bold 16px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Arial, sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    housePositions.forEach((pos, index) => {
      // Position house numbers in proper corners of each house - avoiding diagonal lines
      let numberX = pos.x;
      let numberY = pos.y;
      
      // Adjust house number positions based on house location - proper Kundli layout
      if (index === 0) { // House 1 - Top (top-left corner, away from top line)
        numberX = pos.x - 60;
        numberY = pos.y - 60;
      } else if (index === 1) { // House 2 - Top Right (top-right corner, away from top line)
        numberX = pos.x + 60;
        numberY = pos.y - 60;
      } else if (index === 2) { // House 3 - Right (bottom-right corner, away from right line)
        numberX = pos.x + 60;
        numberY = pos.y + 60;
      } else if (index === 3) { // House 4 - Bottom Right (bottom-right corner, away from bottom line)
        numberX = pos.x + 60;
        numberY = pos.y + 60;
      } else if (index === 4) { // House 5 - Bottom (bottom-left corner, away from bottom line)
        numberX = pos.x - 60;
        numberY = pos.y + 60;
      } else if (index === 5) { // House 6 - Bottom Left (bottom-left corner, away from bottom line)
        numberX = pos.x - 60;
        numberY = pos.y + 60;
      } else if (index === 6) { // House 7 - Left (top-left corner, away from left line)
        numberX = pos.x - 60;
        numberY = pos.y - 60;
      } else if (index === 7) { // House 8 - Top Left (top-left corner, away from top line)
        numberX = pos.x - 60;
        numberY = pos.y - 60;
      } else if (index === 8) { // House 9 - Center Top (top-left corner, away from diagonal)
        numberX = pos.x - 80;
        numberY = pos.y - 80;
      } else if (index === 9) { // House 10 - Center Right (bottom-right corner, away from diagonal)
        numberX = pos.x + 80;
        numberY = pos.y + 80;
      } else if (index === 10) { // House 11 - Center Bottom (bottom-left corner, away from diagonal)
        numberX = pos.x - 80;
        numberY = pos.y + 80;
      } else if (index === 11) { // House 12 - Center Left (top-left corner, away from diagonal)
        numberX = pos.x - 80;
        numberY = pos.y - 80;
      }
      
      ctx.fillText((index + 1).toString(), numberX, numberY);
    });

    // Place planets in houses - positioned to avoid overlap with house numbers and lines
    ctx.font = '13px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Arial, sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    planetaryPositions.forEach((planet, index) => {
      const houseIndex = planet.house - 1;
      if (houseIndex >= 0 && houseIndex < housePositions.length) {
        const pos = housePositions[houseIndex];
        
        // Set planet color
        ctx.fillStyle = getPlanetColor(planet.planet);
        
        // Create planet text
        const planetAbbr = getPlanetAbbr(planet.planet);
        const planetText = `${planetAbbr}-${planet.degree}°`;
        
        // Add retrograde indicator
        const fullText = planet.isRetrograde ? `${planetText}(R)` : planetText;
        
        // Draw planet text - positioned to avoid house numbers and chart lines
        // Use different positioning based on house location to avoid overlap
        let textY = pos.y;
        let textX = pos.x;
        
        if (houseIndex === 0) { // House 1 - Top (center, below number)
          textY = pos.y + 40;
        } else if (houseIndex === 1) { // House 2 - Top Right (center, below number)
          textY = pos.y + 40;
        } else if (houseIndex === 2) { // House 3 - Right (center, below number)
          textY = pos.y + 40;
        } else if (houseIndex === 3) { // House 4 - Bottom Right (center, below number)
          textY = pos.y + 40;
        } else if (houseIndex === 4) { // House 5 - Bottom (center, above number)
          textY = pos.y - 40;
        } else if (houseIndex === 5) { // House 6 - Bottom Left (center, above number)
          textY = pos.y - 40;
        } else if (houseIndex === 6) { // House 7 - Left (center, below number)
          textY = pos.y + 40;
        } else if (houseIndex === 7) { // House 8 - Top Left (center, below number)
          textY = pos.y + 40;
        } else if (houseIndex === 8) { // House 9 - Center Top (center, below number)
          textY = pos.y + 50;
        } else if (houseIndex === 9) { // House 10 - Center Right (center, below number)
          textY = pos.y + 50;
        } else if (houseIndex === 10) { // House 11 - Center Bottom (center, above number)
          textY = pos.y - 50;
        } else if (houseIndex === 11) { // House 12 - Center Left (center, below number)
          textY = pos.y + 50;
        }
        
        ctx.fillText(fullText, textX, textY);
      }
    });

  }, [planetaryPositions, language]);

  return (
    <div className="w-full">
      {/* Chart Title */}
      <div className="text-center mb-6">
        <h3 className="text-xl font-bold text-gray-900 mb-2">
          {t.title} - {personalInfo?.name}
        </h3>
        <p className="text-sm text-gray-600">
          {personalInfo?.dateOfBirth} at {personalInfo?.timeOfBirth} | {personalInfo?.placeOfBirth}
        </p>
      </div>

      {/* Canvas-based Kundli Chart */}
      <div className="flex justify-center mb-8">
        <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
          <canvas
            ref={canvasRef}
            className="block mx-auto"
            style={{ 
              maxWidth: '100%', 
              height: 'auto',
              display: 'block',
              imageRendering: 'crisp-edges'
            }}
          />
        </div>
      </div>

      {/* Planetary Positions Table */}
      <div className="mt-8">
        <div className="bg-white rounded-lg border border-gray-300 p-6">
          <h4 className="font-bold text-gray-900 mb-4 text-center">{t.planetaryPositions}</h4>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse border border-gray-300">
              <thead>
                <tr className="bg-gray-100">
                  <th className="border border-gray-300 px-3 py-2 text-left font-semibold">{t.planet}</th>
                  <th className="border border-gray-300 px-3 py-2 text-left font-semibold">{t.sign}</th>
                  <th className="border border-gray-300 px-3 py-2 text-left font-semibold">{t.degree}</th>
                  <th className="border border-gray-300 px-3 py-2 text-left font-semibold">{t.house}</th>
                  <th className="border border-gray-300 px-3 py-2 text-left font-semibold">{t.status}</th>
                </tr>
              </thead>
              <tbody>
                {planetaryPositions.map((planet, index) => {
                  const planetName = getPlanetName(planet.planet);
                  const signName = getSignName(planet.sign);
                  return (
                    <tr key={index} className="hover:bg-gray-50">
                      <td className="border border-gray-300 px-3 py-2 font-medium">
                        {language === 'hindi' ? planetName.hindi : planetName.english}
                      </td>
                      <td className="border border-gray-300 px-3 py-2">
                        {language === 'hindi' ? signName.hindi : signName.english}
                      </td>
                      <td className="border border-gray-300 px-3 py-2">{planet.degree}</td>
                      <td className="border border-gray-300 px-3 py-2 text-center">{planet.house}</td>
                      <td className="border border-gray-300 px-3 py-2">
                        <span className="text-sm">
                          {planet.isRetrograde && <span className="text-red-600 font-bold mr-1">R</span>}
                          {planet.isCombust && <span className="text-yellow-600 font-bold mr-1">C</span>}
                          {planet.status}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* House Meanings */}
      <div className="mt-6">
        <div className="bg-white rounded-lg border border-gray-300 p-6">
          <h4 className="font-bold text-gray-900 mb-4 text-center">{t.houseMeanings}</h4>
          <div className="grid md:grid-cols-2 gap-4 text-sm">
            <div className="space-y-2">
              <div className="flex justify-between border-b border-gray-200 pb-1">
                <span className="font-medium">{t.houses[1]}</span>
                <span className="text-gray-600">{t.meanings[1]}</span>
              </div>
              <div className="flex justify-between border-b border-gray-200 pb-1">
                <span className="font-medium">{t.houses[2]}</span>
                <span className="text-gray-600">{t.meanings[2]}</span>
              </div>
              <div className="flex justify-between border-b border-gray-200 pb-1">
                <span className="font-medium">{t.houses[3]}</span>
                <span className="text-gray-600">{t.meanings[3]}</span>
              </div>
              <div className="flex justify-between border-b border-gray-200 pb-1">
                <span className="font-medium">{t.houses[4]}</span>
                <span className="text-gray-600">{t.meanings[4]}</span>
              </div>
              <div className="flex justify-between border-b border-gray-200 pb-1">
                <span className="font-medium">{t.houses[5]}</span>
                <span className="text-gray-600">{t.meanings[5]}</span>
              </div>
              <div className="flex justify-between border-b border-gray-200 pb-1">
                <span className="font-medium">{t.houses[6]}</span>
                <span className="text-gray-600">{t.meanings[6]}</span>
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between border-b border-gray-200 pb-1">
                <span className="font-medium">{t.houses[7]}</span>
                <span className="text-gray-600">{t.meanings[7]}</span>
              </div>
              <div className="flex justify-between border-b border-gray-200 pb-1">
                <span className="font-medium">{t.houses[8]}</span>
                <span className="text-gray-600">{t.meanings[8]}</span>
              </div>
              <div className="flex justify-between border-b border-gray-200 pb-1">
                <span className="font-medium">{t.houses[9]}</span>
                <span className="text-gray-600">{t.meanings[9]}</span>
              </div>
              <div className="flex justify-between border-b border-gray-200 pb-1">
                <span className="font-medium">{t.houses[10]}</span>
                <span className="text-gray-600">{t.meanings[10]}</span>
              </div>
              <div className="flex justify-between border-b border-gray-200 pb-1">
                <span className="font-medium">{t.houses[11]}</span>
                <span className="text-gray-600">{t.meanings[11]}</span>
              </div>
              <div className="flex justify-between border-b border-gray-200 pb-1">
                <span className="font-medium">{t.houses[12]}</span>
                <span className="text-gray-600">{t.meanings[12]}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default KundliChart;
