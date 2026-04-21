import React, { useState, useMemo } from 'react';
import { 
  Folder, 
  Image as ImageIcon, 
  FileText, 
  Search, 
  ChevronRight, 
  Cpu,
  RefreshCw,
  Trash2,
  FileCode,
  FileJson,
  Trash,
  Play, 
  Edit2,
  Copy,
  Share2,
  Shield,
  Info,
  X,
  Check,
  HardDrive,
  Settings as SettingsIcon,
  Server,
  Clipboard,
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  FileSystemItem, 
  Permissions, 
  WindowState,
  AppId,
  Notification,
  ContextMenuItem,
  PrintJob
} from './types';
import { DEFAULT_PERMISSIONS } from './lib/FileSystem.lib';
import { FileSystemLib } from './lib/FileSystem.lib';

function cn(...classes: (string | boolean | undefined)[]) {
  return classes.filter(Boolean).join(' ');
}

// Mock checkPermission for now or import it if needed
function checkPermission(item: FileSystemItem | undefined, mode: 'r' | 'w' | 'x', isAdmin: boolean = false) {
  if (!item) return false;
  if (isAdmin) return true;
  if (!item.permissions) return true;
  return item.permissions.others[mode] || item.permissions.group[mode] || item.permissions.owner[mode];
}

interface FilesAppProps {
  fs: FileSystemItem[];
  setFs: React.Dispatch<React.SetStateAction<FileSystemItem[]>>;
  fsLib: FileSystemLib;
  openWindow: (id: string, title?: string) => void;
  setNotepadContent: (content: string) => void;
  setActiveFileInNotepad: (file: { name: string, path: string[] } | null) => void;
  setContextMenu: (menu: { x: number, y: number, items: any[] } | null) => void;
  addNotification: (title: string, message: string, type: 'info' | 'success' | 'warning' | 'error') => void;
  clipboardHistory: string[];
  setClipboardHistory: React.Dispatch<React.SetStateAction<string[]>>;
  userName: string;
  setPrintQueue: React.Dispatch<React.SetStateAction<PrintJob[]>>;
  currentUser: any;
  networkNodes: any[];
  accentColor: string;
}

export function FilesApp({ 
  fs, setFs, fsLib, openWindow, setNotepadContent, 
  setActiveFileInNotepad, setContextMenu, addNotification,
  clipboardHistory, setClipboardHistory, userName, setPrintQueue,
  currentUser,
  networkNodes,
  accentColor
}: FilesAppProps) {
  const [currentPath, setCurrentPath] = useState<string[]>(['Documents']);
  const [selectedItemName, setSelectedItemName] = useState<string | null>(null);
  const [editingItem, setEditingItem] = useState<{ path: string[], name: string } | null>(null);
  const [newName, setNewName] = useState('');
  const [draggedItem, setDraggedItem] = useState<{ name: string, path: string[] } | null>(null);
  const [dragOverFolder, setDragOverFolder] = useState<string | null>(null);
  const [dropSuccessFolder, setDropSuccessFolder] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [propertiesItem, setPropertiesItem] = useState<FileSystemItem | null>(null);
  const [propertiesTab, setPropertiesTab] = useState<'general' | 'permissions' | 'sharing'>('general');
  const [activeMenu, setActiveMenu] = useState<string | null>(null);

  const cutItemInfo = useMemo(() => {
    const cutData = clipboardHistory.find((i: string) => i.startsWith('FILE_CUT_JSON:'));
    if (!cutData) return null;
    try {
      return JSON.parse(cutData.replace('FILE_CUT_JSON:', ''));
    } catch (e) {
      return null;
    }
  }, [clipboardHistory]);

  const currentFolder = useMemo(() => {
    try {
      const path = '/' + currentPath.join('/');
      return fsLib.list(path);
    } catch (e) {
      return [];
    }
  }, [fs, currentPath, fsLib]);

  const getFileIcon = (name: string, type: 'file' | 'folder') => {
    if (type === 'folder') return <Folder size={20} style={{ color: accentColor }} />;
    const ext = name.split('.').pop()?.toLowerCase();
    switch (ext) {
      case 'txt': return <FileText size={20} className="text-white/60" />;
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
    const oldPath = currentPath.join('/') + '/' + oldName;
    try {
      fsLib.rename(oldPath, newName.trim());
      addNotification('File Explorer', `Renamed ${oldName} to ${newName.trim()}`, 'success');
      setEditingItem(null);
      setNewName('');
    } catch (e) {
      addNotification('File Explorer', 'Error during rename', 'error');
    }
  };

  const handleUpdatePermissions = (itemName: string, newPermissions: Permissions) => {
    const itemPath = currentPath.join('/') + '/' + itemName;
    try {
      fsLib.chmod(itemPath, newPermissions);
    } catch (e) {
      addNotification('File Explorer', 'Error updating permissions', 'error');
    }
    setPropertiesItem(prev => prev ? { ...prev, permissions: newPermissions } : null);
  };

  const handleDelete = (name: string) => {
    const itemPath = currentPath.join('/') + '/' + name;
    try {
      if (currentPath[0] === 'Trash') {
        fsLib.delete(itemPath);
        addNotification('File Explorer', `Permanently deleted: ${name}`, 'warning');
      } else {
        fsLib.move(itemPath, 'Trash');
        addNotification('File Explorer', `Moved to Trash: ${name}`, 'warning');
      }
    } catch (e) {
      addNotification('File Explorer', 'Error during delete', 'error');
    }
  };

  const handleMove = (itemName: string, sourcePath: string[], targetPath: string[]) => {
    const sPath = sourcePath.join('/') + '/' + itemName;
    const tPath = targetPath.join('/');
    try {
      fsLib.move(sPath, tPath);
      addNotification('File Explorer', `Moved ${itemName} to /${tPath || 'Root'}`, 'success');
    } catch (e) {
      addNotification('File Explorer', 'Error during move', 'error');
    }
  };

  const handleEmptyTrash = () => {
    try {
      const trashItems = fsLib.list('Trash');
      trashItems.forEach(item => {
        fsLib.delete(`Trash/${item.name}`);
      });
      addNotification('File Explorer', 'Trash emptied', 'success');
    } catch (e) {
      addNotification('File Explorer', 'Error emptying trash', 'error');
    }
  };

  const onDragStart = (e: React.DragEvent, name: string) => {
    setDraggedItem({ name, path: currentPath });
    e.dataTransfer.setData('text/plain', name);
    e.dataTransfer.effectAllowed = 'move';
  };

  const onDragOver = (e: React.DragEvent, folderName?: string) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    if (folderName) {
      setDragOverFolder(folderName);
    }
  };

  const onDragLeave = () => {
    setDragOverFolder(null);
  };

  const onDrop = (e: React.DragEvent, targetPath: string[], isBackground?: boolean) => {
    e.preventDefault();
    const folderName = isBackground ? 'root' : (targetPath[targetPath.length - 1] || 'root');
    setDragOverFolder(null);
    if (draggedItem) {
      handleMove(draggedItem.name, draggedItem.path, targetPath);
      setDraggedItem(null);
      setDropSuccessFolder(folderName);
      setTimeout(() => setDropSuccessFolder(null), 1000);
    }
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

    const path = currentPath.join('/') + '/' + name;
    try {
      if (type === 'folder') {
        fsLib.mkdir(path);
      } else {
        fsLib.write(path, '');
      }
      addNotification('File Explorer', `Created new ${type}: ${name}`, 'success');
      setEditingItem({ path: currentPath, name });
      setNewName(name);
      setActiveMenu(null);
    } catch (e) {
      addNotification('File Explorer', 'Error creating item', 'error');
    }
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

    const sourcePath = currentPath.join('/') + '/' + item.name;
    const targetPath = currentPath.join('/') + '/' + name;
    
    try {
      if (item.type === 'file') {
        fsLib.write(targetPath, item.content || '');
      } else {
        fsLib.mkdir(targetPath);
        // Deep copy of folder children would be needed here for a full duplicate
      }
      addNotification('File Explorer', `Duplicated: ${item.name}`, 'success');
      setActiveMenu(null);
    } catch (e) {
      addNotification('File Explorer', 'Error duplicating item', 'error');
    }
  };

  const selectedItem = useMemo(() => 
    currentFolder.find(item => item.name === selectedItemName),
  [currentFolder, selectedItemName]);

  const handleCopy = () => {
    const itemToCopy = selectedItem;
    if (!itemToCopy) return;
    const fileData = `FILE_JSON:${JSON.stringify(itemToCopy)}`;
    setClipboardHistory((prev: string[]) => [fileData, ...prev.filter(i => i !== fileData)].slice(0, 50));
    addNotification('File Explorer', `Copied ${itemToCopy.name} to clipboard`, 'info');
    setActiveMenu(null);
  };

  const handleCut = () => {
    const itemToCut = selectedItem;
    if (!itemToCut) return;
    const fileData = `FILE_CUT_JSON:${JSON.stringify({ item: itemToCut, sourcePath: currentPath })}`;
    setClipboardHistory((prev: string[]) => [fileData, ...prev.filter(i => i !== fileData)].slice(0, 50));
    addNotification('File Explorer', `Cut ${itemToCut.name} to clipboard`, 'info');
    setActiveMenu(null);
  };

  const handlePaste = () => {
    const pasteItemData = clipboardHistory.find((i: string) => i.startsWith('FILE_JSON:') || i.startsWith('FILE_CUT_JSON:'));
    if (!pasteItemData) {
      addNotification('File Explorer', 'No file in clipboard to paste', 'warning');
      return;
    }

    if (pasteItemData.startsWith('FILE_JSON:')) {
      const item: FileSystemItem = JSON.parse(pasteItemData.replace('FILE_JSON:', ''));
      duplicateItem(item);
    } else {
      const data = JSON.parse(pasteItemData.replace('FILE_CUT_JSON:', ''));
      handleMove(data.item.name, data.sourcePath, currentPath);
      setClipboardHistory((prev: string[]) => prev.filter(i => i !== pasteItemData));
    }
    setActiveMenu(null);
  };

  const handlePrint = () => {
    if (!selectedItem || selectedItem.type !== 'file') {
      addNotification('File Explorer', 'Please select a file to print', 'warning');
      return;
    }
    const filename = selectedItem.name;
    const newJob: PrintJob = {
      id: Math.random().toString(36).substr(2, 9),
      filename,
      status: 'printing',
      timestamp: new Date().toLocaleTimeString(),
      owner: userName
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

  const openItem = (item: FileSystemItem) => {
    if (!checkPermission(item, item.type === 'folder' ? 'x' : 'r', currentUser?.isAdmin)) {
      addNotification('File Explorer', `Permission denied: ${item.name}`, 'error');
      return;
    }
    if (item.type === 'folder') {
      setCurrentPath([...currentPath, item.name]);
      setSelectedItemName(null);
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
  };

  const filteredFolder = useMemo(() => {
    if (!searchQuery.trim()) return currentFolder;
    
    const results: (FileSystemItem & { displayPath?: string[] })[] = [];
    const lowerQuery = searchQuery.toLowerCase();

    const searchRecursive = (items: FileSystemItem[], path: string[]) => {
      items.forEach(item => {
        if (item.name.toLowerCase().includes(lowerQuery)) {
          results.push({ ...item, displayPath: path });
        }
        if (item.type === 'folder' && item.children) {
          searchRecursive(item.children, [...path, item.name]);
        }
      });
    };

    searchRecursive(fs, []);
    return results;
  }, [fs, currentFolder, searchQuery]);

  return (
    <div className="h-full flex flex-col relative">
      {/* Menu Bar */}
      <div className="h-7 bg-white/5 border-b border-white/10 flex items-center px-4 gap-4 z-[60]">
        <div className="relative">
          <button 
            onClick={() => setActiveMenu(activeMenu === 'file' ? null : 'file')}
            className={cn("text-[11px] hover:text-white transition-colors h-full px-2", activeMenu === 'file' && "bg-white/10 text-white")}
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
                     <span>New Text File</span>
                     <span className="text-white/20 group-hover:text-white/40">Ctrl+Shift+N</span>
                   </button>
                   <div className="h-px bg-white/10 my-1" />
                   <button 
                     onClick={() => selectedItem && openItem(selectedItem)}
                     disabled={!selectedItem}
                     className="w-full text-left px-4 py-1.5 text-[11px] hover:bg-blue-500/20 flex items-center justify-between group disabled:opacity-30 disabled:cursor-not-allowed"
                   >
                     <span>Open File...</span>
                     <span className="text-white/20 group-hover:text-white/40">Enter</span>
                   </button>
                   <button 
                     onClick={() => {
                        if(selectedItem) {
                            setPropertiesItem(selectedItem);
                            setPropertiesTab('permissions');
                            setActiveMenu(null);
                        }
                     }}
                     disabled={!selectedItem}
                     className="w-full text-left px-4 py-1.5 text-[11px] hover:bg-blue-500/20 flex items-center justify-between group disabled:opacity-30 disabled:cursor-not-allowed"
                   >
                     <span>File Information</span>
                     <span className="text-white/20 group-hover:text-white/40">Alt+Enter</span>
                   </button>
                   <div className="h-px bg-white/10 my-1" />
                   <button 
                     onClick={handlePrint}
                     disabled={!selectedItem || selectedItem.type !== 'file'}
                     className="w-full text-left px-4 py-1.5 text-[11px] hover:bg-blue-500/20 flex items-center justify-between group disabled:opacity-30 disabled:cursor-not-allowed"
                   >
                     <span>Print</span>
                     <span className="text-white/20 group-hover:text-white/40">Ctrl+P</span>
                   </button>
                 </motion.div>
               </>
             )}
          </AnimatePresence>
        </div>
        <div className="relative">
          <button 
            onClick={() => setActiveMenu(activeMenu === 'edit' ? null : 'edit')}
            className={cn("text-[11px] hover:text-white transition-colors h-full px-2", activeMenu === 'edit' && "bg-white/10 text-white")}
          >
            Edit
          </button>
          <AnimatePresence>
            {activeMenu === 'edit' && (
              <>
                <div className="fixed inset-0" onClick={() => setActiveMenu(null)} />
                <motion.div 
                   initial={{ opacity: 0, y: 5 }}
                   animate={{ opacity: 1, y: 0 }}
                   exit={{ opacity: 0, y: 5 }}
                   className="absolute top-full left-0 w-48 glass-dark border border-white/10 rounded-lg shadow-2xl py-1 mt-1 z-[70]"
                 >
                   <button 
                    onClick={handleCut}
                    disabled={!selectedItem}
                    className="w-full text-left px-4 py-1.5 text-[11px] hover:bg-blue-500/20 flex items-center justify-between group disabled:opacity-30 disabled:cursor-not-allowed"
                  >
                    <span>Cut</span>
                    <span className="text-white/20 group-hover:text-white/40">Ctrl+X</span>
                  </button>
                  <button 
                    onClick={handleCopy}
                    disabled={!selectedItem}
                    className="w-full text-left px-4 py-1.5 text-[11px] hover:bg-blue-500/20 flex items-center justify-between group disabled:opacity-30 disabled:cursor-not-allowed"
                  >
                    <span>Copy</span>
                    <span className="text-white/20 group-hover:text-white/40">Ctrl+C</span>
                  </button>
                  <button 
                    onClick={handlePaste}
                    className="w-full text-left px-4 py-1.5 text-[11px] hover:bg-blue-500/20 flex items-center justify-between group"
                  >
                    <span>Paste</span>
                    <span className="text-white/20 group-hover:text-white/40">Ctrl+V</span>
                  </button>
                  <div className="h-px bg-white/10 my-1" />
                  <button 
                    onClick={() => selectedItem && handleDelete(selectedItem.name)}
                    disabled={!selectedItem}
                    className="w-full text-left px-4 py-1.5 text-[11px] hover:bg-red-500/20 text-red-400 disabled:text-red-400/30 flex items-center justify-between group disabled:cursor-not-allowed"
                  >
                    <span>Delete File</span>
                    <span className="text-red-400/20 group-hover:text-red-400/40">Del</span>
                  </button>
                 </motion.div>
               </>
             )}
           </AnimatePresence>
        </div>
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
              className="w-full bg-white/5 border border-white/10 rounded-full py-1 pl-8 pr-3 text-[10px] outline-none focus:bg-white/10 transition-all font-mono"
              style={{ borderBottomColor: searchQuery ? accentColor : undefined }}
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
        <div className="w-44 bg-black/20 border-r border-white/10 p-3 space-y-4 overflow-y-auto no-scrollbar">
          <div>
            <h3 className="text-[10px] font-bold text-white/20 uppercase tracking-widest px-2 mb-2">Local drive</h3>
            <div className="space-y-1">
              {fs.filter(f => f.category === 'local').map((folder) => (
                <button 
                  key={folder.name}
                  onClick={() => setCurrentPath([folder.name])}
                  onDragOver={(e) => onDragOver(e, folder.name)}
                  onDragLeave={onDragLeave}
                  onDrop={(e) => onDrop(e, [folder.name])}
                  onContextMenu={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    setContextMenu({
                      x: e.clientX,
                      y: e.clientY,
                      items: [
                        { label: 'Open', icon: <Play size={14} />, onClick: () => setCurrentPath([folder.name]) },
                        { label: 'Properties', icon: <Info size={14} />, onClick: () => { setPropertiesItem(folder); setPropertiesTab('general'); } },
                      ]
                    });
                  }}
                  className={cn(
                    "w-full flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs transition-all relative overflow-hidden",
                    currentPath[0] === folder.name ? "text-white" : "text-white/40 hover:bg-white/5",
                    dragOverFolder === folder.name && "text-white ring-2 shadow-lg",
                    dropSuccessFolder === folder.name && "bg-emerald-500/20 text-emerald-400 ring-2 ring-emerald-500/50"
                  )}
                  style={
                    currentPath[0] === folder.name 
                      ? { backgroundColor: `${accentColor}33`, color: accentColor } 
                      : dragOverFolder === folder.name 
                        ? { backgroundColor: `${accentColor}66`, ringColor: accentColor } 
                        : {}
                  }
                >
                  {folder.name === 'Picture' ? <ImageIcon size={14} /> : <Folder size={14} style={{ color: currentPath[0] === folder.name ? accentColor : undefined }} />}
                  <span className="truncate">{folder.name}</span>
                </button>
              ))}
            </div>
          </div>

          <div>
            <h3 className="text-[10px] font-bold text-white/20 uppercase tracking-widest px-2 mb-2">Settings</h3>
            <div className="space-y-1">
              {fs.filter(f => f.category === 'settings').map((folder) => (
                <button 
                  key={folder.name}
                  onClick={() => setCurrentPath([folder.name])}
                  onDragOver={(e) => onDragOver(e, folder.name)}
                  onDragLeave={onDragLeave}
                  onDrop={(e) => onDrop(e, [folder.name])}
                  onContextMenu={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    setContextMenu({
                      x: e.clientX,
                      y: e.clientY,
                      items: [
                        { label: 'Open', icon: <Play size={14} />, onClick: () => setCurrentPath([folder.name]) },
                        { label: 'Properties', icon: <Info size={14} />, onClick: () => { setPropertiesItem(folder); setPropertiesTab('general'); } },
                      ]
                    });
                  }}
                  className={cn(
                    "w-full flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs transition-all relative",
                    currentPath[0] === folder.name ? "text-white" : "text-white/40 hover:bg-white/5",
                    dragOverFolder === folder.name && "text-white ring-2 shadow-lg",
                    dropSuccessFolder === folder.name && "bg-emerald-500/20 text-emerald-400 ring-2 ring-emerald-500/50"
                  )}
                  style={
                    currentPath[0] === folder.name 
                      ? { backgroundColor: `${accentColor}33`, color: accentColor } 
                      : dragOverFolder === folder.name 
                        ? { backgroundColor: `${accentColor}66`, ringColor: accentColor } 
                        : {}
                  }
                >
                  <SettingsIcon size={14} />
                  <span className="truncate">{folder.name}</span>
                </button>
              ))}
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between px-2 mb-2">
              <h3 className="text-[10px] font-bold text-white/20 uppercase tracking-widest">mDNS Nodes</h3>
              <div className="w-1.5 h-1.5 rounded-full bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.5)] animate-pulse" />
            </div>
            <div className="space-y-1">
              {networkNodes.map((node: any) => (
                <button 
                  key={node.id}
                  onClick={() => {
                    if (node.isAuthorized) {
                      addNotification('GlassDrive', `Mounting ${node.hostname}...`, 'info');
                    } else {
                      addNotification('Security', `Authorization required for ${node.hostname}. Open Settings > Network.`, 'error');
                    }
                  }}
                  className={cn(
                    "w-full flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs transition-all relative group",
                    node.isAuthorized ? "text-white/60 hover:bg-white/5" : "text-white/20 opacity-50 grayscale cursor-not-allowed"
                  )}
                >
                  <Server size={14} className={node.isAuthorized ? "text-blue-400" : "text-white/20"} />
                  <span className="truncate">{node.hostname}</span>
                  {node.isAuthorized && (
                    <div className="absolute right-2 w-1.5 h-1.5 rounded-full bg-emerald-500 border border-black" title="Authorized" />
                  )}
                </button>
              ))}
              <div className="px-3 py-1.5 text-[10px] text-white/10 border border-white/5 border-dashed rounded-lg flex items-center gap-2">
                <RefreshCw size={10} className="animate-spin-slow opacity-20" />
                Listening...
              </div>
            </div>
          </div>

          <div className="pt-2 border-t border-white/5">
             {fs.filter(f => f.category === 'trash').map((folder) => (
                <button 
                  key={folder.name}
                  onClick={() => setCurrentPath([folder.name])}
                  onDragOver={(e) => onDragOver(e, folder.name)}
                  onDragLeave={onDragLeave}
                  onDrop={(e) => onDrop(e, [folder.name])}
                  className={cn(
                    "w-full flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs transition-all relative",
                    currentPath[0] === folder.name ? "bg-red-500/10 text-red-400" : "text-white/40 hover:bg-white/5",
                    dragOverFolder === folder.name && "bg-red-500/30 text-white ring-2 ring-red-500/50 shadow-lg shadow-red-500/20",
                    dropSuccessFolder === folder.name && "bg-emerald-500/20 text-emerald-400 ring-2 ring-emerald-500/50"
                  )}
                >
                  <Trash size={14} />
                  <span className="truncate">{folder.name}</span>
                </button>
              ))}
          </div>
        </div>

        {/* Main Area */}
        <div 
          className={cn(
            "flex-1 p-4 overflow-y-auto transition-all",
            dragOverFolder === 'root' && "bg-blue-500/5 ring-4 ring-inset ring-blue-500/20",
            dropSuccessFolder === 'root' && "bg-emerald-500/5 ring-4 ring-inset ring-emerald-500/20"
          )}
          onClick={() => setSelectedItemName(null)}
          onDragOver={(e) => onDragOver(e, 'root')}
          onDragLeave={onDragLeave}
          onDrop={(e) => onDrop(e, currentPath, true)}
          onContextMenu={(e) => {
            e.preventDefault();
            setContextMenu({
              x: e.clientX,
              y: e.clientY,
              items: [
                { label: 'New Folder', icon: <Folder size={14} />, onClick: () => createNewItem('folder') },
                { label: 'New File', icon: <FileText size={14} />, onClick: () => createNewItem('file') },
                { label: 'Refresh', icon: <RefreshCw size={14} />, onClick: () => addNotification('System', 'Folder refreshed', 'success') },
                { label: 'Paste', icon: <Clipboard size={14} />, onClick: handlePaste },
              ]
            });
          }}
        >
          <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8 gap-4">
            {filteredFolder.map((item, idx) => {
              const itemPath = item.displayPath || currentPath;
              const isCut = cutItemInfo && 
                           cutItemInfo.item.name === item.name && 
                           JSON.stringify(cutItemInfo.sourcePath) === JSON.stringify(itemPath);

              return (
                <div 
                  key={`${item.name}-${item.type}-${idx}`}
                  draggable
                  onDragStart={(e) => onDragStart(e, item.name)}
                  onDragOver={(e) => item.type === 'folder' ? onDragOver(e, item.name) : undefined}
                  onDragLeave={onDragLeave}
                  onDrop={item.type === 'folder' ? (e) => {
                    e.stopPropagation();
                    onDrop(e, [...itemPath, item.name]);
                  } : undefined}
                  className={cn(
                    "group relative glass p-4 rounded-xl flex flex-col items-center gap-2 hover:bg-white/10 transition-all cursor-pointer border border-transparent select-none",
                    draggedItem?.name === item.name && "opacity-50 scale-95",
                    isCut && "opacity-30 grayscale-[0.5] border-dashed border-white/20",
                    dropSuccessFolder === item.name && item.type === 'folder' && "bg-emerald-500/20 border-emerald-500/50 ring-2 ring-emerald-500/50"
                  )}
                  style={{
                    backgroundColor: selectedItemName === item.name 
                      ? `${accentColor}33` 
                      : (dragOverFolder === item.name && item.type === 'folder') 
                        ? `${accentColor}66` 
                        : undefined,
                    borderColor: selectedItemName === item.name 
                      ? `${accentColor}80` 
                      : (dragOverFolder === item.name && item.type === 'folder') 
                        ? accentColor 
                        : undefined,
                    boxShadow: (dragOverFolder === item.name && item.type === 'folder')
                      ? `0 0 15px ${accentColor}40`
                      : undefined
                  }}
                  onClick={(e) => { e.stopPropagation(); setSelectedItemName(item.name); }}
                  onDoubleClick={() => {
                    if (searchQuery.trim() && item.displayPath) {
                      if (item.type === 'folder') {
                        setCurrentPath([...item.displayPath, item.name]);
                        setSearchQuery('');
                      } else {
                        openItem(item);
                      }
                    } else {
                      openItem(item);
                    }
                  }}
                  onContextMenu={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    setSelectedItemName(item.name);
                    setContextMenu({
                      x: e.clientX,
                      y: e.clientY,
                      items: [
                        { label: 'Open', icon: <Play size={14} />, onClick: () => {
                          if (item.type === 'folder') {
                             if (item.displayPath) {
                               setCurrentPath([...item.displayPath, item.name]);
                               setSearchQuery('');
                             } else {
                               setCurrentPath([...currentPath, item.name]);
                             }
                          }
                          else openItem(item);
                        }},
                        { label: 'Rename', icon: <Edit2 size={14} />, onClick: () => { setEditingItem({ path: itemPath, name: item.name }); setNewName(item.name); }},
                        { label: 'Cut', icon: <Scissors size={14} />, onClick: () => handleCut() },
                        { label: 'Copy', icon: <Copy size={14} />, onClick: () => handleCopy() },
                        { label: 'Properties', icon: <Info size={14} />, onClick: () => { setPropertiesItem(item); setPropertiesTab('general'); } },
                        { label: 'Delete', icon: <Trash size={14} />, onClick: () => handleDelete(item.name), variant: 'danger' },
                      ]
                    });
                  }}
                >
                  <div className="w-12 h-12 flex items-center justify-center relative">
                    {getFileIcon(item.name, item.type)}
                    {searchQuery.trim() && item.displayPath && (
                      <div 
                        className="absolute -bottom-1 -right-1 rounded-full p-0.5 shadow-lg border border-white/20"
                        style={{ backgroundColor: accentColor }}
                      >
                        <Search size={8} className="text-white" />
                      </div>
                    )}
                    {isCut && (
                      <div className="absolute -top-1 -left-1 bg-white/10 rounded-full p-1 backdrop-blur-sm border border-white/10">
                        <Scissors size={10} className="text-white/40" />
                      </div>
                    )}
                  </div>
                  
                  <div className="flex flex-col items-center w-full min-w-0">
                    {editingItem?.name === item.name ? (
                      <input 
                        autoFocus
                        className="w-full bg-white/10 border rounded px-1 py-0.5 text-[10px] text-center outline-none"
                        style={{ borderColor: `${accentColor}80` }}
                        value={newName}
                        onChange={(e) => setNewName(e.target.value)}
                        onBlur={() => handleRename(item.name)}
                        onKeyDown={(e) => e.key === 'Enter' && handleRename(item.name)}
                      />
                    ) : (
                      <span className="text-[11px] text-center truncate w-full group-hover:whitespace-normal group-hover:overflow-visible group-hover:bg-black/40 group-hover:rounded px-1">{item.name}</span>
                    )}
                    {searchQuery.trim() && item.displayPath && (
                      <span className="text-[8px] text-white/30 truncate w-full text-center">
                        /{item.displayPath.join('/')}
                      </span>
                    )}
                  </div>
                  
                  <div className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 transition-opacity flex gap-1 bg-black/40 rounded p-0.5">
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
                        handleDelete(item.name);
                      }}
                      className="p-1 hover:bg-white/10 rounded text-white/40 hover:text-red-400"
                      title="Delete"
                    >
                      <Trash size={10} />
                    </button>
                  </div>
                </div>
              );
            })}
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
                      onClick={() => setPropertiesTab('general')}
                      className={cn(
                        "px-3 py-1 rounded-md text-[10px] font-bold transition-all",
                        propertiesTab === 'general' ? "bg-white/10 text-white" : "text-white/30 hover:text-white/60"
                      )}
                    >
                      GENERAL
                    </button>
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

              <div className="p-6 space-y-6 overflow-y-auto max-h-[60vh] no-scrollbar">
                {propertiesTab === 'general' ? (
                  <div className="space-y-6">
                    <div className="flex items-center gap-4">
                      <div className="w-16 h-16 rounded-2xl bg-white/5 flex items-center justify-center">
                        {getFileIcon(propertiesItem.name, propertiesItem.type)}
                      </div>
                      <div className="min-w-0 flex-1">
                        <h3 className="text-lg font-bold truncate">{propertiesItem.name}</h3>
                        <p className="text-[10px] text-white/40 uppercase tracking-widest">{propertiesItem.type}</p>
                      </div>
                    </div>

                    <div className="space-y-4 bg-white/5 rounded-2xl p-4 border border-white/5">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-bold text-white/20 uppercase">Location</span>
                        <span className="text-[10px] text-white/60 font-mono">/{currentPath.join('/')}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-bold text-white/20 uppercase">Size</span>
                        <span className="text-[10px] text-white/60 font-mono">
                          {propertiesItem.type === 'file' ? `${(propertiesItem.content?.length || 0)} bytes` : '--'}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-bold text-white/20 uppercase">Last Modified</span>
                        <span className="text-[10px] text-white/60 font-mono">Apr 19 2026, 09:59</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 p-4 bg-blue-500/5 border border-blue-500/20 rounded-2xl">
                      <Shield size={16} className="text-blue-400" />
                      <div>
                        <p className="text-[10px] text-white/60">This item is protected by kernel-level security.</p>
                      </div>
                    </div>
                  </div>
                ) : propertiesTab === 'permissions' ? (
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

const Scissors = ({ size, className }: { size?: number, className?: string }) => (
  <svg 
    width={size} 
    height={size} 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="currentColor" 
    strokeWidth="2" 
    strokeLinecap="round" 
    strokeLinejoin="round" 
    className={className}
  >
    <circle cx="6" cy="6" r="3" />
    <circle cx="6" cy="18" r="3" />
    <line x1="20" y1="4" x2="8.12" y2="15.88" />
    <line x1="14.47" y1="14.48" x2="20" y2="20" />
    <line x1="8.12" y1="8.12" x2="12" y2="12" />
  </svg>
);
