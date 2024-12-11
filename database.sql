CREATE DATABASE AutoEcole;

USE AutoEcole;

-- Table pour les utilisateurs
CREATE TABLE Users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    civil_state VARCHAR(10) NOT NULL,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    phone VARCHAR(15),
    password_hash VARCHAR(255) NOT NULL,
    nationality VARCHAR(50) NOT NULL, -- Nouveau champ pour la nationalité
    id_card_base64 LONGTEXT,          -- Nouveau champ pour stocker la pièce d'identité encodée en Base64
    driving_license_base64 LONGTEXT,  -- Nouveau champ pour stocker le permis de conduire encodé en Base64
    role ENUM('admin', 'user') DEFAULT 'user',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Table pour les stages
CREATE TABLE Stages (
    id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    price DECIMAL(10, 2) NOT NULL,
    remaining_slots INT DEFAULT 20,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    address VARCHAR(255) NOT NULL,
    postal_code VARCHAR(10) NOT NULL,
    city VARCHAR(100) NOT NULL,
    prefecture_number VARCHAR(50) NOT NULL, -- Nouveau champ pour le numéro de préfecture
    morning_schedule VARCHAR(50),
    afternoon_schedule VARCHAR(50),
    amenities TEXT,
    access_info VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Table pour les inscriptions
CREATE TABLE Inscriptions (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    stage_id INT NOT NULL,
    status ENUM('confirmed', 'pending', 'canceled') DEFAULT 'pending',
    registered_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES Users(id) ON DELETE CASCADE,
    FOREIGN KEY (stage_id) REFERENCES Stages(id) ON DELETE CASCADE
);

-- Exemple de données pour les stages
INSERT INTO Stages (title, price, remaining_slots, start_date, end_date, address, postal_code, city, prefecture_number, morning_schedule, afternoon_schedule, amenities, access_info)
VALUES 
('Stage de récupération de points', 200.00, 10, '2024-12-05', '2024-12-06', '35 Avenue Foch', '94100', 'Saint-Maur-des-Fossés', '94-2024-1234', '08h00 à 12h30', '13h30 à 16h30', 'Parking, Déjeuner, Sur place', 'PMR'),
('Stage de récupération de points', 250.00, 8, '2024-12-10', '2024-12-11', '35 Avenue Foch', '94100', 'Saint-Maur-des-Fossés', '94-2024-1235', '08h00 à 12h30', '13h30 à 16h30', 'Parking, Déjeuner, Sur place', 'PMR'),
('Stage de récupération de points', 220.00, 12, '2025-01-05', '2025-01-06', '35 Avenue Foch', '94100', 'Saint-Maur-des-Fossés', '94-2025-1236', '08h00 à 12h30', '13h30 à 16h30', 'Parking, Déjeuner, Sur place', 'PMR'),
('Stage de récupération de points', 300.00, 5, '2025-01-15', '2025-01-16', '35 Avenue Foch', '94100', 'Saint-Maur-des-Fossés', '94-2025-1237', '08h00 à 12h30', '13h30 à 16h30', 'Parking, Déjeuner, Sur place', 'PMR');
