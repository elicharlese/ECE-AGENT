// Final working Electron main process - Direct built-in API access
// This bypasses the electron package entirely and uses built-in APIs

// In Electron runtime, these should be available as built-in modules
const app = require('electron').app;
const BrowserWindow = require('electron').BrowserWindow;
const Menu = require('electron').Menu;
const shell = require('electron').shell;
const globalShortcut = require('electron').globalShortcut;
const nativeImage = require('electron').nativeImage;
const dialog = require('electron').dialog;

let mainWindow = null;

function createWindow() {
  mainWindow = new BrowserWindow({
    height: 800,
    width: 1200,
    minHeight: 600,
    minWidth: 800,
    title: 'AGENT',
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
    },
    titleBarStyle: 'default',
    show: false,
  });

  mainWindow.loadURL('http://localhost:3000');
  mainWindow.webContents.openDevTools();

  mainWindow.once('ready-to-show', () => {
    mainWindow.show();
  });

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

console.log('Starting Electron app with built-in API access...');
console.log('Electron version:', process.versions.electron);

if (app && typeof app.whenReady === 'function') {
  console.log('Electron API is available!');
  
  app.whenReady().then(() => {
    console.log('Electron app is ready');
    createWindow();

    app.on('activate', () => {
      if (BrowserWindow.getAllWindows().length === 0) createWindow();
    });
  });

  app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') app.quit();
  });
} else {
  console.error('Electron API not available');
  console.log('Available app:', app);
  console.log('App type:', typeof app);
  process.exit(1);
}
