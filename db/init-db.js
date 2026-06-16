const Database = require('better-sqlite3');
const path = require('path');
const fs = require('fs');
const bcrypt = require('bcryptjs');

const dbDir = path.join(__dirname, '..', 'data');
const dbPath = path.join(dbDir, 'tu_negocio.db');

if (!fs.existsSync(dbDir)) {
  fs.mkdirSync(dbDir, { recursive: true });
}

function initDatabase() {
  if (fs.existsSync(dbPath)) {
    return false;
  }

  const db = new Database(dbPath);
  db.pragma('journal_mode = WAL');
  db.pragma('foreign_keys = ON');

  db.exec(`
    CREATE TABLE IF NOT EXISTS business_config (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      address TEXT,
      phone TEXT,
      logo_path TEXT,
      typography TEXT DEFAULT 'Montserrat'
    );

    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL,
      role TEXT NOT NULL CHECK(role IN ('Administrator', 'Supervisor', 'Cashier')),
      image_path TEXT
    );

    CREATE TABLE IF NOT EXISTS categories (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT UNIQUE NOT NULL,
      image_path TEXT
    );

    CREATE TABLE IF NOT EXISTS products (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      code TEXT UNIQUE NOT NULL,
      name TEXT NOT NULL,
      description TEXT,
      price REAL NOT NULL,
      cost REAL NOT NULL,
      stock INTEGER DEFAULT 0,
      category_id INTEGER,
      image_path TEXT,
      FOREIGN KEY (category_id) REFERENCES categories(id)
    );

    CREATE TABLE IF NOT EXISTS clients (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      email TEXT,
      phone TEXT,
      address TEXT,
      image_path TEXT
    );

    CREATE TABLE IF NOT EXISTS sales (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER,
      client_id INTEGER,
      total REAL NOT NULL,
      coupon_id INTEGER,
      discount_amount REAL DEFAULT 0,
      payment_method TEXT DEFAULT 'cash',
      created_at TEXT DEFAULT (datetime('now')),
      FOREIGN KEY (user_id) REFERENCES users(id),
      FOREIGN KEY (client_id) REFERENCES clients(id),
      FOREIGN KEY (coupon_id) REFERENCES coupons(id)
    );

    CREATE TABLE IF NOT EXISTS sale_items (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      sale_id INTEGER,
      product_id INTEGER,
      quantity INTEGER NOT NULL,
      price REAL NOT NULL,
      FOREIGN KEY (sale_id) REFERENCES sales(id),
      FOREIGN KEY (product_id) REFERENCES products(id)
    );

    CREATE TABLE IF NOT EXISTS coupons (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      code TEXT UNIQUE NOT NULL,
      discount REAL NOT NULL,
      type TEXT NOT NULL CHECK(type IN ('percentage', 'fixed')),
      is_global INTEGER DEFAULT 1,
      client_id INTEGER,
      valid_from TEXT,
      valid_until TEXT,
      FOREIGN KEY (client_id) REFERENCES clients(id)
    );

    CREATE TABLE IF NOT EXISTS promotions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      description TEXT,
      discount REAL NOT NULL,
      start_date TEXT,
      end_date TEXT
    );

    CREATE TABLE IF NOT EXISTS sections_visibility (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      role TEXT NOT NULL CHECK(role IN ('Administrator', 'Supervisor', 'Cashier')),
      section_name TEXT NOT NULL,
      is_visible INTEGER DEFAULT 1,
      UNIQUE(role, section_name)
    );

    CREATE INDEX IF NOT EXISTS idx_products_category ON products(category_id);
    CREATE INDEX IF NOT EXISTS idx_products_code ON products(code);
    CREATE INDEX IF NOT EXISTS idx_sales_user ON sales(user_id);
    CREATE INDEX IF NOT EXISTS idx_sales_client ON sales(client_id);
    CREATE INDEX IF NOT EXISTS idx_sales_created ON sales(created_at);
    CREATE INDEX IF NOT EXISTS idx_sale_items_sale ON sale_items(sale_id);
    CREATE INDEX IF NOT EXISTS idx_sale_items_product ON sale_items(product_id);
    CREATE INDEX IF NOT EXISTS idx_coupons_code ON coupons(code);
  `);

  const hashPassword = (password) => bcrypt.hashSync(password, 10);

  const insertUser = db.prepare('INSERT OR IGNORE INTO users (username, password, role) VALUES (?, ?, ?)');
  insertUser.run('admin', hashPassword('admin'), 'Administrator');
  insertUser.run('supervisor', hashPassword('supervisor'), 'Supervisor');
  insertUser.run('cajero', hashPassword('cajero'), 'Cashier');

  db.close();

  console.log('Database created successfully at:', dbPath);
  console.log('Default users:');
  console.log('  admin / admin (Administrator)');
  console.log('  supervisor / supervisor (Supervisor)');
  console.log('  cajero / cajero (Cashier)');

  // Seed test data
  require('./seed')();

  return true;
}

if (require.main === module) {
  initDatabase();
} else {
  module.exports = initDatabase;
}
