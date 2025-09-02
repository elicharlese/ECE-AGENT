import { contextBridge, ipcRenderer } from 'electron';

// Expose protected methods that allow the renderer process to use
// the ipcRenderer without exposing the entire object
contextBridge.exposeInMainWorld('electronAPI', {
  openExternal: (url: string) => ipcRenderer.invoke('open-external', url),
  getVersion: () => ipcRenderer.invoke('get-version'),
  platform: process.platform,
});

// Type definitions for the exposed API
declare global {
  interface Window {
    electronAPI: {
      openExternal: (url: string) => Promise<void>;
      getVersion: () => Promise<string>;
      platform: string;
    };
  }
}
