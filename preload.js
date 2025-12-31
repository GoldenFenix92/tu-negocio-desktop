console.log('--- PRELOAD VERSION 2.0 ---');
const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('api', {
  ping: () => ipcRenderer.invoke('ping'),
  readConfig: (filename = 'businessConfig.json') => ipcRenderer.invoke('read-config', filename),
  writeConfig: (data, filename = 'businessConfig.json') => ipcRenderer.invoke('write-config', { filename, data }),
  dbQuery: (sql, params) => ipcRenderer.invoke('db-query', { sql, params }),
  saveImage: (sourcePath, entityType) => ipcRenderer.invoke('save-image', { sourcePath, entityType }),
  hashPassword: (password) => ipcRenderer.invoke('hash-password', password),
  comparePassword: (password, hash) => ipcRenderer.invoke('compare-password', { password, hash }),
});
