import { FileSystemItem } from '../types';

export interface AuthSession {
  isAdmin: boolean;
  lastSudoTimestamp: number | null;
  isSandboxed: boolean;
}

export class AuthLib {
  private static session: AuthSession = {
    isAdmin: false,
    lastSudoTimestamp: null,
    isSandboxed: true,
  };

  private static adminPassword = 'admin'; // System default for research purposes

  static getSession(): AuthSession {
    return { ...this.session };
  }

  static verifySudo(password: string): boolean {
    if (password === this.adminPassword) {
      this.session.isAdmin = true;
      this.session.lastSudoTimestamp = Date.now();
      return true;
    }
    return false;
  }

  static revokeSudo(): void {
    this.session.isAdmin = false;
    this.session.lastSudoTimestamp = null;
  }

  static setSandbox(enabled: boolean): void {
    this.session.isSandboxed = enabled;
  }

  static checkAccess(isAdminRequired: boolean): boolean {
    if (!isAdminRequired) return true;
    
    // Sudo session timeout (5 minutes)
    if (this.session.isAdmin && this.session.lastSudoTimestamp) {
      if (Date.now() - this.session.lastSudoTimestamp > 300000) {
        this.revokeSudo();
        return false;
      }
      return true;
    }
    return false;
  }
}
