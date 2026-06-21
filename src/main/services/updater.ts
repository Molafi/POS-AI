import { autoUpdater } from 'electron-updater';
import { BrowserWindow } from 'electron';

let mainWindow: BrowserWindow | null = null;

export function initAutoUpdater(window: BrowserWindow): void {
  mainWindow = window;

  // Configure update source - GitHub Releases
  autoUpdater.setFeedURL({
    provider: 'github',
    owner: 'Molafi',
    repo: 'POS-AI',
  });

  autoUpdater.autoDownload = false;
  autoUpdater.autoInstallOnAppQuit = true;

  autoUpdater.on('checking-for-update', () => {
    console.log('Checking for updates...');
    sendStatusToWindow('checking-for-update');
  });

  autoUpdater.on('update-available', (info) => {
    console.log('Update available:', info.version);
    sendStatusToWindow('update-available', {
      version: info.version,
      releaseDate: info.releaseDate,
    });
  });

  autoUpdater.on('update-not-available', () => {
    console.log('No updates available');
    sendStatusToWindow('update-not-available');
  });

  autoUpdater.on('download-progress', (progress) => {
    sendStatusToWindow('download-progress', {
      percent: progress.percent,
      transferred: progress.transferred,
      total: progress.total,
    });
  });

  autoUpdater.on('update-downloaded', (info) => {
    console.log('Update downloaded:', info.version);
    sendStatusToWindow('update-downloaded', { version: info.version });
  });

  autoUpdater.on('error', (error) => {
    console.error('Auto-updater error:', error.message);
    sendStatusToWindow('update-error', { message: error.message });
  });
}

function sendStatusToWindow(status: string, data?: Record<string, unknown>): void {
  if (mainWindow && !mainWindow.isDestroyed()) {
    mainWindow.webContents.send('updater:status', { status, ...data });
  }
}

export function checkForUpdates(): void {
  try {
    autoUpdater.checkForUpdates();
  } catch (error) {
    console.error('Failed to check for updates:', error);
  }
}

export function downloadUpdate(): void {
  autoUpdater.downloadUpdate();
}

export function installUpdate(): void {
  autoUpdater.quitAndInstall();
}
