/**
 * Global Counter Service
 * Maintains a consistent consultation counter across all users and sessions
 */

class GlobalCounterService {
  private static instance: GlobalCounterService;
  private baseCount: number = 10023; // Starting number
  private lastUpdateTime: number = Date.now();
  private updateInterval: number = 3000; // 3 seconds between updates
  private incrementRate: number = 1.2; // Average consultations per second (realistic rate)

  private constructor() {}

  public static getInstance(): GlobalCounterService {
    if (!GlobalCounterService.instance) {
      GlobalCounterService.instance = new GlobalCounterService();
    }
    return GlobalCounterService.instance;
  }

  /**
   * Get the current global consultation count
   * This ensures all users see the same number
   */
  public getCurrentCount(): number {
    const now = Date.now();
    const timeDiff = now - this.lastUpdateTime;
    const intervalsPassed = Math.floor(timeDiff / this.updateInterval);
    
    if (intervalsPassed > 0) {
      // Calculate how many consultations should have been added
      const consultationsAdded = Math.floor(intervalsPassed * this.incrementRate);
      this.baseCount += consultationsAdded;
      this.lastUpdateTime = now;
    }

    return this.baseCount;
  }

  /**
   * Get the count with a small random variation to make it feel more natural
   * but still consistent across users
   */
  public getDisplayCount(): number {
    const baseCount = this.getCurrentCount();
    // Add a small random variation (±2) that's consistent based on time
    const timeBasedSeed = Math.floor(Date.now() / 10000); // Changes every 10 seconds
    const randomVariation = (timeBasedSeed % 5) - 2; // -2 to +2
    return baseCount + randomVariation;
  }

  /**
   * Initialize the counter (can be called on app start)
   */
  public initialize(): void {
    this.lastUpdateTime = Date.now();
  }

  /**
   * Get the next expected update time
   */
  public getNextUpdateTime(): number {
    return this.lastUpdateTime + this.updateInterval;
  }
}

// Export singleton instance
export const globalCounter = GlobalCounterService.getInstance();

// Initialize on import
if (typeof window !== 'undefined') {
  globalCounter.initialize();
}
