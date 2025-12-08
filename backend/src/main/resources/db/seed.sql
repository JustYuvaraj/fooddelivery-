-- ============================================
-- FOOD DELIVERY PLATFORM - SAMPLE SEED DATA
-- PostgreSQL 15
-- ============================================

-- Note: All passwords are BCrypt hashed for 'password123'
-- Default password for all test users: password123

-- ============================================
-- SAMPLE USERS
-- ============================================
INSERT INTO users (email, password_hash, role, first_name, last_name, phone, is_verified, is_active) VALUES
-- Customer
('customer@test.com', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', 'CUSTOMER', 'John', 'Doe', '+1234567890', true, true),

-- Restaurant Owner
('restaurant@test.com', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', 'RESTAURANT_OWNER', 'Jane', 'Smith', '+1234567891', true, true),

-- Delivery Agent
('delivery@test.com', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', 'DELIVERY_AGENT', 'Mike', 'Wilson', '+1234567892', true, true),

-- Admin
('admin@test.com', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', 'ADMIN', 'Admin', 'User', '+1234567893', true, true),

-- Additional test users
('customer2@test.com', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', 'CUSTOMER', 'Alice', 'Johnson', '+1234567894', true, true),
('agent2@test.com', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', 'DELIVERY_AGENT', 'Bob', 'Brown', '+1234567895', true, true);

-- ============================================
-- SAMPLE CUSTOMER ADDRESSES
-- ============================================
INSERT INTO user_addresses (user_id, label, address_line1, address_line2, city, state, postal_code, latitude, longitude, is_default) VALUES
-- Addresses for customer@test.com (user_id = 1)
(1, 'Home', '123 Main Street', 'Apt 4B', 'New York', 'NY', '10001', 40.7128, -74.0060, true),
(1, 'Work', '456 Business Ave', 'Suite 100', 'New York', 'NY', '10002', 40.7589, -73.9851, false),

-- Address for customer2@test.com (user_id = 5)
(5, 'Home', '789 Park Avenue', NULL, 'New York', 'NY', '10021', 40.7614, -73.9776, true);

-- ============================================
-- SAMPLE RESTAURANTS
-- ============================================
INSERT INTO restaurants (
    owner_id, name, description, cuisine_type, address, latitude, longitude, 
    phone, email, opening_time, closing_time, prep_time_mins, min_order_amount, 
    delivery_radius_km, rating, total_reviews, is_active, is_accepting_orders,
    logo_url, banner_url
) VALUES
-- Pizza Paradise (owned by restaurant@test.com, user_id = 2)
(2, 'Pizza Paradise', 'Best pizzas in town with authentic Italian flavors', 'Italian', 
 '123 Main St, New York, NY 10001', 40.7128, -74.0060, '+1234567896', 'info@pizzaparadise.com',
 '10:00:00', '23:00:00', 30, 15.00, 5.0, 4.5, 125, true, true,
 'https://example.com/logos/pizza-paradise.png', 'https://example.com/banners/pizza-paradise.jpg'),

-- Sushi Master (owned by restaurant@test.com, user_id = 2)
(2, 'Sushi Master', 'Fresh sushi and Japanese cuisine', 'Japanese',
 '456 Broadway, New York, NY 10013', 40.7209, -74.0007, '+1234567897', 'info@sushimaster.com',
 '11:00:00', '22:00:00', 25, 20.00, 5.0, 4.8, 89, true, true,
 NULL, NULL),

-- Burger King (owned by restaurant@test.com, user_id = 2)
(2, 'Burger King', 'Flame-grilled burgers and fries', 'American',
 '789 5th Ave, New York, NY 10022', 40.7614, -73.9776, '+1234567898', 'info@burgerking.com',
 '09:00:00', '23:00:00', 20, 10.00, 4.0, 4.3, 234, true, true,
 NULL, NULL);

-- ============================================
-- SAMPLE PRODUCTS (MENU ITEMS)
-- ============================================
INSERT INTO products (restaurant_id, name, description, category, price, is_veg, is_available, prep_time_mins, image_url) VALUES
-- Pizza Paradise Products (restaurant_id = 1)
(1, 'Margherita Pizza', 'Classic tomato sauce, mozzarella, and basil', 'Main Course', 12.99, true, true, 20, NULL),
(1, 'Pepperoni Pizza', 'Pepperoni, mozzarella, and tomato sauce', 'Main Course', 14.99, false, true, 20, NULL),
(1, 'Veggie Supreme Pizza', 'Mixed vegetables with mozzarella', 'Main Course', 13.99, true, true, 22, NULL),
(1, 'Caesar Salad', 'Fresh romaine lettuce with Caesar dressing', 'Appetizer', 8.99, true, true, 10, NULL),
(1, 'Garlic Bread', 'Fresh baked bread with garlic butter', 'Appetizer', 5.99, true, true, 8, NULL),
(1, 'Chocolate Brownie', 'Rich chocolate brownie with ice cream', 'Dessert', 6.99, true, true, 5, NULL),
(1, 'Coca Cola', '500ml bottle', 'Beverage', 2.99, true, true, 2, NULL),

-- Sushi Master Products (restaurant_id = 2)
(2, 'Salmon Sashimi', 'Fresh salmon slices', 'Main Course', 18.99, false, true, 15, NULL),
(2, 'California Roll', 'Crab, avocado, cucumber', 'Main Course', 9.99, false, true, 10, NULL),
(2, 'Vegetable Roll', 'Mixed fresh vegetables', 'Main Course', 8.99, true, true, 10, NULL),
(2, 'Miso Soup', 'Traditional Japanese soup', 'Appetizer', 4.99, true, true, 5, NULL),
(2, 'Edamame', 'Steamed soybeans with salt', 'Appetizer', 5.99, true, true, 5, NULL),
(2, 'Green Tea', 'Hot or cold', 'Beverage', 3.99, true, true, 3, NULL),

-- Burger King Products (restaurant_id = 3)
(3, 'Classic Burger', 'Beef patty, lettuce, tomato, special sauce', 'Main Course', 8.99, false, true, 15, NULL),
(3, 'Cheese Burger', 'Beef patty, cheese, lettuce, tomato', 'Main Course', 9.99, false, true, 15, NULL),
(3, 'Veggie Burger', 'Plant-based patty with vegetables', 'Main Course', 8.99, true, true, 15, NULL),
(3, 'French Fries', 'Crispy golden fries', 'Appetizer', 4.99, true, true, 8, NULL),
(3, 'Onion Rings', 'Battered and fried onion rings', 'Appetizer', 5.99, true, true, 10, NULL),
(3, 'Chocolate Shake', 'Creamy chocolate milkshake', 'Beverage', 4.99, true, true, 5, NULL);

-- ============================================
-- SAMPLE ORDERS (Optional - for testing)
-- ============================================
-- Uncomment these if you want sample orders in the database

/*
INSERT INTO orders (
    order_number, customer_id, restaurant_id, delivery_address_id,
    delivery_latitude, delivery_longitude, status, items_total,
    delivery_fee, tax_amount, total_amount, placed_at
) VALUES
('ORD-20250101-0001', 1, 1, 1, 40.7128, -74.0060, 'PLACED', 25.98, 5.00, 1.30, 32.28, CURRENT_TIMESTAMP - INTERVAL '2 hours'),
('ORD-20250101-0002', 1, 2, 1, 40.7128, -74.0060, 'DELIVERED', 23.98, 5.00, 1.20, 30.18, CURRENT_TIMESTAMP - INTERVAL '1 day'),
('ORD-20250101-0003', 5, 3, 6, 40.7614, -73.9776, 'PREPARING', 18.98, 4.00, 0.95, 23.93, CURRENT_TIMESTAMP - INTERVAL '30 minutes');

-- Sample order items
INSERT INTO order_items (order_id, product_id, product_name, quantity, unit_price, subtotal) VALUES
(1, 1, 'Margherita Pizza', 2, 12.99, 25.98),
(2, 8, 'Salmon Sashimi', 1, 18.99, 18.99),
(2, 11, 'Miso Soup', 1, 4.99, 4.99),
(3, 13, 'Classic Burger', 2, 8.99, 17.98),
(3, 17, 'French Fries', 1, 4.99, 4.99);
*/

-- ============================================
-- SETUP COMPLETE
-- ============================================

-- Display summary
DO $$
DECLARE
    user_count INTEGER;
    restaurant_count INTEGER;
    product_count INTEGER;
    address_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO user_count FROM users;
    SELECT COUNT(*) INTO restaurant_count FROM restaurants;
    SELECT COUNT(*) INTO product_count FROM products;
    SELECT COUNT(*) INTO address_count FROM user_addresses;
    
    RAISE NOTICE 'Seed data loaded successfully!';
    RAISE NOTICE 'Users: %', user_count;
    RAISE NOTICE 'Restaurants: %', restaurant_count;
    RAISE NOTICE 'Products: %', product_count;
    RAISE NOTICE 'Addresses: %', address_count;
END $$;



