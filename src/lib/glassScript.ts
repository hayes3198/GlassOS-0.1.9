
import { AppId } from '../types';

export interface GlassScriptContext {
  activeApp: AppId | null;
  notified: (message: string, title?: string, type?: 'info' | 'success' | 'warning' | 'error') => void;
  updateNotepad: (content: string) => void;
  getNotepadContent: () => string;
  setNotepadStyle: (style: any) => void;
  openWindow: (id: AppId, title: string) => void;
  systemDate: () => string;
}

export class GlassScriptInterpreter {
  private context: GlassScriptContext;
  private currentApp: string | null = null;
  private isRunning: boolean = false;
  private onLineChange: (line: number) => void;

  constructor(context: GlassScriptContext, onLineChange: (line: number) => void) {
    this.context = context;
    this.onLineChange = onLineChange;
  }

  async execute(script: string) {
    if (this.isRunning) return;
    this.isRunning = true;
    
    const lines = script.split('\n');
    
    try {
      for (let i = 0; i < lines.length; i++) {
        const line = lines[i].trim();
        if (!line || line.startsWith('--')) continue;

        this.onLineChange(i);
        await this.parseAndExecute(line);
        // Small delay for "visual typing" effect if requested, or just to keep UI smooth
        await new Promise(r => setTimeout(r, 100));
      }
    } catch (e) {
      this.context.notified(`GlassScript Error: ${e instanceof Error ? e.message : String(e)}`, 'Script Error', 'error');
    } finally {
      this.isRunning = false;
      this.onLineChange(-1);
    }
  }

  private async parseAndExecute(line: string) {
    // Basic regex-based parsing
    const tellMatch = line.match(/^tell app "([^"]+)"/i);
    if (tellMatch) {
      this.currentApp = tellMatch[1];
      return;
    }

    if (line.toLowerCase() === 'end tell') {
      this.currentApp = null;
      return;
    }

    const setMatch = line.match(/^set ([^ ]+(?: [^ ]+)?) to (.+)$/i);
    if (setMatch) {
      const key = setMatch[1].toLowerCase();
      let value = setMatch[2].trim();

      // Resolve variables/expressions
      value = this.resolveValue(value);

      if (this.currentApp === 'Notepad') {
        if (key === 'font size') {
          this.context.setNotepadStyle({ fontSize: value + 'px' });
        } else if (key === 'style') {
          this.context.setNotepadStyle({ fontWeight: value === 'bold' ? 'bold' : 'normal' });
        }
      } else if (key === 'window opacity') {
          // System level stuff could go here
      }
      return;
    }

    const writeMatch = line.match(/^write (.+)$/i);
    if (writeMatch) {
      let content = writeMatch[1].trim();
      content = this.resolveValue(content);
      
      if (this.currentApp === 'Notepad') {
        const current = this.context.getNotepadContent();
        this.context.updateNotepad(current + content);
      }
      return;
    }

    const notifyMatch = line.match(/^notify "([^"]+)"/i);
    if (notifyMatch) {
      this.context.notified(notifyMatch[1], 'GlassScript', 'info');
      return;
    }

    const alignMatch = line.match(/^align (left|center|right)/i);
    if (alignMatch) {
      if (this.currentApp === 'Notepad') {
        this.context.setNotepadStyle({ textAlign: alignMatch[1] });
      }
      return;
    }

    if (line.toLowerCase() === 'insert newline') {
      if (this.currentApp === 'Notepad') {
        const current = this.context.getNotepadContent();
        this.context.updateNotepad(current + '\n');
      }
      return;
    }

    const waitMatch = line.match(/^wait (\d+)/i);
    if (waitMatch) {
      const ms = parseInt(waitMatch[1]);
      await new Promise(r => setTimeout(r, ms));
      return;
    }
  }

  private resolveValue(val: string): string {
    // Remove quotes
    if (val.startsWith('"') && val.endsWith('"')) {
      return val.slice(1, -1);
    }

    // Handle concatenation with &
    if (val.includes('&')) {
      const parts = val.split('&').map(p => p.trim());
      return parts.map(p => this.resolveValue(p)).join('');
    }

    // System variables
    if (val.toLowerCase() === 'system.date') {
      return this.context.systemDate();
    }

    return val;
  }
}
