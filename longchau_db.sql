-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Generation Time: Jul 28, 2025 at 09:05 AM
-- Server version: 10.4.32-MariaDB
-- PHP Version: 8.2.12

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `longchau_db`
--

-- --------------------------------------------------------

--
-- Table structure for table `branch`
--

CREATE TABLE `branch` (
  `branch_id` int(11) NOT NULL,
  `branch_name` varchar(255) NOT NULL,
  `address` varchar(255) NOT NULL,
  `phone_number` varchar(20) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `branch`
--

INSERT INTO `branch` (`branch_id`, `branch_name`, `address`, `phone_number`, `created_at`) VALUES
(1, 'Long Chau District 1', '123 Nguyen Hue, Ben Nghe, District 1, HCMC', '02838123456', '2025-07-26 18:13:38');

-- --------------------------------------------------------

--
-- Table structure for table `customer`
--

CREATE TABLE `customer` (
  `customer_id` int(11) NOT NULL,
  `first_name` varchar(100) NOT NULL,
  `last_name` varchar(100) NOT NULL,
  `email` varchar(255) NOT NULL,
  `password_hash` varchar(255) NOT NULL,
  `phone_number` varchar(20) DEFAULT NULL,
  `address` text DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `customer`
--

INSERT INTO `customer` (`customer_id`, `first_name`, `last_name`, `email`, `password_hash`, `phone_number`, `address`, `created_at`) VALUES
(1, 'Anh Quan', 'Nguyen', 'customer', '$2b$10$olM2G0/cC.i7k9rgzi/8NODpJZTucdwu1jm66ORcIMGEdxBsBUNMC', '0901234567', '456 Le Loi, District 1, HCMC', '2025-07-26 18:13:38');

-- --------------------------------------------------------

--
-- Table structure for table `delivery`
--

CREATE TABLE `delivery` (
  `delivery_id` int(11) NOT NULL,
  `order_id` int(11) DEFAULT NULL,
  `delivery_method` varchar(50) NOT NULL COMMENT 'home_delivery, in_store_pickup',
  `address` text DEFAULT NULL,
  `status` varchar(50) NOT NULL DEFAULT 'preparing' COMMENT 'preparing, out_for_delivery, delivered, picked_up',
  `tracking_number` varchar(100) DEFAULT NULL,
  `estimated_delivery_date` date DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `inventory`
--

CREATE TABLE `inventory` (
  `inventory_id` int(11) NOT NULL,
  `product_id` int(11) DEFAULT NULL,
  `branch_id` int(11) DEFAULT NULL,
  `quantity` int(11) NOT NULL DEFAULT 0,
  `last_updated` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `inventory`
--

INSERT INTO `inventory` (`inventory_id`, `product_id`, `branch_id`, `quantity`, `last_updated`) VALUES
(1, 1, 1, 150, '2025-07-26 18:13:38'),
(2, 2, 1, 75, '2025-07-26 18:13:38'),
(3, 3, 1, 120, '2025-07-26 18:13:38'),
(4, 4, 1, 200, '2025-07-26 18:13:38'),
(5, 5, 1, 60, '2025-07-26 18:13:38');

-- --------------------------------------------------------

--
-- Table structure for table `notification`
--

CREATE TABLE `notification` (
  `notification_id` int(11) NOT NULL,
  `customer_id` int(11) DEFAULT NULL,
  `staff_id` int(11) DEFAULT NULL,
  `order_id` int(11) DEFAULT NULL,
  `message` text NOT NULL,
  `channel` varchar(50) NOT NULL COMMENT 'sms, email, in_app',
  `status` varchar(50) NOT NULL DEFAULT 'pending' COMMENT 'pending, sent, failed',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `sent_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `order`
--

CREATE TABLE `order` (
  `order_id` int(11) NOT NULL,
  `customer_id` int(11) DEFAULT NULL,
  `branch_id` int(11) DEFAULT NULL,
  `status` varchar(50) NOT NULL DEFAULT 'pending_prescription' COMMENT 'pending_prescription, pending_payment, processing, completed, cancelled',
  `total_amount` decimal(10,2) NOT NULL,
  `order_date` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `order`
--

INSERT INTO `order` (`order_id`, `customer_id`, `branch_id`, `status`, `total_amount`, `order_date`) VALUES
(1, 1, NULL, 'awaiting_verification', 15000.00, '2025-07-27 17:50:20'),
(2, 1, NULL, 'awaiting_verification', 70000.00, '2025-07-27 17:51:52'),
(3, 1, NULL, 'pending_prescription', 70000.00, '2025-07-27 17:52:05'),
(4, 1, NULL, 'pending_prescription', 70000.00, '2025-07-27 17:52:08'),
(5, 1, NULL, 'pending_prescription', 70000.00, '2025-07-27 17:52:09'),
(6, 1, NULL, 'pending_prescription', 70000.00, '2025-07-27 17:53:48'),
(7, 1, NULL, 'pending_prescription', 70000.00, '2025-07-27 17:53:49'),
(8, 1, NULL, 'pending_prescription', 55000.00, '2025-07-27 18:13:43'),
(9, 1, NULL, 'pending_prescription', 110000.00, '2025-07-27 18:15:56'),
(10, 1, NULL, 'pending_prescription', 55000.00, '2025-07-27 18:24:03'),
(11, 1, NULL, 'pending_prescription', 165000.00, '2025-07-27 18:30:48'),
(12, 1, NULL, 'pending_prescription', 75000.00, '2025-07-27 18:33:53'),
(13, 1, NULL, 'pending_prescription', 207000.00, '2025-07-27 18:42:06'),
(14, 1, NULL, 'awaiting_verification', 32000.00, '2025-07-28 03:24:10'),
(15, 1, NULL, 'awaiting_verification', 152000.00, '2025-07-28 03:27:25'),
(16, 1, 1, 'awaiting_verification', 47000.00, '2025-07-28 03:34:27'),
(17, 1, NULL, 'pending_prescription', 70000.00, '2025-07-28 03:49:08'),
(18, 1, NULL, 'pending_prescription', 55000.00, '2025-07-28 03:52:28'),
(19, 1, NULL, 'awaiting_verification', 32000.00, '2025-07-28 03:53:35');

-- --------------------------------------------------------

--
-- Table structure for table `order_item`
--

CREATE TABLE `order_item` (
  `order_item_id` int(11) NOT NULL,
  `order_id` int(11) DEFAULT NULL,
  `product_id` int(11) DEFAULT NULL,
  `quantity` int(11) NOT NULL,
  `price_per_unit` decimal(10,2) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `order_item`
--

INSERT INTO `order_item` (`order_item_id`, `order_id`, `product_id`, `quantity`, `price_per_unit`) VALUES
(1, 1, 1, 1, 15000.00),
(2, 2, 1, 1, 15000.00),
(3, 2, 2, 1, 55000.00),
(4, 3, 1, 1, 15000.00),
(5, 3, 2, 1, 55000.00),
(6, 4, 1, 1, 15000.00),
(7, 4, 2, 1, 55000.00),
(8, 5, 1, 1, 15000.00),
(9, 5, 2, 1, 55000.00),
(10, 6, 1, 1, 15000.00),
(11, 6, 2, 1, 55000.00),
(12, 7, 1, 1, 15000.00),
(13, 7, 2, 1, 55000.00),
(14, 8, 2, 1, 55000.00),
(15, 9, 2, 2, 55000.00),
(16, 10, 2, 1, 55000.00),
(17, 11, 2, 3, 55000.00),
(18, 12, 5, 1, 75000.00),
(19, 13, 2, 1, 55000.00),
(20, 13, 3, 1, 32000.00),
(21, 13, 4, 1, 120000.00),
(22, 14, 3, 1, 32000.00),
(23, 15, 4, 1, 120000.00),
(24, 15, 3, 1, 32000.00),
(25, 16, 3, 1, 32000.00),
(26, 16, 1, 1, 15000.00),
(27, 17, 1, 1, 15000.00),
(28, 17, 2, 1, 55000.00),
(29, 18, 2, 1, 55000.00),
(30, 19, 3, 1, 32000.00);

-- --------------------------------------------------------

--
-- Table structure for table `payment`
--

CREATE TABLE `payment` (
  `payment_id` int(11) NOT NULL,
  `order_id` int(11) DEFAULT NULL,
  `payment_method` varchar(50) NOT NULL COMMENT 'cash, credit_card, e_wallet',
  `amount` decimal(10,2) NOT NULL,
  `status` varchar(50) NOT NULL DEFAULT 'pending' COMMENT 'pending, completed, failed',
  `transaction_id` varchar(255) DEFAULT NULL,
  `payment_date` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `prescription`
--

CREATE TABLE `prescription` (
  `prescription_id` int(11) NOT NULL,
  `customer_id` int(11) DEFAULT NULL,
  `order_id` int(11) DEFAULT NULL,
  `pharmacist_id` int(11) DEFAULT NULL,
  `image_url` varchar(255) NOT NULL,
  `status` varchar(50) NOT NULL DEFAULT 'pending' COMMENT 'pending, approved, rejected',
  `notes` text DEFAULT NULL,
  `validated_at` timestamp NULL DEFAULT NULL,
  `uploaded_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `product`
--

CREATE TABLE `product` (
  `product_id` int(11) NOT NULL,
  `name` varchar(255) NOT NULL,
  `description` text DEFAULT NULL,
  `price` decimal(10,2) NOT NULL,
  `requires_prescription` tinyint(1) NOT NULL DEFAULT 0,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `product`
--

INSERT INTO `product` (`product_id`, `name`, `description`, `price`, `requires_prescription`, `created_at`) VALUES
(1, 'Paracetamol 500mg', 'Effective relief from pain and fever.', 15000.00, 0, '2025-07-26 18:13:38'),
(2, 'Amoxicillin 250mg', 'Treats a wide range of bacterial infections.', 55000.00, 1, '2025-07-26 18:13:38'),
(3, 'Loratadine 10mg', 'Non-drowsy antihistamine for allergy relief.', 32000.00, 0, '2025-07-26 18:13:38'),
(4, 'Vitamin C 1000mg', 'Supports immune system health.', 120000.00, 0, '2025-07-26 18:13:38'),
(5, 'Omeprazole 20mg', 'Treats heartburn and acid reflux.', 75000.00, 1, '2025-07-26 18:13:38');

-- --------------------------------------------------------

--
-- Table structure for table `receipt`
--

CREATE TABLE `receipt` (
  `receipt_id` int(11) NOT NULL,
  `payment_id` int(11) DEFAULT NULL,
  `receipt_data` text DEFAULT NULL,
  `generated_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `staff`
--

CREATE TABLE `staff` (
  `staff_id` int(11) NOT NULL,
  `branch_id` int(11) DEFAULT NULL,
  `first_name` varchar(100) NOT NULL,
  `last_name` varchar(100) NOT NULL,
  `role` varchar(50) NOT NULL COMMENT 'Pharmacist, Cashier, BranchManager, WarehousePersonnel',
  `username` varchar(100) NOT NULL,
  `password_hash` varchar(255) NOT NULL,
  `is_active` tinyint(1) DEFAULT 1,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `staff`
--

INSERT INTO `staff` (`staff_id`, `branch_id`, `first_name`, `last_name`, `role`, `username`, `password_hash`, `is_active`, `created_at`) VALUES
(1, 1, 'Minh Hieu', 'Tran', 'pharmacist', 'pharmacist', '$2b$10$olM2G0/cC.i7k9rgzi/8NODpJZTucdwu1jm66ORcIMGEdxBsBUNMC', 1, '2025-07-26 18:13:38'),
(2, 1, 'Duc Tam', 'Nguyen', 'cashier', 'cashier', '$2b$10$olM2G0/cC.i7k9rgzi/8NODpJZTucdwu1jm66ORcIMGEdxBsBUNMC', 1, '2025-07-26 18:13:38'),
(3, 1, 'Le Minh', 'Duc', 'branchManager', 'manager', '$2b$10$olM2G0/cC.i7k9rgzi/8NODpJZTucdwu1jm66ORcIMGEdxBsBUNMC', 1, '2025-07-26 18:13:38'),
(4, 1, 'Warehouse', 'Staff', 'warehousePersonnel', 'warehouse', '$2b$10$olM2G0/cC.i7k9rgzi/8NODpJZTucdwu1jm66ORcIMGEdxBsBUNMC', 1, '2025-07-26 18:13:38');

--
-- Indexes for dumped tables
--

--
-- Indexes for table `branch`
--
ALTER TABLE `branch`
  ADD PRIMARY KEY (`branch_id`),
  ADD UNIQUE KEY `phone_number` (`phone_number`);

--
-- Indexes for table `customer`
--
ALTER TABLE `customer`
  ADD PRIMARY KEY (`customer_id`),
  ADD UNIQUE KEY `email` (`email`);

--
-- Indexes for table `delivery`
--
ALTER TABLE `delivery`
  ADD PRIMARY KEY (`delivery_id`),
  ADD KEY `order_id` (`order_id`);

--
-- Indexes for table `inventory`
--
ALTER TABLE `inventory`
  ADD PRIMARY KEY (`inventory_id`),
  ADD UNIQUE KEY `product_id` (`product_id`,`branch_id`),
  ADD KEY `branch_id` (`branch_id`);

--
-- Indexes for table `notification`
--
ALTER TABLE `notification`
  ADD PRIMARY KEY (`notification_id`),
  ADD KEY `customer_id` (`customer_id`),
  ADD KEY `staff_id` (`staff_id`),
  ADD KEY `order_id` (`order_id`);

--
-- Indexes for table `order`
--
ALTER TABLE `order`
  ADD PRIMARY KEY (`order_id`),
  ADD KEY `customer_id` (`customer_id`),
  ADD KEY `branch_id` (`branch_id`);

--
-- Indexes for table `order_item`
--
ALTER TABLE `order_item`
  ADD PRIMARY KEY (`order_item_id`),
  ADD KEY `order_id` (`order_id`),
  ADD KEY `product_id` (`product_id`);

--
-- Indexes for table `payment`
--
ALTER TABLE `payment`
  ADD PRIMARY KEY (`payment_id`),
  ADD KEY `order_id` (`order_id`);

--
-- Indexes for table `prescription`
--
ALTER TABLE `prescription`
  ADD PRIMARY KEY (`prescription_id`),
  ADD KEY `customer_id` (`customer_id`),
  ADD KEY `pharmacist_id` (`pharmacist_id`),
  ADD KEY `order_id` (`order_id`);

--
-- Indexes for table `product`
--
ALTER TABLE `product`
  ADD PRIMARY KEY (`product_id`);

--
-- Indexes for table `receipt`
--
ALTER TABLE `receipt`
  ADD PRIMARY KEY (`receipt_id`),
  ADD KEY `payment_id` (`payment_id`);

--
-- Indexes for table `staff`
--
ALTER TABLE `staff`
  ADD PRIMARY KEY (`staff_id`),
  ADD UNIQUE KEY `username` (`username`),
  ADD KEY `branch_id` (`branch_id`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `branch`
--
ALTER TABLE `branch`
  MODIFY `branch_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT for table `customer`
--
ALTER TABLE `customer`
  MODIFY `customer_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT for table `delivery`
--
ALTER TABLE `delivery`
  MODIFY `delivery_id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `inventory`
--
ALTER TABLE `inventory`
  MODIFY `inventory_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;

--
-- AUTO_INCREMENT for table `notification`
--
ALTER TABLE `notification`
  MODIFY `notification_id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `order`
--
ALTER TABLE `order`
  MODIFY `order_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=20;

--
-- AUTO_INCREMENT for table `order_item`
--
ALTER TABLE `order_item`
  MODIFY `order_item_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=31;

--
-- AUTO_INCREMENT for table `payment`
--
ALTER TABLE `payment`
  MODIFY `payment_id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `prescription`
--
ALTER TABLE `prescription`
  MODIFY `prescription_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT for table `product`
--
ALTER TABLE `product`
  MODIFY `product_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;

--
-- AUTO_INCREMENT for table `receipt`
--
ALTER TABLE `receipt`
  MODIFY `receipt_id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `staff`
--
ALTER TABLE `staff`
  MODIFY `staff_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- Constraints for dumped tables
--

--
-- Constraints for table `delivery`
--
ALTER TABLE `delivery`
  ADD CONSTRAINT `delivery_ibfk_1` FOREIGN KEY (`order_id`) REFERENCES `order` (`order_id`);

--
-- Constraints for table `inventory`
--
ALTER TABLE `inventory`
  ADD CONSTRAINT `inventory_ibfk_1` FOREIGN KEY (`product_id`) REFERENCES `product` (`product_id`),
  ADD CONSTRAINT `inventory_ibfk_2` FOREIGN KEY (`branch_id`) REFERENCES `branch` (`branch_id`);

--
-- Constraints for table `notification`
--
ALTER TABLE `notification`
  ADD CONSTRAINT `notification_ibfk_1` FOREIGN KEY (`customer_id`) REFERENCES `customer` (`customer_id`),
  ADD CONSTRAINT `notification_ibfk_2` FOREIGN KEY (`staff_id`) REFERENCES `staff` (`staff_id`),
  ADD CONSTRAINT `notification_ibfk_3` FOREIGN KEY (`order_id`) REFERENCES `order` (`order_id`);

--
-- Constraints for table `order`
--
ALTER TABLE `order`
  ADD CONSTRAINT `order_ibfk_1` FOREIGN KEY (`customer_id`) REFERENCES `customer` (`customer_id`),
  ADD CONSTRAINT `order_ibfk_2` FOREIGN KEY (`branch_id`) REFERENCES `branch` (`branch_id`);

--
-- Constraints for table `order_item`
--
ALTER TABLE `order_item`
  ADD CONSTRAINT `order_item_ibfk_1` FOREIGN KEY (`order_id`) REFERENCES `order` (`order_id`),
  ADD CONSTRAINT `order_item_ibfk_2` FOREIGN KEY (`product_id`) REFERENCES `product` (`product_id`);

--
-- Constraints for table `payment`
--
ALTER TABLE `payment`
  ADD CONSTRAINT `payment_ibfk_1` FOREIGN KEY (`order_id`) REFERENCES `order` (`order_id`);

--
-- Constraints for table `prescription`
--
ALTER TABLE `prescription`
  ADD CONSTRAINT `prescription_ibfk_1` FOREIGN KEY (`customer_id`) REFERENCES `customer` (`customer_id`),
  ADD CONSTRAINT `prescription_ibfk_2` FOREIGN KEY (`pharmacist_id`) REFERENCES `staff` (`staff_id`),
  ADD CONSTRAINT `prescription_ibfk_3` FOREIGN KEY (`order_id`) REFERENCES `order` (`order_id`);

--
-- Constraints for table `receipt`
--
ALTER TABLE `receipt`
  ADD CONSTRAINT `receipt_ibfk_1` FOREIGN KEY (`payment_id`) REFERENCES `payment` (`payment_id`);

--
-- Constraints for table `staff`
--
ALTER TABLE `staff`
  ADD CONSTRAINT `staff_ibfk_1` FOREIGN KEY (`branch_id`) REFERENCES `branch` (`branch_id`);
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
