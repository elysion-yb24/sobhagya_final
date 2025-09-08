// Professional Horoscope Generator based on Real Astronomical Calculations
// Uses Vedic Astrology principles and planetary positions

interface PlanetaryPosition {
  planet: string;
  longitude: number;
  sign: number;
  degree: number;
  retrograde: boolean;
}

interface HoroscopeData {
  sign: string;
  date: string;
  period: 'daily' | 'weekly' | 'monthly' | 'yearly';
  horoscope: string;
  luckyNumber: number;
  luckyTime: string;
  luckyColor: string;
  compatibility: string;
  mood: string;
  planetaryInfluences: string[];
  remedies: string[];
}

class AstronomicalHoroscopeGenerator {
  private zodiacSigns = [
    'Aries', 'Taurus', 'Gemini', 'Cancer', 'Leo', 'Virgo',
    'Libra', 'Scorpio', 'Sagittarius', 'Capricorn', 'Aquarius', 'Pisces'
  ];

  private planets = ['Sun', 'Moon', 'Mars', 'Mercury', 'Jupiter', 'Venus', 'Saturn'];
  
  private rashiLords = [
    'Mars', 'Venus', 'Mercury', 'Moon', 'Sun', 'Mercury',
    'Venus', 'Mars', 'Jupiter', 'Saturn', 'Saturn', 'Jupiter'
  ];

  // Calculate planetary positions using simplified astronomical formulas
  private calculatePlanetaryPositions(date: Date): PlanetaryPosition[] {
    const positions: PlanetaryPosition[] = [];
    const jd = this.dateToJulianDay(date);
    
    // Calculate Sun position (simplified)
    const sunLongitude = this.calculateSunLongitude(jd);
    positions.push({
      planet: 'Sun',
      longitude: sunLongitude,
      sign: Math.floor(sunLongitude / 30),
      degree: sunLongitude % 30,
      retrograde: false
    });

    // Calculate Moon position (simplified)
    const moonLongitude = this.calculateMoonLongitude(jd);
    positions.push({
      planet: 'Moon',
      longitude: moonLongitude,
      sign: Math.floor(moonLongitude / 30),
      degree: moonLongitude % 30,
      retrograde: false
    });

    // Calculate other planets (simplified approximations)
    const marsLongitude = this.calculateMarsLongitude(jd);
    positions.push({
      planet: 'Mars',
      longitude: marsLongitude,
      sign: Math.floor(marsLongitude / 30),
      degree: marsLongitude % 30,
      retrograde: this.isMarsRetrograde(jd)
    });

    const mercuryLongitude = this.calculateMercuryLongitude(jd);
    positions.push({
      planet: 'Mercury',
      longitude: mercuryLongitude,
      sign: Math.floor(mercuryLongitude / 30),
      degree: mercuryLongitude % 30,
      retrograde: this.isMercuryRetrograde(jd)
    });

    const jupiterLongitude = this.calculateJupiterLongitude(jd);
    positions.push({
      planet: 'Jupiter',
      longitude: jupiterLongitude,
      sign: Math.floor(jupiterLongitude / 30),
      degree: jupiterLongitude % 30,
      retrograde: this.isJupiterRetrograde(jd)
    });

    const venusLongitude = this.calculateVenusLongitude(jd);
    positions.push({
      planet: 'Venus',
      longitude: venusLongitude,
      sign: Math.floor(venusLongitude / 30),
      degree: venusLongitude % 30,
      retrograde: this.isVenusRetrograde(jd)
    });

    const saturnLongitude = this.calculateSaturnLongitude(jd);
    positions.push({
      planet: 'Saturn',
      longitude: saturnLongitude,
      sign: Math.floor(saturnLongitude / 30),
      degree: saturnLongitude % 30,
      retrograde: this.isSaturnRetrograde(jd)
    });

    return positions;
  }

  // Convert date to Julian Day Number
  private dateToJulianDay(date: Date): number {
    const year = date.getFullYear();
    const month = date.getMonth() + 1;
    const day = date.getDate();
    const hour = date.getHours();
    const minute = date.getMinutes();

    let jd = 367 * year - Math.floor(7 * (year + Math.floor((month + 9) / 12)) / 4) + 
             Math.floor(275 * month / 9) + day + 1721013.5 + 
             (hour + minute / 60) / 24;
    
    return jd;
  }

  // Calculate Sun's longitude (VSOP87 simplified)
  private calculateSunLongitude(jd: number): number {
    const t = (jd - 2451545.0) / 36525;
    const L0 = 280.46645 + 36000.76983 * t + 0.0003032 * t * t;
    const M = 357.52910 + 35999.05030 * t - 0.0001559 * t * t - 0.00000048 * t * t * t;
    const C = (1.914600 - 0.004817 * t - 0.000014 * t * t) * Math.sin(M * Math.PI / 180) +
              (0.019993 - 0.000101 * t) * Math.sin(2 * M * Math.PI / 180) +
              0.000290 * Math.sin(3 * M * Math.PI / 180);
    
    let longitude = L0 + C;
    longitude = longitude % 360;
    if (longitude < 0) longitude += 360;
    
    return longitude;
  }

  // Calculate Moon's longitude (simplified)
  private calculateMoonLongitude(jd: number): number {
    const t = (jd - 2451545.0) / 36525;
    const L = 218.3164477 + 481267.88123421 * t - 0.0015786 * t * t + t * t * t / 538841 - t * t * t * t / 65194000;
    const D = 297.8501921 + 445267.1114034 * t - 0.0018819 * t * t + t * t * t / 545868 - t * t * t * t / 113065000;
    const M = 357.5291092 + 35999.0502909 * t - 0.0001536 * t * t + t * t * t / 24490000;
    const Mp = 134.9633964 + 477198.8675055 * t + 0.0087414 * t * t + t * t * t / 69699 - t * t * t * t / 14712000;

    let longitude = L + 6.288774 * Math.sin(Mp * Math.PI / 180) +
                    1.274027 * Math.sin((2 * D - Mp) * Math.PI / 180) +
                    0.658314 * Math.sin(2 * D * Math.PI / 180);
    
    longitude = longitude % 360;
    if (longitude < 0) longitude += 360;
    
    return longitude;
  }

  // Calculate Mars longitude (simplified)
  private calculateMarsLongitude(jd: number): number {
    const t = (jd - 2451545.0) / 36525;
    const L = 355.433 + 19140.2993 * t;
    let longitude = L % 360;
    if (longitude < 0) longitude += 360;
    return longitude;
  }

  // Calculate Mercury longitude (simplified)
  private calculateMercuryLongitude(jd: number): number {
    const t = (jd - 2451545.0) / 36525;
    const L = 252.251 + 149472.6746 * t;
    let longitude = L % 360;
    if (longitude < 0) longitude += 360;
    return longitude;
  }

  // Calculate Jupiter longitude (simplified)
  private calculateJupiterLongitude(jd: number): number {
    const t = (jd - 2451545.0) / 36525;
    const L = 34.351 + 3034.9057 * t;
    let longitude = L % 360;
    if (longitude < 0) longitude += 360;
    return longitude;
  }

  // Calculate Venus longitude (simplified)
  private calculateVenusLongitude(jd: number): number {
    const t = (jd - 2451545.0) / 36525;
    const L = 181.979 + 58517.8156 * t;
    let longitude = L % 360;
    if (longitude < 0) longitude += 360;
    return longitude;
  }

  // Calculate Saturn longitude (simplified)
  private calculateSaturnLongitude(jd: number): number {
    const t = (jd - 2451545.0) / 36525;
    const L = 50.077 + 1222.1138 * t;
    let longitude = L % 360;
    if (longitude < 0) longitude += 360;
    return longitude;
  }

  // Check if planets are retrograde (simplified)
  private isMarsRetrograde(jd: number): boolean {
    const t = (jd - 2451545.0) / 36525;
    return Math.sin(t * 2 * Math.PI * 0.53) > 0.8;
  }

  private isMercuryRetrograde(jd: number): boolean {
    const t = (jd - 2451545.0) / 36525;
    return Math.sin(t * 2 * Math.PI * 3.2) > 0.9;
  }

  private isJupiterRetrograde(jd: number): boolean {
    const t = (jd - 2451545.0) / 36525;
    return Math.sin(t * 2 * Math.PI * 0.083) > 0.7;
  }

  private isVenusRetrograde(jd: number): boolean {
    const t = (jd - 2451545.0) / 36525;
    return Math.sin(t * 2 * Math.PI * 1.6) > 0.85;
  }

  private isSaturnRetrograde(jd: number): boolean {
    const t = (jd - 2451545.0) / 36525;
    return Math.sin(t * 2 * Math.PI * 0.033) > 0.65;
  }

  // Analyze planetary influences for a zodiac sign
  private analyzePlanetaryInfluences(signIndex: number, positions: PlanetaryPosition[], language: 'english' | 'hindi' = 'english'): string[] {
    const influences: string[] = [];
    const signLord = this.rashiLords[signIndex];

    positions.forEach(planet => {
      // Check if planet is in the sign
      if (planet.sign === signIndex) {
        influences.push(language === 'hindi' ? 
          `${planet.planet} आपकी राशि में ${this.getPlanetInfluence(planet.planet, 'own', language)} लाता है` :
          `${planet.planet} in your sign brings ${this.getPlanetInfluence(planet.planet, 'own')}`);
      }
      
      // Check aspects (simplified - 7th house aspect)
      const aspectSign = (planet.sign + 6) % 12;
      if (aspectSign === signIndex) {
        influences.push(language === 'hindi' ? 
          `${planet.planet} आपकी राशि को देख रहा है, जो ${this.getPlanetInfluence(planet.planet, 'aspect', language)} लाता है` :
          `${planet.planet} aspects your sign, bringing ${this.getPlanetInfluence(planet.planet, 'aspect')}`);
      }

      // Check if it's the sign lord
      if (planet.planet === signLord) {
        influences.push(language === 'hindi' ? 
          `आपका स्वामी ग्रह ${planet.planet} ${this.getPlanetStrength(planet, language)} है` :
          `Your ruling planet ${planet.planet} is ${this.getPlanetStrength(planet)}`);
      }

      // Check retrograde effects
      if (planet.retrograde && (planet.sign === signIndex || aspectSign === signIndex)) {
        influences.push(language === 'hindi' ? 
          `${planet.planet} वक्री ${this.getPlanetDomain(planet.planet, language)} में आत्मनिरीक्षण और समीक्षा लाता है` :
          `${planet.planet} retrograde brings introspection and review in ${this.getPlanetDomain(planet.planet)}`);
      }
    });

    return influences.slice(0, 3); // Limit to top 3 influences
  }

  private getPlanetInfluence(planet: string, type: 'own' | 'aspect', language: 'english' | 'hindi' = 'english'): string {
    const influences = {
      'Sun': { 
        own: language === 'hindi' ? 'आत्मविश्वास और नेतृत्व' : 'confidence and leadership', 
        aspect: language === 'hindi' ? 'जीवन शक्ति और मान्यता' : 'vitality and recognition' 
      },
      'Moon': { 
        own: language === 'hindi' ? 'भावनात्मक गहराई और अंतर्ज्ञान' : 'emotional depth and intuition', 
        aspect: language === 'hindi' ? 'मानसिक शांति और आराम' : 'mental peace and comfort' 
      },
      'Mars': { 
        own: language === 'hindi' ? 'ऊर्जा और साहस' : 'energy and courage', 
        aspect: language === 'hindi' ? 'प्रेरणा और कार्य' : 'motivation and action' 
      },
      'Mercury': { 
        own: language === 'hindi' ? 'संचार और बुद्धि' : 'communication and intellect', 
        aspect: language === 'hindi' ? 'विश्लेषणात्मक सोच' : 'analytical thinking' 
      },
      'Jupiter': { 
        own: language === 'hindi' ? 'ज्ञान और विस्तार' : 'wisdom and expansion', 
        aspect: language === 'hindi' ? 'अच्छा भाग्य और मार्गदर्शन' : 'good fortune and guidance' 
      },
      'Venus': { 
        own: language === 'hindi' ? 'प्रेम और सद्भाव' : 'love and harmony', 
        aspect: language === 'hindi' ? 'सौंदर्य और संबंध' : 'beauty and relationships' 
      },
      'Saturn': { 
        own: language === 'hindi' ? 'अनुशासन और संरचना' : 'discipline and structure', 
        aspect: language === 'hindi' ? 'जिम्मेदारी और सबक' : 'responsibility and lessons' 
      }
    };

    return influences[planet as keyof typeof influences]?.[type] || (language === 'hindi' ? 'सकारात्मक ऊर्जा' : 'positive energy');
  }

  private getPlanetStrength(planet: PlanetaryPosition, language: 'english' | 'hindi' = 'english'): string {
    // Simplified strength calculation based on degree
    if (planet.degree < 5 || planet.degree > 25) {
      return language === 'hindi' ? 'संक्रमण चरण में' : 'in a transitional phase';
    } else if (planet.degree >= 10 && planet.degree <= 20) {
      return language === 'hindi' ? 'मजबूत स्थिति में' : 'strongly positioned';
    } else {
      return language === 'hindi' ? 'मध्यम स्थिति में' : 'moderately positioned';
    }
  }

  private getPlanetDomain(planet: string, language: 'english' | 'hindi' = 'english'): string {
    const domains = {
      'Sun': language === 'hindi' ? 'कैरियर और आत्म-अभिव्यक्ति' : 'career and self-expression',
      'Moon': language === 'hindi' ? 'भावनाएं और घरेलू जीवन' : 'emotions and home life',
      'Mars': language === 'hindi' ? 'कार्य और संबंध' : 'action and relationships',
      'Mercury': language === 'hindi' ? 'संचार और यात्रा' : 'communication and travel',
      'Jupiter': language === 'hindi' ? 'ज्ञान और आध्यात्मिकता' : 'wisdom and spirituality',
      'Venus': language === 'hindi' ? 'प्रेम और रचनात्मकता' : 'love and creativity',
      'Saturn': language === 'hindi' ? 'काम और जिम्मेदारियां' : 'work and responsibilities'
    };

    return domains[planet as keyof typeof domains] || (language === 'hindi' ? 'जीवन के मामले' : 'life matters');
  }

  // Generate comprehensive horoscope
  public generateHoroscope(sign: string, date: Date, period: 'daily' | 'weekly' | 'monthly' | 'yearly', language: 'english' | 'hindi' = 'english'): HoroscopeData {
    const signIndex = this.zodiacSigns.indexOf(sign);
    const positions = this.calculatePlanetaryPositions(date);
    const influences = this.analyzePlanetaryInfluences(signIndex, positions, language);

    // Generate horoscope text based on planetary influences
    const horoscopeText = this.generateHoroscopeText(sign, period, influences, positions, language);
    
    // Calculate lucky elements based on planetary positions
    const luckyElements = this.calculateLuckyElements(signIndex, positions);

    return {
      sign,
      date: date.toISOString().split('T')[0],
      period,
      horoscope: horoscopeText,
      luckyNumber: luckyElements.number,
      luckyTime: luckyElements.time,
      luckyColor: luckyElements.color,
      compatibility: this.getCompatibleSign(signIndex, positions),
      mood: this.calculateMood(signIndex, positions, language),
      planetaryInfluences: influences,
      remedies: this.generateRemedies(signIndex, positions, language)
    };
  }

  private generateHoroscopeText(sign: string, period: string, influences: string[], positions: PlanetaryPosition[], language: 'english' | 'hindi' = 'english'): string {
    const signHindiNames = {
      'Aries': 'मेष', 'Taurus': 'वृषभ', 'Gemini': 'मिथुन', 'Cancer': 'कर्क',
      'Leo': 'सिंह', 'Virgo': 'कन्या', 'Libra': 'तुला', 'Scorpio': 'वृश्चिक',
      'Sagittarius': 'धनु', 'Capricorn': 'मकर', 'Aquarius': 'कुम्भ', 'Pisces': 'मीन'
    };

    const signName = language === 'hindi' ? signHindiNames[sign as keyof typeof signHindiNames] || sign : sign;

    const periodTexts = {
      daily: language === 'hindi' ? [
        `आज ${signName} राशि के लिए ग्रहीय ऊर्जा महत्वपूर्ण है। `,
        `आज का ग्रहीय संयोग ${signName} राशि के अनुकूल है `,
        `${signName} राशि के लिए आज सकारात्मक विकास की उम्मीद है `,
        `आज का तारा संयोग ${signName} राशि के लिए शुभ है, जो लाता है `
      ] : [
        `Today brings significant planetary energy for ${sign}. `,
        `The cosmic alignments favor ${sign} today with `,
        `${sign} can expect positive developments as `,
        `The stars align favorably for ${sign} today, bringing `
      ],
      weekly: language === 'hindi' ? [
        `इस सप्ताह ${signName} राशि के लिए उत्कृष्ट अवसर हैं। `,
        `इस सप्ताह के ग्रहीय गतिविधियां ${signName} राशि का समर्थन करती हैं `,
        `${signName} राशि को इस सप्ताह विशेष रूप से लाभकारी मिलेगा `,
        `इस सप्ताह की ब्रह्मांडीय ऊर्जा ${signName} राशि को प्रोत्साहित करती है `
      ] : [
        `This week presents excellent opportunities for ${sign}. `,
        `The planetary movements this week support ${sign} in `,
        `${sign} will find this week particularly beneficial for `,
        `The cosmic energies this week encourage ${sign} to `
      ],
      monthly: language === 'hindi' ? [
        `इस महीने ${signName} राशि के लिए बड़ा वादा है। `,
        `मासिक ग्रहीय चक्र ${signName} राशि को लाता है `,
        `${signName} राशि एक महीने की उम्मीद कर सकती है `,
        `इस महीने के ब्रह्मांडीय प्रभाव ${signName} राशि को मार्गदर्शन करते हैं `
      ] : [
        `This month holds great promise for ${sign}. `,
        `The monthly planetary cycle brings ${sign} `,
        `${sign} can look forward to a month of `,
        `The cosmic influences this month guide ${sign} toward `
      ],
      yearly: language === 'hindi' ? [
        `यह वर्ष ${signName} राशि के लिए एक महत्वपूर्ण चरण है। `,
        `वार्षिक ग्रहीय चक्र ${signName} राशि को लाते हैं `,
        `${signName} राशि एक परिवर्तनकारी वर्ष की उम्मीद कर सकती है `,
        `वार्षिक ब्रह्मांडीय पैटर्न इंगित करते हैं कि ${signName} राशि अनुभव करेगी `
      ] : [
        `This year marks a significant phase for ${sign}. `,
        `The annual planetary cycles bring ${sign} `,
        `${sign} can expect a transformative year with `,
        `The yearly cosmic patterns indicate ${sign} will experience `
      ]
    };

    const baseText = periodTexts[period as keyof typeof periodTexts][Math.floor(Math.random() * periodTexts[period as keyof typeof periodTexts].length)];
    
    // Add planetary influence
    let influenceText = '';
    if (influences.length > 0) {
      influenceText = influences[0] + '. ';
    }

    // Add period-specific guidance
    const guidanceTexts = {
      daily: language === 'hindi' ? 'नई शुरुआत पर ध्यान दें और अपनी अंतर्ज्ञान पर भरोसा करें।' : 'Focus on new beginnings and trust your intuition.',
      weekly: language === 'hindi' ? 'विकास और सकारात्मक परिवर्तन के अवसरों को अपनाएं।' : 'Embrace opportunities for growth and positive change.',
      monthly: language === 'hindi' ? 'दीर्घकालिक योजना और संबंध निर्माण फायदेमंद होगा।' : 'Long-term planning and relationship building will be rewarding.',
      yearly: language === 'hindi' ? 'प्रमुख जीवन परिवर्तन और आध्यात्मिक विकास पर प्रकाश डाला गया है।' : 'Major life transitions and spiritual growth are highlighted.'
    };

    return baseText + influenceText + guidanceTexts[period as keyof typeof guidanceTexts];
  }

  private calculateLuckyElements(signIndex: number, positions: PlanetaryPosition[]): { number: number, time: string, color: string } {
    // Calculate based on planetary positions
    const sunPosition = positions.find(p => p.planet === 'Sun');
    const moonPosition = positions.find(p => p.planet === 'Moon');
    const signLord = this.rashiLords[signIndex];
    const rulingPlanet = positions.find(p => p.planet === signLord);

    const luckyNumber = Math.floor(((sunPosition?.degree || 0) + (moonPosition?.degree || 0) + signIndex * 3) % 9 + 1);
    
    // More personalized lucky time calculation using multiple factors
    const baseHour = Math.floor((sunPosition?.degree || 0) / 15) + 6;
    const moonHour = Math.floor((moonPosition?.degree || 0) / 15) + 6;
    const rulingHour = rulingPlanet ? Math.floor((rulingPlanet.degree || 0) / 15) + 6 : baseHour;
    
    // Combine different planetary influences for more variety
    const combinedHour = Math.floor((baseHour + moonHour + rulingHour + signIndex * 2) / 3) % 12;
    const finalHour = combinedHour === 0 ? 12 : combinedHour;
    
    // Calculate minutes based on multiple planetary positions
    const sunMinutes = Math.floor((sunPosition?.degree || 0) % 15 * 4);
    const moonMinutes = Math.floor((moonPosition?.degree || 0) % 15 * 4);
    const rulingMinutes = rulingPlanet ? Math.floor((rulingPlanet.degree || 0) % 15 * 4) : sunMinutes;
    
    const combinedMinutes = Math.floor((sunMinutes + moonMinutes + rulingMinutes + signIndex * 5) / 3) % 60;
    
    const luckyTime = `${finalHour}:${combinedMinutes.toString().padStart(2, '0')} ${finalHour >= 12 ? 'PM' : 'AM'}`;

    // More personalized color based on sign and ruling planet
    const colors = ['Red', 'Orange', 'Yellow', 'Green', 'Blue', 'Indigo', 'Violet', 'Gold', 'Silver', 'Pink', 'Purple', 'Turquoise'];
    const colorIndex = (Math.floor((sunPosition?.longitude || 0) / 30) + Math.floor((moonPosition?.longitude || 0) / 30) + signIndex) % colors.length;
    const luckyColor = colors[colorIndex];

    return { number: luckyNumber, time: luckyTime, color: luckyColor };
  }

  private getCompatibleSign(signIndex: number, positions: PlanetaryPosition[]): string {
    // Venus position influences compatibility
    const venusPosition = positions.find(p => p.planet === 'Venus');
    const venusSign = venusPosition?.sign || 0;
    
    // Compatible signs based on elements and Venus position
    const compatibilityMap = [
      [4, 8, 2, 10], [5, 9, 0, 6], [6, 10, 1, 7], [7, 11, 2, 8],
      [8, 0, 3, 9], [9, 1, 4, 10], [10, 2, 5, 11], [11, 3, 6, 0],
      [0, 4, 7, 1], [1, 5, 8, 2], [2, 6, 9, 3], [3, 7, 10, 4]
    ];
    
    const compatibleIndex = compatibilityMap[signIndex][(venusSign + signIndex) % 4];
    return this.zodiacSigns[compatibleIndex];
  }

  private calculateMood(signIndex: number, positions: PlanetaryPosition[], language: 'english' | 'hindi' = 'english'): string {
    const moonPosition = positions.find(p => p.planet === 'Moon');
    const moonSign = moonPosition?.sign || 0;
    
    const moodDistance = Math.abs(moonSign - signIndex);
    
    if (moodDistance <= 1 || moodDistance >= 11) return language === 'hindi' ? 'आशावादी' : 'Optimistic';
    if (moodDistance <= 3 || moodDistance >= 9) return language === 'hindi' ? 'संतुलित' : 'Balanced';
    if (moodDistance <= 5 || moodDistance >= 7) return language === 'hindi' ? 'चिंतनशील' : 'Contemplative';
    return language === 'hindi' ? 'ऊर्जावान' : 'Energetic';
  }

  private generateRemedies(signIndex: number, positions: PlanetaryPosition[], language: 'english' | 'hindi' = 'english'): string[] {
    const remedies: string[] = [];
    const signLord = this.rashiLords[signIndex];
    
    // General remedies based on sign
    const signRemedies = language === 'hindi' ? [
      ['लाल मूंगा पहनें', 'मंगल मंत्र का जाप करें', 'नियमित व्यायाम करें'],
      ['सफेद मोती पहनें', 'ध्यान का अभ्यास करें', 'प्रकृति से जुड़ें'],
      ['हरा पन्ना पहनें', 'आध्यात्मिक पुस्तकें पढ़ें', 'संचार का अभ्यास करें'],
      ['प्राकृतिक मोती पहनें', 'अपनी मां का सम्मान करें', 'भावनात्मक उपचार का अभ्यास करें'],
      ['माणिक रत्न पहनें', 'नेतृत्व का अभ्यास करें', 'सूर्य का सम्मान करें'],
      ['पन्ना पत्थर पहनें', 'दूसरों की सेवा करें', 'सकारात्मक पूर्णतावाद का अभ्यास करें'],
      ['हीरा पहनें', 'सद्भाव बनाएं', 'कूटनीति का अभ्यास करें'],
      ['लाल मूंगा पहनें', 'परिवर्तन का अभ्यास करें', 'अपनी अंतर्ज्ञान का सम्मान करें'],
      ['पीला नीलम पहनें', 'यात्रा और खोज करें', 'आशावाद का अभ्यास करें'],
      ['नीला नीलम पहनें', 'अनुशासन का अभ्यास करें', 'शनि का सम्मान करें'],
      ['नीला नीलम पहनें', 'मानवता की सेवा करें', 'नवाचार का अभ्यास करें'],
      ['पीला नीलम पहनें', 'करुणा का अभ्यास करें', 'बृहस्पति का सम्मान करें']
    ] : [
      ['Wear red coral', 'Chant Mars mantras', 'Exercise regularly'],
      ['Wear white pearl', 'Practice meditation', 'Connect with nature'],
      ['Wear green emerald', 'Read spiritual books', 'Practice communication'],
      ['Wear natural pearl', 'Honor your mother', 'Practice emotional healing'],
      ['Wear ruby gemstone', 'Practice leadership', 'Honor the Sun'],
      ['Wear emerald stone', 'Serve others', 'Practice perfectionism positively'],
      ['Wear diamond', 'Create harmony', 'Practice diplomacy'],
      ['Wear red coral', 'Practice transformation', 'Honor your intuition'],
      ['Wear yellow sapphire', 'Travel and explore', 'Practice optimism'],
      ['Wear blue sapphire', 'Practice discipline', 'Honor Saturn'],
      ['Wear blue sapphire', 'Serve humanity', 'Practice innovation'],
      ['Wear yellow sapphire', 'Practice compassion', 'Honor Jupiter']
    ];

    remedies.push(...signRemedies[signIndex].slice(0, 2));

    // Add remedy based on planetary positions
    positions.forEach(planet => {
      if (planet.retrograde) {
        remedies.push(language === 'hindi' ? 
          `${planet.planet} वक्री प्रभावों का मुकाबला करने के लिए ${planet.planet} मंत्र का जाप करें` :
          `Chant ${planet.planet} mantras to counter retrograde effects`);
      }
    });

    return remedies.slice(0, 3);
  }
}

export default AstronomicalHoroscopeGenerator;
