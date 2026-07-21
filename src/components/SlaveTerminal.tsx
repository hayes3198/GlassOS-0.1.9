import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Terminal, Wifi, WifiOff, RefreshCw, Cpu, ShieldAlert, Zap, 
  HelpCircle, Monitor, ArrowLeft, Key, UserCheck, Settings, Globe
} from 'lucide-react';

interface SlaveTerminalProps {
  socket: any;
  onExit: () => void;
}

interface SlaveRenderState {
  history: string[];
  currentPath: string[];
  username: string;
  tty: string;
  isTopActive: boolean;
  topData: any[];
  isTrapped: boolean;
  trapDetails?: {
    trapType: string;
    trapMessage: string;
  } | null;
}

export function SlaveTerminal({ socket, onExit }: SlaveTerminalProps) {
  const [isConnected, setIsConnected] = useState(false);
  const [slaveId, setSlaveId] = useState('');
  const [ttyName, setTtyName] = useState('tty2');
  const [inputVal, setInputVal] = useState('');
  const [terminalHistory, setTerminalHistory] = useState<string[]>([
    'Initializing remote Intranet Slave Terminal...',
    'Awaiting master handshake over WebSocket bridge...'
  ]);
  const [currentPath, setCurrentPath] = useState<string[]>([]);
  const [username, setUsername] = useState('guest');
  const [isTopActive, setIsTopActive] = useState(false);
  const [topData, setTopData] = useState<any[]>([]);
  const [isTrapped, setIsTrapped] = useState(false);
  const [trapDetails, setTrapDetails] = useState<any>(null);
  const [keystrokesCount, setKeystrokesCount] = useState(0);

  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Initialize socket connection and handshakes
  useEffect(() => {
    if (!socket) {
      setTerminalHistory(prev => [
        ...prev,
        '⚠️ [BRIDGE ERROR] Local WebSocket stack unavailable. Open GlassOS on the host first.'
      ]);
      return;
    }

    // Set connection state if already connected
    setIsConnected(socket.connected);

    const handleConnect = () => {
      setIsConnected(true);
      // Register as slave with a randomized TTY pts name
      const randomTty = `pts/${Math.floor(Math.random() * 8) + 1}`;
      setTtyName(randomTty);
      socket.emit('bridge:register-slave', {
        hostname: `slave-${socket.id?.slice(0, 4) || 'node'}`,
        tty: randomTty,
        userAgent: navigator.userAgent
      });
    };

    const handleDisconnect = () => {
      setIsConnected(false);
      setTerminalHistory(prev => [...prev, '❌ Link offline. Disconnected from Master Node.']);
    };

    const handleRegistered = (data: { id: string; masterOnline: boolean }) => {
      setSlaveId(data.id);
      setIsConnected(true);
      setTerminalHistory(prev => [
        ...prev,
        `✅ Connected to Master Node [Socket ID: ${data.id}].`,
        `Mapped virtual terminal to session address: /dev/${ttyName}`,
        data.masterOnline 
          ? '🟢 Master node link active. Interactive terminal session ready.' 
          : '⚠️ Master node is offline. Awaiting Master activation in LAN Bridge app...'
      ]);
    };

    const handleSlaveRender = (data: SlaveRenderState) => {
      setTerminalHistory(data.history || []);
      setCurrentPath(data.currentPath || []);
      setUsername(data.username || 'guest');
      setTtyName(data.tty || ttyName);
      setIsTopActive(!!data.isTopActive);
      setTopData(data.topData || []);
      setIsTrapped(!!data.isTrapped);
      setTrapDetails(data.trapDetails || null);
    };

    const handleTrapTriggered = (data: { trapType: string; trapMessage: string }) => {
      setIsTrapped(true);
      setTrapDetails(data);
    };

    const handleTrapResolved = () => {
      setIsTrapped(false);
      setTrapDetails(null);
      setTerminalHistory(prev => [
        ...prev,
        '🟢 SYSTEM RECOVERY EXCEPTION VECTOR DISPATCHED. State quarantine lifted.'
      ]);
    };

    socket.on('connect', handleConnect);
    socket.on('disconnect', handleDisconnect);
    socket.on('bridge:registered', handleRegistered);
    socket.on('bridge:slave-render', handleSlaveRender);
    socket.on('bridge:trap-triggered', handleTrapTriggered);
    socket.on('bridge:trap-resolved', handleTrapResolved);

    // Trigger registration if already connected on mount
    if (socket.connected) {
      handleConnect();
    }

    return () => {
      socket.off('connect', handleConnect);
      socket.off('disconnect', handleDisconnect);
      socket.off('bridge:registered', handleRegistered);
      socket.off('bridge:slave-render', handleSlaveRender);
      socket.off('bridge:trap-triggered', handleTrapTriggered);
      socket.off('bridge:trap-resolved', handleTrapResolved);
    };
  }, [socket, ttyName]);

  // Keep terminal scrolled to bottom
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [terminalHistory, isTopActive]);

  // Refocus input bar
  const focusInput = () => {
    if (!isTrapped && inputRef.current) {
      inputRef.current.focus();
    }
  };

  useEffect(() => {
    focusInput();
  }, [isTrapped]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isTrapped || !isConnected || !socket) return;
    
    const command = inputVal.trim();
    if (!command) return;

    // Send the command directly over the relay bridge
    socket.emit('bridge:slave-input', { input: command });
    setKeystrokesCount(k => k + 1);
    setInputVal('');
  };

  // Route individual keystrokes to let master log telemetry (optional but fun!)
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (isTrapped || !isConnected || !socket) return;
    if (e.key !== 'Enter') {
      socket.emit('bridge:slave-input', { key: e.key });
      setKeystrokesCount(k => k + 1);
    }
  };

  const pathString = '/' + currentPath.join('/');

  return (
    <div 
      className="fixed inset-0 bg-neutral-950 text-emerald-400 font-mono text-sm overflow-hidden flex flex-col z-[99999] select-none"
      onClick={focusInput}
    >
      {/* Dynamic Scanlines Overlay */}
      <div className="pointer-events-none absolute inset-0 z-50 bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] bg-[length:100%_4px,3px_100%] opacity-40" />

      {/* Connection and telemetry top-bar */}
      <div className="px-4 py-2 border-b border-emerald-950 bg-black/40 flex items-center justify-between text-xs font-semibold uppercase tracking-wider select-none z-10">
        <div className="flex items-center gap-3">
          <button 
            onClick={onExit}
            className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-emerald-950/20 hover:bg-emerald-950/40 border border-emerald-800/30 text-emerald-400 transition-colors"
          >
            <ArrowLeft size={12} />
            Exit Terminal
          </button>
          
          <div className="h-4 w-px bg-emerald-950/60" />
          
          <div className="flex items-center gap-1.5">
            <Monitor size={14} className="text-emerald-500 animate-pulse" />
            <span>GLASS_TTY://DEV/{ttyName}</span>
          </div>
        </div>

        <div className="flex items-center gap-4 text-emerald-500/80">
          <div className="hidden sm:flex items-center gap-2">
            <Key size={12} />
            <span>TX Keystrokes: {keystrokesCount}</span>
          </div>

          <div className="flex items-center gap-2">
            {isConnected ? (
              <Wifi size={14} className="text-emerald-400" />
            ) : (
              <WifiOff size={14} className="text-rose-500" />
            )}
            <span className={isConnected ? 'text-emerald-400' : 'text-rose-500'}>
              {isConnected ? 'RELAY_LINK_UP' : 'RELAY_LINK_DOWN'}
            </span>
          </div>
        </div>
      </div>

      {/* Screen area */}
      <div className="flex-1 p-4 relative flex flex-col justify-between overflow-hidden">
        
        {/* Trapped State Ring-0 exception screen */}
        <AnimatePresence>
          {isTrapped && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-red-950/95 text-rose-300 z-40 p-8 flex flex-col justify-center items-center select-text overflow-y-auto"
            >
              <div className="p-4 rounded-full bg-rose-500/10 text-rose-400 border border-rose-500/20 mb-6 animate-pulse">
                <ShieldAlert size={48} />
              </div>
              
              <h2 className="text-lg font-extrabold tracking-wider text-rose-400 uppercase text-center max-w-xl">
                ⚠️ RING-0 CPU INTERRUPT EXCEPTION DETECTED ⚠️
              </h2>
              
              <div className="w-full max-w-2xl bg-black/60 border border-rose-900/40 p-4 rounded-xl font-mono text-xs text-rose-400/90 shadow-2xl space-y-3 mt-4">
                <div className="font-bold border-b border-rose-900/30 pb-2 flex justify-between">
                  <span>VECTOR FAULT: {trapDetails?.trapType || 'SYS_HALT'}</span>
                  <span>IP REGISTERS DUMP</span>
                </div>
                
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-[11px] leading-relaxed select-all">
                  <div>EAX=00000003</div>
                  <div>EBX=002010A4</div>
                  <div>ECX=FFFFA340</div>
                  <div>EDX=00000000</div>
                  <div>ESI=00201B4C</div>
                  <div>EDI=00201201</div>
                  <div>EBP=FFFFFF0C</div>
                  <div>ESP=001FA840</div>
                  <div>EIP=001B0243</div>
                  <div>EFLAGS=00010246</div>
                  <div>CR0=80000011</div>
                  <div>CR2=00000000</div>
                </div>

                <div className="text-[11px] border-t border-rose-900/30 pt-3 space-y-1">
                  <p className="text-rose-300 font-bold">Exception details:</p>
                  <p className="italic text-rose-400/80">{trapDetails?.trapMessage || 'Manual CPU instruction halt called by GlassOS master host supervisor.'}</p>
                </div>
              </div>

              <div className="mt-8 text-center space-y-2 max-w-md">
                <p className="text-xs uppercase tracking-widest text-rose-400 animate-pulse font-bold">
                  SYSTEM QUARANTINE ACTIVE
                </p>
                <p className="text-xs text-rose-400/60 leading-relaxed">
                  Keyboard and peripheral I/O mapping have been suspended to prevent stack overflow. Awaiting recovery vector instruction from master controller.
                </p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Top output viewport */}
        <div 
          ref={scrollRef}
          className="flex-1 overflow-y-auto space-y-1.5 pr-2 no-scrollbar font-mono text-sm leading-relaxed"
        >
          {isTopActive ? (
            <div className="space-y-4">
              <div className="flex items-center justify-between text-xs border-b border-emerald-950 pb-2">
                <span>TTY MAPPED PROCESS MONITOR (TOP)</span>
                <span>Active Core: 100% MAPPED</span>
              </div>
              <div className="space-y-1 text-xs">
                <div className="grid grid-cols-6 font-bold border-b border-emerald-950/60 pb-1 mb-1 text-emerald-300">
                  <span>PID</span>
                  <span className="col-span-2">PROCESS</span>
                  <span>CPU%</span>
                  <span>MEM</span>
                  <span>TTY</span>
                </div>
                {topData.map((p, idx) => (
                  <div key={idx} className="grid grid-cols-6 hover:bg-emerald-950/10">
                    <span>{p.pid}</span>
                    <span className="col-span-2 text-emerald-200">{p.proc}</span>
                    <span>{p.cpu}</span>
                    <span>{p.mem}</span>
                    <span className="text-amber-400 font-bold">{p.tty || ttyName}</span>
                  </div>
                ))}
              </div>
              <p className="text-[10px] text-emerald-500/60 animate-pulse mt-4">
                Press Ctrl+C or type "quit" to exit process monitor.
              </p>
            </div>
          ) : (
            <>
              {terminalHistory.map((line, idx) => {
                let color = 'text-emerald-400';
                if (line.includes('✅') || line.includes('🟢')) color = 'text-emerald-300';
                if (line.includes('⚠️')) color = 'text-amber-400';
                if (line.includes('❌') || line.includes('⚠️ [BRIDGE ERROR]')) color = 'text-rose-400';
                if (line.startsWith('/') || line.includes('$ ')) color = 'text-emerald-200 font-bold';

                return (
                  <div key={idx} className={`${color} whitespace-pre-wrap break-all select-text`}>
                    {line}
                  </div>
                );
              })}
            </>
          )}
        </div>

        {/* Input line */}
        {!isTopActive && (
          <form 
            onSubmit={handleSubmit}
            className="mt-4 flex items-center gap-1.5 border-t border-emerald-950 pt-3 select-none"
          >
            <span className="text-emerald-300 font-bold select-none shrink-0">
              {username}@glass-os:{pathString}$
            </span>
            <input
              ref={inputRef}
              type="text"
              value={inputVal}
              onChange={(e) => setInputVal(e.target.value)}
              onKeyDown={handleKeyDown}
              disabled={isTrapped || !isConnected}
              className="flex-1 bg-transparent border-none outline-none text-emerald-200 font-mono caret-emerald-400 select-text disabled:opacity-40"
              autoFocus
              placeholder={isTrapped ? "System suspended..." : "Enter remote command..."}
            />
          </form>
        )}
      </div>
    </div>
  );
}
