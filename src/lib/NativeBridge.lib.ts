/**
 * NativeBridge.lib.ts
 * Mocks the communication layer between the GlassOS UI and the underlying system.
 * In a real Electron app, this would use ipcRenderer/ipcMain.
 */

export interface SystemInfo {
  platform: string;
  arch: string;
  memory: {
    total: number;
    free: number;
  };
  uptime: number;
  cpu: string;
}

class NativeBridge {
  private static instance: NativeBridge;
  
  private constructor() {}

  static getInstance() {
    if (!NativeBridge.instance) {
      NativeBridge.instance = new NativeBridge();
    }
    return NativeBridge.instance;
  }

  /**
   * Executes a command on the mock system.
   */
  async executeCommand(command: string): Promise<{ stdout: string; stderr: string; code: number }> {
    console.log(`[NativeBridge] Executing: ${command}`);
    
    // Simple simulation of system commands
    return new Promise((resolve) => {
      setTimeout(() => {
        if (command === 'whoami') {
          resolve({ stdout: 'glass_user', stderr: '', code: 0 });
        } else if (command === 'uname -a') {
          resolve({ stdout: 'GlassOS 1.0.0-PRO-X86_64', stderr: '', code: 0 });
        } else {
          resolve({ stdout: '', stderr: `bash: ${command}: command not found`, code: 127 });
        }
      }, 500);
    });
  }

  /**
   * Returns system resource info.
   */
  async getSystemInfo(): Promise<SystemInfo> {
    return {
      platform: 'GlassOS',
      arch: 'x64',
      memory: {
        total: 16 * 1024 * 1024 * 1024, // 16GB
        free: 4 * 1024 * 1024 * 1024, // 4GB
      },
      uptime: Math.floor(performance.now() / 1000),
      cpu: 'Glass-X1 Silicon'
    };
  }

  /**
   * Mock for file system permissions check at the OS level.
   */
  async checkOSPermission(path: string, mode: 'r' | 'w' | 'x'): Promise<boolean> {
    // In a real native bridge, this would check the host OS permissions
    // Here we just allow everything unless it's /sys
    if (path.startsWith('/sys') && mode === 'w') return false;
    return true;
  }
}

export const nativeBridge = NativeBridge.getInstance();
