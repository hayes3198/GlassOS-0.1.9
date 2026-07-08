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
  RefreshCcw,
  Plus,
  Trash2,
  Circle,
  FileCode,
  Box,
  Save,
  Undo,
  Send,
  Upload,
  Download,
  FolderOpen,
  Calendar,
  Table as TableIcon,
  Columns,
  Rows,
  Database as DatabaseIcon,
  Calculator,
  Grid,
  Pencil,
  Cloud,
  MoreVertical,
  FilePlus,
  FileJson,
  FileText as FileTextIcon,
  Server,
  Palette,
  Info,
  AlertCircle,
  AlertTriangle,
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
  Hash,
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
  Sun,
  Contrast,
  RotateCw,
  FlipHorizontal,
  Pin,
  PinOff,
  FolderPlus,
  Tag,
  FolderMinus,
  EyeOff,
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
  const [installedApps, setInstalledApps] = useState<AppId[]>(['terminal', 'settings', 'notepad', 'browser', 'photos', 'music', 'appfolder', 'codestudio', 'files', 'systemmonitor', 'glassword', 'glassdraw', 'glasspaint', 'glassphoto', 'spreadsheet', 'calendar', 'glassmail', 'glassdatabase', 'glassmessaging', 'printers', 'taskscheduler']);
  const [notepadContent, setNotepadContent] = useState('');
  const [glassWordContent, setGlassWordContent] = useState(DEFAULT_GLASSWORD_CONTENT);
  const [activeFileInGlassWord, setActiveFileInGlassWord] = useState<{name: string, path: string[]} | null>(null);
  const [activeFileInSheets, setActiveFileInSheets] = useState<{name: string, path: string[]} | null>(null);
  const [photosAppSelectedFile, setPhotosAppSelectedFile] = useState<any>(null);
  const [glassDrawSelectedFile, setGlassDrawSelectedFile] = useState<any>(null);
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
              <DesktopIcon icon={<ImageIcon className="text-purple-400" />} label="GlassPhoto" onClick={() => openWindow('glassphoto', 'Glass Photo Editor')} />
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
                    photosAppSelectedFile, setPhotosAppSelectedFile,
                    glassDrawSelectedFile, setGlassDrawSelectedFile,
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
                          { id: 'glassphoto', label: 'GlassPhoto', color: 'bg-purple-500/20 text-purple-400' },
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
    case 'glassphoto': return <ImageIcon size={size} className="text-purple-400" />;
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

function GlassDrawApp({ fs, setFs, fsLib, addNotification, setGlassWordContent, openWindow, selectedFile }: any) {
  const [elements, setElements] = useState<any[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [tool, setTool] = useState<'select' | 'rect' | 'circle' | 'line' | 'pencil'>('select');
  const [fillColor, setFillColor] = useState('#3b82f6');
  const [strokeColor, setStrokeColor] = useState('#ffffff');
  const [strokeWidth, setStrokeWidth] = useState(2);
  const [opacity, setOpacity] = useState(0.8);
  const [blur, setBlur] = useState(0);
  const [showSaveDialog, setShowSaveDialog] = useState(false);
  const [showOpenDialog, setShowOpenDialog] = useState(false);
  const [remoteFiles, setRemoteFiles] = useState<FileSystemItem[]>([]);
  const [saveName, setSaveName] = useState('untitled.gdraw');
  const [isDrawing, setIsDrawing] = useState(false);
  const [startPos, setStartPos] = useState({ x: 0, y: 0 });
  const [bgImage, setBgImage] = useState<string | null>(null);
  const [gridVisible, setGridVisible] = useState(true);

  useEffect(() => {
    if (selectedFile) {
      if (selectedFile.name.endsWith('.gdraw')) {
        try {
          setElements(JSON.parse(selectedFile.content || '[]'));
          setSaveName(selectedFile.name);
        } catch (e) {
          console.error('Failed to parse gdraw', e);
        }
      } else {
        setBgImage(selectedFile.content || null);
      }
    }
  }, [selectedFile]);

  useEffect(() => {
    // Poll for files to open
    const fetchFiles = () => {
      const drawings = fsLib.list('Documents/Drawings') || [];
      const paintings = fsLib.list('Documents/Paintings') || [];
      setRemoteFiles([...drawings, ...paintings]);
    };
    fetchFiles();
  }, [fs]);

  const handleOpenFile = (file: FileSystemItem) => {
    if (file.name.endsWith('.gdraw')) {
      try {
        const data = JSON.parse(file.content || '[]');
        setElements(data);
        setBgImage(null);
        addNotification('GlassDraw', `Opened ${file.name}`, 'info');
      } catch (e) {
        addNotification('GlassDraw', 'Error parsing drawing', 'error');
      }
    } else if (file.name.endsWith('.gpaint')) {
      // Import paint raster as background
      setBgImage(file.content || null);
      addNotification('GlassDraw', `Imported ${file.name} as reference`, 'info');
    }
    setShowOpenDialog(false);
  };

  const handleImportToWord = () => {
    const svg = document.getElementById('draw-canvas');
    if (!svg) return;
    const serializer = new XMLSerializer();
    const svgStr = serializer.serializeToString(svg);
    const dataUri = 'data:image/svg+xml;base64,' + btoa(svgStr);
    
    setGlassWordContent((prev: string) => prev + `<br/><br/><div style="text-align:center"><img src="${dataUri}" style="max-width: 80%; border-radius: 8px; box-shadow: 0 10px 40px rgba(0,0,0,0.1);" alt="Drawing Export" /></div><br/>`);
    addNotification('GlassDraw', 'Imported to GlassWord Pro', 'success');
    openWindow('glassword', 'GlassWord Professional');
  };

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
      points: tool === 'pencil' ? [{ x, y }] : [],
      fill: fillColor,
      stroke: strokeColor,
      strokeWidth: strokeWidth,
      opacity: opacity,
      blur: blur
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
      } else if (el.type === 'pencil') {
        return { ...el, points: [...el.points, { x, y }] };
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
      fsLib.write('Documents/Drawings/' + saveName, data);
      addNotification('GlassDraw', `Saved ${saveName}`, 'success');
      setShowSaveDialog(false);
    } catch (e) {
      addNotification('GlassDraw', 'Error saving file', 'error');
    }
  };

  const clearCanvas = () => {
    setElements([]);
  };

  const deleteSelected = () => {
    if (selectedId) {
      setElements(elements.filter(el => el.id !== selectedId));
      setSelectedId(null);
    }
  };

  return (
    <div className="h-full flex flex-col bg-[#0f172a] text-white">
      <div className="h-10 border-b border-white/10 flex items-center px-4 justify-between bg-slate-900/50">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1 bg-white/5 p-1 rounded-lg">
            <button onClick={() => setTool('select')} className={cn("p-1.5 rounded", tool === 'select' ? "bg-blue-500 text-white" : "hover:bg-white/10")} title="Select"><MousePointer2 size={14} /></button>
            <button onClick={() => setTool('pencil')} className={cn("p-1.5 rounded", tool === 'pencil' ? "bg-blue-500 text-white" : "hover:bg-white/10")} title="Pencil"><Pencil size={14} /></button>
            <button onClick={() => setTool('rect')} className={cn("p-1.5 rounded", tool === 'rect' ? "bg-blue-500 text-white" : "hover:bg-white/10")} title="Rectangle"><Square size={14} /></button>
            <button onClick={() => setTool('circle')} className={cn("p-1.5 rounded", tool === 'circle' ? "bg-blue-500 text-white" : "hover:bg-white/10")} title="Circle"><Circle size={14} /></button>
            <button onClick={() => setTool('line')} className={cn("p-1.5 rounded", tool === 'line' ? "bg-blue-500 text-white" : "hover:bg-white/10")} title="Line"><Minus size={14} /></button>
          </div>
          <div className="h-6 w-[1px] bg-white/10" />
          <div className="flex items-center gap-2">
            <div className="flex flex-col">
              <span className="text-[8px] uppercase font-bold text-white/40">Fill</span>
              <input type="color" value={fillColor} onChange={e => setFillColor(e.target.value)} className="w-4 h-4 rounded border-0 bg-transparent cursor-pointer" />
            </div>
            <div className="flex flex-col">
              <span className="text-[8px] uppercase font-bold text-white/40">Stroke</span>
              <input type="color" value={strokeColor} onChange={e => setStrokeColor(e.target.value)} className="w-4 h-4 rounded border-0 bg-transparent cursor-pointer" />
            </div>
            <div className="flex flex-col">
              <span className="text-[8px] uppercase font-bold text-white/40">Size</span>
              <input type="range" min="1" max="20" value={strokeWidth} onChange={e => setStrokeWidth(parseInt(e.target.value))} className="w-16 accent-blue-500 h-1" />
            </div>
            <div className="flex flex-col">
              <span className="text-[8px] uppercase font-bold text-white/40">Blur</span>
              <input type="range" min="0" max="10" value={blur} onChange={e => setBlur(parseInt(e.target.value))} className="w-16 accent-purple-500 h-1" />
            </div>
            <div className="flex flex-col">
              <span className="text-[8px] uppercase font-bold text-white/40">Glass</span>
              <input type="range" min="0" max="1" step="0.1" value={opacity} onChange={e => setOpacity(parseFloat(e.target.value))} className="w-16 accent-emerald-500 h-1" />
            </div>
          </div>
          <div className="flex gap-1 bg-white/5 p-1 rounded-lg ml-2">
            <button onClick={() => setGridVisible(!gridVisible)} className={cn("p-1.5 rounded", gridVisible ? "text-blue-400" : "text-white/40")} title="Toggle Grid"><Grid size={14} /></button>
            <button onClick={() => setShowOpenDialog(true)} className="p-1.5 hover:bg-white/10 rounded" title="Open Drawing or Paint"><FolderOpen size={14} /></button>
            <button onClick={handleImportToWord} className="p-1.5 hover:bg-white/10 rounded text-amber-400 font-bold text-[10px]" title="Export to Word">WORD</button>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {selectedId && (
            <button onClick={deleteSelected} className="p-1.5 hover:bg-white/10 rounded text-red-500" title="Delete Selected">
              <Trash2 size={14} />
            </button>
          )}
          <button onClick={clearCanvas} className="p-1.5 hover:bg-white/10 rounded text-red-400" title="Clear"><RefreshCcw size={14} /></button>
          <button onClick={() => setShowSaveDialog(true)} className="flex items-center gap-2 px-3 py-1 bg-blue-600 hover:bg-blue-500 rounded text-[10px] font-bold uppercase tracking-wider"><Save size={14} /> Save</button>
        </div>
      </div>
      <div className={cn("flex-1 relative overflow-hidden bg-white/5", gridVisible && "pattern-dots")}>
        <svg 
          id="draw-canvas"
          className="w-full h-full cursor-crosshair"
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
        >
          <defs>
            <filter id="glass-shadow" x="-50%" y="-50%" width="200%" height="200%">
              <feDropShadow dx="0" dy="4" stdDeviation="4" floodColor="#000000" floodOpacity="0.3" />
            </filter>
            <filter id="frosted-glass">
              <feGaussianBlur in="SourceGraphic" stdDeviation="2" result="blur" />
              <feColorMatrix in="blur" mode="matrix" values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 18 -7" result="goo" />
              <feComposite in="SourceGraphic" in2="goo" operator="atop" />
            </filter>
            <linearGradient id="glass-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="rgba(255,255,255,0.1)" />
              <stop offset="100%" stopColor="rgba(255,255,255,0.02)" />
            </linearGradient>
          </defs>

          {bgImage && <image href={bgImage} x="0" y="0" width="100%" height="100%" opacity="0.3" />}
          
          <g filter="url(#glass-shadow)">
            {elements.map(el => (
              <React.Fragment key={el.id}>
                {el.type === 'rect' && (
                  <rect 
                    x={el.x} y={el.y} width={el.width} height={el.height} 
                    fill={el.fill} stroke={el.stroke} strokeWidth={el.strokeWidth}
                    fillOpacity={el.opacity || 0.8}
                    style={{ filter: el.blur > 0 ? `blur(${el.blur}px)` : undefined }}
                    data-id={el.id}
                    rx="4"
                    className={cn("transition-all", selectedId === el.id && "stroke-blue-400 stroke-2 ring-4 ring-blue-500/20")}
                  />
                )}
                {el.type === 'circle' && (
                  <circle 
                    cx={el.x} cy={el.y} r={el.radius} 
                    fill={el.fill} stroke={el.stroke} strokeWidth={el.strokeWidth}
                    fillOpacity={el.opacity || 0.8}
                    style={{ filter: el.blur > 0 ? `blur(${el.blur}px)` : undefined }}
                    data-id={el.id}
                    className={cn("transition-all", selectedId === el.id && "stroke-blue-400 stroke-2")}
                  />
                )}
                {el.type === 'line' && (
                  <line 
                    x1={el.x} y1={el.y} x2={el.x2} y2={el.y2}
                    stroke={el.stroke} strokeWidth={el.strokeWidth}
                    strokeOpacity={el.opacity || 1}
                    style={{ filter: el.blur > 0 ? `blur(${el.blur}px)` : undefined }}
                    data-id={el.id}
                    className={cn("transition-all", selectedId === el.id && "stroke-blue-400 stroke-2")}
                  />
                )}
                {el.type === 'pencil' && (
                  <path 
                    d={`M ${(el.points || []).map((p: any) => `${p.x} ${p.y}`).join(' L ')}`}
                    fill="transparent"
                    stroke={el.stroke}
                    strokeWidth={el.strokeWidth}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeOpacity={el.opacity || 1}
                    style={{ filter: el.blur > 0 ? `blur(${el.blur}px)` : undefined }}
                    data-id={el.id}
                    className={cn("transition-all", selectedId === el.id && "stroke-blue-400 stroke-2")}
                  />
                )}
              </React.Fragment>
            ))}
          </g>
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
                <button onClick={handleSave} className="flex-1 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-xs font-bold text-white">Save</button>
              </div>
            </motion.div>
          </div>
        )}
        {showOpenDialog && (
          <div className="absolute inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="glass-dark p-4 rounded-2xl w-full max-w-md border border-white/10 shadow-2xl flex flex-col h-[60%]">
              <div className="flex justify-between items-center mb-4">
                 <h3 className="text-sm font-bold">Open Drawing</h3>
                 <button onClick={() => setShowOpenDialog(false)}><X size={16} /></button>
              </div>
              <div className="flex-1 overflow-y-auto space-y-2">
                {remoteFiles.length === 0 && <div className="text-center text-white/20 text-xs p-8 italic">No drawings or paintings found</div>}
                {remoteFiles.map(file => (
                  <button 
                    key={file.name} 
                    onClick={() => handleOpenFile(file)}
                    className="w-full p-3 bg-white/5 hover:bg-white/10 rounded-lg flex items-center gap-3 text-left group"
                  >
                    {file.name.endsWith('.gdraw') ? <BoxIcon size={16} className="text-blue-400" /> : <Palette size={16} className="text-pink-400" />}
                    <div className="flex-1 overflow-hidden">
                      <div className="text-xs font-bold truncate">{file.name}</div>
                      <div className="text-[9px] text-white/40 uppercase font-bold tracking-tighter">
                        {file.name.endsWith('.gdraw') ? 'Vector Graphics' : 'Raster Image'}
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

function GlassPaintApp({ fsLib, addNotification, setGlassWordContent, openWindow, fs }: any) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [brushColor, setBrushColor] = useState('#3b82f6');
  const [brushSize, setBrushSize] = useState(5);
  const [tool, setTool] = useState<'brush' | 'eraser'>('brush');
  const [showSaveDialog, setShowSaveDialog] = useState(false);
  const [showOpenDialog, setShowOpenDialog] = useState(false);
  const [remoteFiles, setRemoteFiles] = useState<FileSystemItem[]>([]);
  const [saveName, setSaveName] = useState('sketch.gpaint');

  useEffect(() => {
    const fetchFiles = () => {
      const drawings = fsLib.list('Documents/Drawings') || [];
      const paintings = fsLib.list('Documents/Paintings') || [];
      setRemoteFiles([...drawings, ...paintings]);
    };
    fetchFiles();
  }, [fs]);

  const handleOpenFile = (file: FileSystemItem) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    if (file.name.endsWith('.gpaint')) {
      const img = new Image();
      img.onload = () => {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(img, 0, 0);
      };
      img.src = file.content || '';
      addNotification('GlassPaint', `Opened ${file.name}`, 'info');
    } else if (file.name.endsWith('.gdraw')) {
      // Render vector elements to canvas
      try {
        const elements = JSON.parse(file.content || '[]');
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        elements.forEach((el: any) => {
          ctx.strokeStyle = el.stroke || '#000000';
          ctx.fillStyle = el.fill || 'transparent';
          ctx.lineWidth = el.strokeWidth || 1;
          
          if (el.type === 'rect') {
            ctx.fillRect(el.x, el.y, el.width, el.height);
            ctx.strokeRect(el.x, el.y, el.width, el.height);
          } else if (el.type === 'circle') {
            ctx.beginPath();
            ctx.arc(el.x, el.y, el.radius, 0, Math.PI * 2);
            ctx.fill();
            ctx.stroke();
          } else if (el.type === 'line') {
            ctx.beginPath();
            ctx.moveTo(el.x, el.y);
            ctx.lineTo(el.x2, el.y2);
            ctx.stroke();
          }
        });
        addNotification('GlassPaint', `Imported vector ${file.name}`, 'info');
      } catch (e) {
        addNotification('GlassPaint', 'Failed to import vector mapping', 'error');
      }
    }
    setShowOpenDialog(false);
  };

  const handleImportToWord = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const dataUri = canvas.toDataURL('image/png');
    setGlassWordContent((prev: string) => prev + `<br/><br/><div style="text-align:center"><img src="${dataUri}" style="max-width: 80%; border-radius: 8px; box-shadow: 0 10px 40px rgba(0,0,0,0.1);" alt="Painting Export" /></div><br/>`);
    addNotification('GlassPaint', 'Imported to GlassWord Pro', 'success');
    openWindow('glassword', 'GlassWord Professional');
  };

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
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    const x = (e.clientX - rect.left) * scaleX;
    const y = (e.clientY - rect.top) * scaleY;
    
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
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    const x = (e.clientX - rect.left) * scaleX;
    const y = (e.clientY - rect.top) * scaleY;
    
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
      fsLib.write('Documents/Paintings/' + saveName, data);
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
            <button onClick={() => setTool('brush')} className={cn("p-1.5 rounded", tool === 'brush' ? "bg-blue-500" : "hover:bg-white/10")} title="Brush"><PaintBucket size={14} /></button>
            <button onClick={() => setTool('eraser')} className={cn("p-1.5 rounded", tool === 'eraser' ? "bg-blue-500" : "hover:bg-white/10")} title="Eraser"><Eraser size={14} /></button>
          </div>
          <input type="color" value={brushColor} onChange={e => setBrushColor(e.target.value)} className="w-6 h-6 rounded cursor-pointer" />
          <input type="range" min="1" max="50" value={brushSize} onChange={e => setBrushSize(parseInt(e.target.value))} className="w-24 accent-blue-500" />
          <div className="flex gap-1 bg-white/5 p-1 rounded-lg ml-2">
            <button onClick={() => setShowOpenDialog(true)} className="p-1.5 hover:bg-white/10 rounded" title="Open Paint or Drawing"><FolderOpen size={14} /></button>
            <button onClick={handleImportToWord} className="p-1.5 hover:bg-white/10 rounded text-amber-400 font-bold text-[10px]" title="Export to Word">WORD</button>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={clearCanvas} className="p-1.5 hover:bg-white/10 rounded text-white/40" title="Clear"><RefreshCw size={14} /></button>
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
        {showOpenDialog && (
          <div className="absolute inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="glass-dark p-4 rounded-2xl w-full max-w-md border border-white/10 shadow-2xl flex flex-col h-[60%]">
              <div className="flex justify-between items-center mb-4 text-white">
                 <h3 className="text-sm font-bold">Open Canvas</h3>
                 <button onClick={() => setShowOpenDialog(false)}><X size={16} /></button>
              </div>
              <div className="flex-1 overflow-y-auto space-y-2 translate-z-0">
                {remoteFiles.length === 0 && <div className="text-center text-white/20 text-xs p-8 italic">No paintings or drawings found</div>}
                {remoteFiles.map(file => (
                  <button 
                    key={file.name} 
                    onClick={() => handleOpenFile(file)}
                    className="w-full p-3 bg-white/5 hover:bg-white/10 rounded-lg flex items-center gap-3 text-left group"
                  >
                    {file.name.endsWith('.gpaint') ? <Palette size={16} className="text-pink-400" /> : <BoxIcon size={16} className="text-blue-400" />}
                    <div className="flex-1 overflow-hidden">
                      <div className="text-xs font-bold truncate text-white">{file.name}</div>
                      <div className="text-[9px] text-white/40 uppercase font-bold tracking-tighter">
                        {file.name.endsWith('.gpaint') ? 'Bitmap/Raster' : 'Vector Elements'}
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

function GlassPhotoApp({ fsLib, addNotification }: any) {
  const [image, setImage] = useState<string | null>(null);
  const [brightness, setBrightness] = useState(100);
  const [contrast, setContrast] = useState(100);
  const [grayscale, setGrayscale] = useState(0);
  const [sepia, setSepia] = useState(0);
  const [invert, setInvert] = useState(0);
  const [hueRotate, setHueRotate] = useState(0);
  const [rotation, setRotation] = useState(0);
  const [flipH, setFlipH] = useState(false);
  const [flipV, setFlipV] = useState(false);
  const [showSaveDialog, setShowSaveDialog] = useState(false);
  const [showOpenDialog, setShowOpenDialog] = useState(false);
  const [remoteFiles, setRemoteFiles] = useState<any[]>([]);
  const [saveFormat, setSaveFormat] = useState<'png' | 'jpeg' | 'tiff'>('png');
  const [saveName, setSaveName] = useState('edited_photo');
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (showOpenDialog) {
      const fetchFiles = () => {
        const photos = fsLib.list('Documents/Photos') || [];
        // Also include paintings just in case
        const paintings = fsLib.list('Documents/Paintings') || [];
        setRemoteFiles([...photos, ...paintings].filter(f => f.type === 'file'));
      };
      fetchFiles();
    }
  }, [showOpenDialog, fsLib]);

  const handleOpenRemote = (file: any) => {
    setImage(file.content);
    resetFilters();
    setShowOpenDialog(false);
    addNotification('GlassPhoto', `Loaded ${file.name} from gallery`, 'success');
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setImage(event.target?.result as string);
        resetFilters();
      };
      reader.readAsDataURL(file);
    }
  };

  const resetFilters = () => {
    setBrightness(100);
    setContrast(100);
    setGrayscale(0);
    setSepia(0);
    setInvert(0);
    setHueRotate(0);
    setRotation(0);
    setFlipH(false);
    setFlipV(false);
  };

  const applyFilters = () => {
    if (!image) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const img = new Image();
    img.crossOrigin = "anonymous";
    img.src = image;
    img.onload = () => {
      canvas.width = img.width;
      canvas.height = img.height;
      
      ctx.filter = `brightness(${brightness}%) contrast(${contrast}%) grayscale(${grayscale}%) sepia(${sepia}%) invert(${invert}%) hue-rotate(${hueRotate}deg)`;
      
      ctx.translate(canvas.width / 2, canvas.height / 2);
      if (rotation !== 0) ctx.rotate((rotation * Math.PI) / 180);
      ctx.scale(flipH ? -1 : 1, flipV ? -1 : 1);
      ctx.drawImage(img, -img.width / 2, -img.height / 2);
    };
  };

  useEffect(() => {
    applyFilters();
  }, [image, brightness, contrast, grayscale, sepia, invert, hueRotate, rotation, flipH, flipV]);

  const handleSave = async () => {
    const canvas = canvasRef.current;
    if (!canvas || !image) return;
    
    let mimeType = 'image/png';
    let extension = '.png';
    
    if (saveFormat === 'jpeg') {
      mimeType = 'image/jpeg';
      extension = '.jpg';
    } else if (saveFormat === 'tiff') {
      mimeType = 'image/tiff';
      extension = '.tiff';
    }

    const data = canvas.toDataURL(mimeType, 0.9);
    const finalName = saveName.endsWith(extension) ? saveName : saveName + extension;
    
    try {
      fsLib.write('Documents/Photos/' + finalName, data);
      addNotification('GlassPhoto', `Saved ${finalName}`, 'success');
      setShowSaveDialog(false);
    } catch (e) {
      addNotification('GlassPhoto', 'Error saving photo', 'error');
    }
  };

  return (
    <div className="h-full flex flex-col bg-[#0f172a] text-white overflow-hidden">
      <div className="h-10 border-b border-white/10 flex items-center px-4 justify-between bg-slate-900/80">
        <div className="flex items-center gap-4">
          <button 
            onClick={() => fileInputRef.current?.click()}
            className="flex items-center gap-2 px-3 py-1 bg-white/5 hover:bg-white/10 rounded text-[10px] font-bold uppercase tracking-wider"
          >
            <Upload size={14} /> Open
          </button>
          <button 
            onClick={() => setShowOpenDialog(true)}
            className="flex items-center gap-2 px-3 py-1 bg-white/5 hover:bg-white/10 rounded text-[10px] font-bold uppercase tracking-wider"
          >
            <FolderOpen size={14} /> Gallery
          </button>
          <input 
            type="file" 
            ref={fileInputRef} 
            className="hidden" 
            accept="image/*" 
            onChange={handleImageUpload} 
          />
          {image && (
            <div className="flex items-center gap-1 border-l border-white/10 pl-4">
              <button 
                onClick={() => setRotation(prev => (prev + 90) % 360)}
                className="p-1.5 hover:bg-white/10 rounded"
                title="Rotate"
              >
                <RotateCw size={14} />
              </button>
              <button 
                onClick={() => setFlipH(!flipH)}
                className="p-1.5 hover:bg-white/10 rounded"
                title="Flip Horizontal"
              >
                <FlipHorizontal size={14} />
              </button>
              <button 
                onClick={resetFilters}
                className="p-1.5 hover:bg-white/10 rounded text-red-400"
                title="Reset Filters"
              >
                <RefreshCw size={14} />
              </button>
            </div>
          )}
        </div>
        <div className="flex items-center gap-2">
          <button 
            disabled={!image}
            onClick={() => setShowSaveDialog(true)} 
            className="flex items-center gap-2 px-3 py-1 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 disabled:cursor-not-allowed rounded text-[10px] font-bold uppercase tracking-wider"
          >
            <Save size={14} /> Save
          </button>
        </div>
      </div>
      
      <div className="flex-1 flex overflow-hidden">
        {/* Controls Sidebar */}
        {image && (
          <div className="w-64 border-r border-white/10 bg-slate-900/40 p-4 space-y-6 overflow-y-auto no-scrollbar">
            <div className="space-y-4">
              <div className="space-y-2">
                <div className="flex justify-between text-[10px] uppercase font-bold text-white/40">
                  <span className="flex items-center gap-1"><Sun size={10} /> Brightness</span>
                  <span>{brightness}%</span>
                </div>
                <input 
                  type="range" min="0" max="200" value={brightness} 
                  onChange={e => setBrightness(parseInt(e.target.value))}
                  className="w-full accent-blue-500" 
                />
              </div>

              <div className="space-y-2">
                <div className="flex justify-between text-[10px] uppercase font-bold text-white/40">
                  <span className="flex items-center gap-1"><Contrast size={10} /> Contrast</span>
                  <span>{contrast}%</span>
                </div>
                <input 
                  type="range" min="0" max="200" value={contrast} 
                  onChange={e => setContrast(parseInt(e.target.value))}
                  className="w-full accent-blue-500" 
                />
              </div>

              <div className="space-y-2">
                <div className="flex justify-between text-[10px] uppercase font-bold text-white/40">
                  <span>Grayscale</span>
                  <span>{grayscale}%</span>
                </div>
                <input 
                  type="range" min="0" max="100" value={grayscale} 
                  onChange={e => setGrayscale(parseInt(e.target.value))}
                  className="w-full accent-blue-500" 
                />
              </div>

              <div className="space-y-2">
                <div className="flex justify-between text-[10px] uppercase font-bold text-white/40">
                  <span>Sepia</span>
                  <span>{sepia}%</span>
                </div>
                <input 
                  type="range" min="0" max="100" value={sepia} 
                  onChange={e => setSepia(parseInt(e.target.value))}
                  className="w-full accent-blue-500" 
                />
              </div>

              <div className="space-y-2">
                <div className="flex justify-between text-[10px] uppercase font-bold text-white/40">
                  <span>Invert</span>
                  <span>{invert}%</span>
                </div>
                <input 
                  type="range" min="0" max="100" value={invert} 
                  onChange={e => setInvert(parseInt(e.target.value))}
                  className="w-full accent-blue-500" 
                />
              </div>

              <div className="space-y-2">
                <div className="flex justify-between text-[10px] uppercase font-bold text-white/40">
                  <span>Hue Rotate</span>
                  <span>{hueRotate}°</span>
                </div>
                <input 
                  type="range" min="0" max="360" value={hueRotate} 
                  onChange={e => setHueRotate(parseInt(e.target.value))}
                  className="w-full accent-blue-500" 
                />
              </div>
            </div>

            <div className="pt-4 border-t border-white/5">
              <h3 className="text-[10px] font-bold text-white/20 uppercase tracking-widest mb-4">Quick Filters</h3>
              <div className="grid grid-cols-2 gap-2">
                <button onClick={() => { resetFilters(); setGrayscale(100); }} className="px-2 py-2 bg-white/5 hover:bg-white/10 rounded text-[9px] font-bold uppercase tracking-tighter transition-all">Mono</button>
                <button onClick={() => { resetFilters(); setSepia(80); setBrightness(110); }} className="px-2 py-2 bg-white/5 hover:bg-white/10 rounded text-[9px] font-bold uppercase tracking-tighter transition-all">Vintage</button>
                <button onClick={() => { resetFilters(); setContrast(150); setBrightness(120); }} className="px-2 py-2 bg-white/5 hover:bg-white/10 rounded text-[9px] font-bold uppercase tracking-tighter transition-all">Punchy</button>
                <button onClick={() => { resetFilters(); setInvert(100); }} className="px-2 py-2 bg-white/5 hover:bg-white/10 rounded text-[9px] font-bold uppercase tracking-tighter transition-all">Negative</button>
              </div>
            </div>
          </div>
        )}

        {/* Canvas Area */}
        <div className="flex-1 bg-black/40 flex items-center justify-center p-8 overflow-auto relative pattern-dots">
          {!image && (
            <div className="text-center">
              <ImageIcon size={48} className="mx-auto text-white/10 mb-4" />
              <p className="text-white/30 text-sm">Open a photo to start editing</p>
            </div>
          )}
          <canvas 
            ref={canvasRef} 
            className={cn(
              "max-w-full max-h-full shadow-2xl transition-all duration-300",
              !image && "hidden"
            )} 
          />
        </div>
      </div>

      <AnimatePresence>
        {showOpenDialog && (
          <div className="absolute inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="glass-dark p-6 rounded-2xl w-full max-w-sm border border-white/10 shadow-2xl flex flex-col max-h-[80%]">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-bold">Gallery Library</h3>
                <button onClick={() => setShowOpenDialog(false)} className="p-1 hover:bg-white/10 rounded-full"><X size={16} /></button>
              </div>
              <div className="flex-1 overflow-y-auto space-y-2 pr-2">
                {remoteFiles.length === 0 ? (
                  <div className="text-center py-8 text-white/20">
                    <ImageIcon size={32} className="mx-auto mb-2 opacity-10" />
                    <p className="text-[10px]">No photos found in Documents/Photos</p>
                  </div>
                ) : (
                  remoteFiles.map((file, i) => (
                    <button 
                      key={i}
                      onClick={() => handleOpenRemote(file)}
                      className="w-full flex items-center gap-3 p-2 bg-white/5 hover:bg-white/10 rounded-xl transition-all border border-white/5 group"
                    >
                      <div className="w-12 h-12 rounded-lg bg-black/40 overflow-hidden flex items-center justify-center text-white/20">
                        {file.content?.startsWith('data:image') ? (
                          <img src={file.content} alt={file.name} className="w-full h-full object-cover opacity-60 group-hover:opacity-100 transition-opacity" />
                        ) : (
                          <ImageIcon size={20} />
                        )}
                      </div>
                      <div className="flex-1 text-left min-w-0">
                        <div className="text-[11px] font-bold truncate">{file.name}</div>
                        <div className="text-[9px] text-white/40 uppercase tracking-tighter">{(file.content?.length || 0) / 1024 > 1024 ? `${((file.content?.length || 0) / 1048576).toFixed(1)} MB` : `${((file.content?.length || 0) / 1024).toFixed(0)} KB`}</div>
                      </div>
                    </button>
                  ))
                )}
              </div>
            </motion.div>
          </div>
        )}

        {showSaveDialog && (
          <div className="absolute inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="glass-dark p-6 rounded-2xl w-full max-w-xs border border-white/10 shadow-2xl">
              <h3 className="text-sm font-bold mb-4">Save Photo</h3>
              <div className="space-y-4">
                <div>
                  <label className="text-[10px] uppercase font-bold text-white/40 block mb-1">File Name</label>
                  <input 
                    type="text" 
                    value={saveName} 
                    onChange={e => setSaveName(e.target.value)}
                    className="w-full glass-input text-xs" 
                  />
                </div>
                <div>
                  <label className="text-[10px] uppercase font-bold text-white/40 block mb-1">Format</label>
                  <select 
                    value={saveFormat}
                    onChange={e => setSaveFormat(e.target.value as any)}
                    className="w-full glass-input text-xs bg-slate-800"
                  >
                    <option value="png">PNG (Lossless)</option>
                    <option value="jpeg">JPEG (Compressed)</option>
                    <option value="tiff">TIFF (Professional)</option>
                  </select>
                </div>
              </div>
              <div className="flex gap-2 mt-6">
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
    case 'photos': return <PhotosApp {...props} selectedFile={props.photosAppSelectedFile} />;
    case 'music': return <MusicApp {...props} />;
    case 'appfolder': return <AppFolderApp {...props} />;
    case 'codestudio': return <CodeStudioApp {...props} />;
    case 'files': return (
      <FilesApp 
        {...props} 
        setPhotosAppProps={(p: any) => props.setPhotosAppSelectedFile(p.selectedFile)}
        setGlassDrawProps={(p: any) => props.setGlassDrawSelectedFile(p.selectedFile)}
      />
    );
    case 'taskscheduler': return <TaskSchedulerApp {...props} />;
    case 'systemmonitor': return <SystemMonitorApp {...props} />;
    case 'glassword': return <GlassWordProcessor {...props} />;
    case 'printers': return <PrinterApp {...props} />;
    case 'calendar': return <CalendarApp {...props} />;
    case 'spreadsheet': return <SpreadsheetApp {...props} />;
    case 'glassmail': return <GlassMail {...props} />;
    case 'glassdatabase': return <GlassDatabase {...props} />;
    case 'glassmessaging': return <GlassMessaging {...props} />;
    case 'glassdraw': return <GlassDrawApp {...props} selectedFile={props.glassDrawSelectedFile} />;
    case 'glasspaint': return <GlassPaintApp {...props} />;
    case 'glassphoto': return <GlassPhotoApp {...props} />;
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
        if (ext === 'gdraw') {
          contentToInsert = `<div style="padding: 20px; background: #f8fafc; border: 2px dashed #cbd5e1; border-radius: 12px; text-align: center; margin: 15px 0; color: #64748b;">
            <div style="font-weight: bold; margin-bottom: 4px;">Drawing: ${file.name}</div>
            <div style="font-size: 10px; opacity: 0.7;">Vector data from GlassDraw</div>
          </div>`;
        } else if (ext === 'gpaint') {
          const src = file.content || '';
          contentToInsert = `<div style="text-align: center; margin: 15px 0;">
            <img src="${src}" style="max-width: 80%; border-radius: 8px; box-shadow: 0 10px 40px rgba(0,0,0,0.1);" alt="Painting: ${file.name}" />
            <div style="font-size: 9px; color: #94a3b8; margin-top: 4px; font-weight: bold;">PAINTING: ${file.name}</div>
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
  notepadStyle = { fontSize: '14px', fontWeight: 'normal', textAlign: 'left' },
  setNotepadStyle,
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

  const AVAILABLE_FONTS = [
    { id: 'monospace', name: 'JetBrains Mono', value: 'JetBrains Mono, ui-monospace, monospace' },
    { id: 'sans-serif', name: 'Inter', value: 'Inter, system-ui, sans-serif' },
    { id: 'serif', name: 'Playfair Display', value: 'Playfair Display, Georgia, serif' },
    { id: 'roboto', name: 'Roboto', value: 'Roboto, sans-serif' },
    { id: 'open-sans', name: 'Open Sans', value: 'Open Sans, sans-serif' },
    { id: 'montserrat', name: 'Montserrat', value: 'Montserrat, sans-serif' },
    { id: 'poppins', name: 'Poppins', value: 'Poppins, sans-serif' }
  ];

  const getFontFamilyValue = (fontFamilyId: string) => {
    const font = AVAILABLE_FONTS.find(f => f.id === fontFamilyId);
    return font ? font.value : 'JetBrains Mono, ui-monospace, monospace';
  };

  const getFontName = (fontFamilyId: string) => {
    const font = AVAILABLE_FONTS.find(f => f.id === fontFamilyId);
    return font ? font.name : 'JetBrains Mono';
  };

  const [showOpenDialog, setShowOpenDialog] = useState(false);
  const [showSaveDialog, setShowSaveDialog] = useState(false);
  const [saveFileName, setSaveFileName] = useState('');
  const [saveExtension, setSaveExtension] = useState('.txt');
  const [savePath, setSavePath] = useState<string[]>(['Documents']);
  const [showPreview, setShowPreview] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [isRenaming, setIsRenaming] = useState(false);
  const [renameValue, setRenameValue] = useState('');

  const [showFindReplace, setShowFindReplace] = useState(false);
  const [findText, setFindText] = useState('');
  const [replaceText, setReplaceText] = useState('');
  const [matchCase, setMatchCase] = useState(false);
  const [searchIndex, setSearchIndex] = useState(-1);
  const [showStats, setShowStats] = useState(false);
  const [showStatusBar, setShowStatusBar] = useState(true);
  const [showLineNumbers, setShowLineNumbers] = useState(true);
  const [showGoToLine, setShowGoToLine] = useState(false);
  const [goToLineInput, setGoToLineInput] = useState('');
  const [showFontDialog, setShowFontDialog] = useState(false);
  const [tempFontFamily, setTempFontFamily] = useState(notepadStyle?.fontFamily || 'monospace');
  const [tempFontSize, setTempFontSize] = useState(notepadStyle?.fontSize || '14px');
  const [tempFontWeight, setTempFontWeight] = useState(notepadStyle?.fontWeight || 'normal');
  const [tempColor, setTempColor] = useState(notepadStyle?.color || '');
  const [tempFontStyle, setTempFontStyle] = useState(notepadStyle?.fontStyle || 'normal');
  const [tempTextDecoration, setTempTextDecoration] = useState(notepadStyle?.textDecoration || 'none');
  const [tempTextTransform, setTempTextTransform] = useState(notepadStyle?.textTransform || 'none');
  const [tempTextAlign, setTempTextAlign] = useState(notepadStyle?.textAlign || 'left');

  // New Theme Dialog States
  const [showThemeDialog, setShowThemeDialog] = useState(false);
  const [tempTheme, setTempTheme] = useState(notepadStyle?.theme || 'classic-dark');
  const [tempCustomBg, setTempCustomBg] = useState(notepadStyle?.customBg || '#1e1e2e');
  const [tempCustomText, setTempCustomText] = useState(notepadStyle?.customText || '#ffffff');

  // HTML5 and JS ES2025 States
  const [showJsConsole, setShowJsConsole] = useState(false);
  const [jsConsoleLogs, setJsConsoleLogs] = useState<{ type: string; text: string; timestamp: string }[]>([]);
  const [htmlErrors, setHtmlErrors] = useState<{ line: number; type: string; message: string }[]>([]);
  const [jsSyntaxErrors, setJsSyntaxErrors] = useState<{ line: number; message: string }[]>([]);
  const [showHtmlValidation, setShowHtmlValidation] = useState(false);

  const NOTEPAD_THEMES = [
    { id: 'classic-dark', name: 'Classic Dark', bg: 'bg-transparent', text: 'text-white', selection: 'selection:bg-blue-500/30', gutter: 'text-white/30 border-white/5 bg-white/[0.01]', previewBg: '#111827', desc: 'Elegant dark with transparent background' },
    { id: 'classic-light', name: 'Classic Light', bg: 'bg-white', text: 'text-slate-900', selection: 'selection:bg-blue-200', gutter: 'text-slate-400 border-slate-200 bg-slate-50', previewBg: '#ffffff', desc: 'Clean bright light theme' },
    { id: 'terminal', name: 'Retro Terminal', bg: 'bg-black', text: 'text-green-400', selection: 'selection:bg-green-900/50', gutter: 'text-green-700/60 border-green-950 bg-black/40', previewBg: '#000000', desc: 'Vintage hacker green-on-black' },
    { id: 'sepia', name: 'Warm Sepia', bg: 'bg-[#fcf7ec]', text: 'text-[#4d3a24]', selection: 'selection:bg-[#ebd8b7]', gutter: 'text-[#8c7456]/60 border-[#e2d5b8] bg-[#f5efe0]', previewBg: '#fcf7ec', desc: 'Easy on the eyes reading sepia' },
    { id: 'cyberpunk', name: 'Midnight Purple', bg: 'bg-[#0f051d]', text: 'text-[#ff007f]', selection: 'selection:bg-[#00ffff]/30', gutter: 'text-[#ff007f]/40 border-[#ff007f]/10 bg-[#070110]', previewBg: '#0f051d', desc: 'Vibrant neon purple and hot pink' },
    { id: 'solarized-dark', name: 'Solarized Dark', bg: 'bg-[#002b36]', text: 'text-[#93a1a1]', selection: 'selection:bg-[#073642]', gutter: 'text-[#586e75] border-[#073642] bg-[#00212b]', previewBg: '#002b36', desc: 'Low-contrast solarized dark' },
    { id: 'solarized-light', name: 'Solarized Light', bg: 'bg-[#fdf6e3]', text: 'text-[#586e75]', selection: 'selection:bg-[#eee8d5]', gutter: 'text-[#93a1a1] border-[#eee8d5] bg-[#f4ebd0]', previewBg: '#fdf6e3', desc: 'Low-contrast solarized light' },
    { id: 'dracula', name: 'Dracula', bg: 'bg-[#282a36]', text: 'text-[#f8f8f2]', selection: 'selection:bg-[#44475a]', gutter: 'text-[#6272a4] border-[#44475a] bg-[#21222c]', previewBg: '#282a36', desc: 'Classic developer Dracula theme' },
    { id: 'nord', name: 'Nordic Frost', bg: 'bg-[#2e3440]', text: 'text-[#d8dee9]', selection: 'selection:bg-[#434c5e]', gutter: 'text-[#4c566a] border-[#3b4252] bg-[#242933]', previewBg: '#2e3440', desc: 'Clean arctic dark-blue theme' },
    { id: 'forest', name: 'Forest Moss', bg: 'bg-[#1e2a22]', text: 'text-[#d4ebd4]', selection: 'selection:bg-[#2d4c2d]', gutter: 'text-[#486348] border-[#25372a] bg-[#141e18]', previewBg: '#1e2a22', desc: 'Calming organic forest green' },
    { id: 'oceanic', name: 'Ocean Abyss', bg: 'bg-[#0b132b]', text: 'text-[#48cae4]', selection: 'selection:bg-[#1c2541]', gutter: 'text-[#3a506b] border-[#1c2541] bg-[#050914]', previewBg: '#0b132b', desc: 'Deep sea navy and bright cyan' },
    { id: 'sunset', name: 'Sunset Amber', bg: 'bg-[#211107]', text: 'text-[#f59e0b]', selection: 'selection:bg-[#451a03]', gutter: 'text-[#78350f] border-[#451a03] bg-[#140a04]', previewBg: '#211107', desc: 'Warm glowing amber and deep crimson' },
    { id: 'sakura', name: 'Sakura Blossom', bg: 'bg-[#fff5f5]', text: 'text-[#d53f8c]', selection: 'selection:bg-[#fed7d7]', gutter: 'text-[#feb2b2] border-[#fed7d7] bg-[#fffafb]', previewBg: '#fff5f5', desc: 'Soft pastel cherry blossom' },
    { id: 'custom', name: 'Custom Theme', bg: '', text: '', selection: 'selection:bg-blue-500/30', gutter: 'border-white/10 bg-white/[0.02]', previewBg: '', isCustom: true, desc: 'Your personalized background & text color' }
  ];

  useEffect(() => {
    if (showFontDialog) {
      setTempFontFamily(notepadStyle?.fontFamily || 'monospace');
      setTempFontSize(notepadStyle?.fontSize || '14px');
      setTempFontWeight(notepadStyle?.fontWeight || 'normal');
      setTempColor(notepadStyle?.color || '');
      setTempFontStyle(notepadStyle?.fontStyle || 'normal');
      setTempTextDecoration(notepadStyle?.textDecoration || 'none');
      setTempTextTransform(notepadStyle?.textTransform || 'none');
      setTempTextAlign(notepadStyle?.textAlign || 'left');
    }
  }, [showFontDialog, notepadStyle]);

  useEffect(() => {
    if (showThemeDialog) {
      setTempTheme(notepadStyle?.theme || 'classic-dark');
      setTempCustomBg(notepadStyle?.customBg || '#1e1e2e');
      setTempCustomText(notepadStyle?.customText || '#ffffff');
    }
  }, [showThemeDialog, notepadStyle]);

  const gutterRef = useRef<HTMLDivElement>(null);
  const previewGutterRef = useRef<HTMLDivElement>(null);

  const getThemeClasses = () => {
    const currentTheme = notepadStyle?.theme || 'classic-dark';
    const found = NOTEPAD_THEMES.find(t => t.id === currentTheme);
    if (found && !found.isCustom) {
      return `${found.bg} ${found.text} ${found.selection}`;
    }
    if (currentTheme === 'custom') {
      return 'selection:bg-blue-500/30';
    }
    return 'bg-transparent text-white selection:bg-blue-500/30';
  };

  const getGutterClasses = () => {
    const currentTheme = notepadStyle?.theme || 'classic-dark';
    const found = NOTEPAD_THEMES.find(t => t.id === currentTheme);
    if (found) {
      return found.gutter;
    }
    return 'text-white/30 border-white/5 bg-white/[0.01]';
  };

  const handleNormalScroll = (e: React.UIEvent<HTMLTextAreaElement>) => {
    if (gutterRef.current) {
      gutterRef.current.scrollTop = e.currentTarget.scrollTop;
    }
  };

  const handlePreviewScroll = (e: React.UIEvent<HTMLTextAreaElement>) => {
    if (previewGutterRef.current) {
      previewGutterRef.current.scrollTop = e.currentTarget.scrollTop;
    }
  };

  const handleGutterWheel = (e: React.WheelEvent<HTMLDivElement>) => {
    if (textareaRef.current) {
      textareaRef.current.scrollTop += e.deltaY;
    }
  };

  const handleGoToLineSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const lineNum = parseInt(goToLineInput, 10);
    if (isNaN(lineNum) || lineNum < 1) {
      addNotification('Notepad', 'Please enter a valid line number', 'warning');
      return;
    }

    const lines = notepadContent.split('\n');
    if (lineNum > lines.length) {
      addNotification('Notepad', `The file only has ${lines.length} lines`, 'warning');
      return;
    }

    let charIndex = 0;
    for (let i = 0; i < lineNum - 1; i++) {
      charIndex += lines[i].length + 1;
    }

    const textarea = textareaRef.current;
    if (textarea) {
      textarea.focus();
      textarea.setSelectionRange(charIndex, charIndex);
      const approxLineHeight = textarea.scrollHeight / Math.max(1, lines.length);
      textarea.scrollTop = Math.max(0, (lineNum - 5) * approxLineHeight);
    }

    setShowGoToLine(false);
    setGoToLineInput('');
    addNotification('Notepad', `Navigated to line ${lineNum}`, 'success');
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if ((e.ctrlKey || e.metaKey) && e.key === 'g') {
      e.preventDefault();
      setShowGoToLine(true);
    }
  };

  const handleUpdateStyle = (key: string, value: any) => {
    if (setNotepadStyle) {
      setNotepadStyle((prev: any) => ({
        ...(prev || { fontSize: '14px', fontWeight: 'normal', textAlign: 'left' }),
        [key]: value
      }));
    }
  };

  const handleZoom = (direction: 'in' | 'out' | 'reset') => {
    const currentSize = notepadStyle?.fontSize || '14px';
    const numSize = parseInt(currentSize, 10) || 14;
    let newSize = numSize;
    if (direction === 'in') {
      newSize = Math.min(72, numSize + 2);
    } else if (direction === 'out') {
      newSize = Math.max(8, numSize - 2);
    } else {
      newSize = 14;
    }
    handleUpdateStyle('fontSize', `${newSize}px`);
  };

  const handleSelectAll = () => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.focus();
      textarea.select();
      addNotification('Notepad', 'Selected all text', 'info');
    }
    setActiveMenu(null);
  };

  const jumpToLine = (lineNum: number) => {
    const textarea = textareaRef.current;
    if (!textarea) return;
    textarea.focus();
    
    const lines = notepadContent.split('\n');
    let charIndex = 0;
    for (let i = 0; i < Math.min(lineNum - 1, lines.length); i++) {
      charIndex += lines[i].length + 1; // +1 for newline character
    }
    
    textarea.setSelectionRange(charIndex, charIndex + (lines[lineNum - 1]?.length || 0));
    addNotification('Notepad', `Selected Line ${lineNum}`, 'info');
  };

  const runJavaScriptCode = () => {
    setJsConsoleLogs([]);
    setShowJsConsole(true);
    
    const logs: { type: string; text: string; timestamp: string }[] = [];
    const addLog = (type: string, ...args: any[]) => {
      const text = args.map(arg => {
        if (typeof arg === 'object' && arg !== null) {
          try {
            return JSON.stringify(arg, null, 2);
          } catch (e) {
            return String(arg);
          }
        }
        return String(arg);
      }).join(' ');
      
      logs.push({
        type,
        text,
        timestamp: new Date().toLocaleTimeString()
      });
    };

    const customConsole = {
      log: (...args: any[]) => addLog('log', ...args),
      error: (...args: any[]) => addLog('error', ...args),
      warn: (...args: any[]) => addLog('warn', ...args),
      info: (...args: any[]) => addLog('info', ...args),
    };

    const promiseTryPolyfill = function(fn: Function, ...args: any[]) {
      return new Promise((resolve, reject) => {
        try {
          resolve(fn(...args));
        } catch (err) {
          reject(err);
        }
      });
    };

    const arrayGroupByPolyfill = function(items: any[], callbackfn: Function) {
      const obj = Object.create(null);
      let i = 0;
      for (const item of items) {
        const key = callbackfn(item, i++);
        if (obj[key] === undefined) {
          obj[key] = [item];
        } else {
          obj[key].push(item);
        }
      }
      return obj;
    };

    const setIntersectionPolyfill = function(this: Set<any>, other: Set<any>) {
      const result = new Set();
      for (const item of this) {
        if (other.has(item)) result.add(item);
      }
      return result;
    };
    const setUnionPolyfill = function(this: Set<any>, other: Set<any>) {
      const result = new Set(this);
      for (const item of other) result.add(item);
      return result;
    };
    const setDifferencePolyfill = function(this: Set<any>, other: Set<any>) {
      const result = new Set();
      for (const item of this) {
        if (!other.has(item)) result.add(item);
      }
      return result;
    };
    const setSymmetricDifferencePolyfill = function(this: Set<any>, other: Set<any>) {
      const result = new Set();
      for (const item of this) {
        if (!other.has(item)) result.add(item);
      }
      for (const item of other) {
        if (!this.has(item)) result.add(item);
      }
      return result;
    };

    addLog('info', 'Initializing JavaScript (ES2025 Engine)...');

    try {
      const runContext = {
        console: customConsole,
        Promise: {
          ...Promise,
          try: (Promise as any).try || promiseTryPolyfill
        },
        Object: {
          ...Object,
          groupBy: (Object as any).groupBy || arrayGroupByPolyfill
        }
      };

      const oldIntersection = (Set.prototype as any).intersection;
      const oldUnion = (Set.prototype as any).union;
      const oldDifference = (Set.prototype as any).difference;
      const oldSymmetricDifference = (Set.prototype as any).symmetricDifference;

      if (!(Set.prototype as any).intersection) (Set.prototype as any).intersection = setIntersectionPolyfill;
      if (!(Set.prototype as any).union) (Set.prototype as any).union = setUnionPolyfill;
      if (!(Set.prototype as any).difference) (Set.prototype as any).difference = setDifferencePolyfill;
      if (!(Set.prototype as any).symmetricDifference) (Set.prototype as any).symmetricDifference = setSymmetricDifferencePolyfill;

      const wrappedCode = `
        with (sandbox) {
          ${notepadContent}
        }
      `;
      
      const fn = new Function('sandbox', wrappedCode);
      const result = fn(runContext);

      if (result !== undefined) {
        addLog('return', `Execution returned: ${typeof result === 'object' ? JSON.stringify(result) : result}`);
      }

      if (!oldIntersection) delete (Set.prototype as any).intersection;
      if (!oldUnion) delete (Set.prototype as any).union;
      if (!oldDifference) delete (Set.prototype as any).difference;
      if (!oldSymmetricDifference) delete (Set.prototype as any).symmetricDifference;

      addLog('info', 'Execution finished successfully.');
      setJsSyntaxErrors([]);
      addNotification('Notepad', 'JavaScript execution completed successfully', 'success');
    } catch (err: any) {
      addLog('error', err.stack || err.message || String(err));
      
      let lineNum = 1;
      const match = err.stack?.match(/<anonymous>:(\d+):(\d+)/) || err.message.match(/line\s+(\d+)/i) || err.stack?.match(/at\s+eval\s+.*:(\d+):(\d+)/);
      if (match) {
        lineNum = parseInt(match[1]);
      }
      setJsSyntaxErrors([{ line: lineNum, message: err.message }]);
      addNotification('Notepad', `Execution Error: ${err.message}`, 'error');
    }

    setJsConsoleLogs(logs);
  };

  const validateHtml = (code: string) => {
    const errors: any[] = [];
    if (!code.trim().startsWith('<!DOCTYPE html>') && !code.trim().startsWith('<!doctype html>')) {
      errors.push({ line: 1, type: 'warning', message: 'Missing HTML5 doctype. Start document with <!DOCTYPE html>.' });
    }
    
    const lines = code.split('\n');
    const stack: { tag: string, line: number }[] = [];
    const selfClosingTags = ['img', 'br', 'hr', 'meta', 'link', 'input', 'source', 'embed', 'col', 'area', 'param', 'wbr', '!doctype'];
    
    lines.forEach((lineText, index) => {
      const lineNum = index + 1;
      const tagRegex = /<\/?([a-zA-Z0-9:-]+)(?:\s+[^>]*)*>/g;
      let match;
      while ((match = tagRegex.exec(lineText)) !== null) {
        const fullTag = match[0];
        const tagName = match[1].toLowerCase();
        
        if (fullTag.startsWith('</')) {
          if (stack.length === 0) {
            errors.push({ line: lineNum, type: 'error', message: `Unexpected closing tag </${tagName}> with no opening tag.` });
          } else {
            const last = stack.pop();
            if (last && last.tag !== tagName) {
              errors.push({ line: lineNum, type: 'error', message: `Mismatched closing tag </${tagName}>. Expected </${last.tag}> (opened on Line ${last.line}).` });
            }
          }
        } else if (!fullTag.endsWith('/>')) {
          if (!selfClosingTags.includes(tagName)) {
            stack.push({ tag: tagName, line: lineNum });
          }
        }
      }
    });
    
    while (stack.length > 0) {
      const remaining = stack.pop();
      if (remaining) {
        errors.push({ line: remaining.line, type: 'error', message: `Unclosed HTML tag <${remaining.tag}>.` });
      }
    }
    
    return errors;
  };

  const validateHtmlSyntax = () => {
    const errors = validateHtml(notepadContent);
    setHtmlErrors(errors);
    setShowHtmlValidation(true);
    if (errors.length === 0) {
      addNotification('Notepad', 'HTML5 Validation: Clean! All tags balanced and Doctype present.', 'success');
    } else {
      const errorCount = errors.filter(e => e.type === 'error').length;
      const warningCount = errors.filter(e => e.type === 'warning').length;
      addNotification('Notepad', `HTML5 Validation: Found ${errorCount} errors and ${warningCount} warnings.`, 'warning');
    }
  };

  const validateJsSyntax = () => {
    const errors: any[] = [];
    try {
      new Function(notepadContent);
      addNotification('Notepad', 'JavaScript (ES2025): Syntax is valid!', 'success');
      setJsSyntaxErrors([]);
    } catch (err: any) {
      let lineNum = 1;
      const match = err.stack?.match(/<anonymous>:(\d+):(\d+)/) || err.message.match(/line\s+(\d+)/i) || err.stack?.match(/at\s+eval\s+.*:(\d+):(\d+)/);
      if (match) {
        lineNum = parseInt(match[1]);
      }
      errors.push({ line: lineNum, message: err.message });
      setJsSyntaxErrors(errors);
      addNotification('Notepad', `JavaScript Syntax Error: ${err.message} (Line ${lineNum})`, 'error');
    }
  };

  const formatHtmlDocument = () => {
    let formatted = '';
    let indent = 0;
    const lines = notepadContent
      .replace(/>\s*</g, '>\n<')
      .split('\n')
      .map(line => line.trim())
      .filter(line => line.length > 0);
      
    const selfClosingTags = ['img', 'br', 'hr', 'meta', 'link', 'input', 'source', 'embed', 'col', 'area', 'param', 'wbr', '!doctype'];

    lines.forEach(line => {
      if (line.startsWith('</')) {
        indent = Math.max(0, indent - 1);
      }
      
      formatted += '  '.repeat(indent) + line + '\n';
      
      if (line.startsWith('<') && !line.startsWith('</') && !line.endsWith('/>')) {
        const tagName = line.match(/^<([a-zA-Z0-9:-]+)/)?.[1]?.toLowerCase();
        if (tagName && !selfClosingTags.includes(tagName)) {
          indent += 1;
        }
      }
    });
    
    setNotepadContent(formatted.trim());
    addNotification('Notepad', 'HTML5 Document formatted cleanly!', 'success');
  };

  const openInBrowserApp = () => {
    if (!activeFileInNotepad) {
      addNotification('Notepad', 'Please save your HTML file first to open it in Browser.', 'info');
      setShowSaveDialog(true);
      return;
    }
    
    if (!activeFileInNotepad.name.endsWith('.html')) {
      addNotification('Notepad', 'Active file must be an .html file to run in browser.', 'warning');
      return;
    }

    try {
      const webpagePath = `/GlassDrive/webpages/${activeFileInNotepad.name}`;
      fsLib.write(webpagePath, notepadContent);
      BridgeLib.setAppData('browser', `local://${activeFileInNotepad.name}`);
      openWindow('browser', 'Browser');
      addNotification('Notepad', `Running ${activeFileInNotepad.name} in simulated Browser!`, 'success');
    } catch (e) {
      addNotification('Notepad', 'Failed to bridge with BrowserApp', 'error');
    }
  };

  const insertHtmlBoilerplate = () => {
    const template = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>HTML5 ES2025 Demo</title>
  <style>
    body {
      font-family: 'Inter', system-ui, sans-serif;
      background: #0f172a;
      color: #f1f5f9;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      min-height: 100vh;
      margin: 0;
      padding: 24px;
    }
    .card {
      background: #1e293b;
      border: 1px solid #334155;
      border-radius: 16px;
      padding: 32px;
      max-width: 480px;
      width: 100%;
      box-shadow: 0 10px 25px -5px rgba(0,0,0,0.3);
      text-align: center;
    }
    h1 {
      color: #38bdf8;
      font-size: 24px;
      margin-top: 0;
      font-weight: 700;
    }
    p {
      color: #94a3b8;
      font-size: 14px;
      line-height: 1.6;
    }
    .btn {
      background: #38bdf8;
      color: #0f172a;
      border: none;
      padding: 10px 20px;
      border-radius: 8px;
      font-weight: 700;
      cursor: pointer;
      transition: all 0.2s;
    }
    .btn:hover {
      transform: translateY(-1px);
      box-shadow: 0 4px 12px rgba(56,189,248,0.3);
    }
    .output-box {
      margin-top: 20px;
      padding: 12px;
      background: #0f172a;
      border: 1px solid #334155;
      border-radius: 8px;
      font-family: monospace;
      color: #38bdf8;
      font-size: 11px;
      text-align: left;
      white-space: pre-wrap;
      min-height: 50px;
    }
  </style>
</head>
<body>
  <div class="card">
    <h1>HTML5 & JS ES2025 Standard</h1>
    <p>This is a modern HTML5 document built on semantic elements. Press the button below to execute standard ES2025 JavaScript features (Promise.try and Set intersection)!</p>
    <button class="btn" id="run-btn">Execute ES2025 Demo</button>
    <div id="output" class="output-box">Output logs will appear here...</div>
  </div>

  <script>
    document.getElementById('run-btn').addEventListener('click', async () => {
      const output = document.getElementById('output');
      output.innerText = "Initializing execution...\\n";
      
      try {
        // 1. ES2025 Promise.try demo
        output.innerText += "1. Executing Promise.try...\\n";
        const val = await Promise.try(() => {
          return "ES2025 is fully active!";
        });
        output.innerText += "Result: " + val + "\\n\\n";
        
        // 2. ES2025 Set intersection demo
        output.innerText += "2. Computing Set intersection...\\n";
        const setA = new Set(["HTML5", "CSS3", "ES2025", "Vite"]);
        const setB = new Set(["React", "ES2025", "Tailwind", "HTML5"]);
        
        const intersection = typeof Set.prototype.intersection === 'function' 
          ? setA.intersection(setB) 
          : new Set([...setA].filter(x => setB.has(x)));
          
        output.innerText += "Set A: " + JSON.stringify(Array.from(setA)) + "\\n";
        output.innerText += "Set B: " + JSON.stringify(Array.from(setB)) + "\\n";
        output.innerText += "Common Tech (Intersection): " + JSON.stringify(Array.from(intersection)) + "\\n";
      } catch (err) {
        output.innerText += "Error: " + err.message;
      }
    });
  </script>
</body>
</html>`;
    setNotepadContent(template);
    addNotification('Notepad', 'Inserted HTML5 boilerplate template!', 'success');
  };

  const insertJsSnippet = () => {
    const template = `// JavaScript ES2025 Feature Demonstration
console.log("=== JS ES2025 ENGINE ACTIVE ===");

// 1. Promise.try (Execute code blocks inside safe Promise contexts)
console.log("\\n1. Executing Promise.try()...");
Promise.try(() => {
  console.log("Synchronous/Asynchronous block executed cleanly!");
  return "ES2025 Promise.try works perfectly!";
}).then(val => {
  console.log("Resolved Promise.try value:", val);
}).catch(err => {
  console.error("Promise.try caught error:", err);
});

// 2. Set prototype methods (intersection, union, difference)
console.log("\\n2. Checking Set helper methods...");
const teamFrontend = new Set(["Alice", "Bob", "Charlie"]);
const teamMobile = new Set(["Bob", "David", "Charlie", "Emma"]);

// Set.prototype.intersection()
const fullstack = teamFrontend.intersection(teamMobile);
console.log("Fullstack Devs (Intersection):", Array.from(fullstack));

// Set.prototype.union()
const allStaff = teamFrontend.union(teamMobile);
console.log("All Staff (Union):", Array.from(allStaff));

// Set.prototype.difference()
const exclusiveFrontend = teamFrontend.difference(teamMobile);
console.log("Frontend-Only (Difference):", Array.from(exclusiveFrontend));

// 3. Object.groupBy
console.log("\\n3. Testing Object.groupBy...");
const animals = [
  { name: "Dog", class: "Mammal" },
  { name: "Eagle", class: "Bird" },
  { name: "Cat", class: "Mammal" },
  { name: "Hawk", class: "Bird" }
];
const grouped = Object.groupBy(animals, animal => animal.class);
console.log("Grouped Animals:", grouped);`;
    setNotepadContent(template);
    addNotification('Notepad', 'Inserted JavaScript ES2025 demo template!', 'success');
  };

  const handleTransformCase = (type: 'upper' | 'lower' | 'title') => {
    const textarea = textareaRef.current;
    if (!textarea) return;
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    
    if (start === end) {
      let newContent = notepadContent;
      if (type === 'upper') newContent = notepadContent.toUpperCase();
      else if (type === 'lower') newContent = notepadContent.toLowerCase();
      else if (type === 'title') {
        newContent = notepadContent.replace(/\b\w/g, (c: string) => c.toUpperCase());
      }
      setNotepadContent(newContent);
      addNotification('Notepad', 'Transformed entire text case', 'info');
    } else {
      const selection = notepadContent.substring(start, end);
      let transformed = selection;
      if (type === 'upper') transformed = selection.toUpperCase();
      else if (type === 'lower') transformed = selection.toLowerCase();
      else if (type === 'title') {
        transformed = selection.replace(/\b\w/g, (c: string) => c.toUpperCase());
      }
      const newContent = notepadContent.substring(0, start) + transformed + notepadContent.substring(end);
      setNotepadContent(newContent);
      setTimeout(() => {
        textarea.focus();
        textarea.setSelectionRange(start, start + transformed.length);
      }, 0);
      addNotification('Notepad', 'Transformed selection case', 'info');
    }
    setActiveMenu(null);
  };

  const handleTrimWhitespace = () => {
    const trimmed = notepadContent.split('\n').map((line: string) => line.trimEnd()).join('\n').trim();
    setNotepadContent(trimmed);
    addNotification('Notepad', 'Trimmed trailing whitespace', 'success');
    setActiveMenu(null);
  };

  const handleRemoveEmptyLines = () => {
    const cleaned = notepadContent.split('\n').filter((line: string) => line.trim() !== '').join('\n');
    setNotepadContent(cleaned);
    addNotification('Notepad', 'Removed empty lines', 'success');
    setActiveMenu(null);
  };

  const handleFindNext = () => {
    if (!findText) return;
    const content = notepadContent;
    const searchStr = matchCase ? findText : findText.toLowerCase();
    const sourceStr = matchCase ? content : content.toLowerCase();
    
    let index = sourceStr.indexOf(searchStr, searchIndex + 1);
    if (index === -1) {
      index = sourceStr.indexOf(searchStr, 0);
    }
    
    if (index !== -1) {
      setSearchIndex(index);
      const textarea = textareaRef.current;
      if (textarea) {
        textarea.focus();
        textarea.setSelectionRange(index, index + findText.length);
        const row = content.substring(0, index).split('\n').length;
        textarea.scrollTop = (row - 5) * 20;
      }
    } else {
      addNotification('Notepad', 'Text not found', 'warning');
    }
  };

  const handleFindPrev = () => {
    if (!findText) return;
    const content = notepadContent;
    const searchStr = matchCase ? findText : findText.toLowerCase();
    const sourceStr = matchCase ? content : content.toLowerCase();
    
    let index = -1;
    const subStr = sourceStr.substring(0, searchIndex > 0 ? searchIndex : sourceStr.length);
    index = subStr.lastIndexOf(searchStr);
    
    if (index === -1 && searchIndex !== -1) {
      index = sourceStr.lastIndexOf(searchStr);
    }
    
    if (index !== -1) {
      setSearchIndex(index);
      const textarea = textareaRef.current;
      if (textarea) {
        textarea.focus();
        textarea.setSelectionRange(index, index + findText.length);
        const row = content.substring(0, index).split('\n').length;
        textarea.scrollTop = (row - 5) * 20;
      }
    } else {
      addNotification('Notepad', 'Text not found', 'warning');
    }
  };

  const handleReplace = () => {
    if (!findText) return;
    const textarea = textareaRef.current;
    if (!textarea) return;
    
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = notepadContent.substring(start, end);
    const searchStr = matchCase ? findText : findText.toLowerCase();
    const compareText = matchCase ? selectedText : selectedText.toLowerCase();
    
    if (compareText === searchStr && start !== end) {
      const newContent = notepadContent.substring(0, start) + replaceText + notepadContent.substring(end);
      setNotepadContent(newContent);
      setTimeout(() => {
        textarea.focus();
        textarea.setSelectionRange(start, start + replaceText.length);
      }, 0);
      addNotification('Notepad', 'Replaced text', 'success');
    } else {
      handleFindNext();
    }
  };

  const handleReplaceAll = () => {
    if (!findText) return;
    const searchStr = findText;
    const flags = matchCase ? 'g' : 'gi';
    const escaped = searchStr.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const regex = new RegExp(escaped, flags);
    const count = (notepadContent.match(regex) || []).length;
    
    if (count > 0) {
      const newContent = notepadContent.replace(regex, replaceText);
      setNotepadContent(newContent);
      addNotification('Notepad', `Replaced ${count} occurrences`, 'success');
    } else {
      addNotification('Notepad', 'No matches found to replace', 'warning');
    }
  };

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
    
    // Simulate printing process for local log
    setTimeout(() => {
      setPrintQueue((prev: PrintJob[]) => 
        prev.map(job => job.id === newJob.id ? { ...job, status: 'completed' } : job)
      );
      addNotification('Print Manager', `Finished printing "${filename}"`, 'success');
    }, 5000);

    const escapeHtml = (text: string) => {
      return text
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
    };

    const charCount = notepadContent.length;
    const wordCount = notepadContent.trim() === '' ? 0 : notepadContent.trim().split(/\s+/).length;
    const lineCount = notepadContent.split('\n').length;

    // Create a hidden printing iframe
    const printFrame = document.createElement('iframe');
    printFrame.style.position = 'fixed';
    printFrame.style.right = '0';
    printFrame.style.bottom = '0';
    printFrame.style.width = '0';
    printFrame.style.height = '0';
    printFrame.style.border = '0';
    document.body.appendChild(printFrame);

    const doc = printFrame.contentWindow?.document;
    if (doc) {
      const currentTimestamp = new Date().toLocaleString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
      });

      const fontValue = getFontFamilyValue(notepadStyle?.fontFamily);

      doc.write(`
        <!DOCTYPE html>
        <html>
        <head>
          <title>Print - ${filename}</title>
          <style>
            @page {
              size: auto;
              margin: 20mm 15mm 20mm 15mm;
            }
            body {
              font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
              color: #1a202c;
              margin: 0;
              padding: 0;
              line-height: 1.6;
              font-size: 11pt;
            }
            .print-header {
              border-bottom: 2px solid #2d3748;
              padding-bottom: 12px;
              margin-bottom: 24px;
              display: flex;
              justify-content: space-between;
              align-items: flex-end;
            }
            .doc-info {
              flex: 1;
            }
            .doc-title {
              font-size: 18pt;
              font-weight: 700;
              color: #1a202c;
              margin: 0 0 4px 0;
              word-break: break-all;
            }
            .doc-meta {
              font-size: 9pt;
              color: #718096;
              margin: 0;
              display: flex;
              gap: 16px;
            }
            .print-meta {
              text-align: right;
              font-size: 9pt;
              color: #4a5568;
              min-width: 180px;
            }
            .print-time {
              font-weight: 500;
              color: #2d3748;
            }
            .print-system {
              font-size: 8pt;
              color: #a0aec0;
              margin-top: 2px;
            }
            .print-content {
              white-space: pre-wrap;
              word-wrap: break-word;
              font-family: ${fontValue};
              font-size: 10.5pt;
              color: #2d3748;
              tab-size: 4;
            }
            @media print {
              body {
                background: transparent;
                color: #000;
              }
              .print-header {
                border-bottom-color: #000;
              }
              .doc-title {
                color: #000;
              }
            }
          </style>
        </head>
        <body>
          <div class="print-header">
            <div class="doc-info">
              <h1 class="doc-title">${escapeHtml(filename)}</h1>
              <p class="doc-meta">
                <span><strong>Lines:</strong> ${lineCount}</span>
                <span><strong>Words:</strong> ${wordCount}</span>
                <span><strong>Characters:</strong> ${charCount}</span>
              </p>
            </div>
            <div class="print-meta">
              <div class="print-time">${escapeHtml(currentTimestamp)}</div>
              <div class="print-system">Printed from Notepad Desktop</div>
            </div>
          </div>
          <div class="print-content">${escapeHtml(notepadContent)}</div>
        </body>
        </html>
      `);
      doc.close();

      setTimeout(() => {
        try {
          printFrame.contentWindow?.focus();
          printFrame.contentWindow?.print();
        } catch (err) {
          console.error("Print failed:", err);
        } finally {
          setTimeout(() => {
            if (document.body.contains(printFrame)) {
              document.body.removeChild(printFrame);
            }
          }, 1000);
        }
      }, 500);
    }
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
      <div className="h-8 bg-white/5 border-b border-white/10 flex items-center px-2 gap-1 text-[11px] select-none">
        {/* File Menu */}
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
                <MenuButton icon={<FolderOpen size={14} />} label="Open File..." onClick={() => { setShowOpenDialog(true); setActiveMenu(null); }} />
                <MenuButton icon={<Save size={14} />} label="Save" onClick={() => { handleSave(); setActiveMenu(null); }} />
                <MenuButton icon={<Save size={14} />} label="Save As..." onClick={() => { setShowSaveDialog(true); setActiveMenu(null); }} />
                <div className="h-px bg-white/10 my-1 mx-2" />
                <MenuButton icon={<Printer size={14} />} label="Print File" onClick={() => { handlePrint(); setActiveMenu(null); }} />
                <div className="relative group/sub">
                  <button className="w-full px-4 py-1.5 flex items-center justify-between hover:bg-blue-500/20 text-white/70 hover:text-white transition-all text-left">
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
                <MenuButton icon={<LogOut size={14} />} label="Quit" onClick={() => { closeWindow('notepad'); setActiveMenu(null); }} variant="danger" />
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Edit Menu */}
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
                <MenuButton icon={<Scissors size={14} />} label="Cut" onClick={() => { handleEdit('cut'); setActiveMenu(null); }} />
                <MenuButton icon={<Copy size={14} />} label="Copy" onClick={() => { handleEdit('copy'); setActiveMenu(null); }} />
                <MenuButton icon={<Clipboard size={14} />} label="Paste" onClick={() => { handleEdit('paste'); setActiveMenu(null); }} />
                <div className="h-px bg-white/10 my-1 mx-2" />
                <MenuButton icon={<Search size={14} />} label="Find & Replace..." onClick={() => { setShowFindReplace(true); setActiveMenu(null); }} />
                <MenuButton label="Select All" onClick={handleSelectAll} />
                <MenuButton icon={<Hash size={14} />} label="Go to Line..." onClick={() => { setShowGoToLine(true); setActiveMenu(null); }} />
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Format Menu */}
        <div className="relative">
          <button 
            onClick={(e) => { e.stopPropagation(); setActiveMenu(activeMenu === 'format' ? null : 'format'); }}
            className={cn("px-3 py-1 rounded hover:bg-white/10 transition-colors", activeMenu === 'format' && "bg-white/10")}
          >
            Format
          </button>
          <AnimatePresence>
            {activeMenu === 'format' && (
              <motion.div 
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 5 }}
                className="absolute top-full left-0 w-48 glass-dark border border-white/20 rounded-xl shadow-2xl z-50 py-2 mt-1"
              >
                <MenuButton 
                  icon={<Type size={14} />} 
                  label="Font & Formatting..." 
                  onClick={() => { setShowFontDialog(true); setActiveMenu(null); }} 
                />

                {/* Font Size sub-menu */}
                <div className="relative group/sub">
                  <button className="w-full px-4 py-1.5 flex items-center justify-between hover:bg-blue-500/20 text-white/70 hover:text-white transition-all text-left">
                    <div className="flex items-center gap-3">
                      <Baseline size={14} />
                      <span>Font Size</span>
                    </div>
                    <ChevronRight size={12} />
                  </button>
                  <div className="absolute top-0 left-full ml-1 w-40 glass-dark border border-white/20 rounded-xl shadow-2xl hidden group-hover/sub:block py-2">
                    <MenuButton 
                      icon={(notepadStyle?.fontSize === '12px') ? <Check size={12} /> : <div className="w-3" />} 
                      label="Small (12px)" 
                      onClick={() => { handleUpdateStyle('fontSize', '12px'); setActiveMenu(null); }} 
                    />
                    <MenuButton 
                      icon={(!notepadStyle?.fontSize || notepadStyle?.fontSize === '14px') ? <Check size={12} /> : <div className="w-3" />} 
                      label="Medium (14px)" 
                      onClick={() => { handleUpdateStyle('fontSize', '14px'); setActiveMenu(null); }} 
                    />
                    <MenuButton 
                      icon={(notepadStyle?.fontSize === '18px') ? <Check size={12} /> : <div className="w-3" />} 
                      label="Large (18px)" 
                      onClick={() => { handleUpdateStyle('fontSize', '18px'); setActiveMenu(null); }} 
                    />
                    <MenuButton 
                      icon={(notepadStyle?.fontSize === '24px') ? <Check size={12} /> : <div className="w-3" />} 
                      label="X-Large (24px)" 
                      onClick={() => { handleUpdateStyle('fontSize', '24px'); setActiveMenu(null); }} 
                    />
                  </div>
                </div>

                {/* Font Weight sub-menu */}
                <div className="relative group/sub">
                  <button className="w-full px-4 py-1.5 flex items-center justify-between hover:bg-blue-500/20 text-white/70 hover:text-white transition-all text-left">
                    <div className="flex items-center gap-3">
                      <Bold size={14} />
                      <span>Font Weight</span>
                    </div>
                    <ChevronRight size={12} />
                  </button>
                  <div className="absolute top-0 left-full ml-1 w-40 glass-dark border border-white/20 rounded-xl shadow-2xl hidden group-hover/sub:block py-2">
                    <MenuButton 
                      icon={(!notepadStyle?.fontWeight || notepadStyle?.fontWeight === 'normal') ? <Check size={12} /> : <div className="w-3" />} 
                      label="Normal" 
                      onClick={() => { handleUpdateStyle('fontWeight', 'normal'); setActiveMenu(null); }} 
                    />
                    <MenuButton 
                      icon={(notepadStyle?.fontWeight === 'medium') ? <Check size={12} /> : <div className="w-3" />} 
                      label="Medium" 
                      onClick={() => { handleUpdateStyle('fontWeight', 'medium'); setActiveMenu(null); }} 
                    />
                    <MenuButton 
                      icon={(notepadStyle?.fontWeight === 'bold') ? <Check size={12} /> : <div className="w-3" />} 
                      label="Bold" 
                      onClick={() => { handleUpdateStyle('fontWeight', 'bold'); setActiveMenu(null); }} 
                    />
                  </div>
                </div>

                {/* Text Align sub-menu */}
                <div className="relative group/sub">
                  <button className="w-full px-4 py-1.5 flex items-center justify-between hover:bg-blue-500/20 text-white/70 hover:text-white transition-all text-left">
                    <div className="flex items-center gap-3">
                      <AlignLeft size={14} />
                      <span>Text Align</span>
                    </div>
                    <ChevronRight size={12} />
                  </button>
                  <div className="absolute top-0 left-full ml-1 w-40 glass-dark border border-white/20 rounded-xl shadow-2xl hidden group-hover/sub:block py-2">
                    <MenuButton 
                      icon={(!notepadStyle?.textAlign || notepadStyle?.textAlign === 'left') ? <Check size={12} /> : <div className="w-3" />} 
                      label="Align Left" 
                      onClick={() => { handleUpdateStyle('textAlign', 'left'); setActiveMenu(null); }} 
                    />
                    <MenuButton 
                      icon={(notepadStyle?.textAlign === 'center') ? <Check size={12} /> : <div className="w-3" />} 
                      label="Align Center" 
                      onClick={() => { handleUpdateStyle('textAlign', 'center'); setActiveMenu(null); }} 
                    />
                    <MenuButton 
                      icon={(notepadStyle?.textAlign === 'right') ? <Check size={12} /> : <div className="w-3" />} 
                      label="Align Right" 
                      onClick={() => { handleUpdateStyle('textAlign', 'right'); setActiveMenu(null); }} 
                    />
                    <MenuButton 
                      icon={(notepadStyle?.textAlign === 'justify') ? <Check size={12} /> : <div className="w-3" />} 
                      label="Justify" 
                      onClick={() => { handleUpdateStyle('textAlign', 'justify'); setActiveMenu(null); }} 
                    />
                  </div>
                </div>

                <div className="h-px bg-white/10 my-1 mx-2" />
                <MenuButton 
                  icon={notepadStyle?.wordWrap !== false ? <Check size={12} /> : <div className="w-3" />} 
                  label="Word Wrap" 
                  onClick={() => { 
                    handleUpdateStyle('wordWrap', notepadStyle?.wordWrap === false ? true : false); 
                    setActiveMenu(null); 
                  }} 
                />
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* View Menu */}
        <div className="relative">
          <button 
            onClick={(e) => { e.stopPropagation(); setActiveMenu(activeMenu === 'view' ? null : 'view'); }}
            className={cn("px-3 py-1 rounded hover:bg-white/10 transition-colors", activeMenu === 'view' && "bg-white/10")}
          >
            View
          </button>
          <AnimatePresence>
            {activeMenu === 'view' && (
              <motion.div 
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 5 }}
                className="absolute top-full left-0 w-48 glass-dark border border-white/20 rounded-xl shadow-2xl z-50 py-2 mt-1"
              >
                {/* Theme sub-menu */}
                <div className="relative group/sub">
                  <button className="w-full px-4 py-1.5 flex items-center justify-between hover:bg-blue-500/20 text-white/70 hover:text-white transition-all text-left">
                    <div className="flex items-center gap-3">
                      <Palette size={14} />
                      <span>Quick Themes</span>
                    </div>
                    <ChevronRight size={12} />
                  </button>
                  <div className="absolute top-0 left-full ml-1 w-48 glass-dark border border-white/20 rounded-xl shadow-2xl hidden group-hover/sub:block py-2 max-h-80 overflow-y-auto scrollbar-thin">
                    <MenuButton 
                      icon={(!notepadStyle?.theme || notepadStyle?.theme === 'classic-dark') ? <Check size={12} /> : <div className="w-3" />} 
                      label="Classic Dark" 
                      onClick={() => { handleUpdateStyle('theme', 'classic-dark'); setActiveMenu(null); }} 
                    />
                    <MenuButton 
                      icon={(notepadStyle?.theme === 'classic-light') ? <Check size={12} /> : <div className="w-3" />} 
                      label="Classic Light" 
                      onClick={() => { handleUpdateStyle('theme', 'classic-light'); setActiveMenu(null); }} 
                    />
                    <MenuButton 
                      icon={(notepadStyle?.theme === 'terminal') ? <Check size={12} /> : <div className="w-3" />} 
                      label="Retro Terminal" 
                      onClick={() => { handleUpdateStyle('theme', 'terminal'); setActiveMenu(null); }} 
                    />
                    <MenuButton 
                      icon={(notepadStyle?.theme === 'sepia') ? <Check size={12} /> : <div className="w-3" />} 
                      label="Warm Sepia" 
                      onClick={() => { handleUpdateStyle('theme', 'sepia'); setActiveMenu(null); }} 
                    />
                    <MenuButton 
                      icon={(notepadStyle?.theme === 'cyberpunk') ? <Check size={12} /> : <div className="w-3" />} 
                      label="Midnight Purple" 
                      onClick={() => { handleUpdateStyle('theme', 'cyberpunk'); setActiveMenu(null); }} 
                    />
                    <MenuButton 
                      icon={(notepadStyle?.theme === 'dracula') ? <Check size={12} /> : <div className="w-3" />} 
                      label="Dracula" 
                      onClick={() => { handleUpdateStyle('theme', 'dracula'); setActiveMenu(null); }} 
                    />
                    <MenuButton 
                      icon={(notepadStyle?.theme === 'nord') ? <Check size={12} /> : <div className="w-3" />} 
                      label="Nordic Frost" 
                      onClick={() => { handleUpdateStyle('theme', 'nord'); setActiveMenu(null); }} 
                    />
                    <div className="h-px bg-white/10 my-1 mx-2" />
                    <MenuButton 
                      icon={<Palette size={12} className="text-blue-400" />} 
                      label="More Themes..." 
                      onClick={() => { setShowThemeDialog(true); setActiveMenu(null); }} 
                    />
                  </div>
                </div>

                <MenuButton 
                  icon={<Palette size={14} className="text-blue-400" />} 
                  label="Themes & Colors..." 
                  onClick={() => { setShowThemeDialog(true); setActiveMenu(null); }} 
                />

                <div className="h-px bg-white/10 my-1 mx-2" />

                {/* Zoom sub-menu */}
                <div className="relative group/sub">
                  <button className="w-full px-4 py-1.5 flex items-center justify-between hover:bg-blue-500/20 text-white/70 hover:text-white transition-all text-left">
                    <div className="flex items-center gap-3">
                      <Search size={14} />
                      <span>Zoom</span>
                    </div>
                    <ChevronRight size={12} />
                  </button>
                  <div className="absolute top-0 left-full ml-1 w-40 glass-dark border border-white/20 rounded-xl shadow-2xl hidden group-hover/sub:block py-2">
                    <MenuButton icon={<Plus size={12} />} label="Zoom In" onClick={() => { handleZoom('in'); setActiveMenu(null); }} />
                    <MenuButton icon={<Minus size={12} />} label="Zoom Out" onClick={() => { handleZoom('out'); setActiveMenu(null); }} />
                    <MenuButton label="Reset Zoom" onClick={() => { handleZoom('reset'); setActiveMenu(null); }} />
                  </div>
                </div>

                <div className="h-px bg-white/10 my-1 mx-2" />
                <MenuButton 
                  icon={showStatusBar ? <Check size={12} /> : <div className="w-3" />} 
                  label="Status Bar" 
                  onClick={() => { setShowStatusBar(!showStatusBar); setActiveMenu(null); }} 
                />
                <MenuButton 
                  icon={showLineNumbers ? <Check size={12} /> : <div className="w-3" />} 
                  label="Line Numbers" 
                  onClick={() => { setShowLineNumbers(!showLineNumbers); setActiveMenu(null); }} 
                />
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Tools Menu */}
        <div className="relative">
          <button 
            onClick={(e) => { e.stopPropagation(); setActiveMenu(activeMenu === 'tools' ? null : 'tools'); }}
            className={cn("px-3 py-1 rounded hover:bg-white/10 transition-colors", activeMenu === 'tools' && "bg-white/10")}
          >
            Tools
          </button>
          <AnimatePresence>
            {activeMenu === 'tools' && (
              <motion.div 
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 5 }}
                className="absolute top-full left-0 w-48 glass-dark border border-white/20 rounded-xl shadow-2xl z-50 py-2 mt-1"
              >
                {/* Case Conversion sub-menu */}
                <div className="relative group/sub">
                  <button className="w-full px-4 py-1.5 flex items-center justify-between hover:bg-blue-500/20 text-white/70 hover:text-white transition-all text-left">
                    <div className="flex items-center gap-3">
                      <Baseline size={14} />
                      <span>Transform Case</span>
                    </div>
                    <ChevronRight size={12} />
                  </button>
                  <div className="absolute top-0 left-full ml-1 w-40 glass-dark border border-white/20 rounded-xl shadow-2xl hidden group-hover/sub:block py-2">
                    <MenuButton label="UPPERCASE" onClick={() => handleTransformCase('upper')} />
                    <MenuButton label="lowercase" onClick={() => handleTransformCase('lower')} />
                    <MenuButton label="Title Case" onClick={() => handleTransformCase('title')} />
                  </div>
                </div>

                {/* Format Operations sub-menu */}
                <div className="relative group/sub">
                  <button className="w-full px-4 py-1.5 flex items-center justify-between hover:bg-blue-500/20 text-white/70 hover:text-white transition-all text-left">
                    <div className="flex items-center gap-3">
                      <Eraser size={14} />
                      <span>Cleanups</span>
                    </div>
                    <ChevronRight size={12} />
                  </button>
                  <div className="absolute top-0 left-full ml-1 w-44 glass-dark border border-white/20 rounded-xl shadow-2xl hidden group-hover/sub:block py-2">
                    <MenuButton label="Trim Whitespace" onClick={handleTrimWhitespace} />
                    <MenuButton label="Remove Empty Lines" onClick={handleRemoveEmptyLines} />
                  </div>
                </div>

                <div className="h-px bg-white/10 my-1 mx-2" />
                <MenuButton 
                  icon={<Info size={14} />} 
                  label="Document Stats" 
                  onClick={() => { setShowStats(true); setActiveMenu(null); }} 
                />
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* JS/HTML5 Dev Menu */}
        <div className="relative">
          <button 
            onClick={(e) => { e.stopPropagation(); setActiveMenu(activeMenu === 'dev' ? null : 'dev'); }}
            className={cn("px-3 py-1 rounded hover:bg-white/10 transition-colors", activeMenu === 'dev' && "bg-white/10")}
          >
            JS/HTML5
          </button>
          <AnimatePresence>
            {activeMenu === 'dev' && (
              <motion.div 
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 5 }}
                className="absolute top-full left-0 w-56 glass-dark border border-white/20 rounded-xl shadow-2xl z-50 py-2 mt-1"
              >
                <div className="px-4 py-1 text-[9px] font-bold text-white/20 uppercase tracking-widest border-b border-white/10 mb-1">JavaScript (ES2025)</div>
                <MenuButton 
                  icon={<Play size={14} className="text-green-400" />} 
                  label="Run JavaScript" 
                  onClick={() => { runJavaScriptCode(); setActiveMenu(null); }} 
                />
                <MenuButton 
                  icon={<CheckCircle2 size={14} className="text-blue-400" />} 
                  label="Validate JS Syntax" 
                  onClick={() => { validateJsSyntax(); setActiveMenu(null); }} 
                />
                <MenuButton 
                  icon={<FileCode size={14} className="text-yellow-400" />} 
                  label="Insert JS ES2025 Demo" 
                  onClick={() => { insertJsSnippet(); setActiveMenu(null); }} 
                />
                
                <div className="h-px bg-white/10 my-1.5 mx-2" />
                
                <div className="px-4 py-1 text-[9px] font-bold text-white/20 uppercase tracking-widest border-b border-white/10 mb-1">HTML5 Standard</div>
                <MenuButton 
                  icon={<Eye size={14} className="text-orange-400" />} 
                  label="Open HTML in Browser" 
                  onClick={() => { openInBrowserApp(); setActiveMenu(null); }} 
                />
                <MenuButton 
                  icon={<Code2 size={14} className="text-pink-400" />} 
                  label="Format HTML Code" 
                  onClick={() => { formatHtmlDocument(); setActiveMenu(null); }} 
                />
                <MenuButton 
                  icon={<AlertCircle size={14} className="text-red-400" />} 
                  label="Validate HTML Tags" 
                  onClick={() => { validateHtmlSyntax(); setActiveMenu(null); }} 
                />
                <MenuButton 
                  icon={<FileCode size={14} className="text-orange-500" />} 
                  label="Insert HTML5 Boilerplate" 
                  onClick={() => { insertHtmlBoilerplate(); setActiveMenu(null); }} 
                />
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Office Menu */}
        <div className="relative">
          <button 
            onClick={(e) => { e.stopPropagation(); setActiveMenu(activeMenu === 'office' ? null : 'office'); }}
            className={cn("px-3 py-1 rounded hover:bg-white/10 transition-colors", activeMenu === 'office' && "bg-white/10")}
          >
            Office
          </button>
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

        {/* Inline Font Selector in Menu Bar */}
        <div className="ml-auto flex items-center gap-1.5 mr-2 relative z-50">
          <span className="text-white/40 text-[9px] font-bold tracking-wider uppercase">Font:</span>
          <button
            type="button"
            onClick={(e) => { 
              e.stopPropagation(); 
              setShowFontDialog(true); 
              setActiveMenu(null);
            }}
            className="h-5 px-2 rounded border border-white/10 hover:bg-white/10 bg-white/5 flex items-center gap-1.5 transition-all text-left min-w-[125px] justify-between cursor-pointer"
          >
            <span 
              style={{ fontFamily: getFontFamilyValue(notepadStyle?.fontFamily) }}
              className="truncate text-white text-[11px] leading-none"
            >
              {getFontName(notepadStyle?.fontFamily)}
            </span>
            <ChevronDown size={10} className="text-white/40 flex-shrink-0" />
          </button>
        </div>
      </div>

      {/* Find and Replace Bar */}
      {showFindReplace && (
        <div className="bg-white/5 border-b border-white/10 px-4 py-2 flex flex-wrap items-center gap-3 text-xs select-none">
          <div className="flex items-center gap-2">
            <span className="text-white/45 text-[10px]">Find:</span>
            <input 
              type="text" 
              value={findText} 
              onChange={e => setFindText(e.target.value)} 
              placeholder="Text to find..." 
              className="bg-black/20 border border-white/10 rounded px-2 py-1 text-white outline-none w-36 text-[11px] focus:border-blue-500/50"
              onKeyDown={e => { if (e.key === 'Enter') handleFindNext(); }}
            />
          </div>
          <div className="flex items-center gap-2">
            <span className="text-white/45 text-[10px]">Replace:</span>
            <input 
              type="text" 
              value={replaceText} 
              onChange={e => setReplaceText(e.target.value)} 
              placeholder="Replace with..." 
              className="bg-black/20 border border-white/10 rounded px-2 py-1 text-white outline-none w-36 text-[11px] focus:border-blue-500/50"
              onKeyDown={e => { if (e.key === 'Enter') handleReplace(); }}
            />
          </div>
          
          <label className="flex items-center gap-1.5 cursor-pointer select-none text-[10px] text-white/60 hover:text-white">
            <input 
              type="checkbox" 
              checked={matchCase} 
              onChange={e => setMatchCase(e.target.checked)}
              className="rounded border-white/15 bg-black/20 text-blue-500 focus:ring-0"
            />
            Match Case
          </label>
          
          <div className="flex items-center gap-1">
            <button 
              onClick={handleFindNext} 
              className="px-2 py-1 bg-white/5 hover:bg-white/10 border border-white/10 rounded text-[10px] text-white font-medium transition-all"
            >
              Find Next
            </button>
            <button 
              onClick={handleFindPrev} 
              className="px-2 py-1 bg-white/5 hover:bg-white/10 border border-white/10 rounded text-[10px] text-white font-medium transition-all"
            >
              Find Prev
            </button>
            <button 
              onClick={handleReplace} 
              className="px-2 py-1 bg-white/5 hover:bg-white/10 border border-white/10 rounded text-[10px] text-white font-medium transition-all"
            >
              Replace
            </button>
            <button 
              onClick={handleReplaceAll} 
              className="px-2 py-1 bg-white/5 hover:bg-white/10 border border-white/10 rounded text-[10px] text-white font-medium transition-all"
            >
              Replace All
            </button>
          </div>
          
          <button 
            onClick={() => setShowFindReplace(false)} 
            className="ml-auto text-white/40 hover:text-white"
          >
            <X size={14} />
          </button>
        </div>
      )}

      {/* Status Bar */}
      {showStatusBar && (
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
            <span>UTF-8 • {notepadContent.length} chars • {notepadContent.trim().split(/\s+/).filter(Boolean).length} words</span>
          </div>
        </div>
      )}

      {/* Main Editing Area */}
      <div 
        className={cn("flex-1 flex overflow-hidden transition-all duration-300", getThemeClasses())}
        style={notepadStyle?.theme === 'custom' ? {
          backgroundColor: notepadStyle?.customBg || '#1e1e2e',
          color: notepadStyle?.customText || '#ffffff',
        } : undefined}
      >
        {showPreview && activeFileInNotepad?.name.endsWith('.html') ? (
          <div className="flex-1 flex gap-4 p-4 overflow-hidden">
             <div className="flex-1 flex bg-white/5 rounded-xl border border-white/10 overflow-hidden relative">
                {showLineNumbers && (
                  <div 
                    ref={previewGutterRef}
                    onWheel={handleGutterWheel}
                    style={notepadStyle?.theme === 'custom' ? {
                      fontSize: notepadStyle?.fontSize || '14px', 
                      fontFamily: getFontFamilyValue(notepadStyle?.fontFamily),
                      paddingTop: '1rem',
                      paddingBottom: '1rem',
                      lineHeight: '1.625',
                      borderColor: `${notepadStyle?.customText || '#ffffff'}15`,
                      backgroundColor: 'rgba(0,0,0,0.15)',
                      color: `${notepadStyle?.customText || '#ffffff'}60`,
                    } : {
                      fontSize: notepadStyle?.fontSize || '14px', 
                      fontFamily: getFontFamilyValue(notepadStyle?.fontFamily),
                      paddingTop: '1rem',
                      paddingBottom: '1rem',
                      lineHeight: '1.625',
                    }}
                    className={cn("w-11 select-none text-right pr-2.5 border-r overflow-hidden font-mono text-[11px] shrink-0", getGutterClasses())}
                  >
                    {Array.from({ length: Math.max(1, notepadContent.split('\n').length) }).map((_, i) => (
                      <div key={i} className="h-[1.625em]">{i + 1}</div>
                    ))}
                  </div>
                )}
                <textarea 
                  ref={textareaRef}
                  onScroll={handlePreviewScroll}
                  onKeyDown={handleKeyDown}
                  style={{ 
                    fontSize: notepadStyle?.fontSize || '14px', 
                    fontWeight: notepadStyle?.fontWeight || 'normal', 
                    textAlign: notepadStyle?.textAlign || 'left',
                    fontFamily: getFontFamilyValue(notepadStyle?.fontFamily),
                    whiteSpace: notepadStyle?.wordWrap === false ? 'pre' : 'pre-wrap',
                    color: notepadStyle?.color || (notepadStyle?.theme === 'custom' ? (notepadStyle?.customText || '#ffffff') : undefined),
                    fontStyle: notepadStyle?.fontStyle || 'normal',
                    textDecoration: notepadStyle?.textDecoration || 'none',
                    textTransform: notepadStyle?.textTransform || 'none',
                  }}
                  className="flex-1 bg-transparent p-4 outline-none resize-none leading-relaxed overflow-auto"
                  placeholder="<html>..."
                  value={notepadContent}
                  onChange={(e) => setNotepadContent(e.target.value)}
                />
             </div>
            <div className="flex-1 bg-white rounded-xl border border-white/10 overflow-auto">
              <div 
                className="w-full h-full p-4 text-black select-text"
                dangerouslySetInnerHTML={{ __html: notepadContent }}
              />
            </div>
          </div>
        ) : (
          <div className="flex-1 flex overflow-hidden relative">
            {showLineNumbers && (
              <div 
                ref={gutterRef}
                onWheel={handleGutterWheel}
                style={notepadStyle?.theme === 'custom' ? {
                  fontSize: notepadStyle?.fontSize || '14px', 
                  fontFamily: getFontFamilyValue(notepadStyle?.fontFamily),
                  paddingTop: '1.5rem',
                  paddingBottom: '1.5rem',
                  lineHeight: '1.625',
                  borderColor: `${notepadStyle?.customText || '#ffffff'}15`,
                  backgroundColor: 'rgba(0,0,0,0.15)',
                  color: `${notepadStyle?.customText || '#ffffff'}60`,
                } : {
                  fontSize: notepadStyle?.fontSize || '14px', 
                  fontFamily: getFontFamilyValue(notepadStyle?.fontFamily),
                  paddingTop: '1.5rem',
                  paddingBottom: '1.5rem',
                  lineHeight: '1.625',
                }}
                className={cn("w-12 select-none text-right pr-3 border-r overflow-hidden font-mono text-[11px] shrink-0", getGutterClasses())}
              >
                {Array.from({ length: Math.max(1, notepadContent.split('\n').length) }).map((_, i) => (
                  <div key={i} className="h-[1.625em]">{i + 1}</div>
                ))}
              </div>
            )}
            <textarea 
              ref={textareaRef}
              onScroll={handleNormalScroll}
              onKeyDown={handleKeyDown}
              style={{ 
                fontSize: notepadStyle?.fontSize || '14px', 
                fontWeight: notepadStyle?.fontWeight || 'normal', 
                textAlign: notepadStyle?.textAlign || 'left',
                fontFamily: getFontFamilyValue(notepadStyle?.fontFamily),
                whiteSpace: notepadStyle?.wordWrap === false ? 'pre' : 'pre-wrap',
                color: notepadStyle?.color || (notepadStyle?.theme === 'custom' ? (notepadStyle?.customText || '#ffffff') : undefined),
                fontStyle: notepadStyle?.fontStyle || 'normal',
                textDecoration: notepadStyle?.textDecoration || 'none',
                textTransform: notepadStyle?.textTransform || 'none',
              }}
              className="flex-1 bg-transparent py-6 pr-6 pl-4 outline-none resize-none leading-relaxed transition-all duration-300 overflow-auto"
              placeholder="Start typing your thoughts..."
              value={notepadContent}
              onChange={(e) => setNotepadContent(e.target.value)}
            />
          </div>
        )}
      </div>

      {/* Statistics Modal */}
      <AnimatePresence>
        {showStats && (
          <div className="absolute inset-0 z-[60] flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setShowStats(false)} className="absolute inset-0 bg-black/40 backdrop-blur-sm" />
            <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }} className="relative w-full max-w-sm glass-dark rounded-3xl border border-white/20 shadow-2xl overflow-hidden flex flex-col">
              <div className="p-4 border-b border-white/10 flex items-center justify-between">
                <h3 className="text-sm font-medium flex items-center gap-2">
                  <Info size={16} className="text-blue-400" />
                  <span>Document Statistics</span>
                </h3>
                <button onClick={() => setShowStats(false)} className="text-white/40 hover:text-white transition-colors"><X size={16} /></button>
              </div>
              <div className="p-5 space-y-3.5 text-xs">
                <div className="flex justify-between items-center py-1.5 border-b border-white/5">
                  <span className="text-white/50">Characters (with spaces):</span>
                  <span className="font-mono text-white font-medium">{notepadContent.length}</span>
                </div>
                <div className="flex justify-between items-center py-1.5 border-b border-white/5">
                  <span className="text-white/50">Characters (no spaces):</span>
                  <span className="font-mono text-white font-medium">{notepadContent.replace(/\s/g, '').length}</span>
                </div>
                <div className="flex justify-between items-center py-1.5 border-b border-white/5">
                  <span className="text-white/50">Words:</span>
                  <span className="font-mono text-white font-medium">
                    {notepadContent.trim().split(/\s+/).filter(Boolean).length}
                  </span>
                </div>
                <div className="flex justify-between items-center py-1.5 border-b border-white/5">
                  <span className="text-white/50">Lines:</span>
                  <span className="font-mono text-white font-medium">
                    {notepadContent.split('\n').length}
                  </span>
                </div>
                <div className="flex justify-between items-center py-1.5 border-b border-white/5">
                  <span className="text-white/50">Sentences:</span>
                  <span className="font-mono text-white font-medium">
                    {notepadContent.split(/[.!?]+/).filter(Boolean).length}
                  </span>
                </div>
                <div className="flex justify-between items-center py-1.5 border-b border-white/5">
                  <span className="text-white/50">Avg. Word Length:</span>
                  <span className="font-mono text-white font-medium">
                    {(() => {
                      const words = notepadContent.trim().split(/\s+/).filter(Boolean);
                      if (words.length === 0) return '0';
                      const totalLength = words.reduce((acc, w) => acc + w.length, 0);
                      return (totalLength / words.length).toFixed(1);
                    })()} chars
                  </span>
                </div>
                <div className="flex justify-between items-center py-1.5">
                  <span className="text-white/50">Est. Reading Time:</span>
                  <span className="font-medium text-blue-400">
                    {(() => {
                      const words = notepadContent.trim().split(/\s+/).filter(Boolean).length;
                      return Math.max(1, Math.ceil(words / 200));
                    })()} min
                  </span>
                </div>
              </div>
              <div className="p-4 bg-white/5 border-t border-white/10 flex justify-end">
                <button 
                  onClick={() => setShowStats(false)} 
                  className="px-4 py-1.5 bg-blue-500 hover:bg-blue-600 rounded-xl text-xs font-semibold text-white transition-all shadow-lg shadow-blue-500/20"
                >
                  Close
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Go to Line Modal */}
      <AnimatePresence>
        {showGoToLine && (
          <div className="absolute inset-0 z-[60] flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setShowGoToLine(false)} className="absolute inset-0 bg-black/40 backdrop-blur-sm" />
            <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }} className="relative w-full max-w-xs glass-dark rounded-3xl border border-white/20 shadow-2xl overflow-hidden flex flex-col">
              <div className="p-4 border-b border-white/10 flex items-center justify-between">
                <h3 className="text-sm font-medium flex items-center gap-2">
                  <Hash size={16} className="text-blue-400" />
                  <span>Go to Line</span>
                </h3>
                <button onClick={() => setShowGoToLine(false)} className="text-white/40 hover:text-white transition-colors"><X size={16} /></button>
              </div>
              <form onSubmit={handleGoToLineSubmit} className="p-5 flex flex-col gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] text-white/50 font-medium">LINE NUMBER (1 - {notepadContent.split('\n').length}):</label>
                  <input 
                    type="number"
                    min="1"
                    max={notepadContent.split('\n').length}
                    value={goToLineInput}
                    onChange={(e) => setGoToLineInput(e.target.value)}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-blue-500/50 transition-colors font-mono"
                    placeholder="Enter line number..."
                    autoFocus
                  />
                </div>
                <div className="flex justify-end gap-2.5">
                  <button 
                    type="button"
                    onClick={() => setShowGoToLine(false)}
                    className="px-4 py-1.5 bg-white/5 hover:bg-white/10 rounded-xl text-xs font-medium text-white transition-all"
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit"
                    className="px-4 py-1.5 bg-blue-500 hover:bg-blue-600 rounded-xl text-xs font-semibold text-white transition-all shadow-lg shadow-blue-500/20"
                  >
                    Go
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Theme & Color Settings Modal */}
      <AnimatePresence>
        {showThemeDialog && (
          <div className="absolute inset-0 z-[60] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }} 
              animate={{ opacity: 1 }} 
              exit={{ opacity: 0 }} 
              onClick={() => setShowThemeDialog(false)} 
              className="absolute inset-0 bg-black/65 backdrop-blur-sm" 
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 15 }} 
              animate={{ opacity: 1, scale: 1, y: 0 }} 
              exit={{ opacity: 0, scale: 0.95, y: 15 }} 
              className="relative w-full max-w-xl glass-dark rounded-3xl border border-white/20 shadow-2xl overflow-hidden flex flex-col max-h-[85vh]"
            >
              {/* Header */}
              <div className="p-4 border-b border-white/10 flex items-center justify-between bg-white/5">
                <h3 className="text-sm font-semibold text-white flex items-center gap-2.5">
                  <Palette size={16} className="text-blue-400" />
                  <span>Notepad Theme & Colors</span>
                </h3>
                <button 
                  onClick={() => setShowThemeDialog(false)} 
                  className="text-white/40 hover:text-white hover:bg-white/10 p-1.5 rounded-lg transition-all"
                >
                  <X size={16} />
                </button>
              </div>

              {/* Scrollable Content */}
              <div className="flex-1 p-5 overflow-y-auto space-y-5 scrollbar-thin">
                
                {/* Section 1: Preset Themes */}
                <div className="space-y-2">
                  <label className="text-[10px] text-white/50 uppercase tracking-wider font-semibold">
                    Select a Theme Preset
                  </label>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 max-h-[220px] overflow-y-auto pr-1 scrollbar-thin">
                    {NOTEPAD_THEMES.map((theme) => {
                      const isActive = tempTheme === theme.id;
                      // Determine background color for preset preview
                      let previewBgStyle = {};
                      let previewTextColor = '#ffffff';
                      
                      if (theme.isCustom) {
                        previewBgStyle = { backgroundColor: tempCustomBg };
                        previewTextColor = tempCustomText;
                      } else {
                        // Rough preview approximations for pre-defined themes
                        previewTextColor = theme.id === 'classic-light' || theme.id === 'solarized-light' || theme.id === 'sakura' ? '#000000' : '#ffffff';
                        switch (theme.id) {
                          case 'classic-light': previewBgStyle = { backgroundColor: '#ffffff' }; break;
                          case 'terminal': previewBgStyle = { backgroundColor: '#000000' }; break;
                          case 'sepia': previewBgStyle = { backgroundColor: '#fcf7ec' }; break;
                          case 'cyberpunk': previewBgStyle = { backgroundColor: '#0f051d' }; break;
                          case 'solarized-dark': previewBgStyle = { backgroundColor: '#002b36' }; break;
                          case 'solarized-light': previewBgStyle = { backgroundColor: '#fdf6e3' }; break;
                          case 'dracula': previewBgStyle = { backgroundColor: '#282a36' }; break;
                          case 'nord': previewBgStyle = { backgroundColor: '#2e3440' }; break;
                          case 'forest': previewBgStyle = { backgroundColor: '#1e2a22' }; break;
                          case 'oceanic': previewBgStyle = { backgroundColor: '#0b132b' }; break;
                          case 'sunset': previewBgStyle = { backgroundColor: '#211107' }; break;
                          case 'sakura': previewBgStyle = { backgroundColor: '#fff5f5' }; break;
                          default: previewBgStyle = { backgroundColor: '#111827' }; break;
                        }
                      }

                      return (
                        <button
                          key={theme.id}
                          onClick={() => setTempTheme(theme.id)}
                          style={previewBgStyle}
                          className={cn(
                            "group p-3 rounded-2xl border text-left flex flex-col justify-between h-20 transition-all duration-200 outline-none select-none relative overflow-hidden",
                            isActive 
                              ? "border-blue-500 ring-2 ring-blue-500/30 scale-[0.98]" 
                              : "border-white/10 hover:border-white/25 hover:scale-[1.01]"
                          )}
                        >
                          {/* Checked indicator */}
                          {isActive && (
                            <div className="absolute top-2 right-2 text-blue-500 bg-white rounded-full p-0.5 shadow-md">
                              <Check size={10} className="stroke-[3]" />
                            </div>
                          )}

                          <div className="flex flex-col">
                            <span 
                              style={{ color: previewTextColor }} 
                              className="text-xs font-semibold tracking-tight truncate max-w-[85%]"
                            >
                              {theme.name}
                            </span>
                            <span 
                              style={{ color: previewTextColor + '90' }} 
                              className="text-[9px] mt-0.5 line-clamp-2 leading-normal"
                            >
                              {theme.desc}
                            </span>
                          </div>

                          {/* Quick color dots at the bottom */}
                          <div className="flex gap-1 mt-1">
                            <span className="w-1.5 h-1.5 rounded-full border border-white/20" style={previewBgStyle} />
                            <span className="w-1.5 h-1.5 rounded-full border border-white/20" style={{ backgroundColor: previewTextColor }} />
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Section 2: Custom Theme Configuration (Only shown if Custom is selected) */}
                {tempTheme === 'custom' && (
                  <motion.div 
                    initial={{ opacity: 0, y: -10 }} 
                    animate={{ opacity: 1, y: 0 }} 
                    className="p-4 rounded-2xl bg-white/5 border border-white/10 space-y-4"
                  >
                    <div className="flex items-center justify-between border-b border-white/5 pb-2 mb-1">
                      <span className="text-xs font-semibold text-blue-400">Custom Colors Customizer</span>
                      <span className="text-[9px] text-white/40 uppercase font-mono">Create any combination</span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {/* Custom Background Color Picker */}
                      <div className="space-y-2">
                        <div className="flex justify-between items-center">
                          <span className="text-xs font-medium text-white/75">Background Color</span>
                          <span className="text-[10px] font-mono text-white/40">{tempCustomBg.toUpperCase()}</span>
                        </div>
                        <div className="flex gap-2">
                          <input 
                            type="color" 
                            value={tempCustomBg}
                            onChange={(e) => setTempCustomBg(e.target.value)}
                            className="w-10 h-10 rounded-xl bg-transparent border border-white/10 cursor-pointer overflow-hidden outline-none"
                          />
                          <input 
                            type="text" 
                            value={tempCustomBg}
                            onChange={(e) => setTempCustomBg(e.target.value)}
                            className="flex-1 bg-white/5 border border-white/10 rounded-xl px-3 py-1.5 text-xs text-white focus:outline-none focus:border-blue-500/50 transition-colors font-mono"
                          />
                        </div>
                        
                        {/* Handpicked background Swatches */}
                        <div className="flex flex-wrap gap-1.5 mt-2">
                          {['#0f172a', '#1e1b4b', '#064e3b', '#4c0519', '#172554', '#2d1b00', '#1c1917', '#f1f5f9', '#fffbeb', '#fff5f5'].map(sw => (
                            <button 
                              key={sw}
                              onClick={() => setTempCustomBg(sw)}
                              className="w-5 h-5 rounded-md border border-white/10 hover:scale-110 active:scale-95 transition-all"
                              style={{ backgroundColor: sw }}
                              title={sw}
                            />
                          ))}
                        </div>
                      </div>

                      {/* Custom Text Color Picker */}
                      <div className="space-y-2">
                        <div className="flex justify-between items-center">
                          <span className="text-xs font-medium text-white/75">Text Color</span>
                          <span className="text-[10px] font-mono text-white/40">{tempCustomText.toUpperCase()}</span>
                        </div>
                        <div className="flex gap-2">
                          <input 
                            type="color" 
                            value={tempCustomText}
                            onChange={(e) => setTempCustomText(e.target.value)}
                            className="w-10 h-10 rounded-xl bg-transparent border border-white/10 cursor-pointer overflow-hidden outline-none"
                          />
                          <input 
                            type="text" 
                            value={tempCustomText}
                            onChange={(e) => setTempCustomText(e.target.value)}
                            className="flex-1 bg-white/5 border border-white/10 rounded-xl px-3 py-1.5 text-xs text-white focus:outline-none focus:border-blue-500/50 transition-colors font-mono"
                          />
                        </div>

                        {/* Handpicked text Swatches */}
                        <div className="flex flex-wrap gap-1.5 mt-2">
                          {['#ffffff', '#38bdf8', '#4ade80', '#f472b6', '#fbbf24', '#a78bfa', '#94a3b8', '#0f172a', '#e11d48', '#d97706'].map(sw => (
                            <button 
                              key={sw}
                              onClick={() => setTempCustomText(sw)}
                              className="w-5 h-5 rounded-md border border-white/10 hover:scale-110 active:scale-95 transition-all"
                              style={{ backgroundColor: sw }}
                              title={sw}
                            />
                          ))}
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}

                {/* Section 3: Live Real-time Miniature Preview */}
                <div className="space-y-2">
                  <label className="text-[10px] text-white/50 uppercase tracking-wider font-semibold">
                    Real-Time Live Preview
                  </label>
                  {(() => {
                    // Determine preview styling
                    let previewBg = '#111827';
                    let previewText = '#ffffff';
                    
                    if (tempTheme === 'custom') {
                      previewBg = tempCustomBg;
                      previewText = tempCustomText;
                    } else {
                      const t = NOTEPAD_THEMES.find(p => p.id === tempTheme);
                      if (t) {
                        previewBg = t.previewBg;
                        // Map some preset colors
                        switch (t.id) {
                          case 'classic-light': previewText = '#0f172a'; break;
                          case 'terminal': previewText = '#4ade80'; break;
                          case 'sepia': previewText = '#4d3a24'; break;
                          case 'cyberpunk': previewText = '#ff007f'; break;
                          case 'solarized-dark': previewText = '#93a1a1'; break;
                          case 'solarized-light': previewText = '#586e75'; break;
                          case 'dracula': previewText = '#f8f8f2'; break;
                          case 'nord': previewText = '#d8dee9'; break;
                          case 'forest': previewText = '#d4ebd4'; break;
                          case 'oceanic': previewText = '#48cae4'; break;
                          case 'sunset': previewText = '#f59e0b'; break;
                          case 'sakura': previewText = '#d53f8c'; break;
                          default: previewText = '#ffffff'; break;
                        }
                      }
                    }

                    return (
                      <div 
                        style={{ backgroundColor: previewBg, color: previewText }}
                        className="w-full h-28 rounded-2xl border border-white/10 overflow-hidden font-mono p-4 text-xs relative select-none transition-all duration-300 shadow-inner flex"
                      >
                        {/* Fake line numbers column */}
                        <div className="w-6 border-r pr-2 text-right text-[10px] shrink-0 select-none opacity-30 flex flex-col gap-1" style={{ borderColor: `${previewText}15` }}>
                          <span>1</span>
                          <span>2</span>
                          <span>3</span>
                        </div>
                        {/* Fake code/text */}
                        <div className="pl-3 flex-1 flex flex-col gap-1 overflow-hidden leading-normal">
                          <span className="truncate">const app = "Notepad Professional";</span>
                          <span className="truncate font-sans italic opacity-80">// This theme style updates live on screen!</span>
                          <span className="truncate">Welcome to customized writing environment.</span>
                        </div>
                        {/* Corner tag */}
                        <div className="absolute bottom-2 right-2 px-2 py-0.5 rounded bg-black/40 text-[8px] text-white/50 tracking-wider uppercase border border-white/5">
                          Theme Preview
                        </div>
                      </div>
                    );
                  })()}
                </div>

              </div>

              {/* Actions Footer */}
              <div className="p-4 bg-white/5 border-t border-white/10 flex justify-end gap-2.5">
                <button 
                  onClick={() => setShowThemeDialog(false)} 
                  className="px-4 py-1.5 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-xs font-semibold text-white transition-all"
                >
                  Cancel
                </button>
                <button 
                  onClick={() => {
                    handleUpdateStyle('theme', tempTheme);
                    if (tempTheme === 'custom') {
                      handleUpdateStyle('customBg', tempCustomBg);
                      handleUpdateStyle('customText', tempCustomText);
                    }
                    setShowThemeDialog(false);
                    addNotification('Notepad', `Applied theme: ${NOTEPAD_THEMES.find(t => t.id === tempTheme)?.name || 'Custom'}`, 'success');
                  }} 
                  className="px-5 py-1.5 bg-blue-500 hover:bg-blue-600 rounded-xl text-xs font-semibold text-white transition-all shadow-lg shadow-blue-500/20"
                >
                  Apply Theme
                </button>
              </div>

            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Font & Formatting Selector Modal */}
      <AnimatePresence>
        {showFontDialog && (
          <div className="absolute inset-0 z-[60] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }} 
              animate={{ opacity: 1 }} 
              exit={{ opacity: 0 }} 
              onClick={() => setShowFontDialog(false)} 
              className="absolute inset-0 bg-black/40 backdrop-blur-sm" 
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }} 
              animate={{ opacity: 1, scale: 1 }} 
              exit={{ opacity: 0, scale: 0.95 }} 
              className="relative w-full max-w-3xl glass-dark rounded-3xl border border-white/20 shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
            >
              {/* Header */}
              <div className="p-4 border-b border-white/10 flex items-center justify-between">
                <h3 className="text-sm font-medium flex items-center gap-2 text-white">
                  <Type size={16} className="text-blue-400" />
                  <span>Font & Formatting Settings</span>
                </h3>
                <button 
                  onClick={() => setShowFontDialog(false)} 
                  className="text-white/40 hover:text-white transition-colors cursor-pointer p-1 rounded-lg hover:bg-white/5"
                >
                  <X size={16} />
                </button>
              </div>

              {/* Scrollable Content Area */}
              <div className="flex-1 overflow-y-auto p-6 flex flex-col gap-6">
                <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
                  {/* Column 1: Font Family (4 cols) */}
                  <div className="md:col-span-4 flex flex-col gap-2">
                    <span className="text-[10px] text-white/50 font-bold tracking-wider uppercase flex items-center gap-1.5">
                      <Type size={12} className="text-blue-400" />
                      Font Family
                    </span>
                    <div className="flex-1 overflow-y-auto max-h-[280px] pr-1 flex flex-col gap-1.5 scrollbar-thin">
                      {AVAILABLE_FONTS.map((font) => {
                        const isSelected = tempFontFamily === font.id;
                        return (
                          <button
                            key={font.id}
                            type="button"
                            onClick={() => setTempFontFamily(font.id)}
                            className={cn(
                              "w-full px-3.5 py-2.5 rounded-xl flex items-center justify-between transition-all text-left border cursor-pointer",
                              isSelected 
                                ? "bg-blue-500/15 border-blue-500/40 text-blue-400 font-semibold" 
                                : "bg-white/5 border-white/5 hover:bg-white/10 text-white/75 hover:text-white hover:border-white/10"
                            )}
                          >
                            <div className="flex flex-col gap-0.5">
                              <span style={{ fontFamily: font.value }} className="text-xs">
                                {font.name}
                              </span>
                              <span className="text-[9px] text-white/30 font-mono">
                                {font.id}
                              </span>
                            </div>
                            {isSelected && (
                              <Check size={14} className="text-blue-400 flex-shrink-0" />
                            )}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Column 2: Formatting Options (5 cols) */}
                  <div className="md:col-span-5 flex flex-col gap-5">
                    {/* Size Selector */}
                    <div className="flex flex-col gap-2">
                      <span className="text-[10px] text-white/50 font-bold tracking-wider uppercase flex items-center gap-1.5">
                        <Baseline size={12} className="text-blue-400" />
                        Font Size
                      </span>
                      <div className="flex items-center gap-3">
                        <input 
                          type="range" 
                          min="10" 
                          max="48" 
                          value={parseInt(tempFontSize) || 14} 
                          onChange={(e) => setTempFontSize(`${e.target.value}px`)}
                          className="flex-1 h-1.5 bg-white/10 rounded-lg appearance-none cursor-pointer accent-blue-500"
                        />
                        <div className="flex items-center gap-1 shrink-0">
                          <input 
                            type="text" 
                            value={tempFontSize} 
                            onChange={(e) => setTempFontSize(e.target.value)}
                            className="w-16 px-2 py-1 text-xs bg-white/5 border border-white/10 rounded-lg text-center text-white font-mono"
                          />
                        </div>
                      </div>
                      {/* Size presets */}
                      <div className="flex gap-1 overflow-x-auto py-1 scrollbar-none">
                        {['12px', '14px', '16px', '18px', '20px', '24px', '32px'].map((sz) => (
                          <button
                            key={sz}
                            type="button"
                            onClick={() => setTempFontSize(sz)}
                            className={cn(
                              "px-2 py-0.5 text-[10px] font-mono rounded border cursor-pointer shrink-0 transition-all",
                              tempFontSize === sz 
                                ? "bg-blue-500/25 border-blue-500/50 text-blue-400" 
                                : "bg-white/5 border-white/5 hover:bg-white/10 text-white/60"
                            )}
                          >
                            {sz}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Weight Selector */}
                    <div className="flex flex-col gap-2">
                      <span className="text-[10px] text-white/50 font-bold tracking-wider uppercase flex items-center gap-1.5">
                        <Bold size={12} className="text-blue-400" />
                        Font Weight
                      </span>
                      <div className="grid grid-cols-3 gap-1.5">
                        {[
                          { id: 'normal', label: 'Normal' },
                          { id: 'medium', label: 'Medium' },
                          { id: 'bold', label: 'Bold' }
                        ].map((wg) => (
                          <button
                            key={wg.id}
                            type="button"
                            onClick={() => setTempFontWeight(wg.id)}
                            className={cn(
                              "py-1.5 px-2 text-xs rounded-xl border text-center cursor-pointer transition-all",
                              tempFontWeight === wg.id 
                                ? "bg-blue-500/15 border-blue-500/40 text-blue-400 font-semibold" 
                                : "bg-white/5 border-white/5 hover:bg-white/10 text-white/70"
                            )}
                          >
                            {wg.label}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Color Selector */}
                    <div className="flex flex-col gap-2">
                      <span className="text-[10px] text-white/50 font-bold tracking-wider uppercase flex items-center gap-1.5">
                        <Palette size={12} className="text-blue-400" />
                        Text Color
                      </span>
                      <div className="flex flex-wrap gap-1.5">
                        {[
                          { id: '', name: 'Theme', value: 'transparent' },
                          { id: '#ffffff', name: 'White', value: '#ffffff' },
                          { id: '#94a3b8', name: 'Slate', value: '#94a3b8' },
                          { id: '#ef4444', name: 'Red', value: '#ef4444' },
                          { id: '#f59e0b', name: 'Amber', value: '#f59e0b' },
                          { id: '#10b981', name: 'Emerald', value: '#10b981' },
                          { id: '#3b82f6', name: 'Blue', value: '#3b82f6' },
                          { id: '#a855f7', name: 'Purple', value: '#a855f7' },
                          { id: '#ec4899', name: 'Pink', value: '#ec4899' },
                        ].map((col) => {
                          const isSelected = tempColor === col.id;
                          return (
                            <button
                              key={col.name}
                              type="button"
                              onClick={() => setTempColor(col.id)}
                              title={col.name}
                              className={cn(
                                "w-6 h-6 rounded-full border flex items-center justify-center cursor-pointer transition-all relative overflow-hidden",
                                isSelected ? "border-blue-500 scale-110 shadow-lg shadow-blue-500/20" : "border-white/10 hover:border-white/30"
                              )}
                              style={{ backgroundColor: col.id ? col.id : undefined }}
                            >
                              {!col.id && (
                                <div className="absolute inset-0 bg-gradient-to-tr from-slate-700 to-slate-400 flex items-center justify-center text-[8px] text-white/90">
                                  Auto
                                </div>
                              )}
                              {isSelected && (
                                <Check size={10} className={cn("text-shadow shrink-0", col.id === '#ffffff' ? "text-black" : "text-white")} />
                              )}
                            </button>
                          );
                        })}
                      </div>
                      {/* Custom Color Hex Input */}
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-[9px] text-white/40 font-mono">Hex Code:</span>
                        <input 
                          type="text"
                          placeholder="#FFFFFF"
                          value={tempColor}
                          onChange={(e) => setTempColor(e.target.value)}
                          className="flex-1 max-w-[120px] px-2 py-0.5 text-xs bg-white/5 border border-white/10 rounded-lg text-white font-mono"
                        />
                      </div>
                    </div>

                    {/* Formatting & Alignment Row */}
                    <div className="grid grid-cols-2 gap-4">
                      {/* Formatting Toggles */}
                      <div className="flex flex-col gap-2">
                        <span className="text-[10px] text-white/50 font-bold tracking-wider uppercase">Style</span>
                        <div className="flex gap-1">
                          {/* Italic */}
                          <button
                            type="button"
                            onClick={() => setTempFontStyle(tempFontStyle === 'italic' ? 'normal' : 'italic')}
                            title="Italic"
                            className={cn(
                              "w-8 h-8 rounded-lg border flex items-center justify-center cursor-pointer transition-all",
                              tempFontStyle === 'italic' 
                                ? "bg-blue-500/20 border-blue-500/50 text-blue-400" 
                                : "bg-white/5 border-white/5 hover:bg-white/10 text-white/60"
                            )}
                          >
                            <Italic size={14} />
                          </button>
                          {/* Underline */}
                          <button
                            type="button"
                            onClick={() => {
                              const next = tempTextDecoration.includes('underline') ? 'none' : 'underline';
                              setTempTextDecoration(next);
                            }}
                            title="Underline"
                            className={cn(
                              "w-8 h-8 rounded-lg border flex items-center justify-center cursor-pointer transition-all",
                              tempTextDecoration.includes('underline')
                                ? "bg-blue-500/20 border-blue-500/50 text-blue-400" 
                                : "bg-white/5 border-white/5 hover:bg-white/10 text-white/60"
                            )}
                          >
                            <Underline size={14} />
                          </button>
                          {/* Strikethrough */}
                          <button
                            type="button"
                            onClick={() => {
                              const next = tempTextDecoration.includes('line-through') ? 'none' : 'line-through';
                              setTempTextDecoration(next);
                            }}
                            title="Strikethrough"
                            className={cn(
                              "w-8 h-8 rounded-lg border flex items-center justify-center cursor-pointer transition-all",
                              tempTextDecoration.includes('line-through')
                                ? "bg-blue-500/20 border-blue-500/50 text-blue-400" 
                                : "bg-white/5 border-white/5 hover:bg-white/10 text-white/60"
                            )}
                          >
                            <Strikethrough size={14} />
                          </button>
                        </div>
                      </div>

                      {/* Text Align */}
                      <div className="flex flex-col gap-2">
                        <span className="text-[10px] text-white/50 font-bold tracking-wider uppercase">Align</span>
                        <div className="flex gap-1">
                          {[
                            { id: 'left', icon: <AlignLeft size={14} />, label: 'Left' },
                            { id: 'center', icon: <AlignCenter size={14} />, label: 'Center' },
                            { id: 'right', icon: <AlignRight size={14} />, label: 'Right' },
                          ].map((al) => (
                            <button
                              key={al.id}
                              type="button"
                              onClick={() => setTempTextAlign(al.id)}
                              title={al.label}
                              className={cn(
                                "w-8 h-8 rounded-lg border flex items-center justify-center cursor-pointer transition-all",
                                tempTextAlign === al.id 
                                  ? "bg-blue-500/20 border-blue-500/50 text-blue-400" 
                                  : "bg-white/5 border-white/5 hover:bg-white/10 text-white/60"
                              )}
                            >
                              {al.icon}
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* Text Transform (Casing) */}
                    <div className="flex flex-col gap-2">
                      <span className="text-[10px] text-white/50 font-bold tracking-wider uppercase">Text Transform (Casing)</span>
                      <div className="grid grid-cols-4 gap-1">
                        {[
                          { id: 'none', label: 'None' },
                          { id: 'uppercase', label: 'UPPER' },
                          { id: 'lowercase', label: 'lower' },
                          { id: 'capitalize', label: 'Cap' }
                        ].map((tr) => (
                          <button
                            key={tr.id}
                            type="button"
                            onClick={() => setTempTextTransform(tr.id)}
                            className={cn(
                              "py-1 px-1.5 text-[10px] rounded-lg border text-center cursor-pointer transition-all",
                              tempTextTransform === tr.id 
                                ? "bg-blue-500/15 border-blue-500/40 text-blue-400 font-semibold" 
                                : "bg-white/5 border-white/5 hover:bg-white/10 text-white/75"
                            )}
                          >
                            {tr.label}
                          </button>
                        ))}
                      </div>
                    </div>

                  </div>

                  {/* Column 3: Live Preview (3 cols) */}
                  <div className="md:col-span-3 flex flex-col gap-2">
                    <span className="text-[10px] text-white/50 font-bold tracking-wider uppercase flex items-center gap-1.5">
                      <Eye size={12} className="text-blue-400" />
                      Preview Window
                    </span>
                    <div className="flex-1 bg-black/40 border border-white/15 rounded-2xl p-4 flex flex-col justify-between min-h-[220px] max-h-[280px]">
                      <div 
                        style={{ 
                          fontFamily: getFontFamilyValue(tempFontFamily),
                          fontSize: tempFontSize,
                          fontWeight: tempFontWeight,
                          textAlign: tempTextAlign as any,
                          color: tempColor || undefined,
                          fontStyle: tempFontStyle,
                          textDecoration: tempTextDecoration,
                          textTransform: tempTextTransform as any,
                        }}
                        className="text-white leading-normal overflow-y-auto max-h-[180px] pr-1 select-none flex-1 flex flex-col justify-center"
                      >
                        <div className="text-lg font-bold mb-1">Aa Bb Cc</div>
                        <div className="opacity-95 text-xs">
                          The quick brown fox jumps over the lazy dog. 1234567890
                        </div>
                      </div>
                      <div className="text-[9px] text-white/30 border-t border-white/5 pt-2 mt-2 font-mono flex flex-col gap-0.5">
                        <div className="flex justify-between">
                          <span>Font: {getFontName(tempFontFamily)}</span>
                          <span>Size: {tempFontSize}</span>
                        </div>
                        <div className="flex justify-between text-[8px] text-white/20">
                          <span>Weight: {tempFontWeight}</span>
                          <span>Align: {tempTextAlign}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Footer */}
              <div className="p-4 bg-white/[0.02] border-t border-white/10 flex justify-end gap-2.5">
                <button 
                  type="button"
                  onClick={() => setShowFontDialog(false)}
                  className="px-4 py-2 bg-white/5 hover:bg-white/10 rounded-xl text-xs font-medium text-white transition-all cursor-pointer"
                >
                  Cancel
                </button>
                <button 
                  type="button"
                  onClick={() => {
                    if (setNotepadStyle) {
                      setNotepadStyle({
                        fontFamily: tempFontFamily,
                        fontSize: tempFontSize,
                        fontWeight: tempFontWeight,
                        color: tempColor,
                        fontStyle: tempFontStyle,
                        textDecoration: tempTextDecoration,
                        textTransform: tempTextTransform,
                        textAlign: tempTextAlign,
                      });
                    }
                    setShowFontDialog(false);
                    addNotification('Notepad', `Typography and formatting settings applied successfully!`, 'success');
                  }}
                  className="px-4 py-2 bg-blue-500 hover:bg-blue-600 rounded-xl text-xs font-semibold text-white transition-all shadow-lg shadow-blue-500/20 cursor-pointer"
                >
                  Apply Styling
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

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
            allowedExtensions={['txt', 'html', 'js', 'scr', 'b']}
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

      {/* JavaScript Sandbox Console Output Drawer */}
      <AnimatePresence>
        {showJsConsole && (
          <motion.div
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="absolute bottom-0 left-0 right-0 h-[300px] bg-[#0c0c0e]/95 border-t border-white/10 z-[50] flex flex-col shadow-2xl backdrop-blur-md"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-2 border-b border-white/10 bg-black/40">
              <div className="flex items-center gap-2">
                <div className="w-2.5 h-2.5 rounded-full bg-green-500 animate-pulse" />
                <span className="text-[11px] font-bold uppercase tracking-wider text-green-400 font-mono">JS ES2025 CONSOLE LOGS</span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setJsConsoleLogs([])}
                  className="px-2.5 py-1 text-[10px] font-mono text-white/50 hover:text-white hover:bg-white/5 rounded transition-all border border-white/5 cursor-pointer"
                >
                  CLEAR
                </button>
                <button
                  onClick={runJavaScriptCode}
                  className="px-2.5 py-1 text-[10px] font-mono text-green-400 hover:text-green-300 hover:bg-green-500/10 rounded transition-all border border-green-500/20 cursor-pointer"
                >
                  RE-RUN
                </button>
                <button
                  onClick={() => setShowJsConsole(false)}
                  className="p-1 text-white/40 hover:text-white hover:bg-white/5 rounded transition-all cursor-pointer"
                >
                  <X size={14} />
                </button>
              </div>
            </div>

            {/* Log Display */}
            <div className="flex-1 overflow-y-auto p-4 font-mono text-xs space-y-2 selection:bg-green-500/20">
              {jsConsoleLogs.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-white/30 gap-2">
                  <Play size={20} className="stroke-[1.5]" />
                  <span className="text-[10px] uppercase tracking-widest font-bold">Console is empty. Run JS code to inspect outputs.</span>
                </div>
              ) : (
                jsConsoleLogs.map((log, idx) => {
                  let colorClass = 'text-white/80';
                  let prefix = '› ';
                  if (log.type === 'error') {
                    colorClass = 'text-red-400 bg-red-950/20 border-l-2 border-red-500 pl-2';
                    prefix = '✗ ';
                  } else if (log.type === 'warn') {
                    colorClass = 'text-yellow-400 bg-yellow-950/15 border-l-2 border-yellow-500 pl-2';
                    prefix = '⚠ ';
                  } else if (log.type === 'info') {
                    colorClass = 'text-cyan-400 font-semibold';
                    prefix = 'i ';
                  } else if (log.type === 'return') {
                    colorClass = 'text-green-400 font-semibold border-l-2 border-green-500 pl-2';
                    prefix = '⬎ ';
                  }

                  return (
                    <div key={idx} className={`py-0.5 leading-relaxed break-words whitespace-pre-wrap flex items-start gap-1 ${colorClass}`}>
                      <span className="text-white/20 select-none">{prefix}</span>
                      <span className="flex-1">{log.text}</span>
                      <span className="text-[9px] text-white/10 select-none">{log.timestamp}</span>
                    </div>
                  );
                })
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* HTML5 and JS Developer Validation Drawer */}
      <AnimatePresence>
        {showHtmlValidation && (
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="absolute top-0 right-0 bottom-0 w-[320px] bg-[#0c0c0e]/95 border-l border-white/10 z-[50] flex flex-col shadow-2xl backdrop-blur-md"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-white/10 bg-black/40">
              <div className="flex items-center gap-2">
                <Code2 size={15} className="text-blue-400" />
                <span className="text-[11px] font-bold uppercase tracking-wider text-white">Code Diagnostics</span>
              </div>
              <button
                onClick={() => setShowHtmlValidation(false)}
                className="p-1 text-white/40 hover:text-white hover:bg-white/5 rounded transition-all cursor-pointer"
              >
                <X size={14} />
              </button>
            </div>

            {/* Diagnostic Lists */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 no-scrollbar">
              {/* HTML Diagnostics */}
              <div>
                <div className="text-[10px] font-bold text-white/30 uppercase tracking-wider mb-2 flex items-center justify-between">
                  <span>HTML5 Validation</span>
                  <button 
                    onClick={validateHtmlSyntax}
                    className="text-[9px] text-blue-400 hover:underline cursor-pointer"
                  >
                    Refresh
                  </button>
                </div>
                {htmlErrors.length === 0 ? (
                  <div className="p-3 rounded-xl bg-green-500/10 border border-green-500/20 text-green-400 text-xs">
                    No HTML syntax issues found. All tags closed perfectly!
                  </div>
                ) : (
                  <div className="space-y-1.5">
                    {htmlErrors.map((err, idx) => (
                      <button
                        key={idx}
                        onClick={() => jumpToLine(err.line)}
                        className={`w-full p-2.5 rounded-xl text-left border text-xs transition-all flex flex-col gap-1 cursor-pointer group ${
                          err.type === 'error' 
                            ? 'bg-red-500/10 border-red-500/20 hover:bg-red-500/15' 
                            : 'bg-yellow-500/10 border-yellow-500/20 hover:bg-yellow-500/15'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span className={`font-semibold uppercase text-[9px] ${err.type === 'error' ? 'text-red-400' : 'text-yellow-400'}`}>
                            {err.type}
                          </span>
                          <span className="text-[9px] text-white/30 font-mono group-hover:text-white/60">
                            Line {err.line}
                          </span>
                        </div>
                        <div className="text-white/80 group-hover:text-white text-[11px] leading-snug">
                          {err.message}
                        </div>
                        <div className="text-[9px] text-white/30 mt-0.5 italic group-hover:text-blue-400">
                          Click to select and view line
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* JS Syntax Diagnostics */}
              <div>
                <div className="text-[10px] font-bold text-white/30 uppercase tracking-wider mb-2 flex items-center justify-between">
                  <span>JavaScript Diagnostics</span>
                  <button 
                    onClick={validateJsSyntax}
                    className="text-[9px] text-blue-400 hover:underline cursor-pointer"
                  >
                    Verify
                  </button>
                </div>
                {jsSyntaxErrors.length === 0 ? (
                  <div className="p-3 rounded-xl bg-green-500/10 border border-green-500/20 text-green-400 text-xs">
                    JavaScript syntax is valid.
                  </div>
                ) : (
                  <div className="space-y-1.5">
                    {jsSyntaxErrors.map((err, idx) => (
                      <button
                        key={idx}
                        onClick={() => jumpToLine(err.line)}
                        className="w-full p-2.5 rounded-xl text-left border border-red-500/20 bg-red-500/10 hover:bg-red-500/15 text-xs transition-all flex flex-col gap-1 cursor-pointer group"
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-semibold uppercase text-[9px] text-red-400">
                            Syntax Error
                          </span>
                          <span className="text-[9px] text-white/30 font-mono group-hover:text-white/60">
                            Line {err.line}
                          </span>
                        </div>
                        <div className="text-white/80 group-hover:text-white text-[11px] leading-snug">
                          {err.message}
                        </div>
                        <div className="text-[9px] text-white/30 mt-0.5 italic group-hover:text-blue-400">
                          Click to select and view line
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function MenuButton({ icon, label, onClick, variant = 'default', style }: { icon?: React.ReactNode, label: string, onClick: () => void, variant?: 'default' | 'danger', style?: React.CSSProperties, key?: any }) {
  return (
    <button 
      onClick={(e) => { e.stopPropagation(); onClick(); }}
      style={style}
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

function BrowserApp({ fs, fsLib, addNotification, closeWindow, setPrintQueue, userName, clipboardHistory, setClipboardHistory }: any) {
  interface BrowserTab {
    id: string;
    url: string;
    title?: string;
    localContent?: string;
    pinned?: boolean;
    groupId?: string;
    isMuted?: boolean;
  }

  const [tabs, setTabs] = useState<BrowserTab[]>([
    { id: '1', url: 'local://home.html' }
  ]);

  interface TabGroup {
    id: string;
    name: string;
    color: string;
  }

  const [tabGroups, setTabGroups] = useState<TabGroup[]>(() => {
    try {
      const saved = localStorage.getItem('glassos_browser_tab_groups_v1');
      if (saved) return JSON.parse(saved);
    } catch (e) {}
    return [
      { id: 'work', name: 'Work', color: 'blue' },
      { id: 'social', name: 'Social', color: 'pink' },
      { id: 'general', name: 'General', color: 'green' }
    ];
  });

  const [recentlyClosed, setRecentlyClosed] = useState<{ url: string; title?: string; localContent?: string }[]>(() => {
    try {
      const saved = localStorage.getItem('glassos_browser_recently_closed_v1');
      if (saved) return JSON.parse(saved);
    } catch (e) {}
    return [];
  });

  const [tabMenuAnchor, setTabMenuAnchor] = useState<{ x: number; y: number; tabId: string } | null>(null);
  const [editingTabTitleId, setEditingTabTitleId] = useState<string | null>(null);
  const [editingTabTitleVal, setEditingTabTitleVal] = useState('');
  
  const [showTabSwitcher, setShowTabSwitcher] = useState(false);
  const [tabSwitcherSearch, setTabSwitcherSearch] = useState('');
  const [newGroupName, setNewGroupName] = useState('');
  const [newGroupColor, setNewGroupColor] = useState('blue');

  useEffect(() => {
    try {
      localStorage.setItem('glassos_browser_tab_groups_v1', JSON.stringify(tabGroups));
    } catch (e) {}
  }, [tabGroups]);

  useEffect(() => {
    try {
      localStorage.setItem('glassos_browser_recently_closed_v1', JSON.stringify(recentlyClosed));
    } catch (e) {}
  }, [recentlyClosed]);
  const [activeTabId, setActiveTabId] = useState('1');
  const [urlInput, setUrlInput] = useState('local://home.html');
  const [history, setHistory] = useState<string[]>(['local://home.html']);
  interface Bookmark {
    id: string;
    title: string;
    url: string;
  }

  const [bookmarks, setBookmarks] = useState<Bookmark[]>(() => {
    try {
      const saved = localStorage.getItem('glassos_browser_bookmarks_v1');
      if (saved) return JSON.parse(saved);
    } catch (e) {}
    return [
      { id: '1', title: 'Google', url: 'https://www.google.com' },
      { id: '2', title: 'GitHub', url: 'https://www.github.com' },
      { id: '3', title: 'Home', url: 'local://home.html' }
    ];
  });

  const [favorites, setFavorites] = useState<string[]>(['https://www.google.com', 'https://www.github.com', 'local://home.html']);
  const [showHistory, setShowHistory] = useState(false);
  
  // Bookmarks state
  const [showBookmarksManager, setShowBookmarksManager] = useState(false);
  const [showBookmarkPopup, setShowBookmarkPopup] = useState(false);
  const [editingBookmarkId, setEditingBookmarkId] = useState<string | null>(null);
  const [editingBookmarkName, setEditingBookmarkName] = useState('');
  const [editingBookmarkUrl, setEditingBookmarkUrl] = useState('');
  const [bookmarksSearchQuery, setBookmarksSearchQuery] = useState('');

  const [isSecureMode, setIsSecureMode] = useState(true);

  const [view, setView] = useState<'browser' | 'composer'>('browser');
  const [composerContent, setComposerContent] = useState('<!DOCTYPE html>\n<html>\n<head>\n  <style>\n    body { font-family: sans-serif; color: #333; padding: 2rem; }\n    h1 { color: #2563eb; }\n  </style>\n</head>\n<body>\n  <h1>My Custom Page</h1>\n  <p>Built with GlassOS HTML Composer.</p>\n</body>\n</html>');
  const [composerFileName, setComposerFileName] = useState('new_page.html');

  // Menu, Theme, and Modals state
  const [activeMenu, setActiveMenu] = useState<string | null>(null);
  const [showOpenFile, setShowOpenFile] = useState(false);
  const [showPreferences, setShowPreferences] = useState(false);
  const [showAbout, setShowAbout] = useState(false);
  const [showShortcutsHelp, setShowShortcutsHelp] = useState(false);
  const [browserTheme, setBrowserTheme] = useState<'light' | 'dark' | 'sepia' | 'cyber' | 'mint'>('light');
  const [defaultSearchEngine, setDefaultSearchEngine] = useState<'google' | 'bing' | 'duckduckgo'>('google');
  const [defaultHomePage, setDefaultHomePage] = useState<string>('local://home.html');

  // Scripting Console state
  const [showScriptConsole, setShowScriptConsole] = useState(false);
  const [scriptConsoleLogs, setScriptConsoleLogs] = useState<{ type: string; text: string; timestamp: string }[]>([]);
  const [scriptInputCode, setScriptInputCode] = useState('// Enter custom JavaScript to run against active tab\nconsole.log("Hello from Browser Console!");\nconsole.log("Current Tab URL:", url);\nconsole.log("Number of page links:", linksCount);\n');

  const activeTab = useMemo(() => 
    tabs.find(t => t.id === activeTabId) || tabs[0],
    [tabs, activeTabId]
  );

  const sortedTabs = useMemo(() => {
    const pinned = tabs.filter(t => t.pinned);
    const unpinned = tabs.filter(t => !t.pinned);
    return [...pinned, ...unpinned];
  }, [tabs]);

  const isBookmarked = useMemo(() => {
    return bookmarks.some(b => b.url === activeTab.url);
  }, [bookmarks, activeTab.url]);

  useEffect(() => {
    try {
      localStorage.setItem('glassos_browser_bookmarks_v1', JSON.stringify(bookmarks));
    } catch (e) {}
    setFavorites(bookmarks.map(b => b.url));
  }, [bookmarks]);

  const handleStarClick = () => {
    const existing = bookmarks.find(b => b.url === activeTab.url);
    if (existing) {
      setEditingBookmarkId(existing.id);
      setEditingBookmarkName(existing.title);
      setEditingBookmarkUrl(existing.url);
      setShowBookmarkPopup(true);
    } else {
      const defaultTitle = activeTab.url.startsWith('local://') 
        ? activeTab.url.replace('local://', '') 
        : activeTab.url.replace('https://', '').replace('http://', '').split('/')[0] || 'Webpage';
      
      const newB = {
        id: Math.random().toString(36).substr(2, 9),
        title: defaultTitle,
        url: activeTab.url
      };
      setBookmarks(prev => [...prev, newB]);
      setEditingBookmarkId(newB.id);
      setEditingBookmarkName(newB.title);
      setEditingBookmarkUrl(newB.url);
      setShowBookmarkPopup(true);
      addNotification('Browser', `Bookmarked: ${defaultTitle}`, 'success');
    }
  };

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

  // Register with BridgeLib for cross-app OLE communication
  useEffect(() => {
    BridgeLib.registerApp('browser', {
      getData: () => tabs,
      setData: (data: any) => {
        if (typeof data === 'string') {
          const url = data.startsWith('local://') || data.startsWith('http') ? data : `local://${data}`;
          setTabs(prev => {
            const exists = prev.find(t => t.url === url);
            if (exists) {
              setActiveTabId(exists.id);
              return prev.map(t => t.id === exists.id ? { ...t, localContent: getLocalPageContent(url) } : t);
            }
            const newId = Math.random().toString(36).substr(2, 9);
            const newTab = { id: newId, url, localContent: getLocalPageContent(url) };
            setActiveTabId(newId);
            return [...prev, newTab];
          });
        }
      }
    });
    return () => BridgeLib.unregisterApp('browser');
  }, [tabs, getLocalPageContent]);

  // Global keyboard shortcuts hook for power users
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const activeEl = document.activeElement;
      const isInputFocused = activeEl && (
        activeEl.tagName === 'INPUT' || 
        activeEl.tagName === 'TEXTAREA' || 
        activeEl.tagName === 'SELECT' || 
        (activeEl as HTMLElement).isContentEditable
      );

      const isModifier = e.ctrlKey || e.metaKey;

      // If user is actively typing in a form or input, don't trigger non-modifier single key shortcuts
      if (!isModifier && isInputFocused) {
        // Esc and F5 should still work even if input is focused
        if (e.key === 'Escape') {
          if (showTabSwitcher) { e.preventDefault(); setShowTabSwitcher(false); }
          else if (showBookmarksManager) { e.preventDefault(); setShowBookmarksManager(false); }
          else if (showBookmarkPopup) { e.preventDefault(); setShowBookmarkPopup(false); }
          else if (showAbout) { e.preventDefault(); setShowAbout(false); }
          else if (showShortcutsHelp) { e.preventDefault(); setShowShortcutsHelp(false); }
          else if (showPreferences) { e.preventDefault(); setShowPreferences(false); }
          else if (activeMenu) { e.preventDefault(); setActiveMenu(null); }
        } else if (e.key === 'F5') {
          e.preventDefault();
          handleGo();
          addNotification('Browser', 'Page Reloaded', 'info');
        }
        return;
      }

      if (isModifier) {
        // Ctrl + T: New Tab
        if (e.key.toLowerCase() === 't' && !e.shiftKey) {
          e.preventDefault();
          addTab();
          addNotification('Browser', 'Shortcut: New Tab Opened (Ctrl+T)', 'success');
        }
        
        // Ctrl + W: Close Tab
        else if (e.key.toLowerCase() === 'w') {
          e.preventDefault();
          if (tabs.length > 1) {
            closeTab(null, activeTabId);
            addNotification('Browser', 'Shortcut: Tab Closed (Ctrl+W)', 'info');
          } else {
            addNotification('Browser', 'Cannot close the only open tab!', 'warning');
          }
        }

        // Ctrl + Shift + T: Reopen last closed tab
        else if (e.key.toLowerCase() === 't' && e.shiftKey) {
          e.preventDefault();
          if (recentlyClosed.length > 0) {
            const last = recentlyClosed[0];
            setTabs(prev => [...prev, { id: Math.random().toString(36).substr(2, 9), url: last.url, title: last.title, localContent: last.localContent }]);
            setRecentlyClosed(prev => prev.slice(1));
            addNotification('Browser', `Shortcut: Reopened Tab "${last.title || last.url}" (Ctrl+Shift+T)`, 'success');
          } else {
            addNotification('Browser', 'No recently closed tabs to reopen', 'warning');
          }
        }

        // Ctrl + Tab: Next Tab
        else if (e.key === 'Tab' && !e.shiftKey) {
          e.preventDefault();
          const currentIndex = sortedTabs.findIndex(t => t.id === activeTabId);
          if (currentIndex !== -1 && sortedTabs.length > 0) {
            const nextIndex = (currentIndex + 1) % sortedTabs.length;
            setActiveTabId(sortedTabs[nextIndex].id);
          }
        }

        // Ctrl + Shift + Tab: Previous Tab
        else if (e.key === 'Tab' && e.shiftKey) {
          e.preventDefault();
          const currentIndex = sortedTabs.findIndex(t => t.id === activeTabId);
          if (currentIndex !== -1 && sortedTabs.length > 0) {
            const prevIndex = (currentIndex - 1 + sortedTabs.length) % sortedTabs.length;
            setActiveTabId(sortedTabs[prevIndex].id);
          }
        }

        // Ctrl + L or Ctrl + K: Focus URL Bar
        else if (e.key.toLowerCase() === 'l' || e.key.toLowerCase() === 'k') {
          e.preventDefault();
          const urlBar = document.getElementById('browser-url-input');
          if (urlBar) {
            (urlBar as HTMLInputElement).focus();
            (urlBar as HTMLInputElement).select();
            addNotification('Browser', 'Shortcut: URL Bar Focused (Ctrl+L)', 'info');
          }
        }

        // Ctrl + B: Toggle Bookmarks Manager
        else if (e.key.toLowerCase() === 'b' && !e.shiftKey) {
          e.preventDefault();
          setShowBookmarksManager(prev => !prev);
          addNotification('Browser', 'Shortcut: Bookmarks Manager toggled (Ctrl+B)', 'info');
        }

        // Ctrl + D: Add Bookmark
        else if (e.key.toLowerCase() === 'd') {
          e.preventDefault();
          handleStarClick();
        }

        // Ctrl + F: Toggle Tab Switcher
        else if (e.key.toLowerCase() === 'f' && !e.shiftKey) {
          e.preventDefault();
          setShowTabSwitcher(prev => !prev);
        }

        // Ctrl + H: Toggle History
        else if (e.key.toLowerCase() === 'h') {
          e.preventDefault();
          setShowHistory(prev => !prev);
          addNotification('Browser', 'Shortcut: History Toggled (Ctrl+H)', 'info');
        }

        // Ctrl + Shift + S: Toggle HTTPS secure mode
        else if (e.key.toLowerCase() === 's' && e.shiftKey) {
          e.preventDefault();
          setIsSecureMode(prev => {
            const next = !prev;
            addNotification('Browser', `Shortcut: Secure HTTPS Force Mode: ${next ? 'ON' : 'OFF'} (Ctrl+Shift+S)`, next ? 'success' : 'warning');
            return next;
          });
        }

        // Ctrl + P: Print page
        else if (e.key.toLowerCase() === 'p') {
          e.preventDefault();
          handlePrint();
        }

        // Ctrl + , : Preferences
        else if (e.key === ',') {
          e.preventDefault();
          setShowPreferences(prev => !prev);
        }

        // Ctrl + / : Toggle Keyboard Shortcuts Help
        else if (e.key === '/') {
          e.preventDefault();
          setShowShortcutsHelp(prev => !prev);
          addNotification('Browser', 'Shortcut: Keyboard Shortcuts toggled (Ctrl+/)', 'info');
        }

        // Ctrl + 1 to 8: Direct tab switching
        else if (e.key >= '1' && e.key <= '8') {
          const tabIndex = parseInt(e.key) - 1;
          if (tabIndex < sortedTabs.length) {
            e.preventDefault();
            setActiveTabId(sortedTabs[tabIndex].id);
          }
        }

        // Ctrl + 9: Switch to last tab
        else if (e.key === '9') {
          e.preventDefault();
          if (sortedTabs.length > 0) {
            setActiveTabId(sortedTabs[sortedTabs.length - 1].id);
          }
        }
      } else {
        // Esc: Close active modals or menus
        if (e.key === 'Escape') {
          if (showTabSwitcher) { e.preventDefault(); setShowTabSwitcher(false); }
          else if (showBookmarksManager) { e.preventDefault(); setShowBookmarksManager(false); }
          else if (showBookmarkPopup) { e.preventDefault(); setShowBookmarkPopup(false); }
          else if (showAbout) { e.preventDefault(); setShowAbout(false); }
          else if (showShortcutsHelp) { e.preventDefault(); setShowShortcutsHelp(false); }
          else if (showPreferences) { e.preventDefault(); setShowPreferences(false); }
          else if (activeMenu) { e.preventDefault(); setActiveMenu(null); }
        }
        
        // F5: Reload active tab
        else if (e.key === 'F5') {
          e.preventDefault();
          handleGo();
          addNotification('Browser', 'Page Reloaded', 'info');
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [
    tabs, 
    activeTabId, 
    sortedTabs, 
    recentlyClosed, 
    showTabSwitcher, 
    showBookmarksManager, 
    showBookmarkPopup, 
    showAbout, 
    showShortcutsHelp,
    showPreferences, 
    activeMenu, 
    isSecureMode,
    urlInput,
    defaultSearchEngine
  ]);

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
      const query = encodeURIComponent(target);
      if (defaultSearchEngine === 'bing') {
        target = `https://www.bing.com/search?q=${query}`;
      } else if (defaultSearchEngine === 'duckduckgo') {
        target = `https://duckduckgo.com/?q=${query}`;
      } else {
        target = `https://www.google.com/search?q=${query}&igu=1`;
      }
    } else if (!target.startsWith('http')) {
      target = 'https://' + target;
    }
    
    setTabs(prev => prev.map(t => t.id === activeTabId ? { ...t, url: target, localContent } : t));
    setHistory(prev => [target, ...prev.filter(h => h !== target)].slice(0, 50));
    addNotification('Browser', `Navigating to ${target}`, 'info');
  };

  const getTabDisplayTitle = useCallback((tab: BrowserTab) => {
    if (tab.title) return tab.title;
    if (tab.url.startsWith('local://')) {
      return tab.url.replace('local://', '');
    }
    return tab.url.replace('https://', '').replace('http://', '').replace('www.', '').split('/')[0] || 'New Tab';
  }, []);

  const saveTabTitle = (id: string) => {
    const trimmed = editingTabTitleVal.trim();
    setTabs(prev => prev.map(t => t.id === id ? { ...t, title: trimmed || undefined } : t));
    setEditingTabTitleId(null);
    if (trimmed) {
      addNotification('Browser', `Tab renamed to "${trimmed}"`, 'success');
    }
  };

  const getGroupColorHex = (colorName: string) => {
    switch (colorName) {
      case 'blue': return '#3b82f6';
      case 'pink': return '#ec4899';
      case 'green': return '#10b981';
      case 'purple': return '#a855f7';
      case 'amber': return '#f59e0b';
      case 'red': return '#ef4444';
      case 'teal': return '#14b8a6';
      default: return '#64748b';
    }
  };

  const addTab = () => {
    const newId = Math.random().toString(36).substr(2, 9);
    const newTab = { id: newId, url: defaultHomePage, localContent: getLocalPageContent(defaultHomePage) };
    setTabs(prev => [...prev, newTab]);
    setActiveTabId(newId);
    addNotification('Browser', 'New tab opened', 'info');
  };

  const closeTab = (e: React.MouseEvent | null, id: string) => {
    if (e) e.stopPropagation();
    if (tabs.length === 1) return;
    
    const tabToClose = tabs.find(t => t.id === id);
    if (tabToClose) {
      setRecentlyClosed(prev => [
        { url: tabToClose.url, title: tabToClose.title || getTabDisplayTitle(tabToClose), localContent: tabToClose.localContent },
        ...prev
      ].slice(0, 15));
    }
    
    const remaining = tabs.filter(t => t.id !== id);
    setTabs(remaining);
    if (activeTabId === id) {
      const index = tabs.findIndex(t => t.id === id);
      const nextActive = remaining[Math.min(index, remaining.length - 1)];
      setActiveTabId(nextActive.id);
    }
    addNotification('Browser', 'Tab closed', 'info');
  };

  const closeOtherTabs = (id: string) => {
    const target = tabs.find(t => t.id === id);
    if (!target) return;
    
    const toClose = tabs.filter(t => t.id !== id);
    toClose.forEach(t => {
      setRecentlyClosed(prev => [
        { url: t.url, title: t.title || getTabDisplayTitle(t), localContent: t.localContent },
        ...prev
      ].slice(0, 15));
    });
    
    setTabs([target]);
    setActiveTabId(target.id);
    addNotification('Browser', 'Closed other tabs', 'info');
  };

  const closeTabsToRight = (id: string) => {
    const index = tabs.findIndex(t => t.id === id);
    if (index === -1) return;
    
    const keep = tabs.slice(0, index + 1);
    const toClose = tabs.slice(index + 1);
    
    if (toClose.length === 0) return;
    
    toClose.forEach(t => {
      setRecentlyClosed(prev => [
        { url: t.url, title: t.title || getTabDisplayTitle(t), localContent: t.localContent },
        ...prev
      ].slice(0, 15));
    });
    
    setTabs(keep);
    const isActiveClosed = toClose.some(t => t.id === activeTabId);
    if (isActiveClosed) {
      setActiveTabId(id);
    }
    addNotification('Browser', `Closed ${toClose.length} tabs to the right`, 'info');
  };

  const handlePrint = () => {
    const filename = activeTab.url.startsWith('local://') 
      ? activeTab.url.replace('local://', '') 
      : activeTab.url.replace('https://', '').replace('http://', '').split('/')[0] || 'Webpage';
    const documentName = `Browser - ${filename}`;
    const newJob = {
      id: Math.random().toString(36).substr(2, 9),
      documentName,
      filename,
      status: 'printing',
      timestamp: new Date().toLocaleTimeString(),
      owner: userName || 'Administrator'
    };
    if (setPrintQueue) {
      setPrintQueue((prev: any[]) => [...prev, newJob]);
      addNotification('Print Manager', `Sending "${documentName}" to printer...`, 'info');
      
      setTimeout(() => {
        setPrintQueue((prev: any[]) => 
          prev.map(job => job.id === newJob.id ? { ...job, status: 'completed' } : job)
        );
        addNotification('Print Manager', `Finished printing "${documentName}"`, 'success');
      }, 5000);
    } else {
      addNotification('Browser', 'Printer service is offline.', 'error');
    }
  };

  const handleEditCommand = async (command: 'undo' | 'cut' | 'copy' | 'paste') => {
    const activeEl = document.activeElement as HTMLInputElement | HTMLTextAreaElement;
    if (!activeEl || (activeEl.tagName !== 'INPUT' && activeEl.tagName !== 'TEXTAREA')) {
      addNotification('Browser', `Please focus a text field first`, 'info');
      return;
    }

    const start = activeEl.selectionStart || 0;
    const end = activeEl.selectionEnd || 0;
    const text = activeEl.value;

    if (command === 'copy' || command === 'cut') {
      const selectedText = text.substring(start, end);
      if (!selectedText) {
        addNotification('Browser', 'No text selected to copy/cut', 'warning');
        return;
      }
      try {
        await navigator.clipboard.writeText(selectedText);
      } catch (e) {
        // fallback
      }
      if (setClipboardHistory) {
        setClipboardHistory((prev: string[]) => [selectedText, ...prev].slice(0, 50));
      }
      addNotification('Browser', `Copied selected text`, 'success');

      if (command === 'cut') {
        const newValue = text.substring(0, start) + text.substring(end);
        activeEl.value = newValue;
        if (activeEl.id === 'composer-textarea' || activeEl.className.includes('composer')) {
          setComposerContent(newValue);
        } else {
          setUrlInput(newValue);
        }
      }
    } else if (command === 'paste') {
      let pasteText = '';
      try {
        pasteText = await navigator.clipboard.readText();
      } catch (e) {
        if (clipboardHistory && clipboardHistory.length > 0) {
          pasteText = clipboardHistory[0];
        }
      }
      if (!pasteText) {
        addNotification('Browser', 'Clipboard is empty', 'warning');
        return;
      }
      const newValue = text.substring(0, start) + pasteText + text.substring(end);
      activeEl.value = newValue;
      if (activeEl.id === 'composer-textarea' || activeEl.className.includes('composer')) {
        setComposerContent(newValue);
      } else {
        setUrlInput(newValue);
      }
      addNotification('Browser', 'Pasted text', 'success');
    } else if (command === 'undo') {
      activeEl.focus();
      try {
        document.execCommand('undo');
        addNotification('Browser', 'Undo triggered', 'info');
      } catch (e) {
        addNotification('Browser', 'Undo is handled by your system standard shortcuts', 'info');
      }
    }
  };

  const runScriptCode = (code: string) => {
    setScriptConsoleLogs([]);
    const logs: string[] = [];
    const customConsole = {
      log: (...args: any[]) => {
        const text = args.map(a => typeof a === 'object' ? JSON.stringify(a) : String(a)).join(' ');
        logs.push(text);
      },
      error: (...args: any[]) => {
        const text = args.map(a => typeof a === 'object' ? JSON.stringify(a) : String(a)).join(' ');
        logs.push('ERROR: ' + text);
      },
      warn: (...args: any[]) => {
        const text = args.map(a => typeof a === 'object' ? JSON.stringify(a) : String(a)).join(' ');
        logs.push('WARN: ' + text);
      }
    };

    let mockLinks: string[] = [];
    let mockHeadings: string[] = [];
    
    if (activeTab.localContent) {
      const parser = new DOMParser();
      const doc = parser.parseFromString(activeTab.localContent, 'text/html');
      doc.querySelectorAll('a').forEach(l => {
        mockLinks.push(`${l.textContent || ''} -> ${l.getAttribute('href') || ''}`);
      });
      doc.querySelectorAll('h1, h2, h3, h4, h5, h6').forEach(h => {
        mockHeadings.push(`<${h.tagName.toLowerCase()}> ${h.textContent || ''}`);
      });
    }

    try {
      const sandbox = {
        console: customConsole,
        url: activeTab.url,
        linksCount: mockLinks.length,
        links: mockLinks,
        headings: mockHeadings,
        alert: (msg: string) => customConsole.log(`[ALERT]: ${msg}`),
        $: (sel: string) => {
          if (!activeTab.localContent) return null;
          const parser = new DOMParser();
          const doc = parser.parseFromString(activeTab.localContent, 'text/html');
          return doc.querySelector(sel)?.textContent || null;
        },
        $$: (sel: string) => {
          if (!activeTab.localContent) return [];
          const parser = new DOMParser();
          const doc = parser.parseFromString(activeTab.localContent, 'text/html');
          return Array.from(doc.querySelectorAll(sel)).map(e => e.textContent || '');
        }
      };

      const runner = new Function('sandbox', `
        with (sandbox) {
          ${code}
        }
      `);
      runner(sandbox);
      
      const newLogs = logs.map(l => ({
        type: l.startsWith('ERROR:') ? 'error' : l.startsWith('WARN:') ? 'warn' : 'info',
        text: l.replace(/^ERROR:\s*/, '').replace(/^WARN:\s*/, ''),
        timestamp: new Date().toLocaleTimeString()
      }));

      if (newLogs.length === 0) {
        newLogs.push({
          type: 'info',
          text: 'Script executed successfully with no logs.',
          timestamp: new Date().toLocaleTimeString()
        });
      }
      setScriptConsoleLogs(newLogs);
      addNotification('Scripting Tools', 'Script ran successfully', 'success');
    } catch (err: any) {
      setScriptConsoleLogs([{
        type: 'error',
        text: err?.message || String(err),
        timestamp: new Date().toLocaleTimeString()
      }]);
      addNotification('Scripting Tools', 'Script execution failed', 'error');
    }
  };

  const themeStyles = useMemo(() => {
    switch (browserTheme) {
      case 'dark':
        return {
          menuBar: 'bg-[#181825] border-white/5 text-slate-300',
          tabBar: 'bg-[#1e1e2e] border-white/5 text-slate-400',
          activeTab: 'bg-[#11111b] text-slate-100',
          inactiveTab: 'hover:bg-[#181825]/80 text-slate-400',
          toolbar: 'bg-[#11111b] text-slate-300 border-white/5',
          menuBtn: 'hover:bg-white/10 text-slate-200',
          menuDropdown: 'glass-dark border-white/20 text-white/95',
          inputBg: 'bg-white/5 text-slate-200 border-white/10 focus:bg-[#181825]',
          bookmarksBar: 'bg-[#181825]/90 border-b border-white/5 text-slate-300',
          bookmarksBtn: 'hover:bg-white/5 text-slate-300',
        };
      case 'sepia':
        return {
          menuBar: 'bg-[#ebdcb9] border-amber-200/80 text-amber-950',
          tabBar: 'bg-[#e6dfcf] border-amber-200/50 text-amber-900',
          activeTab: 'bg-[#f4efe2] text-amber-950 shadow-[0_-2px_4px_rgba(0,0,0,0.03)]',
          inactiveTab: 'hover:bg-[#dfcaa0]/50 text-amber-800',
          toolbar: 'bg-[#f4efe2] text-amber-900 border-amber-200',
          menuBtn: 'hover:bg-[#dfcaa0] text-amber-950',
          menuDropdown: 'bg-[#f4efe2] border-amber-200 text-amber-950',
          inputBg: 'bg-[#ebdcb9]/40 text-amber-950 border-amber-200 focus:bg-white',
          bookmarksBar: 'bg-[#e6dfcf] border-b border-amber-200 text-amber-950',
          bookmarksBtn: 'hover:bg-[#dfcaa0]/30 text-amber-950',
        };
      case 'cyber':
        return {
          menuBar: 'bg-slate-950 border-purple-500/20 text-purple-400 font-mono',
          tabBar: 'bg-slate-900 border-purple-500/10 text-purple-400 font-mono',
          activeTab: 'bg-purple-950/40 text-fuchsia-300 border-t border-x border-purple-500/40',
          inactiveTab: 'hover:bg-purple-500/10 text-purple-500',
          toolbar: 'bg-slate-950 text-purple-300 border-purple-500/20 font-mono',
          menuBtn: 'hover:bg-purple-500/20 text-fuchsia-400',
          menuDropdown: 'bg-slate-950 border-purple-500/40 text-fuchsia-300',
          inputBg: 'bg-purple-950/10 text-fuchsia-300 border-purple-500/20 focus:bg-slate-900',
          bookmarksBar: 'bg-slate-950 border-b border-purple-500/20 text-purple-400 font-mono',
          bookmarksBtn: 'hover:bg-purple-500/10 text-purple-300',
        };
      case 'mint':
        return {
          menuBar: 'bg-[#d2e8db] border-teal-100 text-teal-950',
          tabBar: 'bg-[#e2f1e8] border-teal-100/50 text-teal-900',
          activeTab: 'bg-white text-teal-900 shadow-[0_-2px_4px_rgba(0,0,0,0.03)]',
          inactiveTab: 'hover:bg-[#b8dbca]/50 text-teal-800',
          toolbar: 'bg-white text-teal-800 border-teal-100',
          menuBtn: 'hover:bg-[#b8dbca] text-teal-900',
          menuDropdown: 'bg-white border-teal-100 text-teal-900',
          inputBg: 'bg-[#e2f1e8]/50 text-teal-900 border-teal-100 focus:bg-white',
          bookmarksBar: 'bg-[#e2f1e8] border-b border-teal-100 text-teal-950',
          bookmarksBtn: 'hover:bg-[#b8dbca]/30 text-teal-900',
        };
      case 'light':
      default:
        return {
          menuBar: 'bg-slate-100 border-slate-200 text-slate-700',
          tabBar: 'bg-[#dee1e6] border-slate-200/50 text-slate-600',
          activeTab: 'bg-white text-slate-800 shadow-[0_-2px_4px_rgba(0,0,0,0.05)]',
          inactiveTab: 'hover:bg-[#e8eaed] text-slate-600',
          toolbar: 'bg-white text-slate-700 border-b border-slate-200',
          menuBtn: 'hover:bg-slate-200 text-slate-800',
          menuDropdown: 'bg-white border-slate-200 text-slate-800',
          inputBg: 'bg-[#f1f3f4] text-slate-700 border-transparent focus:bg-white focus:border-slate-200',
          bookmarksBar: 'bg-slate-50 border-b border-slate-200 text-slate-600',
          bookmarksBtn: 'hover:bg-slate-200/50 text-slate-700',
        };
    }
  }, [browserTheme]);

  return (
    <div 
      className="h-full flex flex-col bg-[#f0f2f5] select-text relative"
      onClick={() => setActiveMenu(null)}
    >
      {/* Menu Bar */}
      <div className={cn("h-8 flex items-center px-4 gap-2 text-xs font-medium relative border-b select-none z-40 transition-all", themeStyles.menuBar)}>
        {/* File Menu */}
        <div className="relative">
          <button 
            onClick={(e) => { e.stopPropagation(); setActiveMenu(activeMenu === 'file' ? null : 'file'); }}
            className={cn("px-3 py-1 rounded transition-colors cursor-pointer", themeStyles.menuBtn, activeMenu === 'file' && "bg-white/10")}
          >
            File
          </button>
          {activeMenu === 'file' && (
            <div className={cn("absolute top-full left-0 w-48 border rounded-xl shadow-2xl py-1 mt-1 z-50 flex flex-col backdrop-blur-md", themeStyles.menuDropdown)}>
              <button 
                onClick={() => { setActiveMenu(null); setShowOpenFile(true); }}
                className="px-4 py-1.5 flex items-center gap-3 hover:bg-blue-500/10 hover:text-blue-400 transition-all text-left text-xs cursor-pointer"
              >
                <FolderOpen size={12} />
                <span>Open File...</span>
              </button>
              <button 
                onClick={() => { setActiveMenu(null); handlePrint(); }}
                className="px-4 py-1.5 flex items-center gap-3 hover:bg-blue-500/10 hover:text-blue-400 transition-all text-left text-xs cursor-pointer"
              >
                <Printer size={12} />
                <span>Print...</span>
              </button>
              <div className="h-[1px] bg-slate-200/20 my-1" />
              <button 
                onClick={() => { setActiveMenu(null); setShowPreferences(true); }}
                className="px-4 py-1.5 flex items-center gap-3 hover:bg-blue-500/10 hover:text-blue-400 transition-all text-left text-xs cursor-pointer"
              >
                <SettingsIcon size={12} />
                <span>Preferences</span>
              </button>
              <button 
                onClick={() => { setActiveMenu(null); setShowAbout(true); }}
                className="px-4 py-1.5 flex items-center gap-3 hover:bg-blue-500/10 hover:text-blue-400 transition-all text-left text-xs cursor-pointer"
              >
                <Info size={12} />
                <span>About App</span>
              </button>
              <div className="h-[1px] bg-slate-200/20 my-1" />
              <button 
                onClick={() => { 
                  setActiveMenu(null); 
                  if (closeWindow) {
                    closeWindow('browser');
                  } else {
                    addNotification('Browser', 'Closed Glass Browser', 'info');
                  }
                }}
                className="px-4 py-1.5 flex items-center gap-3 hover:bg-red-500/20 text-red-500 hover:text-red-400 transition-all text-left text-xs cursor-pointer"
              >
                <LogOut size={12} />
                <span>Quit</span>
              </button>
            </div>
          )}
        </div>

        {/* Edit Menu */}
        <div className="relative">
          <button 
            onClick={(e) => { e.stopPropagation(); setActiveMenu(activeMenu === 'edit' ? null : 'edit'); }}
            className={cn("px-3 py-1 rounded transition-colors cursor-pointer", themeStyles.menuBtn, activeMenu === 'edit' && "bg-white/10")}
          >
            Edit
          </button>
          {activeMenu === 'edit' && (
            <div className={cn("absolute top-full left-0 w-48 border rounded-xl shadow-2xl py-1 mt-1 z-50 flex flex-col backdrop-blur-md", themeStyles.menuDropdown)}>
              <button 
                onClick={() => { setActiveMenu(null); handleEditCommand('undo'); }}
                className="px-4 py-1.5 flex items-center justify-between hover:bg-blue-500/10 hover:text-blue-400 transition-all text-left text-xs cursor-pointer"
              >
                <div className="flex items-center gap-3">
                  <Undo size={12} />
                  <span>Undo</span>
                </div>
                <span className="opacity-40 font-mono text-[9px]">Ctrl+Z</span>
              </button>
              <div className="h-[1px] bg-slate-200/20 my-1" />
              <button 
                onClick={() => { setActiveMenu(null); handleEditCommand('cut'); }}
                className="px-4 py-1.5 flex items-center justify-between hover:bg-blue-500/10 hover:text-blue-400 transition-all text-left text-xs cursor-pointer"
              >
                <div className="flex items-center gap-3">
                  <Scissors size={12} />
                  <span>Cut</span>
                </div>
                <span className="opacity-40 font-mono text-[9px]">Ctrl+X</span>
              </button>
              <button 
                onClick={() => { setActiveMenu(null); handleEditCommand('copy'); }}
                className="px-4 py-1.5 flex items-center justify-between hover:bg-blue-500/10 hover:text-blue-400 transition-all text-left text-xs cursor-pointer"
              >
                <div className="flex items-center gap-3">
                  <Copy size={12} />
                  <span>Copy</span>
                </div>
                <span className="opacity-40 font-mono text-[9px]">Ctrl+C</span>
              </button>
              <button 
                onClick={() => { setActiveMenu(null); handleEditCommand('paste'); }}
                className="px-4 py-1.5 flex items-center justify-between hover:bg-blue-500/10 hover:text-blue-400 transition-all text-left text-xs cursor-pointer"
              >
                <div className="flex items-center gap-3">
                  <Clipboard size={12} />
                  <span>Paste</span>
                </div>
                <span className="opacity-40 font-mono text-[9px]">Ctrl+V</span>
              </button>
            </div>
          )}
        </div>

        {/* Tools Menu */}
        <div className="relative">
          <button 
            onClick={(e) => { e.stopPropagation(); setActiveMenu(activeMenu === 'tools' ? null : 'tools'); }}
            className={cn("px-3 py-1 rounded transition-colors cursor-pointer", themeStyles.menuBtn, activeMenu === 'tools' && "bg-white/10")}
          >
            Tools
          </button>
          {activeMenu === 'tools' && (
            <div className={cn("absolute top-full left-0 w-56 border rounded-xl shadow-2xl py-1 mt-1 z-50 flex flex-col backdrop-blur-md", themeStyles.menuDropdown)}>
              <span className="px-4 py-1 text-[9px] font-bold text-slate-400 uppercase tracking-widest">Browser Themes</span>
              <button 
                onClick={() => { setActiveMenu(null); setBrowserTheme('light'); addNotification('Browser', 'Set theme: Chrome Light', 'info'); }}
                className={cn("px-4 py-1.5 flex items-center justify-between transition-all text-left text-xs cursor-pointer", browserTheme === 'light' ? "bg-blue-500/10 text-blue-400 font-bold" : "hover:bg-blue-500/10 hover:text-blue-400")}
              >
                <div className="flex items-center gap-3">
                  <Palette size={12} className="text-sky-500" />
                  <span>Chrome Light</span>
                </div>
                {browserTheme === 'light' && <Check size={12} />}
              </button>
              <button 
                onClick={() => { setActiveMenu(null); setBrowserTheme('dark'); addNotification('Browser', 'Set theme: Cosmic Dark', 'info'); }}
                className={cn("px-4 py-1.5 flex items-center justify-between transition-all text-left text-xs cursor-pointer", browserTheme === 'dark' ? "bg-blue-500/10 text-blue-400 font-bold" : "hover:bg-blue-500/10 hover:text-blue-400")}
              >
                <div className="flex items-center gap-3">
                  <Palette size={12} className="text-slate-500" />
                  <span>Cosmic Dark</span>
                </div>
                {browserTheme === 'dark' && <Check size={12} />}
              </button>
              <button 
                onClick={() => { setActiveMenu(null); setBrowserTheme('sepia'); addNotification('Browser', 'Set theme: Vintage Sepia', 'info'); }}
                className={cn("px-4 py-1.5 flex items-center justify-between transition-all text-left text-xs cursor-pointer", browserTheme === 'sepia' ? "bg-blue-500/10 text-blue-400 font-bold" : "hover:bg-blue-500/10 hover:text-blue-400")}
              >
                <div className="flex items-center gap-3">
                  <Palette size={12} className="text-amber-600" />
                  <span>Vintage Sepia</span>
                </div>
                {browserTheme === 'sepia' && <Check size={12} />}
              </button>
              <button 
                onClick={() => { setActiveMenu(null); setBrowserTheme('cyber'); addNotification('Browser', 'Set theme: Cyber Neon', 'info'); }}
                className={cn("px-4 py-1.5 flex items-center justify-between transition-all text-left text-xs cursor-pointer", browserTheme === 'cyber' ? "bg-blue-500/10 text-blue-400 font-bold" : "hover:bg-blue-500/10 hover:text-blue-400")}
              >
                <div className="flex items-center gap-3">
                  <Palette size={12} className="text-purple-500" />
                  <span>Cyber Neon</span>
                </div>
                {browserTheme === 'cyber' && <Check size={12} />}
              </button>
              <button 
                onClick={() => { setActiveMenu(null); setBrowserTheme('mint'); addNotification('Browser', 'Set theme: Mint Breeze', 'info'); }}
                className={cn("px-4 py-1.5 flex items-center justify-between transition-all text-left text-xs cursor-pointer", browserTheme === 'mint' ? "bg-blue-500/10 text-blue-400 font-bold" : "hover:bg-blue-500/10 hover:text-blue-400")}
              >
                <div className="flex items-center gap-3">
                  <Palette size={12} className="text-teal-500" />
                  <span>Mint Breeze</span>
                </div>
                {browserTheme === 'mint' && <Check size={12} />}
              </button>
              
              <div className="h-[1px] bg-slate-200/20 my-1" />
              <span className="px-4 py-1 text-[9px] font-bold text-slate-400 uppercase tracking-widest">Scripting Tools</span>
              <button 
                onClick={() => { setActiveMenu(null); setShowScriptConsole(!showScriptConsole); }}
                className={cn("px-4 py-1.5 flex items-center gap-3 transition-all text-left text-xs cursor-pointer", showScriptConsole ? "bg-blue-500/10 text-blue-400 font-bold" : "hover:bg-blue-500/10 hover:text-blue-400")}
              >
                <TerminalIcon size={12} />
                <span>JavaScript Console</span>
              </button>
            </div>
          )}
        </div>

        {/* Tabs Menu */}
        <div className="relative">
          <button 
            onClick={(e) => { e.stopPropagation(); setActiveMenu(activeMenu === 'tabs' ? null : 'tabs'); }}
            className={cn("px-3 py-1 rounded transition-colors cursor-pointer", themeStyles.menuBtn, activeMenu === 'tabs' && "bg-white/10")}
          >
            Tabs
          </button>
          {activeMenu === 'tabs' && (
            <div className={cn("absolute top-full left-0 w-56 border rounded-xl shadow-2xl py-1 mt-1 z-50 flex flex-col backdrop-blur-md", themeStyles.menuDropdown)}>
              <span className="px-4 py-1 text-[9px] font-bold text-slate-400 uppercase tracking-widest">Tab Navigation</span>
              <button 
                onClick={() => { setActiveMenu(null); setShowTabSwitcher(true); }}
                className="px-4 py-1.5 flex items-center justify-between hover:bg-blue-500/10 hover:text-blue-400 transition-all text-left text-xs cursor-pointer"
              >
                <div className="flex items-center gap-3">
                  <Search size={12} />
                  <span>Search Open Tabs...</span>
                </div>
                <span className="opacity-40 font-mono text-[9px]">({tabs.length})</span>
              </button>
              <button 
                onClick={() => { setActiveMenu(null); addTab(); }}
                className="px-4 py-1.5 flex items-center justify-between hover:bg-blue-500/10 hover:text-blue-400 transition-all text-left text-xs cursor-pointer"
              >
                <div className="flex items-center gap-3">
                  <Plus size={12} />
                  <span>New Tab</span>
                </div>
                <span className="opacity-40 font-mono text-[9px]">Ctrl+T</span>
              </button>
              <button 
                disabled={recentlyClosed.length === 0}
                onClick={() => { 
                  setActiveMenu(null); 
                  if (recentlyClosed.length > 0) {
                    const last = recentlyClosed[0];
                    setTabs(prev => [...prev, { id: Math.random().toString(36).substr(2, 9), url: last.url, title: last.title, localContent: last.localContent }]);
                    setRecentlyClosed(prev => prev.slice(1));
                    addNotification('Browser', `Reopened tab: ${last.title || last.url}`, 'success');
                  }
                }}
                className="px-4 py-1.5 flex items-center gap-3 hover:bg-blue-500/10 hover:text-blue-400 disabled:opacity-40 disabled:hover:bg-transparent disabled:hover:text-current transition-all text-left text-xs cursor-pointer"
              >
                <Undo size={12} />
                <span>Reopen Closed Tab</span>
              </button>

              <div className="h-[1px] bg-slate-200/20 my-1" />
              <span className="px-4 py-1 text-[9px] font-bold text-slate-400 uppercase tracking-widest">Active Tab Actions</span>
              <button 
                onClick={() => { 
                  setActiveMenu(null);
                  setTabs(prev => prev.map(t => t.id === activeTabId ? { ...t, pinned: !t.pinned } : t));
                  const isPinnedNow = !activeTab.pinned;
                  addNotification('Browser', isPinnedNow ? 'Tab pinned to front' : 'Tab unpinned', 'info');
                }}
                className="px-4 py-1.5 flex items-center gap-3 hover:bg-blue-500/10 hover:text-blue-400 transition-all text-left text-xs cursor-pointer"
              >
                {activeTab.pinned ? <PinOff size={12} /> : <Pin size={12} />}
                <span>{activeTab.pinned ? 'Unpin Active Tab' : 'Pin Active Tab'}</span>
              </button>
              <button 
                onClick={() => { 
                  setActiveMenu(null);
                  const dup = {
                    id: Math.random().toString(36).substr(2, 9),
                    url: activeTab.url,
                    title: activeTab.title ? `${activeTab.title} (Copy)` : undefined,
                    localContent: activeTab.localContent,
                    groupId: activeTab.groupId
                  };
                  setTabs(prev => [...prev, dup]);
                  setActiveTabId(dup.id);
                  addNotification('Browser', 'Tab duplicated', 'success');
                }}
                className="px-4 py-1.5 flex items-center gap-3 hover:bg-blue-500/10 hover:text-blue-400 transition-all text-left text-xs cursor-pointer"
              >
                <Copy size={12} />
                <span>Duplicate Active Tab</span>
              </button>
              <button 
                onClick={() => { 
                  setActiveMenu(null);
                  setEditingTabTitleId(activeTabId);
                  setEditingTabTitleVal(activeTab.title || getTabDisplayTitle(activeTab));
                }}
                className="px-4 py-1.5 flex items-center gap-3 hover:bg-blue-500/10 hover:text-blue-400 transition-all text-left text-xs cursor-pointer"
              >
                <Edit2 size={12} />
                <span>Rename Active Tab...</span>
              </button>
              <button 
                onClick={() => { 
                  setActiveMenu(null);
                  setTabs(prev => prev.map(t => t.id === activeTabId ? { ...t, isMuted: !t.isMuted } : t));
                }}
                className="px-4 py-1.5 flex items-center gap-3 hover:bg-blue-500/10 hover:text-blue-400 transition-all text-left text-xs cursor-pointer"
              >
                {activeTab.isMuted ? <Volume2 size={12} /> : <EyeOff size={12} />}
                <span>{activeTab.isMuted ? 'Unmute Active Tab' : 'Mute Active Tab'}</span>
              </button>

              <div className="h-[1px] bg-slate-200/20 my-1" />
              <button 
                disabled={tabs.length === 1}
                onClick={() => { 
                  setActiveMenu(null);
                  closeOtherTabs(activeTabId);
                }}
                className="px-4 py-1.5 flex items-center gap-3 hover:bg-blue-500/10 hover:text-blue-400 disabled:opacity-40 disabled:hover:bg-transparent disabled:hover:text-current transition-all text-left text-xs cursor-pointer"
              >
                <Trash size={12} />
                <span>Close Other Tabs</span>
              </button>
            </div>
          )}
        </div>

        {/* Help Menu */}
        <div className="relative">
          <button 
            onClick={(e) => { e.stopPropagation(); setActiveMenu(activeMenu === 'help' ? null : 'help'); }}
            className={cn("px-3 py-1 rounded transition-colors cursor-pointer", themeStyles.menuBtn, activeMenu === 'help' && "bg-white/10")}
          >
            Help
          </button>
          {activeMenu === 'help' && (
            <div className={cn("absolute top-full left-0 w-48 border rounded-xl shadow-2xl py-1 mt-1 z-50 flex flex-col backdrop-blur-md", themeStyles.menuDropdown)}>
              <button 
                onClick={() => { setActiveMenu(null); setShowShortcutsHelp(true); }}
                className="px-4 py-1.5 flex items-center justify-between hover:bg-blue-500/10 hover:text-blue-400 transition-all text-left text-xs cursor-pointer"
              >
                <div className="flex items-center gap-3">
                  <Keyboard size={12} />
                  <span>Keyboard Shortcuts</span>
                </div>
                <span className="opacity-40 font-mono text-[9px]">Ctrl+/</span>
              </button>
              <button 
                onClick={() => { setActiveMenu(null); setShowAbout(true); }}
                className="px-4 py-1.5 flex items-center gap-3 hover:bg-blue-500/10 hover:text-blue-400 transition-all text-left text-xs cursor-pointer"
              >
                <Info size={12} />
                <span>About Browser</span>
              </button>
            </div>
          )}
        </div>

        <div className="ml-auto text-[9px] opacity-30 font-mono flex items-center gap-1.5 select-none">
          <Palette size={10} />
          <span>THEME: {browserTheme.toUpperCase()}</span>
        </div>
      </div>

      {/* Tab Bar */}
      <div className={cn("h-10 flex items-center px-2 gap-1 overflow-x-auto no-scrollbar pt-2 transition-all relative z-30", themeStyles.tabBar)}>
        {/* Search switcher quick button */}
        <button 
          onClick={() => setShowTabSwitcher(true)}
          className="p-1.5 hover:bg-black/5 rounded-lg transition-colors text-slate-500 mr-1 cursor-pointer shrink-0"
          title="Search open tabs / Switcher"
        >
          <Layers size={13} />
        </button>

        {sortedTabs.map(tab => {
          const group = tabGroups.find(g => g.id === tab.groupId);
          const isPinned = tab.pinned;
          const isActive = activeTabId === tab.id;
          const isMuted = tab.isMuted;
          const tabTitle = getTabDisplayTitle(tab);

          return (
            <div
              key={tab.id}
              onClick={() => setActiveTabId(tab.id)}
              className={cn(
                "h-8 rounded-t-lg flex items-center gap-1.5 cursor-pointer transition-all relative group select-none overflow-hidden border-b-0 shrink-0",
                isPinned ? "px-2.5 w-10 justify-center" : "px-3.5 min-w-[130px] max-w-[190px] flex-1",
                isActive ? themeStyles.activeTab : themeStyles.inactiveTab
              )}
              onContextMenu={(e) => {
                e.preventDefault();
                e.stopPropagation();
                const rect = e.currentTarget.getBoundingClientRect();
                setTabMenuAnchor({ x: rect.left, y: rect.bottom, tabId: tab.id });
              }}
              title={isPinned ? `${tabTitle} (Pinned)` : tabTitle}
            >
              {/* Group color line on top */}
              {group && (
                <div 
                  className="absolute top-0 left-0 right-0 h-[2.5px] transition-all" 
                  style={{ backgroundColor: getGroupColorHex(group.color) }}
                />
              )}

              {/* Favicon or Pin icon */}
              {isPinned ? (
                <Pin 
                  size={12} 
                  className={cn(
                    "transition-transform", 
                    isActive ? "text-amber-500 fill-amber-500 rotate-45" : "text-slate-400"
                  )} 
                />
              ) : tab.url.startsWith('local://') ? (
                <Monitor size={12} className={cn(isActive ? "text-teal-500" : "text-slate-400")} />
              ) : (
                <Globe size={12} className={cn(isActive ? "text-blue-500" : "text-slate-400")} />
              )}

              {/* Title / Inline Rename Input */}
              {!isPinned && (
                <>
                  {editingTabTitleId === tab.id ? (
                    <input
                      type="text"
                      value={editingTabTitleVal}
                      onChange={(e) => setEditingTabTitleVal(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          saveTabTitle(tab.id);
                        } else if (e.key === 'Escape') {
                          setEditingTabTitleId(null);
                        }
                      }}
                      onBlur={() => saveTabTitle(tab.id)}
                      onClick={(e) => e.stopPropagation()}
                      className="bg-black/10 text-[10px] text-current rounded px-1 py-0.5 outline-none font-medium flex-1 w-full animate-pulse"
                      autoFocus
                    />
                  ) : (
                    <span className="text-[10px] truncate flex-1 font-semibold">
                      {tabTitle}
                    </span>
                  )}
                </>
              )}

              {/* Mute indicator */}
              {!isPinned && isMuted && (
                <span className="text-[8px] bg-red-500/10 text-red-500 font-mono scale-90 px-0.5 rounded shrink-0" title="Muted">MUTED</span>
              )}

              {/* Tab menu trigger (Three dots) */}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  const rect = e.currentTarget.getBoundingClientRect();
                  setTabMenuAnchor({ x: rect.left, y: rect.bottom, tabId: tab.id });
                }}
                className="p-0.5 hover:bg-black/10 rounded transition-colors opacity-0 group-hover:opacity-100 shrink-0 cursor-pointer hidden sm:block"
                title="Tab Actions"
              >
                <MoreVertical size={11} />
              </button>

              {/* Close tab button */}
              {!isPinned && tabs.length > 1 && (
                <button 
                  onClick={(e) => {
                    e.stopPropagation();
                    closeTab(null, tab.id);
                  }}
                  className="p-0.5 hover:bg-slate-200/40 rounded-full transition-colors opacity-0 group-hover:opacity-100 shrink-0"
                >
                  <X size={10} />
                </button>
              )}

              {/* Active Tab bottom highlight indicator */}
              {isActive && <div className="absolute bottom-0 left-0 right-0 h-[1.5px] bg-blue-500 translate-y-[1px]" />}
            </div>
          );
        })}

        {/* Add Tab Button */}
        <button 
          onClick={addTab}
          className="p-1.5 hover:bg-black/5 rounded-full transition-colors text-slate-600 ml-1 cursor-pointer shrink-0"
          title="Open a new tab"
        >
          <Plus size={14} />
        </button>
      </div>

      {/* Toolbar */}
      <div className={cn("h-12 flex items-center px-4 gap-4 border-b transition-all", themeStyles.toolbar)}>
        <div className="flex gap-1">
          <button className="p-2 hover:bg-black/5 rounded-full transition-colors text-slate-400">
            <ChevronLeft size={16} />
          </button>
          <button className="p-2 hover:bg-black/5 rounded-full transition-colors text-slate-400">
            <ChevronRight size={16} />
          </button>
          <button onClick={() => handleGo()} className="p-2 hover:bg-black/5 rounded-full transition-colors text-slate-600">
            <RefreshCw size={16} />
          </button>
        </div>

        <div className="flex-1 flex gap-2">
          <form onSubmit={handleGo} className="flex-1 relative group">
            <div className="absolute left-3 top-1/2 -translate-y-1/2 flex items-center gap-2">
              <Lock size={12} className={cn(isSecureMode ? "text-green-500" : "text-slate-300")} />
            </div>
            <input 
              id="browser-url-input"
              className={cn("w-full border border-transparent rounded-full pl-8 pr-10 py-1.5 text-xs focus:outline-none focus:ring-2 focus:ring-blue-400 focus:bg-white focus:border-transparent transition-all", themeStyles.inputBg)}
              value={urlInput}
              onChange={(e) => setUrlInput(e.target.value)}
              placeholder="Search or enter URL"
            />
            <button 
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                handleStarClick();
              }}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-amber-400 transition-colors cursor-pointer"
              title="Bookmark this page"
            >
              <Star size={14} className={isBookmarked ? "text-amber-400 fill-amber-400" : "text-slate-400"} />
            </button>
          </form>
        </div>

        <div className="flex gap-1">
          <button 
            onClick={() => setIsSecureMode(!isSecureMode)}
            className={cn(
              "p-2 rounded-full transition-all cursor-pointer",
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
              "p-2 rounded-full transition-all cursor-pointer",
              view === 'composer' ? "bg-blue-500/10 text-blue-600" : "text-slate-400 hover:bg-slate-100"
            )}
            title="HTML Composer"
          >
            <Code2 size={16} />
          </button>
          <button 
            onClick={() => setShowHistory(!showHistory)}
            className={cn(
              "p-2 rounded-full transition-all cursor-pointer",
              showHistory ? "bg-blue-500/10 text-blue-600" : "text-slate-400 hover:bg-slate-100"
            )}
            title="History"
          >
            <Clock size={16} />
          </button>
        </div>
      </div>

      {/* Bookmarks Bar */}
      <div className={cn("h-9 flex items-center px-4 gap-2 border-b select-none transition-all text-xs z-20 shrink-0", themeStyles.bookmarksBar)}>
        {/* Star Icon for list / Bookmarks text */}
        <div className="flex items-center gap-1.5 opacity-60 mr-2 border-r pr-3 border-current/10 shrink-0 font-medium">
          <Star size={12} className="text-amber-500 fill-amber-500" />
          <span className="uppercase text-[9px] tracking-wider font-semibold">Bookmarks</span>
        </div>

        {/* Scrollable Bookmarks List */}
        <div className="flex-1 flex items-center gap-1 overflow-x-auto no-scrollbar py-0.5">
          {bookmarks.length === 0 ? (
            <span className="text-[10px] opacity-40 italic">No bookmarks yet. Click the star in the address bar to add some!</span>
          ) : (
            bookmarks.map(b => {
              // Custom icon depending on URL
              let bIcon = <Globe size={11} className="text-blue-500 shrink-0" />;
              if (b.url.startsWith('local://')) {
                bIcon = <Monitor size={11} className="text-teal-500 shrink-0" />;
              } else if (b.url.includes('github.com')) {
                bIcon = <Code2 size={11} className="text-purple-500 shrink-0" />;
              }

              return (
                <button
                  key={b.id}
                  onClick={() => {
                    const localContent = getLocalPageContent(b.url);
                    setTabs(prev => prev.map(t => t.id === activeTabId ? { ...t, url: b.url, localContent } : t));
                    setUrlInput(b.url);
                    addNotification('Browser', `Opening bookmark: ${b.title}`, 'info');
                  }}
                  className={cn("px-2 py-1 rounded-lg flex items-center gap-1.5 transition-all text-left max-w-[140px] truncate cursor-pointer shrink-0", themeStyles.bookmarksBtn)}
                  title={`${b.title} (${b.url})`}
                >
                  {bIcon}
                  <span className="truncate font-medium text-[11px]">{b.title}</span>
                </button>
              );
            })
          )}
        </div>

        {/* Manage Bookmarks Button */}
        <button
          onClick={() => setShowBookmarksManager(true)}
          className={cn("px-2 py-1 rounded-lg flex items-center gap-1 cursor-pointer transition-all border border-current/10 shrink-0 text-[10px] font-semibold uppercase tracking-wider", themeStyles.bookmarksBtn)}
        >
          <SettingsIcon size={10} />
          <span>Manage</span>
        </button>
      </div>

      {/* Quick Bookmark Added Popover */}
      <AnimatePresence>
        {showBookmarkPopup && (
          <motion.div 
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="absolute right-4 top-24 w-72 bg-white rounded-2xl shadow-2xl border border-slate-200 p-4 z-50 text-slate-800 flex flex-col gap-3"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-1 border-b border-slate-100">
              <h4 className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                <Star size={12} className="text-amber-500 fill-amber-500 animate-pulse" />
                <span>Bookmark Details</span>
              </h4>
              <button 
                onClick={() => setShowBookmarkPopup(false)}
                className="text-slate-400 hover:text-slate-600 cursor-pointer p-0.5 hover:bg-slate-100 rounded"
              >
                <X size={12} />
              </button>
            </div>
            <div className="flex flex-col gap-2">
              <div className="flex flex-col gap-1">
                <label className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">Name</label>
                <input 
                  type="text" 
                  value={editingBookmarkName}
                  onChange={(e) => setEditingBookmarkName(e.target.value)}
                  className="bg-slate-50 border border-slate-200 rounded-lg p-2 text-xs focus:outline-none focus:ring-1 focus:ring-blue-400 focus:bg-white transition-all"
                />
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">URL</label>
                <input 
                  type="text" 
                  value={editingBookmarkUrl}
                  onChange={(e) => setEditingBookmarkUrl(e.target.value)}
                  className="bg-slate-50 border border-slate-200 rounded-lg p-2 text-xs focus:outline-none focus:ring-1 focus:ring-blue-400 focus:bg-white transition-all font-mono"
                />
              </div>
            </div>
            <div className="flex items-center justify-between pt-2 border-t border-slate-100 gap-2">
              <button 
                onClick={() => {
                  if (editingBookmarkId) {
                    setBookmarks(prev => prev.filter(b => b.id !== editingBookmarkId));
                    addNotification('Browser', 'Bookmark removed', 'info');
                  }
                  setShowBookmarkPopup(false);
                }}
                className="px-3 py-1.5 bg-red-50 hover:bg-red-100 border border-red-100 text-red-600 rounded-lg text-[10px] font-bold transition-all cursor-pointer"
              >
                Remove
              </button>
              <div className="flex gap-1.5">
                <button 
                  onClick={() => setShowBookmarkPopup(false)}
                  className="px-3 py-1.5 hover:bg-slate-100 border border-slate-200 text-slate-600 rounded-lg text-[10px] font-bold transition-all cursor-pointer"
                >
                  Done
                </button>
                <button 
                  onClick={() => {
                    setBookmarks(prev => prev.map(b => b.id === editingBookmarkId ? { ...b, title: editingBookmarkName, url: editingBookmarkUrl } : b));
                    addNotification('Browser', 'Bookmark details updated', 'success');
                    setShowBookmarkPopup(false);
                  }}
                  className="px-3 py-1.5 bg-blue-500 hover:bg-blue-600 text-white rounded-lg text-[10px] font-bold transition-all cursor-pointer shadow-md shadow-blue-500/10"
                >
                  Save
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

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
                  className="px-3 py-1 bg-blue-500 hover:bg-blue-600 rounded text-[10px] font-bold text-white transition-all flex items-center gap-2 cursor-pointer"
                >
                  <Save size={12} />
                  Save Changes
                </button>
                <button 
                  onClick={() => setView('browser')}
                  className="p-1 hover:bg-white/10 rounded-lg text-white/40 hover:text-white cursor-pointer"
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
                  className="px-2 py-0.5 rounded hover:bg-white/10 text-[9px] text-white/40 hover:text-white transition-all font-mono cursor-pointer"
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
                    id="composer-textarea"
                    value={composerContent}
                    onChange={(e) => setComposerContent(e.target.value)}
                    className="flex-1 w-full bg-slate-900 text-slate-300 p-4 font-mono text-xs focus:outline-none border-none resize-none no-scrollbar composer"
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
                <button onClick={() => setShowHistory(false)} className="text-slate-400 hover:text-slate-600 cursor-pointer">
                  <X size={14} />
                </button>
              </div>
              <div className="flex-1 overflow-y-auto p-2 space-y-1">
                {history.map((h, i) => (
                  <button 
                    key={i}
                    onClick={() => setUrlInput(h)}
                    className="w-full text-left p-2 rounded hover:bg-slate-100 transition-all group cursor-pointer"
                  >
                    <div className="text-[10px] text-slate-800 truncate font-medium">{h}</div>
                  </button>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Open File Dialog */}
      <AnimatePresence>
        {showOpenFile && (
          <FilePicker 
            title="Open Web File"
            fs={fs}
            fsLib={fsLib}
            mode="open"
            allowedExtensions={['html', 'htm', 'txt']}
            onCancel={() => setShowOpenFile(false)}
            onSelect={(path, item) => {
              try {
                const content = fsLib.read(path);
                if (content) {
                  const fileName = path.split('/').pop() || '';
                  if (path.startsWith('GlassDrive/webpages/') || path.startsWith('/GlassDrive/webpages/')) {
                    const cleanName = path.replace(/^\/?GlassDrive\/webpages\//, '');
                    setTabs(prev => prev.map(t => t.id === activeTabId ? { ...t, url: `local://${cleanName}`, localContent: content } : t));
                    setUrlInput(`local://${cleanName}`);
                  } else {
                    setTabs(prev => prev.map(t => t.id === activeTabId ? { ...t, url: path, localContent: content } : t));
                    setUrlInput(path);
                  }
                  addNotification('Browser', `Opened ${fileName} successfully`, 'success');
                } else {
                  addNotification('Browser', `File ${path} is empty or could not be read`, 'warning');
                }
              } catch (err) {
                addNotification('Browser', 'Error reading file', 'error');
              }
              setShowOpenFile(false);
            }}
          />
        )}
      </AnimatePresence>

      {/* Preferences Modal */}
      <AnimatePresence>
        {showPreferences && (
          <div className="absolute inset-0 z-[60] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }} 
              animate={{ opacity: 1 }} 
              exit={{ opacity: 0 }} 
              onClick={() => setShowPreferences(false)} 
              className="absolute inset-0 bg-black/50 backdrop-blur-sm" 
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }} 
              animate={{ opacity: 1, scale: 1 }} 
              exit={{ opacity: 0, scale: 0.95 }} 
              className="relative w-full max-w-md bg-white border border-slate-200 shadow-2xl rounded-3xl overflow-hidden flex flex-col text-slate-800"
            >
              {/* Header */}
              <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50">
                <h3 className="text-xs font-bold uppercase tracking-wider flex items-center gap-2 text-slate-700">
                  <SettingsIcon size={14} className="text-blue-500" />
                  <span>Browser Preferences</span>
                </h3>
                <button 
                  onClick={() => setShowPreferences(false)} 
                  className="text-slate-400 hover:text-slate-600 transition-colors p-1 rounded-lg hover:bg-slate-100 cursor-pointer"
                >
                  <X size={14} />
                </button>
              </div>

              {/* Content */}
              <div className="p-6 flex flex-col gap-4 text-xs">
                {/* Search Engine */}
                <div className="flex flex-col gap-1.5">
                  <label className="font-bold text-slate-500 uppercase text-[9px] tracking-wider">Default Search Engine</label>
                  <select 
                    value={defaultSearchEngine} 
                    onChange={(e) => setDefaultSearchEngine(e.target.value as any)}
                    className="bg-slate-50 border border-slate-200 rounded-lg p-2 focus:outline-none focus:ring-1 focus:ring-blue-400 focus:bg-white transition-all text-xs"
                  >
                    <option value="google">Google Search (with iframe isolation override)</option>
                    <option value="bing">Microsoft Bing</option>
                    <option value="duckduckgo">DuckDuckGo (Privacy Focused)</option>
                  </select>
                </div>

                {/* Homepage */}
                <div className="flex flex-col gap-1.5">
                  <label className="font-bold text-slate-500 uppercase text-[9px] tracking-wider">Default Home Page</label>
                  <input 
                    type="text" 
                    value={defaultHomePage}
                    onChange={(e) => setDefaultHomePage(e.target.value)}
                    className="bg-slate-50 border border-slate-200 rounded-lg p-2 focus:outline-none focus:ring-1 focus:ring-blue-400 focus:bg-white transition-all text-xs font-mono"
                    placeholder="local://home.html"
                  />
                </div>

                {/* Security settings */}
                <div className="flex flex-col gap-2.5 mt-2">
                  <label className="font-bold text-slate-500 uppercase text-[9px] tracking-wider border-b border-slate-100 pb-1">Security & Content</label>
                  <label className="flex items-center justify-between cursor-pointer py-0.5">
                    <span className="text-slate-600">Force HTTPS Secure Mode</span>
                    <input 
                      type="checkbox" 
                      checked={isSecureMode}
                      onChange={(e) => setIsSecureMode(e.target.checked)}
                      className="rounded border-slate-300 text-blue-500 focus:ring-blue-400 w-4 h-4 cursor-pointer"
                    />
                  </label>
                  <label className="flex items-center justify-between cursor-pointer py-0.5">
                    <span className="text-slate-600">Enable Sandbox Block Popups</span>
                    <input 
                      type="checkbox" 
                      defaultChecked={true}
                      className="rounded border-slate-300 text-blue-500 focus:ring-blue-400 w-4 h-4 cursor-pointer"
                      disabled
                    />
                  </label>
                </div>
              </div>

              {/* Footer */}
              <div className="p-4 bg-slate-50 border-t border-slate-100 flex justify-end gap-2">
                <button 
                  onClick={() => setShowPreferences(false)} 
                  className="px-4 py-1.5 hover:bg-slate-100 border border-slate-200 rounded-xl text-xs font-semibold text-slate-600 transition-all cursor-pointer"
                >
                  Close
                </button>
                <button 
                  onClick={() => {
                    setShowPreferences(false);
                    addNotification('Browser', 'Preferences saved successfully', 'success');
                  }} 
                  className="px-5 py-1.5 bg-blue-500 hover:bg-blue-600 rounded-xl text-xs font-semibold text-white transition-all shadow-lg shadow-blue-500/20 cursor-pointer"
                >
                  Save Changes
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Bookmarks Manager Modal */}
      <AnimatePresence>
        {showBookmarksManager && (
          <div className="absolute inset-0 z-[60] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }} 
              animate={{ opacity: 1 }} 
              exit={{ opacity: 0 }} 
              onClick={() => setShowBookmarksManager(false)} 
              className="absolute inset-0 bg-black/60 backdrop-blur-sm" 
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 15 }} 
              animate={{ opacity: 1, scale: 1, y: 0 }} 
              exit={{ opacity: 0, scale: 0.95, y: 15 }} 
              className="relative w-full max-w-2xl h-[480px] bg-slate-900 border border-white/10 shadow-2xl rounded-3xl overflow-hidden flex flex-col text-slate-100 z-[61]"
            >
              {/* Header */}
              <div className="p-4 bg-slate-950/80 border-b border-white/5 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Star size={16} className="text-amber-400 fill-amber-400" />
                  <span className="text-xs font-bold uppercase tracking-wider font-mono text-slate-300">Bookmarks Manager</span>
                </div>
                <button 
                  onClick={() => setShowBookmarksManager(false)} 
                  className="text-slate-400 hover:text-white transition-colors p-1 rounded-lg hover:bg-white/5 cursor-pointer"
                >
                  <X size={16} />
                </button>
              </div>

              {/* Main Content Split Area */}
              <div className="flex-1 flex overflow-hidden">
                {/* Left Panel: Form & Actions */}
                <div className="w-1/3 border-r border-white/5 p-4 flex flex-col gap-4 bg-slate-950/30">
                  <div className="flex flex-col gap-1">
                    <h4 className="text-xs font-bold text-slate-300 font-mono">Add Bookmark</h4>
                    <p className="text-[10px] text-slate-500">Add a custom shortcut manually.</p>
                  </div>

                  <form 
                    onSubmit={(e) => {
                      e.preventDefault();
                      const form = e.currentTarget;
                      const title = (form.elements.namedItem('bTitle') as HTMLInputElement).value.trim();
                      const url = (form.elements.namedItem('bUrl') as HTMLInputElement).value.trim();
                      if (!title || !url) {
                        addNotification('Bookmarks', 'Title and URL are required', 'error');
                        return;
                      }
                      
                      const newB = {
                        id: Math.random().toString(36).substr(2, 9),
                        title,
                        url: url.startsWith('http') || url.startsWith('local://') ? url : 'https://' + url
                      };
                      setBookmarks(prev => [newB, ...prev]);
                      form.reset();
                      addNotification('Bookmarks', `Added "${title}"`, 'success');
                    }}
                    className="flex flex-col gap-3"
                  >
                    <div className="flex flex-col gap-1">
                      <label className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">Title</label>
                      <input 
                        name="bTitle"
                        type="text" 
                        placeholder="e.g. Google"
                        required
                        className="bg-slate-900 border border-white/10 rounded-lg p-2 text-xs focus:outline-none focus:ring-1 focus:ring-blue-500 text-slate-200"
                      />
                    </div>
                    <div className="flex flex-col gap-1">
                      <label className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">URL</label>
                      <input 
                        name="bUrl"
                        type="text" 
                        placeholder="e.g. google.com"
                        required
                        className="bg-slate-900 border border-white/10 rounded-lg p-2 text-xs focus:outline-none focus:ring-1 focus:ring-blue-500 text-slate-200 font-mono"
                      />
                    </div>
                    <button 
                      type="submit"
                      className="mt-1 w-full bg-blue-500 hover:bg-blue-600 text-white rounded-lg py-2 text-xs font-bold transition-all cursor-pointer shadow-md shadow-blue-500/10 flex items-center justify-center gap-1"
                    >
                      <Plus size={12} />
                      <span>Create Bookmark</span>
                    </button>
                  </form>

                  <div className="mt-auto pt-4 border-t border-white/5 flex flex-col gap-2">
                    <button 
                      onClick={() => {
                        try {
                          const content = JSON.stringify(bookmarks, null, 2);
                          fsLib.write('/GlassDrive/bookmarks_export.json', content);
                          
                          // Also prompt native file download in browser
                          const blob = new Blob([content], { type: 'application/json' });
                          const url = URL.createObjectURL(blob);
                          const a = document.createElement('a');
                          a.href = url;
                          a.download = 'bookmarks.json';
                          a.click();
                          URL.revokeObjectURL(url);

                          addNotification('Bookmarks', 'Exported bookmarks to GlassDrive/bookmarks_export.json and downloaded successfully', 'success');
                        } catch (err) {
                          addNotification('Bookmarks', 'Export failed', 'error');
                        }
                      }}
                      className="w-full py-1.5 hover:bg-white/5 border border-white/10 rounded-lg text-slate-300 hover:text-white text-[10px] font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5"
                    >
                      <Download size={11} />
                      <span>Export (JSON)</span>
                    </button>
                    
                    <button 
                      onClick={() => {
                        if (confirm("Are you sure you want to clear all bookmarks? This cannot be undone.")) {
                          setBookmarks([]);
                          addNotification('Bookmarks', 'Cleared all bookmarks', 'info');
                        }
                      }}
                      className="w-full py-1.5 hover:bg-red-950/20 hover:text-red-400 border border-red-500/10 rounded-lg text-slate-400 text-[10px] font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5"
                    >
                      <Trash2 size={11} />
                      <span>Clear All</span>
                    </button>
                  </div>
                </div>

                {/* Right Panel: Scrollable Bookmark List & Search */}
                <div className="flex-1 flex flex-col p-4 gap-3">
                  {/* Search Bar */}
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={13} />
                    <input 
                      type="text" 
                      placeholder="Search bookmarks by title or URL..." 
                      value={bookmarksSearchQuery}
                      onChange={(e) => setBookmarksSearchQuery(e.target.value)}
                      className="w-full bg-slate-950 border border-white/10 rounded-xl pl-9 pr-4 py-2 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/20 transition-all font-mono"
                    />
                    {bookmarksSearchQuery && (
                      <button 
                        onClick={() => setBookmarksSearchQuery('')}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
                      >
                        <X size={12} />
                      </button>
                    )}
                  </div>

                  {/* Bookmark Grid / List */}
                  <div className="flex-1 overflow-y-auto pr-1 space-y-2 no-scrollbar">
                    {(() => {
                      const filtered = bookmarks.filter(b => 
                        b.title.toLowerCase().includes(bookmarksSearchQuery.toLowerCase()) ||
                        b.url.toLowerCase().includes(bookmarksSearchQuery.toLowerCase())
                      );

                      if (filtered.length === 0) {
                        return (
                          <div className="h-full flex flex-col items-center justify-center text-center p-8 border border-dashed border-white/5 rounded-2xl bg-slate-950/10">
                            <Star size={24} className="text-slate-600 mb-2" />
                            <p className="text-xs font-semibold text-slate-400">No bookmarks found</p>
                            <p className="text-[10px] text-slate-600 mt-1">Try another search or add a bookmark manually.</p>
                          </div>
                        );
                      }

                      return filtered.map(b => (
                        <div 
                          key={b.id} 
                          className="flex items-center justify-between p-3 rounded-xl border border-white/5 bg-slate-950/20 hover:bg-slate-950/50 hover:border-white/10 transition-all gap-4 group"
                        >
                          <div className="flex items-center gap-3 min-w-0 flex-1">
                            <div className="p-2 rounded-lg bg-slate-900 border border-white/5 shrink-0">
                              {b.url.startsWith('local://') ? (
                                <Monitor size={14} className="text-teal-400" />
                              ) : b.url.includes('github.com') ? (
                                <Code2 size={14} className="text-purple-400" />
                              ) : (
                                <Globe size={14} className="text-blue-400" />
                              )}
                            </div>
                            <div className="min-w-0 flex-1 flex flex-col">
                              <input 
                                type="text"
                                value={b.title}
                                onChange={(e) => {
                                  const newTitle = e.target.value;
                                  setBookmarks(prev => prev.map(item => item.id === b.id ? { ...item, title: newTitle } : item));
                                }}
                                className="bg-transparent border-none text-xs font-bold text-slate-200 focus:outline-none focus:ring-1 focus:ring-blue-500/50 rounded px-1 -ml-1 w-full"
                              />
                              <input 
                                type="text"
                                value={b.url}
                                onChange={(e) => {
                                  const newUrl = e.target.value;
                                  setBookmarks(prev => prev.map(item => item.id === b.id ? { ...item, url: newUrl } : item));
                                }}
                                className="bg-transparent border-none text-[10px] font-mono text-slate-500 focus:outline-none focus:ring-1 focus:ring-blue-500/50 rounded px-1 -ml-1 w-full truncate mt-0.5"
                              />
                            </div>
                          </div>

                          <div className="flex items-center gap-1 shrink-0">
                            <button 
                              onClick={() => {
                                const localContent = getLocalPageContent(b.url);
                                setTabs(prev => prev.map(t => t.id === activeTabId ? { ...t, url: b.url, localContent } : t));
                                setUrlInput(b.url);
                                setShowBookmarksManager(false);
                                addNotification('Browser', `Navigated to ${b.title}`, 'info');
                              }}
                              className="p-1.5 hover:bg-blue-500/20 text-slate-400 hover:text-blue-400 rounded-lg transition-all cursor-pointer"
                              title="Go to Bookmarked URL"
                            >
                              <ArrowUpRight size={14} />
                            </button>
                            <button 
                              onClick={() => {
                                setBookmarks(prev => prev.filter(item => item.id !== b.id));
                                addNotification('Bookmarks', `Removed "${b.title}"`, 'info');
                              }}
                              className="p-1.5 hover:bg-red-500/20 text-slate-400 hover:text-red-400 rounded-lg transition-all cursor-pointer"
                              title="Delete Bookmark"
                            >
                              <Trash size={14} />
                            </button>
                          </div>
                        </div>
                      ));
                    })()}
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Tab Switcher / Advanced Tab Manager Modal */}
      <AnimatePresence>
        {showTabSwitcher && (
          <div className="absolute inset-0 z-[60] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }} 
              animate={{ opacity: 1 }} 
              exit={{ opacity: 0 }} 
              onClick={() => setShowTabSwitcher(false)} 
              className="absolute inset-0 bg-black/70 backdrop-blur-sm" 
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 15 }} 
              animate={{ opacity: 1, scale: 1, y: 0 }} 
              exit={{ opacity: 0, scale: 0.95, y: 15 }} 
              className="relative w-full max-w-3xl h-[520px] bg-slate-900 border border-white/10 shadow-2xl rounded-3xl overflow-hidden flex flex-col text-slate-100 z-[61]"
            >
              {/* Header */}
              <div className="p-4 bg-slate-950/80 border-b border-white/5 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Layers size={16} className="text-blue-400" />
                  <span className="text-xs font-bold uppercase tracking-wider font-mono text-slate-300">Tab Switcher & Manager</span>
                </div>
                <button 
                  onClick={() => setShowTabSwitcher(false)} 
                  className="text-slate-400 hover:text-white transition-colors p-1 rounded-lg hover:bg-white/5 cursor-pointer"
                >
                  <X size={16} />
                </button>
              </div>

              {/* Search Bar */}
              <div className="p-4 bg-slate-950/30 border-b border-white/5">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={14} />
                  <input 
                    type="text" 
                    placeholder="Search active tabs by name, URL, or group..." 
                    value={tabSwitcherSearch}
                    onChange={(e) => setTabSwitcherSearch(e.target.value)}
                    className="w-full bg-slate-950 border border-white/10 rounded-xl pl-9 pr-10 py-2.5 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/20 transition-all font-mono"
                  />
                  {tabSwitcherSearch && (
                    <button 
                      onClick={() => setTabSwitcherSearch('')}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
                    >
                      <X size={14} />
                    </button>
                  )}
                </div>
              </div>

              {/* Main Area Split */}
              <div className="flex-1 flex overflow-hidden">
                {/* Left Panel: Active Tabs List */}
                <div className="w-3/5 border-r border-white/5 flex flex-col">
                  <div className="px-4 py-2 bg-slate-950/45 border-b border-white/5 flex items-center justify-between">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Active Tabs ({tabs.length})</span>
                    <button 
                      onClick={() => {
                        addTab();
                        setShowTabSwitcher(false);
                      }}
                      className="text-[10px] text-blue-400 hover:text-blue-300 flex items-center gap-1 font-bold cursor-pointer"
                    >
                      <Plus size={10} />
                      <span>New Tab</span>
                    </button>
                  </div>
                  
                  <div className="flex-1 overflow-y-auto p-4 space-y-2 no-scrollbar">
                    {(() => {
                      const filtered = tabs.filter(t => {
                        const title = getTabDisplayTitle(t).toLowerCase();
                        const url = t.url.toLowerCase();
                        const group = tabGroups.find(g => g.id === t.groupId)?.name.toLowerCase() || '';
                        const query = tabSwitcherSearch.toLowerCase();
                        return title.includes(query) || url.includes(query) || group.includes(query);
                      });

                      if (filtered.length === 0) {
                        return (
                          <div className="h-full flex flex-col items-center justify-center text-center p-8">
                            <Layers size={24} className="text-slate-600 mb-2" />
                            <p className="text-xs font-semibold text-slate-400">No active tabs match search</p>
                          </div>
                        );
                      }

                      return filtered.map(t => {
                        const g = tabGroups.find(group => group.id === t.groupId);
                        return (
                          <div 
                            key={t.id}
                            className={cn(
                              "flex items-center justify-between p-2.5 rounded-xl border transition-all gap-4 group cursor-pointer",
                              activeTabId === t.id 
                                ? "bg-blue-500/10 border-blue-500/30 hover:bg-blue-500/15" 
                                : "bg-slate-950/20 border-white/5 hover:bg-slate-950/40 hover:border-white/10"
                            )}
                            onClick={() => {
                              setActiveTabId(t.id);
                              setShowTabSwitcher(false);
                            }}
                          >
                            <div className="flex items-center gap-2.5 min-w-0 flex-1">
                              <div className="p-2 rounded-lg bg-slate-900 border border-white/5 shrink-0 relative">
                                {t.pinned ? (
                                  <Pin size={13} className="text-amber-400 fill-amber-400" />
                                ) : t.url.startsWith('local://') ? (
                                  <Monitor size={13} className="text-teal-400" />
                                ) : (
                                  <Globe size={13} className="text-blue-400" />
                                )}
                              </div>
                              
                              <div className="min-w-0 flex-1 flex flex-col">
                                <div className="flex items-center gap-1.5">
                                  <span className="text-xs font-bold text-slate-200 truncate">{getTabDisplayTitle(t)}</span>
                                  {g && (
                                    <span 
                                      className="px-1 py-0.2 rounded text-[8px] font-extrabold uppercase tracking-wider shrink-0"
                                      style={{ backgroundColor: `${getGroupColorHex(g.color)}15`, color: getGroupColorHex(g.color), border: `1px solid ${getGroupColorHex(g.color)}25` }}
                                    >
                                      {g.name}
                                    </span>
                                  )}
                                  {t.isMuted && (
                                    <span className="text-red-400 text-[8px] border border-red-500/20 px-1 py-0.2 rounded font-mono uppercase tracking-wider shrink-0">MUTED</span>
                                  )}
                                </div>
                                <span className="text-[10px] font-mono text-slate-500 truncate mt-0.5">{t.url}</span>
                              </div>
                            </div>

                            <div className="flex items-center gap-1 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setTabs(prev => prev.map(tab => tab.id === t.id ? { ...tab, pinned: !tab.pinned } : tab));
                                }}
                                className="p-1 hover:bg-white/5 rounded-lg text-slate-400 hover:text-amber-400 transition-colors cursor-pointer"
                                title={t.pinned ? "Unpin Tab" : "Pin Tab"}
                              >
                                {t.pinned ? <PinOff size={12} /> : <Pin size={12} />}
                              </button>
                              {tabs.length > 1 && (
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    closeTab(null, t.id);
                                  }}
                                  className="p-1 hover:bg-red-500/20 rounded-lg text-slate-400 hover:text-red-400 transition-colors cursor-pointer"
                                  title="Close Tab"
                                >
                                  <X size={12} />
                                </button>
                              )}
                            </div>
                          </div>
                        );
                      });
                    })()}
                  </div>
                </div>

                {/* Right Panel: Tab Groups & Recently Closed */}
                <div className="w-2/5 flex flex-col bg-slate-950/20">
                  {/* Section 1: Recently Closed */}
                  <div className="flex-1 flex flex-col border-b border-white/5">
                    <div className="px-4 py-2 bg-slate-950/45 border-b border-white/5 flex items-center justify-between">
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Recently Closed</span>
                      {recentlyClosed.length > 0 && (
                        <button 
                          onClick={() => {
                            setRecentlyClosed([]);
                            addNotification('Browser', 'Cleared recently closed history', 'info');
                          }}
                          className="text-[9px] text-slate-500 hover:text-red-400 font-bold uppercase tracking-wider cursor-pointer"
                        >
                          Clear
                        </button>
                      )}
                    </div>

                    <div className="flex-1 overflow-y-auto p-4 space-y-1.5 no-scrollbar">
                      {recentlyClosed.length === 0 ? (
                        <div className="h-full flex flex-col items-center justify-center text-center p-4">
                          <Undo size={16} className="text-slate-700 mb-1" />
                          <p className="text-[10px] text-slate-500 italic">No recently closed tabs.</p>
                        </div>
                      ) : (
                        recentlyClosed.map((rc, idx) => (
                          <div 
                            key={idx}
                            onClick={() => {
                              setTabs(prev => [...prev, { id: Math.random().toString(36).substr(2, 9), url: rc.url, title: rc.title, localContent: rc.localContent }]);
                              setRecentlyClosed(prev => prev.filter((_, i) => i !== idx));
                              addNotification('Browser', `Restored tab: ${rc.title || rc.url}`, 'success');
                            }}
                            className="flex items-center justify-between p-2 rounded-lg bg-slate-950/30 border border-white/5 hover:bg-slate-950/50 hover:border-white/10 cursor-pointer transition-all gap-3 group text-left"
                            title="Click to Restore Tab"
                          >
                            <div className="min-w-0 flex-1 flex flex-col">
                              <span className="text-xs font-semibold text-slate-300 truncate">{rc.title || rc.url}</span>
                              <span className="text-[9px] font-mono text-slate-600 truncate mt-0.5">{rc.url}</span>
                            </div>
                            <button className="p-1 rounded bg-white/5 text-slate-400 hover:text-blue-400 opacity-0 group-hover:opacity-100 transition-all shrink-0">
                              <RefreshCw size={10} />
                            </button>
                          </div>
                        ))
                      )}
                    </div>
                  </div>

                  {/* Section 2: Tab Groups Manager */}
                  <div className="flex-1 flex flex-col">
                    <div className="px-4 py-2 bg-slate-950/45 border-b border-white/5 flex flex-col gap-1">
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Tab Groups Manager</span>
                    </div>

                    <div className="flex-1 overflow-y-auto p-4 space-y-2 no-scrollbar">
                      <form 
                        onSubmit={(e) => {
                          e.preventDefault();
                          if (!newGroupName.trim()) return;
                          const colors = ['blue', 'pink', 'green', 'purple', 'amber', 'red', 'teal'];
                          const randomColor = colors[Math.floor(Math.random() * colors.length)];
                          const newG = {
                            id: Math.random().toString(36).substr(2, 9),
                            name: newGroupName.trim(),
                            color: newGroupColor || randomColor
                          };
                          setTabGroups(prev => [...prev, newG]);
                          setNewGroupName('');
                          addNotification('Browser', `Created tab group "${newG.name}"`, 'success');
                        }}
                        className="flex gap-1.5 mb-3"
                      >
                        <input 
                          type="text" 
                          placeholder="Create group..."
                          value={newGroupName}
                          onChange={(e) => setNewGroupName(e.target.value)}
                          className="flex-1 bg-slate-950 border border-white/10 rounded-lg px-2.5 py-1 text-xs text-slate-200 placeholder-slate-600 focus:outline-none focus:border-blue-500/50"
                        />
                        <select 
                          value={newGroupColor}
                          onChange={(e) => setNewGroupColor(e.target.value)}
                          className="bg-slate-950 border border-white/10 rounded-lg px-1.5 text-xs text-slate-300 focus:outline-none"
                        >
                          <option value="blue">Blue</option>
                          <option value="pink">Pink</option>
                          <option value="green">Green</option>
                          <option value="purple">Purple</option>
                          <option value="amber">Amber</option>
                          <option value="red">Red</option>
                          <option value="teal">Teal</option>
                        </select>
                        <button 
                          type="submit"
                          className="bg-blue-500 hover:bg-blue-600 text-white rounded-lg px-2.5 text-xs font-bold transition-all cursor-pointer flex items-center justify-center"
                        >
                          <Plus size={12} />
                        </button>
                      </form>

                      <div className="space-y-1.5">
                        {tabGroups.map(g => {
                          const tabCount = tabs.filter(t => t.groupId === g.id).length;
                          return (
                            <div 
                              key={g.id}
                              className="flex items-center justify-between p-2 rounded-lg bg-slate-950/20 border border-white/5 hover:bg-slate-950/35 transition-all gap-3"
                            >
                              <div className="flex items-center gap-2 min-w-0">
                                <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: getGroupColorHex(g.color) }} />
                                <span className="text-xs font-bold text-slate-300 truncate">{g.name}</span>
                                <span className="text-[9px] font-mono text-slate-500 font-bold bg-white/5 border border-white/5 px-1 py-0.2 rounded-md shrink-0">
                                  {tabCount} tab{tabCount !== 1 ? 's' : ''}
                                </span>
                              </div>
                              
                              <button 
                                onClick={() => {
                                  setTabGroups(prev => prev.filter(item => item.id !== g.id));
                                  setTabs(prev => prev.map(t => t.groupId === g.id ? { ...t, groupId: undefined } : t));
                                  addNotification('Browser', `Deleted tab group "${g.name}"`, 'info');
                                }}
                                className="p-1 hover:bg-red-500/20 rounded text-slate-500 hover:text-red-400 transition-colors cursor-pointer"
                                title="Delete Group"
                              >
                                <Trash size={10} />
                              </button>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Floating Tab Context Menu */}
      {tabMenuAnchor && (
        <>
          <div 
            className="absolute inset-0 z-40 cursor-default" 
            onClick={() => setTabMenuAnchor(null)}
            onContextMenu={(e) => { e.preventDefault(); setTabMenuAnchor(null); }}
          />
          <div 
            className={cn("absolute z-50 w-52 border rounded-xl shadow-2xl py-1 flex flex-col backdrop-blur-md text-xs", themeStyles.menuDropdown)}
            style={{ left: `${Math.min(tabMenuAnchor.x, 800 - 220)}px`, top: `40px` }}
          >
            {(() => {
              const tab = tabs.find(t => t.id === tabMenuAnchor.tabId);
              if (!tab) return null;
              return (
                <>
                  <span className="px-3 py-1 text-[9px] font-bold text-slate-400 uppercase tracking-widest block font-mono">Tab Actions</span>
                  <button 
                    onClick={() => {
                      setTabs(prev => prev.map(t => t.id === tabMenuAnchor.tabId ? { ...t, pinned: !t.pinned } : t));
                      setTabMenuAnchor(null);
                      addNotification('Browser', tab.pinned ? 'Tab unpinned' : 'Tab pinned to front', 'info');
                    }}
                    className="px-4 py-1.5 flex items-center gap-2 hover:bg-blue-500/10 hover:text-blue-400 transition-all text-left w-full cursor-pointer"
                  >
                    {tab.pinned ? <PinOff size={11} /> : <Pin size={11} />}
                    <span>{tab.pinned ? 'Unpin Tab' : 'Pin Tab'}</span>
                  </button>
                  <button 
                    onClick={() => {
                      const dup = {
                        id: Math.random().toString(36).substr(2, 9),
                        url: tab.url,
                        title: tab.title ? `${tab.title} (Copy)` : undefined,
                        localContent: tab.localContent,
                        groupId: tab.groupId
                      };
                      setTabs(prev => [...prev, dup]);
                      setActiveTabId(dup.id);
                      setTabMenuAnchor(null);
                      addNotification('Browser', 'Tab duplicated', 'success');
                    }}
                    className="px-4 py-1.5 flex items-center gap-2 hover:bg-blue-500/10 hover:text-blue-400 transition-all text-left w-full cursor-pointer"
                  >
                    <Copy size={11} />
                    <span>Duplicate Tab</span>
                  </button>
                  <button 
                    onClick={() => {
                      setEditingTabTitleId(tab.id);
                      setEditingTabTitleVal(tab.title || getTabDisplayTitle(tab));
                      setTabMenuAnchor(null);
                    }}
                    className="px-4 py-1.5 flex items-center gap-2 hover:bg-blue-500/10 hover:text-blue-400 transition-all text-left w-full cursor-pointer"
                  >
                    <Edit2 size={11} />
                    <span>Rename Tab...</span>
                  </button>
                  <button 
                    onClick={() => {
                      setTabs(prev => prev.map(t => t.id === tabMenuAnchor.tabId ? { ...t, isMuted: !t.isMuted } : t));
                      setTabMenuAnchor(null);
                    }}
                    className="px-4 py-1.5 flex items-center gap-2 hover:bg-blue-500/10 hover:text-blue-400 transition-all text-left w-full cursor-pointer"
                  >
                    {tab.isMuted ? <Volume2 size={11} /> : <EyeOff size={11} />}
                    <span>{tab.isMuted ? 'Unmute Tab' : 'Mute Tab'}</span>
                  </button>

                  {/* Grouping section */}
                  <div className="border-t border-white/5 my-1" />
                  <span className="px-3 py-1 text-[9px] font-bold text-slate-500 uppercase tracking-widest block font-mono">Tab Groups</span>
                  {tabGroups.map(g => (
                    <button
                      key={g.id}
                      onClick={() => {
                        setTabs(prev => prev.map(t => t.id === tabMenuAnchor.tabId ? { ...t, groupId: t.groupId === g.id ? undefined : g.id } : t));
                        setTabMenuAnchor(null);
                        addNotification('Browser', tab.groupId === g.id ? `Tab removed from group "${g.name}"` : `Tab added to group "${g.name}"`, 'success');
                      }}
                      className="px-4 py-1 flex items-center justify-between hover:bg-blue-500/10 hover:text-blue-400 transition-all text-left w-full cursor-pointer"
                    >
                      <div className="flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: getGroupColorHex(g.color) }} />
                        <span className="truncate max-w-[110px]">{g.name}</span>
                      </div>
                      {tab.groupId === g.id && <Check size={10} className="text-blue-400" />}
                    </button>
                  ))}
                  <button
                    onClick={() => {
                      const gName = prompt("Enter new tab group name:");
                      if (gName && gName.trim()) {
                        const colors = ['blue', 'pink', 'green', 'purple', 'amber', 'red', 'teal'];
                        const randomColor = colors[Math.floor(Math.random() * colors.length)];
                        const newId = Math.random().toString(36).substr(2, 9);
                        setTabGroups(prev => [...prev, { id: newId, name: gName.trim(), color: randomColor }]);
                        setTabs(prev => prev.map(t => t.id === tabMenuAnchor.tabId ? { ...t, groupId: newId } : t));
                        addNotification('Browser', `Created and assigned to group "${gName}"`, 'success');
                      }
                      setTabMenuAnchor(null);
                    }}
                    className="px-4 py-1 flex items-center gap-2 hover:bg-blue-500/10 hover:text-blue-400 transition-all text-left w-full cursor-pointer text-slate-400 font-medium"
                  >
                    <Plus size={10} />
                    <span>New Group...</span>
                  </button>

                  {/* Close Tab Actions */}
                  <div className="border-t border-white/5 my-1" />
                  {tabs.length > 1 && (
                    <button 
                      onClick={() => {
                        closeTab(null, tabMenuAnchor.tabId);
                        setTabMenuAnchor(null);
                      }}
                      className="px-4 py-1.5 flex items-center gap-2 hover:bg-red-500/10 text-red-400 transition-all text-left w-full cursor-pointer"
                    >
                      <X size={11} />
                      <span>Close Tab</span>
                    </button>
                  )}
                  <button 
                    onClick={() => {
                      closeOtherTabs(tabMenuAnchor.tabId);
                      setTabMenuAnchor(null);
                    }}
                    className="px-4 py-1.5 flex items-center gap-2 hover:bg-red-500/10 text-red-400 transition-all text-left w-full cursor-pointer"
                  >
                    <Trash size={11} />
                    <span>Close Other Tabs</span>
                  </button>
                  <button 
                    onClick={() => {
                      closeTabsToRight(tabMenuAnchor.tabId);
                      setTabMenuAnchor(null);
                    }}
                    className="px-4 py-1.5 flex items-center gap-2 hover:bg-red-500/10 text-red-400 transition-all text-left w-full cursor-pointer"
                  >
                    <ArrowLeftRight size={11} />
                    <span>Close Tabs to the Right</span>
                  </button>
                </>
              );
            })()}
          </div>
        </>
      )}

      {/* About App Modal */}
      <AnimatePresence>
        {showAbout && (
          <div className="absolute inset-0 z-[60] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }} 
              animate={{ opacity: 1 }} 
              exit={{ opacity: 0 }} 
              onClick={() => setShowAbout(false)} 
              className="absolute inset-0 bg-black/50 backdrop-blur-sm" 
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }} 
              animate={{ opacity: 1, scale: 1 }} 
              exit={{ opacity: 0, scale: 0.95 }} 
              className="relative w-full max-w-sm bg-gradient-to-b from-slate-900 to-slate-950 border border-white/10 shadow-2xl rounded-3xl overflow-hidden flex flex-col text-white"
            >
              {/* Header */}
              <div className="p-4 flex items-center justify-between">
                <span className="text-[10px] font-mono tracking-widest text-white/30 uppercase">System Application Info</span>
                <button 
                  onClick={() => setShowAbout(false)} 
                  className="text-white/40 hover:text-white transition-colors p-1 rounded-lg hover:bg-white/5 cursor-pointer"
                >
                  <X size={14} />
                </button>
              </div>

              {/* Content */}
              <div className="p-6 flex flex-col items-center text-center gap-4">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-blue-500 to-indigo-600 flex items-center justify-center shadow-xl shadow-blue-500/20">
                  <Globe size={28} className="text-white animate-pulse" />
                </div>
                
                <div className="flex flex-col gap-1">
                  <h3 className="text-base font-bold tracking-tight">GlassOS Browser</h3>
                  <p className="text-[10px] font-mono text-blue-400">Version 4.0.0 (Build 2026.07)</p>
                </div>

                <p className="text-xs text-white/60 leading-relaxed max-w-xs">
                  A modern, secure web browser and developer workshop built exclusively for the GlassOS environment. Features integrated Sandboxed Scripting and HTML Live Composer.
                </p>

                <div className="w-full h-[1px] bg-white/10 my-1" />

                <div className="w-full text-left bg-black/30 rounded-xl p-3 border border-white/5 font-mono text-[9px] text-white/50 space-y-1">
                  <div>Engine: WebKit/Chromium Sandbox</div>
                  <div>Kernel: ESNext Native Virtual Core</div>
                  <div>Local Drive Hook: /GlassDrive/webpages/</div>
                </div>

                <p className="text-[9px] text-white/30">© 2026 GlassOS Foundation. All rights reserved.</p>
              </div>

              {/* Footer */}
              <div className="p-4 bg-black/20 flex justify-center">
                <button 
                  onClick={() => setShowAbout(false)} 
                  className="px-6 py-1.5 bg-white/10 hover:bg-white/15 border border-white/10 rounded-xl text-xs font-semibold text-white transition-all cursor-pointer"
                >
                  Acknowledge
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Keyboard Shortcuts Help Modal */}
      <AnimatePresence>
        {showShortcutsHelp && (
          <div className="absolute inset-0 z-[60] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }} 
              animate={{ opacity: 1 }} 
              exit={{ opacity: 0 }} 
              onClick={() => setShowShortcutsHelp(false)} 
              className="absolute inset-0 bg-black/50 backdrop-blur-sm" 
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }} 
              animate={{ opacity: 1, scale: 1 }} 
              exit={{ opacity: 0, scale: 0.95 }} 
              className="relative w-full max-w-lg bg-slate-900 border border-slate-700/50 shadow-2xl rounded-3xl overflow-hidden flex flex-col text-slate-100 max-h-[85vh]"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div className="p-4 bg-slate-950 border-b border-slate-800 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Keyboard size={16} className="text-blue-400" />
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-200">
                    GlassOS Keyboard Shortcuts
                  </h3>
                </div>
                <button 
                  onClick={() => setShowShortcutsHelp(false)} 
                  className="text-slate-400 hover:text-slate-200 transition-colors p-1 rounded-lg hover:bg-slate-800 cursor-pointer"
                >
                  <X size={14} />
                </button>
              </div>

              {/* Search Bar */}
              <div className="p-3 bg-slate-900/50 border-b border-slate-800/60">
                <div className="relative">
                  <Search size={12} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Search shortcuts (e.g., 'tab', 'bookmark', 'ctrl+w')..."
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-8 pr-4 py-1.5 text-xs focus:outline-none focus:ring-1 focus:ring-blue-500/50 text-slate-200 placeholder-slate-500 transition-all"
                    id="shortcut-search"
                    onChange={(e) => {
                      const q = e.target.value.toLowerCase();
                      const items = document.querySelectorAll('.shortcut-item');
                      const sections = document.querySelectorAll('.shortcut-section');
                      
                      sections.forEach((section: any) => {
                        let sectionHasVisible = false;
                        const sectionItems = section.querySelectorAll('.shortcut-item');
                        sectionItems.forEach((item: any) => {
                          const text = item.innerText.toLowerCase();
                          if (text.includes(q)) {
                            item.style.display = 'flex';
                            sectionHasVisible = true;
                          } else {
                            item.style.display = 'none';
                          }
                        });
                        section.style.display = sectionHasVisible ? 'block' : 'none';
                      });
                    }}
                  />
                </div>
              </div>

              {/* Scrollable Content */}
              <div className="p-4 overflow-y-auto space-y-5 scrollbar-thin scrollbar-thumb-slate-800 text-xs">
                {/* Tab Management Section */}
                <div className="shortcut-section space-y-2">
                  <h4 className="text-[10px] font-bold text-blue-400 uppercase tracking-widest border-b border-slate-800/60 pb-1">Tab Management</h4>
                  <div className="space-y-1">
                    <div className="shortcut-item flex items-center justify-between p-2 rounded-xl hover:bg-slate-800/40 transition-colors">
                      <span className="text-slate-300">Open a new tab</span>
                      <div className="flex items-center gap-1.5">
                        <kbd className="px-1.5 py-0.5 bg-slate-950 border border-slate-800 rounded text-[10px] font-mono text-slate-400">Ctrl</kbd>
                        <span className="text-slate-600 font-mono text-[10px]">+</span>
                        <kbd className="px-1.5 py-0.5 bg-slate-950 border border-slate-800 rounded text-[10px] font-mono text-slate-400">T</kbd>
                        <button onClick={() => { addTab(); addNotification('Browser', 'Opened new tab via Shortcuts helper', 'success'); }} className="ml-2 px-2 py-0.5 bg-blue-500/10 hover:bg-blue-500/20 text-blue-400 text-[9px] rounded-lg border border-blue-500/20 transition-all cursor-pointer">Try</button>
                      </div>
                    </div>
                    <div className="shortcut-item flex items-center justify-between p-2 rounded-xl hover:bg-slate-800/40 transition-colors">
                      <span className="text-slate-300">Close active tab</span>
                      <div className="flex items-center gap-1.5">
                        <kbd className="px-1.5 py-0.5 bg-slate-950 border border-slate-800 rounded text-[10px] font-mono text-slate-400">Ctrl</kbd>
                        <span className="text-slate-600 font-mono text-[10px]">+</span>
                        <kbd className="px-1.5 py-0.5 bg-slate-950 border border-slate-800 rounded text-[10px] font-mono text-slate-400">W</kbd>
                        <button onClick={() => { if (tabs.length > 1) { closeTab(null, activeTabId); } else { addNotification('Browser', 'Cannot close only tab', 'warning'); } }} className="ml-2 px-2 py-0.5 bg-blue-500/10 hover:bg-blue-500/20 text-blue-400 text-[9px] rounded-lg border border-blue-500/20 transition-all cursor-pointer">Try</button>
                      </div>
                    </div>
                    <div className="shortcut-item flex items-center justify-between p-2 rounded-xl hover:bg-slate-800/40 transition-colors">
                      <span className="text-slate-300">Reopen last closed tab</span>
                      <div className="flex items-center gap-1.5">
                        <kbd className="px-1.5 py-0.5 bg-slate-950 border border-slate-800 rounded text-[10px] font-mono text-slate-400">Ctrl</kbd>
                        <span className="text-slate-600 font-mono text-[10px]">+</span>
                        <kbd className="px-1.5 py-0.5 bg-slate-950 border border-slate-800 rounded text-[10px] font-mono text-slate-400">Shift</kbd>
                        <span className="text-slate-600 font-mono text-[10px]">+</span>
                        <kbd className="px-1.5 py-0.5 bg-slate-950 border border-slate-800 rounded text-[10px] font-mono text-slate-400">T</kbd>
                        <button disabled={recentlyClosed.length === 0} onClick={() => { if (recentlyClosed.length > 0) { const last = recentlyClosed[0]; setTabs(prev => [...prev, { id: Math.random().toString(36).substr(2, 9), url: last.url, title: last.title, localContent: last.localContent }]); setRecentlyClosed(prev => prev.slice(1)); addNotification('Browser', `Reopened tab: ${last.title || last.url}`, 'success'); } }} className="ml-2 px-2 py-0.5 bg-blue-500/10 hover:bg-blue-500/20 text-blue-400 text-[9px] rounded-lg border border-blue-500/20 transition-all cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed">Try</button>
                      </div>
                    </div>
                    <div className="shortcut-item flex items-center justify-between p-2 rounded-xl hover:bg-slate-800/40 transition-colors">
                      <span className="text-slate-300">Cycle to next tab</span>
                      <div className="flex items-center gap-1.5">
                        <kbd className="px-1.5 py-0.5 bg-slate-950 border border-slate-800 rounded text-[10px] font-mono text-slate-400">Ctrl</kbd>
                        <span className="text-slate-600 font-mono text-[10px]">+</span>
                        <kbd className="px-1.5 py-0.5 bg-slate-950 border border-slate-800 rounded text-[10px] font-mono text-slate-400">Tab</kbd>
                        <button onClick={() => { const currentIndex = sortedTabs.findIndex(t => t.id === activeTabId); if (currentIndex !== -1 && sortedTabs.length > 0) { const nextIndex = (currentIndex + 1) % sortedTabs.length; setActiveTabId(sortedTabs[nextIndex].id); } }} className="ml-2 px-2 py-0.5 bg-blue-500/10 hover:bg-blue-500/20 text-blue-400 text-[9px] rounded-lg border border-blue-500/20 transition-all cursor-pointer">Try</button>
                      </div>
                    </div>
                    <div className="shortcut-item flex items-center justify-between p-2 rounded-xl hover:bg-slate-800/40 transition-colors">
                      <span className="text-slate-300">Cycle to previous tab</span>
                      <div className="flex items-center gap-1.5">
                        <kbd className="px-1.5 py-0.5 bg-slate-950 border border-slate-800 rounded text-[10px] font-mono text-slate-400">Ctrl</kbd>
                        <span className="text-slate-600 font-mono text-[10px]">+</span>
                        <kbd className="px-1.5 py-0.5 bg-slate-950 border border-slate-800 rounded text-[10px] font-mono text-slate-400">Shift</kbd>
                        <span className="text-slate-600 font-mono text-[10px]">+</span>
                        <kbd className="px-1.5 py-0.5 bg-slate-950 border border-slate-800 rounded text-[10px] font-mono text-slate-400">Tab</kbd>
                        <button onClick={() => { const currentIndex = sortedTabs.findIndex(t => t.id === activeTabId); if (currentIndex !== -1 && sortedTabs.length > 0) { const prevIndex = (currentIndex - 1 + sortedTabs.length) % sortedTabs.length; setActiveTabId(sortedTabs[prevIndex].id); } }} className="ml-2 px-2 py-0.5 bg-blue-500/10 hover:bg-blue-500/20 text-blue-400 text-[9px] rounded-lg border border-blue-500/20 transition-all cursor-pointer">Try</button>
                      </div>
                    </div>
                    <div className="shortcut-item flex items-center justify-between p-2 rounded-xl hover:bg-slate-800/40 transition-colors">
                      <span className="text-slate-300">Jump directly to tab 1-8</span>
                      <div className="flex items-center gap-1.5">
                        <kbd className="px-1.5 py-0.5 bg-slate-950 border border-slate-800 rounded text-[10px] font-mono text-slate-400">Ctrl</kbd>
                        <span className="text-slate-600 font-mono text-[10px]">+</span>
                        <kbd className="px-1.5 py-0.5 bg-slate-950 border border-slate-800 rounded text-[10px] font-mono text-slate-400">1-8</kbd>
                        <span className="text-[10px] font-mono text-slate-500 ml-2">Quick Switch</span>
                      </div>
                    </div>
                    <div className="shortcut-item flex items-center justify-between p-2 rounded-xl hover:bg-slate-800/40 transition-colors">
                      <span className="text-slate-300">Jump to last tab</span>
                      <div className="flex items-center gap-1.5">
                        <kbd className="px-1.5 py-0.5 bg-slate-950 border border-slate-800 rounded text-[10px] font-mono text-slate-400">Ctrl</kbd>
                        <span className="text-slate-600 font-mono text-[10px]">+</span>
                        <kbd className="px-1.5 py-0.5 bg-slate-950 border border-slate-800 rounded text-[10px] font-mono text-slate-400">9</kbd>
                        <button onClick={() => { if (sortedTabs.length > 0) { setActiveTabId(sortedTabs[sortedTabs.length - 1].id); } }} className="ml-2 px-2 py-0.5 bg-blue-500/10 hover:bg-blue-500/20 text-blue-400 text-[9px] rounded-lg border border-blue-500/20 transition-all cursor-pointer">Try</button>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Navigation & Search Section */}
                <div className="shortcut-section space-y-2">
                  <h4 className="text-[10px] font-bold text-amber-400 uppercase tracking-widest border-b border-slate-800/60 pb-1">Navigation & Search</h4>
                  <div className="space-y-1">
                    <div className="shortcut-item flex items-center justify-between p-2 rounded-xl hover:bg-slate-800/40 transition-colors">
                      <span className="text-slate-300">Focus URL address bar</span>
                      <div className="flex items-center gap-1.5">
                        <kbd className="px-1.5 py-0.5 bg-slate-950 border border-slate-800 rounded text-[10px] font-mono text-slate-400">Ctrl</kbd>
                        <span className="text-slate-600 font-mono text-[10px]">+</span>
                        <kbd className="px-1.5 py-0.5 bg-slate-950 border border-slate-800 rounded text-[10px] font-mono text-slate-400">L</kbd>
                        <span className="text-slate-500 text-[10px]">or</span>
                        <kbd className="px-1.5 py-0.5 bg-slate-950 border border-slate-800 rounded text-[10px] font-mono text-slate-400">K</kbd>
                        <button onClick={() => { const bar = document.getElementById('browser-url-input'); bar?.focus(); (bar as any)?.select(); }} className="ml-2 px-2 py-0.5 bg-blue-500/10 hover:bg-blue-500/20 text-blue-400 text-[9px] rounded-lg border border-blue-500/20 transition-all cursor-pointer">Try</button>
                      </div>
                    </div>
                    <div className="shortcut-item flex items-center justify-between p-2 rounded-xl hover:bg-slate-800/40 transition-colors">
                      <span className="text-slate-300">Open Search Tab Switcher</span>
                      <div className="flex items-center gap-1.5">
                        <kbd className="px-1.5 py-0.5 bg-slate-950 border border-slate-800 rounded text-[10px] font-mono text-slate-400">Ctrl</kbd>
                        <span className="text-slate-600 font-mono text-[10px]">+</span>
                        <kbd className="px-1.5 py-0.5 bg-slate-950 border border-slate-800 rounded text-[10px] font-mono text-slate-400">F</kbd>
                        <button onClick={() => { setShowTabSwitcher(true); }} className="ml-2 px-2 py-0.5 bg-blue-500/10 hover:bg-blue-500/20 text-blue-400 text-[9px] rounded-lg border border-blue-500/20 transition-all cursor-pointer">Try</button>
                      </div>
                    </div>
                    <div className="shortcut-item flex items-center justify-between p-2 rounded-xl hover:bg-slate-800/40 transition-colors">
                      <span className="text-slate-300">Toggle History panel</span>
                      <div className="flex items-center gap-1.5">
                        <kbd className="px-1.5 py-0.5 bg-slate-950 border border-slate-800 rounded text-[10px] font-mono text-slate-400">Ctrl</kbd>
                        <span className="text-slate-600 font-mono text-[10px]">+</span>
                        <kbd className="px-1.5 py-0.5 bg-slate-950 border border-slate-800 rounded text-[10px] font-mono text-slate-400">H</kbd>
                        <button onClick={() => { setShowHistory(prev => !prev); }} className="ml-2 px-2 py-0.5 bg-blue-500/10 hover:bg-blue-500/20 text-blue-400 text-[9px] rounded-lg border border-blue-500/20 transition-all cursor-pointer">Try</button>
                      </div>
                    </div>
                    <div className="shortcut-item flex items-center justify-between p-2 rounded-xl hover:bg-slate-800/40 transition-colors">
                      <span className="text-slate-300">Reload current page</span>
                      <div className="flex items-center gap-1.5">
                        <kbd className="px-1.5 py-0.5 bg-slate-950 border border-slate-800 rounded text-[10px] font-mono text-slate-400">F5</kbd>
                        <button onClick={() => { handleGo(); }} className="ml-2 px-2 py-0.5 bg-blue-500/10 hover:bg-blue-500/20 text-blue-400 text-[9px] rounded-lg border border-blue-500/20 transition-all cursor-pointer">Try</button>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Bookmarks & Settings Section */}
                <div className="shortcut-section space-y-2">
                  <h4 className="text-[10px] font-bold text-emerald-400 uppercase tracking-widest border-b border-slate-800/60 pb-1">Bookmarks & Settings</h4>
                  <div className="space-y-1">
                    <div className="shortcut-item flex items-center justify-between p-2 rounded-xl hover:bg-slate-800/40 transition-colors">
                      <span className="text-slate-300">Bookmark current tab</span>
                      <div className="flex items-center gap-1.5">
                        <kbd className="px-1.5 py-0.5 bg-slate-950 border border-slate-800 rounded text-[10px] font-mono text-slate-400">Ctrl</kbd>
                        <span className="text-slate-600 font-mono text-[10px]">+</span>
                        <kbd className="px-1.5 py-0.5 bg-slate-950 border border-slate-800 rounded text-[10px] font-mono text-slate-400">D</kbd>
                        <button onClick={() => { handleStarClick(); }} className="ml-2 px-2 py-0.5 bg-blue-500/10 hover:bg-blue-500/20 text-blue-400 text-[9px] rounded-lg border border-blue-500/20 transition-all cursor-pointer">Try</button>
                      </div>
                    </div>
                    <div className="shortcut-item flex items-center justify-between p-2 rounded-xl hover:bg-slate-800/40 transition-colors">
                      <span className="text-slate-300">Toggle Bookmarks Manager</span>
                      <div className="flex items-center gap-1.5">
                        <kbd className="px-1.5 py-0.5 bg-slate-950 border border-slate-800 rounded text-[10px] font-mono text-slate-400">Ctrl</kbd>
                        <span className="text-slate-600 font-mono text-[10px]">+</span>
                        <kbd className="px-1.5 py-0.5 bg-slate-950 border border-slate-800 rounded text-[10px] font-mono text-slate-400">B</kbd>
                        <button onClick={() => { setShowBookmarksManager(prev => !prev); }} className="ml-2 px-2 py-0.5 bg-blue-500/10 hover:bg-blue-500/20 text-blue-400 text-[9px] rounded-lg border border-blue-500/20 transition-all cursor-pointer">Try</button>
                      </div>
                    </div>
                    <div className="shortcut-item flex items-center justify-between p-2 rounded-xl hover:bg-slate-800/40 transition-colors">
                      <span className="text-slate-300">Open Preferences dialog</span>
                      <div className="flex items-center gap-1.5">
                        <kbd className="px-1.5 py-0.5 bg-slate-950 border border-slate-800 rounded text-[10px] font-mono text-slate-400">Ctrl</kbd>
                        <span className="text-slate-600 font-mono text-[10px]">+</span>
                        <kbd className="px-1.5 py-0.5 bg-slate-950 border border-slate-800 rounded text-[10px] font-mono text-slate-400">,</kbd>
                        <button onClick={() => { setShowPreferences(true); }} className="ml-2 px-2 py-0.5 bg-blue-500/10 hover:bg-blue-500/20 text-blue-400 text-[9px] rounded-lg border border-blue-500/20 transition-all cursor-pointer">Try</button>
                      </div>
                    </div>
                    <div className="shortcut-item flex items-center justify-between p-2 rounded-xl hover:bg-slate-800/40 transition-colors">
                      <span className="text-slate-300">Print page / Save as PDF</span>
                      <div className="flex items-center gap-1.5">
                        <kbd className="px-1.5 py-0.5 bg-slate-950 border border-slate-800 rounded text-[10px] font-mono text-slate-400">Ctrl</kbd>
                        <span className="text-slate-600 font-mono text-[10px]">+</span>
                        <kbd className="px-1.5 py-0.5 bg-slate-950 border border-slate-800 rounded text-[10px] font-mono text-slate-400">P</kbd>
                        <button onClick={() => { handlePrint(); }} className="ml-2 px-2 py-0.5 bg-blue-500/10 hover:bg-blue-500/20 text-blue-400 text-[9px] rounded-lg border border-blue-500/20 transition-all cursor-pointer">Try</button>
                      </div>
                    </div>
                    <div className="shortcut-item flex items-center justify-between p-2 rounded-xl hover:bg-slate-800/40 transition-colors">
                      <span className="text-slate-300">Toggle HTTPS Secure Mode</span>
                      <div className="flex items-center gap-1.5">
                        <kbd className="px-1.5 py-0.5 bg-slate-950 border border-slate-800 rounded text-[10px] font-mono text-slate-400">Ctrl</kbd>
                        <span className="text-slate-600 font-mono text-[10px]">+</span>
                        <kbd className="px-1.5 py-0.5 bg-slate-950 border border-slate-800 rounded text-[10px] font-mono text-slate-400">Shift</kbd>
                        <span className="text-slate-600 font-mono text-[10px]">+</span>
                        <kbd className="px-1.5 py-0.5 bg-slate-950 border border-slate-800 rounded text-[10px] font-mono text-slate-400">S</kbd>
                        <button onClick={() => { setIsSecureMode(!isSecureMode); }} className="ml-2 px-2 py-0.5 bg-blue-500/10 hover:bg-blue-500/20 text-blue-400 text-[9px] rounded-lg border border-blue-500/20 transition-all cursor-pointer">Try</button>
                      </div>
                    </div>
                    <div className="shortcut-item flex items-center justify-between p-2 rounded-xl hover:bg-slate-800/40 transition-colors">
                      <span className="text-slate-300">Close open panels & dialogs</span>
                      <div className="flex items-center gap-1.5">
                        <kbd className="px-1.5 py-0.5 bg-slate-950 border border-slate-800 rounded text-[10px] font-mono text-slate-400">Escape</kbd>
                        <span className="text-[10px] font-mono text-slate-500 ml-2">Quick Exit</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Footer */}
              <div className="p-4 bg-slate-950 border-t border-slate-800 flex items-center justify-between text-[11px] text-slate-400">
                <span>Press <span className="font-bold text-white font-mono bg-slate-800 px-1 rounded">Esc</span> at any time to close dialogs</span>
                <button 
                  onClick={() => setShowShortcutsHelp(false)} 
                  className="px-5 py-1.5 bg-blue-600 hover:bg-blue-500 text-white border border-blue-500/30 rounded-xl text-xs font-semibold transition-all cursor-pointer shadow-lg shadow-blue-600/20"
                >
                  Close
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Scripting Developer Console Drawer */}
      <AnimatePresence>
        {showScriptConsole && (
          <motion.div 
            initial={{ y: 300 }}
            animate={{ y: 0 }}
            exit={{ y: 300 }}
            className="h-72 bg-slate-950 border-t border-purple-500/20 shadow-2xl z-30 flex flex-col font-mono"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="h-9 bg-slate-900 border-b border-purple-500/10 flex items-center justify-between px-4 text-xs text-purple-300">
              <div className="flex items-center gap-2">
                <TerminalIcon size={12} className="text-purple-400" />
                <span className="font-bold uppercase tracking-wider text-[10px]">JavaScript Developer Console</span>
              </div>
              <div className="flex items-center gap-2">
                {/* Preset Script Selection */}
                <select 
                  onChange={(e) => {
                    const val = e.target.value;
                    if (val === 'count-links') {
                      setScriptInputCode(`// Count links in current local page\nconsole.log("Analyzing links...");\nconsole.log(\`Total pages links count: \${linksCount}\`);\nlinks.forEach((l, idx) => {\n  console.log(\`  [\${idx + 1}] \${l}\`);\n});`);
                    } else if (val === 'list-headings') {
                      setScriptInputCode(`// List all headings found in document\nconsole.log("Searching headings...");\nheadings.forEach((h) => {\n  console.log(\`  Found heading: \${h}\`);\n});`);
                    } else if (val === 'dom-query') {
                      setScriptInputCode(`// Query individual DOM elements using helper\nconsole.log("Querying title...");\nconst titleText = $("h1");\nconsole.log("Heading h1 text:", titleText);\n\nconsole.log("Querying paragraphs...");\nconst paraTexts = $$("p");\nparaTexts.forEach((p, i) => {\n  console.log(\`  Paragraph \${i+1}: \${p}\`);\n});`);
                    }
                  }}
                  className="bg-slate-800 border border-purple-500/20 text-purple-300 rounded text-[10px] p-0.5 px-1.5 focus:outline-none cursor-pointer"
                >
                  <option value="">-- Load Sample Script --</option>
                  <option value="count-links">Count Page Links</option>
                  <option value="list-headings">List All Headings</option>
                  <option value="dom-query">Query DOM Elements</option>
                </select>
                <button 
                  onClick={() => setScriptConsoleLogs([])}
                  className="px-2 py-0.5 bg-slate-800 hover:bg-slate-700 text-[9px] rounded text-purple-300 transition-all border border-purple-500/10 cursor-pointer"
                >
                  Clear Console
                </button>
                <button 
                  onClick={() => runScriptCode(scriptInputCode)}
                  className="px-3 py-0.5 bg-purple-600 hover:bg-purple-500 text-white font-bold text-[9px] rounded transition-all shadow-md shadow-purple-600/20 cursor-pointer"
                >
                  Run Script
                </button>
                <button 
                  onClick={() => setShowScriptConsole(false)}
                  className="text-purple-400 hover:text-white p-1 rounded hover:bg-white/5 cursor-pointer"
                >
                  <X size={12} />
                </button>
              </div>
            </div>

            {/* Split area: editor & logs */}
            <div className="flex-1 flex overflow-hidden text-[11px]">
              {/* Code Editor */}
              <div className="flex-1 flex flex-col border-r border-purple-500/10">
                <textarea 
                  value={scriptInputCode}
                  onChange={(e) => setScriptInputCode(e.target.value)}
                  className="flex-1 bg-slate-950 text-emerald-400 p-3 font-mono focus:outline-none resize-none overflow-y-auto w-full"
                  spellCheck={false}
                />
              </div>

              {/* Output Console Logs */}
              <div className="w-80 bg-slate-900/40 p-3 flex flex-col gap-1 overflow-y-auto">
                <span className="text-[9px] font-bold text-slate-500 tracking-wider uppercase border-b border-purple-500/10 pb-1 mb-1 flex items-center gap-1">
                  <span>Console Logs</span>
                  <span className="text-[8px] bg-purple-500/10 text-purple-400 px-1 rounded">{scriptConsoleLogs.length}</span>
                </span>
                {scriptConsoleLogs.length === 0 ? (
                  <span className="text-slate-600 italic">No output logs. Click 'Run Script' to execute.</span>
                ) : (
                  <div className="space-y-1.5">
                    {scriptConsoleLogs.map((log, idx) => (
                      <div key={idx} className="leading-relaxed">
                        <span className="text-slate-600 mr-2">[{log.timestamp}]</span>
                        <span className={cn(
                          log.type === 'error' ? "text-red-400" : log.type === 'warn' ? "text-yellow-400" : "text-slate-300"
                        )}>
                          {log.text}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function PhotosApp({ fsLib, addNotification, selectedFile }: any) {
  const [currentView, setCurrentView] = useState<string | null>(selectedFile?.content || null);
  const [photos, setPhotos] = useState<any[]>([]);

  useEffect(() => {
    const fetchPhotos = () => {
      const photoFiles = fsLib.list('Documents/Photos') || [];
      const paintingFiles = fsLib.list('Documents/Paintings') || [];
      const stockPhotos = [
        { name: 'Mountain Lake', content: 'https://images.unsplash.com/photo-1501785888041-af3ef285b470?q=80&w=800&auto=format&fit=crop', stock: true },
        { name: 'Forest Path', content: 'https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?q=80&w=800&auto=format&fit=crop', stock: true },
        { name: 'Deep Forest', content: 'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?q=80&w=800&auto=format&fit=crop', stock: true },
        { name: 'Ocean View', content: 'https://images.unsplash.com/photo-1500673922987-e212871fec22?q=80&w=800&auto=format&fit=crop', stock: true },
        { name: 'Alpine Peak', content: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?q=80&w=800&auto=format&fit=crop', stock: true },
      ];
      setPhotos([...photoFiles, ...paintingFiles, ...stockPhotos]);
    };
    fetchPhotos();
  }, [fsLib]);

  useEffect(() => {
    if (selectedFile) {
      setCurrentView(selectedFile.content);
    }
  }, [selectedFile]);

  return (
    <div className="h-full bg-slate-950 text-white flex flex-col relative overflow-hidden">
      {/* Viewer Overlay */}
      <AnimatePresence>
        {currentView && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 z-[100] bg-black/95 flex flex-col"
          >
            <div className="h-12 flex items-center justify-between px-4 bg-gradient-to-b from-black/60 to-transparent">
              <span className="text-xs font-bold text-white/60">IMAGE VIEWER</span>
              <button 
                onClick={() => setCurrentView(null)}
                className="p-1.5 hover:bg-white/10 rounded-full transition-all"
              >
                <X size={20} />
              </button>
            </div>
            <div className="flex-1 flex items-center justify-center p-4 overflow-hidden">
              <motion.img 
                initial={{ scale: 0.9, y: 20 }}
                animate={{ scale: 1, y: 0 }}
                src={currentView} 
                alt="Viewer" 
                className="max-w-full max-h-full object-contain shadow-2xl rounded-lg" 
              />
            </div>
            <div className="h-20 flex items-center justify-center gap-4 bg-gradient-to-t from-black/60 to-transparent">
               <button className="p-2 hover:bg-white/10 rounded-full text-white/40 hover:text-white transition-all"><Download size={20} /></button>
               <button className="p-2 hover:bg-white/10 rounded-full text-white/40 hover:text-white transition-all"><Share2 size={20} /></button>
               <button 
                onClick={() => {
                  addNotification('Photos', 'Photo sent to Printer', 'success');
                }}
                className="p-2 hover:bg-white/10 rounded-full text-white/40 hover:text-white transition-all"
               >
                 <Printer size={20} />
               </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="flex-1 p-6 overflow-y-auto no-scrollbar">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold tracking-tight">Camera Roll</h2>
          <div className="bg-white/5 rounded-full px-3 py-1 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-[10px] font-bold text-emerald-500 tracking-tighter uppercase">Syncing...</span>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {photos.map((p, i) => (
            <motion.div 
              key={i}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              whileHover={{ scale: 1.02, y: -4 }}
              onClick={() => {
                setCurrentView(p.content);
                addNotification('Photos', `Viewing ${p.name || 'Image'}`, 'info');
              }}
              className="aspect-square rounded-2xl overflow-hidden glass cursor-pointer border border-white/5 relative group shadow-lg"
            >
              <img src={p.content} alt={p.name} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
              <div className="absolute bottom-2 left-2 right-2 flex items-center justify-between opacity-0 group-hover:opacity-100 transition-opacity translate-y-2 group-hover:translate-y-0 duration-300">
                <span className="text-[8px] font-bold text-white truncate max-w-[70%]">{p.name || 'Photo'}</span>
                <div className="flex gap-1">
                  {p.stock ? <div className="text-[8px] bg-white/20 px-1 rounded">STOCK</div> : <div className="text-[8px] bg-blue-500/40 px-1 rounded">LOCAL</div>}
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {photos.length === 0 && (
          <div className="h-64 flex flex-col items-center justify-center text-white/20 gap-4 border-2 border-dashed border-white/5 rounded-3xl">
            <ImageIcon size={48} strokeWidth={1} />
            <p className="text-sm font-medium">No photos found in Library</p>
          </div>
        )}
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
  const [targetArch, setTargetArch] = useState('x64 (64-bit Windows/Linux)');
  const [optimizationLevel, setOptimizationLevel] = useState('O2 (Balanced)');
  const [isCompiling, setIsCompiling] = useState(false);
  const [activeDialog, setActiveDialog] = useState<'new' | 'open' | 'send' | 'about' | null>(null);
  const [currentTheme, setCurrentTheme] = useState<keyof typeof THEMES>('glass');
  const [syntaxErrors, setSyntaxErrors] = useState<{line: number, message: string}[]>([]);
  const [bitConflicts, setBitConflicts] = useState<{line: number, message: string, severity: 'warning'}[]>([]);

  const getBitDepth = useCallback((arch: string): number => {
    const lower = arch.toLowerCase();
    if (lower.includes('8-bit') || lower.includes('8bit') || lower.includes('6502') || lower.includes('z80')) return 8;
    if (lower.includes('16-bit') || lower.includes('16bit') || lower.includes('68000') || lower.includes('8086')) return 16;
    if (lower.includes('32-bit') || lower.includes('32bit') || lower.includes('rv32') || lower.includes('cortex-m') || lower.includes('x86')) return 32;
    return 64; // default to 64-bit
  }, []);

  const checkBitDepthConflicts = useCallback((content: string, arch: string) => {
    if (!activeFile.endsWith('.b')) {
      return [];
    }

    const conflicts: {line: number, message: string, severity: 'warning'}[] = [];
    const targetBits = getBitDepth(arch);
    const lines = content.split('\n');

    // 64-bit patterns
    const p64 = [
      { regex: /\b(RAX|RBX|RCX|RDX|RSP|RBP|RDI|RSI|R8|R9|R10|R11|R12|R13|R14|R15)\b/i, name: '64-bit register' },
      { regex: /\b(QWORD|INT64|64BIT)\b/i, name: '64-bit type' },
      { regex: /\b(MOV64|ADD64|SUB64|MUL64|DIV64|PUSH64|POP64|LET64|SET64)\b/i, name: '64-bit operation' }
    ];

    // 32-bit patterns
    const p32 = [
      { regex: /\b(EAX|EBX|ECX|EDX|ESP|EBP|EDI|ESI)\b/i, name: '32-bit register' },
      { regex: /\b(DWORD|INT32|32BIT)\b/i, name: '32-bit type' },
      { regex: /\b(MOV32|ADD32|SUB32|MUL32|DIV32|PUSH32|POP32|LET32|SET32)\b/i, name: '32-bit operation' }
    ];

    // 16-bit patterns
    const p16 = [
      { regex: /\b(AX|BX|CX|DX|SP|BP|SI|DI)\b/, name: '16-bit register' },
      { regex: /\b(WORD|INT16|16BIT)\b/i, name: '16-bit type' },
      { regex: /\b(MOV16|ADD16|SUB16|MUL16|DIV16|PUSH16|POP16|LET16|SET16)\b/i, name: '16-bit operation' }
    ];

    lines.forEach((line, index) => {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith('//') || trimmed.toUpperCase().startsWith('REM')) return;

      // Check 64-bit syntax in 8/16/32-bit targets
      if (targetBits < 64) {
        for (const pattern of p64) {
          const match = line.match(pattern.regex);
          if (match) {
            conflicts.push({
              line: index + 1,
              message: `Using ${pattern.name} "${match[0]}" is incompatible with ${targetBits}-bit architecture "${arch}".`,
              severity: 'warning'
            });
            break;
          }
        }
      }

      // Check 32-bit syntax in 8/16-bit targets
      if (targetBits < 32 && conflicts.find(c => c.line === index + 1) === undefined) {
        for (const pattern of p32) {
          const match = line.match(pattern.regex);
          if (match) {
            conflicts.push({
              line: index + 1,
              message: `Using ${pattern.name} "${match[0]}" is incompatible with ${targetBits}-bit architecture "${arch}".`,
              severity: 'warning'
            });
            break;
          }
        }
      }

      // Check 16-bit syntax in 8-bit targets
      if (targetBits < 16 && conflicts.find(c => c.line === index + 1) === undefined) {
        for (const pattern of p16) {
          const match = line.match(pattern.regex);
          if (match) {
            conflicts.push({
              line: index + 1,
              message: `Using ${pattern.name} "${match[0]}" is incompatible with ${targetBits}-bit architecture "${arch}".`,
              severity: 'warning'
            });
            break;
          }
        }
      }
    });

    return conflicts;
  }, [activeFile, getBitDepth]);

  useEffect(() => {
    const conflicts = checkBitDepthConflicts(code, targetArch);
    setBitConflicts(conflicts);
  }, [code, targetArch, checkBitDepthConflicts]);
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
      let type: '8-bit' | '16-bit' | '32-bit' | '64-bit' = '32-bit';
      if (targetArch.toLowerCase().includes('8-bit') || targetArch.toLowerCase().includes('8bit')) {
        type = '8-bit';
      } else if (targetArch.toLowerCase().includes('16-bit') || targetArch.toLowerCase().includes('16bit')) {
        type = '16-bit';
      } else if (targetArch.toLowerCase().includes('64-bit') || targetArch.toLowerCase().includes('64bit')) {
        type = '64-bit';
      } else if (targetArch.toLowerCase().includes('32-bit') || targetArch.toLowerCase().includes('32bit')) {
        type = '32-bit';
      } else {
        type = targetArch.includes('6502') ? '8-bit' : targetArch.includes('68k') ? '16-bit' : targetArch.includes('x64') ? '64-bit' : '32-bit';
      }
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
                    {[
                      { label: '64-bit Architectures', isHeader: true },
                      { label: 'x64 (64-bit Windows/Linux)', isHeader: false },
                      { label: 'ARM64 (64-bit Apple/Android)', isHeader: false },
                      { label: 'RISC-V RV64 (64-bit)', isHeader: false },
                      { label: '32-bit Architectures', isHeader: true },
                      { label: 'Intel x86 (32-bit)', isHeader: false },
                      { label: 'ARM Cortex-M (32-bit)', isHeader: false },
                      { label: 'RISC-V RV32 (32-bit)', isHeader: false },
                      { label: '16-bit Architectures', isHeader: true },
                      { label: 'Motorola 68000 (16-bit)', isHeader: false },
                      { label: 'Intel 8086 (16-bit)', isHeader: false },
                      { label: '8-bit Architectures', isHeader: true },
                      { label: 'MOS 6502 (8-bit Retro)', isHeader: false },
                      { label: 'Zilog Z80 (8-bit Retro)', isHeader: false }
                    ].map((item, idx) => (
                      item.isHeader ? (
                        <div key={idx} className="px-4 py-1 text-[8px] font-bold text-white/30 uppercase tracking-wider mt-1 border-t border-white/5 first:border-0 first:mt-0">
                          {item.label}
                        </div>
                      ) : (
                        <button 
                          key={idx}
                          onClick={() => { setTargetArch(item.label); setActiveMenu(null); }}
                          className={cn(
                            "w-full text-left px-4 py-1.5 hover:bg-white/10 flex items-center justify-between text-[11px]",
                            targetArch === item.label ? "text-blue-400 bg-blue-500/5 font-semibold" : "text-white/60"
                          )}
                        >
                          <span>{item.label}</span>
                          {targetArch === item.label && <Check size={12} />}
                        </button>
                      )
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
            <optgroup label="64-bit" className="bg-slate-900 text-white/50 text-[9px] font-bold">
              <option className="bg-slate-800 text-white">x64 (64-bit Windows/Linux)</option>
              <option className="bg-slate-800 text-white">ARM64 (64-bit Apple/Android)</option>
              <option className="bg-slate-800 text-white">RISC-V RV64 (64-bit)</option>
            </optgroup>
            <optgroup label="32-bit" className="bg-slate-900 text-white/50 text-[9px] font-bold">
              <option className="bg-slate-800 text-white">Intel x86 (32-bit)</option>
              <option className="bg-slate-800 text-white">ARM Cortex-M (32-bit)</option>
              <option className="bg-slate-800 text-white">RISC-V RV32 (32-bit)</option>
            </optgroup>
            <optgroup label="16-bit" className="bg-slate-900 text-white/50 text-[9px] font-bold">
              <option className="bg-slate-800 text-white">Motorola 68000 (16-bit)</option>
              <option className="bg-slate-800 text-white">Intel 8086 (16-bit)</option>
            </optgroup>
            <optgroup label="8-bit" className="bg-slate-900 text-white/50 text-[9px] font-bold">
              <option className="bg-slate-800 text-white">MOS 6502 (8-bit Retro)</option>
              <option className="bg-slate-800 text-white">Zilog Z80 (8-bit Retro)</option>
            </optgroup>
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
                <div className="flex items-center gap-4 overflow-x-auto scrollbar-none py-0.5">
                  <div className="flex items-center gap-1.5 flex-shrink-0">
                    <div className={cn("w-1.5 h-1.5 rounded-full", isDirty ? "bg-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.5)]" : "bg-emerald-500")} />
                    <span>{isDirty ? 'Unsaved Changes' : 'All Changes Saved'}</span>
                  </div>
                  <div className="w-[1px] h-3 bg-white/10 flex-shrink-0" />
                  <span className="flex-shrink-0">UTF-8</span>
                  <div className="w-[1px] h-3 bg-white/10 flex-shrink-0" />
                  <span className="flex-shrink-0">{activeFile.endsWith('.b') ? 'Brainscript' : activeFile.endsWith('.scr') ? 'GlassScript' : 'Text'}</span>
                  
                  <div className="w-[1px] h-3 bg-white/10 flex-shrink-0" />
                  <div className="flex items-center gap-1 text-white/50 flex-shrink-0">
                    <Cpu size={10} className="text-blue-400" />
                    <span>Arch: <strong className="text-white/80 font-mono">{targetArch}</strong></span>
                  </div>

                  {bitConflicts.length > 0 && (
                    <>
                      <div className="w-[1px] h-3 bg-white/10 flex-shrink-0" />
                      <div className="flex items-center gap-1 bg-amber-500/10 text-amber-400 px-1.5 py-0.5 rounded border border-amber-500/30 font-semibold animate-pulse flex-shrink-0">
                        <AlertTriangle size={10} />
                        <span>{bitConflicts.length} Bit-Depth Conflict{bitConflicts.length > 1 ? 's' : ''}</span>
                      </div>
                    </>
                  )}
                </div>
                <div className="flex items-center gap-4 flex-shrink-0 ml-2">
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

          {bitConflicts.length > 0 && (
            <div className="h-24 bg-amber-500/10 border-t border-amber-500/20 overflow-y-auto p-3 space-y-1">
              <div className="flex items-center gap-2 text-amber-400 text-[10px] font-bold uppercase mb-2">
                <AlertTriangle size={12} />
                <span>Architecture Bit-Depth Warnings ({bitConflicts.length})</span>
              </div>
              {bitConflicts.map((err, i) => (
                <div key={i} className="text-[11px] text-amber-200/70 flex gap-2">
                  <span className="text-amber-400/50 min-w-[40px]">Line {err.line}:</span>
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
          <div className="flex items-center gap-1.5 font-semibold">
            <Cpu size={10} className="text-white animate-pulse" />
            <span>Arch: <strong className="font-mono">{targetArch}</strong></span>
          </div>
          {bitConflicts.length > 0 && (
            <div className="flex items-center gap-1 bg-black/30 text-amber-300 px-2 py-0.5 rounded border border-amber-500/40 font-bold animate-pulse">
              <AlertTriangle size={10} className="text-amber-400" />
              <span>Bit Conflict!</span>
            </div>
          )}
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
