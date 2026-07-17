import React, { useState } from 'react';
import { motion } from 'motion/react';
import { 
  Ruler, 
  Scale, 
  Thermometer, 
  Layers, 
  Compass, 
  ArrowUpDown, 
  Copy, 
  Delete, 
  Sparkles, 
  HelpCircle 
} from 'lucide-react';

interface UnitConverterAppProps {
  addNotification?: (title: string, message: string, type: 'info' | 'success' | 'warning' | 'error') => void;
}

type CategoryType = 'length' | 'weight' | 'temperature' | 'area' | 'volume';

interface UnitDefinition {
  label: string;
  symbol: string;
  factor?: number; // relative to base unit
}

export default function UnitConverterApp({ addNotification }: UnitConverterAppProps) {
  const [category, setCategory] = useState<CategoryType>('length');
  const [inputValue, setInputValue] = useState<string>('1');
  const [fromUnit, setFromUnit] = useState<string>('m');
  const [toUnit, setToUnit] = useState<string>('cm');

  const CATEGORIES: Record<CategoryType, {
    label: string;
    icon: React.ComponentType<{ className?: string }>;
    baseUnit: string;
    units: Record<string, UnitDefinition>;
  }> = {
    length: {
      label: 'Length',
      icon: Ruler,
      baseUnit: 'm',
      units: {
        mm: { label: 'Millimeters', symbol: 'mm', factor: 0.001 },
        cm: { label: 'Centimeters', symbol: 'cm', factor: 0.01 },
        m: { label: 'Meters', symbol: 'm', factor: 1.0 },
        km: { label: 'Kilometers', symbol: 'km', factor: 1000.0 },
        in: { label: 'Inches', symbol: 'in', factor: 0.0254 },
        ft: { label: 'Feet', symbol: 'ft', factor: 0.3048 },
        yd: { label: 'Yards', symbol: 'yd', factor: 0.9144 },
        mi: { label: 'Miles', symbol: 'mi', factor: 1609.344 },
      },
    },
    weight: {
      label: 'Weight',
      icon: Scale,
      baseUnit: 'g',
      units: {
        mg: { label: 'Milligrams', symbol: 'mg', factor: 0.001 },
        g: { label: 'Grams', symbol: 'g', factor: 1.0 },
        kg: { label: 'Kilograms', symbol: 'kg', factor: 1000.0 },
        oz: { label: 'Ounces', symbol: 'oz', factor: 28.349523 },
        lb: { label: 'Pounds', symbol: 'lb', factor: 453.59237 },
      },
    },
    temperature: {
      label: 'Temperature',
      icon: Thermometer,
      baseUnit: 'C',
      units: {
        C: { label: 'Celsius', symbol: '°C' },
        F: { label: 'Fahrenheit', symbol: '°F' },
        K: { label: 'Kelvin', symbol: 'K' },
      },
    },
    area: {
      label: 'Area',
      icon: Compass,
      baseUnit: 'm2',
      units: {
        mm2: { label: 'Sq. Millimeters', symbol: 'mm²', factor: 0.000001 },
        cm2: { label: 'Sq. Centimeters', symbol: 'cm²', factor: 0.0001 },
        m2: { label: 'Sq. Meters', symbol: 'm²', factor: 1.0 },
        ha: { label: 'Hectares', symbol: 'ha', factor: 10000.0 },
        km2: { label: 'Sq. Kilometers', symbol: 'km²', factor: 1000000.0 },
        in2: { label: 'Sq. Inches', symbol: 'in²', factor: 0.00064516 },
        ft2: { label: 'Sq. Feet', symbol: 'ft²', factor: 0.092903 },
        ac: { label: 'Acres', symbol: 'ac', factor: 4046.85642 },
      },
    },
    volume: {
      label: 'Volume',
      icon: Layers,
      baseUnit: 'L',
      units: {
        ml: { label: 'Milliliters', symbol: 'mL', factor: 0.001 },
        L: { label: 'Liters', symbol: 'L', factor: 1.0 },
        m3: { label: 'Cubic Meters', symbol: 'm³', factor: 1000.0 },
        tsp: { label: 'Teaspoons (US)', symbol: 'tsp', factor: 0.00492892 },
        tbsp: { label: 'Tablespoons (US)', symbol: 'tbsp', factor: 0.01478676 },
        fl_oz: { label: 'Fluid Ounces (US)', symbol: 'fl oz', factor: 0.02957353 },
        cup: { label: 'Cups (US)', symbol: 'cup', factor: 0.23658823 },
        pt: { label: 'Pints (US)', symbol: 'pt', factor: 0.47317647 },
        qt: { label: 'Quarts (US)', symbol: 'qt', factor: 0.94635294 },
        gal: { label: 'Gallons (US)', symbol: 'gal', factor: 3.78541178 },
      },
    },
  };

  const convertValue = (valStr: string, cat: CategoryType, from: string, to: string): string => {
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
      const catData = CATEGORIES[cat];
      const fromFactor = catData.units[from]?.factor || 1;
      const toFactor = catData.units[to]?.factor || 1;

      const valInBase = val * fromFactor;
      const targetVal = valInBase / toFactor;

      // Handle floating point precision anomalies beautifully
      return Number(targetVal.toFixed(10)).toString();
    }
  };

  const handleCategoryChange = (newCat: CategoryType) => {
    setCategory(newCat);
    // Reset from/to units based on new category
    if (newCat === 'length') {
      setFromUnit('m');
      setToUnit('cm');
    } else if (newCat === 'weight') {
      setFromUnit('kg');
      setToUnit('g');
    } else if (newCat === 'temperature') {
      setFromUnit('C');
      setToUnit('F');
    } else if (newCat === 'area') {
      setFromUnit('m2');
      setToUnit('ft2');
    } else if (newCat === 'volume') {
      setFromUnit('L');
      setToUnit('ml');
    }
  };

  const handleKeyPress = (key: string) => {
    if (key === 'AC') {
      setInputValue('0');
    } else if (key === 'C') {
      setInputValue(prev => {
        if (prev.length <= 1) return '0';
        return prev.slice(0, -1);
      });
    } else if (key === '.') {
      setInputValue(prev => {
        if (prev.includes('.')) return prev;
        return prev + '.';
      });
    } else if (key === '±') {
      setInputValue(prev => {
        if (prev.startsWith('-')) return prev.slice(1);
        if (prev === '0') return prev;
        return '-' + prev;
      });
    } else if (/^[0-9]$/.test(key)) {
      setInputValue(prev => {
        if (prev === '0') return key;
        return prev + key;
      });
    } else if (key === 'swap') {
      const temp = fromUnit;
      setFromUnit(toUnit);
      setToUnit(temp);
    }
  };

  const currentResult = convertValue(inputValue, category, fromUnit, toUnit);

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    if (addNotification) {
      addNotification('Unit Converter', `${label} copied to clipboard!`, 'success');
    }
  };

  return (
    <div className="flex flex-col h-full bg-slate-950 text-slate-100 font-sans select-none overflow-hidden rounded-2xl border border-white/10">
      {/* App Header Bar */}
      <div className="flex items-center justify-between px-4 py-3 bg-slate-900/60 border-b border-white/10 shrink-0">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-purple-500/10 border border-purple-500/20 text-purple-400">
            <Sparkles className="w-4 h-4 animate-pulse" />
          </div>
          <div>
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">Precision Unit Converter</span>
            <div className="text-[10px] text-slate-500">Real-time conversions across 5 categories</div>
          </div>
        </div>
        
        <div className="flex items-center gap-1.5">
          <button 
            onClick={() => addNotification?.('Converter Info', 'Input any numeric value, choose your source/target units, or copy dynamic comparison tables immediately.', 'info')}
            className="p-1.5 rounded-lg hover:bg-white/5 text-slate-400 hover:text-slate-200 transition-colors"
            title="Help & Info"
          >
            <HelpCircle className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Main Body */}
      <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
        {/* Left column: Controls & Input Pad */}
        <div className="w-full md:w-[420px] flex flex-col p-4 border-r border-white/10 bg-slate-900/10 justify-between shrink-0 overflow-y-auto">
          <div className="flex flex-col gap-4">
            {/* Category Selector Tabs */}
            <div className="grid grid-cols-5 bg-white/5 p-1 rounded-xl border border-white/10 gap-1 shrink-0">
              {(Object.keys(CATEGORIES) as CategoryType[]).map(catKey => {
                const catDef = CATEGORIES[catKey];
                const Icon = catDef.icon;
                const isSelected = category === catKey;
                return (
                  <button
                    key={catKey}
                    onClick={() => handleCategoryChange(catKey)}
                    className={`flex flex-col items-center justify-center gap-1 py-2 rounded-lg text-[9px] font-bold uppercase transition-all ${
                      isSelected
                        ? 'bg-purple-500/20 text-purple-400 border border-purple-500/30 shadow-md shadow-purple-950/20'
                        : 'text-slate-400 hover:text-slate-200 hover:bg-white/5 border border-transparent'
                    }`}
                    title={catDef.label}
                  >
                    <Icon className="w-4 h-4" />
                    <span className="hidden sm:inline-block md:hidden lg:inline-block">{catDef.label}</span>
                  </button>
                );
              })}
            </div>

            {/* Conversions Cards Grid */}
            <div className="grid grid-cols-1 gap-3 relative">
              {/* FROM Card */}
              <div className="bg-slate-900/40 border border-white/10 rounded-xl p-3 flex flex-col gap-1.5 shadow-md">
                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">From</span>
                <div className="flex items-center justify-between gap-2">
                  <input
                    type="text"
                    value={inputValue}
                    onChange={(e) => {
                      const val = e.target.value;
                      if (/^-?[0-9.]*$/.test(val)) {
                        setInputValue(val);
                      }
                    }}
                    className="bg-transparent text-2xl font-mono font-extrabold text-slate-100 w-full outline-none"
                    placeholder="0"
                  />
                  <select
                    value={fromUnit}
                    onChange={(e) => setFromUnit(e.target.value)}
                    className="bg-slate-950 border border-white/10 rounded-lg px-2.5 py-1.5 text-xs font-mono font-bold text-slate-300 focus:border-purple-500/50 outline-none cursor-pointer"
                  >
                    {(Object.entries(CATEGORIES[category].units) as [string, UnitDefinition][]).map(([uKey, uDef]) => (
                      <option key={uKey} value={uKey} className="bg-slate-950">
                        {uDef.symbol} — {uDef.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Swap Switch Button */}
              <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-10">
                <button
                  onClick={() => handleKeyPress('swap')}
                  className="p-2 rounded-full bg-slate-950 hover:bg-slate-900 border border-white/15 text-purple-400 hover:text-purple-300 transition-all shadow-lg active:scale-95"
                  title="Swap Units"
                >
                  <ArrowUpDown className="w-4 h-4" />
                </button>
              </div>

              {/* TO Card */}
              <div className="bg-purple-950/5 border border-purple-500/20 rounded-xl p-3 flex flex-col gap-1.5 shadow-md relative group">
                <span className="text-[10px] text-purple-400/80 font-bold uppercase tracking-wider">To</span>
                <div className="flex items-center justify-between gap-2">
                  <div className="text-2xl font-mono font-extrabold text-purple-300 truncate w-full filter drop-shadow-[0_0_8px_rgba(168,85,247,0.1)]">
                    {currentResult}
                  </div>
                  <div className="flex items-center gap-1.5 shrink-0">
                    <button
                      onClick={() => copyToClipboard(currentResult, 'Result')}
                      className="p-1.5 rounded bg-white/5 hover:bg-white/10 border border-white/5 text-slate-400 hover:text-slate-200 transition-all"
                      title="Copy Result"
                    >
                      <Copy className="w-3.5 h-3.5" />
                    </button>
                    <select
                      value={toUnit}
                      onChange={(e) => setToUnit(e.target.value)}
                      className="bg-slate-950 border border-white/10 rounded-lg px-2.5 py-1.5 text-xs font-mono font-bold text-slate-300 focus:border-purple-500/50 outline-none cursor-pointer"
                    >
                      {(Object.entries(CATEGORIES[category].units) as [string, UnitDefinition][]).map(([uKey, uDef]) => (
                        <option key={uKey} value={uKey} className="bg-slate-950">
                          {uDef.symbol} — {uDef.label}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Virtual Numeric Pad */}
          <div className="grid grid-cols-4 gap-1.5 mt-4 min-h-[180px]">
            {['7', '8', '9'].map(num => (
              <button
                key={num}
                onClick={() => handleKeyPress(num)}
                className="rounded-xl bg-slate-900 border border-white/5 hover:bg-slate-800 text-base font-bold text-slate-200 active:scale-95 transition-all"
              >
                {num}
              </button>
            ))}
            <button
              onClick={() => handleKeyPress('C')}
              className="rounded-xl bg-slate-950 border border-white/5 hover:bg-slate-900 text-sm font-semibold text-slate-400 flex items-center justify-center active:scale-95 transition-all"
              title="Backspace"
            >
              <Delete className="w-4 h-4" />
            </button>

            {['4', '5', '6'].map(num => (
              <button
                key={num}
                onClick={() => handleKeyPress(num)}
                className="rounded-xl bg-slate-900 border border-white/5 hover:bg-slate-800 text-base font-bold text-slate-200 active:scale-95 transition-all"
              >
                {num}
              </button>
            ))}
            <button
              onClick={() => handleKeyPress('AC')}
              className="rounded-xl bg-rose-500/10 border border-rose-500/20 hover:bg-rose-500/20 text-xs font-bold text-rose-400 active:scale-95 transition-all"
            >
              CLEAR
            </button>

            {['1', '2', '3'].map(num => (
              <button
                key={num}
                onClick={() => handleKeyPress(num)}
                className="rounded-xl bg-slate-900 border border-white/5 hover:bg-slate-800 text-base font-bold text-slate-200 active:scale-95 transition-all"
              >
                {num}
              </button>
            ))}
            <button
              onClick={() => handleKeyPress('±')}
              className="rounded-xl bg-slate-900 border border-white/5 hover:bg-slate-800 text-base font-bold text-slate-300 active:scale-95 transition-all"
            >
              ±
            </button>

            <button
              onClick={() => handleKeyPress('0')}
              className="col-span-2 rounded-xl bg-slate-900 border border-white/5 hover:bg-slate-800 text-base font-bold text-slate-200 active:scale-95 transition-all"
            >
              0
            </button>
            <button
              onClick={() => handleKeyPress('.')}
              className="rounded-xl bg-slate-900 border border-white/5 hover:bg-slate-800 text-base font-bold text-slate-200 active:scale-95 transition-all"
            >
              .
            </button>
            <button
              onClick={() => copyToClipboard(currentResult, 'Conversion Result')}
              className="rounded-xl bg-purple-600 hover:bg-purple-500 text-[10px] font-bold text-white flex items-center justify-center gap-1 shadow-lg shadow-purple-950/20 active:scale-95 transition-all"
            >
              <Copy className="w-3 h-3" /> COPY
            </button>
          </div>
        </div>

        {/* Right column: Conversions to all other units (Bento style details panel) */}
        <div className="flex-1 flex flex-col p-4 overflow-hidden">
          <div className="flex items-center justify-between mb-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
              <span>All Conversions for {inputValue || '0'} {CATEGORIES[category].units[fromUnit]?.symbol}</span>
            </h4>
            <span className="text-[10px] text-slate-500">Click row to copy or select</span>
          </div>

          <div className="flex-1 overflow-y-auto pr-1 space-y-1.5 custom-scrollbar">
            {(Object.entries(CATEGORIES[category].units) as [string, UnitDefinition][]).map(([uKey, uDef]) => {
              const res = convertValue(inputValue, category, fromUnit, uKey);
              const isSource = uKey === fromUnit;
              const isTarget = uKey === toUnit;

              return (
                <div
                  key={uKey}
                  onClick={() => {
                    setToUnit(uKey);
                    copyToClipboard(res, `${uDef.label}`);
                  }}
                  className={`flex items-center justify-between p-2.5 rounded-xl border transition-all cursor-pointer group ${
                    isSource
                      ? 'bg-purple-500/10 border-purple-500/30'
                      : isTarget
                      ? 'bg-indigo-500/10 border-indigo-500/30'
                      : 'bg-white/[0.02] border-white/5 hover:border-white/10 hover:bg-white/[0.04]'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <div className={`w-2 h-2 rounded-full ${
                      isSource ? 'bg-purple-400' : isTarget ? 'bg-indigo-400' : 'bg-slate-700'
                    }`} />
                    <div>
                      <span className="text-xs font-bold text-slate-300">{uDef.label}</span>
                      <span className="text-[10px] text-slate-500 font-mono ml-1.5">({uDef.symbol})</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 max-w-[50%] overflow-hidden">
                    <span className="text-xs font-mono font-bold text-slate-200 truncate select-all">{res}</span>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        copyToClipboard(res, `${uDef.label} result`);
                      }}
                      className="p-1 rounded hover:bg-white/10 text-slate-500 hover:text-slate-300 transition-colors opacity-0 group-hover:opacity-100"
                      title="Copy"
                    >
                      <Copy className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Quick reciprocal conversion helper */}
          <div className="mt-3 p-3 bg-white/[0.02] border border-white/5 rounded-xl flex items-center justify-between text-[11px] text-slate-400">
            <div className="flex items-center gap-1.5">
              <span className="font-semibold text-slate-500">Reciprocal:</span>
              <span className="font-mono">
                1 {CATEGORIES[category].units[toUnit]?.symbol} = {convertValue('1', category, toUnit, fromUnit)} {CATEGORIES[category].units[fromUnit]?.symbol}
              </span>
            </div>
            <button
              onClick={() => copyToClipboard(convertValue('1', category, toUnit, fromUnit), 'Reciprocal factor')}
              className="p-1 text-slate-500 hover:text-slate-300 transition-colors"
              title="Copy Reciprocal factor"
            >
              <Copy className="w-3 h-3" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
