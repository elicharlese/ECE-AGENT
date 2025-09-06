// Standalone Electron main process - No npm package dependency
// This approach uses the built-in electron APIs directly

// Check if we're in electron runtime
if (!process.versions.electron) {
  console.error('This script must be run with the electron binary');
  process.exit(1);
}

console.log('Starting standalone Electron app...');
console.log('Electron version:', process.versions.electron);
console.log('Node version:', process.versions.node);
console.log('Chrome version:', process.versions.chrome);

// Try to access electron APIs through global scope
let app, BrowserWindow;

try {
  // In Electron main process, these should be available globally
  app = global.app || require('electron').app;
  BrowserWindow = global.BrowserWindow || require('electron').BrowserWindow;
} catch (error) {
  console.error('Failed to access electron APIs:', error.message);
  process.exit(1);
}

if (!app || !BrowserWindow) {
  console.error('Electron APIs not available');
  console.log('app:', !!app);
  console.log('BrowserWindow:', !!BrowserWindow);
  process.exit(1);
}

let mainWindow = null;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    minWidth: 800,
    minHeight: 600,
    title: 'AGENT Desktop',
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
    },
    show: false,
  });

  mainWindow.loadURL('http://localhost:3000');
  mainWindow.webContents.openDevTools();

  mainWindow.once('ready-to-show', () => {
    mainWindow.show();
    console.log('AGENT Desktop window is ready');
  });

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

console.log('Setting up Electron app event handlers...');

app.whenReady().then(() => {
  console.log('Electron app is ready, creating window...');
  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

console.log('Standalone Electron app setup complete');
