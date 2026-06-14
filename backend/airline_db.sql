CREATE DATABASE IF NOT EXISTS airline_db;
USE airline_db;

DROP TABLE IF EXISTS notification;
DROP TABLE IF EXISTS seat_assignment;
DROP TABLE IF EXISTS ticket;
DROP TABLE IF EXISTS payment;
DROP TABLE IF EXISTS passenger;
DROP TABLE IF EXISTS reservation;
DROP TABLE IF EXISTS pricing;
DROP TABLE IF EXISTS inventory;
DROP TABLE IF EXISTS seat;
DROP TABLE IF EXISTS flight;
DROP TABLE IF EXISTS aircraft;
DROP TABLE IF EXISTS airport;
DROP TABLE IF EXISTS loyalty_account;
DROP TABLE IF EXISTS user;

CREATE TABLE user (
    user_id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(100) NOT NULL UNIQUE,
    phone VARCHAR(15),
    password VARCHAR(255) DEFAULT '12345',
    role VARCHAR(20) DEFAULT 'Customer'
);

CREATE TABLE loyalty_account (
    loyalty_id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL UNIQUE,
    points_balance INT DEFAULT 0,
    tier_level VARCHAR(20) DEFAULT 'Silver',
    FOREIGN KEY (user_id) REFERENCES user(user_id)
);

CREATE TABLE airport (
    airport_code CHAR(3) PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    city VARCHAR(50) NOT NULL,
    country VARCHAR(50) NOT NULL
);

CREATE TABLE aircraft (
    aircraft_id INT AUTO_INCREMENT PRIMARY KEY,
    model VARCHAR(50) NOT NULL,
    total_seats INT NOT NULL
);

CREATE TABLE flight (
    flight_id INT AUTO_INCREMENT PRIMARY KEY,
    flight_number VARCHAR(10) NOT NULL UNIQUE,
    airline VARCHAR(50) NOT NULL,
    departure_time DATETIME NOT NULL,
    arrival_time DATETIME NOT NULL,
    status VARCHAR(20) DEFAULT 'Scheduled',
    origin_airport CHAR(3) NOT NULL,
    destination_airport CHAR(3) NOT NULL,
    aircraft_id INT NOT NULL,
    FOREIGN KEY (origin_airport) REFERENCES airport(airport_code),
    FOREIGN KEY (destination_airport) REFERENCES airport(airport_code),
    FOREIGN KEY (aircraft_id) REFERENCES aircraft(aircraft_id)
);

CREATE TABLE seat (
    seat_id INT AUTO_INCREMENT PRIMARY KEY,
    seat_number VARCHAR(5) NOT NULL,
    class_type VARCHAR(20) NOT NULL,
    aircraft_id INT NOT NULL,
    FOREIGN KEY (aircraft_id) REFERENCES aircraft(aircraft_id)
);

CREATE TABLE inventory (
    inventory_id INT AUTO_INCREMENT PRIMARY KEY,
    flight_id INT NOT NULL,
    seat_id INT NOT NULL,
    availability_status VARCHAR(20) DEFAULT 'Available',
    FOREIGN KEY (flight_id) REFERENCES flight(flight_id),
    FOREIGN KEY (seat_id) REFERENCES seat(seat_id)
);

CREATE TABLE pricing (
    pricing_id INT AUTO_INCREMENT PRIMARY KEY,
    flight_id INT NOT NULL,
    base_fare DECIMAL(10,2) NOT NULL,
    dynamic_fare DECIMAL(10,2) NOT NULL,
    demand_factor DECIMAL(5,2) DEFAULT 1.0,
    time_factor DECIMAL(5,2) DEFAULT 1.0,
    FOREIGN KEY (flight_id) REFERENCES flight(flight_id)
);

CREATE TABLE reservation (
    reservation_id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    flight_id INT NOT NULL,
    booking_time DATETIME NOT NULL,
    status VARCHAR(20) DEFAULT 'Confirmed',
    total_amount DECIMAL(10,2) NOT NULL,
    FOREIGN KEY (user_id) REFERENCES user(user_id),
    FOREIGN KEY (flight_id) REFERENCES flight(flight_id)
);

CREATE TABLE passenger (
    passenger_id INT AUTO_INCREMENT PRIMARY KEY,
    reservation_id INT NOT NULL,
    name VARCHAR(100) NOT NULL,
    age INT NOT NULL,
    gender CHAR(1),
    document_number VARCHAR(50),
    FOREIGN KEY (reservation_id) REFERENCES reservation(reservation_id)
);

CREATE TABLE payment (
    payment_id INT AUTO_INCREMENT PRIMARY KEY,
    reservation_id INT NOT NULL,
    payment_method VARCHAR(20) NOT NULL,
    amount DECIMAL(10,2) NOT NULL,
    payment_status VARCHAR(20) DEFAULT 'Completed',
    transaction_time DATETIME NOT NULL,
    FOREIGN KEY (reservation_id) REFERENCES reservation(reservation_id)
);

CREATE TABLE ticket (
    ticket_id INT AUTO_INCREMENT PRIMARY KEY,
    reservation_id INT NOT NULL,
    pnr VARCHAR(10) NOT NULL UNIQUE,
    issue_date DATETIME NOT NULL,
    ticket_status VARCHAR(20) DEFAULT 'Issued',
    FOREIGN KEY (reservation_id) REFERENCES reservation(reservation_id)
);

CREATE TABLE seat_assignment (
    assignment_id INT AUTO_INCREMENT PRIMARY KEY,
    ticket_id INT NOT NULL,
    seat_id INT NOT NULL,
    assignment_status VARCHAR(20) DEFAULT 'Assigned',
    FOREIGN KEY (ticket_id) REFERENCES ticket(ticket_id),
    FOREIGN KEY (seat_id) REFERENCES seat(seat_id)
);

CREATE TABLE notification (
    notification_id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    type VARCHAR(20) NOT NULL,
    message VARCHAR(255) NOT NULL,
    sent_time DATETIME NOT NULL,
    FOREIGN KEY (user_id) REFERENCES user(user_id)
);

INSERT INTO airport VALUES
('DEL', 'Indira Gandhi International Airport', 'Delhi', 'India'),
('BOM', 'Chhatrapati Shivaji Maharaj International Airport', 'Mumbai', 'India'),
('BLR', 'Kempegowda International Airport', 'Bangalore', 'India');

INSERT INTO aircraft (model, total_seats) VALUES
('Boeing 737', 180),
('Airbus A320', 160);

INSERT INTO flight 
(flight_number, airline, departure_time, arrival_time, status, origin_airport, destination_airport, aircraft_id)
VALUES
('AI101', 'Air India', '2026-05-10 08:00:00', '2026-05-10 10:30:00', 'Scheduled', 'DEL', 'BOM', 1),
('6E204', 'IndiGo', '2026-05-10 11:45:00', '2026-05-10 14:35:00', 'Scheduled', 'DEL', 'BLR', 2),
('UK811', 'Vistara', '2026-05-10 18:20:00', '2026-05-10 20:40:00', 'Scheduled', 'BOM', 'DEL', 1);

INSERT INTO seat (seat_number, class_type, aircraft_id) VALUES
('1A', 'Business', 1),
('1B', 'Business', 1),
('10C', 'Economy', 1),
('12D', 'Economy', 1),
('1A', 'Business', 2),
('1B', 'Business', 2),
('10C', 'Economy', 2),
('12D', 'Economy', 2);

INSERT INTO inventory (flight_id, seat_id, availability_status)
SELECT f.flight_id, s.seat_id, 'Available'
FROM flight f
JOIN seat s ON f.aircraft_id = s.aircraft_id;

INSERT INTO pricing (flight_id, base_fare, dynamic_fare, demand_factor, time_factor) VALUES
(1, 5000.00, 5500.00, 1.10, 1.05),
(2, 6200.00, 7200.00, 1.30, 1.10),
(3, 4500.00, 4900.00, 1.05, 1.00);