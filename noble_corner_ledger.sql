-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Generation Time: Feb 25, 2025 at 09:23 AM
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
-- Database: `noble_corner_ledger`
--

-- --------------------------------------------------------

--
-- Table structure for table `ledgers`
--

CREATE TABLE `ledgers` (
  `id` int(11) NOT NULL,
  `date` date NOT NULL,
  `challan_no` varchar(255) DEFAULT NULL,
  `description` text DEFAULT NULL,
  `quantity` text DEFAULT NULL,
  `debit` decimal(10,2) DEFAULT NULL,
  `credit` decimal(10,2) DEFAULT NULL,
  `payment_method` enum('cash','cheque') NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `vendor_name` varchar(255) DEFAULT NULL,
  `price_per_meter` varchar(255) DEFAULT NULL,
  `balance` decimal(15,2) DEFAULT 0.00,
  `is_initial_entry` tinyint(1) DEFAULT 0
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `ledgers`
--

INSERT INTO `ledgers` (`id`, `date`, `challan_no`, `description`, `quantity`, `debit`, `credit`, `payment_method`, `created_at`, `vendor_name`, `price_per_meter`, `balance`, `is_initial_entry`) VALUES
(13, '2025-02-12', 'CH010', 'Purchase of goods', '120', 72000.00, 60020.00, '', '2025-02-13 03:00:00', 'ABC Corp Updated', '200', 0.00, 0),
(15, '2025-02-15', 'CH012', 'Purchase of raw materials', '30', 3000.00, 0.00, '', '2025-02-15 09:45:00', 'Kohistan Traders', NULL, 0.00, 0),
(16, '2025-02-13', 'CH013', 'Purchase of office furniture', '20', 2000.00, 0.00, 'cash', '2025-02-13 04:30:00', 'ABC Corp Updated', NULL, 0.00, 0),
(17, '2025-02-14', 'CH014', 'Sale of office supplies', '10', 0.00, 1000.00, '', '2025-02-14 06:00:00', 'ABC Corp Updated', NULL, 0.00, 0),
(19, '2025-02-14', 'CH016', 'Purchase of packaging materials', '200', 2500.00, 0.00, 'cash', '2025-02-14 07:30:00', 'shaheercorp', NULL, 0.00, 0),
(20, '2025-02-15', 'CH017', 'Sale of packaging materials', '150', 0.00, 1500.00, '', '2025-02-15 09:00:00', 'shaheercorp', NULL, 0.00, 0),
(21, '2025-02-16', 'CH018', 'Purchase of products for resale', '50', 5000.00, 0.00, '', '2025-02-16 10:00:00', 'shaheercorp', NULL, 0.00, 0),
(23, '2025-02-17', 'CH020', 'Sale of goods', '40', 0.00, 4000.00, '', '2025-02-17 05:00:00', 'Kohistan Traders', NULL, 0.00, 0),
(24, '2025-02-18', 'CH021', 'Purchase of items for production', '60', 6000.00, 0.00, '', '2025-02-18 08:30:00', 'Kohistan Traders', NULL, 0.00, 0),
(25, '2023-06-01', 'CH0062', 'Purchase of raw materials', '20', 2000.00, 500000.00, '', '2025-02-10 10:57:55', 'shaheercorp', NULL, 0.00, 0),
(27, '2025-02-11', '-', 'Initial Ledger Entry', '0', 0.00, 0.00, '', '2025-02-11 14:43:27', 'Noble Corner', NULL, 0.00, 0),
(29, '2025-02-13', 'CH123', 'Description 1', '10', 500.00, 0.00, 'cash', '2025-02-13 05:35:45', 'Global Traders', '100', 0.00, 0),
(30, '2025-02-13', 'CH123', 'Description 2', '20', 1000.00, 0.00, 'cash', '2025-02-13 05:35:45', 'Global Traders', '150', 0.00, 0),
(31, '2025-02-13', 'CH123', 'Updated Description 1', '15', 600.00, 0.00, 'cheque', '2025-02-13 05:39:56', 'Global Traders', '110', 0.00, 0),
(32, '2025-02-13', 'CH123', 'Updated Description 2', '25', 1200.00, 0.00, 'cheque', '2025-02-13 05:39:56', 'Vendor XYZ', '160', 0.00, 0),
(33, '2025-02-13', 'CHOIS55', 'Pasha 1', '15', 600.00, 0.00, 'cheque', '2025-02-13 05:47:55', 'Shaheer Corp', '110 per meter', 0.00, 0),
(34, '2025-02-13', 'CHOIS55', 'Pasha2', '25', 1200.00, 0.00, 'cheque', '2025-02-13 05:47:55', 'Shaheer Corp', '160 @ meter ', 0.00, 0),
(35, '2000-01-01', NULL, 'Pasha 1', '15', 600.00, 0.00, 'cheque', '2025-02-13 08:35:46', 'Shaheer Corp', '110 per meter', 0.00, 0),
(36, '2000-01-01', NULL, 'Pasha 2', '25', 1200.00, 0.00, 'cheque', '2025-02-13 08:35:46', 'Shaheer Corp', '160 @ meter', 0.00, 0),
(37, '2000-01-01', NULL, 'Pasha 3', '35', 5400.00, 0.00, 'cheque', '2025-02-13 08:35:46', 'shaheercorp', '150 per meter', 0.00, 0),
(38, '2000-01-01', NULL, 'Pasha 4', '55', 8200.00, 0.00, 'cheque', '2025-02-13 08:35:46', 'shaheercorp', '200 per meter', 0.00, 0),
(39, '2000-01-01', NULL, 'Pasha 5', '65', 6050.00, 0.00, 'cheque', '2025-02-13 08:35:46', 'Global Traders', '130 per meter', 0.00, 0),
(40, '2000-01-01', NULL, 'Pasha 6', '25', 6200.00, 0.00, 'cheque', '2025-02-13 08:35:46', 'shaheercorp', '180 per meter', 0.00, 0),
(41, '2000-01-01', NULL, 'Pasha 1', '15', 600.00, 0.00, 'cheque', '2025-02-13 08:51:53', 'Shaheer Corp', '110 per meter', 0.00, 0),
(42, '2000-01-01', NULL, 'Pasha 2', '25', 6200.00, 0.00, 'cheque', '2025-02-13 08:51:53', 'Shaheer Corp', '160 @ meter', 0.00, 0),
(43, '2000-01-01', NULL, 'Pasha 3', '35', 0.00, 0.00, 'cheque', '2025-02-13 08:51:53', 'Shaheer Corp', '150 per meter', 0.00, 0),
(44, '2000-01-01', NULL, 'Pasha 4', '55', 0.00, 0.00, 'cheque', '2025-02-13 08:51:53', 'Shaheer Corp', '-', 0.00, 0),
(45, '2000-01-01', NULL, 'Pasha 5', '65', 0.00, 0.00, 'cheque', '2025-02-13 08:51:53', 'Shaheer Corp', '-', 0.00, 0),
(46, '2000-01-01', NULL, 'Pasha 6', '25', 0.00, 0.00, 'cheque', '2025-02-13 08:51:53', 'Shaheer Corp', '-', 0.00, 0),
(47, '2000-01-01', NULL, 'Pasha 1', '15', 600.00, 0.00, 'cheque', '2025-02-13 08:52:24', 'Shaheer Corp', '110 per meter', 0.00, 0),
(48, '2000-01-01', NULL, 'Pasha 2', '25', 6200.00, 0.00, 'cheque', '2025-02-13 08:52:24', 'Shaheer Corp', '160 @ meter', 0.00, 0),
(49, '2000-01-01', NULL, 'Pasha 3', '35', 0.00, 0.00, 'cheque', '2025-02-13 08:52:24', 'Shaheer Corp', '150 per meter', 0.00, 0),
(50, '2000-01-01', NULL, 'Pasha 4', '55', 0.00, 0.00, 'cheque', '2025-02-13 08:52:24', 'Shaheer Corp', '-', 0.00, 0),
(51, '2000-01-01', NULL, 'Pasha 5', '65', 0.00, 0.00, 'cheque', '2025-02-13 08:52:24', 'Shaheer Corp', '-', 0.00, 0),
(52, '2000-01-01', NULL, 'Pasha 6 , Pasha 1', '25', 0.00, 0.00, 'cheque', '2025-02-13 08:52:24', 'Shaheer Corp', '-', 0.00, 0),
(53, '2000-01-01', NULL, 'Pasha 2', '0', 0.00, 0.00, 'cheque', '2025-02-13 08:52:24', 'Shaheer Corp', '-', 0.00, 0),
(54, '2000-01-01', NULL, 'Pasha 3', '0', 0.00, 0.00, 'cheque', '2025-02-13 08:52:24', 'Shaheer Corp', '-', 0.00, 0),
(55, '2000-01-01', NULL, 'Pasha 4', '0', 0.00, 0.00, 'cheque', '2025-02-13 08:52:24', 'Shaheer Corp', '-', 0.00, 0),
(56, '2000-01-01', NULL, 'Pasha 5', '0', 0.00, 0.00, 'cheque', '2025-02-13 08:52:24', 'ShaheerCorp', '-', 0.00, 0),
(57, '2025-02-13', 'CHOIS55', 'Pasha 1, Pasha 2, Pasha 3', '15', 600.00, 0.00, 'cheque', '2025-02-13 11:44:22', 'shaheercorp', '110 per meter, 160 @ meter, 150 per meter', 0.00, 0),
(58, '2025-02-13', 'CH123456', 'Description 1, Description 2, Description 3, Description 4', '10', 100.00, 50.00, 'cash', '2025-02-13 11:45:50', 'shaheercorp', '$15, $20', 0.00, 0),
(59, '2025-02-13', 'CH123456', 'Description 1, Description 2, Description 3, Description 4', '0', 100.00, 50.00, 'cash', '2025-02-13 12:08:42', 'Vendor ABC', '$15, $20', 0.00, 0),
(60, '2025-02-13', 'CH123456', 'Description 1', '0', 100.00, 50.00, 'cash', '2025-02-13 12:11:10', 'Vendor ABC', '$15', 0.00, 0),
(61, '2025-02-13', 'CH123456', 'Description 2', '0', 0.00, 0.00, 'cash', '2025-02-13 12:11:10', 'Vendor ABC', '$20', 0.00, 0),
(62, '2025-02-13', 'CH123456', 'Description 3', '0', 0.00, 0.00, 'cash', '2025-02-13 12:11:10', 'Vendor ABC', '-', 0.00, 0),
(63, '2025-02-13', 'CH123456', 'Description 4', '0', 0.00, 0.00, 'cash', '2025-02-13 12:11:10', 'Vendor ABC', '-', 0.00, 0),
(64, '2025-02-13', 'CH123456', 'Description 1', '0', 100.00, 50.00, 'cash', '2025-02-13 12:11:11', 'Vendor ABC', '$15', 0.00, 0),
(65, '2025-02-13', 'CH123456', 'Description 2', '0', 0.00, 0.00, 'cash', '2025-02-13 12:11:11', 'Vendor ABC', '$20', 0.00, 0),
(66, '2025-02-13', 'CH123456', 'Description 3', '0', 0.00, 0.00, 'cash', '2025-02-13 12:11:11', 'Vendor ABC', '-', 0.00, 0),
(67, '2025-02-13', 'CH123456', 'Description 4', '0', 0.00, 0.00, 'cash', '2025-02-13 12:11:11', 'Vendor ABC', '-', 0.00, 0),
(68, '2025-02-13', 'CH1225656', 'Description 1, Description 2, Description 3, Description 4', '0', 100.00, 50.00, 'cash', '2025-02-13 12:16:16', 'shaheercorp', '$15, $20', 0.00, 0),
(69, '2025-02-13', 'CH1225656', 'Description 1, Description 2, Description 3, Description 4', '0', 100.00, 50.00, 'cash', '2025-02-13 12:17:20', 'shaheercorp', '15, 55, 15, 15, 15, 55', 0.00, 0),
(70, '2025-02-13', 'CH1225656', 'Description 1, Description 2, Description 3, Description 4', '0', 100.00, 50.00, 'cash', '2025-02-13 12:17:58', 'shaheercorp', '15, 5, 15, 15, 15, 55', 0.00, 0),
(71, '2025-02-13', 'CH1225656', 'Description 1, Description 2, Description 3, Description 4', '15', 100.00, 50.00, 'cash', '2025-02-13 12:18:52', 'shaheercorp', '$15, $20, $15, $20', 0.00, 0),
(72, '2025-02-07', 'CH1225656', 'Description 1, Description 2, Description 3, Description 4, Unknown Description, Unknown Description', '15', 100.00, 50.00, 'cash', '2025-02-13 12:20:25', 'shaheercorp', '$15, $20, $15, $20, -, -', 0.00, 0),
(73, '2025-02-13', 'CH1225656', 'Description 1, Description 2, Description 3, Description 4, Unknown Description, Unknown Description', '15, 5, 15, 15, 15, 55', 100.00, 50.00, 'cash', '2025-02-13 12:21:47', 'shaheercorp', '$15, $20, $15, $20, -, -', 0.00, 0);

-- --------------------------------------------------------

--
-- Table structure for table `users`
--

CREATE TABLE `users` (
  `id` int(11) NOT NULL,
  `email` varchar(255) NOT NULL,
  `password` varchar(255) NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `users`
--

INSERT INTO `users` (`id`, `email`, `password`, `created_at`) VALUES
(1, 'johndoeupdated@example.com', '$2b$10$EhVSYMilO7D6TrJsYcR7kumNAaGONpSF3FMZdaZ1V1FHii5c5cHYa', '2025-02-07 22:23:32'),
(2, 'johndoe@example.com', '$2b$10$adKelkOyC59UM4DCdeYnhuJXzJG5gwJpH/KL1btat6sS3MTbsLjIW', '2025-02-07 22:51:45'),
(3, 'pakistan@example.com', '$2b$10$q4ApVfyW4MdUbuIVtU1Zo.wk0QasdJm5VZYgUpaiXe1NNNjcOC2Ra', '2025-02-10 09:53:34');

-- --------------------------------------------------------

--
-- Table structure for table `vendors`
--

CREATE TABLE `vendors` (
  `id` int(11) NOT NULL,
  `company_name` varchar(255) NOT NULL,
  `supplier_name` varchar(255) NOT NULL,
  `contact_number` varchar(20) DEFAULT NULL,
  `bank_details` text DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `vendors`
--

INSERT INTO `vendors` (`id`, `company_name`, `supplier_name`, `contact_number`, `bank_details`, `created_at`) VALUES
(1, 'ABC Corp Updated', 'John Doe Updated', '9876543210', 'Bank: ABC Bank, Account: 9876543210', '2025-02-07 22:24:10'),
(2, 'shaheercorp', 'Ali Khan', '9876543211', 'Bank: Shaheer Bank, Account: 9876543211', '2025-02-08 19:00:00'),
(3, 'Kohistan Traders', 'Samiullah Khan', '1234567892', 'Bank: Kohistan Bank, Account: 1234567892', '2025-02-08 19:00:00'),
(4, 'Company ABBBBB', 'Supplier AZZZZ', '12399999', 'Bank A, Account: 6968568', '2025-02-09 18:32:40'),
(6, 'Tech Supplies', 'Mariam Noor', '9876543213', 'Bank: Tech Bank, Account: 9876543213', '2025-02-14 05:00:00'),
(7, 'Global Traders', 'Imran Shah', '9876543214', 'Bank: Global Bank, Account: 9876543214', '2025-02-15 06:00:00'),
(8, 'Example Company', 'John Doe', '123-456-7890', 'XYZ Bank, Account No: 123456789', '2025-02-11 14:41:28'),
(9, 'Methologik', 'John Doe', '123-456-7890', 'XYZ Bank, Account No: 123456789', '2025-02-11 14:42:02'),
(10, 'Noble Corner', 'John Doe', '123-456-7890', 'XYZ Bank, Account No: 123456789', '2025-02-11 14:43:27'),
(11, 'shaheer khan ', 'methologik', '565658965', 'XYZ Bank, Account No: 123456789', '2025-02-12 15:33:50'),
(12, 'Vendor XYZ', 'John Doe', '565658965', 'XYZ Bank, Account No: 123456789\nXYZ Bank, Account No: 123456789\n', '2025-02-25 08:00:29'),
(13, 'Shaheer Corp', 'John Doe', '565658965', 'XYZ Bank, Account No: 123456789\n', '2025-02-25 08:00:29'),
(14, 'Vendor ABC', 'John Doe', '565658965', 'XYZ Bank, Account No: 123456789\n', '2025-02-25 08:00:29');

--
-- Indexes for dumped tables
--

--
-- Indexes for table `ledgers`
--
ALTER TABLE `ledgers`
  ADD PRIMARY KEY (`id`),
  ADD KEY `fk_vendor_name` (`vendor_name`);

--
-- Indexes for table `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `email` (`email`);

--
-- Indexes for table `vendors`
--
ALTER TABLE `vendors`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_company_name` (`company_name`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `ledgers`
--
ALTER TABLE `ledgers`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=74;

--
-- AUTO_INCREMENT for table `users`
--
ALTER TABLE `users`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT for table `vendors`
--
ALTER TABLE `vendors`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=15;

--
-- Constraints for dumped tables
--

--
-- Constraints for table `ledgers`
--
ALTER TABLE `ledgers`
  ADD CONSTRAINT `fk_vendor_name` FOREIGN KEY (`vendor_name`) REFERENCES `vendors` (`company_name`) ON DELETE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
