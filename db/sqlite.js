const Database = require('better-sqlite3');
const path = require('path');
const fs = require('fs');

let db;

function getDbPath() {
  const configPath = path.join(__dirname, '..', 'config', 'dbConfig.json');
  let dbPath = path.join(__dirname, '..', 'data', 'tu_negocio.db');
  if (fs.existsSync(configPath)) {
    try {
      const config = JSON.parse(fs.readFileSync(configPath, 'utf-8'));
      if (config.filename) {
        dbPath = path.resolve(__dirname, '..', config.filename);
      }
    } catch (e) {
      console.error('Failed to parse DB config, using default path.', e);
    }
  }
  return dbPath;
}

function getDb() {
  if (!db) {
    const dbPath = getDbPath();
    const dbDir = path.dirname(dbPath);
    if (!fs.existsSync(dbDir)) {
      fs.mkdirSync(dbDir, { recursive: true });
    }
    db = new Database(dbPath);
    db.pragma('journal_mode = WAL');
    db.pragma('foreign_keys = ON');
  }
  return db;
}

module.exports = {
  query: (sql, params = []) => {
    const db = getDb();
    const trimmed = sql.trim();
    if (trimmed.toUpperCase().startsWith('SELECT') || trimmed.toUpperCase().startsWith('WITH') || trimmed.toUpperCase().startsWith('PRAGMA') || trimmed.toUpperCase().startsWith('RETURNING')) {
      return db.prepare(sql).all(...params);
    }
    const info = db.prepare(sql).run(...params);
    if (trimmed.toUpperCase().startsWith('INSERT')) {
      return { insertId: info.lastInsertRowid, changes: info.changes };
    }
    return { changes: info.changes };
  },
  close: () => {
    if (db) {
      db.close();
      db = null;
    }
  },
  getDb,
};
