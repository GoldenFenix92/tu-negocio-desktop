// Database connector using mysql2
const mysql = require('mysql2/promise');
const path = require('path');
const fs = require('fs');

// Load DB config (you can adjust the path as needed)
const configPath = path.join(__dirname, '..', 'config', 'dbConfig.json');
let dbConfig = {
  host: 'localhost',
  user: 'root',
  password: '',
  database: 'tu_negocio',
  port: 3306,
};
if (fs.existsSync(configPath)) {
  try {
    const fileContent = fs.readFileSync(configPath, 'utf-8');
    dbConfig = { ...dbConfig, ...JSON.parse(fileContent) };
  } catch (e) {
    console.error('Failed to parse DB config, using defaults.', e);
  }
}

let pool;
function getPool() {
  if (!pool) {
    console.log('Connecting to MySQL with config:', { ...dbConfig, password: '****' });
    pool = mysql.createPool(dbConfig);
    console.log('MySQL Pool created successfully.');
  }
  return pool;
}

module.exports = {
  query: async (sql, params) => {
    const [rows] = await getPool().execute(sql, params);
    return rows;
  },
  getPool,
};
