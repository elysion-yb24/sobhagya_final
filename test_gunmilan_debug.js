// Quick debug script to find the exact failure point in Gun Milan calculation

class GunMilanCalculator {
  constructor() {
    this.nakshatras = [
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
    
    this.rashis = [
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
  }

  calculateMoonLongitude(jd) {
    const t = (jd - 2451545.0) / 36525;
    const L0 = 218.3164477 + 481267.88123421 * t - 0.0015786 * t * t + 
               t * t * t / 538841 - t * t * t * t / 65194000;
    const M = 134.9623964 + 477198.8675055 * t + 0.0087414 * t * t + 
              t * t * t / 69699 - t * t * t * t / 14712000;
    const F = 93.2720950 + 483202.0175233 * t - 0.0036539 * t * t - 
              t * t * t / 3526000 + t * t * t * t / 863310000;
    const perturbation = 6.2886 * Math.sin(M * Math.PI / 180) + 
                        1.2740 * Math.sin((2 * F - M) * Math.PI / 180) +
                        0.6583 * Math.sin((2 * F) * Math.PI / 180) +
                        0.2136 * Math.sin((2 * M) * Math.PI / 180);
    
    const result = L0 + perturbation;
    console.log(`  Moon calc: t=${t}, L0=${L0}, M=${M}, F=${F}, perturbation=${perturbation}, result=${result}`);
    return result;
  }

  calculateNakshatra(dateOfBirth, timeOfBirth) {
    console.log(`\ncalculateNakshatra(${dateOfBirth}, ${timeOfBirth})`);
    const dateStr = `${dateOfBirth}T${timeOfBirth}`;
    console.log(`  Date string: "${dateStr}"`);
    const birthDate = new Date(dateStr);
    console.log(`  Parsed date: ${birthDate}, isValid: ${!isNaN(birthDate.getTime())}`);
    
    if (isNaN(birthDate.getTime())) {
      console.log("  ERROR: Invalid date!");
      return null;
    }
    
    const year = birthDate.getFullYear();
    const month = birthDate.getMonth() + 1;
    const day = birthDate.getDate();
    const hour = birthDate.getHours();
    const minute = birthDate.getMinutes();
    console.log(`  Components: year=${year}, month=${month}, day=${day}, hour=${hour}, minute=${minute}`);
    
    let jd = 367 * year - Math.floor(7 * (year + Math.floor((month + 9) / 12)) / 4) + 
             Math.floor(275 * month / 9) + day + 1721013.5 + 
             (hour + minute / 60) / 24;
    console.log(`  JD = ${jd}`);
    
    const t = (jd - 2451545.0) / 36525;
    const ayanamsa = 23.85 + 0.3812 * t + 0.0012 * t * t;
    console.log(`  Ayanamsa = ${ayanamsa}`);
    
    const moonLongitude = this.calculateMoonLongitude(jd);
    console.log(`  Moon Longitude = ${moonLongitude}`);
    
    let siderealLongitude = moonLongitude - ayanamsa;
    console.log(`  Sidereal Longitude (before norm) = ${siderealLongitude}`);
    if (siderealLongitude < 0) siderealLongitude += 360;
    // PROBLEM: This doesn't handle values > 360!
    console.log(`  Sidereal Longitude (after norm) = ${siderealLongitude}`);
    
    const nakshatraIndex = Math.floor(siderealLongitude / 13.3333);
    console.log(`  Nakshatra Index = ${nakshatraIndex}, modulo 27 = ${nakshatraIndex % 27}`);
    
    const result = this.nakshatras[nakshatraIndex % 27];
    console.log(`  Result: ${JSON.stringify(result)}`);
    return result;
  }

  calculateSunLongitude(jd) {
    const t = (jd - 2451545.0) / 36525;
    const L0 = 280.46645 + 36000.76983 * t + 0.0003032 * t * t;
    const M = 357.52910 + 35999.05030 * t - 0.0001559 * t * t - 0.00000048 * t * t * t;
    const C = (1.914600 - 0.004817 * t - 0.000014 * t * t) * Math.sin(M * Math.PI / 180) +
              (0.019993 - 0.000101 * t) * Math.sin(2 * M * Math.PI / 180) +
              0.000290 * Math.sin(3 * M * Math.PI / 180);
    const result = L0 + C;
    console.log(`  Sun calc: L0=${L0}, result=${result}`);
    return result;
  }

  calculateRashi(dateOfBirth, timeOfBirth) {
    console.log(`\ncalculateRashi(${dateOfBirth}, ${timeOfBirth})`);
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
    console.log(`  siderealLongitude (before norm) = ${siderealLongitude}`);
    if (siderealLongitude < 0) siderealLongitude += 360;
    console.log(`  siderealLongitude (after norm) = ${siderealLongitude}`);
    
    const rashiIndex = Math.floor(siderealLongitude / 30);
    console.log(`  rashiIndex = ${rashiIndex}, modulo 12 = ${rashiIndex % 12}`);
    
    const result = this.rashis[rashiIndex % 12];
    console.log(`  Result: ${JSON.stringify(result)}`);
    return result;
  }
}

const calc = new GunMilanCalculator();

// Test with the same data the browser sends
try {
  const boyNakshatra = calc.calculateNakshatra("1995-03-15", "10:30");
  const boyRashi = calc.calculateRashi("1995-03-15", "10:30");
  
  const girlNakshatra = calc.calculateNakshatra("1997-07-22", "14:45");
  const girlRashi = calc.calculateRashi("1997-07-22", "14:45");
  
  console.log("\n=== SUMMARY ===");
  console.log("Boy Nakshatra:", boyNakshatra);
  console.log("Boy Rashi:", boyRashi);
  console.log("Girl Nakshatra:", girlNakshatra);
  console.log("Girl Rashi:", girlRashi);
  
  if (boyNakshatra && boyRashi && girlNakshatra && girlRashi) {
    console.log("\nAll calculations succeeded!");
  } else {
    console.log("\nSome calculations FAILED!");
  }
} catch (e) {
  console.error("\nERROR:", e.message);
  console.error(e.stack);
}
