/**
 * Display.lib.ts
 * Manages system-wide visual persistence, blur depth, 
 * and virtual display mapping.
 */

export interface DisplayConfig {
  blurPersistence: number; // 0 to 1
  motionBlur: boolean;
  refreshRate: number;
  scaling: number;
  ghostingEnabled: boolean;
}

export class DisplayLib {
  private static config: DisplayConfig = {
    blurPersistence: 0.8,
    motionBlur: true,
    refreshRate: 60,
    scaling: 100,
    ghostingEnabled: false,
  };

  static getConfig(): DisplayConfig {
    return { ...this.config };
  }

  static updateConfig(updates: Partial<DisplayConfig>) {
    this.config = { ...this.config, ...updates };
    this.applyToRoot();
  }

  private static applyToRoot() {
    if (typeof document !== 'undefined') {
      const root = document.documentElement;
      root.style.setProperty('--glass-blur', `${this.config.blurPersistence * 24}px`);
      root.style.setProperty('--system-scaling', `${this.config.scaling / 100}`);
      
      if (this.config.motionBlur) {
        root.classList.add('system-motion-blur');
      } else {
        root.classList.remove('system-motion-blur');
      }
    }
  }
}
