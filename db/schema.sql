-- phpMyAdmin SQL Dump
-- version 5.2.2
-- https://www.phpmyadmin.net/
--
-- Host: localhost:3306
-- Generation Time: Apr 25, 2025 at 06:49 AM
-- Server version: 8.4.3
-- PHP Version: 8.3.16

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

-- สร้าง database
CREATE DATABASE IF NOT EXISTS car_showroom;
USE car_showroom;

-- ลบตารางเก่าถ้ามีอยู่
DROP TABLE IF EXISTS reviews;
DROP TABLE IF EXISTS payments;
DROP TABLE IF EXISTS bookings;
DROP TABLE IF EXISTS contacts;
DROP TABLE IF EXISTS cars;
DROP TABLE IF EXISTS login_logs;
DROP TABLE IF EXISTS users;
DROP TABLE IF EXISTS models;
DROP TABLE IF EXISTS brands;

-- ตาราง brands
CREATE TABLE brands (
    id INT NOT NULL AUTO_INCREMENT,
    name VARCHAR(100) NOT NULL,
    created_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- เพิ่มข้อมูลในตาราง brands
INSERT INTO brands (id, name, created_at) VALUES
(1, 'Mercedes', '2025-03-31 05:29:17'),
(2, 'Alfa Romeo', '2025-03-31 05:29:17'),
(3, 'Ford', '2025-03-31 05:29:17'),
(4, 'BMW', '2025-03-31 05:29:17');

-- ตาราง models
CREATE TABLE models (
    id INT NOT NULL AUTO_INCREMENT,
    brand_id INT DEFAULT NULL,
    name VARCHAR(100) NOT NULL,
    created_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    KEY brand_id (brand_id),
    CONSTRAINT models_ibfk_1 FOREIGN KEY (brand_id) REFERENCES brands(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- เพิ่มข้อมูลในตาราง models
INSERT INTO models (id, brand_id, name, created_at) VALUES
(1, 1, 'AMG C 63', '2025-03-31 05:29:17'),
(2, 2, 'Giulia', '2025-03-31 05:29:17'),
(3, 3, 'Ranger', '2025-03-31 05:29:17'),
(4, 4, '3 Series', '2025-03-31 05:29:17');

-- ตาราง users
CREATE TABLE users (
    id INT NOT NULL AUTO_INCREMENT,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(100) NOT NULL,
    password VARCHAR(255) NOT NULL,
    role ENUM('admin','client') DEFAULT 'client',
    created_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    UNIQUE KEY email (email),
    KEY idx_email (email)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- เพิ่มข้อมูลในตาราง users
INSERT INTO users (id, name, email, password, role, created_at) VALUES
(1, 'Admin User', 'admin@example.com', '$2a$10$z5g8Xz5z5g8Xz5z5g8Xz5u5z5g8Xz5z5g8Xz5z5g8Xz5z5g8Xz5z5', 'admin', '2025-03-31 05:29:17'),
(2, 'Client One', 'client1@example.com', '$2a$10$z5g8Xz5z5g8Xz5z5g8Xz5u5z5g8Xz5z5g8Xz5z5g8Xz5z5g8Xz5z5', 'client', '2025-03-31 05:29:17'),
(3, 'Kyubey', 'Kyubey@gmail.com', '$2b$10$4sWkT401mV3YELs3rqXLTOhW5fJeYG1AyBy7lzeKlgRWnhNK3dKXW', 'client', '2025-03-31 05:33:20'),
(6, 'AdminMeow', 'AdminMeow@gmail.com', '$2b$10$xl1sUSZ3MjvpmnN.yAT9ZeB/CChmLHSXyM4A4mbtHgAAly1OtU3ny', 'admin', '2025-04-06 07:30:37'),
(7, 'AdminMeow2', 'AdminMeow2@gmail.com', '$2b$10$oekE9yBtKgyESLPEceUnLuRcxHS568W/1sA4cRf0fth0cXPUAeLPK', 'admin', '2025-04-07 07:12:50'),
(8, 'AdminMeow3', 'AdminMeow3@gmail.com', '$2b$10$OprAkEb6/mYy9R6nYuYR4u8WjmTGiaHMSR0yNJUSJb7lZ0Uie4MDy', 'admin', '2025-04-07 07:19:29'),
(14, 'AdminMeow4', 'AdminMeow4@gmail.com', '$2b$10$9p3T/47nm7lJYF1Ml61iXOJqNl4.jUtUDZA2Erp73QweI/zCFpWje', 'admin', '2025-04-11 07:27:14'),
(15, 'AdminMeow5', 'AdminMeow5@gmail.com', '$2b$10$0aBTLYg.Kfi1RGQlExRFJuMAcWd7RNnDW5Z3mR/3jEKFoD.KDD6Fq', 'admin', '2025-04-11 07:30:20'),
(16, 'Meow6', 'Meow6@gmail.com', '$2b$10$qlxmBhGMElLEv0MVrC9Z7e/FT3ytlNZ8keGh/.x8y7vADHww2e75a', 'admin', '2025-04-14 07:50:41');

-- ตาราง login_logs
CREATE TABLE login_logs (
    id INT NOT NULL AUTO_INCREMENT,
    user_id INT NOT NULL,
    role ENUM('admin','client') NOT NULL,
    login_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    KEY user_id (user_id),
    CONSTRAINT login_logs_ibfk_1 FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- เพิ่มข้อมูลในตาราง login_logs
INSERT INTO login_logs (id, user_id, role, login_at) VALUES
(1, 2, 'client', '2025-04-10 03:00:00'),
(2, 2, 'client', '2025-04-09 05:00:00'),
(3, 2, 'client', '2025-04-08 07:00:00'),
(4, 15, 'admin', '2025-04-14 07:40:36'),
(5, 15, 'admin', '2025-04-14 07:40:41'),
(6, 15, 'admin', '2025-04-14 07:40:42'),
(7, 15, 'admin', '2025-04-14 07:40:43'),
(8, 15, 'admin', '2025-04-14 07:40:43'),
(9, 15, 'admin', '2025-04-14 07:40:43'),
(10, 15, 'admin', '2025-04-14 07:40:43'),
(11, 15, 'admin', '2025-04-14 07:40:44'),
(12, 15, 'admin', '2025-04-14 07:40:44'),
(13, 15, 'admin', '2025-04-14 07:40:44'),
(14, 15, 'admin', '2025-04-14 07:40:44'),
(15, 15, 'admin', '2025-04-14 07:46:13'),
(16, 15, 'admin', '2025-04-14 07:46:14'),
(17, 15, 'admin', '2025-04-14 07:46:14'),
(18, 15, 'admin', '2025-04-14 07:46:14'),
(19, 15, 'admin', '2025-04-14 07:46:14'),
(20, 15, 'admin', '2025-04-14 07:46:15'),
(21, 15, 'admin', '2025-04-14 09:06:44'),
(22, 15, 'admin', '2025-04-15 05:10:23'),
(23, 3, 'client', '2025-04-15 06:14:39'),
(24, 15, 'admin', '2025-04-15 06:24:18'),
(25, 3, 'client', '2025-04-15 06:32:23'),
(26, 15, 'admin', '2025-04-15 06:32:47'),
(27, 15, 'admin', '2025-04-15 06:37:35'),
(28, 3, 'client', '2025-04-15 06:37:54'),
(29, 15, 'admin', '2025-04-15 06:39:10'),
(30, 3, 'client', '2025-04-15 06:49:43'),
(31, 15, 'admin', '2025-04-15 06:51:36'),
(32, 15, 'admin', '2025-04-15 06:54:33'),
(33, 3, 'client', '2025-04-15 06:58:04'),
(34, 15, 'admin', '2025-04-15 06:58:25'),
(35, 3, 'client', '2025-04-15 07:11:22'),
(36, 15, 'admin', '2025-04-15 07:11:42'),
(37, 15, 'admin', '2025-04-15 07:18:56'),
(38, 15, 'admin', '2025-04-15 07:21:20'),
(39, 15, 'admin', '2025-04-15 07:22:31'),
(40, 3, 'client', '2025-04-15 07:23:22'),
(41, 3, 'client', '2025-04-15 07:29:36'),
(42, 15, 'admin', '2025-04-15 07:32:38'),
(43, 3, 'client', '2025-04-15 07:36:15'),
(44, 3, 'client', '2025-04-15 07:53:41'),
(45, 3, 'client', '2025-04-15 07:55:42'),
(46, 15, 'admin', '2025-04-15 07:56:50'),
(47, 3, 'client', '2025-04-16 08:22:16'),
(48, 15, 'admin', '2025-04-16 08:23:23'),
(49, 3, 'client', '2025-04-16 08:23:57'),
(50, 3, 'client', '2025-04-16 08:24:08'),
(51, 3, 'client', '2025-04-16 09:39:03'),
(52, 3, 'client', '2025-04-18 05:27:25'),
(53, 3, 'client', '2025-04-18 05:52:34'),
(54, 3, 'client', '2025-04-18 05:58:28'),
(55, 15, 'admin', '2025-04-18 05:59:28'),
(56, 3, 'client', '2025-04-18 05:59:57'),
(57, 3, 'client', '2025-04-18 07:17:12'),
(58, 15, 'admin', '2025-04-18 07:17:45'),
(59, 3, 'client', '2025-04-18 07:18:27'),
(60, 3, 'client', '2025-04-20 06:07:18'),
(61, 3, 'client', '2025-04-20 07:16:04'),
(62, 3, 'client', '2025-04-20 08:18:34'),
(63, 3, 'client', '2025-04-20 09:33:40'),
(64, 3, 'client', '2025-04-21 05:50:03');

-- ตาราง cars
CREATE TABLE cars (
    id INT NOT NULL AUTO_INCREMENT,
    model_id INT DEFAULT NULL,
    year INT DEFAULT NULL,
    price DECIMAL(15,2) DEFAULT NULL,
    description TEXT,
    image_url VARCHAR(255) DEFAULT NULL,
    model_3d_url VARCHAR(255) DEFAULT NULL,
    color VARCHAR(50) DEFAULT NULL,
    mileage INT DEFAULT 0,
    fuel_type ENUM('petrol','diesel','electric','hybrid') DEFAULT 'petrol',
    status ENUM('available','sold','reserved') DEFAULT 'available',
    created_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    KEY model_id (model_id),
    CONSTRAINT cars_ibfk_1 FOREIGN KEY (model_id) REFERENCES models(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- เพิ่มข้อมูลในตาราง cars
INSERT INTO cars (id, model_id, year, price, description, image_url, model_3d_url, color, mileage, fuel_type, status, created_at) VALUES
(1, 1, 2023, 4500000.00, 'High-performance sedan with advanced features', 'https://images.pexels.com/photos/112460/pexels-photo-112460.jpeg?auto=compress&cs=tinysrgb&w=500', 'path/to/3dmodel1.glb', 'Black', 0, 'petrol', 'available', '2025-03-31 05:29:17'),
(2, 2, 2022, 3200000.00, 'Stylish Italian sedan', 'https://images.pexels.com/photos/210019/pexels-photo-210019.jpeg?auto=compress&cs=tinysrgb&w=500', 'path/to/3dmodel2.glb', 'Red', 5000, 'petrol', 'available', '2025-03-31 05:29:17'),
(3, 3, 2021, 1500000.00, 'Rugged pickup truck for all terrains', 'https://cdn.motor1.com/images/mgl/GPYrG/s1/2019-ford-ranger-raptor-im-test.jpg', 'path/to/3dmodel3.glb', 'Blue', 10000, 'diesel', 'available', '2025-03-31 05:29:17'),
(4, 4, 2023, 2800000.00, 'Luxury sedan with cutting-edge technology', 'https://images.pexels.com/photos/170811/pexels-photo-170811.jpeg?auto=compress&cs=tinysrgb&w=500', 'path/to/3dmodel4.glb', 'White', 0, 'hybrid', 'available', '2025-03-31 05:29:17');

-- ตาราง contacts
CREATE TABLE contacts (
    id INT NOT NULL AUTO_INCREMENT,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    file_name VARCHAR(255) DEFAULT NULL,
    status ENUM('pending', 'replied') DEFAULT 'pending',
    created_at DATETIME NOT NULL,
    PRIMARY KEY (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- เพิ่มข้อมูลตัวอย่างในตาราง contacts
INSERT INTO contacts (id, name, email, message, file_name, status, created_at) VALUES
(1, 'John Doe', 'john.doe@example.com', 'I have a question about the AMG C 63.', NULL, 'pending', '2025-04-25 06:00:00'),
(2, 'Jane Smith', 'jane.smith@example.com', 'Please contact me regarding the Giulia.', 'attachment.pdf', 'pending', '2025-04-25 06:10:00');

-- ตาราง bookings
CREATE TABLE bookings (
    id INT NOT NULL AUTO_INCREMENT,
    user_id INT DEFAULT NULL,
    car_id INT DEFAULT NULL,
    booking_date DATETIME DEFAULT NULL,
    status ENUM('pending','approved','rejected') DEFAULT 'pending',
    type ENUM('test_drive','inquiry') DEFAULT NULL,
    message TEXT,
    created_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    KEY idx_user_id (user_id),
    KEY idx_car_id (car_id),
    KEY idx_booking_date (booking_date),
    CONSTRAINT bookings_ibfk_1 FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    CONSTRAINT bookings_ibfk_2 FOREIGN KEY (car_id) REFERENCES cars(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- เพิ่มข้อมูลในตาราง bookings
INSERT INTO bookings (id, user_id, car_id, booking_date, status, type, message, created_at) VALUES
(212, 3, 2, '2025-04-21 13:00:03', 'pending', 'test_drive', 'I would like to test drive this car.', '2025-04-21 06:00:03'),
(214, 3, 2, '2025-04-21 13:00:04', 'pending', 'test_drive', 'I would like to test drive this car.', '2025-04-21 06:00:04'),
(215, 3, 2, '2025-04-21 13:00:04', 'pending', 'test_drive', 'I would like to test drive this car.', '2025-04-21 06:00:04'),
(216, 3, 2, '2025-04-21 13:18:30', 'pending', 'inquiry', 'I have some questions about this car.', '2025-04-21 06:18:30'),
(217, 3, 2, '2025-04-21 13:18:32', 'pending', 'test_drive', 'I would like to test drive this car.', '2025-04-21 06:18:32');

-- ตาราง payments
CREATE TABLE payments (
    id INT NOT NULL AUTO_INCREMENT,
    booking_id INT DEFAULT NULL,
    user_id INT DEFAULT NULL,
    amount DECIMAL(15,2) NOT NULL,
    payment_status ENUM('pending','completed','failed') DEFAULT 'pending',
    payment_method ENUM('credit_card','bank_transfer','cash') DEFAULT NULL,
    transaction_id VARCHAR(100) DEFAULT NULL,
    created_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    KEY booking_id (booking_id),
    KEY user_id (user_id),
    CONSTRAINT payments_ibfk_1 FOREIGN KEY (booking_id) REFERENCES bookings(id) ON DELETE SET NULL,
    CONSTRAINT payments_ibfk_2 FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- ตาราง reviews
CREATE TABLE reviews (
    id INT NOT NULL AUTO_INCREMENT,
    user_id INT DEFAULT NULL,
    car_id INT DEFAULT NULL,
    rating INT DEFAULT NULL,
    comment TEXT,
    created_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    KEY user_id (user_id),
    KEY car_id (car_id),
    CONSTRAINT reviews_ibfk_1 FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    CONSTRAINT reviews_ibfk_2 FOREIGN KEY (car_id) REFERENCES cars(id) ON DELETE SET NULL,
    CONSTRAINT check_rating CHECK (rating >= 1 AND rating <= 5)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- เพิ่มข้อมูลในตาราง reviews
INSERT INTO reviews (id, user_id, car_id, rating, comment, created_at) VALUES
(1, 1, 1, 5, 'Great car! Very fast and smooth.', '2025-04-01 03:00:00'),
(2, 2, 2, 4, 'Nice design, but a bit pricey.', '2025-04-02 05:30:00'),
(3, 1, 3, 3, 'Good for off-road, but noisy.', '2025-04-03 08:45:00'),
(4, 3, 1, 5, 'สุดยอดดดดดด', '2025-04-20 09:00:58'),
(5, 3, 2, 3, 'ถ้ามีสีให้เลือกกว่านี้จะดีมากกก', '2025-04-20 09:05:15');

-- ตั้งค่า AUTO_INCREMENT
ALTER TABLE bookings MODIFY id INT NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=218;
ALTER TABLE brands MODIFY id INT NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;
ALTER TABLE cars MODIFY id INT NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;
ALTER TABLE contacts MODIFY id INT NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;
ALTER TABLE login_logs MODIFY id INT NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=65;
ALTER TABLE models MODIFY id INT NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;
ALTER TABLE payments MODIFY id INT NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=1;
ALTER TABLE reviews MODIFY id INT NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;
ALTER TABLE users MODIFY id INT NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=17;

COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;