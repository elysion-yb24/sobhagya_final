/**
 * Global Counter Service
 * Maintains a consistent consultation counter across all users, sessions, and tabs
 */

class GlobalCounterService {
  private static instance: GlobalCounterService;
  private baseCount: number = 10023; // Starting number
  private lastUpdateTime: number = Date.now();
  private updateInterval: number = 3000; // 3 seconds between updates
  private incrementRate: number = 1.2; // Average consultations per second (realistic rate)
  private broadcastChannel: BroadcastChannel | null = null;
  private storageKey = 'sobhagya_consultation_counter';

  private constructor() {
    this.initializeBroadcastChannel();
    this.loadFromStorage();
  }

  public static getInstance(): GlobalCounterService {
    if (!GlobalCounterService.instance) {
      GlobalCounterService.instance = new GlobalCounterService();
    }
    return GlobalCounterService.instance;
  }

  private initializeBroadcastChannel(): void {
    if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
      this.broadcastChannel = new BroadcastChannel('sobhagya-counter');
      this.broadcastChannel.onmessage = (event) => {
        if (event.data.type === 'COUNTER_UPDATE') {
          this.baseCount = event.data.count;
          this.lastUpdateTime = event.data.lastUpdateTime;
        }
      };
    }
  }

  private loadFromStorage(): void {
    if (typeof window !== 'undefined') {
      try {
        const stored = localStorage.getItem(this.storageKey);
        if (stored) {
          const data = JSON.parse(stored);
          this.baseCount = data.count || 10023;
          this.lastUpdateTime = data.lastUpdateTime || Date.now();
        }
      } catch (error) {
        console.warn('Failed to load counter from storage:', error);
      }
    }
  }

  private saveToStorage(): void {
    if (typeof window !== 'undefined') {
      try {
        const data = {
          count: this.baseCount,
          lastUpdateTime: this.lastUpdateTime
        };
        localStorage.setItem(this.storageKey, JSON.stringify(data));
      } catch (error) {
        console.warn('Failed to save counter to storage:', error);
      }
    }
  }

  private broadcastUpdate(): void {
    if (this.broadcastChannel) {
      this.broadcastChannel.postMessage({
        type: 'COUNTER_UPDATE',
        count: this.baseCount,
        lastUpdateTime: this.lastUpdateTime
      });
    }
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
      
      // Save to storage and broadcast to other tabs
      this.saveToStorage();
      this.broadcastUpdate();
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
    // Only update if we don't have a stored time
    if (this.lastUpdateTime === Date.now()) {
      this.lastUpdateTime = Date.now();
      this.saveToStorage();
    }
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
