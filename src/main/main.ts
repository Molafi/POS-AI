import { app, BrowserWindow, ipcMain } from 'electron';
import path from 'path';
import { startServer } from './server';
import { initDatabase } from './database';
import { startScheduler, stopScheduler } from './services/scheduler';
import { initAutoUpdater, checkForUpdates } from './services/updater';

let mainWindow: BrowserWindow | null = null;
let autoSaveTimer: NodeJS.Timeout | null = null;

const SERVER_PORT = 3847;
const AUTO_SAVE_INTERVAL = 30000; // 30 seconds

async function createWindow(): Promise<void> {
  mainWindow = new BrowserWindow({
    width: 1400,
    height: 900,
    minWidth: 1024,
    minHeight: 768,
    frame: false,
    titleBarStyle: 'hidden',
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, 'preload.js'),
    },
  });

  if (process.env.NODE_ENV === 'development') {
    mainWindow.loadURL('http://localhost:5173');
    mainWindow.webContents.openDevTools();
  } else {
    mainWindow.loadFile(path.join(__dirname, '../renderer/index.html'));
  }

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

function startAutoSaveTimer(): void {
  autoSaveTimer = setInterval(() => {
    if (mainWindow && !mainWindow.isDestroyed()) {
      mainWindow.webContents.send('cart:auto-save');
    }
  }, AUTO_SAVE_INTERVAL);
}

function stopAutoSaveTimer(): void {
  if (autoSaveTimer) {
    clearInterval(autoSaveTimer);
    autoSaveTimer = null;
  }
}

async function bootstrap(): Promise<void> {
  await initDatabase();
  await startServer(SERVER_PORT);
  await createWindow();

  // Initialize services
  startScheduler();
  startAutoSaveTimer();

  // Initialize auto-updater (only in production)
  if (mainWindow && app.isPackaged) {
    initAutoUpdater(mainWindow);
    checkForUpdates();
  }
}

// Window control IPC handlers
ipcMain.handle('window:minimize', () => {
  mainWindow?.minimize();
});

ipcMain.handle('window:maximize', () => {
  if (mainWindow?.isMaximized()) {
    mainWindow.unmaximize();
  } else {
    mainWindow?.maximize();
  }
});

ipcMain.handle('window:close', () => {
  mainWindow?.close();
});

ipcMain.handle('app:getVersion', () => {
  return app.getVersion();
});

ipcMain.handle('updater:check', () => {
  checkForUpdates();
});

app.whenReady().then(bootstrap);

app.on('window-all-closed', () => {
  stopAutoSaveTimer();
  stopScheduler();
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  if (mainWindow === null) {
    createWindow();
  }
});
