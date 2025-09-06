// Direct access to electron API without require
const electron = (global as any).electron || require('electron');
const { app, BrowserWindow, Menu, shell, globalShortcut, nativeImage, dialog } = electron;

import { autoUpdater } from 'electron-updater';
import type { UpdateInfo, ProgressInfo } from 'electron-updater';
import * as path from 'path';

// Prefer Electron's packaging flag instead of NODE_ENV which can be unreliable in packaged apps
let isDev = false;
let manualCheck = false;

let chatPopout: BrowserWindow | null = null;

function createChatPopoutWindow(chatId?: string): void {
  if (chatPopout) {
    // Focus existing popout
    if (chatPopout.isMinimized()) chatPopout.restore();
    chatPopout.focus();
    return;
  }

  chatPopout = new BrowserWindow({
    width: 420,
    height: 640,
    minWidth: 360,
    minHeight: 480,
    alwaysOnTop: true,
    skipTaskbar: false,
    resizable: true,
    minimizable: true,
    maximizable: false,
    title: 'AGENT Chat',
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, 'preload.js'),
    },
  });

  // Keep above other apps (macOS level)
  try {
    chatPopout.setAlwaysOnTop(true, 'floating');
    chatPopout.setVisibleOnAllWorkspaces(true, { visibleOnFullScreen: true });
  } catch {}

  const devBaseUrl = 'http://localhost:3000';
  const prodBaseUrl = process.env.AGENT_DESKTOP_WEB_URL; // e.g. https://your-deployed-web-app.domain

  if (isDev) {
    const qs = new URLSearchParams({ view: 'popout', ...(chatId ? { chatId } : {}) }).toString();
    chatPopout.loadURL(`${devBaseUrl}/messages?${qs}`);
  } else if (prodBaseUrl) {
    const qs = new URLSearchParams({ view: 'popout', ...(chatId ? { chatId } : {}) }).toString();
    chatPopout.loadURL(`${prodBaseUrl}/messages?${qs}`);
  } else {
    // Fallback bundled placeholder page instructing how to configure AGENT_DESKTOP_WEB_URL
    chatPopout.loadFile(path.join(__dirname, '../public/index.html'));
  }

  chatPopout.on('closed', () => {
    chatPopout = null;
  });
}

function createWindow(): void {
  const mainWindow = new BrowserWindow({
    height: 800,
    width: 1200,
    minHeight: 600,
    minWidth: 800,
    title: 'AGENT',
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, 'preload.js'),
    },
    titleBarStyle: 'default',
    show: false,
    icon: path.join(__dirname, '../../../public/agent-bot.svg'),
  });

  // Load the app
  if (isDev) {
    mainWindow.loadURL('http://localhost:3000');
    mainWindow.webContents.openDevTools();
  } else {
    const prodBaseUrl = process.env.AGENT_DESKTOP_WEB_URL;
    if (prodBaseUrl) {
      mainWindow.loadURL(prodBaseUrl);
    } else {
      // Fallback to a bundled placeholder page
      mainWindow.loadFile(path.join(__dirname, '../public/index.html'));
    }
  }

  // Show window when ready
  mainWindow.once('ready-to-show', () => {
    mainWindow.show();
  });

  // Handle external links
  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    shell.openExternal(url);
    return { action: 'deny' };
  });
}

function setupAutoUpdates() {
  if (!app.isPackaged) return; // only enable in packaged builds

  try {
    // Allow overriding the feed via env at runtime
    const feedUrl = process.env.AGENT_UPDATE_URL;
    if (feedUrl) {
      // Generic provider expects a directory hosting latest.yml and assets
      // Example: https://downloads.example.com/agent/
      autoUpdater.setFeedURL({ provider: 'generic', url: feedUrl });
    }

    autoUpdater.autoDownload = true;
    autoUpdater.autoInstallOnAppQuit = true;

    autoUpdater.on('error', (err) => {
      console.error('[autoUpdater] error', err);
    });

    autoUpdater.on('update-available', (info: UpdateInfo) => {
      console.log('[autoUpdater] update available, downloading...', info?.version);
      if (manualCheck) {
        dialog.showMessageBox({
          type: 'info',
          message: `Update ${info?.version ?? ''} available. Downloading…`,
        });
      }
    });

    autoUpdater.on('update-not-available', () => {
      console.log('[autoUpdater] no updates available');
      if (manualCheck) {
        dialog.showMessageBox({
          type: 'info',
          message: 'You are on the latest version.'
        });
      }
      manualCheck = false;
    });

    autoUpdater.on('download-progress', (p: ProgressInfo) => {
      const pct = Math.round(p.percent);
      console.log(`[autoUpdater] download progress: ${pct}% (${p.transferred}/${p.total})`);
    });

    autoUpdater.on('update-downloaded', () => {
      // Prompt to restart now
      const res = dialog.showMessageBoxSync({
        type: 'question',
        buttons: ['Restart Now', 'Later'],
        defaultId: 0,
        cancelId: 1,
        title: 'Update Ready',
        message: 'An update has been downloaded. Restart AGENT to apply it?'
      });
      if (res === 0) {
        autoUpdater.quitAndInstall();
      }
      manualCheck = false;
    });

    // Initial check
    autoUpdater.checkForUpdatesAndNotify();
  } catch (e) {
    console.error('[autoUpdater] setup failed', e);
  }
}

// App event handlers
app.whenReady().then(() => {
  // Set isDev flag after app is ready
  isDev = !app.isPackaged;

  // Set application name and dock icon
  try {
    app.setName('AGENT');
    if (process.platform === 'darwin') {
      const dockIcon = nativeImage.createFromPath(path.join(__dirname, '../../../public/agent-bot.svg'));
      if (!dockIcon.isEmpty()) {
        app.dock.setIcon(dockIcon);
      }
    }
  } catch {}
  createWindow();
  setupAutoUpdates();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
  
  // Global shortcuts
  try {
    // Open/Focus chat popout
    globalShortcut.register(process.platform === 'darwin' ? 'Command+Shift+P' : 'Control+Shift+P', () => {
      createChatPopoutWindow();
    });

    // Toggle always-on-top for the popout
    globalShortcut.register(process.platform === 'darwin' ? 'Command+Shift+O' : 'Control+Shift+O', () => {
      if (chatPopout) {
        const next = !chatPopout.isAlwaysOnTop();
        try {
          chatPopout.setAlwaysOnTop(next, 'floating');
        } catch {
          chatPopout.setAlwaysOnTop(next);
        }
      }
    });
  } catch {}
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});

app.on('will-quit', () => {
  globalShortcut.unregisterAll();
});

// Create application menu
const template: Electron.MenuItemConstructorOptions[] = [
  {
    label: 'File',
    submenu: [
      {
        label: 'Quit',
        accelerator: process.platform === 'darwin' ? 'Cmd+Q' : 'Ctrl+Q',
        click: () => {
          app.quit();
        },
      },
    ],
  },
  {
    label: 'Edit',
    submenu: [
      { role: 'undo' },
      { role: 'redo' },
      { type: 'separator' },
      { role: 'cut' },
      { role: 'copy' },
      { role: 'paste' },
    ],
  },
  {
    label: 'View',
    submenu: [
      { role: 'reload' },
      { role: 'forceReload' },
      { role: 'toggleDevTools' },
      { type: 'separator' },
      { role: 'resetZoom' },
      { role: 'zoomIn' },
      { role: 'zoomOut' },
      { type: 'separator' },
      { role: 'togglefullscreen' },
    ],
  },
  {
    label: 'Window',
    submenu: [
      { role: 'minimize' },
      { role: 'close' },
      { type: 'separator' },
      {
        label: 'Open Chat Popout',
        accelerator: process.platform === 'darwin' ? 'Cmd+Shift+P' : 'Ctrl+Shift+P',
        click: () => createChatPopoutWindow(),
      },
      {
        label: 'Toggle Popout Always On Top',
        accelerator: process.platform === 'darwin' ? 'Cmd+Shift+O' : 'Ctrl+Shift+O',
        click: () => {
          if (chatPopout) {
            const next = !chatPopout.isAlwaysOnTop();
            try {
              chatPopout.setAlwaysOnTop(next, 'floating');
            } catch {
              chatPopout.setAlwaysOnTop(next);
            }
          }
        },
      },
    ],
  },
  {
    label: 'Help',
    role: 'help',
    submenu: [
      {
        label: 'Check for Updates…',
        click: () => {
          if (!isDev) {
            try {
              manualCheck = true;
              autoUpdater.checkForUpdates();
            } catch (e) {
              console.error('[autoUpdater] manual check failed', e);
              dialog.showMessageBox({
                type: 'error',
                message: 'Failed to check for updates. See logs for details.'
              });
            }
          } else {
            dialog.showMessageBox({
              type: 'info',
              message: 'Auto-update is disabled in development builds',
            });
          }
        },
      },
    ],
  },
];

Menu.setApplicationMenu(Menu.buildFromTemplate(template));
