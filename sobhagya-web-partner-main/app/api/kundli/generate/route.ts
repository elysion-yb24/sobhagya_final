import { NextRequest, NextResponse } from 'next/server';

// TypeScript interfaces
interface Translations {
    hindi: {
        rashis: string[];
        planets: string[];
        houses: string[];
    };
    english: {
        rashis: string[];
        planets: string[];
        houses: string[];
    };
}

interface PlanetaryData {
    [key: string]: {
        exaltation: number;
        debilitation: number;
        own: number;
    };
}

interface Nakshatra {
    name: string;
    lord: string;
    degrees: [number, number];
}

interface VimshottariPeriods {
    [key: string]: number;
}

// Kundli Generator Class - Extracted from sobhagya_final
class AccurateKundliGenerator {
    private translations: Translations;
    private signLords: string[];
    private planetaryData: PlanetaryData;
    private nakshatras: Nakshatra[];
    private vimshottariPeriods: VimshottariPeriods;
    
    constructor() {
        this.translations = {
            hindi: {
                rashis: ['मेष', 'वृषभ', 'मिथुन', 'कर्क', 'सिंह', 'कन्या', 'तुला', 'वृश्चिक', 'धनु', 'मकर', 'कुम्भ', 'मीन'],
                planets: ['सूर्य', 'चंद्र', 'मंगल', 'बुध', 'गुरु', 'शुक्र', 'शनि', 'राहु', 'केतु'],
                houses: ['लग्न', 'धन', 'सहज', 'बंधु', 'संतान', 'रिपु', 'जया', 'मृत्यु', 'धर्म', 'कर्म', 'लाभ', 'व्यय']
            },
            english: {
                rashis: ['Aries', 'Taurus', 'Gemini', 'Cancer', 'Leo', 'Virgo', 'Libra', 'Scorpio', 'Sagittarius', 'Capricorn', 'Aquarius', 'Pisces'],
                planets: ['Sun', 'Moon', 'Mars', 'Mercury', 'Jupiter', 'Venus', 'Saturn', 'Rahu', 'Ketu'],
                houses: ['Lagna', 'Dhan', 'Sahaj', 'Bandhu', 'Santaan', 'Ripu', 'Jaya', 'Mrityu', 'Dharma', 'Karma', 'Labh', 'Vyaya']
            }
        };

        this.signLords = ['Mars', 'Venus', 'Mercury', 'Moon', 'Sun', 'Mercury', 'Venus', 'Mars', 'Jupiter', 'Saturn', 'Saturn', 'Jupiter'];

        this.planetaryData = {
            'Sun': { exaltation: 1, debilitation: 7, own: 5 },
            'Moon': { exaltation: 2, debilitation: 8, own: 4 },
            'Mars': { exaltation: 10, debilitation: 4, own: 1 },
            'Mercury': { exaltation: 6, debilitation: 12, own: 3 },
            'Jupiter': { exaltation: 4, debilitation: 10, own: 9 },
            'Venus': { exaltation: 12, debilitation: 6, own: 2 },
            'Saturn': { exaltation: 7, debilitation: 1, own: 10 }
        };

        this.nakshatras = [
            { name: 'Ashwini', lord: 'Ketu', degrees: [0, 13.33] },
            { name: 'Bharani', lord: 'Venus', degrees: [13.33, 26.67] },
            { name: 'Krittika', lord: 'Sun', degrees: [26.67, 40] },
            { name: 'Rohini', lord: 'Moon', degrees: [40, 53.33] },
            { name: 'Mrigashira', lord: 'Mars', degrees: [53.33, 66.67] },
            { name: 'Ardra', lord: 'Rahu', degrees: [66.67, 80] },
            { name: 'Punarvasu', lord: 'Jupiter', degrees: [80, 93.33] },
            { name: 'Pushya', lord: 'Saturn', degrees: [93.33, 106.67] },
            { name: 'Ashlesha', lord: 'Mercury', degrees: [106.67, 120] },
            { name: 'Magha', lord: 'Ketu', degrees: [120, 133.33] },
            { name: 'Purva Phalguni', lord: 'Venus', degrees: [133.33, 146.67] },
            { name: 'Uttara Phalguni', lord: 'Sun', degrees: [146.67, 160] },
            { name: 'Hasta', lord: 'Moon', degrees: [160, 173.33] },
            { name: 'Chitra', lord: 'Mars', degrees: [173.33, 186.67] },
            { name: 'Swati', lord: 'Rahu', degrees: [186.67, 200] },
            { name: 'Vishakha', lord: 'Jupiter', degrees: [200, 213.33] },
            { name: 'Anuradha', lord: 'Saturn', degrees: [213.33, 226.67] },
            { name: 'Jyeshtha', lord: 'Mercury', degrees: [226.67, 240] },
            { name: 'Mula', lord: 'Ketu', degrees: [240, 253.33] },
            { name: 'Purva Ashadha', lord: 'Venus', degrees: [253.33, 266.67] },
            { name: 'Uttara Ashadha', lord: 'Sun', degrees: [266.67, 280] },
            { name: 'Shravana', lord: 'Moon', degrees: [280, 293.33] },
            { name: 'Dhanishta', lord: 'Mars', degrees: [293.33, 306.67] },
            { name: 'Shatabhisha', lord: 'Rahu', degrees: [306.67, 320] },
            { name: 'Purva Bhadrapada', lord: 'Jupiter', degrees: [320, 333.33] },
            { name: 'Uttara Bhadrapada', lord: 'Saturn', degrees: [333.33, 346.67] },
            { name: 'Revati', lord: 'Mercury', degrees: [346.67, 360] }
        ];

        this.vimshottariPeriods = {
            'Sun': 6, 'Moon': 10, 'Mars': 7, 'Mercury': 17,
            'Jupiter': 16, 'Venus': 20, 'Saturn': 19, 'Rahu': 18, 'Ketu': 7
        };
    }

    dateToJulianDay(date: Date) {
        const year = date.getFullYear();
        const month = date.getMonth() + 1;
        const day = date.getDate();
        const hour = date.getHours();
        const minute = date.getMinutes();
        
        const decimalHours = hour + minute / 60;
        
        let adjustedYear = year;
        let adjustedMonth = month;
        
        if (month <= 2) {
            adjustedYear--;
            adjustedMonth += 12;
        }
        
        const a = Math.floor(adjustedYear / 100);
        const b = 2 - a + Math.floor(a / 4);
        
        const jd = Math.floor(365.25 * (adjustedYear + 4716)) + 
                 Math.floor(30.6001 * (adjustedMonth + 1)) + 
                 day + b - 1524.5 + decimalHours / 24;
        
        return jd;
    }

    calculateDetailedPlanetPosition(planet: string, jd: number, latitude: number, longitude: number) {
        const daysSinceEpoch = jd - 2451545.0;
        const centuries = daysSinceEpoch / 36525;
        
        let meanLongitude = 0;
        let isRetrograde = false;
        let isCombust = false;
        
        if (planet === 'Ascendant') {
            meanLongitude = this.calculateAccurateAscendant(jd, latitude, longitude);
        } else {
            switch(planet) {
                case 'Sun':
                    const L0 = 280.46645 + 36000.76983 * centuries + 0.0003032 * centuries * centuries;
                    const M = 357.52910 + 35999.05030 * centuries - 0.0001559 * centuries * centuries;
                    const C = (1.914600 - 0.004817 * centuries - 0.000014 * centuries * centuries) * Math.sin(M * Math.PI / 180) +
                             (0.019993 - 0.000101 * centuries) * Math.sin(2 * M * Math.PI / 180) +
                             0.000290 * Math.sin(3 * M * Math.PI / 180);
                    meanLongitude = L0 + C;
                    break;
                    
                case 'Moon':
                    const Lm = 218.3164477 + 481267.88123421 * centuries - 0.0015786 * centuries * centuries;
                    const Mm = 477198.8675055 + 1209600.7698 * centuries + 0.0003106 * centuries * centuries;
                    const perturbation = 6.288774 * Math.sin(Mm * Math.PI / 180) +
                                       1.274018 * Math.sin((2 * 297.8501921 - Mm) * Math.PI / 180) +
                                       0.658309 * Math.sin(2 * 297.8501921 * Math.PI / 180);
                    meanLongitude = Lm + perturbation;
                    break;
                    
                case 'Mars':
                    const Lm1 = 355.433275 + 19141.6964746 * centuries + 0.0003106 * centuries * centuries;
                    const Mm1 = 19.373264 + 382.8964489 * centuries + 0.0000071 * centuries * centuries;
                    const marsPerturbation = 10.691 * Math.sin(Mm1 * Math.PI / 180) +
                                           0.623 * Math.sin(2 * Mm1 * Math.PI / 180);
                    meanLongitude = Lm1 + marsPerturbation;
                    isRetrograde = this.calculateAccurateRetrograde(planet, jd);
                    break;
                    
                case 'Mercury':
                    const Lm2 = 252.250906 + 149472.6746358 * centuries - 0.0006355 * centuries * centuries;
                    const Mm2 = 168.656222 + 149472.5152889 * centuries + 0.0000090 * centuries * centuries;
                    const mercuryPerturbation = 23.440 * Math.sin(Mm2 * Math.PI / 180) +
                                              2.981 * Math.sin(2 * Mm2 * Math.PI / 180);
                    meanLongitude = Lm2 + mercuryPerturbation;
                    isRetrograde = this.calculateAccurateRetrograde(planet, jd);
                    isCombust = this.calculateAccurateCombust(planet, jd);
                    break;
                    
                case 'Jupiter':
                    const Lj = 34.351519 + 3034.9056606 * centuries - 0.0000850 * centuries * centuries;
                    const Mj = 19.895848 + 3034.9060976 * centuries - 0.0000850 * centuries * centuries;
                    const jupiterPerturbation = 5.208 * Math.sin(Mj * Math.PI / 180) +
                                              0.251 * Math.sin(2 * Mj * Math.PI / 180);
                    meanLongitude = Lj + jupiterPerturbation;
                    isRetrograde = this.calculateAccurateRetrograde(planet, jd);
                    break;
                    
                case 'Venus':
                    const Lv = 181.979801 + 58517.8156760 * centuries + 0.0000011 * centuries * centuries;
                    const Mv = 212.603219 + 58517.8038750 * centuries + 0.0000011 * centuries * centuries;
                    const venusPerturbation = 0.773 * Math.sin(Mv * Math.PI / 180) +
                                            0.022 * Math.sin(2 * Mv * Math.PI / 180);
                    meanLongitude = Lv + venusPerturbation;
                    isRetrograde = this.calculateAccurateRetrograde(planet, jd);
                    isCombust = this.calculateAccurateCombust(planet, jd);
                    break;
                    
                case 'Saturn':
                    const Ls = 50.077444 + 1222.1138488 * centuries + 0.0002101 * centuries * centuries;
                    const Ms = 316.967018 + 1222.1138488 * centuries + 0.0002101 * centuries * centuries;
                    const saturnPerturbation = 0.812 * Math.sin(Ms * Math.PI / 180) +
                                             0.229 * Math.sin(2 * Ms * Math.PI / 180);
                    meanLongitude = Ls + saturnPerturbation;
                    isRetrograde = this.calculateAccurateRetrograde(planet, jd);
                    break;
                    
                case 'Rahu':
                    const Lr = 125.044555 - 1934.136185 * centuries + 0.0020762 * centuries * centuries;
                    meanLongitude = Lr;
                    isRetrograde = true;
                    break;
                    
                case 'Ketu':
                    const Lk = (125.044555 - 1934.136185 * centuries + 0.0020762 * centuries * centuries + 180) % 360;
                    meanLongitude = Lk;
                    isRetrograde = true;
                    break;
            }
        }
        
        meanLongitude = meanLongitude % 360;
        if (meanLongitude < 0) meanLongitude += 360;
        
        const rashiIndex = Math.floor(meanLongitude / 30);
        const degree = meanLongitude % 30;
        
        const nakshatra = this.calculateNakshatra(meanLongitude);
        const house = this.calculateHousePosition(meanLongitude, jd, latitude, longitude);
        const status = this.calculatePlanetaryStatus(planet, rashiIndex + 1);
        
        return {
            planet: planet,
            sign: this.translations.english.rashis[rashiIndex],
            signLord: this.signLords[rashiIndex],
            nakshatra: nakshatra.name,
            nakshatraLord: nakshatra.lord,
            degree: this.formatDegree(degree),
            isRetrograde: isRetrograde,
            isCombust: isCombust,
            house: house,
            status: status
        };
    }

    calculateAccurateAscendant(jd: number, latitude: number, longitude: number) {
        const daysSinceEpoch = jd - 2451545.0;
        const centuries = daysSinceEpoch / 36525;
        
        const T = centuries;
        const T2 = T * T;
        const T3 = T2 * T;
        
        const GST = 280.46061837 + 360.98564736629 * daysSinceEpoch + 0.000387933 * T2 - T3 / 38710000;
        
        let LST = (GST + longitude) % 360;
        if (LST < 0) LST += 360;
        
        const ayanamsa = 23.85 + 0.0005 * (jd - 2451545.0) / 365.25;
        
        const tanA = Math.tan((latitude * Math.PI) / 180) * Math.cos((23.439 - ayanamsa) * Math.PI / 180);
        const cosLST = Math.cos(LST * Math.PI / 180);
        const sinLST = Math.sin(LST * Math.PI / 180);
        
        let ascendant = Math.atan2(sinLST, cosLST * Math.cos((23.439 - ayanamsa) * Math.PI / 180) - tanA * Math.sin((23.439 - ayanamsa) * Math.PI / 180));
        ascendant = ascendant * 180 / Math.PI;
        
        if (ascendant < 0) ascendant += 360;
        
        return ascendant;
    }

    calculateAccurateRetrograde(planet: string, jd: number) {
        const daysSinceEpoch = jd - 2451545.0;
        const centuries = daysSinceEpoch / 36525;
        
        switch(planet) {
            case 'Mars':
                const Mm1 = 19.373264 + 382.8964489 * centuries;
                return Math.cos(Mm1 * Math.PI / 180) < 0;
            case 'Mercury':
                const Mm2 = 168.656222 + 149472.5152889 * centuries;
                return Math.cos(Mm2 * Math.PI / 180) < 0;
            case 'Jupiter':
                const Mj = 19.895848 + 3034.9060976 * centuries;
                return Math.cos(Mj * Math.PI / 180) < 0;
            case 'Venus':
                const Mv = 212.603219 + 58517.8038750 * centuries;
                return Math.cos(Mv * Math.PI / 180) < 0;
            case 'Saturn':
                const Ms = 316.967018 + 1222.1138488 * centuries;
                return Math.cos(Ms * Math.PI / 180) < 0;
            case 'Rahu':
            case 'Ketu':
                return true;
            default:
                return false;
        }
    }

    calculateAccurateCombust(planet: string, jd: number) {
        if (planet !== 'Mercury' && planet !== 'Venus') return false;
        
        const daysSinceEpoch = jd - 2451545.0;
        const centuries = daysSinceEpoch / 36525;
        
        const L0 = 280.46645 + 36000.76983 * centuries + 0.0003032 * centuries * centuries;
        const M = 357.52910 + 35999.05030 * centuries - 0.0001559 * centuries * centuries;
        const C = (1.914600 - 0.004817 * centuries - 0.000014 * centuries * centuries) * Math.sin(M * Math.PI / 180) +
                 (0.019993 - 0.000101 * centuries) * Math.sin(2 * M * Math.PI / 180) +
                 0.000290 * Math.sin(3 * M * Math.PI / 180);
        const sunLongitude = (L0 + C) % 360;
        
        let planetLongitude = 0;
        switch(planet) {
            case 'Mercury':
                const Lm2 = 252.250906 + 149472.6746358 * centuries - 0.0006355 * centuries * centuries;
                const Mm2 = 168.656222 + 149472.5152889 * centuries + 0.0000090 * centuries * centuries;
                const mercuryPerturbation = 23.440 * Math.sin(Mm2 * Math.PI / 180) +
                                          2.981 * Math.sin(2 * Mm2 * Math.PI / 180);
                planetLongitude = (Lm2 + mercuryPerturbation) % 360;
                break;
            case 'Venus':
                const Lv = 181.979801 + 58517.8156760 * centuries + 0.0000011 * centuries * centuries;
                const Mv = 212.603219 + 58517.8038750 * centuries + 0.0000011 * centuries * centuries;
                const venusPerturbation = 0.773 * Math.sin(Mv * Math.PI / 180) +
                                        0.022 * Math.sin(2 * Mv * Math.PI / 180);
                planetLongitude = (Lv + venusPerturbation) % 360;
                break;
        }
        
        let separation = Math.abs(planetLongitude - sunLongitude);
        if (separation > 180) separation = 360 - separation;
        
        return separation <= 8;
    }

    calculateNakshatra(longitude: number) {
        for (const nakshatra of this.nakshatras) {
            if (longitude >= nakshatra.degrees[0] && longitude < nakshatra.degrees[1]) {
                return nakshatra;
            }
        }
        return this.nakshatras[0];
    }

    formatDegree(degree: number) {
        const degrees = Math.floor(degree);
        const minutes = Math.floor((degree - degrees) * 60);
        const seconds = Math.floor(((degree - degrees) * 60 - minutes) * 60);
        return `${degrees}°${minutes}'${seconds}"`;
    }

    calculatePlanetaryStatus(planet: string, rashiNumber: number) {
        const data = this.planetaryData[planet];
        if (!data) return 'Neutral';
        
        if (data.exaltation === rashiNumber) return 'Exalted';
        if (data.debilitation === rashiNumber) return 'Debilitated';
        if (data.own === rashiNumber) return 'Owned';
        
        return 'Neutral';
    }

    calculateHousePosition(planetLongitude: number, jd: number, latitude: number, longitude: number) {
        const ascendant = this.calculateAccurateAscendant(jd, latitude, longitude);
        const ascendantRashi = Math.floor(ascendant / 30);
        const planetRashi = Math.floor(planetLongitude / 30);
        
        let house = (planetRashi - ascendantRashi + 1) % 12;
        if (house <= 0) house += 12;
        
        return house;
    }

    getCoordinatesFromLocation(location: string) {
        const state = location.split(',')[0]?.trim();
        
        const coordinates: { [key: string]: { lat: number, lng: number } } = {
            'Maharashtra': { lat: 19.7515, lng: 75.7139 },
            'Delhi': { lat: 28.7041, lng: 77.1025 },
            'Karnataka': { lat: 15.3173, lng: 75.7139 },
            'Tamil Nadu': { lat: 11.1271, lng: 78.6569 },
            'West Bengal': { lat: 22.9868, lng: 87.8550 },
            'Telangana': { lat: 18.1124, lng: 79.0193 },
            'Gujarat': { lat: 22.2587, lng: 71.1924 },
            'Rajasthan': { lat: 27.0238, lng: 74.2179 },
            'Uttar Pradesh': { lat: 26.8467, lng: 80.9462 },
            'Madhya Pradesh': { lat: 23.5937, lng: 78.9629 },
            'Andhra Pradesh': { lat: 15.9129, lng: 79.7400 },
            'Bihar': { lat: 25.0961, lng: 85.3131 },
            'Odisha': { lat: 20.9517, lng: 85.0985 },
            'Punjab': { lat: 31.1471, lng: 75.3412 },
            'Haryana': { lat: 29.0588, lng: 76.0856 },
            'Himachal Pradesh': { lat: 31.1048, lng: 77.1734 },
            'Jharkhand': { lat: 23.6102, lng: 85.2799 },
            'Kerala': { lat: 10.8505, lng: 76.2711 },
            'Assam': { lat: 26.2006, lng: 92.9376 },
            'Chhattisgarh': { lat: 21.2787, lng: 81.8661 },
            'Goa': { lat: 15.2993, lng: 74.1240 },
            'Manipur': { lat: 24.6637, lng: 93.9063 },
            'Meghalaya': { lat: 25.4670, lng: 91.3662 },
            'Mizoram': { lat: 23.1645, lng: 92.9376 },
            'Nagaland': { lat: 26.1584, lng: 94.5624 },
            'Sikkim': { lat: 27.5330, lng: 88.5122 },
            'Tripura': { lat: 23.9408, lng: 91.9882 },
            'Uttarakhand': { lat: 30.0668, lng: 79.0193 },
            'Arunachal Pradesh': { lat: 28.2180, lng: 94.7278 },
            'Chandigarh': { lat: 30.7333, lng: 76.7794 },
            'Jammu and Kashmir': { lat: 33.7782, lng: 76.5762 },
            'Ladakh': { lat: 34.1526, lng: 77.5771 },
            'Lakshadweep': { lat: 10.5667, lng: 72.6417 },
            'Puducherry': { lat: 11.9416, lng: 79.8083 },
            'Andaman and Nicobar Islands': { lat: 11.7401, lng: 92.6586 },
            'Dadra and Nagar Haveli and Daman and Diu': { lat: 20.1809, lng: 72.8311 }
        };
        
        return coordinates[state] || { lat: 20.5937, lng: 78.9629 };
    }

    calculateAccurateHousePositions(birthTime: Date, latitude: number, longitude: number) {
        const jd = this.dateToJulianDay(birthTime);
        
        // Calculate Ascendant (Lagna)
        const lagna = this.calculateAccurateAscendant(jd, latitude, longitude);
        const lagnaRashi = Math.floor(lagna / 30);
        
        const houses = [];
        for (let i = 0; i < 12; i++) {
            const rashiIndex = (lagnaRashi + i) % 12;
            houses.push({
                houseNumber: i + 1,
                rashi: this.translations.english.rashis[rashiIndex],
                planets: []
            });
        }
        
        return houses;
    }

    generateAccurateHouseAnalysis(housePositions: any[], language: string) {
        const analysis: Array<{house: string, analysis: string}> = [];
        
        housePositions.forEach(house => {
            const houseName = this.translations[language as keyof typeof this.translations]?.houses?.[house.houseNumber - 1] || `House ${house.houseNumber}`;
            
            let analysisText = `${houseName} house. `;
            if (house.planets && house.planets.length > 0) {
                analysisText += `Planets in this house: ${house.planets.join(', ')}. `;
                if (house.planets.length >= 3) {
                    analysisText += 'Strong placement indicates good fortune.';
                } else if (house.planets.length >= 2) {
                    analysisText += 'Moderate placement with mixed influences.';
                } else {
                    analysisText += 'Neutral placement with moderate influence.';
                }
            } else {
                analysisText += 'No planets in this house. Neutral placement with moderate influence.';
            }
            
            analysis.push({
                house: houseName,
                analysis: analysisText
            });
        });
        
        return analysis;
    }

    generateAccurateKundli(userData: any, language: string = 'english') {
        const birthTime = new Date(userData.dateOfBirth + 'T' + userData.timeOfBirth);
        const coordinates = this.getCoordinatesFromLocation(userData.placeOfBirth);
        
        // Calculate all planetary positions
        const planetaryPositions: any[] = [];
        const planets = ['Ascendant', 'Sun', 'Moon', 'Mars', 'Mercury', 'Jupiter', 'Venus', 'Saturn', 'Rahu', 'Ketu'];
        
        planets.forEach(planet => {
            const position = this.calculateDetailedPlanetPosition(planet, this.dateToJulianDay(birthTime), coordinates.lat, coordinates.lng);
            planetaryPositions.push({
                ...position,
                planetName: planet
            });
        });
        
        // Calculate house positions
        const housePositions = this.calculateAccurateHousePositions(birthTime, coordinates.lat, coordinates.lng);
        
        // Assign planets to houses based on their house number
        planetaryPositions.forEach(planet => {
            if (planet.planet !== 'Ascendant' && planet.house) {
                const targetHouse = housePositions.find((h: any) => h.houseNumber === planet.house);
                if (targetHouse) {
                    (targetHouse.planets as string[]).push(planet.planet);
                }
            }
        });
        
        // Add translations for display
        housePositions.forEach((house: any) => {
            house.houseName = this.translations[language as keyof typeof this.translations]?.houses?.[house.houseNumber - 1] || `House ${house.houseNumber}`;
            house.rashiName = this.translations[language as keyof typeof this.translations]?.rashis?.[this.translations.english.rashis.indexOf(house.rashi)] || house.rashi;
        });
        
        // Generate house analysis
        const houseAnalysis = this.generateAccurateHouseAnalysis(housePositions, language);
        
        return {
            personalInfo: userData,
            planetaryPositions: planetaryPositions,
            housePositions: housePositions,
            houseAnalysis: houseAnalysis,
            language: language
        };
    }
}

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { name, gender, dateOfBirth, timeOfBirth, placeOfBirth } = body;

        if (!name || !dateOfBirth || !timeOfBirth || !placeOfBirth) {
            return NextResponse.json(
                { error: 'Missing required fields' },
                { status: 400 }
            );
        }

        const birthDate = new Date(dateOfBirth + 'T' + timeOfBirth);
        if (isNaN(birthDate.getTime())) {
            return NextResponse.json(
                { error: 'Invalid date or time format' },
                { status: 400 }
            );
        }
        
        const kundliGenerator = new AccurateKundliGenerator();
        const kundliData = kundliGenerator.generateAccurateKundli({
            name,
            gender,
            dateOfBirth,
            timeOfBirth,
            placeOfBirth
        }, 'english');

        return NextResponse.json({
            success: true,
            data: kundliData
        });

    } catch (error: any) {
        console.error('Error generating Kundli:', error);
        return NextResponse.json(
            { 
                error: 'Failed to generate Kundli',
                details: error.message
            },
            { status: 500 }
        );
    }
}

