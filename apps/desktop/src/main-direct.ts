// Direct Electron API Access - No require wrapper
// This approach accesses the electron API directly from the global scope

declare const require: any;
declare const process: any;
declare const global: any;

// Access electron API directly
const electron = (global as any).electron || require('electron');

if (typeof electron === 'string') {
  console.error('Electron API not available, got path instead:', electron);
  process.exit(1);
}

const { app, BrowserWindow, Menu, shell, globalShortcut, nativeImage, dialog } = electron;

let mainWindow: BrowserWindow | null = null;

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

console.log('Starting Electron app with direct API access...');

if (app && typeof app.whenReady === 'function') {
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
  console.log('Available electron object:', electron);
  console.log('App type:', typeof electron?.app);
  process.exit(1);
}
