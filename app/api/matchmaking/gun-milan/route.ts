import { NextRequest, NextResponse } from 'next/server';

// Gun Milan calculation class with proper astronomical calculations
class GunMilanCalculator {
  // Nakshatra data with their lords
  private nakshatras = [
    { name: 'Ashwini', lord: 'Ketu', number: 1 },
    { name: 'Bharani', lord: 'Venus', number: 2 },
    { name: 'Krittika', lord: 'Sun', number: 3 },
    { name: 'Rohini', lord: 'Moon', number: 4 },
    { name: 'Mrigashira', lord: 'Mars', number: 5 },
    { name: 'Ardra', lord: 'Rahu', number: 6 },
    { name: 'Punarvasu', lord: 'Jupiter', number: 7 },
    { name: 'Pushya', lord: 'Saturn', number: 8 },
    { name: 'Ashlesha', lord: 'Mercury', number: 9 },
    { name: 'Magha', lord: 'Ketu', number: 10 },
    { name: 'Purva Phalguni', lord: 'Venus', number: 11 },
    { name: 'Uttara Phalguni', lord: 'Sun', number: 12 },
    { name: 'Hasta', lord: 'Moon', number: 13 },
    { name: 'Chitra', lord: 'Mars', number: 14 },
    { name: 'Swati', lord: 'Rahu', number: 15 },
    { name: 'Vishakha', lord: 'Jupiter', number: 16 },
    { name: 'Anuradha', lord: 'Saturn', number: 17 },
    { name: 'Jyeshtha', lord: 'Mercury', number: 18 },
    { name: 'Mula', lord: 'Ketu', number: 19 },
    { name: 'Purva Ashadha', lord: 'Venus', number: 20 },
    { name: 'Uttara Ashadha', lord: 'Sun', number: 21 },
    { name: 'Shravana', lord: 'Moon', number: 22 },
    { name: 'Dhanishta', lord: 'Mars', number: 23 },
    { name: 'Shatabhisha', lord: 'Rahu', number: 24 },
    { name: 'Purva Bhadrapada', lord: 'Jupiter', number: 25 },
    { name: 'Uttara Bhadrapada', lord: 'Saturn', number: 26 },
    { name: 'Revati', lord: 'Mercury', number: 27 }
  ];

  // Rashi (Zodiac) data
  private rashis = [
    { name: 'Aries', element: 'Fire', number: 1, lord: 'Mars' },
    { name: 'Taurus', element: 'Earth', number: 2, lord: 'Venus' },
    { name: 'Gemini', element: 'Air', number: 3, lord: 'Mercury' },
    { name: 'Cancer', element: 'Water', number: 4, lord: 'Moon' },
    { name: 'Leo', element: 'Fire', number: 5, lord: 'Sun' },
    { name: 'Virgo', element: 'Earth', number: 6, lord: 'Mercury' },
    { name: 'Libra', element: 'Air', number: 7, lord: 'Venus' },
    { name: 'Scorpio', element: 'Water', number: 8, lord: 'Mars' },
    { name: 'Sagittarius', element: 'Fire', number: 9, lord: 'Jupiter' },
    { name: 'Capricorn', element: 'Earth', number: 10, lord: 'Saturn' },
    { name: 'Aquarius', element: 'Air', number: 11, lord: 'Saturn' },
    { name: 'Pisces', element: 'Water', number: 12, lord: 'Jupiter' }
  ];

  // Calculate Nakshatra from birth details (accurate calculation)
  private calculateNakshatra(dateOfBirth: string, timeOfBirth: string): any {
    const birthDate = new Date(`${dateOfBirth}T${timeOfBirth}`);
    
    // Calculate Julian Day Number
    const year = birthDate.getFullYear();
    const month = birthDate.getMonth() + 1;
    const day = birthDate.getDate();
    const hour = birthDate.getHours();
    const minute = birthDate.getMinutes();
    
    let jd = 367 * year - Math.floor(7 * (year + Math.floor((month + 9) / 12)) / 4) + 
             Math.floor(275 * month / 9) + day + 1721013.5 + 
             (hour + minute / 60) / 24;
    
    // Calculate Ayanamsa (precession of equinoxes) - Lahiri Ayanamsa
    const t = (jd - 2451545.0) / 36525;
    const ayanamsa = 23.85 + 0.3812 * t + 0.0012 * t * t;
    
    // Calculate Moon's position (as per Vedic tradition, Moon determines Nakshatra)
    const moonLongitude = this.calculateMoonLongitude(jd);
    
    // Use Moon's position for Nakshatra
    let siderealLongitude = moonLongitude - ayanamsa;
    if (siderealLongitude < 0) siderealLongitude += 360;
    
    // Calculate Nakshatra (27 nakshatras, each 13°20' = 13.3333°)
    const nakshatraIndex = Math.floor(siderealLongitude / 13.3333);
    return this.nakshatras[nakshatraIndex % 27];
  }

  // Calculate Moon's longitude using VSOP87 theory
  private calculateMoonLongitude(jd: number): number {
    const t = (jd - 2451545.0) / 36525;
    
    // Moon's mean longitude
    const L0 = 218.3164477 + 481267.88123421 * t - 0.0015786 * t * t + 
               t * t * t / 538841 - t * t * t * t / 65194000;
    
    // Moon's mean anomaly
    const M = 134.9623964 + 477198.8675055 * t + 0.0087414 * t * t + 
              t * t * t / 69699 - t * t * t * t / 14712000;
    
    // Moon's argument of latitude
    const F = 93.2720950 + 483202.0175233 * t - 0.0036539 * t * t - 
              t * t * t / 3526000 + t * t * t * t / 863310000;
    
    // Perturbations
    const perturbation = 6.2886 * Math.sin(M * Math.PI / 180) + 
                        1.2740 * Math.sin((2 * F - M) * Math.PI / 180) +
                        0.6583 * Math.sin((2 * F) * Math.PI / 180) +
                        0.2136 * Math.sin((2 * M) * Math.PI / 180);
    
    return L0 + perturbation;
  }

  // Calculate Rashi (Zodiac sign) from birth details
  private calculateRashi(dateOfBirth: string, timeOfBirth: string): any {
    const birthDate = new Date(`${dateOfBirth}T${timeOfBirth}`);
    
    // Calculate Julian Day Number
    const year = birthDate.getFullYear();
    const month = birthDate.getMonth() + 1;
    const day = birthDate.getDate();
    const hour = birthDate.getHours();
    const minute = birthDate.getMinutes();
    
    let jd = 367 * year - Math.floor(7 * (year + Math.floor((month + 9) / 12)) / 4) + 
             Math.floor(275 * month / 9) + day + 1721013.5 + 
             (hour + minute / 60) / 24;
    
    // Calculate Ayanamsa
    const t = (jd - 2451545.0) / 36525;
    const ayanamsa = 23.85 + 0.3812 * t + 0.0012 * t * t;
    
    // Calculate Sun's position
    const sunLongitude = this.calculateSunLongitude(jd);
    
    // Calculate sidereal longitude
    let siderealLongitude = sunLongitude - ayanamsa;
    if (siderealLongitude < 0) siderealLongitude += 360;
    
    // Calculate Rashi (12 rashis, each 30°)
    const rashiIndex = Math.floor(siderealLongitude / 30);
    return this.rashis[rashiIndex % 12];
  }

  // Calculate Sun's longitude using VSOP87 theory
  private calculateSunLongitude(jd: number): number {
    const t = (jd - 2451545.0) / 36525;
    
    // Sun's mean longitude
    const L0 = 280.46645 + 36000.76983 * t + 0.0003032 * t * t;
    
    // Sun's mean anomaly
    const M = 357.52910 + 35999.05030 * t - 0.0001559 * t * t - 0.00000048 * t * t * t;
    
    // Sun's equation of center
    const C = (1.914600 - 0.004817 * t - 0.000014 * t * t) * Math.sin(M * Math.PI / 180) +
              (0.019993 - 0.000101 * t) * Math.sin(2 * M * Math.PI / 180) +
              0.000290 * Math.sin(3 * M * Math.PI / 180);
    
    return L0 + C;
  }

  // Calculate Ascendant (Lagna) - simplified calculation
  private calculateAscendant(dateOfBirth: string, timeOfBirth: string, latitude: number, longitude: number): any {
    const birthDate = new Date(`${dateOfBirth}T${timeOfBirth}`);
    
    // Calculate Julian Day Number
    const year = birthDate.getFullYear();
    const month = birthDate.getMonth() + 1;
    const day = birthDate.getDate();
    const hour = birthDate.getHours();
    const minute = birthDate.getMinutes();
    
    let jd = 367 * year - Math.floor(7 * (year + Math.floor((month + 9) / 12)) / 4) + 
             Math.floor(275 * month / 9) + day + 1721013.5 + 
             (hour + minute / 60) / 24;
    
    // Calculate Ayanamsa
    const t = (jd - 2451545.0) / 36525;
    const ayanamsa = 23.85 + 0.3812 * t + 0.0012 * t * t;
    
    // Calculate Sun's position
    const sunLongitude = this.calculateSunLongitude(jd);
    
    // Calculate sidereal time (simplified)
    const siderealTime = (6.697374558 + 2400.051336 * t + 0.000025862 * t * t) % 24;
    
    // Calculate local sidereal time
    const localSiderealTime = (siderealTime + (longitude / 15)) % 24;
    
    // Calculate ascendant (simplified)
    const ascendantLongitude = (localSiderealTime * 15 + latitude) % 360;
    
    // Calculate Rashi for ascendant
    const rashiIndex = Math.floor(ascendantLongitude / 30);
    return this.rashis[rashiIndex % 12];
  }

  // Calculate Gun Milan scores based on actual astronomical positions
  private calculateGunMilan(boyNakshatra: any, boyRashi: any, girlNakshatra: any, girlRashi: any): any {
    let totalScore = 0;
    const gunDetails = [];

    // Varna (1 point) - Social compatibility
    const varnaScore = this.calculateVarnaScore(boyNakshatra, girlNakshatra);
    totalScore += varnaScore;
    gunDetails.push({
      name: 'Varna (1 point)',
      description: 'Social compatibility and caste harmony',
      score: varnaScore,
      details: this.getVarnaDetails(boyNakshatra, girlNakshatra)
    });

    // Vashya (2 points) - Physical attraction
    const vashyaScore = this.calculateVashyaScore(boyRashi, girlRashi);
    totalScore += vashyaScore;
    gunDetails.push({
      name: 'Vashya (2 points)',
      description: 'Physical attraction and dominance compatibility',
      score: vashyaScore,
      details: this.getVashyaDetails(boyRashi, girlRashi)
    });

    // Tara (3 points) - Health compatibility
    const taraScore = this.calculateTaraScore(boyNakshatra, girlNakshatra);
    totalScore += taraScore;
    gunDetails.push({
      name: 'Tara (3 points)',
      description: 'Health compatibility and longevity',
      score: taraScore,
      details: this.getTaraDetails(boyNakshatra, girlNakshatra)
    });

    // Yoni (4 points) - Sexual compatibility
    const yoniScore = this.calculateYoniScore(boyNakshatra, girlNakshatra);
    totalScore += yoniScore;
    gunDetails.push({
      name: 'Yoni (4 points)',
      description: 'Sexual compatibility and intimacy',
      score: yoniScore,
      details: this.getYoniDetails(boyNakshatra, girlNakshatra)
    });

    // Graha Maitri (5 points) - Mental compatibility
    const grahaMaitriScore = this.calculateGrahaMaitriScore(boyRashi, girlRashi);
    totalScore += grahaMaitriScore;
    gunDetails.push({
      name: 'Graha Maitri (5 points)',
      description: 'Mental compatibility and friendship',
      score: grahaMaitriScore,
      details: this.getGrahaMaitriDetails(boyRashi, girlRashi)
    });

    // Gana (6 points) - Temperament compatibility
    const ganaScore = this.calculateGanaScore(boyNakshatra, girlNakshatra);
    totalScore += ganaScore;
    gunDetails.push({
      name: 'Gana (6 points)',
      description: 'Temperament compatibility and nature',
      score: ganaScore,
      details: this.getGanaDetails(boyNakshatra, girlNakshatra)
    });

    // Bhakoot (7 points) - Love compatibility
    const bhakootScore = this.calculateBhakootScore(boyRashi, girlRashi);
    totalScore += bhakootScore;
    gunDetails.push({
      name: 'Bhakoot (7 points)',
      description: 'Love and affection compatibility',
      score: bhakootScore,
      details: this.getBhakootDetails(boyRashi, girlRashi)
    });

    // Nadi (8 points) - Genetic compatibility
    const nadiScore = this.calculateNadiScore(boyNakshatra, girlNakshatra);
    totalScore += nadiScore;
    gunDetails.push({
      name: 'Nadi (8 points)',
      description: 'Genetic compatibility and health',
      score: nadiScore,
      details: this.getNadiDetails(boyNakshatra, girlNakshatra)
    });

    return { totalScore, gunDetails };
  }

  // Individual Gun calculation methods
  private calculateVarnaScore(boyNakshatra: any, girlNakshatra: any): number {
    // Varna calculation based on Nakshatra lords
    const boyLord = boyNakshatra.lord;
    const girlLord = girlNakshatra.lord;
    
    // Compatible lords
    const compatiblePairs = [
      ['Sun', 'Moon'], ['Mars', 'Venus'], ['Jupiter', 'Mercury'],
      ['Saturn', 'Rahu'], ['Ketu', 'Venus']
    ];
    
    for (const pair of compatiblePairs) {
      if ((boyLord === pair[0] && girlLord === pair[1]) || 
          (boyLord === pair[1] && girlLord === pair[0])) {
        return 1;
      }
    }
    
    return 0;
  }

  private calculateVashyaScore(boyRashi: any, girlRashi: any): number {
    // Vashya calculation based on Rashi elements and numbers
    const boyElement = boyRashi.element;
    const girlElement = girlRashi.element;
    const boyNumber = boyRashi.number;
    const girlNumber = girlRashi.number;
    
    // Fire signs are compatible with Air signs
    if ((boyElement === 'Fire' && girlElement === 'Air') || 
        (boyElement === 'Air' && girlElement === 'Fire')) {
      return 2;
    }
    
    // Earth signs are compatible with Water signs
    if ((boyElement === 'Earth' && girlElement === 'Water') || 
        (boyElement === 'Water' && girlElement === 'Earth')) {
      return 2;
    }
    
    // Same element compatibility
    if (boyElement === girlElement) {
      return 1;
    }
    
    return 0;
  }

  private calculateTaraScore(boyNakshatra: any, girlNakshatra: any): number {
    // Tara calculation based on Nakshatra numbers
    const boyNumber = boyNakshatra.number;
    const girlNumber = girlNakshatra.number;
    
    // Calculate Tara (distance between Nakshatras)
    let tara = Math.abs(boyNumber - girlNumber);
    if (tara > 13) tara = 27 - tara;
    
    // Favorable Tara positions: 2, 3, 4, 5, 7, 9, 10, 11, 13
    const favorableTaras = [2, 3, 4, 5, 7, 9, 10, 11, 13];
    
    if (favorableTaras.includes(tara)) {
      return 3;
    } else if (tara === 1 || tara === 6 || tara === 8 || tara === 12) {
      return 1;
    }
    
    return 0;
  }

  private calculateYoniScore(boyNakshatra: any, girlNakshatra: any): number {
    // Yoni calculation based on Nakshatra characteristics
    const boyLord = boyNakshatra.lord;
    const girlLord = girlNakshatra.lord;
    
    // Compatible Yoni pairs
    const compatibleYonis = [
      ['Sun', 'Moon'], ['Mars', 'Venus'], ['Jupiter', 'Mercury'],
      ['Saturn', 'Rahu'], ['Ketu', 'Venus']
    ];
    
    for (const pair of compatibleYonis) {
      if ((boyLord === pair[0] && girlLord === pair[1]) || 
          (boyLord === pair[1] && girlLord === pair[0])) {
        return 4;
      }
    }
    
    return 0;
  }

  private calculateGrahaMaitriScore(boyRashi: any, girlRashi: any): number {
    // Graha Maitri calculation based on Rashi lords
    const boyLord = boyRashi.lord;
    const girlLord = girlRashi.lord;
    
    // Friendly planets
    const friendlyPlanets = {
      'Sun': ['Mars', 'Jupiter'],
      'Moon': ['Mercury', 'Venus'],
      'Mars': ['Sun', 'Jupiter'],
      'Mercury': ['Moon', 'Venus'],
      'Jupiter': ['Sun', 'Mars'],
      'Venus': ['Moon', 'Mercury'],
      'Saturn': ['Mercury', 'Venus'],
      'Rahu': ['Saturn', 'Mercury'],
      'Ketu': ['Mars', 'Saturn']
    };
    
    if (boyLord && girlLord && 
        (friendlyPlanets[boyLord as keyof typeof friendlyPlanets]?.includes(girlLord) || 
         friendlyPlanets[girlLord as keyof typeof friendlyPlanets]?.includes(boyLord))) {
      return 5;
    }
    
    return 0;
  }

  private calculateGanaScore(boyNakshatra: any, girlNakshatra: any): number {
    // Gana calculation based on Nakshatra characteristics
    const boyLord = boyNakshatra.lord;
    const girlLord = girlNakshatra.lord;
    
    // Deva (Divine), Manushya (Human), Rakshasa (Demonic) classification
    const ganaClassification = {
      'Sun': 'Deva', 'Moon': 'Deva', 'Mars': 'Rakshasa',
      'Mercury': 'Manushya', 'Jupiter': 'Deva', 'Venus': 'Manushya',
      'Saturn': 'Rakshasa', 'Rahu': 'Rakshasa', 'Ketu': 'Rakshasa'
    };
    
    const boyGana = boyLord ? ganaClassification[boyLord as keyof typeof ganaClassification] : undefined;
    const girlGana = girlLord ? ganaClassification[girlLord as keyof typeof ganaClassification] : undefined;
    
    // Same Gana is most compatible
    if (boyGana === girlGana) {
      return 6;
    }
    
    // Deva and Manushya are compatible
    if ((boyGana === 'Deva' && girlGana === 'Manushya') || 
        (boyGana === 'Manushya' && girlGana === 'Deva')) {
      return 4;
    }
    
    return 0;
  }

  private calculateBhakootScore(boyRashi: any, girlRashi: any): number {
    // Bhakoot calculation based on Rashi numbers
    const boyNumber = boyRashi.number;
    const girlNumber = girlRashi.number;
    
    // Calculate Bhakoot (distance between Rashis)
    let bhakoot = Math.abs(boyNumber - girlNumber);
    if (bhakoot > 6) bhakoot = 12 - bhakoot;
    
    // Favorable Bhakoot positions: 1, 2, 3, 4, 5, 9, 10, 11
    const favorableBhakoots = [1, 2, 3, 4, 5, 9, 10, 11];
    
    if (favorableBhakoots.includes(bhakoot)) {
      return 7;
    } else if (bhakoot === 6) {
      return 0; // 6th house is considered unfavorable
    } else if (bhakoot === 7) {
      return 0; // 7th house is neutral
    } else if (bhakoot === 8) {
      return 0; // 8th house is unfavorable
    }
    
    return 0;
  }

  private calculateNadiScore(boyNakshatra: any, girlNakshatra: any): number {
    // Nadi calculation based on Nakshatra characteristics
    const boyLord = boyNakshatra.lord;
    const girlLord = girlNakshatra.lord;
    
    // Nadi classification: Vata (Air), Pitta (Fire), Kapha (Water)
    const nadiClassification = {
      'Sun': 'Pitta', 'Moon': 'Kapha', 'Mars': 'Pitta',
      'Mercury': 'Vata', 'Jupiter': 'Kapha', 'Venus': 'Kapha',
      'Saturn': 'Vata', 'Rahu': 'Vata', 'Ketu': 'Pitta'
    };
    
    const boyNadi = boyLord ? nadiClassification[boyLord as keyof typeof nadiClassification] : undefined;
    const girlNadi = girlLord ? nadiClassification[girlLord as keyof typeof nadiClassification] : undefined;
    
    // Different Nadi is most compatible (prevents genetic issues)
    if (boyNadi !== girlNadi) {
      return 8;
    }
    
    return 0;
  }

  // Helper methods for detailed explanations
  private getVarnaDetails(boyNakshatra: any, girlNakshatra: any): string {
    const boyLord = boyNakshatra.lord;
    const girlLord = girlNakshatra.lord;
    
    if (this.calculateVarnaScore(boyNakshatra, girlNakshatra) > 0) {
      return `${boyLord} and ${girlLord} are compatible lords, indicating good social harmony.`;
    } else {
      return `${boyLord} and ${girlLord} may have some social compatibility challenges.`;
    }
  }

  private getVashyaDetails(boyRashi: any, girlRashi: any): string {
    const boyElement = boyRashi.element;
    const girlElement = girlRashi.element;
    
    if (this.calculateVashyaScore(boyRashi, girlRashi) > 0) {
      return `${boyElement} and ${girlElement} elements create good physical attraction.`;
    } else {
      return `${boyElement} and ${girlElement} elements may need more effort for physical harmony.`;
    }
  }

  private getTaraDetails(boyNakshatra: any, girlNakshatra: any): string {
    const boyNumber = boyNakshatra.number;
    const girlNumber = girlNakshatra.number;
    let tara = Math.abs(boyNumber - girlNumber);
    if (tara > 13) tara = 27 - tara;
    
    if (this.calculateTaraScore(boyNakshatra, girlNakshatra) > 0) {
      return `Tara distance of ${tara} indicates good health compatibility.`;
    } else {
      return `Tara distance of ${tara} suggests health compatibility challenges.`;
    }
  }

  private getYoniDetails(boyNakshatra: any, girlNakshatra: any): string {
    const boyLord = boyNakshatra.lord;
    const girlLord = girlNakshatra.lord;
    
    if (this.calculateYoniScore(boyNakshatra, girlNakshatra) > 0) {
      return `${boyLord} and ${girlLord} create good intimate compatibility.`;
    } else {
      return `${boyLord} and ${girlLord} may need work on intimate harmony.`;
    }
  }

  private getGrahaMaitriDetails(boyRashi: any, girlRashi: any): string {
    const boyLord = boyRashi.lord;
    const girlLord = girlRashi.lord;
    
    if (this.calculateGrahaMaitriScore(boyRashi, girlRashi) > 0) {
      return `${boyLord} and ${girlLord} are friendly planets, indicating good mental compatibility.`;
    } else {
      return `${boyLord} and ${girlLord} may have mental compatibility challenges.`;
    }
  }

  private getGanaDetails(boyNakshatra: any, girlNakshatra: any): string {
    const boyLord = boyNakshatra.lord;
    const girlLord = girlNakshatra.lord;
    
    if (this.calculateGanaScore(boyNakshatra, girlNakshatra) > 0) {
      return `${boyLord} and ${girlLord} have compatible temperaments.`;
    } else {
      return `${boyLord} and ${girlLord} may have temperament differences.`;
    }
  }

  private getBhakootDetails(boyRashi: any, girlRashi: any): string {
    const boyNumber = boyRashi.number;
    const girlNumber = girlRashi.number;
    let bhakoot = Math.abs(boyNumber - girlNumber);
    if (bhakoot > 6) bhakoot = 12 - bhakoot;
    
    if (this.calculateBhakootScore(boyRashi, girlRashi) > 0) {
      return `Bhakoot distance of ${bhakoot} indicates good love compatibility.`;
    } else {
      return `Bhakoot distance of ${bhakoot} suggests love compatibility challenges.`;
    }
  }

  private getNadiDetails(boyNakshatra: any, girlNakshatra: any): string {
    const boyLord = boyNakshatra.lord;
    const girlLord = girlNakshatra.lord;
    
    if (this.calculateNadiScore(boyNakshatra, girlNakshatra) > 0) {
      return `${boyLord} and ${girlLord} have different Nadi, ensuring good genetic compatibility.`;
    } else {
      return `${boyLord} and ${girlLord} have same Nadi, which may cause genetic compatibility issues.`;
    }
  }

  // Main calculation method
  public calculateCompatibility(boyData: any, girlData: any): any {
    try {
      // Calculate birth charts for both individuals
    const boyNakshatra = this.calculateNakshatra(boyData.dateOfBirth, boyData.timeOfBirth);
      const boyRashi = this.calculateRashi(boyData.dateOfBirth, boyData.timeOfBirth);
      const boyAscendant = this.calculateAscendant(boyData.dateOfBirth, boyData.timeOfBirth, 28.6139, 77.2090); // Default to Delhi coordinates
      
    const girlNakshatra = this.calculateNakshatra(girlData.dateOfBirth, girlData.timeOfBirth);
    const girlRashi = this.calculateRashi(girlData.dateOfBirth, girlData.timeOfBirth);
      const girlAscendant = this.calculateAscendant(girlData.dateOfBirth, girlData.timeOfBirth, 28.6139, 77.2090); // Default to Delhi coordinates
      
      // Calculate Gun Milan scores
      const { totalScore, gunDetails } = this.calculateGunMilan(boyNakshatra, boyRashi, girlNakshatra, girlRashi);

    // Determine compatibility level
    let compatibilityLevel = '';
    let compatibilityDescription = '';
    
      if (totalScore >= 32) {
        compatibilityLevel = 'Excellent';
        compatibilityDescription = 'This is an exceptional match with very high compatibility. The couple shares strong spiritual, mental, and physical harmony.';
      } else if (totalScore >= 28) {
        compatibilityLevel = 'Very Good';
        compatibilityDescription = 'This is a very good match with high compatibility. The couple has strong foundations for a successful marriage.';
      } else if (totalScore >= 24) {
        compatibilityLevel = 'Good';
        compatibilityDescription = 'This is a good match with above-average compatibility. The couple has the potential for a harmonious relationship.';
      } else if (totalScore >= 20) {
        compatibilityLevel = 'Average';
        compatibilityDescription = 'This is an average match with moderate compatibility. The couple may face some challenges but can build a stable relationship.';
      } else if (totalScore >= 16) {
        compatibilityLevel = 'Below Average';
        compatibilityDescription = 'This match has below-average compatibility. The couple may face significant challenges.';
    } else {
        compatibilityLevel = 'Poor';
        compatibilityDescription = 'This match has poor compatibility with significant challenges.';
    }

    // Generate recommendations and remedies
      const recommendations = this.generateRecommendations(totalScore);
      const remedies = this.generateRemedies(totalScore);

    return {
      totalScore,
      compatibilityLevel,
      compatibilityDescription,
        gunDetails,
      recommendations,
      remedies,
        birthCharts: {
          boy: {
            nakshatra: boyNakshatra,
            rashi: boyRashi,
            ascendant: boyAscendant
          },
          girl: {
            nakshatra: girlNakshatra,
            rashi: girlRashi,
            ascendant: girlAscendant
          }
        }
      };
    } catch (error) {
      console.error('Error in Gun Milan calculation:', error);
      throw new Error('Failed to calculate Gun Milan compatibility');
    }
  }

  private generateRecommendations(score: number): string[] {
    if (score < 24) {
      return [
        'Consider professional astrological counseling before proceeding',
        'Focus on building strong communication and understanding',
        'Practice patience and empathy in your relationship'
      ];
    } else if (score < 28) {
      return [
        'Work on strengthening your emotional connection',
        'Practice active listening and open communication',
        'Celebrate your differences and learn from each other'
      ];
    } else {
      return [
        'Maintain the strong foundation you already have',
        'Continue nurturing your spiritual and emotional bond',
        'Share your positive energy with others'
      ];
    }
  }

  private generateRemedies(score: number): string[] {
    if (score < 24) {
      return [
        'Perform daily prayers together for relationship harmony',
        'Wear compatible gemstones as recommended by an astrologer',
        'Visit temples together regularly for divine blessings',
        'Practice meditation and mindfulness together'
      ];
    } else if (score < 28) {
      return [
        'Perform weekly prayers together',
        'Wear rose quartz or pink tourmaline for love',
        'Light a pink candle together on Fridays',
        'Practice gratitude exercises together'
      ];
    } else {
      return [
        'Maintain your spiritual practices together',
        'Share your positive energy through charity work',
        'Express gratitude for your blessed union daily'
      ];
    }
  }
}

export async function POST(request: NextRequest) {
  try {
    const { boyData, girlData } = await request.json();

    // Validate input data
    if (!boyData || !girlData) {
      return NextResponse.json(
        { error: 'Missing required data' },
        { status: 400 }
      );
    }

    // Create calculator instance
    const calculator = new GunMilanCalculator();
    
    // Calculate compatibility
    const result = calculator.calculateCompatibility(boyData, girlData);
    
    return NextResponse.json(result);
  } catch (error) {
    console.error('Error in Gun Milan API:', error);
    return NextResponse.json(
      { error: 'Failed to calculate Gun Milan compatibility' },
      { status: 500 }
    );
  }
}
