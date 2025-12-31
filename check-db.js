const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');

async function checkConnection() {
  const configPath = path.join(__dirname, 'config', 'dbConfig.json');
  console.log('Reading config from:', configPath);
  
  if (!fs.existsSync(configPath)) {
    console.error('ERROR: dbConfig.json not found!');
    return;
  }

  const dbConfig = JSON.parse(fs.readFileSync(configPath, 'utf-8'));
  console.log('Checking connection to:', { ...dbConfig, password: '****' });

  try {
    const connection = await mysql.createConnection(dbConfig);
    console.log('✅ SUCCESS: Connected to MySQL!');
    
    const [rows] = await connection.execute(`SHOW DATABASES LIKE '${dbConfig.database}'`);
    if (rows.length > 0) {
      console.log(`✅ DATABASE FOUND: "${dbConfig.database}" exists.`);
      
      const [tables] = await connection.execute('SHOW TABLES');
      console.log('Tables found:', tables.map(t => Object.values(t)[0]));
    } else {
      console.log(`❌ DATABASE NOT FOUND: "${dbConfig.database}" does not exist. Please create it in phpMyAdmin.`);
    }
    
    await connection.end();
  } catch (err) {
    console.error('❌ CONNECTION FAILED:', err.message);
    if (err.code === 'ECONNREFUSED') {
      console.error('Make sure XAMPP (MySQL) is running.');
    } else if (err.code === 'ER_ACCESS_DENIED_ERROR') {
      console.error('Check your username and password in dbConfig.json.');
    }
  }
}

checkConnection();
