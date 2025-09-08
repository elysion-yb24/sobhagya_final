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

    // Fixed 500x500 square canvas
    const size = 500;
    
    // Set canvas size with high DPI for crisp rendering
    const dpr = window.devicePixelRatio || 1;
    
    canvas.width = size * dpr;
    canvas.height = size * dpr;
    canvas.style.width = size + 'px';
    canvas.style.height = size + 'px';
    
    ctx.scale(dpr, dpr);

    // Clear canvas
    ctx.clearRect(0, 0, size, size);

    // Set background
    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(0, 0, size, size);

    // Set line style
    ctx.strokeStyle = '#000000';
    ctx.lineWidth = 2;
    ctx.lineCap = 'square';
    ctx.lineJoin = 'miter';

    // Draw outer square
    ctx.strokeRect(0, 0, size, size);

    // Draw inner diamond (connecting midpoints)
    ctx.beginPath();
    ctx.moveTo(250, 0);    // Top
    ctx.lineTo(500, 250);  // Right
    ctx.lineTo(250, 500);  // Bottom
    ctx.lineTo(0, 250);    // Left
    ctx.closePath();
    ctx.stroke();

    // Draw diagonal lines connecting opposite corners to create 12 compartments
    ctx.beginPath();
    // Top-left corner to bottom-right corner
    ctx.moveTo(0, 0);
    ctx.lineTo(500, 500);
    // Top-right corner to bottom-left corner
    ctx.moveTo(500, 0);
    ctx.lineTo(0, 500);
    ctx.stroke();

    // Calculate exact centers of each of the 12 compartments created by the lines
    // The structure creates: 4 corner triangles, 4 side triangles, and 4 inner rectangles
    const houseCenters = [
      { x: 250, y: 80, house: 1 },     // House 1 - Top center triangle
      { x: 350, y: 80, house: 2 },     // House 2 - Top right triangle
      { x: 420, y: 200, house: 3 },    // House 3 - Right triangle
      { x: 350, y: 320, house: 4 },    // House 4 - Bottom right triangle
      { x: 250, y: 370, house: 5 },    // House 5 - Bottom triangle
      { x: 150, y: 320, house: 6 },    // House 6 - Bottom left triangle
      { x: 80, y: 200, house: 7 },     // House 7 - Left triangle
      { x: 150, y: 80, house: 8 },     // House 8 - Top left triangle
      { x: 200, y: 150, house: 9 },    // House 9 - Inner top left box
      { x: 300, y: 150, house: 10 },   // House 10 - Inner top right box
      { x: 300, y: 250, house: 11 },   // House 11 - Inner bottom right box
      { x: 200, y: 250, house: 12 }    // House 12 - Inner bottom left box
    ];

    // Draw house numbers
    ctx.fillStyle = '#000000';
    ctx.font = 'bold 16px Arial';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    houseCenters.forEach((house) => {
      ctx.fillText(house.house.toString(), house.x, house.y);
    });

    // Place planets in houses
    ctx.font = 'bold 10px Arial';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    const planetPositions: { [key: number]: { x: number; y: number }[] } = {};
    
    planetaryPositions.forEach((planet, index) => {
      const houseIndex = planet.house - 1;
      if (houseIndex >= 0 && houseIndex < houseCenters.length) {
        const house = houseCenters[houseIndex];
        
        if (!planetPositions[houseIndex]) {
          planetPositions[houseIndex] = [];
        }
        
        ctx.fillStyle = getPlanetColor(planet.planet);
        
        const planetAbbr = getPlanetAbbr(planet.planet);
        const planetText = `${planetAbbr}-${planet.degree}°`;
        const fullText = planet.isRetrograde ? `${planetText}(R)` : planetText;
        
        const planetCount = planetPositions[houseIndex].length;
        const offsetY = (planetCount - 1) * 12;
        
        const textX = house.x;
        const textY = house.y + 20 + offsetY;
        
        planetPositions[houseIndex].push({ x: textX, y: textY });
        
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
