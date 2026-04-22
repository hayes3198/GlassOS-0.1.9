
import { AppId } from '../types';
import { BridgeLib } from './Bridge.lib';

export interface GlassScriptContext {
  activeApp: AppId | null;
  notified: (message: string, title?: string, type?: 'info' | 'success' | 'warning' | 'error') => void;
  updateNotepad: (content: string) => void;
  getNotepadContent: () => string;
  setNotepadStyle: (style: any) => void;
  openWindow: (id: AppId, title: string) => void;
  systemDate: () => string;
  db?: {
    getCollections: () => any;
    setCollections: (collections: any) => void;
  };
}

export class GlassScriptInterpreter {
  private context: GlassScriptContext;
  private currentApp: string | null = null;
  private isRunning: boolean = false;
  private onLineChange: (line: number) => void;
  private activeTable: string | null = null;
  private variables: Record<string, any> = {};
  private ifStack: boolean[] = [];

  constructor(context: GlassScriptContext, onLineChange: (line: number) => void) {
    this.context = context;
    this.onLineChange = onLineChange;
  }

  async execute(script: string) {
    if (this.isRunning) return;
    this.isRunning = true;
    this.variables = {};
    this.activeTable = null;
    this.ifStack = [];
    
    const lines = script.split('\n');
    
    try {
      for (let i = 0; i < lines.length; i++) {
        const line = lines[i].trim();
        if (!line || line.startsWith('--')) continue;

        const lowerLine = line.toLowerCase();

        // Handle If/Else/End If blocks
        if (lowerLine.startsWith('if ')) {
            const condition = line.slice(3).trim();
            this.ifStack.push(this.evaluateCondition(condition));
            this.onLineChange(i);
            continue;
        }

        if (lowerLine === 'else') {
            if (this.ifStack.length > 0) {
                this.ifStack[this.ifStack.length - 1] = !this.ifStack[this.ifStack.length - 1];
            }
            this.onLineChange(i);
            continue;
        }

        if (lowerLine === 'end if') {
            this.ifStack.pop();
            this.onLineChange(i);
            continue;
        }

        // Skip execution if inside a false branch
        if (this.ifStack.length > 0 && !this.ifStack[this.ifStack.length - 1]) {
            continue;
        }

        this.onLineChange(i);
        await this.parseAndExecute(line);
        await new Promise(r => setTimeout(r, 50));
      }
    } catch (e) {
      this.context.notified(`GlassScript Error: ${e instanceof Error ? e.message : String(e)}`, 'Script Error', 'error');
    } finally {
      this.isRunning = false;
      this.onLineChange(-1);
    }
  }

  private evaluateCondition(condition: string): boolean {
      // Basic "is" or "is not" or "contains"
      if (condition.includes(' is not ')) {
          const [left, right] = condition.split(' is not ').map(s => s.trim());
          return this.resolveValue(left) !== this.resolveValue(right);
      }
      if (condition.includes(' is ')) {
          const [left, right] = condition.split(' is ').map(s => s.trim());
          return this.resolveValue(left) === this.resolveValue(right);
      }
      if (condition.includes(' contains ')) {
          const [left, right] = condition.split(' contains ').map(s => s.trim());
          return this.resolveValue(left).includes(this.resolveValue(right));
      }
      return false;
  }

  private async parseAndExecute(line: string) {
    const lowerLine = line.toLowerCase();

    // App Context
    const tellMatch = line.match(/^tell app "([^"]+)"/i);
    if (tellMatch) {
      this.currentApp = tellMatch[1];
      return;
    }

    if (lowerLine === 'end tell') {
      this.currentApp = null;
      return;
    }

    // Database: Query Table
    const queryMatch = line.match(/^query table "([^"]+)"/i);
    if (queryMatch) {
      if (this.currentApp === 'GlassDatabase') {
        this.activeTable = queryMatch[1];
      }
      return;
    }

    // GlassWord: Get Selection
    const selectionMatch = line.match(/^get selection(?: to ([^ ]+))?$/i);
    if (selectionMatch) {
        const targetVar = (selectionMatch[1] || 'selection').toLowerCase();
        const appId = (this.currentApp === 'GlassWord' || !this.currentApp) ? 'glassword' : this.currentApp.toLowerCase();
        
        // Explicitly get from Bridge
        const selection = BridgeLib.getSelection(appId);
        if (selection !== null) {
            this.variables[targetVar] = selection;
            if (!selectionMatch[1]) {
                this.context.notified(`Selection captured: "${selection.substring(0, 20)}${selection.length > 20 ? '...' : ''}"`, 'OLE Bridge', 'info');
            }
        }
        return;
    }

    // GlassSheets: Set Cell
    const cellMatch = line.match(/^set value of cell ([A-Z]+[0-9]+) to (.+)$/i);
    if (cellMatch) {
        if (this.currentApp === 'GlassSheets') {
            const cellId = cellMatch[1].toUpperCase();
            const value = this.resolveValue(cellMatch[2]);
            const data = BridgeLib.getAppData('glasssheets');
            if (data) {
                try {
                    const grid = typeof data === 'string' ? JSON.parse(data) : data;
                    const col = cellId.charCodeAt(0) - 65;
                    const row = parseInt(cellId.slice(1)) - 1;
                    if (grid[row] && grid[row][col] !== undefined) {
                        grid[row][col] = value;
                        BridgeLib.setAppData('glasssheets', JSON.stringify(grid));
                        this.context.notified(`Cell ${cellId} set to "${value}"`, 'GlassSheets OLE', 'info');
                    }
                } catch(e) {}
            }
        }
        return;
    }

    const getCellMatch = line.match(/^get value of cell ([A-Z]+[0-9]+) to ([^ ]+)$/i);
    if (getCellMatch) {
        if (this.currentApp === 'GlassSheets') {
            const cellId = getCellMatch[1].toUpperCase();
            const varName = getCellMatch[2].toLowerCase();
            const data = BridgeLib.getAppData('glasssheets');
            if (data) {
                try {
                    const grid = typeof data === 'string' ? JSON.parse(data) : data;
                    const col = cellId.charCodeAt(0) - 65;
                    const row = parseInt(cellId.slice(1)) - 1;
                    if (grid[row] && grid[row][col] !== undefined) {
                        this.variables[varName] = grid[row][col];
                    }
                } catch(e) {}
            }
        }
        return;
    }

    // Database: Row Count to variable
    const countMatch = line.match(/^get count to ([^ ]+)$/i);
    if (countMatch) {
        if (this.currentApp === 'GlassDatabase' && this.activeTable && this.context.db) {
            const collections = this.context.db.getCollections();
            const table = collections[this.activeTable] || [];
            this.variables[countMatch[1].toLowerCase()] = table.length.toString();
        }
        return;
    }

    // Database: Insert Record
    const insertMatch = line.match(/^insert record "([^"]+)"/i);
    if (insertMatch) {
      if (this.currentApp === 'GlassDatabase' && this.activeTable && this.context.db) {
        const dataStr = insertMatch[1];
        const data: any = {};
        dataStr.split(',').forEach(part => {
          const [key, val] = part.split(':').map(s => s.trim());
          if (key && val) data[key] = this.resolveValue(val);
        });
        
        const collections = { ...this.context.db.getCollections() };
        const table = Array.isArray(collections[this.activeTable]) ? [...collections[this.activeTable]] : [];
        table.push(data);
        collections[this.activeTable] = table;
        this.context.db.setCollections(collections);
      }
      return;
    }

    // Database: Delete records
    const deleteMatch = line.match(/^delete records where ([^ ]+) is "([^"]+)"/i);
    if (deleteMatch) {
        if (this.currentApp === 'GlassDatabase' && this.activeTable && this.context.db) {
            const field = deleteMatch[1];
            const value = this.resolveValue(deleteMatch[2]);
            const collections = { ...this.context.db.getCollections() };
            const table = Array.isArray(collections[this.activeTable]) ? 
                collections[this.activeTable].filter((r: any) => r[field]?.toString() !== value) : [];
            collections[this.activeTable] = table;
            this.context.db.setCollections(collections);
        }
        return;
    }

    // Variable Assignment
    const setMatch = line.match(/^set ([^ ]+(?: [^ ]+)?) to (.+)$/i);
    if (setMatch) {
      const key = setMatch[1].toLowerCase();
      let value = setMatch[2].trim();
      value = this.resolveValue(value);

      if (this.currentApp === 'Notepad') {
        if (key === 'font size') this.context.setNotepadStyle({ fontSize: value + 'px' });
        else if (key === 'style') this.context.setNotepadStyle({ fontWeight: value === 'bold' ? 'bold' : 'normal' });
      } else {
        this.variables[key] = value;
      }
      return;
    }

    // Notepad Actions
    const writeMatch = line.match(/^write (.+)$/i);
    if (writeMatch) {
      let content = this.resolveValue(writeMatch[1].trim());
      if (this.currentApp === 'Notepad') {
        const current = this.context.getNotepadContent();
        this.context.updateNotepad(current + content);
      }
      return;
    }

    const alignMatch = line.match(/^align (left|center|right)/i);
    if (alignMatch) {
      if (this.currentApp === 'Notepad') this.context.setNotepadStyle({ textAlign: alignMatch[1] });
      return;
    }

    if (lowerLine === 'insert newline') {
      if (this.currentApp === 'Notepad') {
        const current = this.context.getNotepadContent();
        this.context.updateNotepad(current + '\n');
      }
      return;
    }

    // Global Actions
    const notifyMatch = line.match(/^notify "([^"]+)"/i);
    if (notifyMatch) {
      this.context.notified(this.resolveValue(notifyMatch[1]), 'GlassScript', 'info');
      return;
    }

    const openMatch = line.match(/^open app "([^"]+)"/i);
    if (openMatch) {
      this.context.openWindow(openMatch[1] as AppId, openMatch[1].charAt(0).toUpperCase() + openMatch[1].slice(1));
      return;
    }

    const waitMatch = line.match(/^wait (\d+)/i);
    if (waitMatch) {
      await new Promise(r => setTimeout(r, parseInt(waitMatch[1])));
      return;
    }
  }

  private resolveValue(val: string): string {
    if (val.startsWith('"') && val.endsWith('"')) return val.slice(1, -1);
    
    // Check variables
    if (this.variables[val.toLowerCase()] !== undefined) return this.variables[val.toLowerCase()];

    if (val.includes('&')) {
      return val.split('&').map(p => this.resolveValue(p.trim())).join('');
    }

    if (val.toLowerCase() === 'system.date') return this.context.systemDate();

    return val;
  }
}
