import React, { useState, useEffect } from 'react';
import { Palette, Trash2, Check, Sliders, Play, Eye, Sparkles, RefreshCw } from 'lucide-react';
import { themeStorage, GlassTheme } from '../services/themeStorageService';

function cn(...classes: any[]) {
  return classes.filter(Boolean).join(' ');
}

interface ThemeCreatorProps {
  accentColor: string;
  setAccentColor: (color: string) => void;
  addNotification: (title: string, message: string, type: 'success' | 'error' | 'info' | 'warning') => void;
}

const PRESET_THEMES: GlassTheme[] = [
  {
    id: 'preset-default',
    name: 'Default Glass',
    bgColor: 'rgba(255, 255, 255, 0.1)',
    borderColor: 'rgba(255, 255, 255, 0.2)',
    blur: 12,
    textColor: '#ffffff',
    accentColor: '#3b82f6',
    shadowColor: 'rgba(31, 38, 135, 0.37)',
    isPreset: true
  },
  {
    id: 'preset-aurora',
    name: 'Aurora Borealis',
    bgColor: 'rgba(16, 185, 129, 0.15)',
    borderColor: 'rgba(52, 211, 153, 0.3)',
    blur: 16,
    textColor: '#ecfdf5',
    accentColor: '#10b981',
    shadowColor: 'rgba(16, 185, 129, 0.25)',
    isPreset: true
  },
  {
    id: 'preset-cyberpunk',
    name: 'Cyberpunk Neon',
    bgColor: 'rgba(15, 10, 25, 0.5)',
    borderColor: 'rgba(236, 72, 153, 0.4)',
    blur: 8,
    textColor: '#fdf2f8',
    accentColor: '#ec4899',
    shadowColor: 'rgba(236, 72, 153, 0.3)',
    isPreset: true
  },
  {
    id: 'preset-slate',
    name: 'Monochrome Slate',
    bgColor: 'rgba(30, 41, 59, 0.45)',
    borderColor: 'rgba(255, 255, 255, 0.08)',
    blur: 24,
    textColor: '#f8fafc',
    accentColor: '#ffffff',
    shadowColor: 'rgba(0, 0, 0, 0.5)',
    isPreset: true
  },
  {
    id: 'preset-sunset',
    name: 'Sunset Glow',
    bgColor: 'rgba(244, 63, 94, 0.15)',
    borderColor: 'rgba(251, 146, 60, 0.3)',
    blur: 14,
    textColor: '#fff1f2',
    accentColor: '#f43f5e',
    shadowColor: 'rgba(244, 63, 94, 0.25)',
    isPreset: true
  }
];

// Hex helper functions
function hexToRgba(hex: string, alpha: number): string {
  const rHex = hex.replace('#', '');
  let r = 255, g = 255, b = 255;
  if (rHex.length === 3) {
    r = parseInt(rHex[0] + rHex[0], 16);
    g = parseInt(rHex[1] + rHex[1], 16);
    b = parseInt(rHex[2] + rHex[2], 16);
  } else if (rHex.length === 6) {
    r = parseInt(rHex.slice(0, 2), 16);
    g = parseInt(rHex.slice(2, 4), 16);
    b = parseInt(rHex.slice(4, 6), 16);
  }
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

function rgbaToHexAndAlpha(rgba: string): { hex: string; alpha: number } {
  const match = rgba.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)(?:,\s*([\d.]+))?\)/);
  if (!match) return { hex: '#ffffff', alpha: 0.1 };
  const r = parseInt(match[1], 10);
  const g = parseInt(match[2], 10);
  const b = parseInt(match[3], 10);
  const alpha = match[4] !== undefined ? parseFloat(match[4]) : 1;
  const hex = '#' + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1);
  return { hex, alpha };
}

export function ThemeCreator({ accentColor, setAccentColor, addNotification }: ThemeCreatorProps) {
  const [themes, setThemes] = useState<GlassTheme[]>([]);
  const [activeThemeId, setActiveThemeId] = useState<string>(() => {
    return localStorage.getItem('glassos_active_theme_id') || 'preset-default';
  });

  // Current customization state
  const [themeName, setThemeName] = useState('My Custom Theme');
  const [bgHex, setBgHex] = useState('#ffffff');
  const [bgAlpha, setBgAlpha] = useState(0.1);
  const [borderHex, setBorderHex] = useState('#ffffff');
  const [borderAlpha, setBorderAlpha] = useState(0.2);
  const [blurVal, setBlurVal] = useState(12);
  const [textHex, setTextHex] = useState('#ffffff');
  const [customAccentHex, setCustomAccentHex] = useState('#3b82f6');
  const [shadowHex, setShadowHex] = useState('#1f2687');
  const [shadowAlpha, setShadowAlpha] = useState(0.3);

  // Load themes on mount
  useEffect(() => {
    loadSavedThemes();
  }, []);

  const loadSavedThemes = async () => {
    try {
      const saved = await themeStorage.loadThemes();
      setThemes(saved);
    } catch (e) {
      console.error('Failed to load custom themes:', e);
    }
  };

  // Helper to apply variables directly to :root
  const applyThemeToSystem = (theme: GlassTheme) => {
    const root = document.documentElement;
    root.style.setProperty('--glass-bg', theme.bgColor);
    root.style.setProperty('--glass-blur', `${theme.blur}px`);
    root.style.setProperty('--glass-border', theme.borderColor);
    root.style.setProperty('--glass-shadow', `0 8px 32px 0 ${theme.shadowColor}`);
    root.style.setProperty('--glass-text', theme.textColor);
    
    // Also update Accent Color globally in App state
    setAccentColor(theme.accentColor);
    setActiveThemeId(theme.id);
    localStorage.setItem('glassos_active_theme_id', theme.id);
  };

  const handleSaveTheme = async () => {
    if (!themeName.trim()) {
      addNotification('Theme Creator', 'Please specify a name for your theme.', 'error');
      return;
    }

    const newTheme: GlassTheme = {
      id: 'custom-' + Date.now(),
      name: themeName,
      bgColor: hexToRgba(bgHex, bgAlpha),
      borderColor: hexToRgba(borderHex, borderAlpha),
      blur: blurVal,
      textColor: textHex,
      accentColor: customAccentHex,
      shadowColor: hexToRgba(shadowHex, shadowAlpha)
    };

    try {
      await themeStorage.saveTheme(newTheme);
      addNotification('Theme Creator', `Saved "${themeName}" to IndexedDB.`, 'success');
      loadSavedThemes();
    } catch (e) {
      addNotification('Theme Creator', 'Failed to save theme.', 'error');
    }
  };

  const handleDeleteTheme = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await themeStorage.deleteTheme(id);
      addNotification('Theme Creator', 'Theme removed from IndexedDB.', 'warning');
      loadSavedThemes();
      if (activeThemeId === id) {
        // Fallback to default
        applyThemeToSystem(PRESET_THEMES[0]);
      }
    } catch (e) {
      addNotification('Theme Creator', 'Failed to delete theme.', 'error');
    }
  };

  const handleSelectTheme = (theme: GlassTheme) => {
    applyThemeToSystem(theme);
    addNotification('Theme Creator', `Applied theme: ${theme.name}`, 'success');

    // Populate the editors with the selected theme's properties
    setThemeName(theme.name.startsWith('My Custom') || theme.isPreset ? 'My Custom Theme' : theme.name);
    
    const bgInfo = rgbaToHexAndAlpha(theme.bgColor);
    setBgHex(bgInfo.hex);
    setBgAlpha(bgInfo.alpha);

    const borderInfo = rgbaToHexAndAlpha(theme.borderColor);
    setBorderHex(borderInfo.hex);
    setBorderAlpha(borderInfo.alpha);

    setBlurVal(theme.blur);
    setTextHex(theme.textColor);
    setCustomAccentHex(theme.accentColor);

    const shadowInfo = rgbaToHexAndAlpha(theme.shadowColor);
    setShadowHex(shadowInfo.hex);
    setShadowAlpha(shadowInfo.alpha);
  };

  const handleResetToDefault = () => {
    applyThemeToSystem(PRESET_THEMES[0]);
    addNotification('Theme Creator', 'Reset to system default glassmorphism styling.', 'info');
  };

  const currentBgRgba = hexToRgba(bgHex, bgAlpha);
  const currentBorderRgba = hexToRgba(borderHex, borderAlpha);
  const currentShadowRgba = hexToRgba(shadowHex, shadowAlpha);

  // Live preview box styled with current temporary customization options
  const previewStyle = {
    background: currentBgRgba,
    backdropFilter: `blur(${blurVal}px)`,
    WebkitBackdropFilter: `blur(${blurVal}px)`,
    border: `1px solid ${currentBorderRgba}`,
    boxShadow: `0 8px 32px 0 ${currentShadowRgba}`,
    color: textHex
  };

  const allThemesList = [...PRESET_THEMES, ...themes];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between border-b border-white/10 pb-4">
        <div>
          <h2 className="text-lg font-bold flex items-center gap-2">
            <Palette className="text-pink-400" size={20} />
            Theme Creator
          </h2>
          <p className="text-[10px] text-white/40">Design, customize, and persist glassmorphism style templates in IndexedDB</p>
        </div>
        <button 
          onClick={handleResetToDefault}
          className="px-3 py-1.5 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg text-[10px] font-bold transition-all uppercase tracking-wider flex items-center gap-1.5"
        >
          <RefreshCw size={11} />
          Reset Default
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Style Configurator */}
        <div className="lg:col-span-7 space-y-6 glass p-5 rounded-2xl border border-white/10 bg-black/25">
          <div className="space-y-4">
            {/* Theme Name input */}
            <div>
              <label className="text-[10px] font-bold text-white/40 uppercase tracking-wider block mb-1.5">Theme Name</label>
              <input 
                type="text" 
                value={themeName}
                onChange={(e) => setThemeName(e.target.value)}
                placeholder="E.g. Neon Horizon"
                className="w-full glass-input text-xs font-medium text-white/90 bg-white/5 border border-white/10 focus:border-pink-500/50"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              {/* Background Configuration */}
              <div className="space-y-2 p-3 bg-white/5 rounded-xl border border-white/5">
                <span className="text-[10px] font-bold text-pink-400 uppercase tracking-widest block">Background</span>
                <div className="flex items-center gap-2">
                  <input 
                    type="color" 
                    value={bgHex}
                    onChange={(e) => setBgHex(e.target.value)}
                    className="w-8 h-8 rounded border border-white/10 cursor-pointer bg-transparent"
                  />
                  <div className="flex-1">
                    <span className="text-[9px] font-mono block text-white/50">{bgHex}</span>
                    <span className="text-[9px] font-mono block text-white/30">{currentBgRgba}</span>
                  </div>
                </div>
                <div>
                  <div className="flex justify-between text-[9px] text-white/40 mb-1">
                    <span>Opacity</span>
                    <span>{Math.round(bgAlpha * 100)}%</span>
                  </div>
                  <input 
                    type="range" 
                    min="0" 
                    max="1" 
                    step="0.01"
                    value={bgAlpha}
                    onChange={(e) => setBgAlpha(parseFloat(e.target.value))}
                    className="w-full accent-pink-500 cursor-pointer h-1 rounded bg-white/10"
                  />
                </div>
              </div>

              {/* Border Configuration */}
              <div className="space-y-2 p-3 bg-white/5 rounded-xl border border-white/5">
                <span className="text-[10px] font-bold text-pink-400 uppercase tracking-widest block">Border Glass</span>
                <div className="flex items-center gap-2">
                  <input 
                    type="color" 
                    value={borderHex}
                    onChange={(e) => setBorderHex(e.target.value)}
                    className="w-8 h-8 rounded border border-white/10 cursor-pointer bg-transparent"
                  />
                  <div className="flex-1">
                    <span className="text-[9px] font-mono block text-white/50">{borderHex}</span>
                    <span className="text-[9px] font-mono block text-white/30">{currentBorderRgba}</span>
                  </div>
                </div>
                <div>
                  <div className="flex justify-between text-[9px] text-white/40 mb-1">
                    <span>Opacity</span>
                    <span>{Math.round(borderAlpha * 100)}%</span>
                  </div>
                  <input 
                    type="range" 
                    min="0" 
                    max="1" 
                    step="0.01"
                    value={borderAlpha}
                    onChange={(e) => setBorderAlpha(parseFloat(e.target.value))}
                    className="w-full accent-pink-500 cursor-pointer h-1 rounded bg-white/10"
                  />
                </div>
              </div>
            </div>

            {/* Blur & Text Configuration */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2 p-3 bg-white/5 rounded-xl border border-white/5">
                <span className="text-[10px] font-bold text-pink-400 uppercase tracking-widest block">Glass Blur</span>
                <div className="flex justify-between items-center text-xs">
                  <span className="text-[10px] text-white/60">Blur Radius</span>
                  <span className="font-mono text-[10px] text-pink-400">{blurVal}px</span>
                </div>
                <input 
                  type="range" 
                  min="0" 
                  max="40" 
                  step="1"
                  value={blurVal}
                  onChange={(e) => setBlurVal(parseInt(e.target.value, 10))}
                  className="w-full accent-pink-500 cursor-pointer h-1 rounded bg-white/10"
                />
              </div>

              <div className="space-y-2 p-3 bg-white/5 rounded-xl border border-white/5">
                <span className="text-[10px] font-bold text-pink-400 uppercase tracking-widest block">Typography Color</span>
                <div className="flex items-center gap-2">
                  <input 
                    type="color" 
                    value={textHex}
                    onChange={(e) => setTextHex(e.target.value)}
                    className="w-8 h-8 rounded border border-white/10 cursor-pointer bg-transparent"
                  />
                  <div>
                    <span className="text-[10px] font-mono block text-white/70">{textHex}</span>
                    <span className="text-[8px] text-white/30 uppercase font-bold tracking-widest">Main Text</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Accent Color & Shadow Color */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2 p-3 bg-white/5 rounded-xl border border-white/5">
                <span className="text-[10px] font-bold text-pink-400 uppercase tracking-widest block">System Accent</span>
                <div className="flex items-center gap-2">
                  <input 
                    type="color" 
                    value={customAccentHex}
                    onChange={(e) => setCustomAccentHex(e.target.value)}
                    className="w-8 h-8 rounded border border-white/10 cursor-pointer bg-transparent"
                  />
                  <div>
                    <span className="text-[10px] font-mono block text-white/70">{customAccentHex}</span>
                    <span className="text-[8px] text-white/30 uppercase font-bold tracking-widest">System Theme Accent</span>
                  </div>
                </div>
              </div>

              <div className="space-y-2 p-3 bg-white/5 rounded-xl border border-white/5">
                <span className="text-[10px] font-bold text-pink-400 uppercase tracking-widest block">Shadow Glow</span>
                <div className="flex items-center gap-2">
                  <input 
                    type="color" 
                    value={shadowHex}
                    onChange={(e) => setShadowHex(e.target.value)}
                    className="w-8 h-8 rounded border border-white/10 cursor-pointer bg-transparent"
                  />
                  <div className="flex-1">
                    <span className="text-[9px] font-mono block text-white/50">{shadowHex}</span>
                    <span className="text-[9px] font-mono block text-white/30">{currentShadowRgba}</span>
                  </div>
                </div>
                <div>
                  <div className="flex justify-between text-[9px] text-white/40 mb-1">
                    <span>Glow Opacity</span>
                    <span>{Math.round(shadowAlpha * 100)}%</span>
                  </div>
                  <input 
                    type="range" 
                    min="0" 
                    max="1" 
                    step="0.01"
                    value={shadowAlpha}
                    onChange={(e) => setShadowAlpha(parseFloat(e.target.value))}
                    className="w-full accent-pink-500 cursor-pointer h-1 rounded bg-white/10"
                  />
                </div>
              </div>
            </div>
          </div>

          <button 
            onClick={handleSaveTheme}
            className="w-full py-2.5 bg-pink-600 hover:bg-pink-500 text-white rounded-xl text-xs font-bold transition-all uppercase tracking-widest flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-pink-500/20 active:translate-y-0.5"
          >
            <Sparkles size={14} />
            Save Theme to IndexedDB
          </button>
        </div>

        {/* Right Column: Live Preview & Saved List */}
        <div className="lg:col-span-5 space-y-6">
          {/* Visual Theme Preview Box */}
          <div className="space-y-2">
            <span className="text-[10px] font-bold text-white/40 uppercase tracking-[0.2em] px-1">Live Theme Preview</span>
            <div 
              style={previewStyle}
              className="p-5 rounded-2xl border transition-all relative overflow-hidden"
            >
              {/* Preview Window Header */}
              <div className="flex items-center justify-between border-b border-white/10 pb-3 mb-3">
                <div className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full bg-red-500/60" />
                  <div className="w-2.5 h-2.5 rounded-full bg-yellow-500/60" />
                  <div className="w-2.5 h-2.5 rounded-full bg-green-500/60" />
                  <span className="text-[10px] font-bold uppercase tracking-wider opacity-80 ml-1">Mock Terminal</span>
                </div>
                <span className="text-[8px] font-mono opacity-50 px-1.5 py-0.5 bg-white/5 border border-white/5 rounded">ttyX</span>
              </div>

              {/* Preview Content */}
              <div className="space-y-3">
                <h3 className="text-sm font-bold leading-tight" style={{ color: textHex }}>
                  Glassmorphism Engine v3.5
                </h3>
                <p className="text-[10px] opacity-70 leading-relaxed">
                  Notice how the background tint blends beautifully with the wallpaper underneath. Custom styles render immediately system-wide.
                </p>
                <div className="flex gap-2">
                  <button 
                    style={{ backgroundColor: customAccentHex, color: '#ffffff' }}
                    className="px-3 py-1 rounded text-[9px] font-bold uppercase tracking-wider"
                  >
                    Mock Action
                  </button>
                  <button 
                    style={{ borderColor: currentBorderRgba }}
                    className="px-3 py-1 rounded text-[9px] font-bold uppercase tracking-wider border"
                  >
                    Alt Button
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Theme Palette List */}
          <div className="space-y-2">
            <span className="text-[10px] font-bold text-white/40 uppercase tracking-[0.2em] px-1">Themes & Palettes</span>
            <div className="grid grid-cols-1 gap-2 max-h-[300px] overflow-y-auto pr-1">
              {allThemesList.map((t) => {
                const isActive = activeThemeId === t.id;
                return (
                  <button 
                    key={t.id}
                    onClick={() => handleSelectTheme(t)}
                    className={cn(
                      "w-full text-left p-3 rounded-xl border transition-all text-xs flex items-center justify-between group cursor-pointer",
                      isActive ? "bg-white/10 border-pink-500/50" : "bg-white/5 border-white/5 hover:bg-white/10"
                    )}
                  >
                    <div className="flex items-center gap-3">
                      {/* Accent-Colored dot & Theme colors list preview block */}
                      <div className="flex -space-x-1">
                        <div className="w-4 h-4 rounded-full border border-white/10" style={{ backgroundColor: t.bgColor }} />
                        <div className="w-4 h-4 rounded-full border border-white/10" style={{ backgroundColor: t.borderColor }} />
                        <div className="w-4 h-4 rounded-full border border-white/10" style={{ backgroundColor: t.accentColor }} />
                      </div>
                      <div>
                        <div className="flex items-center gap-1.5">
                          <span className="font-bold text-white/95">{t.name}</span>
                          {t.isPreset ? (
                            <span className="text-[8px] bg-blue-500/10 text-blue-400 px-1 py-0.2 rounded font-bold uppercase tracking-widest scale-90">Preset</span>
                          ) : (
                            <span className="text-[8px] bg-pink-500/10 text-pink-400 px-1 py-0.2 rounded font-bold uppercase tracking-widest scale-90">Saved</span>
                          )}
                        </div>
                        <span className="text-[8px] text-white/40 font-mono">Blur: {t.blur}px • Accent: {t.accentColor}</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <div className={cn(
                        "w-5 h-5 rounded-full border transition-all flex items-center justify-center",
                        isActive ? "border-pink-400" : "border-white/20 group-hover:border-white/40"
                      )}>
                        {isActive && <Check size={10} className="text-pink-400" />}
                      </div>

                      {!t.isPreset && (
                        <button 
                          onClick={(e) => handleDeleteTheme(t.id, e)}
                          className="p-1 text-white/20 hover:text-red-400 hover:bg-red-500/10 rounded transition-all cursor-pointer"
                          title="Delete theme"
                        >
                          <Trash2 size={12} />
                        </button>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
