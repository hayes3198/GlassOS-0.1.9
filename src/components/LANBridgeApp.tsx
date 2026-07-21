import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Network, Wifi, WifiOff, Link, Link2, Monitor, Activity, 
  Terminal, ShieldAlert, CheckCircle2, AlertTriangle, Play, Pause, 
  Trash2, Send, Cpu, Layers, RefreshCw, X, Radio, ArrowLeftRight, HelpCircle
} from 'lucide-react';

interface LANBridgeAppProps {
  socket: any;
  addNotification: (app: string, message: string, type: 'success' | 'info' | 'warning' | 'error') => void;
  currentUser: any;
  windows: any[];
  openWindow: (id: string, title?: string) => void;
  sessions?: any[]; // Terminal sessions
  setSessions?: React.Dispatch<React.SetStateAction<any[]>>;
}

interface SlaveDevice {
  id: string;
  hostname: string;
  ip: string;
  tty: string;
  connectedAt: string;
  userAgent: string;
  isTrapped?: boolean;
}

interface BridgeLog {
  id: string;
  time: string;
  type: 'info' | 'success' | 'warning' | 'error' | 'packet';
  source: string;
  message: string;
}

export function LANBridgeApp({
  socket,
  addNotification,
  currentUser,
  windows,
  openWindow,
  sessions,
  setSessions
}: LANBridgeAppProps) {
  const [isMasterEnabled, setIsMasterEnabled] = useState(false);
  const [slaves, setSlaves] = useState<SlaveDevice[]>([]);
  const [logs, setLogs] = useState<BridgeLog[]>([
    { id: '1', time: new Date().toLocaleTimeString(), type: 'info', source: 'SYSTEM', message: 'Relay bridge service ready. Awaiting master activation...' }
  ]);
  const [selectedSlave, setSelectedSlave] = useState<SlaveDevice | null>(null);
  
  // Stats
  const [packetsSent, setPacketsSent] = useState(0);
  const [packetsReceived, setPacketsReceived] = useState(0);
  const [keystrokesRouted, setKeystrokesRouted] = useState(0);

  const addLog = (type: BridgeLog['type'], source: string, message: string) => {
    setLogs(prev => [
      {
        id: Math.random().toString(),
        time: new Date().toLocaleTimeString(),
        type,
        source,
        message
      },
      ...prev.slice(0, 49) // Keep last 50 logs
    ]);
  };

  // Listen to Socket events
  useEffect(() => {
    if (!socket) return;

    const handleMasterStatus = (data: { online: boolean }) => {
      addLog('info', 'RELAY', `Server confirmed Master status: ${data.online ? 'ACTIVE' : 'INACTIVE'}`);
    };

    const handleSlavesList = (slaveList: SlaveDevice[]) => {
      setSlaves(slaveList);
      addLog('success', 'BRIDGE', `Synched slave client roster. Total: ${slaveList.length} active devices.`);
    };

    const handleSlaveInput = (data: { slaveId: string; input?: string; key?: string }) => {
      setPacketsReceived(p => p + 1);
      setKeystrokesRouted(k => k + 1);
      
      const targetSlave = slaves.find(s => s.id === data.slaveId);
      const slaveName = targetSlave ? targetSlave.hostname : `Slave-${data.slaveId.slice(0, 4)}`;

      addLog('packet', 'INBOUND', `Keystroke routed from ${slaveName}: "${data.key || data.input}"`);

      // If the Slave submitted a full command input, route it to a terminal session!
      if (data.input !== undefined && setSessions) {
        // Find which TTY is mapped to this slave
        const slaveTty = targetSlave?.tty || 'tty2';
        
        // Find if there is a session with this TTY or create/update one
        setSessions(prev => {
          const sessionIndex = prev.findIndex(s => s.tty === slaveTty);
          if (sessionIndex !== -1) {
            // Yes! We have an active terminal session for this slave.
            // We'll update its history or handle command execution.
            // Wait, to process the command, we can simulate running it in the master's environment!
            // Let's add a log
            return prev;
          }
          return prev;
        });

        // Trigger a global custom event or callback in the parent container to execute this command!
        const event = new CustomEvent('lanbridge:execute-command', {
          detail: {
            slaveId: data.slaveId,
            tty: slaveTty,
            command: data.input
          }
        });
        window.dispatchEvent(event);
      }
    };

    socket.on('bridge:master-status', handleMasterStatus);
    socket.on('bridge:slaves-list', handleSlavesList);
    socket.on('bridge:slave-input', handleSlaveInput);

    // If master mode is enabled, register
    if (isMasterEnabled) {
      socket.emit('bridge:register-master');
      addLog('info', 'RELAY', 'Registering as active LAN Master Node...');
    }

    return () => {
      socket.off('bridge:master-status', handleMasterStatus);
      socket.off('bridge:slaves-list', handleSlavesList);
      socket.off('bridge:slave-input', handleSlaveInput);
    };
  }, [socket, isMasterEnabled, slaves, setSessions]);

  // Hook to handle incoming execution broadcasts from the terminal to push renders back to slaves
  useEffect(() => {
    if (!socket || !isMasterEnabled) return;

    const handlePushRender = (e: Event) => {
      const customEvent = e as CustomEvent;
      const { slaveId, renderState } = customEvent.detail;
      
      socket.emit('bridge:master-render', {
        slaveId,
        ...renderState
      });
      setPacketsSent(p => p + 1);
    };

    const handlePushRenders = (e: Event) => {
      const customEvent = e as CustomEvent;
      const { sessions: allSessions } = customEvent.detail;
      if (!allSessions) return;

      slaves.forEach(slave => {
        const mappedSession = allSessions.find((s: any) => s.tty === slave.tty);
        if (mappedSession) {
          socket.emit('bridge:master-render', {
            slaveId: slave.id,
            history: mappedSession.history,
            currentPath: mappedSession.currentPath,
            username: mappedSession.username,
            tty: mappedSession.tty,
            isTopActive: mappedSession.isTopActive,
            topData: mappedSession.topData,
            isTrapped: slave.isTrapped,
            trapDetails: slave.isTrapped ? {
              trapType: 'SYS_HALT',
              trapMessage: 'System halted by Ring-0 Vector 0x80 manual trap injection.'
            } : null
          });
          setPacketsSent(p => p + 1);
        }
      });
    };

    window.addEventListener('lanbridge:push-render', handlePushRender);
    window.addEventListener('lanbridge:push-renders', handlePushRenders);
    return () => {
      window.removeEventListener('lanbridge:push-render', handlePushRender);
      window.removeEventListener('lanbridge:push-renders', handlePushRenders);
    };
  }, [socket, isMasterEnabled, slaves]);

  const toggleMaster = () => {
    if (!isMasterEnabled) {
      setIsMasterEnabled(true);
      addNotification('Relay Bridge', 'Master Relay Node Activated. Listening for slave LAN terminals.', 'success');
    } else {
      setIsMasterEnabled(false);
      setSlaves([]);
      addNotification('Relay Bridge', 'Master Relay Node Deactivated.', 'info');
      addLog('warning', 'RELAY', 'Master Relay connection torn down.');
    }
  };

  const triggerTrapOnSlave = (slaveId: string, trapType: string, trapMessage: string) => {
    if (!socket || !isMasterEnabled) return;
    socket.emit('bridge:trigger-trap', { slaveId, trapType, trapMessage });
    addLog('error', 'TRAP_INJECT', `Dispatched Ring-0 CPU Exception Trap (${trapType}) to Slave Client ${slaveId.slice(0, 6)}`);
    addNotification('Trap Injection', `Dispatched CPU exception trap to slave terminal.`, 'warning');
    
    // Update local slave trapped state
    setSlaves(prev => prev.map(s => s.id === slaveId ? { ...s, isTrapped: true } : s));
  };

  const resolveTrapOnSlave = (slaveId: string) => {
    if (!socket || !isMasterEnabled) return;
    socket.emit('bridge:resolve-trap', { slaveId });
    addLog('success', 'TRAP_RESOLVE', `Dispatched Ring-0 Quarantine Clear packet to Slave Client ${slaveId.slice(0, 6)}`);
    addNotification('Trap Cleared', `Pushed CPU exception recovery vector to slave terminal.`, 'success');

    // Update local slave trapped state
    setSlaves(prev => prev.map(s => s.id === slaveId ? { ...s, isTrapped: false } : s));
  };

  const sendTestAlert = (slaveId: string) => {
    if (!socket || !isMasterEnabled) return;
    // We send a render package with a mock terminal line containing a flashing alert
    const target = slaves.find(s => s.id === slaveId);
    if (!target) return;
    
    const event = new CustomEvent('lanbridge:send-alert', {
      detail: { slaveId, message: '⚠️ MASTER NODE ALERT: Physical intranet link integrity 100% stable.' }
    });
    window.dispatchEvent(event);
    addLog('info', 'ALERT', `Pushed operational terminal ping broadcast to Slave ${target.hostname}`);
  };

  const slaveUrl = typeof window !== 'undefined' ? `${window.location.origin}/?mode=slave` : 'http://localhost:3000/?mode=slave';

  return (
    <div className="h-full flex flex-col bg-slate-950 text-white font-sans overflow-hidden">
      {/* Top Banner / Hero status */}
      <div className="p-4 bg-slate-900 border-b border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className={`p-2 rounded-xl ${isMasterEnabled ? 'bg-emerald-500/10 text-emerald-400' : 'bg-slate-800 text-slate-400'}`}>
            <Network size={24} className={isMasterEnabled ? 'animate-pulse' : ''} />
          </div>
          <div>
            <h1 className="text-sm font-bold tracking-tight uppercase text-slate-100">Intranet Relay Bridge Controller</h1>
            <p className="text-xs text-slate-400">Map local physical hardware devices as dumb slave OS terminal shells</p>
          </div>
        </div>
        
        <div className="flex items-center gap-3">
          <span className="text-xs font-mono text-slate-400">
            {isMasterEnabled ? '● MASTER MODE ACTIVE' : '○ STANDBY'}
          </span>
          <button
            onClick={toggleMaster}
            className={`px-4 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider transition-all duration-300 flex items-center gap-2 ${
              isMasterEnabled 
                ? 'bg-rose-500 hover:bg-rose-600 text-white shadow-lg shadow-rose-500/20' 
                : 'bg-emerald-500 hover:bg-emerald-600 text-white shadow-lg shadow-emerald-500/20'
            }`}
          >
            {isMasterEnabled ? <WifiOff size={14} /> : <Wifi size={14} />}
            {isMasterEnabled ? 'Deactivate Master' : 'Activate Master'}
          </button>
        </div>
      </div>

      {/* Grid containing details */}
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 overflow-hidden">
        {/* Left column: Controls & Connect Info (4 cols) */}
        <div className="lg:col-span-4 border-r border-slate-800 p-4 flex flex-col gap-4 overflow-y-auto no-scrollbar">
          
          {/* LAN Pairing Instructions */}
          <div className="bg-slate-900/60 border border-slate-800 p-4 rounded-xl flex flex-col gap-3">
            <div className="flex items-center gap-2 text-blue-400">
              <Link size={16} />
              <h2 className="text-xs font-bold uppercase tracking-wider">Intranet Pairing</h2>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              Open the following link in any phone, tablet, or secondary laptop on your local Wi-Fi router network to spawn an interactive dump terminal:
            </p>
            <div className="bg-black/40 p-2.5 rounded-lg border border-slate-800 font-mono text-xs break-all text-emerald-400 select-all relative group">
              {slaveUrl}
            </div>
            <div className="text-[10px] text-slate-500 flex items-center gap-1.5">
              <HelpCircle size={12} />
              <span>Dumb slave terminals route keystrokes directly to this Master core.</span>
            </div>
          </div>

          {/* Telemetry Stats */}
          <div className="grid grid-cols-3 gap-3">
            <div className="bg-slate-900/60 border border-slate-800 p-3 rounded-xl flex flex-col items-center justify-center">
              <ArrowLeftRight size={16} className="text-blue-400 mb-1" />
              <span className="text-lg font-bold font-mono tracking-tight text-white">{packetsReceived + packetsSent}</span>
              <span className="text-[9px] text-slate-500 uppercase font-bold">Total Packets</span>
            </div>
            <div className="bg-slate-900/60 border border-slate-800 p-3 rounded-xl flex flex-col items-center justify-center">
              <Send size={16} className="text-emerald-400 mb-1" />
              <span className="text-lg font-bold font-mono tracking-tight text-white">{packetsSent}</span>
              <span className="text-[9px] text-slate-500 uppercase font-bold">TX Render</span>
            </div>
            <div className="bg-slate-900/60 border border-slate-800 p-3 rounded-xl flex flex-col items-center justify-center">
              <Activity size={16} className="text-amber-400 mb-1" />
              <span className="text-lg font-bold font-mono tracking-tight text-white">{keystrokesRouted}</span>
              <span className="text-[9px] text-slate-500 uppercase font-bold">RX Input</span>
            </div>
          </div>

          {/* Trap Injector Control Block */}
          <div className="bg-slate-900/60 border border-slate-800 p-4 rounded-xl flex flex-col gap-3">
            <div className="flex items-center gap-2 text-rose-400">
              <Cpu size={16} />
              <h2 className="text-xs font-bold uppercase tracking-wider">Trap Injector Suite</h2>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              Simulate high-priority hardware exceptions and kernel level faults to verify slave trap handler routines:
            </p>
            {selectedSlave ? (
              <div className="flex flex-col gap-2 mt-1">
                <div className="p-2 rounded bg-black/40 border border-slate-800 flex justify-between items-center">
                  <span className="text-xs font-bold text-slate-300 font-mono">{selectedSlave.hostname}</span>
                  <span className={`text-[9px] px-1.5 py-0.5 rounded font-bold ${selectedSlave.isTrapped ? 'bg-rose-500/20 text-rose-400' : 'bg-emerald-500/20 text-emerald-400'}`}>
                    {selectedSlave.isTrapped ? 'TRAPPED' : 'SAFE'}
                  </span>
                </div>
                
                <div className="grid grid-cols-2 gap-2 mt-1">
                  <button
                    disabled={selectedSlave.isTrapped}
                    onClick={() => triggerTrapOnSlave(selectedSlave.id, 'DIV_ZERO', 'Kernel Division by Zero fault at Ring-0 register 0x004F')}
                    className="p-2 rounded bg-rose-950/40 hover:bg-rose-950/70 border border-rose-900/30 text-rose-300 text-[11px] font-bold uppercase tracking-wider transition-colors disabled:opacity-40"
                  >
                    Division by 0
                  </button>
                  <button
                    disabled={selectedSlave.isTrapped}
                    onClick={() => triggerTrapOnSlave(selectedSlave.id, 'PAGE_FAULT', 'Null memory pointer lookup in physical RAM segment 0x0C')}
                    className="p-2 rounded bg-amber-950/40 hover:bg-amber-950/70 border border-amber-900/30 text-amber-300 text-[11px] font-bold uppercase tracking-wider transition-colors disabled:opacity-40"
                  >
                    Page Fault
                  </button>
                  <button
                    disabled={selectedSlave.isTrapped}
                    onClick={() => triggerTrapOnSlave(selectedSlave.id, 'SYS_HALT', 'System halted by Ring-0 Vector 0x80 manual trap injection.')}
                    className="p-2 rounded bg-red-950/40 hover:bg-red-950/70 border border-red-900/30 text-red-300 text-[11px] font-bold uppercase tracking-wider transition-colors disabled:opacity-40 col-span-2"
                  >
                    Inject System Halt Trap
                  </button>
                </div>

                {selectedSlave.isTrapped && (
                  <button
                    onClick={() => resolveTrapOnSlave(selectedSlave.id)}
                    className="p-2 rounded bg-emerald-950 hover:bg-emerald-900 border border-emerald-800 text-emerald-300 text-xs font-bold uppercase tracking-wider transition-colors mt-2"
                  >
                    Clear Exceptions & Recover
                  </button>
                )}
              </div>
            ) : (
              <div className="p-3 rounded-lg border border-dashed border-slate-800 text-center text-xs text-slate-500">
                Select a connected slave from the roster to inject kernel faults.
              </div>
            )}
          </div>

        </div>

        {/* Right Columns: Slave Devices List & Live Telemetry Streams (8 cols) */}
        <div className="lg:col-span-8 flex flex-col overflow-hidden">
          {/* Top section: Roster of Slaves */}
          <div className="flex-1 p-4 flex flex-col gap-3 min-h-[250px] overflow-y-auto no-scrollbar border-b border-slate-800">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-slate-100">
                <Monitor size={16} className="text-emerald-400" />
                <h2 className="text-xs font-bold uppercase tracking-wider">Active Dumb Slave Terminals ({slaves.length})</h2>
              </div>
              <span className="text-[10px] text-slate-500">Master Socket ID: {socket?.id || 'Disconnected'}</span>
            </div>

            {slaves.length === 0 ? (
              <div className="flex-1 flex flex-col items-center justify-center p-8 bg-slate-900/20 border border-dashed border-slate-800 rounded-xl text-center">
                <Radio size={36} className="text-slate-600 mb-2 animate-pulse" />
                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Awaiting Physical Slave Nodes</h3>
                <p className="text-xs text-slate-500 max-w-sm mt-1">
                  Activate Master mode, then open the Intranet Pairing URL on your smartphone or tablet to create a remote shell.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {slaves.map(s => {
                  const isSelected = selectedSlave?.id === s.id;
                  return (
                    <div
                      key={s.id}
                      onClick={() => setSelectedSlave(s)}
                      className={`p-3.5 rounded-xl border transition-all cursor-pointer flex flex-col gap-2 relative overflow-hidden group ${
                        isSelected 
                          ? 'bg-slate-900 border-emerald-500 shadow-md shadow-emerald-500/5' 
                          : 'bg-slate-900/40 border-slate-800 hover:border-slate-700'
                      }`}
                    >
                      {s.isTrapped && (
                        <div className="absolute top-0 right-0 bg-rose-500/10 text-rose-400 text-[8px] font-bold px-2 py-0.5 rounded-bl uppercase tracking-wider flex items-center gap-1 border-l border-b border-rose-500/20 animate-pulse">
                          <ShieldAlert size={10} />
                          <span>TRAPPED FAULT</span>
                        </div>
                      )}

                      <div className="flex items-center gap-2.5">
                        <div className={`p-1.5 rounded-lg ${s.isTrapped ? 'bg-rose-500/10 text-rose-400' : 'bg-slate-800 text-slate-300'}`}>
                          <Monitor size={16} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="text-xs font-bold text-slate-100 truncate">{s.hostname}</h4>
                          <p className="text-[10px] text-slate-400 font-mono truncate">{s.ip} • mapped to <span className="text-amber-400 font-bold">{s.tty}</span></p>
                        </div>
                      </div>

                      <div className="text-[10px] text-slate-500 truncate font-sans">
                        Client: {s.userAgent}
                      </div>

                      <div className="flex items-center gap-2 mt-1 pt-2 border-t border-slate-800/60">
                        <button
                          onClick={(e) => { e.stopPropagation(); sendTestAlert(s.id); }}
                          className="px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 text-[10px] font-bold uppercase tracking-wider transition-colors flex-1"
                        >
                          Ping Terminal
                        </button>
                        <button
                          onClick={(e) => { 
                            e.stopPropagation(); 
                            if (s.isTrapped) {
                              resolveTrapOnSlave(s.id);
                            } else {
                              triggerTrapOnSlave(s.id, 'SYS_HALT', 'Manual Halt');
                            }
                          }}
                          className={`px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wider transition-colors flex-1 ${
                            s.isTrapped
                              ? 'bg-emerald-950 hover:bg-emerald-900 text-emerald-300'
                              : 'bg-rose-950 hover:bg-rose-900 text-rose-300'
                          }`}
                        >
                          {s.isTrapped ? 'Resolve Trap' : 'Inject Trap'}
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Bottom section: Live Telemetry / Traffic Streams */}
          <div className="h-44 p-4 flex flex-col gap-2 overflow-hidden bg-slate-950">
            <div className="flex items-center justify-between border-b border-slate-950 pb-1 mb-1">
              <div className="flex items-center gap-1.5 text-slate-300">
                <Activity size={14} className="text-blue-400" />
                <h3 className="text-[11px] font-bold uppercase tracking-wider">Live Relay Bridge Telemetry Frame</h3>
              </div>
              <button 
                onClick={() => setLogs([])}
                className="text-[10px] text-slate-500 hover:text-slate-300 flex items-center gap-1 transition-colors"
              >
                <Trash2 size={10} />
                Clear
              </button>
            </div>

            <div className="flex-1 overflow-y-auto no-scrollbar font-mono text-[11px] space-y-1 select-text">
              {logs.map(log => {
                let color = 'text-slate-400';
                if (log.type === 'success') color = 'text-emerald-400';
                if (log.type === 'warning') color = 'text-amber-400';
                if (log.type === 'error') color = 'text-rose-400';
                if (log.type === 'packet') color = 'text-blue-400';

                return (
                  <div key={log.id} className="flex gap-2 hover:bg-white/2 px-1 py-0.5 rounded">
                    <span className="text-slate-600">[{log.time}]</span>
                    <span className={`font-bold ${log.type === 'packet' ? 'text-blue-400' : ''}`}>{log.source.padEnd(10)}</span>
                    <span className={color}>{log.message}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
