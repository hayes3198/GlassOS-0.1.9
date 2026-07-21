import React, { useEffect, useRef, useState } from 'react';
import { Terminal } from '@xterm/xterm';
import { FitAddon } from '@xterm/addon-fit';
import { 
  ArrowLeft, Monitor, Wifi, WifiOff, Terminal as TerminalIcon, 
  Cpu, Activity, Radio, ChevronRight, User, Globe, AlertOctagon 
} from 'lucide-react';
import '@xterm/xterm/css/xterm.css';

function cn(...classes: any[]) {
  return classes.filter(Boolean).join(' ');
}

interface SlaveTerminalProps {
  socket: any;
  onExit: () => void;
}

export function SlaveTerminal({ socket, onExit }: SlaveTerminalProps) {
  const terminalRef = useRef<HTMLDivElement>(null);
  const xtermRef = useRef<Terminal | null>(null);
  const wsRef = useRef<WebSocket | null>(null);
  const fitAddonRef = useRef<FitAddon | null>(null);

  // Connection settings
  const [isConfigured, setIsConfigured] = useState(false);
  const [masterHostIp, setMasterHostIp] = useState(() => {
    if (typeof window !== 'undefined') {
      return window.location.host; // Auto-detect current port 3000 host
    }
    return 'localhost:3000';
  });
  const [username, setUsername] = useState('slave_user');

  // Terminal state
  const [connectionStatus, setConnectionStatus] = useState<'DISCONNECTED' | 'CONNECTING' | 'CONNECTED'>('DISCONNECTED');
  const [assignedTTY, setAssignedTTY] = useState<number | null>(null);
  const [assignedPID, setAssignedPID] = useState<number | null>(null);
  const [packetsSent, setPacketsSent] = useState(0);
  const [packetsReceived, setPacketsReceived] = useState(0);

  // Initialize and build Xterm.js when configured and mounted
  useEffect(() => {
    if (!isConfigured || !terminalRef.current) return;

    // 1. Initialize Xterm.js with GlassOS Retro-Modern Styling
    const term = new Terminal({
      cursorBlink: true,
      cursorStyle: 'block',
      fontFamily: 'Fira Code, JetBrains Mono, Menlo, Monaco, "Courier New", monospace',
      fontSize: 13,
      lineHeight: 1.3,
      theme: {
        background: '#0d1117',
        foreground: '#c9d1d9',
        cursor: '#10b981', // emerald-500
        cursorAccent: '#0d1117',
        selectionBackground: '#1f6feb',
        black: '#484f58',
        red: '#ff7b72',
        green: '#3fb950',
        yellow: '#d29922',
        blue: '#58a6ff',
        magenta: '#bc8cff',
        cyan: '#39c5cf',
        white: '#b1bac4',
      },
    });

    const fitAddon = new FitAddon();
    term.loadAddon(fitAddon);
    term.open(terminalRef.current);
    
    // Tiny delay to ensure layout is fully updated before fitting
    setTimeout(() => {
      try {
        fitAddon.fit();
      } catch (e) {
        console.warn('Initial terminal fit failed:', e);
      }
    }, 100);

    xtermRef.current = term;
    fitAddonRef.current = fitAddon;

    term.writeln('\x1b[1;36m=== GlassOS Distributed Terminal Client v1.0 ===\x1b[0m');
    term.writeln(`Initiating handshake with Master Host at \x1b[33mws://${masterHostIp}\x1b[0m...`);

    // Determine secure WebSocket protocol based on page environment
    const isSecure = typeof window !== 'undefined' && window.location.protocol === 'https:';
    const wsUrl = `${isSecure ? 'wss' : 'ws'}://${masterHostIp}`;

    setConnectionStatus('CONNECTING');
    const ws = new WebSocket(wsUrl);
    wsRef.current = ws;

    ws.onopen = () => {
      setConnectionStatus('CONNECTED');
      setPacketsSent(p => p + 1);
      
      // Request TTY allocation from Master Node Kernel
      const connectReq = JSON.stringify({
        type: 'CONNECT_REQ',
        username,
      });
      ws.send(connectReq);
    };

    ws.onmessage = (event) => {
      setPacketsReceived(p => p + 1);
      try {
        const frame = JSON.parse(event.data);

        switch (frame.type) {
          case 'CONNECT_ACK':
            setAssignedTTY(frame.tty);
            setAssignedPID(frame.pid);
            term.writeln(`\x1b[1;32m[+] Connected! Allocated TTY: /dev/tty${frame.tty} (Shell PID: ${frame.pid})\x1b[0m\r\n`);
            term.write(frame.welcomeMsg || '');
            break;

          case 'TTY_OUTPUT':
            term.write(frame.data);
            break;

          default:
            break;
        }
      } catch (err) {
        // Fallback for raw text streaming
        term.write(event.data);
      }
    };

    ws.onclose = () => {
      setConnectionStatus('DISCONNECTED');
      term.writeln('\r\n\x1b[1;31m[!] Connection to Master Host lost. Please retry or verify router settings.\x1b[0m');
    };

    // Capture Local Keyboard Input and Stream to Host Scheduler
    term.onData((data) => {
      if (ws.readyState === WebSocket.OPEN) {
        setPacketsSent(p => p + 1);
        ws.send(JSON.stringify({
          type: 'TTY_INPUT',
          tty: assignedTTY || 0,
          data: data,
        }));
      }
    });

    // Handle Window Resizing
    const handleResize = () => {
      try {
        fitAddon.fit();
        if (ws.readyState === WebSocket.OPEN && assignedTTY !== null) {
          setPacketsSent(p => p + 1);
          ws.send(JSON.stringify({
            type: 'RESIZE',
            tty: assignedTTY,
            cols: term.cols,
            rows: term.rows,
          }));
        }
      } catch (e) {
        console.error(e);
      }
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      ws.close();
      term.dispose();
    };
  }, [isConfigured, masterHostIp, username, assignedTTY]);

  // Handle local disconnection & re-open configuration
  const handleDisconnect = () => {
    if (wsRef.current) {
      wsRef.current.close();
    }
    setConnectionStatus('DISCONNECTED');
    setAssignedTTY(null);
    setAssignedPID(null);
    setIsConfigured(false);
  };

  return (
    <div className="fixed inset-0 bg-neutral-950 text-neutral-100 font-sans select-none overflow-hidden flex flex-col z-[99999]">
      
      {/* Configuration View / Pairing Screen */}
      {!isConfigured ? (
        <div className="flex-1 flex flex-col items-center justify-center p-6 relative bg-gradient-to-b from-neutral-900 via-neutral-950 to-neutral-950">
          {/* Subtle grid pattern background */}
          <div className="absolute inset-0 bg-[radial-gradient(#1e293b_1px,transparent_1px)] [background-size:24px_24px] opacity-10" />

          {/* GlassOS Aesthetic Login/Connection Card */}
          <div className="w-full max-w-md bg-neutral-900/60 border border-neutral-800 p-8 rounded-2xl shadow-2xl backdrop-blur-md relative z-10 flex flex-col gap-6">
            <div className="flex flex-col items-center gap-3 text-center">
              <div className="p-3.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 shadow-[0_0_15px_rgba(16,185,129,0.1)]">
                <TerminalIcon size={28} className="animate-pulse" />
              </div>
              <h2 className="text-sm font-extrabold tracking-tight uppercase text-neutral-100">
                GlassOS Terminal Client
              </h2>
              <p className="text-xs text-neutral-400">
                Pair secondary device shells cleanly into your active LAN bridge
              </p>
            </div>

            <div className="space-y-4">
              {/* Username Input */}
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-bold uppercase tracking-wider text-neutral-400 flex items-center gap-1">
                  <User size={12} className="text-neutral-500" />
                  Operator Username
                </label>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="px-3.5 py-2 rounded-xl bg-neutral-950/80 border border-neutral-800 text-sm text-neutral-200 focus:border-emerald-500/40 outline-none font-mono transition-colors"
                  placeholder="e.g. phone_user"
                />
              </div>

              {/* Master Node LAN IP */}
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-bold uppercase tracking-wider text-neutral-400 flex items-center gap-1">
                  <Globe size={12} className="text-neutral-500" />
                  Master Host Address (IP:Port)
                </label>
                <input
                  type="text"
                  value={masterHostIp}
                  onChange={(e) => setMasterHostIp(e.target.value)}
                  className="px-3.5 py-2 rounded-xl bg-neutral-950/80 border border-neutral-800 text-sm text-neutral-200 focus:border-emerald-500/40 outline-none font-mono transition-colors"
                  placeholder="e.g. 192.168.1.50:8080"
                />
              </div>

              {/* Presets */}
              <div className="flex flex-col gap-2">
                <span className="text-[9px] font-bold uppercase tracking-wider text-neutral-500">Quick Host Presets</span>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => {
                      if (typeof window !== 'undefined') {
                        setMasterHostIp(window.location.host);
                      }
                    }}
                    className="p-1.5 rounded-lg border border-neutral-800 hover:border-neutral-700 bg-neutral-950/40 text-[10px] text-neutral-400 font-medium transition-all"
                  >
                    Auto-Detected Port 3000
                  </button>
                  <button
                    onClick={() => {
                      if (typeof window !== 'undefined') {
                        setMasterHostIp(`${window.location.hostname}:8080`);
                      } else {
                        setMasterHostIp('localhost:8080');
                      }
                    }}
                    className="p-1.5 rounded-lg border border-neutral-800 hover:border-neutral-700 bg-neutral-950/40 text-[10px] text-neutral-400 font-medium transition-all"
                  >
                    Default Port 8080
                  </button>
                </div>
              </div>
            </div>

            <div className="flex gap-3 mt-2">
              <button
                onClick={onExit}
                className="flex-1 py-2 rounded-xl bg-neutral-800 hover:bg-neutral-700 font-semibold text-xs transition-colors flex items-center justify-center gap-1.5 text-neutral-300 cursor-pointer"
              >
                <ArrowLeft size={14} />
                Exit Client
              </button>
              <button
                onClick={() => setIsConfigured(true)}
                className="flex-1 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-600 font-bold text-xs text-neutral-950 transition-colors flex items-center justify-center gap-1 hover:shadow-[0_0_15px_rgba(16,185,129,0.2)] cursor-pointer"
              >
                Connect Shell
                <ChevronRight size={14} />
              </button>
            </div>
          </div>
        </div>
      ) : (
        /* Terminal Execution View */
        <div className="flex-1 flex flex-col h-full w-full bg-[#0d1117]">
          {/* Status and Action header */}
          <header className="flex items-center justify-between px-4 py-2.5 bg-neutral-900 border-b border-neutral-800 relative z-20">
            <div className="flex items-center space-x-3">
              <button
                onClick={handleDisconnect}
                className="flex items-center gap-1 px-2 py-1 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-xs font-semibold text-neutral-300 transition-colors cursor-pointer"
              >
                <ArrowLeft size={12} />
                Disconnect
              </button>
              <div className="h-4 w-px bg-neutral-800" />
              <div className="flex items-center gap-2">
                <Monitor size={14} className="text-emerald-500" />
                <span className="text-xs font-mono text-neutral-400">
                  GlassOS Terminal — {username}@{masterHostIp}
                </span>
              </div>
            </div>

            <div className="flex items-center space-x-4 text-xs font-mono">
              {/* Telemetry Stats */}
              <div className="hidden md:flex items-center space-x-4 text-neutral-500 text-[11px]">
                <span className="flex items-center gap-1">
                  <Activity size={11} />
                  TX: {packetsSent}
                </span>
                <span className="flex items-center gap-1">
                  <Radio size={11} />
                  RX: {packetsReceived}
                </span>
              </div>

              {/* Status Indicator */}
              <span className="flex items-center space-x-1.5">
                <span
                  className={`w-2 h-2 rounded-full ${
                    connectionStatus === 'CONNECTED'
                      ? 'bg-emerald-400 animate-pulse'
                      : connectionStatus === 'CONNECTING'
                      ? 'bg-amber-400 animate-pulse'
                      : 'bg-rose-500'
                  }`}
                />
                <span className="text-neutral-300 uppercase tracking-wider text-[10px] font-bold">{connectionStatus}</span>
              </span>

              {assignedTTY !== null && (
                <span className="px-2 py-0.5 rounded bg-neutral-800 text-neutral-300 border border-neutral-700 text-[10px]">
                  TTY: /dev/tty{assignedTTY}
                </span>
              )}
              {assignedPID !== null && (
                <span className="px-2 py-0.5 rounded bg-neutral-800 text-neutral-300 border border-neutral-700 text-[10px]">
                  PID: {assignedPID}
                </span>
              )}
            </div>
          </header>

          {/* Terminal Viewport */}
          <main className="flex-1 p-3 bg-[#0d1117] overflow-hidden relative">
            <div ref={terminalRef} className="h-full w-full" />
          </main>
        </div>
      )}
    </div>
  );
}
