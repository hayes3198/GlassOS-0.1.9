export interface BrainscriptContext {
  print: (message: string) => void;
  notify: (message: string, type?: 'info' | 'success' | 'warning' | 'error') => void;
  systemDate: () => string;
  readFile: (path: string) => Promise<string | null>;
  prompt: (message: string) => Promise<string | null>;
}

interface BSBlock {
    name: string;
    type: 'global' | 'library' | 'conductor' | 'local';
    lines: { text: string, originalIndex: number }[];
}

export class BrainscriptInterpreter {
  private context: BrainscriptContext;
  private variables: Record<string, any> = {};
  private isRunning: boolean = false;
  private onLineChange: (line: number) => void;
  private blocks: BSBlock[] = [];

  constructor(context: BrainscriptContext, onLineChange: (line: number) => void) {
    this.context = context;
    this.onLineChange = onLineChange;
  }

  async execute(script: string) {
    if (this.isRunning) return;
    this.isRunning = true;
    this.variables = {};
    this.blocks = [];
    
    this.context.print("--- BRNSCRIPT V3 ADDR-SPACE INIT ---");
    
    try {
      this.indexBlocks(script);
      
      // Phase 1: @@global (Setting up memory map)
      for (const block of this.blocks.filter(b => b.type === 'global')) {
          await this.executeBlock(block);
      }

      // Phase 2: $$library (Syncing targets)
      for (const block of this.blocks.filter(b => b.type === 'library')) {
          await this.executeBlock(block);
      }

      // Phase 3: ###conductor (Main loop)
      const conductor = this.blocks.find(b => b.type === 'conductor');
      if (conductor) {
          await this.executeBlock(conductor);
      } else {
          for (const block of this.blocks.filter(b => b.type === 'local')) {
              await this.executeBlock(block);
          }
      }

      this.context.print("--- SYSTEM HALT: Program Terminated Successfully ---");
    } catch (e) {
      if (e instanceof Error && e.message === 'HALT') {
          this.context.print("--- PROGRAM QUIT ---");
      } else {
          this.context.notify(`Brainscript Error: ${e instanceof Error ? e.message : String(e)}`, 'error');
          this.context.print(`[FATAL] ${e instanceof Error ? e.message : String(e)}`);
      }
    } finally {
      this.isRunning = false;
      this.onLineChange(-1);
    }
  }

  private indexBlocks(script: string) {
      const lines = script.split('\n');
      let currentBlock: BSBlock | null = null;
      let inContent = false;

      for (let i = 0; i < lines.length; i++) {
          const line = lines[i].trim();
          if (!line) continue;

          let type: BSBlock['type'] | null = null;
          let name = '';

          if (line.startsWith('@@')) { type = 'global'; name = line.slice(2); }
          else if (line.startsWith('$$')) { type = 'library'; name = line.slice(2); }
          else if (line.startsWith('###')) { type = 'conductor'; name = line.slice(3); }
          else if (line.startsWith('##')) { type = 'local'; name = line.slice(2); }

          if (type) {
              currentBlock = { name, type, lines: [] };
              this.blocks.push(currentBlock);
              inContent = false;
              continue;
          }

          if (line === 'Start') { inContent = true; continue; }
          if (line === 'End') { inContent = false; currentBlock = null; continue; }

          if (inContent && currentBlock) {
              currentBlock.lines.push({ text: line, originalIndex: i });
          }
      }
  }

  private async executeBlock(block: BSBlock) {
      for (const line of block.lines) {
          if (line.text.startsWith('//') || line.text.startsWith('REM ')) continue;
          this.onLineChange(line.originalIndex);
          await this.parseAndExecute(line.text, block.type);
          await new Promise(r => setTimeout(r, 100));
      }
  }

  private async parseAndExecute(line: string, blockType: BSBlock['type']): Promise<void> {
    const rawLine = line;
    const parts = line.split(/\s+/);
    const command = parts[0].toUpperCase();

    if (command === 'QUIT') throw new Error('HALT');

    switch (command) {
      case 'SET':
      case 'LET': {
        if (blockType === 'global' && command === 'LET') throw new Error("Global addressing requires SET");
        // Support multi-set: SET $000 0 $001 1
        const entries = line.slice(parts[0].length).trim();
        // Split by variables
        const regex = /(\$[a-zA-Z0-9_.]+)/g;
        const subParts = entries.split(regex).filter(Boolean);
        
        for (let i = 0; i < subParts.length; i += 2) {
            const varName = subParts[i].trim().toLowerCase();
            let valueRaw = (subParts[i+1] || '').trim();
            // Handle optional "to"
            if (valueRaw.toLowerCase().startsWith('to ')) valueRaw = valueRaw.slice(3).trim();
            
            const resolvedValue = this.evalExpression(valueRaw);
            if (blockType === 'global') {
                if (typeof resolvedValue !== 'number' && !/^0x[0-9a-fA-F]+$/.test(String(resolvedValue)) && !line.includes("'")) {
                   // User example shows SET $000 'START OF FILE' is allowed too.
                }
            }
            this.variables[varName] = resolvedValue;
        }
        break;
      }

      case 'PRINT': {
        const expr = line.slice(6).trim();
        this.context.print(String(this.evalExpression(expr)));
        break;
      }

      case 'IF': {
        // IF $choice 1 : instructions : instructions
        const content = line.slice(3).trim();
        const mainParts = content.split(':');
        const condition = mainParts[0].trim();
        const condParts = condition.split(/\s+/);
        const lhs = this.evalExpression(condParts[0]);
        const rhs = this.evalExpression(condParts[1]);

        if (lhs == rhs) {
            if (mainParts[1]) await this.parseAndExecute(mainParts[1].trim(), blockType);
        } else {
            if (mainParts[2]) await this.parseAndExecute(mainParts[2].trim(), blockType);
        }
        break;
      }

      case 'COMPARE': {
        // COMPARE $a $b && $c $d : action_true : action_false
        const content = line.slice(8).trim();
        const sections = content.split(':');
        const conditionsTable = sections[0].split('&&');
        
        let allTrue = true;
        for (const cond of conditionsTable) {
            const cp = cond.trim().split(/\s+/);
            const v1 = this.evalExpression(cp[0]);
            const v2 = this.evalExpression(cp[1]);
            if (v1 != v2) { allTrue = false; break; }
        }

        if (allTrue) {
            if (sections[1]) {
                const subCmds = sections[1].split('&&');
                for (const sc of subCmds) await this.parseAndExecute(sc.trim(), blockType);
            }
        } else {
            if (sections[2]) {
                const subCmds = sections[2].split('&&');
                for (const sc of subCmds) await this.parseAndExecute(sc.trim(), blockType);
            }
        }
        break;
      }

      case 'BRANCH': {
        // BRANCH $var FROM 'file' TO ###target
        // BRANCH ##target
        const content = line.slice(7).trim();
        
        if (content.includes('FROM')) {
            const varNameMatch = content.match(/(\$[a-zA-Z0-9_.]+)/);
            const varName = varNameMatch ? varNameMatch[1].toLowerCase() : null;
            const fromMatch = content.match(/FROM\s+['"](.*?)['"]/);
            const filename = fromMatch ? fromMatch[1] : null;
            
            if (filename && varName) {
                const fileContent = await this.context.readFile(filename);
                if (fileContent) {
                   const fileVars = this.extractVariables(fileContent);
                   if (fileVars[varName] !== undefined) {
                       this.variables[varName] = fileVars[varName];
                   }
                }
            }
            
            const toMatch = content.match(/TO\s+(@@|###|##|\$\$)([a-zA-Z0-9_.]+)/);
            if (toMatch && varName) {
                const targetHeader = toMatch[1] + toMatch[2];
                this.context.print(`[SYSTEM] Transferred ${varName} to address ${targetHeader}`);
                // In this emulator, we just keep variables in the same map for now.
            }
            return;
        }

        const sections = content.split(':');
        for (const section of sections) {
            const targets = section.split('&&');
            for (const t of targets) {
                const cleanT = t.trim();
                const branchMatch = cleanT.match(/(##|###)([a-zA-Z0-9_.]+)/);
                if (branchMatch) {
                    const blockName = branchMatch[2];
                    const blockType = branchMatch[1] === '##' ? 'local' : 'conductor';
                    const block = this.blocks.find(b => b.type === blockType && b.name === blockName);
                    if (block) {
                        await this.executeBlock(block);
                    }
                }
            }
        }
        break;
      }

      case 'INPUT': {
          const varName = parts[1]?.toLowerCase();
          if (varName) {
              const val = await this.context.prompt("User Input Required:");
              this.variables[varName] = val;
          }
          break;
      }

      case 'DATA': {
          // DATA $000 $001 : $002
          this.context.print(`[DATA] Structural map initialized: ${line.slice(5)}`);
          break;
      }

      case 'TIMESTAMP': {
          this.context.print(`[TIME] ${new Date().toLocaleString()}`);
          break;
      }
    }
  }

  private extractVariables(script: string): Record<string, any> {
      // Basic extraction for BRANCH FROM
      const vars: Record<string, any> = {};
      const lines = script.split('\n');
      for (const l of lines) {
          const trimmed = l.trim();
          if (trimmed.toUpperCase().startsWith('SET ') || trimmed.toUpperCase().startsWith('LET ')) {
              const p = trimmed.split(/\s+/);
              if (p[1] && p[2]) vars[p[1].toLowerCase()] = p[2].replace(/['"]/g, '');
          }
      }
      return vars;
  }

  private evalExpression(expr: string): any {
    if (!expr) return "";
    let val = expr.trim();

    // Handle concatenation with &&
    if (val.includes('&&')) {
        return val.split('&&').map(v => String(this.evalExpression(v.trim()))).join(' ');
    }

    // Handle math operators
    if (/[+\-*/%<>^°]/.test(val) && !val.startsWith("'") && !val.startsWith('"')) {
        try {
            // Replace variables and functions
            let processed = val;
            // Shorthand for degrees
            processed = processed.replace(/(\d+)°/g, "($1 * Math.PI / 180)");
            
            // Functions
            processed = processed.replace(/ABS\s+(\$[a-zA-Z0-9_.]+)/g, "Math.abs($1)");
            processed = processed.replace(/CEL\s+(\$[a-zA-Z0-9_.]+)/g, "Math.ceil($1)");
            processed = processed.replace(/FLO\s+(\$[a-zA-Z0-9_.]+)/g, "Math.floor($1)");
            processed = processed.replace(/RAND\s+(\$[a-zA-Z0-9_.]+)/g, "Math.random()");
            processed = processed.replace(/LOG\s+(\$[a-zA-Z0-9_.]+)/g, "Math.log($1)");
            processed = processed.replace(/SIN\s+(\$[a-zA-Z0-9_.]+)/g, "Math.sin($1)");
            processed = processed.replace(/COS\s+(\$[a-zA-Z0-9_.]+)/g, "Math.cos($1)");
            processed = processed.replace(/TAN\s+(\$[a-zA-Z0-9_.]+)/g, "Math.tan($1)");

            // Variables
            const vars = processed.match(/(\$[a-zA-Z0-9_.]+)/g) || [];
            for (const v of vars) {
                const varVal = this.variables[v.toLowerCase()];
                processed = processed.replace(v, varVal !== undefined ? varVal : "0");
            }

            // Power
            processed = processed.replace(/\^/g, "**");
            // Inequality
            processed = processed.replace(/<>/g, "!=");

            return eval(processed);
        } catch (e) {
            return val;
        }
    }

    // String literals
    if ((val.startsWith("'") && val.endsWith("'")) || (val.startsWith('"') && val.endsWith('"'))) {
      return val.slice(1, -1);
    }

    // Variable resolution
    if (val.startsWith('$')) {
      const varName = val.toLowerCase();
      if (this.variables[varName] !== undefined) return this.variables[varName];
      
      // Memory Map Mapping
      const hex = parseInt(varName.slice(1), 16);
      if (!isNaN(hex)) {
          if (hex >= 0x0000 && hex <= 0x00FF) return 0; // Zero Page
          if (hex >= 0x8000) return 0xEE; // Secure ROM sample
      }
      return 0;
    }

    // Numbers
    if (/^-?\d+$/.test(val)) return parseInt(val);
    if (/^0x[0-9a-fA-F]+$/.test(val)) return parseInt(val, 16);
    if (!isNaN(parseFloat(val))) return parseFloat(val);

    return val;
  }
}
