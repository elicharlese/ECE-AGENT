// Final Electron main process - direct API access
// @ts-ignore
const app = require('electron').app;
// @ts-ignore  
const BrowserWindow = require('electron').BrowserWindow;
// @ts-ignore
const Menu = require('electron').Menu;
// @ts-ignore
const shell = require('electron').shell;
// @ts-ignore
const globalShortcut = require('electron').globalShortcut;
// @ts-ignore
const nativeImage = require('electron').nativeImage;
// @ts-ignore
const dialog = require('electron').dialog;
const path = require('path');

let mainWindow: any = null;

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
    mainWindow?.show();
  });

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

console.log('Starting Electron app...');

if (app && app.whenReady) {
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
  console.error('Electron app API not available');
}
