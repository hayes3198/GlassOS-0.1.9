/**
 * Bridge.lib.ts
 * The "Switchboard" for GlassOS. 
 * Allows apps to link, embed, and share state (OLE).
 */

export interface AppStateRef {
  id: string;
  getData: () => any;
  setData: (data: any) => void;
  getSelection?: () => string;
  query?: (filter: string) => any;
}

export class BridgeLib {
  private static registeredApps: Map<string, AppStateRef> = new Map();

  static registerApp(idOrApp: string | AppStateRef, appRef?: Partial<AppStateRef>) {
    if (typeof idOrApp === 'string') {
      this.registeredApps.set(idOrApp, {
        id: idOrApp,
        getData: appRef?.getData || (() => null),
        setData: appRef?.setData || (() => {}),
        getSelection: appRef?.getSelection,
        query: appRef?.query
      });
    } else {
      this.registeredApps.set(idOrApp.id, idOrApp);
    }
  }

  static unregisterApp(id: string) {
    this.registeredApps.delete(id);
  }

  static getAppData(id: string): any {
    const app = this.registeredApps.get(id);
    return app ? app.getData() : null;
  }

  static setAppData(id: string, data: any) {
    const app = this.registeredApps.get(id);
    if (app) app.setData(data);
  }

  static getSelection(id: string): string | null {
    const app = this.registeredApps.get(id);
    return app?.getSelection ? app.getSelection() : null;
  }

  /**
   * Cross-App Query
   */
  static async query(id: string, filter: string): Promise<any> {
    const app = this.registeredApps.get(id);
    if (app?.query) return app.query(filter);
    
    const data = app?.getData();
    if (Array.isArray(data)) {
      return data.filter((item: any) => 
        JSON.stringify(item).toLowerCase().includes(filter.toLowerCase())
      );
    }
    return data;
  }
}
