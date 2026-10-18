-- S2 Teespoint Supabase Database Schema
-- Run this in your Supabase SQL Editor

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================
-- CATEGORIES TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS categories (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name        TEXT NOT NULL,
  slug        TEXT NOT NULL UNIQUE,
  image_url   TEXT,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- PRODUCTS TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS products (
  id           UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  category_id  UUID REFERENCES categories(id) ON DELETE SET NULL,
  name         TEXT NOT NULL,
  description  TEXT,
  price        NUMERIC(10,2) NOT NULL DEFAULT 0,
  image_url    TEXT,
  sizes        TEXT[] DEFAULT '{}',
  created_at   TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- ORDERS TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS orders (
  id               UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  customer_name    TEXT NOT NULL,
  contact          TEXT NOT NULL,
  address          TEXT NOT NULL,
  landmark         TEXT,
  pincode          TEXT NOT NULL,
  delivery_charge  NUMERIC(10,2) DEFAULT 0,
  total            NUMERIC(10,2) NOT NULL DEFAULT 0,
  payment_status   TEXT NOT NULL DEFAULT 'pending',
  created_at       TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- ORDER ITEMS TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS order_items (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_id    UUID REFERENCES orders(id) ON DELETE CASCADE,
  product_id  UUID REFERENCES products(id) ON DELETE SET NULL,
  size        TEXT NOT NULL,
  quantity    INTEGER NOT NULL DEFAULT 1,
  price       NUMERIC(10,2) NOT NULL DEFAULT 0,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================================

-- Enable RLS on all tables
ALTER TABLE categories   ENABLE ROW LEVEL SECURITY;
ALTER TABLE products     ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders       ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items  ENABLE ROW LEVEL SECURITY;

-- CATEGORIES: Public read, admin write
CREATE POLICY "Public can read categories"
  ON categories FOR SELECT USING (true);

CREATE POLICY "Authenticated can manage categories"
  ON categories FOR ALL USING (auth.role() = 'authenticated');

-- PRODUCTS: Public read, admin write
CREATE POLICY "Public can read products"
  ON products FOR SELECT USING (true);

CREATE POLICY "Authenticated can manage products"
  ON products FOR ALL USING (auth.role() = 'authenticated');

-- ORDERS: Customers can insert, admin can read/update
CREATE POLICY "Anyone can place orders"
  ON orders FOR INSERT WITH CHECK (true);

CREATE POLICY "Authenticated can read all orders"
  ON orders FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated can update orders"
  ON orders FOR UPDATE USING (auth.role() = 'authenticated');

-- ORDER ITEMS: Customers can insert, admin can read
CREATE POLICY "Anyone can insert order items"
  ON order_items FOR INSERT WITH CHECK (true);

CREATE POLICY "Authenticated can read order items"
  ON order_items FOR SELECT USING (auth.role() = 'authenticated');

-- ============================================================
-- STORAGE BUCKET (product-images)
-- ============================================================
INSERT INTO storage.buckets (id, name, public)
VALUES ('product-images', 'product-images', true)
ON CONFLICT (id) DO NOTHING;

CREATE POLICY "Public Read Product Images"
ON storage.objects FOR SELECT
USING (bucket_id = 'product-images');

CREATE POLICY "Admin Upload Product Images"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'product-images' AND auth.role() = 'authenticated');

-- ============================================================
-- NOTE: No categories are pre-seeded. 
-- The store admin adds all categories and products via /admin
-- ============================================================
