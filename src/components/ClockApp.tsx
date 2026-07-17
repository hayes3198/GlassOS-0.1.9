import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'motion/react';
import { Clock, RefreshCw, Palette, Check, Sliders, Settings } from 'lucide-react';

interface ClockAppProps {
  addNotification?: (title: string, message: string, type: 'info' | 'success' | 'warning' | 'error') => void;
}

const PRESET_COLORS = [
  { name: 'Neon Emerald', value: '#10b981', shadow: 'rgba(16, 185, 129, 0.4)' },
  { name: 'Cyber Pink', value: '#f43f5e', shadow: 'rgba(244, 63, 94, 0.4)' },
  { name: 'Electric Blue', value: '#3b82f6', shadow: 'rgba(59, 130, 246, 0.4)' },
  { name: 'Solar Amber', value: '#f59e0b', shadow: 'rgba(245, 158, 11, 0.4)' },
  { name: 'Glow Purple', value: '#a855f7', shadow: 'rgba(168, 85, 247, 0.4)' },
  { name: 'Cosmic Teal', value: '#06b6d4', shadow: 'rgba(6, 182, 212, 0.4)' },
  { name: 'Clean White', value: '#ffffff', shadow: 'rgba(255, 255, 255, 0.3)' },
];

export default function ClockApp({ addNotification }: ClockAppProps) {
  const [offsetMs, setOffsetMs] = useState<number>(0);
  const [isMilitary, setIsMilitary] = useState<boolean>(false); // default standard
  const [selectedColor, setSelectedColor] = useState<string>('#10b981'); // default Neon Emerald
  const [time, setTime] = useState<Date>(new Date());
  
  // Edit Time Form State
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [editHours, setEditHours] = useState<number>(12);
  const [editMinutes, setEditMinutes] = useState<number>(0);
  const [editSeconds, setEditSeconds] = useState<number>(0);
  const [editAmPm, setEditAmPm] = useState<'AM' | 'PM'>('PM');

  // Handle ticking
  useEffect(() => {
    const timer = setInterval(() => {
      setTime(new Date(Date.now() + offsetMs));
    }, 100);
    return () => clearInterval(timer);
  }, [offsetMs]);

  // Set initial edit form values when entering edit mode
  useEffect(() => {
    if (isEditing) {
      const currentHours = time.getHours();
      setEditHours(currentHours === 0 ? 12 : currentHours > 12 ? currentHours - 12 : currentHours);
      setEditMinutes(time.getMinutes());
      setEditSeconds(time.getSeconds());
      setEditAmPm(currentHours >= 12 ? 'PM' : 'AM');
    }
  }, [isEditing]);

  const handleApplyTime = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Convert 12h to 24h for calculations
    let final24Hours = editHours % 12;
    if (editAmPm === 'PM') {
      final24Hours += 12;
    }

    const now = new Date();
    const targetDate = new Date();
    targetDate.setHours(final24Hours, editMinutes, editSeconds, 0);

    const newOffset = targetDate.getTime() - now.getTime();
    setOffsetMs(newOffset);
    setIsEditing(false);
    
    if (addNotification) {
      addNotification(
        'Clock',
        `Time updated to ${editHours.toString().padStart(2, '0')}:${editMinutes.toString().padStart(2, '0')}:${editSeconds.toString().padStart(2, '0')} ${editAmPm}`,
        'success'
      );
    }
  };

  const handleResetTime = () => {
    setOffsetMs(0);
    setIsEditing(false);
    if (addNotification) {
      addNotification('Clock', 'Time synchronized with system clock.', 'info');
    }
  };

  // Calculations for hands
  const hrs = time.getHours();
  const mins = time.getMinutes();
  const secs = time.getSeconds();
  const ms = time.getMilliseconds();

  // Smooth movement for second hand
  const secondHandAngle = (secs * 6) + (ms * 0.006);
  const minuteHandAngle = (mins * 6) + (secs * 0.1);
  const hourHandAngle = ((hrs % 12) * 30) + (mins * 0.5);

  // Digital format
  const formatDigit = (num: number) => num.toString().padStart(2, '0');
  
  let digitalDisplay = '';
  if (isMilitary) {
    digitalDisplay = `${formatDigit(hrs)}:${formatDigit(mins)}:${formatDigit(secs)}`;
  } else {
    const standardHrs = hrs === 0 ? 12 : hrs > 12 ? hrs - 12 : hrs;
    const ampm = hrs >= 12 ? 'PM' : 'AM';
    digitalDisplay = `${formatDigit(standardHrs)}:${formatDigit(mins)}:${formatDigit(secs)} ${ampm}`;
  }

  // Find active preset shadow or create custom
  const activePreset = PRESET_COLORS.find(p => p.value.toLowerCase() === selectedColor.toLowerCase());
  const shadowStyle = activePreset ? activePreset.shadow : `rgba(${parseInt(selectedColor.slice(1, 3), 16)}, ${parseInt(selectedColor.slice(3, 5), 16)}, ${parseInt(selectedColor.slice(5, 7), 16)}, 0.4)`;

  // Analog Clock SVG components
  const renderTicks = () => {
    const ticks = [];
    for (let i = 0; i < 12; i++) {
      const angle = i * 30;
      const isMajor = i % 3 === 0;
      const length = isMajor ? 10 : 5;
      const strokeWidth = isMajor ? 2.5 : 1;
      ticks.push(
        <line
          key={i}
          x1="100"
          y1={20 + length}
          x2="100"
          y2="20"
          stroke={isMajor ? selectedColor : 'rgba(255, 255, 255, 0.4)'}
          strokeWidth={strokeWidth}
          transform={`rotate(${angle} 100 100)`}
        />
      );
    }
    return ticks;
  };

  return (
    <div className="flex flex-col md:flex-row h-full w-full bg-slate-950/40 text-slate-100 overflow-hidden select-none">
      {/* Left panel: Clocks View */}
      <div className="flex-1 flex flex-col items-center justify-center p-6 border-r border-white/10 relative">
        {/* Glow effect matching chosen color */}
        <div 
          className="absolute w-72 h-72 rounded-full blur-[100px] pointer-events-none opacity-20"
          style={{ backgroundColor: selectedColor }}
        />

        {/* Analog Clock Container */}
        <div 
          className="relative w-60 h-60 rounded-full flex items-center justify-center border border-white/10 bg-slate-900/60 transition-all duration-500 mb-6"
          style={{ boxShadow: `0 0 35px ${shadowStyle}` }}
        >
          <svg className="w-full h-full" viewBox="0 0 200 200">
            {/* Clock ticks */}
            {renderTicks()}

            {/* Numbers */}
            <text x="100" y="42" fill="white" fontSize="14" fontWeight="600" textAnchor="middle" opacity="0.8" className="font-sans">12</text>
            <text x="165" y="105" fill="white" fontSize="14" fontWeight="600" textAnchor="middle" opacity="0.8" className="font-sans">3</text>
            <text x="100" y="170" fill="white" fontSize="14" fontWeight="600" textAnchor="middle" opacity="0.8" className="font-sans">6</text>
            <text x="35" y="105" fill="white" fontSize="14" fontWeight="600" textAnchor="middle" opacity="0.8" className="font-sans">9</text>

            {/* Hour hand */}
            <line
              x1="100"
              y1="100"
              x2="100"
              y2="55"
              stroke="white"
              strokeWidth="5"
              strokeLinecap="round"
              transform={`rotate(${hourHandAngle} 100 100)`}
            />

            {/* Minute hand */}
            <line
              x1="100"
              y1="100"
              x2="100"
              y2="38"
              stroke="white"
              strokeWidth="3"
              strokeLinecap="round"
              opacity="0.9"
              transform={`rotate(${minuteHandAngle} 100 100)`}
            />

            {/* Second hand */}
            <line
              x1="100"
              y1="115"
              x2="100"
              y2="28"
              stroke={selectedColor}
              strokeWidth="1.5"
              strokeLinecap="round"
              transform={`rotate(${secondHandAngle} 100 100)`}
            />

            {/* Center pin */}
            <circle cx="100" cy="100" r="5" fill={selectedColor} stroke="white" strokeWidth="1.5" />
          </svg>
        </div>

        {/* Digital Clock Display */}
        <div className="text-center">
          <div 
            className="text-4xl md:text-5xl font-mono font-bold tracking-widest tabular-nums filter transition-all duration-300"
            style={{ 
              color: selectedColor,
              textShadow: `0 0 15px ${shadowStyle}` 
            }}
          >
            {digitalDisplay}
          </div>
          <div className="text-xs text-slate-400 mt-2 flex items-center justify-center gap-2">
            <span className="px-2 py-0.5 rounded-full bg-white/5 border border-white/10 uppercase tracking-wider">
              {isMilitary ? '24-Hour (Military)' : '12-Hour (Standard)'}
            </span>
            {offsetMs !== 0 && (
              <span className="px-2 py-0.5 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400 font-medium">
                Custom Offset
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Right panel: Controls & Configuration */}
      <div className="w-full md:w-80 flex flex-col p-6 bg-slate-900/40 overflow-y-auto">
        <div className="flex items-center gap-2 border-b border-white/10 pb-4 mb-5">
          <Settings className="w-5 h-5 text-slate-400" />
          <h2 className="text-sm font-semibold uppercase tracking-wider text-slate-200">Clock Settings</h2>
        </div>

        {/* Format Selector */}
        <div className="mb-6">
          <label className="text-xs font-medium text-slate-400 block mb-3 uppercase tracking-wider">Time Format</label>
          <div className="flex bg-slate-950/40 p-1 rounded-xl border border-white/5">
            <button
              onClick={() => setIsMilitary(false)}
              className={`flex-1 py-1.5 rounded-lg text-xs font-medium transition-all ${
                !isMilitary 
                  ? 'bg-white/10 text-white shadow-md' 
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Standard (12h)
            </button>
            <button
              onClick={() => setIsMilitary(true)}
              className={`flex-1 py-1.5 rounded-lg text-xs font-medium transition-all ${
                isMilitary 
                  ? 'bg-white/10 text-white shadow-md' 
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Military (24h)
            </button>
          </div>
        </div>

        {/* Color Picker Section */}
        <div className="mb-6">
          <label className="text-xs font-medium text-slate-400 block mb-3 uppercase tracking-wider flex items-center gap-1.5">
            <Palette className="w-3.5 h-3.5" /> Color Theme
          </label>
          {/* Presets Grid */}
          <div className="grid grid-cols-4 gap-2 mb-4">
            {PRESET_COLORS.map(preset => (
              <button
                key={preset.value}
                onClick={() => setSelectedColor(preset.value)}
                className="group relative h-9 rounded-xl border flex items-center justify-center transition-all duration-200 hover:scale-105"
                style={{ 
                  backgroundColor: preset.value === '#ffffff' ? '#1e293b' : `${preset.value}15`,
                  borderColor: selectedColor.toLowerCase() === preset.value.toLowerCase() ? preset.value : 'rgba(255, 255, 255, 0.1)',
                }}
                title={preset.name}
              >
                <span 
                  className="w-4 h-4 rounded-full border border-white/10" 
                  style={{ backgroundColor: preset.value }}
                />
                {selectedColor.toLowerCase() === preset.value.toLowerCase() && (
                  <Check className="absolute top-1 right-1 w-2.5 h-2.5 text-white bg-slate-900 rounded-full border border-white/20 p-0.5" />
                )}
              </button>
            ))}

            {/* Custom Color Picker Input */}
            <div className="relative h-9 rounded-xl border border-white/10 bg-slate-950/40 flex items-center justify-center overflow-hidden hover:scale-105 transition-all">
              <input
                type="color"
                value={selectedColor}
                onChange={(e) => setSelectedColor(e.target.value)}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              />
              <div 
                className="w-4 h-4 rounded-full border border-white/20 flex items-center justify-center"
                style={{ backgroundColor: selectedColor }}
              />
            </div>
          </div>
        </div>

        {/* Edit Time Section */}
        <div className="mt-auto border-t border-white/10 pt-5">
          <div className="flex items-center justify-between mb-4">
            <span className="text-xs font-medium text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
              <Sliders className="w-3.5 h-3.5" /> Custom Time
            </span>
            {offsetMs !== 0 && (
              <button
                onClick={handleResetTime}
                className="text-[10px] text-amber-400 hover:text-amber-300 font-medium flex items-center gap-1 bg-amber-500/10 hover:bg-amber-500/20 px-2 py-1 rounded-lg border border-amber-500/20 transition-all"
              >
                <RefreshCw className="w-3 h-3" /> Sync System
              </button>
            )}
          </div>

          {!isEditing ? (
            <button
              onClick={() => setIsEditing(true)}
              className="w-full py-2.5 rounded-xl border border-white/10 hover:border-white/20 bg-white/5 hover:bg-white/10 text-xs font-medium text-slate-200 transition-all flex items-center justify-center gap-2"
            >
              Adjust Clock Time
            </button>
          ) : (
            <form onSubmit={handleApplyTime} className="space-y-4 bg-slate-950/40 p-3.5 rounded-2xl border border-white/5">
              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="text-[10px] text-slate-400 block mb-1">Hour</label>
                  <input
                    type="number"
                    min="1"
                    max="12"
                    value={editHours}
                    onChange={(e) => setEditHours(Math.max(1, Math.min(12, parseInt(e.target.value) || 1)))}
                    className="w-full bg-slate-900 border border-white/10 rounded-lg px-2 py-1.5 text-sm text-center font-mono focus:border-violet-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="text-[10px] text-slate-400 block mb-1">Minute</label>
                  <input
                    type="number"
                    min="0"
                    max="59"
                    value={editMinutes}
                    onChange={(e) => setEditMinutes(Math.max(0, Math.min(59, parseInt(e.target.value) || 0)))}
                    className="w-full bg-slate-900 border border-white/10 rounded-lg px-2 py-1.5 text-sm text-center font-mono focus:border-violet-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="text-[10px] text-slate-400 block mb-1">Second</label>
                  <input
                    type="number"
                    min="0"
                    max="59"
                    value={editSeconds}
                    onChange={(e) => setEditSeconds(Math.max(0, Math.min(59, parseInt(e.target.value) || 0)))}
                    className="w-full bg-slate-900 border border-white/10 rounded-lg px-2 py-1.5 text-sm text-center font-mono focus:border-violet-500 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="text-[10px] text-slate-400 block mb-1">AM / PM</label>
                <div className="flex bg-slate-900 p-0.5 rounded-lg border border-white/5">
                  <button
                    type="button"
                    onClick={() => setEditAmPm('AM')}
                    className={`flex-1 py-1 rounded-md text-xs font-medium transition-all ${
                      editAmPm === 'AM' ? 'bg-white/10 text-white' : 'text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    AM
                  </button>
                  <button
                    type="button"
                    onClick={() => setEditAmPm('PM')}
                    className={`flex-1 py-1 rounded-md text-xs font-medium transition-all ${
                      editAmPm === 'PM' ? 'bg-white/10 text-white' : 'text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    PM
                  </button>
                </div>
              </div>

              <div className="flex gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => setIsEditing(false)}
                  className="flex-1 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-xs font-medium text-slate-300 transition-all"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-1.5 rounded-lg text-xs font-bold transition-all shadow-md text-slate-950"
                  style={{ backgroundColor: selectedColor }}
                >
                  Apply
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
