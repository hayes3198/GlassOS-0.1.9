import { FileSystemItem, Permissions } from '../types';

export const DEFAULT_PERMISSIONS: Permissions = {
  owner: { r: true, w: true, x: true },
  group: { r: true, w: false, x: true },
  others: { r: true, w: false, x: false },
};

export class FileSystemLib {
  private fs: FileSystemItem[];
  private setFs: (fs: FileSystemItem[]) => void;
  private static listeners: Map<string, Array<(content: string | null) => void>> = new Map();

  constructor(fs: FileSystemItem[], setFs: (fs: FileSystemItem[]) => void) {
    this.fs = fs;
    this.setFs = setFs;
  }

  private static notify(path: string, content: string | null): void {
    const callbacks = this.listeners.get(path);
    if (callbacks) {
      callbacks.forEach(cb => cb(content));
    }
  }

  watch(path: string, callback: (content: string | null) => void): () => void {
    if (!FileSystemLib.listeners.has(path)) {
      FileSystemLib.listeners.set(path, []);
    }
    FileSystemLib.listeners.get(path)?.push(callback);
    return () => {
      const callbacks = FileSystemLib.listeners.get(path);
      if (callbacks) {
        FileSystemLib.listeners.set(path, callbacks.filter(cb => cb !== callback));
      }
    };
  }

  mount(path: string, items: FileSystemItem[]): void {
    const parts = this.getPathParts(path);
    const targetDir = this.findRecursive(this.fs, parts);
    
    if (targetDir && targetDir.type === 'folder') {
      const updatedParent = { 
        ...targetDir, 
        children: [...(targetDir.children || []), ...items] 
      };
      this.setFs(this.updateRecursive(this.fs, parts, updatedParent));
    } else if (parts.length === 0) {
      this.setFs([...this.fs, ...items]);
    }
  }

  private findRecursive(items: FileSystemItem[], pathParts: string[]): FileSystemItem | null {
    if (pathParts.length === 0) return null;
    const [currentName, ...remainingPath] = pathParts;
    const found = items.find(item => item.name === currentName);
    
    if (!found) return null;
    if (remainingPath.length === 0) return found;
    if (found.type === 'folder' && found.children) {
      return this.findRecursive(found.children, remainingPath);
    }
    return null;
  }

  private updateRecursive(items: FileSystemItem[], pathParts: string[], newItem: FileSystemItem | null): FileSystemItem[] {
    if (pathParts.length === 0) return items;
    const [currentName, ...remainingPath] = pathParts;

    return items.map(item => {
      if (item.name === currentName) {
        if (remainingPath.length === 0) {
          return newItem as FileSystemItem; // Replace or delete (if newItem is null, filter later)
        }
        if (item.type === 'folder' && item.children) {
          return {
            ...item,
            children: this.updateRecursive(item.children, remainingPath, newItem)
          };
        }
      }
      return item;
    }).filter(item => item !== null) as FileSystemItem[];
  }

  private getPathParts(path: string): string[] {
    return path.split('/').filter(p => p.length > 0);
  }

  read(path: string): string | null {
    const parts = this.getPathParts(path);
    const item = this.findRecursive(this.fs, parts);
    if (item && item.type === 'file') {
      return item.content || '';
    }
    return null;
  }

  find(query: string, searchContent: boolean = false): { path: string, name: string }[] {
    const results: { path: string, name: string }[] = [];
    const pattern = new RegExp('^' + query.replace(/\*/g, '.*').replace(/\?/g, '.') + '$', 'i');

    const traverse = (items: FileSystemItem[], currentPath: string) => {
      for (const item of items) {
        const itemPath = currentPath === '/' ? `/${item.name}` : `${currentPath}/${item.name}`;
        
        if (pattern.test(item.name)) {
          results.push({ path: currentPath, name: item.name });
        } else if (searchContent && item.type === 'file' && item.content && item.content.toLowerCase().includes(query.toLowerCase())) {
          results.push({ path: currentPath, name: item.name });
        }

        if (item.type === 'folder' && item.children) {
          traverse(item.children, itemPath);
        }
      }
    };

    traverse(this.fs, '/');
    return results;
  }

  write(path: string, content: string): void {
    const parts = this.getPathParts(path);
    const fileName = parts[parts.length - 1];
    const dirParts = parts.slice(0, -1);
    
    const existing = this.findRecursive(this.fs, parts);
    if (existing) {
      const updatedFs = this.updateRecursive(this.fs, parts, { ...existing, content });
      this.setFs(updatedFs);
    } else {
      // Create new file
      const parentDir = dirParts.length === 0 ? null : this.findRecursive(this.fs, dirParts);
      if (dirParts.length === 0) {
        this.setFs([...this.fs, { name: fileName, type: 'file', content, permissions: DEFAULT_PERMISSIONS }]);
      } else if (parentDir && parentDir.type === 'folder') {
        const newFile: FileSystemItem = { name: fileName, type: 'file', content, permissions: DEFAULT_PERMISSIONS };
        const updatedParent = { ...parentDir, children: [...(parentDir.children || []), newFile] };
        const updatedFs = this.updateRecursive(this.fs, dirParts, updatedParent);
        this.setFs(updatedFs);
      }
    }
    FileSystemLib.notify(path, content);
  }

  delete(path: string): void {
    const parts = this.getPathParts(path);
    const updatedFs = this.updateRecursive(this.fs, parts, null);
    this.setFs(updatedFs);
    FileSystemLib.notify(path, null);
  }

  mkdir(path: string): void {
    const parts = this.getPathParts(path);
    const folderName = parts[parts.length - 1];
    const dirParts = parts.slice(0, -1);

    if (dirParts.length === 0) {
      this.setFs([...this.fs, { name: folderName, type: 'folder', children: [], permissions: DEFAULT_PERMISSIONS }]);
    } else {
      const parentDir = this.findRecursive(this.fs, dirParts);
      if (parentDir && parentDir.type === 'folder') {
        const newFolder: FileSystemItem = { name: folderName, type: 'folder', children: [], permissions: DEFAULT_PERMISSIONS };
        const updatedParent = { ...parentDir, children: [...(parentDir.children || []), newFolder] };
        const updatedFs = this.updateRecursive(this.fs, dirParts, updatedParent);
        this.setFs(updatedFs);
      }
    }
  }

  list(path: string): FileSystemItem[] {
    if (path === '/' || path === '') return this.fs;
    const parts = this.getPathParts(path);
    const item = this.findRecursive(this.fs, parts);
    return (item && item.type === 'folder') ? (item.children || []) : [];
  }

  exists(path: string): boolean {
    const parts = this.getPathParts(path);
    return !!this.findRecursive(this.fs, parts);
  }

  move(sourcePath: string, targetPath: string): void {
    const sParts = this.getPathParts(sourcePath);
    const item = this.findRecursive(this.fs, sParts);
    if (!item) return;

    const fsAfterDelete = this.updateRecursive(this.fs, sParts, null);
    const tParts = this.getPathParts(targetPath);
    
    if (tParts.length === 0) {
      this.setFs([...fsAfterDelete, item]);
      return;
    }

    const targetDir = this.findRecursive(fsAfterDelete, tParts);
    if (targetDir && targetDir.type === 'folder') {
      const updatedParent = { ...targetDir, children: [...(targetDir.children || []), item] };
      const updatedFs = this.updateRecursive(fsAfterDelete, tParts, updatedParent);
      this.setFs(updatedFs);
    }
  }

  rename(oldPath: string, newName: string): void {
    const parts = this.getPathParts(oldPath);
    const item = this.findRecursive(this.fs, parts);
    if (!item) return;

    const renamedItem = { ...item, name: newName };
    const updatedFs = this.updateRecursive(this.fs, parts, renamedItem);
    this.setFs(updatedFs);
  }

  chmod(path: string, permissions: Permissions): void {
    const parts = this.getPathParts(path);
    const item = this.findRecursive(this.fs, parts);
    if (!item) return;

    const updatedItem = { ...item, permissions };
    const updatedFs = this.updateRecursive(this.fs, parts, updatedItem);
    this.setFs(updatedFs);
  }
}
