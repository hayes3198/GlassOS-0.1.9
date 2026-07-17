import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Timer, Hourglass, Play, Pause, RotateCcw, Volume2, Plus, Trash2, Bell, Sparkles, Check, X, AlertTriangle } from 'lucide-react';

interface TimerAppProps {
  addNotification?: (title: string, message: string, type: 'info' | 'success' | 'warning' | 'error') => void;
}

interface Lap {
  index: number;
  time: number;
  duration: number;
}

interface AlarmItem {
  id: string;
  timeStr: string; // "HH:MM" 24h format
  label: string;
  isEnabled: boolean;
  isPreset?: boolean;
}

const PRESET_ALARMS: Omit<AlarmItem, 'id'>[] = [
  { timeStr: '07:00', label: 'Morning Wakeup', isEnabled: false, isPreset: true },
  { timeStr: '09:00', label: 'Daily Scrum Standup', isEnabled: false, isPreset: true },
  { timeStr: '12:00', label: 'Lunch Break Reminder', isEnabled: false, isPreset: true },
  { timeStr: '15:00', label: 'Afternoon Tea / Coffee', isEnabled: false, isPreset: true },
  { timeStr: '17:00', label: 'End of Workday Wrapup', isEnabled: false, isPreset: true },
  { timeStr: '22:30', label: 'Bedtime Wind-down', isEnabled: false, isPreset: true },
];

export default function TimerApp({ addNotification }: TimerAppProps) {
  const [activeTab, setActiveTab] = useState<'timer' | 'stopwatch' | 'alarm'>('timer');
  
  // Audio Context helper
  const playSound = (freqs = [523.25, 659.25, 783.99], duration = 0.15, gap = 0.05) => {
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      
      freqs.forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.value = freq;
        
        const startTime = ctx.currentTime + idx * (duration + gap);
        osc.connect(gain);
        gain.connect(ctx.destination);
        
        gain.gain.setValueAtTime(0.15, startTime);
        gain.gain.exponentialRampToValueAtTime(0.01, startTime + duration);
        
        osc.start(startTime);
        osc.stop(startTime + duration);
      });
    } catch (e) {
      console.warn('Audio Context not allowed/supported yet:', e);
    }
  };

  // ==========================================
  // TAB 1: TIMER STATE & LOGIC
  // ==========================================
  const [timerHours, setTimerHours] = useState<number>(0);
  const [timerMinutes, setTimerMinutes] = useState<number>(5);
  const [timerSeconds, setTimerSeconds] = useState<number>(0);
  const [timerTotalSecs, setTimerTotalSecs] = useState<number>(300); // 5 mins default
  const [timerRemainingSecs, setTimerRemainingSecs] = useState<number>(300);
  const [timerIsRunning, setTimerIsRunning] = useState<boolean>(false);
  const timerIntervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (timerIsRunning) {
      timerIntervalRef.current = setInterval(() => {
        setTimerRemainingSecs(prev => {
          if (prev <= 1) {
            setTimerIsRunning(false);
            if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
            // Trigger Timer Alert
            playSound([523.25, 523.25, 659.25, 659.25, 783.99, 783.99], 0.2, 0.05);
            if (addNotification) {
              addNotification('Timer', 'Countdown timer completed!', 'success');
            }
            return 0;
          }
          return prev - 1;
        });
      }, 100); // Check speed/tick rate
    } else {
      if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
    }
    return () => {
      if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
    };
  }, [timerIsRunning]);

  const handleStartTimer = () => {
    if (timerRemainingSecs === 0) {
      const total = timerHours * 3600 + timerMinutes * 60 + timerSeconds;
      if (total <= 0) return;
      setTimerTotalSecs(total);
      setTimerRemainingSecs(total);
    }
    setTimerIsRunning(true);
    playSound([523.25, 659.25], 0.1);
  };

  const handlePauseTimer = () => {
    setTimerIsRunning(false);
    playSound([659.25, 523.25], 0.1);
  };

  const handleResetTimer = () => {
    setTimerIsRunning(false);
    const total = timerHours * 3600 + timerMinutes * 60 + timerSeconds;
    setTimerTotalSecs(total > 0 ? total : 300);
    setTimerRemainingSecs(total > 0 ? total : 300);
    playSound([392.00], 0.15);
  };

  const handleSetTimerPreset = (h: number, m: number, s: number) => {
    setTimerIsRunning(false);
    setTimerHours(h);
    setTimerMinutes(m);
    setTimerSeconds(s);
    const total = h * 3600 + m * 60 + s;
    setTimerTotalSecs(total);
    setTimerRemainingSecs(total);
    playSound([440.00, 554.37], 0.08);
  };

  const progressPct = timerTotalSecs > 0 ? (timerRemainingSecs / timerTotalSecs) * 100 : 0;

  // Format countdown string
  const formatTimerString = (totalSecs: number) => {
    const h = Math.floor(totalSecs / 3600);
    const m = Math.floor((totalSecs % 3600) / 60);
    const s = totalSecs % 60;
    return `${h > 0 ? h + ':' : ''}${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  // ==========================================
  // TAB 2: STOPWATCH STATE & LOGIC
  // ==========================================
  const [stopwatchTime, setStopwatchTime] = useState<number>(0); // in ms
  const [stopwatchIsRunning, setStopwatchIsRunning] = useState<boolean>(false);
  const [laps, setLaps] = useState<Lap[]>([]);
  const stopwatchIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const stopwatchStartTimeRef = useRef<number>(0);
  const stopwatchAccumulatedRef = useRef<number>(0);

  useEffect(() => {
    if (stopwatchIsRunning) {
      stopwatchStartTimeRef.current = Date.now() - stopwatchAccumulatedRef.current;
      stopwatchIntervalRef.current = setInterval(() => {
        const elapsed = Date.now() - stopwatchStartTimeRef.current;
        setStopwatchTime(elapsed);
        stopwatchAccumulatedRef.current = elapsed;
      }, 10);
    } else {
      if (stopwatchIntervalRef.current) {
        clearInterval(stopwatchIntervalRef.current);
      }
    }
    return () => {
      if (stopwatchIntervalRef.current) clearInterval(stopwatchIntervalRef.current);
    };
  }, [stopwatchIsRunning]);

  const handleStartStopwatch = () => {
    setStopwatchIsRunning(true);
    playSound([523.25, 659.25], 0.1);
  };

  const handlePauseStopwatch = () => {
    setStopwatchIsRunning(false);
    playSound([659.25, 523.25], 0.1);
  };

  const handleResetStopwatch = () => {
    setStopwatchIsRunning(false);
    setStopwatchTime(0);
    stopwatchAccumulatedRef.current = 0;
    setLaps([]);
    playSound([392.00], 0.15);
  };

  const handleLap = () => {
    if (!stopwatchIsRunning) return;
    const currentTotal = stopwatchTime;
    const lastLapTotal = laps.length > 0 ? laps[0].time : 0;
    const lapDuration = currentTotal - lastLapTotal;
    
    const newLap: Lap = {
      index: laps.length + 1,
      time: currentTotal,
      duration: lapDuration
    };
    
    setLaps(prev => [newLap, ...prev]);
    playSound([659.25, 783.99], 0.05);
  };

  const formatStopwatchString = (timeMs: number) => {
    const min = Math.floor(timeMs / 60000);
    const sec = Math.floor((timeMs % 60000) / 1000);
    const ms = Math.floor((timeMs % 1000) / 10);
    return `${min.toString().padStart(2, '0')}:${sec.toString().padStart(2, '0')}.${ms.toString().padStart(2, '0')}`;
  };

  // ==========================================
  // TAB 3: ALARM STATE & LOGIC
  // ==========================================
  const [alarms, setAlarms] = useState<AlarmItem[]>([
    { id: '1', timeStr: '07:00', label: 'Morning Wakeup', isEnabled: true },
    { id: '2', timeStr: '12:00', label: 'Lunch Break Reminder', isEnabled: false },
  ]);
  const [newAlarmTime, setNewAlarmTime] = useState<string>('08:00');
  const [newAlarmLabel, setNewAlarmLabel] = useState<string>('Custom Alarm');
  
  // Active Alarm overlay triggered
  const [activeTriggeredAlarm, setActiveTriggeredAlarm] = useState<AlarmItem | null>(null);
  const triggeredAudioIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Monitor Alarms every 5 seconds to see if matches system time
  useEffect(() => {
    const checkAlarmsInterval = setInterval(() => {
      const now = new Date();
      const currentHours = now.getHours().toString().padStart(2, '0');
      const currentMinutes = now.getMinutes().toString().padStart(2, '0');
      const currentTimeStr = `${currentHours}:${currentMinutes}`;

      const matchedAlarm = alarms.find(a => a.isEnabled && a.timeStr === currentTimeStr);
      if (matchedAlarm && (!activeTriggeredAlarm || activeTriggeredAlarm.id !== matchedAlarm.id)) {
        // Trigger the alarm!
        setActiveTriggeredAlarm(matchedAlarm);
        
        if (addNotification) {
          addNotification('ALARM TRIGGERED', `${matchedAlarm.label} (${matchedAlarm.timeStr})`, 'error');
        }

        // Loop trigger sound
        if (triggeredAudioIntervalRef.current) clearInterval(triggeredAudioIntervalRef.current);
        triggeredAudioIntervalRef.current = setInterval(() => {
          playSound([587.33, 587.33, 587.33, 783.99, 587.33], 0.15, 0.05);
        }, 1200);
      }
    }, 5000);

    return () => {
      clearInterval(checkAlarmsInterval);
      if (triggeredAudioIntervalRef.current) clearInterval(triggeredAudioIntervalRef.current);
    };
  }, [alarms, activeTriggeredAlarm]);

  // Clean alarm sound loop on unmount
  useEffect(() => {
    return () => {
      if (triggeredAudioIntervalRef.current) clearInterval(triggeredAudioIntervalRef.current);
    };
  }, []);

  const handleAddCustomAlarm = (e: React.FormEvent) => {
    e.preventDefault();
    const [h, m] = newAlarmTime.split(':');
    const displayHours = parseInt(h);
    const displayMinutes = parseInt(m);
    
    const newAlarm: AlarmItem = {
      id: Math.random().toString(36).substr(2, 9),
      timeStr: `${displayHours.toString().padStart(2, '0')}:${displayMinutes.toString().padStart(2, '0')}`,
      label: newAlarmLabel || 'Custom Alarm',
      isEnabled: true
    };

    setAlarms(prev => [...prev, newAlarm]);
    setNewAlarmLabel('Custom Alarm');
    playSound([523.25, 659.25, 783.99], 0.1);
    
    if (addNotification) {
      addNotification('Alarm', `Set custom alarm for ${newAlarm.timeStr} (${newAlarm.label})`, 'success');
    }
  };

  const handleAddPresetAlarm = (preset: Omit<AlarmItem, 'id'>) => {
    // Check if alarm already exists with same time
    if (alarms.some(a => a.timeStr === preset.timeStr)) {
      if (addNotification) {
        addNotification('Alarm', `An alarm for ${preset.timeStr} already exists!`, 'warning');
      }
      return;
    }

    const newAlarm: AlarmItem = {
      id: Math.random().toString(36).substr(2, 9),
      timeStr: preset.timeStr,
      label: preset.label,
      isEnabled: true
    };

    setAlarms(prev => [...prev, newAlarm]);
    playSound([523.25, 659.25, 783.99], 0.15);
    
    if (addNotification) {
      addNotification('Alarm Preset Added', `Added & enabled ${preset.label} at ${preset.timeStr}`, 'success');
    }
  };

  const handleToggleAlarm = (id: string) => {
    setAlarms(prev => prev.map(a => a.id === id ? { ...a, isEnabled: !a.isEnabled } : a));
    playSound([440.0], 0.05);
  };

  const handleDeleteAlarm = (id: string) => {
    setAlarms(prev => prev.filter(a => a.id !== id));
    playSound([349.23], 0.1);
  };

  const handleDismissAlarm = () => {
    if (triggeredAudioIntervalRef.current) {
      clearInterval(triggeredAudioIntervalRef.current);
    }
    setActiveTriggeredAlarm(null);
    playSound([523.25, 783.99], 0.15);
  };

  const handleSnoozeAlarm = () => {
    if (triggeredAudioIntervalRef.current) {
      clearInterval(triggeredAudioIntervalRef.current);
    }
    
    // Add snooze time (+5 minutes)
    const now = new Date();
    now.setMinutes(now.getMinutes() + 5);
    const snoozeHours = now.getHours().toString().padStart(2, '0');
    const snoozeMinutes = now.getMinutes().toString().padStart(2, '0');
    
    const snoozedAlarm: AlarmItem = {
      id: 'snooze-' + Math.random().toString(36).substr(2, 5),
      timeStr: `${snoozeHours}:${snoozeMinutes}`,
      label: `Snooze: ${activeTriggeredAlarm?.label || 'Alarm'}`,
      isEnabled: true
    };

    setAlarms(prev => [...prev, snoozedAlarm]);
    setActiveTriggeredAlarm(null);
    playSound([392.00, 493.88, 587.33], 0.1);
    
    if (addNotification) {
      addNotification('Alarm Snoozed', 'Alarm snoozed for 5 minutes', 'info');
    }
  };

  return (
    <div className="flex flex-col h-full w-full bg-slate-950/40 text-slate-100 overflow-hidden select-none">
      {/* Tab Navigation */}
      <div className="flex bg-slate-900/60 border-b border-white/10 px-4 pt-3 gap-2">
        <button
          onClick={() => { setActiveTab('timer'); playSound([440.0], 0.05); }}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-t-xl text-xs font-semibold tracking-wider uppercase border-t border-x transition-all ${
            activeTab === 'timer'
              ? 'bg-slate-950/40 text-emerald-400 border-white/10 border-b-slate-950'
              : 'text-slate-400 hover:text-slate-200 border-transparent hover:bg-white/5'
          }`}
        >
          <Hourglass className="w-4 h-4" /> Timer
        </button>
        <button
          onClick={() => { setActiveTab('stopwatch'); playSound([440.0], 0.05); }}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-t-xl text-xs font-semibold tracking-wider uppercase border-t border-x transition-all ${
            activeTab === 'stopwatch'
              ? 'bg-slate-950/40 text-blue-400 border-white/10 border-b-slate-950'
              : 'text-slate-400 hover:text-slate-200 border-transparent hover:bg-white/5'
          }`}
        >
          <Timer className="w-4 h-4" /> Stopwatch
        </button>
        <button
          onClick={() => { setActiveTab('alarm'); playSound([440.0], 0.05); }}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-t-xl text-xs font-semibold tracking-wider uppercase border-t border-x transition-all ${
            activeTab === 'alarm'
              ? 'bg-slate-950/40 text-purple-400 border-white/10 border-b-slate-950'
              : 'text-slate-400 hover:text-slate-200 border-transparent hover:bg-white/5'
          }`}
        >
          <Bell className="w-4 h-4" /> Alarms
        </button>
      </div>

      {/* Main Tab Panels */}
      <div className="flex-1 overflow-y-auto p-6 relative">
        {/* ========================================== */}
        {/* TAB 1: TIMER PANEL */}
        {/* ========================================== */}
        {activeTab === 'timer' && (
          <div className="h-full flex flex-col md:flex-row gap-6 max-w-4xl mx-auto items-center justify-center">
            {/* Visual Progress Ring */}
            <div className="relative w-64 h-64 flex items-center justify-center mb-4 md:mb-0">
              <div 
                className="absolute w-56 h-56 rounded-full blur-[80px] pointer-events-none opacity-10 transition-all duration-300"
                style={{ backgroundColor: timerIsRunning ? '#10b981' : '#e2e8f0' }}
              />
              <svg className="w-60 h-60 transform -rotate-90">
                <circle
                  cx="120"
                  cy="120"
                  r="105"
                  className="stroke-white/5 fill-transparent"
                  strokeWidth="8"
                />
                <circle
                  cx="120"
                  cy="120"
                  r="105"
                  className="stroke-emerald-500 fill-transparent transition-all duration-100 ease-linear"
                  strokeWidth="8"
                  strokeDasharray={2 * Math.PI * 105}
                  strokeDashoffset={(2 * Math.PI * 105) * (1 - progressPct / 100)}
                  strokeLinecap="round"
                />
              </svg>

              {/* Centered Timer Text */}
              <div className="absolute flex flex-col items-center justify-center">
                <span className="text-4xl font-bold font-mono tracking-wider text-slate-100 tabular-nums">
                  {formatTimerString(timerRemainingSecs)}
                </span>
                <span className="text-[10px] text-slate-400 tracking-widest uppercase mt-1">
                  {timerIsRunning ? 'Ticking' : 'Paused'}
                </span>
              </div>
            </div>

            {/* Controls panel */}
            <div className="flex-1 flex flex-col w-full max-w-md bg-slate-900/40 border border-white/5 rounded-2xl p-5 self-stretch justify-between">
              <div>
                <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-3 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-emerald-400" /> Preset Timers
                </h3>
                <div className="grid grid-cols-4 gap-2 mb-5">
                  {[
                    { label: '1m', h: 0, m: 1, s: 0 },
                    { label: '3m', h: 0, m: 3, s: 0 },
                    { label: '5m', h: 0, m: 5, s: 0 },
                    { label: '10m', h: 0, m: 10, s: 0 },
                    { label: '15m', h: 0, m: 15, s: 0 },
                    { label: '25m', h: 0, m: 25, s: 0 },
                    { label: '45m', h: 0, m: 45, s: 0 },
                    { label: '1h', h: 1, m: 0, s: 0 },
                  ].map(preset => (
                    <button
                      key={preset.label}
                      onClick={() => handleSetTimerPreset(preset.h, preset.m, preset.s)}
                      className="py-2 rounded-xl bg-slate-950/40 border border-white/5 hover:border-emerald-500/30 text-xs font-semibold hover:text-emerald-400 transition-all text-center"
                    >
                      {preset.label}
                    </button>
                  ))}
                </div>

                <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-3">Custom Setup</h3>
                <div className="grid grid-cols-3 gap-2 mb-5">
                  <div>
                    <label className="text-[10px] text-slate-400 block mb-1">Hours</label>
                    <input
                      type="number"
                      min="0"
                      max="23"
                      disabled={timerIsRunning}
                      value={timerHours}
                      onChange={(e) => {
                        const h = Math.max(0, Math.min(23, parseInt(e.target.value) || 0));
                        setTimerHours(h);
                        const total = h * 3600 + timerMinutes * 60 + timerSeconds;
                        setTimerTotalSecs(total);
                        setTimerRemainingSecs(total);
                      }}
                      className="w-full bg-slate-950/60 border border-white/10 rounded-xl py-1.5 text-center font-mono focus:outline-none focus:border-emerald-500 text-sm disabled:opacity-50"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] text-slate-400 block mb-1">Minutes</label>
                    <input
                      type="number"
                      min="0"
                      max="59"
                      disabled={timerIsRunning}
                      value={timerMinutes}
                      onChange={(e) => {
                        const m = Math.max(0, Math.min(59, parseInt(e.target.value) || 0));
                        setTimerMinutes(m);
                        const total = timerHours * 3600 + m * 60 + timerSeconds;
                        setTimerTotalSecs(total);
                        setTimerRemainingSecs(total);
                      }}
                      className="w-full bg-slate-950/60 border border-white/10 rounded-xl py-1.5 text-center font-mono focus:outline-none focus:border-emerald-500 text-sm disabled:opacity-50"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] text-slate-400 block mb-1">Seconds</label>
                    <input
                      type="number"
                      min="0"
                      max="59"
                      disabled={timerIsRunning}
                      value={timerSeconds}
                      onChange={(e) => {
                        const s = Math.max(0, Math.min(59, parseInt(e.target.value) || 0));
                        setTimerSeconds(s);
                        const total = timerHours * 3600 + timerMinutes * 60 + s;
                        setTimerTotalSecs(total);
                        setTimerRemainingSecs(total);
                      }}
                      className="w-full bg-slate-950/60 border border-white/10 rounded-xl py-1.5 text-center font-mono focus:outline-none focus:border-emerald-500 text-sm disabled:opacity-50"
                    />
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3">
                <button
                  onClick={handleResetTimer}
                  className="flex-1 py-2.5 rounded-xl border border-white/10 hover:border-white/20 bg-white/5 hover:bg-white/10 text-xs font-semibold text-slate-300 transition-all flex items-center justify-center gap-2"
                >
                  <RotateCcw className="w-4 h-4" /> Reset
                </button>
                {!timerIsRunning ? (
                  <button
                    onClick={handleStartTimer}
                    disabled={timerRemainingSecs <= 0}
                    className="flex-1 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-xs font-bold text-slate-950 transition-all flex items-center justify-center gap-2 shadow-lg shadow-emerald-950/20 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Play className="w-4 h-4 fill-slate-950" /> Start
                  </button>
                ) : (
                  <button
                    onClick={handlePauseTimer}
                    className="flex-1 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-xs font-bold text-slate-950 transition-all flex items-center justify-center gap-2 shadow-lg shadow-amber-950/20"
                  >
                    <Pause className="w-4 h-4 fill-slate-950" /> Pause
                  </button>
                )}
              </div>
            </div>
          </div>
        )}

        {/* ========================================== */}
        {/* TAB 2: STOPWATCH PANEL */}
        {/* ========================================== */}
        {activeTab === 'stopwatch' && (
          <div className="h-full flex flex-col gap-6 max-w-2xl mx-auto">
            {/* Big stopwatch numbers */}
            <div className="text-center py-6 bg-slate-900/30 border border-white/5 rounded-2xl relative overflow-hidden">
              <div 
                className="absolute w-44 h-44 rounded-full blur-[80px] pointer-events-none opacity-10 left-1/2 -translate-x-1/2 transition-all duration-300"
                style={{ backgroundColor: stopwatchIsRunning ? '#3b82f6' : '#94a3b8' }}
              />
              <div className="text-5xl md:text-6xl font-mono font-bold text-slate-100 tracking-wider tabular-nums">
                {formatStopwatchString(stopwatchTime)}
              </div>
              <div className="text-xs text-slate-400 tracking-widest uppercase mt-2">
                {stopwatchIsRunning ? 'Live Timer' : 'Ready'}
              </div>
            </div>

            {/* Main actions */}
            <div className="flex gap-4">
              <button
                onClick={handleResetStopwatch}
                className="flex-1 py-3 rounded-xl border border-white/10 hover:border-white/20 bg-white/5 hover:bg-white/10 text-xs font-semibold text-slate-300 transition-all flex items-center justify-center gap-2"
              >
                <RotateCcw className="w-4 h-4" /> Reset
              </button>
              {stopwatchIsRunning && (
                <button
                  onClick={handleLap}
                  className="flex-1 py-3 rounded-xl bg-white/10 hover:bg-white/20 text-xs font-semibold text-slate-200 transition-all flex items-center justify-center gap-2 border border-white/10"
                >
                  Lap Split
                </button>
              )}
              {!stopwatchIsRunning ? (
                <button
                  onClick={handleStartStopwatch}
                  className="flex-1 py-3 rounded-xl bg-blue-500 hover:bg-blue-600 text-xs font-bold text-slate-950 transition-all flex items-center justify-center gap-2 shadow-lg shadow-blue-950/20"
                >
                  <Play className="w-4 h-4 fill-slate-950" /> Start
                </button>
              ) : (
                <button
                  onClick={handlePauseStopwatch}
                  className="flex-1 py-3 rounded-xl bg-amber-500 hover:bg-amber-600 text-xs font-bold text-slate-950 transition-all flex items-center justify-center gap-2 shadow-lg shadow-amber-950/20"
                >
                  <Pause className="w-4 h-4 fill-slate-950" /> Pause
                </button>
              )}
            </div>

            {/* Laps List */}
            {laps.length > 0 && (
              <div className="flex-1 flex flex-col bg-slate-900/40 border border-white/5 rounded-2xl p-4 overflow-hidden min-h-[160px]">
                <div className="flex justify-between items-center text-xs font-semibold text-slate-400 uppercase tracking-wider pb-2 border-b border-white/10">
                  <span>Lap #</span>
                  <span>Lap Time</span>
                  <span>Overall Time</span>
                </div>
                <div className="flex-1 overflow-y-auto pt-2 space-y-1.5 font-mono text-sm max-h-56">
                  {laps.map(lap => (
                    <div key={lap.index} className="flex justify-between items-center text-slate-300 hover:bg-white/5 py-1 px-2 rounded-lg transition-all">
                      <span className="text-slate-500 text-xs">Lap {lap.index}</span>
                      <span className="text-blue-400">+{formatStopwatchString(lap.duration)}</span>
                      <span>{formatStopwatchString(lap.time)}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* ========================================== */}
        {/* TAB 3: ALARMS PANEL */}
        {/* ========================================== */}
        {activeTab === 'alarm' && (
          <div className="h-full flex flex-col md:flex-row gap-6 max-w-4xl mx-auto">
            {/* Quick Alarms Choice Preset List (Requested) */}
            <div className="w-full md:w-80 flex flex-col bg-slate-900/40 border border-white/5 rounded-2xl p-4 self-stretch">
              <h3 className="text-xs font-semibold uppercase tracking-widest text-slate-400 border-b border-white/10 pb-2.5 mb-3 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-purple-400" /> Choose Preset Alarm
              </h3>
              <div className="space-y-2 overflow-y-auto max-h-[320px] md:max-h-none flex-1 pr-1">
                {PRESET_ALARMS.map((preset) => {
                  const [h, m] = preset.timeStr.split(':');
                  const hourInt = parseInt(h);
                  const ampm = hourInt >= 12 ? 'PM' : 'AM';
                  const displayHour = hourInt === 0 ? 12 : hourInt > 12 ? hourInt - 12 : hourInt;
                  const displayTime = `${displayHour.toString().padStart(2, '0')}:${m} ${ampm}`;
                  
                  return (
                    <button
                      key={preset.timeStr}
                      onClick={() => handleAddPresetAlarm(preset)}
                      className="w-full text-left p-3 rounded-xl bg-slate-950/40 border border-white/5 hover:border-purple-500/30 hover:bg-slate-900/30 transition-all flex items-center justify-between group"
                    >
                      <div>
                        <div className="font-mono text-sm font-bold text-slate-200 group-hover:text-purple-400 transition-colors">
                          {displayTime}
                        </div>
                        <div className="text-[10px] text-slate-500 group-hover:text-slate-400">
                          {preset.label}
                        </div>
                      </div>
                      <Plus className="w-4 h-4 text-slate-400 group-hover:text-purple-400 group-hover:scale-110 transition-all" />
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Custom Alarms Add & List */}
            <div className="flex-1 flex flex-col gap-5 self-stretch">
              {/* Form to add custom alarm */}
              <form onSubmit={handleAddCustomAlarm} className="bg-slate-900/40 border border-white/5 rounded-2xl p-4 flex flex-col sm:flex-row gap-3 items-end">
                <div className="flex-1 w-full">
                  <label className="text-[10px] text-slate-400 block mb-1 uppercase tracking-wider">Alarm Time</label>
                  <input
                    type="time"
                    value={newAlarmTime}
                    onChange={(e) => setNewAlarmTime(e.target.value)}
                    className="w-full bg-slate-950 border border-white/10 rounded-xl px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-purple-500"
                  />
                </div>
                <div className="flex-[2] w-full">
                  <label className="text-[10px] text-slate-400 block mb-1 uppercase tracking-wider">Label</label>
                  <input
                    type="text"
                    value={newAlarmLabel}
                    onChange={(e) => setNewAlarmLabel(e.target.value)}
                    placeholder="Wakeup, Stretching..."
                    className="w-full bg-slate-950 border border-white/10 rounded-xl px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-purple-500 placeholder:text-slate-600"
                  />
                </div>
                <button
                  type="submit"
                  className="w-full sm:w-auto px-4 py-2 bg-purple-600 hover:bg-purple-700 text-xs font-bold rounded-xl text-white transition-all flex items-center justify-center gap-1.5 shadow-lg shadow-purple-950/20"
                >
                  <Plus className="w-4 h-4" /> Add
                </button>
              </form>

              {/* Active Alarms List */}
              <div className="flex-1 bg-slate-900/40 border border-white/5 rounded-2xl p-4 overflow-hidden flex flex-col">
                <h3 className="text-xs font-semibold uppercase tracking-widest text-slate-400 mb-3">Your Alarms</h3>
                
                {alarms.length === 0 ? (
                  <div className="flex-1 flex flex-col items-center justify-center text-slate-500 py-6">
                    <Bell className="w-8 h-8 text-slate-600 mb-2 opacity-50" />
                    <span className="text-xs">No active alarms</span>
                    <span className="text-[10px] text-slate-600 mt-1">Select a preset or create one above</span>
                  </div>
                ) : (
                  <div className="flex-1 overflow-y-auto space-y-2 pr-1 max-h-60">
                    {alarms.map(alarm => {
                      const [h, m] = alarm.timeStr.split(':');
                      const hourInt = parseInt(h);
                      const ampm = hourInt >= 12 ? 'PM' : 'AM';
                      const displayHour = hourInt === 0 ? 12 : hourInt > 12 ? hourInt - 12 : hourInt;
                      const displayTime = `${displayHour.toString().padStart(2, '0')}:${m} ${ampm}`;

                      return (
                        <div 
                          key={alarm.id} 
                          className={`p-3.5 rounded-xl border transition-all flex items-center justify-between ${
                            alarm.isEnabled 
                              ? 'bg-slate-950/40 border-purple-500/20 shadow-sm' 
                              : 'bg-slate-950/20 border-white/5 opacity-60'
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            <button
                              onClick={() => handleToggleAlarm(alarm.id)}
                              className={`p-2 rounded-xl border transition-all ${
                                alarm.isEnabled
                                  ? 'bg-purple-500/10 border-purple-500/30 text-purple-400 shadow-md shadow-purple-950/30'
                                  : 'bg-slate-900 border-white/10 text-slate-500'
                              }`}
                            >
                              <Bell className="w-4 h-4" />
                            </button>
                            <div>
                              <div className="font-mono text-base font-bold text-slate-100">
                                {displayTime}
                              </div>
                              <div className="text-[10px] text-slate-400 font-medium">
                                {alarm.label}
                              </div>
                            </div>
                          </div>

                          <div className="flex items-center gap-3">
                            {/* Toggle checkbox */}
                            <label className="relative inline-flex items-center cursor-pointer">
                              <input 
                                type="checkbox" 
                                checked={alarm.isEnabled} 
                                onChange={() => handleToggleAlarm(alarm.id)}
                                className="sr-only peer"
                              />
                              <div className="w-8 h-4 bg-slate-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-slate-400 after:border-slate-300 after:border after:rounded-full after:h-3 after:w-3 after:transition-all peer-checked:bg-purple-600 peer-checked:after:bg-white"></div>
                            </label>

                            <button
                              onClick={() => handleDeleteAlarm(alarm.id)}
                              className="p-1.5 text-slate-500 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-all"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Triggered Alarm Modal */}
      <AnimatePresence>
        {activeTriggeredAlarm && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-md z-[9000] flex items-center justify-center p-4">
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="w-full max-w-sm glass-dark border border-red-500/30 p-8 shadow-[0_0_50px_rgba(239,68,68,0.2)] rounded-3xl overflow-hidden flex flex-col items-center text-center"
            >
              <div className="w-16 h-16 rounded-full bg-red-500/10 border border-red-500/30 flex items-center justify-center mb-5 animate-pulse text-red-500">
                <AlertTriangle className="w-8 h-8" />
              </div>
              
              <h3 className="text-xl font-bold tracking-wider text-red-400 uppercase mb-2">ALARM TRIGGERED</h3>
              <div className="font-mono text-3xl font-extrabold text-slate-100 tracking-widest my-3 filter drop-shadow-[0_0_10px_rgba(255,255,255,0.1)]">
                {activeTriggeredAlarm.timeStr}
              </div>
              <p className="text-slate-400 text-xs font-medium uppercase mb-6 tracking-wider">
                {activeTriggeredAlarm.label}
              </p>

              <div className="flex w-full gap-3">
                <button
                  onClick={handleSnoozeAlarm}
                  className="flex-1 py-3 bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20 rounded-2xl text-xs font-bold text-slate-300 transition-all uppercase tracking-wider"
                >
                  Snooze (5m)
                </button>
                <button
                  onClick={handleDismissAlarm}
                  className="flex-1 py-3 bg-red-600 hover:bg-red-700 rounded-2xl text-xs font-bold text-white transition-all uppercase tracking-wider shadow-lg shadow-red-950/20"
                >
                  Dismiss
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
