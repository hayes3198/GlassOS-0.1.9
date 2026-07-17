import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Delete, HelpCircle, History, Sparkles, Ruler, Scale, Thermometer, ArrowUpDown, Copy } from 'lucide-react';

interface CalculatorAppProps {
  addNotification?: (title: string, message: string, type: 'info' | 'success' | 'warning' | 'error') => void;
}

export default function CalculatorApp({ addNotification }: CalculatorAppProps) {
  const [expression, setExpression] = useState<string>('');
  const [result, setResult] = useState<string>('0');
  const [isDegreeMode, setIsDegreeMode] = useState<boolean>(true); // DEG by default
  const [memory, setMemory] = useState<number>(0);
  const [history, setHistory] = useState<{ expr: string; res: string }[]>([]);
  const [showHistory, setShowHistory] = useState<boolean>(false);
  
  const [activeMode, setActiveMode] = useState<'standard' | 'scientific' | 'converter'>('scientific');

  // Unit Converter States
  const [converterCategory, setConverterCategory] = useState<'length' | 'weight' | 'temperature'>('length');
  const [converterInputValue, setConverterInputValue] = useState<string>('1');
  const [converterFromUnit, setConverterFromUnit] = useState<string>('m');
  const [converterToUnit, setConverterToUnit] = useState<string>('cm');

  const CONVERSION_CATEGORIES = {
    length: {
      label: 'Length',
      icon: Ruler,
      units: {
        mm: { label: 'Millimeters (mm)', factor: 0.001 },
        cm: { label: 'Centimeters (cm)', factor: 0.01 },
        m: { label: 'Meters (m)', factor: 1.0 },
        km: { label: 'Kilometers (km)', factor: 1000.0 },
        in: { label: 'Inches (in)', factor: 0.0254 },
        ft: { label: 'Feet (ft)', factor: 0.3048 },
        yd: { label: 'Yards (yd)', factor: 0.9144 },
        mi: { label: 'Miles (mi)', factor: 1609.344 },
      },
    },
    weight: {
      label: 'Weight',
      icon: Scale,
      units: {
        mg: { label: 'Milligrams (mg)', factor: 0.001 },
        g: { label: 'Grams (g)', factor: 1.0 },
        kg: { label: 'Kilograms (kg)', factor: 1000.0 },
        oz: { label: 'Ounces (oz)', factor: 28.349523125 },
        lb: { label: 'Pounds (lb)', factor: 453.59237 },
      },
    },
    temperature: {
      label: 'Temperature',
      icon: Thermometer,
      units: {
        C: { label: 'Celsius (°C)' },
        F: { label: 'Fahrenheit (°F)' },
        K: { label: 'Kelvin (K)' },
      },
    },
  };

  const performConversion = (valStr: string, cat: 'length' | 'weight' | 'temperature', from: string, to: string): string => {
    const val = parseFloat(valStr);
    if (isNaN(val)) return '0';

    if (from === to) return val.toString();

    if (cat === 'temperature') {
      let tempInC = val;
      if (from === 'F') {
        tempInC = (val - 32) * (5 / 9);
      } else if (from === 'K') {
        tempInC = val - 273.15;
      }

      let targetVal = tempInC;
      if (to === 'F') {
        targetVal = tempInC * (9 / 5) + 32;
      } else if (to === 'K') {
        targetVal = tempInC + 273.15;
      }

      return Number(targetVal.toFixed(6)).toString();
    } else {
      const catData = CONVERSION_CATEGORIES[cat];
      const fromFactor = (catData.units as any)[from]?.factor || 1;
      const toFactor = (catData.units as any)[to]?.factor || 1;

      const valInBase = val * fromFactor;
      const targetVal = valInBase / toFactor;

      return Number(targetVal.toFixed(8)).toString();
    }
  };

  const handleCategoryChange = (category: 'length' | 'weight' | 'temperature') => {
    setConverterCategory(category);
    if (category === 'length') {
      setConverterFromUnit('m');
      setConverterToUnit('cm');
    } else if (category === 'weight') {
      setConverterFromUnit('kg');
      setConverterToUnit('g');
    } else if (category === 'temperature') {
      setConverterFromUnit('C');
      setConverterToUnit('F');
    }
  };

  const handleConverterKeyPress = (key: string) => {
    if (key === 'AC') {
      setConverterInputValue('0');
    } else if (key === 'C') {
      setConverterInputValue(prev => {
        if (prev.length <= 1) return '0';
        return prev.slice(0, -1);
      });
    } else if (key === '.') {
      setConverterInputValue(prev => {
        if (prev.includes('.')) return prev;
        return prev + '.';
      });
    } else if (key === '±') {
      setConverterInputValue(prev => {
        if (prev.startsWith('-')) return prev.slice(1);
        if (prev === '0') return prev;
        return '-' + prev;
      });
    } else if (/^[0-9]$/.test(key)) {
      setConverterInputValue(prev => {
        if (prev === '0') return key;
        return prev + key;
      });
    } else if (key === 'swap') {
      const temp = converterFromUnit;
      setConverterFromUnit(converterToUnit);
      setConverterToUnit(temp);
    }
  };

  // Safe Tokenizer and Recursive Descent Parser
  const evaluate = (exprString: string): number => {
    // Sanitize string
    let s = exprString
      .replace(/×/g, '*')
      .replace(/÷/g, '/')
      .replace(/π/g, Math.PI.toString())
      .replace(/\be\b/g, Math.E.toString());

    let pos = 0;

    const peek = () => s[pos] || '';
    const consume = () => s[pos++];

    const parseNumber = (): number => {
      let numStr = '';
      if (peek() === '-') {
        numStr += consume();
      }
      while (/[0-9.]/.test(peek())) {
        numStr += consume();
      }
      return parseFloat(numStr);
    };

    const parseExpr = (): number => {
      let val = parseTerm();
      while (peek() === '+' || peek() === '-') {
        const op = consume();
        const nextVal = parseTerm();
        if (op === '+') val += nextVal;
        else val -= nextVal;
      }
      return val;
    };

    const parseTerm = (): number => {
      let val = parsePower();
      while (peek() === '*' || peek() === '/' || peek() === '%') {
        const op = consume();
        const nextVal = parsePower();
        if (op === '*') val *= nextVal;
        else if (op === '/') {
          if (nextVal === 0) throw new Error('Divide by zero');
          val /= nextVal;
        } else {
          val %= nextVal;
        }
      }
      return val;
    };

    const parsePower = (): number => {
      let val = parseFactor();
      while (peek() === '^') {
        consume(); // absorb '^'
        const nextVal = parsePower();
        val = Math.pow(val, nextVal);
      }
      return val;
    };

    const parseFactor = (): number => {
      const c = peek();
      
      // Parentheses
      if (c === '(') {
        consume(); // absorb '('
        const val = parseExpr();
        if (consume() !== ')') throw new Error('Missing )');
        return val;
      }

      // Literal Number
      if (/[0-9]/.test(c) || c === '.') {
        return parseNumber();
      }

      // Check scientific functions
      const funcName = s.slice(pos).match(/^(sin|cos|tan|asin|acos|atan|ln|log|sqrt|cbrt|abs)/);
      if (funcName) {
        const f = funcName[1];
        pos += f.length;
        if (peek() !== '(') throw new Error(`Expected ( after ${f}`);
        consume(); // absorb '('
        let innerVal = parseExpr();
        if (consume() !== ')') throw new Error('Missing )');

        switch (f) {
          case 'sin':
            return Math.sin(isDegreeMode ? (innerVal * Math.PI) / 180 : innerVal);
          case 'cos':
            return Math.cos(isDegreeMode ? (innerVal * Math.PI) / 180 : innerVal);
          case 'tan':
            return Math.tan(isDegreeMode ? (innerVal * Math.PI) / 180 : innerVal);
          case 'asin':
            const as = Math.asin(innerVal);
            return isDegreeMode ? (as * 180) / Math.PI : as;
          case 'acos':
            const ac = Math.acos(innerVal);
            return isDegreeMode ? (ac * 180) / Math.PI : ac;
          case 'atan':
            const at = Math.atan(innerVal);
            return isDegreeMode ? (at * 180) / Math.PI : at;
          case 'ln':
            if (innerVal <= 0) throw new Error('Invalid Domain');
            return Math.log(innerVal);
          case 'log':
            if (innerVal <= 0) throw new Error('Invalid Domain');
            return Math.log10(innerVal);
          case 'sqrt':
            if (innerVal < 0) throw new Error('Negative sqrt');
            return Math.sqrt(innerVal);
          case 'cbrt':
            return Math.cbrt(innerVal);
          case 'abs':
            return Math.abs(innerVal);
          default:
            throw new Error(`Unknown function: ${f}`);
        }
      }

      // Negative values or signs
      if (c === '-') {
        consume();
        return -parseFactor();
      }

      if (c === '+') {
        consume();
        return parseFactor();
      }

      throw new Error('Invalid token');
    };

    const finalVal = parseExpr();
    if (pos < s.length) {
      throw new Error('Malformed expression');
    }
    return finalVal;
  };

  const calculateResult = (isEqualPressed = false) => {
    if (!expression) return;
    try {
      const evaluated = evaluate(expression);
      if (isNaN(evaluated) || !isFinite(evaluated)) {
        throw new Error('Invalid calculation');
      }
      
      const formattedRes = Number(evaluated.toFixed(10)).toString(); // clean float representation
      setResult(formattedRes);

      if (isEqualPressed) {
        setHistory(prev => [{ expr: expression, res: formattedRes }, ...prev.slice(0, 19)]);
        setExpression(formattedRes);
      }
    } catch (err: any) {
      setResult(err.message || 'Error');
    }
  };

  const handleKeyPress = (val: string) => {
    if (val === 'AC') {
      setExpression('');
      setResult('0');
    } else if (val === 'C') {
      setExpression(prev => prev.slice(0, -1));
    } else if (val === '=') {
      calculateResult(true);
    } else if (val === 'Ans') {
      setExpression(prev => prev + result);
    } else {
      // Prevent consecutive operators or bad syntax if desired, or let parser handle
      setExpression(prev => prev + val);
    }
  };

  const handleScientificInstant = (action: string) => {
    // Operations that apply to the current active value/result directly
    try {
      const currentVal = parseFloat(result) || 0;
      let computed = 0;

      switch (action) {
        case 'x^2':
          computed = Math.pow(currentVal, 2);
          setExpression(`${currentVal}^2`);
          break;
        case 'x^3':
          computed = Math.pow(currentVal, 3);
          setExpression(`${currentVal}^3`);
          break;
        case '1/x':
          if (currentVal === 0) throw new Error('Divide by zero');
          computed = 1 / currentVal;
          setExpression(`1/(${currentVal})`);
          break;
        case '10^x':
          computed = Math.pow(10, currentVal);
          setExpression(`10^(${currentVal})`);
          break;
        case 'e^x':
          computed = Math.exp(currentVal);
          setExpression(`e^(${currentVal})`);
          break;
        case 'factorial':
          if (currentVal < 0 || !Number.isInteger(currentVal)) throw new Error('Integer >= 0 only');
          let f = 1;
          for (let i = 2; i <= currentVal; i++) f *= i;
          computed = f;
          setExpression(`fact(${currentVal})`);
          break;
        default:
          return;
      }

      const formatted = Number(computed.toFixed(10)).toString();
      setResult(formatted);
      setExpression(formatted);
    } catch (err: any) {
      setResult(err.message || 'Error');
    }
  };

  const handleMemory = (op: string) => {
    const currentVal = parseFloat(result) || 0;
    switch (op) {
      case 'MC':
        setMemory(0);
        if (addNotification) addNotification('Calculator', 'Memory Cleared', 'info');
        break;
      case 'MR':
        setExpression(prev => prev + memory.toString());
        break;
      case 'M+':
        setMemory(prev => prev + currentVal);
        if (addNotification) addNotification('Calculator', `Added ${currentVal} to Memory`, 'success');
        break;
      case 'M-':
        setMemory(prev => prev - currentVal);
        if (addNotification) addNotification('Calculator', `Subtracted ${currentVal} from Memory`, 'success');
        break;
      case 'MS':
        setMemory(currentVal);
        if (addNotification) addNotification('Calculator', `Memory set to ${currentVal}`, 'success');
        break;
    }
  };

  return (
    <div className="flex flex-col h-full w-full bg-slate-950/40 text-slate-100 overflow-hidden select-none">
      {/* Header Bar */}
      <div className="flex items-center justify-between px-4 py-3 bg-slate-900/60 border-b border-white/10">
        <div className="flex items-center gap-2">
          <span className="p-1 rounded bg-purple-500/10 border border-purple-500/20 text-purple-400">
            <Sparkles className="w-4 h-4" />
          </span>
          <span className="text-xs font-bold tracking-wider uppercase text-slate-200">
            Glass Scientific Calculator
          </span>
        </div>

        <div className="flex gap-2">
          {/* History Toggle */}
          <button
            onClick={() => setShowHistory(!showHistory)}
            className={`p-1.5 rounded-lg border transition-all ${
              showHistory 
                ? 'bg-purple-500/20 border-purple-500/30 text-purple-400' 
                : 'border-white/10 text-slate-400 hover:text-slate-200 hover:bg-white/5'
            }`}
            title="Calculation History"
          >
            <History className="w-4 h-4" />
          </button>

          {/* View Toggles */}
          <div className="flex bg-white/5 p-0.5 rounded-lg border border-white/10 gap-0.5">
            {([
              { id: 'standard', label: 'Standard' },
              { id: 'scientific', label: 'Scientific' },
              { id: 'converter', label: 'Converter' }
            ] as const).map(mode => (
              <button
                key={mode.id}
                onClick={() => setActiveMode(mode.id)}
                className={`px-2.5 py-1 text-[9px] uppercase font-bold tracking-wider rounded-md transition-all ${
                  activeMode === mode.id
                    ? 'bg-purple-500/20 border border-purple-500/30 text-purple-400 shadow-sm shadow-purple-950/20'
                    : 'border-transparent text-slate-400 hover:text-slate-200 hover:bg-white/5'
                }`}
              >
                {mode.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Main Container */}
      <div className="flex-1 flex overflow-hidden">
        {/* Calculator Keyboard & Screen */}
        <div className="flex-1 flex flex-col p-4 bg-slate-900/10 justify-between">
          {activeMode === 'converter' ? (
            /* Unit Converter Display Panel */
            <div className="bg-black/40 border border-white/10 rounded-2xl p-4 flex flex-col gap-4 min-h-[150px] mb-4 shadow-inner">
              {/* Category Selector Tabs */}
              <div className="flex bg-white/5 p-1 rounded-xl border border-white/5 gap-1">
                {(['length', 'weight', 'temperature'] as const).map(cat => {
                  const CatData = CONVERSION_CATEGORIES[cat];
                  const Icon = CatData.icon;
                  return (
                    <button
                      key={cat}
                      onClick={() => handleCategoryChange(cat)}
                      className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-lg text-[10px] font-bold tracking-wider uppercase transition-all ${
                        converterCategory === cat
                          ? 'bg-purple-500/20 text-purple-400 border border-purple-500/30 shadow-md shadow-purple-950/20'
                          : 'text-slate-400 hover:text-slate-200 hover:bg-white/5 border border-transparent'
                      }`}
                    >
                      <Icon className="w-3.5 h-3.5" />
                      {CatData.label}
                    </button>
                  );
                })}
              </div>

              {/* From & To inputs */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 items-center relative">
                {/* From Unit Card */}
                <div className="bg-white/[0.02] border border-white/5 rounded-xl p-3 flex flex-col gap-1">
                  <span className="text-[9px] text-slate-500 font-bold uppercase tracking-wider">From</span>
                  <div className="flex items-center justify-between gap-2">
                    <input
                      type="text"
                      value={converterInputValue}
                      onChange={(e) => {
                        const val = e.target.value;
                        if (/^-?[0-9.]*$/.test(val)) {
                          setConverterInputValue(val);
                        }
                      }}
                      className="bg-transparent text-xl font-mono font-bold text-slate-100 w-full outline-none"
                      placeholder="0"
                    />
                    <select
                      value={converterFromUnit}
                      onChange={(e) => setConverterFromUnit(e.target.value)}
                      className="bg-slate-900 border border-white/10 rounded-lg px-2 py-1 text-xs text-slate-300 font-mono focus:border-purple-500/50 outline-none"
                    >
                      {Object.entries(CONVERSION_CATEGORIES[converterCategory].units).map(([uKey, uVal]) => (
                        <option key={uKey} value={uKey} className="bg-slate-950">
                          {uKey} ({(uVal as any).label.split('(')[0]})
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Swap Button (Absolute / Centered on Desktop) */}
                <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-10 hidden sm:block">
                  <button
                    onClick={() => handleConverterKeyPress('swap')}
                    className="p-1.5 rounded-full bg-slate-900 hover:bg-slate-800 border border-white/10 text-purple-400 hover:text-purple-300 transition-all shadow-md"
                    title="Swap Units"
                  >
                    <ArrowUpDown className="w-3.5 h-3.5" />
                  </button>
                </div>

                {/* Mobile Swap Button */}
                <div className="sm:hidden flex justify-center -my-1.5">
                  <button
                    onClick={() => handleConverterKeyPress('swap')}
                    className="p-1 rounded-full bg-slate-900 hover:bg-slate-800 border border-white/10 text-purple-400 hover:text-purple-300 transition-all shadow-sm"
                  >
                    <ArrowUpDown className="w-3.5 h-3.5" />
                  </button>
                </div>

                {/* To Unit Card */}
                <div className="bg-purple-950/5 border border-purple-500/10 rounded-xl p-3 flex flex-col gap-1 relative group">
                  <span className="text-[9px] text-purple-400/60 font-bold uppercase tracking-wider">To</span>
                  <div className="flex items-center justify-between gap-2">
                    <div className="text-xl font-mono font-bold text-purple-300 truncate w-full">
                      {performConversion(converterInputValue, converterCategory, converterFromUnit, converterToUnit)}
                    </div>
                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => {
                          const res = performConversion(converterInputValue, converterCategory, converterFromUnit, converterToUnit);
                          navigator.clipboard.writeText(res);
                          if (addNotification) addNotification('Unit Converter', 'Result copied to clipboard!', 'success');
                        }}
                        className="p-1 rounded hover:bg-white/10 text-slate-400 hover:text-slate-200 transition-colors opacity-0 group-hover:opacity-100 focus:opacity-100"
                        title="Copy Result"
                      >
                        <Copy className="w-3.5 h-3.5" />
                      </button>
                      <select
                        value={converterToUnit}
                        onChange={(e) => setConverterToUnit(e.target.value)}
                        className="bg-slate-900 border border-white/10 rounded-lg px-2 py-1 text-xs text-slate-300 font-mono focus:border-purple-500/50 outline-none"
                      >
                        {Object.entries(CONVERSION_CATEGORIES[converterCategory].units).map(([uKey, uVal]) => (
                          <option key={uKey} value={uKey} className="bg-slate-950">
                            {uKey} ({(uVal as any).label.split('(')[0]})
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            /* Screen Display */
            <div className="bg-black/40 border border-white/10 rounded-2xl p-4 flex flex-col items-end justify-between min-h-[100px] mb-4 text-right shadow-inner">
              {/* Top Display: Full Expression */}
              <div className="text-slate-400 text-sm font-mono truncate w-full tracking-wide">
                {expression || '\u00A0'}
              </div>
              
              {/* Bottom Display: Calculation Result */}
              <div className="text-3xl font-mono font-extrabold text-slate-100 truncate w-full tracking-widest tabular-nums filter drop-shadow-[0_0_8px_rgba(255,255,255,0.05)]">
                {result}
              </div>
            </div>
          )}

          {/* Quick Memory Keys - Hide in Converter mode */}
          {activeMode !== 'converter' && (
            <div className="grid grid-cols-5 gap-1.5 mb-2">
              {['MC', 'MR', 'M+', 'M-', 'MS'].map(mem => (
                <button
                  key={mem}
                  onClick={() => handleMemory(mem)}
                  className="py-1 rounded-lg bg-white/5 hover:bg-white/10 border border-white/5 text-[10px] font-bold tracking-wider text-slate-400 hover:text-slate-200 transition-all"
                >
                  {mem}
                </button>
              ))}
            </div>
          )}

          {/* Keyboard Grid */}
          {activeMode === 'converter' ? (
            <div className="flex-1 grid grid-cols-4 gap-1.5 min-h-[260px]">
              <button onClick={() => handleConverterKeyPress('7')} className="rounded-xl bg-slate-800 border border-white/5 hover:bg-slate-700 text-base font-bold text-slate-100 transition-all">7</button>
              <button onClick={() => handleConverterKeyPress('8')} className="rounded-xl bg-slate-800 border border-white/5 hover:bg-slate-700 text-base font-bold text-slate-100 transition-all">8</button>
              <button onClick={() => handleConverterKeyPress('9')} className="rounded-xl bg-slate-800 border border-white/5 hover:bg-slate-700 text-base font-bold text-slate-100 transition-all">9</button>
              <button onClick={() => handleConverterKeyPress('C')} className="rounded-xl bg-slate-900 border border-white/5 hover:bg-slate-800 text-sm font-semibold text-slate-300 transition-all flex items-center justify-center">
                <Delete className="w-4 h-4" />
              </button>

              <button onClick={() => handleConverterKeyPress('4')} className="rounded-xl bg-slate-800 border border-white/5 hover:bg-slate-700 text-base font-bold text-slate-100 transition-all">4</button>
              <button onClick={() => handleConverterKeyPress('5')} className="rounded-xl bg-slate-800 border border-white/5 hover:bg-slate-700 text-base font-bold text-slate-100 transition-all">5</button>
              <button onClick={() => handleConverterKeyPress('6')} className="rounded-xl bg-slate-800 border border-white/5 hover:bg-slate-700 text-base font-bold text-slate-100 transition-all">6</button>
              <button onClick={() => handleConverterKeyPress('AC')} className="rounded-xl bg-rose-500/20 border border-rose-500/30 hover:bg-rose-500/30 text-sm font-bold text-rose-400 transition-all">AC</button>

              <button onClick={() => handleConverterKeyPress('1')} className="rounded-xl bg-slate-800 border border-white/5 hover:bg-slate-700 text-base font-bold text-slate-100 transition-all">1</button>
              <button onClick={() => handleConverterKeyPress('2')} className="rounded-xl bg-slate-800 border border-white/5 hover:bg-slate-700 text-base font-bold text-slate-100 transition-all">2</button>
              <button onClick={() => handleConverterKeyPress('3')} className="rounded-xl bg-slate-800 border border-white/5 hover:bg-slate-700 text-base font-bold text-slate-100 transition-all">3</button>
              <button onClick={() => handleConverterKeyPress('swap')} className="rounded-xl bg-amber-500/20 border border-amber-500/30 hover:bg-amber-500/30 text-xs font-bold text-amber-400 transition-all flex items-center justify-center gap-1">
                <ArrowUpDown className="w-3.5 h-3.5" /> Swap
              </button>

              <button onClick={() => handleConverterKeyPress('±')} className="rounded-xl bg-slate-800 border border-white/5 hover:bg-slate-700 text-base font-bold text-slate-100 transition-all">±</button>
              <button onClick={() => handleConverterKeyPress('0')} className="rounded-xl bg-slate-800 border border-white/5 hover:bg-slate-700 text-base font-bold text-slate-100 transition-all">0</button>
              <button onClick={() => handleConverterKeyPress('.')} className="rounded-xl bg-slate-800 border border-white/5 hover:bg-slate-700 text-base font-bold text-slate-100 transition-all">.</button>
              <button 
                onClick={() => {
                  const res = performConversion(converterInputValue, converterCategory, converterFromUnit, converterToUnit);
                  navigator.clipboard.writeText(res);
                  if (addNotification) addNotification('Unit Converter', 'Result copied!', 'success');
                }} 
                className="rounded-xl bg-emerald-500 hover:bg-emerald-600 text-xs font-bold text-slate-950 transition-all flex items-center justify-center gap-1 shadow-lg shadow-emerald-950/20"
              >
                <Copy className="w-3.5 h-3.5" /> Copy
              </button>
            </div>
          ) : (
            <div className="flex-1 grid grid-cols-4 gap-1.5 min-h-[260px]">
              {/* Scientific Section on Left or Grid Placement */}
              {activeMode === 'scientific' && (
                <div className="col-span-4 grid grid-cols-6 gap-1.5 pb-1.5 border-b border-white/10 mb-1.5">
                  {/* Angle toggle */}
                  <button
                    onClick={() => setIsDegreeMode(!isDegreeMode)}
                    className={`text-[10px] font-bold rounded-xl border transition-all ${
                      isDegreeMode 
                        ? 'bg-amber-500/10 border-amber-500/20 text-amber-400' 
                        : 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400'
                    }`}
                  >
                    {isDegreeMode ? 'DEG' : 'RAD'}
                  </button>
                  {/* Functions */}
                  {['sin(', 'cos(', 'tan(', 'ln(', 'log(', 'sqrt('].map(fn => (
                    <button
                      key={fn}
                      onClick={() => handleKeyPress(fn)}
                      className="py-2 rounded-xl bg-purple-500/10 border border-purple-500/20 text-xs font-semibold text-purple-300 hover:bg-purple-500/20 transition-all"
                    >
                      {fn.replace('(', '')}
                    </button>
                  ))}
                  {['asin(', 'acos(', 'atan(', 'abs(', 'π', 'e'].map(fn => (
                    <button
                      key={fn}
                      onClick={() => handleKeyPress(fn)}
                      className="py-2 rounded-xl bg-purple-950/20 border border-white/5 text-xs font-semibold text-purple-400 hover:bg-purple-500/10 transition-all"
                    >
                      {fn === 'abs(' ? 'abs' : fn.replace('(', '')}
                    </button>
                  ))}
                  {/* Single key operations */}
                  {['x^2', 'x^3', '1/x', '10^x', 'e^x', 'factorial'].map(op => {
                    let lbl = op;
                    if (op === 'factorial') lbl = 'x!';
                    if (op === '1/x') lbl = '1/x';
                    return (
                      <button
                        key={op}
                        onClick={() => handleScientificInstant(op)}
                        className="py-2 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-xs font-semibold text-indigo-300 hover:bg-indigo-500/20 transition-all"
                      >
                        {lbl}
                      </button>
                    );
                  })}
                </div>
              )}

              {/* Main keypad row-by-row */}
              {/* Row 1 */}
              <button onClick={() => handleKeyPress('(')} className="rounded-xl bg-slate-900 border border-white/5 hover:bg-slate-800 text-sm font-semibold text-slate-300 transition-all">(</button>
              <button onClick={() => handleKeyPress(')')} className="rounded-xl bg-slate-900 border border-white/5 hover:bg-slate-800 text-sm font-semibold text-slate-300 transition-all">)</button>
              <button onClick={() => handleKeyPress('%')} className="rounded-xl bg-slate-900 border border-white/5 hover:bg-slate-800 text-sm font-semibold text-slate-300 transition-all">%</button>
              <button onClick={() => handleKeyPress('AC')} className="rounded-xl bg-rose-500/20 border border-rose-500/30 hover:bg-rose-500/30 text-sm font-bold text-rose-400 transition-all">AC</button>

              {/* Row 2 */}
              <button onClick={() => handleKeyPress('7')} className="rounded-xl bg-slate-800 border border-white/5 hover:bg-slate-700 text-base font-bold text-slate-100 transition-all">7</button>
              <button onClick={() => handleKeyPress('8')} className="rounded-xl bg-slate-800 border border-white/5 hover:bg-slate-700 text-base font-bold text-slate-100 transition-all">8</button>
              <button onClick={() => handleKeyPress('9')} className="rounded-xl bg-slate-800 border border-white/5 hover:bg-slate-700 text-base font-bold text-slate-100 transition-all">9</button>
              <button onClick={() => handleKeyPress('÷')} className="rounded-xl bg-amber-500/20 border border-amber-500/30 hover:bg-amber-500/30 text-base font-bold text-amber-400 transition-all">÷</button>

              {/* Row 3 */}
              <button onClick={() => handleKeyPress('4')} className="rounded-xl bg-slate-800 border border-white/5 hover:bg-slate-700 text-base font-bold text-slate-100 transition-all">4</button>
              <button onClick={() => handleKeyPress('5')} className="rounded-xl bg-slate-800 border border-white/5 hover:bg-slate-700 text-base font-bold text-slate-100 transition-all">5</button>
              <button onClick={() => handleKeyPress('6')} className="rounded-xl bg-slate-800 border border-white/5 hover:bg-slate-700 text-base font-bold text-slate-100 transition-all">6</button>
              <button onClick={() => handleKeyPress('×')} className="rounded-xl bg-amber-500/20 border border-amber-500/30 hover:bg-amber-500/30 text-base font-bold text-amber-400 transition-all">×</button>

              {/* Row 4 */}
              <button onClick={() => handleKeyPress('1')} className="rounded-xl bg-slate-800 border border-white/5 hover:bg-slate-700 text-base font-bold text-slate-100 transition-all">1</button>
              <button onClick={() => handleKeyPress('2')} className="rounded-xl bg-slate-800 border border-white/5 hover:bg-slate-700 text-base font-bold text-slate-100 transition-all">2</button>
              <button onClick={() => handleKeyPress('3')} className="rounded-xl bg-slate-800 border border-white/5 hover:bg-slate-700 text-base font-bold text-slate-100 transition-all">3</button>
              <button onClick={() => handleKeyPress('-')} className="rounded-xl bg-amber-500/20 border border-amber-500/30 hover:bg-amber-500/30 text-base font-bold text-amber-400 transition-all">-</button>

              {/* Row 5 */}
              <button onClick={() => handleKeyPress('0')} className="rounded-xl bg-slate-800 border border-white/5 hover:bg-slate-700 text-base font-bold text-slate-100 transition-all">0</button>
              <button onClick={() => handleKeyPress('.')} className="rounded-xl bg-slate-800 border border-white/5 hover:bg-slate-700 text-base font-bold text-slate-100 transition-all">.</button>
              <button onClick={() => handleKeyPress('C')} className="rounded-xl bg-slate-900 border border-white/5 hover:bg-slate-800 text-sm font-semibold text-slate-300 transition-all flex items-center justify-center">
                <Delete className="w-4 h-4" />
              </button>
              <button onClick={() => handleKeyPress('+')} className="rounded-xl bg-amber-500/20 border border-amber-500/30 hover:bg-amber-500/30 text-base font-bold text-amber-400 transition-all">+</button>

              {/* Row 6 */}
              <button onClick={() => handleKeyPress('Ans')} className="col-span-2 rounded-xl bg-slate-900 border border-white/5 hover:bg-slate-800 text-xs font-bold text-slate-400 transition-all tracking-wider">Ans</button>
              <button onClick={() => handleKeyPress('^')} className="rounded-xl bg-slate-900 border border-white/5 hover:bg-slate-800 text-sm font-semibold text-slate-300 transition-all">x^y</button>
              <button onClick={() => handleKeyPress('=')} className="rounded-xl bg-emerald-500 hover:bg-emerald-600 text-base font-bold text-slate-950 transition-all shadow-lg shadow-emerald-950/20">=</button>
            </div>
          )}
        </div>

        {/* History Sidebar Panel */}
        {showHistory && (
          <div className="w-60 bg-slate-950/50 border-l border-white/10 flex flex-col p-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3 flex items-center gap-1.5 pb-1 border-b border-white/10">
              <History className="w-3.5 h-3.5" /> Recent Calculations
            </h3>
            
            <div className="flex-1 overflow-y-auto space-y-3.5 pr-1 max-h-[380px]">
              {history.length === 0 ? (
                <div className="text-center text-slate-600 text-xs mt-10">
                  <HelpCircle className="w-6 h-6 text-slate-700 mx-auto mb-2 opacity-50" />
                  No calculation history
                </div>
              ) : (
                history.map((item, idx) => (
                  <button
                    key={idx}
                    onClick={() => {
                      setExpression(item.expr);
                      setResult(item.res);
                    }}
                    className="w-full text-right p-2 rounded-xl bg-white/[0.02] hover:bg-white/5 border border-white/5 transition-all flex flex-col items-end"
                  >
                    <div className="text-xs text-slate-500 font-mono truncate w-full">
                      {item.expr}
                    </div>
                    <div className="text-sm font-mono font-bold text-purple-400 mt-1 truncate w-full">
                      = {item.res}
                    </div>
                  </button>
                ))
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
