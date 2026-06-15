const db = require('./sqlite');

function seedDatabase() {
  const database = db.getDb();

  const count = database.prepare("SELECT COUNT(*) as count FROM products").get();
  if (count.count > 0) {
    console.log('Database already has data, skipping seed.');
    return false;
  }

  console.log('Seeding database...');

  const insertCategory = database.prepare('INSERT INTO categories (name) VALUES (?)');
  const categories = [
    'Bebidas', 'Lácteos', 'Panadería', 'Carnicería', 'Frutas y Verduras',
    'Limpieza', 'Higiene Personal', 'Snacks', 'Congelados', 'Despensa',
    'Bebidas Alcohólicas', 'Mascotas'
  ];
  for (const name of categories) {
    insertCategory.run(name);
  }

  const insertProduct = database.prepare(
    'INSERT INTO products (code, name, description, price, cost, stock, category_id) VALUES (?, ?, ?, ?, ?, ?, ?)'
  );
  const products = [
    ['AGU-001', 'Agua Mineral 500ml', 'Agua mineral natural sin gas', 12.00, 5.00, 200, 1],
    ['REF-001', 'Refresco Cola 355ml', 'Refresco de cola en lata', 15.00, 6.50, 150, 1],
    ['REF-002', 'Refresco Naranja 355ml', 'Refresco sabor naranja en lata', 15.00, 6.50, 140, 1],
    ['JGO-001', 'Jugo de Naranja 1L', 'Jugo de naranja natural pasteurizado', 28.00, 14.00, 80, 1],
    ['LEC-001', 'Leche Entera 1L', 'Leche de vaca entera pasteurizada', 22.00, 11.00, 100, 2],
    ['LEC-002', 'Leche Deslactosada 1L', 'Leche deslactosada sin lactosa', 25.00, 12.50, 60, 2],
    ['YOG-001', 'Yogurt Natural 200g', 'Yogurt natural sin azúcar', 18.00, 8.00, 90, 2],
    ['QSO-001', 'Queso Fresco 250g', 'Queso fresco artesanal', 35.00, 18.00, 50, 2],
    ['PAN-001', 'Pan Bolillo', 'Pan blanco tradicional bolillo', 3.50, 1.20, 300, 3],
    ['PAN-002', 'Pan de Caja Integral 680g', 'Pan de caja integral', 45.00, 22.00, 40, 3],
    ['PAS-001', 'Pastel de Chocolate', 'Pastel de chocolate relleno de crema', 180.00, 80.00, 15, 3],
    ['CAR-001', 'Carne Molida 1kg', 'Carne de res molida 90/10', 160.00, 90.00, 30, 4],
    ['CAR-002', 'Pechuga de Pollo 1kg', 'Pechuga de pollo fresca', 130.00, 70.00, 35, 4],
    ['CAR-003', 'Chuleta de Cerdo 1kg', 'Chuleta de cerdo ahumada', 145.00, 78.00, 25, 4],
    ['FRU-001', 'Manzana Roja 1kg', 'Manzana roja fresca', 45.00, 22.00, 80, 5],
    ['FRU-002', 'Plátano 1kg', 'Plátano tabasco', 25.00, 10.00, 120, 5],
    ['FRU-003', 'Aguacate 1kg', 'Aguacate hass', 90.00, 45.00, 50, 5],
    ['VER-001', 'Jitomate 1kg', 'Jitomate saladet', 30.00, 13.00, 100, 5],
    ['VER-002', 'Cebolla 1kg', 'Cebolla blanca', 28.00, 12.00, 110, 5],
    ['LIM-001', 'Detergente 1kg', 'Detergente para ropa en polvo', 55.00, 28.00, 70, 6],
    ['LIM-002', 'Cloro 1L', 'Cloro líquido concentrado', 25.00, 10.00, 90, 6],
    ['LIM-003', 'Jabón Líquido Trastes 500ml', 'Jabón lava trastes cítrico', 35.00, 16.00, 60, 6],
    ['HIG-001', 'Jabón de Baño 90g', 'Jabón de baño antibacterial', 12.00, 5.00, 150, 7],
    ['HIG-002', 'Shampoo 300ml', 'Shampoo para cabello normal', 65.00, 30.00, 45, 7],
    ['HIG-003', 'Pasta Dental 120g', 'Pasta dental con flúor triple acción', 35.00, 15.00, 80, 7],
    ['SNK-001', 'Papas Fritas 150g', 'Papas fritas sabor natural', 22.00, 9.00, 100, 8],
    ['SNK-002', 'Galletas de Chocolate 200g', 'Galletas rellenas de chocolate', 28.00, 12.00, 90, 8],
    ['SNK-003', 'Barra de Granola', 'Barra de granola con miel y almendras', 18.00, 7.00, 120, 8],
    ['CON-001', 'Pizza Congelada 400g', 'Pizza de pepperoni congelada', 95.00, 50.00, 30, 9],
    ['CON-002', 'Helado Vainilla 1L', 'Helado de vainilla cremoso', 70.00, 32.00, 25, 9],
    ['CON-003', 'Verduras Mixtas 500g', 'Mezcla de verduras congeladas', 45.00, 20.00, 40, 9],
    ['DES-001', 'Arroz 1kg', 'Arroz blanco de grano largo', 28.00, 12.00, 80, 10],
    ['DES-002', 'Frijoles Refritos 500g', 'Frijoles refritos en lata', 25.00, 10.00, 70, 10],
    ['DES-003', 'Aceite Vegetal 1L', 'Aceite vegetal comestible', 48.00, 22.00, 60, 10],
    ['DES-004', 'Azúcar 1kg', 'Azúcar estándar refinada', 30.00, 13.00, 90, 10],
    ['DES-005', 'Sal 1kg', 'Sal de mesa yodada', 12.00, 4.00, 100, 10],
    ['BAL-001', 'Cerveza Lata 355ml', 'Cerveza rubia tipo lager', 25.00, 12.00, 200, 11],
    ['BAL-002', 'Vino Tinto 750ml', 'Vino tinto de mesa', 180.00, 90.00, 30, 11],
    ['MAS-001', 'Croquetas para Perro 2kg', 'Alimento balanceado para perro adulto', 85.00, 40.00, 40, 12],
    ['MAS-002', 'Croquetas para Gato 1.5kg', 'Alimento balanceado para gato adulto', 95.00, 45.00, 35, 12],
  ];
  for (const p of products) {
    insertProduct.run(...p);
  }

  const insertClient = database.prepare(
    'INSERT INTO clients (name, email, phone, address) VALUES (?, ?, ?, ?)'
  );
  const clients = [
    ['Juan Pérez', 'juan@example.com', '555-0101', 'Av. Siempre Viva 123, Centro'],
    ['María García', 'maria@example.com', '555-0102', 'Calle 5 de Mayo 456, Colonia Norte'],
    ['Carlos López', 'carlos@example.com', '555-0103', 'Blvd. Independencia 789, Sur'],
    ['Ana Martínez', 'ana@example.com', '555-0104', 'Calle Juárez 321, Oriente'],
    ['Roberto Hernández', 'roberto@example.com', '555-0105', 'Av. Reforma 654, Poniente'],
    ['Laura Rodríguez', 'laura@example.com', '555-0106', 'Calle Hidalgo 987, Centro'],
    ['Miguel Ángel Ruiz', 'miguel@example.com', '555-0107', 'Av. Universidad 147, Norte'],
    ['Sofía Jiménez', 'sofia@example.com', '555-0108', 'Calle Morelos 258, Sur'],
    ['Daniel Morales', 'daniel@example.com', '555-0109', 'Blvd. Aeropuerto 369, Oriente'],
    ['Fernanda Torres', 'fernanda@example.com', '555-0110', 'Av. Patria 741, Poniente'],
    ['Jorge Luis Nava', 'jorge@example.com', '555-0111', 'Calle Zaragoza 852, Centro'],
    ['Gabriela Serrano', 'gabriela@example.com', '555-0112', 'Av. Vallarta 963, Norte'],
  ];
  for (const c of clients) {
    insertClient.run(...c);
  }

  const insertCoupon = database.prepare(
    "INSERT INTO coupons (code, discount, type, is_global, client_id, valid_from, valid_until) VALUES (?, ?, ?, ?, ?, ?, ?)"
  );
  const coupons = [
    ['BIENVENIDO10', 10, 'percentage', 1, null, '2026-01-01', '2027-12-31'],
    ['VERANO20', 20, 'percentage', 1, null, '2026-06-01', '2026-09-30'],
    ['50PESOS', 50, 'fixed', 1, null, '2026-01-01', '2026-12-31'],
    ['3X2', 33.33, 'percentage', 1, null, '2026-01-01', '2026-08-31'],
    ['CLIENTE5', 5, 'percentage', 0, 2, '2026-01-01', '2027-06-30'],
  ];
  for (const c of coupons) {
    insertCoupon.run(...c);
  }

  const insertPromotion = database.prepare(
    "INSERT INTO promotions (name, description, discount, start_date, end_date) VALUES (?, ?, ?, ?, ?)"
  );
  const promotions = [
    ['Semana de Panadería', '20% de descuento en toda la panadería', 20, '2026-06-01', '2026-06-07'],
    ['Oferta de Verano', '15% en refrescos y aguas', 15, '2026-07-01', '2026-08-31'],
    ['Limpieza Total', '10% en productos de limpieza y detergentes', 10, '2026-06-15', '2026-07-15'],
  ];
  for (const p of promotions) {
    insertPromotion.run(...p);
  }

  const users = database.prepare('SELECT id FROM users').all();
  const allClients = database.prepare('SELECT id FROM clients').all();
  const allProducts = database.prepare('SELECT id, price FROM products').all();

  const insertSale = database.prepare(
    "INSERT INTO sales (user_id, client_id, total, created_at) VALUES (?, ?, ?, ?)"
  );
  const insertSaleItem = database.prepare(
    'INSERT INTO sale_items (sale_id, product_id, quantity, price) VALUES (?, ?, ?, ?)'
  );
  const updateStock = database.prepare(
    'UPDATE products SET stock = stock - ? WHERE id = ?'
  );

  const sales = [];
  const now = new Date();
  for (let i = 0; i < 25; i++) {
    const daysAgo = Math.floor(Math.random() * 30);
    const hours = Math.floor(Math.random() * 12) + 8;
    const minutes = Math.floor(Math.random() * 60);
    const date = new Date(now);
    date.setDate(date.getDate() - daysAgo);
    date.setHours(hours, minutes, 0, 0);
    const dateStr = date.toISOString().replace('T', ' ').substring(0, 19);

    const user = users[Math.floor(Math.random() * users.length)];
    const client = Math.random() > 0.3 ? allClients[Math.floor(Math.random() * allClients.length)].id : null;

    const itemCount = Math.floor(Math.random() * 5) + 1;
    let total = 0;
    const items = [];
    const usedProducts = new Set();
    for (let j = 0; j < itemCount; j++) {
      let product;
      do {
        product = allProducts[Math.floor(Math.random() * allProducts.length)];
      } while (usedProducts.has(product.id));
      usedProducts.add(product.id);
      const qty = Math.floor(Math.random() * 3) + 1;
      total += product.price * qty;
      items.push({ product, qty });
    }

    sales.push({ user_id: user.id, client_id: client, total: Math.round(total * 100) / 100, created_at: dateStr, items });
  }

  const seedTransaction = database.transaction(() => {
    for (const sale of sales) {
      const result = insertSale.run(sale.user_id, sale.client_id, sale.total, sale.created_at);
      const saleId = result.lastInsertRowid;
      for (const item of sale.items) {
        insertSaleItem.run(saleId, item.product.id, item.qty, item.product.price);
        updateStock.run(item.qty, item.product.id);
      }
    }
  });
  seedTransaction();

  console.log(`  Categories: ${categories.length}`);
  console.log(`  Products: ${products.length}`);
  console.log(`  Clients: ${clients.length}`);
  console.log(`  Coupons: ${coupons.length}`);
  console.log(`  Promotions: ${promotions.length}`);
  console.log(`  Sales: ${sales.length}`);
  console.log('Seed completed successfully.');
  return true;
}

if (require.main === module) {
  seedDatabase();
} else {
  module.exports = seedDatabase;
}
