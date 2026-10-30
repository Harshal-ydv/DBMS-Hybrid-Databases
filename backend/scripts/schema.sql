-- ============================================
-- Food Delivery System - MySQL Schema
-- Demonstrates: 3NF Normalization, Foreign Keys, 
-- Triggers, Views, Stored Procedures
-- ============================================

-- Drop existing objects if they exist
DROP PROCEDURE IF EXISTS assign_partner;
DROP VIEW IF EXISTS restaurant_revenue;
DROP TRIGGER IF EXISTS cancel_order_on_refund;
DROP TABLE IF EXISTS payments;
DROP TABLE IF EXISTS order_items;
DROP TABLE IF EXISTS orders;
DROP TABLE IF EXISTS delivery_partners;
DROP TABLE IF EXISTS restaurants;
DROP TABLE IF EXISTS users;

-- ============================================
-- TABLE: users
-- All system users (customers, owners, partners, admins)
-- ============================================
CREATE TABLE users (
  user_id INT PRIMARY KEY AUTO_INCREMENT,
  name VARCHAR(100) NOT NULL,
  email VARCHAR(100) UNIQUE NOT NULL,
  phone VARCHAR(15),
  password_hash VARCHAR(255),
  role ENUM('customer', 'owner', 'partner', 'admin') NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_email (email),
  INDEX idx_role (role)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- TABLE: restaurants
-- Restaurant information owned by users
-- ============================================
CREATE TABLE restaurants (
  restaurant_id INT PRIMARY KEY AUTO_INCREMENT,
  owner_id INT NOT NULL,
  name VARCHAR(100) NOT NULL,
  city VARCHAR(50),
  address TEXT,
  cuisine_type VARCHAR(50),
  is_open BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (owner_id) REFERENCES users(user_id) ON DELETE CASCADE,
  INDEX idx_city (city),
  INDEX idx_cuisine (cuisine_type),
  INDEX idx_is_open (is_open)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- TABLE: delivery_partners
-- Delivery partner details linked to users
-- ============================================
CREATE TABLE delivery_partners (
  partner_id INT PRIMARY KEY AUTO_INCREMENT,
  user_id INT UNIQUE NOT NULL,
  vehicle_type VARCHAR(50),
  is_available BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE,
  INDEX idx_available (is_available)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- TABLE: orders
-- Core transactional data for all orders
-- Status flow: PLACED → ACCEPTED → PREPARING → READY_FOR_PICKUP → PICKED_UP → DELIVERED
-- ============================================
CREATE TABLE orders (
  order_id INT PRIMARY KEY AUTO_INCREMENT,
  user_id INT NOT NULL,
  restaurant_id INT NOT NULL,
  partner_id INT NULL,
  total_amount DECIMAL(10,2) NOT NULL,
  status ENUM('PLACED', 'ACCEPTED', 'REJECTED', 'PREPARING', 'READY_FOR_PICKUP', 'PICKED_UP', 'DELIVERED', 'CANCELLED') DEFAULT 'PLACED',
  delivery_address TEXT NOT NULL,
  placed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(user_id),
  FOREIGN KEY (restaurant_id) REFERENCES restaurants(restaurant_id),
  FOREIGN KEY (partner_id) REFERENCES delivery_partners(partner_id) ON DELETE SET NULL,
  INDEX idx_user (user_id),
  INDEX idx_restaurant (restaurant_id),
  INDEX idx_partner (partner_id),
  INDEX idx_status (status),
  INDEX idx_placed_at (placed_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- TABLE: order_items
-- Individual items in each order
-- Note: item_name and unit_price are denormalized intentionally
-- to preserve order history even if menu prices change
-- ============================================
CREATE TABLE order_items (
  item_id INT PRIMARY KEY AUTO_INCREMENT,
  order_id INT NOT NULL,
  menu_item_id VARCHAR(24) NOT NULL COMMENT 'MongoDB ObjectId as string',
  item_name VARCHAR(100) NOT NULL,
  unit_price DECIMAL(8,2) NOT NULL,
  quantity INT NOT NULL DEFAULT 1,
  customizations TEXT COMMENT 'JSON string of selected customizations',
  FOREIGN KEY (order_id) REFERENCES orders(order_id) ON DELETE CASCADE,
  INDEX idx_order (order_id),
  INDEX idx_menu_item (menu_item_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- TABLE: payments
-- Payment information for orders
-- One-to-one relationship with orders
-- ============================================
CREATE TABLE payments (
  payment_id INT PRIMARY KEY AUTO_INCREMENT,
  order_id INT UNIQUE NOT NULL,
  amount DECIMAL(10,2) NOT NULL,
  method ENUM('UPI', 'CARD', 'COD', 'WALLET', 'CASH') NOT NULL,
  status ENUM('SUCCESS', 'FAILED', 'REFUNDED') DEFAULT 'SUCCESS',
  paid_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (order_id) REFERENCES orders(order_id) ON DELETE CASCADE,
  INDEX idx_status (status),
  INDEX idx_method (method)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- TRIGGER: cancel_order_on_refund
-- Automatically cancel order when payment is refunded
-- Demonstrates: AFTER UPDATE trigger
-- ============================================
DELIMITER $$
CREATE TRIGGER cancel_order_on_refund
AFTER UPDATE ON payments
FOR EACH ROW
BEGIN
  -- Only trigger if status changed to REFUNDED
  IF NEW.status = 'REFUNDED' AND OLD.status != 'REFUNDED' THEN
    UPDATE orders 
    SET status = 'CANCELLED' 
    WHERE order_id = NEW.order_id;
  END IF;
END$$
DELIMITER ;

-- ============================================
-- VIEW: restaurant_revenue
-- Calculate total orders and revenue per restaurant
-- Only includes DELIVERED orders
-- Demonstrates: Aggregation view with JOIN
-- ============================================
CREATE VIEW restaurant_revenue AS
SELECT 
  r.restaurant_id,
  r.name AS restaurant_name,
  r.city,
  r.cuisine_type,
  COUNT(o.order_id) AS total_orders,
  COALESCE(SUM(o.total_amount), 0) AS total_revenue,
  COALESCE(AVG(o.total_amount), 0) AS avg_order_value
FROM restaurants r
LEFT JOIN orders o ON r.restaurant_id = o.restaurant_id AND o.status = 'DELIVERED'
GROUP BY r.restaurant_id, r.name, r.city, r.cuisine_type
ORDER BY total_revenue DESC;

-- ============================================
-- STORED PROCEDURE: assign_partner
-- Assigns an available delivery partner to an order
-- Demonstrates: Transaction, Variables, Conditional logic
-- ============================================
DELIMITER $$
CREATE PROCEDURE assign_partner(IN p_order_id INT)
BEGIN
  DECLARE v_partner_id INT DEFAULT NULL;
  DECLARE v_order_status VARCHAR(20);
  
  -- Check if order exists and is in correct status
  SELECT status INTO v_order_status
  FROM orders
  WHERE order_id = p_order_id;
  
  IF v_order_status IS NULL THEN
    SIGNAL SQLSTATE '45000'
    SET MESSAGE_TEXT = 'Order not found';
  END IF;
  
  IF v_order_status != 'ACCEPTED' THEN
    SIGNAL SQLSTATE '45000'
    SET MESSAGE_TEXT = 'Order must be in ACCEPTED status to assign partner';
  END IF;
  
  -- Find an available delivery partner
  SELECT partner_id INTO v_partner_id
  FROM delivery_partners
  WHERE is_available = TRUE
  LIMIT 1;
  
  -- If partner found, assign and mark as unavailable
  IF v_partner_id IS NOT NULL THEN
    START TRANSACTION;
    
    UPDATE orders 
    SET partner_id = v_partner_id,
        status = 'PREPARING'
    WHERE order_id = p_order_id;
    
    UPDATE delivery_partners 
    SET is_available = FALSE 
    WHERE partner_id = v_partner_id;
    
    COMMIT;
    
    SELECT v_partner_id AS assigned_partner_id, 'SUCCESS' AS result;
  ELSE
    SELECT NULL AS assigned_partner_id, 'NO_PARTNER_AVAILABLE' AS result;
  END IF;
END$$
DELIMITER ;

-- ============================================
-- STORED PROCEDURE: complete_delivery
-- Mark delivery as complete and free up partner
-- ============================================
DELIMITER $$
CREATE PROCEDURE complete_delivery(IN p_order_id INT)
BEGIN
  DECLARE v_partner_id INT;
  
  -- Get the partner assigned to this order
  SELECT partner_id INTO v_partner_id
  FROM orders
  WHERE order_id = p_order_id;
  
  IF v_partner_id IS NOT NULL THEN
    START TRANSACTION;
    
    -- Update order status to DELIVERED
    UPDATE orders 
    SET status = 'DELIVERED' 
    WHERE order_id = p_order_id;
    
    -- Mark partner as available again
    UPDATE delivery_partners 
    SET is_available = TRUE 
    WHERE partner_id = v_partner_id;
    
    COMMIT;
    
    SELECT 'SUCCESS' AS result, v_partner_id AS freed_partner_id;
  ELSE
    SIGNAL SQLSTATE '45000'
    SET MESSAGE_TEXT = 'No partner assigned to this order';
  END IF;
END$$
DELIMITER ;

-- ============================================
-- Additional useful views
-- ============================================

-- View: Top customers by order count and spending
CREATE VIEW top_customers AS
SELECT 
  u.user_id,
  u.name,
  u.email,
  COUNT(o.order_id) AS total_orders,
  COALESCE(SUM(o.total_amount), 0) AS total_spent,
  COALESCE(AVG(o.total_amount), 0) AS avg_order_value
FROM users u
LEFT JOIN orders o ON u.user_id = o.user_id AND o.status = 'DELIVERED'
WHERE u.role = 'customer'
GROUP BY u.user_id, u.name, u.email
HAVING total_orders > 0
ORDER BY total_spent DESC;

-- View: Active deliveries (in progress)
CREATE VIEW active_deliveries AS
SELECT 
  o.order_id,
  o.status,
  o.total_amount,
  o.delivery_address,
  o.placed_at,
  r.name AS restaurant_name,
  r.address AS restaurant_address,
  u.name AS customer_name,
  u.phone AS customer_phone,
  dp.partner_id,
  du.name AS partner_name,
  du.phone AS partner_phone,
  dpt.vehicle_type
FROM orders o
JOIN restaurants r ON o.restaurant_id = r.restaurant_id
JOIN users u ON o.user_id = u.user_id
LEFT JOIN delivery_partners dpt ON o.partner_id = dpt.partner_id
LEFT JOIN users du ON dpt.user_id = du.user_id
WHERE o.status IN ('PREPARING', 'READY_FOR_PICKUP', 'PICKED_UP')
ORDER BY o.placed_at ASC;

-- ============================================
-- Schema creation complete
-- ============================================
