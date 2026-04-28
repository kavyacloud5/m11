-- Migration script to create tables for MOCA app
-- Run this in your Neon database

-- Users table (for authentication)
CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  name VARCHAR(255),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Exhibitions table
CREATE TABLE IF NOT EXISTS exhibitions (
  id VARCHAR(255) PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  date_range VARCHAR(255) NOT NULL,
  description TEXT,
  image_url VARCHAR(500),
  category VARCHAR(255)
);

-- Artworks table
CREATE TABLE IF NOT EXISTS artworks (
  id VARCHAR(255) PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  artist VARCHAR(255) NOT NULL,
  year VARCHAR(255),
  medium VARCHAR(255),
  image_url VARCHAR(500)
);

-- Events table
CREATE TABLE IF NOT EXISTS events (
  id VARCHAR(255) PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  type VARCHAR(255) NOT NULL,
  date VARCHAR(255) NOT NULL,
  location VARCHAR(255),
  image_url VARCHAR(500),
  description TEXT
);

-- Event registrations table
CREATE TABLE IF NOT EXISTS event_registrations (
  id VARCHAR(255) PRIMARY KEY,
  event_id VARCHAR(255) NOT NULL,
  event_title VARCHAR(255) NOT NULL,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL,
  phone VARCHAR(50),
  quantity INTEGER DEFAULT 1,
  timestamp BIGINT NOT NULL,
  status VARCHAR(50) DEFAULT 'Pending'
);

-- Collectables table
CREATE TABLE IF NOT EXISTS collectables (
  id VARCHAR(255) PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  price DECIMAL(10,2) NOT NULL,
  category VARCHAR(255) NOT NULL,
  image_url VARCHAR(500),
  description TEXT,
  in_stock BOOLEAN DEFAULT true
);

-- Bookings table
CREATE TABLE IF NOT EXISTS bookings (
  id VARCHAR(255) PRIMARY KEY,
  customer_name VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL,
  date VARCHAR(255) NOT NULL,
  tickets JSONB NOT NULL,
  total_amount DECIMAL(10,2) NOT NULL,
  timestamp BIGINT NOT NULL,
  status VARCHAR(255) DEFAULT 'pending'
);

-- Shop orders table
CREATE TABLE IF NOT EXISTS shop_orders (
  id VARCHAR(255) PRIMARY KEY,
  customer_name VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL,
  items JSONB NOT NULL,
  total_amount DECIMAL(10,2) NOT NULL,
  timestamp BIGINT NOT NULL,
  status VARCHAR(255) DEFAULT 'Pending',
  payment_status VARCHAR(255),
  payment_message TEXT,
  payment_time VARCHAR(255),
  payment_session_id VARCHAR(255)
);

-- Gallery images table
CREATE TABLE IF NOT EXISTS gallery_images (
  id VARCHAR(255) PRIMARY KEY,
  image_url VARCHAR(500) NOT NULL,
  title VARCHAR(255),
  description TEXT
);

-- Press releases table
CREATE TABLE IF NOT EXISTS press_releases (
  id VARCHAR(255) PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  date VARCHAR(255) NOT NULL,
  summary TEXT,
  url VARCHAR(500),
  file_name VARCHAR(255)
);

-- Page assets (singleton JSON)
CREATE TABLE IF NOT EXISTS page_assets (
  id VARCHAR(255) PRIMARY KEY,
  data JSONB NOT NULL
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_exhibitions_category ON exhibitions(category);
CREATE INDEX IF NOT EXISTS idx_collectables_category ON collectables(category);
CREATE INDEX IF NOT EXISTS idx_bookings_date ON bookings(date);
CREATE INDEX IF NOT EXISTS idx_shop_orders_timestamp ON shop_orders(timestamp);
CREATE INDEX IF NOT EXISTS idx_bookings_timestamp ON bookings(timestamp);
