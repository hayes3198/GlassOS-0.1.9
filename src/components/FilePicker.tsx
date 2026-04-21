import React, { useState, useMemo } from 'react';
import { 
  Folder, 
  FileText, 
  Image as ImageIcon, 
  FileCode, 
  FileJson, 
  X, 
  ChevronRight, 
  HardDrive,
  Search,
  Check
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { FileSystemItem } from '../types';
import { FileSystemLib } from '../lib/FileSystem.lib';

interface FilePickerProps {
  title: string;
  fs: FileSystemItem[];
  fsLib: FileSystemLib;
  currentPath?: string[];
  onSelect: (path: string, item: FileSystemItem) => void;
  onCancel: () => void;
  allowedExtensions?: string[];
  mode?: 'open' | 'save';
  initialFileName?: string;
  accentColor?: string;
}

const cn = (...classes: (string | boolean | undefined)[]) => classes.filter(Boolean).join(' ');

export function FilePicker({ 
  title, 
  fs, 
  fsLib, 
  currentPath: initialPath = ['Documents'], 
  onSelect, 
  onCancel,
  allowedExtensions,
  mode = 'open',
  initialFileName = '',
  accentColor = '#3b82f6'
}: FilePickerProps) {
  const [currentPath, setCurrentPath] = useState<string[]>(initialPath);
  const [selectedItemName, setSelectedItemName] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [fileName, setFileName] = useState(initialFileName);

  const currentFolder = useMemo(() => {
    try {
      return fsLib.list(currentPath.join('/'));
    } catch (e) {
      return [];
    }
  }, [fs, currentPath, fsLib]);

  const filteredItems = useMemo(() => {
    let items = currentFolder;
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      items = items.filter(item => item.name.toLowerCase().includes(query));
    }
    
    if (mode === 'open' && allowedExtensions && allowedExtensions.length > 0) {
      items = items.filter(item => {
        if (item.type === 'folder') return true;
        const ext = item.name.split('.').pop()?.toLowerCase();
        return ext && allowedExtensions.includes(ext);
      });
    }
    
    return items;
  }, [currentFolder, searchQuery, mode, allowedExtensions]);

  const getFileIcon = (name: string, type: 'file' | 'folder') => {
    if (type === 'folder') return <Folder size={18} style={{ color: accentColor }} />;
    const ext = name.split('.').pop()?.toLowerCase();
    switch (ext) {
      case 'b': return <FileCode size={18} className="text-green-400" />;
      case 'json': return <FileJson size={18} className="text-yellow-400" />;
      case 'jpg':
      case 'png': return <ImageIcon size={18} className="text-purple-400" />;
      default: return <FileText size={18} className="text-white/40" />;
    }
  };

  const handleSelect = () => {
    if (mode === 'save') {
      if (!fileName.trim()) return;
      const fullPath = currentPath.join('/') + '/' + fileName;
      onSelect(fullPath, { name: fileName, type: 'file' } as any);
    } else {
      if (!selectedItemName) return;
      const item = currentFolder.find(i => i.name === selectedItemName);
      if (item && item.type === 'file') {
        const fullPath = currentPath.join('/') + '/' + item.name;
        onSelect(fullPath, item);
      }
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className="fixed inset-0 z-[2000] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm"
    >
      <div className="w-full max-w-2xl h-[500px] glass-dark rounded-2xl border border-white/20 shadow-2xl flex flex-col overflow-hidden backdrop-blur-xl">
        {/* Header */}
        <div className="h-14 border-b border-white/10 flex items-center justify-between px-6 bg-white/5">
          <h2 className="text-sm font-semibold text-white/80">{title}</h2>
          <button 
            onClick={onCancel}
            className="p-1 hover:bg-white/10 rounded-full transition-colors text-white/40 hover:text-white"
          >
            <X size={18} />
          </button>
        </div>

        {/* Toolbar */}
        <div className="h-12 border-b border-white/10 flex items-center px-4 gap-2 bg-white/5">
          <div className="flex items-center gap-1 overflow-x-auto no-scrollbar flex-1 mr-4">
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
                  className="text-xs transition-colors text-white/60 hover:text-white whitespace-nowrap"
                >
                  {segment}
                </button>
                {i < currentPath.length - 1 && <ChevronRight size={12} className="text-white/20" />}
              </React.Fragment>
            ))}
          </div>
          
          <div className="relative w-48">
            <Search size={12} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-white/30" />
            <input 
              type="text"
              placeholder="Filter..."
              className="w-full bg-white/5 border border-white/10 rounded-full py-1 pl-8 pr-3 text-[10px] outline-none focus:bg-white/10 transition-all"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4 grid grid-cols-4 sm:grid-cols-5 gap-3 no-scrollbar content-start">
          {filteredItems.map((item, idx) => (
            <div 
              key={`${item.name}-${idx}`}
              onClick={() => {
                if (item.type === 'folder') {
                  setCurrentPath([...currentPath, item.name]);
                  setSelectedItemName(null);
                } else {
                  setSelectedItemName(item.name);
                  if (mode === 'save') setFileName(item.name);
                }
              }}
              className={cn(
                "group flex flex-col items-center gap-2 p-3 rounded-xl transition-all cursor-pointer border border-transparent hover:bg-white/5",
                selectedItemName === item.name && "bg-white/10"
              )}
              style={selectedItemName === item.name ? { borderColor: accentColor + '40', backgroundColor: accentColor + '20' } : {}}
            >
              <div className="relative">
                {getFileIcon(item.name, item.type)}
                {selectedItemName === item.name && (
                  <div 
                    className="absolute -top-1 -right-1 w-3 h-3 rounded-full flex items-center justify-center"
                    style={{ backgroundColor: accentColor }}
                  >
                    <Check size={8} className="text-white" />
                  </div>
                )}
              </div>
              <span className="text-[10px] text-white/60 text-center truncate w-full group-hover:text-white">
                {item.name}
              </span>
            </div>
          ))}
          {filteredItems.length === 0 && (
            <div className="col-span-full h-full flex flex-col items-center justify-center text-white/20 gap-2 opacity-50">
              <Folder size={48} className="mb-2" />
              <p className="text-xs">No items found</p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="h-16 border-t border-white/10 bg-white/5 px-6 flex items-center gap-4">
          <div className="flex-1">
            <input 
              type="text"
              placeholder={mode === 'save' ? "Filename..." : "Select a file"}
              disabled={mode === 'open'}
              className={cn(
                "w-full bg-white/5 border border-white/10 rounded-lg py-2 px-4 text-xs outline-none transition-all",
                mode === 'open' ? "text-white/40" : "focus:bg-white/10 focus:border-white/20"
              )}
              value={mode === 'open' ? (selectedItemName || '') : fileName}
              onChange={(e) => setFileName(e.target.value)}
            />
          </div>
          <div className="flex items-center gap-2">
            <button 
              onClick={onCancel}
              className="px-5 py-2 text-xs font-medium text-white/60 hover:text-white transition-colors"
            >
              Cancel
            </button>
            <button 
              onClick={handleSelect}
              disabled={mode === 'open' ? !selectedItemName : !fileName.trim()}
              className="px-6 py-2 text-xs font-bold rounded-lg transition-all disabled:opacity-30 disabled:cursor-not-allowed"
              style={{ backgroundColor: accentColor, color: '#fff' }}
            >
              {mode === 'open' ? 'Open' : 'Save'}
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
