const { app, BrowserWindow, ipcMain, protocol } = require('electron');
const path = require('path');
const fs = require('fs');
const { net } = require('electron');
const { pathToFileURL } = require('url');
const bcrypt = require('bcryptjs');
const db = require('./db/mysql');

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

function createWindow() {
  let iconPath = path.join(__dirname, 'assets', 'app_icon.png');
  const configPath = path.join(__dirname, 'config', 'businessConfig.json');
  if (fs.existsSync(configPath)) {
    try {
      const config = JSON.parse(fs.readFileSync(configPath, 'utf8'));
      if (config.logoPath && fs.existsSync(config.logoPath)) {
        iconPath = config.logoPath;
      }
    } catch (e) {}
  }

  const win = new BrowserWindow({
    width: 1200,
    height: 800,
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
    console.log('Window is ready to show.');
  });


  console.log('Loading preload from:', path.join(__dirname, 'preload.js'));

  const htmlPath = path.join(__dirname, 'dist', 'index.html');
  console.log('Loading real application from:', htmlPath);

  win.loadFile(htmlPath).catch(err => {
    console.error('Failed to load application:', err);
  });


  win.webContents.on('did-fail-load', (e, code, desc) => {
    console.error('Window FAILED to load:', code, desc);
  });

  win.webContents.openDevTools();
}

app.whenReady().then(() => {
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
      if (config.logoPath && fs.existsSync(config.logoPath)) {
        const win = BrowserWindow.getAllWindows()[0];
        if (win) win.setIcon(config.logoPath);
      }
    }
    return true;
  } catch (e) {
    console.error('Failed to write config', e);
    return false;
  }
});

ipcMain.handle('save-image', async (event, { sourcePath, entityType }) => {
  try {
    const uploadDir = path.join(__dirname, 'uploads', entityType);
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    const ext = path.extname(sourcePath);
    const fileName = `${Date.now()}${ext}`;
    const destPath = path.join(uploadDir, fileName);
    fs.copyFileSync(sourcePath, destPath);
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
