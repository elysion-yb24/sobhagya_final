import { NextRequest, NextResponse } from 'next/server';

// Gun Milan calculation class - Extracted from sobhagya_final
class GunMilanCalculator {
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

  private calculateNakshatra(dateOfBirth: string, timeOfBirth: string): any {
    const birthDate = new Date(`${dateOfBirth}T${timeOfBirth}`);
    
    const year = birthDate.getFullYear();
    const month = birthDate.getMonth() + 1;
    const day = birthDate.getDate();
    const hour = birthDate.getHours();
    const minute = birthDate.getMinutes();
    
    let jd = 367 * year - Math.floor(7 * (year + Math.floor((month + 9) / 12)) / 4) + 
             Math.floor(275 * month / 9) + day + 1721013.5 + 
             (hour + minute / 60) / 24;
    
    const t = (jd - 2451545.0) / 36525;
    const ayanamsa = 23.85 + 0.3812 * t + 0.0012 * t * t;
    
    const moonLongitude = this.calculateMoonLongitude(jd);
    
    let siderealLongitude = moonLongitude - ayanamsa;
    if (siderealLongitude < 0) siderealLongitude += 360;
    
    const nakshatraIndex = Math.floor(siderealLongitude / 13.3333);
    return this.nakshatras[nakshatraIndex % 27];
  }

  private calculateMoonLongitude(jd: number): number {
    const t = (jd - 2451545.0) / 36525;
    
    const L0 = 218.3164477 + 481267.88123421 * t - 0.0015786 * t * t;
    const M = 134.9623964 + 477198.8675055 * t + 0.0087414 * t * t;
    const F = 93.2720950 + 483202.0175233 * t - 0.0036539 * t * t;
    
    const perturbation = 6.2886 * Math.sin(M * Math.PI / 180) + 
                        1.2740 * Math.sin((2 * F - M) * Math.PI / 180) +
                        0.6583 * Math.sin((2 * F) * Math.PI / 180);
    
    return L0 + perturbation;
  }

  private calculateRashi(dateOfBirth: string, timeOfBirth: string): any {
    const birthDate = new Date(`${dateOfBirth}T${timeOfBirth}`);
    
    const year = birthDate.getFullYear();
    const month = birthDate.getMonth() + 1;
    const day = birthDate.getDate();
    const hour = birthDate.getHours();
    const minute = birthDate.getMinutes();
    
    let jd = 367 * year - Math.floor(7 * (year + Math.floor((month + 9) / 12)) / 4) + 
             Math.floor(275 * month / 9) + day + 1721013.5 + 
             (hour + minute / 60) / 24;
    
    const t = (jd - 2451545.0) / 36525;
    const ayanamsa = 23.85 + 0.3812 * t + 0.0012 * t * t;
    
    const sunLongitude = this.calculateSunLongitude(jd);
    
    let siderealLongitude = sunLongitude - ayanamsa;
    if (siderealLongitude < 0) siderealLongitude += 360;
    
    const rashiIndex = Math.floor(siderealLongitude / 30);
    return this.rashis[rashiIndex % 12];
  }

  private calculateSunLongitude(jd: number): number {
    const t = (jd - 2451545.0) / 36525;
    
    const L0 = 280.46645 + 36000.76983 * t + 0.0003032 * t * t;
    const M = 357.52910 + 35999.05030 * t - 0.0001559 * t * t;
    const C = (1.914600 - 0.004817 * t - 0.000014 * t * t) * Math.sin(M * Math.PI / 180) +
              (0.019993 - 0.000101 * t) * Math.sin(2 * M * Math.PI / 180) +
              0.000290 * Math.sin(3 * M * Math.PI / 180);
    
    return L0 + C;
  }

  private calculateAscendant(dateOfBirth: string, timeOfBirth: string, latitude: number, longitude: number): any {
    const birthDate = new Date(`${dateOfBirth}T${timeOfBirth}`);
    
    const year = birthDate.getFullYear();
    const month = birthDate.getMonth() + 1;
    const day = birthDate.getDate();
    const hour = birthDate.getHours();
    const minute = birthDate.getMinutes();
    
    let jd = 367 * year - Math.floor(7 * (year + Math.floor((month + 9) / 12)) / 4) + 
             Math.floor(275 * month / 9) + day + 1721013.5 + 
             (hour + minute / 60) / 24;
    
    const t = (jd - 2451545.0) / 36525;
    const ayanamsa = 23.85 + 0.3812 * t + 0.0012 * t * t;
    
    const sunLongitude = this.calculateSunLongitude(jd);
    
    const siderealTime = (6.697374558 + 2400.051336 * t + 0.000025862 * t * t) % 24;
    const localSiderealTime = (siderealTime + (longitude / 15)) % 24;
    
    const ascendantLongitude = (localSiderealTime * 15 + latitude) % 360;
    
    const rashiIndex = Math.floor(ascendantLongitude / 30);
    return this.rashis[rashiIndex % 12];
  }

  private calculateGunMilan(boyNakshatra: any, boyRashi: any, girlNakshatra: any, girlRashi: any): any {
    let totalScore = 0;
    const gunDetails = [];

    const varnaScore = this.calculateVarnaScore(boyNakshatra, girlNakshatra);
    totalScore += varnaScore;
    gunDetails.push({
      name: 'Varna (1 point)',
      description: 'Social compatibility and caste harmony',
      score: varnaScore
    });

    const vashyaScore = this.calculateVashyaScore(boyRashi, girlRashi);
    totalScore += vashyaScore;
    gunDetails.push({
      name: 'Vashya (2 points)',
      description: 'Physical attraction and dominance compatibility',
      score: vashyaScore
    });

    const taraScore = this.calculateTaraScore(boyNakshatra, girlNakshatra);
    totalScore += taraScore;
    gunDetails.push({
      name: 'Tara (3 points)',
      description: 'Health compatibility and longevity',
      score: taraScore
    });

    const yoniScore = this.calculateYoniScore(boyNakshatra, girlNakshatra);
    totalScore += yoniScore;
    gunDetails.push({
      name: 'Yoni (4 points)',
      description: 'Sexual compatibility and intimacy',
      score: yoniScore
    });

    const grahaMaitriScore = this.calculateGrahaMaitriScore(boyRashi, girlRashi);
    totalScore += grahaMaitriScore;
    gunDetails.push({
      name: 'Graha Maitri (5 points)',
      description: 'Mental compatibility and friendship',
      score: grahaMaitriScore
    });

    const ganaScore = this.calculateGanaScore(boyNakshatra, girlNakshatra);
    totalScore += ganaScore;
    gunDetails.push({
      name: 'Gana (6 points)',
      description: 'Temperament compatibility and nature',
      score: ganaScore
    });

    const bhakootScore = this.calculateBhakootScore(boyRashi, girlRashi);
    totalScore += bhakootScore;
    gunDetails.push({
      name: 'Bhakoot (7 points)',
      description: 'Love and affection compatibility',
      score: bhakootScore
    });

    const nadiScore = this.calculateNadiScore(boyNakshatra, girlNakshatra);
    totalScore += nadiScore;
    gunDetails.push({
      name: 'Nadi (8 points)',
      description: 'Genetic compatibility and health',
      score: nadiScore
    });

    return { totalScore, gunDetails };
  }

  private calculateVarnaScore(boyNakshatra: any, girlNakshatra: any): number {
    const boyLord = boyNakshatra.lord;
    const girlLord = girlNakshatra.lord;
    
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
    const boyElement = boyRashi.element;
    const girlElement = girlRashi.element;
    
    if ((boyElement === 'Fire' && girlElement === 'Air') || 
        (boyElement === 'Air' && girlElement === 'Fire')) {
      return 2;
    }
    
    if ((boyElement === 'Earth' && girlElement === 'Water') || 
        (boyElement === 'Water' && girlElement === 'Earth')) {
      return 2;
    }
    
    if (boyElement === girlElement) {
      return 1;
    }
    
    return 0;
  }

  private calculateTaraScore(boyNakshatra: any, girlNakshatra: any): number {
    const boyNumber = boyNakshatra.number;
    const girlNumber = girlNakshatra.number;
    
    let tara = Math.abs(boyNumber - girlNumber);
    if (tara > 13) tara = 27 - tara;
    
    const favorableTaras = [2, 3, 4, 5, 7, 9, 10, 11, 13];
    
    if (favorableTaras.includes(tara)) {
      return 3;
    } else if (tara === 1 || tara === 6 || tara === 8 || tara === 12) {
      return 1;
    }
    
    return 0;
  }

  private calculateYoniScore(boyNakshatra: any, girlNakshatra: any): number {
    const boyLord = boyNakshatra.lord;
    const girlLord = girlNakshatra.lord;
    
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
    const boyLord = boyRashi.lord;
    const girlLord = girlRashi.lord;
    
    const friendlyPlanets: { [key: string]: string[] } = {
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
        (friendlyPlanets[boyLord]?.includes(girlLord) || 
         friendlyPlanets[girlLord]?.includes(boyLord))) {
      return 5;
    }
    
    return 0;
  }

  private calculateGanaScore(boyNakshatra: any, girlNakshatra: any): number {
    const boyLord = boyNakshatra.lord;
    const girlLord = girlNakshatra.lord;
    
    const ganaClassification: { [key: string]: string } = {
      'Sun': 'Deva', 'Moon': 'Deva', 'Mars': 'Rakshasa',
      'Mercury': 'Manushya', 'Jupiter': 'Deva', 'Venus': 'Manushya',
      'Saturn': 'Rakshasa', 'Rahu': 'Rakshasa', 'Ketu': 'Rakshasa'
    };
    
    const boyGana = boyLord ? ganaClassification[boyLord] : undefined;
    const girlGana = girlLord ? ganaClassification[girlLord] : undefined;
    
    if (boyGana === girlGana) {
      return 6;
    }
    
    if ((boyGana === 'Deva' && girlGana === 'Manushya') || 
        (boyGana === 'Manushya' && girlGana === 'Deva')) {
      return 4;
    }
    
    return 0;
  }

  private calculateBhakootScore(boyRashi: any, girlRashi: any): number {
    const boyNumber = boyRashi.number;
    const girlNumber = girlRashi.number;
    
    let bhakoot = Math.abs(boyNumber - girlNumber);
    if (bhakoot > 6) bhakoot = 12 - bhakoot;
    
    const favorableBhakoots = [1, 2, 3, 4, 5, 9, 10, 11];
    
    if (favorableBhakoots.includes(bhakoot)) {
      return 7;
    }
    
    return 0;
  }

  private calculateNadiScore(boyNakshatra: any, girlNakshatra: any): number {
    const boyLord = boyNakshatra.lord;
    const girlLord = girlNakshatra.lord;
    
    const nadiClassification: { [key: string]: string } = {
      'Sun': 'Pitta', 'Moon': 'Kapha', 'Mars': 'Pitta',
      'Mercury': 'Vata', 'Jupiter': 'Kapha', 'Venus': 'Kapha',
      'Saturn': 'Vata', 'Rahu': 'Vata', 'Ketu': 'Pitta'
    };
    
    const boyNadi = boyLord ? nadiClassification[boyLord] : undefined;
    const girlNadi = girlLord ? nadiClassification[girlLord] : undefined;
    
    if (boyNadi !== girlNadi) {
      return 8;
    }
    
    return 0;
  }

  public calculateCompatibility(boyData: any, girlData: any): any {
    try {
      const boyNakshatra = this.calculateNakshatra(boyData.dateOfBirth, boyData.timeOfBirth);
      const boyRashi = this.calculateRashi(boyData.dateOfBirth, boyData.timeOfBirth);
      const boyAscendant = this.calculateAscendant(boyData.dateOfBirth, boyData.timeOfBirth, 28.6139, 77.2090);
      
      const girlNakshatra = this.calculateNakshatra(girlData.dateOfBirth, girlData.timeOfBirth);
      const girlRashi = this.calculateRashi(girlData.dateOfBirth, girlData.timeOfBirth);
      const girlAscendant = this.calculateAscendant(girlData.dateOfBirth, girlData.timeOfBirth, 28.6139, 77.2090);
      
      const { totalScore, gunDetails } = this.calculateGunMilan(boyNakshatra, boyRashi, girlNakshatra, girlRashi);

      let compatibilityLevel = '';
      let compatibilityDescription = '';
      
      if (totalScore >= 32) {
        compatibilityLevel = 'Excellent';
        compatibilityDescription = 'This is an exceptional match with very high compatibility.';
      } else if (totalScore >= 28) {
        compatibilityLevel = 'Very Good';
        compatibilityDescription = 'This is a very good match with high compatibility.';
      } else if (totalScore >= 24) {
        compatibilityLevel = 'Good';
        compatibilityDescription = 'This is a good match with above-average compatibility.';
      } else if (totalScore >= 20) {
        compatibilityLevel = 'Average';
        compatibilityDescription = 'This is an average match with moderate compatibility.';
      } else if (totalScore >= 16) {
        compatibilityLevel = 'Below Average';
        compatibilityDescription = 'This match has below-average compatibility.';
      } else {
        compatibilityLevel = 'Poor';
        compatibilityDescription = 'This match has poor compatibility.';
      }

      const recommendations = totalScore < 24 ? [
        'Consider professional astrological counseling',
        'Focus on building strong communication',
        'Practice patience and empathy'
      ] : [
        'Maintain the strong foundation',
        'Continue nurturing your bond',
        'Share positive energy'
      ];

      const remedies = totalScore < 24 ? [
        'Perform daily prayers together',
        'Wear compatible gemstones',
        'Visit temples together regularly'
      ] : [
        'Maintain spiritual practices together',
        'Express gratitude daily'
      ];

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
}

export async function POST(request: NextRequest) {
  try {
    const { boyData, girlData } = await request.json();

    if (!boyData || !girlData) {
      return NextResponse.json(
        { error: 'Missing required data' },
        { status: 400 }
      );
    }

    const calculator = new GunMilanCalculator();
    const result = calculator.calculateCompatibility(boyData, girlData);
    
    return NextResponse.json({
      success: true,
      data: result
    });
  } catch (error: any) {
    console.error('Error in Gun Milan API:', error);
    return NextResponse.json(
      { error: 'Failed to calculate Gun Milan compatibility', details: error.message },
      { status: 500 }
    );
  }
}

