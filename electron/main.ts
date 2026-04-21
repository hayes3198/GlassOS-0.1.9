import { app, BrowserWindow, ipcMain, shell } from 'electron';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// The built directory structure
//
// â”œâ”€â”€ dist
// â”‚  â”œâ”€â”€ index.html
// â”‚  â”œâ”€â”€ main.js
// â”‚  â””â”€â”€ preload.js
//

process.env.DIST = path.join(__dirname, '../dist');
process.env.VITE_PUBLIC = app.isPackaged ? process.env.DIST : path.join(__dirname, '../public');


let win: BrowserWindow | null;
// â–ªï¸ï¸ï¸ VITE_DEV_SERVER_URL is provided by vite-plugin-electron
const VITE_DEV_SERVER_URL = process.env['VITE_DEV_SERVER_URL'];

function createWindow() {
  win = new BrowserWindow({
    width: 1200,
    height: 800,
    icon: path.join(process.env.VITE_PUBLIC, 'electron-vite.svg'),
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      nodeIntegration: false,
      contextIsolation: true,
    },
    //Path A: Acrylic/Vibrancy Integration
    vibrancy: 'under-window', // macOS
    backgroundMaterial: 'acrylic', // Windows 11
    transparent: true,
    titleBarStyle: 'hiddenInset',
    show: false,
  });

  win.once('ready-to-show', () => {
    win?.show();
  });

  // Test active push message to Renderer-process.
  win.webContents.on('did-finish-load', () => {
    win?.webContents.send('main-process-message', (new Date).toLocaleString());
  });

  if (VITE_DEV_SERVER_URL) {
    win.loadURL(VITE_DEV_SERVER_URL);
  } else {
    // win.loadFile('dist/index.html')
    win.loadFile(path.join(process.env.DIST, 'index.html'));
  }

  // Open external links in browser
  win.webContents.setWindowOpenHandler(({ url }) => {
    if (url.startsWith('https:')) shell.openExternal(url);
    return { action: 'deny' };
  });
}

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
    win = null;
  }
});

app.on('activate', () => {
  // On OS X it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});

app.whenReady().then(createWindow);

// IPC Handlers for Path A functionality
ipcMain.handle('execute-command', async (_, command: string) => {
  // Here we would use child_process to actually run shell commands
  // For safety in this demo, we'll return a simulated success
  console.log(`[Electron Main] Executing native command: ${command}`);
  return {
    stdout: `Native execution of "${command}" success.\nGlassOS Kernel v1.0.4`,
    stderr: '',
    code: 0
  };
});

ipcMain.handle('get-system-info', () => {
  return {
    platform: process.platform,
    arch: process.arch,
    version: app.getVersion(),
    memory: process.getProcessMemoryInfo(),
  };
});
