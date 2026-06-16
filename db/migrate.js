const db = require('./sqlite');

function columnExists(table, column) {
  const dbInstance = db.getDb();
  const cols = dbInstance.prepare(`PRAGMA table_info(${table})`).all();
  return cols.some(c => c.name === column);
}

function migrateDatabase() {
  const dbInstance = db.getDb();
  let migrated = false;

  if (!columnExists('coupons', 'is_global')) {
    dbInstance.exec('ALTER TABLE coupons ADD COLUMN is_global INTEGER DEFAULT 1');
    migrated = true;
  }
  if (!columnExists('coupons', 'client_id')) {
    dbInstance.exec('ALTER TABLE coupons ADD COLUMN client_id INTEGER REFERENCES clients(id)');
    migrated = true;
  }
  if (!columnExists('coupons', 'valid_from')) {
    dbInstance.exec('ALTER TABLE coupons ADD COLUMN valid_from TEXT');
    migrated = true;
  }
  if (!columnExists('coupons', 'valid_until')) {
    dbInstance.exec('ALTER TABLE coupons ADD COLUMN valid_until TEXT');
    // Migrate existing expiry_date to valid_until
    if (columnExists('coupons', 'expiry_date')) {
      dbInstance.exec('UPDATE coupons SET valid_until = expiry_date WHERE expiry_date IS NOT NULL');
    }
    migrated = true;
  }
  if (!columnExists('sales', 'coupon_id')) {
    dbInstance.exec('ALTER TABLE sales ADD COLUMN coupon_id INTEGER REFERENCES coupons(id)');
    migrated = true;
  }
  if (!columnExists('sales', 'discount_amount')) {
    dbInstance.exec('ALTER TABLE sales ADD COLUMN discount_amount REAL DEFAULT 0');
    migrated = true;
  }
  if (!columnExists('sales', 'payment_method')) {
    dbInstance.exec("ALTER TABLE sales ADD COLUMN payment_method TEXT DEFAULT 'cash'");
    migrated = true;
  }

  if (!columnExists('products', 'image_path')) {
    dbInstance.exec('ALTER TABLE products ADD COLUMN image_path TEXT');
    migrated = true;
  }
  if (!columnExists('clients', 'image_path')) {
    dbInstance.exec('ALTER TABLE clients ADD COLUMN image_path TEXT');
    migrated = true;
  }
  if (!columnExists('users', 'image_path')) {
    dbInstance.exec('ALTER TABLE users ADD COLUMN image_path TEXT');
    migrated = true;
  }
  if (!columnExists('categories', 'image_path')) {
    dbInstance.exec('ALTER TABLE categories ADD COLUMN image_path TEXT');
    migrated = true;
  }

  if (migrated) console.log('Database migrated successfully.');
  return migrated;
}

if (require.main === module) {
  migrateDatabase();
} else {
  module.exports = migrateDatabase;
}
