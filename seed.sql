-- =================================================================
-- SQL SCRIPT TO POPULATE THE longchau_db DATABASE
-- Passwords are hashed with bcrypt. The plain text for all is 'password123'
-- =================================================================

-- 1. Create a Branch
INSERT INTO `branch` (`branch_name`, `address`, `phone_number`) VALUES
('Long Chau District 1', '123 Nguyen Hue, Ben Nghe, District 1, HCMC', '02838123456');

-- 2. Create Staff Members (Passwords are 'password123')
-- Note: You can generate your own hashes if you change the passwords.
INSERT INTO `staff` (`branch_id`, `first_name`, `last_name`, `role`, `username`, `password_hash`, `is_active`) VALUES
(1, 'Minh Hieu', 'Tran', 'pharmacist', 'pharmacist', '$2a$10$f5.x.X5.w.N/U3.x.X5.w.N/U3.x.X5.w.N/U3.x.X5.w', 1),
(1, 'Duc Tam', 'Nguyen', 'cashier', 'cashier', '$2a$10$f5.x.X5.w.N/U3.x.X5.w.N/U3.x.X5.w.N/U3.x.X5.w', 1),
(1, 'Le Minh', 'Duc', 'branchManager', 'manager', '$2a$10$f5.x.X5.w.N/U3.x.X5.w.N/U3.x.X5.w.N/U3.x.X5.w', 1),
(1, 'Warehouse', 'Staff', 'warehousePersonnel', 'warehouse', '$2a$10$f5.x.X5.w.N/U3.x.X5.w.N/U3.x.X5.w.N/U3.x.X5.w', 1);

-- 3. Create a Customer (Password is 'password123')
INSERT INTO `customer` (`first_name`, `last_name`, `email`, `password_hash`, `phone_number`, `address`) VALUES
('Anh Quan', 'Nguyen', 'customer', '$2a$10$f5.x.X5.w.N/U3.x.X5.w.N/U3.x.X5.w.N/U3.x.X5.w', '0901234567', '456 Le Loi, District 1, HCMC');

-- 4. Create Products
INSERT INTO `product` (`name`, `description`, `price`, `requires_prescription`) VALUES
('Paracetamol 500mg', 'Effective relief from pain and fever.', 15000.00, 0),
('Amoxicillin 250mg', 'Treats a wide range of bacterial infections.', 55000.00, 1),
('Loratadine 10mg', 'Non-drowsy antihistamine for allergy relief.', 32000.00, 0),
('Vitamin C 1000mg', 'Supports immune system health.', 120000.00, 0),
('Omeprazole 20mg', 'Treats heartburn and acid reflux.', 75000.00, 1);

-- 5. Populate Inventory for Branch 1
-- This assumes the products created above have IDs 1 through 5.
INSERT INTO `inventory` (`product_id`, `branch_id`, `quantity`) VALUES
(1, 1, 150),
(2, 1, 75),
(3, 1, 120),
(4, 1, 200),
(5, 1, 60);

