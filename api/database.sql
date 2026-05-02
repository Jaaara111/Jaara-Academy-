-- Jaara Academy Database Schema
CREATE DATABASE IF NOT EXISTS jaara_academy;
USE jaara_academy;

CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    phone VARCHAR(20) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    role EN_UM('student', 'admin') DEFAULT 'student',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS books (
    id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    grade VARCHAR(50) NOT NULL,
    subject VARCHAR(100) NOT NULL,
    pdf_url VARCHAR(255) NOT NULL
);

CREATE TABLE IF NOT EXISTS exams (
    id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    subject VARCHAR(100) NOT NULL,
    year VARCHAR(4) NOT NULL,
    pdf_url VARCHAR(255) NOT NULL
);

-- Seed Data
INSERT INTO users (name, phone, password, role) VALUES 
('Jaara Admin', '0615551122', 'admin123', 'admin'),
('Hassan Jaara', '0612345678', '123456', 'student');

INSERT INTO books (title, grade, subject, pdf_url) VALUES 
('Physics Form 4', 'Form 4', 'Physics', 'https://example.com/phys4.pdf'),
('Math Grade 8', 'Grade 8', 'Mathematics', 'https://example.com/math8.pdf');
