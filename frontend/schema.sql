-- #####################################################################
-- Long Chau Pharmacy Management System (LC-PMS) Database Schema
-- #####################################################################

--
-- Core Entities: branch, staff, customer, product
--

-- Represents a physical pharmacy location
CREATE TABLE IF NOT EXISTS branch (
    branch_id INT AUTO_INCREMENT PRIMARY KEY,
    branch_name VARCHAR(255) NOT NULL,
    address VARCHAR(255) NOT NULL,
    phone_number VARCHAR(20) UNIQUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Stores information about all employees
CREATE TABLE IF NOT EXISTS staff (
    staff_id INT AUTO_INCREMENT PRIMARY KEY,
    branch_id INT,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    role VARCHAR(50) NOT NULL COMMENT 'Pharmacist, Cashier, BranchManager, WarehousePersonnel',
    username VARCHAR(100) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (branch_id) REFERENCES branch(branch_id)
);

-- Stores customer account information
CREATE TABLE IF NOT EXISTS customer (
    customer_id INT AUTO_INCREMENT PRIMARY KEY,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    phone_number VARCHAR(20),
    address TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- The master catalog of all products sold
CREATE TABLE IF NOT EXISTS product (
    product_id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    price DECIMAL(10, 2) NOT NULL,
    requires_prescription BOOLEAN NOT NULL DEFAULT FALSE,
    is_active BOOLEAN DEFAULT TRUE, -- <-- ADDED THIS LINE
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

--
-- Supporting Entities: inventory, prescription
--

-- Manages stock levels for each product at each branch
CREATE TABLE IF NOT EXISTS inventory (
    inventory_id INT AUTO_INCREMENT PRIMARY KEY,
    product_id INT,
    branch_id INT,
    quantity INT NOT NULL DEFAULT 0,
    last_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    UNIQUE(product_id, branch_id),
    FOREIGN KEY (product_id) REFERENCES product(product_id),
    FOREIGN KEY (branch_id) REFERENCES branch(branch_id)
);

-- Stores uploaded prescriptions for validation
CREATE TABLE IF NOT EXISTS prescription (
    prescription_id INT AUTO_INCREMENT PRIMARY KEY,
    customer_id INT,
    pharmacist_id INT NULL,
    image_url VARCHAR(255) NOT NULL,
    status VARCHAR(50) NOT NULL DEFAULT 'pending' COMMENT 'pending, approved, rejected',
    notes TEXT,
    validated_at TIMESTAMP NULL,
    uploaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (customer_id) REFERENCES customer(customer_id),
    FOREIGN KEY (pharmacist_id) REFERENCES staff(staff_id)
);

--
-- Transactional Entities: order, order_item, payment, receipt, delivery
--

-- Represents a single customer order
CREATE TABLE IF NOT EXISTS `order` (
    order_id INT AUTO_INCREMENT PRIMARY KEY,
    customer_id INT,
    branch_id INT,
    prescription_id INT NULL,
    status VARCHAR(50) NOT NULL DEFAULT 'pending' COMMENT 'pending, processing, completed, cancelled',
    total_amount DECIMAL(10, 2) NOT NULL,
    order_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (customer_id) REFERENCES customer(customer_id),
    FOREIGN KEY (branch_id) REFERENCES branch(branch_id),
    FOREIGN KEY (prescription_id) REFERENCES prescription(prescription_id)
);

-- A line item within an order
CREATE TABLE IF NOT EXISTS order_item (
    order_item_id INT AUTO_INCREMENT PRIMARY KEY,
    order_id INT,
    product_id INT,
    quantity INT NOT NULL,
    price_per_unit DECIMAL(10, 2) NOT NULL,
    FOREIGN KEY (order_id) REFERENCES `order`(order_id),
    FOREIGN KEY (product_id) REFERENCES product(product_id)
);

-- Handles the financial transaction for an order
CREATE TABLE IF NOT EXISTS payment (
    payment_id INT AUTO_INCREMENT PRIMARY KEY,
    order_id INT,
    payment_method VARCHAR(50) NOT NULL COMMENT 'cash, credit_card, e_wallet',
    amount DECIMAL(10, 2) NOT NULL,
    status VARCHAR(50) NOT NULL DEFAULT 'pending' COMMENT 'pending, completed, failed',
    transaction_id VARCHAR(255),
    payment_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (order_id) REFERENCES `order`(order_id)
);

-- Represents the confirmation of a completed transaction
CREATE TABLE IF NOT EXISTS receipt (
    receipt_id INT AUTO_INCREMENT PRIMARY KEY,
    payment_id INT,
    receipt_data TEXT,
    generated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (payment_id) REFERENCES payment(payment_id)
);

-- Manages the delivery or pickup for an order
CREATE TABLE IF NOT EXISTS delivery (
    delivery_id INT AUTO_INCREMENT PRIMARY KEY,
    order_id INT,
    delivery_method VARCHAR(50) NOT NULL COMMENT 'home_delivery, in_store_pickup',
    address TEXT,
    status VARCHAR(50) NOT NULL DEFAULT 'preparing' COMMENT 'preparing, out_for_delivery, delivered, picked_up',
    tracking_number VARCHAR(100),
    estimated_delivery_date DATE,
    FOREIGN KEY (order_id) REFERENCES `order`(order_id)
);

-- Manages all system-generated notifications
CREATE TABLE IF NOT EXISTS notification (
    notification_id INT AUTO_INCREMENT PRIMARY KEY,
    customer_id INT,
    staff_id INT,
    order_id INT,
    message TEXT NOT NULL,
    channel VARCHAR(50) NOT NULL COMMENT 'sms, email, in_app',
    status VARCHAR(50) NOT NULL DEFAULT 'pending' COMMENT 'pending, sent, failed',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    sent_at TIMESTAMP NULL,
    FOREIGN KEY (customer_id) REFERENCES customer(customer_id),
    FOREIGN KEY (staff_id) REFERENCES staff(staff_id),
    FOREIGN KEY (order_id) REFERENCES `order`(order_id)
);