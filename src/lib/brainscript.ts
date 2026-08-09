export interface BrainscriptContext {
  print: (message: string) => void;
  notify: (message: string, type?: 'info' | 'success' | 'warning' | 'error') => void;
  systemDate: () => string;
  readFile: (path: string) => Promise<string | null>;
  writeFile?: (path: string, content: string) => Promise<void>;
  prompt: (message: string) => Promise<string | null>;
}

export interface BSBlock {
  name: string;
  type: 'global' | 'library' | 'conductor' | 'local';
  rawHeader: string;
  lines: { text: string; originalIndex: number }[];
}

export class BrainscriptInterpreter {
  private context: BrainscriptContext;
  private variables: Record<string, any> = {};
  private isRunning: boolean = false;
  private onLineChange: (line: number) => void;
  private blocks: BSBlock[] = [];
  private currentLine: number = 0;
  private loopCounters: Record<string, number> = {};

  constructor(context: BrainscriptContext, onLineChange: (line: number) => void) {
    this.context = context;
    this.onLineChange = onLineChange;
    // Pre-initialize System Reserved Memory Space ($000 - $02F)
    this.variables['$000'] = '0x00';
    this.variables['$001'] = 'SYSTEM_READY';
  }

  async execute(script: string) {
    if (this.isRunning) return;
    this.isRunning = true;
    this.variables = { '$000': '0x00', '$001': 'SYSTEM_READY' };
    this.blocks = [];
    this.currentLine = 0;
    this.loopCounters = {};

    this.context.print("--- B (BRAINSCRIPT) KERNEL VM v3.8 ONLINE ---");
    this.context.print("Memory Segments Allocated: $000-$02F (SYS), $030-$0FF (GLOB), $100-$1FF (LIB), $200-$2FF (COND), $300-$7FF (LOC), $800-$9FF (USER)");

    try {
      this.indexBlocks(script);

      if (this.blocks.length === 0) {
        // Fallback for flat scripts without @@, $$, ###, ## headers
        const lines = script.split('\n').map((l, i) => ({ text: l.trim(), originalIndex: i }));
        const syntheticBlock: BSBlock = {
          name: 'MAIN',
          type: 'conductor',
          rawHeader: '###MAIN',
          lines: lines.filter(l => l.text && l.text !== 'Start' && l.text !== 'End')
        };
        this.blocks.push(syntheticBlock);
      }

      // Phase 1: @@Global Parent Definitions (Setting up memory map & system globals)
      for (const block of this.blocks.filter(b => b.type === 'global')) {
        await this.executeBlock(block);
      }

      // Phase 2: $$Library/Resource Definitions
      for (const block of this.blocks.filter(b => b.type === 'library')) {
        await this.executeBlock(block);
      }

      // Phase 3: ###Conductor / Entry Point (Primary runtime execution loop)
      const conductor = this.blocks.find(b => b.type === 'conductor');
      if (conductor) {
        await this.executeBlock(conductor);
      } else {
        // Execute local blocks if no conductor is declared
        for (const block of this.blocks.filter(b => b.type === 'local')) {
          await this.executeBlock(block);
        }
      }

      this.context.print("--- SYSTEM HALT: Program Terminated Successfully ---");
    } catch (e) {
      if (e instanceof Error && e.message === 'HALT') {
        this.context.print("--- PROGRAM QUIT (HALT SIGNAL) ---");
      } else {
        const errMsg = e instanceof Error ? e.message : String(e);
        const formattedError = `Brainscript VM Error at Line ${this.currentLine + 1}: ${errMsg}`;
        this.context.notify(formattedError, 'error');
        this.context.print(`[FATAL KERNEL TRAP] ${formattedError}`);
      }
    } finally {
      this.isRunning = false;
      this.onLineChange(-1);
    }
  }

  private indexBlocks(script: string) {
    const lines = script.split('\n');
    let currentBlock: BSBlock | null = null;
    let inContent = true;

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
        currentBlock = { name, type, rawHeader: line, lines: [] };
        this.blocks.push(currentBlock);
        inContent = false;
        continue;
      }

      if (line === 'Start') { inContent = true; continue; }
      if (line === 'End') { inContent = false; currentBlock = null; continue; }

      if (inContent && currentBlock) {
        currentBlock.lines.push({ text: line, originalIndex: i });
      } else if (!currentBlock && line && !line.startsWith('//') && !line.startsWith('REM')) {
        // Line outside explicit block, attach to a fallback global or conductor if available
        if (!this.blocks.some(b => b.name === 'IMPLICIT_MAIN')) {
          currentBlock = { name: 'IMPLICIT_MAIN', type: 'conductor', rawHeader: '###IMPLICIT_MAIN', lines: [] };
          this.blocks.push(currentBlock);
        }
        const implicit = this.blocks.find(b => b.name === 'IMPLICIT_MAIN');
        if (implicit) implicit.lines.push({ text: line, originalIndex: i });
      }
    }
  }

  private async executeBlock(block: BSBlock) {
    for (let idx = 0; idx < block.lines.length; idx++) {
      const lineObj = block.lines[idx];
      const lineText = lineObj.text;

      if (lineText.startsWith('//') || lineText.startsWith('REM')) continue;

      this.currentLine = lineObj.originalIndex;
      this.onLineChange(this.currentLine);

      const commandExecuted = await this.parseAndExecute(lineText, block);
      if (commandExecuted === 'QUIT') {
        throw new Error('HALT');
      }
      await new Promise(r => setTimeout(r, 60));
    }
  }

  private async parseAndExecute(line: string, currentBlock: BSBlock): Promise<string | void> {
    const trimmed = line.trim();
    if (!trimmed) return;

    // Direct check for QUIT
    if (trimmed.toUpperCase() === 'QUIT') return 'QUIT';

    // Parse command keyword
    const spaceIdx = trimmed.indexOf(' ');
    const command = (spaceIdx === -1 ? trimmed : trimmed.slice(0, spaceIdx)).toUpperCase();
    const rest = spaceIdx === -1 ? '' : trimmed.slice(spaceIdx + 1).trim();

    switch (command) {
      case 'SET':
      case 'LET': {
        // Multi-assignment support: SET $000 0 $001 1 or LET $var value
        this.handleAssignment(rest, command);
        break;
      }

      case 'PRINT': {
        // PRINT 'text' && $var
        // PRINT $var TO $targetvar FROM ##targetblock
        if (rest.includes(' TO ') && rest.includes(' FROM ')) {
          const match = rest.match(/(\$[a-zA-Z0-9_.]+)\s+TO\s+(\$[a-zA-Z0-9_.]+)\s+FROM\s+(##|###|@@|\$\$)([a-zA-Z0-9_.]+)/i);
          if (match) {
            const srcVar = match[1].toLowerCase();
            const dstVar = match[2].toLowerCase();
            const val = this.variables[srcVar] !== undefined ? this.variables[srcVar] : 'NULL';
            this.variables[dstVar] = val;
            this.context.print(`[DATA ROUTE] ${srcVar} (${val}) -> ${dstVar} via ${match[3]}${match[4]}`);
            return;
          }
        }

        const evaluated = this.evalExpression(rest);
        this.context.print(String(evaluated));
        break;
      }

      case 'BRANCH': {
        // BRANCH syntax forms:
        // 1. BRANCH ##targetobject
        // 2. BRANCH ##targetobject COUNT 10
        // 3. BRANCH $var TO ##target
        // 4. BRANCH $var TO file 'log.txt'
        // 5. BRANCH $var FROM file 'config.txt'
        // 6. BRANCH $v1 && $v2 TO ##target
        // 7. BRANCH $v1 TO ##t1 : $v2 TO ##t2
        await this.handleBranch(rest, currentBlock);
        break;
      }

      case 'COMPARE': {
        // COMPARE $000 $001 : PRINT 'OK' : PRINT 'FAIL'
        // COMPARE $var1 $var2 && $var3 $var4 : ##TargetA : ##TargetB
        await this.handleCompare(rest, currentBlock);
        break;
      }

      case 'IF': {
        // IF $choice 1 : BRANCH ##handle1 : IF $choice 2 : BRANCH ##handle2 :: BRANCH ##default
        // IF $status == "ACTIVE" : START PRINT "ONLINE" END
        await this.handleIf(rest, currentBlock);
        break;
      }

      case 'INPUT': {
        // INPUT $username or INPUT $username: "Enter username: "
        let varName = rest;
        let promptMsg = 'User Input Required:';
        if (rest.includes(':')) {
          const parts = rest.split(':');
          varName = parts[0].trim();
          promptMsg = this.evalExpression(parts.slice(1).join(':').trim());
        }
        varName = varName.trim().toLowerCase();
        if (varName) {
          const userInput = await this.context.prompt(promptMsg);
          this.variables[varName] = userInput !== null ? userInput : '';
          this.context.print(`[INPUT] ${varName} = "${this.variables[varName]}"`);
        }
        break;
      }

      case 'DATA': {
        this.context.print(`[DATA SCHEMA] Map registered: ${rest}`);
        break;
      }

      case 'TIMESTAMP': {
        const timeStr = this.context.systemDate ? this.context.systemDate() : new Date().toLocaleString();
        this.context.print(`[TIMESTAMP] ${timeStr}`);
        break;
      }

      case 'QUIT': {
        return 'QUIT';
      }

      default: {
        // Ignore inline comments or unknown directives
        if (trimmed.startsWith('//') || trimmed.startsWith('REM')) break;
        throw new Error(`Unknown B command directive: '${command}'`);
      }
    }
  }

  private handleAssignment(argsStr: string, mode: 'SET' | 'LET') {
    if (!argsStr) return;

    // Pattern: single assignment or tokenized pairs
    // e.g. LET $math 100° * 90° or LET $appName "My App"
    // Or SET $000 0 $001 1 $002 2
    const tokens = argsStr.trim();

    // Check if it's a simple assignment: $var expression
    const firstSpace = tokens.indexOf(' ');
    if (firstSpace === -1) return;

    const varName = tokens.slice(0, firstSpace).trim().toLowerCase();
    const restExpr = tokens.slice(firstSpace + 1).trim();

    if (varName.startsWith('$') || varName.startsWith('self.')) {
      // Check if restExpr contains multi SET pattern like "0 $001 1 $002 2"
      if (mode === 'SET' && /\$[a-zA-Z0-9_.]+\s+/.test(restExpr) && !restExpr.includes('"') && !restExpr.includes("'") && !/[+*\-/%]/.test(restExpr)) {
        // Multi SET token parsing
        const parts = tokens.split(/\s+/);
        for (let i = 0; i < parts.length; i += 2) {
          const name = parts[i]?.toLowerCase();
          const val = parts[i + 1];
          if (name && val !== undefined) {
            this.variables[name] = this.evalExpression(val);
          }
        }
        return;
      }

      const evaluatedVal = this.evalExpression(restExpr);
      this.variables[varName] = evaluatedVal;
      this.validateMemoryRange(varName);
    }
  }

  private validateMemoryRange(varName: string) {
    if (varName.startsWith('$')) {
      const hex = parseInt(varName.slice(1), 16);
      if (!isNaN(hex)) {
        // Informative logging for B language Hex Register allocations
        if (hex >= 0x000 && hex <= 0x02F) {
          // System Reserved
        } else if (hex >= 0x030 && hex <= 0x0FF) {
          // Global Reserved
        } else if (hex >= 0x100 && hex <= 0x1FF) {
          // Library Reserved
        } else if (hex >= 0x200 && hex <= 0x2FF) {
          // Conductor Reserved
        } else if (hex >= 0x300 && hex <= 0x7FF) {
          // Local Reserved
        } else if (hex >= 0x800 && hex <= 0x9FF) {
          // User Defined
        }
      }
    }
  }

  private async handleBranch(content: string, currentBlock: BSBlock) {
    if (!content) return;

    // Check for GET (FROM file/source): BRANCH $targetvar FROM 'file.txt' or FROM file 'file.txt'
    if (content.toUpperCase().includes('FROM')) {
      const varMatch = content.match(/(\$[a-zA-Z0-9_.]+)/);
      const varName = varMatch ? varMatch[1].toLowerCase() : null;
      const fileMatch = content.match(/FROM\s+(?:file\s+)?['"](.*?)['"]/i);
      const filename = fileMatch ? fileMatch[1] : null;

      if (varName && filename) {
        const fileContent = await this.context.readFile(filename);
        if (fileContent !== null) {
          this.variables[varName] = fileContent.trim();
          this.context.print(`[I/O GET] Read ${filename} into ${varName}`);
        } else {
          this.context.print(`[I/O GET] File ${filename} empty or not found.`);
        }
      }
      return;
    }

    // Check for POST (TO file): BRANCH $source TO file 'log.txt'
    if (content.toUpperCase().includes('TO FILE')) {
      const varMatch = content.match(/(\$[a-zA-Z0-9_.]+)/);
      const fileMatch = content.match(/TO\s+file\s+['"](.*?)['"]/i);
      const varName = varMatch ? varMatch[1].toLowerCase() : null;
      const filename = fileMatch ? fileMatch[1] : null;

      if (varName && filename && this.context.writeFile) {
        const val = this.variables[varName] !== undefined ? String(this.variables[varName]) : '';
        await this.context.writeFile(filename, val);
        this.context.print(`[I/O POST] Wrote ${varName} to ${filename}`);
      }
      return;
    }

    // Check for COUNT loop: BRANCH ##LoopStart COUNT 10
    const countMatch = content.match(/(##|###|@@|\$\$)([a-zA-Z0-9_.]+)\s+COUNT\s+(\d+|\$[a-zA-Z0-9_.]+)/i);
    if (countMatch) {
      const targetHeader = countMatch[1] + countMatch[2];
      const countVal = parseInt(String(this.evalExpression(countMatch[3])), 10) || 1;

      if (!this.loopCounters[targetHeader]) {
        this.loopCounters[targetHeader] = countVal;
      }

      if (this.loopCounters[targetHeader] > 0) {
        this.loopCounters[targetHeader]--;
        const targetBlock = this.findBlockByHeader(targetHeader);
        if (targetBlock) {
          await this.executeBlock(targetBlock);
        }
      }
      return;
    }

    // Normal or parallel routing: BRANCH ##target or BRANCH $v1 TO ##t1 : $v2 TO ##t2
    const sections = content.split(':');
    for (const section of sections) {
      const targets = section.split('&&');
      for (const t of targets) {
        const cleanT = t.trim();
        const headerMatch = cleanT.match(/(##|###|@@|\$\$)([a-zA-Z0-9_.]+)/);
        if (headerMatch) {
          const targetHeader = headerMatch[1] + headerMatch[2];
          const targetBlock = this.findBlockByHeader(targetHeader);
          if (targetBlock) {
            await this.executeBlock(targetBlock);
          } else {
            throw new Error(`Target block not found: ${targetHeader}`);
          }
        }
      }
    }
  }

  private findBlockByHeader(header: string): BSBlock | undefined {
    let type: BSBlock['type'] = 'local';
    let name = header;

    if (header.startsWith('@@')) { type = 'global'; name = header.slice(2); }
    else if (header.startsWith('$$')) { type = 'library'; name = header.slice(2); }
    else if (header.startsWith('###')) { type = 'conductor'; name = header.slice(3); }
    else if (header.startsWith('##')) { type = 'local'; name = header.slice(2); }

    return this.blocks.find(b => b.type === type && (b.name === name || b.rawHeader === header));
  }

  private async handleCompare(content: string, currentBlock: BSBlock) {
    // COMPARE cond1 && cond2 : actionIfTrue : actionIfFalse
    const sections = content.split(':');
    if (sections.length < 2) return;

    const conditionStr = sections[0].trim();
    const condPairs = conditionStr.split('&&');

    let allMatches = true;
    for (const pair of condPairs) {
      const p = pair.trim().split(/\s+/);
      if (p.length >= 2) {
        const lhs = this.evalExpression(p[0]);
        const rhs = this.evalExpression(p[1]);
        if (String(lhs) !== String(rhs)) {
          allMatches = false;
          break;
        }
      }
    }

    if (allMatches) {
      if (sections[1]) {
        await this.executeSubCommands(sections[1].trim(), currentBlock);
      }
    } else {
      if (sections[2]) {
        await this.executeSubCommands(sections[2].trim(), currentBlock);
      }
    }
  }

  private async handleIf(content: string, currentBlock: BSBlock) {
    // IF $choice 1 : BRANCH ##handle1 : IF $choice 2 : BRANCH ##handle2 :: BRANCH ##default
    const sections = content.split(':');
    if (sections.length < 2) return;

    const conditionStr = sections[0].trim();
    const condParts = conditionStr.split(/\s+/);

    if (condParts.length >= 2) {
      const lhs = this.evalExpression(condParts[0]);
      const operatorOrRhs = condParts[1];
      const rhs = condParts.length >= 3 ? this.evalExpression(condParts[2]) : this.evalExpression(operatorOrRhs);

      let isTrue = false;
      if (condParts.length === 2) {
        isTrue = String(lhs) === String(rhs);
      } else {
        if (operatorOrRhs === '==' || operatorOrRhs === '=') isTrue = String(lhs) === String(rhs);
        else if (operatorOrRhs === '!=') isTrue = String(lhs) !== String(rhs);
        else if (operatorOrRhs === '>') isTrue = Number(lhs) > Number(rhs);
        else if (operatorOrRhs === '<') isTrue = Number(lhs) < Number(rhs);
        else if (operatorOrRhs === '>=') isTrue = Number(lhs) >= Number(rhs);
        else if (operatorOrRhs === '<=') isTrue = Number(lhs) <= Number(rhs);
        else isTrue = String(lhs) === String(rhs);
      }

      if (isTrue) {
        await this.executeSubCommands(sections[1].trim(), currentBlock);
      } else if (sections.length > 2) {
        const remaining = sections.slice(2).join(':').trim();
        if (remaining.startsWith('IF ')) {
          await this.handleIf(remaining.slice(3).trim(), currentBlock);
        } else {
          await this.executeSubCommands(remaining, currentBlock);
        }
      }
    }
  }

  private async executeSubCommands(subStr: string, currentBlock: BSBlock) {
    if (!subStr) return;
    const subCmds = subStr.split('&&');
    for (const sc of subCmds) {
      const cleanSc = sc.trim();
      if (cleanSc.startsWith('##') || cleanSc.startsWith('###') || cleanSc.startsWith('@@') || cleanSc.startsWith('$$')) {
        const block = this.findBlockByHeader(cleanSc);
        if (block) await this.executeBlock(block);
      } else if (cleanSc) {
        await this.parseAndExecute(cleanSc, currentBlock);
      }
    }
  }

  private evalExpression(expr: string): any {
    if (!expr) return '';
    let val = expr.trim();

    // String concatenation with &&
    if (val.includes('&&') && !val.startsWith("'") && !val.startsWith('"')) {
      return val.split('&&').map(v => String(this.evalExpression(v.trim()))).join('');
    }

    // String literals
    if ((val.startsWith("'") && val.endsWith("'")) || (val.startsWith('"') && val.endsWith('"'))) {
      return val.slice(1, -1);
    }

    // Hex Degrees Operator shorthand: 100° -> (100 * Math.PI / 180)
    if (val.includes('°')) {
      val = val.replace(/(\d+(?:\.\d+)?)°/g, (_, deg) => String((parseFloat(deg) * Math.PI) / 180));
    }

    // Exponent Operator shorthand: 10^3
    if (val.includes('^')) {
      val = val.replace(/\^/g, '**');
    }

    // Math Functions & Operators
    if (/[+\-*/%<>!*]/.test(val) && !val.startsWith("'") && !val.startsWith('"')) {
      try {
        let processed = val;

        // Functions replacement
        processed = processed.replace(/ABS\s+(\$[a-zA-Z0-9_.]+|\d+)/g, "Math.abs($1)");
        processed = processed.replace(/CEL\s+(\$[a-zA-Z0-9_.]+|\d+)/g, "Math.ceil($1)");
        processed = processed.replace(/FLO\s+(\$[a-zA-Z0-9_.]+|\d+)/g, "Math.floor($1)");
        processed = processed.replace(/RAND/g, "Math.random()");
        processed = processed.replace(/LOG\s+(\$[a-zA-Z0-9_.]+|\d+)/g, "Math.log($1)");
        processed = processed.replace(/SIN\s+(\$[a-zA-Z0-9_.]+|\d+)/g, "Math.sin($1)");
        processed = processed.replace(/COS\s+(\$[a-zA-Z0-9_.]+|\d+)/g, "Math.cos($1)");
        processed = processed.replace(/TAN\s+(\$[a-zA-Z0-9_.]+|\d+)/g, "Math.tan($1)");

        // Inequality replacement <> -> !=
        processed = processed.replace(/<>/g, "!=");

        // Variables replacement
        const varMatches = processed.match(/(\$[a-zA-Z0-9_.]+|self\.[a-zA-Z0-9_.]+)/g) || [];
        for (const v of varMatches) {
          const varVal = this.variables[v.toLowerCase()];
          if (varVal !== undefined) {
            processed = processed.replace(v, typeof varVal === 'number' ? String(varVal) : JSON.stringify(varVal));
          } else {
            // Memory address check
            if (v.startsWith('$')) {
              const hex = parseInt(v.slice(1), 16);
              if (!isNaN(hex)) {
                processed = processed.replace(v, '0');
              } else {
                processed = processed.replace(v, '0');
              }
            } else {
              processed = processed.replace(v, '0');
            }
          }
        }

        const evaluated = eval(processed);
        if (evaluated === Infinity || isNaN(evaluated)) return 0;
        return evaluated;
      } catch (e) {
        // Fall back to string parsing if eval fails
      }
    }

    // Variable lookup
    if (val.startsWith('$') || val.startsWith('self.')) {
      const varName = val.toLowerCase();
      if (this.variables[varName] !== undefined) return this.variables[varName];

      if (varName.startsWith('$')) {
        const hex = parseInt(varName.slice(1), 16);
        if (!isNaN(hex)) return 0;
      }
      return 0;
    }

    // Numbers
    if (/^-?\d+$/.test(val)) return parseInt(val, 10);
    if (/^0x[0-9a-fA-F]+$/.test(val)) return parseInt(val, 16);
    if (!isNaN(parseFloat(val))) return parseFloat(val);

    return val;
  }
}
