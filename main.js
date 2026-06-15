const { app, BrowserWindow, ipcMain, protocol } = require('electron');
const path = require('path');
const fs = require('fs');
const { net } = require('electron');
const { pathToFileURL } = require('url');
const bcrypt = require('bcryptjs');
const sharp = require('sharp');
const db = require('./db/sqlite');

// Register custom protocol for local images
app.whenReady().then(() => {
  protocol.handle('media', (request) => {
    const rawUrl = request.url.replace('media://', '');
    // Remove query params if any
    const url = rawUrl.split('?')[0];
    const decodedPath = decodeURIComponent(url);
    const fullPath = path.isAbsolute(decodedPath) 
      ? decodedPath 
      : path.join(__dirname, decodedPath);
    
    return net.fetch(pathToFileURL(fullPath).toString());
  });
});

function resolveIcon(config) {
  if (config.faviconPath && fs.existsSync(config.faviconPath)) return config.faviconPath;
  if (config.logoLightPath && fs.existsSync(config.logoLightPath)) return config.logoLightPath;
  if (config.logoPath && fs.existsSync(config.logoPath)) return config.logoPath;
  return null;
}

function createWindow() {
  let iconPath = path.join(__dirname, 'assets', 'app_icon.png');
  const configPath = path.join(__dirname, 'config', 'businessConfig.json');
  if (fs.existsSync(configPath)) {
    try {
      const config = JSON.parse(fs.readFileSync(configPath, 'utf8'));
      const resolved = resolveIcon(config);
      if (resolved) iconPath = resolved;
    } catch (e) {}
  }

  const win = new BrowserWindow({
    width: 1200,
    height: 800,
    frame: false,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      nodeIntegration: false,
      contextIsolation: true,
      sandbox: true,
    },
    show: false,
    icon: iconPath
  });

  win.once('ready-to-show', () => {
    win.show();
  });

  const htmlPath = path.join(__dirname, 'dist', 'index.html');

  win.loadFile(htmlPath).catch(err => {
    console.error('Failed to load application:', err);
  });


  win.webContents.on('did-fail-load', (e, code, desc) => {
    console.error('Window FAILED to load:', code, desc);
  });

  if (!app.isPackaged) win.webContents.openDevTools();
}

app.whenReady().then(() => {
  const initDatabase = require('./db/init-db');
  initDatabase();
  createWindow();
  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});

// IPC handlers
ipcMain.handle('ping', async () => 'pong');

ipcMain.handle('db-query', async (event, { sql, params }) => {
  try {
    return await db.query(sql, params);
  } catch (err) {
    console.error('DB Query Error:', err);
    throw err;
  }
});

ipcMain.handle('db-transaction', async (event, { queries }) => {
  const database = db.getDb();
  const runTransaction = database.transaction(() => {
    for (const q of queries) {
      database.prepare(q.sql).run(...(q.params || []));
    }
  });
  try {
    runTransaction();
    return { success: true };
  } catch (err) {
    console.error('DB Transaction Error:', err);
    return { success: false, error: err.message };
  }
});

// Config handles
const getConfigPath = (filename) => path.join(__dirname, 'config', filename);

ipcMain.handle('read-config', async (event, filename) => {
  const filePath = getConfigPath(filename);
  try {
    if (fs.existsSync(filePath)) {
      return fs.readFileSync(filePath, 'utf-8');
    }
    return '{}';
  } catch (e) {
    console.error('Failed to read config', e);
    return '{}';
  }
});

ipcMain.handle('write-config', async (event, { filename, data }) => {
  const filePath = getConfigPath(filename);
  try {
    fs.writeFileSync(filePath, data, 'utf-8');
    if (filename === 'businessConfig.json') {
      const config = JSON.parse(data);
      const resolved = resolveIcon(config);
      if (resolved) {
        const win = BrowserWindow.getAllWindows()[0];
        if (win) win.setIcon(resolved);
      }
      // Notify renderer of config change
      const win = BrowserWindow.getAllWindows()[0];
      if (win) win.webContents.send('config-changed', config);
    }
    return true;
  } catch (e) {
    console.error('Failed to write config', e);
    return false;
  }
});

ipcMain.handle('restart-app', async () => {
  app.relaunch();
  app.exit(0);
});

ipcMain.handle('quit-app', async () => {
  app.quit();
});

const ALLOWED_MIME_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/bmp'];
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

ipcMain.handle('save-image', async (event, { sourcePath, entityType }) => {
  try {
    const stat = fs.statSync(sourcePath);
    if (!stat.isFile()) return null;
    if (stat.size > MAX_FILE_SIZE) throw new Error('File too large (max 5MB)');
    if (stat.size === 0) throw new Error('File is empty');

    const ext = path.extname(sourcePath).toLowerCase();
    const allowedExts = ['.jpg', '.jpeg', '.png', '.webp', '.gif', '.bmp'];
    if (!allowedExts.includes(ext)) throw new Error('Invalid file type');

    const uploadDir = path.join(__dirname, 'uploads', entityType);
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }

    const fileName = `${Date.now()}.webp`;
    const destPath = path.join(uploadDir, fileName);

    await sharp(sourcePath)
      .webp({ quality: 80 })
      .toFile(destPath);

    return destPath;
  } catch (e) {
    console.error('Failed to save image', e);
    return null;
  }
});

ipcMain.handle('hash-password', async (event, password) => {
  const salt = await bcrypt.genSalt(10);
  return await bcrypt.hash(password, salt);
});

ipcMain.handle('compare-password', async (event, { password, hash }) => {
  return await bcrypt.compare(password, hash);
});
