import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Cpu, Shield, Zap, Play, Pause, Terminal, Activity, X, Check, 
  AlertCircle, Sliders, RefreshCw, Eye, EyeOff, Lock, Unlock, Database, Layers, ArrowLeftRight,
  HardDrive, Code2, Wrench, MousePointer
} from 'lucide-react';

interface GlassKernelProps {
  cpuUsage: number;
  ramUsage: number;
  addNotification: (app: string, message: string, type: 'success' | 'info' | 'warning' | 'error') => void;
  kernelCalls: any[];
  setKernelCalls: React.Dispatch<React.SetStateAction<any[]>>;
}

interface Process {
  id: number;
  name: string;
  type: 'system' | 'user' | 'untrusted';
  color: string;
  virtualPages: string[];
  physicalPages: number[];
  status: 'running' | 'blocked' | 'terminated';
}

interface KernelLog {
  id: string;
  timestamp: string;
  type: 'info' | 'success' | 'warning' | 'error' | 'mmu';
  source: string;
  message: string;
}

interface Driver {
  id: string;
  name: string;
  type: 'network' | 'storage' | 'display' | 'accelerator' | 'input';
  version: string;
  agnosticCode: string;
  irqs: number;
  baseAddress: string;
  status: 'unloaded' | 'loaded' | 'compiling';
  transactionsCount: number;
}

export function GlassKernel({
  cpuUsage,
  ramUsage,
  addNotification,
  kernelCalls,
  setKernelCalls
}: GlassKernelProps) {
  // Silicon-Agnostic Driver Framework (SADF) States
  const [drivers, setDrivers] = useState<Driver[]>([
    {
      id: 'net0',
      name: 'GlassNet v3 Ethernet Controller',
      type: 'network',
      version: '3.0.1-SADF',
      irqs: 9,
      baseAddress: '0x1A4000',
      status: 'loaded',
      transactionsCount: 1420,
      agnosticCode: `// Unified network descriptor mapping
void glass_init() {
  glass_map_irq(9, &network_handler);
  glass_dma_alloc(0x1000, &rx_buffer);
  glass_log("SADF: GlassNet driver active.");
}

void network_handler() {
  u8* packet = glass_dma_read(rx_buffer);
  glass_zero_copy_forward(packet, PORT_ETH0);
}`
    },
    {
      id: 'store0',
      name: 'NovaNVMe Storage Shield',
      type: 'storage',
      version: '1.2.0-SADF',
      irqs: 14,
      baseAddress: '0x3F8000',
      status: 'unloaded',
      transactionsCount: 0,
      agnosticCode: `// Block device access abstraction
void glass_init() {
  glass_map_irq(14, &nvme_handler);
  glass_register_block_device("nvme0", 512);
}

void nvme_handler() {
  u64 block = glass_read_register(0x20);
  glass_dma_write(block, &cache_buffer);
}`
    },
    {
      id: 'gpu0',
      name: 'AeroGPU Holographic Buffer',
      type: 'display',
      version: '2.4.5-SADF',
      irqs: 18,
      baseAddress: '0x7C0000',
      status: 'unloaded',
      transactionsCount: 0,
      agnosticCode: `// Acceleration unit pixel pipe
void glass_init() {
  glass_map_irq(18, &gpu_handler);
  glass_dma_alloc(0x4000, &framebuffer);
}

void gpu_handler() {
  glass_flush_pipeline();
  glass_write_register(0x10, framebuffer);
}`
    },
    {
      id: 'npu0',
      name: 'Cognitive NPU Accelerator',
      type: 'accelerator',
      version: '1.0.0-SADF',
      irqs: 22,
      baseAddress: '0x9E2000',
      status: 'unloaded',
      transactionsCount: 0,
      agnosticCode: `// Deep learning hardware tensor stream
void glass_init() {
  glass_map_irq(22, &npu_handler);
  glass_dma_alloc(0x8000, &weights_buffer);
}

void npu_handler() {
  glass_trigger_tensor_dot();
  glass_log("Tensor operation completed.");
}`
    },
    {
      id: 'input0',
      name: 'USB & HID Pointer Controller',
      type: 'input',
      version: '2.1.0-SADF',
      irqs: 5,
      baseAddress: '0x0FC000',
      status: 'unloaded',
      transactionsCount: 0,
      agnosticCode: `// Silicon-Agnostic Human Interface Device (HID) Parser
void glass_init() {
  glass_map_irq(5, &hid_pointer_handler);
  glass_usb_register_driver(0x046D, 0xC52B); // Logi USB Receiver
  glass_log("SADF: USB & HID Pointer Driver active.");
}

void hid_pointer_handler() {
  u8 packet[64];
  glass_usb_bulk_transfer(ENDPOINT_IN, packet, 64);
  
  // Extract absolute coordinate deltas
  s16 dx = (packet[2] << 8) | packet[1];
  s16 dy = (packet[4] << 8) | packet[3];
  u8 buttons = packet[0];
  
  glass_inject_input_event(EV_REL_MOUSE, dx, dy, buttons);
}`
    }
  ]);

  const [selectedDriverId, setSelectedDriverId] = useState<string>('net0');
  const [activeArch, setActiveArch] = useState<'arm64' | 'x86_64' | 'riscv' | 'tpu'>('arm64');
  const [isCompilingDriver, setIsCompilingDriver] = useState<boolean>(false);
  const [compilerLogs, setCompilerLogs] = useState<string[]>([]);
  const [driverAgnosticCode, setDriverAgnosticCode] = useState<string>(drivers[0].agnosticCode);

  // Kernel Tuning States
  const [strictIsolation, setStrictIsolation] = useState(true);
  const [holoCryptEnclaveActive, setHoloCryptEnclaveActive] = useState(true);
  const [rotatingKey, setRotatingKey] = useState<string>('0x9A4F8B2C1E706D53');

  useEffect(() => {
    const keyInterval = setInterval(() => {
      const hex = '0123456789ABCDEF';
      let key = '0x';
      for (let i = 0; i < 16; i++) {
        key += hex[Math.floor(Math.random() * 16)];
      }
      setRotatingKey(key);
    }, 2000);
    return () => clearInterval(keyInterval);
  }, []);

  const [zeroCopyEnabled, setZeroCopyEnabled] = useState(true);
  const [pageSize, setPageSize] = useState<4 | 2048 | 1048576>(4); // 4KB, 2MB, 1GB
  
  // IPC Simulator States
  const [messageSize, setMessageSize] = useState<number>(10); // in MB
  const [isIpcRunning, setIsIpcRunning] = useState(false);
  const [ipcProgress, setIpcProgress] = useState(0);
  const [ipcMode, setIpcMode] = useState<'copy' | 'zerocopy'>('zerocopy');
  const [ipcStats, setIpcStats] = useState({
    copyCount: 0,
    zeroCopyCount: 0,
    totalBytesTransferred: 0,
    copyAvgLatencyMs: 42.5,
    zeroCopyAvgLatencyMs: 0.12,
    copyAvgCpuOverhead: 18.4,
    zeroCopyAvgCpuOverhead: 0.8
  });

  // Memory Isolation / Process list States
  const [processes, setProcesses] = useState<Process[]>([
    { id: 100, name: 'AuthService (Kernel)', type: 'system', color: 'text-purple-400 bg-purple-500/10 border-purple-500/20', virtualPages: ['0x00A0', '0x00A1', '0x00A2', '0x00A3'], physicalPages: [2, 3, 4, 5], status: 'running' },
    { id: 101, name: 'GlassFS Driver', type: 'system', color: 'text-blue-400 bg-blue-500/10 border-blue-500/20', virtualPages: ['0x01B0', '0x01B1', '0x01B2', '0x01B3'], physicalPages: [8, 9, 10, 11], status: 'running' },
    { id: 204, name: 'GlassPaint App', type: 'user', color: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20', virtualPages: ['0x04C0', '0x04C1', '0x04C2'], physicalPages: [16, 17, 18], status: 'running' },
    { id: 512, name: 'Untrusted Guest Script', type: 'untrusted', color: 'text-rose-400 bg-rose-500/10 border-rose-500/20', virtualPages: ['0x09F0', '0x09F1'], physicalPages: [24, 25], status: 'running' }
  ]);

  // Physical RAM map simulation (32 blocks/frames)
  // Value represents process ID that owns it, -1 is free, -2 is shared zero-copy buffer
  const [physicalRAM, setPhysicalRAM] = useState<number[]>(() => {
    const ram = Array(32).fill(-1);
    // Seed initial system pages
    ram[0] = 0; // Kernel reserved
    ram[1] = 0; // Kernel reserved
    ram[2] = 100; ram[3] = 100; ram[4] = 100; ram[5] = 100; // AuthService
    ram[8] = 101; ram[9] = 101; ram[10] = 101; ram[11] = 101; // GlassFS
    ram[16] = 204; ram[17] = 204; ram[18] = 204; // GlassPaint
    ram[24] = 512; ram[25] = 512; // Untrusted
    return ram;
  });

  const [kernelLogs, setKernelLogs] = useState<KernelLog[]>([
    { id: '1', timestamp: new Date().toLocaleTimeString(), type: 'info', source: 'BOOT', message: 'GlassOS kernel loading active protection layer...' },
    { id: '2', timestamp: new Date().toLocaleTimeString(), type: 'success', source: 'MMU', message: 'Page table isolation initialized with hardware-enforced protection boundaries.' },
    { id: '3', timestamp: new Date().toLocaleTimeString(), type: 'info', source: 'SHM', message: 'Zero-Copy message subsystem bound to POSIX shared memory interfaces.' }
  ]);

  const [exploitStatus, setExploitStatus] = useState<'idle' | 'running' | 'prevented' | 'breached'>('idle');
  const [selectedPhysicalBlock, setSelectedPhysicalBlock] = useState<number | null>(null);

  const logRef = useRef<HTMLDivElement>(null);

  // Auto-scroll logs
  useEffect(() => {
    if (logRef.current) {
      logRef.current.scrollTop = logRef.current.scrollHeight;
    }
  }, [kernelLogs]);

  // Push new kernel log helper
  const addKernelLog = useCallback((type: KernelLog['type'], source: string, message: string) => {
    const newLog: KernelLog = {
      id: Math.random().toString(36).substr(2, 9),
      timestamp: new Date().toLocaleTimeString(),
      type,
      source,
      message
    };
    setKernelLogs(prev => [...prev, newLog].slice(-50));

    // Also push to the main app's kernelCalls for continuity
    const newCall = {
      id: Math.random().toString(36).substr(2, 9),
      service: `Kernel::${source}`,
      method: message.split(' ')[0] || 'sys_call',
      status: type === 'error' ? 'error' : type === 'warning' ? 'warning' : 'success',
      timestamp: new Date().toLocaleTimeString(),
      latency: type === 'error' ? 2 : Math.floor(Math.random() * 5) + 1
    };
    setKernelCalls(prev => [newCall, ...prev].slice(0, 50));
  }, [setKernelCalls]);

  // Synchronize driver agnostic code when selected driver changes
  useEffect(() => {
    const drv = drivers.find(d => d.id === selectedDriverId);
    if (drv) {
      setDriverAgnosticCode(drv.agnosticCode);
    }
  }, [selectedDriverId, drivers]);

  // Simulate transactional throughput for loaded drivers
  useEffect(() => {
    const interval = setInterval(() => {
      setDrivers(prev => prev.map(drv => {
        if (drv.status === 'loaded') {
          const increment = Math.floor(Math.random() * 8) + 1;
          return {
            ...drv,
            transactionsCount: drv.transactionsCount + increment
          };
        }
        return drv;
      }));
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  // Compile and Hotplug Agnostic Driver code
  const handleCompileAndHotplug = () => {
    if (isCompilingDriver) return;
    setIsCompilingDriver(true);
    setCompilerLogs([]);

    const currentDriver = drivers.find(d => d.id === selectedDriverId);
    if (!currentDriver) return;

    addKernelLog('info', 'SADF', `Preparing Silicon-Agnostic compilation for driver: ${currentDriver.name}...`);

    const archLabel = 
      activeArch === 'arm64' ? 'Apple Silicon (ARM64 / M-Series)' :
      activeArch === 'x86_64' ? 'Intel/AMD Core (x86_64)' :
      activeArch === 'riscv' ? 'RISC-V (Open-ISA Embedded)' :
      'Google Tensor (TPU VLIW Accelerators)';

    const steps = [
      { msg: '[SADF Engine] Parsing unified agnostic driver source tree...', delay: 200 },
      { msg: '[SADF Compiler] Emitting platform-independent Intermediate Representation (SADF-IR v2.1)...', delay: 450 },
      { msg: `[SADF Compiler] Invoking backend code generator targeting: ${archLabel}`, delay: 700 },
      { msg: '[SADF Linker] Binding hardware registers & static page mapping...', delay: 950 },
      { msg: '[SADF Sandbox] Validating pointer safety and device DMA bounds (Ring-0 Gatekeeper)...', delay: 1200 },
      { msg: '[SADF Hotplug] Dynamically loading translation table into live kernel memory space...', delay: 1450 },
      { msg: `[SADF Success] Driver '${currentDriver.name}' successfully bound to IRQ ${currentDriver.irqs} at Base ${currentDriver.baseAddress}!`, delay: 1650 }
    ];

    steps.forEach((step, idx) => {
      setTimeout(() => {
        setCompilerLogs(prev => [...prev, step.msg]);
        if (idx === steps.length - 1) {
          setIsCompilingDriver(false);
          // Set driver status to loaded and update code
          setDrivers(prev => prev.map(drv => {
            if (drv.id === selectedDriverId) {
              return {
                ...drv,
                status: 'loaded',
                agnosticCode: driverAgnosticCode,
                transactionsCount: drv.status === 'loaded' ? drv.transactionsCount : 0
              };
            }
            return drv;
          }));

          addKernelLog('success', 'SADF', `Hotplug loaded agnostic driver: ${currentDriver.name} (${currentDriver.version})`);
          addNotification('Silicon HAL', `Driver '${currentDriver.name}' successfully loaded into ring-0 on ${activeArch.toUpperCase()}`, 'success');
        }
      }, step.delay);
    });
  };

  // Simulating hardware interrupt trigger
  const handleTriggerHardwareInterrupt = (driver: Driver) => {
    if (driver.status !== 'loaded') {
      addNotification('SADF Bus', `Cannot trigger interrupt: Driver ${driver.name} is unloaded`, 'warning');
      return;
    }
    
    addKernelLog('success', 'IRQ', `HARDWARE INTERRUPT (IRQ ${driver.irqs}): Handled by Silicon-Agnostic HAL via compiled target descriptor!`);
    addNotification('Hardware HAL', `Fired IRQ ${driver.irqs} -> Handled via SADF translation on ${activeArch.toUpperCase()}`, 'info');
    
    // Increment transaction count
    setDrivers(prev => prev.map(drv => {
      if (drv.id === driver.id) {
        return {
          ...drv,
          transactionsCount: drv.transactionsCount + 100
        };
      }
      return drv;
    }));
  };

  // Dispatch interactive IPC transfer
  const handleIpcDispatch = () => {
    if (isIpcRunning) return;
    setIsIpcRunning(true);
    setIpcProgress(0);

    const mode = ipcMode;
    const size = messageSize;
    addKernelLog('info', 'IPC', `Initiating IPC transmission of ${size}MB payload in ${mode === 'zerocopy' ? 'ZERO-COPY' : 'BUFFER COPY'} mode...`);

    let duration = mode === 'zerocopy' ? 300 : size * 250; // zerocopy is blazing fast and constant time!
    let intervalTime = 30;
    let steps = duration / intervalTime;
    let currentStep = 0;

    // Temporarily allocate shared page in RAM if zerocopy is used
    if (mode === 'zerocopy') {
      setPhysicalRAM(prev => {
        const next = [...prev];
        next[14] = -2; // -2 represents the Zero-Copy Shared Ring Buffer
        return next;
      });
    } else {
      // Buffer copy creates transient page copies
      setPhysicalRAM(prev => {
        const next = [...prev];
        next[13] = 204; // App local buffer
        next[14] = 0;   // Copied to kernel buffer
        next[15] = 101; // Copied to target driver buffer
        return next;
      });
    }

    const interval = setInterval(() => {
      currentStep++;
      const progress = Math.min((currentStep / steps) * 100, 100);
      setIpcProgress(progress);

      if (progress >= 100) {
        clearInterval(interval);
        setIsIpcRunning(false);

        // Stats calculation
        const calculatedLatency = mode === 'zerocopy' 
          ? Number((0.05 + Math.random() * 0.1).toFixed(3)) 
          : Number((size * 4.2 + Math.random() * 2).toFixed(1));
        
        const calculatedCpu = mode === 'zerocopy'
          ? Number((0.2 + Math.random() * 0.5).toFixed(2))
          : Number((size * 1.8 + Math.random() * 3).toFixed(1));

        addKernelLog(
          'success', 
          'IPC', 
          `IPC Complete! Mode: ${mode === 'zerocopy' ? 'Zero-Copy (Shared Pointer)' : 'Double Buffer Copy'}. Size: ${size}MB. Latency: ${calculatedLatency}ms. CPU overhead: ${calculatedCpu}%.`
        );

        // Add Notification
        addNotification(
          'Kernel Bus', 
          `IPC passed ${size}MB via ${mode === 'zerocopy' ? 'Zero-Copy Reference' : 'Memory Copy'} in ${calculatedLatency}ms`, 
          'success'
        );

        // Record stats
        setIpcStats(prev => ({
          ...prev,
          copyCount: prev.copyCount + (mode === 'copy' ? 1 : 0),
          zeroCopyCount: prev.zeroCopyCount + (mode === 'zerocopy' ? 1 : 0),
          totalBytesTransferred: prev.totalBytesTransferred + size * 1024 * 1024,
          copyAvgLatencyMs: mode === 'copy' ? Number(((prev.copyAvgLatencyMs * prev.copyCount + calculatedLatency) / (prev.copyCount + 1)).toFixed(2)) : prev.copyAvgLatencyMs,
          zeroCopyAvgLatencyMs: mode === 'zerocopy' ? Number(((prev.zeroCopyAvgLatencyMs * prev.zeroCopyCount + calculatedLatency) / (prev.zeroCopyCount + 1)).toFixed(3)) : prev.zeroCopyAvgLatencyMs,
          copyAvgCpuOverhead: mode === 'copy' ? Number(((prev.copyAvgCpuOverhead * prev.copyCount + calculatedCpu) / (prev.copyCount + 1)).toFixed(2)) : prev.copyAvgCpuOverhead,
          zeroCopyAvgCpuOverhead: mode === 'zerocopy' ? Number(((prev.zeroCopyAvgCpuOverhead * prev.zeroCopyCount + calculatedCpu) / (prev.zeroCopyCount + 1)).toFixed(2)) : prev.zeroCopyAvgCpuOverhead
        }));

        // Clean up RAM visualization frames
        setPhysicalRAM(prev => {
          const next = [...prev];
          next[13] = -1;
          next[14] = -1;
          next[15] = -1;
          return next;
        });
      }
    }, intervalTime);
  };

  // Simulate Malicious Memory Access Exploit
  const handleSimulateExploit = () => {
    if (exploitStatus === 'running') return;
    setExploitStatus('running');
    addKernelLog('warning', 'EXPLOIT', 'Process 512 (Untrusted Guest Script) executing pointer scan...');
    addKernelLog('warning', 'EXPLOIT', 'Attempting read from physical block 0x03 (Reserved for AuthService token cache)...');

    setTimeout(() => {
      if (strictIsolation) {
        setExploitStatus('prevented');
        addKernelLog('error', 'MMU', 'SECURITY EXCEPTION: SIGSEGV (Segmentation Fault). Process 512 tried to access unauthorized memory space.');
        addKernelLog('success', 'KERNEL', 'Guest script process sandboxed and strictly isolated. Threat neutralized.');
        addNotification('Gatekeeper', 'Intercepted memory read violation from untrusted script!', 'error');

        // Terminate the guest script process visually
        setProcesses(prev => prev.map(p => p.id === 512 ? { ...p, status: 'terminated' } : p));
        // Free its physical pages
        setPhysicalRAM(prev => {
          const next = [...prev];
          next[24] = -1;
          next[25] = -1;
          return next;
        });
      } else if (holoCryptEnclaveActive) {
        setExploitStatus('prevented');
        addKernelLog('success', 'SECURE ENCLAVE', `[HoloCrypt Enclave] INTERCEPT: Blocked illegal read access using Ring-0 secure hardware protection boundaries.`);
        addKernelLog('success', 'SECURE ENCLAVE', `[HoloCrypt Enclave] Enclave memory shield verified with dynamic quantum signature: HOLO-SECURE-${rotatingKey}.`);
        addKernelLog('success', 'SECURE ENCLAVE', `[HoloCrypt Enclave] Process 512 memory frames quarantined inside Ring-0 Secure Enclave.`);
        addNotification('HoloCrypt Enclave', 'HoloCrypt Enclave intercepted and neutralized memory read violation!', 'success');

        // Visually place process 512 into enclave/suspended status
        setProcesses(prev => prev.map(p => p.id === 512 ? { ...p, status: 'terminated' } : p));
        // In the physical RAM map, mark its physical frames as secured inside the enclave!
        // We can keep them as owned by 512 but mark them as secure in the log.
      } else {
        setExploitStatus('breached');
        addKernelLog('error', 'BREACH', 'EXPLOIT SUCCESSFUL! Process 512 successfully read 256 bytes from AuthService segment: token="gOS_usr_tok_8f9024c...".');
        addKernelLog('warning', 'SECURITY', 'System tokens leaked to untrusted space. Strict isolation recommended.');
        addNotification('Critical Breach', 'Memory isolation failure! AuthService data leaked.', 'error');
      }
    }, 2000);
  };

  const handleResetGuestScript = () => {
    setProcesses(prev => prev.map(p => p.id === 512 ? { ...p, status: 'running' } : p));
    setPhysicalRAM(prev => {
      const next = [...prev];
      next[24] = 512;
      next[25] = 512;
      return next;
    });
    setExploitStatus('idle');
    addKernelLog('info', 'KERNEL', 'Untrusted guest script process restarted with generic boundaries.');
  };

  return (
    <div className="flex flex-col gap-6 text-white p-6 md:p-8 select-none font-sans bg-[#0d1117] min-h-full rounded-2xl border border-white/5">
      {/* Top Header Row */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-white/5 pb-6">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white shadow-xl shadow-blue-500/10">
            <Cpu size={24} className="animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-bold tracking-tight">Virtual Kernel Engine</h2>
              <span className="px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-400 text-[9px] font-bold uppercase tracking-wider">
                v2.5-Native
              </span>
            </div>
            <p className="text-xs text-white/40">Hardware-level isolation and Zero-Copy IPC Bus controllers</p>
          </div>
        </div>

        {/* Global Controls & States */}
        <div className="flex items-center flex-wrap gap-4">
          <div className="flex items-center gap-2 bg-[#161b22] px-4 py-2 rounded-2xl border border-white/5">
            <Shield size={14} className={strictIsolation ? "text-emerald-400" : "text-rose-400"} />
            <span className="text-xs font-semibold">Strict Isolation:</span>
            <button
              onClick={() => {
                setStrictIsolation(!strictIsolation);
                addKernelLog(
                  !strictIsolation ? 'success' : 'warning', 
                  'KERNEL', 
                  `Hardware-enforced Memory Isolation toggled to ${!strictIsolation ? 'STRICT' : 'LOOSE'}.`
                );
              }}
              className={`px-2.5 py-1 rounded-lg text-[10px] font-bold transition-all uppercase ${
                strictIsolation 
                  ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' 
                  : 'bg-rose-500/20 text-rose-400 border border-rose-500/30 hover:bg-rose-500/30'
              }`}
            >
              {strictIsolation ? 'ACTIVE' : 'DISABLED'}
            </button>
          </div>

          <div className="flex items-center gap-2 bg-[#161b22] px-4 py-2 rounded-2xl border border-white/5">
            <Zap size={14} className={zeroCopyEnabled ? "text-blue-400" : "text-amber-400"} />
            <span className="text-xs font-semibold">Zero-Copy:</span>
            <button
              onClick={() => {
                setZeroCopyEnabled(!zeroCopyEnabled);
                setIpcMode(!zeroCopyEnabled ? 'zerocopy' : 'copy');
                addKernelLog(
                  'info', 
                  'KERNEL', 
                  `Message passing bus standard set to ${!zeroCopyEnabled ? 'Zero-Copy Reference mode' : 'Traditional Data-Buffer Copying'}.`
                );
              }}
              className={`px-2.5 py-1 rounded-lg text-[10px] font-bold transition-all uppercase ${
                zeroCopyEnabled 
                  ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30' 
                  : 'bg-amber-500/20 text-amber-400 border border-amber-500/30 hover:bg-amber-500/30'
              }`}
            >
              {zeroCopyEnabled ? 'ENABLED' : 'DISABLED'}
            </button>
          </div>

          <div className="flex items-center gap-2 bg-[#161b22] px-4 py-2 rounded-2xl border border-white/5">
            <Lock size={14} className={holoCryptEnclaveActive ? "text-amber-400" : "text-white/40"} />
            <span className="text-xs font-semibold text-white">HoloCrypt Enclave:</span>
            <button
              onClick={() => {
                setHoloCryptEnclaveActive(!holoCryptEnclaveActive);
                addKernelLog(
                  !holoCryptEnclaveActive ? 'success' : 'warning', 
                  'SECURE ENCLAVE', 
                  `HoloCrypt Ring-0 Secure Enclave toggled to ${!holoCryptEnclaveActive ? 'ENFORCED' : 'BYPASSED'}.`
                );
              }}
              className={`px-2.5 py-1 rounded-lg text-[10px] font-bold transition-all uppercase ${
                holoCryptEnclaveActive 
                  ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30 shadow-[0_0_8px_rgba(245,158,11,0.2)]' 
                  : 'bg-white/5 text-white/40 border border-white/10 hover:bg-white/10'
              }`}
            >
              {holoCryptEnclaveActive ? 'ENFORCED' : 'BYPASSED'}
            </button>
          </div>
        </div>
      </div>

      {/* Main Grid Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* Left Column: Zero-Copy IPC Bus Controller */}
        <div className="bg-[#161b22] border border-white/5 rounded-3xl p-6 flex flex-col gap-6 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/2 rounded-full blur-3xl pointer-events-none" />
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Zap size={18} className="text-blue-400" />
              <h3 className="text-sm font-semibold uppercase tracking-wider">Zero-Copy IPC Controller</h3>
            </div>
            <span className="text-[10px] text-white/30 font-mono">bus_latency: {zeroCopyEnabled ? '0.12ms' : '42.50ms'}</span>
          </div>

          <p className="text-xs text-white/60 leading-relaxed">
            Zero-copy communication eliminates the CPU overhead of duplicating buffer streams. Instead of writing bytes from Process memory into Kernel memory and finally to Driver buffers, GlassOS maps physical memory pages directly, passing lightweight read-only pointer pointers.
          </p>

          {/* Interactive Simulation Panel */}
          <div className="bg-[#0d1117] p-5 rounded-2xl border border-white/5 flex flex-col gap-4">
            <div className="flex justify-between items-center text-xs">
              <span className="text-white/40">Select Message Payload Size</span>
              <span className="text-blue-400 font-mono font-bold">{messageSize} MB</span>
            </div>
            
            {/* Range slider for message size */}
            <input 
              type="range" 
              min="1" 
              max="100" 
              value={messageSize} 
              onChange={(e) => setMessageSize(Number(e.target.value))}
              disabled={isIpcRunning}
              className="w-full accent-blue-500 h-1 bg-white/10 rounded-lg cursor-pointer"
            />
            
            <div className="flex items-center justify-between text-[11px] text-white/30">
              <span>1 MB (Fast)</span>
              <span>100 MB (Intense copy overhead)</span>
            </div>

            {/* Toggle IPC Style directly in Sandbox */}
            <div className="grid grid-cols-2 gap-3 mt-2">
              <button
                onClick={() => setIpcMode('copy')}
                disabled={isIpcRunning}
                className={`py-2 px-3 rounded-xl border text-xs font-semibold flex flex-col items-center gap-1 transition-all ${
                  ipcMode === 'copy' 
                    ? 'border-amber-500/30 bg-amber-500/5 text-amber-400' 
                    : 'border-white/5 bg-white/2 text-white/40 hover:text-white/60 hover:bg-white/5'
                }`}
              >
                <span className="font-bold">Buffer Memory Copy</span>
                <span className="text-[9px] opacity-60">CPU cycles proportional to size</span>
              </button>

              <button
                onClick={() => setIpcMode('zerocopy')}
                disabled={isIpcRunning}
                className={`py-2 px-3 rounded-xl border text-xs font-semibold flex flex-col items-center gap-1 transition-all ${
                  ipcMode === 'zerocopy' 
                    ? 'border-blue-500/30 bg-blue-500/5 text-blue-400' 
                    : 'border-white/5 bg-white/2 text-white/40 hover:text-white/60 hover:bg-white/5'
                }`}
              >
                <span className="font-bold">Zero-Copy Pointer</span>
                <span className="text-[9px] opacity-60">Constant-time O(1) page flip</span>
              </button>
            </div>

            {/* Send Action */}
            <button
              onClick={handleIpcDispatch}
              disabled={isIpcRunning}
              className={`w-full py-3 rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition-all shadow-lg ${
                isIpcRunning 
                  ? 'bg-blue-500/20 text-blue-400/60 cursor-not-allowed' 
                  : 'bg-blue-500 text-white hover:bg-blue-600 shadow-blue-500/10 hover:scale-[1.01]'
              }`}
            >
              {isIpcRunning ? (
                <>
                  <RefreshCw size={14} className="animate-spin" />
                  Transferring via Bus... {Math.round(ipcProgress)}%
                </>
              ) : (
                <>
                  <ArrowLeftRight size={14} />
                  Dispatch IPC Message ({messageSize}MB)
                </>
              )}
            </button>
          </div>

          {/* Animated IPC Bus Pipeline Visualizer */}
          <div className="bg-[#0d1117] p-5 rounded-2xl border border-white/5 flex flex-col gap-4 relative min-h-[140px] justify-center">
            <div className="absolute top-2 left-3 text-[9px] font-bold text-white/20 uppercase tracking-wider">
              Memory Bus Routing Engine
            </div>

            <div className="flex items-center justify-between px-6 relative">
              {/* Process A */}
              <div className="flex flex-col items-center gap-1 z-10">
                <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 text-xs font-bold font-mono shadow-lg">
                  App
                </div>
                <span className="text-[9px] text-white/40">Source (Client)</span>
              </div>

              {/* Memory Pipeline with moving packets */}
              <div className="flex-1 h-[2px] bg-white/10 mx-4 relative overflow-hidden">
                {/* Visualizer animation block */}
                {isIpcRunning && ipcMode === 'copy' && (
                  <motion.div 
                    initial={{ left: '0%' }}
                    animate={{ left: '100%' }}
                    transition={{ duration: 1.5, repeat: Infinity, ease: 'linear' }}
                    className="absolute w-6 h-6 -mt-3 bg-amber-500/30 border border-amber-500 rounded-full flex items-center justify-center text-[8px] font-bold text-amber-400"
                  >
                    BUF
                  </motion.div>
                )}

                {isIpcRunning && ipcMode === 'zerocopy' && (
                  <motion.div 
                    initial={{ left: '0%' }}
                    animate={{ left: '100%' }}
                    transition={{ duration: 0.3, repeat: Infinity, ease: 'easeInOut' }}
                    className="absolute w-6 h-6 -mt-3 bg-blue-500/30 border border-blue-500 rounded-full flex items-center justify-center text-[8px] font-bold text-blue-400 shadow-[0_0_12px_rgba(59,130,246,0.6)]"
                  >
                    PTR
                  </motion.div>
                )}

                {/* Pipeline description text */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-[8px] text-white/20 font-bold uppercase tracking-widest bg-[#0d1117] px-2">
                    {isIpcRunning 
                      ? (ipcMode === 'zerocopy' ? 'SHARED PAGE FLIP' : 'COPYING MEMORY BUFFERS')
                      : 'IDLE BUS'
                    }
                  </span>
                </div>
              </div>

              {/* Process B */}
              <div className="flex flex-col items-center gap-1 z-10">
                <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/30 flex items-center justify-center text-blue-400 text-xs font-bold font-mono shadow-lg">
                  Driver
                </div>
                <span className="text-[9px] text-white/40">Dest (Kernel)</span>
              </div>
            </div>

            {/* Explanatory subtitle */}
            <div className="text-center text-[10px] text-white/30 italic">
              {ipcMode === 'zerocopy' 
                ? '✓ Shared Pointer passes a memory reference instantly. Zero extra RAM allocated.' 
                : '✗ Buffer Copy copies whole block to kernel, then target. High CPU usage!'
              }
            </div>
          </div>

          {/* Performance Real-Time Analytics Comparison */}
          <div className="flex flex-col gap-3">
            <span className="text-[10px] text-white/30 uppercase font-bold tracking-wider">Bus Efficiency Analytics</span>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-[#0d1117] p-3 rounded-xl border border-white/5 flex flex-col">
                <span className="text-[9px] text-white/30 uppercase">Copy Latency</span>
                <span className="text-xs font-mono font-bold text-amber-400">{ipcStats.copyAvgLatencyMs} ms</span>
              </div>
              <div className="bg-[#0d1117] p-3 rounded-xl border border-white/5 flex flex-col">
                <span className="text-[9px] text-white/30 uppercase">Zero-Copy Latency</span>
                <span className="text-xs font-mono font-bold text-blue-400">{ipcStats.zeroCopyAvgLatencyMs} ms</span>
              </div>
              <div className="bg-[#0d1117] p-3 rounded-xl border border-white/5 flex flex-col">
                <span className="text-[9px] text-white/30 uppercase">Copy CPU load</span>
                <span className="text-xs font-mono font-bold text-amber-400">{ipcStats.copyAvgCpuOverhead}%</span>
              </div>
              <div className="bg-[#0d1117] p-3 rounded-xl border border-white/5 flex flex-col">
                <span className="text-[9px] text-white/30 uppercase">Zero-Copy CPU load</span>
                <span className="text-xs font-mono font-bold text-blue-400">{ipcStats.zeroCopyAvgCpuOverhead}%</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: MMU & Strict Memory Isolation Visualizer */}
        <div className="bg-[#161b22] border border-white/5 rounded-3xl p-6 flex flex-col gap-6 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/2 rounded-full blur-3xl pointer-events-none" />
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Shield size={18} className="text-emerald-400" />
              <h3 className="text-sm font-semibold uppercase tracking-wider">MMU Isolation controller</h3>
            </div>
            <span className="text-[10px] text-white/30 font-mono">isolation_mode: {strictIsolation ? 'HARDWARE' : 'EMULATED'}</span>
          </div>

          <p className="text-xs text-white/60 leading-relaxed">
            Strict memory isolation segments virtual address space, mapping logical page addresses strictly to distinct physical frames inside the RAM array. Rogue scripts or processes cannot bypass their isolation sandbox to read/write system service blocks unless allowed.
          </p>

          {/* Process List with Address Mappings */}
          <div className="flex flex-col gap-3">
            <div className="flex justify-between items-center">
              <span className="text-[10px] text-white/30 uppercase font-bold tracking-wider">Isolated Processes Address Spaces</span>
              {exploitStatus !== 'idle' && (
                <button 
                  onClick={handleResetGuestScript} 
                  className="text-[9px] text-blue-400 hover:underline flex items-center gap-1"
                >
                  <RefreshCw size={10} /> Reset Guest Script
                </button>
              )}
            </div>

            <div className="grid grid-cols-1 gap-2">
              {processes.map(proc => (
                <div 
                  key={proc.id} 
                  className={`p-3 rounded-xl border flex items-center justify-between transition-colors ${
                    proc.status === 'terminated' 
                      ? 'bg-rose-950/10 border-rose-950/30 opacity-50' 
                      : 'bg-[#0d1117] border-white/5 hover:border-white/10'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-2 h-2 rounded-full ${
                      proc.status === 'terminated' ? 'bg-rose-500' :
                      proc.type === 'system' ? 'bg-purple-400 shadow-[0_0_6px_rgba(168,85,247,0.5)]' :
                      proc.type === 'user' ? 'bg-emerald-400 shadow-[0_0_6px_rgba(52,211,153,0.5)]' : 
                      'bg-rose-400 animate-pulse shadow-[0_0_6px_rgba(244,63,94,0.5)]'
                    }`} />
                    <div className="flex flex-col">
                      <span className="text-xs font-bold text-white/90">{proc.name}</span>
                      <span className="text-[9px] text-white/30 font-mono">PID: {proc.id} • {proc.virtualPages.join(', ')}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    <div className="flex flex-col items-end">
                      <span className="text-[8px] text-white/20 uppercase font-bold">Physical Maps</span>
                      <span className="text-[10px] font-mono text-white/40">
                        {proc.status === 'terminated' ? 'DEALLOCATED' : proc.physicalPages.map(p => `f${p}`).join(', ')}
                      </span>
                    </div>
                    <div className={`px-1.5 py-0.5 rounded text-[8px] font-extrabold uppercase ${
                      proc.status === 'terminated' ? 'bg-rose-500/10 text-rose-400' :
                      proc.type === 'system' ? 'bg-purple-500/10 text-purple-400' :
                      proc.type === 'user' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-rose-500/10 text-rose-400'
                    }`}>
                      {proc.status}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Physical RAM Map Grid Visualizer (32 frames) */}
          <div className="flex flex-col gap-3">
            <div className="flex justify-between items-center">
              <span className="text-[10px] text-white/30 uppercase font-bold tracking-wider">Physical System RAM Allocation</span>
              <span className="text-[9px] text-white/40">Total Frames: 32 ({pageSize === 4 ? '128KB' : '64MB'} RAM)</span>
            </div>

            <div className="grid grid-cols-8 gap-2">
              {physicalRAM.map((ownerId, index) => {
                const isSelected = selectedPhysicalBlock === index;
                const owner = processes.find(p => p.id === ownerId);
                
                let bgClass = 'bg-white/2 border-white/5 hover:bg-white/5';
                let textClass = 'text-white/20';
                
                if (ownerId === 0) {
                  bgClass = 'bg-slate-700/30 border-slate-700/50 text-slate-400';
                } else if (ownerId === -2) {
                  bgClass = 'bg-blue-500/20 border-blue-500/40 text-blue-400 animate-pulse';
                } else if (owner) {
                  if (owner.type === 'system') {
                    bgClass = 'bg-purple-500/15 border-purple-500/30 text-purple-400';
                  } else if (owner.type === 'user') {
                    bgClass = 'bg-emerald-500/15 border-emerald-500/30 text-emerald-400';
                  } else {
                    bgClass = 'bg-rose-500/15 border-rose-500/30 text-rose-400';
                  }
                }

                return (
                  <button
                    key={index}
                    onClick={() => setSelectedPhysicalBlock(isSelected ? null : index)}
                    className={`h-9 rounded-lg border text-[10px] font-mono font-bold flex flex-col items-center justify-center transition-all ${bgClass} ${
                      isSelected ? 'ring-2 ring-blue-500 border-transparent scale-105 z-10 shadow-lg shadow-blue-500/10' : ''
                    }`}
                    title={
                      ownerId === 0 ? 'Kernel Reserved Page' :
                      ownerId === -2 ? 'Shared Zero-Copy Page Reference' :
                      owner ? `${owner.name} Frame` : 'Free Memory Block'
                    }
                  >
                    <span>f{index}</span>
                    <span className="text-[7px] opacity-40">
                      {ownerId === 0 ? 'SYS' : ownerId === -2 ? 'SHM' : ownerId === -1 ? 'FREE' : ownerId}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Selected Block Info Panel */}
            <AnimatePresence>
              {selectedPhysicalBlock !== null && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="bg-[#0d1117] p-3 rounded-xl border border-white/5 text-xs flex flex-col gap-1 overflow-hidden"
                >
                  <div className="flex justify-between font-bold">
                    <span>Physical Frame f{selectedPhysicalBlock} Address</span>
                    <span className="text-blue-400">0x{selectedPhysicalBlock.toString(16).toUpperCase().padStart(4, '0')}</span>
                  </div>
                  <p className="text-[11px] text-white/50">
                    {physicalRAM[selectedPhysicalBlock] === 0 ? 'Fully locked page containing core scheduler and file table pointers.' :
                     physicalRAM[selectedPhysicalBlock] === -2 ? 'Shared ring-buffer mapped context used for zero-copy packet flow.' :
                     physicalRAM[selectedPhysicalBlock] === -1 ? 'Unallocated memory page frame. Ready for allocation requests.' :
                     `Currently mapped to ${processes.find(p => p.id === physicalRAM[selectedPhysicalBlock])?.name || 'Unknown Process'}.`}
                  </p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Malicious Exploit Security Testing Switchboard */}
          <div className="bg-[#0d1117] p-4 rounded-2xl border border-white/5 flex flex-col gap-4">
            <div className="flex justify-between items-center">
              <div className="flex flex-col">
                <span className="text-xs font-bold text-white/90">Boundary Leak Tester</span>
                <span className="text-[10px] text-white/40">Verify segment shield integrity against hostile scripts</span>
              </div>
              <span className={`px-2 py-0.5 rounded text-[9px] font-extrabold uppercase ${
                exploitStatus === 'prevented' ? 'bg-emerald-500/10 text-emerald-400' :
                exploitStatus === 'breached' ? 'bg-rose-500/10 text-rose-400 animate-pulse' :
                'bg-slate-500/10 text-slate-400'
              }`}>
                {exploitStatus === 'prevented' ? 'Shielded' : exploitStatus === 'breached' ? 'Breached' : 'Awaiting Test'}
              </span>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={handleSimulateExploit}
                disabled={exploitStatus === 'running' || processes.find(p => p.id === 512)?.status === 'terminated'}
                className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all ${
                  processes.find(p => p.id === 512)?.status === 'terminated'
                    ? 'bg-rose-500/10 text-rose-400/40 border border-rose-500/10 cursor-not-allowed'
                    : exploitStatus === 'running'
                    ? 'bg-rose-500/20 text-rose-400 cursor-wait'
                    : 'bg-rose-600 text-white hover:bg-rose-700 shadow-lg shadow-rose-500/5'
                }`}
              >
                {exploitStatus === 'running' ? 'Scanning memory address space...' : 'Trigger Memory Leak Exploit'}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Silicon-Agnostic Driver Framework (SADF) Dashboard */}
      <div className="bg-[#161b22] border border-white/5 rounded-3xl p-6 flex flex-col gap-6 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-48 h-48 bg-emerald-500/2 rounded-full blur-3xl pointer-events-none" />
        
        {/* Section Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/5 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
              <Wrench size={20} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-semibold uppercase tracking-wider text-white">Silicon-Agnostic Driver Framework (SADF)</h3>
                <span className="px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-400 text-[8px] font-bold uppercase tracking-wider">
                  HAL v3.0
                </span>
              </div>
              <p className="text-xs text-white/40">Compile once, execute securely on any CPU/NPU architecture without platform modifications</p>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <span className="text-xs text-white/40">Active Silicon ISA:</span>
            <div className="flex bg-[#0d1117] p-1 rounded-xl border border-white/5">
              {(['arm64', 'x86_64', 'riscv', 'tpu'] as const).map(arch => (
                <button
                  key={arch}
                  onClick={() => setActiveArch(arch)}
                  className={`px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase transition-all ${
                    activeArch === arch 
                      ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' 
                      : 'text-white/40 hover:text-white/70 border border-transparent'
                  }`}
                >
                  {arch}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Inner Grid layout */}
        <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
          {/* Driver Selector & Stats - 4 cols */}
          <div className="xl:col-span-4 flex flex-col gap-4">
            <span className="text-[10px] text-white/30 uppercase font-bold tracking-wider">Unified Driver Catalog</span>
            <div className="flex flex-col gap-2.5">
              {drivers.map(drv => {
                const isSelected = selectedDriverId === drv.id;
                return (
                  <div
                    key={drv.id}
                    onClick={() => {
                      if (!isCompilingDriver) {
                        setSelectedDriverId(drv.id);
                      }
                    }}
                    className={`p-3 rounded-2xl border transition-all cursor-pointer flex flex-col gap-2 ${
                      isSelected 
                        ? 'bg-emerald-500/5 border-emerald-500/30 shadow-lg shadow-emerald-500/2' 
                        : 'bg-[#0d1117]/60 border-white/5 hover:border-white/10 hover:bg-[#0d1117]'
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-2.5">
                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                          drv.type === 'network' ? 'bg-blue-500/10 text-blue-400' :
                          drv.type === 'storage' ? 'bg-amber-500/10 text-amber-400' :
                          drv.type === 'display' ? 'bg-purple-500/10 text-purple-400' :
                          drv.type === 'input' ? 'bg-rose-500/10 text-rose-400' :
                          'bg-emerald-500/10 text-emerald-400'
                        }`}>
                          {drv.type === 'network' && <ArrowLeftRight size={16} />}
                          {drv.type === 'storage' && <HardDrive size={16} />}
                          {drv.type === 'display' && <Sliders size={16} />}
                          {drv.type === 'accelerator' && <Cpu size={16} />}
                          {drv.type === 'input' && <MousePointer size={16} />}
                        </div>
                        <div className="flex flex-col">
                          <span className="text-xs font-bold text-white/90">{drv.name}</span>
                          <span className="text-[9px] text-white/30 font-mono">IRQ {drv.irqs} • {drv.baseAddress}</span>
                        </div>
                      </div>
                      <span className={`px-1.5 py-0.5 rounded text-[8px] font-bold uppercase tracking-wider ${
                        drv.status === 'loaded' ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/20' : 'bg-white/5 text-white/30'
                      }`}>
                        {drv.status}
                      </span>
                    </div>

                    {drv.status === 'loaded' && (
                      <div className="flex items-center justify-between border-t border-white/5 pt-2 mt-1 text-[10px] text-white/40">
                        <span className="flex items-center gap-1 font-mono">
                          <Activity size={10} className="text-emerald-400 animate-pulse" />
                          {drv.transactionsCount.toLocaleString()} xfers
                        </span>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleTriggerHardwareInterrupt(drv);
                          }}
                          className="px-2 py-0.5 rounded bg-white/5 text-white/70 hover:bg-white/10 text-[9px] font-semibold border border-white/5"
                        >
                          Trigger IRQ
                        </button>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Code Editor & Architecture Translation - 8 cols */}
          <div className="xl:col-span-8 flex flex-col lg:grid lg:grid-cols-2 gap-6 bg-[#0d1117] p-5 rounded-3xl border border-white/5">
            {/* Unified Agnostic Code */}
            <div className="flex flex-col gap-3">
              <div className="flex items-center justify-between">
                <span className="text-[10px] text-white/30 uppercase font-bold tracking-wider flex items-center gap-1.5">
                  <Code2 size={12} className="text-emerald-400" />
                  Unified SADF Code
                </span>
                <span className="text-[9px] text-emerald-400/70 font-mono">Hardware Independent API</span>
              </div>
              <textarea
                value={driverAgnosticCode}
                onChange={(e) => setDriverAgnosticCode(e.target.value)}
                disabled={isCompilingDriver}
                className="w-full flex-1 min-h-[160px] lg:h-56 bg-[#090d11] border border-white/5 rounded-xl p-3 text-[11px] font-mono text-emerald-400/90 leading-normal focus:outline-none focus:border-emerald-500/40 resize-none no-scrollbar shadow-inner"
              />
              <button
                onClick={handleCompileAndHotplug}
                disabled={isCompilingDriver}
                className={`w-full py-2.5 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all ${
                  isCompilingDriver 
                    ? 'bg-emerald-500/10 text-emerald-400/50 cursor-not-allowed border border-emerald-500/20' 
                    : 'bg-emerald-500 text-slate-900 hover:bg-emerald-400 font-bold hover:scale-[1.01] shadow-lg shadow-emerald-500/10'
                }`}
              >
                {isCompilingDriver ? (
                  <>
                    <RefreshCw size={14} className="animate-spin" />
                    Compiling Bytecode...
                  </>
                ) : (
                  <>
                    <Wrench size={14} />
                    Compile & Hotplug to {activeArch.toUpperCase()}
                  </>
                )}
              </button>
            </div>

            {/* Compiled Assembly Translation */}
            <div className="flex flex-col gap-3">
              <div className="flex items-center justify-between">
                <span className="text-[10px] text-white/30 uppercase font-bold tracking-wider flex items-center gap-1.5">
                  <Cpu size={12} className="text-blue-400" />
                  ISA Machine Translation
                </span>
                <span className="text-[9px] text-blue-400/70 font-mono">Ring-0 Assembly Output</span>
              </div>

              {/* Compilation console output or static assembly */}
              <div className="flex-1 min-h-[200px] lg:h-full bg-[#090d11] border border-white/5 rounded-xl p-4 font-mono text-[10px] flex flex-col gap-1.5 overflow-y-auto no-scrollbar shadow-inner">
                {isCompilingDriver ? (
                  <div className="flex flex-col gap-1 text-emerald-500/80">
                    {compilerLogs.map((log, index) => (
                      <motion.div
                        key={index}
                        initial={{ opacity: 0, x: -5 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.1 }}
                      >
                        {log}
                      </motion.div>
                    ))}
                    <div className="h-4 flex items-center gap-1.5 mt-2">
                      <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
                      <span className="text-emerald-500/50 text-[9px]">Laying platform segments...</span>
                    </div>
                  </div>
                ) : (
                  <div className="text-slate-400/90 leading-relaxed">
                    <div className="text-white/20 mb-2 border-b border-white/5 pb-1 flex justify-between items-center text-[9px]">
                      <span>TARGET: {activeArch.toUpperCase()} TRANSLATOR</span>
                      <span>OPTIMIZATION: -O3</span>
                    </div>
                    {activeArch === 'arm64' && (
                      <>
                        <span className="text-blue-400">.global</span> _glass_init<br />
                        _glass_init:<br />
                        &nbsp;&nbsp;<span className="text-purple-400">sub</span> sp, sp, #32 &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<span className="text-slate-600">; Allocate frame</span><br />
                        &nbsp;&nbsp;<span className="text-purple-400">str</span> x30, [sp, #16] &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<span className="text-slate-600">; Save link reg</span><br />
                        &nbsp;&nbsp;<span className="text-purple-400">mov</span> w0, #{drivers.find(d => d.id === selectedDriverId)?.irqs || 9} &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<span className="text-slate-600">; Register interrupt line</span><br />
                        &nbsp;&nbsp;<span className="text-purple-400">adrp</span> x1, _handler@PAGE<br />
                        &nbsp;&nbsp;<span className="text-purple-400">add</span> x1, x1, _handler@PAGEOFF<br />
                        &nbsp;&nbsp;<span className="text-purple-400">bl</span> _glass_map_irq &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<span className="text-slate-600">; HAL vector binding</span><br />
                        &nbsp;&nbsp;<span className="text-purple-400">mov</span> x0, #{drivers.find(d => d.id === selectedDriverId)?.baseAddress || '0x1A4000'}<br />
                        &nbsp;&nbsp;<span className="text-purple-400">bl</span> _glass_dma_alloc &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<span className="text-slate-600">; Agnostic MMU frame pin</span><br />
                        &nbsp;&nbsp;<span className="text-purple-400">ldr</span> x30, [sp, #16] &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<span className="text-slate-600">; Restore stack state</span><br />
                        &nbsp;&nbsp;<span className="text-purple-400">add</span> sp, sp, #32<br />
                        &nbsp;&nbsp;<span className="text-purple-400">ret</span>
                      </>
                    )}
                    {activeArch === 'x86_64' && (
                      <>
                        <span className="text-blue-400">section</span> .text<br />
                        <span className="text-blue-400">global</span> glass_init<br />
                        glass_init:<br />
                        &nbsp;&nbsp;<span className="text-purple-400">push</span> rbp<br />
                        &nbsp;&nbsp;<span className="text-purple-400">mov</span> rbp, rsp<br />
                        &nbsp;&nbsp;<span className="text-purple-400">mov</span> rdi, #{drivers.find(d => d.id === selectedDriverId)?.irqs || 9} &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<span className="text-slate-600">; Syscall IRQ parameter</span><br />
                        &nbsp;&nbsp;<span className="text-purple-400">lea</span> rsi, [rip + network_handler]<br />
                        &nbsp;&nbsp;<span className="text-purple-400">call</span> glass_map_irq &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<span className="text-slate-600">; Global IDT rewrite</span><br />
                        &nbsp;&nbsp;<span className="text-purple-400">mov</span> rdi, #{drivers.find(d => d.id === selectedDriverId)?.baseAddress || '0x1A4000'}<br />
                        &nbsp;&nbsp;<span className="text-purple-400">call</span> glass_dma_alloc &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<span className="text-slate-600">; Map Ring-0 physical frames</span><br />
                        &nbsp;&nbsp;<span className="text-purple-400">pop</span> rbp<br />
                        &nbsp;&nbsp;<span className="text-purple-400">ret</span>
                      </>
                    )}
                    {activeArch === 'riscv' && (
                      <>
                        <span className="text-blue-400">.global</span> glass_init<br />
                        glass_init:<br />
                        &nbsp;&nbsp;<span className="text-purple-400">addi</span> sp, sp, -16 &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<span className="text-slate-600">; Reserve stack index</span><br />
                        &nbsp;&nbsp;<span className="text-purple-400">sd</span> ra, 8(sp) &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<span className="text-slate-600">; Preserve return address</span><br />
                        &nbsp;&nbsp;<span className="text-purple-400">li</span> a0, #{drivers.find(d => d.id === selectedDriverId)?.irqs || 9} &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<span className="text-slate-600">; Load immediate target IRQ</span><br />
                        &nbsp;&nbsp;<span className="text-purple-400">la</span> a1, network_handler<br />
                        &nbsp;&nbsp;<span className="text-purple-400">jal</span> ra, glass_map_irq &nbsp;&nbsp;&nbsp;&nbsp;<span className="text-slate-600">; Map vectorized hardware interrupt</span><br />
                        &nbsp;&nbsp;<span className="text-purple-400">li</span> a0, {drivers.find(d => d.id === selectedDriverId)?.baseAddress || '0x1A4000'}<br />
                        &nbsp;&nbsp;<span className="text-purple-400">jal</span> ra, glass_dma_alloc &nbsp;&nbsp;&nbsp;<span className="text-slate-600">; Standard micro-page map</span><br />
                        &nbsp;&nbsp;<span className="text-purple-400">ld</span> ra, 8(sp)<br />
                        &nbsp;&nbsp;<span className="text-purple-400">addi</span> sp, sp, 16<br />
                        &nbsp;&nbsp;<span className="text-purple-400">ret</span>
                      </>
                    )}
                    {activeArch === 'tpu' && (
                      <>
                        <span className="text-blue-400">; Google Tensor Matrix Vector Core</span><br />
                        <span className="text-blue-400">_tensor_entry</span>:<br />
                        &nbsp;&nbsp;<span className="text-purple-400">vld.u16</span> v0, r0, r1 &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<span className="text-slate-600">; Stream tensor frame addresses</span><br />
                        &nbsp;&nbsp;<span className="text-purple-400">li</span> r14, #{drivers.find(d => d.id === selectedDriverId)?.irqs || 9} &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<span className="text-slate-600">; Tensor IRQ trigger line</span><br />
                        &nbsp;&nbsp;<span className="text-purple-400">vmapirq</span> r14, _tensor_callback<br />
                        &nbsp;&nbsp;<span className="text-purple-400">vdma_set</span> v0, #{drivers.find(d => d.id === selectedDriverId)?.baseAddress || '0x1A4000'}<br />
                        &nbsp;&nbsp;<span className="text-purple-400">vflush</span> matrix_buffer &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<span className="text-slate-600">; Atomic VLIW vector block pipeline</span><br />
                        &nbsp;&nbsp;<span className="text-purple-400">tcall</span> #0x3 &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<span className="text-slate-600">; Deep learning scheduler yield</span><br />
                        &nbsp;&nbsp;<span className="text-purple-400">ret</span>
                      </>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Settings Tuning Panel & Live Kernel Logging Console */}
      <div className="bg-[#161b22] border border-white/5 rounded-3xl p-6 flex flex-col gap-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Terminal size={18} className="text-blue-400" />
            <h3 className="text-sm font-semibold uppercase tracking-wider">Kernel Console Logging Interface</h3>
          </div>
          
          {/* Hardware Parameters Tuner */}
          <div className="flex items-center gap-4 text-xs">
            <div className="flex items-center gap-2">
              <Sliders size={12} className="text-white/40" />
              <span className="text-white/40">Page Size:</span>
              <select 
                value={pageSize} 
                onChange={(e) => {
                  const size = Number(e.target.value) as 4 | 2048 | 1048576;
                  setPageSize(size);
                  addKernelLog(
                    'info', 
                    'MMU', 
                    `Kernel page segment mapping resized to ${size === 4 ? '4KB Standard Pages' : size === 2048 ? '2MB Huge Pages' : '1GB Giant Pages'}.`
                  );
                }}
                className="bg-[#0d1117] border border-white/10 rounded-lg py-1 px-2 text-white text-[11px] font-semibold focus:outline-none focus:border-blue-500"
              >
                <option value="4">4 KB (Standard)</option>
                <option value="2048">2 MB (Huge Pages)</option>
                <option value="1048576">1 GB (Giant Pages)</option>
              </select>
            </div>

            <button 
              onClick={() => setKernelLogs([])}
              className="text-white/30 hover:text-white/60 transition-colors text-[10px] font-bold uppercase"
            >
              Clear Logs
            </button>
          </div>
        </div>

        {/* Live Logs console stream */}
        <div 
          ref={logRef}
          className="bg-[#0d1117] border border-white/5 rounded-2xl p-4 h-48 overflow-y-auto font-mono text-[11px] flex flex-col gap-1.5 no-scrollbar shadow-inner"
        >
          {kernelLogs.length === 0 ? (
            <div className="h-full flex items-center justify-center text-white/20 select-none">
              Awaiting virtual memory bus telemetry...
            </div>
          ) : (
            kernelLogs.map((log) => (
              <div key={log.id} className="flex gap-3 hover:bg-white/2 p-1 rounded transition-all">
                <span className="text-white/20">{log.timestamp}</span>
                <span className={`font-bold ${
                  log.type === 'success' ? 'text-emerald-400' :
                  log.type === 'warning' ? 'text-amber-400' :
                  log.type === 'error' ? 'text-rose-400' : 'text-blue-400'
                }`}>
                  [{log.source}]
                </span>
                <span className="text-white/70 flex-1">{log.message}</span>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
