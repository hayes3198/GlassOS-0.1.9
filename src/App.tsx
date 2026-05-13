/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { storage } from './services/storageService';
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
  Mail,
  Database,
  MessageSquare,
  ChevronRight, 
  ChevronLeft,
  Lock,
  Star,
  Shield,
  Play, 
  Pause, 
  SkipBack, 
  SkipForward,
  Cpu,
  HardDrive,
  Code,
  Code2,
  Package,
  Check,
  RefreshCw,
  Plus,
  Trash2,
  Circle,
  FileCode,
  Box,
  Save,
  Send,
  Upload,
  Download,
  Calendar,
  Table as TableIcon,
  Columns,
  Rows,
  Database as DatabaseIcon,
  Calculator,
  Grid,
  Cloud,
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
  Mouse,
  Keyboard,
  Smartphone,
  Printer as PrinterIcon,
  Volume2,
  Type,
  Eye,
  Share2,
  Bell,
  Layers,
  Command,
  Unlock,
  ArrowLeftRight,
  ArrowUpRight,
  Radio,
  Zap,
  Bold,
  Italic,
  Underline,
  AlignLeft,
  AlignCenter,
  AlignRight,
  List as ListIcon,
  Indent,
  Outdent,
  Eraser,
  LayoutGrid,
  Gauge,
  Activity,
  TrendingUp,
  Target,
  BarChart,
  BarChart2,
  LineChart as LineChartIcon,
  PieChart as PieChartIcon,
  AreaChart as AreaChartIcon,
  BoxSelect as BoxIcon,
  Grid3X3,
  Radar as RadarIcon,
  LayoutGrid as TreemapIcon,
  ListFilter,
  BarChart3,
  GanttChartSquare,
  Binary,
  Presentation,
  Filter,
  Briefcase,
  User as UserIcon,
  Monitor as MonitorIcon,
  Strikethrough,
  WrapText,
  AlignStartVertical,
  AlignCenterVertical,
  AlignEndVertical,
  PaintBucket,
  DollarSign,
  Percent,
  ChevronUp,
  Baseline,
  ShieldCheck,
  Sparkles,
} from 'lucide-react';
import { motion, AnimatePresence, useDragControls } from 'motion/react';
import { 
  BarChart as ReBarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer, 
  LineChart as ReLineChart, 
  Line, 
  AreaChart as ReAreaChart, 
  Area, 
  PieChart as RePieChart, 
  Pie, 
  Cell, 
  RadarChart as ReRadarChart, 
  PolarGrid, 
  PolarAngleAxis, 
  PolarRadiusAxis, 
  Radar as ReRadar,
  Treemap as ReTreemap,
  ScatterChart,
  Scatter,
  ZAxis,
  FunnelChart,
  Funnel,
  LabelList,
  ComposedChart
} from 'recharts';
import { io, Socket } from 'socket.io-client';
import { GlassScriptInterpreter } from './lib/glassScript';
import { BrainscriptInterpreter } from './lib/brainscript';
import { FilesApp } from './FilesApp';
import { FileSystemLib } from './lib/FileSystem.lib';
import { AuthLib } from './lib/Auth.lib';
import { BridgeLib } from './lib/Bridge.lib';
import { DisplayLib } from './lib/Display.lib';
import { INITIAL_FS, DEFAULT_PERMISSIONS } from './components/constants/initialFs';
import { FilePicker } from './components/FilePicker';
import { nativeBridge, SystemInfo } from './lib/NativeBridge.lib';
import { 
  AppId, 
  WindowState, 
  Permissions, 
  Notification, 
  ContextMenuItem, 
  FileSystemItem, 
  BrainscriptBuild, 
  ScheduledTask, 
  UserAccount, 
  NetworkNode, 
  NetworkConfig,
  Email,
  PrintJob
} from './types';

// --- Local Interfaces ---
interface OAuthToken {
  nodeId: string;
  token: string;
  scope: string[];
  expiresAt: string;
}

interface TrafficEvent {
  id: string;
  protocol: 'gRPC' | 'XMPP' | 'IP' | 'mDNS';
  source: string;
  destination: string;
  size: string;
  timestamp: string;
}

interface KernelCall {
  id: string;
  service: string;
  method: string;
  status: 'success' | 'warning' | 'error';
  timestamp: string;
  latency: number;
}

interface DBMessage {
  id: string;
  sender: string;
  text: string;
  timestamp: string;
}

interface DBCollections {
  emails: Email[];
  messages: DBMessage[];
  [key: string]: any[];
}

declare global {
  interface Window {
    electronAPI?: {
      executeCommand: (command: string) => Promise<{ stdout: string; stderr: string; code: number }>;
      getSystemInfo: () => Promise<any>;
      send: (channel: string, data: any) => void;
      receive: (channel: string, func: (...args: any[]) => void) => void;
    };
  }
}

// --- Constants ---

const WALLPAPERS = [
  'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=1920&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1620641788421-7a1c342ea42e?q=80&w=1920&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1635776062127-d379bfcba9f8?q=80&w=1920&auto=format&fit=crop',
];

const DEFAULT_GLASSWORD_CONTENT = `<h1>The Future of GlassOS</h1><p>Welcome to <b>GlassWord</b>, the premier word processing suite for the modern frosted era. This document celebrates the intersection of classical Microsoft Word 4.0 layout logic with the shimmering aesthetics of glassmorphism.</p><p><i>"Vision is the art of seeing things invisible." - Jonathan Swift</i></p><h2>System Requirements</h2><ul><li>GlassOS 2.0 or higher</li><li>Frosted Glass rendering engine</li><li>16TB Neural Memory</li></ul>`;

const DEFAULT_SHEET_DATA = (() => {
    const data = Array(20).fill(0).map(() => Array(10).fill(''));
    data[0][0] = 'Revenue Q1'; data[0][1] = '12000';
    data[1][0] = 'Revenue Q2'; data[1][1] = '15500';
    data[2][0] = 'Revenue Q3'; data[2][1] = '18200';
    data[3][0] = 'TOTAL';      data[3][1] = '=SUM(B1:B3)';
    data[4][0] = 'AVERAGE';    data[4][1] = '=AVG(B1:B3)';
    data[6][0] = 'Growth %';   data[6][1] = '=(B2-B1)/B1';
    return data;
})();

// Removed local DEFAULT_PERMISSIONS as it is now imported from constants/initialFs.ts
// Removed local INITIAL_FS as it is now imported from constants/initialFs.ts

const SYSTEM_TOKEN = (import.meta as any).env.VITE_STORAGE_ACCESS_TOKEN || 'glass_os_core_token_2026';

// --- Persistence & Storage Service ---
const persistence = {
  sync: async (data: any) => {
    try {
      await fetch('/api/storage', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'x-glass-token': SYSTEM_TOKEN
        },
        body: JSON.stringify(data)
      });
    } catch (e) {
      console.warn('Sync failed', e);
    }
  }
};

export const cn = (...classes: (string | boolean | undefined)[]) => classes.filter(Boolean).join(' ');

export const checkPermission = (item: FileSystemItem | undefined, mode: 'r' | 'w' | 'x', isAdmin: boolean = false) => {
  if (!item) return false;
  if (isAdmin) return true; // Admins bypass all permissions
  if (!item.permissions) return true; // Default allow if no permissions defined (legacy or public)
  
  // For now, since we only have one user context in the browser, 
  // we check if 'others' or 'group' has the right.
  // In a real multiuser system, we'd check against item.owner.
  return item.permissions.others[mode] || item.permissions.group[mode] || item.permissions.owner[mode];
};

export const findItemByPath = (items: FileSystemItem[], path: string[]): FileSystemItem | null => {
  if (path.length === 0) return null;
  let current: FileSystemItem | null = null;
  let level = items;
  for (const segment of path) {
    current = level.find(item => item.name === segment) || null;
    if (current && current.type === 'folder' && current.children) {
      level = current.children;
    } else if (segment !== path[path.length - 1]) {
      return null;
    }
  }
  return current;
};

// --- Components ---

export default function App() {
  const [fs, setFs] = useState<FileSystemItem[]>(INITIAL_FS);
  const fsLib = useMemo(() => new FileSystemLib(fs, setFs), [fs, setFs]);
  const [windows, setWindows] = useState<WindowState[]>([]);
  const [activeWindow, setActiveWindow] = useState<AppId | null>(null);
  const [wallpaper, setWallpaper] = useState(WALLPAPERS[0]);
  const [accentColor, setAccentColor] = useState('#3b82f6');
  const [systemFontFamily, setSystemFontFamily] = useState('Inter');
  const [systemFontSize, setSystemFontSize] = useState('14');
  const [systemFontWeight, setSystemFontWeight] = useState('400');
  const [userName, setUserName] = useState('Administrator');
  const [users, setUsers] = useState<UserAccount[]>([
    { id: '1', username: 'Administrator', avatar: 'https://cdn-icons-png.flaticon.com/512/1144/1144760.png', isAdmin: true },
    { id: '2', username: 'Engineer', avatar: 'https://cdn-icons-png.flaticon.com/512/219/219983.png', isAdmin: false },
  ]);
  const [currentUser, setCurrentUser] = useState<UserAccount | null>(null);
  const [isLockScreen, setIsLockScreen] = useState(true);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [printQueue, setPrintQueue] = useState<PrintJob[]>([]);
  const [networkConfig, setNetworkConfig] = useState<NetworkConfig>({
    ip: '192.168.1.104',
    mac: '00:1A:2B:3C:4D:5E',
    gateway: '192.168.1.1',
    dns: '8.8.8.8',
    speed: '1.2 Gbps',
    strength: 85,
    hostname: 'glass-workstation.local',
    protocols: {
      xmpp: { jid: 'user@glass.os', status: 'available', server: 'xmpp.glass.os', encrypted: true },
      grpc: { service: 'MailService.v1', connection: 'idle', latency: 4, protoLoaded: true }
    }
  });
  const [networkNodes, setNetworkNodes] = useState<NetworkNode[]>([
    { id: '1', hostname: 'server-alpha.local', ip: '192.168.1.50', services: ['GlassDrive', 'RelationalDB'], status: 'online', isAuthorized: false },
    { id: '2', hostname: 'work-laptop.local', ip: '192.168.1.12', services: ['GlassDrive'], status: 'online', isAuthorized: true },
    { id: '3', hostname: 'media-center.local', ip: '192.168.1.200', services: ['MusicStream'], status: 'offline', isAuthorized: false },
  ]);
  const [authorizedTokens, setAuthorizedTokens] = useState<OAuthToken[]>([]);
  const [kernelCalls, setKernelCalls] = useState<KernelCall[]>([]);
  const [networkTraffic, setNetworkTraffic] = useState<TrafficEvent[]>([]);
  const [networkStatus, setNetworkStatus] = useState<'connected' | 'disconnected' | 'connecting'>('connected');
  const [connectedNetwork, setConnectedNetwork] = useState('GlassFiber_5G');
  const [installedApps, setInstalledApps] = useState<AppId[]>(['terminal', 'settings', 'notepad', 'browser', 'photos', 'music', 'appfolder', 'codestudio', 'files', 'systemmonitor', 'glassword', 'glassdraw', 'glasspaint', 'spreadsheet', 'calendar', 'glassmail', 'glassdatabase', 'glassmessaging', 'printers', 'taskscheduler']);
  const [notepadContent, setNotepadContent] = useState('');
  const [glassWordContent, setGlassWordContent] = useState(DEFAULT_GLASSWORD_CONTENT);
  const [activeFileInGlassWord, setActiveFileInGlassWord] = useState<{name: string, path: string[]} | null>(null);
  const [activeFileInSheets, setActiveFileInSheets] = useState<{name: string, path: string[]} | null>(null);
  const [notepadStyle, setNotepadStyle] = useState<any>({ fontSize: '14px', fontWeight: 'normal', textAlign: 'left' });
  const [glassScriptLine, setGlassScriptLine] = useState<number>(-1);
  const [brainscriptLine, setBrainscriptLine] = useState<number>(-1);
  const [activeFileInNotepad, setActiveFileInNotepad] = useState<{name: string, path: string[]} | null>(null);
  const [calendarEvents, setCalendarEvents] = useState<any[]>([
    { id: '1', title: 'System Review', date: new Date().toISOString().split('T')[0], time: '10:00', type: 'meeting' },
    { id: '2', title: 'Database Migration', date: new Date().toISOString().split('T')[0], time: '14:30', type: 'work' },
  ]);
  const [sheetData, setSheetData] = useState<string[][]>(DEFAULT_SHEET_DATA);
  const [builds, setBuilds] = useState<BrainscriptBuild[]>([]);
  const [tasks, setTasks] = useState<ScheduledTask[]>([]);
  const [collections, setCollections] = useState<DBCollections>({
    emails: [],
    messages: []
  });
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
  const [serverStatus, setServerStatus] = useState<'online' | 'offline' | 'syncing'>('offline');
  const [contextMenu, setContextMenu] = useState<{ x: number, y: number, items: ContextMenuItem[] } | null>(null);
  const [isAltTabOpen, setIsAltTabOpen] = useState(false);
  const [isQuickSettingsOpen, setIsQuickSettingsOpen] = useState(false);
  const desktopRef = useRef<HTMLDivElement>(null);
  const socketRef = useRef<Socket | null>(null);

  const loadFromCloud = useCallback(async () => {
    try {
      const response = await fetch('/api/storage', {
        headers: { 'x-glass-token': SYSTEM_TOKEN }
      });
      if (response.ok) {
        const cloudData = await response.json();
        setServerStatus('online');
        
        if (cloudData.fs_v1) setFs(cloudData.fs_v1);
        if (cloudData.collections) setCollections(cloudData.collections);
        if (cloudData.settings_v1) {
          const { username, wallpaper, accentColor, notepad, fontFamily, fontSize, fontWeight } = cloudData.settings_v1;
          if (username) setUserName(username);
          if (wallpaper) setWallpaper(wallpaper);
          if (accentColor) setAccentColor(accentColor);
          if (notepad) setNotepadContent(notepad);
          if (fontFamily) setSystemFontFamily(fontFamily);
          if (fontSize) setSystemFontSize(fontSize);
          if (fontWeight) setSystemFontWeight(fontWeight);
        }
        return true;
      }
    } catch (err) {
      setServerStatus('offline');
      console.warn("Server persistence unavailable, using local mirror.");
    }
    return false;
  }, [SYSTEM_TOKEN]);

  // Socket initialization
  useEffect(() => {
    const socket = io();
    socketRef.current = socket;

    socket.on('connect', () => {
      console.log('Connected to GlassOS Signal Engine');
    });

    socket.on('storage:updated', () => {
      console.log('Remote change detected, syncing...');
      loadFromCloud();
    });

    return () => {
      socket.disconnect();
    };
  }, [loadFromCloud]);

  const [isAdmin, setIsAdmin] = useState(AuthLib.getSession().isAdmin);
  const [isSandboxed, setIsSandboxed] = useState(AuthLib.getSession().isSandboxed);
  const [sudoTarget, setSudoTarget] = useState<{ onVerified: () => void } | null>(null);

  const requestSudo = useCallback((onVerified: () => void) => {
    if (AuthLib.checkAccess(true)) {
      onVerified();
    } else {
      setSudoTarget({ onVerified });
    }
  }, []);

  const handleSudoVerify = (password: string) => {
    if (AuthLib.verifySudo(password)) {
      setIsAdmin(true);
      sudoTarget?.onVerified();
      setSudoTarget(null);
      addNotification('Security', 'Gatekeeper: Access Granted', 'success');
    } else {
      addNotification('Security', 'Gatekeeper: Access Denied', 'error');
    }
  };

  // NOC Mock Traffic & Kernel Calls
  useEffect(() => {
    const interval = setInterval(() => {
      // Random Kernel Call
      const services = ['AuthService', 'StorageBridge', 'NetworkKernel', 'CryptoEngine', 'GlassFS'];
      const methods = ['verifyToken', 'syncBlock', 'resolveMDNS', 'encryptPacket', 'mountRemote'];
      const newCall: KernelCall = {
        id: Math.random().toString(36).substr(2, 9),
        service: services[Math.floor(Math.random() * services.length)],
        method: methods[Math.floor(Math.random() * methods.length)],
        status: Math.random() > 0.9 ? 'error' : Math.random() > 0.8 ? 'warning' : 'success',
        timestamp: new Date().toLocaleTimeString(),
        latency: Math.floor(Math.random() * 50) + 2
      };
      setKernelCalls(prev => [newCall, ...prev].slice(0, 50));

      // Random Traffic Event
      const protocols: TrafficEvent['protocol'][] = ['gRPC', 'XMPP', 'IP', 'mDNS'];
      const sources = ['192.168.1.104', 'server-alpha.local', 'user@glass.os', 'kernel.local'];
      const dests = ['xmpp.glass.os', 'work-laptop.local', '192.168.1.1', '8.8.8.8'];
      const newTraffic: TrafficEvent = {
        id: Math.random().toString(36).substr(2, 9),
        protocol: protocols[Math.floor(Math.random() * protocols.length)],
        source: sources[Math.floor(Math.random() * sources.length)],
        destination: dests[Math.floor(Math.random() * dests.length)],
        size: `${(Math.random() * 10).toFixed(1)} KB`,
        timestamp: new Date().toLocaleTimeString()
      };
      setNetworkTraffic(prev => [newTraffic, ...prev].slice(0, 50));
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  // Persistence & Server Sync
  useEffect(() => {
    const initStorage = async () => {
      // 1. Local Load (Instant)
      const savedName = localStorage.getItem('glassos_username');
      if (savedName) setUserName(savedName);
      const savedWallpaper = localStorage.getItem('glassos_wallpaper');
      if (savedWallpaper) setWallpaper(savedWallpaper);
      const savedAccentColor = localStorage.getItem('glassos_accent_color');
      if (savedAccentColor) setAccentColor(savedAccentColor);
      const savedFontFamily = localStorage.getItem('glassos_font_family');
      if (savedFontFamily) setSystemFontFamily(savedFontFamily);
      const savedFontSize = localStorage.getItem('glassos_font_size');
      if (savedFontSize) setSystemFontSize(savedFontSize);
      const savedFontWeight = localStorage.getItem('glassos_font_weight');
      if (savedFontWeight) setSystemFontWeight(savedFontWeight);
      const savedNotepad = localStorage.getItem('glassos_notepad');
      if (savedNotepad) setNotepadContent(savedNotepad);
      const savedBuilds = localStorage.getItem('glassos_builds');
      if (savedBuilds) setBuilds(JSON.parse(savedBuilds));
      const savedTasks = localStorage.getItem('glassos_tasks');
      if (savedTasks) setTasks(JSON.parse(savedTasks));
      const savedWindows = localStorage.getItem('glassos_windows');
      if (savedWindows) setWindows(JSON.parse(savedWindows));
      const savedClipboard = localStorage.getItem('glassos_clipboard');
      if (savedClipboard) setClipboardHistory(JSON.parse(savedClipboard));
      const savedNetwork = localStorage.getItem('glassos_network_config');
      if (savedNetwork) setNetworkConfig(JSON.parse(savedNetwork));
      const savedApps = localStorage.getItem('glassos_installed_apps');
      if (savedApps) setInstalledApps(JSON.parse(savedApps));
      const savedNotifications = localStorage.getItem('glassos_notification_history');
      if (savedNotifications) setNotificationHistory(JSON.parse(savedNotifications));

      await storage.init();
      const localFs = await storage.loadFS();
      if (localFs) setFs(localFs);

      // 2. Server Sync
      const success = await loadFromCloud();
      if (success) {
        addNotification('System', 'Connected to GlassOS Cloud', 'success');
      }
    };

    initStorage();
  }, [loadFromCloud]);

  // Sync Logic
  useEffect(() => {
    // Local Sync
    localStorage.setItem('glassos_username', userName);
    localStorage.setItem('glassos_wallpaper', wallpaper);
    localStorage.setItem('glassos_accent_color', accentColor);
    localStorage.setItem('glassos_font_family', systemFontFamily);
    localStorage.setItem('glassos_font_size', systemFontSize);
    localStorage.setItem('glassos_font_weight', systemFontWeight);
    localStorage.setItem('glassos_notepad', notepadContent);
    localStorage.setItem('glassos_builds', JSON.stringify(builds));
    localStorage.setItem('glassos_tasks', JSON.stringify(tasks));
    localStorage.setItem('glassos_windows', JSON.stringify(windows));
    localStorage.setItem('glassos_clipboard', JSON.stringify(clipboardHistory));
    localStorage.setItem('glassos_network_config', JSON.stringify(networkConfig));
    localStorage.setItem('glassos_installed_apps', JSON.stringify(installedApps));
    localStorage.setItem('glassos_notification_history', JSON.stringify(notificationHistory));
    
    storage.saveFS(fs).catch(() => {});

    // Server Sync (Debounced)
    const syncTimeout = setTimeout(async () => {
      if (serverStatus !== 'offline') {
        try {
          setServerStatus('syncing');
          await fetch('/api/storage', {
            method: 'POST',
            headers: { 
              'Content-Type': 'application/json',
              'x-glass-token': SYSTEM_TOKEN,
              'x-socket-id': socketRef.current?.id || ''
            },
            body: JSON.stringify({
              fs_v1: fs,
              collections: collections,
              settings_v1: {
                username: userName,
                wallpaper: wallpaper,
                accentColor: accentColor,
                notepad: notepadContent,
                fontFamily: systemFontFamily,
                fontSize: systemFontSize,
                fontWeight: systemFontWeight
              }
            })
          });
          setServerStatus('online');
        } catch {
          setServerStatus('offline');
        }
      }
    }, 2000);

    return () => clearTimeout(syncTimeout);
  }, [userName, wallpaper, notepadContent, builds, fs, windows, clipboardHistory, tasks, networkConfig, installedApps, notificationHistory]);

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
    localStorage.setItem('glassos_windows', JSON.stringify(windows));
    localStorage.setItem('glassos_clipboard', JSON.stringify(clipboardHistory));
    localStorage.setItem('glassos_network_config', JSON.stringify(networkConfig));
    localStorage.setItem('glassos_installed_apps', JSON.stringify(installedApps));
    localStorage.setItem('glassos_notification_history', JSON.stringify(notificationHistory));
    
    if (activeWindow) {
      localStorage.setItem('glassos_active_window', activeWindow);
    } else {
      localStorage.removeItem('glassos_active_window');
    }

    // Save FS to IndexedDB (more data-robust)
    storage.saveFS(fs).catch(err => console.error("FS Save Error:", err));
  }, [userName, wallpaper, notepadContent, builds, fs, windows, activeWindow, clipboardHistory, tasks, networkConfig, installedApps, notificationHistory]);

  const lastWidth = useRef(window.innerWidth);
  
  useEffect(() => {
    const handleResize = () => {
      const screenW = window.innerWidth;
      const screenH = window.innerHeight;
      
      const widthChanged = screenW !== lastWidth.current;
      lastWidth.current = screenW;

      setWindows(prev => prev.map(w => {
        if (w.isMaximized) {
          return {
            ...w,
            width: screenW,
            height: screenH - 48
          };
        }
        
        // If only height changed (likely keyboard on mobile), DO NOT adjust non-maximized windows
        // This keeps the window unaffected by the keyboard as requested.
        if (!widthChanged) return w;

        let x = w.x;
        let y = w.y;
        let width = w.width;
        let height = w.height;

        // Ensure window is at least partially visible and fits new width
        width = Math.min(width, screenW - 40);
        height = Math.min(height, screenH - 120);

        if (x > screenW - 40) x = screenW - 100;
        if (y > screenH - 40) y = screenH - 96;
        if (x < -width + 40) x = 0;
        if (y < 0) y = 0;

        return { ...w, x, y, width, height };
      }));
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const openWindow = (id: AppId, title: string) => {
    const existing = windows.find(w => w.id === id);
    const maxZ = Math.max(0, ...windows.map(w => w.zIndex));

    if (existing) {
      setWindows(prev => prev.map(w => w.id === id ? { ...w, isMinimized: false, zIndex: maxZ + 1 } : w));
      setActiveWindow(id);
      return;
    }

    const screenW = window.innerWidth;
    const screenH = window.innerHeight;
    
    // Default sizes
    let w = id === 'codestudio' ? 1000 : id === 'glassmail' ? 800 : 600;
    let h = id === 'codestudio' ? 700 : id === 'glassmail' ? 500 : 400;

    // Cap to screen size with some margins
    w = Math.min(w, screenW - 40);
    h = Math.min(h, screenH - 120); // More margin for taskbar and titlebar

    const newWindow: WindowState = {
      id,
      title,
      isOpen: true,
      isMinimized: false,
      isMaximized: false,
      zIndex: maxZ + 1,
      x: Math.max(20, Math.min(100 + (windows.length % 10) * 30, screenW - w - 20)),
      y: Math.max(20, Math.min(100 + (windows.length % 10) * 30, screenH - h - 60)),
      width: w,
      height: h,
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
    setWindows(prev => prev.map(w => {
      if (w.id !== id) return w;
      
      const desktop = desktopRef.current;
      const screenW = desktop ? desktop.offsetWidth : window.innerWidth;
      const screenH = desktop ? desktop.offsetHeight : window.innerHeight;
      
      // Strict bounding for window coordinates
      const safeX = Math.max(0, Math.min(x, screenW - 100)); // Keep title bar reachable
      const safeY = Math.max(0, Math.min(y, screenH - 96));  // Keep above taskbar
      
      return { ...w, x: safeX, y: safeY };
    }));
  };

  const updateWindowSize = (id: AppId, width: number, height: number) => {
    setWindows(prev => prev.map(w => {
      if (w.id !== id) return w;
      const screenW = window.innerWidth;
      const screenH = window.innerHeight;
      const safeW = Math.max(300, Math.min(width, screenW - w.x));
      const safeH = Math.max(200, Math.min(height, screenH - w.y - 48)); // Leave space for taskbar
      return { ...w, width: safeW, height: safeH };
    }));
  };

  const updateWindowRect = (id: AppId, rect: { x?: number, y?: number, width?: number, height?: number }) => {
    setWindows(prev => prev.map(w => {
      if (w.id !== id) return w;
      const screenW = window.innerWidth;
      const screenH = window.innerHeight;
      const newRect = { ...rect };
      
      if (newRect.x !== undefined) newRect.x = Math.max(0, Math.min(newRect.x, screenW - 100));
      if (newRect.y !== undefined) newRect.y = Math.max(0, Math.min(newRect.y, screenH - 96));
      
      const currentX = newRect.x !== undefined ? newRect.x : w.x;
      const currentY = newRect.y !== undefined ? newRect.y : w.y;
      
      if (newRect.width !== undefined) newRect.width = Math.max(300, Math.min(newRect.width, screenW - currentX));
      if (newRect.height !== undefined) newRect.height = Math.max(200, Math.min(newRect.height, screenH - currentY - 48));
      
      return { ...w, ...newRect };
    }));
  };

  const addNotification = (title: string, message: string, type: Notification['type'] = 'info') => {
    // Notifications disabled by user request
    console.log(`[Notification Silenced] ${title}: ${message}`);
    return;
  };

  const runGlassScript = async (script: string) => {
    const interpreter = new GlassScriptInterpreter({
      activeApp: activeWindow,
      notified: (msg, title, type) => addNotification(title || 'Script', msg, type),
      updateNotepad: (content) => setNotepadContent(content),
      getNotepadContent: () => notepadContent,
      setNotepadStyle: (style) => setNotepadStyle((prev: any) => ({ ...prev, ...style })),
      openWindow: (id, title) => openWindow(id, title),
      systemDate: () => new Date().toLocaleDateString(),
      db: {
        getCollections: () => collections,
        setCollections: (next: any) => setCollections(next)
      }
    }, (line) => setGlassScriptLine(line));

    await interpreter.execute(script);
  };

  const runBrainscript = async (script: string, onPrint: (msg: string) => void) => {
    const interpreter = new BrainscriptInterpreter({
      print: onPrint,
      notify: (msg, type) => addNotification('Brainscript', msg, type),
      systemDate: () => new Date().toLocaleDateString(),
      readFile: async (path: string) => {
          const item = fsLib.findItemByPath(fs, path.split('/'));
          return item && item.type === 'file' ? item.content : null;
      },
      prompt: async (message: string) => {
          const result = window.prompt(message);
          return result;
      }
    }, (line) => setBrainscriptLine(line));

    await interpreter.execute(script);
  };

  const handleLogout = () => {
    setIsLoggingOut(true);
    setWindows([]);
    setTimeout(() => {
      setIsLoggingOut(false);
      setIsLockScreen(true);
      setCurrentUser(null);
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
      className="h-full w-full relative overflow-hidden select-text font-sans transition-all duration-500"
      style={{ 
        backgroundImage: `url(${wallpaper})`,
        '--system-font-family': `${systemFontFamily}, sans-serif`,
        '--system-font-size': `${systemFontSize}px`,
        '--system-font-weight': systemFontWeight,
        fontFamily: 'var(--system-font-family)',
        fontSize: 'var(--system-font-size)',
        fontWeight: 'var(--system-font-weight)'
      } as React.CSSProperties}
      onContextMenu={(e) => {
        if (isLockScreen) return;
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
      <AnimatePresence mode="wait">
        {isLockScreen ? (
          <LoginScreen 
            key="login"
            users={users} 
            onLogin={(user) => {
              setCurrentUser(user);
              setUserName(user.username);
              setIsAdmin(user.isAdmin);
              setIsLockScreen(false);
              addNotification('System', `Welcome back, ${user.username}!`, 'success');
            }} 
            addNotification={addNotification}
          />
        ) : (
          <motion.div
            key="desktop"
            initial={{ opacity: 0, scale: 1.1 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="w-full h-full relative"
          >
            {/* Desktop Icons */}
            <div className="absolute top-0 left-0 p-6 grid grid-flow-col grid-rows-6 gap-6 z-0">
              <DesktopIcon icon={<TerminalIcon />} label="Terminal" onClick={() => openWindow('terminal', 'Terminal')} />
              <DesktopIcon icon={<Folder />} label="Files" color={accentColor} onClick={() => openWindow('files', 'File Explorer')} />
              <DesktopIcon icon={<Globe />} label="Browser" onClick={() => openWindow('browser', 'Web Browser')} />
              <DesktopIcon icon={<ImageIcon />} label="Photos" onClick={() => openWindow('photos', 'Photos')} />
              <DesktopIcon icon={<FileText />} label="Notepad" onClick={() => openWindow('notepad', 'Notepad')} />
              <DesktopIcon icon={<FileTextIcon className="text-blue-400" />} label="GlassWord" onClick={() => openWindow('glassword', 'GlassWord 2026')} />
              <DesktopIcon icon={<Music />} label="Music" onClick={() => openWindow('music', 'Media Player')} />
              <DesktopIcon icon={<Package />} label="App Folder" onClick={() => openWindow('appfolder', 'App Folder')} />
              <DesktopIcon icon={<Code />} label="Code Studio" onClick={() => openWindow('codestudio', 'Code Studio - main.b')} />
              <DesktopIcon icon={<Clipboard />} label="Clipboard" onClick={() => setIsClipboardOpen(true)} />
              <DesktopIcon icon={<Activity />} label="NOC Center" onClick={() => openWindow('systemmonitor', 'NOC Center')} />
              <DesktopIcon icon={<PrinterIcon />} label="Printers" onClick={() => openWindow('printers', 'Print Manager')} />
              <DesktopIcon icon={<Calendar />} label="Calendar" onClick={() => openWindow('calendar', 'Glass Calendar')} />
              <DesktopIcon icon={<TableIcon />} label="Sheets" onClick={() => openWindow('spreadsheet', 'Glass Sheets')} />
              <DesktopIcon icon={<Mail />} label="GlassMail" onClick={() => openWindow('glassmail', 'GlassMail Professional')} />
              <DesktopIcon icon={<MessageSquare />} label="Messages" onClick={() => openWindow('glassmessaging', 'Systems Messaging')} />
              <DesktopIcon icon={<Database />} label="Database" onClick={() => openWindow('glassdatabase', 'GlassDatabase Engine')} />
              <DesktopIcon icon={<BoxIcon className="text-orange-400" />} label="GlassDraw" onClick={() => openWindow('glassdraw', 'Glass Draw Vector')} />
              <DesktopIcon icon={<Palette className="text-pink-400" />} label="GlassPaint" onClick={() => openWindow('glasspaint', 'Glass Paint Raster')} />
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
                  onResizeRect={(rect: any) => updateWindowRect(win.id, rect)}
                  onDragEnd={(x: number, y: number) => updateWindowPos(win.id, x, y)}
                >
                  {renderApp(win.id, { 
                    userName, setUserName, 
                    wallpaper, setWallpaper, 
                    accentColor, setAccentColor,
                    systemFontFamily, setSystemFontFamily,
                    systemFontSize, setSystemFontSize,
                    systemFontWeight, setSystemFontWeight,
                    handleLogout,
                    networkStatus, setNetworkStatus,
                    connectedNetwork, setConnectedNetwork,
                    networkConfig, setNetworkConfig,
                    notepadContent, setNotepadContent,
                    glassWordContent, setGlassWordContent,
                    activeFileInGlassWord, setActiveFileInGlassWord,
                    notepadStyle, setNotepadStyle,
                    glassScriptLine, runGlassScript,
                    brainscriptLine, runBrainscript,
                    calendarEvents, setCalendarEvents,
                    sheetData, setSheetData,
                    activeFileInSheets, setActiveFileInSheets,
                    activeFileInNotepad, setActiveFileInNotepad,
                    builds, setBuilds,
                    openWindow,
                    fs,
                    setFs,
                    fsLib,
                    tasks,
                    setTasks,
                    setActiveScreensaver,
                    setContextMenu,
                    addNotification,
                    cpuUsage,
                    ramUsage,
                    clipboardHistory,
                    setClipboardHistory,
                    closeWindow,
                    printQueue,
                    setPrintQueue,
                    currentUser,
                    users,
                    setUsers,
                    collections,
                    setCollections,
                    serverStatus,
                    networkNodes, setNetworkNodes, kernelCalls, setKernelCalls, networkTraffic, setNetworkTraffic,
                    authorizedTokens, setAuthorizedTokens,
                    isAdmin, setIsAdmin, isSandboxed, setIsSandboxed, requestSudo,
                  })}
                </Window>
              ))}
            </AnimatePresence>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Gatekeeper Sudo Modal */}
      <AnimatePresence>
        {sudoTarget && (
          <div className="fixed inset-0 z-[2000] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/80 backdrop-blur-md"
              onClick={() => setSudoTarget(null)}
            />
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="relative w-full max-w-sm glass-dark rounded-3xl border border-red-500/30 p-8 shadow-[0_0_50px_rgba(239,68,68,0.2)] overflow-hidden"
            >
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-red-500 to-transparent opacity-50" />
              <div className="flex flex-col items-center gap-6">
                <div className="w-16 h-16 rounded-2xl bg-red-500/10 flex items-center justify-center border border-red-500/20 shadow-[0_0_20px_rgba(239,68,68,0.1)]">
                  <Shield size={32} className="text-red-500 animate-pulse" />
                </div>
                <div className="text-center">
                  <h2 className="text-xl font-bold tracking-tight mb-2">Gatekeeper Auth</h2>
                  <p className="text-xs text-white/40 uppercase tracking-widest leading-relaxed">
                    Administrative credentials required to <br/>modify kernel parameters
                  </p>
                </div>
                
                <div className="w-full space-y-4">
                  <div className="relative">
                    <Lock size={14} className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20" />
                    <input 
                      autoFocus
                      type="password"
                      placeholder="Enter Admin Password"
                      className="w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-12 pr-4 text-sm focus:outline-none focus:border-red-500/50 transition-all font-mono"
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') handleSudoVerify(e.currentTarget.value);
                      }}
                    />
                  </div>
                  <div className="flex gap-3">
                    <button 
                      onClick={() => setSudoTarget(null)}
                      className="flex-1 py-3 rounded-xl bg-white/5 hover:bg-white/10 text-xs font-bold uppercase tracking-widest transition-all"
                    >
                      Cancel
                    </button>
                    <button 
                      onClick={(e) => {
                        const input = e.currentTarget.parentElement?.previousElementSibling?.querySelector('input');
                        if (input) handleSudoVerify(input.value);
                      }}
                      className="flex-1 py-3 rounded-xl bg-red-600 hover:bg-red-500 text-white text-xs font-bold uppercase tracking-widest shadow-lg shadow-red-500/20 transition-all overflow-hidden relative group"
                    >
                      Authorize
                    </button>
                  </div>
                </div>

                <div className="pt-4 border-t border-white/5 w-full text-center">
                  <p className="text-[9px] text-white/20 uppercase font-bold tracking-tighter">
                    Kernel Session: Sudo Mode Active
                  </p>
                </div>
              </div>
            </motion.div>
          </div>
        )}
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
                          { id: 'glassdraw', label: 'GlassDraw', color: 'bg-orange-500/20 text-orange-400' },
                          { id: 'glasspaint', label: 'GlassPaint', color: 'bg-pink-500/20 text-pink-400' },
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
                              {app.id === 'clipboard' ? <Clipboard size={20} /> : getAppIcon(app.id as AppId, 20, app.id === 'files' ? accentColor : undefined)}
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
                    <div className="flex items-center gap-1.5">
                      <span className="text-[10px] text-white/40">GlassOS Pro</span>
                      {window.electronAPI && (
                        <span className="flex items-center gap-1 px-1.5 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-[8px] font-bold text-emerald-400 uppercase tracking-tighter">
                          <Zap size={8} /> Native
                        </span>
                      )}
                    </div>
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
      <div className="absolute bottom-0 left-0 right-0 h-12 glass-dark flex items-center px-2 gap-2 z-[5000]">
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
            <div className="flex items-center gap-1.5 group cursor-help" title="Local Persistence Active">
              <HardDrive size={14} className="text-purple-400" />
              <div className="flex gap-0.5">
                <div className="w-0.5 h-3 bg-green-500/50 rounded-full" />
                <div className="w-0.5 h-3 bg-green-500 rounded-full" />
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2 text-white/70">
            <div className="relative group cursor-help" title={`Cloud Sync: ${serverStatus}`}>
              <Cloud 
                size={16} 
                className={cn(
                  "transition-all duration-500",
                  serverStatus === 'online' ? "text-blue-400" : 
                  serverStatus === 'syncing' ? "text-amber-400 animate-pulse" : 
                  "text-white/10"
                )} 
              />
              <div className={cn(
                "absolute -top-1 -right-1 w-1.5 h-1.5 rounded-full border border-black transition-colors",
                serverStatus === 'online' ? "bg-green-500" : 
                serverStatus === 'syncing' ? "bg-amber-500" : 
                "bg-red-500"
              )} />
            </div>
            <button 
              onClick={() => setIsNotificationSidebarOpen(!isNotificationSidebarOpen)}
              className={cn(
                "p-2 rounded-lg transition-all relative",
                isNotificationSidebarOpen ? "bg-white/20" : "hover:bg-white/10"
              )}
            >
              <Bell size={16} />
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

function DesktopIcon({ icon, label, onClick, color }: { icon: React.ReactNode, label: string, onClick: () => void, color?: string }) {
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
        {React.cloneElement(icon as React.ReactElement, { size: 28, style: color ? { color } : undefined, className: color ? undefined : "text-white/80" })}
      </div>
      <span className="text-[11px] text-center font-medium drop-shadow-md text-white/90">{label}</span>
    </motion.div>
  );
}

function ResizeHandle({ direction, onResize, className, children }: any) {
  return (
    <motion.div 
      drag
      dragMomentum={false}
      dragElastic={0}
      onDrag={(e, info) => onResize(direction, info)}
      onDragEnd={(e) => {
        // Reset handle position manually to prevent it from moving away
        const target = e.target as HTMLElement;
        if (target) {
          target.style.transform = 'none';
        }
      }}
      className={className}
      style={{ touchAction: 'none' }}
    >
      {children}
    </motion.div>
  );
}

function Window({ win, isActive, onFocus, onClose, onMinimize, onMaximize, onResizeRect, onDragEnd, dragConstraints, children }: any) {
  const controls = useDragControls();
  const windowRef = useRef<HTMLDivElement>(null);

  if (win.isMinimized) return null;

  const handleResize = (direction: string, info: any) => {
    if (win.isMaximized) return;
    
    const delta = info.delta;
    let { x, y, width, height } = { x: win.x, y: win.y, width: win.width, height: win.height };
    const minW = 300;
    const minH = 200;

    if (direction.includes('r')) width = Math.max(minW, width + delta.x);
    if (direction.includes('b')) height = Math.max(minH, height + delta.y);
    
    if (direction.includes('l')) {
      const newWidth = Math.max(minW, width - delta.x);
      x = x + (width - newWidth);
      width = newWidth;
    }
    
    if (direction.includes('t')) {
      const newHeight = Math.max(minH, height - delta.y);
      y = y + (height - newHeight);
      height = newHeight;
    }

    onResizeRect({ x, y, width, height });
  };

  return (
    <motion.div
      ref={windowRef}
      initial={{ opacity: 0, scale: 0.9, y: 20 }}
      animate={{ 
        opacity: 1, 
        scale: 1, 
        y: 0,
        width: win.isMaximized ? "100%" : win.width,
        height: win.isMaximized ? "calc(100% - 48px)" : win.height,
        left: win.isMaximized ? 0 : win.x,
        top: win.isMaximized ? 0 : win.y,
        zIndex: win.zIndex
      }}
      exit={{ opacity: 0, scale: 0.9, y: 20 }}
      transition={{ type: 'spring', damping: 25, stiffness: 300, mass: 0.5 }}
      drag={!win.isMaximized}
      dragMomentum={true}
      dragTransition={{ bounceStiffness: 500, bounceDamping: 25 }}
      dragListener={false}
      dragControls={controls}
      dragConstraints={dragConstraints}
      dragElastic={0.1}
      whileDrag={{ scale: 1.01, boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.5)" }}
      onDragEnd={() => {
        if (windowRef.current && dragConstraints && dragConstraints.current) {
          const rect = windowRef.current.getBoundingClientRect();
          const desktopRect = dragConstraints.current.getBoundingClientRect();
          onDragEnd(rect.left - desktopRect.left, rect.top - desktopRect.top);
        }
      }}
      onPointerDown={onFocus}
      style={{ 
        position: 'absolute',
        touchAction: 'none'
      }}
      className={cn(
        "glass-dark rounded-xl flex flex-col shadow-2xl border border-white/20",
        isActive ? "ring-1 ring-white/30" : "opacity-90",
        win.isMaximized ? "rounded-none border-none" : ""
      )}
    >
      {/* Title Bar */}
      <div 
        className="h-12 flex items-center justify-between px-4 cursor-grab active:cursor-grabbing select-none bg-white/5 touch-none shrink-0"
        onPointerDown={(e) => {
          e.stopPropagation();
          onFocus();
          if (!win.isMaximized) controls.start(e);
        }}
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

      {/* Resize Handles */}
      {!win.isMaximized && (
        <>
          <ResizeHandle direction="r" onResize={handleResize} className="absolute top-0 -right-1 w-2 h-full cursor-ew-resize z-50" />
          <ResizeHandle direction="b" onResize={handleResize} className="absolute -bottom-1 left-0 w-full h-2 cursor-ns-resize z-50" />
          <ResizeHandle direction="l" onResize={handleResize} className="absolute top-0 -left-1 w-2 h-full cursor-ew-resize z-50" />
          <ResizeHandle direction="t" onResize={handleResize} className="absolute -top-1 left-0 w-full h-2 cursor-ns-resize z-50" />
          
          <ResizeHandle direction="br" onResize={handleResize} className="absolute -bottom-2 -right-2 w-6 h-6 cursor-nwse-resize z-50">
            <div className="w-2 h-2 border-r-2 border-b-2 border-white/30 rounded-br-sm absolute bottom-2 right-2" />
          </ResizeHandle>
          <ResizeHandle direction="bl" onResize={handleResize} className="absolute -bottom-2 -left-2 w-6 h-6 cursor-nesw-resize z-50" />
          <ResizeHandle direction="tr" onResize={handleResize} className="absolute -top-2 -right-2 w-6 h-6 cursor-nesw-resize z-50" />
          <ResizeHandle direction="tl" onResize={handleResize} className="absolute -top-2 -left-2 w-6 h-6 cursor-nwse-resize z-50" />
        </>
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
    { id: 'glassword', label: 'GlassWord', icon: <FileTextIcon size={18} /> },
    { id: 'music', label: 'Media Player', icon: <Music size={18} /> },
    { id: 'codestudio', label: 'Code Studio', icon: <Code size={18} /> },
    { id: 'settings', label: 'Settings', icon: <SettingsIcon size={18} /> },
    { id: 'systemmonitor', label: 'NOC Center', icon: <Activity size={18} /> },
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

function LoginScreen({ users, onLogin, addNotification }: any) {
  const [selectedUser, setSelectedUser] = useState<UserAccount>(users[0]);
  const [password, setPassword] = useState('');
  const [isAuthenticating, setIsAuthenticating] = useState(false);
  const [error, setError] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const handleLogin = () => {
    setIsAuthenticating(true);
    setError(false);
    
    // Simulate auth delay
    setTimeout(() => {
      setIsAuthenticating(false);
      
      const adminPass = AuthLib.adminPassword; // 'admin'
      
      if (selectedUser.isAdmin) {
        if (password === adminPass) {
          onLogin(selectedUser);
        } else {
          setError(true);
          setPassword('');
          addNotification('Login', 'Invalid password. Try "admin"', 'error');
        }
      } else {
        // Guest user login with any password (or no password)
        onLogin(selectedUser);
      }
    }, 800);
  };

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[10000] flex flex-col items-center justify-center bg-black/40 backdrop-blur-2xl"
    >
      <div className="absolute top-20 text-center text-white/90">
        <motion.h1 
          className="text-8xl font-thin tracking-tighter mb-2"
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
        >
          {currentTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false })}
        </motion.h1>
        <motion.p 
          className="text-lg font-light tracking-widest text-white/40 uppercase"
          initial={{ y: -10, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          {currentTime.toLocaleDateString([], { weekday: 'long', month: 'long', day: 'numeric' })}
        </motion.p>
      </div>

      <div className="w-[320px] flex flex-col items-center gap-8">
        <div className="flex gap-4 mb-4">
          {users.map(user => (
            <button
              key={user.id}
              onClick={() => setSelectedUser(user)}
              className={cn(
                "relative transition-all duration-500 rounded-full p-1",
                selectedUser.id === user.id ? "bg-white/20 scale-110" : "opacity-40 hover:opacity-60 grayscale"
              )}
            >
              <img src={user.avatar} alt={user.username} className="w-16 h-16 rounded-full object-cover" />
              {selectedUser.id === user.id && (
                <motion.div 
                  layoutId="activeUser"
                  className="absolute -bottom-1 -right-1 w-5 h-5 bg-blue-500 rounded-full border-2 border-black flex items-center justify-center"
                >
                  <div className="w-2 h-2 bg-white rounded-full" />
                </motion.div>
              )}
            </button>
          ))}
        </div>

        <div className="w-full text-center space-y-4">
          <h2 className="text-2xl font-light text-white">{selectedUser.username}</h2>
          
          <div className="relative">
            <input 
              autoFocus
              type="password"
              placeholder="Enter Password"
              className={cn(
                "w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 text-center text-sm outline-none transition-all placeholder:text-white/20",
                error ? "border-red-500/50 bg-red-500/5 animate-shake" : "focus:bg-white/10 focus:border-white/20"
              )}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleLogin()}
            />
            {isAuthenticating && (
              <RefreshCw size={14} className="absolute right-4 top-1/2 -translate-y-1/2 text-white/40 animate-spin" />
            )}
          </div>

          <button 
            onClick={handleLogin}
            disabled={isAuthenticating}
            className="text-xs text-white/40 hover:text-white transition-colors uppercase tracking-widest"
          >
            Sign In
          </button>
        </div>
      </div>

      <div className="absolute bottom-10 flex gap-12">
        <button className="flex flex-col items-center gap-2 group">
          <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-white/40 group-hover:bg-white/10 group-hover:text-white transition-all">
            <Wifi size={18} />
          </div>
          <span className="text-[10px] uppercase tracking-tighter text-white/20">Wifi</span>
        </button>
        <button className="flex flex-col items-center gap-2 group">
          <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-white/40 group-hover:bg-white/10 group-hover:text-white transition-all">
            <Power size={18} />
          </div>
          <span className="text-[10px] uppercase tracking-tighter text-white/20">Sleep</span>
        </button>
      </div>
    </motion.div>
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

function getAppIcon(id: AppId, size: number, color?: string) {
  switch (id) {
    case 'terminal': return <TerminalIcon size={size} />;
    case 'settings': return <SettingsIcon size={size} />;
    case 'files': return <Folder size={size} style={{ color: color }} />;
    case 'browser': return <Globe size={size} />;
    case 'photos': return <ImageIcon size={size} />;
    case 'notepad': return <FileText size={size} />;
    case 'music': return <Music size={size} />;
    case 'appfolder': return <Package size={size} />;
    case 'codestudio': return <Code size={size} />;
    case 'spreadsheet': return <TableIcon size={size} className="text-emerald-400" />;
    case 'taskscheduler': return <Clock size={size} />;
    case 'glassword': return <FileText size={size} className="text-blue-400" />;
    case 'glassmail': return <Mail size={size} />;
    case 'glassdatabase': return <Database size={size} />;
    case 'glassmessaging': return <MessageSquare size={size} />;
    case 'glassdraw': return <BoxIcon size={size} className="text-orange-400" />;
    case 'glasspaint': return <Palette size={size} className="text-pink-400" />;
    default: return <Box size={size} />;
  }
}

// --- App Renderers ---

// --- Specialized Apps ---

function ScriptPicker({ 
  fs, 
  onClose, 
  onSelect 
}: { 
  fs: FileSystemItem[], 
  onClose: () => void, 
  onSelect: (content: string, name: string) => void 
}) {
  const [currentPath, setCurrentPath] = useState<string[]>(['Projects']);
  
  const currentItems = useMemo(() => {
    if (currentPath.length === 0) return fs;
    const folder = findItemByPath(fs, currentPath);
    return (folder?.type === 'folder' && folder.children) ? folder.children : [];
  }, [fs, currentPath]);

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
        <div className="p-6 border-b border-white/10 flex items-center justify-between bg-white/5">
          <div className="flex items-center gap-3">
             <div className="w-10 h-10 rounded-xl bg-green-500/10 flex items-center justify-center text-green-400">
                <Play size={20} />
             </div>
             <div>
                <h3 className="text-lg font-bold">Run Script</h3>
                <p className="text-[10px] text-white/30 uppercase tracking-widest font-mono">Select .scr or .b source</p>
             </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-lg text-white/40 hover:text-white transition-all">
            <X size={18} />
          </button>
        </div>

        <div className="p-4 bg-white/5 border-b border-white/10 flex items-center gap-2 overflow-x-auto no-scrollbar">
           <button onClick={() => setCurrentPath([])} className="text-[10px] text-white/40 hover:text-white uppercase font-bold tracking-tighter">Root</button>
           {currentPath.map((p, i) => (
             <React.Fragment key={i}>
               <ChevronRight size={10} className="text-white/10" />
               <button onClick={() => setCurrentPath(currentPath.slice(0, i + 1))} className="text-[10px] text-white hover:text-blue-400 capitalize font-medium">{p}</button>
             </React.Fragment>
           ))}
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-1 no-scrollbar lg-scrollbar">
          {currentPath.length > 0 && (
            <button 
              onClick={() => setCurrentPath(currentPath.slice(0, -1))}
              className="w-full text-left p-3 rounded-xl hover:bg-white/5 transition-all flex items-center gap-3 text-white/40"
            >
              <ChevronLeft size={18} />
              <span className="text-xs font-medium">Go Back</span>
            </button>
          )}
          {currentItems.map((item, i) => {
            const isScript = item.name.endsWith('.scr') || item.name.endsWith('.b') || item.name.endsWith('.txt');
            const isFolder = item.type === 'folder';
            
            return (
              <button
                key={i}
                onClick={() => {
                  if (isFolder) {
                    setCurrentPath([...currentPath, item.name]);
                  } else if (isScript) {
                    onSelect(item.content || '', item.name);
                  }
                }}
                className={cn(
                  "w-full text-left p-3 rounded-xl transition-all flex items-center justify-between group",
                  isFolder ? "hover:bg-white/5" : isScript ? "hover:bg-green-500/10 text-green-400/80 hover:text-green-400" : "opacity-20 cursor-not-allowed"
                )}
              >
                <div className="flex items-center gap-3">
                  {isFolder ? <Folder size={18} className="text-blue-400" /> : <Code2 size={18} />}
                  <span className="text-xs font-medium">{item.name}</span>
                </div>
                {isFolder ? <ChevronRight size={14} className="text-white/10" /> : isScript ? <Play size={14} className="opacity-0 group-hover:opacity-100" /> : null}
              </button>
            );
          })}
          {currentItems.length === 0 && (
            <div className="py-20 text-center text-white/20 text-xs font-mono italic">No items in this directory</div>
          )}
        </div>
      </motion.div>
    </div>
  );
}

function GlassDatabase(props: any) {
  const { 
    collections, setCollections, addNotification, 
    calendarEvents, sheetData, notepadContent, 
    openWindow, fsLib, setFs 
  } = props;

  const [activeTab, setActiveTab] = useState<'status' | 'tables' | 'import' | 'scripts' | 'search'>('status');
  const [dbSearchQuery, setDbSearchQuery] = useState('');

  useEffect(() => {
    BridgeLib.registerApp('glassdatabase', {
      getData: () => JSON.stringify(collections),
      query: (filter: string) => {
        // Simple headless query provider
        const results: any[] = [];
        Object.keys(collections).forEach(table => {
          if (table.startsWith('_')) return;
          const matched = collections[table].filter((rec: any) => 
            JSON.stringify(rec).toLowerCase().includes(filter.toLowerCase())
          );
          if (matched.length > 0) results.push({ table, data: matched });
        });
        return JSON.stringify(results);
      }
    });
    return () => BridgeLib.unregisterApp('glassdatabase');
  }, [collections]);

  const pipeToWord = (tableName: string) => {
    const data = collections[tableName];
    if (!data) return;
    const bridgeData = `\n--- DATABASE PIPE: ${tableName} ---\n${JSON.stringify(data, null, 2)}\n---\n`;
    BridgeLib.setAppData('glassword', bridgeData);
    addNotification('Database', `Piped ${tableName} to Bridge [Target: GlassWord]`, 'success');
  };
  const [selectedTable, setSelectedTable] = useState<string | null>(null);
  const [showNewTableDialog, setShowNewTableDialog] = useState(false);
  const [newTableName, setNewTableName] = useState('');
  const [isEditingRecord, setIsEditingRecord] = useState<number | null>(null);
  const [selectedScript, setSelectedScript] = useState<string | null>(null);
  const [activeExecutionLine, setActiveExecutionLine] = useState(-1);
  const [showScriptPicker, setShowScriptPicker] = useState(false);

  const scripts = Array.isArray(collections._scripts) ? collections._scripts : [];

  const importFromApp = (source: 'calendar' | 'sheets' | 'notepad') => {
    let dataToImport: any = null;
    let tableName = '';

    if (source === 'calendar') {
      dataToImport = calendarEvents;
      tableName = 'calendar_backup_' + new Date().getTime();
    } else if (source === 'sheets') {
      dataToImport = sheetData.map((row: any) => {
        const obj: any = {};
        row.forEach((cell: any, i: number) => obj[`col_${i}`] = cell);
        return obj;
      });
      tableName = 'sheets_backup_' + new Date().getTime();
    } else if (source === 'notepad') {
      dataToImport = [{ content: notepadContent, timestamp: new Date().toISOString() }];
      tableName = 'notepad_backup_' + new Date().getTime();
    }

    if (dataToImport) {
      setCollections((prev: any) => ({
        ...prev,
        [tableName]: dataToImport
      }));
      addNotification('Database', `Imported data from ${source} into table "${tableName}"`, 'success');
    }
  };

  const createTable = () => {
    if (!newTableName.trim()) return;
    if (collections[newTableName]) {
      addNotification('Database', 'Table already exists', 'error');
      return;
    }
    setCollections((prev: any) => ({ ...prev, [newTableName]: [] }));
    setNewTableName('');
    setShowNewTableDialog(false);
    addNotification('Database', `Table "${newTableName}" created`, 'success');
  };

  const deleteTable = (name: string) => {
    const next = { ...collections };
    delete next[name];
    setCollections(next);
    if (selectedTable === name) setSelectedTable(null);
    addNotification('Database', `Table "${name}" dropped`, 'warning');
  };

  const addRecord = (tableName: string) => {
    const table = collections[tableName] || [];
    const firstRecord = table[0] || {};
    const newRecord: any = {};
    Object.keys(firstRecord).forEach(key => newRecord[key] = '');
    if (Object.keys(newRecord).length === 0) newRecord['id'] = Math.random().toString(36).substr(2, 5);

    setCollections((prev: any) => ({
      ...prev,
      [tableName]: [...table, newRecord]
    }));
    setIsEditingRecord(table.length);
  };

  const updateRecord = (tableName: string, index: number, field: string, value: any) => {
    setCollections((prev: any) => {
      const table = [...prev[tableName]];
      table[index] = { ...table[index], [field]: value };
      return { ...prev, [tableName]: table };
    });
  };

  const deleteRecord = (tableName: string, index: number) => {
    setCollections((prev: any) => {
      const table = prev[tableName].filter((_: any, i: number) => i !== index);
      return { ...prev, [tableName]: table };
    });
  };

  const runScript = async (content: string) => {
    const interpreter = new GlassScriptInterpreter({
      activeApp: 'glassdatabase',
      notified: addNotification,
      updateNotepad: () => {},
      getNotepadContent: () => '',
      setNotepadStyle: () => {},
      openWindow: () => {},
      systemDate: () => new Date().toLocaleString(),
      db: {
        getCollections: () => collections,
        setCollections: (next: any) => setCollections(next)
      }
    }, (line) => setActiveExecutionLine(line));

    addNotification('Database', 'Starting script execution...', 'info');
    await interpreter.execute(content);
    addNotification('Database', 'Script execution finished', 'success');
  };

  const scheduleScript = (scriptId: string) => {
      const script = scripts.find((s: any) => s.id === scriptId);
      if (!script) return;
      
      const nextScripts = scripts.map((s: any) => 
        s.id === scriptId ? { ...s, isScheduled: !s.isScheduled } : s
      );
      setCollections((prev: any) => ({ ...prev, _scripts: nextScripts }));
      
      if (!script.isScheduled) {
          addNotification('Database', `Script "${script.name}" scheduled for background execution`, 'success');
          // Simulate background run in 30 seconds for demo purposes
          setTimeout(() => runScript(script.content), 30000);
      } else {
          addNotification('Database', `Background schedule removed for "${script.name}"`, 'warning');
      }
  };

  const saveScript = (name: string, content: string) => {
    const nextScripts = [...scripts];
    const idx = nextScripts.findIndex(s => s.name === name);
    if (idx >= 0) nextScripts[idx] = { ...nextScripts[idx], content };
    else nextScripts.push({ id: Math.random().toString(36).substr(2, 5), name, content });

    setCollections((prev: any) => ({ ...prev, _scripts: nextScripts }));
    addNotification('Database', `Script "${name}" saved`, 'success');
  };

  const deleteScript = (id: string) => {
    const nextScripts = scripts.filter((s: any) => s.id !== id);
    setCollections((prev: any) => ({ ...prev, _scripts: nextScripts }));
    if (selectedScript === id) setSelectedScript(null);
    addNotification('Database', 'Script deleted', 'warning');
  };

  const dbInfo = {
    collections: Object.keys(collections).filter(k => !k.startsWith('_')).length,
    documents: Object.entries(collections)
      .filter(([k]) => !k.startsWith('_'))
      .reduce((acc: number, [_, val]: [any, any]) => acc + (Array.isArray(val) ? val.length : 0), 0),
    storage: (Object.keys(collections).length * 1.2 + 0.5).toFixed(1) + ' MB',
    lastSync: new Date().toLocaleTimeString()
  };

  return (
    <div className="h-full flex flex-col bg-[#020202] text-white overflow-hidden font-sans">
      {/* Header */}
      <div className="p-6 border-b border-white/5 flex items-center justify-between bg-[#050505]">
        <div className="flex items-center gap-3 text-blue-400">
          <DatabaseIcon size={28} className="drop-shadow-[0_0_10px_rgba(59,130,246,0.5)]" />
          <div>
            <h1 className="text-xl font-bold tracking-tight">GlassDatabase Corporate</h1>
            <p className="text-[10px] text-white/30 uppercase tracking-widest font-mono">Relational Server v4.2</p>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <nav className="flex items-center gap-1 glass p-1 rounded-xl border border-white/10">
            {['status', 'tables', 'import', 'scripts', 'search'].map((tab) => (
              <button
                key={tab}
                onClick={() => {
                  setActiveTab(tab as any);
                  setSelectedTable(null);
                  setSelectedScript(null);
                }}
                className={`px-4 py-1.5 rounded-lg text-xs capitalize transition-all ${activeTab === tab ? 'bg-blue-500 text-white shadow-lg' : 'text-white/40 hover:text-white'}`}
              >
                {tab}
              </button>
            ))}
          </nav>
          <div className="flex items-center gap-2 text-[10px] text-white/30 font-mono uppercase bg-white/5 px-3 py-1.5 rounded-lg border border-white/5">
            Server: Online <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse shadow-[0_0_8px_rgba(34,197,94,0.5)]" />
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-gradient-to-b from-transparent to-blue-500/5">
        {activeTab === 'status' && (
          <>
            <div className="grid grid-cols-4 gap-4">
              {[
                { label: 'Relational Tables', val: dbInfo.collections, color: 'text-blue-400', icon: <TableIcon size={14} /> },
                { label: 'Total Records', val: dbInfo.documents, color: 'text-purple-400', icon: <DatabaseIcon size={14} /> },
                { label: 'Instance Size', val: dbInfo.storage, color: 'text-emerald-400', icon: <HardDrive size={14} /> },
                { label: 'Service SLI', val: '99.98%', color: 'text-amber-400', icon: <Activity size={14} /> },
              ].map((stat, i) => (
                <div key={i} className="glass p-5 rounded-3xl border border-white/10 relative overflow-hidden group">
                  <div className="absolute top-4 right-4 text-white/10 group-hover:text-white/20 transition-colors">{stat.icon}</div>
                  <span className="text-[10px] text-white/40 uppercase font-bold tracking-wider">{stat.label}</span>
                  <p className={`text-2xl font-mono mt-2 ${stat.color}`}>{stat.val.toString()}</p>
                </div>
              ))}
            </div>

            <div className="grid grid-cols-2 gap-6">
              <div className="glass rounded-3xl border border-white/10 p-6">
                <h3 className="text-sm font-bold mb-4 flex items-center gap-2">
                  <Activity size={16} className="text-blue-400" />
                  Queries Per Second
                </h3>
                <div className="h-32 flex items-end gap-1">
                  {Array(30).fill(0).map((_, i) => (
                    <div key={i} className="flex-1 bg-blue-500/20 rounded-t-sm hover:bg-blue-400/50 transition-all transition-duration-300" style={{ height: `${Math.random() * 80 + 20}%` }} />
                  ))}
                </div>
              </div>
              <div className="glass rounded-3xl border border-white/10 p-6 flex flex-col justify-center">
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 flex items-center justify-center text-emerald-400">
                    <Shield size={24} />
                  </div>
                  <div>
                    <h4 className="font-bold text-sm">Security Level: Enterprise</h4>
                    <p className="text-xs text-white/40">Encryption: AES-256-GCM Authorized Sharding</p>
                  </div>
                </div>
                <button className="glass-button w-full h-12 text-blue-400 border-blue-500/30 hover:bg-blue-500/10">Rotate Master Key</button>
              </div>
            </div>
          </>
        )}

        {activeTab === 'tables' && (
          <div className="flex flex-col gap-6 h-full">
            {!selectedTable ? (
              <div className="glass rounded-3xl border border-white/10 overflow-hidden flex flex-col">
                <div className="p-4 border-b border-white/10 bg-white/5 flex items-center justify-between">
                  <h3 className="text-sm font-bold">SQL Relational Shards</h3>
                  <div className="flex gap-2">
                    <button className="text-[10px] glass-button h-8 px-4" onClick={() => addNotification('Database', 'Vacuuming dead tuples...', 'info')}>Vacuum DB</button>
                    <button className="text-[10px] bg-blue-500 hover:bg-blue-400 text-white rounded-lg h-8 px-4 font-bold transition-all shadow-lg shadow-blue-500/20" onClick={() => setShowNewTableDialog(true)}>New Table</button>
                  </div>
                </div>
                <div className="p-0 overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-white/5 text-white/40">
                      <tr>
                        <th className="px-6 py-4 font-medium uppercase tracking-widest text-[10px]">Table Name</th>
                        <th className="px-6 py-4 font-medium uppercase tracking-widest text-[10px]">Type</th>
                        <th className="px-6 py-4 font-medium uppercase tracking-widest text-[10px]">Rows</th>
                        <th className="px-6 py-4 font-medium uppercase tracking-widest text-[10px]">Status</th>
                        <th className="px-6 py-4 font-medium uppercase tracking-widest text-[10px]">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5 text-slate-300">
                      {Object.entries(collections).map(([key, val]: [string, any]) => (
                        <tr key={key} className="hover:bg-white/5 transition-colors group cursor-pointer" onClick={() => setSelectedTable(key)}>
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-3 font-bold text-white group-hover:text-blue-400 transition-colors">
                              <TableIcon size={14} />
                              {key}
                            </div>
                          </td>
                          <td className="px-6 py-4 text-white/40 font-mono">B-Tree Relational</td>
                          <td className="px-6 py-4 font-mono">{Array.isArray(val) ? val.length : 0}</td>
                          <td className="px-6 py-4">
                            <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 text-[10px] font-bold border border-emerald-500/20">Optimized</span>
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-2">
                               <button 
                                onClick={(e) => { e.stopPropagation(); setSelectedTable(key); }}
                                className="p-1 hover:text-blue-400 text-white/20 transition-colors"
                              >
                                <LayoutGrid size={14} />
                              </button>
                              <button 
                                onClick={(e) => { e.stopPropagation(); deleteTable(key); }}
                                className="p-1 hover:text-red-400 text-white/20 transition-colors"
                              >
                                <Trash size={14} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            ) : (
              <div className="glass rounded-3xl border border-white/10 overflow-hidden flex flex-col h-full">
                <div className="p-4 border-b border-white/10 bg-white/5 flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <button onClick={() => setSelectedTable(null)} className="p-2 hover:bg-white/10 rounded-lg text-white/40 hover:text-white transition-colors">
                      <ChevronLeft size={16} />
                    </button>
                    <div>
                        <h3 className="text-sm font-bold flex items-center gap-2">
                            <TableIcon size={14} className="text-blue-400" />
                            {selectedTable}
                        </h3>
                        <p className="text-[9px] text-white/20 uppercase tracking-widest font-mono">Shard Location: US-EAST-MASTER</p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button className="text-[10px] bg-blue-500 hover:bg-blue-400 text-white rounded-lg h-8 px-4 font-bold transition-all" onClick={() => addRecord(selectedTable)}>+ Add Record</button>
                    <button className="text-[10px] glass-button h-8 px-4" onClick={() => setSelectedTable(null)}>Exit View</button>
                  </div>
                </div>
                <div className="flex-1 overflow-auto p-0 min-h-[400px]">
                  {collections[selectedTable]?.length > 0 ? (
                    <table className="w-full text-left text-[11px] border-collapse">
                      <thead className="bg-white/5 text-white/40 sticky top-0 z-10">
                        <tr>
                          <th className="px-4 py-3 border-b border-white/5 w-12">#</th>
                          {Object.keys(collections[selectedTable][0]).map(col => (
                            <th key={col} className="px-4 py-3 border-b border-white/5 font-bold uppercase tracking-wider text-[9px]">{col}</th>
                          ))}
                          <th className="px-4 py-3 border-b border-white/5 w-20">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-white/5 bg-black/20">
                        {collections[selectedTable].map((record: any, rIdx: number) => (
                          <tr key={rIdx} className="hover:bg-white/5 group transition-colors">
                            <td className="px-4 py-3 text-white/20 font-mono italic">{rIdx + 1}</td>
                            {Object.entries(record).map(([key, val]: [string, any], cIdx: number) => (
                              <td key={cIdx} className="px-4 py-3">
                                {isEditingRecord === rIdx ? (
                                    <input 
                                        autoFocus={cIdx === 0}
                                        type="text"
                                        value={val?.toString() || ''}
                                        onChange={(e) => updateRecord(selectedTable, rIdx, key, e.target.value)}
                                        className="bg-white/5 border border-blue-500/30 rounded px-2 py-1 w-full text-sm outline-none focus:border-blue-500"
                                        onBlur={() => setIsEditingRecord(null)}
                                        onKeyDown={(e) => { if (e.key === 'Enter') setIsEditingRecord(null); }}
                                    />
                                ) : (
                                    <span 
                                        onDoubleClick={() => setIsEditingRecord(rIdx)}
                                        className="block truncate max-w-[200px] text-white/80"
                                    >
                                        {val?.toString() || <span className="text-white/10 italic">NULL</span>}
                                    </span>
                                )}
                              </td>
                            ))}
                            <td className="px-4 py-3">
                              <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                <button 
                                    onClick={() => setIsEditingRecord(rIdx)}
                                    className="p-1 hover:text-blue-400 text-white/20 transition-colors"
                                >
                                  <Edit2 size={14} />
                                </button>
                                <button 
                                    onClick={() => deleteRecord(selectedTable, rIdx)}
                                    className="p-1 hover:text-red-400 text-white/20 transition-colors"
                                >
                                  <Trash size={14} />
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  ) : (
                    <div className="h-full flex flex-col items-center justify-center opacity-20 p-20">
                        <Database size={48} className="mb-4" />
                        <p className="text-sm uppercase tracking-widest font-bold">No records found for this shard</p>
                        <button className="mt-4 glass-button text-[10px]" onClick={() => addRecord(selectedTable)}>Populate Table</button>
                    </div>
                  )}
                </div>
                <div className="p-4 bg-white/5 border-t border-white/10 flex gap-4">
                  <button 
                    onClick={() => pipeToWord(selectedTable!)}
                    className="flex-1 py-3 glass-button text-xs text-blue-400 border-blue-500/20 hover:bg-blue-500/10 flex items-center justify-center gap-2"
                  >
                    <ArrowUpRight size={14} />
                    PIPE TO WORD ENGINE
                  </button>
                  <button 
                    onClick={() => deleteTable(selectedTable!)} 
                    className="px-6 py-3 text-xs text-red-500/50 hover:text-red-500 font-bold uppercase tracking-widest transition-all"
                  >
                    Drop Table
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {activeTab === 'import' && (
          <div className="grid grid-cols-3 gap-6">
            {[
              { id: 'calendar', title: 'Glass Calendar', desc: 'Sync shared events and meeting blocks into master relational store.', icon: <Calendar size={32} />, color: 'text-blue-400' },
              { id: 'sheets', title: 'Glass Sheets', desc: 'Import whole spreadsheets as row-column indexed database tables.', icon: <TableIcon size={32} />, color: 'text-emerald-400' },
              { id: 'notepad', title: 'Notepad Legacy', desc: 'Serialize text buffers into time-stamped archival document tables.', icon: <FileText size={32} />, color: 'text-amber-400' },
            ].map((app) => (
              <div key={app.id} className="glass rounded-3xl border border-white/10 p-8 flex flex-col items-center text-center gap-4 group hover:scale-[1.02] transition-all duration-300">
                <div className={`w-20 h-20 rounded-[2.5rem] bg-white/5 flex items-center justify-center ${app.color} group-hover:bg-white/10 transition-all border border-white/5 shadow-inner`}>
                  {app.icon}
                </div>
                <h3 className="font-bold">{app.title}</h3>
                <p className="text-xs text-white/30 px-2 leading-relaxed">{app.desc}</p>
                <div className="flex-1" />
                <button 
                  onClick={() => importFromApp(app.id as any)}
                  className="w-full glass-button h-12 flex items-center justify-center gap-2 group-hover:bg-blue-500 group-hover:text-white transition-all border-white/10"
                >
                  <Download size={16} />
                  Initiate Sync
                </button>
              </div>
            ))}
          </div>
        )}

        {activeTab === 'scripts' && (
            <div className="grid grid-cols-[300px,1fr] gap-6 h-full">
                <div className="glass rounded-3xl border border-white/10 overflow-hidden flex flex-col">
                    <div className="p-4 border-b border-white/10 bg-white/5 flex items-center justify-between">
                        <h3 className="text-xs font-bold uppercase tracking-widest text-white/40">Object Scripts</h3>
                        <div className="flex gap-2">
                            <button 
                                onClick={() => setShowScriptPicker(true)}
                                className="p-1 hover:text-green-400 text-white/20 transition-colors"
                                title="Run External Script"
                            >
                                <Play size={16} />
                            </button>
                            <button 
                                onClick={() => {
                                    const name = 'Script_' + (scripts.length + 1);
                                    saveScript(name, '-- Shard Integrity Script\ntell app "GlassDatabase"\n  query table "users"\n  get count to total_users\n\n  if total_users is "0"\n    notify "Warning: Users table is empty!"\n    insert record "username: system_admin, status: active"\n  else\n    notify "Database Check: " & total_users & " users found"\n  end if\nend tell');
                                }}
                                className="p-1 hover:text-blue-400 text-white/20 transition-colors"
                                title="New Script"
                            >
                                <Plus size={16} />
                            </button>
                        </div>
                    </div>
                    <div className="flex-1 overflow-y-auto p-2 space-y-2">
                        {scripts.map((script: any) => (
                            <div 
                                key={script.id}
                                onClick={() => setSelectedScript(script.id)}
                                className={cn(
                                    "p-3 rounded-xl border transition-all cursor-pointer group",
                                    selectedScript === script.id ? "bg-blue-500/10 border-blue-500/30 text-blue-400" : "bg-white/5 border-transparent text-white/60 hover:bg-white/10"
                                )}
                            >
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2 truncate">
                                        <Code2 size={14} />
                                        <span className="text-xs font-semibold truncate">{script.name}</span>
                                    </div>
                                    <button 
                                        onClick={(e) => { e.stopPropagation(); deleteScript(script.id); }}
                                        className="opacity-0 group-hover:opacity-100 p-1 hover:text-red-400 transition-all"
                                    >
                                        <Trash size={12} />
                                    </button>
                                </div>
                            </div>
                        ))}
                        {scripts.length === 0 && (
                            <div className="py-20 text-center opacity-20 flex flex-col items-center">
                                <Code size={32} className="mb-2" />
                                <p className="text-[10px] uppercase font-bold tracking-tighter">No Automation Found</p>
                            </div>
                        )}
                    </div>
                </div>

                <div className="glass rounded-3xl border border-white/10 flex flex-col overflow-hidden">
                    {selectedScript ? (
                        (() => {
                            const script = scripts.find((s: any) => s.id === selectedScript);
                            return (
                                <>
                                    <div className="p-4 border-b border-white/10 flex items-center justify-between bg-white/5">
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-lg bg-blue-500/10 flex items-center justify-center text-blue-400">
                                                <Code2 size={16} />
                                            </div>
                                            <span className="text-sm font-bold">{script?.name}</span>
                                        </div>
                                        <div className="flex gap-2">
                                            <button 
                                                onClick={() => scheduleScript(script?.id)}
                                                className={cn(
                                                    "h-8 px-4 text-[10px] font-bold rounded-lg transition-all flex items-center gap-2 border",
                                                    script?.isScheduled ? "bg-amber-500/20 border-amber-500/40 text-amber-500" : "glass-button"
                                                )}
                                                title="Schedule Background Run"
                                            >
                                                <Clock size={12} />
                                                {script?.isScheduled ? 'SCHEDULED' : 'SCHEDULE'}
                                            </button>
                                            <button 
                                                onClick={() => runScript(script?.content || '')}
                                                className="h-8 px-4 bg-green-600 hover:bg-green-500 text-white text-[10px] font-bold rounded-lg transition-all flex items-center gap-2 shadow-lg shadow-green-500/20"
                                            >
                                                <Play size={12} fill="currentColor" />
                                                RUN SCRIPT
                                            </button>
                                            <button 
                                                className="h-8 px-4 glass-button text-[10px]"
                                                onClick={() => setSelectedScript(null)}
                                            >
                                                Close
                                            </button>
                                        </div>
                                    </div>
                                    {script?.isScheduled && (
                                        <div className="px-4 py-1.5 bg-amber-500/10 border-b border-amber-500/20 text-[9px] text-amber-500 font-bold uppercase tracking-widest flex items-center gap-2">
                                            <Activity size={10} className="animate-pulse" />
                                            Background Daemon Active: Executing on 30s interval
                                        </div>
                                    )}
                                    <div className="flex-1 relative font-mono text-sm">
                                        <textarea 
                                            className="absolute inset-0 w-full h-full bg-transparent p-6 outline-none resize-none text-blue-100/90 leading-relaxed selection:bg-blue-500/30"
                                            spellCheck={false}
                                            value={script?.content}
                                            onChange={(e) => saveScript(script?.name || '', e.target.value)}
                                        />
                                        {/* Execution line indicator */}
                                        <div className="absolute left-0 w-1 bg-blue-500 transition-all pointer-events-none" 
                                             style={{ 
                                                top: activeExecutionLine * 1.5 + 'rem', 
                                                height: activeExecutionLine >= 0 ? '1.5rem' : '0',
                                                opacity: activeExecutionLine >= 0 ? 1 : 0
                                             }} 
                                        />
                                    </div>
                                    <div className="p-4 bg-white/5 border-t border-white/10 flex items-center justify-between text-[10px] text-white/30 uppercase tracking-widest font-mono">
                                        <span>Syntax: GlassScript Engine v1.0</span>
                                        <span>Lines: {script?.content.split('\n').length}</span>
                                    </div>
                                </>
                            );
                        })()
                    ) : (
                        <div className="h-full flex flex-col items-center justify-center text-white/10 bg-black/20">
                            <Zap size={64} className="mb-4" />
                            <h3 className="text-lg font-bold tracking-tighter uppercase">Automation Console</h3>
                            <p className="text-xs mt-2 font-mono">Select or create a script to begin sharding automation.</p>
                        </div>
                    )}
                </div>
            </div>
        )}

        {activeTab === 'search' && (
          <div className="flex flex-col gap-6 h-full">
            <div className="glass p-8 rounded-3xl border border-white/10 flex flex-col gap-8 bg-gradient-to-br from-blue-500/5 to-transparent">
              <div className="flex flex-col gap-4">
                <h2 className="text-xl font-bold tracking-tight flex items-center gap-3">
                  <Search size={22} className="text-blue-400" />
                  Global Shard Search
                </h2>
                <p className="text-xs text-white/40 max-w-2xl leading-relaxed">
                  Perform cross-relational queries across all localized shards. Results are piped via Bridge to active OLE listeners.
                </p>
              </div>

              <div className="flex gap-4">
                <div className="flex-1 relative group">
                  <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20 group-focus-within:text-blue-400 transition-colors" />
                  <input 
                    type="text"
                    placeholder="Query by record content, ID, or metadata fingerprint..."
                    className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-12 pr-4 text-sm focus:border-blue-500/50 outline-none transition-all placeholder:text-white/10"
                    value={dbSearchQuery}
                    onChange={(e) => setDbSearchQuery(e.target.value)}
                  />
                  {dbSearchQuery && (
                    <button 
                      onClick={() => setDbSearchQuery('')}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-white/20 hover:text-white"
                    >
                      <X size={14} />
                    </button>
                  )}
                </div>
                <button 
                  onClick={() => {
                    setDbSearchQuery('Epstein Files');
                    addNotification('Database', 'Applying high-priority investigation filter', 'warning');
                  }}
                  className="px-6 py-4 glass-button text-xs font-bold text-red-400 border-red-500/20 hover:bg-red-500/10 flex items-center gap-2"
                >
                  <Shield size={14} className="animate-pulse" />
                  EPSTEIN_FILTER.SCR
                </button>
              </div>

              <div className="space-y-4">
                <h3 className="text-[10px] font-bold text-white/20 uppercase tracking-[0.2em] px-2 flex items-center gap-2">
                  <Activity size={12} />
                  Live Match Buffer
                </h3>
                
                <div className="grid grid-cols-1 gap-3">
                  {(() => {
                    const results: any[] = [];
                    if (!dbSearchQuery) return <div className="py-20 text-center text-white/10 text-xs font-mono">STANDBY: Enter query parameters to engage crawler</div>;
                    
                    Object.keys(collections).forEach(table => {
                      if (table.startsWith('_')) return;
                      const matched = collections[table].filter((rec: any) => 
                        JSON.stringify(rec).toLowerCase().includes(dbSearchQuery.toLowerCase())
                      );
                      matched.forEach((m: any) => results.push({ table, data: m }));
                    });

                    if (results.length === 0) return <div className="py-20 text-center text-red-500/30 text-xs font-bold uppercase tracking-widest">ZERO MATCHES IN LOCAL SHARDS</div>;

                    return results.map((res, i) => (
                      <div key={i} className="glass p-4 rounded-2xl border border-white/5 flex items-center justify-between group hover:bg-white/5 transition-all">
                        <div className="flex items-center gap-4">
                          <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center text-blue-400">
                             <TableIcon size={18} />
                          </div>
                          <div className="flex flex-col">
                            <span className="text-[10px] text-white/30 uppercase font-bold tracking-tighter">Table: {res.table}</span>
                            <span className="text-xs text-white/80 font-mono truncate max-w-[400px]">{JSON.stringify(res.data)}</span>
                          </div>
                        </div>
                        <button 
                          onClick={() => {
                            const bridgeData = `\n--- SOURCE: ${res.table} ---\n${JSON.stringify(res.data, null, 2)}\n---\n`;
                            BridgeLib.setAppData('glassword', bridgeData);
                            addNotification('Database', 'Record piped to Bridge', 'success');
                          }}
                          className="px-4 py-2 bg-blue-500/10 text-blue-400 rounded-xl text-[10px] font-bold hover:bg-blue-500/20 transition-all opacity-0 group-hover:opacity-100 flex items-center gap-2"
                        >
                          <Send size={12} />
                          PIPE
                        </button>
                      </div>
                    ));
                  })()}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      <AnimatePresence>
        {showScriptPicker && (
          <ScriptPicker 
            fs={props.fs} 
            onClose={() => setShowScriptPicker(false)}
            onSelect={(content, name) => {
              setShowScriptPicker(false);
              if (name.endsWith('.scr') || name.endsWith('.txt')) {
                runScript(content);
              } else if (name.endsWith('.b')) {
                props.runBrainscript(content, (msg: string) => addNotification('Brainscript', msg, 'info'));
              }
            }}
          />
        )}
      </AnimatePresence>

      <div className="p-4 bg-[#050505] border-t border-white/10 flex items-center justify-between text-[10px] font-mono text-white/20">
        <div>SERVER_IDENT: CORP_MASTER_NODE_ALPHA</div>
        <div className="flex items-center gap-4">
          <span>LATENCY: 0.12ms</span>
          <span>UPTIME: 14:42:01</span>
        </div>
      </div>

      {/* New Table Dialog */}
      <AnimatePresence>
        {showNewTableDialog && (
          <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4 bg-black/60 backdrop-blur-md">
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="w-96 glass-dark rounded-3xl border border-white/20 p-8 shadow-2xl"
            >
              <div className="flex items-center gap-3 mb-6 text-blue-400">
                <TableIcon size={24} />
                <h3 className="text-lg font-bold tracking-tight">Create Relational Shard</h3>
              </div>
              <p className="text-xs text-white/40 mb-6 leading-relaxed">
                Define a new collection name. You can populate it manually or import from external system buffers.
              </p>
              <input 
                autoFocus
                type="text" 
                placeholder="table_name_alpha"
                className="w-full glass-input h-14 mb-8 text-sm placeholder:text-white/10"
                value={newTableName}
                onChange={(e) => setNewTableName(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && createTable()}
              />
              <div className="flex justify-end gap-4">
                <button onClick={() => setShowNewTableDialog(false)} className="px-6 py-2 text-[11px] font-bold text-white/30 hover:text-white uppercase tracking-widest">Cancel</button>
                <button onClick={createTable} className="px-8 py-2 bg-blue-600 text-white rounded-xl text-[11px] font-bold shadow-lg shadow-blue-500/20 hover:bg-blue-500 transition-all uppercase tracking-widest">Provision</button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

function GlassMail(props: any) {
  const { collections, setCollections, fs, setFs, addNotification, currentUser, networkConfig } = props;
  const [view, setView] = useState<'inbox' | 'compose'>('inbox');
  const [selectedMail, setSelectedMail] = useState<Email | null>(null);
  const [isGrpcSyncing, setIsGrpcSyncing] = useState(false);
  
  const [composeData, setComposeData] = useState({
    to: '',
    subject: '',
    message: '',
    attachments: [] as { name: string; path: string }[]
  });

  const sendMail = async () => {
    if (!composeData.to || !composeData.subject) {
      addNotification('GlassMail', 'Recipient and Subject are required', 'error');
      return;
    }

    setIsGrpcSyncing(true);
    addNotification('gRPC', 'Calling MailService.SendUnaryEmail...', 'info');
    
    // Simulate gRPC call
    await new Promise(r => setTimeout(r, 800));

    const newMail: Email = {
      id: Math.random().toString(36).substr(2, 9),
      from: currentUser?.username || 'Administrator',
      to: composeData.to,
      subject: composeData.subject,
      message: composeData.message,
      date: new Date().toLocaleString(),
      attachments: composeData.attachments,
      read: true
    };

    setCollections((prev: DBCollections) => ({
      ...prev,
      emails: [newMail, ...prev.emails]
    }));

    // Logic to save to GlassMail folder in GlassDrive
    // Find GlassDrive -> GlassMail
    const updateFS = (items: FileSystemItem[]): FileSystemItem[] => {
      return items.map(item => {
        if (item.name === 'GlassDrive') {
          return {
            ...item,
            children: item.children?.map(driveItem => {
              if (driveItem.name === 'GlassMail') {
                return {
                  ...driveItem,
                  children: [
                    ...(driveItem.children || []),
                    { 
                      name: `mail_${newMail.id}.json`, 
                      type: 'file', 
                      content: JSON.stringify(newMail, null, 2),
                      permissions: {
                        owner: { r: true, w: true, x: true },
                        group: { r: false, w: false, x: false },
                        others: { r: false, w: false, x: false },
                      }
                    }
                  ]
                };
              }
              return driveItem;
            })
          };
        }
        return item;
      });
    };

    setFs((prev: FileSystemItem[]) => updateFS(prev));
    addNotification('GlassMail', 'Message dispatched via gRPC bridge', 'success');
    setView('inbox');
    setComposeData({ to: '', subject: '', message: '', attachments: [] });
    setIsGrpcSyncing(false);
  };

  return (
    <div className="h-full flex flex-col bg-[#080808] text-white">
      <div className="h-14 border-b border-white/10 flex items-center px-6 gap-4 bg-white/5">
        <Mail size={18} className="text-blue-400" />
        <h2 className="text-sm font-bold tracking-tight">GlassMail Professional</h2>
        <div className="flex-1" />
        <button 
          onClick={() => setView(view === 'inbox' ? 'compose' : 'inbox')}
          className="glass-button h-8 px-4 text-[11px] font-bold"
        >
          {view === 'inbox' ? '+ New Message' : 'Back to Inbox'}
        </button>
      </div>

      <div className="flex-1 flex overflow-hidden">
        {/* Sidebar */}
        <div className="w-56 border-r border-white/10 flex flex-col p-4 gap-2">
          {['Inbox', 'Sent', 'Drafts', 'Trash'].map((folder) => (
            <button key={folder} className={cn("w-full text-left px-4 py-2 rounded-xl text-xs transition-colors", folder === 'Inbox' ? "bg-blue-500/20 text-blue-400" : "hover:bg-white/5 text-white/50")}>
              {folder}
            </button>
          ))}
          <div className="mt-6 p-4 rounded-2xl bg-amber-500/10 border border-amber-500/20">
            <h4 className="flex items-center gap-2 text-[10px] font-bold text-amber-500 mb-2 uppercase">
              <Shield size={12} />
              Restriction
            </h4>
            <p className="text-[9px] text-amber-500/60 leading-relaxed italic">
              Data is dual-stored in GlassDatabase and the protected GlassMail folder.
            </p>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 flex flex-col min-w-0">
          {view === 'inbox' ? (
            <div className="flex-1 overflow-y-auto p-4 space-y-2">
              {collections.emails.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center opacity-20">
                  <Mail size={64} className="mb-4" />
                  <p className="text-sm font-mono uppercase tracking-widest">Inbox Empty</p>
                </div>
              ) : (
                collections.emails.map((mail: Email) => (
                  <div 
                    key={mail.id} 
                    onClick={() => setSelectedMail(mail)}
                    className={cn(
                      "group p-4 rounded-2xl border transition-all cursor-pointer flex items-center gap-4",
                      selectedMail?.id === mail.id ? "bg-white/10 border-blue-500/30" : "bg-white/5 border-white/5 hover:border-white/10"
                    )}
                  >
                    <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-white/40 text-xs font-bold">
                      {mail.from[0].toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-0.5">
                        <h4 className="text-sm font-bold truncate">{mail.from}</h4>
                        <span className="text-[10px] text-white/30 font-mono">{mail.date}</span>
                      </div>
                      <h5 className="text-xs text-blue-400/80 mb-1">{mail.subject}</h5>
                      <p className="text-[11px] text-white/40 truncate">{mail.message}</p>
                    </div>
                  </div>
                ))
              )}
            </div>
          ) : (
            <div className="flex-1 p-8 overflow-y-auto scrollbar-hide">
              <div className="max-w-2xl mx-auto space-y-6">
                <div>
                  <label className="text-[10px] text-white/30 uppercase font-bold mb-2 block tracking-widest">Recipient</label>
                  <input 
                    type="text" 
                    placeholder="example@glass.os"
                    value={composeData.to}
                    onChange={(e) => setComposeData({ ...composeData, to: e.target.value })}
                    className="w-full glass-input h-12 text-sm"
                  />
                </div>
                <div>
                  <label className="text-[10px] text-white/30 uppercase font-bold mb-2 block tracking-widest">Subject</label>
                  <input 
                    type="text" 
                    placeholder="Enter subject line..."
                    value={composeData.subject}
                    onChange={(e) => setComposeData({ ...composeData, subject: e.target.value })}
                    className="w-full glass-input h-12 text-sm"
                  />
                </div>
                <div>
                  <label className="text-[10px] text-white/30 uppercase font-bold mb-2 block tracking-widest">Message Body</label>
                  <textarea 
                    rows={8}
                    placeholder="Compose your message..."
                    value={composeData.message}
                    onChange={(e) => setComposeData({ ...composeData, message: e.target.value })}
                    className="w-full glass-input p-4 text-sm resize-none"
                  />
                </div>
                <div className="p-6 rounded-3xl border border-white/10 bg-white/5 border-dashed">
                  <div className="flex items-center justify-between mb-4">
                    <h4 className="text-[10px] font-bold uppercase tracking-widest">Local Mirroring</h4>
                    <span className="text-[10px] text-blue-400">Protected Directory Link</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <button className="flex-1 glass-button h-10 flex items-center justify-center gap-2 text-xs">
                      <Upload size={14} />
                      Attach Cloud File
                    </button>
                    <button className="flex-1 glass-button h-10 flex items-center justify-center gap-2 text-xs border-dashed opacity-50">
                      <Box size={14} />
                      Linked Attachments
                    </button>
                  </div>
                </div>
                <button 
                  onClick={sendMail}
                  className="w-full h-14 rounded-2xl bg-blue-600 hover:bg-blue-500 transition-colors font-bold flex items-center justify-center gap-3 text-sm shadow-xl shadow-blue-900/20 disabled:opacity-50"
                  disabled={isGrpcSyncing}
                >
                  <Send size={18} className={isGrpcSyncing ? "animate-spin" : ""} />
                  {isGrpcSyncing ? 'gRPC Handshake...' : 'Dispatch Secure Mail'}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function GlassDrawApp({ fs, setFs, fsLib, addNotification }: any) {
  const [elements, setElements] = useState<any[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [tool, setTool] = useState<'select' | 'rect' | 'circle' | 'line'>('select');
  const [fillColor, setFillColor] = useState('#3b82f6');
  const [strokeWidth, setStrokeWidth] = useState(2);
  const [showSaveDialog, setShowSaveDialog] = useState(false);
  const [saveName, setSaveName] = useState('untitled.gdraw');
  const [isDrawing, setIsDrawing] = useState(false);
  const [startPos, setStartPos] = useState({ x: 0, y: 0 });

  const handleMouseDown = (e: React.MouseEvent<SVGSVGElement>) => {
    const svg = e.currentTarget;
    const CTM = svg.getScreenCTM();
    if (!CTM) return;
    const x = (e.clientX - CTM.e) / CTM.a;
    const y = (e.clientY - CTM.f) / CTM.d;

    if (tool === 'select') {
      const target = e.target as SVGElement;
      const id = target.getAttribute('data-id');
      setSelectedId(id);
      return;
    }

    setIsDrawing(true);
    setStartPos({ x, y });
    const newId = Math.random().toString(36).substr(2, 9);
    const newElement = {
      id: newId,
      type: tool,
      x, y, width: 0, height: 0,
      radius: 0,
      x2: x, y2: y,
      fill: fillColor,
      stroke: '#ffffff',
      strokeWidth: strokeWidth
    };
    setElements([...elements, newElement]);
    setSelectedId(newId);
  };

  const handleMouseMove = (e: React.MouseEvent<SVGSVGElement>) => {
    if (!isDrawing || tool === 'select') return;
    const svg = e.currentTarget;
    const CTM = svg.getScreenCTM();
    if (!CTM) return;
    const x = (e.clientX - CTM.e) / CTM.a;
    const y = (e.clientY - CTM.f) / CTM.d;

    setElements(prev => prev.map(el => {
      if (el.id !== selectedId) return el;
      if (el.type === 'rect') {
        return { 
          ...el, 
          x: Math.min(x, startPos.x), 
          y: Math.min(y, startPos.y),
          width: Math.abs(x - startPos.x),
          height: Math.abs(y - startPos.y)
        };
      } else if (el.type === 'circle') {
        const radius = Math.sqrt(Math.pow(x - startPos.x, 2) + Math.pow(y - startPos.y, 2));
        return { ...el, radius };
      } else if (el.type === 'line') {
        return { ...el, x2: x, y2: y };
      }
      return el;
    }));
  };

  const handleMouseUp = () => {
    setIsDrawing(false);
  };

  const handleSave = async () => {
    const data = JSON.stringify(elements);
    try {
      await fsLib.createFile(['Documents', 'Drawings'], saveName, data);
      addNotification('GlassDraw', `Saved ${saveName}`, 'success');
      setShowSaveDialog(false);
    } catch (e) {
      addNotification('GlassDraw', 'Error saving file', 'error');
    }
  };

  const clearCanvas = () => {
    if (confirm('Clear all elements?')) setElements([]);
  };

  return (
    <div className="h-full flex flex-col bg-[#0f172a] text-white">
      <div className="h-10 border-b border-white/10 flex items-center px-4 justify-between bg-slate-900/50">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1 bg-white/5 p-1 rounded-lg">
            <button onClick={() => setTool('select')} className={cn("p-1.5 rounded", tool === 'select' ? "bg-blue-500 text-white" : "hover:bg-white/10")}><MousePointer2 size={14} /></button>
            <button onClick={() => setTool('rect')} className={cn("p-1.5 rounded", tool === 'rect' ? "bg-blue-500 text-white" : "hover:bg-white/10")}><Square size={14} /></button>
            <button onClick={() => setTool('circle')} className={cn("p-1.5 rounded", tool === 'circle' ? "bg-blue-500 text-white" : "hover:bg-white/10")}><Circle size={14} /></button>
            <button onClick={() => setTool('line')} className={cn("p-1.5 rounded", tool === 'line' ? "bg-blue-500 text-white" : "hover:bg-white/10")}><Minus size={14} /></button>
          </div>
          <div className="h-6 w-[1px] bg-white/10" />
          <input type="color" value={fillColor} onChange={e => setFillColor(e.target.value)} className="w-6 h-6 rounded border-0 bg-transparent cursor-pointer" />
        </div>
        <div className="flex items-center gap-2">
          <button onClick={clearCanvas} className="p-1.5 hover:bg-white/10 rounded text-red-400"><Trash2 size={14} /></button>
          <button onClick={() => setShowSaveDialog(true)} className="flex items-center gap-2 px-3 py-1 bg-blue-600 hover:bg-blue-500 rounded text-[10px] font-bold uppercase tracking-wider"><Save size={14} /> Save</button>
        </div>
      </div>
      <div className="flex-1 relative overflow-hidden bg-white/5 pattern-dots">
        <svg 
          className="w-full h-full cursor-crosshair"
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
        >
          {elements.map(el => (
            <React.Fragment key={el.id}>
              {el.type === 'rect' && (
                <rect 
                  x={el.x} y={el.y} width={el.width} height={el.height} 
                  fill={el.fill} stroke={el.stroke} strokeWidth={el.strokeWidth}
                  data-id={el.id}
                  className={cn("transition-all", selectedId === el.id && "stroke-blue-400 stroke-2")}
                />
              )}
              {el.type === 'circle' && (
                <circle 
                  cx={el.x} cy={el.y} r={el.radius} 
                  fill={el.fill} stroke={el.stroke} strokeWidth={el.strokeWidth}
                  data-id={el.id}
                  className={cn("transition-all", selectedId === el.id && "stroke-blue-400 stroke-2")}
                />
              )}
              {el.type === 'line' && (
                <line 
                  x1={el.x} y1={el.y} x2={el.x2} y2={el.y2}
                  stroke={el.stroke} strokeWidth={el.strokeWidth}
                  data-id={el.id}
                  className={cn("transition-all", selectedId === el.id && "stroke-blue-400 stroke-2")}
                />
              )}
            </React.Fragment>
          ))}
        </svg>
      </div>

      <AnimatePresence>
        {showSaveDialog && (
          <div className="absolute inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="glass-dark p-6 rounded-2xl w-full max-w-xs border border-white/10 shadow-2xl">
              <h3 className="text-sm font-bold mb-4">Save Drawing</h3>
              <input 
                type="text" 
                value={saveName} 
                onChange={e => setSaveName(e.target.value)}
                className="w-full glass-input mb-4 text-xs" 
              />
              <div className="flex gap-2">
                <button onClick={() => setShowSaveDialog(false)} className="flex-1 py-2 rounded-lg bg-white/10 hover:bg-white/20 text-xs">Cancel</button>
                <button onClick={handleSave} className="flex-1 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-xs font-bold">Save</button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

function GlassPaintApp({ fsLib, addNotification }: any) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [brushColor, setBrushColor] = useState('#3b82f6');
  const [brushSize, setBrushSize] = useState(5);
  const [tool, setTool] = useState<'brush' | 'eraser'>('brush');
  const [showSaveDialog, setShowSaveDialog] = useState(false);
  const [saveName, setSaveName] = useState('sketch.gpaint');

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
  }, []);

  const startDrawing = (e: React.MouseEvent) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    ctx.beginPath();
    ctx.moveTo(x, y);
    setIsDrawing(true);
  };

  const draw = (e: React.MouseEvent) => {
    if (!isDrawing) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    ctx.strokeStyle = tool === 'eraser' ? '#ffffff' : brushColor;
    if (tool === 'eraser') {
      const parentBg = '#ffffff'; // Fallback white
      ctx.strokeStyle = parentBg;
    }
    ctx.lineWidth = brushSize;
    ctx.lineTo(x, y);
    ctx.stroke();
  };

  const stopDrawing = () => {
    setIsDrawing(false);
  };

  const handleSave = async () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const data = canvas.toDataURL('image/png');
    try {
      await fsLib.createFile(['Documents', 'Paintings'], saveName, data);
      addNotification('GlassPaint', `Saved ${saveName}`, 'success');
      setShowSaveDialog(false);
    } catch (e) {
      addNotification('GlassPaint', 'Error saving painting', 'error');
    }
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
  };

  return (
    <div className="h-full flex flex-col bg-[#1a1a1a] text-white overflow-hidden">
      <div className="h-10 border-b border-white/10 flex items-center px-4 justify-between bg-slate-900/80">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1 bg-white/5 p-1 rounded-lg">
            <button onClick={() => setTool('brush')} className={cn("p-1.5 rounded", tool === 'brush' ? "bg-blue-500" : "hover:bg-white/10")}><PaintBucket size={14} /></button>
            <button onClick={() => setTool('eraser')} className={cn("p-1.5 rounded", tool === 'eraser' ? "bg-blue-500" : "hover:bg-white/10")}><Eraser size={14} /></button>
          </div>
          <input type="color" value={brushColor} onChange={e => setBrushColor(e.target.value)} className="w-6 h-6 rounded cursor-pointer" />
          <input type="range" min="1" max="50" value={brushSize} onChange={e => setBrushSize(parseInt(e.target.value))} className="w-24 accent-blue-500" />
        </div>
        <div className="flex items-center gap-2">
          <button onClick={clearCanvas} className="p-1.5 hover:bg-white/10 rounded text-white/40"><RefreshCw size={14} /></button>
          <button onClick={() => setShowSaveDialog(true)} className="flex items-center gap-2 px-3 py-1 bg-blue-600 hover:bg-blue-500 rounded text-[10px] font-bold uppercase tracking-wider"><Save size={14} /> Save</button>
        </div>
      </div>
      <div className="flex-1 bg-white relative">
        <canvas 
          ref={canvasRef}
          width={1200}
          height={800}
          className="w-full h-full cursor-crosshair"
          onMouseDown={startDrawing}
          onMouseMove={draw}
          onMouseUp={stopDrawing}
          onMouseOut={stopDrawing}
        />
      </div>

      <AnimatePresence>
        {showSaveDialog && (
          <div className="absolute inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="glass-dark p-6 rounded-2xl w-full max-w-xs border border-white/10 shadow-2xl">
              <h3 className="text-sm font-bold mb-4 text-white">Save Sketch</h3>
              <input 
                type="text" 
                value={saveName} 
                onChange={e => setSaveName(e.target.value)}
                className="w-full glass-input mb-4 text-xs" 
              />
              <div className="flex gap-2">
                <button onClick={() => setShowSaveDialog(false)} className="flex-1 py-2 rounded-lg bg-white/10 hover:bg-white/20 text-xs">Cancel</button>
                <button onClick={handleSave} className="flex-1 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-xs font-bold text-white">Save</button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

function GlassMessaging(props: any) {
  const { collections, setCollections, addNotification, currentUser, networkConfig } = props;
  const [msgText, setMsgText] = useState('');

  const sendMsg = () => {
    if (!msgText.trim()) return;
    const newMsg: DBMessage = {
      id: Math.random().toString(36).substr(2, 9),
      sender: currentUser?.username || 'Administrator',
      text: msgText,
      timestamp: new Date().toLocaleTimeString()
    };
    
    addNotification('XMPP', `Broadcasting to ${networkConfig.protocols.xmpp.server}...`, 'info');
    
    setCollections((prev: DBCollections) => ({
      ...prev,
      messages: [...prev.messages, newMsg]
    }));
    setMsgText('');
  };

  return (
    <div className="h-full flex flex-col bg-[#050505] text-white font-sans">
      <div className="h-16 border-b border-white/10 flex items-center px-6 justify-between bg-white/5">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center">
            <MessageSquare size={20} className="text-emerald-400" />
          </div>
          <div>
            <h2 className="text-sm font-bold flex items-center gap-2">
              Systems Messenger
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-[0_0_5px_rgba(16,185,129,0.5)]" />
            </h2>
            <p className="text-[10px] text-white/30 font-mono tracking-tighter uppercase">XMPP JID: {networkConfig.protocols.xmpp.jid}</p>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <div className="text-[9px] font-bold text-white/20 uppercase tracking-widest border border-white/10 px-2 py-1 rounded">
            OMEMO Encrypted
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-6 space-y-4">
        {collections.messages.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center opacity-10">
            <MessageSquare size={48} className="mb-2" />
            <p className="text-[10px] uppercase font-bold tracking-widest underline underline-offset-8 decoration-blue-500">End-to-End Persistence Ready</p>
          </div>
        ) : (
          collections.messages.map((m: DBMessage) => (
            <div key={m.id} className={cn("flex flex-col gap-1 max-w-[80%]", m.sender === currentUser?.username ? "ml-auto items-end" : "items-start")}>
              <div className="flex items-center gap-2 mb-0.5">
                <span className="text-[10px] font-bold text-white/40">{m.sender}</span>
                <span className="text-[9px] text-white/20">{m.timestamp}</span>
              </div>
              <div className={cn("px-4 py-2 rounded-2xl text-sm", m.sender === currentUser?.username ? "bg-blue-600 rounded-tr-none" : "bg-white/10 rounded-tl-none")}>
                {m.text}
              </div>
            </div>
          ))
        )}
      </div>

      <div className="p-4 bg-white/5 border-t border-white/10">
        <div className="relative group">
          <input 
            type="text"
            placeholder="Type a message..."
            value={msgText}
            onChange={(e) => setMsgText(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && sendMsg()}
            className="w-full glass-input h-12 pr-12 text-sm"
          />
          <button 
            onClick={sendMsg}
            className="absolute right-2 top-1/2 -translate-y-1/2 p-2 text-blue-400 hover:text-blue-300 transition-colors"
          >
            <Send size={18} />
          </button>
        </div>
      </div>
    </div>
  );
}

function CalendarApp({ calendarEvents, setCalendarEvents, addNotification }: any) {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<string | null>(new Date().toISOString().split('T')[0]);
  const [showAddEvent, setShowAddEvent] = useState(false);
  const [newEvent, setNewEvent] = useState({ title: '', time: '12:00', type: 'meeting' });

  const daysInMonth = (month: number, year: number) => new Date(year, month + 1, 0).getDate();
  const firstDayOfMonth = (month: number, year: number) => new Date(year, month, 1).getDay();

  const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
  
  const handleAddEvent = () => {
    if (!newEvent.title || !selectedDate) return;
    const event = { ...newEvent, id: Math.random().toString(36).substr(2, 9), date: selectedDate };
    setCalendarEvents((prev: any) => [...prev, event]);
    setNewEvent({ title: '', time: '12:00', type: 'meeting' });
    setShowAddEvent(false);
    addNotification('Calendar', `Scheduled: ${event.title}`, 'success');
  };

  const currentMonth = currentDate.getMonth();
  const currentYear = currentDate.getFullYear();
  const days = daysInMonth(currentMonth, currentYear);
  const offset = firstDayOfMonth(currentMonth, currentYear);

  return (
    <div className="h-full flex flex-col bg-[#fafafa] text-[#1a1a1a] font-sans selection:bg-blue-100">
      <div className="p-6 border-b border-gray-200 flex items-center justify-between bg-white shadow-sm z-10">
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 rounded-xl bg-blue-500 flex items-center justify-center text-white shadow-lg shadow-blue-200">
            <Calendar size={20} />
          </div>
          <div>
            <h2 className="text-xl font-bold tracking-tight text-gray-900">{monthNames[currentMonth]} {currentYear}</h2>
            <p className="text-[10px] uppercase font-bold tracking-widest text-blue-500">Professional Suite</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={() => setCurrentDate(new Date(currentYear, currentMonth - 1))} className="p-2 hover:bg-gray-100 rounded-full transition-colors"><ChevronLeft size={20} /></button>
          <button onClick={() => setCurrentDate(new Date())} className="px-4 py-1.5 text-xs font-bold border border-gray-200 rounded-lg hover:border-blue-500 transition-colors">Today</button>
          <button onClick={() => setCurrentDate(new Date(currentYear, currentMonth + 1))} className="p-2 hover:bg-gray-100 rounded-full transition-colors"><ChevronRight size={20} /></button>
          <button onClick={() => setShowAddEvent(true)} className="ml-4 px-4 py-2 bg-blue-600 text-white rounded-xl text-xs font-bold hover:bg-blue-700 transition-shadow shadow-lg shadow-blue-200 flex items-center gap-2">
            <Plus size={16} /> New Event
          </button>
        </div>
      </div>

      <div className="flex-1 flex overflow-hidden">
        {/* Calendar Grid */}
        <div className="flex-1 p-6 overflow-y-auto">
          <div className="grid grid-cols-7 gap-px bg-gray-200 rounded-2xl overflow-hidden border border-gray-200 shadow-xl shadow-gray-100 bg-white">
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((d) => (
              <div key={d} className="bg-gray-50 p-4 text-[10px] font-bold uppercase tracking-widest text-gray-400 text-center border-b border-gray-200">{d}</div>
            ))}
            {Array(offset).fill(null).map((_, i) => <div key={`off-${i}`} className="bg-white/50 h-32" />)}
            {Array(days).fill(0).map((_, i) => {
              const d = i + 1;
              const dateStr = `${currentYear}-${(currentMonth + 1).toString().padStart(2, '0')}-${d.toString().padStart(2, '0')}`;
              const hasEvents = calendarEvents.filter((e: any) => e.date === dateStr);
              return (
                <div 
                  key={d} 
                  onClick={() => setSelectedDate(dateStr)}
                  className={`bg-white h-32 p-3 hover:bg-blue-50/30 transition-colors cursor-pointer border-r border-b border-gray-100 relative group ${selectedDate === dateStr ? 'ring-2 ring-inset ring-blue-500' : ''}`}
                >
                  <span className={`text-sm font-bold ${selectedDate === dateStr ? 'text-blue-600' : 'text-gray-400'}`}>{d}</span>
                  <div className="space-y-1 mt-2">
                    {hasEvents.slice(0, 3).map((e: any) => (
                      <div key={e.id} className="text-[9px] px-2 py-1 rounded bg-blue-100 text-blue-700 font-bold truncate border border-blue-200/50">
                        {e.title}
                      </div>
                    ))}
                    {hasEvents.length > 3 && <div className="text-[9px] text-gray-400 font-bold ml-2">+{hasEvents.length - 3} more</div>}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Sidebar */}
        <div className="w-80 border-l border-gray-200 bg-white p-6 overflow-y-auto">
          <h3 className="text-sm font-bold text-gray-900 mb-6 flex items-center gap-2">
            <Clock size={16} className="text-blue-500" />
            Agenda for {selectedDate || 'Select a date'}
          </h3>
          <div className="space-y-4">
            {selectedDate && calendarEvents.filter((e: any) => e.date === selectedDate).length > 0 ? (
              calendarEvents.filter((e: any) => e.date === selectedDate).map((e: any) => (
                <div key={e.id} className="p-4 rounded-2xl bg-gray-50 border border-gray-100 group relative hover:border-blue-200 transition-all">
                  <div className="flex justify-between items-start mb-2">
                    <span className="text-[10px] font-bold text-blue-500 uppercase tracking-widest">{e.time}</span>
                    <span className={`w-2 h-2 rounded-full ${e.type === 'meeting' ? 'bg-orange-500' : 'bg-emerald-500'}`} title={e.type} />
                  </div>
                  <h4 className="text-sm font-bold text-gray-800">{e.title}</h4>
                  <p className="text-[10px] text-gray-500 mt-1">Lead: Corporate Systems</p>
                </div>
              ))
            ) : (
              <div className="flex flex-col items-center justify-center py-20 text-gray-300">
                <Calendar size={48} className="mb-4 opacity-10" />
                <p className="text-xs font-bold uppercase tracking-widest">No Events Scheduled</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {showAddEvent && (
        <div className="absolute inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-6">
          <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="bg-white rounded-3xl w-full max-w-md p-8 shadow-2xl border border-gray-100">
            <h2 className="text-xl font-bold mb-6">Schedule Event</h2>
            <div className="space-y-4">
              <div>
                <label className="text-[10px] uppercase font-bold text-gray-400 mb-1 block">Title</label>
                <input type="text" value={newEvent.title} onChange={e => setNewEvent({...newEvent, title: e.target.value})} className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 ring-blue-500/20" placeholder="e.g. Sales Quarter Review" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-[10px] uppercase font-bold text-gray-400 mb-1 block">Time</label>
                  <input type="time" value={newEvent.time} onChange={e => setNewEvent({...newEvent, time: e.target.value})} className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 ring-blue-500/20" />
                </div>
                <div>
                  <label className="text-[10px] uppercase font-bold text-gray-400 mb-1 block">Category</label>
                  <select value={newEvent.type} onChange={e => setNewEvent({...newEvent, type: e.target.value})} className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 ring-blue-500/20">
                    <option value="meeting">Meeting</option>
                    <option value="work">Work Block</option>
                    <option value="personal">Personal</option>
                  </select>
                </div>
              </div>
            </div>
            <div className="flex gap-3 mt-8">
              <button onClick={() => setShowAddEvent(false)} className="flex-1 py-3 text-sm font-bold text-gray-500 hover:bg-gray-50 rounded-xl transition-colors">Cancel</button>
              <button onClick={handleAddEvent} className="flex-1 py-3 text-sm font-bold bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors shadow-lg shadow-blue-200">Save Event</button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}

function ConditionalFormattingDialog({ activeCell, cellFormats, updateFormat, onClose }: { activeCell: [number, number] | null, cellFormats: Record<string, CellFormat>, updateFormat: (updates: Partial<CellFormat>) => void, onClose: () => void }) {
  if (!activeCell) return null;
  const currentRules = cellFormats[`${activeCell[0]},${activeCell[1]}`]?.conditionalRules || [];
  const [localRules, setLocalRules] = useState<ConditionalRule[]>(currentRules);

  const addRule = () => {
    setLocalRules([...localRules, { type: 'single', operator: 'greaterThan', value1: '0', style: { bold: true, textColor: '#ef4444' } }]);
  };

  const removeRule = (index: number) => {
    setLocalRules(localRules.filter((_, i) => i !== index));
  };

  const updateRule = (index: number, updates: Partial<ConditionalRule>) => {
    const newRules = [...localRules];
    newRules[index] = { ...newRules[index], ...updates };
    setLocalRules(newRules);
  };

  return (
    <div className="absolute inset-0 flex items-center justify-center bg-black/20 backdrop-blur-sm z-[110]">
      <motion.div 
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        className="w-[500px] max-h-[80vh] bg-white rounded-3xl shadow-2xl border border-gray-200 overflow-hidden flex flex-col"
      >
        <div className="p-6 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
          <h3 className="text-xl font-black tracking-tight text-gray-900 flex items-center gap-2">
            <Sparkles className="text-emerald-500" size={20} />
            Conditional Formatting
          </h3>
          <button onClick={onClose} className="p-2 hover:bg-gray-200 rounded-full transition-colors">
            <X size={20} />
          </button>
        </div>
        
        <div className="p-6 space-y-4 overflow-y-auto flex-1 custom-scrollbar">
          {localRules.map((rule, idx) => (
            <div key={idx} className="p-4 bg-gray-50 rounded-2xl border border-gray-100 space-y-3 relative group">
              <button 
                onClick={() => removeRule(idx)}
                className="absolute top-2 right-2 p-1.5 text-gray-400 hover:text-red-500 transition-colors bg-white rounded-lg shadow-sm opacity-0 group-hover:opacity-100"
              >
                <Trash2 size={14} />
              </button>

              <div className="flex items-center gap-3">
                <select 
                  className="bg-white border border-gray-200 rounded-lg px-2 py-1.5 text-xs font-bold text-gray-700 outline-none"
                  value={rule.type}
                  onChange={(e) => updateRule(idx, { type: e.target.value as any })}
                >
                  <option value="single">Single Color</option>
                  <option value="scale">Color Scale</option>
                </select>
              </div>

              {rule.type === 'single' ? (
                <div className="grid grid-cols-2 gap-3">
                  <select 
                    className="col-span-2 bg-white border border-gray-200 rounded-lg px-2 py-1.5 text-xs font-bold text-gray-700 outline-none"
                    value={rule.operator}
                    onChange={(e) => updateRule(idx, { operator: e.target.value as any })}
                  >
                    <option value="greaterThan">Greater Than</option>
                    <option value="lessThan">Less Than</option>
                    <option value="equalTo">Equal To</option>
                    <option value="between">Between</option>
                    <option value="contains">Text Contains</option>
                    <option value="empty">Is Empty</option>
                    <option value="notEmpty">Is Not Empty</option>
                  </select>
                  <input 
                    type="text" 
                    placeholder="Value 1"
                    className="bg-white border border-gray-200 rounded-lg px-2 py-1.5 text-xs font-bold text-gray-700 outline-none"
                    value={rule.value1 || ''}
                    onChange={(e) => updateRule(idx, { value1: e.target.value })}
                  />
                  {rule.operator === 'between' && (
                    <input 
                      type="text" 
                      placeholder="Value 2"
                      className="bg-white border border-gray-200 rounded-lg px-2 py-1.5 text-xs font-bold text-gray-700 outline-none"
                      value={rule.value2 || ''}
                      onChange={(e) => updateRule(idx, { value2: e.target.value })}
                    />
                  )}
                  <div className="col-span-2 flex items-center gap-4 pt-2">
                    <button 
                      onClick={() => updateRule(idx, { style: { ...rule.style, bold: !rule.style?.bold } })}
                      className={cn("p-1.5 rounded transition-colors bg-white border", rule.style?.bold ? "border-emerald-500 text-emerald-600" : "border-gray-200 text-gray-400")}
                    >
                      <Bold size={14} />
                    </button>
                    <input 
                      type="color" 
                      title="Text Color"
                      className="w-8 h-8 rounded p-0 border-none bg-transparent cursor-pointer"
                      value={rule.style?.textColor || '#000000'}
                      onChange={(e) => updateRule(idx, { style: { ...rule.style, textColor: e.target.value } })}
                    />
                    <input 
                      type="color" 
                      title="Fill Color"
                      className="w-8 h-8 rounded p-0 border-none bg-transparent cursor-pointer"
                      value={rule.style?.bgColor || '#ffffff'}
                      onChange={(e) => updateRule(idx, { style: { ...rule.style, bgColor: e.target.value } })}
                    />
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Min Value</label>
                    <input 
                      type="number"
                      className="bg-white border border-gray-200 rounded-lg px-2 py-1.5 text-xs font-bold text-gray-700 w-full outline-none"
                      value={rule.scale?.minValue || 0}
                      onChange={(e) => updateRule(idx, { scale: { ...rule.scale!, minValue: parseFloat(e.target.value) } })}
                    />
                    <input 
                      type="color"
                      className="h-8 w-full rounded p-0 border-none bg-transparent cursor-pointer"
                      value={rule.scale?.minColor || '#ff0000'}
                      onChange={(e) => updateRule(idx, { scale: { ...rule.scale!, minColor: e.target.value } })}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Max Value</label>
                    <input 
                      type="number"
                      className="bg-white border border-gray-200 rounded-lg px-2 py-1.5 text-xs font-bold text-gray-700 w-full outline-none"
                      value={rule.scale?.maxValue || 100}
                      onChange={(e) => updateRule(idx, { scale: { ...rule.scale!, maxValue: parseFloat(e.target.value) } })}
                    />
                    <input 
                      type="color"
                      className="h-8 w-full rounded p-0 border-none bg-transparent cursor-pointer"
                      value={rule.scale?.maxColor || '#00ff00'}
                      onChange={(e) => updateRule(idx, { scale: { ...rule.scale!, maxColor: e.target.value } })}
                    />
                  </div>
                </div>
              )}
            </div>
          ))}

          <button 
            onClick={addRule}
            className="w-full py-3 border-2 border-dashed border-gray-200 rounded-2xl flex items-center justify-center gap-2 text-gray-400 hover:text-emerald-500 hover:border-emerald-200 transition-all font-bold text-xs"
          >
            <Plus size={16} /> Add new rule
          </button>
        </div>

        <div className="p-6 bg-gray-50 border-t border-gray-100 flex items-center justify-end gap-3">
          <button onClick={onClose} className="px-6 py-2.5 rounded-xl text-xs font-bold text-gray-500 hover:bg-gray-200 transition-colors">
            Cancel
          </button>
          <button 
            onClick={() => {
              updateFormat({ conditionalRules: localRules });
              onClose();
            }}
            className="px-8 py-2.5 rounded-xl text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 shadow-lg shadow-emerald-200 transition-all active:scale-95"
          >
            Apply rules
          </button>
        </div>
      </motion.div>
    </div>
  );
}

function ValidationDialog({ activeCell, cellFormats, updateFormat, onClose }: { activeCell: [number, number] | null, cellFormats: Record<string, CellFormat>, updateFormat: (updates: Partial<CellFormat>) => void, onClose: () => void }) {
  if (!activeCell) return null;
  const currentValidation = cellFormats[`${activeCell[0]},${activeCell[1]}`]?.validation || { type: 'none' };

  const [localVal, setLocalVal] = useState<DataValidation>(currentValidation);

  return (
    <div className="absolute inset-0 flex items-center justify-center bg-black/20 backdrop-blur-sm z-[100]">
      <motion.div 
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        className="w-[450px] bg-white rounded-3xl shadow-2xl border border-gray-200 overflow-hidden"
      >
        <div className="p-6 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
          <h3 className="text-xl font-black tracking-tight text-gray-900 flex items-center gap-2">
            <ShieldCheck className="text-emerald-500" size={20} />
            Data Validation
          </h3>
          <button onClick={onClose} className="p-2 hover:bg-gray-200 rounded-full transition-colors">
            <X size={20} />
          </button>
        </div>
        
        <div className="p-6 space-y-6">
          <div className="space-y-2">
            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-1">Criteria Type</label>
            <select 
              className="w-full bg-gray-100 border-none rounded-xl px-4 py-3 text-xs font-bold text-gray-700 focus:ring-2 focus:ring-emerald-500 outline-none"
              value={localVal.type}
              onChange={(e) => setLocalVal({ ...localVal, type: e.target.value as any, criteria: undefined })}
            >
              <option value="none">None</option>
              <option value="list">Dropdown List</option>
              <option value="number">Number Range</option>
              <option value="text">Text Rules</option>
              <option value="date">Date</option>
            </select>
          </div>

          {localVal.type === 'list' && (
            <div className="space-y-2">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-1">List Items (comma separated)</label>
              <textarea 
                className="w-full bg-gray-100 border-none rounded-xl px-4 py-3 text-xs font-bold text-gray-700 min-h-[100px] focus:ring-2 focus:ring-emerald-500 outline-none"
                placeholder="Item 1, Item 2, Item 3..."
                value={localVal.listValues?.join(', ') || ''}
                onChange={(e) => setLocalVal({ ...localVal, listValues: e.target.value.split(',').map(s => s.trim()).filter(Boolean) })}
              />
            </div>
          )}

          {localVal.type === 'number' && (
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2 col-span-2">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-1">Condition</label>
                <select 
                  className="w-full bg-gray-100 border-none rounded-xl px-4 py-3 text-xs font-bold text-gray-700 focus:ring-2 focus:ring-emerald-500 outline-none"
                  value={localVal.criteria}
                  onChange={(e) => setLocalVal({ ...localVal, criteria: e.target.value as any })}
                >
                  <option value="between">Between</option>
                  <option value="greaterThan">Greater Than</option>
                  <option value="lessThan">Less Than</option>
                  <option value="equalTo">Equal To</option>
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-1">Value 1</label>
                <input 
                  type="number"
                  className="w-full bg-gray-100 border-none rounded-xl px-4 py-3 text-xs font-bold text-gray-700 focus:ring-2 focus:ring-emerald-500 outline-none"
                  value={localVal.value1 || ''}
                  onChange={(e) => setLocalVal({ ...localVal, value1: e.target.value })}
                />
              </div>
              {localVal.criteria === 'between' && (
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-1">Value 2</label>
                  <input 
                    type="number"
                    className="w-full bg-gray-100 border-none rounded-xl px-4 py-3 text-xs font-bold text-gray-700 focus:ring-2 focus:ring-emerald-500 outline-none"
                    value={localVal.value2 || ''}
                    onChange={(e) => setLocalVal({ ...localVal, value2: e.target.value })}
                  />
                </div>
              )}
            </div>
          )}

          {localVal.type === 'text' && (
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-1">Text Rules</label>
                <select 
                  className="w-full bg-gray-100 border-none rounded-xl px-4 py-3 text-xs font-bold text-gray-700 focus:ring-2 focus:ring-emerald-500 outline-none"
                  value={localVal.criteria}
                  onChange={(e) => setLocalVal({ ...localVal, criteria: e.target.value as any })}
                >
                  <option value="contains">Contains</option>
                  <option value="isEmail">Valid Email</option>
                  <option value="isUrl">Valid URL</option>
                </select>
              </div>
              {localVal.criteria === 'contains' && (
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-1">Value</label>
                  <input 
                    type="text"
                    className="w-full bg-gray-100 border-none rounded-xl px-4 py-3 text-xs font-bold text-gray-700 focus:ring-2 focus:ring-emerald-500 outline-none"
                    value={localVal.value1 || ''}
                    onChange={(e) => setLocalVal({ ...localVal, value1: e.target.value })}
                  />
                </div>
              )}
            </div>
          )}

          <div className="flex items-center gap-3 bg-gray-50 p-4 rounded-2xl border border-gray-100">
            <input 
              type="checkbox"
              id="allow-invalid"
              className="w-4 h-4 rounded-lg bg-white border-gray-300 text-emerald-600 focus:ring-emerald-500"
              checked={localVal.allowInvalid}
              onChange={(e) => setLocalVal({ ...localVal, allowInvalid: e.target.checked })}
            />
            <label htmlFor="allow-invalid" className="text-[11px] font-bold text-gray-600 select-none cursor-pointer">Allow invalid data with warning icon</label>
          </div>
        </div>

        <div className="p-6 bg-gray-50 border-t border-gray-100 flex items-center justify-end gap-3">
          <button 
            onClick={onClose}
            className="px-6 py-2.5 rounded-xl text-xs font-bold text-gray-500 hover:bg-gray-200 transition-colors"
          >
            Cancel
          </button>
          <button 
            onClick={() => {
              updateFormat({ validation: localVal });
              onClose();
            }}
            className="px-8 py-2.5 rounded-xl text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 shadow-lg shadow-emerald-200 transition-all active:scale-95"
          >
            Apply validation
          </button>
        </div>
      </motion.div>
    </div>
  );
}

function FormattingToolbar({ activeCell, cellFormats, updateFormat }: { activeCell: [number, number] | null, cellFormats: Record<string, CellFormat>, updateFormat: (updates: Partial<CellFormat>) => void }) {
  if (!activeCell) return null;
  const currentFormat = cellFormats[`${activeCell[0]},${activeCell[1]}`] || {};

  const toggle = (field: keyof CellFormat) => updateFormat({ [field]: !currentFormat[field] });

  return (
    <div className="bg-white border-b border-gray-200 px-4 py-1.5 flex items-center gap-4 overflow-x-auto no-scrollbar shrink-0">
      {/* Typography */}
      <div className="flex items-center gap-1 border-r border-gray-200 pr-4">
        <button onClick={() => toggle('bold')} className={cn("p-1.5 rounded transition-colors hover:bg-gray-100", currentFormat.bold ? "bg-emerald-100 text-emerald-700" : "text-gray-500")} title="Bold (Ctrl+B)">
          <Bold size={14} />
        </button>
        <button onClick={() => toggle('italic')} className={cn("p-1.5 rounded transition-colors hover:bg-gray-100", currentFormat.italic ? "bg-emerald-100 text-emerald-700" : "text-gray-500")} title="Italic (Ctrl+I)">
          <Italic size={14} />
        </button>
        <button onClick={() => toggle('underline')} className={cn("p-1.5 rounded transition-colors hover:bg-gray-100", currentFormat.underline ? "bg-emerald-100 text-emerald-700" : "text-gray-500")} title="Underline (Ctrl+U)">
          <Underline size={14} />
        </button>
        <button onClick={() => toggle('strikethrough')} className={cn("p-1.5 rounded transition-colors hover:bg-gray-100", currentFormat.strikethrough ? "bg-emerald-100 text-emerald-700" : "text-gray-500")} title="Strikethrough">
          <Strikethrough size={14} />
        </button>
      </div>

      {/* Alignment */}
      <div className="flex items-center gap-1 border-r border-gray-200 pr-4">
        <button onClick={() => updateFormat({ alignX: 'left' })} className={cn("p-1.5 rounded transition-colors hover:bg-gray-100", currentFormat.alignX === 'left' ? "bg-emerald-100 text-emerald-700" : "text-gray-500")} title="Align Left">
          <AlignLeft size={14} />
        </button>
        <button onClick={() => updateFormat({ alignX: 'center' })} className={cn("p-1.5 rounded transition-colors hover:bg-gray-100", currentFormat.alignX === 'center' ? "bg-emerald-100 text-emerald-700" : "text-gray-500")} title="Align Center">
          <AlignCenter size={14} />
        </button>
        <button onClick={() => updateFormat({ alignX: 'right' })} className={cn("p-1.5 rounded transition-colors hover:bg-gray-100", currentFormat.alignX === 'right' ? "bg-emerald-100 text-emerald-700" : "text-gray-500")} title="Align Right">
          <AlignRight size={14} />
        </button>
        <div className="w-px h-4 bg-gray-200 mx-1" />
        <button onClick={() => updateFormat({ alignY: 'top' })} className={cn("p-1.5 rounded transition-colors hover:bg-gray-100", currentFormat.alignY === 'top' ? "bg-emerald-100 text-emerald-700" : "text-gray-500")} title="Align Top">
          <AlignStartVertical size={14} />
        </button>
        <button onClick={() => updateFormat({ alignY: 'middle' })} className={cn("p-1.5 rounded transition-colors hover:bg-gray-100", currentFormat.alignY === 'middle' ? "bg-emerald-100 text-emerald-700" : "text-gray-500")} title="Align Middle">
          <AlignCenterVertical size={14} />
        </button>
        <button onClick={() => updateFormat({ alignY: 'bottom' })} className={cn("p-1.5 rounded transition-colors hover:bg-gray-100", currentFormat.alignY === 'bottom' ? "bg-emerald-100 text-emerald-700" : "text-gray-500")} title="Align Bottom">
          <AlignEndVertical size={14} />
        </button>
      </div>

      {/* Wrapping & Borders */}
      <div className="flex items-center gap-1 border-r border-gray-200 pr-4">
        <button onClick={() => updateFormat({ wrap: currentFormat.wrap === 'wrap' ? 'nowrap' : 'wrap' })} className={cn("p-1.5 rounded transition-colors hover:bg-gray-100", currentFormat.wrap === 'wrap' ? "bg-emerald-100 text-emerald-700" : "text-gray-500")} title="Wrap Text">
          <WrapText size={14} />
        </button>
        <div className="relative group">
          <button className="p-1.5 rounded transition-colors hover:bg-gray-100 text-gray-500" title="Cell Borders">
            <Square size={14} />
            <div className="absolute top-full left-0 hidden group-hover:flex flex-col gap-2 p-3 bg-white border border-gray-200 shadow-xl rounded-xl z-[100] mt-1 min-w-[140px]">
              <div className="text-[9px] font-bold text-gray-400 uppercase tracking-widest mb-1">Thickness</div>
              <div className="flex gap-1">
                {[1, 2, 4].map(t => (
                  <button 
                    key={t} 
                    onClick={() => updateFormat({ borderThickness: t })}
                    className={cn("px-2 py-1 rounded text-[10px] font-bold border grow text-center", currentFormat.borderThickness === t ? "bg-emerald-100 border-emerald-200 text-emerald-700" : "bg-gray-50 border-gray-100 text-gray-500")}
                  >
                    {t}px
                  </button>
                ))}
              </div>
              <div className="text-[9px] font-bold text-gray-400 uppercase tracking-widest my-1">Style</div>
              <div className="flex flex-col gap-1">
                {(['solid', 'dashed', 'dotted'] as const).map(s => (
                  <button 
                    key={s} 
                    onClick={() => updateFormat({ borderStyle: s })}
                    className={cn("px-2 py-1 rounded text-[10px] font-bold border text-left flex items-center justify-between", currentFormat.borderStyle === s ? "bg-emerald-100 border-emerald-200 text-emerald-700" : "bg-gray-50 border-gray-100 text-gray-500")}
                  >
                    <span className="capitalize">{s}</span>
                    <div className="w-12 h-0 border-t" style={{ borderStyle: s, borderColor: 'currentColor' }} />
                  </button>
                ))}
              </div>
              <div className="text-[9px] font-bold text-gray-400 uppercase tracking-widest my-1 border-t border-gray-100 pt-2">Toggle Borders</div>
              <div className="grid grid-cols-2 gap-1">
                {(['borderTop', 'borderRight', 'borderBottom', 'borderLeft'] as const).map(b => (
                   <button 
                    key={b} 
                    onClick={() => toggle(b)}
                    className={cn("px-1 py-1 rounded text-[8px] font-bold border uppercase transition-all", currentFormat[b] ? "bg-emerald-100 border-emerald-200 text-emerald-700 font-black" : "bg-gray-50 border-gray-100 text-gray-500")}
                   >
                     {b.replace('border', '')}
                   </button>
                ))}
                <button 
                  onClick={() => updateFormat({ borderTop: true, borderRight: true, borderBottom: true, borderLeft: true })}
                  className="px-1 py-1 rounded text-[8px] font-bold border uppercase bg-gray-50 border-gray-100 text-gray-500 hover:bg-emerald-100 transition-all font-black col-span-2"
                >
                  All Borders
                </button>
              </div>
            </div>
          </button>
        </div>
      </div>

      {/* Numbers */}
      <div className="flex items-center gap-1 border-r border-gray-200 pr-4">
        <button onClick={() => updateFormat({ type: 'currency' })} className={cn("p-1.5 rounded transition-colors hover:bg-gray-100", currentFormat.type === 'currency' ? "bg-emerald-100 text-emerald-700" : "text-gray-500")} title="Format as Currency">
          <DollarSign size={14} />
        </button>
        <button onClick={() => updateFormat({ type: 'percent' })} className={cn("p-1.5 rounded transition-colors hover:bg-gray-100", currentFormat.type === 'percent' ? "bg-emerald-100 text-emerald-700" : "text-gray-500")} title="Format as Percentage">
          <Percent size={14} />
        </button>
        <button onClick={() => updateFormat({ precision: (currentFormat.precision || 0) + 1 })} className="p-1.5 rounded transition-colors hover:bg-gray-100 text-gray-500" title="Increase Decimals">
          .00<Baseline size={10} className="inline ml-0.5" />
        </button>
        <button onClick={() => updateFormat({ precision: Math.max(0, (currentFormat.precision || 0) - 1) })} className="p-1.5 rounded transition-colors hover:bg-gray-100 text-gray-500" title="Decrease Decimals">
          .0<Baseline size={10} className="inline ml-0.5" />
        </button>
        <button onClick={() => updateFormat({ type: 'date' })} className={cn("p-1.5 rounded transition-colors hover:bg-gray-100", currentFormat.type === 'date' ? "bg-emerald-100 text-emerald-700" : "text-gray-500")} title="Format as Date">
          <Calendar size={14} />
        </button>
      </div>

      {/* Colors */}
      <div className="flex items-center gap-1">
        <div className="relative group">
          <button className="p-1.5 rounded transition-colors hover:bg-gray-100 text-gray-500" title="Text Color">
            <Palette size={14} />
            <div className="absolute top-full left-0 hidden group-hover:grid grid-cols-4 gap-1 p-2 bg-white border border-gray-200 shadow-xl rounded-xl z-[100] mt-1">
              {['#000', '#ef4444', '#3b82f6', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899', '#64748b'].map(c => (
                <button key={c} onClick={() => updateFormat({ textColor: c })} className="w-4 h-4 rounded-full border border-gray-100" style={{ backgroundColor: c }} />
              ))}
            </div>
          </button>
        </div>
        <div className="relative group">
          <button className="p-1.5 rounded transition-colors hover:bg-gray-100 text-gray-500" title="Fill Color">
            <PaintBucket size={14} />
            <div className="absolute top-full left-0 hidden group-hover:grid grid-cols-4 gap-1 p-2 bg-white border border-gray-200 shadow-xl rounded-xl z-[100] mt-1">
              {['transparent', '#fee2e2', '#dbeafe', '#d1fae5', '#fef3c7', '#ede9fe', '#fce7f3', '#f1f5f9'].map(c => (
                <button key={c} onClick={() => updateFormat({ bgColor: c })} className="w-4 h-4 rounded-full border border-gray-100" style={{ backgroundColor: c }} />
              ))}
            </div>
          </button>
        </div>
      </div>
      
      {/* Font selector */}
      <div className="flex items-center gap-2 ml-auto">
        <select 
          className="text-[10px] font-bold bg-gray-100 px-2 py-1 rounded border-none outline-none text-gray-600 cursor-pointer"
          value={currentFormat.fontFamily || 'Inter'}
          onChange={(e) => updateFormat({ fontFamily: e.target.value })}
        >
          <option value="Inter">Sans</option>
          <option value="JetBrains Mono">Mono</option>
          <option value="serif">Serif</option>
        </select>
        <select 
          className="text-[10px] font-bold bg-gray-100 px-2 py-1 rounded border-none outline-none text-gray-600 cursor-pointer"
          value={currentFormat.fontSize || 12}
          onChange={(e) => updateFormat({ fontSize: parseInt(e.target.value) })}
        >
          {[8, 9, 10, 11, 12, 14, 16, 18, 24].map(s => (
            <option key={s} value={s}>{s}px</option>
          ))}
        </select>
      </div>
    </div>
  );
}

function SpreadsheetChart({ type, data, onClose }: { type: string, data: string[][], onClose: () => void }) {
  const chartData = useMemo(() => {
    // Basic heuristics: assume row 0 is headers, col 0 is labels
    const headers = data[0];
    const rows = data.slice(1).filter(row => row.some(cell => cell.trim() !== ''));
    
    return rows.map((row, idx) => {
      const obj: any = { name: row[0] || `Row ${idx + 1}` };
      headers.slice(1).forEach((header, colIdx) => {
        const val = parseFloat(row[colIdx + 1]);
        obj[header || `Col ${colIdx + 1}`] = isNaN(val) ? 0 : val;
      });
      return obj;
    });
  }, [data]);

  const headers = data[0].slice(1).filter(h => h.trim() !== '');
  const COLORS = ['#10b981', '#3b82f6', '#8b5cf6', '#f59e0b', '#ef4444', '#ec4899'];

  const renderChart = () => {
    switch (type) {
      case 'Clustered Column':
      case 'Clustered Bar':
        return (
          <ResponsiveContainer width="100%" height="100%">
            <ReBarChart data={chartData} layout={type === 'Clustered Bar' ? 'vertical' : 'horizontal'}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              {type === 'Clustered Bar' ? <YAxis dataKey="name" type="category" /> : <XAxis dataKey="name" />}
              {type === 'Clustered Bar' ? <XAxis type="number" /> : <YAxis />}
              <Tooltip cursor={{fill: 'rgba(16, 185, 129, 0.05)'}} />
              <Legend />
              {headers.map((h, i) => <Bar key={h} dataKey={h} fill={COLORS[i % COLORS.length]} radius={[4, 4, 0, 0]} />)}
            </ReBarChart>
          </ResponsiveContainer>
        );
      case 'Line Chart':
        return (
          <ResponsiveContainer width="100%" height="100%">
            <ReLineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Legend />
              {headers.map((h, i) => <Line key={h} type="monotone" dataKey={h} stroke={COLORS[i % COLORS.length]} strokeWidth={3} dot={{ r: 6 }} activeDot={{ r: 8 }} />)}
            </ReLineChart>
          </ResponsiveContainer>
        );
      case 'Stacked Area':
        return (
          <ResponsiveContainer width="100%" height="100%">
            <ReAreaChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Legend />
              {headers.map((h, i) => <Area key={h} type="monotone" dataKey={h} stackId="1" stroke={COLORS[i % COLORS.length]} fill={COLORS[i % COLORS.length]} fillOpacity={0.6} />)}
            </ReAreaChart>
          </ResponsiveContainer>
        );
      case 'Combo Chart':
        return (
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Legend />
              {headers.map((h, i) => i === 0 
                ? <Bar key={h} dataKey={h} fill={COLORS[i % COLORS.length]} radius={[4, 4, 0, 0]} />
                : <Line key={h} type="monotone" dataKey={h} stroke={COLORS[i % COLORS.length]} strokeWidth={3} />
              )}
            </ComposedChart>
          </ResponsiveContainer>
        );
      case 'Gantt Chart':
        // Simplified Gantt using stacked bars (start offset + duration)
        const ganttData = useMemo(() => {
          let startOffset = 0;
          return chartData.map(item => {
            const duration = item[headers[0]] || 5;
            const res = { ...item, offset: startOffset, duration };
            startOffset += duration;
            return res;
          });
        }, [chartData, headers]);
        return (
          <ResponsiveContainer width="100%" height="100%">
            <ReBarChart data={ganttData} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis type="number" />
              <YAxis dataKey="name" type="category" />
              <Tooltip />
              <Bar dataKey="offset" stackId="a" fill="transparent" />
              <Bar dataKey="duration" stackId="a" fill="#3b82f6" radius={[0, 4, 4, 0]} />
            </ReBarChart>
          </ResponsiveContainer>
        );
      case 'Icon Chart':
        return (
          <div className="flex flex-wrap gap-8 group h-full items-center justify-center">
            {chartData.map((item, idx) => {
              const count = Math.min(Math.floor((item[headers[0]] || 0) / 10), 50); // Scale 1 icon = 10 units
              return (
                <div key={idx} className="flex flex-col items-center">
                  <div className="flex flex-wrap gap-1 max-w-[150px] justify-center mb-2">
                    {Array(count || 1).fill(0).map((_, i) => (
                      <UserIcon key={i} size={12} className="text-emerald-500 animate-in fade-in zoom-in" style={{ animationDelay: `${i * 50}ms` }} />
                    ))}
                  </div>
                  <span className="text-[10px] font-bold text-gray-500 uppercase tracking-tighter">{item.name}</span>
                </div>
              );
            })}
          </div>
        );
      case 'Doughnut Chart':
        return (
          <ResponsiveContainer width="100%" height="100%">
            <RePieChart>
              <Pie
                data={chartData}
                cx="50%"
                cy="50%"
                innerRadius={80}
                outerRadius={120}
                paddingAngle={5}
                dataKey={headers[0]}
              >
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </RePieChart>
          </ResponsiveContainer>
        );
      case 'Radar Chart':
        return (
          <ResponsiveContainer width="100%" height="100%">
            <ReRadarChart cx="50%" cy="50%" outerRadius="80%" data={chartData}>
              <PolarGrid stroke="#e2e8f0" />
              <PolarAngleAxis dataKey="name" />
              <PolarRadiusAxis />
              {headers.map((h, i) => (
                <ReRadar key={h} name={h} dataKey={h} stroke={COLORS[i % COLORS.length]} fill={COLORS[i % COLORS.length]} fillOpacity={0.6} />
              ))}
              <Tooltip />
              <Legend />
            </ReRadarChart>
          </ResponsiveContainer>
        );
      case 'Treemap':
        return (
          <ResponsiveContainer width="100%" height="100%">
            <ReTreemap
              data={chartData}
              dataKey={headers[0]}
              aspectRatio={4 / 3}
              stroke="#fff"
              fill="#10b981"
            />
          </ResponsiveContainer>
        );
      case 'Box & Whisker':
        return (
          <ResponsiveContainer width="100%" height="100%">
            <ScatterChart>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Scatter name="Distribution" data={chartData} fill="#8884d8">
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Scatter>
            </ScatterChart>
          </ResponsiveContainer>
        );
      case 'PivotChart':
        return (
          <ResponsiveContainer width="100%" height="100%">
            <ReBarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey={headers[0]} fill="#10b981" />
              <Bar dataKey={headers[1]} fill="#3b82f6" />
            </ReBarChart>
          </ResponsiveContainer>
        );
      case 'Waterfall Chart':
        // Simplified waterfall by calculating steps
        const waterfallData = useMemo(() => {
          let current = 0;
          return chartData.map(item => {
            const val = item[headers[0]] || 0;
            const start = current;
            current += val;
            return { ...item, start, end: current, diff: val };
          });
        }, [chartData, headers]);
        return (
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart data={waterfallData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="start" stackId="a" fill="transparent" />
              <Bar dataKey="diff" stackId="a" radius={[4, 4, 0, 0]}>
                {waterfallData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.diff >= 0 ? '#10b981' : '#ef4444'} />
                ))}
              </Bar>
            </ComposedChart>
          </ResponsiveContainer>
        );
      case 'Funnel Chart':
        return (
          <ResponsiveContainer width="100%" height="100%">
            <FunnelChart>
              <Tooltip />
              <Funnel
                data={chartData}
                dataKey={headers[0]}
                nameKey="name"
              >
                <LabelList position="right" fill="#888" stroke="none" dataKey="name" />
              </Funnel>
            </FunnelChart>
          </ResponsiveContainer>
        );
      case 'Bubble Chart':
        return (
          <ResponsiveContainer width="100%" height="100%">
            <ScatterChart>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis type="category" dataKey="name" name="category" />
              <YAxis type="number" dataKey={headers[0]} name={headers[0]} />
              <ZAxis type="number" dataKey={headers[1] || headers[0]} range={[60, 400]} name={headers[1] || 'Value'} />
              <Tooltip cursor={{ strokeDasharray: '3 3' }} />
              <Legend />
              <Scatter name="Data Points" data={chartData} fill="#10b981" />
            </ScatterChart>
          </ResponsiveContainer>
        );
      case 'KPI Card':
        const total = chartData.reduce((sum, item) => sum + (item[headers[0]] || 0), 0);
        return (
          <div className="flex flex-col items-center justify-center h-full">
            <div className="text-[10px] uppercase font-bold tracking-widest text-emerald-600 mb-2">{headers[0]} (Total)</div>
            <div className="text-6xl font-black tracking-tighter text-gray-900">{total.toLocaleString()}</div>
            <div className="mt-4 flex items-center gap-2 text-emerald-500 font-bold">
              <TrendingUp size={20} /> +12.5% Growth
            </div>
          </div>
        );
      case 'Heat Map':
        return (
          <div className="grid grid-cols-4 gap-2 h-full overflow-auto p-4">
            {chartData.map((item, idx) => {
              const val = item[headers[0]] || 0;
              const intensity = Math.min(val / 100, 1);
              return (
                <div key={idx} className="aspect-square rounded-xl flex flex-col items-center justify-center relative overflow-hidden group border border-gray-100" style={{ background: `rgba(16, 185, 129, ${0.1 + intensity * 0.9})` }}>
                  <span className="text-[10px] font-bold text-white uppercase tracking-tighter drop-shadow-sm">{item.name}</span>
                  <span className="text-sm font-black text-white drop-shadow-sm">{val}</span>
                </div>
              );
            })}
          </div>
        );
      default:
        return (
          <div className="flex flex-col items-center justify-center h-full text-gray-400 gap-4">
            <BarChart3 size={64} className="opacity-20" />
            <p className="font-bold uppercase tracking-widest text-xs">Visualizing: {type}</p>
            <p className="text-[10px]">Heuristics-based render in progress...</p>
          </div>
        );
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="absolute inset-4 top-24 bottom-12 bg-white/95 backdrop-blur-xl rounded-3xl shadow-2xl z-[60] border border-gray-200 flex flex-col overflow-hidden"
    >
      <div className="p-6 border-b border-gray-100 flex items-center justify-between bg-white/50 backdrop-blur-md">
        <div>
          <h3 className="text-2xl font-black tracking-tighter text-gray-900">{type}</h3>
          <p className="text-xs font-bold text-emerald-600 uppercase tracking-widest flex items-center gap-2">
            <Activity size={12} /> Live Sheet Visualization
          </p>
        </div>
        <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full text-gray-400 transition-all hover:rotate-90">
          <X size={24} />
        </button>
      </div>
      <div className="flex-1 p-8 min-h-0">
        {renderChart()}
      </div>
      <div className="p-4 bg-gray-50/50 border-t border-gray-100 text-[10px] text-gray-400 font-medium flex items-center justify-center gap-4">
        <span>MODE: ACCURATE COMPARISON</span>
        <div className="w-1 h-1 rounded-full bg-gray-300" />
        <span>OUTLIER DETECTION ACTIVE</span>
        <div className="w-1 h-1 rounded-full bg-gray-300" />
        <span>MULTI-DIMENSIONAL SYNC</span>
      </div>
    </motion.div>
  );
}

interface DataValidation {
  type: 'none' | 'list' | 'number' | 'text' | 'date';
  criteria?: 'between' | 'greaterThan' | 'lessThan' | 'equalTo' | 'contains' | 'isEmail' | 'isUrl';
  value1?: string | number;
  value2?: string | number;
  allowInvalid?: boolean;
  errorMessage?: string;
  listValues?: string[];
}

interface ConditionalRule {
  type: 'single' | 'scale';
  operator?: 'greaterThan' | 'lessThan' | 'equalTo' | 'between' | 'contains' | 'empty' | 'notEmpty';
  value1?: string | number;
  value2?: string | number;
  style?: {
    bold?: boolean;
    italic?: boolean;
    textColor?: string;
    bgColor?: string;
  };
  scale?: {
    minColor: string;
    maxColor: string;
    minValue?: number;
    maxValue?: number;
  };
}

interface CellFormat {
  bold?: boolean;
  italic?: boolean;
  underline?: boolean;
  strikethrough?: boolean;
  alignX?: 'left' | 'center' | 'right';
  alignY?: 'top' | 'middle' | 'bottom';
  wrap?: 'wrap' | 'nowrap' | 'clip';
  fontFamily?: string;
  fontSize?: number;
  textColor?: string;
  bgColor?: string;
  borderTop?: boolean;
  borderRight?: boolean;
  borderBottom?: boolean;
  borderLeft?: boolean;
  borderThickness?: number;
  borderStyle?: 'solid' | 'dashed' | 'dotted';
  type?: 'text' | 'number' | 'currency' | 'percent' | 'date' | 'sci';
  precision?: number;
  validation?: DataValidation;
  conditionalRules?: ConditionalRule[];
}

function SpreadsheetApp({ fs, setFs, sheetData, setSheetData, activeFileInSheets, setActiveFileInSheets, addNotification, currentUser, openWindow, setPrintQueue, userName, runGlassScript, runBrainscript }: any) {
  const [activeCell, setActiveCell] = useState<[number, number] | null>(null);
  const [selectionRange, setSelectionRange] = useState<{ start: [number, number], end: [number, number] } | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [activeMenu, setActiveMenu] = useState<string | null>(null);
  const [activeFile, setActiveFile] = useState<{ name: string, path: string[] } | null>(activeFileInSheets);
  const [showOpenDialog, setShowOpenDialog] = useState(false);
  const [showSaveDialog, setShowSaveDialog] = useState(false);
  const [saveFileName, setSaveFileName] = useState('');
  const [activeChart, setActiveChart] = useState<string | null>(null);
  const [cellFormats, setCellFormats] = useState<Record<string, CellFormat>>({});
  const [showValidationDialog, setShowValidationDialog] = useState(false);
  const [showConditionalDialog, setShowConditionalDialog] = useState(false);
  const [showScriptPicker, setShowScriptPicker] = useState(false);
  
  const validateCell = (val: string, validation?: DataValidation): { isValid: boolean, error?: string } => {
    if (!validation || validation.type === 'none') return { isValid: true };
    
    if (validation.type === 'list') {
      const isValid = validation.listValues?.includes(val) || false;
      return { isValid, error: isValid ? undefined : validation.errorMessage || 'Value must be from the list' };
    }

    if (validation.type === 'number') {
      const num = parseFloat(val);
      if (isNaN(num)) return { isValid: false, error: 'Value must be a number' };
      const v1 = parseFloat(validation.value1 as string);
      const v2 = parseFloat(validation.value2 as string);
      
      switch (validation.criteria) {
        case 'between':
          if (num < v1 || num > v2) return { isValid: false, error: `Value must be between ${v1} and ${v2}` };
          break;
        case 'greaterThan':
          if (num <= v1) return { isValid: false, error: `Value must be greater than ${v1}` };
          break;
        case 'lessThan':
          if (num >= v1) return { isValid: false, error: `Value must be less than ${v1}` };
          break;
        case 'equalTo':
          if (num !== v1) return { isValid: false, error: `Value must be equal to ${v1}` };
          break;
      }
    }

    if (validation.type === 'text') {
      switch (validation.criteria) {
        case 'contains':
          if (!val.includes(validation.value1 as string)) return { isValid: false, error: `Text must contain "${validation.value1}"` };
          break;
        case 'isEmail':
          if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val)) return { isValid: false, error: 'Value must be a valid email' };
          break;
        case 'isUrl':
          try { new URL(val); } catch { return { isValid: false, error: 'Value must be a valid URL' }; }
          break;
      }
    }

    return { isValid: true };
  };
  
  const updateFormat = (updates: Partial<CellFormat>) => {
    if (!activeCell) return;
    
    setCellFormats(prev => {
      const newFormats = { ...prev };
      
      if (selectionRange) {
        const rStart = Math.min(selectionRange.start[0], selectionRange.end[0]);
        const rEnd = Math.max(selectionRange.start[0], selectionRange.end[0]);
        const cStart = Math.min(selectionRange.start[1], selectionRange.end[1]);
        const cEnd = Math.max(selectionRange.start[1], selectionRange.end[1]);
        
        for (let r = rStart; r <= rEnd; r++) {
          for (let c = cStart; c <= cEnd; c++) {
            const cellId = `${r},${c}`;
            newFormats[cellId] = { ...newFormats[cellId], ...updates };
          }
        }
      } else {
        const cellId = `${activeCell[0]},${activeCell[1]}`;
        newFormats[cellId] = { ...newFormats[cellId], ...updates };
      }
      
      return newFormats;
    });
  };

  const getFormattedValue = (val: any, format?: CellFormat): string => {
    if (val === undefined || val === null || val === '') return '';
    const num = parseFloat(val);
    if (isNaN(num)) return val.toString();

    const precision = format?.precision ?? 2;

    switch (format?.type) {
      case 'currency':
        return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: precision }).format(num);
      case 'percent':
        return new Intl.NumberFormat('en-US', { style: 'percent', minimumFractionDigits: precision }).format(num / 100);
      case 'date':
        try {
           const d = new Date(val);
           return isNaN(d.getTime()) ? val : d.toLocaleDateString();
        } catch(e) { return val; }
      case 'sci':
        return num.toExponential(precision);
      case 'number':
        return num.toFixed(precision);
      default:
        return val.toString();
    }
  };

  const getCellStyle = (r: number, c: number): React.CSSProperties => {
    const format = cellFormats[`${r},${c}`] || {};
    const dispVal = getDisplayValue(r, c);
    
    let conditionalStyle: React.CSSProperties = {};
    if (format.conditionalRules) {
      for (const rule of format.conditionalRules) {
        if (rule.type === 'single') {
          const numVal = parseFloat(dispVal);
          const v1 = parseFloat(rule.value1 as string);
          const v2 = parseFloat(rule.value2 as string);
          let match = false;
          
          switch (rule.operator) {
            case 'greaterThan': match = numVal > v1; break;
            case 'lessThan': match = numVal < v1; break;
            case 'equalTo': match = numVal === v1; break;
            case 'between': match = numVal >= v1 && numVal <= v2; break;
            case 'contains': match = dispVal.includes(rule.value1 as string); break;
            case 'empty': match = dispVal === ''; break;
            case 'notEmpty': match = dispVal !== ''; break;
          }
          
          if (match && rule.style) {
            conditionalStyle = {
              ...conditionalStyle,
              fontWeight: rule.style.bold ? 'bold' : conditionalStyle.fontWeight,
              fontStyle: rule.style.italic ? 'italic' : conditionalStyle.fontStyle,
              color: rule.style.textColor || conditionalStyle.color,
              backgroundColor: rule.style.bgColor || conditionalStyle.backgroundColor,
            };
          }
        } else if (rule.type === 'scale' && rule.scale) {
          const numVal = parseFloat(dispVal);
          if (!isNaN(numVal) && rule.scale.minValue !== undefined && rule.scale.maxValue !== undefined) {
             const min = rule.scale.minValue;
             const max = rule.scale.maxValue;
             const ratio = Math.max(0, Math.min(1, (numVal - min) / (max - min)));
             
             // Basic HEX interpolation
             const hexToRgb = (hex: string) => {
               const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
               return result ? {
                 r: parseInt(result[1], 16),
                 g: parseInt(result[2], 16),
                 b: parseInt(result[3], 16)
               } : { r: 255, g: 255, b: 255 };
             };
             
             const rgb1 = hexToRgb(rule.scale.minColor || '#ff0000');
             const rgb2 = hexToRgb(rule.scale.maxColor || '#00ff00');
             
             const r = Math.round(rgb1.r + (rgb2.r - rgb1.r) * ratio);
             const g = Math.round(rgb1.g + (rgb2.g - rgb1.g) * ratio);
             const b = Math.round(rgb1.b + (rgb2.b - rgb1.b) * ratio);
             
             conditionalStyle = {
               ...conditionalStyle,
               backgroundColor: `rgb(${r}, ${g}, ${b})`
             };
          }
        }
      }
    }

    // Default conditional styling (legacy or hardcoded)
    const valForDefault = parseFloat(dispVal);
    if (!isNaN(valForDefault) && valForDefault > 1000 && (!format.conditionalRules || format.conditionalRules.length === 0)) {
      conditionalStyle = { ...conditionalStyle, color: '#ef4444', fontWeight: 'bold' };
    }

    return {
      fontWeight: format.bold ? 'bold' : 'normal',
      fontStyle: format.italic ? 'italic' : 'normal',
      textDecoration: `${format.underline ? 'underline' : ''} ${format.strikethrough ? 'line-through' : ''}`.trim(),
      justifyContent: format.alignX === 'center' ? 'center' : format.alignX === 'right' ? 'flex-end' : 'flex-start',
      alignItems: format.alignY === 'top' ? 'flex-start' : format.alignY === 'bottom' ? 'flex-end' : 'center',
      whiteSpace: format.wrap === 'wrap' ? 'normal' : 'nowrap',
      overflow: format.wrap === 'clip' ? 'hidden' : 'visible',
      fontFamily: format.fontFamily || 'inherit',
      fontSize: format.fontSize ? `${format.fontSize}px` : '12px',
      color: format.textColor || 'inherit',
      backgroundColor: format.bgColor || 'transparent',
      borderTop: format.borderTop ? `${format.borderThickness || 2}px ${format.borderStyle || 'solid'} #10b981` : undefined,
      borderRight: format.borderRight ? `${format.borderThickness || 2}px ${format.borderStyle || 'solid'} #10b981` : undefined,
      borderBottom: format.borderBottom ? `${format.borderThickness || 2}px ${format.borderStyle || 'solid'} #10b981` : undefined,
      borderLeft: format.borderLeft ? `${format.borderThickness || 2}px ${format.borderStyle || 'solid'} #10b981` : undefined,
      ...conditionalStyle,
    };
  };

  useEffect(() => {
    if (activeFileInSheets) {
      setActiveFile(activeFileInSheets);
    }
  }, [activeFileInSheets]);

  useEffect(() => {
    // Global state mapping for GlassScript
    (window as any).GlassSheets = {
      state: sheetData,
      update: (newData: string[][]) => setSheetData(newData)
    };
    return () => { delete (window as any).GlassSheets; };
  }, [sheetData, setSheetData]);

  useEffect(() => {
    BridgeLib.registerApp('glasssheets', {
      getData: () => JSON.stringify(sheetData),
      setData: (data: string) => {
        try {
          const parsed = JSON.parse(data);
          setSheetData(parsed);
          addNotification('GlassSheets', 'Grid synced from Bridge', 'info');
        } catch (e) {}
      }
    });
    return () => BridgeLib.unregisterApp('glasssheets');
  }, [sheetData, setSheetData, addNotification]);

  const updateCell = (r: number, c: number, val: string) => {
    const format = cellFormats[`${r},${c}`];
    const validation = format?.validation;
    const { isValid, error } = validateCell(val, validation);

    if (!isValid && validation && !validation.allowInvalid) {
      addNotification('Sheets', error || 'Invalid input', 'error');
      return;
    }

    const newData = [...sheetData];
    newData[r] = [...newData[r]];
    newData[r][c] = val;
    setSheetData(newData);
  };

  const handleSave = () => {
    if (activeFile) {
      const fileObj = findItemByPath(fs, activeFile.path.concat(activeFile.name));
      if (fileObj && !checkPermission(fileObj, 'w', currentUser?.isAdmin)) {
        addNotification('Sheets', 'Permission denied: Cannot overwrite this file', 'error');
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

      const serializedData = JSON.stringify({ data: sheetData, formats: cellFormats });
      setFs((prev: FileSystemItem[]) => updateFileContent(prev, activeFile.path, activeFile.name, serializedData));
      setActiveFileInSheets(activeFile);
      addNotification('Sheets', `Saved ${activeFile.name}`, 'success');
    } else {
      setShowSaveDialog(true);
    }
    setActiveMenu(null);
  };

  const handleSaveAs = () => {
    if (!saveFileName.trim()) return;
    let fileName = saveFileName.endsWith('.gsheet') ? saveFileName : `${saveFileName}.gsheet`;
    const savePath = ['Documents'];

    const targetFolder = findItemByPath(fs, savePath);
    if (!targetFolder || !targetFolder.children) {
      addNotification('Sheets', 'Documents directory not found', 'error');
      return;
    }

    const serializedData = JSON.stringify({ data: sheetData, formats: cellFormats });
    const newFile: FileSystemItem = {
      name: fileName,
      type: 'file',
      content: serializedData,
      permissions: DEFAULT_PERMISSIONS
    };

    const updateFsRecursive = (items: FileSystemItem[], path: string[]): FileSystemItem[] => {
      if (path.length === 0) return [...items, newFile];
      const [first, ...rest] = path;
      return items.map(item => {
        if (item.name === first && item.type === 'folder' && item.children) {
          return { ...item, children: updateFsRecursive(item.children || [], rest) };
        }
        return item;
      });
    };

    setFs((prev: FileSystemItem[]) => updateFsRecursive(prev, savePath));
    setActiveFile({ name: fileName, path: savePath });
    setActiveFileInSheets({ name: fileName, path: savePath });
    setShowSaveDialog(false);
    addNotification('Sheets', `Document saved as ${fileName} in Documents`, 'success');
  };

  const handleOpen = (file: FileSystemItem, path: string[]) => {
    if (file.type === 'file' && file.content) {
      try {
        const parsed = JSON.parse(file.content);
        if (parsed.data && parsed.formats) {
          setSheetData(parsed.data);
          setCellFormats(parsed.formats);
        } else {
          // Legacy support
          setSheetData(parsed);
          setCellFormats({});
        }
        setActiveFile({ name: file.name, path });
        setActiveFileInSheets({ name: file.name, path });
        setShowOpenDialog(false);
        addNotification('Sheets', `Opened ${file.name}`, 'info');
      } catch (e) {
        addNotification('Sheets', 'Failed to parse .gsheet file', 'error');
      }
    }
  };

  const handlePrint = () => {
    const filename = activeFile ? activeFile.name : 'Untitled Sheet.gsheet';
    const newJob: PrintJob = {
      id: Math.random().toString(36).substr(2, 9),
      documentName: filename,
      filename,
      status: 'printing',
      timestamp: new Date().toLocaleTimeString(),
      owner: userName || 'Administrator'
    };
    setPrintQueue((prev: PrintJob[]) => [...prev, newJob]);
    addNotification('Print Manager', `Sending "${filename}" to printer...`, 'info');
    
    setTimeout(() => {
      setPrintQueue((prev: PrintJob[]) => 
        prev.map(job => job.id === newJob.id ? { ...job, status: 'completed' } : job)
      );
      addNotification('Print Manager', `Finished printing "${filename}"`, 'success');
    }, 5000);
    setActiveMenu(null);
  };

  const headers = Array(10).fill(0).map((_, i) => String.fromCharCode(65 + i));

  // --- Formula Logic ---
  const getCellCoords = (ref: string): [number, number] | null => {
    const match = ref.match(/([A-Z]+)([0-9]+)/);
    if (!match) return null;
    const col = match[1].charCodeAt(0) - 65;
    const row = parseInt(match[2]) - 1;
    return [row, col];
  };

  const getCellValue = (ref: string, data: string[][], visited = new Set<string>()): number => {
    const coords = getCellCoords(ref);
    if (!coords) return 0;
    const [r, c] = coords;
    if (r < 0 || r >= data.length || c < 0 || c >= data[0].length) return 0;
    
    // Circular reference guard
    const cellId = `${r},${c}`;
    if (visited.has(cellId)) return 0;
    
    const content = data[r][c];
    if (content.startsWith('=')) {
      const newVisited = new Set(visited);
      newVisited.add(cellId);
      return evaluateFormula(content.substring(1), data, newVisited);
    }
    const val = parseFloat(content);
    return isNaN(val) ? 0 : val;
  };

  const evaluateFormula = (formula: string, data: string[][], visited = new Set<string>()): number => {
    try {
      let f = formula.toUpperCase().replace(/\s+/g, '');
      
      // Handle Ranges: SUM(A1:B2)
      f = f.replace(/SUM\(([A-Z][0-9]+):([A-Z][0-9]+)\)/g, (_, start, end) => {
        const s = getCellCoords(start);
        const e = getCellCoords(end);
        if (!s || !e) return '0';
        let sum = 0;
        for (let r = Math.min(s[0], e[0]); r <= Math.max(s[0], e[0]); r++) {
          for (let c = Math.min(s[1], e[1]); c <= Math.max(s[1], e[1]); c++) {
            const content = data[r][c];
            if (content.startsWith('=')) {
              sum += evaluateFormula(content.substring(1), data, new Set([...visited, `${r},${c}`]));
            } else {
              const val = parseFloat(content);
              sum += isNaN(val) ? 0 : val;
            }
          }
        }
        return sum.toString();
      });

      // Simple AVG
      f = f.replace(/AVG\(([A-Z][0-9]+):([A-Z][0-9]+)\)/g, (_, start, end) => {
        const s = getCellCoords(start);
        const e = getCellCoords(end);
        if (!s || !e) return '0';
        let sum = 0;
        let count = 0;
        for (let r = Math.min(s[0], e[0]); r <= Math.max(s[0], e[0]); r++) {
          for (let c = Math.min(s[1], e[1]); c <= Math.max(s[1], e[1]); c++) {
            const content = data[r][c];
            if (content.startsWith('=')) {
              sum += evaluateFormula(content.substring(1), data, new Set([...visited, `${r},${c}`]));
            } else {
              const val = parseFloat(content);
              sum += isNaN(val) ? 0 : val;
            }
            count++;
          }
        }
        return count === 0 ? '0' : (sum / count).toString();
      });

      // Resolve Single Cell References
      f = f.replace(/[A-Z][0-9]+/g, (match) => {
        return getCellValue(match, data, visited).toString();
      });

      // Basic Math Evaluation (using Function for simple safety)
      // Only allows digits, operators, and decimal points
      if (/^[0-9+\-*/().]+$/.test(f)) {
        try {
          // eslint-disable-next-line no-eval
          const result = eval(f);
          if (typeof result === 'number' && !isNaN(result) && isFinite(result)) {
            return result;
          }
          return 0;
        } catch (e) {
          return 0;
        }
      }
      return 0;
    } catch (e) {
      return 0;
    }
  };

  const getDisplayValue = (r: number, c: number) => {
    const content = sheetData[r][c];
    if (content && content.toString().startsWith('=')) {
      // Don't evaluate if we are currently editing the cell
      if (activeCell?.[0] === r && activeCell?.[1] === c) return content;
      const val = evaluateFormula(content.substring(1), sheetData);
      
      // If evaluateFormula somehow returns NaN or the result is invalid
      if (typeof val !== 'number' || isNaN(val)) return '#ERROR!';
      
      return val === 0 && content !== '=0' && !content.includes('0') ? '0' : val.toString();
    }
    return content;
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!activeCell) return;
    const [r, c] = activeCell;
    const cellId = `${r},${c}`;

    if (e.ctrlKey || e.metaKey) {
      if (e.key === 'b') { e.preventDefault(); updateFormat({ bold: !cellFormats[cellId]?.bold }); }
      if (e.key === 'i') { e.preventDefault(); updateFormat({ italic: !cellFormats[cellId]?.italic }); }
      if (e.key === 'u') { e.preventDefault(); updateFormat({ underline: !cellFormats[cellId]?.underline }); }
    }
    
    if (e.key === 'ArrowUp' && r > 0) setActiveCell([r - 1, c]);
    if (e.key === 'ArrowDown' && r < sheetData.length - 1) setActiveCell([r + 1, c]);
    if (e.key === 'ArrowLeft' && c > 0) setActiveCell([r, c - 1]);
    if (e.key === 'ArrowRight' && c < headers.length - 1) setActiveCell([r, c + 1]);
    if (e.key === 'Enter') {
      if (r < sheetData.length - 1) setActiveCell([r + 1, c]);
    }
    if (e.key === 'Tab') {
      e.preventDefault();
      if (e.shiftKey) {
        if (c > 0) setActiveCell([r, c - 1]);
      } else {
        if (c < headers.length - 1) setActiveCell([r, c + 1]);
      }
    }
  };

  const menuItems = {
    file: [
      { label: 'New Sheet', shortcut: 'Ctrl+N', action: () => { 
        setSheetData(DEFAULT_SHEET_DATA.map(row => [...row])); 
        setActiveFile(null); 
        setActiveFileInSheets(null); 
        addNotification('Sheets', 'New sheet created', 'success');
      } },
      { label: 'Open...', shortcut: 'Ctrl+O', action: () => setShowOpenDialog(true) },
      { label: 'Save', shortcut: 'Ctrl+S', action: handleSave },
      { label: 'Save As...', action: () => setShowSaveDialog(true) },
      { label: 'Print', shortcut: 'Ctrl+P', action: handlePrint },
    ],
    edit: [
      { label: 'Undo', shortcut: 'Ctrl+Z', action: () => addNotification('Sheets', 'Undo not yet implemented', 'info') },
      { label: 'Redo', shortcut: 'Ctrl+Y', action: () => addNotification('Sheets', 'Redo not yet implemented', 'info') },
      { label: 'Cut', shortcut: 'Ctrl+X', action: () => addNotification('Sheets', 'Cut not yet implemented', 'info') },
      { label: 'Copy', shortcut: 'Ctrl+C', action: () => addNotification('Sheets', 'Copy not yet implemented', 'info') },
      { label: 'Paste', shortcut: 'Ctrl+V', action: () => addNotification('Sheets', 'Paste not yet implemented', 'info') },
      { label: 'Clear All', action: () => setSheetData(DEFAULT_SHEET_DATA.map(row => row.map(() => ''))) },
    ],
    format: [
      { label: 'Bold', shortcut: 'Ctrl+B', action: () => updateFormat({ bold: !cellFormats[`${activeCell?.[0]},${activeCell?.[1]}`]?.bold }) },
      { label: 'Italic', shortcut: 'Ctrl+I', action: () => updateFormat({ italic: !cellFormats[`${activeCell?.[0]},${activeCell?.[1]}`]?.italic }) },
      { label: 'Underline', shortcut: 'Ctrl+U', action: () => updateFormat({ underline: !cellFormats[`${activeCell?.[0]},${activeCell?.[1]}`]?.underline }) },
      { label: 'Conditional Formatting', icon: <Sparkles size={14} />, action: () => setShowConditionalDialog(true) },
      { label: 'Number Format', action: () => updateFormat({ type: 'number', precision: 2 }) },
      { label: 'Currency', action: () => updateFormat({ type: 'currency' }) },
      { label: 'Percentage', action: () => updateFormat({ type: 'percent' }) },
      { label: 'Scientific', action: () => updateFormat({ type: 'sci' }) },
    ],
    tools: [
      { label: 'Data Validation', icon: <ShieldCheck size={14} />, action: () => setShowValidationDialog(true) },
      { label: 'Script Editor', action: () => openWindow('codestudio', 'Code Studio') },
      { label: 'Run Script...', icon: <Play size={14} />, action: () => setShowScriptPicker(true) },
    ],
    graph: [
      { label: 'WORK GRAPHS', type: 'header' },
      { label: 'Clustered Column', icon: <BarChart3 size={14} />, action: () => setActiveChart('Clustered Column') },
      { label: 'Waterfall Chart', icon: <Activity size={14} />, action: () => setActiveChart('Waterfall Chart') },
      { label: 'Combo Chart', icon: <Presentation size={14} />, action: () => setActiveChart('Combo Chart') },
      { label: 'Box & Whisker', icon: <BoxIcon size={14} />, action: () => setActiveChart('Box & Whisker') },
      { label: 'PivotChart', icon: <Filter size={14} />, action: () => setActiveChart('PivotChart') },
      { label: 'Gantt Chart', icon: <GanttChartSquare size={14} />, action: () => setActiveChart('Gantt Chart') },
      { label: 'PERSONAL GRAPHS', type: 'header' },
      { label: 'Line Chart', icon: <LineChartIcon size={14} />, action: () => setActiveChart('Line Chart') },
      { label: 'Stacked Area', icon: <AreaChartIcon size={14} />, action: () => setActiveChart('Stacked Area') },
      { label: 'Heat Map', icon: <Grid3X3 size={14} />, action: () => setActiveChart('Heat Map') },
      { label: 'Doughnut Chart', icon: <PieChartIcon size={14} />, action: () => setActiveChart('Doughnut Chart') },
      { label: 'Radar Chart', icon: <RadarIcon size={14} />, action: () => setActiveChart('Radar Chart') },
      { label: 'PRESENTATION GRAPHS', type: 'header' },
      { label: 'Icon Chart', icon: <UserIcon size={14} />, action: () => setActiveChart('Icon Chart') },
      { label: 'KPI Card', icon: <Target size={14} />, action: () => setActiveChart('KPI Card') },
      { label: 'Bubble Chart', icon: <Binary size={14} />, action: () => setActiveChart('Bubble Chart') },
      { label: 'Funnel Chart', icon: <ListFilter size={14} />, action: () => setActiveChart('Funnel Chart') },
      { label: 'Treemap', icon: <TreemapIcon size={14} />, action: () => setActiveChart('Treemap') },
    ]
  };

  return (
    <div className="h-full flex flex-col bg-white text-[#1a1a1a] font-sans selection:bg-emerald-100 relative">
      {/* Menu Bar */}
      <AnimatePresence>
        {showScriptPicker && (
          <ScriptPicker 
            fs={fs} 
            onClose={() => setShowScriptPicker(false)}
            onSelect={(content, name) => {
              setShowScriptPicker(false);
              if (name.endsWith('.scr') || name.endsWith('.txt')) {
                runGlassScript(content);
              } else if (name.endsWith('.b')) {
                runBrainscript(content, (msg: string) => addNotification('Brainscript', msg, 'info'));
              }
            }}
          />
        )}
      </AnimatePresence>

      <div className="h-8 bg-gray-50 border-b border-gray-200 flex items-center px-4 gap-2 z-[70] shrink-0 select-none">
        {(Object.keys(menuItems) as Array<keyof typeof menuItems>).map((menu) => (
          <div key={menu} className="relative">
            <button 
              onClick={() => setActiveMenu(activeMenu === menu ? null : menu)}
              onMouseEnter={() => activeMenu && setActiveMenu(menu)}
              className={cn(
                "px-3 py-1 rounded text-[11px] font-bold uppercase tracking-tight transition-all",
                activeMenu === menu ? "bg-emerald-600 text-white" : "text-gray-500 hover:bg-gray-200"
              )}
            >
              {menu}
            </button>
            <AnimatePresence>
              {activeMenu === menu && (
                <>
                  <div className="fixed inset-0" onClick={() => setActiveMenu(null)} />
                  <motion.div 
                    initial={{ opacity: 0, y: 5 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 5 }}
                    className="absolute top-full left-0 min-w-48 bg-white border border-gray-200 rounded-xl shadow-2xl py-2 mt-1 z-[100] overflow-hidden"
                  >
                    {menuItems[menu].map((item: any, idx: number) => (
                      item.type === 'header' ? (
                        <div key={idx} className="px-4 py-1.5 text-[8px] font-black text-gray-400 uppercase tracking-[0.2em] bg-gray-50/50 mt-1 first:mt-0 italic-font">
                          {item.label}
                        </div>
                      ) : (
                        <button 
                          key={idx}
                          onClick={() => {
                            if (item.action) item.action();
                            else addNotification('Sheets', `Action triggered: ${item.label}`, 'info');
                            setActiveMenu(null);
                          }}
                          className="w-full text-left px-4 py-2 text-[11px] font-medium text-gray-700 hover:bg-emerald-50 hover:text-emerald-700 flex items-center justify-between group transition-colors"
                        >
                          <div className="flex items-center gap-3">
                            <span className="text-gray-400 group-hover:text-emerald-600 transition-colors">{item.icon}</span>
                            <span>{item.label}</span>
                          </div>
                          {item.shortcut && <span className="text-[9px] text-gray-300 group-hover:text-emerald-300">{item.shortcut}</span>}
                        </button>
                      )
                    ))}
                  </motion.div>
                </>
              )}
            </AnimatePresence>
          </div>
        ))}
      </div>

      {/* App Header */}
      <div className="p-4 border-b border-gray-200 flex items-center justify-between bg-white z-10 shrink-0 shadow-sm">
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 rounded-xl bg-emerald-600 flex items-center justify-center text-white shadow-lg shadow-emerald-200">
            <TableIcon size={20} />
          </div>
          <div>
            <h2 className="text-xl font-bold tracking-tight text-gray-900">{activeFile ? activeFile.name : 'Glass Sheets Pro'}</h2>
            <div className="flex items-center gap-2 text-[9px] uppercase font-bold tracking-widest text-emerald-600">
              <Activity size={10} /> Live Relational Link
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2 border-l border-gray-100 pl-4">
          <button className="p-2 hover:bg-gray-100 rounded-lg text-gray-500 transition-colors" title="Add Row" onClick={() => setSheetData([...sheetData, Array(headers.length).fill('')])}><Rows size={18} /></button>
          <button className="p-2 hover:bg-gray-100 rounded-lg text-gray-500 transition-colors" title="Add Column" onClick={() => setSheetData(sheetData.map(row => [...row, '']))}><Columns size={18} /></button>
          <button className="p-2 hover:bg-gray-100 rounded-lg text-gray-500 transition-colors" onClick={handleSave}><Save size={18} /></button>
          <button className="bg-emerald-600 text-white px-4 py-2 rounded-xl text-xs font-bold ml-2 shadow-lg shadow-emerald-200 flex items-center gap-2 hover:bg-emerald-700 transition-all" onClick={handlePrint}>
            <Printer size={14} /> Print
          </button>
        </div>
      </div>

      {/* Formula Bar */}
      <div className="p-2 bg-gray-50 border-b border-gray-200 flex items-center gap-3 shrink-0">
        <div className="bg-white border border-gray-200 rounded-lg px-3 py-1.5 text-xs font-mono font-bold text-gray-500">
          {activeCell ? `${String.fromCharCode(65 + activeCell[1])}${activeCell[0] + 1}` : 'A1'}
        </div>
        <div className="flex-1 flex items-center px-4 py-1.5 rounded-lg border border-gray-200 bg-white focus-within:ring-2 ring-emerald-500/20 transition-all">
          <span className="text-gray-400 font-mono text-sm mr-3 italic italic-font">fx</span>
          <input 
            type="text" 
            className="w-full focus:outline-none text-sm font-medium" 
            placeholder="Enter value or formula..."
            value={activeCell ? sheetData[activeCell[0]][activeCell[1]] : ''}
            onChange={(e) => activeCell && updateCell(activeCell[0], activeCell[1], e.target.value)}
          />
        </div>
      </div>

      <FormattingToolbar activeCell={activeCell} cellFormats={cellFormats} updateFormat={updateFormat} />

      <div className="flex-1 overflow-auto bg-gray-100 relative custom-scrollbar">
        <table className="border-collapse table-fixed w-full bg-white select-none">
          <thead>
            <tr className="sticky top-0 z-20 shadow-sm text-left">
              <th className="w-12 bg-gray-200 border-r border-b border-gray-300 text-[10px] text-gray-500 font-bold p-1 italic-font text-center">#</th>
              {headers.map((h, i) => (
                <th key={h} className="w-32 bg-gray-100 border-r border-b border-gray-300 text-[10px] text-gray-500 font-bold p-2 uppercase tracking-tight">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {sheetData.map((row, rIdx) => (
              <tr key={rIdx}>
                <td className="bg-gray-100 border-r border-b border-gray-300 text-center text-[10px] text-gray-400 font-bold font-mono">{rIdx + 1}</td>
                {row.map((cell, cIdx) => {
                  const isActive = activeCell?.[0] === rIdx && activeCell?.[1] === cIdx;
                  const isInRange = selectionRange && (() => {
                    const rStart = Math.min(selectionRange.start[0], selectionRange.end[0]);
                    const rEnd = Math.max(selectionRange.start[0], selectionRange.end[0]);
                    const cStart = Math.min(selectionRange.start[1], selectionRange.end[1]);
                    const cEnd = Math.max(selectionRange.start[1], selectionRange.end[1]);
                    return rIdx >= rStart && rIdx <= rEnd && cIdx >= cStart && cIdx <= cEnd;
                  })();

                  return (
                    <td 
                      key={cIdx} 
                      onClick={(e) => {
                        if (e.shiftKey && activeCell) {
                          setSelectionRange({ start: activeCell, end: [rIdx, cIdx] });
                        } else {
                          setActiveCell([rIdx, cIdx]);
                          setSelectionRange(null);
                          setIsEditing(false);
                        }
                      }}
                      onDoubleClick={() => setIsEditing(true)}
                      className={cn(
                        "border-r border-b border-gray-200 h-10 p-0 relative group transition-colors",
                        isActive && "ring-2 ring-inset ring-emerald-500 z-10 bg-emerald-50/20",
                        isInRange && "bg-emerald-600/10 ring-1 ring-inset ring-emerald-500/30",
                        !isActive && !isInRange && "hover:bg-gray-50/50"
                      )}
                    >
                      {isActive && isEditing ? (
                        cellFormats[`${rIdx},${cIdx}`]?.validation?.type === 'list' ? (
                          <div className="absolute inset-0 bg-white z-20 flex items-center p-0.5">
                            <select
                              autoFocus
                              className="w-full h-full text-xs font-medium border-none outline-none bg-emerald-50 rounded"
                              value={cell}
                              onChange={(e) => {
                                updateCell(rIdx, cIdx, e.target.value);
                                setIsEditing(false);
                              }}
                              onBlur={() => setIsEditing(false)}
                            >
                              <option value="">Select...</option>
                              {cellFormats[`${rIdx},${cIdx}`]?.validation?.listValues?.map(opt => (
                                <option key={opt} value={opt}>{opt}</option>
                              ))}
                            </select>
                          </div>
                        ) : (
                          <input 
                            autoFocus
                            type="text"
                            className="w-full h-full px-3 text-xs focus:outline-none bg-white font-medium shadow-inner"
                            style={getCellStyle(rIdx, cIdx)}
                            value={cell}
                            onChange={(e) => {
                              const newData = [...sheetData];
                              newData[rIdx] = [...newData[rIdx]];
                              newData[rIdx][cIdx] = e.target.value;
                              setSheetData(newData);
                            }}
                            onBlur={() => {
                              updateCell(rIdx, cIdx, cell);
                              setIsEditing(false);
                            }}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') {
                                updateCell(rIdx, cIdx, cell);
                                setIsEditing(false);
                              }
                              if (e.key === 'Escape') setIsEditing(false);
                              handleKeyDown(e);
                            }}
                          />
                        )
                      ) : (
                        <div 
                          tabIndex={0}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') setIsEditing(true);
                            else if (e.key.length === 1 && !e.ctrlKey && !e.metaKey) {
                              setIsEditing(true);
                              updateCell(rIdx, cIdx, ''); // Start typing fresh
                            }
                            handleKeyDown(e);
                          }}
                          className="w-full h-full px-3 text-xs flex font-medium outline-none cursor-cell select-text overflow-hidden relative group/cell"
                          style={getCellStyle(rIdx, cIdx)}
                          onClick={() => setActiveCell([rIdx, cIdx])}
                          onDoubleClick={() => setIsEditing(true)}
                        >
                          <span className={cn("truncate", cell && cell.toString().startsWith('=') && "text-emerald-700 font-bold")}>
                            {getFormattedValue(getDisplayValue(rIdx, cIdx), cellFormats[`${rIdx},${cIdx}`])}
                          </span>
                          
                          {/* Validation Indicators */}
                          {cellFormats[`${rIdx},${cIdx}`]?.validation?.type === 'list' && (
                            <ChevronDown size={10} className="absolute right-1 top-1/2 -translate-y-1/2 text-gray-300 group-hover/cell:text-emerald-500" />
                          )}
                          
                          {cellFormats[`${rIdx},${cIdx}`]?.validation?.type && cellFormats[`${rIdx},${cIdx}`]?.validation?.type !== 'none' && (
                            !validateCell(cell, cellFormats[`${rIdx},${cIdx}`]?.validation).isValid && (
                              <div className="absolute top-0 right-0 w-0 h-0 border-t-[6px] border-l-[6px] border-t-red-500 border-l-transparent" title={validateCell(cell, cellFormats[`${rIdx},${cIdx}`]?.validation).error} />
                            )
                          )}
                        </div>
                      )}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Sheets Meta Bar */}
      <div className="h-10 bg-gray-50 border-t border-gray-200 px-6 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1.5 px-2 py-0.5 rounded bg-emerald-100 text-emerald-700 text-[9px] font-bold uppercase tracking-widest">
            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            Connected
          </div>
          <span className="text-[10px] text-gray-400 font-medium">Auto-calculating Cell Cluster Alpha</span>
        </div>
        <div className="flex items-center gap-4 text-[10px] text-gray-400 font-medium">
          <span>Row: {activeCell ? activeCell[0] + 1 : '-'}</span>
          <span>Col: {activeCell ? String.fromCharCode(65 + activeCell[1]) : '-'}</span>
          <span className="text-gray-300">|</span>
          <span>Total Cells: {(sheetData.length * (headers.length || 0)).toString()}</span>
        </div>
      </div>

      {/* Save Dialog */}
      <AnimatePresence>
        {showSaveDialog && (
          <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4 bg-black/40 backdrop-blur-[2px]">
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="w-96 glass-dark rounded-2xl border border-white/20 p-6 shadow-2xl"
            >
              <h3 className="text-sm font-bold text-white mb-4 uppercase tracking-widest">Save Sheet</h3>
              <input 
                autoFocus
                type="text"
                placeholder="filename.gsheet"
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white mb-6 outline-none focus:border-emerald-500/50"
                value={saveFileName}
                onChange={(e) => setSaveFileName(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSaveAs()}
              />
              <div className="flex justify-end gap-3">
                <button onClick={() => setShowSaveDialog(false)} className="px-4 py-2 text-xs font-bold text-white/40 hover:text-white transition-colors uppercase tracking-widest">Cancel</button>
                <button onClick={handleSaveAs} className="px-6 py-2 bg-emerald-600 text-white rounded-xl text-xs font-bold shadow-lg shadow-emerald-900/20 hover:bg-emerald-500 transition-all uppercase tracking-widest">Save</button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Open Dialog */}
      <AnimatePresence>
        {showOpenDialog && (
          <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4 bg-black/40 backdrop-blur-[2px]">
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="w-[480px] glass-dark rounded-2xl border border-white/20 p-6 shadow-2xl"
            >
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-sm font-bold text-white uppercase tracking-widest">Open Spreadsheet</h3>
                <button onClick={() => setShowOpenDialog(false)} className="text-white/20 hover:text-white"><X size={18} /></button>
              </div>
              <div className="space-y-2 max-h-64 overflow-y-auto pr-2 no-scrollbar">
                {(() => {
                  const docs = findItemByPath(fs, ['Documents'])?.children?.filter(i => i.name.endsWith('.gsheet'));
                  if (!docs || docs.length === 0) return <div className="py-12 text-center text-white/20 text-xs">No stylesheets found in /Documents</div>;
                  return docs.map(file => (
                    <button 
                      key={file.name}
                      onClick={() => handleOpen(file, ['Documents'])}
                      className="w-full flex items-center gap-4 p-3 rounded-xl hover:bg-white/5 border border-transparent hover:border-white/10 transition-all text-left group"
                    >
                      <div className="w-10 h-10 rounded-lg bg-emerald-500/10 flex items-center justify-center text-emerald-400">
                        <TableIcon size={20} />
                      </div>
                      <div className="flex flex-col">
                        <span className="text-sm font-medium text-white/80 group-hover:text-emerald-400 transition-colors uppercase tracking-tight">{file.name}</span>
                        <span className="text-[10px] text-white/20 truncate max-w-[280px]">Sheet Schema V1 • Last Modified recently</span>
                      </div>
                    </button>
                  ));
                })()}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {activeChart && (
        <SpreadsheetChart 
          type={activeChart} 
          data={sheetData} 
          onClose={() => setActiveChart(null)} 
        />
      )}

      {showValidationDialog && (
        <ValidationDialog 
          activeCell={activeCell} 
          cellFormats={cellFormats} 
          updateFormat={updateFormat} 
          onClose={() => setShowValidationDialog(false)} 
        />
      )}

      {showConditionalDialog && (
        <ConditionalFormattingDialog 
          activeCell={activeCell} 
          cellFormats={cellFormats} 
          updateFormat={updateFormat} 
          onClose={() => setShowConditionalDialog(false)} 
        />
      )}
    </div>
  );
}

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
    case 'glassword': return <GlassWordProcessor {...props} />;
    case 'printers': return <PrinterApp {...props} />;
    case 'calendar': return <CalendarApp {...props} />;
    case 'spreadsheet': return <SpreadsheetApp {...props} />;
    case 'glassmail': return <GlassMail {...props} />;
    case 'glassdatabase': return <GlassDatabase {...props} />;
    case 'glassmessaging': return <GlassMessaging {...props} />;
    case 'glassdraw': return <GlassDrawApp {...props} />;
    case 'glasspaint': return <GlassPaintApp {...props} />;
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

function SystemMonitorApp({ 
  cpuUsage, ramUsage, kernelCalls, networkTraffic, 
  networkNodes, authorizedTokens, networkConfig 
}: { 
  cpuUsage: number, ramUsage: number, kernelCalls: KernelCall[], 
  networkTraffic: TrafficEvent[], networkNodes: NetworkNode[], 
  authorizedTokens: OAuthToken[], networkConfig: NetworkConfig 
}) {
  const [activeTab, setActiveTab] = useState<'overview' | 'traffic' | 'kernel' | 'security' | 'hardware'>('overview');
  const [hwInfo, setHwInfo] = useState<SystemInfo | null>(null);

  useEffect(() => {
    if (activeTab === 'hardware') {
      nativeBridge.getSystemInfo().then(setHwInfo);
    }
  }, [activeTab]);

  return (
    <div className="h-full flex overflow-hidden bg-[#0a0c10]">
      {/* Surfshark-style Sidebar */}
      <div className="w-20 border-r border-white/5 flex flex-col items-center py-6 gap-8 bg-[#0d1117]">
        <button 
          onClick={() => setActiveTab('overview')}
          className={cn("p-3 rounded-2xl transition-all", activeTab === 'overview' ? "bg-blue-500 text-white shadow-lg shadow-blue-500/20" : "text-white/40 hover:text-white hover:bg-white/5")}
        >
          <LayoutGrid size={22} />
        </button>
        <button 
          onClick={() => setActiveTab('traffic')}
          className={cn("p-3 rounded-2xl transition-all", activeTab === 'traffic' ? "bg-blue-500 text-white shadow-lg shadow-blue-500/20" : "text-white/40 hover:text-white hover:bg-white/5")}
        >
          <ArrowLeftRight size={22} />
        </button>
        <button 
          onClick={() => setActiveTab('kernel')}
          className={cn("p-3 rounded-2xl transition-all", activeTab === 'kernel' ? "bg-blue-500 text-white shadow-lg shadow-blue-500/20" : "text-white/40 hover:text-white hover:bg-white/5")}
        >
          <TerminalIcon size={22} />
        </button>
        <button 
          onClick={() => setActiveTab('security')}
          className={cn("p-3 rounded-2xl transition-all", activeTab === 'security' ? "bg-blue-500 text-white shadow-lg shadow-blue-500/20" : "text-white/40 hover:text-white hover:bg-white/5")}
        >
          <Shield size={22} />
        </button>
        <button 
          onClick={() => setActiveTab('hardware')}
          className={cn("p-3 rounded-2xl transition-all", activeTab === 'hardware' ? "bg-blue-500 text-white shadow-lg shadow-blue-500/20" : "text-white/40 hover:text-white hover:bg-white/5")}
        >
          <Cpu size={22} />
        </button>
      </div>

      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <div className="h-16 px-8 border-b border-white/5 flex items-center justify-between bg-[#0d1117]/50 backdrop-blur-md">
          <div className="flex items-center gap-4">
            <h1 className="text-sm font-bold uppercase tracking-[0.2em] text-white/90">NOC Center</h1>
            <div className="px-2 py-0.5 rounded-full bg-green-500/10 border border-green-500/20 flex items-center gap-1.5">
              <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
              <span className="text-[10px] font-bold text-green-500 uppercase">Secure</span>
            </div>
          </div>
          <div className="flex items-center gap-6">
            <div className="flex flex-col items-end">
              <span className="text-[10px] text-white/30 uppercase font-bold tracking-wider">Local Host</span>
              <span className="text-xs text-blue-400 font-mono">{networkConfig.ip}</span>
            </div>
            <div className="w-[1px] h-8 bg-white/5" />
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-blue-500/10 flex items-center justify-center text-blue-400">
                <Globe size={16} />
              </div>
              <div className="flex flex-col">
                <span className="text-[10px] text-white/30 uppercase font-bold">Identity</span>
                <span className="text-[11px] text-white/70">{networkConfig.protocols.xmpp.jid}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Dynamic Content Area */}
        <div className="flex-1 overflow-y-auto p-8 no-scrollbar">
          {activeTab === 'overview' && (
            <div className="flex flex-col gap-8">
              {/* Connection Status Card */}
              <div className="bg-gradient-to-br from-blue-600 to-blue-800 rounded-[32px] p-8 flex items-center justify-between shadow-2xl relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-[80px] -mr-32 -mt-32 transition-transform group-hover:scale-110" />
                <div className="relative z-10 flex flex-col gap-2">
                  <h2 className="text-white/60 text-xs font-bold uppercase tracking-widest">Global Status</h2>
                  <p className="text-3xl font-extrabold text-white">All Systems Nominal</p>
                  <p className="text-blue-100/60 text-xs mt-2 font-medium">Protecting 3 active nodes via OAuth2 Auth-Backbone</p>
                </div>
                <div className="relative z-10 w-20 h-20 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center border border-white/30">
                  <Zap size={32} className="text-white fill-white" />
                </div>
              </div>

              {/* Resource Grid */}
              <div className="grid grid-cols-3 gap-6">
                <div className="bg-[#161b22] border border-white/5 p-6 rounded-3xl flex flex-col gap-4">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] text-white/30 uppercase font-bold">Encrypted Packets</span>
                    <Radio size={14} className="text-blue-500" />
                  </div>
                  <div className="flex items-end gap-2">
                    <span className="text-2xl font-bold text-white">41.2</span>
                    <span className="text-white/30 text-xs pb-1">MB/s</span>
                  </div>
                  <div className="h-1 bg-white/5 rounded-full overflow-hidden">
                    <motion.div 
                      animate={{ width: ['20%', '60%', '40%', '80%', '50%'] }} 
                      transition={{ duration: 4, repeat: Infinity }} 
                      className="h-full bg-blue-500" 
                    />
                  </div>
                </div>
                
                <div className="bg-[#161b22] border border-white/5 p-6 rounded-3xl flex flex-col gap-4">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] text-white/30 uppercase font-bold">Kernel Load</span>
                    <Cpu size={14} className="text-purple-500" />
                  </div>
                  <div className="flex items-end gap-2">
                    <span className="text-2xl font-bold text-white">{cpuUsage.toString()}%</span>
                  </div>
                  <div className="h-1 bg-white/5 rounded-full overflow-hidden">
                    <div className="h-full bg-purple-500 transition-all duration-500" style={{ width: `${cpuUsage}%` }} />
                  </div>
                </div>

                <div className="bg-[#161b22] border border-white/5 p-6 rounded-3xl flex flex-col gap-4">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] text-white/30 uppercase font-bold">Memory Pulse</span>
                    <Activity size={14} className="text-emerald-500" />
                  </div>
                  <div className="flex items-end gap-2">
                    <span className="text-2xl font-bold text-white">{ramUsage.toString()}%</span>
                  </div>
                  <div className="h-1 bg-white/5 rounded-full overflow-hidden">
                    <div className="h-full bg-emerald-500 transition-all duration-500" style={{ width: `${ramUsage}%` }} />
                  </div>
                </div>
              </div>

              {/* Active Nodes Map-ish List */}
              <div className="flex flex-col gap-4">
                <h3 className="text-[10px] text-white/30 uppercase font-bold tracking-[0.2em]">Discovered Nodes</h3>
                <div className="grid grid-cols-1 gap-3">
                  {networkNodes.map(node => (
                    <div key={node.id} className="bg-[#161b22] border border-white/5 p-4 rounded-2xl flex items-center justify-between hover:bg-white/5 transition-colors group">
                      <div className="flex items-center gap-4">
                        <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center", node.status === 'online' ? "bg-blue-500/10 text-blue-400" : "bg-red-500/10 text-red-400")}>
                          <Server size={18} />
                        </div>
                        <div className="flex flex-col">
                          <span className="text-xs font-bold text-white/90">{node.hostname}</span>
                          <span className="text-[10px] text-white/30 font-mono">{node.ip}</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-6">
                        <div className="flex flex-col items-end">
                          <span className="text-[9px] text-white/20 uppercase font-bold">Security</span>
                          {node.isAuthorized ? (
                            <span className="text-[10px] text-emerald-400 font-bold flex items-center gap-1">
                              <Lock size={10} /> Authorized
                            </span>
                          ) : (
                            <span className="text-[10px] text-orange-400 font-bold flex items-center gap-1">
                              <Unlock size={10} /> Public
                            </span>
                          )}
                        </div>
                        <div className={cn("px-2 py-1 rounded-md text-[9px] font-bold uppercase", node.status === 'online' ? "bg-blue-500/10 text-blue-400" : "bg-red-500/10 text-red-400")}>
                          {node.status}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'traffic' && (
            <div className="flex flex-col gap-6">
              <h3 className="text-[10px] text-white/30 uppercase font-bold tracking-[0.2em]">Live Traffic Stream</h3>
              <div className="bg-[#161b22] rounded-3xl border border-white/5 overflow-hidden flex flex-col">
                <div className="grid grid-cols-6 p-4 bg-white/2 border-b border-white/5 text-[9px] font-bold text-white/30 uppercase">
                  <span>Timestamp</span>
                  <span>Protocol</span>
                  <span className="col-span-2">Endpoint Trace</span>
                  <span>Size</span>
                  <span>Status</span>
                </div>
                <div className="flex-1 overflow-y-auto no-scrollbar max-h-[500px]">
                  {networkTraffic.map(t => (
                    <div key={t.id} className="grid grid-cols-6 p-4 border-b border-white/2 text-[11px] items-center group hover:bg-white/2 transition-colors">
                      <span className="text-white/20 font-mono">{t.timestamp}</span>
                      <span className={cn(
                        "font-bold",
                        t.protocol === 'gRPC' ? "text-purple-400" :
                        t.protocol === 'XMPP' ? "text-blue-400" :
                        t.protocol === 'mDNS' ? "text-orange-400" : "text-white/50"
                      )}>{t.protocol}</span>
                      <div className="col-span-2 flex items-center gap-2">
                        <span className="truncate max-w-[100px] text-white/60">{t.source}</span>
                        <ArrowLeftRight size={10} className="text-white/10" />
                        <span className="truncate max-w-[100px] text-blue-400/80">{t.destination}</span>
                      </div>
                      <span className="text-white/30 font-mono">{t.size}</span>
                      <div className="flex items-center gap-2">
                        <div className="w-1 h-1 rounded-full bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.8)]" />
                        <span className="text-blue-400/60 text-[10px] font-bold uppercase">Routed</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'kernel' && (
            <div className="flex flex-col gap-6">
              <h3 className="text-[10px] text-white/30 uppercase font-bold tracking-[0.2em]">Kernel API Calls</h3>
              <div className="grid grid-cols-1 gap-3">
                {kernelCalls.map(call => (
                  <div key={call.id} className="bg-[#161b22] p-4 rounded-2xl border border-white/5 flex items-center justify-between group hover:border-white/10 transition-all">
                    <div className="flex items-center gap-4">
                      <div className={cn(
                        "w-10 h-10 rounded-xl flex items-center justify-center",
                        call.status === 'success' ? "bg-emerald-500/10 text-emerald-400" :
                        call.status === 'warning' ? "bg-orange-500/10 text-orange-400" : "bg-red-500/10 text-red-400"
                      )}>
                        <Command size={18} />
                      </div>
                      <div className="flex flex-col">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold text-white/90">{call.service}</span>
                          <span className="text-[10px] text-white/20">::</span>
                          <span className="text-xs text-blue-400/80 font-mono">{call.method}</span>
                        </div>
                        <span className="text-[9px] text-white/30 font-mono">{call.id} • {call.timestamp}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-6">
                      <div className="flex flex-col items-end">
                        <span className="text-[9px] text-white/20 uppercase font-bold">Latency</span>
                        <span className="text-[11px] font-mono text-white/50">{call.latency.toString()}ms</span>
                      </div>
                      <div className={cn(
                        "px-2 py-1 rounded text-[9px] font-bold uppercase",
                        call.status === 'success' ? "bg-emerald-500/10 text-emerald-400" :
                        call.status === 'warning' ? "bg-orange-500/10 text-orange-400" : "bg-red-500/10 text-red-400"
                      )}>
                        {call.status}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'security' && (
            <div className="flex flex-col gap-8">
              <div className="grid grid-cols-2 gap-8">
                <div className="flex flex-col gap-4">
                  <h3 className="text-[10px] text-white/30 uppercase font-bold tracking-[0.2em]">Active OAuth2 Grants</h3>
                  <div className="bg-[#161b22] border border-white/5 rounded-3xl p-6 flex flex-col gap-6">
                    {authorizedTokens.length === 0 ? (
                      <div className="py-12 flex flex-col items-center justify-center gap-3 opacity-20">
                        <Lock size={48} />
                        <p className="text-xs font-medium uppercase tracking-widest">No Active Grants</p>
                      </div>
                    ) : (
                      authorizedTokens.map((token, i) => (
                        <div key={i} className="flex flex-col gap-3 p-4 bg-white/2 rounded-2xl border border-white/5">
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-bold text-blue-400">{networkNodes.find(n => n.id === token.nodeId)?.hostname}</span>
                            <span className="text-[9px] text-white/20 font-mono">ID: {token.nodeId}</span>
                          </div>
                          <div className="flex flex-wrap gap-2">
                            {token.scope.map(s => (
                              <span key={s} className="px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-400 text-[8px] font-bold uppercase tracking-tighter">
                                {s}
                              </span>
                            ))}
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>

                <div className="flex flex-col gap-4">
                  <h3 className="text-[10px] text-white/30 uppercase font-bold tracking-[0.2em]">Security Protocol Health</h3>
                  <div className="grid grid-cols-1 gap-4">
                    <div className="bg-[#161b22] border border-white/5 p-6 rounded-3xl flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-full bg-blue-500/10 flex items-center justify-center text-blue-400">
                          <Lock size={18} />
                        </div>
                        <div className="flex flex-col">
                          <span className="text-xs font-bold">XMPP Encryption</span>
                          <span className="text-[10px] text-white/30">TLS 1.3 + OMEMO</span>
                        </div>
                      </div>
                      <div className="w-12 h-6 rounded-full bg-emerald-500/20 border border-emerald-500/30 flex items-center px-1">
                        <div className="w-4 h-4 rounded-full bg-emerald-500 ml-auto" />
                      </div>
                    </div>
                    
                    <div className="bg-[#161b22] border border-white/5 p-6 rounded-3xl flex items-center justify-between opacity-50">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-white/30">
                          <Eye size={18} />
                        </div>
                        <div className="flex flex-col">
                          <span className="text-xs font-bold">Stealth Mode</span>
                          <span className="text-[10px] text-white/30">IP Obfuscation</span>
                        </div>
                      </div>
                      <div className="w-12 h-6 rounded-full bg-white/5 border border-white/10 flex items-center px-1">
                        <div className="w-4 h-4 rounded-full bg-white/10" />
                      </div>
                    </div>

                    <div className="bg-[#161b22] border border-white/5 p-6 rounded-[32px] mt-4">
                      <div className="flex items-center gap-4 mb-4">
                        <div className="w-12 h-12 rounded-2xl bg-orange-500/10 flex items-center justify-center text-orange-400">
                          <Shield size={24} />
                        </div>
                        <div>
                          <p className="text-xs font-bold">Root Authentication</p>
                          <p className="text-[10px] text-white/30">Biometric + OAuth2 MFA Required</p>
                        </div>
                      </div>
                      <button className="w-full py-3 bg-white/5 hover:bg-white/10 rounded-2xl text-[10px] font-bold uppercase tracking-widest text-white/40 transition-all border border-white/5">
                        Refresh Security Tokens
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'hardware' && (
            <div className="flex flex-col gap-8 opacity-0 animate-[fade-in_0.3s_ease-out_forwards]" style={{ animationDelay: '0.1s' }}>
              <div className="grid grid-cols-2 gap-8">
                <div className="flex flex-col gap-4">
                  <h3 className="text-[10px] text-white/30 uppercase font-bold tracking-[0.2em]">Hardware Abstraction Layer (HAL)</h3>
                  <div className="bg-[#161b22] border border-white/5 rounded-3xl p-8 flex flex-col gap-8 relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-8">
                      <Cpu size={48} className="text-blue-500/10" />
                    </div>
                    {hwInfo ? (
                      <div className="space-y-6">
                        <div className="flex flex-col gap-1">
                          <span className="text-[10px] text-white/20 uppercase font-bold">System Architecture</span>
                          <span className="text-xl font-bold text-white font-mono tracking-tight">{hwInfo.arch} {hwInfo.platform} v1.0.0</span>
                        </div>
                        <div className="grid grid-cols-2 gap-6">
                          <div className="flex flex-col gap-1">
                            <span className="text-[10px] text-white/20 uppercase font-bold">Central Processing</span>
                            <span className="text-sm font-bold text-blue-400">{hwInfo.cpu}</span>
                          </div>
                          <div className="flex flex-col gap-1">
                            <span className="text-[10px] text-white/20 uppercase font-bold">Total Memory</span>
                            <span className="text-sm font-bold text-white">{(hwInfo.memory.total / (1024**3)).toFixed(0)} GB DDR5</span>
                          </div>
                        </div>
                        <div className="pt-4 border-t border-white/5 flex items-center justify-between">
                          <div className="flex flex-col gap-1">
                            <span className="text-[10px] text-white/20 uppercase font-bold">Kernel Uptime</span>
                            <span className="text-sm font-bold text-emerald-400">{(hwInfo && !isNaN(hwInfo.uptime)) ? (Math.floor(hwInfo.uptime / 60)).toString() : '0'} minutes</span>
                          </div>
                          <div className="flex items-center gap-2 px-3 py-1 bg-white/5 rounded-full border border-white/10">
                            <div className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse" />
                            <span className="text-[9px] uppercase font-bold text-white/40">Bridge Active</span>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="py-20 flex flex-col items-center justify-center gap-4 text-white/20">
                        <RefreshCw size={32} className="animate-spin-slow" />
                        <span className="text-[10px] font-bold uppercase tracking-widest">Querying System Bridge...</span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex flex-col gap-4">
                  <h3 className="text-[10px] text-white/30 uppercase font-bold tracking-[0.2em]">Native Command Bridge</h3>
                  <div className="bg-[#0d1117] border border-white/10 rounded-3xl p-6 font-mono text-[11px] leading-relaxed relative min-h-[300px] flex flex-col">
                    <div className="flex items-center gap-2 mb-4 border-b border-white/5 pb-4">
                      <TerminalIcon size={14} className="text-white/20" />
                      <span className="text-white/40">glass-native-output</span>
                    </div>
                    <div className="flex-1 space-y-2">
                      <p className="text-emerald-500/80">$ whoami</p>
                      <p className="text-white/60 pl-2">glass_user</p>
                      <p className="text-emerald-500/80">$ uname -a</p>
                      <p className="text-white/60 pl-2">GlassOS 1.0.0-PRO-X86_64 #1 SMP x86_64 GNU/Glass</p>
                      <p className="text-emerald-500/80 animate-pulse">$ _</p>
                    </div>
                    <div className="mt-auto pt-4 border-t border-white/5 text-[9px] text-white/20 flex justify-between">
                      <span>SECURE_SHELL_ACTIVE</span>
                      <span>127.0.0.1:GLASS</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-[#161b22] border border-white/5 p-8 rounded-[40px] flex items-center justify-between group cursor-pointer hover:bg-white/5 transition-all">
                <div className="flex items-center gap-6">
                  <div className="w-14 h-14 rounded-2xl bg-blue-500/10 flex items-center justify-center text-blue-500 group-hover:scale-110 transition-transform">
                    <Cpu size={28} />
                  </div>
                  <div>
                    <h4 className="text-lg font-bold text-white tracking-tight">System Performance Profile</h4>
                    <p className="text-xs text-white/40">Active profile: <span className="text-blue-400 font-bold uppercase tracking-wider">Balanced (X1)</span></p>
                  </div>
                </div>
                <button className="px-6 py-2 bg-blue-500 text-white rounded-xl font-bold text-xs shadow-lg shadow-blue-500/20 active:scale-95 transition-all">
                  Optimize Architecture
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function PrinterApp({ printQueue, setPrintQueue, addNotification, fsLib }: { printQueue: PrintJob[], setPrintQueue: React.Dispatch<React.SetStateAction<PrintJob[]>>, addNotification: any, fsLib: any }) {
  const clearJobs = () => {
    setPrintQueue([]);
    addNotification('Print Manager', 'Print queue cleared', 'info');
  };

  const handlePrintScript = (job: PrintJob) => {
    const scriptContent = `##printjob_${job.id}
Start
PRINT 'Initiating physical raster...'
PRINT 'Job: ${job.documentName}'
PRINT 'Source: ${job.sourceApp}'
PRINT 'Payload Hash: ${Math.random().toString(16).slice(2)}'
End
`;
    const folderPath = '/GlassDrive/Documents/System/Spooler';
    const filePath = `${folderPath}/${job.documentName.replace(/\s+/g, '_')}_${Date.now()}.scr`;
    
    try {
      if (!fsLib.exists(folderPath)) fsLib.mkdir(folderPath);
      fsLib.write(filePath, scriptContent);
      addNotification('Printer', 'Generated GlassScript spooler file', 'success');
    } catch (e) {
      addNotification('Printer', 'Failed to generate spooler script', 'error');
    }
  };

  return (
    <div className="h-full flex flex-col p-6 gap-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center text-blue-400">
            <PrinterIcon size={20} />
          </div>
          <div>
            <h2 className="text-sm font-bold uppercase tracking-wider">Print Manager</h2>
            <p className="text-[10px] text-white/40">{printQueue.length} Active Jobs</p>
          </div>
        </div>
        <button 
          onClick={clearJobs}
          className="text-xs px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 transition-all text-white/60"
        >
          Clear History
        </button>
      </div>

      <div className="flex-1 glass rounded-2xl overflow-hidden flex flex-col">
        <div className="p-4 border-b border-white/5 grid grid-cols-4 text-[10px] font-bold text-white/30 uppercase tracking-widest bg-white/2">
          <span>File Name</span>
          <span>Status</span>
          <span>Owner</span>
          <span>Timestamp</span>
        </div>
        <div className="flex-1 overflow-y-auto no-scrollbar">
          {printQueue.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-white/10 gap-4">
              <PrinterIcon size={48} className="opacity-5" />
              <p className="text-xs">No print jobs in queue</p>
            </div>
          ) : (
            printQueue.map(job => (
              <div key={job.id} className="p-4 grid grid-cols-4 text-xs border-b border-white/5 items-center hover:bg-white/2 transition-colors">
                <span className="truncate pr-4">{job.filename}</span>
                <span className={cn(
                  "font-medium",
                  job.status === 'printing' ? "text-blue-400" : 
                  job.status === 'completed' ? "text-green-400" :
                  job.status === 'error' ? "text-red-400" : "text-white/40"
                )}>
                  {job.status.charAt(0).toUpperCase() + job.status.slice(1)}
                </span>
                <span className="text-white/60">{job.owner}</span>
                <span className="text-white/30 font-mono text-[10px]">{job.timestamp}</span>
              </div>
            ))
          )}
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div className="glass p-3 rounded-xl flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-green-500/10 flex items-center justify-center text-green-400">
            <RefreshCw size={14} />
          </div>
          <div>
            <div className="text-[10px] text-white/30 uppercase">Printer Status</div>
            <div className="text-xs font-bold">Online</div>
          </div>
        </div>
        <div className="glass p-3 rounded-xl flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-orange-500/10 flex items-center justify-center text-orange-400">
            <HardDrive size={14} />
          </div>
          <div>
            <div className="text-[10px] text-white/30 uppercase">Paper Level</div>
            <div className="text-xs font-bold">85%</div>
          </div>
        </div>
        <div className="glass p-3 rounded-xl flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-purple-500/10 flex items-center justify-center text-purple-400">
            <Lock size={14} />
          </div>
          <div>
            <div className="text-[10px] text-white/30 uppercase">Ink Status</div>
            <div className="text-xs font-bold">Cyan: 42%</div>
          </div>
        </div>
      </div>
    </div>
  );
}

function TerminalApp({ 
  fs, setFs, fsLib, addNotification, currentUser,
  openWindow, setNotepadContent, setActiveFileInNotepad,
  setGlassWordContent, setActiveFileInGlassWord,
  setSheetData, setActiveFileInSheets,
  setNetworkNodes, runGlassScript 
}: any) {
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

  const processCommand = async (inputCommand: string) => {
    let forcedAdmin = false;
    let cmdToProcess = inputCommand.trim();
    
    if (cmdToProcess.toLowerCase().startsWith('sudo ')) {
      forcedAdmin = true;
      cmdToProcess = cmdToProcess.substring(5).trim();
    }

    const parts = cmdToProcess.split(/\s+/);
    const command = parts[0].toLowerCase();
    const args = parts.slice(1);
    const currentPath = activeSession.currentPath;
    const pathString = '/' + currentPath.join('/');
    const isAdmin = forcedAdmin || currentUser?.isAdmin;

    const newHistory = [...activeSession.history, `${isAdmin ? 'root' : 'guest'}@glass-os:${pathString}$ ${inputCommand}`];

    // Refactored to use fsLib

    const findItems = (items: FileSystemItem[], currentPath: string[], query: string, searchContent: boolean = false): { path: string, name: string }[] => {
      let results: { path: string, name: string }[] = [];
      
      const pattern = new RegExp('^' + query.replace(/\*/g, '.*').replace(/\?/g, '.') + '$', 'i');

      for (const item of items) {
        const itemPath = '/' + currentPath.join('/');
        
        // Name match
        if (pattern.test(item.name)) {
          results.push({ path: itemPath, name: item.name });
        } 
        // Content match (if requested and it's a file)
        else if (searchContent && item.type === 'file' && item.content && item.content.toLowerCase().includes(query.toLowerCase())) {
          results.push({ path: itemPath, name: item.name });
        }

        // Recurse into folders
        if (item.type === 'folder' && item.children) {
          results = [...results, ...findItems(item.children, [...currentPath, item.name], query, searchContent)];
        }
      }
      return results;
    };

    const formatPermissions = (item: FileSystemItem) => {
      const p = item.permissions || DEFAULT_PERMISSIONS;
      const type = item.type === 'folder' ? 'd' : '-';
      const rwx = (bits: { r: boolean, w: boolean, x: boolean }) => 
        `${bits.r ? 'r' : '-'}${bits.w ? 'w' : '-'}${bits.x ? 'x' : '-'}`;
      return `${type}${rwx(p.owner)}${rwx(p.group)}${rwx(p.others)}`;
    };

    switch (command) {
      case 'help':
        updateActiveSession({ history: [
          ...newHistory, 
          'Available commands:',
          '  ls [-l] [-a]   List directory contents',
          '  cd <path>      Change current directory',
          '  mkdir <name>   Create a new directory',
          '  rm <f1> [f2]   Remove files or directories',
          '  cat <f1> [f2]  Display file contents',
          '  pwd            Print working directory',
          '  find <pat>     Search for files/folders',
          '  chmod <mode>   Change permissions (octal)',
          '  open <file>    Open file in associated app',
          '  run <app_id>   Launch a system app',
          '  ping <node>    Test connection to a network node',
          '  pkg <cmd>      Custom packet manager',
          '  sudo <cmd>     Execute command as root',
          '  shutdown <node> Shutdown a network node (requires sudo)',
          '  restart <node>  Restart a network node (requires sudo)',
          '  top [delay]    Monitor system processes',
          '  clear          Clear terminal history',
          '  whoami, sysinfo, quit'
        ] });
        addNotification('Terminal', 'Expanded help menu displayed', 'info');
        break;
      case 'ping': {
        const target = args[0];
        if (!target) {
          updateActiveSession({ history: [...newHistory, 'usage: ping <node_hostname_or_ip>'] });
          break;
        }
        updateActiveSession({ history: [...newHistory, `PING ${target} (56 data bytes)...`] });
        
        let count = 0;
        const pingInterval = setInterval(() => {
          const time = (Math.random() * 20 + 2).toFixed(3);
          updateActiveSession({ 
            history: [...activeSession.history, `64 bytes from ${target}: icmp_seq=${count} ttl=64 time=${time} ms`] 
          });
          count++;
          if (count >= 4) {
            clearInterval(pingInterval);
            updateActiveSession({ 
              history: [...activeSession.history, `--- ${target} ping statistics ---`, `4 packets transmitted, 4 received, 0% packet loss, time 3004ms`] 
            });
          }
        }, 800);
        break;
      }
      case 'shutdown':
      case 'restart': {
        if (!forcedAdmin) {
          updateActiveSession({ history: [...newHistory, `Permission denied: ${command} requires root privileges (use sudo)`] });
          addNotification('Security', `Unauthorized ${command} attempt`, 'error');
          break;
        }
        const target = args[0];
        if (!target) {
          updateActiveSession({ history: [...newHistory, `usage: ${command} <node_hostname>`] });
          break;
        }
        
        // Find the node
        setNetworkNodes((prev: NetworkNode[]) => {
          const node = prev.find(n => n.hostname === target || n.ip === target);
          if (!node) {
            updateActiveSession({ history: [...newHistory, `Error: Node "${target}" not found on network.`] });
            return prev;
          }
          
          updateActiveSession({ history: [...newHistory, `${command === 'shutdown' ? 'Shutting down' : 'Restarting'} ${target}...`] });
          addNotification('Kernel', `Broadcasted ${command.toUpperCase()} to ${target}`, 'warning');
          
          return prev.map(n => {
            if (n.hostname === target || n.ip === target) {
              return { ...n, status: command === 'shutdown' ? 'offline' : 'online' };
            }
            return n;
          });
        });
        break;
      }
      case 'find':
      case 'search': {
        let query = args[0];
        let searchContent = false;

        if (args.includes('--content')) {
          searchContent = true;
          query = args.find(a => !a.startsWith('--')) || '';
        }

        if (!query) {
          updateActiveSession({ history: [...newHistory, 'usage: find <pattern> [--content]'] });
          break;
        }

        const results = fsLib.find(query, searchContent);
        if (results.length > 0) {
          const lines = results.map(r => `${r.path}/${r.name}`);
          updateActiveSession({ history: [...newHistory, ...lines] });
          addNotification('Terminal', `Found ${results.length} matches`, 'success');
        } else {
          updateActiveSession({ history: [...newHistory, 'No matches found.'] });
        }
        break;
      }
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
        const isLong = args.includes('-l');
        const showAll = args.includes('-a');
        const targetPathArg = args.find(a => !a.startsWith('-')) || '.';
        
        let targetPathStr = '';
        if (targetPathArg === '.') {
          targetPathStr = pathString;
        } else if (targetPathArg === '..') {
          targetPathStr = '/' + currentPath.slice(0, -1).join('/');
        } else if (targetPathArg.startsWith('/')) {
          targetPathStr = targetPathArg;
        } else {
          targetPathStr = pathString === '/' ? `/${targetPathArg}` : `${pathString}/${targetPathArg}`;
        }

        try {
          const items = fsLib.list(targetPathStr).filter(i => showAll || !i.name.startsWith('.'));
          if (isLong) {
            const lines = items.map(item => {
              const perms = formatPermissions(item);
              const size = item.type === 'file' ? (item.content?.length || 0).toString().padStart(6) : '     -';
              const mtime = 'Apr 18 09:40';
              return `${perms}  guest guest  ${size}  ${mtime}  ${item.name}`;
            });
            updateActiveSession({ history: [...newHistory, ...lines] });
          } else {
            const names = items.map(item => item.name).join('  ');
            updateActiveSession({ history: [...newHistory, names || '(empty)'] });
          }
           addNotification('Terminal', `Listed ${items.length} items`, 'info');
        } catch (e) {
          updateActiveSession({ history: [...newHistory, `ls: cannot access '${targetPathArg}': No such directory`] });
        }
        break;
      }
      case 'cd': {
        const target = args[0] || '/';
        let targetPathStr = '';
        if (target === '~' || target === '/') {
          targetPathStr = '/';
        } else if (target === '..') {
          targetPathStr = '/' + currentPath.slice(0, -1).join('/');
        } else if (target.startsWith('/')) {
          targetPathStr = target;
        } else {
          targetPathStr = pathString === '/' ? `/${target}` : `${pathString}/${target}`;
        }

        if (fsLib.exists(targetPathStr)) {
          const newPathParts = targetPathStr.split('/').filter(Boolean);
          updateActiveSession({ currentPath: newPathParts, history: newHistory });
          addNotification('Terminal', `Changed directory to: ${targetPathStr}`, 'info');
        } else {
          updateActiveSession({ history: [...newHistory, `cd: no such directory: ${target}`] });
        }
        break;
      }
      case 'mkdir': {
        const name = args.find(a => !a.startsWith('-'));
        if (!name) {
          updateActiveSession({ history: [...newHistory, 'mkdir: missing operand'] });
          break;
        }
        const targetPathStr = name.startsWith('/') ? name : (pathString === '/' ? `/${name}` : `${pathString}/${name}`);
        try {
          fsLib.mkdir(targetPathStr);
          addNotification('Terminal', `Created directory: ${name}`, 'success');
          updateActiveSession({ history: newHistory });
        } catch (e) {
          updateActiveSession({ history: [...newHistory, `mkdir: cannot create directory '${name}': Error`] });
        }
        break;
      }
      case 'rm': {
        if (args.length === 0) {
          updateActiveSession({ history: [...newHistory, 'rm: missing operand'] });
          break;
        }
        args.forEach(arg => {
          const targetPathStr = arg.startsWith('/') ? arg : (pathString === '/' ? `/${arg}` : `${pathString}/${arg}`);
          fsLib.delete(targetPathStr);
        });
        addNotification('Terminal', `Removed ${args.length} items`, 'success');
        updateActiveSession({ history: newHistory });
        break;
      }
      case 'cat': {
        if (args.length === 0) {
          updateActiveSession({ history: [...newHistory, 'cat: missing operand'] });
          break;
        }
        const results: string[] = [];
        args.forEach(arg => {
           const targetPathStr = arg.startsWith('/') ? arg : (pathString === '/' ? `/${arg}` : `${pathString}/${arg}`);
           const content = fsLib.read(targetPathStr);
           if (content !== null) {
             const ext = targetPathStr.split('.').pop()?.toLowerCase();
             if (ext === 'gsheet') {
               try {
                 const data = JSON.parse(content);
                 if (Array.isArray(data)) {
                   // Truncate for display
                   const rows = data.slice(0, 5).map((row: string[], rIdx: number) => {
                     return `${rIdx + 1} | ${row.slice(0, 5).map(c => (c || '').toString().padEnd(10)).join(' | ')}`;
                   });
                   const header = `  | ${Array(Math.min(5, data[0]?.length || 0)).fill(0).map((_, i) => String.fromCharCode(65 + i).padEnd(10)).join(' | ')}`;
                   results.push(`Preview of ${arg}:\n${header}\n${'-'.repeat(header.length)}\n${rows.join('\n')}${data.length > 5 ? '\n...' : ''}`);
                 } else {
                   results.push(content);
                 }
               } catch (e) {
                 results.push(content);
               }
             } else if (ext === 'gdoc') {
               // Strip HTML tags for preview
               const plain = content.replace(/<[^>]*>?/gm, '');
               results.push(`Preview of ${arg}:\n${plain.substring(0, 500)}${plain.length > 500 ? '...' : ''}`);
             } else {
               results.push(content);
             }
           } else {
             results.push(`cat: ${arg}: No such file`);
           }
        });
        updateActiveSession({ history: [...newHistory, ...results] });
        break;
      }
      case 'touch': {
        if (args.length === 0) {
          updateActiveSession({ history: [...newHistory, 'touch: missing operand'] });
          break;
        }
        args.forEach(arg => {
          const targetPathStr = arg.startsWith('/') ? arg : (pathString === '/' ? `/${arg}` : `${pathString}/${arg}`);
          if (!fsLib.exists(targetPathStr)) {
            fsLib.write(targetPathStr, '');
          }
        });
        updateActiveSession({ history: newHistory });
        break;
      }
      case 'chmod': {
        if (args.length < 2) {
          updateActiveSession({ history: [...newHistory, 'usage: chmod <mode> <file>'] });
          break;
        }
        const modeStr = args[0];
        const target = args[1];
        const targetPathStr = target.startsWith('/') ? target : (pathString === '/' ? `/${target}` : `${pathString}/${target}`);
        
        // Convert octal to Permissions object (simplistic mapping)
        const mode = parseInt(modeStr, 8);
        const getPerms = (m: number) => ({
          r: !!(m & 4),
          w: !!(m & 2),
          x: !!(m & 1)
        });
        const perms: Permissions = {
          owner: getPerms((mode >> 6) & 7),
          group: getPerms((mode >> 3) & 7),
          others: getPerms(mode & 7)
        };
        
        try {
          fsLib.chmod(targetPathStr, perms);
          updateActiveSession({ history: newHistory });
        } catch (e) {
          updateActiveSession({ history: [...newHistory, `chmod: error updating ${target}`] });
        }
        break;
      }
      case 'pkg': {
        const subCommand = args[0];
        const pkgName = args[1];

        if (!subCommand) {
          updateActiveSession({ history: [
            ...newHistory,
            'Packet Manager (pkg) v1.0.0',
            'Usage: pkg <command> [packet]',
            '',
            'Commands:',
            '  list      List available packets in /home/Administrator/Scripts',
            '  status    List installed packets in /sys/pkgs',
            '  install   Install a packet from /home/Administrator/Scripts',
            '  remove    Remove an installed packet',
            '  run       Run an installed packet'
          ] });
          break;
        }

        const SCRIPTS_PATH = '/home/Administrator/Scripts';
        const PKGS_PATH = '/sys/pkgs';

        switch (subCommand) {
          case 'list': {
            try {
              const available = fsLib.list(SCRIPTS_PATH);
              updateActiveSession({ history: [
                ...newHistory,
                `Available packets in ${SCRIPTS_PATH}:`,
                ...available.map(p => `  ${p.name} (${(p.content?.length || 0)} bytes)`)
              ] });
            } catch (e) {
              updateActiveSession({ history: [...newHistory, `Error: Cannot access ${SCRIPTS_PATH}`] });
            }
            break;
          }
          case 'status': {
            try {
              const installed = fsLib.list(PKGS_PATH);
              updateActiveSession({ history: [
                ...newHistory,
                `Installed packets in ${PKGS_PATH}:`,
                ...installed.map(p => `  ${p.name} [Installed]`)
              ] });
            } catch (e) {
              updateActiveSession({ history: [...newHistory, `Error: Cannot access ${PKGS_PATH}`] });
            }
            break;
          }
          case 'install': {
            if (!pkgName) {
              updateActiveSession({ history: [...newHistory, 'Error: No packet name specified.'] });
              break;
            }
            const scriptContent = fsLib.read(`${SCRIPTS_PATH}/${pkgName}`);
            if (scriptContent === null) {
              updateActiveSession({ history: [...newHistory, `Error: Packet "${pkgName}" not found in ${SCRIPTS_PATH}.`] });
              break;
            }

            try {
              fsLib.write(`${PKGS_PATH}/${pkgName}`, scriptContent);
              updateActiveSession({ history: [...newHistory, `Successfully installed ${pkgName}.`] });
              addNotification('Packet Manager', `Installed ${pkgName}`, 'success');
            } catch (e) {
              updateActiveSession({ history: [...newHistory, `Error: Failed to install ${pkgName}`] });
            }
            break;
          }
          case 'remove': {
            if (!pkgName) {
              updateActiveSession({ history: [...newHistory, 'Error: No packet name specified.'] });
              break;
            }
            if (!fsLib.exists(`${PKGS_PATH}/${pkgName}`)) {
              updateActiveSession({ history: [...newHistory, `Error: Packet "${pkgName}" is not installed.`] });
              break;
            }

            try {
              fsLib.delete(`${PKGS_PATH}/${pkgName}`);
              updateActiveSession({ history: [...newHistory, `Successfully removed ${pkgName}.`] });
              addNotification('Packet Manager', `Removed ${pkgName}`, 'warning');
            } catch (e) {
              updateActiveSession({ history: [...newHistory, `Error: Failed to remove ${pkgName}`] });
            }
            break;
          }
          case 'run': {
            if (!pkgName) {
              updateActiveSession({ history: [...newHistory, 'Error: No packet name specified.'] });
              break;
            }
            const scriptContent = fsLib.read(`${PKGS_PATH}/${pkgName}`);
            if (scriptContent === null) {
              updateActiveSession({ history: [...newHistory, `Error: Packet "${pkgName}" is not installed. Use "pkg install ${pkgName}" first.`] });
              break;
            }

            updateActiveSession({ history: [...newHistory, `Executing ${pkgName}...`] });
            addNotification('Packet Manager', `Running ${pkgName}`, 'info');
            runGlassScript(scriptContent);
            updateActiveSession({ history: [...activeSession.history, `[${pkgName}] Execution finished.`] });
            break;
          }
          default:
            updateActiveSession({ history: [...newHistory, `Unknown pkg command: ${subCommand}`] });
        }
        break;
      }
      case 'open': {
        const name = args[0];
        if (!name) {
          updateActiveSession({ history: [...newHistory, 'usage: open <file>'] });
          break;
        }
        
        const targetPathStr = name.startsWith('/') ? name : (pathString === '/' ? `/${name}` : `${pathString}/${name}`);

        if (!fsLib.exists(targetPathStr)) {
          updateActiveSession({ history: [...newHistory, `open: ${name}: No such file or directory`] });
          break;
        }

        const parts = targetPathStr.split('/').filter(Boolean);
        const fileName = parts[parts.length - 1];
        const content = fsLib.read(targetPathStr);

        if (content === null) { 
          openWindow('files', 'File Explorer');
          addNotification('Terminal', `Opening folder: ${name}`, 'info');
        } else {
          const ext = fileName.split('.').pop()?.toLowerCase();
          if (ext === 'txt' || ext === 'b' || ext === 'json' || ext === 'scr') {
            setNotepadContent(content);
            setActiveFileInNotepad({ name: fileName, path: parts.slice(0, -1) });
            openWindow('notepad', 'Notepad');
          } else if (ext === 'gdoc') {
            setGlassWordContent(content);
            setActiveFileInGlassWord({ name: fileName, path: parts.slice(0, -1) });
            openWindow('glassword', 'GlassWord 2026');
          } else if (ext === 'gsheet') {
            try {
              const data = JSON.parse(content);
              setSheetData(data);
              setActiveFileInSheets({ name: fileName, path: parts.slice(0, -1) });
              openWindow('spreadsheet', 'Glass Sheets Pro');
            } catch (e) {
              updateActiveSession({ history: [...newHistory, `open: error parsing ${fileName}`] });
            }
          } else if (ext === 'jpg' || ext === 'png') {
            openWindow('photos', 'Photos');
          } else {
            updateActiveSession({ history: [...newHistory, `open: no application associated with .${ext}`] });
          }
        }
        updateActiveSession({ history: newHistory });
        break;
      }
      case 'run': {
        const appId = args[0];
        if (!appId) {
          updateActiveSession({ history: [...newHistory, 'usage: run <app_id>'] });
          break;
        }
        const titles: Record<string, string> = {
          'terminal': 'Terminal',
          'settings': 'Settings',
          'notepad': 'Notepad',
          'glassword': 'GlassWord 2026',
          'spreadsheet': 'Glass Sheets Pro',
          'browser': 'Web Browser',
          'photos': 'Photos',
          'music': 'Media Player',
          'appfolder': 'App Folder',
          'codestudio': 'Code Studio',
          'files': 'File Explorer',
          'systemmonitor': 'NOC Center',
          'taskscheduler': 'Task Scheduler',
          'printers': 'Printers',
          'calendar': 'Calendar',
          'glassmail': 'GlassMail',
          'glassdatabase': 'Glass Database',
          'glassmessaging': 'Glass Messaging'
        };
        
        if (titles[appId]) {
          openWindow(appId, titles[appId]);
          addNotification('Terminal', `Launching application: ${titles[appId]}`, 'success');
        } else {
          updateActiveSession({ history: [...newHistory, `run: ${appId}: Application not found`] });
        }
        updateActiveSession({ history: newHistory });
        break;
      }
      case 'sysinfo': {
        if (window.electronAPI) {
          const info = await window.electronAPI.getSystemInfo();
          const infoLines = [
            'NATIVE SYSTEM INFO (ELECTRON):',
            `Platform: ${info.platform}`,
            `Arch: ${info.arch}`,
            `Version: ${info.version}`,
            `Memory (Resident): ${(info.memory.residentSet / 1024 / 1024).toFixed(2)} MB`,
            '---',
            'GlassOS Kernel Interface Active (Native Mode)'
          ];
          updateActiveSession({ history: [...newHistory, ...infoLines] });
        } else {
          updateActiveSession({ history: [...newHistory, 
            'CPU: Virtual Octa-Core @ 3.2GHz',
            'RAM: 16GB Virtual DDR5',
            'Storage: 512GB NVMe SSD',
            'Kernel: GlassOS-v1-React19',
            'Version: 1.0.0-stable'
          ] });
        }
        addNotification('System', 'System information retrieved', 'info');
        break;
      }
      case 'native': {
        const nativeCmd = args.join(' ');
        if (!nativeCmd) {
          updateActiveSession({ history: [...newHistory, 'usage: native <host_command>'] });
          break;
        }
        if (!window.electronAPI) {
          updateActiveSession({ history: [...newHistory, 'Error: Native environment not detected. Are you in Electron?'] });
          break;
        }
        updateActiveSession({ history: [...newHistory, `[HOST] Executing: ${nativeCmd}...`] });
        const result = await window.electronAPI.executeCommand(nativeCmd);
        const resultLines = result.stdout.split('\n').filter(Boolean);
        updateActiveSession({ history: [...activeSession.history, ...resultLines] });
        if (result.stderr) {
          updateActiveSession({ history: [...activeSession.history, `[STDERR] ${result.stderr}`] });
        }
        break;
      }
      case 'top': {
        const delay = parseInt(args.find(a => !a.startsWith('-')) || '1000');
        updateActiveSession({ isTopActive: true, history: newHistory });
        addNotification('System', `Process monitor started (refresh: ${delay}ms)`, 'info');
        break;
      }
      case 'quit':
        if (activeSession.isTopActive) {
          updateActiveSession({ isTopActive: false, history: newHistory });
          addNotification('System', 'Process monitor stopped', 'info');
        }
        break;
      default:
        if (command) {
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

function GlassWordProcessor({ fs, setFs, fsLib, addNotification, currentUser, openWindow, setPrintQueue, userName, glassWordContent, setGlassWordContent, activeFileInGlassWord, setActiveFileInGlassWord, runGlassScript, runBrainscript }: any) {
  const [content, setContent] = useState(glassWordContent || DEFAULT_GLASSWORD_CONTENT);
  const [activeMenu, setActiveMenu] = useState<string | null>(null);
  const [lastSaved, setLastSaved] = useState(new Date().toLocaleTimeString());
  const [activeFile, setActiveFile] = useState<{ name: string, path: string[] } | null>(activeFileInGlassWord);
  const [showOpenDialog, setShowOpenDialog] = useState(false);
  const [showSaveDialog, setShowSaveDialog] = useState(false);
  const [showInsertPicker, setShowInsertPicker] = useState(false);
  const [insertType, setInsertType] = useState<'image' | 'sheet'>('image');
  const [saveFileName, setSaveFileName] = useState('');
  const [showScriptPicker, setShowScriptPicker] = useState(false);
  const editorRef = useRef<HTMLDivElement>(null);
  const lastContent = useRef(content);
  const lastSelection = useRef('');

  useEffect(() => {
    const updateSelection = () => {
      const sel = window.getSelection();
      if (sel && editorRef.current?.contains(sel.anchorNode)) {
        lastSelection.current = sel.toString();
      }
    };
    document.addEventListener('mouseup', updateSelection);
    document.addEventListener('keyup', updateSelection);
    return () => {
      document.removeEventListener('mouseup', updateSelection);
      document.removeEventListener('keyup', updateSelection);
    };
  }, []);

  useEffect(() => {
    BridgeLib.registerApp('glassword', {
      getData: () => content,
      setData: (data: string) => {
        setContent(data);
        setGlassWordContent(data);
        addNotification('GlassWord', 'Data synced from Bridge', 'info');
      },
      getSelection: () => {
        return lastSelection.current;
      }
    });
    return () => BridgeLib.unregisterApp('glassword');
  }, [content, setGlassWordContent, addNotification]);

  useEffect(() => {
    if (glassWordContent !== undefined && glassWordContent !== content) {
      setContent(glassWordContent);
      if (activeFileInGlassWord) {
        setActiveFile(activeFileInGlassWord);
      }
    }
  }, [glassWordContent, activeFileInGlassWord]);

  useEffect(() => {
    if (content !== lastContent.current && editorRef.current) {
      editorRef.current.innerHTML = content;
      lastContent.current = content;
    }
  }, [content]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 's') {
        e.preventDefault();
        handleSave();
      }
      if ((e.metaKey || e.ctrlKey) && e.key === 'p') {
        e.preventDefault();
        handlePrint();
      }
      if ((e.metaKey || e.ctrlKey) && e.key === 'b') {
        e.preventDefault();
        exec('bold');
      }
      if ((e.metaKey || e.ctrlKey) && e.key === 'i') {
        e.preventDefault();
        exec('italic');
      }
      if ((e.metaKey || e.ctrlKey) && e.key === 'u') {
        e.preventDefault();
        exec('underline');
      }
      if ((e.metaKey || e.ctrlKey) && e.key === 'z') {
        e.preventDefault();
        exec('undo');
      }
      if ((e.metaKey || e.ctrlKey) && e.key === 'y') {
        e.preventDefault();
        exec('redo');
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [content, activeFile]);

  const exec = (command: string, value: string = '') => {
    document.execCommand(command, false, value);
    if (editorRef.current) editorRef.current.focus();
    // Update content state after execCommand
    if (editorRef.current) {
      const html = editorRef.current.innerHTML;
      lastContent.current = html;
      setContent(html);
    }
  };

  const handlePrint = () => {
    const filename = activeFile ? activeFile.name : 'Untitled Document.gdoc';
    const newJob: PrintJob = {
      id: Math.random().toString(36).substr(2, 9),
      documentName: filename,
      filename,
      status: 'printing',
      timestamp: new Date().toLocaleTimeString(),
      owner: userName || 'Administrator'
    };
    setPrintQueue((prev: PrintJob[]) => [...prev, newJob]);
    addNotification('Print Manager', `Sending "${filename}" to printer...`, 'info');
    
    setTimeout(() => {
      setPrintQueue((prev: PrintJob[]) => 
        prev.map(job => job.id === newJob.id ? { ...job, status: 'completed' } : job)
      );
      addNotification('Print Manager', `Finished printing "${filename}"`, 'success');
    }, 5000);
    setActiveMenu(null);
  };

  const handlePaste = async () => {
    try {
      const text = await navigator.clipboard.readText();
      exec('insertHTML', text);
    } catch (err) {
      // Fallback for browsers that block clipboard read
      document.execCommand('paste');
      if (editorRef.current) {
        const html = editorRef.current.innerHTML;
        lastContent.current = html;
        setContent(html);
      }
    }
  };

  const handleSave = () => {
    if (activeFile) {
      const fileObj = findItemByPath(fs, activeFile.path.concat(activeFile.name));
      if (fileObj && !checkPermission(fileObj, 'w', currentUser?.isAdmin)) {
        addNotification('GlassWord', 'Permission denied: Cannot overwrite this file', 'error');
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

      setFs((prev: FileSystemItem[]) => updateFileContent(prev, activeFile.path, activeFile.name, content));
      setLastSaved(new Date().toLocaleTimeString());
      setGlassWordContent(content);
      setActiveFileInGlassWord(activeFile);
      addNotification('GlassWord', `Saved ${activeFile.name}`, 'success');
    } else {
      setShowSaveDialog(true);
    }
    setActiveMenu(null);
  };

  const handleSaveAs = () => {
    if (!saveFileName.trim()) return;
    let fileName = saveFileName.endsWith('.gdoc') ? saveFileName : `${saveFileName}.gdoc`;
    const savePath = ['Documents'];

    const targetChildren = findItemByPath(fs, savePath)?.children;
    if (!targetChildren) {
      addNotification('GlassWord', 'Documents directory not found', 'error');
      return;
    }

    // Unique name
    let finalName = fileName;
    let counter = 1;
    while (targetChildren.some(i => i.name === finalName)) {
      finalName = `${fileName.replace('.gdoc', '')} (${counter++}).gdoc`;
    }

    const newFile: FileSystemItem = {
      name: finalName,
      type: 'file',
      content: content,
      permissions: DEFAULT_PERMISSIONS
    };

    const updateFsRecursive = (items: FileSystemItem[], path: string[]): FileSystemItem[] => {
      if (path.length === 0) return [...items, newFile];
      const [first, ...rest] = path;
      return items.map(item => {
        if (item.name === first && item.type === 'folder' && item.children) {
          return { ...item, children: updateFsRecursive(item.children || [], rest) };
        }
        return item;
      });
    };

    setFs((prev: FileSystemItem[]) => updateFsRecursive(prev, savePath));
    setActiveFile({ name: finalName, path: savePath });
    setActiveFileInGlassWord({ name: finalName, path: savePath });
    setGlassWordContent(content);
    setShowSaveDialog(false);
    setLastSaved(new Date().toLocaleTimeString());
    addNotification('GlassWord', `Document saved as ${finalName} in Documents`, 'success');
  };

  const handleOpen = (file: FileSystemItem, path: string[]) => {
    if (file.type === 'file') {
      setContent(file.content || '');
      setGlassWordContent(file.content || '');
      setActiveFile({ name: file.name, path });
      setActiveFileInGlassWord({ name: file.name, path });
      setShowOpenDialog(false);
      addNotification('GlassWord', `Opened ${file.name}`, 'info');
    }
  };

  const handleInsertFile = (selectedPath: string) => {
    const file = findItemByPath(fs, selectedPath.split('/'));
    if (!file) return;

    if (insertType === 'image') {
      const ext = file.name.split('.').pop()?.toLowerCase();
      if (['jpeg', 'jpg', 'png', 'gif', 'img', 'gdraw', 'gpaint'].includes(ext || '')) {
        let contentToInsert = '';
        if (['gdraw', 'gpaint'].includes(ext || '')) {
          contentToInsert = `<div style="padding: 20px; background: #f8fafc; border: 2px dashed #cbd5e1; border-radius: 12px; text-align: center; margin: 15px 0; color: #64748b;">
            <div style="font-weight: bold; margin-bottom: 4px;">Drawing: ${file.name}</div>
            <div style="font-size: 10px; opacity: 0.7;">Vector data embedded from ${ext === 'gdraw' ? 'BridgeDraw' : 'BridgePaint'}</div>
          </div>`;
        } else {
          const src = file.content?.startsWith('data:') ? file.content : `data:image/${ext};base64,${file.content}`;
          contentToInsert = `<img src="${src}" style="max-width: 100%; height: auto; border-radius: 8px; box-shadow: 0 4px 12px rgba(0,0,0,0.1); margin: 10px 0;" alt="${file.name}" />`;
        }
        exec('insertHTML', contentToInsert);
        addNotification('GlassWord', `Inserted ${file.name}`, 'success');
      } else {
        addNotification('GlassWord', 'Selected file is not a supported image format', 'warning');
      }
    } else if (insertType === 'sheet') {
      const ext = file.name.split('.').pop()?.toLowerCase();
      if (ext === 'gsheet') {
        const tableHtml = `<div style="margin: 15px 0; padding: 12px; border: 1px solid #e2e8f0; border-radius: 8px; background: #f8fafc; font-family: sans-serif;">
          <div style="font-size: 11px; font-weight: bold; margin-bottom: 8px; color: #475569; display: flex; items-center: center; gap: 6px;">
            <span style="color: #10b981;">📊</span> Linked Sheet: ${file.name}
          </div>
          <table style="width: 100%; border-collapse: collapse; background: white; font-size: 10px; border: 1px solid #e2e8f0;">
            <thead>
              <tr style="background: #f1f5f9;">
                <th style="border: 1px solid #e2e8f0; padding: 4px; text-align: left;">Col A</th>
                <th style="border: 1px solid #e2e8f0; padding: 4px; text-align: left;">Col B</th>
                <th style="border: 1px solid #e2e8f0; padding: 4px; text-align: left;">Col C</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td style="border: 1px solid #e2e8f0; padding: 4px; color: #94a3b8; font-style: italic;">... live data link ...</td>
                <td style="border: 1px solid #e2e8f0; padding: 4px; color: #94a3b8; font-style: italic;">...</td>
                <td style="border: 1px solid #e2e8f0; padding: 4px; color: #94a3b8; font-style: italic;">...</td>
              </tr>
            </tbody>
          </table>
          <div style="font-size: 9px; color: #94a3b8; margin-top: 8px; text-align: right;">vLink 1.0 PERSISTENT</div>
        </div>`;
        exec('insertHTML', tableHtml);
        addNotification('GlassWord', `Inserted live link to ${file.name}`, 'success');
      } else {
        addNotification('GlassWord', 'Please select a .gsheet file', 'warning');
      }
    }
    setShowInsertPicker(false);
  };

  const menuItems = [
    { 
      label: 'File', 
      items: [
        { label: 'New', action: () => { setContent(''); setActiveFile(null); setGlassWordContent(''); setActiveFileInGlassWord(null); } },
        { label: 'Open...', action: () => setShowOpenDialog(true) },
        { label: 'Save', action: handleSave, shortcut: 'Cmd+S' },
        { label: 'Save As...', action: () => setShowSaveDialog(true) },
        { label: 'Print...', action: handlePrint, shortcut: 'Cmd+P' },
        { label: 'Exit', action: () => addNotification('System', 'Use window controls to exit', 'info') }
      ] 
    },
    { 
      label: 'Edit', 
      items: [
        { label: 'Undo', action: () => exec('undo'), shortcut: 'Cmd+Z' },
        { label: 'Redo', action: () => exec('redo'), shortcut: 'Cmd+Y' },
        { label: 'Cut', action: () => { document.execCommand('cut'); if (editorRef.current) { const html = editorRef.current.innerHTML; lastContent.current = html; setContent(html); } }, shortcut: 'Cmd+X' },
        { label: 'Copy', action: () => document.execCommand('copy'), shortcut: 'Cmd+C' },
        { label: 'Paste', action: handlePaste, shortcut: 'Cmd+V' },
        { label: 'Clear', action: () => { setContent(''); } },
        { 
          label: 'Insert', 
          items: [
            { label: 'Image (jpeg, img, gdraw/paint)...', action: () => { setInsertType('image'); setShowInsertPicker(true); } },
            { label: 'Sheet (gsheets)...', action: () => { setInsertType('sheet'); setShowInsertPicker(true); } }
          ]
        }
      ] 
    },
    { 
      label: 'Format', 
      items: [
        { label: 'Bold', action: () => exec('bold'), shortcut: 'Cmd+B' },
        { label: 'Italic', action: () => exec('italic'), shortcut: 'Cmd+I' },
        { label: 'Underline', action: () => exec('underline'), shortcut: 'Cmd+U' },
        { label: 'Strikethrough', action: () => exec('strikeThrough') },
        { label: 'Heading 1', action: () => exec('formatBlock', 'H1') },
        { label: 'Heading 2', action: () => exec('formatBlock', 'H2') },
        { label: 'Heading 3', action: () => exec('formatBlock', 'H3') },
        { label: 'Paragraph', action: () => exec('formatBlock', 'P') },
        { label: 'Bullet List', action: () => exec('insertUnorderedList') },
        { label: 'Numbered List', action: () => exec('insertOrderedList') }
      ] 
    },
    { 
      label: 'Font', 
      items: [
        { label: 'Inter', action: () => exec('fontName', 'Inter') },
        { label: 'Roboto', action: () => exec('fontName', 'Roboto') },
        { label: 'Open Sans', action: () => exec('fontName', 'Open Sans') },
        { label: 'Montserrat', action: () => exec('fontName', 'Montserrat') },
        { label: 'Poppins', action: () => exec('fontName', 'Poppins') },
        { label: 'JetBrains Mono', action: () => exec('fontName', 'JetBrains Mono') },
        { label: 'Playfair Display', action: () => exec('fontName', 'Playfair Display') }
      ] 
    },
    { 
      label: 'Tools', 
      items: [
        { label: 'Word Count', action: () => {
          const words = content.replace(/<[^>]*>?/gm, '').split(/\s+/).filter(Boolean).length;
          addNotification('GlassWord', `Word Count: ${words}`, 'info');
        }},
        { label: 'Run Script...', action: () => setShowScriptPicker(true) },
        { label: 'Code Studio', action: () => openWindow('codestudio', 'Code Studio') },
        { label: 'Terminal', action: () => openWindow('terminal', 'Terminal') }
      ] 
    },
  ];

  return (
    <div className="h-full flex flex-col bg-slate-950/40 overflow-hidden font-sans">
      {/* Menu Bar */}
      <AnimatePresence>
        {showScriptPicker && (
          <ScriptPicker 
            fs={fs} 
            onClose={() => setShowScriptPicker(false)}
            onSelect={(content, name) => {
              setShowScriptPicker(false);
              if (name.endsWith('.scr') || name.endsWith('.txt')) {
                runGlassScript(content);
              } else if (name.endsWith('.b')) {
                runBrainscript(content, (msg: string) => addNotification('Brainscript', msg, 'info'));
              }
            }}
          />
        )}
      </AnimatePresence>

      <div className="h-8 flex items-center px-4 bg-white/5 backdrop-blur-xl border-b border-white/10 z-50">
        {menuItems.map((menu) => (
          <div key={menu.label} className="relative">
            <button
              onClick={() => setActiveMenu(activeMenu === menu.label ? null : menu.label)}
              className={cn(
                "px-3 py-1 text-xs font-medium transition-colors hover:bg-white/10",
                activeMenu === menu.label ? "bg-white/10 text-white" : "text-white/60"
              )}
            >
              {menu.label}
            </button>
            <AnimatePresence>
              {activeMenu === menu.label && (
                <motion.div 
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 5 }}
                  className="absolute top-full left-0 w-48 bg-slate-900/90 backdrop-blur-2xl border border-white/10 shadow-2xl z-[100] py-1 rounded-b-lg"
                >
        {menu.items.map((item: any) => (
          <div key={item.label} className="relative group/sub">
            <button
              onClick={() => {
                if (item.action) {
                  item.action();
                  setActiveMenu(null);
                }
              }}
              className={cn(
                "w-full text-left px-4 py-1.5 text-[11px] text-white/80 hover:bg-blue-500/50 transition-colors flex justify-between group",
                item.items ? "cursor-default" : ""
              )}
            >
              <span className="flex items-center gap-2">
                {item.label}
                {item.items && <ChevronRight size={10} className="ml-auto opacity-40 group-hover/sub:translate-x-0.5 transition-transform" />}
              </span>
              {item.shortcut && <span className="opacity-40 uppercase text-[9px] group-hover:text-white/50">{item.shortcut}</span>}
            </button>
            {item.items && (
              <div className="absolute left-full top-0 w-48 bg-slate-900 border border-white/10 hidden group-hover/sub:block py-1 shadow-2xl rounded-lg -ml-1">
                {item.items.map((subItem: any) => (
                  <button
                    key={subItem.label}
                    onClick={() => {
                      subItem.action();
                      setActiveMenu(null);
                    }}
                    className="w-full text-left px-4 py-1.5 text-[11px] text-white/80 hover:bg-blue-500/50 transition-colors"
                  >
                    {subItem.label}
                  </button>
                ))}
              </div>
            )}
          </div>
        ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        ))}
      </div>

      {/* Toolbar */}
      <div className="p-1.5 flex items-center gap-1 bg-white/10 backdrop-blur-md border-b border-white/10 shadow-sm z-40">
        <div className="flex items-center gap-0.5 px-2 border-r border-white/10">
          <select 
            onChange={(e) => exec('fontName', e.target.value)}
            className="bg-transparent text-[11px] text-white/80 border border-white/10 rounded px-1 py-0.5 outline-none focus:border-blue-500/50 transition-all w-32 cursor-pointer hover:bg-white/5"
          >
            {['Inter', 'Roboto', 'Open Sans', 'Montserrat', 'Poppins', 'JetBrains Mono', 'Playfair Display'].map(font => (
              <option key={font} className="bg-slate-900" value={font}>{font}</option>
            ))}
          </select>
          <select 
            onChange={(e) => exec('fontSize', e.target.value)}
            className="bg-transparent text-[11px] text-white/80 border border-white/10 rounded px-1 py-0.5 outline-none focus:border-blue-500/50 transition-all w-16 cursor-pointer ml-1 hover:bg-white/5"
          >
            {[1,2,3,4,5,6,7].map(size => (
              <option key={size} className="bg-slate-900" value={size}>{size * 3 + 7}pt</option>
            ))}
          </select>
        </div>

        <div className="flex items-center gap-0.5 px-2 border-r border-white/10">
          <ToolbarButton icon={<Bold size={14} />} onClick={() => exec('bold')} tooltip="Bold" />
          <ToolbarButton icon={<Italic size={14} />} onClick={() => exec('italic')} tooltip="Italic" />
          <ToolbarButton icon={<Underline size={14} />} onClick={() => exec('underline')} tooltip="Underline" />
          <ToolbarButton icon={<Eraser size={14} />} onClick={() => exec('removeFormat')} tooltip="Clear Format" />
        </div>

        <div className="flex items-center gap-0.5 px-2 border-r border-white/10">
          <ToolbarButton icon={<AlignLeft size={14} />} onClick={() => exec('justifyLeft')} tooltip="Align Left" />
          <ToolbarButton icon={<AlignCenter size={14} />} onClick={() => exec('justifyCenter')} tooltip="Center" />
          <ToolbarButton icon={<AlignRight size={14} />} onClick={() => exec('justifyRight')} tooltip="Align Right" />
        </div>

        <div className="flex items-center gap-0.5 px-2">
          <ToolbarButton icon={<ListIcon size={14} />} onClick={() => exec('insertUnorderedList')} tooltip="Bullets" />
          <ToolbarButton icon={<Indent size={14} />} onClick={() => exec('indent')} tooltip="Indent" />
          <ToolbarButton icon={<Outdent size={14} />} onClick={() => exec('outdent')} tooltip="Outdent" />
        </div>
        
        <div className="ml-auto flex items-center gap-1 pr-2">
           <ToolbarButton icon={<Save size={14} />} onClick={handleSave} tooltip="Save (Documents)" />
           <ToolbarButton icon={<Printer size={14} />} onClick={handlePrint} tooltip="Print" />
        </div>
      </div>

      {/* Word 4.0 Style Ruler */}
      <div className="h-6 flex items-center bg-white/5 border-b border-white/10 relative overflow-hidden select-none">
        <div className="absolute inset-y-0 left-0 w-[40px] bg-white/5 border-r border-white/10 flex items-center justify-center">
           <span className="text-[9px] text-white/40 uppercase font-bold tracking-tighter">In</span>
        </div>
        <div className="flex-1 flex px-4">
          {Array.from({ length: 20 }).map((_, i) => (
            <div key={i} className="flex-1 border-l border-white/10 h-2 flex flex-col justify-end">
              {i % 2 === 0 && <span className="text-[8px] text-white/20 -mb-4 -ml-1 select-none">{i}</span>}
              <div className="h-1 w-px bg-white/20 self-center" />
            </div>
          ))}
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 overflow-y-auto bg-black/20 p-8 flex justify-center custom-scrollbar" onClick={() => {
        if (editorRef.current) editorRef.current.focus();
        setActiveMenu(null);
      }}>
        <div 
          className="w-full max-w-[816px] min-h-[1056px] bg-white/95 text-slate-900 p-[96px] shadow-2xl transform transition-transform duration-300 hover:scale-[1.005] focus:outline-none ring-1 ring-white/50 relative cursor-text selection:bg-blue-100 selection:text-slate-900"
          contentEditable
          suppressContentEditableWarning
          ref={editorRef}
          onInput={(e: any) => {
            const html = e.currentTarget.innerHTML;
            lastContent.current = html;
            setContent(html);
          }}
          style={{ 
            fontFamily: 'Inter, sans-serif',
            fontSize: '12pt',
            lineHeight: '1.6',
            boxShadow: '0 0 50px rgba(0,0,0,0.3)',
            borderRadius: '2px'
          }}
        />
      </div>

      {/* Dialogs */}
      <AnimatePresence>
        {showOpenDialog && (
          <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm shadow-2xl">
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-slate-900 border border-white/10 rounded-2xl w-full max-w-md overflow-hidden"
            >
              <div className="p-4 border-b border-white/10 flex justify-between items-center bg-white/5">
                <h3 className="text-sm font-bold uppercase tracking-wider text-white/80">Open Document</h3>
                <button onClick={() => setShowOpenDialog(false)} className="text-white/40 hover:text-white"><X size={16} /></button>
              </div>
              <div className="p-4 max-h-60 overflow-y-auto custom-scrollbar">
                {findItemByPath(fs, ['Documents'])?.children?.filter(f => f.type === 'file' && f.name.endsWith('.gdoc')).map(file => (
                  <button 
                    key={file.name}
                    onClick={() => handleOpen(file, ['Documents'])}
                    className="w-full text-left p-3 rounded-lg hover:bg-white/5 flex items-center gap-3 group transition-all"
                  >
                    <FileText className="text-blue-400 group-hover:scale-110 transition-transform" size={18} />
                    <div>
                      <div className="text-xs text-white/80">{file.name}</div>
                      <div className="text-[10px] text-white/20">GlassWord Document</div>
                    </div>
                  </button>
                )) || <div className="text-center py-8 text-white/20 text-xs">No documents found in /Documents</div>}
              </div>
            </motion.div>
          </div>
        )}

        {showSaveDialog && (
          <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-slate-900 border border-white/10 rounded-2xl w-full max-w-md"
            >
              <div className="p-4 border-b border-white/10 flex justify-between items-center bg-white/5">
                <h3 className="text-sm font-bold uppercase tracking-wider text-white/80">Save Document As</h3>
                <button onClick={() => setShowSaveDialog(false)} className="text-white/40 hover:text-white"><X size={16} /></button>
              </div>
              <div className="p-6 space-y-4">
                <div>
                  <label className="text-[10px] font-bold text-white/30 uppercase tracking-widest mb-1.5 block px-1">File Name</label>
                  <div className="relative">
                    <input 
                      autoFocus
                      type="text"
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm focus:border-blue-500/50 outline-none transition-all pr-16"
                      placeholder="Enter filename..."
                      value={saveFileName}
                      onChange={(e) => setSaveFileName(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && handleSaveAs()}
                    />
                    <span className="absolute right-4 top-1/2 -translate-y-1/2 text-[10px] font-bold text-white/20 uppercase">.gdoc</span>
                  </div>
                </div>
                <div className="flex items-center gap-2 text-[10px] text-white/30 px-1 italic italic-font">
                   <Folder size={12} /> Saving to: /GlassDrive/Documents
                </div>
                <button 
                  onClick={handleSaveAs}
                  className="w-full py-3 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold transition-all shadow-lg shadow-blue-900/20 active:scale-[0.98]"
                >
                  Confirm Save
                </button>
              </div>
            </motion.div>
          </div>
        )}

        {showInsertPicker && (
          <FilePicker 
            title={insertType === 'image' ? "Insert Image" : "Insert Sheet"}
            fs={fs}
            fsLib={fsLib}
            mode="open"
            allowedExtensions={insertType === 'image' ? ['jpeg', 'jpg', 'png', 'gif', 'img', 'gdraw', 'gpaint'] : ['gsheet']}
            accentColor="#3b82f6"
            onCancel={() => setShowInsertPicker(false)}
            onSelect={handleInsertFile}
          />
        )}
      </AnimatePresence>

      {/* Status Bar */}
      <div className="h-6 flex items-center justify-between px-4 bg-white/10 backdrop-blur-xl border-t border-white/10 text-[10px] text-white/40 font-bold uppercase tracking-widest select-none">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1.5">
            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            <span>{activeFile ? activeFile.name : 'Untitled Document'}</span>
          </div>
          <div className="w-[1px] h-3 bg-white/10" />
          <span>Words: {content.replace(/<[^>]*>?/gm, '').split(/\s+/).filter(Boolean).length}</span>
          <div className="w-[1px] h-3 bg-white/10" />
          <span className="text-blue-400/60 lowercase italic font-medium transition-all">Last saved: {lastSaved}</span>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1 bg-white/5 px-2 rounded-full border border-white/5 text-[8px]">
             <span className="text-emerald-400">GlassSync Enabled</span>
          </div>
          <span>UTF-8</span>
          <div className="flex items-center gap-1 text-white/20">
             <Monitor size={10} />
             <span>100%</span>
          </div>
        </div>
      </div>
    </div>
  );
}

function ToolbarButton({ icon, onClick, tooltip }: { icon: React.ReactNode, onClick: () => void, tooltip: string }) {
  return (
    <button
      onClick={(e) => {
        e.stopPropagation();
        onClick();
      }}
      title={tooltip}
      className="p-1.5 rounded hover:bg-white/10 text-white/60 hover:text-white transition-all active:scale-95 group relative"
    >
      {icon}
      <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 bg-slate-900 text-[9px] rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap border border-white/10 uppercase tracking-widest font-bold z-50">
        {tooltip}
      </div>
    </button>
  );
}

function SettingsApp(props: any) {
  const { 
    userName, setUserName, 
    wallpaper, setWallpaper, 
    accentColor, setAccentColor,
    systemFontFamily, setSystemFontFamily,
    systemFontSize, setSystemFontSize,
    systemFontWeight, setSystemFontWeight,
    handleLogout,
    networkStatus, setNetworkStatus,
    connectedNetwork, setConnectedNetwork,
    networkConfig,
    users,
    setUsers,
    setActiveScreensaver,
    addNotification,
    fs,
    tasks,
    builds,
    serverStatus,
    networkNodes, setNetworkNodes,
    isAdmin, setIsAdmin, isSandboxed, setIsSandboxed, requestSudo,
  } = props;
  const [view, setView] = useState<'main' | 'personalization' | 'network' | 'control-panel' | 'extensions' | 'accounts' | 'hardware'>('main');
  const [activeControl, setActiveControl] = useState<string | null>(null);
  const [displayConfig, setDisplayConfig] = useState(DisplayLib.getConfig());
  const [extensions, setExtensions] = useState([
    { id: '1', name: 'Dark Mode Pro', version: '1.2.0', enabled: true, description: 'Enhanced dark mode for all system apps.' },
    { id: '2', name: 'AdBlocker Plus', version: '3.4.1', enabled: false, description: 'Block annoying ads in the browser.' },
    { id: '3', name: 'System Optimizer', version: '2.0.5', enabled: true, description: 'Keep your GlassOS running smoothly.' },
    { id: '4', name: 'Custom Fonts', version: '1.0.1', enabled: true, description: 'Install and use custom fonts system-wide.' },
    { id: 'db-engine', name: 'GlassDatabase Core', version: '1.0.0', enabled: true, description: 'System backbone for Email and Messaging shards.' },
    { id: 'mail-ext', name: 'GlassMail Extension', version: '1.0.0', enabled: true, description: 'Client for the secure GlassOS mail protocol.' },
    { id: 'msg-ext', name: 'Comms Extension', version: '1.0.0', enabled: true, description: 'Unified messaging layer for GlassOS users.' },
  ]);
  const [selectedScreensaver, setSelectedScreensaver] = useState('Matrix Rain');
  const [isEditingName, setIsEditingName] = useState(false);
  const [newName, setNewName] = useState(userName);
  const [isConnecting, setIsConnecting] = useState(false);
  const [hardwareStats, setHardwareStats] = useState({
    screen: {
      resolution: `${window.screen.width}x${window.screen.height}`,
      pixelRatio: window.devicePixelRatio,
      colorDepth: window.screen.colorDepth,
      orientation: window.screen.orientation?.type || 'unknown'
    },
    network: {
      type: (navigator as any).connection?.effectiveType || 'unknown',
      downlink: (navigator as any).connection?.downlink || 0,
      rtt: (navigator as any).connection?.rtt || 0,
      saveData: (navigator as any).connection?.saveData || false
    }
  });

  useEffect(() => {
    const updateHardware = () => {
      setHardwareStats({
        screen: {
          resolution: `${window.screen.width}x${window.screen.height}`,
          pixelRatio: window.devicePixelRatio,
          colorDepth: window.screen.colorDepth,
          orientation: window.screen.orientation?.type || 'unknown'
        },
        network: {
          type: (navigator as any).connection?.effectiveType || 'unknown',
          downlink: (navigator as any).connection?.downlink || 0,
          rtt: (navigator as any).connection?.rtt || 0,
          saveData: (navigator as any).connection?.saveData || false
        }
      });
    };

    window.addEventListener('resize', updateHardware);
    if ((navigator as any).connection) {
      (navigator as any).connection.addEventListener('change', updateHardware);
    }

    return () => {
      window.removeEventListener('resize', updateHardware);
      if ((navigator as any).connection) {
        (navigator as any).connection.removeEventListener('change', updateHardware);
      }
    };
  }, []);

  const networks = ['GlassFiber_5G', 'Staff_WiFi', 'Neighbor_WiFi', 'Public_Hotspot'];

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

  const exportSystem = () => {
    const data = {
      username: userName,
      wallpaper,
      fs,
      tasks,
      builds,
      timestamp: new Date().toISOString()
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `glassos-backup-${new Date().getTime()}.json`;
    a.click();
    URL.revokeObjectURL(url);
    addNotification('Storage', 'System backup exported', 'success');
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
          onClick={() => setView('hardware')}
          className={cn("w-full text-left px-3 py-2 rounded-lg transition-all text-sm", view === 'hardware' ? "bg-white/10" : "hover:bg-white/5")}
        >
          Hardware
        </button>
        <button 
          onClick={() => {
            if (isAdmin) setView('network');
            else requestSudo(() => setView('network'));
          }}
          className={cn(
            "w-full text-left px-3 py-2 rounded-lg transition-all text-sm flex items-center justify-between group",
            view === 'network' ? "bg-white/10 text-white" : "text-white/40 hover:bg-white/5 hover:text-white"
          )}
        >
          <span>Network</span>
          {!isAdmin && <Lock size={12} className="text-red-500/50 group-hover:text-red-500 transition-all drop-shadow-[0_0_8px_rgba(239,68,68,0.3)]" />}
        </button>
        <button 
          onClick={() => {
            if (isAdmin) setView('control-panel');
            else requestSudo(() => setView('control-panel'));
          }}
          className={cn(
            "w-full text-left px-3 py-2 rounded-lg transition-all text-sm flex items-center justify-between group",
            view === 'control-panel' ? "bg-white/10 text-white" : "text-white/40 hover:bg-white/5 hover:text-white"
          )}
        >
          <span>Control Panel</span>
          {!isAdmin && <Lock size={12} className="text-red-500/50 group-hover:text-red-500 transition-all drop-shadow-[0_0_8px_rgba(239,68,68,0.3)]" />}
        </button>
        <button 
          onClick={() => setView('extensions')}
          className={cn("w-full text-left px-3 py-2 rounded-lg transition-all text-sm", view === 'extensions' ? "bg-white/10" : "hover:bg-white/5")}
        >
          Extensions
        </button>
        <button 
          onClick={() => setView('accounts')}
          className={cn("w-full text-left px-3 py-2 rounded-lg transition-all text-sm", view === 'accounts' ? "bg-white/10" : "hover:bg-white/5")}
        >
          Accounts
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
                <p className="text-xs text-white/50">Persistence: IndexedDB (Active)</p>
              </div>
            </div>

            <div className="glass p-6 rounded-2xl border border-white/10">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <Cloud size={20} className={cn(
                    "transition-colors",
                    serverStatus === 'online' ? "text-blue-400" : serverStatus === 'syncing' ? "text-amber-400" : "text-white/20"
                  )} />
                  <div>
                    <h3 className="text-sm font-bold">Cloud Sync</h3>
                    <p className="text-[10px] text-white/30 truncate">
                      {serverStatus === 'online' ? "Synced with GlassOS Cloud" : 
                       serverStatus === 'syncing' ? "Uploading changes..." : 
                       "Offline - Using local database"}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <div className={cn(
                    "w-2 h-2 rounded-full",
                    serverStatus === 'online' ? "bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.5)]" : 
                    serverStatus === 'syncing' ? "bg-amber-500 animate-pulse" : 
                    "bg-red-500"
                  )} />
                  <span className="text-[10px] text-white/40 uppercase">
                    {serverStatus}
                  </span>
                </div>
              </div>
              
              <div className="flex gap-3 mt-4">
                <button 
                  onClick={exportSystem}
                  className="flex-1 flex items-center justify-center gap-2 glass-button text-[10px] text-white/60 hover:text-white"
                >
                  <Download size={12} />
                  Export Backup
                </button>
                <div className="relative group flex-1">
                  <button className="w-full flex items-center justify-center gap-2 glass-button text-[10px] text-white/60 hover:text-white">
                    <Upload size={12} />
                    Import Backup
                  </button>
                </div>
              </div>
              <p className="mt-4 text-[10px] text-white/20 leading-relaxed">
                System persistence is automatically managed by the IndexedDB Local Engine. 
                Manual exports are recommended for cross-device migration.
              </p>
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
          <div className="flex flex-col gap-8">
            <section>
              <h2 className="text-sm font-bold uppercase tracking-widest text-white/30 mb-4 px-1">Background</h2>
              <div className="grid grid-cols-3 gap-4">
                {WALLPAPERS.map((wp, i) => (
                  <div 
                    key={i}
                    onClick={() => {
                      setWallpaper(wp);
                      addNotification('Personalization', 'Wallpaper updated', 'success');
                    }}
                    className={cn(
                      "aspect-video rounded-xl overflow-hidden cursor-pointer border-2 shadow-lg transition-all hover:scale-105 active:scale-95",
                      wallpaper === wp ? "border-blue-400" : "border-transparent"
                    )}
                  >
                    <img src={wp} alt={`Wallpaper ${i}`} className="w-full h-full object-cover" />
                  </div>
                ))}
              </div>
            </section>

            <section className="glass p-6 rounded-2xl border border-white/10">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2 bg-blue-500/20 rounded-lg">
                  <Type size={18} className="text-blue-400" />
                </div>
                <div>
                  <h2 className="text-sm font-bold uppercase tracking-widest text-white/90">Typography</h2>
                  <p className="text-[10px] text-white/30">Customize system-wide text rendering engine</p>
                </div>
              </div>

              <div className="space-y-6">
                {/* Font Family */}
                <div>
                  <label className="text-[10px] font-bold text-white/40 uppercase tracking-tighter mb-2 block">Font Family</label>
                  <div className="grid grid-cols-2 gap-2">
                    {['Inter', 'Roboto', 'Open Sans', 'Montserrat', 'Poppins', 'Playfair Display', 'JetBrains Mono'].map(font => (
                      <button
                        key={font}
                        onClick={() => setSystemFontFamily(font)}
                        style={{ fontFamily: font }}
                        className={cn(
                          "px-4 py-2 rounded-xl border text-sm transition-all text-left flex items-center justify-between group",
                          systemFontFamily === font ? "bg-blue-500/20 border-blue-500/50 text-white" : "bg-white/5 border-white/5 text-white/50 hover:bg-white/10"
                        )}
                      >
                        <span>{font}</span>
                        {systemFontFamily === font && <Check size={14} className="text-blue-400" />}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-6">
                  {/* Font Size */}
                  <div>
                    <label className="text-[10px] font-bold text-white/40 uppercase tracking-tighter mb-2 block">Base Size ({systemFontSize}px)</label>
                    <input 
                      type="range" 
                      min="12" 
                      max="24" 
                      step="1"
                      value={systemFontSize}
                      onChange={(e) => setSystemFontSize(e.target.value)}
                      className="w-full h-1.5 bg-white/10 rounded-lg appearance-none cursor-pointer accent-blue-500"
                    />
                    <div className="flex justify-between mt-2 px-1 text-[9px] text-white/20 font-bold">
                      <span>12PX</span>
                      <span>24PX</span>
                    </div>
                  </div>

                  {/* Font Weight */}
                  <div>
                    <label className="text-[10px] font-bold text-white/40 uppercase tracking-tighter mb-2 block">System Weight ({systemFontWeight})</label>
                    <div className="flex gap-2">
                      {['300', '400', '500', '600', '700'].map(weight => (
                        <button
                          key={weight}
                          onClick={() => setSystemFontWeight(weight)}
                          className={cn(
                            "flex-1 py-2 rounded-lg border text-xs font-bold transition-all",
                            systemFontWeight === weight ? "bg-blue-500/20 border-blue-500/50 text-white" : "bg-white/5 border-white/5 text-white/30 hover:bg-white/10"
                          )}
                        >
                          {weight === '400' ? 'REG' : weight === '700' ? 'BOLD' : weight}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="p-4 bg-white/5 rounded-xl border border-white/5 mt-4">
                  <p className="text-[10px] text-white/30 mb-2 font-bold uppercase tracking-widest">Live Preview</p>
                  <p 
                    style={{ 
                      fontFamily: systemFontFamily, 
                      fontSize: `${systemFontSize}px`, 
                      fontWeight: systemFontWeight 
                    }}
                    className="text-white leading-relaxed"
                  >
                    The quick brown fox jumps over the lazy dog. System rendering is optimized for modern high-DPI displays.
                  </p>
                </div>
              </div>
            </section>
          </div>
        )}

        {view === 'hardware' && (
          <div className="flex flex-col gap-8">
            <section className="glass p-6 rounded-2xl border border-white/10">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2 bg-purple-500/20 rounded-lg">
                  <Monitor size={18} className="text-purple-400" />
                </div>
                <div>
                  <h2 className="text-sm font-bold uppercase tracking-widest text-white/90">Monitor Engine</h2>
                  <p className="text-[10px] text-white/30">Optical persistence and virtual display mapping</p>
                </div>
              </div>

              <div className="space-y-8">
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <label className="text-[10px] font-bold text-white/40 uppercase tracking-tighter">Blur Persistence ({(displayConfig.blurPersistence * 100).toFixed(0)}%)</label>
                    <span className="text-[10px] text-purple-400 font-mono tracking-widest">LAYER: FROST_GLASS</span>
                  </div>
                  <input 
                    type="range" 
                    min="0" 
                    max="1" 
                    step="0.05"
                    value={displayConfig.blurPersistence}
                    onChange={(e) => {
                      const val = parseFloat(e.target.value);
                      setDisplayConfig(prev => ({ ...prev, blurPersistence: val }));
                      DisplayLib.updateConfig({ blurPersistence: val });
                    }}
                    className="w-full h-1.5 bg-white/10 rounded-lg appearance-none cursor-pointer accent-purple-500"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <button 
                    onClick={() => {
                      const next = !displayConfig.motionBlur;
                      setDisplayConfig(prev => ({ ...prev, motionBlur: next }));
                      DisplayLib.updateConfig({ motionBlur: next });
                    }}
                    className={cn(
                      "flex items-center justify-between p-4 rounded-xl border transition-all",
                      displayConfig.motionBlur ? "bg-purple-500/10 border-purple-500/30" : "bg-white/5 border-white/5 opacity-50"
                    )}
                  >
                    <div className="flex items-center gap-3">
                      <Zap size={16} className={displayConfig.motionBlur ? "text-purple-400" : "text-white/20"} />
                      <span className="text-xs font-bold">Motion Blur</span>
                    </div>
                    {displayConfig.motionBlur && <Check size={12} className="text-purple-400" />}
                  </button>

                  <button 
                    onClick={() => {
                      const next = !displayConfig.ghostingEnabled;
                      setDisplayConfig(prev => ({ ...prev, ghostingEnabled: next }));
                      DisplayLib.updateConfig({ ghostingEnabled: next });
                    }}
                    className={cn(
                      "flex items-center justify-between p-4 rounded-xl border transition-all",
                      displayConfig.ghostingEnabled ? "bg-purple-500/10 border-purple-500/30" : "bg-white/5 border-white/5 opacity-50"
                    )}
                  >
                    <div className="flex items-center gap-3">
                      <Eye size={16} className={displayConfig.ghostingEnabled ? "text-purple-400" : "text-white/20"} />
                      <span className="text-xs font-bold">Ghosting</span>
                    </div>
                    {displayConfig.ghostingEnabled && <Check size={12} className="text-purple-400" />}
                  </button>
                </div>

                <div className="pt-6 border-t border-white/5">
                  <h3 className="text-[10px] font-bold text-white/20 uppercase tracking-widest mb-4">Virtual Display Grid</h3>
                  <div className="grid grid-cols-3 gap-2">
                    {[1, 2, 3].map(id => (
                      <div key={id} className="aspect-video glass bg-black/40 rounded-lg border border-white/5 flex flex-col items-center justify-center gap-1 group cursor-pointer hover:border-purple-500/50 transition-all">
                        <Monitor size={16} className="text-white/10 group-hover:text-purple-400 transition-colors" />
                        <span className="text-[8px] text-white/20 font-bold tracking-tighter uppercase">Processor B{id}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </section>
          </div>
        )}

                    {view === 'network' && (
          <div className="flex flex-col gap-8">
            <div className="glass p-6 rounded-3xl border border-white/10 relative overflow-hidden">
               <div className="absolute top-0 right-0 p-8 opacity-5">
                 <Wifi size={120} />
               </div>
               <div className="relative z-10">
                <h2 className="text-xl font-bold mb-6 flex items-center gap-3">
                  <Wifi size={24} className="text-blue-400" />
                  Kernel Networking
                </h2>
                <div className="grid grid-cols-2 gap-6 mb-8">
                  <div className="space-y-4">
                    <div>
                      <label className="text-[10px] uppercase font-bold text-white/30 tracking-widest block mb-1">Local Hostname (mDNS)</label>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-mono text-blue-400">{networkConfig.hostname}</span>
                        <div className="px-2 py-0.5 rounded-full bg-blue-500/10 border border-blue-500/20 text-[9px] text-blue-400 font-bold uppercase tracking-tighter animate-pulse">Broadcasting</div>
                      </div>
                    </div>
                    <div>
                      <label className="text-[10px] uppercase font-bold text-white/30 tracking-widest block mb-1">Assigned IPv4</label>
                      <span className="text-sm font-mono">{networkConfig.ip}</span>
                    </div>
                  </div>
                  <div className="space-y-4 border-l border-white/5 pl-6">
                    <div>
                      <label className="text-[10px] uppercase font-bold text-white/30 tracking-widest block mb-1">Hardware Interface</label>
                      <span className="text-sm font-mono text-white/70 uppercase">{networkConfig.mac}</span>
                    </div>
                    <div>
                      <label className="text-[10px] uppercase font-bold text-white/30 tracking-widest block mb-1">Transcode Speed</label>
                      <span className="text-sm font-mono">{networkConfig.speed}</span>
                    </div>
                  </div>
                </div>

                {/* Protocol Backbone */}
                <div className="grid grid-cols-2 gap-4 mb-8">
                   <div className="glass p-4 rounded-2xl border border-white/5 bg-white/5">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-2">
                          <MessageSquare size={14} className="text-emerald-400" />
                          <span className="text-xs font-bold uppercase tracking-wider">XMPP Core</span>
                        </div>
                        <div className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
                      </div>
                      <div className="space-y-1">
                        <div className="text-[10px] text-white/40 font-mono">JID: {networkConfig.protocols.xmpp.jid}</div>
                        <div className="text-[10px] text-white/40 font-mono">ENC: TLS 1.3 / OMEMO</div>
                        <div className="text-[10px] text-emerald-400/60 font-mono uppercase tracking-widest">Status: {networkConfig.protocols.xmpp.status}</div>
                      </div>
                   </div>
                   <div className="glass p-4 rounded-2xl border border-white/5 bg-white/5">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-2">
                          <Layers size={14} className="text-purple-400" />
                          <span className="text-xs font-bold uppercase tracking-wider">gRPC Bridge</span>
                        </div>
                        <div className="w-2 h-2 rounded-full bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.5)]" />
                      </div>
                      <div className="space-y-1">
                        <div className="text-[10px] text-white/40 font-mono">Service: {networkConfig.protocols.grpc.service}</div>
                        <div className="text-[10px] text-white/40 font-mono">Proto: mail.v1.proto</div>
                        <div className="text-[10px] text-blue-400/60 font-mono uppercase tracking-widest">State: {networkConfig.protocols.grpc.connection}</div>
                      </div>
                   </div>
                </div>

                <div className="p-4 bg-white/5 rounded-2xl border border-white/10">
                  <h3 className="text-xs font-bold mb-4 flex items-center gap-2">
                    <Command size={14} className="text-blue-400" />
                    mDNS Discoverable Backbone
                  </h3>
                  <div className="space-y-3">
                    {networkNodes.map(node => (
                      <div key={node.id} className="glass p-4 rounded-xl border border-white/10 flex items-center justify-between group hover:border-blue-500/30 transition-all">
                        <div className="flex items-center gap-4">
                          <div className={cn("w-10 h-10 rounded-lg flex items-center justify-center border transition-all", 
                            node.status === 'online' ? "bg-blue-500/10 border-blue-500/30 text-blue-400" : "bg-white/5 border-white/10 text-white/20")}>
                            <Server size={20} className={node.status === 'online' ? "animate-pulse" : ""} />
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <h4 className="text-sm font-bold text-white group-hover:text-blue-400 transition-colors uppercase tracking-tight">{node.hostname}</h4>
                              {node.isAuthorized && <Shield size={12} className="text-emerald-400 drop-shadow-[0_0_5px_rgba(52,211,153,0.5)]" />}
                            </div>
                            <p className="text-[9px] text-white/30 font-mono tracking-tighter uppercase">{node.ip} • Services: {node.services.join(', ')}</p>
                          </div>
                        </div>
                        {node.status === 'online' ? (
                          node.isAuthorized ? (
                            <div className="flex flex-col items-end gap-1">
                               <div className="flex items-center gap-2">
                                  <CheckCircle2 size={12} className="text-emerald-400" />
                                  <span className="text-[10px] text-emerald-400 font-bold uppercase tracking-widest">OAuth2 Auth'd</span>
                               </div>
                               <button 
                                 onClick={() => {
                                   setNetworkNodes((prev: any) => prev.map((n: any) => n.id === node.id ? {...n, isAuthorized: false} : n));
                                   addNotification('Security', `Revoked OAuth2 Grant for ${node.hostname}`, 'warning');
                                 }}
                                 className="text-[9px] text-white/20 hover:text-red-400 transition-colors uppercase font-bold"
                               >
                                 Revoke Token
                               </button>
                            </div>
                          ) : (
                            <button 
                              onClick={() => {
                                addNotification('OAuth2', `Initiating Handshake with ${node.hostname}...`, 'info');
                                setTimeout(() => {
                                  setNetworkNodes((prev: any) => prev.map((n: any) => n.id === node.id ? {...n, isAuthorized: true} : n));
                                  addNotification('Security', `Token generated for ${node.hostname}`, 'success');
                                }, 1500);
                              }}
                              className="px-4 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-[10px] font-bold shadow-lg shadow-blue-500/20 transition-all uppercase tracking-widest translate-y-0 active:translate-y-0.5"
                            >
                              Authorize
                            </button>
                          )
                        ) : (
                          <div className="px-3 py-1 rounded bg-white/5 border border-white/10 text-[9px] text-white/20 font-bold uppercase tracking-widest">Node Offline</div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
               </div>
            </div>

            <div>
              <h2 className="text-sm font-bold mb-4 px-2 uppercase tracking-[0.2em] text-white/30">Local Wi-Fi</h2>
              <div className="flex flex-col gap-2 px-2">
                {networks.map(net => (
                  <div key={net} className="glass p-4 rounded-xl flex items-center justify-between group hover:bg-white/15 transition-all border border-white/5">
                    <div className="flex items-center gap-4">
                      <Wifi size={18} className={connectedNetwork === net ? "text-blue-400 animate-pulse" : "text-white/40"} />
                      <span className="text-sm font-medium">{net}</span>
                    </div>
                    {connectedNetwork === net ? (
                      <span className="text-[10px] text-blue-400 font-bold uppercase tracking-widest bg-blue-500/10 px-2 py-1 rounded border border-blue-500/20">Active</span>
                    ) : (
                      <button 
                        onClick={() => handleConnect(net)}
                        disabled={isConnecting}
                        className="text-[10px] px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/20 transition-all disabled:opacity-50 font-bold uppercase tracking-widest border border-white/10"
                      >
                        {isConnecting ? 'Syncing...' : 'Switch'}
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>
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

            {!activeControl && (
              <div className="glass p-6 rounded-2xl space-y-6">
                <div>
                  <h3 className="text-sm font-bold uppercase tracking-wider mb-4 flex items-center gap-2">
                    <Palette size={16} className="text-blue-400" />
                    System Accent Color
                  </h3>
                  <div className="flex flex-wrap gap-3">
                    {['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#06b6d4', '#71717a', '#ffffff', '#fbbf24'].map(color => (
                      <button
                        key={color}
                        onClick={() => {
                          setAccentColor(color);
                          addNotification('Personalization', 'System accent color updated', 'success');
                        }}
                        className={cn(
                          "w-10 h-10 rounded-xl border-2 transition-all hover:scale-110",
                          accentColor === color ? "border-white scale-105 shadow-[0_0_15px_rgba(255,255,255,0.3)]" : "border-transparent"
                        )}
                        style={{ backgroundColor: color }}
                      />
                    ))}
                    <div className="flex items-center gap-2 px-3 py-1 bg-white/5 rounded-xl border border-white/10">
                      <div className="w-6 h-6 rounded-md border border-white/10" style={{ backgroundColor: accentColor }} />
                      <input 
                        type="text" 
                        value={accentColor}
                        onChange={(e) => setAccentColor(e.target.value)}
                        className="bg-transparent border-none outline-none text-[10px] font-mono w-16 text-white/70"
                      />
                    </div>
                  </div>
                  <p className="text-[10px] text-white/30 mt-3 italic">This color will be applied to folders and files system-wide.</p>
                </div>
              </div>
            )}

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
                {activeControl === 'security' && (
                  <div className="space-y-6">
                    <div className="flex items-center justify-between border-b border-white/10 pb-2">
                       <h3 className="text-sm font-medium">Kernel Security & Policy</h3>
                       <Shield size={16} className="text-red-400" />
                    </div>
                    
                    <div className="space-y-4">
                      <div className="glass p-4 rounded-xl border border-white/5 space-y-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-xs font-bold text-white/90">Script Sandboxing</p>
                            <p className="text-[10px] text-white/30">Force .scr/.b files to request FS permissions</p>
                          </div>
                          <button 
                            onClick={() => {
                              const next = !isSandboxed;
                              setIsSandboxed(next);
                              AuthLib.setSandbox(next);
                              addNotification('Security', `Script Sandboxing ${next ? 'Enforced' : 'Disabled'}`, next ? 'success' : 'warning');
                            }}
                            className={cn(
                              "w-10 h-5 rounded-full relative transition-all",
                              isSandboxed ? "bg-red-600" : "bg-white/10"
                            )}
                          >
                            <div className={cn(
                              "absolute top-1 w-3 h-3 bg-white rounded-full transition-all",
                              isSandboxed ? "left-6" : "left-1"
                            )} />
                          </button>
                        </div>
                        
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-xs font-bold text-white/90">Gatekeeper Persistence</p>
                            <p className="text-[10px] text-white/30">Logout triggers immediate Sudo revocation</p>
                          </div>
                          <div className="w-10 h-5 rounded-full bg-red-600/50 relative opacity-50 cursor-not-allowed">
                            <div className="absolute top-1 left-6 w-3 h-3 bg-white rounded-full" />
                          </div>
                        </div>
                      </div>

                      <button 
                        onClick={() => {
                          AuthLib.revokeSudo();
                          setIsAdmin(false);
                          addNotification('Security', 'Administrative session revoked', 'info');
                        }}
                        className="w-full py-2 bg-red-600/20 text-red-400 border border-red-500/30 rounded-lg text-[10px] font-bold hover:bg-red-600/30 transition-all uppercase tracking-widest"
                      >
                        Revoke Sudo Access
                      </button>
                    </div>
                  </div>
                )}
                
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
                        <div className="flex justify-between text-xs text-cyan-400 font-bold uppercase tracking-tighter">
                          <span>Brightness Control</span>
                          <span>85%</span>
                        </div>
                        <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
                          <div className="h-full bg-cyan-400 w-[85%]" />
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div className="glass p-3 rounded-xl border border-white/5 bg-white/5">
                          <p className="text-[10px] text-white/30 uppercase font-bold mb-1">Resolution</p>
                          <p className="text-xs font-mono text-cyan-400">{hardwareStats.screen.resolution}</p>
                        </div>
                        <div className="glass p-3 rounded-xl border border-white/5 bg-white/5">
                          <p className="text-[10px] text-white/30 uppercase font-bold mb-1">Pixel Ratio</p>
                          <p className="text-xs font-mono text-cyan-400">{hardwareStats.screen.pixelRatio.toFixed(2)}x</p>
                        </div>
                        <div className="glass p-3 rounded-xl border border-white/5 bg-white/5">
                          <p className="text-[10px] text-white/30 uppercase font-bold mb-1">Color Depth</p>
                          <p className="text-xs font-mono text-cyan-400">{hardwareStats.screen.colorDepth} bit</p>
                        </div>
                        <div className="glass p-3 rounded-xl border border-white/5 bg-white/5">
                          <p className="text-[10px] text-white/30 uppercase font-bold mb-1">Orientation</p>
                          <p className="text-xs font-mono text-cyan-400 truncate">{hardwareStats.screen.orientation}</p>
                        </div>
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
                    
                    <div className="grid grid-cols-2 gap-3">
                       <div className="glass p-3 rounded-xl border border-white/5 bg-blue-500/5">
                          <div className="flex items-center gap-2 mb-2">
                             <Activity size={12} className="text-blue-400" />
                             <span className="text-[10px] font-bold text-white/40 uppercase">Bandwidth</span>
                          </div>
                          <div className="text-sm font-mono text-blue-400">{hardwareStats.network.downlink} Mbps</div>
                       </div>
                       <div className="glass p-3 rounded-xl border border-white/5 bg-blue-500/5">
                          <div className="flex items-center gap-2 mb-2">
                             <Clock size={12} className="text-blue-400" />
                             <span className="text-[10px] font-bold text-white/40 uppercase">Latency (RTT)</span>
                          </div>
                          <div className="text-sm font-mono text-blue-400">{hardwareStats.network.rtt} ms</div>
                       </div>
                    </div>

                    <div className="space-y-3">
                      <div className="flex items-center justify-between p-2 rounded bg-white/5 border border-white/5 group hover:bg-white/10 transition-all">
                        <div className="flex flex-col">
                           <span className="text-[10px] font-bold text-white/20 uppercase tracking-tighter">Connection Type</span>
                           <span className="text-xs uppercase font-bold text-indigo-400">{hardwareStats.network.type}</span>
                        </div>
                        <div className="px-2 py-0.5 rounded-full bg-green-500/10 border border-green-500/20 text-[9px] text-green-500 font-bold uppercase tracking-tighter">Active</div>
                      </div>

                      <div className="flex items-center justify-between p-2 rounded bg-white/5 border border-white/5 group hover:bg-white/10 transition-all">
                        <span className="text-[10px] uppercase font-bold text-white/30">IP Address</span>
                        <span className="text-xs font-mono text-white/40">{props.networkConfig.ip}</span>
                      </div>
                      <div className="flex items-center justify-between p-2 rounded bg-white/5 border border-white/5 group hover:bg-white/10 transition-all">
                        <span className="text-[10px] uppercase font-bold text-white/30">MAC Address</span>
                        <span className="text-xs font-mono text-white/40">{props.networkConfig.mac}</span>
                      </div>
                      <div className="flex items-center justify-between p-2 rounded bg-white/5 border border-white/5 group hover:bg-white/10 transition-all">
                        <span className="text-[10px] uppercase font-bold text-white/30">Gateway</span>
                        <span className="text-xs font-mono text-white/40">{props.networkConfig.gateway}</span>
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
                      {props.users.map((u: UserAccount) => (
                        <div key={u.id} className="flex items-center justify-between p-3 rounded-xl bg-white/5 border border-white/5 group hover:bg-white/10 transition-all">
                          <div className="flex items-center gap-3">
                            <div className="relative">
                              <img src={u.avatar} alt={u.username} className="w-10 h-10 rounded-full object-cover" />
                              <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-black" />
                            </div>
                            <div className="flex flex-col">
                              <span className="text-xs font-semibold">{u.username}</span>
                              <span className="text-[10px] text-white/40 uppercase tracking-widest">{u.isAdmin ? 'Administrator' : 'Standard User'}</span>
                            </div>
                          </div>
                          <button 
                            onClick={() => setView('accounts')}
                            className="text-[10px] text-blue-400 hover:underline px-3 py-1 rounded bg-blue-500/10"
                          >
                            Manage
                          </button>
                        </div>
                      ))}
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

        {view === 'accounts' && (
          <div className="flex flex-col gap-6">
            <h2 className="text-xl font-medium">User Accounts</h2>
            <div className="grid gap-4">
              {props.users.map((u: UserAccount) => (
                <div key={u.id} className="glass p-5 rounded-2xl flex items-center justify-between group hover:bg-white/10 transition-all border border-white/5">
                  <div className="flex items-center gap-4">
                    <img src={u.avatar} alt={u.username} className="w-12 h-12 rounded-full object-cover border-2 border-white/10" />
                    <div>
                      <h3 className="text-sm font-semibold">{u.username}</h3>
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] text-white/40 uppercase tracking-widest">{u.isAdmin ? 'Administrator' : 'Standard User'}</span>
                        {props.currentUser?.id === u.id && (
                          <span className="px-1.5 py-0.5 rounded bg-blue-500/20 text-blue-400 text-[8px] font-bold uppercase">Current</span>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button 
                      onClick={() => addNotification('Accounts', `Settings for ${u.username}`, 'info')}
                      className="p-2 hover:bg-white/10 rounded-lg text-white/40 hover:text-white transition-all"
                    >
                      <SettingsIcon size={16} />
                    </button>
                    {!u.isAdmin && (
                      <button 
                        onClick={() => {
                          props.setUsers((prev: UserAccount[]) => prev.filter((user: any) => user.id !== u.id));
                          addNotification('Accounts', `Account ${u.username} removed`, 'warning');
                        }}
                        className="p-2 hover:bg-red-500/10 rounded-lg text-white/40 hover:text-red-400 transition-all"
                      >
                        <Trash2 size={16} />
                      </button>
                    )}
                  </div>
                </div>
              ))}
              <button 
                onClick={() => {
                  const name = prompt('Enter username:');
                  if (name) {
                    const newUser: UserAccount = {
                      id: Math.random().toString(36).substr(2, 9),
                      username: name,
                      avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${name}`,
                      isAdmin: false
                    };
                    props.setUsers((prev: UserAccount[]) => [...prev, newUser]);
                  }
                }}
                className="w-full p-4 rounded-2xl border-2 border-dashed border-white/10 hover:border-white/30 hover:bg-white/5 transition-all flex items-center justify-center gap-2 text-white/40 hover:text-white"
              >
                <Plus size={16} />
                <span className="text-sm font-medium">Add User Account</span>
              </button>
            </div>

            <div className="p-6 bg-blue-500/5 rounded-3xl border border-blue-500/10 space-y-4">
              <div className="flex items-center gap-3">
                <Shield size={20} className="text-blue-400" />
                <h3 className="text-sm font-bold uppercase tracking-wider">Account Security</h3>
              </div>
              <p className="text-xs text-white/60 leading-relaxed">
                Management of system accounts is restricted to administrators. Standard users cannot modify or remove other profiles. Multi-user login is handled at the system level.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function NotepadApp({ 
  notepadContent, 
  setNotepadContent, 
  notepadStyle,
  activeFileInNotepad, 
  setActiveFileInNotepad,
  setFs, 
  fs, 
  fsLib,
  addNotification,
  clipboardHistory,
  setClipboardHistory,
  closeWindow,
  userName,
  setPrintQueue,
  currentUser,
  calendarEvents,
  sheetData,
  openWindow,
  accentColor
}: any) {
  const [activeMenu, setActiveMenu] = useState<string | null>(null);
  const [showOpenDialog, setShowOpenDialog] = useState(false);
  const [showSaveDialog, setShowSaveDialog] = useState(false);
  const [saveFileName, setSaveFileName] = useState('');
  const [saveExtension, setSaveExtension] = useState('.txt');
  const [savePath, setSavePath] = useState<string[]>(['Documents']);
  const [showPreview, setShowPreview] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [isRenaming, setIsRenaming] = useState(false);
  const [renameValue, setRenameValue] = useState('');

  useEffect(() => {
    BridgeLib.registerApp('notepad', {
      getData: () => notepadContent,
      setData: (data: string) => {
        setNotepadContent(data);
        addNotification('Notepad', 'Data synced from Bridge', 'info');
      }
    });
    return () => BridgeLib.unregisterApp('notepad');
  }, [notepadContent, setNotepadContent, addNotification]);

  const handleRenameSubmit = () => {
    if (!activeFileInNotepad || !renameValue.trim()) {
      setIsRenaming(false);
      return;
    }

    const oldFullName = activeFileInNotepad.name;
    const newName = renameValue.trim();
    
    if (newName === oldFullName) {
      setIsRenaming(false);
      return;
    }

    const path = activeFileInNotepad.path.join('/');
    const oldPath = path + '/' + oldFullName;
    const newPath = path + '/' + newName;

    try {
      // Renaming in FS logic
      const fileContent = fsLib.read(oldPath);
      fsLib.delete(oldPath);
      fsLib.write(newPath, fileContent);
      
      setActiveFileInNotepad({ ...activeFileInNotepad, name: newName });
      addNotification('System', `Renamed ${oldFullName} to ${newName}`, 'success');
    } catch (e) {
      addNotification('System', 'Rename failed: File already exists or error occured', 'error');
    }
    setIsRenaming(false);
  };

  const importData = (type: 'calendar' | 'sheets') => {
    let textToInsert = '';
    if (type === 'calendar') {
      textToInsert = '\n--- CALENDAR EXPORT ---\n' + calendarEvents.map((e: any) => `[${e.date} ${e.time}] ${e.title} (${e.type})`).join('\n') + '\n---\n';
    } else {
      textToInsert = '\n--- SHEET EXPORT ---\n' + sheetData.map(row => row.filter(cell => cell.trim()).join(' | ')).filter(r => r).join('\n') + '\n---\n';
    }
    
    setNotepadContent((prev: string) => prev + textToInsert);
    addNotification('Notepad', `Imported ${type} data`, 'success');
    setActiveMenu(null);
  };

  const handleSave = () => {
    if (!activeFileInNotepad) {
      setShowSaveDialog(true);
      return;
    }

    const fullPath = activeFileInNotepad.path.join('/') + '/' + activeFileInNotepad.name;
    try {
      fsLib.write(fullPath, notepadContent);
      addNotification('Notepad', `Saved ${activeFileInNotepad.name}`, 'success');
    } catch (e) {
      addNotification('Notepad', 'Error saving file', 'error');
    }
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
    const baseName = saveFileName.endsWith(saveExtension) ? saveFileName.slice(0, -saveExtension.length) : saveFileName;
    let fileName = `${baseName}${saveExtension}`;
    
    // Find target folder implementation
    // Refactored to use fsLib

    try {
      const targetPath = savePath.join('/');
      const targetChildren = fsLib.list(targetPath);
      
      // Ensure unique name
      let counter = 1;
      while (targetChildren.some((i: any) => i.name === fileName)) {
        fileName = `${baseName} (${counter++})${saveExtension}`;
      }

      fsLib.write(targetPath ? `${targetPath}/${fileName}` : fileName, notepadContent);
      setActiveFileInNotepad({ name: fileName, path: [...savePath] });
      setShowSaveDialog(false);
      addNotification('Notepad', `Saved as ${fileName} in /${targetPath}`, 'success');
    } catch (e) {
      addNotification('Notepad', 'Error during Save As', 'error');
    }
  };

  const handlePrint = () => {
    const filename = activeFileInNotepad ? activeFileInNotepad.name : 'Untitled.txt';
    const newJob: PrintJob = {
      id: Math.random().toString(36).substr(2, 9),
      documentName: filename,
      filename,
      status: 'printing',
      timestamp: new Date().toLocaleTimeString(),
      owner: userName
    };
    
    setPrintQueue((prev: PrintJob[]) => [...prev, newJob]);
    addNotification('Print Manager', `Sending "${filename}" to printer...`, 'info');
    
    // Simulate printing process
    setTimeout(() => {
      setPrintQueue((prev: PrintJob[]) => 
        prev.map(job => job.id === newJob.id ? { ...job, status: 'completed' } : job)
      );
      addNotification('Print Manager', `Finished printing "${filename}"`, 'success');
    }, 5000);
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
          <button 
            onClick={(e) => { e.stopPropagation(); setActiveMenu(activeMenu === 'office' ? null : 'office'); }}
            className={cn("px-3 py-1 rounded hover:bg-white/10 transition-colors", activeMenu === 'office' && "bg-white/10")}
          >
            Office
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
                <MenuButton icon={<Printer size={14} />} label="Print File" onClick={handlePrint} />
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

        <div className="relative">
          <AnimatePresence>
            {activeMenu === 'office' && (
              <motion.div 
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 5 }}
                className="absolute top-full left-0 w-56 glass-dark border border-white/20 rounded-xl shadow-2xl z-50 py-2 mt-1"
              >
                <div className="px-4 py-1 text-[9px] font-bold text-white/20 uppercase tracking-widest border-b border-white/10 mb-1">Office Integration</div>
                <MenuButton 
                  icon={<FileText size={14} className="text-blue-400" />} 
                  label="Pull from GlassWord" 
                  onClick={() => {
                    const data = BridgeLib.getAppData('glassword');
                    if (data) setNotepadContent((prev: string) => prev + '\n' + data);
                    else addNotification('OLE', 'GlassWord is empty or not running', 'warning');
                    setActiveMenu(null);
                  }} 
                />
                <MenuButton 
                  icon={<Scissors size={14} className="text-pink-400" />} 
                  label="Pull Selection (Word)" 
                  onClick={() => {
                    const data = BridgeLib.getSelection('glassword');
                    if (data) setNotepadContent((prev: string) => prev + '\n' + data);
                    else addNotification('OLE', 'No selection found in Word', 'warning');
                    setActiveMenu(null);
                  }} 
                />
                <div className="h-px bg-white/10 my-1 mx-2" />
                <MenuButton icon={<Calendar size={14} className="text-blue-400" />} label="Import Calendar Events" onClick={() => importData('calendar')} />
                <MenuButton icon={<TableIcon size={14} className="text-emerald-400" />} label="Import Spreadsheet Data" onClick={() => importData('sheets')} />
                <div className="h-px bg-white/10 my-1 mx-2" />
                <MenuButton icon={<DatabaseIcon size={14} />} label="Database Shards" onClick={() => openWindow('glassdatabase', 'GlassDatabase')} />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Status Bar */}
      <div className="h-6 bg-white/5 border-b border-white/10 flex items-center px-4 justify-between">
        <div className="flex items-center gap-2">
          <FileText size={12} className={cn("transition-colors", isRenaming ? "text-blue-400" : "text-white/40")} />
          {isRenaming ? (
            <input
              autoFocus
              className="bg-blue-500/10 border border-blue-500/30 text-[9px] text-white px-1 outline-none rounded"
              value={renameValue}
              onChange={e => setRenameValue(e.target.value)}
              onBlur={handleRenameSubmit}
              onKeyDown={e => e.key === 'Enter' && handleRenameSubmit()}
            />
          ) : (
            <span 
              className="text-[9px] text-white/60 truncate max-w-[200px] cursor-pointer hover:text-white transition-colors"
              onClick={() => {
                if (activeFileInNotepad) {
                  setRenameValue(activeFileInNotepad.name);
                  setIsRenaming(true);
                } else {
                  addNotification('Notepad', 'Save the file first to enable renaming', 'info');
                }
              }}
            >
              {activeFileInNotepad ? `/${activeFileInNotepad.path.join('/')}/${activeFileInNotepad.name}` : 'Untitled.txt'}
            </span>
          )}
        </div>
        <div className="text-[9px] text-white/30 uppercase tracking-widest flex items-center gap-4">
          {activeFileInNotepad?.name.endsWith('.html') && (
            <button 
              onClick={() => setShowPreview(!showPreview)}
              className={cn(
                "px-2 py-0.5 rounded transition-all flex items-center gap-1.5 border",
                showPreview ? "bg-blue-500/20 border-blue-500/50 text-blue-400" : "bg-white/5 border-white/10 text-white/40 hover:text-white"
              )}
            >
              <Eye size={10} />
              {showPreview ? 'Stop Preview' : 'Preview HTML'}
            </button>
          )}
          <span>UTF-8 • {notepadContent.length} chars</span>
        </div>
      </div>

      <div className="flex-1 flex overflow-hidden">
        {showPreview && activeFileInNotepad?.name.endsWith('.html') ? (
          <div className="flex-1 flex gap-4 p-4 overflow-hidden">
             <textarea 
              ref={textareaRef}
              className="flex-1 bg-white/5 p-4 outline-none resize-none font-mono text-sm leading-relaxed rounded-xl border border-white/10"
              placeholder="<html>..."
              value={notepadContent}
              onChange={(e) => setNotepadContent(e.target.value)}
            />
            <div className="flex-1 bg-white rounded-xl border border-white/10 overflow-auto">
              <div 
                className="w-full h-full p-4 text-black select-text"
                dangerouslySetInnerHTML={{ __html: notepadContent }}
              />
            </div>
          </div>
        ) : (
          <textarea 
            ref={textareaRef}
            style={{ 
              fontSize: notepadStyle.fontSize, 
              fontWeight: notepadStyle.fontWeight, 
              textAlign: notepadStyle.textAlign 
            }}
            className="flex-1 bg-transparent p-6 outline-none resize-none font-mono leading-relaxed selection:bg-blue-500/30 transition-all duration-300"
            placeholder="Start typing your thoughts..."
            value={notepadContent}
            onChange={(e) => setNotepadContent(e.target.value)}
          />
        )}
      </div>

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
          <FilePicker 
            title="Save As"
            fs={fs}
            fsLib={fsLib}
            mode="save"
            initialFileName={saveFileName || 'untitled'}
            allowedExtensions={['txt', 'html', 'scr', 'b']}
            accentColor={accentColor}
            onCancel={() => setShowSaveDialog(false)}
            onSelect={(path) => {
              try {
                fsLib.write(path, notepadContent);
                const parts = path.split('/');
                const fileName = parts.pop() || '';
                setActiveFileInNotepad({ name: fileName, path: parts });
                setShowSaveDialog(false);
                addNotification('Notepad', `Saved ${fileName} successfully`, 'success');
              } catch (e) {
                addNotification('Notepad', 'Error saving file', 'error');
              }
            }}
          />
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

function BrowserApp({ fs, fsLib, addNotification }: any) {
  interface BrowserTab {
    id: string;
    url: string;
    localContent?: string;
  }

  const [tabs, setTabs] = useState<BrowserTab[]>([
    { id: '1', url: 'local://home.html' }
  ]);
  const [activeTabId, setActiveTabId] = useState('1');
  const [urlInput, setUrlInput] = useState('local://home.html');
  const [history, setHistory] = useState<string[]>(['local://home.html']);
  const [favorites, setFavorites] = useState<string[]>(['https://www.google.com', 'https://www.github.com', 'local://home.html']);
  const [showHistory, setShowHistory] = useState(false);
  const [isSecureMode, setIsSecureMode] = useState(true);

  const [view, setView] = useState<'browser' | 'composer'>('browser');
  const [composerContent, setComposerContent] = useState('<!DOCTYPE html>\n<html>\n<head>\n  <style>\n    body { font-family: sans-serif; color: #333; padding: 2rem; }\n    h1 { color: #2563eb; }\n  </style>\n</head>\n<body>\n  <h1>My Custom Page</h1>\n  <p>Built with GlassOS HTML Composer.</p>\n</body>\n</html>');
  const [composerFileName, setComposerFileName] = useState('new_page.html');

  const activeTab = useMemo(() => 
    tabs.find(t => t.id === activeTabId) || tabs[0],
    [tabs, activeTabId]
  );

  const getLocalPageContent = useCallback((url: string) => {
    if (!url.startsWith('local://')) return undefined;
    const fileName = url.replace('local://', '');
    return fsLib.read(`/GlassDrive/webpages/${fileName}`) || undefined;
  }, [fsLib]);

  useEffect(() => {
    setUrlInput(activeTab.url);
  }, [activeTabId, activeTab.url]);

  // Initial load effect for first tab if local
  useEffect(() => {
    setTabs(prev => prev.map(t => {
      if (t.url.startsWith('local://')) {
        return { ...t, localContent: getLocalPageContent(t.url) };
      }
      return t;
    }));
  }, [getLocalPageContent]);

  const handleGo = (e?: React.FormEvent) => {
    e?.preventDefault();
    let target = urlInput;
    
    // Check if it's a known local file name first if not a full URL
    const isFullUrl = target.includes('://') || target.includes('.');
    const localCheck = isFullUrl ? target : `local://${target}`;
    let localContent = getLocalPageContent(localCheck);
    
    if (localContent) {
      target = localCheck;
    } else if (target.startsWith('local://')) {
      addNotification('Browser', `Local page ${target} not found in GlassDrive/webpages`, 'error');
      return;
    } else if (!target.includes('.') && !target.startsWith('http')) {
      target = `https://www.google.com/search?q=${encodeURIComponent(target)}&igu=1`;
    } else if (!target.startsWith('http')) {
      target = 'https://' + target;
    }
    
    setTabs(prev => prev.map(t => t.id === activeTabId ? { ...t, url: target, localContent } : t));
    setHistory(prev => [target, ...prev.filter(h => h !== target)].slice(0, 50));
    addNotification('Browser', `Navigating to ${target}`, 'info');
  };

  const addTab = () => {
    const newId = Math.random().toString(36).substr(2, 9);
    const newTab = { id: newId, url: 'local://home.html', localContent: getLocalPageContent('local://home.html') };
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
    <div className="h-full flex flex-col bg-[#f0f2f5] select-text">
      {/* Tab Bar */}
      <div className="h-10 bg-[#dee1e6] flex items-center px-2 gap-1 overflow-x-auto no-scrollbar pt-2">
        {tabs.map(tab => (
          <div
            key={tab.id}
            onClick={() => setActiveTabId(tab.id)}
            className={cn(
              "h-8 px-4 rounded-t-lg flex items-center gap-2 cursor-pointer transition-all min-w-[140px] max-w-[200px] relative group",
              activeTabId === tab.id ? "bg-white text-slate-800 shadow-[0_-2px_4px_rgba(0,0,0,0.05)]" : "hover:bg-[#e8eaed] text-slate-600"
            )}
          >
            <Globe size={12} className={activeTabId === tab.id ? "text-blue-500" : ""} />
            <span className="text-[10px] truncate flex-1 font-medium">
              {tab.url.replace('https://', '').replace('http://', '').replace('www.', '').split('/')[0] || 'New Tab'}
            </span>
            {tabs.length > 1 && (
              <button 
                onClick={(e) => closeTab(e, tab.id)}
                className="p-1 hover:bg-slate-200 rounded-full transition-colors opacity-0 group-hover:opacity-100"
              >
                <X size={10} />
              </button>
            )}
            {activeTabId === tab.id && <div className="absolute bottom-0 left-0 right-0 h-[1px] bg-white translate-y-[1px]" />}
          </div>
        ))}
        <button 
          onClick={addTab}
          className="p-1.5 hover:bg-black/5 rounded-full transition-colors text-slate-600 ml-1"
        >
          <Plus size={14} />
        </button>
      </div>

      {/* Toolbar */}
      <div className="h-12 bg-white flex items-center px-4 gap-4 border-b border-slate-200">
        <div className="flex gap-1">
          <button className="p-2 hover:bg-slate-100 rounded-full transition-colors text-slate-400">
            <ChevronLeft size={16} />
          </button>
          <button className="p-2 hover:bg-slate-100 rounded-full transition-colors text-slate-400">
            <ChevronRight size={16} />
          </button>
          <button onClick={() => handleGo()} className="p-2 hover:bg-slate-100 rounded-full transition-colors text-slate-600">
            <RefreshCw size={16} />
          </button>
        </div>

        <div className="flex-1 flex gap-2">
          <form onSubmit={handleGo} className="flex-1 relative group">
            <div className="absolute left-3 top-1/2 -translate-y-1/2 flex items-center gap-2">
              <Lock size={12} className={cn(isSecureMode ? "text-green-500" : "text-slate-300")} />
            </div>
            <input 
              className="w-full bg-[#f1f3f4] border border-transparent rounded-full pl-8 pr-10 py-1.5 text-xs text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:bg-white focus:border-transparent transition-all"
              value={urlInput}
              onChange={(e) => setUrlInput(e.target.value)}
              placeholder="Search or enter URL"
            />
            <button 
              type="button"
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-amber-400 transition-colors"
            >
              <Star size={14} fill={favorites.includes(activeTab.url) ? "currentColor" : "none"} />
            </button>
          </form>
        </div>

        <div className="flex gap-1">
          <button 
            onClick={() => setIsSecureMode(!isSecureMode)}
            className={cn(
              "p-2 rounded-full transition-all",
              isSecureMode ? "bg-green-500/10 text-green-600" : "text-slate-400 hover:bg-slate-100"
            )}
            title="Secure Mode"
          >
            <Shield size={16} />
          </button>
          <button 
            onClick={() => {
              const fileName = activeTab.url.replace('local://', '');
              if (activeTab.url.startsWith('local://')) {
                const content = fsLib.read(`/GlassDrive/webpages/${fileName}`);
                if (content) {
                  setComposerContent(content);
                  setComposerFileName(fileName);
                  setView('composer');
                }
              } else {
                setView('composer');
              }
            }}
            className={cn(
              "p-2 rounded-full transition-all",
              view === 'composer' ? "bg-blue-500/10 text-blue-600" : "text-slate-400 hover:bg-slate-100"
            )}
            title="HTML Composer"
          >
            <Code2 size={16} />
          </button>
          <button 
            onClick={() => setShowHistory(!showHistory)}
            className={cn(
              "p-2 rounded-full transition-all",
              showHistory ? "bg-blue-500/10 text-blue-600" : "text-slate-400 hover:bg-slate-100"
            )}
            title="History"
          >
            <Clock size={16} />
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex overflow-hidden bg-white">
        {view === 'browser' ? (
          <div className="flex-1 relative">
            {tabs.map(tab => (
              <div 
                key={tab.id} 
                className={cn("absolute inset-0", activeTabId === tab.id ? "block" : "hidden")}
              >
                {tab.localContent ? (
                  <div 
                    className="w-full h-full overflow-auto bg-white"
                    dangerouslySetInnerHTML={{ __html: tab.localContent }}
                    onClick={(e) => {
                      const target = e.target as HTMLElement;
                      const link = target.closest('a');
                      const href = link?.getAttribute('href');
                      if (href?.startsWith('local://')) {
                        e.preventDefault();
                        const content = getLocalPageContent(href);
                        if (content) {
                          setTabs(prev => prev.map(t => t.id === activeTabId ? { ...t, url: href, localContent: content } : t));
                          setUrlInput(href);
                          setHistory(prev => [href, ...prev.filter(h => h !== href)].slice(0, 50));
                          addNotification('Browser', `Navigating to ${href}`, 'info');
                        } else {
                          addNotification('Browser', `Page ${href} not found`, 'error');
                        }
                      }
                    }}
                  />
                ) : (
                  <iframe 
                    src={tab.url} 
                    className={cn(
                      "w-full h-full border-none transition-all",
                      !isSecureMode && "grayscale brightness-90 saturate-50"
                    )}
                    title={`Tab ${tab.id}`}
                  />
                )}
              </div>
            ))}
            <div className="absolute bottom-4 right-4 bg-white/80 backdrop-blur-sm border border-slate-200 p-2 rounded-lg text-[10px] text-slate-500 pointer-events-none shadow-sm">
              Note: Some sites block embedding for security.
            </div>
          </div>
        ) : (
          <div className="flex-1 flex flex-col bg-slate-900 border-l border-white/5">
            <div className="h-10 bg-slate-800 flex items-center justify-between px-4 border-b border-white/5">
              <div className="flex items-center gap-3">
                <LayoutGrid size={14} className="text-blue-400" />
                <span className="text-[10px] font-bold text-white/60 uppercase tracking-widest">HTML Composer</span>
                <div className="h-4 w-[1px] bg-white/10 mx-2" />
                <input 
                  value={composerFileName}
                  onChange={(e) => setComposerFileName(e.target.value)}
                  className="bg-transparent border-none text-[10px] text-white focus:outline-none w-32 font-mono"
                  placeholder="filename.html"
                />
              </div>
              <div className="flex items-center gap-2">
                <button 
                  onClick={() => {
                    const cleanName = composerFileName.endsWith('.html') ? composerFileName : composerFileName + '.html';
                    fsLib.write(`/GlassDrive/webpages/${cleanName}`, composerContent);
                    addNotification('Composer', `Saved ${cleanName} to GlassDrive/webpages`, 'success');
                    // Refresh current tab if it matches
                    if (activeTab.url === `local://${cleanName}`) {
                      setTabs(prev => prev.map(t => t.id === activeTabId ? { ...t, localContent: composerContent } : t));
                    }
                  }}
                  className="px-3 py-1 bg-blue-500 hover:bg-blue-600 rounded text-[10px] font-bold text-white transition-all flex items-center gap-2"
                >
                  <Save size={12} />
                  Save Changes
                </button>
                <button 
                  onClick={() => setView('browser')}
                  className="p-1 hover:bg-white/10 rounded-lg text-white/40 hover:text-white"
                >
                  <X size={14} />
                </button>
              </div>
            </div>
            <div className="h-8 bg-slate-800/50 border-b border-white/5 flex items-center px-2 gap-1 overflow-x-auto no-scrollbar">
               {[
                 { label: 'H1', snippet: '<h1>Title</h1>' },
                 { label: 'P', snippet: '<p>Paragraph text here</p>' },
                 { label: 'DIV', snippet: '<div style="padding: 20px; background: #f0f0f0;">\n  \n</div>' },
                 { label: 'IMG', snippet: '<img src="https://images.unsplash.com/photo-1501785888041-af3ef285b470?w=400" style="width: 100%; border-radius: 8px;" />' },
                 { label: 'A', snippet: '<a href="local://home.html" style="color: blue;">Link</a>' },
                 { label: 'BUTTON', snippet: '<button style="padding: 10px 20px; background: blue; color: white; border: none; border-radius: 4px;">Click Me</button>' },
                 { label: 'STYLE', snippet: '<style>\n  .box { padding: 20px; border: 1px solid #ccc; }\n</style>' },
                 { label: 'SCRIPT', snippet: '<script>\n  console.log("Hello from page!");\n</script>' },
               ].map(tool => (
                 <button 
                  key={tool.label}
                  onClick={() => setComposerContent(prev => prev + tool.snippet)}
                  className="px-2 py-0.5 rounded hover:bg-white/10 text-[9px] text-white/40 hover:text-white transition-all font-mono"
                 >
                   {tool.label}
                 </button>
               ))}
            </div>
            <div className="flex-1 flex overflow-hidden">
               <div className="flex-1 border-r border-white/5 flex flex-col">
                  <div className="p-2 bg-slate-900/50 border-b border-white/5 flex items-center justify-between">
                     <span className="text-[9px] text-white/30 uppercase font-bold tracking-tighter">Markdown / HTML Editor</span>
                  </div>
                  <textarea 
                    value={composerContent}
                    onChange={(e) => setComposerContent(e.target.value)}
                    className="flex-1 w-full bg-slate-900 text-slate-300 p-4 font-mono text-xs focus:outline-none border-none resize-none no-scrollbar"
                    spellCheck={false}
                  />
               </div>
               <div className="flex-1 flex flex-col bg-white">
                  <div className="p-2 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
                     <span className="text-[9px] text-slate-400 uppercase font-bold tracking-tighter">Live Real-time Preview</span>
                     <Eye size={12} className="text-slate-300" />
                  </div>
                  <div 
                    className="flex-1 overflow-auto p-4 select-text"
                    dangerouslySetInnerHTML={{ __html: composerContent }}
                  />
               </div>
            </div>
          </div>
        )}

        {/* History Sidebar */}
        <AnimatePresence>
          {showHistory && (
            <motion.div 
              initial={{ x: 300 }}
              animate={{ x: 0 }}
              exit={{ x: 300 }}
              className="w-64 bg-white border-l border-slate-200 shadow-xl z-10 flex flex-col"
            >
              <div className="p-4 border-b border-slate-200 flex items-center justify-between">
                <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2">
                  <Clock size={14} />
                  History
                </h3>
                <button onClick={() => setShowHistory(false)} className="text-slate-400 hover:text-slate-600">
                  <X size={14} />
                </button>
              </div>
              <div className="flex-1 overflow-y-auto p-2 space-y-1">
                {history.map((h, i) => (
                  <button 
                    key={i}
                    onClick={() => setUrlInput(h)}
                    className="w-full text-left p-2 rounded hover:bg-slate-100 transition-all group"
                  >
                    <div className="text-[10px] text-slate-800 truncate font-medium">{h}</div>
                  </button>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
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



function AppFolderApp(props: any) {
  const { openWindow, addNotification, accentColor } = props;
  const availableApps = [
    { id: 'weather', name: 'Weather', icon: <RefreshCw size={24} /> },
    { id: 'calculator', name: 'Calculator', icon: <Plus size={24} /> },
    { id: 'calendar', name: 'Calendar', icon: <Clock size={24} /> },
  ];

  return (
    <div className="h-full p-6">
      <h2 className="text-lg font-medium mb-6 flex items-center gap-2">
        <Package size={20} style={{ color: accentColor }} />
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
              className="w-full py-1.5 rounded-lg text-[10px] font-bold hover:opacity-80 transition-all"
              style={{ backgroundColor: `${accentColor}33`, color: accentColor }}
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

function CodeStudioApp({ 
  fs, 
  setFs, 
  fsLib, 
  builds, 
  setBuilds, 
  addNotification, 
  runGlassScript, 
  glassScriptLine,
  runBrainscript,
  brainscriptLine,
  accentColor
}: any) {
  const projectsPath = 'home/Administrator/Documents/Projects/CodeStudio';
  const files = useMemo(() => {
    try {
      if (!fsLib.exists(projectsPath)) {
        fsLib.mkdir(projectsPath);
        fsLib.mkdir(`${projectsPath}/build`);
      }
      return fsLib.list(projectsPath);
    } catch (e) {
      return [];
    }
  }, [fs]);

  const [activeFile, setActiveFile] = useState<string>('main.b');
  const [code, setCode] = useState<string>('');
  const [isDirty, setIsDirty] = useState(false);
  
  // Syntax Validator
  const validateSyntax = useCallback((content: string) => {
    if (!activeFile.endsWith('.b')) {
      setSyntaxErrors([]);
      return [];
    }

    const errors: {line: number, message: string}[] = [];
    const lines = content.split('\n');
    let inBlock = false;
    let blockHeaderFound = false;

    lines.forEach((line, index) => {
      const trimmed = line.trim();
      const upTrimmed = trimmed.toUpperCase();
      if (!trimmed || trimmed.startsWith('//') || upTrimmed.startsWith('REM')) return;

      // Check for block headers
      if (trimmed.startsWith('@@') || trimmed.startsWith('$$') || trimmed.startsWith('###') || trimmed.startsWith('##')) {
        if (inBlock) {
          errors.push({ line: index + 1, message: "Cannot define a block header inside another block. Did you forget an 'End'?" });
        }
        
        // Strip headers (@@, $$, ###, ##) to check for a name if needed
        const namePart = trimmed.replace(/^[#@$]+/, '');
        const parts = namePart.split(/[\s(]/);
        const blockName = parts[0];
        
        // @@global is allowed without a name, but others should have one
        if (!blockName && !trimmed.startsWith('@@')) {
          errors.push({ line: index + 1, message: "Block name is required" });
        }
        
        blockHeaderFound = true;
        return;
      }

      if (trimmed.toUpperCase() === 'START') {
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

      if (trimmed.toUpperCase() === 'END') {
        if (!inBlock) {
          errors.push({ line: index + 1, message: "'End' without matching 'Start'" });
        }
        inBlock = false;
        return;
      }

      // Commands inside block
      if (inBlock) {
        const parts = trimmed.split(/\s+/);
        const command = parts[0].toUpperCase();

        if (command === 'REM' || command === '//') {
          // Remark, ignore rest of line
        } else if (command === 'LET' || command === 'SET') {
          if (!parts[1] || !parts[1].startsWith('$')) {
            errors.push({ line: index + 1, message: `${command} must be followed by a variable starting with '$'` });
          }
        } else if (command === 'PRINT') {
          if (parts.length < 2) {
            errors.push({ line: index + 1, message: "PRINT requires an argument" });
          }
        } else if (command === 'IF') {
          if (!trimmed.includes(':')) {
            errors.push({ line: index + 1, message: "IF requires a colon ':' to separate condition from action" });
          }
        } else if (command === 'COMPARE') {
          if (!trimmed.includes(':')) {
            errors.push({ line: index + 1, message: "COMPARE requires a colon ':' to separate condition from action" });
          }
        } else if (command === 'BRANCH') {
          if (parts.length < 2) {
            errors.push({ line: index + 1, message: "BRANCH requires a target label (e.g., ##target)" });
          }
        } else if (command === 'INPUT') {
          if (!parts[1] || !parts[1].startsWith('$')) {
            errors.push({ line: index + 1, message: "INPUT requires a variable starting with '$'" });
          }
        } else if (command === 'DATA' || command === 'TIMESTAMP' || command === 'QUIT') {
          // valid standalone or simple commands
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
    return errors;
  }, [activeFile]);

  useEffect(() => {
    const fullPath = `${projectsPath}/${activeFile}`;
    if (fsLib.exists(fullPath)) {
      const content = fsLib.read(fullPath);
      if (content !== null) {
        setCode(content);
        setSyntaxErrors([]); // Clear errors on file switch
        setIsDirty(false);
      }
    }
  }, [activeFile, fs]);

  // Watch for external changes
  useEffect(() => {
    const fullPath = `${projectsPath}/${activeFile}`;
    const unwatch = fsLib.watch(fullPath, (newContent) => {
      if (newContent !== null && newContent !== code) {
        setCode(newContent);
        setIsDirty(false);
      }
    });
    return unwatch;
  }, [activeFile, fsLib, code]);
  const [targetArch, setTargetArch] = useState('x64 (Windows/Linux)');
  const [optimizationLevel, setOptimizationLevel] = useState('O2 (Balanced)');
  const [isCompiling, setIsCompiling] = useState(false);
  const [activeDialog, setActiveDialog] = useState<'new' | 'open' | 'send' | 'about' | null>(null);
  const [currentTheme, setCurrentTheme] = useState<keyof typeof THEMES>('glass');
  const [syntaxErrors, setSyntaxErrors] = useState<{line: number, message: string}[]>([]);
  const [outputLogs, setOutputLogs] = useState<string[]>([]);
  const [isOutputVisible, setIsOutputVisible] = useState(true);
  const [activeMenu, setActiveMenu] = useState<string | null>(null);
  const [temperature, setTemperature] = useState(0.7);
  const [isDebugMode, setIsDebugMode] = useState(false);
  const [collapsedLines, setCollapsedLines] = useState<Set<number>>(new Set());

  const getFoldableBlocks = useCallback(() => {
    if (!activeFile.endsWith('.b')) return [];
    
    const lines = code.split('\n');
    const blocks: { start: number; end: number }[] = [];
    const stack: number[] = [];

    lines.forEach((line, i) => {
      const trimmed = line.trim().toUpperCase();
      // Brainscript: Start or IF ... START
      if (trimmed === 'START' || (trimmed.startsWith('IF') && trimmed.includes('START'))) {
        stack.push(i);
      } else if (trimmed === 'END') {
        const start = stack.pop();
        if (start !== undefined) {
          blocks.push({ start, end: i });
        }
      }
    });

    return blocks;
  }, [code, activeFile]);

  const toggleFold = (startLine: number) => {
    const blocks = getFoldableBlocks();
    const block = blocks.find(b => b.start === startLine);
    if (!block) return;

    setCollapsedLines(prev => {
      const next = new Set(prev);
      const isCurrentlyFolded = next.has(startLine);
      
      if (isCurrentlyFolded) {
        next.delete(startLine);
      } else {
        next.add(startLine);
      }
      return next;
    });
  };

  const scrollRef = useRef<HTMLDivElement>(null);
  const gutterRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const COMMON_SNIPPETS = {
    Brainscript: [
      { name: 'Start Block', code: '@@Main\nStart\n  // Code here\nEnd' },
      { name: 'Variable Assignment', code: 'LET $var = "Value"' },
      { name: 'Conditional (IF)', code: 'IF $var == 1: START\n  PRINT "True"\nEND' },
      { name: 'Print Statement', code: 'PRINT "Hello World"' },
      { name: 'Input Prompt', code: 'INPUT $name: "Enter your name: "' },
      { name: 'Comment', code: '// This is a remark' },
    ],
    GlassScript: [
      { name: 'Tell Application', code: 'tell app "Finder": start\n  notify "Hello from GlassOS"\nend' },
      { name: 'Set Variable', code: 'set $var to "Value"' },
      { name: 'Wait', code: 'wait 1 second' },
      { name: 'System Date', code: 'set $today to system.date' },
      { name: 'Writer', code: 'write "GlassOS is great"' },
    ]
  };

  const insertSnippet = (snippet: string) => {
    if (!textareaRef.current) return;
    const textarea = textareaRef.current;
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const text = textarea.value;
    const before = text.substring(0, start);
    const after = text.substring(end);
    const newText = before + snippet + after;
    setCode(newText);
    setIsDirty(true);
    setActiveMenu(null);
    
    // Focus back and set cursor position
    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(start + snippet.length, start + snippet.length);
    }, 0);
  };

  const highlightCode = (content: string) => {
    // We expect content here to be the visible code
    if (activeFile.endsWith('.b')) {
      const lines = content.split('\n').map((line, idx) => {
        let highlighted = line;
        highlighted = highlighted.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
        highlighted = highlighted.replace(/'(.*?)'/g, '<span class="text-amber-400">\'$1\'</span>');
        
        const headerMatch = highlighted.match(/^(@@|\$\$|###|##)([a-zA-Z0-9_.]+)/);
        if (headerMatch) {
          highlighted = highlighted.replace(headerMatch[0], `<span class="text-purple-400 font-bold">${headerMatch[0]}</span>`);
        } else {
          if (highlighted.includes('//')) {
            highlighted = highlighted.replace(/\/\/(.*)$/, '<span class="text-white/30 italic">//$1</span>');
          }
        }
        const keywords = ['Start', 'End', 'LET', 'SET', 'PRINT', 'REM', 'TIMESTAMP', 'BRANCH', 'DATA', 'INPUT', 'COMPARE', 'TO', 'FROM', 'IF', 'QUIT'];
        const functions = ['ABS', 'CEL', 'FLO', 'LOG', 'RAND', 'TAN', 'SIN', 'COS'];
        
        keywords.forEach(kw => {
          const regex = new RegExp(`\\b${kw}\\b`, 'g');
          highlighted = highlighted.replace(regex, `<span class="text-blue-400 font-bold">${kw}</span>`);
        });
        
        functions.forEach(fn => {
          const regex = new RegExp(`\\b${fn}\\b`, 'g');
          highlighted = highlighted.replace(regex, `<span class="text-violet-400 italic">${fn}</span>`);
        });

        highlighted = highlighted.replace(/(&&|:| \+ | - | \* | \/ | % | <> | > | < | \^ | °)/g, `<span class="text-pink-400 font-bold">$1</span>`);
        highlighted = highlighted.replace(/(\$[a-zA-Z0-9_.]+)/g, `<span class="text-emerald-400 font-mono italic">$1</span>`);
        
        if (idx === brainscriptLine) {
          return `<div class="bg-emerald-500/20 -mx-4 px-4 border-l-2 border-emerald-400 shadow-[0_0_15px_rgba(16,185,129,0.3)] animate-pulse">${highlighted}</div>`;
        }
        return highlighted;
      });
      return lines.join('\n');
    }

    if (activeFile.endsWith('.scr')) {
      const lines = code.split('\n').map((line, idx) => {
        let highlighted = line;
        highlighted = highlighted.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
        
        // Comments
        highlighted = highlighted.replace(/^(--.*)$/, '<span class="text-white/30 italic">$1</span>');
        
        // Quotes
        highlighted = highlighted.replace(/"(.*?)"/g, '<span class="text-amber-400">"$1"</span>');
        
        // Keywords
        const keywords = ['tell app', 'end tell', 'set', 'to', 'write', 'notify', 'wait', 'align', 'insert newline'];
        keywords.forEach(kw => {
          const regex = new RegExp(`\\b${kw}\\b`, 'gi');
          highlighted = highlighted.replace(regex, `<span class="text-blue-400 font-medium">${kw}</span>`);
        });

        // System vars
        highlighted = highlighted.replace(/\b(system\.date)\b/gi, '<span class="text-purple-400 font-mono italic">$1</span>');

        if (idx === glassScriptLine) {
          return `<div class="bg-blue-500/20 -mx-4 px-4 border-l-2 border-blue-400 shadow-[0_0_15px_rgba(59,130,246,0.3)] animate-pulse">${highlighted}</div>`;
        }
        return highlighted;
      });
      return lines.join('\n');
    }

    return code;
  };

  const handleScroll = (e: React.UIEvent<HTMLTextAreaElement>) => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = e.currentTarget.scrollTop;
      scrollRef.current.scrollLeft = e.currentTarget.scrollLeft;
    }
    if (gutterRef.current) {
      gutterRef.current.scrollTop = e.currentTarget.scrollTop;
    }
  };

  const handleDebug = () => {
    setIsDebugMode(true);
    addNotification('Code Studio', 'Entering Debug Mode...', 'info');
    setIsOutputVisible(true);
    setOutputLogs(prev => [...prev, `[DEBUG] Initializing debugger for ${activeFile}...`]);
    
    setTimeout(() => {
      const errors = validateSyntax(code);
      if (errors.length > 0) {
        const firstErr = errors[0];
        setOutputLogs(prev => [...prev, `[DEBUG] CRITICAL: Execution halted at Line ${firstErr.line} due to unresolved syntax errors.`]);
        addNotification('Debugger', 'Execution Halted: Syntax Errors Detected', 'error');
        setIsDebugMode(false);
        return;
      }

      // Simulate step-through
      setOutputLogs(prev => [...prev, `[DEBUG] Step 1/3: Environment variables initialized (TEMP=${temperature})`]);
      setTimeout(() => {
        setOutputLogs(prev => [...prev, `[DEBUG] Step 2/3: Checking memory allocation for $msg... SUCCESS`]);
        setTimeout(() => {
          setOutputLogs(prev => [...prev, `[DEBUG] Step 3/3: Executing main loop... DONE`]);
          setOutputLogs(prev => [...prev, `[DEBUG] Process exited with code 0 (Success)`]);
          addNotification('Debugger', 'Debug session finished successfully', 'success');
          setIsDebugMode(false);
        }, 800);
      }, 800);
    }, 1000);
  };
  
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

  // Removed redundant effect

  const handleSave = () => {
    const fullPath = `home/Administrator/Projects/CodeStudio/${activeFile}`;
    try {
      fsLib.write(fullPath, code);
      setIsDirty(false);
      addNotification('Code Studio', `Saved ${activeFile}`, 'success');
      setOutputLogs((prev: string[]) => [...prev, `[IDE] Saved ${activeFile} successfully.`]);
    } catch (err: any) {
      const msg = err.message || String(err);
      addNotification('Code Studio', `Error saving: ${msg}`, 'error');
      setOutputLogs((prev: string[]) => [...prev, `[ERROR] Save failed: ${msg}`]);
    }
  };

  const handleCreateFile = () => {
    setNewFileError(null);
    if (!newFileData.name.trim()) {
      setNewFileError('File name is required.');
      return;
    }

    const extension = newFileData.type === 'Brainscript' ? '.b' : newFileData.type === 'JSON' ? '.json' : '.txt';
    const fileName = newFileData.name.trim().endsWith(extension) ? newFileData.name.trim() : newFileData.name.trim() + extension;
    const fullPath = `${projectsPath}/${fileName}`;

    if (fsLib.exists(fullPath)) {
      setNewFileError(`A file named "${fileName}" already exists.`);
      return;
    }
    
    try {
      const initialContent = newFileData.type === 'Brainscript' 
        ? `@@${fileName.replace('.b', '')}\nStart\n  PRINT 'Hello World'\nEnd`
        : '// New ' + newFileData.type + ' file';
        
      fsLib.write(fullPath, initialContent);
      setActiveFile(fileName);
      setOutputLogs(prev => [...prev, `[IDE] Created ${fileName}`]);
      addNotification('Code Studio', `Created ${fileName}`, 'success');
      setActiveDialog(null);
      setNewFileData({ name: '', type: 'Brainscript', path: 'src/' });
    } catch (e) {
      setNewFileError('Error creating file');
    }
  };

  const handleSendTo = () => {
    if (!selectedFileForSend) return;
    setOutputLogs((prev: string[]) => [...prev, `[IDE] Sending ${selectedFileForSend} to ${destinationFolder}...`]);
    setIsOutputVisible(true);
    setTimeout(() => {
      setOutputLogs((prev: string[]) => [...prev, `[IDE] File ${selectedFileForSend} sent successfully.`]);
      addNotification('Code Studio', `Sent ${selectedFileForSend} to ${destinationFolder}`, 'success');
      setActiveDialog(null);
      setSelectedFileForSend(null);
    }, 1500);
  };

  const handleRunBrainscript = () => {
    // Run syntax validation manually on Run/Debug
    const errors = validateSyntax(code);
    
    setIsOutputVisible(true);
    setOutputLogs(prev => [...prev, `[${new Date().toLocaleTimeString()}] Executing Brainscript: ${activeFile}...`]);
    
    if (errors.length > 0) {
      setOutputLogs(prev => [...prev, `[IDE] Warning: Executing with ${errors.length} syntax errors.`]);
    }

    runBrainscript(code, (msg: string) => {
      setOutputLogs(prev => [...prev, `[BS-OUT] ${msg}`]);
    });
  };

  const handleBuild = () => {
    // Run syntax validation manually on Build
    const errors = validateSyntax(code);

    if (errors.length > 0) {
      setOutputLogs(prev => [...prev, `[IDE] Build aborted: ${errors.length} syntax errors found.`]);
      setIsOutputVisible(true);
      return;
    }

    setIsCompiling(true);
    const startLogs = [
      `[${new Date().toLocaleTimeString()}] Parsing Brainscript: ${activeFile}...`,
      `[${new Date().toLocaleTimeString()}] Optimization: ${optimizationLevel}...`,
      `[${new Date().toLocaleTimeString()}] Generating Intermediate Representation...`,
      `[${new Date().toLocaleTimeString()}] Target Architecture: ${targetArch}...`,
      `[${new Date().toLocaleTimeString()}] Packing Executable...`
    ];
    
    setOutputLogs(prev => [...prev, ...startLogs]);
    setIsOutputVisible(true);

    setTimeout(() => {
      const type = targetArch.includes('6502') ? '8-bit' : targetArch.includes('68k') ? '16-bit' : targetArch.includes('x64') ? '64-bit' : '32-bit';
      const exeName = activeFile.replace('.b', '.exe');
      
      const newBuild: BrainscriptBuild = {
        id: Math.random().toString(36).substr(2, 9),
        status: 'success',
        opt: optimizationLevel,
        name: exeName,
        arch: targetArch,
        timestamp: new Date().toLocaleTimeString(),
        size: (code.length / 1024 + 50).toFixed(1) + ' KB',
        type
      };
      
      // Real "Executable" Content: A JSON wrapper that FilesApp can "Execute"
      const exeMetadata = {
        glassOsBinary: true,
        version: "3.0",
        entryPoint: activeFile,
        source: code,
        arch: targetArch,
        timestamp: new Date().toISOString(),
        author: "Administrator"
      };

      const exePath = `${projectsPath}/build/${exeName}`;
      try {
        if (!fsLib.exists(`${projectsPath}/build`)) {
          fsLib.mkdir(`${projectsPath}/build`);
        }
        fsLib.write(exePath, JSON.stringify(exeMetadata, null, 2));
      } catch (e) {
        console.error("Failed to write build artifact", e);
      }

      const endLog = `[${new Date().toLocaleTimeString()}] Output: build/${newBuild.name} (${type} Binary) - SUCCESS`;
      
      setBuilds((prev: BrainscriptBuild[]) => [newBuild, ...prev]);
      setIsCompiling(false);
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
                      className="w-full text-left px-4 py-2 hover:bg-white/10 flex items-center justify-between group"
                    >
                      <div className="flex items-center gap-2">
                        <Save size={14} className={cn(isDirty ? "text-emerald-400" : "text-white/60")} />
                        <span>Save File</span>
                      </div>
                      <span className="text-[9px] text-white/20 group-hover:text-white/40">Ctrl+S</span>
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

            {/* Library Menu */}
            <div className="relative">
              <button 
                onClick={() => setActiveMenu(activeMenu === 'library' ? null : 'library')}
                className={cn("hover:text-white transition-colors py-2 flex items-center gap-1", activeMenu === 'library' && "text-white")}
              >
                Library
                <ChevronDown size={10} className={cn("transition-transform", activeMenu === 'library' && "rotate-180")} />
              </button>
              <AnimatePresence>
                {activeMenu === 'library' && (
                  <motion.div 
                    initial={{ opacity: 0, y: 5 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 5 }}
                    className="absolute top-full left-0 w-64 glass-dark border border-white/10 rounded-lg shadow-2xl py-1 z-[3000]"
                  >
                    <div className="px-4 py-1 text-[9px] uppercase font-bold text-white/30 tracking-widest">Modules</div>
                    <button onClick={() => { setCode(prev => `$$lib.networking.dns\n${prev}`); setActiveMenu(null); }} className="w-full text-left px-4 py-2 hover:bg-white/10 flex items-center gap-2 text-[11px]">
                      <Box size={14} />
                      <span>$$lib.networking.dns</span>
                    </button>
                    <button onClick={() => { setCode(prev => `$$lib.ui.glass\n${prev}`); setActiveMenu(null); }} className="w-full text-left px-4 py-2 hover:bg-white/10 flex items-center gap-2 text-[11px]">
                      <Palette size={14} />
                      <span>$$lib.ui.glass</span>
                    </button>
                    <button onClick={() => { setCode(prev => `$$lib.system.kernel\n${prev}`); setActiveMenu(null); }} className="w-full text-left px-4 py-2 hover:bg-white/10 flex items-center gap-2 text-[11px]">
                      <Cpu size={14} />
                      <span>$$lib.system.kernel</span>
                    </button>
                    <div className="h-[1px] bg-white/10 my-1" />
                    <button onClick={() => setActiveMenu(null)} className="w-full text-left px-4 py-2 hover:bg-white/10 flex items-center gap-2 text-[11px]">
                      <Search size={14} />
                      <span>Browse Library...</span>
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Build Menu */}
            <div className="relative">
              <button 
                onClick={() => setActiveMenu(activeMenu === 'build' ? null : 'build')}
                className={cn("hover:text-white transition-colors py-2 flex items-center gap-1", activeMenu === 'build' && "text-white")}
              >
                Run / Build
                <ChevronDown size={10} className={cn("transition-transform", activeMenu === 'build' && "rotate-180")} />
              </button>
              <AnimatePresence>
                {activeMenu === 'build' && (
                  <motion.div 
                    initial={{ opacity: 0, y: 5 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 5 }}
                    className="absolute top-full left-0 w-64 glass-dark border border-white/10 rounded-lg shadow-2xl py-1 z-[3000]"
                  >
                    {activeFile.endsWith('.b') && (
                      <button 
                        onClick={() => { handleRunBrainscript(); setActiveMenu(null); }}
                        className="w-full text-left px-4 py-2 hover:bg-emerald-500/20 text-emerald-400 flex items-center gap-2 font-bold"
                      >
                        <Play size={14} />
                        <span>Run Brainscript</span>
                      </button>
                    )}
                    <button 
                      onClick={() => { handleBuild(); setActiveMenu(null); }}
                      className="w-full text-left px-4 py-2 hover:bg-blue-500/20 text-blue-400 flex items-center gap-2 font-bold"
                    >
                      <Package size={14} />
                      <span>Compile Project</span>
                    </button>
                    <div className="h-[1px] bg-white/10 my-1" />
                    
                    <div className="px-4 py-1 text-[9px] uppercase font-bold text-white/30 tracking-widest flex items-center gap-2">
                       <Cpu size={10} /> Target Architecture
                    </div>
                    {['x64 (Windows/Linux)', 'ARM64 (Apple/Android)', 'RISC-V (Embedded)', 'MOS 6502 (Retro)'].map(arch => (
                      <button 
                        key={arch}
                        onClick={() => { setTargetArch(arch); setActiveMenu(null); }}
                        className={cn(
                          "w-full text-left px-4 py-1.5 hover:bg-white/10 flex items-center justify-between text-[11px]",
                          targetArch === arch ? "text-blue-400 bg-blue-500/5" : "text-white/60"
                        )}
                      >
                        <span>{arch}</span>
                        {targetArch === arch && <Check size={12} />}
                      </button>
                    ))}

                    <div className="h-[1px] bg-white/10 my-1" />
                    <div className="px-4 py-1 text-[9px] uppercase font-bold text-white/30 tracking-widest flex items-center gap-2">
                       <Gauge size={10} /> Optimization level
                    </div>
                    {['O0 (None/Debug)', 'O1 (Small)', 'O2 (Balanced)', 'O3 (Aggressive)'].map(level => (
                      <button 
                        key={level}
                        onClick={() => { setOptimizationLevel(level); setActiveMenu(null); }}
                        className={cn(
                          "w-full text-left px-4 py-1.5 hover:bg-white/10 flex items-center justify-between text-[11px]",
                          optimizationLevel === level ? "text-emerald-400 bg-emerald-500/5" : "text-white/60"
                        )}
                      >
                        <span>{level}</span>
                        {optimizationLevel === level && <Check size={12} />}
                      </button>
                    ))}
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
                    exit={{ opacity: 0, y: 0 }}
                    className="absolute top-full left-0 w-48 glass-dark border border-white/10 rounded-lg shadow-2xl py-1 z-[3000]"
                  >
                    <button 
                      onClick={() => { 
                         if (activeFile.endsWith('.b')) handleRunBrainscript();
                         else handleBuild();
                         setActiveMenu(null); 
                      }}
                      className="w-full text-left px-4 py-2 hover:bg-white/10 flex items-center gap-2"
                    >
                      <Play size={14} />
                      <span>Run Code</span>
                    </button>
                    {activeFile.endsWith('.scr') && (
                      <button 
                        onClick={() => { runGlassScript(code); setActiveMenu(null); }}
                        className="w-full text-left px-4 py-2 hover:bg-blue-500/20 text-blue-400 flex items-center gap-2"
                      >
                        <Zap size={14} />
                        <span>Execute GlassScript</span>
                      </button>
                    )}
                    <div className="h-[1px] bg-white/10 my-1" />
                    <div className="px-4 py-1 text-[9px] uppercase font-bold text-white/30 tracking-widest">Debug</div>
                    <button onClick={() => { handleDebug(); setActiveMenu(null); }} className="w-full text-left px-4 py-2 hover:bg-white/10 flex items-center gap-2">
                      <Bug size={14} />
                      <span>Start Debugging</span>
                    </button>
                    <button onClick={() => setActiveMenu(null)} className="w-full text-left px-4 py-2 hover:bg-white/10 flex items-center gap-2">
                      <StepForward size={14} />
                      <span>Step Over</span>
                    </button>
                    <button onClick={() => { setIsDebugMode(false); setActiveMenu(null); }} className="w-full text-left px-4 py-2 hover:bg-white/10 flex items-center gap-2 text-red-400">
                      <Square size={14} />
                      <span>Stop Debugging</span>
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
            
            {/* Snippets Menu */}
            <div className="relative">
              <button 
                onClick={() => setActiveMenu(activeMenu === 'snippets' ? null : 'snippets')}
                className={cn("hover:text-white transition-colors py-2 flex items-center gap-1", activeMenu === 'snippets' && "text-white")}
              >
                Snippets
                <ChevronDown size={10} className={cn("transition-transform", activeMenu === 'snippets' && "rotate-180")} />
              </button>
              <AnimatePresence>
                {activeMenu === 'snippets' && (
                  <motion.div 
                    initial={{ opacity: 0, y: 5 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 5 }}
                    className="absolute top-full left-0 w-64 glass-dark border border-white/10 rounded-lg shadow-2xl py-1 z-[3000]"
                  >
                    <div className="px-4 py-1 text-[9px] uppercase font-bold text-white/30 tracking-widest flex items-center gap-2">
                       <Code size={10} /> {activeFile.endsWith('.b') ? 'Brainscript' : activeFile.endsWith('.scr') ? 'GlassScript' : 'Snippets'}
                    </div>
                    {(activeFile.endsWith('.b') ? COMMON_SNIPPETS.Brainscript : activeFile.endsWith('.scr') ? COMMON_SNIPPETS.GlassScript : []).map(snippet => (
                      <button 
                        key={snippet.name}
                        onClick={() => insertSnippet(snippet.code)}
                        className="w-full text-left px-4 py-2 hover:bg-white/10 flex flex-col gap-0.5"
                      >
                        <span className="text-[11px] text-white/90 font-bold">{snippet.name}</span>
                        <code className="text-[9px] text-white/40 truncate font-mono">{snippet.code.split('\n')[0]}...</code>
                      </button>
                    ))}
                    {( !activeFile.endsWith('.b') && !activeFile.endsWith('.scr') ) && (
                      <div className="px-4 py-2 text-[10px] text-white/40 italic">
                        No snippets available for this file type.
                      </div>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
          <div className="h-4 w-[1px] bg-white/10 mx-2" />
          <div className="flex items-center gap-3">
            <span className="text-[9px] uppercase font-bold text-white/30 tracking-tight">Temp</span>
            <input 
              type="range" 
              min="0" 
              max="1" 
              step="0.1" 
              value={temperature} 
              onChange={(e) => setTemperature(parseFloat(e.target.value))}
              className="w-16 accent-blue-500 h-1 rounded-full cursor-pointer"
            />
            <span className="text-[10px] text-white/60 w-4">{temperature}</span>
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
          onClick={activeFile.endsWith('.b') ? handleRunBrainscript : activeFile.endsWith('.scr') ? () => runGlassScript(code) : handleBuild}
          disabled={isCompiling}
          className="flex items-center gap-2 bg-blue-500/20 hover:bg-blue-500/30 text-blue-400 px-3 py-1 rounded text-[10px] font-bold transition-all disabled:opacity-50"
        >
          {isCompiling ? <RefreshCw size={12} className="animate-spin" /> : (activeFile.endsWith('.scr') || activeFile.endsWith('.b')) ? <Play size={12} fill="currentColor" /> : <Play size={12} />}
          {(activeFile.endsWith('.scr') || activeFile.endsWith('.b')) ? 'RUN CODE' : 'BUILD .EXE'}
        </button>
      </div>

      <div className="flex-1 flex overflow-hidden min-h-0">
        {/* Sidebar */}
        <div className="w-[200px] bg-black/20 border-r border-white/10 flex flex-col min-h-0">
          <div className="p-3 text-[10px] uppercase tracking-wider text-white/40 font-bold">Explorer</div>
          <div className="flex-1 overflow-y-auto p-2">
            <FolderItem name="src" defaultOpen={true}>
              <FolderItem name="components" defaultOpen={false}>
                {files.filter(f => f.path === 'src/components/').map(f => (
                  <FileItem 
                    key={f.name} 
                    name={f.name} 
                    isActive={activeFile === f.name} 
                    onClick={() => { setActiveFile(f.name); }} 
                  />
                ))}
              </FolderItem>
              {files.filter(f => f.path === 'src/').map(f => (
                <FileItem 
                  key={f.name} 
                  name={f.name} 
                  isActive={activeFile === f.name} 
                  onClick={() => { setActiveFile(f.name); }} 
                />
              ))}
            </FolderItem>
            <FolderItem name="include" defaultOpen={false} />
            <FolderItem name="build" defaultOpen={true}>
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
        <div className={cn("flex-1 flex flex-col transition-colors duration-300 relative overflow-hidden min-h-0", THEMES[currentTheme].bg)}>
          <div className="h-8 bg-white/5 flex items-center px-4 gap-2 border-b border-white/5">
            <div className={cn("h-full border-t-2 px-4 flex items-center gap-2 bg-white/5", THEMES[currentTheme].border)}>
              <FileCode size={12} className={THEMES[currentTheme].accent} />
              <div className="flex items-center gap-2">
                <span className={cn("text-[11px]", THEMES[currentTheme].text)}>{activeFile}</span>
                {isDirty && <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]" />}
              </div>
            </div>
          </div>
          <div className="flex-1 relative overflow-hidden flex min-h-0">
            {/* Gutter */}
            <div 
              ref={gutterRef}
              className="w-10 bg-black/40 border-r border-white/10 flex flex-col py-6 items-end pr-2 overflow-hidden select-none"
            >
              {(() => {
                const lines = code.split('\n');
                const foldable = getFoldableBlocks();
                const visible = [];
                for (let i = 0; i < lines.length; i++) {
                  const block = foldable.find(b => b.start === i);
                  const isFolded = collapsedLines.has(i);
                  
                  visible.push(
                    <div key={i} className="h-[21px] flex items-center gap-1 group/gutter relative">
                      {block && (
                        <button 
                          onClick={(e) => { e.stopPropagation(); toggleFold(i); }}
                          className="absolute -left-1 text-white/40 hover:text-white transition-colors"
                        >
                          {isFolded ? <ChevronRight size={10} /> : <ChevronDown size={10} />}
                        </button>
                      )}
                      <span className={cn(
                        "text-[9px] font-mono",
                        isDebugMode ? "text-blue-400/60" : "text-white/20"
                      )}>
                        {i + 1}
                      </span>
                    </div>
                  );
                  
                  if (isFolded && block) {
                    i = block.end;
                    // Add a tiny indicator that lines are hidden
                    visible.push(<div key={`fold-${i}`} className="h-[2px] w-2 bg-blue-500/30 self-center rounded-full my-1" />);
                  }
                }
                return visible;
              })()}
            </div>

            <div className="flex-1 min-h-[100px] overflow-hidden flex flex-col">
            <div className="flex-1 relative overflow-hidden">
                {/* Syntax Highlighting Layer */}
                <div 
                  ref={scrollRef}
                  className={cn(
                    "absolute inset-0 p-6 font-mono text-sm leading-relaxed pointer-events-none whitespace-pre overflow-hidden",
                    THEMES[currentTheme].text
                  )}
                  dangerouslySetInnerHTML={{ 
                    __html: highlightCode(
                      (() => {
                        const lines = code.split('\n');
                        const foldable = getFoldableBlocks();
                        const result = [];
                        for (let i = 0; i < lines.length; i++) {
                          const isFolded = collapsedLines.has(i);
                          const block = foldable.find(b => b.start === i);
                          result.push(lines[i]);
                          if (isFolded && block) {
                            result[result.length - 1] += ' { ... }';
                            i = block.end;
                          }
                        }
                        return result.join('\n');
                      })()
                    ) + '\n\n' 
                  }}
                />
                {/* Input Layer */}
                <textarea 
                  ref={textareaRef}
                  className={cn(
                    "absolute inset-0 w-full h-full bg-transparent p-6 outline-none resize-none font-mono text-sm leading-relaxed transition-colors duration-300 caret-white",
                    "text-transparent selection:bg-blue-500/30 overflow-auto whitespace-pre",
                  )}
                  spellCheck={false}
                  value={(() => {
                    const lines = code.split('\n');
                    const foldable = getFoldableBlocks();
                    const result = [];
                    for (let i = 0; i < lines.length; i++) {
                      const isFolded = collapsedLines.has(i);
                      const block = foldable.find(b => b.start === i);
                      result.push(lines[i]);
                      if (isFolded && block) {
                        // We add a placeholder in the textarea too so the lines match up
                        result[result.length - 1] += ' { ... }';
                        i = block.end;
                      }
                    }
                    return result.join('\n');
                  })()}
                  readOnly={collapsedLines.size > 0} // Simplify: read-only when folded to avoid complex mapping
                  onChange={(e) => {
                    if (collapsedLines.size === 0) {
                      setCode(e.target.value);
                      setIsDirty(true);
                    }
                  }}
                  onScroll={handleScroll}
                  onKeyDown={(e) => {
                    if (e.ctrlKey && e.key === 's') {
                      e.preventDefault();
                      handleSave();
                    }
                    
                    // Tab handling
                    if (e.key === 'Tab') {
                      e.preventDefault();
                      const start = e.currentTarget.selectionStart;
                      const end = e.currentTarget.selectionEnd;
                      const value = e.currentTarget.value;
                      setCode(value.substring(0, start) + "  " + value.substring(end));
                      setIsDirty(true);
                      
                      // Reset cursor
                      setTimeout(() => {
                        if (textareaRef.current) {
                          textareaRef.current.selectionStart = textareaRef.current.selectionEnd = start + 2;
                        }
                      }, 0);
                    }
                  }}
                />
              </div>
              
              {/* Status Bar */}
              <div className="h-6 bg-black/40 border-t border-white/5 flex items-center px-4 justify-between text-[10px] text-white/40">
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-1.5">
                    <div className={cn("w-1.5 h-1.5 rounded-full", isDirty ? "bg-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.5)]" : "bg-emerald-500")} />
                    <span>{isDirty ? 'Unsaved Changes' : 'All Changes Saved'}</span>
                  </div>
                  <div className="w-[1px] h-3 bg-white/10" />
                  <span>UTF-8</span>
                  <div className="w-[1px] h-3 bg-white/10" />
                  <span>{activeFile.endsWith('.b') ? 'Brainscript' : activeFile.endsWith('.scr') ? 'GlassScript' : 'Text'}</span>
                </div>
                <div className="flex items-center gap-4">
                  <span>Line {code.substring(0, textareaRef.current?.selectionStart || 0).split('\n').length}, Col {(textareaRef.current?.selectionStart || 0) - code.lastIndexOf('\n', (textareaRef.current?.selectionStart || 0) - 1)}</span>
                  <span>{code.length} chars</span>
                </div>
              </div>
            </div>
          </div>
          
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
                      log.includes('SUCCESS') ? "text-green-400" : 
                      log.includes('[FATAL]') || log.includes('Error') ? "text-red-400" :
                      "text-white/60"
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
          <div className="flex items-center gap-1 opacity-70">
            <Cpu size={10} />
            <span>{targetArch.split(' ')[0]}</span>
          </div>
          <div className="flex items-center gap-1 opacity-70">
            <Gauge size={10} />
            <span>{optimizationLevel.split(' ')[0]}</span>
          </div>
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
          <FilePicker 
            title="Create New Project File"
            fs={fs}
            fsLib={fsLib}
            mode="save"
            initialFileName="untitled.b"
            allowedExtensions={['b', 'scr', 'json', 'txt']}
            accentColor={accentColor}
            onCancel={() => setActiveDialog(null)}
            onSelect={(path) => {
              try {
                fsLib.write(path, `\nREM New ${path.split('.').pop()} file created\nStart\n  TIMESTAMP\nEnd`);
                const parts = path.split('/');
                const fileName = parts.pop() || '';
                setActiveFile(fileName);
                setActiveDialog(null);
                addNotification('Code Studio', `Created ${fileName}`, 'success');
              } catch (e) {
                addNotification('Code Studio', 'Error creating file', 'error');
              }
            }}
          />
        )}

        {activeDialog === 'open' && (
          <FilePicker 
            title="Open Project File"
            fs={fs}
            fsLib={fsLib}
            mode="open"
            allowedExtensions={['b', 'scr', 'json', 'txt']}
            accentColor={accentColor}
            onCancel={() => setActiveDialog(null)}
            onSelect={(path, item) => {
              setActiveFile(item.name);
              setCode(item.content || '');
              setActiveDialog(null);
              addNotification('Code Studio', `Loaded ${item.name}`, 'info');
            }}
          />
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

function FolderItem({ name, defaultOpen = false, children }: { name: string, defaultOpen?: boolean, children?: React.ReactNode }) {
  const [isOpen, setIsOpen] = useState(defaultOpen);
  return (
    <div className="mb-1">
      <div 
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-2 py-1 rounded hover:bg-white/5 cursor-pointer text-white/50 group"
      >
        <ChevronRight size={14} className={cn("transition-transform", isOpen && "rotate-90")} />
        <Folder size={14} className="group-hover:text-white transition-colors" />
        <span className="text-[11px] font-medium group-hover:text-white transition-colors">{name}</span>
      </div>
      <AnimatePresence>
        {isOpen && (
          <motion.div 
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="ml-4 mt-1 overflow-hidden"
          >
            {children}
          </motion.div>
        )}
      </AnimatePresence>
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
