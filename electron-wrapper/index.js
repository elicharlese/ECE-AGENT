// Custom Electron Wrapper - Proper API Detection
const fs = require('fs');
const path = require('path');

// Check if we're running in Electron
const isElectron = !!(process.versions && process.versions.electron);

if (isElectron) {
  // We're in Electron runtime, return the actual API
  try {
    // Try to get the electron API from the built-in modules
    const electronAPI = {};
    
    // Use the built-in electron module that's available in the runtime
    const electron = require('electron');
    
    // Return the API object
    module.exports = {
      app: electron.app,
      BrowserWindow: electron.BrowserWindow,
      Menu: electron.Menu,
      shell: electron.shell,
      globalShortcut: electron.globalShortcut,
      nativeImage: electron.nativeImage,
      dialog: electron.dialog,
      ipcMain: electron.ipcMain,
      ipcRenderer: electron.ipcRenderer,
      webContents: electron.webContents,
      session: electron.session,
      screen: electron.screen,
      clipboard: electron.clipboard,
      crashReporter: electron.crashReporter,
      autoUpdater: electron.autoUpdater
    };
  } catch (error) {
    console.error('Failed to load electron API:', error.message);
    // Fallback to executable path
    const electronPath = path.join(__dirname, '..', 'node_modules', '.bin', 'electron');
    module.exports = electronPath;
  }
} else {
  // We're not in Electron, return the executable path
  const electronPath = path.join(__dirname, '..', 'node_modules', '.bin', 'electron');
  module.exports = electronPath;
}
