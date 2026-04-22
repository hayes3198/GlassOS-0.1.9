import React from 'react';

export type AppId = 'terminal' | 'settings' | 'notepad' | 'browser' | 'photos' | 'music' | 'appfolder' | 'codestudio' | 'files' | 'systemmonitor' | 'glassword' | 'spreadsheet' | 'glassmail' | 'glassdatabase' | 'glassmessaging' | 'printers' | 'calendar' | 'taskscheduler' | string;

export interface Permissions {
  owner: { r: boolean; w: boolean; x: boolean };
  group: { r: boolean; w: boolean; x: boolean };
  others: { r: boolean; w: boolean; x: boolean };
}

export interface FileSystemItem {
  name: string;
  type: 'file' | 'folder';
  content?: string;
  children?: FileSystemItem[];
  permissions?: Permissions;
  category?: 'local' | 'settings' | 'networking' | 'trash';
  accentColor?: string;
  size?: number;
  dateCreated?: string;
  dateModified?: string;
}

export interface WindowState {
  id: AppId;
  title: string;
  isOpen: boolean;
  isMinimized: boolean;
  isMaximized: boolean;
  zIndex: number;
  x: number;
  y: number;
  restoreX?: number;
  restoreY?: number;
  width: number;
  height: number;
  restoreWidth?: number;
  restoreHeight?: number;
}

export interface ContextMenuItem {
  label: string;
  icon?: React.ReactNode;
  onClick: () => void;
  variant?: 'default' | 'danger';
}

export interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  timestamp: Date;
}

export interface NetworkNode {
  id: string;
  hostname: string;
  ip: string;
  services: string[];
  status: 'online' | 'offline';
  isAuthorized: boolean;
}

export interface NetworkTraffic {
  id: string;
  protocol: 'gRPC' | 'XMPP' | 'IP' | 'mDNS';
  source: string;
  destination: string;
  size: string;
  timestamp: string;
}

export interface KernelCall {
  id: string;
  service: string;
  method: string;
  status: 'success' | 'warning' | 'error';
  timestamp: string;
  latency: number;
}

export interface BrainscriptBuild {
  id: string;
  name: string;
  status: 'success' | 'error' | 'building';
  arch: string;
  opt: string;
  timestamp: string;
  log?: string;
  size?: string;
  type?: string;
}

export interface UserAccount {
  id: string;
  username: string;
  role?: 'admin' | 'user' | 'guest';
  email?: string;
  fullName?: string;
  lastLogin?: string;
  avatar?: string;
  isAdmin?: boolean;
}

export interface NetworkConfig {
  hostname?: string;
  domain?: string;
  dhcp?: boolean;
  ip?: string;
  subnet?: string;
  gateway?: string;
  dns?: string[];
  protocols?: any;
}

export interface PrintJob {
  id: string;
  documentName: string;
  sourceApp?: string;
  status: 'printing' | 'queued' | 'completed' | 'error';
  progress?: number;
  pages?: number;
  timestamp: string;
  filename?: string;
  owner?: string;
}

export interface Email {
  id: string;
  from?: string;
  to?: string;
  subject?: string;
  body?: string;
  message?: string;
  date?: string;
  timestamp?: string;
  isRead?: boolean;
  isFlagged?: boolean;
  read?: boolean;
  attachments?: any[];
}

export interface ScheduledTask {
  id: string;
  name: string;
  type: 'app' | 'command' | 'screensaver';
  target: string;
  time: string;
  repeat: 'once' | 'daily';
  enabled: boolean;
}
