import { contextBridge, ipcRenderer } from 'electron';

contextBridge.exposeInMainWorld('electronAPI', {
  minimize: () => ipcRenderer.invoke('window:minimize'),
  maximize: () => ipcRenderer.invoke('window:maximize'),
  close: () => ipcRenderer.invoke('window:close'),
  getVersion: () => ipcRenderer.invoke('app:getVersion'),
  onNotification: (callback: (data: unknown) => void) => {
    ipcRenderer.on('notification', (_event, data) => callback(data));
  },
  removeNotificationListener: () => {
    ipcRenderer.removeAllListeners('notification');
  },
});
