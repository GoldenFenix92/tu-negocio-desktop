const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('api', {
  ping: () => ipcRenderer.invoke('ping'),
  readConfig: (filename = 'businessConfig.json') => ipcRenderer.invoke('read-config', filename),
  writeConfig: (data, filename = 'businessConfig.json') => ipcRenderer.invoke('write-config', { filename, data }),
  dbQuery: (sql, params) => ipcRenderer.invoke('db-query', { sql, params }),
  dbTransaction: (queries) => ipcRenderer.invoke('db-transaction', { queries }),
  saveImage: (sourcePath, entityType) => ipcRenderer.invoke('save-image', { sourcePath, entityType }),
  hashPassword: (password) => ipcRenderer.invoke('hash-password', password),
  comparePassword: (password, hash) => ipcRenderer.invoke('compare-password', { password, hash }),
  restartApp: () => ipcRenderer.invoke('restart-app'),
  quitApp: () => ipcRenderer.invoke('quit-app'),
  minimizeApp: () => ipcRenderer.invoke('minimize-app'),
  maximizeApp: () => ipcRenderer.invoke('maximize-app'),
  onConfigChanged: (callback) => {
    ipcRenderer.on('config-changed', (_event, config) => callback(config));
  },
});
