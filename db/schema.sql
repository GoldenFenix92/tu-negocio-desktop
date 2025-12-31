CREATE DATABASE IF NOT EXISTS tu_negocio;
USE tu_negocio;

-- Table for business configuration
CREATE TABLE IF NOT EXISTS business_config (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    address TEXT,
    phone VARCHAR(20),
    logo_path TEXT,
    typography VARCHAR(50) DEFAULT 'Montserrat'
);

-- Table for users/roles
CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    role ENUM('Administrator', 'Supervisor', 'Cashier') NOT NULL
);

-- Table for categories
CREATE TABLE IF NOT EXISTS categories (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) UNIQUE NOT NULL
);

-- Table for products
CREATE TABLE IF NOT EXISTS products (
    id INT AUTO_INCREMENT PRIMARY KEY,
    code VARCHAR(50) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    price DECIMAL(10, 2) NOT NULL,
    cost DECIMAL(10, 2) NOT NULL,
    stock INT DEFAULT 0,
    category_id INT,
    FOREIGN KEY (category_id) REFERENCES categories(id)
);

-- Table for clients
CREATE TABLE IF NOT EXISTS clients (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255),
    phone VARCHAR(20),
    address TEXT
);

-- Table for sales
CREATE TABLE IF NOT EXISTS sales (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT,
    client_id INT,
    total DECIMAL(10, 2) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id),
    FOREIGN KEY (client_id) REFERENCES clients(id)
);

-- Table for sale items
CREATE TABLE IF NOT EXISTS sale_items (
    id INT AUTO_INCREMENT PRIMARY KEY,
    sale_id INT,
    product_id INT,
    quantity INT NOT NULL,
    price DECIMAL(10, 2) NOT NULL,
    FOREIGN KEY (sale_id) REFERENCES sales(id),
    FOREIGN KEY (product_id) REFERENCES products(id)
);

-- Table for coupons
CREATE TABLE IF NOT EXISTS coupons (
    id INT AUTO_INCREMENT PRIMARY KEY,
    code VARCHAR(50) UNIQUE NOT NULL,
    discount DECIMAL(5, 2) NOT NULL,
    type ENUM('percentage', 'fixed') NOT NULL,
    expiry_date DATE
);

-- Table for seasonal promotions
CREATE TABLE IF NOT EXISTS promotions (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    discount DECIMAL(5, 2) NOT NULL,
    start_date DATE,
    end_date DATE
);

-- Table for sections visible/hidden per user (Customization required by user)
CREATE TABLE IF NOT EXISTS sections_visibility (
    id INT AUTO_INCREMENT PRIMARY KEY,
    role ENUM('Administrator', 'Supervisor', 'Cashier') NOT NULL,
    section_name VARCHAR(50) NOT NULL,
    is_visible BOOLEAN DEFAULT TRUE,
    UNIQUE(role, section_name)
);

-- Initial users
INSERT IGNORE INTO users (username, password, role) VALUES ('admin', 'admin', 'Administrator');
INSERT IGNORE INTO users (username, password, role) VALUES ('supervisor', 'supervisor', 'Supervisor');
INSERT IGNORE INTO users (username, password, role) VALUES ('cajero', 'cajero', 'Cashier');
