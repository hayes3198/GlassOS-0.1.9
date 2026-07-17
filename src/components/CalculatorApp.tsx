import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Delete, HelpCircle, History, Sparkles } from 'lucide-react';

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
  const [isScientific, setIsScientific] = useState<boolean>(true); // default to scientific

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

          {/* Scientific vs Standard Toggle */}
          <button
            onClick={() => setIsScientific(!isScientific)}
            className={`px-3 py-1 text-[10px] uppercase font-semibold tracking-wider rounded-lg border transition-all ${
              isScientific
                ? 'bg-white/10 border-white/20 text-slate-200'
                : 'border-white/10 text-slate-400 hover:text-slate-200'
            }`}
          >
            {isScientific ? 'Scientific View' : 'Standard View'}
          </button>
        </div>
      </div>

      {/* Main Container */}
      <div className="flex-1 flex overflow-hidden">
        {/* Calculator Keyboard & Screen */}
        <div className="flex-1 flex flex-col p-4 bg-slate-900/10 justify-between">
          {/* Screen Display */}
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

          {/* Quick Memory Keys */}
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

          {/* Keyboard Grid */}
          <div className="flex-1 grid grid-cols-4 gap-1.5 min-h-[260px]">
            {/* Scientific Section on Left or Grid Placement */}
            {isScientific && (
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
