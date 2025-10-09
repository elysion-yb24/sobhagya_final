/**
 * Utility functions for random background selection
 */

// Array of available astrologer profile background SVGs
const astrologerBackgrounds = [
  'Rectangle 2232.svg',
  'Rectangle 2233.svg',
  'Rectangle 2234.svg',
  'Rectangle 2235.svg',
  'Rectangle 2236.svg',
  'Rectangle 2237.svg',
  'Rectangle 2238.svg',
  'Rectangle 2239.svg'
];

/**
 * Get a random astrologer profile background SVG
 * @returns string - Path to random background SVG
 */
export function getRandomAstrologerBackground(): string {
  const randomIndex = Math.floor(Math.random() * astrologerBackgrounds.length);
  return `/astrologer-profile-bg/${astrologerBackgrounds[randomIndex]}`;
}

/**
 * Get a random astrologer profile background SVG with consistent selection
 * based on a seed (useful for consistent backgrounds per astrologer)
 * @param seed - Seed for consistent random selection
 * @returns string - Path to background SVG
 */
export function getConsistentAstrologerBackground(seed: string): string {
  // Simple hash function to convert string to number
  let hash = 0;
  for (let i = 0; i < seed.length; i++) {
    const char = seed.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32-bit integer
  }
  
  const randomIndex = Math.abs(hash) % astrologerBackgrounds.length;
  return `/astrologer-profile-bg/${astrologerBackgrounds[randomIndex]}`;
}
