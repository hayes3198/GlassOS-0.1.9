export interface GlassTheme {
  id: string;
  name: string;
  bgColor: string;       // e.g. "rgba(15, 23, 42, 0.45)"
  borderColor: string;   // e.g. "rgba(255, 255, 255, 0.15)"
  blur: number;          // e.g. 12 (in px)
  textColor: string;     // e.g. "#ffffff"
  accentColor: string;   // e.g. "#3b82f6"
  shadowColor: string;   // e.g. "rgba(31, 38, 135, 0.37)"
  isPreset?: boolean;
}

export class ThemeStorageService {
  private dbName = 'GlassOS_Themes_DB';
  private dbVersion = 1;
  private storeName = 'themes';

  private async init(): Promise<IDBDatabase> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.dbName, this.dbVersion);

      request.onupgradeneeded = (event: any) => {
        const db = event.target.result;
        if (!db.objectStoreNames.contains(this.storeName)) {
          db.createObjectStore(this.storeName, { keyPath: 'id' });
        }
      };

      request.onsuccess = (event: any) => resolve(event.target.result);
      request.onerror = (event: any) => reject(event.target.error);
    });
  }

  async saveTheme(theme: GlassTheme): Promise<void> {
    const db = await this.init();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(this.storeName, 'readwrite');
      const store = transaction.objectStore(this.storeName);
      const request = store.put(theme);

      request.onsuccess = () => resolve();
      request.onerror = (event: any) => reject(event.target.error);
    });
  }

  async deleteTheme(id: string): Promise<void> {
    const db = await this.init();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(this.storeName, 'readwrite');
      const store = transaction.objectStore(this.storeName);
      const request = store.delete(id);

      request.onsuccess = () => resolve();
      request.onerror = (event: any) => reject(event.target.error);
    });
  }

  async loadThemes(): Promise<GlassTheme[]> {
    const db = await this.init();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(this.storeName, 'readonly');
      const store = transaction.objectStore(this.storeName);
      const request = store.getAll();

      request.onsuccess = (event: any) => resolve(event.target.result || []);
      request.onerror = (event: any) => reject(event.target.error);
    });
  }
}

export const themeStorage = new ThemeStorageService();
