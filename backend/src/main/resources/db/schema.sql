-- ============================================
-- FOOD DELIVERY PLATFORM - COMPLETE DATABASE SCHEMA
-- PostgreSQL 15
-- Version: 1.0.0
-- ============================================

-- ============================================
-- ENUMS - Create custom types first
-- ============================================
CREATE TYPE user_role AS ENUM ('CUSTOMER', 'RESTAURANT_OWNER', 'DELIVERY_AGENT', 'ADMIN');

CREATE TYPE order_status AS ENUM (
    'PLACED',           -- Customer placed order
    'CONFIRMED',        -- Restaurant confirmed
    'PREPARING',        -- Kitchen is preparing
    'READY',            -- Ready for pickup
    'ASSIGNED',         -- Delivery agent assigned
    'PICKED_UP',        -- Agent picked up order
    'OUT_FOR_DELIVERY', -- On the way
    'DELIVERED',        -- Successfully delivered
    'CANCELLED'         -- Order cancelled
);

CREATE TYPE assignment_status AS ENUM (
    'PENDING',    -- Sent to agent, awaiting acceptance
    'ACCEPTED',   -- Agent accepted
    'REJECTED',   -- Agent rejected
    'COMPLETED',  -- Delivery completed
    'CANCELLED'   -- Assignment cancelled
);

CREATE TYPE notification_type AS ENUM (
    'ORDER_PLACED',
    'ORDER_CONFIRMED',
    'ORDER_READY',
    'DELIVERY_ASSIGNED',
    'OUT_FOR_DELIVERY',
    'DELIVERED',
    'ORDER_CANCELLED',
    'PAYMENT_SUCCESS',
    'PROMOTION'
);

-- ============================================
-- USERS TABLE
-- ============================================
CREATE TABLE users (
    id BIGSERIAL PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role user_role NOT NULL,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100),
    phone VARCHAR(20) NOT NULL,
    profile_image_url VARCHAR(500),
    is_active BOOLEAN DEFAULT true,
    is_verified BOOLEAN DEFAULT false,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_users_phone ON users(phone);
CREATE INDEX idx_users_active ON users(is_active);

-- ============================================
-- USER ADDRESSES TABLE
-- ============================================
CREATE TABLE user_addresses (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    label VARCHAR(50), -- 'Home', 'Work', 'Other'
    address_line1 VARCHAR(255) NOT NULL,
    address_line2 VARCHAR(255),
    city VARCHAR(100) NOT NULL,
    state VARCHAR(100) NOT NULL,
    postal_code VARCHAR(20) NOT NULL,
    latitude DECIMAL(10, 8) NOT NULL,
    longitude DECIMAL(11, 8) NOT NULL,
    is_default BOOLEAN DEFAULT false,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_addresses_user ON user_addresses(user_id);
CREATE INDEX idx_addresses_default ON user_addresses(user_id, is_default);
-- Note: For geo-spatial queries, enable PostGIS extension and use:
-- CREATE INDEX idx_addresses_location ON user_addresses USING GIST(
--     ll_to_earth(latitude, longitude)
-- );

-- ============================================
-- RESTAURANTS TABLE
-- ============================================
CREATE TABLE restaurants (
    id BIGSERIAL PRIMARY KEY,
    owner_id BIGINT NOT NULL REFERENCES users(id),
    name VARCHAR(255) NOT NULL,
    description TEXT,
    cuisine_type VARCHAR(100),
    address VARCHAR(500) NOT NULL,
    latitude DECIMAL(10, 8) NOT NULL,
    longitude DECIMAL(11, 8) NOT NULL,
    phone VARCHAR(20) NOT NULL,
    email VARCHAR(255),
    opening_time TIME NOT NULL,
    closing_time TIME NOT NULL,
    prep_time_mins INTEGER DEFAULT 30,
    min_order_amount DECIMAL(10, 2) DEFAULT 0,
    delivery_radius_km DECIMAL(5, 2) DEFAULT 5.0,
    rating DECIMAL(3, 2) DEFAULT 0.0,
    total_reviews INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    is_accepting_orders BOOLEAN DEFAULT true,
    logo_url VARCHAR(500),
    banner_url VARCHAR(500),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_restaurants_owner ON restaurants(owner_id);
CREATE INDEX idx_restaurants_active ON restaurants(is_active, is_accepting_orders);
CREATE INDEX idx_restaurants_cuisine ON restaurants(cuisine_type);
CREATE INDEX idx_restaurants_rating ON restaurants(rating DESC);
-- Note: For geo-spatial queries, enable PostGIS extension and use:
-- CREATE INDEX idx_restaurants_location ON restaurants USING GIST(
--     ll_to_earth(latitude, longitude)
-- );

-- ============================================
-- PRODUCTS (MENU ITEMS) TABLE
-- ============================================
CREATE TABLE products (
    id BIGSERIAL PRIMARY KEY,
    restaurant_id BIGINT NOT NULL REFERENCES restaurants(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    category VARCHAR(100), -- 'Appetizer', 'Main Course', 'Dessert', 'Beverage'
    price DECIMAL(10, 2) NOT NULL CHECK (price >= 0),
    image_url VARCHAR(500),
    is_veg BOOLEAN DEFAULT false,
    is_available BOOLEAN DEFAULT true,
    prep_time_mins INTEGER DEFAULT 15,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_products_restaurant ON products(restaurant_id);
CREATE INDEX idx_products_available ON products(is_available);
CREATE INDEX idx_products_category ON products(category);
CREATE INDEX idx_products_restaurant_available ON products(restaurant_id, is_available);

-- ============================================
-- ORDERS TABLE
-- ============================================
CREATE TABLE orders (
    id BIGSERIAL PRIMARY KEY,
    order_number VARCHAR(50) UNIQUE NOT NULL, -- Human-readable: ORD-20250104-1234
    customer_id BIGINT NOT NULL REFERENCES users(id),
    restaurant_id BIGINT NOT NULL REFERENCES restaurants(id),
    delivery_agent_id BIGINT REFERENCES users(id),
    
    -- Address Details
    delivery_address_id BIGINT REFERENCES user_addresses(id),
    delivery_latitude DECIMAL(10, 8) NOT NULL,
    delivery_longitude DECIMAL(11, 8) NOT NULL,
    
    -- Order Details
    status order_status DEFAULT 'PLACED' NOT NULL,
    items_total DECIMAL(10, 2) NOT NULL,
    delivery_fee DECIMAL(10, 2) DEFAULT 0,
    tax_amount DECIMAL(10, 2) DEFAULT 0,
    discount_amount DECIMAL(10, 2) DEFAULT 0,
    total_amount DECIMAL(10, 2) NOT NULL,
    
    -- Timestamps
    placed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    confirmed_at TIMESTAMP,
    ready_at TIMESTAMP,
    picked_up_at TIMESTAMP,
    delivered_at TIMESTAMP,
    cancelled_at TIMESTAMP,
    
    -- Additional Info
    special_instructions TEXT,
    cancellation_reason TEXT,
    estimated_delivery_time TIMESTAMP,
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_orders_customer ON orders(customer_id, status);
CREATE INDEX idx_orders_restaurant ON orders(restaurant_id, status);
CREATE INDEX idx_orders_delivery ON orders(delivery_agent_id, status);
CREATE INDEX idx_orders_status ON orders(status);
CREATE INDEX idx_orders_date ON orders(placed_at);
CREATE INDEX idx_orders_number ON orders(order_number);

-- ============================================
-- ORDER ITEMS TABLE
-- ============================================
CREATE TABLE order_items (
    id BIGSERIAL PRIMARY KEY,
    order_id BIGINT NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
    product_id BIGINT NOT NULL REFERENCES products(id),
    product_name VARCHAR(255) NOT NULL, -- Snapshot at order time
    quantity INTEGER NOT NULL CHECK (quantity > 0),
    unit_price DECIMAL(10, 2) NOT NULL,
    subtotal DECIMAL(10, 2) NOT NULL,
    special_requests TEXT
);

CREATE INDEX idx_order_items_order ON order_items(order_id);
CREATE INDEX idx_order_items_product ON order_items(product_id);

-- ============================================
-- DELIVERY ASSIGNMENTS TABLE
-- ============================================
CREATE TABLE delivery_assignments (
    id BIGSERIAL PRIMARY KEY,
    order_id BIGINT NOT NULL REFERENCES orders(id),
    delivery_agent_id BIGINT NOT NULL REFERENCES users(id),
    status assignment_status DEFAULT 'PENDING',
    assigned_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    accepted_at TIMESTAMP,
    rejected_at TIMESTAMP,
    picked_up_at TIMESTAMP,
    delivered_at TIMESTAMP,
    rejection_reason TEXT,
    agent_rating INTEGER CHECK (agent_rating BETWEEN 1 AND 5),
    agent_feedback TEXT
);

CREATE INDEX idx_assignments_order ON delivery_assignments(order_id);
CREATE INDEX idx_assignments_agent ON delivery_assignments(delivery_agent_id, status);
CREATE INDEX idx_assignments_status ON delivery_assignments(status);

-- ============================================
-- ORDER STATUS HISTORY (AUDIT TRAIL)
-- ============================================
CREATE TABLE order_status_history (
    id BIGSERIAL PRIMARY KEY,
    order_id BIGINT NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
    from_status order_status,
    to_status order_status NOT NULL,
    changed_by_user_id BIGINT REFERENCES users(id),
    notes TEXT,
    changed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_status_history_order ON order_status_history(order_id);
CREATE INDEX idx_status_history_changed_at ON order_status_history(changed_at);

-- ============================================
-- AGENT LOCATION TRACKING
-- ============================================
CREATE TABLE agent_locations (
    id BIGSERIAL PRIMARY KEY,
    agent_id BIGINT NOT NULL REFERENCES users(id),
    latitude DECIMAL(10, 8) NOT NULL,
    longitude DECIMAL(11, 8) NOT NULL,
    accuracy_meters DECIMAL(8, 2),
    is_online BOOLEAN DEFAULT true,
    recorded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_agent_locations_agent ON agent_locations(agent_id);
CREATE INDEX idx_agent_locations_time ON agent_locations(recorded_at);
CREATE INDEX idx_agent_locations_online ON agent_locations(agent_id, is_online);
-- Note: For geo-spatial queries, enable PostGIS extension and use:
-- CREATE INDEX idx_agent_locations_geo ON agent_locations USING GIST(
--     ll_to_earth(latitude, longitude)
-- );

-- ============================================
-- NOTIFICATIONS TABLE
-- ============================================
CREATE TABLE notifications (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    type notification_type NOT NULL,
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    data JSONB, -- Additional payload
    is_read BOOLEAN DEFAULT false,
    read_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_notifications_user ON notifications(user_id, is_read);
CREATE INDEX idx_notifications_created ON notifications(created_at);
CREATE INDEX idx_notifications_type ON notifications(type);

-- ============================================
-- REVIEWS TABLE
-- ============================================
CREATE TABLE reviews (
    id BIGSERIAL PRIMARY KEY,
    order_id BIGINT NOT NULL REFERENCES orders(id),
    customer_id BIGINT NOT NULL REFERENCES users(id),
    restaurant_id BIGINT NOT NULL REFERENCES restaurants(id),
    delivery_agent_id BIGINT REFERENCES users(id),
    
    food_rating INTEGER CHECK (food_rating BETWEEN 1 AND 5),
    delivery_rating INTEGER CHECK (delivery_rating BETWEEN 1 AND 5),
    
    comment TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    -- Ensure one review per order
    UNIQUE(order_id)
);

CREATE INDEX idx_reviews_restaurant ON reviews(restaurant_id);
CREATE INDEX idx_reviews_agent ON reviews(delivery_agent_id);
CREATE INDEX idx_reviews_customer ON reviews(customer_id);
CREATE INDEX idx_reviews_order ON reviews(order_id);

-- ============================================
-- TRIGGERS
-- ============================================

-- Auto-update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_restaurants_updated_at BEFORE UPDATE ON restaurants
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_products_updated_at BEFORE UPDATE ON products
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_orders_updated_at BEFORE UPDATE ON orders
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- FUNCTIONS
-- ============================================

-- Function to automatically create order status history entry
CREATE OR REPLACE FUNCTION create_order_status_history()
RETURNS TRIGGER AS $$
BEGIN
    IF OLD.status IS DISTINCT FROM NEW.status THEN
        INSERT INTO order_status_history (order_id, from_status, to_status, changed_at)
        VALUES (NEW.id, OLD.status, NEW.status, CURRENT_TIMESTAMP);
    END IF;
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER trigger_order_status_history
    AFTER UPDATE ON orders
    FOR EACH ROW
    EXECUTE FUNCTION create_order_status_history();

-- ============================================
-- VIEWS (Optional but useful for reporting)
-- ============================================

-- View for active orders summary
CREATE OR REPLACE VIEW active_orders_summary AS
SELECT 
    o.id,
    o.order_number,
    o.status,
    r.name AS restaurant_name,
    u.first_name || ' ' || u.last_name AS customer_name,
    o.total_amount,
    o.placed_at,
    o.estimated_delivery_time
FROM orders o
JOIN restaurants r ON o.restaurant_id = r.id
JOIN users u ON o.customer_id = u.id
WHERE o.status NOT IN ('DELIVERED', 'CANCELLED');

-- View for delivery agent performance
CREATE OR REPLACE VIEW delivery_agent_performance AS
SELECT 
    u.id AS agent_id,
    u.first_name || ' ' || u.last_name AS agent_name,
    COUNT(da.id) FILTER (WHERE da.status = 'COMPLETED') AS total_deliveries,
    AVG(da.agent_rating) FILTER (WHERE da.agent_rating IS NOT NULL) AS average_rating,
    COUNT(da.id) FILTER (WHERE da.status = 'ACCEPTED' AND da.delivered_at IS NULL) AS active_deliveries
FROM users u
LEFT JOIN delivery_assignments da ON u.id = da.delivery_agent_id
WHERE u.role = 'DELIVERY_AGENT'
GROUP BY u.id, u.first_name, u.last_name;

-- ============================================
-- COMMENTS (Documentation)
-- ============================================

COMMENT ON TABLE users IS 'All platform users: customers, restaurant owners, delivery agents, and admins';
COMMENT ON TABLE restaurants IS 'Restaurant profiles and business information';
COMMENT ON TABLE products IS 'Menu items available at restaurants';
COMMENT ON TABLE orders IS 'Customer orders with full lifecycle tracking';
COMMENT ON TABLE order_items IS 'Line items within each order';
COMMENT ON TABLE delivery_assignments IS 'Delivery agent task assignments';
COMMENT ON TABLE agent_locations IS 'Real-time location tracking for delivery agents';
COMMENT ON TABLE notifications IS 'User notifications and alerts';
COMMENT ON TABLE reviews IS 'Customer reviews and ratings for orders';

-- ============================================
-- FAVORITE RESTAURANTS TABLE
-- ============================================
CREATE TABLE favorite_restaurants (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    restaurant_id BIGINT NOT NULL REFERENCES restaurants(id) ON DELETE CASCADE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, restaurant_id)
);

CREATE INDEX idx_favorites_user ON favorite_restaurants(user_id);
CREATE INDEX idx_favorites_restaurant ON favorite_restaurants(restaurant_id);
CREATE INDEX idx_favorites_unique ON favorite_restaurants(user_id, restaurant_id);

-- ============================================
-- SCHEMA COMPLETE
-- ============================================

