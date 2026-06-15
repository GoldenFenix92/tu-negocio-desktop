const Database = require('better-sqlite3');
const fs = require('fs');
const path = require('path');

function checkConnection() {
  const configPath = path.join(__dirname, 'config', 'dbConfig.json');
  const defaultDbPath = path.join(__dirname, 'data', 'tu_negocio.db');

  let dbPath = defaultDbPath;
  if (fs.existsSync(configPath)) {
    try {
      const config = JSON.parse(fs.readFileSync(configPath, 'utf-8'));
      if (config.filename) {
        dbPath = path.resolve(__dirname, config.filename);
      }
    } catch (e) {
      console.error('Error reading config, using default path.');
    }
  }

  console.log('Database path:', dbPath);

  if (!fs.existsSync(dbPath)) {
    console.error('Database file not found. Run: node db/init-db.js');
    return;
  }

  try {
    const db = new Database(dbPath);
    console.log('Connected to SQLite database.');

    const tables = db.prepare("SELECT name FROM sqlite_master WHERE type='table' ORDER BY name").all();
    console.log('Tables:', tables.map(t => t.name));

    const userCount = db.prepare('SELECT COUNT(*) as count FROM users').get();
    console.log('Users found:', userCount.count);

    db.close();
  } catch (err) {
    console.error('Connection failed:', err.message);
  }
}

checkConnection();
