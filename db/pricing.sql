-- =============================================
-- ADD PRICING TABLES - Run this in psql
-- =============================================

CREATE TABLE IF NOT EXISTS price_items (
    id SERIAL PRIMARY KEY,
    category VARCHAR(100) NOT NULL,
    name VARCHAR(200) NOT NULL,
    weight_kg DECIMAL(10,2) NOT NULL DEFAULT 0,
    base_price DECIMAL(10,2) NOT NULL DEFAULT 0,
    is_active BOOLEAN DEFAULT TRUE,
    sort_order INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS distance_slabs (
    id SERIAL PRIMARY KEY,
    label VARCHAR(100) NOT NULL,
    min_km INTEGER NOT NULL,
    max_km INTEGER,
    price_per_kg DECIMAL(10,2) NOT NULL,
    base_charge DECIMAL(10,2) NOT NULL DEFAULT 0,
    is_active BOOLEAN DEFAULT TRUE
);

INSERT INTO distance_slabs (label, min_km, max_km, price_per_kg, base_charge) VALUES
('Local (0 - 50 km)',       0,   50,  2.50,  500),
('Short (51 - 200 km)',    51,  200,  4.00, 1500),
('Medium (201 - 500 km)', 201,  500,  6.00, 3000),
('Long (501 - 1000 km)',  501, 1000,  8.50, 5000),
('Very Long (1000+ km)', 1001, NULL, 12.00, 8000);

INSERT INTO price_items (category, name, weight_kg, base_price, sort_order) VALUES
('Furniture', 'Single Bed', 40, 400, 1),
('Furniture', 'Double Bed', 70, 600, 2),
('Furniture', 'King Size Bed', 90, 800, 3),
('Furniture', 'Sofa (2 Seater)', 60, 500, 4),
('Furniture', 'Sofa (3 Seater)', 90, 700, 5),
('Furniture', 'Sofa Set (5 Seater)', 150, 1200, 6),
('Furniture', 'Dining Table', 50, 500, 7),
('Furniture', 'Dining Chair', 10, 100, 8),
('Furniture', 'Wardrobe (Small)', 60, 600, 9),
('Furniture', 'Wardrobe (Large)', 100, 900, 10),
('Furniture', 'Dressing Table', 35, 350, 11),
('Furniture', 'Study Table', 25, 250, 12),
('Furniture', 'Office Chair', 15, 150, 13),
('Furniture', 'Book Shelf', 30, 300, 14),
('Furniture', 'Center Table', 20, 200, 15),
('Furniture', 'Side Table', 10, 100, 16),
('Furniture', 'Shoe Rack', 15, 150, 17);

INSERT INTO price_items (category, name, weight_kg, base_price, sort_order) VALUES
('Appliances', 'Refrigerator (Small)', 40, 500, 1),
('Appliances', 'Refrigerator (Large)', 80, 800, 2),
('Appliances', 'Washing Machine', 70, 600, 3),
('Appliances', 'Dishwasher', 50, 500, 4),
('Appliances', 'Microwave Oven', 15, 200, 5),
('Appliances', 'Air Conditioner (1.5T)', 35, 600, 6),
('Appliances', 'Air Conditioner (2T)', 45, 700, 7),
('Appliances', 'Water Purifier', 10, 150, 8),
('Appliances', 'Geyser', 12, 150, 9),
('Appliances', 'Ceiling Fan', 5, 80, 10),
('Appliances', 'Exhaust Fan', 3, 60, 11),
('Appliances', 'Mixer/Grinder', 5, 80, 12),
('Appliances', 'Vacuum Cleaner', 8, 100, 13),
('Appliances', 'Induction Cooktop', 3, 60, 14),
('Appliances', 'Gas Stove', 10, 120, 15),
('Appliances', 'Water Cooler', 40, 400, 16);

INSERT INTO price_items (category, name, weight_kg, base_price, sort_order) VALUES
('Electronics', 'TV (32 inch)', 10, 200, 1),
('Electronics', 'TV (43 inch)', 15, 300, 2),
('Electronics', 'TV (55 inch+)', 25, 450, 3),
('Electronics', 'Desktop Computer', 15, 200, 4),
('Electronics', 'Laptop', 3, 100, 5),
('Electronics', 'Printer', 8, 120, 6),
('Electronics', 'Music System', 15, 200, 7),
('Electronics', 'Home Theatre', 20, 300, 8),
('Electronics', 'DTH Setup Box', 1, 50, 9),
('Electronics', 'WiFi Router', 1, 50, 10);

INSERT INTO price_items (category, name, weight_kg, base_price, sort_order) VALUES
('Kitchen', 'Gas Cylinder', 15, 150, 1),
('Kitchen', 'Kitchen Cabinets', 80, 700, 2),
('Kitchen', 'Crockery Box', 20, 200, 3),
('Kitchen', 'Utensils Box', 25, 200, 4),
('Kitchen', 'Pressure Cooker', 5, 80, 5),
('Kitchen', 'Water Tank', 20, 200, 6);

INSERT INTO price_items (category, name, weight_kg, base_price, sort_order) VALUES
('Boxes & Misc', 'Small Carton Box', 10, 80, 1),
('Boxes & Misc', 'Medium Carton Box', 20, 120, 2),
('Boxes & Misc', 'Large Carton Box', 30, 180, 3),
('Boxes & Misc', 'Clothes Bag', 15, 100, 4),
('Boxes & Misc', 'Book Box', 25, 150, 5),
('Boxes & Misc', 'Fragile Items Box', 15, 200, 6),
('Boxes & Misc', 'Cycle', 15, 200, 7),
('Boxes & Misc', 'Motorcycle/Scooter', 120, 1500, 8),
('Boxes & Misc', 'Treadmill', 80, 800, 9),
('Boxes & Misc', 'Gym Equipment Set', 60, 600, 10);

SELECT 'Pricing tables created successfully!' AS status;