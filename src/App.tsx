/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef, useMemo } from 'react';
import { 
  Monitor, 
  Terminal as TerminalIcon, 
  Settings as SettingsIcon, 
  Folder, 
  Globe, 
  Image as ImageIcon, 
  FileText, 
  Music, 
  X, 
  Minus, 
  Maximize2, 
  Search, 
  Wifi, 
  Battery, 
  Clock, 
  User, 
  ChevronRight, 
  Play, 
  Pause, 
  SkipBack, 
  SkipForward,
  Cpu,
  HardDrive,
  Code,
  Package,
  Check,
  RefreshCw,
  Plus,
  Trash2,
  FileCode,
  Box,
  Activity,
  Save,
  Send,
  Upload,
  Download,
  MoreVertical,
  FilePlus,
  FileJson,
  FileText as FileTextIcon,
  Server,
  Palette,
  Info,
  AlertCircle,
  CheckCircle2,
  Edit2,
  Trash,
  Printer,
  LogOut,
  Scissors,
  Copy,
  Clipboard,
  MousePointer2,
  Bug,
  StepForward,
  Square,
  ChevronDown,
  Power,
  Shield,
  Mouse,
  Keyboard,
  Smartphone,
  Printer as PrinterIcon,
  Lock,
  Volume2,
  Type,
  Eye,
  Share2,
  Bell,
  Layers,
  Command,
  LayoutGrid,
  Mail
} from 'lucide-react';
import { motion, AnimatePresence, useDragControls } from 'motion/react';

// --- Types ---

type AppId = 'terminal' | 'settings' | 'notepad' | 'browser' | 'photos' | 'music' | 'appfolder' | 'codestudio' | 'files' | 'systemmonitor' | string;

interface WindowState {
  id: AppId;
  title: string;
  isOpen: boolean;
  isMinimized: boolean;
  isMaximized: boolean;
  zIndex: number;
  x: number;
  y: number;
  width: number;
  height: number;
  restoreData?: { x: number, y: number, width: number, height: number };
}

interface Permissions {
  owner: { r: boolean; w: boolean; x: boolean };
  group: { r: boolean; w: boolean; x: boolean };
  others: { r: boolean; w: boolean; x: boolean };
}

interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  timestamp: Date;
}

interface ContextMenuItem {
  label: string;
  icon?: React.ReactNode;
  onClick: () => void;
  variant?: 'default' | 'danger';
}

interface FileSystemItem {
  name: string;
  type: 'file' | 'folder';
  content?: string;
  children?: FileSystemItem[];
  permissions?: Permissions;
}

interface BrainscriptBuild {
  name: string;
  arch: string;
  timestamp: string;
  size: string;
  type: '8-bit' | '16-bit' | '32-bit' | '64-bit';
}

interface ScheduledTask {
  id: string;
  name: string;
  type: 'app' | 'command';
  target: string;
  time: string;
  repeat: 'once' | 'daily';
  lastRun?: string;
  enabled: boolean;
}

// --- Constants ---

const WALLPAPERS = [
  'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=1920&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1620641788421-7a1c342ea42e?q=80&w=1920&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1635776062127-d379bfcba9f8?q=80&w=1920&auto=format&fit=crop',
];

const DEFAULT_PERMISSIONS: Permissions = {
  owner: { r: true, w: true, x: true },
  group: { r: true, w: false, x: true },
  others: { r: true, w: false, x: false },
};

const INITIAL_FS: FileSystemItem[] = [
  {
    name: 'Documents',
    type: 'folder',
    permissions: DEFAULT_PERMISSIONS,
    children: [
      { name: 'welcome.txt', type: 'file', content: 'Welcome to GlassOS!', permissions: DEFAULT_PERMISSIONS },
      { name: 'version.txt', type: 'file', content: 'GlassOS v1.0.0 - Kernel: React 19', permissions: DEFAULT_PERMISSIONS },
    ],
  },
  {
    name: 'Pictures',
    type: 'folder',
    permissions: DEFAULT_PERMISSIONS,
    children: [
      { name: 'wallpaper.jpg', type: 'file', permissions: DEFAULT_PERMISSIONS },
    ],
  },
  {
    name: 'System',
    type: 'folder',
    permissions: {
      owner: { r: true, w: true, x: true },
      group: { r: true, w: false, x: false },
      others: { r: false, w: false, x: false },
    },
    children: [
      { name: 'kernel.sys', type: 'file', content: 'BINARY_DATA', permissions: {
        owner: { r: true, w: true, x: true },
        group: { r: true, w: false, x: false },
        others: { r: false, w: false, x: false },
      }},
    ],
  },
  {
    name: 'Trash',
    type: 'folder',
    permissions: DEFAULT_PERMISSIONS,
    children: [],
  },
];

// --- Utilities ---

const cn = (...classes: (string | boolean | undefined)[]) => classes.filter(Boolean).join(' ');

// --- Components ---

export default function App() {
  const [windows, setWindows] = useState<WindowState[]>([]);
  const [activeWindow, setActiveWindow] = useState<AppId | null>(null);
  const [wallpaper, setWallpaper] = useState(WALLPAPERS[0]);
  const [userName, setUserName] = useState('Guest User');
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [networkStatus, setNetworkStatus] = useState<'connected' | 'disconnected' | 'connecting'>('connected');
  const [connectedNetwork, setConnectedNetwork] = useState('GlassFiber_5G');
  const [installedApps, setInstalledApps] = useState<AppId[]>(['terminal', 'settings', 'notepad', 'browser', 'photos', 'music', 'appfolder', 'codestudio', 'files', 'systemmonitor']);
  const [notepadContent, setNotepadContent] = useState('');
  const [activeFileInNotepad, setActiveFileInNotepad] = useState<{name: string, path: string[]} | null>(null);
  const [fs, setFs] = useState<FileSystemItem[]>(INITIAL_FS);
  const [builds, setBuilds] = useState<BrainscriptBuild[]>([]);
  const [tasks, setTasks] = useState<ScheduledTask[]>([]);
  const [cpuUsage, setCpuUsage] = useState(0);
  const [ramUsage, setRamUsage] = useState(0);
  const [isStartMenuOpen, setIsStartMenuOpen] = useState(false);
  const [startSearch, setStartSearch] = useState('');
  const [activeScreensaver, setActiveScreensaver] = useState<string | null>(null);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [notificationHistory, setNotificationHistory] = useState<Notification[]>([]);
  const [isNotificationSidebarOpen, setIsNotificationSidebarOpen] = useState(false);
  const [isGlobalSearchOpen, setIsGlobalSearchOpen] = useState(false);
  const [globalSearchQuery, setGlobalSearchQuery] = useState('');
  const [clipboardHistory, setClipboardHistory] = useState<string[]>([]);
  const [isClipboardOpen, setIsClipboardOpen] = useState(false);
  const [contextMenu, setContextMenu] = useState<{ x: number, y: number, items: ContextMenuItem[] } | null>(null);
  const [isAltTabOpen, setIsAltTabOpen] = useState(false);
  const [isQuickSettingsOpen, setIsQuickSettingsOpen] = useState(false);
  const desktopRef = useRef<HTMLDivElement>(null);

  // Persistence
  useEffect(() => {
    const savedName = localStorage.getItem('glassos_username');
    if (savedName) setUserName(savedName);
    
    const savedWallpaper = localStorage.getItem('glassos_wallpaper');
    if (savedWallpaper) setWallpaper(savedWallpaper);

    const savedNotepad = localStorage.getItem('glassos_notepad');
    if (savedNotepad) setNotepadContent(savedNotepad);

    const savedBuilds = localStorage.getItem('glassos_builds');
    if (savedBuilds) setBuilds(JSON.parse(savedBuilds));

    const savedTasks = localStorage.getItem('glassos_tasks');
    if (savedTasks) setTasks(JSON.parse(savedTasks));

    const savedFs = localStorage.getItem('glassos_fs');
    if (savedFs) setFs(JSON.parse(savedFs));

    const savedWindows = localStorage.getItem('glassos_windows');
    if (savedWindows) setWindows(JSON.parse(savedWindows));

    const savedClipboard = localStorage.getItem('glassos_clipboard');
    if (savedClipboard) setClipboardHistory(JSON.parse(savedClipboard));

    const savedActiveWindow = localStorage.getItem('glassos_active_window');
    if (savedActiveWindow) setActiveWindow(savedActiveWindow as AppId);
  }, []);

  // Global Clipboard Listener
  useEffect(() => {
    const handleCopy = () => {
      // Small delay to let the browser update the clipboard
      setTimeout(() => {
        navigator.clipboard.readText().then(text => {
          if (text && text.trim()) {
            setClipboardHistory(prev => {
              const filtered = prev.filter(item => item !== text);
              return [text, ...filtered].slice(0, 50);
            });
          }
        }).catch(() => {
          // Fallback: Try to get selection if clipboard API fails
          const selection = window.getSelection()?.toString();
          if (selection && selection.trim()) {
            setClipboardHistory(prev => {
              const filtered = prev.filter(item => item !== selection);
              return [selection, ...filtered].slice(0, 50);
            });
          }
        });
      }, 100);
    };

    window.addEventListener('copy', handleCopy);
    return () => window.removeEventListener('copy', handleCopy);
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setCpuUsage(Math.floor(Math.random() * 15) + 5);
      setRamUsage(Math.floor(Math.random() * 5) + 42);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  // Background Task Runner
  useEffect(() => {
    const interval = setInterval(() => {
      const now = new Date();
      const currentTime = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
      const today = now.toDateString();

      setTasks(prev => {
        let changed = false;
        const nextTasks = prev.map(task => {
          if (task.enabled && task.time === currentTime && task.lastRun !== today) {
            changed = true;
            console.log(`[Task Scheduler] Running task: ${task.name}`);
            
            if (task.type === 'app') {
              openWindow(task.target as AppId, task.target.charAt(0).toUpperCase() + task.target.slice(1));
            } else {
              // Simulated command execution
              // We could add to terminal history if we had a global way to target sessions
            }

            return { 
              ...task, 
              lastRun: today,
              enabled: task.repeat === 'daily' ? true : false 
            };
          }
          return task;
        });
        return changed ? nextTasks : prev;
      });
    }, 10000); // Check every 10 seconds

    return () => clearInterval(interval);
  }, [tasks]);

  // Global Keyboard Listeners
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Win + D (Show Desktop)
      if (e.metaKey && e.key === 'd') {
        e.preventDefault();
        setWindows(prev => prev.map(w => ({ ...w, isMinimized: true })));
        addNotification('System', 'Showing Desktop', 'info');
      }
      
      // Alt + Tab (Switch Windows)
      if (e.altKey && e.key === 'Tab') {
        e.preventDefault();
        setIsAltTabOpen(true);
      }

      // Win + L (Logout/Lock)
      if (e.metaKey && e.key === 'l') {
        e.preventDefault();
        handleLogout();
      }

      // Cmd + K (Global Search)
      if (e.metaKey && e.key === 'k') {
        e.preventDefault();
        setIsGlobalSearchOpen(true);
      }

      // Win + V (Clipboard Manager)
      if (e.metaKey && e.key === 'v') {
        e.preventDefault();
        setIsClipboardOpen(true);
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.key === 'Alt') {
        setIsAltTabOpen(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [windows]);

  useEffect(() => {
    localStorage.setItem('glassos_username', userName);
    localStorage.setItem('glassos_wallpaper', wallpaper);
    localStorage.setItem('glassos_notepad', notepadContent);
    localStorage.setItem('glassos_builds', JSON.stringify(builds));
    localStorage.setItem('glassos_tasks', JSON.stringify(tasks));
    localStorage.setItem('glassos_fs', JSON.stringify(fs));
    localStorage.setItem('glassos_windows', JSON.stringify(windows));
    localStorage.setItem('glassos_clipboard', JSON.stringify(clipboardHistory));
    if (activeWindow) {
      localStorage.setItem('glassos_active_window', activeWindow);
    } else {
      localStorage.removeItem('glassos_active_window');
    }
  }, [userName, wallpaper, notepadContent, builds, fs, windows, activeWindow]);

  const openWindow = (id: AppId, title: string) => {
    const existing = windows.find(w => w.id === id);
    const maxZ = Math.max(0, ...windows.map(w => w.zIndex));

    if (existing) {
      setWindows(prev => prev.map(w => w.id === id ? { ...w, isMinimized: false, zIndex: maxZ + 1 } : w));
      setActiveWindow(id);
      return;
    }

    const newWindow: WindowState = {
      id,
      title,
      isOpen: true,
      isMinimized: false,
      isMaximized: false,
      zIndex: maxZ + 1,
      x: 100 + (windows.length % 10) * 30,
      y: 100 + (windows.length % 10) * 30,
      width: id === 'codestudio' ? 1000 : 600,
      height: id === 'codestudio' ? 700 : 400,
    };

    setWindows(prev => [...prev, newWindow]);
    setActiveWindow(id);
  };

  const closeWindow = (id: AppId) => {
    const win = windows.find(w => w.id === id);
    setWindows(prev => prev.filter(w => w.id !== id));
    if (activeWindow === id) setActiveWindow(null);
    if (win) addNotification('System', `Closed ${win.title}`, 'info');
  };

  const minimizeWindow = (id: AppId) => {
    const win = windows.find(w => w.id === id);
    setWindows(prev => prev.map(w => w.id === id ? { ...w, isMinimized: true } : w));
    setActiveWindow(null);
    if (win) addNotification('System', `${win.title} minimized`, 'info');
  };

  const focusWindow = (id: AppId) => {
    setWindows(prev => {
      const maxZ = Math.max(0, ...prev.map(w => w.zIndex));
      return prev.map(w => w.id === id ? { ...w, zIndex: maxZ + 1, isMinimized: false } : w);
    });
    setActiveWindow(id);
  };

  const toggleMaximize = (id: AppId) => {
    setWindows(prev => prev.map(w => {
      if (w.id === id) {
        if (w.isMaximized) {
          addNotification('System', `${w.title} restored`, 'info');
          return {
            ...w,
            isMaximized: false,
            ...(w.restoreData || {})
          };
        } else {
          addNotification('System', `${w.title} maximized`, 'info');
          return {
            ...w,
            isMaximized: true,
            restoreData: { x: w.x, y: w.y, width: w.width, height: w.height },
            x: 0,
            y: 0,
            width: window.innerWidth,
            height: window.innerHeight - 48 // Subtract taskbar height
          };
        }
      }
      return w;
    }));
  };

  const updateWindowPos = (id: AppId, x: number, y: number) => {
    setWindows(prev => prev.map(w => w.id === id ? { ...w, x, y } : w));
  };

  const updateWindowSize = (id: AppId, width: number, height: number) => {
    setWindows(prev => prev.map(w => w.id === id ? { ...w, width, height } : w));
  };

  const addNotification = (title: string, message: string, type: Notification['type'] = 'info') => {
    const id = Math.random().toString(36).substr(2, 9);
    const newNotification: Notification = { id, title, message, type, timestamp: new Date() };
    setNotifications(prev => [newNotification, ...prev].slice(0, 5));
    setNotificationHistory(prev => [newNotification, ...prev]);
    setTimeout(() => {
      setNotifications(prev => prev.filter(n => n.id !== id));
    }, 5000);
  };

  const handleLogout = () => {
    setIsLoggingOut(true);
    setWindows([]);
    setTimeout(() => {
      setIsLoggingOut(false);
      setUserName('Guest User');
    }, 2000);
  };

  useEffect(() => {
    const checkTasks = setInterval(() => {
      const now = new Date();
      const currentTime = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false });
      
      tasks.forEach(task => {
        if (task.enabled && task.time === currentTime) {
          addNotification('Task Scheduler', `Running task: ${task.name}`, 'info');
          if (task.type === 'app') {
            const app = installedApps.find(a => a.id === task.target);
            if (app) {
              openWindow(task.target as AppId, task.target.charAt(0).toUpperCase() + task.target.slice(1));
            } else {
              addNotification('System', `Scheduled app not found: ${task.target}`, 'error');
            }
          } else if (task.type === 'screensaver') {
            setActiveScreensaver(task.target);
          }
          
          // If repeat is 'once', disable it
          if (task.repeat === 'once') {
            setTasks(prev => prev.map(t => t.id === task.id ? { ...t, enabled: false } : t));
          }
        }
      });
    }, 60000); // Check every minute

    return () => clearInterval(checkTasks);
  }, [tasks]);

  if (isLoggingOut) {
    return (
      <div className="fixed inset-0 bg-black flex flex-col items-center justify-center z-[9999]">
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center"
        >
          <div className="w-24 h-24 rounded-full bg-white/10 flex items-center justify-center mb-6 mx-auto">
            <User size={48} className="text-white/50" />
          </div>
          <h1 className="text-3xl font-light mb-2">Logging out...</h1>
          <p className="text-white/40">Saving your session</p>
        </motion.div>
      </div>
    );
  }

  return (
    <div 
      ref={desktopRef}
      className="h-screen w-screen relative overflow-hidden select-none"
      style={{ backgroundImage: `url(${wallpaper})` }}
      onContextMenu={(e) => {
        e.preventDefault();
        setContextMenu({
          x: e.clientX,
          y: e.clientY,
          items: [
            { label: 'New Folder', icon: <Folder size={14} />, onClick: () => addNotification('System', 'Feature coming soon', 'info') },
            { label: 'Change Wallpaper', icon: <Palette size={14} />, onClick: () => openWindow('settings', 'Settings') },
            { label: 'Display Settings', icon: <Monitor size={14} />, onClick: () => openWindow('settings', 'Settings') },
            { label: 'Refresh Desktop', icon: <RefreshCw size={14} />, onClick: () => addNotification('System', 'Desktop refreshed', 'success') },
            { label: 'Logout', icon: <Power size={14} />, onClick: handleLogout, variant: 'danger' },
          ]
        });
      }}
    >
      {/* Desktop Icons */}
      <div className="absolute top-0 left-0 p-6 grid grid-flow-col grid-rows-6 gap-6 z-0">
        <DesktopIcon icon={<TerminalIcon />} label="Terminal" onClick={() => openWindow('terminal', 'Terminal')} />
        <DesktopIcon icon={<Folder />} label="Files" onClick={() => openWindow('files', 'File Explorer')} />
        <DesktopIcon icon={<Globe />} label="Browser" onClick={() => openWindow('browser', 'Web Browser')} />
        <DesktopIcon icon={<ImageIcon />} label="Photos" onClick={() => openWindow('photos', 'Photos')} />
        <DesktopIcon icon={<FileText />} label="Notepad" onClick={() => openWindow('notepad', 'Notepad')} />
        <DesktopIcon icon={<Music />} label="Music" onClick={() => openWindow('music', 'Media Player')} />
        <DesktopIcon icon={<Package />} label="App Folder" onClick={() => openWindow('appfolder', 'App Folder')} />
        <DesktopIcon icon={<Code />} label="Code Studio" onClick={() => openWindow('codestudio', 'Code Studio - main.b')} />
        <DesktopIcon icon={<Clipboard />} label="Clipboard" onClick={() => setIsClipboardOpen(true)} />
        <DesktopIcon icon={<Activity />} label="Sys Monitor" onClick={() => openWindow('systemmonitor', 'System Monitor')} />
        <DesktopIcon icon={<SettingsIcon />} label="Settings" onClick={() => openWindow('settings', 'Settings')} />
      </div>

      {/* Windows */}
      <AnimatePresence>
        {windows.map(win => (
          <Window 
            key={win.id}
            win={win}
            isActive={activeWindow === win.id}
            dragConstraints={desktopRef}
            onFocus={() => focusWindow(win.id)}
            onClose={() => closeWindow(win.id)}
            onMinimize={() => minimizeWindow(win.id)}
            onMaximize={() => toggleMaximize(win.id)}
            onResize={(w: number, h: number) => updateWindowSize(win.id, w, h)}
            onDragEnd={(x: number, y: number) => updateWindowPos(win.id, x, y)}
          >
            {renderApp(win.id, { 
              userName, setUserName, 
              wallpaper, setWallpaper, 
              handleLogout,
              networkStatus, setNetworkStatus,
              connectedNetwork, setConnectedNetwork,
              notepadContent, setNotepadContent,
              activeFileInNotepad, setActiveFileInNotepad,
              builds, setBuilds,
              openWindow,
              fs,
              setFs,
              tasks,
              setTasks,
              setActiveScreensaver,
              setContextMenu,
              addNotification,
              cpuUsage,
              ramUsage,
              clipboardHistory,
              setClipboardHistory,
              closeWindow
            })}
          </Window>
        ))}
      </AnimatePresence>

      {/* Start Menu Overlay */}
      <AnimatePresence>
        {isStartMenuOpen && (
          <>
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsStartMenuOpen(false)}
              className="fixed inset-0 z-[900] bg-black/10 backdrop-blur-[2px]"
            />
            <motion.div
              initial={{ opacity: 0, y: 100, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 100, scale: 0.95 }}
              className="fixed bottom-16 left-4 w-[480px] h-[580px] z-[1000] glass-dark rounded-2xl border border-white/20 shadow-2xl overflow-hidden flex flex-col"
            >
              {/* Search Bar */}
              <div className="p-6 pb-4">
                <div className="relative group">
                  <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-white/30 group-focus-within:text-blue-400 transition-colors" />
                  <input 
                    autoFocus
                    type="text"
                    placeholder="Search apps, files, and settings..."
                    className="w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-12 pr-4 text-sm outline-none focus:bg-white/10 focus:border-blue-500/50 transition-all placeholder:text-white/20"
                    value={startSearch}
                    onChange={(e) => setStartSearch(e.target.value)}
                  />
                </div>
              </div>

              {/* Bento Grid */}
              <div className="flex-1 overflow-y-auto px-6 pb-6 space-y-6 no-scrollbar">
                {!startSearch && (
                  <>
                    <div>
                      <h3 className="text-[10px] font-bold text-white/30 uppercase tracking-wider mb-3 px-1">Pinned Apps</h3>
                      <div className="grid grid-cols-4 gap-3">
                        {[
                          { id: 'terminal', label: 'Terminal', color: 'bg-blue-500/20 text-blue-400' },
                          { id: 'files', label: 'Files', color: 'bg-yellow-500/20 text-yellow-400' },
                          { id: 'browser', label: 'Browser', color: 'bg-green-500/20 text-green-400' },
                          { id: 'codestudio', label: 'Code', color: 'bg-purple-500/20 text-purple-400' },
                          { id: 'notepad', label: 'Notepad', color: 'bg-slate-500/20 text-slate-400' },
                          { id: 'photos', label: 'Photos', color: 'bg-pink-500/20 text-pink-400' },
                          { id: 'music', label: 'Music', color: 'bg-orange-500/20 text-orange-400' },
                          { id: 'taskscheduler', label: 'Tasks', color: 'bg-cyan-500/20 text-cyan-400' },
                          { id: 'clipboard', label: 'Clipboard', color: 'bg-indigo-500/20 text-indigo-400' },
                        ].map(app => (
                          <button 
                            key={app.id}
                            onClick={() => {
                              if (app.id === 'clipboard') {
                                setIsClipboardOpen(true);
                              } else {
                                openWindow(app.id as AppId, app.label);
                              }
                              setIsStartMenuOpen(false);
                            }}
                            className="flex flex-col items-center gap-2 p-3 rounded-xl hover:bg-white/10 transition-all group"
                          >
                            <div className={cn("w-10 h-10 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform", app.color)}>
                              {app.id === 'clipboard' ? <Clipboard size={20} /> : getAppIcon(app.id as AppId, 20)}
                            </div>
                            <span className="text-[10px] font-medium text-white/70">{app.label}</span>
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="glass p-4 rounded-2xl flex flex-col justify-between h-32">
                        <div className="flex items-center justify-between">
                          <Cpu size={18} className="text-blue-400" />
                          <span className="text-[10px] font-bold text-white/30 uppercase">CPU</span>
                        </div>
                        <div className="text-2xl font-light">{cpuUsage}%</div>
                        <div className="w-full h-1 bg-white/10 rounded-full overflow-hidden">
                          <motion.div 
                            animate={{ width: `${cpuUsage}%` }}
                            className="h-full bg-blue-400"
                          />
                        </div>
                      </div>
                      <div className="glass p-4 rounded-2xl flex flex-col justify-between h-32">
                        <div className="flex items-center justify-between">
                          <Activity size={18} className="text-purple-400" />
                          <span className="text-[10px] font-bold text-white/30 uppercase">RAM</span>
                        </div>
                        <div className="text-2xl font-light">{ramUsage}%</div>
                        <div className="w-full h-1 bg-white/10 rounded-full overflow-hidden">
                          <motion.div 
                            animate={{ width: `${ramUsage}%` }}
                            className="h-full bg-purple-400"
                          />
                        </div>
                      </div>
                    </div>

                    <div>
                      <h3 className="text-[10px] font-bold text-white/30 uppercase tracking-wider mb-3 px-1">Recent Activity</h3>
                      <div className="space-y-1">
                        {fs.slice(0, 3).map(item => (
                          <button 
                            key={item.name}
                            onClick={() => {
                              openWindow('files', 'File Explorer');
                              setIsStartMenuOpen(false);
                            }}
                            className="w-full flex items-center gap-3 p-2 rounded-lg hover:bg-white/5 transition-colors group text-left"
                          >
                            <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center text-white/40 group-hover:text-white transition-colors">
                              {item.type === 'folder' ? <Folder size={16} /> : <FileText size={16} />}
                            </div>
                            <div className="flex-1">
                              <div className="text-xs text-white/80">{item.name}</div>
                              <div className="text-[10px] text-white/30">{item.type === 'folder' ? 'Directory' : 'File'} • Just now</div>
                            </div>
                          </button>
                        ))}
                      </div>
                    </div>
                  </>
                )}

                {startSearch && (
                  <div className="space-y-2">
                    <h3 className="text-[10px] font-bold text-white/30 uppercase tracking-wider mb-3 px-1">Search Results</h3>
                    {installedApps.filter(id => id.includes(startSearch.toLowerCase())).map(id => (
                      <button 
                        key={id}
                        onClick={() => {
                          openWindow(id, id.charAt(0).toUpperCase() + id.slice(1));
                          setIsStartMenuOpen(false);
                          setStartSearch('');
                        }}
                        className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-white/10 transition-all text-left"
                      >
                        <div className="w-10 h-10 rounded-lg bg-white/5 flex items-center justify-center text-blue-400">
                          {getAppIcon(id, 20)}
                        </div>
                        <span className="text-sm text-white/80 capitalize">{id}</span>
                      </button>
                    ))}
                    {installedApps.filter(id => id.includes(startSearch.toLowerCase())).length === 0 && (
                      <div className="py-12 text-center text-white/20 text-xs">No apps found matching "{startSearch}"</div>
                    )}
                  </div>
                )}
              </div>

              {/* User Bar */}
              <div className="p-4 bg-white/5 border-t border-white/10 flex items-center justify-between">
                <div className="flex items-center gap-3 px-2">
                  <div className="w-8 h-8 rounded-full bg-blue-500/20 flex items-center justify-center text-blue-400 border border-blue-500/30">
                    <User size={16} />
                  </div>
                  <div className="flex flex-col">
                    <span className="text-xs font-medium text-white/90">{userName}</span>
                    <span className="text-[10px] text-white/40">GlassOS Pro</span>
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  <button 
                    onClick={() => {
                      openWindow('settings', 'Settings');
                      setIsStartMenuOpen(false);
                    }}
                    className="p-2 hover:bg-white/10 rounded-lg transition-colors text-white/60 hover:text-white"
                  >
                    <SettingsIcon size={18} />
                  </button>
                  <button 
                    onClick={handleLogout}
                    className="p-2 hover:bg-red-500/20 rounded-lg transition-colors text-white/60 hover:text-red-400"
                  >
                    <Power size={18} />
                  </button>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Taskbar */}
      <div className="absolute bottom-0 left-0 right-0 h-12 glass-dark flex items-center px-2 gap-2 z-[1000]">
        <button 
          onClick={() => setIsStartMenuOpen(!isStartMenuOpen)}
          className={cn(
            "p-2 rounded-lg transition-all group",
            isStartMenuOpen ? "bg-white/20" : "hover:bg-white/10"
          )}
        >
          <Monitor size={20} className={cn("transition-colors", isStartMenuOpen ? "text-blue-400" : "group-hover:text-blue-400")} />
        </button>
        
        <div className="h-8 w-[1px] bg-white/10 mx-1" />

        {/* Running Apps in Taskbar */}
        <div className="flex-1 flex items-center gap-1 overflow-x-auto no-scrollbar">
          {windows.map(win => (
            <button
              key={win.id}
              onClick={() => win.isMinimized ? focusWindow(win.id) : activeWindow === win.id ? minimizeWindow(win.id) : focusWindow(win.id)}
              className={cn(
                "h-10 px-3 rounded-lg flex items-center gap-2 transition-all min-w-[120px] max-w-[200px]",
                activeWindow === win.id ? "bg-white/20" : "hover:bg-white/10"
              )}
            >
              {getAppIcon(win.id, 16)}
              <span className="text-xs truncate">{win.title}</span>
              {activeWindow === win.id && <div className="absolute bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 bg-blue-400 rounded-full" />}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-4 px-4">
          <div className="flex items-center gap-4 text-white/70 border-r border-white/10 pr-4">
            <div className="flex items-center gap-1.5 group cursor-help" title="CPU Usage">
              <Cpu size={14} className="text-blue-400" />
              <span className="text-[10px] font-mono w-7">{cpuUsage}%</span>
            </div>
            <div className="flex items-center gap-1.5 group cursor-help" title="RAM Usage">
              <Activity size={14} className="text-purple-400" />
              <span className="text-[10px] font-mono w-7">{ramUsage}%</span>
            </div>
          </div>
          <div className="flex items-center gap-2 text-white/70">
            <button 
              onClick={() => setIsNotificationSidebarOpen(!isNotificationSidebarOpen)}
              className={cn(
                "p-2 rounded-lg transition-all relative",
                isNotificationSidebarOpen ? "bg-white/20" : "hover:bg-white/10"
              )}
            >
              <Bell size={16} />
              {notificationHistory.length > 0 && (
                <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 bg-blue-500 rounded-full border border-black" />
              )}
            </button>
            <button 
              onClick={() => setIsQuickSettingsOpen(!isQuickSettingsOpen)}
              className={cn(
                "flex items-center gap-2 px-2 py-1 rounded-lg transition-all",
                isQuickSettingsOpen ? "bg-white/20" : "hover:bg-white/10"
              )}
            >
              <div className="flex items-center gap-1.5 group cursor-help" title={networkStatus === 'connected' ? `Connected to ${connectedNetwork}` : 'Disconnected'}>
                <Wifi size={16} className={networkStatus === 'connected' ? 'text-blue-400' : 'text-red-400'} />
              </div>
              <Battery size={16} />
            </button>
          </div>
          <ClockDisplay />
        </div>
      </div>

      <AnimatePresence>
        {isQuickSettingsOpen && (
          <>
            <div className="fixed inset-0 z-[950]" onClick={() => setIsQuickSettingsOpen(false)} />
            <QuickSettings 
              networkStatus={networkStatus}
              connectedNetwork={connectedNetwork}
              cpuUsage={cpuUsage}
              ramUsage={ramUsage}
              onLogout={handleLogout}
              onSettings={() => { openWindow('settings', 'Settings'); setIsQuickSettingsOpen(false); }}
            />
          </>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {isAltTabOpen && (
          <AltTabSwitcher 
            windows={windows}
            activeWindow={activeWindow}
            onFocus={(id) => { focusWindow(id); setIsAltTabOpen(false); }}
          />
        )}
      </AnimatePresence>

      <NotificationCenter notifications={notifications} />

      <NotificationSidebar 
        history={notificationHistory}
        isOpen={isNotificationSidebarOpen}
        onClose={() => setIsNotificationSidebarOpen(false)}
        onClear={() => setNotificationHistory([])}
      />

      <AnimatePresence>
        {isGlobalSearchOpen && (
          <GlobalSearch 
            query={globalSearchQuery}
            setQuery={setGlobalSearchQuery}
            onClose={() => { setIsGlobalSearchOpen(false); setGlobalSearchQuery(''); }}
            openWindow={openWindow}
            fs={fs}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {isClipboardOpen && (
          <ClipboardManager 
            history={clipboardHistory}
            onClose={() => setIsClipboardOpen(false)}
            onClear={() => setClipboardHistory([])}
            addNotification={addNotification}
          />
        )}
      </AnimatePresence>

      {contextMenu && (
        <ContextMenu 
          x={contextMenu.x}
          y={contextMenu.y}
          items={contextMenu.items}
          onDismiss={() => setContextMenu(null)}
        />
      )}

      <AnimatePresence>
        {activeScreensaver && (
          <Screensaver 
            type={activeScreensaver} 
            onDismiss={() => setActiveScreensaver(null)} 
          />
        )}
      </AnimatePresence>
    </div>
  );
}

// --- Sub-components ---

function DesktopIcon({ icon, label, onClick }: { icon: React.ReactNode, label: string, onClick: () => void }) {
  return (
    <motion.div 
      drag
      dragMomentum={false}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      onClick={onClick}
      className="flex flex-col items-center gap-1 w-20 cursor-pointer group"
    >
      <div className="w-14 h-14 glass rounded-2xl flex items-center justify-center group-hover:bg-white/20 transition-all shadow-lg">
        {React.cloneElement(icon as React.ReactElement, { size: 28, className: "text-white/80" })}
      </div>
      <span className="text-[11px] text-center font-medium drop-shadow-md text-white/90">{label}</span>
    </motion.div>
  );
}

function Window({ win, isActive, onFocus, onClose, onMinimize, onMaximize, onResize, onDragEnd, dragConstraints, children }: any) {
  const controls = useDragControls();
  const resizeRef = useRef<HTMLDivElement>(null);

  if (win.isMinimized) return null;

  const handleResizeDrag = (e: any, info: any) => {
    if (win.isMaximized) return;
    const newWidth = Math.max(300, win.width + info.delta.x);
    const newHeight = Math.max(200, win.height + info.delta.y);
    onResize(newWidth, newHeight);
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9, y: 20 }}
      animate={{ 
        opacity: 1, 
        scale: 1, 
        y: 0,
        width: win.width,
        height: win.height,
        left: win.x,
        top: win.y,
        zIndex: win.zIndex
      }}
      exit={{ opacity: 0, scale: 0.9, y: 20 }}
      transition={{ type: 'spring', damping: 25, stiffness: 300, mass: 0.5 }}
      drag={!win.isMaximized}
      dragMomentum={false}
      dragListener={false}
      dragControls={controls}
      dragConstraints={dragConstraints}
      dragElastic={0}
      onDragEnd={(e, info) => {
        const { x, y } = info.point;
        // We need to calculate the relative position to the desktop
        // But for now, we can just use the delta or the final position if we have it
        // Actually, motion handles the position, but we want to sync it back to state
        // onDragEnd(info.offset.x + win.x, info.offset.y + win.y);
        // A better way is to use the transform values from the element
        const element = e.target as HTMLElement;
        const rect = element.getBoundingClientRect();
        onDragEnd(rect.left, rect.top);
      }}
      onPointerDown={onFocus}
      style={{ 
        position: 'absolute',
        touchAction: 'none'
      }}
      className={cn(
        "glass-dark rounded-xl overflow-hidden flex flex-col shadow-2xl border border-white/20",
        isActive ? "ring-1 ring-white/30" : "opacity-90",
        win.isMaximized ? "rounded-none border-none" : ""
      )}
    >
      {/* Title Bar */}
      <div 
        className="h-12 flex items-center justify-between px-4 cursor-grab active:cursor-grabbing select-none bg-white/5 touch-none"
        onPointerDown={(e) => !win.isMaximized && controls.start(e)}
        onDoubleClick={onMaximize}
      >
        <div className="flex items-center gap-2">
          {getAppIcon(win.id, 14)}
          <span className="text-xs font-medium text-white/70">{win.title}</span>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={onMinimize} className="p-1.5 hover:bg-white/10 rounded-md transition-colors">
            <Minus size={14} />
          </button>
          <button onClick={onMaximize} className="p-1.5 hover:bg-white/10 rounded-md transition-colors">
            <Maximize2 size={14} className={win.isMaximized ? "rotate-180" : ""} />
          </button>
          <button onClick={onClose} className="p-1.5 hover:bg-red-500/50 rounded-md transition-colors">
            <X size={14} />
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-hidden relative">
        {children}
      </div>

      {/* Resize Handle */}
      {!win.isMaximized && (
        <motion.div
          drag
          dragMomentum={false}
          dragElastic={0}
          onDrag={handleResizeDrag}
          onDragEnd={(e) => {
            // Reset the handle position
            if (resizeRef.current) {
              resizeRef.current.style.transform = 'none';
            }
          }}
          className="absolute bottom-0 right-0 w-4 h-4 cursor-nwse-resize z-50 flex items-center justify-center"
          style={{ touchAction: 'none' }}
        >
          <div className="w-1.5 h-1.5 border-r-2 border-b-2 border-white/30 rounded-br-sm" />
        </motion.div>
      )}
    </motion.div>
  );
}

function ClockDisplay() {
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="flex flex-col items-end text-[10px] text-white/70 font-medium">
      <span>{time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
      <span>{time.toLocaleDateString()}</span>
    </div>
  );
}

function ContextMenu({ x, y, items, onDismiss }: { x: number, y: number, items: ContextMenuItem[], onDismiss: () => void }) {
  return (
    <>
      <div className="fixed inset-0 z-[8000]" onClick={onDismiss} onContextMenu={(e) => { e.preventDefault(); onDismiss(); }} />
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="fixed z-[8001] w-48 glass-dark border border-white/10 rounded-xl shadow-2xl py-1.5 overflow-hidden"
        style={{ left: x, top: y }}
      >
        {items.map((item, i) => (
          <button 
            key={i}
            onClick={() => { item.onClick(); onDismiss(); }}
            className={cn(
              "w-full flex items-center gap-3 px-4 py-2 text-[11px] transition-colors",
              item.variant === 'danger' ? "text-red-400 hover:bg-red-500/20" : "text-white/70 hover:bg-white/10 hover:text-white"
            )}
          >
            {item.icon && <span className="opacity-50">{item.icon}</span>}
            {item.label}
          </button>
        ))}
      </motion.div>
    </>
  );
}

function NotificationCenter({ notifications }: { notifications: Notification[] }) {
  return (
    <div className="fixed top-4 right-4 z-[9000] flex flex-col gap-3 pointer-events-none">
      <AnimatePresence>
        {notifications.map(n => (
          <motion.div
            key={n.id}
            initial={{ opacity: 0, x: 100, scale: 0.9 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: 100, scale: 0.9 }}
            className="w-72 glass-dark border border-white/20 rounded-2xl p-4 shadow-2xl pointer-events-auto"
          >
            <div className="flex items-start gap-3">
              <div className={cn(
                "p-2 rounded-xl",
                n.type === 'success' ? "bg-green-500/20 text-green-400" :
                n.type === 'error' ? "bg-red-500/20 text-red-400" :
                n.type === 'warning' ? "bg-yellow-500/20 text-yellow-400" :
                "bg-blue-500/20 text-blue-400"
              )}>
                {n.type === 'success' ? <CheckCircle2 size={18} /> :
                 n.type === 'error' ? <AlertCircle size={18} /> :
                 n.type === 'warning' ? <Info size={18} /> :
                 <Bell size={18} />}
              </div>
              <div className="flex-1">
                <h4 className="text-xs font-bold text-white/90">{n.title}</h4>
                <p className="text-[10px] text-white/40 mt-1 leading-relaxed">{n.message}</p>
              </div>
            </div>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}

function NotificationSidebar({ history, isOpen, onClose, onClear }: { history: Notification[], isOpen: boolean, onClose: () => void, onClear: () => void }) {
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-[1100] bg-black/20 backdrop-blur-[2px]"
          />
          <motion.div
            initial={{ x: 400 }}
            animate={{ x: 0 }}
            exit={{ x: 400 }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed top-0 right-0 bottom-0 w-80 z-[1200] glass-dark border-l border-white/20 shadow-2xl flex flex-col"
          >
            <div className="p-6 border-b border-white/10 flex items-center justify-between">
              <h3 className="text-lg font-medium flex items-center gap-2">
                <Bell size={20} className="text-blue-400" />
                Notifications
              </h3>
              <div className="flex items-center gap-2">
                <button 
                  onClick={onClear}
                  className="p-2 hover:bg-white/10 rounded-lg text-white/40 hover:text-white transition-all"
                  title="Clear All"
                >
                  <Trash2 size={16} />
                </button>
                <button 
                  onClick={onClose}
                  className="p-2 hover:bg-white/10 rounded-lg text-white/40 hover:text-white transition-all"
                >
                  <X size={18} />
                </button>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-3 no-scrollbar">
              {history.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-white/20 gap-4">
                  <Bell size={48} />
                  <p className="text-sm">No notifications</p>
                </div>
              ) : (
                history.map(n => (
                  <div key={n.id} className="glass p-4 rounded-2xl flex flex-col gap-2 group">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className={cn(
                          "w-2 h-2 rounded-full",
                          n.type === 'success' ? "bg-green-500" :
                          n.type === 'error' ? "bg-red-500" :
                          n.type === 'warning' ? "bg-yellow-500" :
                          "bg-blue-500"
                        )} />
                        <span className="text-[10px] font-bold text-white/40 uppercase tracking-wider">{n.title}</span>
                      </div>
                      <span className="text-[9px] text-white/20">{n.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                    </div>
                    <p className="text-xs text-white/70 leading-relaxed">{n.message}</p>
                  </div>
                ))
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

function GlobalSearch({ 
  query, 
  setQuery, 
  onClose, 
  openWindow, 
  fs 
}: { 
  query: string, 
  setQuery: (q: string) => void, 
  onClose: () => void, 
  openWindow: (id: AppId, title: string) => void,
  fs: FileSystemItem[]
}) {
  const allApps = [
    { id: 'terminal', label: 'Terminal', icon: <TerminalIcon size={18} /> },
    { id: 'files', label: 'File Explorer', icon: <Folder size={18} /> },
    { id: 'browser', label: 'Web Browser', icon: <Globe size={18} /> },
    { id: 'photos', label: 'Photos', icon: <ImageIcon size={18} /> },
    { id: 'notepad', label: 'Notepad', icon: <FileText size={18} /> },
    { id: 'music', label: 'Media Player', icon: <Music size={18} /> },
    { id: 'codestudio', label: 'Code Studio', icon: <Code size={18} /> },
    { id: 'settings', label: 'Settings', icon: <SettingsIcon size={18} /> },
    { id: 'systemmonitor', label: 'System Monitor', icon: <Activity size={18} /> },
  ];

  const results = useMemo(() => {
    if (!query.trim()) return [];
    
    const appResults = allApps.filter(app => 
      app.label.toLowerCase().includes(query.toLowerCase())
    ).map(app => ({ ...app, type: 'app' }));

    const findFiles = (items: FileSystemItem[], path: string[] = []): any[] => {
      let found: any[] = [];
      items.forEach(item => {
        if (item.name.toLowerCase().includes(query.toLowerCase())) {
          found.push({ ...item, path, type: 'file' });
        }
        if (item.children) {
          found = [...found, ...findFiles(item.children, [...path, item.name])];
        }
      });
      return found;
    };

    const fileResults = findFiles(fs).slice(0, 5);
    return [...appResults, ...fileResults];
  }, [query, fs]);

  return (
    <div className="fixed inset-0 z-[10000] flex items-start justify-center pt-[15vh]">
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
      />
      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: -20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.9, y: -20 }}
        className="relative w-full max-w-2xl glass-dark rounded-3xl border border-white/20 shadow-2xl overflow-hidden"
      >
        <div className="p-6 flex items-center gap-4 border-b border-white/10">
          <Search size={24} className="text-blue-400" />
          <input 
            autoFocus
            className="flex-1 bg-transparent text-xl outline-none placeholder:text-white/20"
            placeholder="Search apps, files, and settings..."
            value={query}
            onChange={e => setQuery(e.target.value)}
            onKeyDown={e => {
              if (e.key === 'Escape') onClose();
              if (e.key === 'Enter' && results.length > 0) {
                const first = results[0];
                if (first.type === 'app') openWindow(first.id, first.label);
                onClose();
              }
            }}
          />
          <div className="px-2 py-1 rounded-md bg-white/5 border border-white/10 text-[10px] font-bold text-white/30">ESC</div>
        </div>

        <div className="max-h-[400px] overflow-y-auto no-scrollbar">
          {query.trim() === '' ? (
            <div className="p-12 text-center space-y-2">
              <p className="text-white/40 text-sm">Type to start searching...</p>
              <div className="flex items-center justify-center gap-4 text-[10px] text-white/20 uppercase tracking-widest">
                <span>Apps</span>
                <span>•</span>
                <span>Files</span>
                <span>•</span>
                <span>Settings</span>
              </div>
            </div>
          ) : results.length === 0 ? (
            <div className="p-12 text-center">
              <p className="text-white/40 text-sm">No results found for "{query}"</p>
            </div>
          ) : (
            <div className="p-2">
              {results.map((res, i) => (
                <button
                  key={i}
                  onClick={() => {
                    if (res.type === 'app') openWindow(res.id, res.label);
                    onClose();
                  }}
                  className="w-full flex items-center gap-4 p-4 rounded-2xl hover:bg-white/10 transition-all text-left group"
                >
                  <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center text-white/40 group-hover:text-blue-400 transition-colors">
                    {res.type === 'app' ? res.icon : <FileText size={18} />}
                  </div>
                  <div className="flex-1">
                    <h4 className="text-sm font-medium">{res.type === 'app' ? res.label : res.name}</h4>
                    <p className="text-[10px] text-white/30 uppercase tracking-wider">
                      {res.type === 'app' ? 'Application' : `File in /${res.path.join('/')}`}
                    </p>
                  </div>
                  <ChevronRight size={14} className="text-white/10 group-hover:text-white/40" />
                </button>
              ))}
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
}

function ClipboardManager({ 
  history, 
  onClose, 
  onClear, 
  addNotification 
}: { 
  history: string[], 
  onClose: () => void, 
  onClear: () => void,
  addNotification: any
}) {
  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text).then(() => {
      addNotification('Clipboard', 'Item copied to clipboard', 'success');
      onClose();
    });
  };

  return (
    <div className="fixed inset-0 z-[10000] flex items-center justify-center p-4">
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
      />
      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.9, y: 20 }}
        className="relative w-full max-w-md glass-dark rounded-3xl border border-white/20 shadow-2xl overflow-hidden flex flex-col max-h-[70vh]"
      >
        <div className="p-6 border-b border-white/10 flex items-center justify-between">
          <h3 className="text-lg font-medium flex items-center gap-2">
            <Clipboard size={20} className="text-blue-400" />
            Clipboard History
          </h3>
          <div className="flex items-center gap-2">
            <button 
              onClick={onClear}
              className="p-2 hover:bg-white/10 rounded-lg text-white/40 hover:text-white transition-all"
              title="Clear History"
            >
              <Trash2 size={16} />
            </button>
            <button 
              onClick={onClose}
              className="p-2 hover:bg-white/10 rounded-lg text-white/40 hover:text-white transition-all"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-2 no-scrollbar">
          {history.length === 0 ? (
            <div className="h-40 flex flex-col items-center justify-center text-white/20 gap-4">
              <Clipboard size={48} />
              <p className="text-sm">Clipboard is empty</p>
            </div>
          ) : (
            history.map((item, i) => (
              <button
                key={i}
                onClick={() => copyToClipboard(item)}
                className="w-full text-left glass p-4 rounded-2xl hover:bg-white/10 transition-all group relative overflow-hidden"
              >
                <div className="flex items-start justify-between gap-4">
                  <p className="text-xs text-white/70 line-clamp-3 font-mono leading-relaxed">
                    {item}
                  </p>
                  <Copy size={14} className="text-white/10 group-hover:text-blue-400 transition-colors shrink-0" />
                </div>
                <div className="mt-2 flex items-center gap-2">
                  <span className="text-[9px] text-white/20 uppercase tracking-widest">
                    {item.length} characters
                  </span>
                </div>
              </button>
            ))
          )}
        </div>
        
        <div className="p-4 bg-white/5 border-t border-white/10 text-center">
          <p className="text-[10px] text-white/30 uppercase tracking-widest">
            Press <span className="text-white/50 font-bold">Win + V</span> to open this menu
          </p>
        </div>
      </motion.div>
    </div>
  );
}

function AltTabSwitcher({ windows, activeWindow, onFocus }: { windows: WindowState[], activeWindow: AppId | null, onFocus: (id: AppId) => void }) {
  return (
    <div className="fixed inset-0 z-[9500] flex items-center justify-center bg-black/40 backdrop-blur-sm">
      <motion.div 
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="glass-dark border border-white/20 rounded-3xl p-8 shadow-2xl flex gap-6"
      >
        {windows.map(win => (
          <button
            key={win.id}
            onClick={() => onFocus(win.id)}
            className={cn(
              "flex flex-col items-center gap-4 p-6 rounded-2xl transition-all group",
              activeWindow === win.id ? "bg-white/20 scale-110 shadow-xl" : "hover:bg-white/10"
            )}
          >
            <div className={cn(
              "w-16 h-16 rounded-2xl flex items-center justify-center transition-transform group-hover:scale-110",
              activeWindow === win.id ? "bg-blue-500/20 text-blue-400" : "bg-white/5 text-white/40"
            )}>
              {getAppIcon(win.id, 32)}
            </div>
            <span className="text-xs font-medium text-white/80">{win.title}</span>
          </button>
        ))}
        {windows.length === 0 && (
          <div className="text-white/20 text-sm py-8 px-12">No active windows</div>
        )}
      </motion.div>
    </div>
  );
}

function QuickSettings({ 
  networkStatus, 
  connectedNetwork, 
  cpuUsage, 
  ramUsage, 
  onLogout,
  onSettings
}: any) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 20, scale: 0.95 }}
      className="fixed bottom-16 right-4 w-80 glass-dark border border-white/20 rounded-3xl shadow-2xl overflow-hidden z-[1000]"
    >
      <div className="p-6 space-y-6">
        <div className="grid grid-cols-2 gap-3">
          <div className={cn(
            "p-4 rounded-2xl flex flex-col gap-3 transition-colors",
            networkStatus === 'connected' ? "bg-blue-500/20 text-blue-400" : "bg-white/5 text-white/20"
          )}>
            <Wifi size={20} />
            <div className="flex flex-col">
              <span className="text-[10px] font-bold uppercase tracking-wider opacity-50">Network</span>
              <span className="text-xs font-medium truncate">{networkStatus === 'connected' ? connectedNetwork : 'Offline'}</span>
            </div>
          </div>
          <div className="p-4 rounded-2xl bg-white/5 text-white/40 flex flex-col gap-3">
            <Battery size={20} className="text-green-400" />
            <div className="flex flex-col">
              <span className="text-[10px] font-bold uppercase tracking-wider opacity-50">Battery</span>
              <span className="text-xs font-medium">98% • Charging</span>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <div className="space-y-2">
            <div className="flex justify-between text-[10px] font-bold text-white/30 uppercase tracking-wider">
              <span>System Performance</span>
              <span className="text-blue-400">{cpuUsage}% CPU</span>
            </div>
            <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
              <motion.div 
                animate={{ width: `${cpuUsage}%` }}
                className="h-full bg-blue-500"
              />
            </div>
          </div>
          <div className="space-y-2">
            <div className="flex justify-between text-[10px] font-bold text-white/30 uppercase tracking-wider">
              <span>Memory Usage</span>
              <span className="text-purple-400">{ramUsage}% RAM</span>
            </div>
            <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
              <motion.div 
                animate={{ width: `${ramUsage}%` }}
                className="h-full bg-purple-500"
              />
            </div>
          </div>
        </div>

        <div className="flex gap-2">
          <button 
            onClick={onSettings}
            className="flex-1 flex items-center justify-center gap-2 py-3 bg-white/5 hover:bg-white/10 rounded-xl transition-colors text-xs font-medium"
          >
            <SettingsIcon size={14} />
            Settings
          </button>
          <button 
            onClick={onLogout}
            className="flex-1 flex items-center justify-center gap-2 py-3 bg-red-500/10 hover:bg-red-500/20 text-red-400 rounded-xl transition-colors text-xs font-medium"
          >
            <Power size={14} />
            Logout
          </button>
        </div>
      </div>
    </motion.div>
  );
}

function getAppIcon(id: AppId, size: number) {
  switch (id) {
    case 'terminal': return <TerminalIcon size={size} />;
    case 'settings': return <SettingsIcon size={size} />;
    case 'files': return <Folder size={size} />;
    case 'browser': return <Globe size={size} />;
    case 'photos': return <ImageIcon size={size} />;
    case 'notepad': return <FileText size={size} />;
    case 'music': return <Music size={size} />;
    case 'appfolder': return <Package size={size} />;
    case 'codestudio': return <Code size={size} />;
    case 'taskscheduler': return <Clock size={size} />;
    default: return <Box size={size} />;
  }
}

// --- App Renderers ---

function renderApp(id: AppId, props: any) {
  switch (id) {
    case 'terminal': return <TerminalApp {...props} />;
    case 'settings': return <SettingsApp {...props} />;
    case 'notepad': return <NotepadApp {...props} />;
    case 'browser': return <BrowserApp {...props} />;
    case 'photos': return <PhotosApp {...props} />;
    case 'music': return <MusicApp {...props} />;
    case 'appfolder': return <AppFolderApp {...props} />;
    case 'codestudio': return <CodeStudioApp {...props} />;
    case 'files': return <FilesApp {...props} />;
    case 'taskscheduler': return <TaskSchedulerApp {...props} />;
    case 'systemmonitor': return <SystemMonitorApp {...props} />;
    default: return <div className="p-4">App not found</div>;
  }
}

// --- Individual Apps ---

function TaskSchedulerApp({ tasks, setTasks, addNotification }: { tasks: ScheduledTask[], setTasks: React.Dispatch<React.SetStateAction<ScheduledTask[]>>, addNotification: any }) {
  const [isAdding, setIsAdding] = useState(false);
  const [newTask, setNewTask] = useState<Partial<ScheduledTask>>({
    name: '',
    type: 'app',
    target: 'terminal',
    time: '12:00',
    repeat: 'once',
    enabled: true
  });

  const addTask = () => {
    if (!newTask.name || !newTask.target) return;
    const task: ScheduledTask = {
      id: Math.random().toString(36).substr(2, 9),
      name: newTask.name!,
      type: newTask.type as 'app' | 'command',
      target: newTask.target!,
      time: newTask.time!,
      repeat: newTask.repeat as 'once' | 'daily',
      enabled: true
    };
    setTasks(prev => [...prev, task]);
    addNotification('Task Scheduler', `Task "${task.name}" created`, 'success');
    setIsAdding(false);
  };

  const deleteTask = (id: string) => {
    const task = tasks.find(t => t.id === id);
    setTasks(prev => prev.filter(t => t.id !== id));
    if (task) addNotification('Task Scheduler', `Task "${task.name}" deleted`, 'warning');
  };

  const toggleTask = (id: string) => {
    setTasks(prev => prev.map(t => t.id === id ? { ...t, enabled: !t.enabled } : t));
    const task = tasks.find(t => t.id === id);
    if (task) addNotification('Task Scheduler', `Task "${task.name}" ${!task.enabled ? 'enabled' : 'disabled'}`, 'info');
  };

  return (
    <div className="h-full flex flex-col bg-black/90 text-white p-6 overflow-y-auto no-scrollbar">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-light">Task Scheduler</h1>
          <p className="text-white/40 text-xs">Automate your GlassOS experience</p>
        </div>
        <button 
          onClick={() => setIsAdding(true)}
          className="glass-button flex items-center gap-2 text-blue-400 border-blue-500/20 hover:bg-blue-500/10"
        >
          <Plus size={16} />
          New Task
        </button>
      </div>

      <div className="space-y-3">
        {tasks.map(task => (
          <div key={task.id} className="glass p-4 rounded-2xl flex items-center justify-between group">
            <div className="flex items-center gap-4">
              <div className={cn(
                "w-10 h-10 rounded-xl flex items-center justify-center",
                task.enabled ? "bg-blue-500/20 text-blue-400" : "bg-white/5 text-white/20"
              )}>
                {task.type === 'app' ? <Package size={20} /> : <TerminalIcon size={20} />}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className={cn("text-sm font-medium", !task.enabled && "text-white/40")}>{task.name}</h3>
                  <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-white/5 text-white/30 uppercase tracking-tighter">
                    {task.repeat}
                  </span>
                </div>
                <p className="text-[10px] text-white/30">
                  Runs {task.type === 'app' ? `App: ${task.target}` : `Command: ${task.target}`} at {task.time}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button 
                onClick={() => toggleTask(task.id)}
                className={cn(
                  "px-3 py-1 rounded-full text-[10px] font-bold transition-all",
                  task.enabled ? "bg-green-500/20 text-green-400" : "bg-white/5 text-white/20"
                )}
              >
                {task.enabled ? 'ENABLED' : 'DISABLED'}
              </button>
              <button 
                onClick={() => deleteTask(task.id)}
                className="p-2 hover:bg-red-500/20 rounded-lg transition-colors text-white/20 hover:text-red-400"
              >
                <Trash size={16} />
              </button>
            </div>
          </div>
        ))}
        {tasks.length === 0 && !isAdding && (
          <div className="py-20 text-center text-white/20">
            <Clock size={48} className="mx-auto mb-4 opacity-10" />
            <p className="text-sm">No scheduled tasks found</p>
          </div>
        )}
      </div>

      <AnimatePresence>
        {isAdding && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-8">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsAdding(false)}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative w-full max-w-md glass-dark rounded-2xl border border-white/20 shadow-2xl overflow-hidden flex flex-col"
            >
              <div className="p-4 border-b border-white/10 flex items-center justify-between">
                <span className="text-sm font-medium">Create New Task</span>
                <button onClick={() => setIsAdding(false)} className="p-1 hover:bg-white/10 rounded-md transition-colors">
                  <X size={16} />
                </button>
              </div>
              <div className="p-6 space-y-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-white/30 uppercase">Task Name</label>
                  <input 
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-sm outline-none focus:border-blue-500/50"
                    placeholder="Morning Routine"
                    value={newTask.name}
                    onChange={e => setNewTask({...newTask, name: e.target.value})}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-white/30 uppercase">Type</label>
                    <select 
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-sm outline-none focus:border-blue-500/50"
                      value={newTask.type}
                      onChange={e => setNewTask({...newTask, type: e.target.value as any})}
                    >
                      <option value="app">Open App</option>
                      <option value="command">Run Command</option>
                      <option value="screensaver">Run Screensaver</option>
                    </select>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-white/30 uppercase">Time</label>
                    <input 
                      type="time"
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-sm outline-none focus:border-blue-500/50"
                      value={newTask.time}
                      onChange={e => setNewTask({...newTask, time: e.target.value})}
                    />
                  </div>
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-white/30 uppercase">
                    {newTask.type === 'screensaver' ? 'Screensaver Type' : 'Target (App ID or Command)'}
                  </label>
                  {newTask.type === 'screensaver' ? (
                    <select 
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-sm outline-none focus:border-blue-500/50"
                      value={newTask.target}
                      onChange={e => setNewTask({...newTask, target: e.target.value})}
                    >
                      <option value="Matrix Rain">Matrix Rain</option>
                      <option value="Starfield">Starfield</option>
                      <option value="Floating Bubbles">Floating Bubbles</option>
                    </select>
                  ) : (
                    <input 
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-sm outline-none focus:border-blue-500/50"
                      placeholder={newTask.type === 'app' ? 'browser' : 'echo hello'}
                      value={newTask.target}
                      onChange={e => setNewTask({...newTask, target: e.target.value})}
                    />
                  )}
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-white/30 uppercase">Repeat</label>
                  <div className="flex gap-2">
                    {['once', 'daily'].map(r => (
                      <button
                        key={r}
                        onClick={() => setNewTask({...newTask, repeat: r as any})}
                        className={cn(
                          "flex-1 py-2 rounded-xl border transition-all text-xs capitalize",
                          newTask.repeat === r ? "bg-blue-500/20 border-blue-500/50 text-blue-400" : "bg-white/5 border-white/10 text-white/30"
                        )}
                      >
                        {r}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
              <div className="p-4 bg-white/5 border-t border-white/10 flex justify-end gap-3">
                <button onClick={() => setIsAdding(false)} className="text-xs text-white/40 hover:text-white">Cancel</button>
                <button onClick={addTask} className="glass-button text-xs text-blue-400 border-blue-500/20">Create Task</button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

function SystemMonitorApp({ cpuUsage, ramUsage }: { cpuUsage: number, ramUsage: number }) {
  const [history, setHistory] = useState<{cpu: number[], ram: number[]}>({ cpu: [], ram: [] });

  useEffect(() => {
    setHistory(prev => ({
      cpu: [...prev.cpu, cpuUsage].slice(-20),
      ram: [...prev.ram, ramUsage].slice(-20)
    }));
  }, [cpuUsage, ramUsage]);

  return (
    <div className="h-full p-6 flex flex-col gap-6 overflow-y-auto no-scrollbar">
      <div className="grid grid-cols-2 gap-4">
        <div className="glass p-4 rounded-2xl flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-blue-400">
              <Cpu size={18} />
              <span className="text-sm font-bold uppercase tracking-wider">CPU Usage</span>
            </div>
            <span className="text-xl font-mono">{cpuUsage}%</span>
          </div>
          <div className="h-24 flex items-end gap-1">
            {history.cpu.map((v, i) => (
              <div 
                key={i} 
                className="flex-1 bg-blue-500/40 rounded-t-sm transition-all duration-500" 
                style={{ height: `${v}%` }} 
              />
            ))}
          </div>
        </div>

        <div className="glass p-4 rounded-2xl flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-purple-400">
              <Activity size={18} />
              <span className="text-sm font-bold uppercase tracking-wider">RAM Usage</span>
            </div>
            <span className="text-xl font-mono">{ramUsage}%</span>
          </div>
          <div className="h-24 flex items-end gap-1">
            {history.ram.map((v, i) => (
              <div 
                key={i} 
                className="flex-1 bg-purple-500/40 rounded-t-sm transition-all duration-500" 
                style={{ height: `${v}%` }} 
              />
            ))}
          </div>
        </div>
      </div>

      <div className="glass p-4 rounded-2xl flex flex-col gap-4">
        <div className="flex items-center gap-2 text-white/60">
          <HardDrive size={18} />
          <span className="text-sm font-bold uppercase tracking-wider">Disk Usage</span>
        </div>
        <div className="space-y-4">
          <div>
            <div className="flex justify-between text-xs mb-1">
              <span>System (C:)</span>
              <span>124GB / 512GB</span>
            </div>
            <div className="h-2 bg-white/10 rounded-full overflow-hidden">
              <div className="h-full bg-blue-500 w-[24%]" />
            </div>
          </div>
          <div>
            <div className="flex justify-between text-xs mb-1">
              <span>Data (D:)</span>
              <span>892GB / 1TB</span>
            </div>
            <div className="h-2 bg-white/10 rounded-full overflow-hidden">
              <div className="h-full bg-purple-500 w-[89%]" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function TerminalApp({ fs, setFs, addNotification }: { fs: FileSystemItem[], setFs: React.Dispatch<React.SetStateAction<FileSystemItem[]>>, addNotification: any }) {
  interface TerminalSession {
    id: string;
    title: string;
    history: string[];
    currentPath: string[];
    isTopActive: boolean;
    topData: any[];
  }

  const [sessions, setSessions] = useState<TerminalSession[]>([
    {
      id: '1',
      title: 'bash',
      history: ['Welcome to GlassOS Terminal', 'Type "help" for a list of commands.'],
      currentPath: [],
      isTopActive: false,
      topData: []
    }
  ]);
  const [activeSessionId, setActiveSessionId] = useState('1');
  const [input, setInput] = useState('');
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const activeSession = useMemo(() => 
    sessions.find(s => s.id === activeSessionId) || sessions[0],
    [sessions, activeSessionId]
  );

  useEffect(() => {
    // Focus input on mount (when window opens)
    const timer = setTimeout(() => inputRef.current?.focus(), 100);
    return () => clearTimeout(timer);
  }, [activeSessionId]);

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [activeSession.history]);

  useEffect(() => {
    const interval = setInterval(() => {
      setSessions(prev => prev.map(s => {
        if (s.isTopActive) {
          return {
            ...s,
            topData: [
              { pid: 101, proc: 'System', cpu: (Math.random() * 5).toFixed(1), mem: '128MB' },
              { pid: 204, proc: 'Window Manager', cpu: (Math.random() * 10).toFixed(1), mem: '256MB' },
              { pid: 305, proc: 'Terminal', cpu: (Math.random() * 2).toFixed(1), mem: '64MB' },
              { pid: 402, proc: 'Browser', cpu: (Math.random() * 15).toFixed(1), mem: '512MB' },
              { pid: 501, proc: 'Network Service', cpu: (Math.random() * 1).toFixed(1), mem: '32MB' },
            ]
          };
        }
        return s;
      }));
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const addSession = () => {
    const newId = Math.random().toString(36).substr(2, 9);
    addNotification('Terminal', 'New session started', 'info');
    const newSession: TerminalSession = {
      id: newId,
      title: 'bash',
      history: [`Terminal session ${sessions.length + 1} started.`],
      currentPath: [],
      isTopActive: false,
      topData: []
    };
    setSessions(prev => [...prev, newSession]);
    setActiveSessionId(newId);
  };

  const closeSession = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    if (sessions.length === 1) return;
    setSessions(prev => prev.filter(s => s.id !== id));
    if (activeSessionId === id) {
      const remaining = sessions.filter(s => s.id !== id);
      setActiveSessionId(remaining[remaining.length - 1].id);
    }
  };

  const updateActiveSession = (update: Partial<TerminalSession>) => {
    setSessions(prev => prev.map(s => s.id === activeSessionId ? { ...s, ...update } : s));
  };

  const processCommand = (cmd: string) => {
    const parts = cmd.trim().split(/\s+/);
    const command = parts[0].toLowerCase();
    const args = parts.slice(1);
    const currentPath = activeSession.currentPath;
    const pathString = '/' + currentPath.join('/');

    const newHistory = [...activeSession.history, `guest@glass-os:${pathString}$ ${cmd}`];

    const getFolder = (items: FileSystemItem[], path: string[]): FileSystemItem[] | null => {
      let current = items;
      for (const segment of path) {
        const found = current.find(item => item.name === segment && item.type === 'folder');
        if (found && found.children) {
          current = found.children;
        } else {
          return null;
        }
      }
      return current;
    };

    switch (command) {
      case 'help':
        updateActiveSession({ history: [...newHistory, 'Available commands: ls, cd, mkdir, rm, cat, pwd, clear, whoami, sysinfo, top, quit'] });
        addNotification('Terminal', 'Help menu displayed', 'info');
        break;
      case 'clear':
        updateActiveSession({ history: [] });
        addNotification('Terminal', 'History cleared', 'info');
        break;
      case 'whoami':
        updateActiveSession({ history: [...newHistory, 'guest'] });
        addNotification('System', 'User identity confirmed: guest', 'info');
        break;
      case 'pwd':
        updateActiveSession({ history: [...newHistory, pathString] });
        addNotification('Terminal', `Current path: ${pathString}`, 'info');
        break;
      case 'ls': {
        const folder = getFolder(fs, currentPath);
        if (folder) {
          const names = folder.map(item => item.name).join('  ');
          updateActiveSession({ history: [...newHistory, names || '(empty)'] });
          addNotification('Terminal', `Listed ${folder.length} items`, 'info');
        } else {
          updateActiveSession({ history: [...newHistory, 'ls: error accessing directory'] });
        }
        break;
      }
      case 'cd': {
        const target = args[0];
        if (!target || target === '~' || target === '/') {
          updateActiveSession({ currentPath: [], history: newHistory });
        } else if (target === '..') {
          updateActiveSession({ currentPath: currentPath.slice(0, -1), history: newHistory });
        } else {
          const targetPath = [...currentPath, target];
          const folder = getFolder(fs, targetPath);
          if (folder) {
            updateActiveSession({ currentPath: targetPath, history: newHistory });
            addNotification('Terminal', `Changed directory to: /${targetPath.join('/')}`, 'info');
          } else {
            updateActiveSession({ history: [...newHistory, `cd: no such directory: ${target}`] });
          }
        }
        break;
      }
      case 'mkdir': {
        const name = args[0];
        if (!name) {
          updateActiveSession({ history: [...newHistory, 'mkdir: missing operand'] });
          break;
        }
        
        const updateFs = (items: FileSystemItem[], path: string[]): FileSystemItem[] => {
          if (path.length === 0) {
            if (items.some(i => i.name === name)) return items;
            return [...items, { name, type: 'folder', children: [] }];
          }
          const [first, ...rest] = path;
          return items.map(item => {
            if (item.name === first && item.type === 'folder' && item.children) {
              return { ...item, children: updateFs(item.children, rest) };
            }
            return item;
          });
        };

        setFs(prev => updateFs(prev, currentPath));
        addNotification('Terminal', `Created directory: ${name}`, 'success');
        updateActiveSession({ history: newHistory });
        break;
      }
      case 'rm': {
        const name = args[0];
        if (!name) {
          updateActiveSession({ history: [...newHistory, 'rm: missing operand'] });
          break;
        }

        const removeItem = (items: FileSystemItem[], path: string[]): FileSystemItem[] => {
          if (path.length === 0) {
            return items.filter(item => item.name !== name);
          }
          const [first, ...rest] = path;
          return items.map(item => {
            if (item.name === first && item.type === 'folder' && item.children) {
              return { ...item, children: removeItem(item.children, rest) };
            }
            return item;
          });
        };

        setFs(prev => removeItem(prev, currentPath));
        addNotification('Terminal', `Removed: ${name}`, 'warning');
        updateActiveSession({ history: newHistory });
        break;
      }
      case 'cat': {
        const name = args[0];
        const folder = getFolder(fs, currentPath);
        const file = folder?.find(i => i.name === name && i.type === 'file');
        if (file) {
          updateActiveSession({ history: [...newHistory, file.content || '(empty file)'] });
          addNotification('Terminal', `Read file: ${name}`, 'info');
        } else {
          updateActiveSession({ history: [...newHistory, `cat: ${name}: No such file`] });
        }
        break;
      }
      case 'sysinfo':
        updateActiveSession({ history: [...newHistory, 
          'CPU: Virtual Octa-Core @ 3.2GHz',
          'RAM: 16GB Virtual DDR5',
          'Storage: 512GB NVMe SSD',
          'Kernel: GlassOS-v1-React19',
          'Version: 1.0.0-stable'
        ] });
        addNotification('System', 'System information retrieved', 'info');
        break;
      case 'top':
        updateActiveSession({ isTopActive: true, history: newHistory });
        addNotification('System', 'Process monitor started', 'info');
        break;
      case 'quit':
        if (activeSession.isTopActive) {
          updateActiveSession({ isTopActive: false, history: newHistory });
          addNotification('System', 'Process monitor stopped', 'info');
        }
        break;
      default:
        if (cmd) {
          updateActiveSession({ history: [...newHistory, `Command not found: ${command}`] });
          addNotification('Terminal', `Unknown command: ${command}`, 'error');
        }
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    processCommand(input);
    setInput('');
  };

  return (
    <div className="h-full flex flex-col bg-black/90">
      {/* Tab Bar */}
      <div className="h-9 bg-white/5 border-b border-white/10 flex items-center px-2 gap-1 overflow-x-auto no-scrollbar">
        {sessions.map(s => (
          <div
            key={s.id}
            onClick={() => setActiveSessionId(s.id)}
            className={cn(
              "h-7 px-3 rounded-t-md flex items-center gap-2 cursor-pointer transition-all min-w-[100px] max-w-[150px]",
              activeSessionId === s.id ? "bg-white/10 border-b-2 border-blue-400" : "hover:bg-white/5 text-white/50"
            )}
          >
            <TerminalIcon size={12} />
            <span className="text-[10px] truncate flex-1">{s.title}</span>
            {sessions.length > 1 && (
              <X 
                size={10} 
                className="hover:text-red-400 transition-colors" 
                onClick={(e) => closeSession(e, s.id)}
              />
            )}
          </div>
        ))}
        <button 
          onClick={addSession}
          className="p-1 hover:bg-white/10 rounded-md transition-colors text-white/50"
        >
          <Plus size={14} />
        </button>
      </div>

      {/* Terminal Content */}
      <div className="flex-1 overflow-hidden relative">
        {activeSession.isTopActive ? (
          <div className="h-full text-green-500 font-mono p-4 text-sm overflow-hidden flex flex-col">
            <div className="flex justify-between border-b border-green-900 pb-2 mb-2">
              <span>GlassOS Task Manager (top)</span>
              <span>Press "quit" to exit</span>
            </div>
            <div className="grid grid-cols-4 font-bold mb-2">
              <span>PID</span>
              <span>PROCESS</span>
              <span>%CPU</span>
              <span>MEM</span>
            </div>
            <div className="flex-1">
              {activeSession.topData.map(p => (
                <div key={p.pid} className="grid grid-cols-4">
                  <span>{p.pid}</span>
                  <span>{p.proc}</span>
                  <span>{p.cpu}</span>
                  <span>{p.mem}</span>
                </div>
              ))}
            </div>
            <form onSubmit={handleSubmit} className="mt-2 flex gap-2">
              <span>:</span>
              <input 
                autoFocus
                className="bg-transparent outline-none flex-1"
                value={input}
                onChange={(e) => setInput(e.target.value)}
              />
            </form>
          </div>
        ) : (
          <div 
            className="h-full text-white font-mono p-4 text-sm overflow-y-auto"
            ref={scrollRef}
            onClick={() => inputRef.current?.focus()}
          >
            <div className="whitespace-pre-wrap mb-2">
              {activeSession.history.map((line: string, i: number) => (
                <div key={i}>{line}</div>
              ))}
            </div>
            <form onSubmit={handleSubmit} className="flex gap-2">
              <span className="text-green-400">guest@glass-os:{'/' + activeSession.currentPath.join('/')}$</span>
              <input 
                ref={inputRef}
                autoFocus
                className="bg-transparent outline-none flex-1"
                value={input}
                onChange={(e) => setInput(e.target.value)}
              />
            </form>
          </div>
        )}
      </div>
    </div>
  );
}

function Screensaver({ type, onDismiss }: { type: string, onDismiss: () => void }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    let animationFrameId: number;

    if (type === 'Matrix Rain') {
      const fontSize = 16;
      const columns = Math.floor(canvas.width / fontSize);
      const drops: number[] = new Array(columns).fill(1);

      const draw = () => {
        ctx.fillStyle = 'rgba(0, 0, 0, 0.05)';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.fillStyle = '#0F0';
        ctx.font = `${fontSize}px monospace`;

        for (let i = 0; i < drops.length; i++) {
          const text = String.fromCharCode(Math.floor(Math.random() * 128));
          ctx.fillText(text, i * fontSize, drops[i] * fontSize);
          if (drops[i] * fontSize > canvas.height && Math.random() > 0.975) {
            drops[i] = 0;
          }
          drops[i]++;
        }
        animationFrameId = requestAnimationFrame(draw);
      };
      draw();
    } else if (type === 'Starfield') {
      const stars = new Array(400).fill(0).map(() => ({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        z: Math.random() * canvas.width,
        pz: 0
      }));

      const draw = () => {
        ctx.fillStyle = 'black';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.fillStyle = 'white';

        stars.forEach(star => {
          star.z -= 5;
          if (star.z <= 0) {
            star.z = canvas.width;
            star.x = Math.random() * canvas.width;
            star.y = Math.random() * canvas.height;
          }

          const sx = (star.x - canvas.width / 2) * (canvas.width / star.z) + canvas.width / 2;
          const sy = (star.y - canvas.height / 2) * (canvas.width / star.z) + canvas.height / 2;
          const r = (canvas.width / star.z) * 1.5;

          ctx.beginPath();
          ctx.arc(sx, sy, r, 0, Math.PI * 2);
          ctx.fill();
        });
        animationFrameId = requestAnimationFrame(draw);
      };
      draw();
    } else if (type === 'Floating Bubbles') {
      const bubbles = new Array(50).fill(0).map(() => ({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        r: Math.random() * 40 + 10,
        vx: (Math.random() - 0.5) * 2,
        vy: (Math.random() - 0.5) * 2,
        color: `hsla(${Math.random() * 360}, 70%, 70%, 0.3)`
      }));

      const draw = () => {
        ctx.fillStyle = '#050505';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        bubbles.forEach(b => {
          b.x += b.vx;
          b.y += b.vy;
          if (b.x < -b.r) b.x = canvas.width + b.r;
          if (b.x > canvas.width + b.r) b.x = -b.r;
          if (b.y < -b.r) b.y = canvas.height + b.r;
          if (b.y > canvas.height + b.r) b.y = -b.r;

          ctx.beginPath();
          ctx.arc(b.x, b.y, b.r, 0, Math.PI * 2);
          ctx.fillStyle = b.color;
          ctx.fill();
          ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
          ctx.stroke();
        });
        animationFrameId = requestAnimationFrame(draw);
      };
      draw();
    }

    return () => cancelAnimationFrame(animationFrameId);
  }, [type]);

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onDismiss}
      onKeyDown={onDismiss}
      tabIndex={0}
      className="fixed inset-0 z-[10000] cursor-none outline-none"
    >
      <canvas ref={canvasRef} className="w-full h-full" />
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 text-white/20 text-[10px] uppercase tracking-[0.2em] pointer-events-none">
        Click or press any key to dismiss
      </div>
    </motion.div>
  );
}

function SettingsApp({ 
  userName, setUserName, 
  wallpaper, setWallpaper, 
  handleLogout,
  networkStatus, setNetworkStatus,
  connectedNetwork, setConnectedNetwork,
  setActiveScreensaver,
  addNotification
}: any) {
  const [view, setView] = useState<'main' | 'personalization' | 'network' | 'control-panel' | 'extensions'>('main');
  const [activeControl, setActiveControl] = useState<string | null>(null);
  const [extensions, setExtensions] = useState([
    { id: '1', name: 'Dark Mode Pro', version: '1.2.0', enabled: true, description: 'Enhanced dark mode for all system apps.' },
    { id: '2', name: 'AdBlocker Plus', version: '3.4.1', enabled: false, description: 'Block annoying ads in the browser.' },
    { id: '3', name: 'System Optimizer', version: '2.0.5', enabled: true, description: 'Keep your GlassOS running smoothly.' },
    { id: '4', name: 'Custom Fonts', version: '1.0.1', enabled: true, description: 'Install and use custom fonts system-wide.' },
  ]);
  const [selectedScreensaver, setSelectedScreensaver] = useState('Matrix Rain');
  const [isEditingName, setIsEditingName] = useState(false);
  const [newName, setNewName] = useState(userName);
  const [isConnecting, setIsConnecting] = useState(false);

  const networks = ['GlassFiber_5G', 'Starlink_Guest', 'Neighbor_WiFi', 'Public_Hotspot'];

  const handleConnect = (name: string) => {
    setIsConnecting(true);
    setNetworkStatus('connecting');
    setTimeout(() => {
      setIsConnecting(false);
      setNetworkStatus('connected');
      setConnectedNetwork(name);
      addNotification('Network', `Connected to ${name}`, 'success');
    }, 2000);
  };

  return (
    <div className="h-full flex">
      {/* Sidebar */}
      <div className="w-48 bg-white/5 border-r border-white/10 p-4 flex flex-col gap-2">
        <button 
          onClick={() => setView('main')}
          className={cn("w-full text-left px-3 py-2 rounded-lg transition-all text-sm", view === 'main' ? "bg-white/10" : "hover:bg-white/5")}
        >
          System
        </button>
        <button 
          onClick={() => setView('personalization')}
          className={cn("w-full text-left px-3 py-2 rounded-lg transition-all text-sm", view === 'personalization' ? "bg-white/10" : "hover:bg-white/5")}
        >
          Personalization
        </button>
        <button 
          onClick={() => setView('network')}
          className={cn("w-full text-left px-3 py-2 rounded-lg transition-all text-sm", view === 'network' ? "bg-white/10" : "hover:bg-white/5")}
        >
          Network
        </button>
        <button 
          onClick={() => setView('control-panel')}
          className={cn("w-full text-left px-3 py-2 rounded-lg transition-all text-sm", view === 'control-panel' ? "bg-white/10" : "hover:bg-white/5")}
        >
          Control Panel
        </button>
        <button 
          onClick={() => setView('extensions')}
          className={cn("w-full text-left px-3 py-2 rounded-lg transition-all text-sm", view === 'extensions' ? "bg-white/10" : "hover:bg-white/5")}
        >
          Extensions
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 p-6 overflow-y-auto">
        {view === 'main' && (
          <div className="flex flex-col gap-8">
            <div className="flex items-center gap-4">
              <div 
                className="w-16 h-16 rounded-full bg-white/10 flex items-center justify-center cursor-pointer hover:bg-white/20 transition-all"
                onClick={handleLogout}
              >
                <User size={32} className="text-white/50" />
              </div>
              <div>
                {isEditingName ? (
                  <input 
                    autoFocus
                    className="glass-input text-xl font-medium w-48"
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        setUserName(newName);
                        setIsEditingName(false);
                        addNotification('Settings', 'Username updated successfully', 'success');
                      }
                    }}
                    onBlur={() => setIsEditingName(false)}
                  />
                ) : (
                  <h2 
                    className="text-xl font-medium cursor-pointer hover:text-blue-400 transition-colors"
                    onClick={() => setIsEditingName(true)}
                  >
                    {userName}
                  </h2>
                )}
                <p className="text-xs text-white/40">Standard Account</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="glass p-4 rounded-xl">
                <div className="flex items-center gap-3 mb-2">
                  <Cpu size={18} className="text-blue-400" />
                  <span className="text-sm font-medium">Processor</span>
                </div>
                <p className="text-xs text-white/50">GlassCore i9 v12</p>
              </div>
              <div className="glass p-4 rounded-xl">
                <div className="flex items-center gap-3 mb-2">
                  <HardDrive size={18} className="text-purple-400" />
                  <span className="text-sm font-medium">Storage</span>
                </div>
                <p className="text-xs text-white/50">450GB / 512GB Free</p>
              </div>
            </div>

            <button 
              onClick={handleLogout}
              className="glass-button text-red-400 border-red-500/20 hover:bg-red-500/10 w-fit"
            >
              Log Out
            </button>
          </div>
        )}

        {view === 'personalization' && (
          <div>
            <h2 className="text-lg font-medium mb-4">Background</h2>
            <div className="grid grid-cols-3 gap-4">
              {WALLPAPERS.map((wp, i) => (
                <div 
                  key={i}
                  onClick={() => {
                    setWallpaper(wp);
                    addNotification('Personalization', 'Wallpaper updated', 'success');
                  }}
                  className={cn(
                    "aspect-video rounded-lg overflow-hidden cursor-pointer border-2 transition-all hover:scale-105",
                    wallpaper === wp ? "border-blue-400" : "border-transparent"
                  )}
                >
                  <img src={wp} alt={`Wallpaper ${i}`} className="w-full h-full object-cover" />
                </div>
              ))}
            </div>
          </div>
        )}

        {view === 'network' && (
          <div>
            <h2 className="text-lg font-medium mb-4">Wi-Fi Networks</h2>
            <div className="flex flex-col gap-2">
              {networks.map(net => (
                <div key={net} className="glass p-3 rounded-xl flex items-center justify-between group hover:bg-white/15 transition-all">
                  <div className="flex items-center gap-3">
                    <Wifi size={18} className={connectedNetwork === net ? "text-blue-400" : "text-white/40"} />
                    <span className="text-sm">{net}</span>
                  </div>
                  {connectedNetwork === net ? (
                    <span className="text-xs text-blue-400 font-medium">Connected</span>
                  ) : (
                    <button 
                      onClick={() => handleConnect(net)}
                      disabled={isConnecting}
                      className="text-xs px-3 py-1 rounded-md bg-white/10 hover:bg-white/20 transition-all disabled:opacity-50"
                    >
                      {isConnecting ? 'Connecting...' : 'Connect'}
                    </button>
                  )}
                </div>
              ))}
            </div>
            {isConnecting && (
              <div className="mt-4 flex items-center gap-3 text-white/50">
                <RefreshCw size={16} className="animate-spin" />
                <span className="text-xs">Connecting to {connectedNetwork}...</span>
              </div>
            )}
          </div>
        )}

        {view === 'control-panel' && (
          <div className="flex flex-col gap-6">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-medium">Control Panel</h2>
              {activeControl && (
                <button 
                  onClick={() => setActiveControl(null)}
                  className="text-xs text-blue-400 hover:underline"
                >
                  Back to All Controls
                </button>
              )}
            </div>

            {!activeControl ? (
              <div className="grid grid-cols-3 gap-4">
                {[
                  { id: 'screensaver', label: 'Screensaver', icon: <Eye size={20} />, color: 'text-pink-400' },
                  { id: 'general', label: 'General', icon: <SettingsIcon size={20} />, color: 'text-blue-400' },
                  { id: 'monitor', label: 'Monitor', icon: <Monitor size={20} />, color: 'text-cyan-400' },
                  { id: 'mouse', label: 'Mouse', icon: <Mouse size={20} />, color: 'text-orange-400' },
                  { id: 'keyboard', label: 'Keyboard', icon: <Keyboard size={20} />, color: 'text-yellow-400' },
                  { id: 'touch', label: 'Touch', icon: <Smartphone size={20} />, color: 'text-green-400' },
                  { id: 'networking', label: 'Networking', icon: <Wifi size={20} />, color: 'text-indigo-400' },
                  { id: 'printing', label: 'Printing', icon: <PrinterIcon size={20} />, color: 'text-slate-400' },
                  { id: 'users', label: 'Users', icon: <User size={20} />, color: 'text-purple-400' },
                  { id: 'security', label: 'Security', icon: <Shield size={20} />, color: 'text-red-400' },
                  { id: 'text', label: 'Text', icon: <Type size={20} />, color: 'text-emerald-400' },
                  { id: 'sounds', label: 'Sounds', icon: <Volume2 size={20} />, color: 'text-amber-400' },
                ].map(item => (
                  <button 
                    key={item.id}
                    onClick={() => setActiveControl(item.id)}
                    className="glass p-4 rounded-xl flex flex-col items-center gap-3 hover:bg-white/10 transition-all group"
                  >
                    <div className={cn("p-3 rounded-lg bg-white/5 group-hover:scale-110 transition-transform", item.color)}>
                      {item.icon}
                    </div>
                    <span className="text-xs font-medium">{item.label}</span>
                  </button>
                ))}
              </div>
            ) : (
              <motion.div 
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="glass p-6 rounded-2xl space-y-6"
              >
                {activeControl === 'screensaver' && (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between border-b border-white/10 pb-2">
                      <h3 className="text-sm font-medium">Screensaver Options</h3>
                      <button 
                        onClick={() => {
                          setActiveScreensaver(selectedScreensaver);
                          addNotification('Screensaver', `Starting ${selectedScreensaver}...`, 'info');
                        }}
                        className="px-4 py-1.5 bg-pink-500/20 text-pink-400 rounded-lg text-[10px] font-bold hover:bg-pink-500/30 transition-all flex items-center gap-2"
                      >
                        <Play size={12} fill="currentColor" />
                        RUN NOW
                      </button>
                    </div>
                    <div className="grid grid-cols-1 gap-3">
                      {['Matrix Rain', 'Starfield', 'Floating Bubbles'].map(opt => (
                        <button 
                          key={opt} 
                          onClick={() => {
                            setSelectedScreensaver(opt);
                            addNotification('Screensaver', `Selected ${opt}`, 'info');
                          }}
                          className={cn(
                            "w-full text-left p-3 rounded-lg border transition-all text-xs flex items-center justify-between",
                            selectedScreensaver === opt ? "bg-white/10 border-pink-500/50" : "bg-white/5 border-white/5 hover:bg-white/10"
                          )}
                        >
                          {opt}
                          <div className={cn(
                            "w-4 h-4 rounded-full border transition-all flex items-center justify-center",
                            selectedScreensaver === opt ? "border-pink-400" : "border-white/20"
                          )}>
                            {selectedScreensaver === opt && <div className="w-2 h-2 rounded-full bg-pink-400" />}
                          </div>
                        </button>
                      ))}
                    </div>
                    <div className="p-4 bg-white/5 rounded-xl border border-white/10">
                      <p className="text-[10px] text-white/40 leading-relaxed">
                        Tip: You can schedule screensavers to run automatically using the Task Scheduler app.
                      </p>
                    </div>
                  </div>
                )}
                
                {activeControl === 'general' && (
                  <div className="space-y-4">
                    <h3 className="text-sm font-medium border-b border-white/10 pb-2">General Controls</h3>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-white/70">Language</span>
                        <select className="bg-white/5 border border-white/10 rounded px-2 py-1 text-xs">
                          <option>English (US)</option>
                          <option>Spanish</option>
                          <option>French</option>
                        </select>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-white/70">Time Zone</span>
                        <span className="text-xs text-white/40">UTC-07:00 Pacific Time</span>
                      </div>
                    </div>
                  </div>
                )}

                {activeControl === 'monitor' && (
                  <div className="space-y-4">
                    <h3 className="text-sm font-medium border-b border-white/10 pb-2">Monitor Settings</h3>
                    <div className="space-y-6">
                      <div className="space-y-2">
                        <div className="flex justify-between text-xs">
                          <span className="text-white/70">Brightness</span>
                          <span>85%</span>
                        </div>
                        <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
                          <div className="h-full bg-cyan-400 w-[85%]" />
                        </div>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-white/70">Resolution</span>
                        <span className="text-xs text-white/40">1920 x 1080 (Recommended)</span>
                      </div>
                    </div>
                  </div>
                )}

                {activeControl === 'mouse' && (
                  <div className="space-y-4">
                    <h3 className="text-sm font-medium border-b border-white/10 pb-2">Mouse Configuration</h3>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-white/70">Primary Button</span>
                        <div className="flex gap-2">
                          <button className="px-3 py-1 bg-blue-500/20 text-blue-400 rounded-md text-[10px]">Left</button>
                          <button className="px-3 py-1 bg-white/5 text-white/40 rounded-md text-[10px]">Right</button>
                        </div>
                      </div>
                      <div className="space-y-2">
                        <div className="flex justify-between text-xs">
                          <span className="text-white/70">Pointer Speed</span>
                        </div>
                        <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
                          <div className="h-full bg-orange-400 w-[60%]" />
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {activeControl === 'keyboard' && (
                  <div className="space-y-4">
                    <h3 className="text-sm font-medium border-b border-white/10 pb-2">Keyboard Settings</h3>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-white/70">Repeat Delay</span>
                        <span className="text-xs text-white/40">Short</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-white/70">Sticky Keys</span>
                        <div className="w-8 h-4 bg-white/10 rounded-full relative">
                          <div className="absolute left-1 top-1 w-2 h-2 bg-white/40 rounded-full" />
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {activeControl === 'touch' && (
                  <div className="space-y-4">
                    <h3 className="text-sm font-medium border-b border-white/10 pb-2">Touch Controls</h3>
                    <div className="p-4 bg-blue-500/10 border border-blue-500/20 rounded-xl">
                      <p className="text-[10px] text-blue-400 leading-relaxed">
                        Touch optimization is currently active. Gestures like swipe-to-close and pinch-to-zoom are enabled for mobile compatibility.
                      </p>
                    </div>
                  </div>
                )}

                {activeControl === 'networking' && (
                  <div className="space-y-4">
                    <h3 className="text-sm font-medium border-b border-white/10 pb-2">Advanced Networking</h3>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between p-2 rounded bg-white/5">
                        <span className="text-xs">IP Address</span>
                        <span className="text-xs font-mono text-white/40">192.168.1.104</span>
                      </div>
                      <div className="flex items-center justify-between p-2 rounded bg-white/5">
                        <span className="text-xs">MAC Address</span>
                        <span className="text-xs font-mono text-white/40">00:1A:2B:3C:4D:5E</span>
                      </div>
                    </div>
                  </div>
                )}

                {activeControl === 'printing' && (
                  <div className="space-y-4">
                    <h3 className="text-sm font-medium border-b border-white/10 pb-2">Printers & Scanners</h3>
                    <div className="flex flex-col items-center py-8 text-white/20">
                      <PrinterIcon size={48} className="mb-4 opacity-10" />
                      <p className="text-xs">No printers installed</p>
                      <button className="mt-4 px-4 py-2 bg-white/5 hover:bg-white/10 rounded-lg text-[10px] transition-colors">Add Printer</button>
                    </div>
                  </div>
                )}

                {activeControl === 'users' && (
                  <div className="space-y-4">
                    <h3 className="text-sm font-medium border-b border-white/10 pb-2">User Accounts</h3>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between p-3 rounded-xl bg-white/5">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-blue-500/20 flex items-center justify-center text-blue-400">
                            <User size={16} />
                          </div>
                          <div className="flex flex-col">
                            <span className="text-xs font-medium">{userName}</span>
                            <span className="text-[10px] text-white/40">Administrator</span>
                          </div>
                        </div>
                        <button className="text-[10px] text-blue-400 hover:underline">Manage</button>
                      </div>
                    </div>
                  </div>
                )}

                {activeControl === 'security' && (
                  <div className="space-y-4">
                    <h3 className="text-sm font-medium border-b border-white/10 pb-2">Security & Passwords</h3>
                    <div className="space-y-4">
                      <button className="w-full flex items-center justify-between p-3 rounded-xl bg-white/5 hover:bg-white/10 transition-all">
                        <div className="flex items-center gap-3">
                          <Lock size={16} className="text-red-400" />
                          <span className="text-xs">Change Password</span>
                        </div>
                        <ChevronRight size={14} className="text-white/20" />
                      </button>
                      <div className="flex items-center justify-between p-3 rounded-xl bg-green-500/10 border border-green-500/20">
                        <div className="flex items-center gap-3">
                          <Shield size={16} className="text-green-400" />
                          <span className="text-xs text-green-400">Firewall Active</span>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {activeControl === 'text' && (
                  <div className="space-y-4">
                    <h3 className="text-sm font-medium border-b border-white/10 pb-2">Text & Typography</h3>
                    <div className="space-y-6">
                      <div className="space-y-2">
                        <div className="flex justify-between text-xs">
                          <span className="text-white/70">Font Size</span>
                          <span>Medium (100%)</span>
                        </div>
                        <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
                          <div className="h-full bg-emerald-400 w-[50%]" />
                        </div>
                      </div>
                      <div className="p-4 bg-white/5 rounded-xl border border-white/10">
                        <p className="text-xs leading-relaxed">The quick brown fox jumps over the lazy dog.</p>
                      </div>
                    </div>
                  </div>
                )}

                {activeControl === 'sounds' && (
                  <div className="space-y-4">
                    <h3 className="text-sm font-medium border-b border-white/10 pb-2">Sound Controls</h3>
                    <div className="space-y-6">
                      <div className="space-y-2">
                        <div className="flex justify-between text-xs">
                          <span className="text-white/70">Master Volume</span>
                          <span>72%</span>
                        </div>
                        <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
                          <div className="h-full bg-amber-400 w-[72%]" />
                        </div>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-white/70">System Sounds</span>
                        <div className="w-8 h-4 bg-blue-500/40 rounded-full relative">
                          <div className="absolute right-1 top-1 w-2 h-2 bg-white rounded-full" />
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </motion.div>
            )}
          </div>
        )}

        {view === 'extensions' && (
          <div className="flex flex-col gap-6">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-medium">Extension Manager</h2>
              <button 
                onClick={() => addNotification('Extensions', 'Checking for updates...', 'info')}
                className="text-xs px-3 py-1.5 rounded-lg bg-blue-500/20 text-blue-400 hover:bg-blue-500/30 transition-all flex items-center gap-2"
              >
                <RefreshCw size={14} />
                Check for Updates
              </button>
            </div>

            <div className="grid gap-4">
              {extensions.map(ext => (
                <div key={ext.id} className="glass p-5 rounded-2xl flex items-start gap-4 group hover:bg-white/10 transition-all border border-white/5">
                  <div className="w-12 h-12 rounded-xl bg-blue-500/10 flex items-center justify-center text-blue-400 shrink-0">
                    <Package size={24} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <h3 className="text-sm font-semibold truncate">{ext.name}</h3>
                      <span className="text-[10px] text-white/30 font-mono">v{ext.version}</span>
                    </div>
                    <p className="text-xs text-white/50 mb-4 line-clamp-2 leading-relaxed">
                      {ext.description}
                    </p>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <button 
                          onClick={() => addNotification('Extensions', `Settings for ${ext.name}`, 'info')}
                          className="text-[10px] text-white/40 hover:text-white transition-colors flex items-center gap-1.5"
                        >
                          <SettingsIcon size={12} />
                          Settings
                        </button>
                        <button 
                          onClick={() => {
                            setExtensions(prev => prev.filter(e => e.id !== ext.id));
                            addNotification('Extensions', `${ext.name} uninstalled`, 'warning');
                          }}
                          className="text-[10px] text-red-400/60 hover:text-red-400 transition-colors flex items-center gap-1.5"
                        >
                          <Trash2 size={12} />
                          Uninstall
                        </button>
                      </div>
                      <button 
                        onClick={() => {
                          setExtensions(prev => prev.map(e => e.id === ext.id ? { ...e, enabled: !e.enabled } : e));
                          addNotification('Extensions', `${ext.name} ${!ext.enabled ? 'enabled' : 'disabled'}`, 'info');
                        }}
                        className={cn(
                          "px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider transition-all",
                          ext.enabled ? "bg-green-500/20 text-green-400" : "bg-white/10 text-white/40"
                        )}
                      >
                        {ext.enabled ? 'Enabled' : 'Disabled'}
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {extensions.length === 0 && (
              <div className="h-64 flex flex-col items-center justify-center text-white/20 gap-4">
                <Package size={48} />
                <p className="text-sm">No extensions installed</p>
                <button 
                  onClick={() => addNotification('Extensions', 'Opening Extension Store...', 'info')}
                  className="glass-button text-xs"
                >
                  Browse Store
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

function NotepadApp({ 
  notepadContent, 
  setNotepadContent, 
  activeFileInNotepad, 
  setActiveFileInNotepad,
  setFs, 
  fs, 
  addNotification,
  clipboardHistory,
  setClipboardHistory,
  closeWindow
}: any) {
  const [activeMenu, setActiveMenu] = useState<string | null>(null);
  const [showOpenDialog, setShowOpenDialog] = useState(false);
  const [showSaveDialog, setShowSaveDialog] = useState(false);
  const [saveFileName, setSaveFileName] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleSave = () => {
    if (!activeFileInNotepad) {
      setShowSaveDialog(true);
      return;
    }

    const updateFileContent = (items: FileSystemItem[], path: string[], fileName: string, content: string): FileSystemItem[] => {
      if (path.length === 0) {
        return items.map(item => item.name === fileName ? { ...item, content } : item);
      }
      const [first, ...rest] = path;
      return items.map(item => {
        if (item.name === first && item.type === 'folder' && item.children) {
          return { ...item, children: updateFileContent(item.children, rest, fileName, content) };
        }
        return item;
      });
    };

    setFs((prev: FileSystemItem[]) => updateFileContent(prev, activeFileInNotepad.path, activeFileInNotepad.name, notepadContent));
    addNotification('Notepad', `Saved ${activeFileInNotepad.name}`, 'success');
  };

  const handleNew = () => {
    setNotepadContent('');
    setActiveFileInNotepad(null);
    addNotification('Notepad', 'New file created', 'info');
  };

  const handleOpen = (file: FileSystemItem, path: string[]) => {
    if (file.type === 'file') {
      setNotepadContent(file.content || '');
      setActiveFileInNotepad({ name: file.name, path });
      setShowOpenDialog(false);
      addNotification('Notepad', `Opened ${file.name}`, 'info');
    }
  };

  const handleSaveAs = () => {
    if (!saveFileName.trim()) return;
    const baseName = saveFileName.endsWith('.txt') ? saveFileName.slice(0, -4) : saveFileName;
    let fileName = `${baseName}.txt`;
    
    // Check for existing Documents folder
    const docsFolder = fs.find((i: any) => i.name === 'Documents' && i.type === 'folder');
    const targetPath = docsFolder ? ['Documents'] : [];
    const targetChildren = docsFolder ? docsFolder.children : fs;

    // Ensure unique name
    let counter = 1;
    while (targetChildren.some((i: any) => i.name === fileName)) {
      fileName = `${baseName} (${counter++}).txt`;
    }
    
    const newFile: FileSystemItem = {
      name: fileName,
      type: 'file',
      content: notepadContent,
      permissions: DEFAULT_PERMISSIONS
    };

    const updateFs = (items: FileSystemItem[]): FileSystemItem[] => {
      if (docsFolder) {
        return items.map(item => {
          if (item.name === 'Documents' && item.type === 'folder' && item.children) {
            return { ...item, children: [...item.children, newFile] };
          }
          return item;
        });
      } else {
        return [...items, newFile];
      }
    };

    setFs((prev: FileSystemItem[]) => updateFs(prev));
    setActiveFileInNotepad({ name: fileName, path: targetPath });
    setShowSaveDialog(false);
    addNotification('Notepad', `Saved as ${fileName} in ${docsFolder ? '/Documents' : 'root'}`, 'success');
  };

  const handleEdit = async (action: 'cut' | 'copy' | 'paste') => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = notepadContent.substring(start, end);

    if (action === 'copy' || action === 'cut') {
      if (selectedText) {
        try {
          await navigator.clipboard.writeText(selectedText);
          setClipboardHistory((prev: string[]) => {
            const filtered = prev.filter(item => item !== selectedText);
            return [selectedText, ...filtered].slice(0, 50);
          });
          
          if (action === 'cut') {
            const newContent = notepadContent.substring(0, start) + notepadContent.substring(end);
            setNotepadContent(newContent);
          }
          addNotification('Notepad', `Text ${action === 'cut' ? 'cut' : 'copied'} to clipboard`, 'info');
        } catch (err) {
          addNotification('Notepad', 'Failed to copy to clipboard', 'error');
        }
      }
    } else if (action === 'paste') {
      try {
        // Try to read from system clipboard first
        const textToPaste = await navigator.clipboard.readText();
        
        if (textToPaste && textToPaste.trim()) {
          const newContent = notepadContent.substring(0, start) + textToPaste + notepadContent.substring(end);
          setNotepadContent(newContent);
          
          // Clear system clipboard as requested
          await navigator.clipboard.writeText('');
          
          // Also remove from history
          setClipboardHistory((prev: string[]) => prev.filter(item => item !== textToPaste));
          
          addNotification('Notepad', 'Text pasted and cleared from clipboard', 'success');
        } else if (clipboardHistory.length > 0) {
          // Fallback to history if system clipboard is empty but history has items
          const historyText = clipboardHistory[0];
          const newContent = notepadContent.substring(0, start) + historyText + notepadContent.substring(end);
          setNotepadContent(newContent);
          setClipboardHistory((prev: string[]) => prev.slice(1));
          addNotification('Notepad', 'Text pasted from history', 'info');
        } else {
          addNotification('Notepad', 'Clipboard is empty', 'warning');
        }
      } catch (err) {
        // Fallback to history if clipboard API fails (common in some browsers/iframes)
        if (clipboardHistory.length > 0) {
          const historyText = clipboardHistory[0];
          const newContent = notepadContent.substring(0, start) + historyText + notepadContent.substring(end);
          setNotepadContent(newContent);
          setClipboardHistory((prev: string[]) => prev.slice(1));
          addNotification('Notepad', 'Text pasted from history', 'info');
        } else {
          addNotification('Notepad', 'Could not access clipboard', 'error');
        }
      }
    }
  };

  const getAllFiles = (items: FileSystemItem[], path: string[] = []): {file: FileSystemItem, path: string[]}[] => {
    let files: {file: FileSystemItem, path: string[]}[] = [];
    items.forEach(item => {
      if (item.type === 'file' && (item.name.endsWith('.txt') || item.name.endsWith('.sys') || item.content !== undefined)) {
        files.push({ file: item, path });
      }
      if (item.children) {
        files = [...files, ...getAllFiles(item.children, [...path, item.name])];
      }
    });
    return files;
  };

  return (
    <div className="h-full flex flex-col relative" onClick={() => setActiveMenu(null)}>
      {/* Menu Bar */}
      <div className="h-8 bg-white/5 border-b border-white/10 flex items-center px-2 gap-1 text-[11px]">
        <div className="relative">
          <button 
            onClick={(e) => { e.stopPropagation(); setActiveMenu(activeMenu === 'file' ? null : 'file'); }}
            className={cn("px-3 py-1 rounded hover:bg-white/10 transition-colors", activeMenu === 'file' && "bg-white/10")}
          >
            File
          </button>
          <AnimatePresence>
            {activeMenu === 'file' && (
              <motion.div 
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 5 }}
                className="absolute top-full left-0 w-48 glass-dark border border-white/20 rounded-xl shadow-2xl z-50 py-2 mt-1"
              >
                <MenuButton icon={<FilePlus size={14} />} label="New File" onClick={handleNew} />
                <MenuButton icon={<Folder size={14} />} label="Open File..." onClick={() => setShowOpenDialog(true)} />
                <MenuButton icon={<Save size={14} />} label="Save" onClick={handleSave} />
                <div className="h-px bg-white/10 my-1 mx-2" />
                <MenuButton icon={<Printer size={14} />} label="Print File" onClick={() => addNotification('System', 'Printer not found', 'error')} />
                <div className="relative group/sub">
                  <button className="w-full px-4 py-1.5 flex items-center justify-between hover:bg-blue-500/20 text-white/70 hover:text-white transition-all">
                    <div className="flex items-center gap-3">
                      <Mail size={14} />
                      <span>Send File</span>
                    </div>
                    <ChevronRight size={12} />
                  </button>
                  <div className="absolute top-0 left-full ml-1 w-40 glass-dark border border-white/20 rounded-xl shadow-2xl hidden group-hover/sub:block py-2">
                    <MenuButton label="Email" onClick={() => addNotification('Notepad', 'Email service unavailable', 'warning')} />
                  </div>
                </div>
                <div className="h-px bg-white/10 my-1 mx-2" />
                <MenuButton icon={<LogOut size={14} />} label="Quit" onClick={() => closeWindow('notepad')} variant="danger" />
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <div className="relative">
          <button 
            onClick={(e) => { e.stopPropagation(); setActiveMenu(activeMenu === 'edit' ? null : 'edit'); }}
            className={cn("px-3 py-1 rounded hover:bg-white/10 transition-colors", activeMenu === 'edit' && "bg-white/10")}
          >
            Edit
          </button>
          <AnimatePresence>
            {activeMenu === 'edit' && (
              <motion.div 
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 5 }}
                className="absolute top-full left-0 w-48 glass-dark border border-white/20 rounded-xl shadow-2xl z-50 py-2 mt-1"
              >
                <MenuButton icon={<Scissors size={14} />} label="Cut" onClick={() => handleEdit('cut')} />
                <MenuButton icon={<Copy size={14} />} label="Copy" onClick={() => handleEdit('copy')} />
                <MenuButton icon={<Clipboard size={14} />} label="Paste" onClick={() => handleEdit('paste')} />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Status Bar */}
      <div className="h-6 bg-white/5 border-b border-white/10 flex items-center px-4 justify-between">
        <div className="flex items-center gap-2">
          <FileText size={12} className="text-white/40" />
          <span className="text-[9px] text-white/60 truncate max-w-[200px]">
            {activeFileInNotepad ? `/${activeFileInNotepad.path.join('/')}/${activeFileInNotepad.name}` : 'Untitled.txt'}
          </span>
        </div>
        <div className="text-[9px] text-white/30 uppercase tracking-widest">
          UTF-8 • {notepadContent.length} chars
        </div>
      </div>

      <textarea 
        ref={textareaRef}
        className="flex-1 bg-transparent p-6 outline-none resize-none font-mono text-sm leading-relaxed selection:bg-blue-500/30"
        placeholder="Start typing your thoughts..."
        value={notepadContent}
        onChange={(e) => setNotepadContent(e.target.value)}
      />

      {/* Open Dialog */}
      <AnimatePresence>
        {showOpenDialog && (
          <div className="absolute inset-0 z-[60] flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setShowOpenDialog(false)} className="absolute inset-0 bg-black/40 backdrop-blur-sm" />
            <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }} className="relative w-full max-w-md glass-dark rounded-3xl border border-white/20 shadow-2xl overflow-hidden flex flex-col max-h-[80%]">
              <div className="p-4 border-b border-white/10 flex items-center justify-between">
                <h3 className="text-sm font-medium">Open File</h3>
                <button onClick={() => setShowOpenDialog(false)}><X size={16} /></button>
              </div>
              <div className="flex-1 overflow-y-auto p-2 no-scrollbar">
                {getAllFiles(fs).map(({file, path}, i) => (
                  <button 
                    key={i}
                    onClick={() => handleOpen(file, path)}
                    className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-white/10 transition-all text-left group"
                  >
                    <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center text-white/40 group-hover:text-blue-400">
                      <FileText size={16} />
                    </div>
                    <div>
                      <div className="text-xs font-medium">{file.name}</div>
                      <div className="text-[9px] text-white/30">/{path.join('/')}</div>
                    </div>
                  </button>
                ))}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Save Dialog */}
      <AnimatePresence>
        {showSaveDialog && (
          <div className="absolute inset-0 z-[60] flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setShowSaveDialog(false)} className="absolute inset-0 bg-black/40 backdrop-blur-sm" />
            <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }} className="relative w-full max-w-md glass-dark rounded-3xl border border-white/20 shadow-2xl overflow-hidden">
              <div className="p-4 border-b border-white/10">
                <h3 className="text-sm font-medium">Save File</h3>
              </div>
              <div className="p-6 space-y-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-white/30 uppercase">File Name</label>
                  <div className="flex items-center gap-2">
                    <input 
                      autoFocus
                      className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-sm outline-none focus:border-blue-500/50 transition-all"
                      placeholder="my-notes"
                      value={saveFileName}
                      onChange={e => setSaveFileName(e.target.value)}
                      onKeyDown={e => e.key === 'Enter' && handleSaveAs()}
                    />
                    <span className="text-xs text-white/30">.txt</span>
                  </div>
                </div>
                <div className="p-3 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center gap-3">
                  <Folder size={16} className="text-blue-400" />
                  <span className="text-[10px] text-blue-400 font-medium uppercase tracking-wider">Saving to /Documents</span>
                </div>
              </div>
              <div className="p-4 bg-white/5 border-t border-white/10 flex justify-end gap-3">
                <button onClick={() => setShowSaveDialog(false)} className="text-xs text-white/40 hover:text-white">Cancel</button>
                <button onClick={handleSaveAs} className="glass-button text-xs text-blue-400 border-blue-500/20">Save File</button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

function MenuButton({ icon, label, onClick, variant = 'default' }: { icon?: React.ReactNode, label: string, onClick: () => void, variant?: 'default' | 'danger' }) {
  return (
    <button 
      onClick={(e) => { e.stopPropagation(); onClick(); }}
      className={cn(
        "w-full px-4 py-1.5 flex items-center gap-3 transition-all",
        variant === 'danger' ? "hover:bg-red-500/20 text-red-400" : "hover:bg-blue-500/20 text-white/70 hover:text-white"
      )}
    >
      {icon}
      <span>{label}</span>
    </button>
  );
}

function BrowserApp({ addNotification }: any) {
  interface BrowserTab {
    id: string;
    url: string;
  }

  const [tabs, setTabs] = useState<BrowserTab[]>([
    { id: '1', url: 'https://www.wikipedia.org' }
  ]);
  const [activeTabId, setActiveTabId] = useState('1');
  const [urlInput, setUrlInput] = useState('https://www.wikipedia.org');

  const activeTab = useMemo(() => 
    tabs.find(t => t.id === activeTabId) || tabs[0],
    [tabs, activeTabId]
  );

  useEffect(() => {
    setUrlInput(activeTab.url);
  }, [activeTabId, activeTab.url]);

  const handleGo = (e?: React.FormEvent) => {
    e?.preventDefault();
    let target = urlInput;
    if (!target.startsWith('http')) target = 'https://' + target;
    
    setTabs(prev => prev.map(t => t.id === activeTabId ? { ...t, url: target } : t));
    addNotification('Browser', `Navigating to ${target}`, 'info');
  };

  const addTab = () => {
    const newId = Math.random().toString(36).substr(2, 9);
    const newTab = { id: newId, url: 'https://www.google.com/search?igu=1' };
    setTabs(prev => [...prev, newTab]);
    setActiveTabId(newId);
    addNotification('Browser', 'New tab opened', 'info');
  };

  const closeTab = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    if (tabs.length === 1) return;
    const remaining = tabs.filter(t => t.id !== id);
    setTabs(remaining);
    if (activeTabId === id) {
      setActiveTabId(remaining[remaining.length - 1].id);
    }
    addNotification('Browser', 'Tab closed', 'info');
  };

  return (
    <div className="h-full flex flex-col bg-white">
      {/* Tab Bar */}
      <div className="h-10 bg-slate-200 border-b border-slate-300 flex items-center px-2 gap-1 overflow-x-auto no-scrollbar">
        {tabs.map(tab => (
          <div
            key={tab.id}
            onClick={() => setActiveTabId(tab.id)}
            className={cn(
              "h-8 px-3 rounded-t-lg flex items-center gap-2 cursor-pointer transition-all min-w-[120px] max-w-[200px] border-x border-t border-transparent",
              activeTabId === tab.id ? "bg-white border-slate-300 text-slate-800" : "hover:bg-slate-300 text-slate-500"
            )}
          >
            <Globe size={12} />
            <span className="text-[10px] truncate flex-1">
              {tab.url.replace('https://', '').replace('www.', '').split('/')[0] || 'New Tab'}
            </span>
            {tabs.length > 1 && (
              <button 
                onClick={(e) => closeTab(e, tab.id)}
                className="p-0.5 hover:bg-slate-200 rounded transition-colors"
              >
                <X size={10} />
              </button>
            )}
          </div>
        ))}
        <button 
          onClick={addTab}
          className="p-1.5 hover:bg-slate-300 rounded-md transition-colors text-slate-500"
        >
          <Plus size={14} />
        </button>
      </div>

      {/* Address Bar */}
      <div className="h-12 bg-white border-b border-slate-200 flex items-center px-4 gap-4">
        <div className="flex gap-2">
          <button className="p-1.5 hover:bg-slate-100 rounded-full transition-colors text-slate-400">
            <SkipBack size={16} />
          </button>
          <button className="p-1.5 hover:bg-slate-100 rounded-full transition-colors text-slate-400">
            <SkipForward size={16} />
          </button>
          <button onClick={() => handleGo()} className="p-1.5 hover:bg-slate-100 rounded-full transition-colors text-slate-500">
            <RefreshCw size={16} />
          </button>
        </div>
        <form onSubmit={handleGo} className="flex-1">
          <input 
            className="w-full bg-slate-100 border border-slate-200 rounded-full px-4 py-1.5 text-xs text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:bg-white transition-all"
            value={urlInput}
            onChange={(e) => setUrlInput(e.target.value)}
          />
        </form>
      </div>

      {/* Content */}
      <div className="flex-1 relative bg-white">
        {tabs.map(tab => (
          <div 
            key={tab.id} 
            className={cn("absolute inset-0", activeTabId === tab.id ? "block" : "hidden")}
          >
            <iframe 
              src={tab.url} 
              className="w-full h-full border-none"
              title={`Browser Content ${tab.id}`}
            />
          </div>
        ))}
        <div className="absolute bottom-4 right-4 bg-white/80 backdrop-blur-sm border border-slate-200 p-2 rounded-lg text-[10px] text-slate-500 pointer-events-none shadow-sm">
          Note: Some sites block embedding for security.
        </div>
      </div>
    </div>
  );
}

function PhotosApp({ addNotification }: any) {
  const photos = [
    'https://images.unsplash.com/photo-1501785888041-af3ef285b470?q=80&w=800&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?q=80&w=800&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?q=80&w=800&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1500673922987-e212871fec22?q=80&w=800&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?q=80&w=800&auto=format&fit=crop',
  ];

  return (
    <div className="h-full p-4 overflow-y-auto">
      <div className="grid grid-cols-3 gap-4">
        {photos.map((p, i) => (
          <motion.div 
            key={i}
            whileHover={{ scale: 1.05 }}
            onClick={() => addNotification('Photos', `Viewing image ${i + 1}`, 'info')}
            className="aspect-square rounded-xl overflow-hidden glass cursor-pointer"
          >
            <img src={p} alt={`Photo ${i}`} className="w-full h-full object-cover" />
          </motion.div>
        ))}
      </div>
    </div>
  );
}

function MusicApp({ addNotification }: any) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(35);

  return (
    <div className="h-full flex flex-col items-center justify-center p-8 bg-gradient-to-br from-purple-900/20 to-blue-900/20">
      <div className="w-48 h-48 glass rounded-2xl mb-8 flex items-center justify-center shadow-2xl relative overflow-hidden group">
        <Music size={64} className="text-white/20 group-hover:scale-110 transition-transform" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
      </div>
      
      <div className="text-center mb-8">
        <h2 className="text-xl font-medium mb-1">Glass Symphony</h2>
        <p className="text-sm text-white/40">GlassOS Orchestra</p>
      </div>

      <div className="w-full max-md mb-8">
        <div className="h-1 w-full bg-white/10 rounded-full mb-2 relative cursor-pointer">
          <div 
            className="absolute top-0 left-0 h-full bg-blue-400 rounded-full" 
            style={{ width: `${progress}%` }}
          />
          <div 
            className="absolute top-1/2 -translate-y-1/2 w-3 h-3 bg-white rounded-full shadow-lg"
            style={{ left: `${progress}%` }}
          />
        </div>
        <div className="flex justify-between text-[10px] text-white/30">
          <span>1:24</span>
          <span>3:45</span>
        </div>
      </div>

      <div className="flex items-center gap-8">
        <button className="text-white/50 hover:text-white transition-colors"><SkipBack size={24} /></button>
        <button 
          onClick={() => {
            setIsPlaying(!isPlaying);
            addNotification('Media Player', !isPlaying ? 'Playing: Glass Symphony' : 'Paused', 'info');
          }}
          className="w-16 h-16 glass rounded-full flex items-center justify-center hover:bg-white/20 transition-all"
        >
          {isPlaying ? <Pause size={32} /> : <Play size={32} className="ml-1" />}
        </button>
        <button className="text-white/50 hover:text-white transition-colors"><SkipForward size={24} /></button>
      </div>
    </div>
  );
}

function FilesApp({ fs, setFs, openWindow, setNotepadContent, setActiveFileInNotepad, setContextMenu, addNotification }: any) {
  const [currentPath, setCurrentPath] = useState<string[]>(['Documents']);
  const [editingItem, setEditingItem] = useState<{ path: string[], name: string } | null>(null);
  const [newName, setNewName] = useState('');
  const [draggedItem, setDraggedItem] = useState<{ name: string, path: string[] } | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [propertiesItem, setPropertiesItem] = useState<FileSystemItem | null>(null);
  const [propertiesTab, setPropertiesTab] = useState<'permissions' | 'sharing'>('permissions');
  const [activeMenu, setActiveMenu] = useState<string | null>(null);

  const currentFolder = useMemo(() => {
    let current = fs;
    for (const segment of currentPath) {
      const found = current.find(item => item.name === segment && item.type === 'folder');
      if (found && found.children) {
        current = found.children;
      } else {
        return [];
      }
    }
    return current;
  }, [fs, currentPath]);

  const getFileIcon = (name: string, type: 'file' | 'folder') => {
    if (type === 'folder') return <Folder size={20} className="text-blue-400" />;
    const ext = name.split('.').pop()?.toLowerCase();
    switch (ext) {
      case 'txt': return <FileTextIcon size={20} className="text-white/60" />;
      case 'jpg':
      case 'png': return <ImageIcon size={20} className="text-purple-400" />;
      case 'sys': return <Cpu size={20} className="text-red-400" />;
      case 'b': return <FileCode size={20} className="text-green-400" />;
      case 'json': return <FileJson size={20} className="text-yellow-400" />;
      default: return <FileText size={20} className="text-white/40" />;
    }
  };

  const handleRename = (oldName: string) => {
    if (!newName.trim()) return;
    
    const updateFs = (items: FileSystemItem[], path: string[]): FileSystemItem[] => {
      if (path.length === 0) {
        return items.map(item => item.name === oldName ? { ...item, name: newName.trim() } : item);
      }
      const [first, ...rest] = path;
      return items.map(item => {
        if (item.name === first && item.type === 'folder' && item.children) {
          return { ...item, children: updateFs(item.children, rest) };
        }
        return item;
      });
    };

    setFs(prev => updateFs(prev, currentPath));
    addNotification('File Explorer', `Renamed ${oldName} to ${newName.trim()}`, 'success');
    setEditingItem(null);
    setNewName('');
  };

  const handleDelete = (name: string) => {
    let itemToDelete: FileSystemItem | null = null;

    const removeItem = (items: FileSystemItem[], path: string[]): FileSystemItem[] => {
      if (path.length === 0) {
        const filtered = items.filter(item => {
          if (item.name === name) {
            itemToDelete = item;
            return false;
          }
          return true;
        });
        return filtered;
      }
      const [first, ...rest] = path;
      return items.map(item => {
        if (item.name === first && item.type === 'folder' && item.children) {
          return { ...item, children: removeItem(item.children, rest) };
        }
        return item;
      });
    };

    setFs(prev => {
      const newFs = removeItem(prev, currentPath);
      if (itemToDelete && currentPath[0] !== 'Trash') {
        addNotification('File Explorer', `Moved to Trash: ${name}`, 'warning');
        return newFs.map(item => {
          if (item.name === 'Trash' && item.type === 'folder' && item.children) {
            return { ...item, children: [...item.children, itemToDelete!] };
          }
          return item;
        });
      }
      return newFs;
    });
  };

  const handleMove = (itemName: string, sourcePath: string[], targetPath: string[]) => {
    if (JSON.stringify(sourcePath) === JSON.stringify(targetPath)) return;
    
    // Prevent moving a folder into itself or its subfolders
    if (targetPath.join('/').startsWith(sourcePath.concat(itemName).join('/'))) {
      return;
    }

    let itemToMove: FileSystemItem | null = null;

    const removeItem = (items: FileSystemItem[], path: string[]): FileSystemItem[] => {
      if (path.length === 0) {
        return items.filter(item => {
          if (item.name === itemName) {
            itemToMove = item;
            return false;
          }
          return true;
        });
      }
      const [first, ...rest] = path;
      return items.map(item => {
        if (item.name === first && item.type === 'folder' && item.children) {
          return { ...item, children: removeItem(item.children, rest) };
        }
        return item;
      });
    };

    const addItem = (items: FileSystemItem[], path: string[]): FileSystemItem[] => {
      if (path.length === 0) {
        if (!itemToMove) return items;
        // Check if item already exists in target
        if (items.some(i => i.name === itemName)) {
          addNotification('File Explorer', `An item named "${itemName}" already exists in the target folder.`, 'error');
          return items;
        }
        return [...items, itemToMove];
      }
      const [first, ...rest] = path;
      return items.map(item => {
        if (item.name === first && item.type === 'folder' && item.children) {
          return { ...item, children: addItem(item.children, rest) };
        }
        return item;
      });
    };

    setFs(prev => {
      const fsWithoutItem = removeItem(prev, sourcePath);
      if (!itemToMove) return prev;
      const newFs = addItem(fsWithoutItem, targetPath);
      addNotification('File Explorer', `Moved ${itemName} to /${targetPath.join('/') || 'Root'}`, 'success');
      return newFs;
    });
  };

  const handleEmptyTrash = () => {
    setFs(prev => prev.map(item => {
      if (item.name === 'Trash' && item.type === 'folder') {
        addNotification('File Explorer', 'Trash emptied', 'success');
        return { ...item, children: [] };
      }
      return item;
    }));
  };

  const onDragStart = (e: React.DragEvent, name: string) => {
    setDraggedItem({ name, path: currentPath });
    e.dataTransfer.setData('text/plain', name);
    e.dataTransfer.effectAllowed = 'move';
  };

  const onDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const onDrop = (e: React.DragEvent, targetPath: string[]) => {
    e.preventDefault();
    if (draggedItem) {
      handleMove(draggedItem.name, draggedItem.path, targetPath);
      setDraggedItem(null);
    }
  };

  const handleUpdatePermissions = (itemName: string, newPermissions: Permissions) => {
    const updateFs = (items: FileSystemItem[], path: string[]): FileSystemItem[] => {
      if (path.length === 0) {
        return items.map(item => item.name === itemName ? { ...item, permissions: newPermissions } : item);
      }
      const [first, ...rest] = path;
      return items.map(item => {
        if (item.name === first && item.type === 'folder' && item.children) {
          return { ...item, children: updateFs(item.children, rest) };
        }
        return item;
      });
    };

    setFs(prev => updateFs(prev, currentPath));
    setPropertiesItem(prev => prev ? { ...prev, permissions: newPermissions } : null);
  };

  const createNewItem = (type: 'file' | 'folder') => {
    const baseName = type === 'folder' ? 'New Folder' : 'New File.txt';
    let name = baseName;
    let counter = 1;

    while (currentFolder.some(item => item.name === name)) {
      if (type === 'folder') {
        name = `${baseName} ${counter++}`;
      } else {
        name = `New File ${counter++}.txt`;
      }
    }

    const newItem: FileSystemItem = {
      name,
      type,
      permissions: DEFAULT_PERMISSIONS,
      ...(type === 'file' ? { content: '' } : { children: [] })
    };

    const updateFs = (items: FileSystemItem[], path: string[]): FileSystemItem[] => {
      if (path.length === 0) {
        return [...items, newItem];
      }
      const [first, ...rest] = path;
      return items.map(item => {
        if (item.name === first && item.type === 'folder' && item.children) {
          return { ...item, children: updateFs(item.children, rest) };
        }
        return item;
      });
    };

    setFs((prev: FileSystemItem[]) => updateFs(prev, currentPath));
    addNotification('File Explorer', `Created new ${type}: ${name}`, 'success');
    setEditingItem({ path: currentPath, name });
    setNewName(name);
    setActiveMenu(null);
  };

  const duplicateItem = (item: FileSystemItem) => {
    const nameParts = item.name.split('.');
    const ext = nameParts.length > 1 ? `.${nameParts.pop()}` : '';
    const baseName = nameParts.join('.');
    let name = `${baseName} (Copy)${ext}`;
    let counter = 1;

    while (currentFolder.some(i => i.name === name)) {
      name = `${baseName} (Copy ${counter++})${ext}`;
    }

    const newItem: FileSystemItem = {
      ...item,
      name,
      permissions: { ...item.permissions }
    };

    const updateFs = (items: FileSystemItem[], path: string[]): FileSystemItem[] => {
      if (path.length === 0) {
        return [...items, newItem];
      }
      const [first, ...rest] = path;
      return items.map(item => {
        if (item.name === first && item.type === 'folder' && item.children) {
          return { ...item, children: updateFs(item.children, rest) };
        }
        return item;
      });
    };

    setFs((prev: FileSystemItem[]) => updateFs(prev, currentPath));
    addNotification('File Explorer', `Duplicated: ${item.name}`, 'success');
    setActiveMenu(null);
  };

  const filteredFolder = useMemo(() => {
    if (!searchQuery.trim()) return currentFolder;
    return currentFolder.filter(item => 
      item.name.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [currentFolder, searchQuery]);

  return (
    <div className="h-full flex flex-col relative">
      {/* Menu Bar */}
      <div className="h-7 bg-white/5 border-b border-white/10 flex items-center px-4 gap-4 z-[60]">
        <div className="relative">
          <button 
            onClick={() => setActiveMenu(activeMenu === 'file' ? null : 'file')}
            className={cn("text-[11px] hover:text-white transition-colors h-full px-2", activeMenu === 'file' && "bg-white/10")}
          >
            File
          </button>
          <AnimatePresence>
            {activeMenu === 'file' && (
              <>
                <div className="fixed inset-0" onClick={() => setActiveMenu(null)} />
                <motion.div 
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 5 }}
                  className="absolute top-full left-0 w-48 glass-dark border border-white/10 rounded-lg shadow-2xl py-1 mt-1 z-[70]"
                >
                  <button 
                    onClick={() => createNewItem('folder')}
                    className="w-full text-left px-4 py-1.5 text-[11px] hover:bg-blue-500/20 flex items-center justify-between group"
                  >
                    <span>New Folder</span>
                    <span className="text-white/20 group-hover:text-white/40">Ctrl+N</span>
                  </button>
                  <button 
                    onClick={() => createNewItem('file')}
                    className="w-full text-left px-4 py-1.5 text-[11px] hover:bg-blue-500/20 flex items-center justify-between group"
                  >
                    <span>New File</span>
                    <span className="text-white/20 group-hover:text-white/40">Ctrl+Shift+N</span>
                  </button>
                  <div className="h-px bg-white/10 my-1" />
                  <button 
                    onClick={() => setActiveMenu(null)}
                    className="w-full text-left px-4 py-1.5 text-[11px] hover:bg-blue-500/20 flex items-center justify-between group"
                  >
                    <span>Open Folder...</span>
                    <span className="text-white/20 group-hover:text-white/40">Ctrl+O</span>
                  </button>
                  <button 
                    onClick={() => setActiveMenu(null)}
                    className="w-full text-left px-4 py-1.5 text-[11px] hover:bg-blue-500/20 flex items-center justify-between group"
                  >
                    <span>Open File...</span>
                  </button>
                  <div className="h-px bg-white/10 my-1" />
                  <button 
                    disabled={true}
                    className="w-full text-left px-4 py-1.5 text-[11px] text-white/20 cursor-not-allowed flex items-center justify-between group"
                  >
                    <span>Duplicate</span>
                    <span className="text-white/10">Ctrl+D</span>
                  </button>
                </motion.div>
              </>
            )}
          </AnimatePresence>
        </div>
        <button className="text-[11px] text-white/40 cursor-default">Edit</button>
        <button className="text-[11px] text-white/40 cursor-default">View</button>
        <button className="text-[11px] text-white/40 cursor-default">Go</button>
      </div>

      <div className="h-10 bg-white/5 border-b border-white/10 flex items-center px-4 justify-between">
        <div className="flex items-center gap-2">
          <button 
            onClick={() => setCurrentPath([])}
            className="p-1.5 hover:bg-white/10 rounded-md transition-colors text-white/40"
          >
            <HardDrive size={14} />
          </button>
          <ChevronRight size={12} className="text-white/20" />
          {currentPath.map((segment, i) => (
            <React.Fragment key={i}>
              <button 
                onClick={() => setCurrentPath(currentPath.slice(0, i + 1))}
                className="text-[11px] hover:text-white transition-colors text-white/60"
              >
                {segment}
              </button>
              {i < currentPath.length - 1 && <ChevronRight size={12} className="text-white/20" />}
            </React.Fragment>
          ))}
        </div>

        <div className="flex items-center gap-4">
          {currentPath[0] === 'Trash' && currentPath.length === 1 && (
            <button 
              onClick={handleEmptyTrash}
              className="flex items-center gap-1.5 px-3 py-1 bg-red-500/20 hover:bg-red-500/30 text-red-400 rounded-full text-[10px] font-medium transition-all"
            >
              <Trash2 size={12} />
              Empty Trash
            </button>
          )}
          <div className="relative w-48">
            <Search size={12} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-white/30" />
            <input 
              type="text"
              placeholder="Search files..."
              className="w-full bg-white/5 border border-white/10 rounded-full py-1 pl-8 pr-3 text-[10px] outline-none focus:bg-white/10 focus:border-blue-500/50 transition-all"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            {searchQuery && (
              <button 
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-white/30 hover:text-white"
              >
                <X size={10} />
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="flex-1 flex overflow-hidden">
        {/* Sidebar */}
        <div className="w-40 bg-black/20 border-r border-white/10 p-2 space-y-1">
          {fs.map((folder, idx) => (
            <button 
              key={`${folder.name}-${idx}`}
              onClick={() => setCurrentPath([folder.name])}
              onDragOver={onDragOver}
              onDrop={(e) => onDrop(e, [folder.name])}
              className={cn(
                "w-full flex items-center gap-2 px-3 py-2 rounded-lg text-xs transition-all",
                currentPath[0] === folder.name ? "bg-blue-500/20 text-blue-400" : "text-white/40 hover:bg-white/5"
              )}
            >
              {folder.name === 'Trash' ? <Trash size={14} /> : <Folder size={14} />}
              {folder.name}
            </button>
          ))}
        </div>

        {/* Main Area */}
        <div 
          className="flex-1 p-4 overflow-y-auto"
          onContextMenu={(e) => {
            e.preventDefault();
            setContextMenu({
              x: e.clientX,
              y: e.clientY,
              items: [
                { label: 'New Folder', icon: <Folder size={14} />, onClick: () => createNewItem('folder') },
                { label: 'New File', icon: <FileText size={14} />, onClick: () => createNewItem('file') },
                { label: 'Refresh', icon: <RefreshCw size={14} />, onClick: () => addNotification('System', 'Folder refreshed', 'success') },
                { label: 'Paste', icon: <Clipboard size={14} />, onClick: () => addNotification('System', 'Clipboard is empty', 'warning') },
              ]
            });
          }}
        >
          <div className="grid grid-cols-4 gap-4">
            {filteredFolder.map((item, idx) => (
              <div 
                key={`${item.name}-${item.type}-${idx}`}
                draggable
                onDragStart={(e) => onDragStart(e, item.name)}
                onDragOver={item.type === 'folder' ? onDragOver : undefined}
                onDrop={item.type === 'folder' ? (e) => {
                  e.stopPropagation();
                  onDrop(e, [...currentPath, item.name]);
                } : undefined}
                className={cn(
                  "group relative glass p-4 rounded-xl flex flex-col items-center gap-2 hover:bg-white/10 transition-all cursor-pointer",
                  draggedItem?.name === item.name && "opacity-50"
                )}
                onDoubleClick={() => {
                  if (item.type === 'folder') {
                    setCurrentPath([...currentPath, item.name]);
                  } else {
                    const ext = item.name.split('.').pop()?.toLowerCase();
                    if (ext === 'txt' || ext === 'b' || ext === 'json') {
                      setNotepadContent(item.content || '');
                      setActiveFileInNotepad({ name: item.name, path: currentPath });
                      openWindow('notepad', 'Notepad');
                    } else if (ext === 'jpg' || ext === 'png') {
                      openWindow('photos', 'Photos');
                    } else {
                      addNotification('File Explorer', `No application associated with .${ext} files`, 'warning');
                    }
                  }
                }}
                onContextMenu={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  setContextMenu({
                    x: e.clientX,
                    y: e.clientY,
                    items: [
                      { label: 'Open', icon: <Play size={14} />, onClick: () => {
                        if (item.type === 'folder') setCurrentPath([...currentPath, item.name]);
                        else openWindow('notepad', 'Notepad');
                      }},
                      { label: 'Rename', icon: <Edit2 size={14} />, onClick: () => { setEditingItem({ path: currentPath, name: item.name }); setNewName(item.name); }},
                      { label: 'Duplicate', icon: <Copy size={14} />, onClick: () => duplicateItem(item) },
                      { label: 'Share', icon: <Share2 size={14} />, onClick: () => { setPropertiesItem(item); setPropertiesTab('sharing'); }},
                      { label: 'Permissions', icon: <Shield size={14} />, onClick: () => { setPropertiesItem(item); setPropertiesTab('permissions'); }},
                      { label: 'Move to Trash', icon: <Trash size={14} />, onClick: () => handleDelete(item.name), variant: 'danger' },
                    ]
                  });
                }}
              >
                <div className="w-12 h-12 flex items-center justify-center">
                  {getFileIcon(item.name, item.type)}
                </div>
                
                {editingItem?.name === item.name ? (
                  <input 
                    autoFocus
                    className="w-full bg-white/10 border border-blue-500/50 rounded px-1 py-0.5 text-[10px] text-center outline-none"
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                    onBlur={() => handleRename(item.name)}
                    onKeyDown={(e) => e.key === 'Enter' && handleRename(item.name)}
                  />
                ) : (
                  <span className="text-[11px] text-center truncate w-full">{item.name}</span>
                )}                <div className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 transition-opacity flex gap-1">
                  <button 
                    onClick={(e) => {
                      e.stopPropagation();
                      duplicateItem(item);
                    }}
                    className="p-1 hover:bg-white/10 rounded text-white/40 hover:text-blue-400"
                    title="Duplicate"
                  >
                    <Copy size={10} />
                  </button>
                  <button 
                    onClick={(e) => {
                      e.stopPropagation();
                      setPropertiesItem(item);
                      setPropertiesTab('sharing');
                    }}
                    className="p-1 hover:bg-white/10 rounded text-white/40 hover:text-green-400"
                    title="Share"
                  >
                    <Share2 size={10} />
                  </button>
                  <button 
                    onClick={(e) => {
                      e.stopPropagation();
                      setPropertiesItem(item);
                      setPropertiesTab('permissions');
                    }}
                    className="p-1 hover:bg-white/10 rounded text-white/40 hover:text-blue-400"
                    title="Permissions"
                  >
                    <Shield size={10} />
                  </button>
                  <button 
                    onClick={(e) => {
                      e.stopPropagation();
                      setEditingItem({ path: currentPath, name: item.name });
                      setNewName(item.name);
                    }}
                    className="p-1 hover:bg-white/10 rounded text-white/40 hover:text-blue-400"
                  >
                    <Edit2 size={10} />
                  </button>
                  <button 
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDelete(item.name);
                    }}
                    className="p-1 hover:bg-white/10 rounded text-white/40 hover:text-red-400"
                  >
                    <Trash size={10} />
                  </button>
                </div>
              </div>
            ))}
          </div>
          {filteredFolder.length === 0 && (
            <div className="h-full flex flex-col items-center justify-center text-white/20 gap-2">
              <Folder size={48} strokeWidth={1} />
              <span className="text-xs">
                {searchQuery ? `No results for "${searchQuery}"` : "This folder is empty"}
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Properties Dialog */}
      <AnimatePresence>
        {propertiesItem && (
          <div className="absolute inset-0 z-50 flex items-center justify-center p-8">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setPropertiesItem(null)}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative w-full max-w-md glass-dark rounded-2xl border border-white/20 shadow-2xl overflow-hidden flex flex-col"
            >
              <div className="p-4 border-b border-white/10 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="flex bg-white/5 p-1 rounded-lg">
                    <button 
                      onClick={() => setPropertiesTab('permissions')}
                      className={cn(
                        "px-3 py-1 rounded-md text-[10px] font-bold transition-all",
                        propertiesTab === 'permissions' ? "bg-blue-500/20 text-blue-400" : "text-white/30 hover:text-white/60"
                      )}
                    >
                      PERMISSIONS
                    </button>
                    <button 
                      onClick={() => setPropertiesTab('sharing')}
                      className={cn(
                        "px-3 py-1 rounded-md text-[10px] font-bold transition-all",
                        propertiesTab === 'sharing' ? "bg-green-500/20 text-green-400" : "text-white/30 hover:text-white/60"
                      )}
                    >
                      SHARING
                    </button>
                  </div>
                </div>
                <button onClick={() => setPropertiesItem(null)} className="p-1 hover:bg-white/10 rounded-md transition-colors">
                  <X size={16} />
                </button>
              </div>

              <div className="p-6 space-y-6">
                {propertiesTab === 'permissions' ? (
                  <>
                    {(['owner', 'group', 'others'] as const).map(group => (
                      <div key={group} className="space-y-3">
                        <div className="flex items-center justify-between">
                          <h4 className="text-[10px] font-bold text-white/30 uppercase tracking-wider">{group} Permissions</h4>
                          <div className="text-[10px] text-white/20 font-mono">
                            {(propertiesItem.permissions?.[group].r ? 'r' : '-') + 
                             (propertiesItem.permissions?.[group].w ? 'w' : '-') + 
                             (propertiesItem.permissions?.[group].x ? 'x' : '-')}
                          </div>
                        </div>
                        <div className="grid grid-cols-3 gap-2">
                          {(['r', 'w', 'x'] as const).map(perm => (
                            <button
                              key={perm}
                              onClick={() => {
                                const currentPerms = propertiesItem.permissions || DEFAULT_PERMISSIONS;
                                const newPerms = {
                                  ...currentPerms,
                                  [group]: {
                                    ...currentPerms[group],
                                    [perm]: !currentPerms[group][perm]
                                  }
                                };
                                handleUpdatePermissions(propertiesItem.name, newPerms);
                                addNotification('File Explorer', `Updated permissions for ${propertiesItem.name}`, 'success');
                              }}
                              className={cn(
                                "flex items-center justify-center gap-2 py-2 rounded-lg border transition-all text-[10px] font-medium",
                                propertiesItem.permissions?.[group][perm] 
                                  ? "bg-blue-500/20 border-blue-500/50 text-blue-400" 
                                  : "bg-white/5 border-white/10 text-white/30 hover:bg-white/10"
                              )}
                            >
                              {perm === 'r' ? 'Read' : perm === 'w' ? 'Write' : 'Execute'}
                              {propertiesItem.permissions?.[group][perm] && <Check size={10} />}
                            </button>
                          ))}
                        </div>
                      </div>
                    ))}
                  </>
                ) : (
                  <div className="space-y-6">
                    <div className="flex items-center gap-4 p-4 bg-green-500/5 border border-green-500/20 rounded-2xl">
                      <div className="w-12 h-12 rounded-xl bg-green-500/20 flex items-center justify-center text-green-400">
                        <Share2 size={24} />
                      </div>
                      <div>
                        <h3 className="text-sm font-medium">Network Sharing</h3>
                        <p className="text-[10px] text-white/40">Allow other users on the network to access this {propertiesItem.type}.</p>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-medium">Share on Network</span>
                        <button 
                          onClick={() => {
                            const currentPerms = propertiesItem.permissions || DEFAULT_PERMISSIONS;
                            const isShared = currentPerms.others.r;
                            const newPerms = {
                              ...currentPerms,
                              others: {
                                r: !isShared,
                                w: !isShared, // Default to read-write if turning on
                                x: false
                              }
                            };
                            handleUpdatePermissions(propertiesItem.name, newPerms);
                            addNotification('File Explorer', !isShared ? `Sharing enabled for ${propertiesItem.name}` : `Sharing disabled for ${propertiesItem.name}`, !isShared ? 'success' : 'warning');
                          }}
                          className={cn(
                            "w-10 h-5 rounded-full relative transition-all",
                            propertiesItem.permissions?.others.r ? "bg-green-500" : "bg-white/10"
                          )}
                        >
                          <div className={cn(
                            "absolute top-1 w-3 h-3 bg-white rounded-full transition-all",
                            propertiesItem.permissions?.others.r ? "left-6" : "left-1"
                          )} />
                        </button>
                      </div>

                      {propertiesItem.permissions?.others.r && (
                        <div className="space-y-3 pt-4 border-t border-white/5">
                          <h4 className="text-[10px] font-bold text-white/30 uppercase tracking-wider">Access Level</h4>
                          <div className="grid grid-cols-2 gap-3">
                            <button 
                              onClick={() => {
                                const currentPerms = propertiesItem.permissions || DEFAULT_PERMISSIONS;
                                const newPerms = {
                                  ...currentPerms,
                                  others: { r: true, w: false, x: false }
                                };
                                handleUpdatePermissions(propertiesItem.name, newPerms);
                                addNotification('File Explorer', `${propertiesItem.name} is now Read-Only for others`, 'info');
                              }}
                              className={cn(
                                "flex flex-col items-start gap-1 p-3 rounded-xl border transition-all",
                                propertiesItem.permissions?.others.r && !propertiesItem.permissions?.others.w
                                  ? "bg-blue-500/10 border-blue-500/50 text-blue-400"
                                  : "bg-white/5 border-white/10 text-white/30 hover:bg-white/10"
                              )}
                            >
                              <span className="text-xs font-bold">Read-Only</span>
                              <span className="text-[9px] opacity-60">Others can only view</span>
                            </button>
                            <button 
                              onClick={() => {
                                const currentPerms = propertiesItem.permissions || DEFAULT_PERMISSIONS;
                                const newPerms = {
                                  ...currentPerms,
                                  others: { r: true, w: true, x: false }
                                };
                                handleUpdatePermissions(propertiesItem.name, newPerms);
                                addNotification('File Explorer', `${propertiesItem.name} is now Read-Write for others`, 'info');
                              }}
                              className={cn(
                                "flex flex-col items-start gap-1 p-3 rounded-xl border transition-all",
                                propertiesItem.permissions?.others.w
                                  ? "bg-green-500/10 border-green-500/50 text-green-400"
                                  : "bg-white/5 border-white/10 text-white/30 hover:bg-white/10"
                              )}
                            >
                              <span className="text-xs font-bold">Read-Write</span>
                              <span className="text-[9px] opacity-60">Others can edit/delete</span>
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>

              <div className="p-4 bg-white/5 border-t border-white/10 flex justify-end">
                <button 
                  onClick={() => setPropertiesItem(null)}
                  className="glass-button text-xs"
                >
                  Close
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

function AppFolderApp({ openWindow, addNotification }: any) {
  const availableApps = [
    { id: 'weather', name: 'Weather', icon: <RefreshCw size={24} /> },
    { id: 'calculator', name: 'Calculator', icon: <Plus size={24} /> },
    { id: 'calendar', name: 'Calendar', icon: <Clock size={24} /> },
  ];

  return (
    <div className="h-full p-6">
      <h2 className="text-lg font-medium mb-6 flex items-center gap-2">
        <Package size={20} className="text-blue-400" />
        App Store
      </h2>
      <div className="grid grid-cols-3 gap-4">
        {availableApps.map(app => (
          <div key={app.id} className="glass p-4 rounded-2xl flex flex-col items-center gap-3 group hover:bg-white/15 transition-all">
            <div className="w-12 h-12 bg-white/5 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
              {app.icon}
            </div>
            <span className="text-xs font-medium">{app.name}</span>
            <button 
              onClick={() => {
                openWindow(app.id, app.name);
                addNotification('App Store', `Installing ${app.name}...`, 'info');
              }}
              className="w-full py-1.5 rounded-lg bg-blue-500/20 text-blue-400 text-[10px] font-bold hover:bg-blue-500/30 transition-all"
            >
              INSTALL
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

interface VirtualFile {
  name: string;
  content: string;
  type: string;
  path: string;
}

const THEMES = {
  glass: { name: 'Glass Dark', bg: 'bg-black/40', text: 'text-white/80', accent: 'text-blue-400', border: 'border-blue-400' },
  monokai: { name: 'Monokai', bg: 'bg-[#272822]', text: 'text-[#f8f8f2]', accent: 'text-[#a6e22e]', border: 'border-[#a6e22e]' },
  solarized: { name: 'Solarized', bg: 'bg-[#002b36]', text: 'text-[#839496]', accent: 'text-[#268bd2]', border: 'border-[#268bd2]' },
  cyberpunk: { name: 'Cyberpunk', bg: 'bg-[#1a1a2e]', text: 'text-[#e94560]', accent: 'text-[#0f3460]', border: 'border-[#e94560]' },
};

function CodeStudioApp({ builds, setBuilds, setTerminalHistory, addNotification }: any) {
  const [files, setFiles] = useState<VirtualFile[]>([
    { 
      name: 'main.b', 
      content: '@@global.main\nStart\n  REM Welcome to Brainscript v1.0\n  LET $msg \'Hello GlassOS\'\n  PRINT $msg\n  TIMESTAMP\nEnd', 
      type: 'Brainscript', 
      path: 'src/' 
    },
    { 
      name: 'utils.b', 
      content: '##local.utils\nStart\n  REM Utility functions\nEnd', 
      type: 'Brainscript', 
      path: 'src/' 
    }
  ]);
  const [activeFile, setActiveFile] = useState('main.b');
  const [code, setCode] = useState(files[0].content);
  const [targetArch, setTargetArch] = useState('x64 (Windows/Linux)');
  const [isCompiling, setIsCompiling] = useState(false);
  const [activeDialog, setActiveDialog] = useState<'new' | 'open' | 'send' | 'about' | null>(null);
  const [currentTheme, setCurrentTheme] = useState<keyof typeof THEMES>('glass');
  const [syntaxErrors, setSyntaxErrors] = useState<{line: number, message: string}[]>([]);
  const [outputLogs, setOutputLogs] = useState<string[]>([]);
  const [isOutputVisible, setIsOutputVisible] = useState(true);
  const [activeMenu, setActiveMenu] = useState<string | null>(null);
  
  // New File Dialog State
  const [newFileData, setNewFileData] = useState({ name: '', type: 'Brainscript', path: 'src/' });
  const [newFileError, setNewFileError] = useState<string | null>(null);
  
  // Send To Dialog State
  const [selectedFileForSend, setSelectedFileForSend] = useState<string | null>(null);
  const [destinationFolder, setDestinationFolder] = useState('network/shared');
  const [sendSource, setSendSource] = useState<'local' | 'network'>('local');
  
  const networkFiles = [
    { name: 'api_config.json', type: 'JSON', size: '12KB' },
    { name: 'remote_lib.b', type: 'Brainscript', size: '45KB' },
    { name: 'server_logs.txt', type: 'Text', size: '1.2MB' },
    { name: 'db_schema.sql', type: 'SQL', size: '8KB' }
  ];

  useEffect(() => {
    const currentFile = files.find(f => f.name === activeFile);
    if (currentFile) {
      setCode(currentFile.content);
    }
  }, [activeFile]);

  useEffect(() => {
    if (!activeFile.endsWith('.b')) {
      setSyntaxErrors([]);
      return;
    }

    const errors: {line: number, message: string}[] = [];
    const lines = code.split('\n');
    let inBlock = false;
    let blockHeaderFound = false;

    lines.forEach((line, index) => {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith('//')) return;

      // Check for block headers
      if (trimmed.startsWith('@@') || trimmed.startsWith('$$') || trimmed.startsWith('###') || trimmed.startsWith('##')) {
        if (inBlock) {
          errors.push({ line: index + 1, message: "Cannot define a block header inside another block" });
        }
        blockHeaderFound = true;
        return;
      }

      if (trimmed === 'Start') {
        if (!blockHeaderFound) {
          errors.push({ line: index + 1, message: "Block must be preceded by a header (@@, $$, ###, or ##)" });
        }
        if (inBlock) {
          errors.push({ line: index + 1, message: "Nested 'Start' is not allowed" });
        }
        inBlock = true;
        blockHeaderFound = false; // Reset for next potential block
        return;
      }

      if (trimmed === 'End') {
        if (!inBlock) {
          errors.push({ line: index + 1, message: "'End' without matching 'Start'" });
        }
        inBlock = false;
        return;
      }

      // Commands inside block
      if (inBlock) {
        const parts = trimmed.split(/\s+/);
        const command = parts[0];

        if (command === 'REM') {
          // Remark, ignore rest of line
        } else if (command === 'LET') {
          if (!parts[1] || !parts[1].startsWith('$')) {
            errors.push({ line: index + 1, message: "LET must be followed by a variable starting with '$'" });
          }
        } else if (command === 'PRINT') {
          if (parts.length < 2) {
            errors.push({ line: index + 1, message: "PRINT requires an argument" });
          }
        } else if (command === 'TIMESTAMP') {
          // standalone
        } else {
          errors.push({ line: index + 1, message: `Unknown command: ${command}` });
        }
      } else {
        // Outside block, only headers or comments allowed
        errors.push({ line: index + 1, message: "Code must be inside a Start/End block" });
      }
    });

    if (inBlock) {
      errors.push({ line: lines.length, message: "Missing 'End' for block" });
    }

    setSyntaxErrors(errors);
  }, [code, activeFile]);

  const handleSave = () => {
    setFiles(prev => prev.map(f => f.name === activeFile ? { ...f, content: code } : f));
    addNotification('Code Studio', `Saved ${activeFile}`, 'success');
    setTerminalHistory((prev: string[]) => [...prev, `[IDE] Saved ${activeFile} successfully.`]);
  };

  const handleCreateFile = () => {
    setNewFileError(null);
    if (!newFileData.name.trim()) {
      setNewFileError('File name is required.');
      return;
    }

    const validTypes = ['Brainscript', 'JSON', 'Text'];
    if (!validTypes.includes(newFileData.type)) {
      setNewFileError('Invalid file type selected.');
      return;
    }

    const extension = newFileData.type === 'Brainscript' ? '.b' : newFileData.type === 'JSON' ? '.json' : '.txt';
    const fileName = newFileData.name.trim().endsWith(extension) ? newFileData.name.trim() : newFileData.name.trim() + extension;
    
    const exists = files.some(f => f.name.toLowerCase() === fileName.toLowerCase() && f.path === newFileData.path);
    if (exists) {
      setNewFileError(`A file named "${fileName}" already exists.`);
      return;
    }
    
    const newFile = {
      name: fileName,
      content: '// New ' + newFileData.type + ' file',
      type: newFileData.type,
      path: newFileData.path
    };
    
    setFiles(prev => [...prev, newFile]);
    setActiveFile(fileName);
    addNotification('Code Studio', `Created ${fileName}`, 'success');
    setActiveDialog(null);
    setNewFileData({ name: '', type: 'Brainscript', path: 'src/' });
  };

  const handleSendTo = () => {
    if (!selectedFileForSend) return;
    setTerminalHistory((prev: string[]) => [...prev, `[IDE] Sending ${selectedFileForSend} to ${destinationFolder}...`]);
    setTimeout(() => {
      setTerminalHistory((prev: string[]) => [...prev, `[IDE] File ${selectedFileForSend} sent successfully.`]);
      addNotification('Code Studio', `Sent ${selectedFileForSend} to ${destinationFolder}`, 'success');
      setActiveDialog(null);
      setSelectedFileForSend(null);
    }, 1500);
  };

  const handleBuild = () => {
    setIsCompiling(true);
    addNotification('Code Studio', `Compiling ${activeFile}...`, 'info');
    const startLogs = [
      `[${new Date().toLocaleTimeString()}] Parsing Brainscript: ${activeFile}...`,
      `[${new Date().toLocaleTimeString()}] Generating Intermediate Representation...`,
      `[${new Date().toLocaleTimeString()}] Linking for Target: ${targetArch}...`
    ];
    
    setTerminalHistory((prev: string[]) => [...prev, ...startLogs]);
    setOutputLogs(prev => [...prev, ...startLogs]);
    setIsOutputVisible(true);

    setTimeout(() => {
      const type = targetArch.includes('6502') ? '8-bit' : targetArch.includes('68k') ? '16-bit' : targetArch.includes('x64') ? '64-bit' : '32-bit';
      const newBuild: BrainscriptBuild = {
        name: activeFile.replace('.b', '.exe'),
        arch: targetArch,
        timestamp: new Date().toLocaleTimeString(),
        size: (Math.random() * 500 + 100).toFixed(0) + ' KB',
        type
      };
      const endLog = `[${new Date().toLocaleTimeString()}] Output: build/${newBuild.name} (${type} Binary) - SUCCESS`;
      
      setBuilds((prev: BrainscriptBuild[]) => [newBuild, ...prev]);
      setIsCompiling(false);
      addNotification('Code Studio', `Build successful: ${newBuild.name}`, 'success');
      setTerminalHistory((prev: string[]) => [...prev, endLog]);
      setOutputLogs(prev => [...prev, endLog]);
    }, 2000);
  };

  return (
    <div className="h-full flex flex-col font-sans" onClick={() => setActiveMenu(null)}>
      {/* Toolbar */}
      <div className="h-10 bg-white/5 border-b border-white/10 flex items-center px-4 justify-between" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center gap-4">
          <div className="flex gap-3 text-[11px] text-white/60 relative">
            {/* File Menu */}
            <div className="relative">
              <button 
                onClick={() => setActiveMenu(activeMenu === 'file' ? null : 'file')}
                className={cn("hover:text-white transition-colors py-2 flex items-center gap-1", activeMenu === 'file' && "text-white")}
              >
                File
                <ChevronDown size={10} className={cn("transition-transform", activeMenu === 'file' && "rotate-180")} />
              </button>
              <AnimatePresence>
                {activeMenu === 'file' && (
                  <motion.div 
                    initial={{ opacity: 0, y: 5 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 5 }}
                    className="absolute top-full left-0 w-48 glass-dark border border-white/10 rounded-lg shadow-2xl py-1 z-[3000]"
                  >
                    <button 
                      onClick={() => { setActiveDialog('new'); setNewFileError(null); setActiveMenu(null); }}
                      className="w-full text-left px-4 py-2 hover:bg-white/10 flex items-center gap-2"
                    >
                      <FilePlus size={14} />
                      <span>New File</span>
                    </button>
                    <button 
                      onClick={() => { setActiveDialog('open'); setActiveMenu(null); }}
                      className="w-full text-left px-4 py-2 hover:bg-white/10 flex items-center gap-2"
                    >
                      <Upload size={14} />
                      <span>Open File...</span>
                    </button>
                    <button 
                      onClick={() => { handleSave(); setActiveMenu(null); }}
                      className="w-full text-left px-4 py-2 hover:bg-white/10 flex items-center gap-2"
                    >
                      <Save size={14} />
                      <span>Save File</span>
                    </button>
                    <button 
                      onClick={() => { alert('Printing...'); setActiveMenu(null); }}
                      className="w-full text-left px-4 py-2 hover:bg-white/10 flex items-center gap-2"
                    >
                      <Printer size={14} />
                      <span>Print...</span>
                    </button>
                    <div className="h-[1px] bg-white/10 my-1" />
                    <button 
                      onClick={() => { setActiveDialog('send'); setActiveMenu(null); }}
                      className="w-full text-left px-4 py-2 hover:bg-white/10 flex items-center gap-2"
                    >
                      <Send size={14} />
                      <span>Send To...</span>
                    </button>
                    <button 
                      onClick={() => { setActiveDialog('about'); setActiveMenu(null); }}
                      className="w-full text-left px-4 py-2 hover:bg-white/10 flex items-center gap-2"
                    >
                      <Info size={14} />
                      <span>About Code Studio</span>
                    </button>
                    <div className="h-[1px] bg-white/10 my-1" />
                    <button 
                      onClick={() => { alert('Quitting Code Studio...'); setActiveMenu(null); }}
                      className="w-full text-left px-4 py-2 hover:bg-white/10 flex items-center gap-2 text-red-400"
                    >
                      <LogOut size={14} />
                      <span>Quit</span>
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Edit Menu */}
            <div className="relative">
              <button 
                onClick={() => setActiveMenu(activeMenu === 'edit' ? null : 'edit')}
                className={cn("hover:text-white transition-colors py-2 flex items-center gap-1", activeMenu === 'edit' && "text-white")}
              >
                Edit
                <ChevronDown size={10} className={cn("transition-transform", activeMenu === 'edit' && "rotate-180")} />
              </button>
              <AnimatePresence>
                {activeMenu === 'edit' && (
                  <motion.div 
                    initial={{ opacity: 0, y: 5 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 5 }}
                    className="absolute top-full left-0 w-48 glass-dark border border-white/10 rounded-lg shadow-2xl py-1 z-[3000]"
                  >
                    <button onClick={() => setActiveMenu(null)} className="w-full text-left px-4 py-2 hover:bg-white/10 flex items-center gap-2">
                      <Scissors size={14} />
                      <span>Cut</span>
                    </button>
                    <button onClick={() => setActiveMenu(null)} className="w-full text-left px-4 py-2 hover:bg-white/10 flex items-center gap-2">
                      <Copy size={14} />
                      <span>Copy</span>
                    </button>
                    <button onClick={() => setActiveMenu(null)} className="w-full text-left px-4 py-2 hover:bg-white/10 flex items-center gap-2">
                      <Clipboard size={14} />
                      <span>Paste</span>
                    </button>
                    <div className="h-[1px] bg-white/10 my-1" />
                    <button onClick={() => setActiveMenu(null)} className="w-full text-left px-4 py-2 hover:bg-white/10 flex items-center gap-2">
                      <MousePointer2 size={14} />
                      <span>Select All</span>
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Selection Menu */}
            <div className="relative">
              <button 
                onClick={() => setActiveMenu(activeMenu === 'selection' ? null : 'selection')}
                className={cn("hover:text-white transition-colors py-2 flex items-center gap-1", activeMenu === 'selection' && "text-white")}
              >
                Selection
                <ChevronDown size={10} className={cn("transition-transform", activeMenu === 'selection' && "rotate-180")} />
              </button>
              <AnimatePresence>
                {activeMenu === 'selection' && (
                  <motion.div 
                    initial={{ opacity: 0, y: 5 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 5 }}
                    className="absolute top-full left-0 w-48 glass-dark border border-white/10 rounded-lg shadow-2xl py-1 z-[3000]"
                  >
                    <button 
                      onClick={() => { handleBuild(); setActiveMenu(null); }}
                      className="w-full text-left px-4 py-2 hover:bg-white/10 flex items-center gap-2"
                    >
                      <Play size={14} />
                      <span>Run Code</span>
                    </button>
                    <div className="h-[1px] bg-white/10 my-1" />
                    <div className="px-4 py-1 text-[9px] uppercase font-bold text-white/30 tracking-widest">Debug</div>
                    <button onClick={() => setActiveMenu(null)} className="w-full text-left px-4 py-2 hover:bg-white/10 flex items-center gap-2">
                      <Bug size={14} />
                      <span>Start Debugging</span>
                    </button>
                    <button onClick={() => setActiveMenu(null)} className="w-full text-left px-4 py-2 hover:bg-white/10 flex items-center gap-2">
                      <StepForward size={14} />
                      <span>Step Over</span>
                    </button>
                    <button onClick={() => setActiveMenu(null)} className="w-full text-left px-4 py-2 hover:bg-white/10 flex items-center gap-2 text-red-400">
                      <Square size={14} />
                      <span>Stop Debugging</span>
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
          <div className="h-4 w-[1px] bg-white/10 mx-2" />
          <div className="flex items-center gap-2">
            <Palette size={12} className="text-white/40" />
            <select 
              className="bg-transparent text-[10px] outline-none border border-white/10 rounded px-2 py-0.5"
              value={currentTheme}
              onChange={(e) => setCurrentTheme(e.target.value as keyof typeof THEMES)}
            >
              {Object.entries(THEMES).map(([key, theme]) => (
                <option key={key} value={key} className="bg-slate-800">{theme.name}</option>
              ))}
            </select>
          </div>
          <div className="h-4 w-[1px] bg-white/10 mx-2" />
          <select 
            className="bg-transparent text-[10px] outline-none border border-white/10 rounded px-2 py-0.5"
            value={targetArch}
            onChange={(e) => setTargetArch(e.target.value)}
          >
            <option className="bg-slate-800">x64 (Windows/Linux)</option>
            <option className="bg-slate-800">ARM64 (Apple/Mobile)</option>
            <option className="bg-slate-800">8bit 6502</option>
            <option className="bg-slate-800">68k Architecture</option>
            <option className="bg-slate-800">RISC-V</option>
          </select>
          <div className="h-4 w-[1px] bg-white/10 mx-2" />
          <button 
            onClick={() => setIsOutputVisible(!isOutputVisible)}
            className={cn(
              "p-1.5 rounded transition-colors flex items-center gap-1.5",
              isOutputVisible ? "bg-blue-500/20 text-blue-400" : "text-white/40 hover:bg-white/5"
            )}
            title="Toggle Output Panel"
          >
            <TerminalIcon size={12} />
            <span className="text-[10px] font-bold uppercase">Output</span>
          </button>
        </div>
        <button 
          onClick={handleBuild}
          disabled={isCompiling}
          className="flex items-center gap-2 bg-blue-500/20 hover:bg-blue-500/30 text-blue-400 px-3 py-1 rounded text-[10px] font-bold transition-all disabled:opacity-50"
        >
          {isCompiling ? <RefreshCw size={12} className="animate-spin" /> : <Play size={12} />}
          BUILD .EXE
        </button>
      </div>

      <div className="flex-1 flex overflow-hidden">
        {/* Sidebar */}
        <div className="w-[200px] bg-black/20 border-r border-white/10 flex flex-col">
          <div className="p-3 text-[10px] uppercase tracking-wider text-white/40 font-bold">Explorer</div>
          <div className="flex-1 overflow-y-auto p-2">
            <FolderItem name="src" isOpen={true}>
              {files.filter(f => f.path === 'src/').map(f => (
                <FileItem 
                  key={f.name} 
                  name={f.name} 
                  isActive={activeFile === f.name} 
                  onClick={() => { setActiveFile(f.name); }} 
                />
              ))}
            </FolderItem>
            <FolderItem name="include" isOpen={false} />
            <FolderItem name="build" isOpen={true}>
              {builds.map((b: BrainscriptBuild, i: number) => (
                <div 
                  key={i} 
                  className="flex items-center gap-2 px-2 py-1 rounded hover:bg-white/5 cursor-pointer group"
                  onDoubleClick={() => alert(`Running ${b.name}...\nTarget: ${b.arch}\nSize: ${b.size}`)}
                >
                  <FileCode size={14} className={cn(
                    b.type === '8-bit' ? 'text-red-400' : 
                    b.type === '16-bit' ? 'text-yellow-400' : 
                    b.type === '32-bit' ? 'text-green-400' : 'text-blue-400'
                  )} />
                  <div className="flex flex-col">
                    <span className="text-[11px] text-white/70">{b.name}</span>
                    <span className="text-[8px] text-white/30">{b.type}</span>
                  </div>
                </div>
              ))}
            </FolderItem>
          </div>
        </div>

        {/* Editor */}
        <div className={cn("flex-1 flex flex-col transition-colors duration-300", THEMES[currentTheme].bg)}>
          <div className="h-8 bg-white/5 flex items-center px-4 gap-2">
            <div className={cn("h-full border-t-2 px-4 flex items-center gap-2 bg-white/5", THEMES[currentTheme].border)}>
              <FileCode size={12} className={THEMES[currentTheme].accent} />
              <span className={cn("text-[11px]", THEMES[currentTheme].text)}>{activeFile}</span>
            </div>
          </div>
          <textarea 
            className={cn(
              "flex-1 bg-transparent p-6 outline-none resize-none font-mono text-sm leading-relaxed transition-colors duration-300",
              THEMES[currentTheme].text
            )}
            spellCheck={false}
            value={code}
            onChange={(e) => setCode(e.target.value)}
          />
          
          {syntaxErrors.length > 0 && (
            <div className="h-24 bg-red-500/10 border-t border-red-500/20 overflow-y-auto p-3 space-y-1">
              <div className="flex items-center gap-2 text-red-400 text-[10px] font-bold uppercase mb-2">
                <AlertCircle size={12} />
                <span>Syntax Errors ({syntaxErrors.length})</span>
              </div>
              {syntaxErrors.map((err, i) => (
                <div key={i} className="text-[11px] text-red-200/70 flex gap-2">
                  <span className="text-red-400/50 min-w-[40px]">Line {err.line}:</span>
                  <span>{err.message}</span>
                </div>
              ))}
            </div>
          )}

          {isOutputVisible && (
            <div className="h-32 bg-black/40 border-t border-white/10 flex flex-col">
              <div className="h-7 bg-white/5 px-3 flex items-center justify-between border-b border-white/5">
                <div className="flex items-center gap-2 text-[9px] font-bold uppercase text-white/40 tracking-wider">
                  <TerminalIcon size={10} />
                  <span>Output</span>
                </div>
                <button 
                  onClick={() => setOutputLogs([])}
                  className="text-[9px] text-white/30 hover:text-white/60 transition-colors uppercase font-bold"
                >
                  Clear
                </button>
              </div>
              <div className="flex-1 overflow-y-auto p-3 font-mono text-[11px] space-y-0.5">
                {outputLogs.length === 0 ? (
                  <div className="text-white/10 italic">No output yet. Build the project to see logs.</div>
                ) : (
                  outputLogs.map((log, i) => (
                    <div key={i} className={cn(
                      "transition-all",
                      log.includes('SUCCESS') ? "text-green-400" : "text-white/60"
                    )}>
                      {log}
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Status Bar */}
      <div className={cn("h-6 flex items-center justify-between px-4 text-[10px] font-medium transition-colors duration-300", 
        currentTheme === 'glass' ? 'bg-blue-600' : 
        currentTheme === 'monokai' ? 'bg-[#a6e22e] text-black' : 
        currentTheme === 'solarized' ? 'bg-[#268bd2]' : 'bg-[#e94560]'
      )}>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1">
            {syntaxErrors.length === 0 ? <CheckCircle2 size={10} /> : <AlertCircle size={10} />}
            <span>{syntaxErrors.length === 0 ? 'Ready' : 'Syntax Errors'}</span>
          </div>
          <span>Brainscript v1.0</span>
        </div>
        <div className="flex items-center gap-4">
          <span>Ln 1, Col 1</span>
          <span>UTF-8</span>
          <div className="flex items-center gap-1">
            <Check size={10} />
            <span>Prettier</span>
          </div>
        </div>
      </div>

      {/* Toast Notification */}
      <AnimatePresence>
        {isCompiling && (
          <motion.div 
            initial={{ x: 300, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: 300, opacity: 0 }}
            className="fixed bottom-16 right-6 glass p-4 rounded-xl border-blue-500/30 flex items-center gap-4 z-[2000]"
          >
            <div className="w-10 h-10 rounded-full bg-blue-500/20 flex items-center justify-center">
              <RefreshCw size={20} className="text-blue-400 animate-spin" />
            </div>
            <div>
              <h4 className="text-sm font-bold">Compiling...</h4>
              <p className="text-xs text-white/50">Building {activeFile} for {targetArch}</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Dialogs */}
      <AnimatePresence>
        {activeDialog === 'new' && (
          <div className="fixed inset-0 flex items-center justify-center z-[4000] bg-black/40 backdrop-blur-sm">
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="w-[400px] glass-dark border border-white/20 rounded-2xl p-6 shadow-2xl"
            >
              <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                <FilePlus className="text-blue-400" />
                New File
              </h3>
              <div className="space-y-4">
                {newFileError && (
                  <div className="bg-red-500/20 border border-red-500/50 text-red-200 text-[10px] px-3 py-2 rounded-lg">
                    {newFileError}
                  </div>
                )}
                <div>
                  <label className="text-[10px] uppercase text-white/40 font-bold block mb-1">File Name</label>
                  <input 
                    autoFocus
                    className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm outline-none focus:border-blue-500/50 transition-colors"
                    placeholder="e.g. core_logic"
                    value={newFileData.name}
                    onChange={(e) => setNewFileData(prev => ({ ...prev, name: e.target.value }))}
                  />
                </div>
                <div>
                  <label className="text-[10px] uppercase text-white/40 font-bold block mb-1">File Type</label>
                  <select 
                    className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm outline-none focus:border-blue-500/50 transition-colors appearance-none"
                    value={newFileData.type}
                    onChange={(e) => setNewFileData(prev => ({ ...prev, type: e.target.value }))}
                  >
                    <option className="bg-slate-800">Brainscript</option>
                    <option className="bg-slate-800">JSON</option>
                    <option className="bg-slate-800">Text</option>
                  </select>
                </div>
                <div>
                  <label className="text-[10px] uppercase text-white/40 font-bold block mb-1">Location</label>
                  <div className="flex items-center gap-2 bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-xs text-white/60">
                    <Folder size={14} />
                    <span>/src/</span>
                  </div>
                </div>
              </div>
              <div className="flex justify-end gap-3 mt-8">
                <button 
                  onClick={() => setActiveDialog(null)}
                  className="px-4 py-2 rounded-lg hover:bg-white/5 text-sm transition-colors"
                >
                  Cancel
                </button>
                <button 
                  onClick={handleCreateFile}
                  className="px-6 py-2 rounded-lg bg-blue-500 hover:bg-blue-600 text-sm font-bold transition-colors"
                >
                  Create
                </button>
              </div>
            </motion.div>
          </div>
        )}

        {activeDialog === 'open' && (
          <div className="fixed inset-0 flex items-center justify-center z-[4000] bg-black/40 backdrop-blur-sm">
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="w-[500px] glass-dark border border-white/20 rounded-2xl p-6 shadow-2xl"
            >
              <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                <Upload className="text-blue-400" />
                Open File
              </h3>
              <div className="bg-white/5 border border-white/10 rounded-xl overflow-hidden">
                <div className="p-2 border-b border-white/10 text-[10px] text-white/40 font-bold flex items-center gap-2">
                  <Folder size={12} />
                  /src/
                </div>
                <div className="max-h-[300px] overflow-y-auto p-2 space-y-1">
                  {files.map(f => (
                    <div 
                      key={f.name}
                      onClick={() => setActiveFile(f.name)}
                      onDoubleClick={() => setActiveDialog(null)}
                      className={cn(
                        "flex items-center justify-between px-3 py-2 rounded-lg cursor-pointer transition-all",
                        activeFile === f.name ? "bg-blue-500/20 text-blue-400" : "hover:bg-white/5"
                      )}
                    >
                      <div className="flex items-center gap-3">
                        <FileCode size={16} />
                        <span className="text-sm">{f.name}</span>
                      </div>
                      <span className="text-[10px] text-white/30">{f.type}</span>
                    </div>
                  ))}
                </div>
              </div>
              <div className="flex justify-end gap-3 mt-8">
                <button 
                  onClick={() => setActiveDialog(null)}
                  className="px-4 py-2 rounded-lg hover:bg-white/5 text-sm transition-colors"
                >
                  Cancel
                </button>
                <button 
                  onClick={() => setActiveDialog(null)}
                  className="px-6 py-2 rounded-lg bg-blue-500 hover:bg-blue-600 text-sm font-bold transition-colors"
                >
                  Open
                </button>
              </div>
            </motion.div>
          </div>
        )}

        {activeDialog === 'send' && (
          <div className="fixed inset-0 flex items-center justify-center z-[4000] bg-black/40 backdrop-blur-sm">
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="w-[450px] glass-dark border border-white/20 rounded-2xl p-6 shadow-2xl"
            >
              <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                <Send className="text-blue-400" />
                Send To...
              </h3>
              
              <div className="flex bg-white/5 rounded-lg p-1 mb-4">
                <button 
                  onClick={() => { setSendSource('local'); setSelectedFileForSend(null); }}
                  className={cn(
                    "flex-1 py-1.5 text-[10px] font-bold rounded-md transition-all flex items-center justify-center gap-2",
                    sendSource === 'local' ? "bg-blue-500 text-white" : "text-white/40 hover:text-white/60"
                  )}
                >
                  <Monitor size={12} />
                  LOCAL FILES
                </button>
                <button 
                  onClick={() => { setSendSource('network'); setSelectedFileForSend(null); }}
                  className={cn(
                    "flex-1 py-1.5 text-[10px] font-bold rounded-md transition-all flex items-center justify-center gap-2",
                    sendSource === 'network' ? "bg-blue-500 text-white" : "text-white/40 hover:text-white/60"
                  )}
                >
                  <Server size={12} />
                  NETWORK DRIVE
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="text-[10px] uppercase text-white/40 font-bold block mb-2">
                    {sendSource === 'local' ? 'Select Local File' : 'Browse Network Drive'}
                  </label>
                  <div className="bg-white/5 border border-white/10 rounded-xl max-h-[150px] overflow-y-auto p-2 space-y-1">
                    {sendSource === 'local' ? (
                      files.map(f => (
                        <div 
                          key={f.name}
                          onClick={() => setSelectedFileForSend(f.name)}
                          className={cn(
                            "flex items-center gap-3 px-3 py-2 rounded-lg cursor-pointer transition-all",
                            selectedFileForSend === f.name ? "bg-blue-500/20 text-blue-400" : "hover:bg-white/5"
                          )}
                        >
                          <FileCode size={14} />
                          <span className="text-xs">{f.name}</span>
                        </div>
                      ))
                    ) : (
                      networkFiles.map(f => (
                        <div 
                          key={f.name}
                          onClick={() => setSelectedFileForSend(f.name)}
                          className={cn(
                            "flex items-center justify-between px-3 py-2 rounded-lg cursor-pointer transition-all",
                            selectedFileForSend === f.name ? "bg-blue-500/20 text-blue-400" : "hover:bg-white/5"
                          )}
                        >
                          <div className="flex items-center gap-3">
                            <Globe size={14} className="text-blue-400" />
                            <span className="text-xs">{f.name}</span>
                          </div>
                          <span className="text-[9px] text-white/30">{f.size}</span>
                        </div>
                      ))
                    )}
                  </div>
                </div>
                <div>
                  <label className="text-[10px] uppercase text-white/40 font-bold block mb-2">Destination Folder</label>
                  <div className="flex items-center gap-2 bg-white/5 border border-white/10 rounded-lg px-3 py-2">
                    <Folder size={14} className="text-blue-400" />
                    <input 
                      className="bg-transparent outline-none flex-1 text-xs text-white/80"
                      value={destinationFolder}
                      onChange={(e) => setDestinationFolder(e.target.value)}
                    />
                  </div>
                </div>
              </div>
              <div className="flex justify-end gap-3 mt-8">
                <button 
                  onClick={() => setActiveDialog(null)}
                  className="px-4 py-2 rounded-lg hover:bg-white/5 text-sm transition-colors"
                >
                  Cancel
                </button>
                <button 
                  onClick={handleSendTo}
                  disabled={!selectedFileForSend}
                  className="px-6 py-2 rounded-lg bg-blue-500 hover:bg-blue-600 text-sm font-bold transition-colors disabled:opacity-50"
                >
                  {sendSource === 'local' ? 'Send to Network' : 'Pull to Local'}
                </button>
              </div>
            </motion.div>
          </div>
        )}

        {activeDialog === 'about' && (
          <div className="fixed inset-0 flex items-center justify-center z-[4000] bg-black/40 backdrop-blur-sm">
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="w-[350px] glass-dark border border-white/20 rounded-2xl p-8 shadow-2xl text-center"
            >
              <div className="w-16 h-16 bg-blue-500/20 rounded-2xl flex items-center justify-center mx-auto mb-6 border border-blue-500/30">
                <Code size={32} className="text-blue-400" />
              </div>
              <h3 className="text-xl font-bold mb-1">Code Studio</h3>
              <p className="text-blue-400 text-xs font-bold mb-4">Version 1.0.0</p>
              <p className="text-white/60 text-sm leading-relaxed mb-8">
                A powerful, lightweight Brainscript IDE designed specifically for the GlassOS ecosystem. 
                Build, compile, and deploy with ease.
              </p>
              <button 
                onClick={() => setActiveDialog(null)}
                className="w-full py-2 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-sm font-bold transition-all"
              >
                Close
              </button>
              <p className="mt-6 text-[9px] text-white/20 uppercase tracking-widest font-bold">
                © 2026 GlassCorp Industries
              </p>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

function FolderItem({ name, isOpen, children }: { name: string, isOpen: boolean, children?: React.ReactNode }) {
  return (
    <div className="mb-1">
      <div className="flex items-center gap-2 px-2 py-1 rounded hover:bg-white/5 cursor-pointer text-white/50 group">
        <ChevronRight size={14} className={cn("transition-transform", isOpen && "rotate-90")} />
        <Folder size={14} className="group-hover:text-white transition-colors" />
        <span className="text-[11px] font-medium group-hover:text-white transition-colors">{name}</span>
      </div>
      {isOpen && <div className="ml-4 mt-1">{children}</div>}
    </div>
  );
}

interface FileItemProps {
  name: string;
  isActive: boolean;
  onClick: () => void;
  key?: string;
}

function FileItem({ name, isActive, onClick }: FileItemProps) {
  return (
    <div 
      onClick={onClick}
      className={cn(
        "flex items-center gap-2 px-2 py-1 rounded cursor-pointer transition-all",
        isActive ? "bg-white/10 text-white" : "text-white/40 hover:bg-white/5 hover:text-white/60"
      )}
    >
      <FileCode size={14} className={isActive ? "text-blue-400" : ""} />
      <span className="text-[11px]">{name}</span>
    </div>
  );
}
