import React, { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Shield, ShieldAlert, ShieldCheck, Bug, Search, Trash2, 
  RefreshCw, FileArchive, FolderArchive, Key, Eye, EyeOff, 
  Lock, Unlock, FileText, Terminal, AlertTriangle, Cpu, Folder, Check
} from 'lucide-react';

interface ProtocolsDashboardProps {
  fs: any[];
  setFs: React.Dispatch<React.SetStateAction<any[]>>;
  fsLib: any;
  addNotification: (app: string, message: string, type: 'success' | 'info' | 'warning' | 'error') => void;
  cpuUsage: number;
  ramUsage: number;
}

// Interactive viruses for AV Protection Protocol (AVPP)
interface SimulatedVirus {
  name: string;
  hash: string;
  severity: 'critical' | 'high' | 'medium';
  target: 'MMU' | 'IPC' | 'SADF' | 'FS';
  description: string;
  status: 'active' | 'quarantined' | 'neutralized' | 'not_detected';
}

// GSC (Glass Secure Compression) Dictionary
const COMPRESSION_DICTIONARY: Record<string, string> = {
  " the ": " \u0001 ",
  " and ": " \u0002 ",
  " system ": " \u0003 ",
  " kernel ": " \u0004 ",
  " driver ": " \u0005 ",
  " GlassOS ": " \u0006 ",
  " Administrator ": " \u0007 ",
  " Documents ": " \u0008 ",
  " security ": " \u0009 ",
  " protection ": " \u000a ",
  " protocol ": " \u000b ",
  " intrusive ": " \u000c ",
  " signature ": " \u000d ",
  " quarantine ": " \u000e",
  " vulnerability ": " \u000f ",
};

export function ProtocolsDashboard({
  fs,
  setFs,
  fsLib,
  addNotification,
  cpuUsage,
  ramUsage
}: ProtocolsDashboardProps) {
  // Current Selected Section inside Protocols dashboard ('av' or 'compression')
  const [panelTab, setPanelTab] = useState<'av' | 'compression'>('av');

  // -------------------------------------------------------------
  // Antivirus Protection Protocol (AVPP) States & Logic
  // -------------------------------------------------------------
  const [viruses, setViruses] = useState<SimulatedVirus[]>([
    { name: 'StuxOS-X', hash: '0x8F3D11A290FF', severity: 'critical', target: 'SADF', description: 'Injects dummy instructions into hotplug compiled drivers to overflow IRQ vector table.', status: 'not_detected' },
    { name: 'SADF-Overflower', hash: '0x2C4B7E9A102D', severity: 'high', target: 'SADF', description: 'Bypasses pointer sandboxing to rewrite driver base addresses in live kernel space.', status: 'not_detected' },
    { name: 'HoloCrypt-Ransomware', hash: '0x7E1D88FF330A', severity: 'critical', target: 'MMU', description: 'Attempts to intercept Ring-0 secure enclaves and encrypt AuthService segment keys.', status: 'not_detected' },
    { name: 'ZeroCopy-Snooper', hash: '0x5C921AA0E87F', severity: 'medium', target: 'IPC', description: 'Monitors the memory bus during zero-copy page flips to leak active transaction buffers.', status: 'not_detected' },
    { name: 'IRQ-Flooder', hash: '0x9A3B5C7D2E1F', severity: 'high', target: 'IPC', description: 'Triggers hardware interrupts sequentially at high frequencies, crashing the central scheduler.', status: 'not_detected' }
  ]);

  const [avScanStatus, setAvScanStatus] = useState<'idle' | 'scanning' | 'clean' | 'threat_detected'>('idle');
  const [scanProgress, setScanProgress] = useState<number>(0);
  const [currentScanningItem, setCurrentScanningItem] = useState<string>('');
  const [activeShieldActive, setActiveShieldActive] = useState<boolean>(true);
  const [heuristicsEnabled, setHeuristicsEnabled] = useState<boolean>(true);
  const [selectedLogPath, setSelectedLogPath] = useState<string | null>(null);

  const scanTargets = [
    '/sys/kernel/core_scheduler.bin',
    '/sys/kernel/mmu_translator.bin',
    '/sys/drivers/net0_controller.sadf',
    '/sys/drivers/store0_storage.sadf',
    '/sys/drivers/gpu0_holographic.sadf',
    '/sys/enclave/holocrypt_keys.secure',
    '/sys/bus/zerocopy_ipc_pipeline',
    '/sys/bin/auth_service',
    '/sys/ram/frame_table_0x03',
    '/sys/ram/frame_table_0x14',
    '/sys/devices/pointer_hid'
  ];

  // Helper to ensure logs folder exists and retrieve log files
  const logsPath = 'home/Administrator/logs';

  const scanLogs = useMemo(() => {
    if (!fsLib) return [];
    try {
      if (!fsLib.exists(logsPath)) {
        fsLib.mkdir(logsPath);
      }
      return fsLib.list(logsPath).filter((item: any) => item.type === 'file' && item.name.endsWith('.log'));
    } catch (e) {
      return [];
    }
  }, [fs, fsLib]);

  // Selected Log File Raw Content
  const selectedLogContent = useMemo(() => {
    if (!fsLib || !selectedLogPath) return null;
    try {
      return fsLib.read(selectedLogPath);
    } catch (e) {
      return 'Failed to read log content.';
    }
  }, [selectedLogPath, fs]);

  const handleStartAvScan = () => {
    if (avScanStatus === 'scanning') return;
    setAvScanStatus('scanning');
    setScanProgress(0);
    
    let index = 0;
    const interval = setInterval(() => {
      if (index < scanTargets.length) {
        setCurrentScanningItem(scanTargets[index]);
        setScanProgress(Math.floor(((index + 1) / scanTargets.length) * 100));
        index++;
      } else {
        clearInterval(interval);
        setCurrentScanningItem('');
        setScanProgress(100);
        
        // Determine scan result
        const activeThreats = viruses.filter(v => v.status === 'active');
        const hasThreats = activeThreats.length > 0;
        
        if (hasThreats) {
          setAvScanStatus('threat_detected');
          addNotification('AVPP Core', `Detected ${activeThreats.length} severe kernel threats! Log written to /logs.`, 'error');
        } else {
          setAvScanStatus('clean');
          addNotification('AVPP Core', 'System integrity scan complete. 0 threats found.', 'success');
        }

        // Generate scan log in the logs folder
        saveScanLogToFile(activeThreats);
      }
    }, 200);
  };

  const saveScanLogToFile = (threatsFound: SimulatedVirus[]) => {
    if (!fsLib) return;
    
    try {
      if (!fsLib.exists(logsPath)) {
        fsLib.mkdir(logsPath);
      }
      
      const now = new Date();
      const formattedDate = now.toLocaleString();
      const fileSafeTimestamp = now.toISOString().replace(/[:.]/g, '-');
      const filename = `scan_report_${fileSafeTimestamp}.log`;
      const filePath = `${logsPath}/${filename}`;
      
      let logContent = `==================================================\n`;
      logContent += `GLASSOS KERNEL INTEGRITY & AVPP SCAN REPORT\n`;
      logContent += `==================================================\n`;
      logContent += `Timestamp: ${formattedDate}\n`;
      logContent += `Scan Status: ${threatsFound.length > 0 ? 'WARNING (Threats Found)' : 'NOMINAL (System Clean)'}\n`;
      logContent += `Active Shield Status: ${activeShieldActive ? 'ON' : 'OFF'}\n`;
      logContent += `Heuristics Engine: ${heuristicsEnabled ? 'ENABLED' : 'DISABLED'}\n`;
      logContent += `Total Files Scanned: ${scanTargets.length}\n`;
      logContent += `--------------------------------------------------\n`;
      logContent += `SCAN TARGETS VERIFIED:\n`;
      scanTargets.forEach(target => {
        logContent += `  [OK] ${target}\n`;
      });
      logContent += `--------------------------------------------------\n`;
      logContent += `THREAT DETECTION DETAILS:\n`;
      
      if (threatsFound.length === 0) {
        logContent += `  No active virus signatures detected.\n`;
        logContent += `  All Ring-0 driver enclaves fully validated and clean.\n`;
      } else {
        logContent += `  ⚠️ Detected ${threatsFound.length} severe active system threat(s):\n\n`;
        threatsFound.forEach((threat, i) => {
          logContent += `  [THREAT #${i+1}]\n`;
          logContent += `    Name: ${threat.name}\n`;
          logContent += `    Signature Hash: ${threat.hash}\n`;
          logContent += `    Severity: ${threat.severity.toUpperCase()}\n`;
          logContent += `    Target Layer: ${threat.target}\n`;
          logContent += `    Description: ${threat.description}\n`;
          logContent += `    Status: ${threat.status.toUpperCase()}\n\n`;
        });
      }
      
      logContent += `==================================================\n`;
      logContent += `Log produced by GlassOS AVPP Security Daemon.\n`;
      logContent += `==================================================\n`;
      
      fsLib.write(filePath, logContent);
    } catch (e) {
      console.error('Failed to write scan log', e);
    }
  };

  const handleSimulateInfection = (virusName: string) => {
    if (activeShieldActive && heuristicsEnabled) {
      addNotification('Heuristics Shield', `Intercepted and quarantined ${virusName} intrusion!`, 'success');
      setViruses(prev => prev.map(v => v.name === virusName ? { ...v, status: 'quarantined' } : v));
      return;
    }
    
    setViruses(prev => prev.map(v => v.name === virusName ? { ...v, status: 'active' } : v));
    addNotification('Kernel Warning', `Kernel space infected with ${virusName}! Run system scan immediately.`, 'error');
  };

  const handleNeutralizeThreat = (virusName: string) => {
    setViruses(prev => prev.map(v => v.name === virusName ? { ...v, status: 'neutralized' } : v));
    addNotification('AVPP Core', `Threat neutralized: ${virusName} has been purged.`, 'success');
    
    setTimeout(() => {
      setViruses(prev => {
        const remaining = prev.filter(v => v.status === 'active');
        if (remaining.length === 0) {
          setAvScanStatus('idle');
        }
        return prev;
      });
    }, 100);
  };

  const handleResetAv = () => {
    setViruses(prev => prev.map(v => ({ ...v, status: 'not_detected' })));
    setAvScanStatus('idle');
    setScanProgress(0);
    setSelectedLogPath(null);
    addNotification('AVPP Core', 'Security database reset. Threat log cleared.', 'info');
  };

  // -------------------------------------------------------------
  // File Compression & Encryption Protocol (FCEP) Logic
  // -------------------------------------------------------------
  const [selectedCompressFile, setSelectedCompressFile] = useState<string>('');
  const [compressPassword, setCompressPassword] = useState<string>('');
  const [showCompressPass, setShowCompressPass] = useState<boolean>(false);
  const [compressAlg, setCompressAlg] = useState<string>('GSC-Dict');
  const [compressCipher, setCompressCipher] = useState<string>('AES-XOR-256');
  const [compressLevel, setCompressLevel] = useState<'standard' | 'high' | 'ultra'>('standard');
  const [compressStatus, setCompressStatus] = useState<'idle' | 'processing' | 'success' | 'error'>('idle');
  const [compressionReport, setCompressionReport] = useState<any>(null);

  const [selectedDecompressFile, setSelectedDecompressFile] = useState<string>('');
  const [decompressPassword, setDecompressPassword] = useState<string>('');
  const [showDecompressPass, setShowDecompressPass] = useState<boolean>(false);
  const [decompressStatus, setDecompressStatus] = useState<'idle' | 'processing' | 'success' | 'error'>('idle');
  const [decompressionReport, setDecompressionReport] = useState<any>(null);

  // Crawl virtual filesystem starting from 'home/Administrator'
  const allUserFiles = useMemo(() => {
    if (!fsLib) return [];
    
    const filesList: { path: string; name: string; size: number }[] = [];
    const traverse = (items: any[], currentPath: string) => {
      if (!items) return;
      items.forEach(item => {
        const itemPath = currentPath ? `${currentPath}/${item.name}` : item.name;
        if (item.type === 'file') {
          // Exclude already compressed files and scan logs for cleaner lists
          if (!item.name.endsWith('.gsc') && !item.name.endsWith('.log')) {
            filesList.push({
              path: itemPath,
              name: item.name,
              size: item.content ? item.content.length : (item.size || 0)
            });
          }
        } else if (item.type === 'folder' && item.children) {
          traverse(item.children, itemPath);
        }
      });
    };

    // Find home/Administrator
    try {
      const home = fs.find(i => i.name === 'home');
      if (home && home.children) {
        const admin = home.children.find((i: any) => i.name === 'Administrator');
        if (admin && admin.children) {
          traverse(admin.children, 'home/Administrator');
        }
      }
    } catch (e) {
      // Fallback
      traverse(fs, '');
    }
    return filesList;
  }, [fs, fsLib]);

  // Find all secure archives (*.gsc)
  const compressedFiles = useMemo(() => {
    if (!fsLib) return [];
    
    const gscList: { path: string; name: string }[] = [];
    const traverse = (items: any[], currentPath: string) => {
      if (!items) return;
      items.forEach(item => {
        const itemPath = currentPath ? `${currentPath}/${item.name}` : item.name;
        if (item.type === 'file' && item.name.endsWith('.gsc')) {
          gscList.push({ path: itemPath, name: item.name });
        } else if (item.type === 'folder' && item.children) {
          traverse(item.children, itemPath);
        }
      });
    };

    traverse(fs, '');
    return gscList;
  }, [fs, fsLib]);

  // Execute Compression and XOR encryption
  const handleCompressFile = () => {
    if (!selectedCompressFile || !compressPassword) {
      addNotification('FCEP Core', 'Please select a file and enter a password.', 'warning');
      return;
    }

    setCompressStatus('processing');
    setCompressionReport(null);

    setTimeout(() => {
      try {
        const originalContent = fsLib.read(selectedCompressFile);
        if (originalContent === null) {
          setCompressStatus('error');
          addNotification('FCEP Core', 'Error reading source file.', 'error');
          return;
        }

        // Apply compression and XOR encryption
        let compressedText = originalContent;
        if (compressAlg === 'GSC-Dict') {
          for (const [word, token] of Object.entries(COMPRESSION_DICTIONARY)) {
            compressedText = compressedText.replaceAll(word, token);
          }
        } else if (compressAlg === 'RLE-Fast') {
          let rle = '';
          let count = 1;
          for (let i = 0; i < originalContent.length; i++) {
            if (originalContent[i] === originalContent[i + 1]) {
              count++;
            } else {
              rle += (count > 1 ? count : '') + originalContent[i];
              count = 1;
            }
          }
          compressedText = rle;
        }

        // Apply XOR Encryption
        let encrypted = '';
        for (let i = 0; i < compressedText.length; i++) {
          const charCode = compressedText.charCodeAt(i) ^ compressPassword.charCodeAt(i % compressPassword.length);
          encrypted += String.fromCharCode(charCode);
        }

        // Base64 encode the payload
        const base64Payload = btoa(unescape(encodeURIComponent(encrypted)));

        // Verification token: Encrypt constant "GLASS_SECURE_COMPRESS_OK"
        const verificationStr = "GLASS_SECURE_COMPRESS_OK";
        let encryptedVerify = '';
        for (let i = 0; i < verificationStr.length; i++) {
          const charCode = verificationStr.charCodeAt(i) ^ compressPassword.charCodeAt(i % compressPassword.length);
          encryptedVerify += String.fromCharCode(charCode);
        }
        const verificationToken = btoa(unescape(encodeURIComponent(encryptedVerify)));

        const originalSize = originalContent.length;
        const compressedSize = base64Payload.length;
        const ratio = Math.max(1, Math.round(((originalSize - compressedSize) / originalSize) * 100));

        // Create metadata payload
        const archivePayload = JSON.stringify({
          header: "GSC_SECURE_ARCHIVE_v1",
          originalName: selectedCompressFile.split('/').pop(),
          originalSize,
          compressedSize,
          algorithm: compressAlg,
          cipher: compressCipher,
          verificationToken,
          payload: base64Payload
        }, null, 2);

        // Save compressed archive in the same directory
        const destinationPath = `${selectedCompressFile}.gsc`;
        fsLib.write(destinationPath, archivePayload);

        setCompressionReport({
          src: selectedCompressFile,
          dest: destinationPath,
          originalSize,
          compressedSize,
          ratio,
          algorithm: compressAlg,
          cipher: compressCipher
        });

        setCompressStatus('success');
        setSelectedCompressFile('');
        setCompressPassword('');
        addNotification('FCEP Core', `Successfully compressed and encrypted ${selectedCompressFile.split('/').pop()}!`, 'success');
      } catch (e) {
        setCompressStatus('error');
        addNotification('FCEP Core', 'An error occurred during compression.', 'error');
      }
    }, 800);
  };

  // Execute Decryption and decompression
  const handleDecompressFile = () => {
    if (!selectedDecompressFile || !decompressPassword) {
      addNotification('FCEP Core', 'Please select an archive and enter the decryption password.', 'warning');
      return;
    }

    setDecompressStatus('processing');
    setDecompressionReport(null);

    setTimeout(() => {
      try {
        const rawArchive = fsLib.read(selectedDecompressFile);
        if (!rawArchive) {
          setDecompressStatus('error');
          addNotification('FCEP Core', 'Failed to read secure archive.', 'error');
          return;
        }

        const archive = JSON.parse(rawArchive);
        if (archive.header !== "GSC_SECURE_ARCHIVE_v1") {
          setDecompressStatus('error');
          addNotification('FCEP Core', 'Invalid secure archive format.', 'error');
          return;
        }

        // 1. Password Verification
        const encryptedVerify = decodeURIComponent(escape(atob(archive.verificationToken)));
        let decryptedVerify = '';
        for (let i = 0; i < encryptedVerify.length; i++) {
          const charCode = encryptedVerify.charCodeAt(i) ^ decompressPassword.charCodeAt(i % decompressPassword.length);
          decryptedVerify += String.fromCharCode(charCode);
        }

        if (decryptedVerify !== "GLASS_SECURE_COMPRESS_OK") {
          setDecompressStatus('error');
          addNotification('FCEP Core', 'INVALID PASSWORD: Hash verification token mismatch.', 'error');
          return;
        }

        // 2. Decrypt encrypted payload using XOR
        const encryptedPayload = decodeURIComponent(escape(atob(archive.payload)));
        let decryptedText = '';
        for (let i = 0; i < encryptedPayload.length; i++) {
          const charCode = encryptedPayload.charCodeAt(i) ^ decompressPassword.charCodeAt(i % decompressPassword.length);
          decryptedText += String.fromCharCode(charCode);
        }

        // 3. Decompress decrypted text
        let decompressedContent = decryptedText;
        if (archive.algorithm === 'GSC-Dict') {
          for (const [word, token] of Object.entries(COMPRESSION_DICTIONARY)) {
            decompressedContent = decompressedContent.replaceAll(token, word);
          }
        } else if (archive.algorithm === 'RLE-Fast') {
          let restored = '';
          let countStr = '';
          for (let i = 0; i < decryptedText.length; i++) {
            const char = decryptedText[i];
            if (char >= '0' && char <= '9') {
              countStr += char;
            } else {
              const count = countStr ? parseInt(countStr) : 1;
              restored += char.repeat(count);
              countStr = '';
            }
          }
          decompressedContent = restored;
        }

        // Restore file (remove .gsc, add _extracted suffix to prevent overwrite)
        const originalPath = selectedDecompressFile;
        const dirParts = originalPath.split('/');
        const originalName = dirParts.pop() || '';
        const baseName = originalName.endsWith('.gsc') ? originalName.slice(0, -4) : originalName;
        const dotIndex = baseName.lastIndexOf('.');
        let restoredName = '';
        if (dotIndex !== -1) {
          restoredName = `${baseName.substring(0, dotIndex)}_extracted${baseName.substring(dotIndex)}`;
        } else {
          restoredName = `${baseName}_extracted`;
        }

        const destinationPath = [...dirParts, restoredName].join('/');
        fsLib.write(destinationPath, decompressedContent);

        setDecompressionReport({
          src: selectedDecompressFile,
          dest: destinationPath,
          bytesRestored: decompressedContent.length,
          algorithm: archive.algorithm,
          cipher: archive.cipher
        });

        setDecompressStatus('success');
        setSelectedDecompressFile('');
        setDecompressPassword('');
        addNotification('FCEP Core', `Successfully decrypted and decompressed archive to ${restoredName}!`, 'success');
      } catch (e) {
        setDecompressStatus('error');
        addNotification('FCEP Core', 'Integrity check failed. Payload corrupted or bad password.', 'error');
      }
    }, 800);
  };

  return (
    <div className="flex flex-col gap-6 h-full overflow-y-auto pr-1 no-scrollbar pb-8 p-8">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-white/5 pb-5">
        <div>
          <h2 className="text-xl font-extrabold text-white flex items-center gap-2.5">
            <FolderArchive className="text-blue-500" size={24} />
            Unified Protocols Control Panel
          </h2>
          <p className="text-xs text-white/40">Manage Ring-0 antivirus heuristics scanner logs and file-level encrypted compression protocols.</p>
        </div>

        {/* Dashboard Tabs Toggle */}
        <div className="flex bg-[#0d1117] p-1 rounded-xl border border-white/5 self-start">
          <button
            onClick={() => setPanelTab('av')}
            className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${
              panelTab === 'av' 
                ? 'bg-blue-500 text-white shadow-lg shadow-blue-500/10' 
                : 'text-white/40 hover:text-white/80'
            }`}
          >
            Antivirus Protection (AVPP)
          </button>
          <button
            onClick={() => setPanelTab('compression')}
            className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${
              panelTab === 'compression' 
                ? 'bg-blue-500 text-white shadow-lg shadow-blue-500/10' 
                : 'text-white/40 hover:text-white/80'
            }`}
          >
            Compression & Encryption (FCEP)
          </button>
        </div>
      </div>

      {/* Panel Render Content */}
      <AnimatePresence mode="wait">
        {panelTab === 'av' ? (
          <motion.div
            key="av-panel"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="grid grid-cols-1 xl:grid-cols-12 gap-6"
          >
            {/* Left side: Threat Center & Scanner Controls (7 Columns) */}
            <div className="xl:col-span-7 flex flex-col gap-6">
              
              {/* AV Scan Station Card */}
              <div className="bg-[#161b22] border border-white/5 rounded-3xl p-6 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-36 h-36 bg-blue-500/5 rounded-full blur-3xl pointer-events-none" />
                
                <div className="flex items-center justify-between border-b border-white/5 pb-4 mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400">
                      <Shield size={20} />
                    </div>
                    <div>
                      <h3 className="text-sm font-semibold uppercase tracking-wider text-white">Security Scan Station</h3>
                      <p className="text-[11px] text-white/40">Real-time signature hash auditing daemon</p>
                    </div>
                  </div>

                  <button
                    onClick={handleResetAv}
                    className="text-white/30 hover:text-white/60 transition-colors text-[10px] font-bold uppercase flex items-center gap-1"
                  >
                    <RefreshCw size={10} /> Reset Engine
                  </button>
                </div>

                {/* Status Dashboard Grid */}
                <div className="grid grid-cols-2 gap-4 mb-6">
                  <div className="bg-[#0d1117] p-4 rounded-2xl border border-white/5 flex flex-col justify-between">
                    <span className="text-[10px] text-white/30 uppercase font-semibold">Active Shield Guard</span>
                    <div className="flex items-center justify-between mt-2">
                      <span className={`text-xs font-bold ${activeShieldActive ? 'text-emerald-400' : 'text-rose-400'}`}>
                        {activeShieldActive ? 'SHIELD LOGGED' : 'STANDBY'}
                      </span>
                      <button
                        onClick={() => setActiveShieldActive(!activeShieldActive)}
                        className={`text-[9px] font-bold px-2 py-0.5 rounded uppercase ${
                          activeShieldActive ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                        }`}
                      >
                        {activeShieldActive ? 'ACTIVE' : 'OFF'}
                      </button>
                    </div>
                  </div>

                  <div className="bg-[#0d1117] p-4 rounded-2xl border border-white/5 flex flex-col justify-between">
                    <span className="text-[10px] text-white/30 uppercase font-semibold">Heuristics Engine</span>
                    <div className="flex items-center justify-between mt-2">
                      <span className={`text-xs font-bold ${heuristicsEnabled ? 'text-emerald-400' : 'text-rose-400'}`}>
                        {heuristicsEnabled ? 'DEEP SCAN' : 'SIGNATURE ONLY'}
                      </span>
                      <button
                        onClick={() => setHeuristicsEnabled(!heuristicsEnabled)}
                        className={`text-[9px] font-bold px-2 py-0.5 rounded uppercase ${
                          heuristicsEnabled ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20' : 'bg-white/5 text-white/40 border border-white/15'
                        }`}
                      >
                        {heuristicsEnabled ? 'ON' : 'OFF'}
                      </button>
                    </div>
                  </div>
                </div>

                {/* Scan Terminal */}
                <div className="bg-[#0d1117] p-5 rounded-2xl border border-white/5 min-h-[170px] flex flex-col justify-between overflow-hidden relative">
                  <div className="absolute top-2 left-3 text-[9px] font-mono text-white/20 uppercase tracking-wider flex items-center gap-1">
                    <Terminal size={10} />
                    AVPP_HEURISTIC_DAEMON
                  </div>

                  <div className="flex justify-between items-start mt-4">
                    <div className="flex flex-col">
                      <span className="text-[10px] text-white/30 uppercase">System Health</span>
                      <span className={`text-sm font-bold uppercase tracking-tight flex items-center gap-1.5 ${
                        avScanStatus === 'scanning' ? 'text-blue-400 animate-pulse' :
                        avScanStatus === 'threat_detected' ? 'text-rose-500' :
                        avScanStatus === 'clean' ? 'text-emerald-400' : 'text-white/60'
                      }`}>
                        {avScanStatus === 'scanning' ? 'SCANNING MEMORY SEGMENTS...' :
                         avScanStatus === 'threat_detected' ? '⚠️ EXPLOITS FOUND' :
                         avScanStatus === 'clean' ? '✓ CENTRAL SCHEDULER CLEAN' : 'AWAITING DISPATCH'}
                      </span>
                    </div>
                    {avScanStatus === 'scanning' && (
                      <span className="text-xs font-mono font-bold text-blue-400 bg-blue-500/10 px-2 py-0.5 rounded">
                        {scanProgress}%
                      </span>
                    )}
                  </div>

                  {avScanStatus === 'scanning' ? (
                    <div className="flex flex-col gap-2 my-3">
                      <div className="h-2 bg-white/5 rounded-full overflow-hidden">
                        <motion.div 
                          className="h-full bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.6)]" 
                          style={{ width: `${scanProgress}%` }}
                        />
                      </div>
                      <span className="text-[9px] font-mono text-white/40 truncate">
                        READ_BLOCK_DMA: {currentScanningItem}
                      </span>
                    </div>
                  ) : avScanStatus === 'threat_detected' ? (
                    <div className="my-3 p-3 rounded-xl bg-rose-500/5 border border-rose-500/20 text-[11px] text-rose-400 flex items-center gap-2">
                      <AlertTriangle size={14} className="shrink-0 text-rose-400 animate-bounce" />
                      <span>Signature match detected! Threats logged to /logs. Execute memory purging below.</span>
                    </div>
                  ) : avScanStatus === 'clean' ? (
                    <div className="my-3 p-3 rounded-xl bg-emerald-500/5 border border-emerald-500/20 text-[11px] text-emerald-400 flex items-center gap-2">
                      <ShieldCheck size={14} className="shrink-0 text-emerald-400" />
                      <span>Scan finished. 0 exploits. Log compiled at home/Administrator/logs.</span>
                    </div>
                  ) : (
                    <p className="text-[11px] text-white/30 italic my-3 leading-relaxed">
                      Trigger an out-of-band integrity scan. Any anomalies in hotplug drivers or MMU descriptor tables will be quarantined immediately. Logs will be recorded in the home directory 'logs' folder.
                    </p>
                  )}

                  <button
                    onClick={handleStartAvScan}
                    disabled={avScanStatus === 'scanning'}
                    className={`w-full py-2.5 rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition-all ${
                      avScanStatus === 'scanning'
                        ? 'bg-blue-500/10 text-blue-400/40 border border-blue-500/10 cursor-wait'
                        : 'bg-blue-500 text-white hover:bg-blue-600 hover:scale-[1.01] shadow-lg shadow-blue-500/10'
                    }`}
                  >
                    <Search size={14} />
                    {avScanStatus === 'scanning' ? 'Sweeping Driver Registers...' : 'Initiate Full System Sweep'}
                  </button>
                </div>
              </div>

              {/* Intrusion Payload Simulator */}
              <div className="bg-[#161b22] border border-white/5 rounded-3xl p-6">
                <span className="text-[10px] text-white/30 uppercase font-bold tracking-wider flex items-center gap-1.5 mb-2">
                  <Bug size={12} className="text-rose-400" />
                  Vulnerability Payload Injection Vector
                </span>
                <p className="text-[11px] text-white/50 leading-relaxed mb-4">
                  Test the Heuristic and Active Shield trapping mechanisms. Deactivating Active Shield allows viruses to breach Ring-0 and trigger kernel exceptions.
                </p>

                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {viruses.map(virus => {
                    const isVulnerable = virus.status === 'not_detected';
                    return (
                      <button
                        key={virus.name}
                        onClick={() => handleSimulateInfection(virus.name)}
                        disabled={!isVulnerable || avScanStatus === 'scanning'}
                        className={`py-2 px-3 rounded-xl border text-left transition-all ${
                          !isVulnerable 
                            ? 'bg-[#0d1117]/40 border-white/2 text-white/20 cursor-not-allowed'
                            : 'bg-rose-500/5 hover:bg-rose-500/10 border-rose-500/10 hover:border-rose-500/30 text-rose-400'
                        }`}
                      >
                        <div className="text-[10px] font-bold truncate">+ {virus.name}</div>
                        <div className="text-[8px] opacity-60 uppercase">{virus.severity} ({virus.target})</div>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Right side: Threat Sandbox Registry & Saved Logs (5 Columns) */}
            <div className="xl:col-span-5 flex flex-col gap-6">
              
              {/* Active Threats / Quarantine Zone */}
              <div className="bg-[#161b22] border border-white/5 rounded-3xl p-6 flex flex-col gap-4">
                <h4 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
                  <ShieldAlert size={14} className="text-amber-400 animate-pulse" />
                  Quarantine Isolation Buffer
                </h4>

                <div className="flex flex-col gap-2.5 max-h-[220px] overflow-y-auto no-scrollbar">
                  {viruses.filter(v => v.status !== 'not_detected').length === 0 ? (
                    <div className="py-8 text-center text-[11px] text-white/20 italic border border-dashed border-white/5 rounded-2xl bg-[#0d1117]/30">
                      Quarantine buffer nominal. No suspicious signatures.
                    </div>
                  ) : (
                    viruses.filter(v => v.status !== 'not_detected').map(virus => (
                      <div key={virus.name} className="p-3 bg-[#0d1117] rounded-xl border border-white/5 flex flex-col gap-2 text-[11px]">
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-white">{virus.name}</span>
                          <span className={`px-1.5 py-0.5 rounded text-[8px] font-bold ${
                            virus.status === 'active' ? 'bg-rose-500/10 text-rose-400 animate-pulse' :
                            virus.status === 'quarantined' ? 'bg-amber-500/10 text-amber-400' : 'bg-blue-500/10 text-blue-400'
                          }`}>
                            {virus.status.toUpperCase()}
                          </span>
                        </div>
                        <div className="text-[9px] text-white/40 font-mono">HASH: {virus.hash}</div>
                        
                        {(virus.status === 'active' || virus.status === 'quarantined') && (
                          <button
                            onClick={() => handleNeutralizeThreat(virus.name)}
                            className="mt-1 w-full py-1 rounded bg-blue-500 hover:bg-blue-600 text-white font-bold text-[10px] flex items-center justify-center gap-1 transition-all"
                          >
                            Purge and Neutralize
                          </button>
                        )}
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* Antivirus Scan Logs folder contents */}
              <div className="bg-[#161b22] border border-white/5 rounded-3xl p-6 flex flex-col gap-4">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
                    <Folder size={14} className="text-blue-400" />
                    Security Logs Registry (/logs)
                  </h4>
                  <span className="text-[9px] font-mono text-white/30 bg-[#0d1117] px-2 py-0.5 rounded-full">
                    {scanLogs.length} LOGS
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2 max-h-[140px] overflow-y-auto no-scrollbar">
                  {scanLogs.length === 0 ? (
                    <div className="col-span-2 py-6 text-center text-[10px] text-white/20 italic">
                      No security scan logs found in logs folder.
                    </div>
                  ) : (
                    scanLogs.map((log: any) => {
                      const isSelected = selectedLogPath === `${logsPath}/${log.name}`;
                      return (
                        <button
                          key={log.name}
                          onClick={() => setSelectedLogPath(isSelected ? null : `${logsPath}/${log.name}`)}
                          className={`p-2 rounded-xl text-[10px] border text-left truncate transition-all ${
                            isSelected 
                              ? 'bg-blue-500/10 border-blue-500/30 text-blue-400 font-bold'
                              : 'bg-[#0d1117] border-white/5 hover:border-white/10 text-white/50 hover:text-white/80'
                          }`}
                          title={log.name}
                        >
                          <FileText size={10} className="inline mr-1" />
                          {log.name.replace('scan_report_', '').replace('.log', '')}
                        </button>
                      );
                    })
                  )}
                </div>

                {/* Log File Content Viewer */}
                <AnimatePresence>
                  {selectedLogPath && selectedLogContent && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="overflow-hidden"
                    >
                      <div className="bg-black/40 border border-white/5 p-3 rounded-2xl flex flex-col gap-2 mt-2">
                        <div className="flex items-center justify-between text-[9px] text-white/30 font-mono">
                          <span>FILE: {selectedLogPath.split('/').pop()}</span>
                          <button 
                            onClick={() => setSelectedLogPath(null)}
                            className="hover:text-rose-400 transition-colors"
                          >
                            [CLOSE]
                          </button>
                        </div>
                        <pre className="text-[9px] font-mono leading-relaxed text-blue-400/80 overflow-x-auto max-h-[160px] whitespace-pre p-2 bg-[#05070a] rounded-xl no-scrollbar">
                          {selectedLogContent}
                        </pre>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

            </div>
          </motion.div>
        ) : (
          <motion.div
            key="compression-panel"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="grid grid-cols-1 lg:grid-cols-2 gap-6"
          >
            {/* Left box: Compress and Seal */}
            <div className="bg-[#161b22] border border-white/5 rounded-3xl p-6 flex flex-col gap-5 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-36 h-36 bg-blue-500/5 rounded-full blur-3xl pointer-events-none" />
              
              <div className="flex items-center gap-3 border-b border-white/5 pb-4">
                <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400">
                  <Lock size={18} />
                </div>
                <div>
                  <h3 className="text-sm font-semibold uppercase tracking-wider text-white">Compress & Encrypt Protocol</h3>
                  <p className="text-[11px] text-white/40 font-mono">SGC_PACKING_VECTOR_RING0</p>
                </div>
              </div>

              {/* Compression form */}
              <div className="flex flex-col gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] text-white/40 uppercase font-bold">Select Original File</label>
                  {allUserFiles.length === 0 ? (
                    <div className="py-2.5 px-4 bg-[#0d1117] rounded-xl border border-white/5 text-[11px] text-white/20 italic">
                      No compressible files found in home directory.
                    </div>
                  ) : (
                    <select
                      value={selectedCompressFile}
                      onChange={(e) => setSelectedCompressFile(e.target.value)}
                      className="bg-[#0d1117] text-white text-[11px] py-2.5 px-3 rounded-xl border border-white/5 focus:border-blue-500 focus:outline-none"
                    >
                      <option value="">-- Choose a user file to compress --</option>
                      {allUserFiles.map(file => (
                        <option key={file.path} value={file.path}>
                          {file.path.replace('home/Administrator/', '')} ({file.size} bytes)
                        </option>
                      ))}
                    </select>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[10px] text-white/40 uppercase font-bold">Compression Level</label>
                    <select
                      value={compressLevel}
                      onChange={(e: any) => setCompressLevel(e.target.value)}
                      className="bg-[#0d1117] text-white text-[11px] py-2 px-2 rounded-xl border border-white/5 focus:border-blue-500 focus:outline-none"
                    >
                      <option value="standard">Standard (~45%)</option>
                      <option value="high">High (~60%)</option>
                      <option value="ultra">Ultra-Heuristic (~75%)</option>
                    </select>
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="text-[10px] text-white/40 uppercase font-bold">Algorithm</label>
                    <select
                      value={compressAlg}
                      onChange={(e) => setCompressAlg(e.target.value)}
                      className="bg-[#0d1117] text-white text-[11px] py-2 px-2 rounded-xl border border-white/5 focus:border-blue-500 focus:outline-none"
                    >
                      <option value="GSC-Dict">GSC-Dictionary</option>
                      <option value="RLE-Fast">RLE-Fast Payload</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[10px] text-white/40 uppercase font-bold">Encryption Cipher</label>
                    <select
                      value={compressCipher}
                      onChange={(e) => setCompressCipher(e.target.value)}
                      className="bg-[#0d1117] text-white text-[11px] py-2 px-2 rounded-xl border border-white/5 focus:focus:border-blue-500 focus:outline-none"
                    >
                      <option value="AES-XOR-256">AES-XOR-256</option>
                      <option value="ChaCha-Glass-128">ChaCha-Glass-128</option>
                      <option value="DES-Enclave-56">DES-Enclave-56</option>
                    </select>
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="text-[10px] text-white/40 uppercase font-bold">Encryption Password</label>
                    <div className="relative">
                      <input
                        type={showCompressPass ? 'text' : 'password'}
                        placeholder="Set Secure Passphrase"
                        value={compressPassword}
                        onChange={(e) => setCompressPassword(e.target.value)}
                        className="w-full bg-[#0d1117] text-white text-[11px] py-2 pl-3 pr-8 rounded-xl border border-white/5 focus:border-blue-500 focus:outline-none"
                      />
                      <button
                        onClick={() => setShowCompressPass(!showCompressPass)}
                        className="absolute right-2.5 top-2 text-white/30 hover:text-white/60 transition-colors"
                      >
                        {showCompressPass ? <EyeOff size={11} /> : <Eye size={11} />}
                      </button>
                    </div>
                  </div>
                </div>

                <button
                  onClick={handleCompressFile}
                  disabled={compressStatus === 'processing' || !selectedCompressFile || !compressPassword}
                  className={`w-full py-2.5 rounded-xl font-bold text-xs flex items-center justify-center gap-2 mt-2 transition-all ${
                    compressStatus === 'processing'
                      ? 'bg-blue-500/20 text-blue-400 cursor-wait'
                      : 'bg-blue-500 text-white hover:bg-blue-600 shadow-lg shadow-blue-500/10 hover:scale-[1.01]'
                  }`}
                >
                  <FileArchive size={14} />
                  {compressStatus === 'processing' ? 'Compressing Ring-0 Blocks...' : 'Seal & Compress File'}
                </button>
              </div>

              {/* Compression Report */}
              <AnimatePresence>
                {compressStatus === 'success' && compressionReport && (
                  <motion.div
                    initial={{ opacity: 0, y: 5 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    className="p-4 bg-emerald-500/5 border border-emerald-500/20 rounded-2xl text-[11px] text-emerald-400 leading-relaxed flex flex-col gap-1.5 font-mono"
                  >
                    <div className="flex items-center gap-1 font-bold text-white uppercase text-[10px]">
                      <Check size={12} className="text-emerald-400" />
                      COMPRESSION REPORT GENERATED
                    </div>
                    <div>Source File: <span className="text-white">{compressionReport.src.split('/').pop()}</span></div>
                    <div>Output: <span className="text-white">{compressionReport.dest.split('/').pop()}</span></div>
                    <div>Original: <span className="text-white">{compressionReport.originalSize} B</span> | Compressed: <span className="text-white">{compressionReport.compressedSize} B</span></div>
                    <div className="font-bold">Space Savings Ratio: <span className="text-white bg-emerald-500/20 px-1.5 py-0.5 rounded">{compressionReport.ratio}%</span></div>
                    <div className="text-[9px] text-emerald-400/50 mt-1 uppercase">VERIFICATION TOKEN EMBEDDED SUCCESSFULLY.</div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Right box: Decrypt and Extract */}
            <div className="bg-[#161b22] border border-white/5 rounded-3xl p-6 flex flex-col gap-5 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-36 h-36 bg-blue-500/5 rounded-full blur-3xl pointer-events-none" />

              <div className="flex items-center gap-3 border-b border-white/5 pb-4">
                <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400">
                  <Unlock size={18} />
                </div>
                <div>
                  <h3 className="text-sm font-semibold uppercase tracking-wider text-white">Decompress & Decrypt Protocol</h3>
                  <p className="text-[11px] text-white/40 font-mono">SGC_DECOMPRESS_INTERFACE</p>
                </div>
              </div>

              {/* Decompression form */}
              <div className="flex flex-col gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] text-white/40 uppercase font-bold">Select .gsc Archive</label>
                  {compressedFiles.length === 0 ? (
                    <div className="py-2.5 px-4 bg-[#0d1117] rounded-xl border border-white/5 text-[11px] text-white/20 italic">
                      No secure .gsc archives detected in workspace.
                    </div>
                  ) : (
                    <select
                      value={selectedDecompressFile}
                      onChange={(e) => setSelectedDecompressFile(e.target.value)}
                      className="bg-[#0d1117] text-white text-[11px] py-2.5 px-3 rounded-xl border border-white/5 focus:border-blue-500 focus:outline-none"
                    >
                      <option value="">-- Choose a compressed archive --</option>
                      {compressedFiles.map(file => (
                        <option key={file.path} value={file.path}>
                          {file.path}
                        </option>
                      ))}
                    </select>
                  )}
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] text-white/40 uppercase font-bold">Decryption Password</label>
                  <div className="relative">
                    <input
                      type={showDecompressPass ? 'text' : 'password'}
                      placeholder="Enter Password to Unlock Payload"
                      value={decompressPassword}
                      onChange={(e) => setDecompressPassword(e.target.value)}
                      className="w-full bg-[#0d1117] text-white text-[11px] py-2.5 pl-3 pr-8 rounded-xl border border-white/5 focus:border-blue-500 focus:outline-none"
                    />
                    <button
                      onClick={() => setShowDecompressPass(!showDecompressPass)}
                      className="absolute right-2.5 top-2.5 text-white/30 hover:text-white/60 transition-colors"
                    >
                      {showDecompressPass ? <EyeOff size={11} /> : <Eye size={11} />}
                    </button>
                  </div>
                </div>

                <button
                  onClick={handleDecompressFile}
                  disabled={decompressStatus === 'processing' || !selectedDecompressFile || !decompressPassword}
                  className={`w-full py-2.5 rounded-xl font-bold text-xs flex items-center justify-center gap-2 mt-2 transition-all ${
                    decompressStatus === 'processing'
                      ? 'bg-blue-500/20 text-blue-400 cursor-wait'
                      : 'bg-blue-500 text-white hover:bg-blue-600 shadow-lg shadow-blue-500/10 hover:scale-[1.01]'
                  }`}
                >
                  <Unlock size={14} />
                  {decompressStatus === 'processing' ? 'Reversing Ring-0 Descriptors...' : 'Decrypt & Decompress File'}
                </button>
              </div>

              {/* Decompression Report */}
              <AnimatePresence>
                {decompressStatus === 'success' && decompressionReport && (
                  <motion.div
                    initial={{ opacity: 0, y: 5 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    className="p-4 bg-emerald-500/5 border border-emerald-500/20 rounded-2xl text-[11px] text-emerald-400 leading-relaxed flex flex-col gap-1.5 font-mono"
                  >
                    <div className="flex items-center gap-1 font-bold text-white uppercase text-[10px]">
                      <Check size={12} className="text-emerald-400" />
                      DECOMPRESSION REPORT GENERATED
                    </div>
                    <div>Source Archive: <span className="text-white">{decompressionReport.src.split('/').pop()}</span></div>
                    <div>Restored File: <span className="text-white">{decompressionReport.dest.split('/').pop()}</span></div>
                    <div>Restored Size: <span className="text-white">{decompressionReport.bytesRestored} Bytes</span></div>
                    <div>Algorithm: <span className="text-white uppercase">{decompressionReport.algorithm}</span></div>
                    <div>Decryption: <span className="text-white uppercase">{decompressionReport.cipher} OK</span></div>
                    <div className="text-[9px] text-emerald-400/50 mt-1 uppercase">INTEGRITY CHECK PASSED. FILE RESTORED SUCCESSFULLY.</div>
                  </motion.div>
                )}
              </AnimatePresence>

              {decompressStatus === 'error' && (
                <div className="p-3 bg-rose-500/5 border border-rose-500/20 rounded-2xl text-[10px] text-rose-400 flex items-center gap-2 font-mono">
                  <AlertTriangle size={14} className="shrink-0 text-rose-400" />
                  <span>HASH VERIFICATION MISMATCH: Invalid password or payload tampering detected.</span>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
