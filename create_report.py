from docx import Document
from docx.shared import Inches, Pt, RGBColor
from docx.enum.text import WD_ALIGN_PARAGRAPH
from docx.oxml.ns import qn
from docx.oxml import OxmlElement

def add_page_break(doc):
    """Add a page break"""
    doc.add_page_break()

def set_paragraph_format(paragraph, alignment=WD_ALIGN_PARAGRAPH.JUSTIFY, space_after=Pt(12)):
    """Set paragraph formatting"""
    paragraph.alignment = alignment
    paragraph_format = paragraph.paragraph_format
    paragraph_format.space_after = space_after
    paragraph_format.line_spacing = 1.15

def add_heading_custom(doc, text, level=1):
    """Add custom formatted heading"""
    heading = doc.add_heading(text, level=level)
    heading.alignment = WD_ALIGN_PARAGRAPH.LEFT
    for run in heading.runs:
        run.font.color.rgb = RGBColor(0, 0, 0)
    return heading

def create_report():
    """Create the complete project report"""
    doc = Document()
    
    # Set default font
    style = doc.styles['Normal']
    font = style.font
    font.name = 'Times New Roman'
    font.size = Pt(12)
    
    # ==================== COVER PAGE ====================
    # Title
    title = doc.add_paragraph()
    title_run = title.add_run('FOOD DELIVERY SYSTEM\n')
    title_run.font.size = Pt(24)
    title_run.font.bold = True
    title.alignment = WD_ALIGN_PARAGRAPH.CENTER
    
    subtitle = doc.add_paragraph()
    subtitle_run = subtitle.add_run('Database Management System Mini Project')
    subtitle_run.font.size = Pt(16)
    subtitle.alignment = WD_ALIGN_PARAGRAPH.CENTER
    
    doc.add_paragraph('\n' * 3)
    
    # Add project details
    details = [
        'A Hybrid Database Architecture Implementation',
        'Using MySQL and MongoDB',
        '',
        'Submitted By:',
        'Harshal Yadav',
        '',
        'Academic Year: 2026',
        ''
    ]
    
    for detail in details:
        p = doc.add_paragraph(detail)
        p.alignment = WD_ALIGN_PARAGRAPH.CENTER
        if 'Submitted' in detail or 'Academic' in detail:
            for run in p.runs:
                run.font.bold = True
    
    add_page_break(doc)
    
    # ==================== TABLE OF CONTENTS ====================
    add_heading_custom(doc, 'TABLE OF CONTENTS', level=1)
    
    toc_items = [
        ('1. Introduction', '3'),
        ('   1.1 Project Overview', '3'),
        ('   1.2 Objectives', '3'),
        ('2. System Architecture', '4'),
        ('   2.1 Hybrid Database Architecture', '4'),
        ('   2.2 Architecture Diagram', '4'),
        ('3. Technologies Used', '5'),
        ('   3.1 Backend Technologies', '5'),
        ('   3.2 Frontend Technologies', '5'),
        ('   3.3 Database Technologies', '6'),
        ('4. Database Design', '7'),
        ('   4.1 MySQL Schema Design', '7'),
        ('   4.2 MySQL Tables', '7'),
        ('   4.3 MongoDB Collections', '8'),
        ('5. Database Configuration', '9'),
        ('   5.1 AWS RDS (MySQL)', '9'),
        ('   5.2 MongoDB Atlas', '9'),
        ('   5.3 Database Tools', '10'),
        ('6. Advanced Database Concepts', '11'),
        ('   6.1 Triggers', '11'),
        ('   6.2 Stored Procedures', '11'),
        ('   6.3 Views', '12'),
        ('   6.4 Aggregation Pipelines', '12'),
        ('7. Application Features', '13'),
        ('   7.1 User Roles', '13'),
        ('   7.2 Key Features', '13'),
        ('8. User Interface', '14'),
        ('   8.1 Landing Page', '14'),
        ('   8.2 Customer Dashboard', '14'),
        ('   8.3 Restaurant Dashboard', '14'),
        ('   8.4 Delivery Partner Dashboard', '15'),
        ('   8.5 Admin Dashboard', '15'),
        ('9. Conclusion', '16'),
        ('10. References', '16'),
    ]
    
    for item, page in toc_items:
        p = doc.add_paragraph()
        p.add_run(item)
        p.add_run('\t')
        p.add_run(page)
        if item[0].isdigit() and '.' in item[:3]:
            for run in p.runs:
                run.font.bold = True
    
    add_page_break(doc)
    
    # ==================== 1. INTRODUCTION ====================
    add_heading_custom(doc, '1. INTRODUCTION', level=1)
    
    add_heading_custom(doc, '1.1 Project Overview', level=2)
    intro_text = """The Food Delivery System is a comprehensive database management project that demonstrates the implementation of a hybrid database architecture combining relational (MySQL) and NoSQL (MongoDB) databases. This system manages the complete food delivery workflow from customer order placement to delivery completion, involving multiple user roles including customers, restaurant owners, delivery partners, and system administrators.

The project showcases advanced database concepts including normalization, triggers, stored procedures, views, transactions, and aggregation pipelines. It provides a real-world example of how modern applications leverage different database technologies to optimize for different data patterns and use cases."""
    
    p = doc.add_paragraph(intro_text)
    set_paragraph_format(p)
    
    add_heading_custom(doc, '1.2 Objectives', level=2)
    objectives = [
        'Design and implement a normalized relational database schema following 3NF principles',
        'Demonstrate hybrid database architecture using MySQL for transactional data and MongoDB for flexible schemas',
        'Implement advanced SQL concepts including triggers, stored procedures, and views',
        'Utilize MongoDB aggregation framework for complex data analysis',
        'Build a RESTful API backend with Express.js handling 43+ endpoints',
        'Develop a responsive frontend application with role-based dashboards',
        'Demonstrate ACID properties through transaction management',
        'Implement real-time order tracking and status management'
    ]
    
    for obj in objectives:
        p = doc.add_paragraph(obj, style='List Bullet')
        set_paragraph_format(p, space_after=Pt(6))
    
    add_page_break(doc)
    
    # ==================== 2. SYSTEM ARCHITECTURE ====================
    add_heading_custom(doc, '2. SYSTEM ARCHITECTURE', level=1)
    
    add_heading_custom(doc, '2.1 Hybrid Database Architecture', level=2)
    arch_text = """The system employs a hybrid database architecture that leverages the strengths of both relational and NoSQL databases:

MySQL (Relational Database):
Used for structured transactional data that requires ACID properties, complex relationships, and referential integrity. This includes users, restaurants, orders, payments, and delivery partners.

MongoDB (Document Database):
Used for flexible, schema-less data that benefits from denormalization and fast reads. This includes restaurant menus with nested categories and items, customer reviews with embedded data, and event logs for tracking order timelines.

This architecture provides:
• Data Consistency: Critical transactional data maintained in MySQL with foreign key constraints
• Flexibility: Menu items and reviews stored in MongoDB allowing easy schema modifications
• Performance: Optimized queries leveraging each database's strengths
• Scalability: Independent scaling of relational and document stores"""
    
    p = doc.add_paragraph(arch_text)
    set_paragraph_format(p)
    
    add_heading_custom(doc, '2.2 Architecture Diagram', level=2)
    
    # Architecture diagram text representation
    arch_diagram = """
    ┌─────────────────────────────────────────────────────┐
    │           FRONTEND (React Application)               │
    │     Port: 3000                                       │
    └──────────────────┬──────────────────────────────────┘
                       │ HTTP Requests (Axios)
                       ↓
    ┌─────────────────────────────────────────────────────┐
    │        BACKEND API (Express.js Server)              │
    │        Port: 5000                                   │
    │  ┌────────────┐  ┌────────────┐  ┌──────────────┐ │
    │  │ Controllers│  │   Routes   │  │    Models    │ │
    │  └────────────┘  └────────────┘  └──────────────┘ │
    └──────────┬────────────────────────────┬─────────────┘
               │                            │
               ↓                            ↓
    ┌──────────────────────┐    ┌──────────────────────┐
    │   MySQL Database     │    │  MongoDB Database    │
    │   (AWS RDS)          │    │  (Atlas / Local)     │
    │                      │    │                      │
    │  • users             │    │  • menus             │
    │  • restaurants       │    │  • reviews           │
    │  • orders            │    │  • order_events      │
    │  • order_items       │    │                      │
    │  • payments          │    │  Aggregations        │
    │  • delivery_partners │    │  Text Search         │
    │                      │    │  Flexible Schema     │
    │  Triggers            │    │                      │
    │  Stored Procedures   │    │                      │
    │  Views               │    │                      │
    └──────────────────────┘    └──────────────────────┘
"""
    
    p = doc.add_paragraph(arch_diagram)
    p.style = 'Normal'
    for run in p.runs:
        run.font.name = 'Courier New'
        run.font.size = Pt(9)
    
    add_page_break(doc)
    
    # ==================== 3. TECHNOLOGIES USED ====================
    add_heading_custom(doc, '3. TECHNOLOGIES USED', level=1)
    
    add_heading_custom(doc, '3.1 Backend Technologies', level=2)
    backend_tech = """• Node.js (v18+): JavaScript runtime environment for server-side execution
• Express.js (v4.18.2): Web application framework for building RESTful APIs
• MySQL2 (v3.6.5): MySQL client for Node.js with Promise support
• MongoDB Driver (v6.3.0): Official MongoDB driver for Node.js
• CORS (v2.8.5): Middleware for enabling Cross-Origin Resource Sharing
• dotenv (v16.3.1): Environment variable management
• Body-Parser (v1.20.2): Request body parsing middleware"""
    
    p = doc.add_paragraph(backend_tech)
    set_paragraph_format(p)
    
    add_heading_custom(doc, '3.2 Frontend Technologies', level=2)
    frontend_tech = """• React (v19.3.1): JavaScript library for building user interfaces
• React Router DOM (v7.18.4): Declarative routing for React applications
• Material-UI (v9.5.0): React component library implementing Material Design
• Axios (v1.20.0): Promise-based HTTP client for API requests
• React Scripts (v5.0.1): Configuration and scripts for Create React App"""
    
    p = doc.add_paragraph(frontend_tech)
    set_paragraph_format(p)
    
    add_heading_custom(doc, '3.3 Database Technologies', level=2)
    db_tech = """MySQL 8.0 (Relational Database):
• AWS RDS: Managed relational database service hosting MySQL instance
• Storage Engine: InnoDB for ACID compliance and foreign key support
• Character Set: utf8mb4 for full Unicode support including emojis
• Port: 3306
• Host: food-delivery-db.chcisgcswz7m.ap-south-1.rds.amazonaws.com

MongoDB 6.0+ (Document Database):
• MongoDB Atlas: Cloud-hosted MongoDB cluster (optional)
• Local Instance: Development environment on localhost:27017
• Database: food_delivery
• Collections: menus, reviews, order_events

Database Tools:
• DBeaver: Universal database management tool for MySQL
• MongoDB Compass: Official GUI for MongoDB
• AWS RDS Console: Cloud database management interface"""
    
    p = doc.add_paragraph(db_tech)
    set_paragraph_format(p)
    
    add_page_break(doc)
    
    # ==================== 4. DATABASE DESIGN ====================
    add_heading_custom(doc, '4. DATABASE DESIGN', level=1)
    
    add_heading_custom(doc, '4.1 MySQL Schema Design', level=2)
    schema_text = """The MySQL database follows Third Normal Form (3NF) principles to eliminate data redundancy and ensure data integrity. The schema consists of 6 interconnected tables with proper foreign key relationships:

Key Design Principles:
• Normalization: All tables are in 3NF with no transitive dependencies
• Referential Integrity: Foreign key constraints ensure data consistency
• Indexing: Strategic indexes on frequently queried columns
• ACID Compliance: InnoDB engine ensures transaction reliability"""
    
    p = doc.add_paragraph(schema_text)
    set_paragraph_format(p)
    
    add_heading_custom(doc, '4.2 MySQL Tables', level=2)
    
    # Users Table
    doc.add_paragraph('1. users Table', style='List Number')
    users_desc = """Stores all system users across different roles (customer, owner, partner, admin). Primary key: user_id. Contains authentication information and role-based access control."""
    p = doc.add_paragraph(users_desc)
    set_paragraph_format(p, space_after=Pt(6))
    
    users_sql = """CREATE TABLE users (
  user_id INT PRIMARY KEY AUTO_INCREMENT,
  name VARCHAR(100) NOT NULL,
  email VARCHAR(100) UNIQUE NOT NOT,
  phone VARCHAR(15),
  role ENUM('customer', 'owner', 'partner', 'admin') NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_email (email),
  INDEX idx_role (role)
);"""
    p = doc.add_paragraph(users_sql)
    p.style = 'Normal'
    for run in p.runs:
        run.font.name = 'Courier New'
        run.font.size = Pt(9)
    
    # Restaurants Table
    doc.add_paragraph('2. restaurants Table', style='List Number')
    rest_desc = """Stores restaurant information linked to owner users. Foreign key: owner_id references users(user_id)."""
    p = doc.add_paragraph(rest_desc)
    set_paragraph_format(p, space_after=Pt(6))
    
    rest_sql = """CREATE TABLE restaurants (
  restaurant_id INT PRIMARY KEY AUTO_INCREMENT,
  owner_id INT NOT NULL,
  name VARCHAR(100) NOT NULL,
  city VARCHAR(50),
  address TEXT,
  cuisine_type VARCHAR(50),
  is_open BOOLEAN DEFAULT TRUE,
  FOREIGN KEY (owner_id) REFERENCES users(user_id) ON DELETE CASCADE
);"""
    p = doc.add_paragraph(rest_sql)
    p.style = 'Normal'
    for run in p.runs:
        run.font.name = 'Courier New'
        run.font.size = Pt(9)
    
    # Orders Table
    doc.add_paragraph('3. orders Table', style='List Number')
    orders_desc = """Core transactional table storing order information with multiple foreign keys. Status flow: PLACED → ACCEPTED → PREPARING → READY_FOR_PICKUP → PICKED_UP → DELIVERED."""
    p = doc.add_paragraph(orders_desc)
    set_paragraph_format(p, space_after=Pt(6))
    
    orders_sql = """CREATE TABLE orders (
  order_id INT PRIMARY KEY AUTO_INCREMENT,
  user_id INT NOT NULL,
  restaurant_id INT NOT NULL,
  partner_id INT NULL,
  total_amount DECIMAL(10,2) NOT NULL,
  status ENUM('PLACED', 'ACCEPTED', 'PREPARING', 
              'READY_FOR_PICKUP', 'PICKED_UP', 
              'DELIVERED', 'CANCELLED') DEFAULT 'PLACED',
  delivery_address TEXT NOT NULL,
  placed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(user_id),
  FOREIGN KEY (restaurant_id) REFERENCES restaurants(restaurant_id),
  FOREIGN KEY (partner_id) REFERENCES delivery_partners(partner_id)
);"""
    p = doc.add_paragraph(orders_sql)
    p.style = 'Normal'
    for run in p.runs:
        run.font.name = 'Courier New'
        run.font.size = Pt(9)
    
    # Other tables summary
    doc.add_paragraph('4. order_items Table: Individual items within each order with denormalized item_name and price for historical accuracy', style='List Number')
    doc.add_paragraph('5. payments Table: One-to-one relationship with orders storing payment information', style='List Number')
    doc.add_paragraph('6. delivery_partners Table: Delivery partner details linked to users table', style='List Number')
    
    add_heading_custom(doc, '4.3 MongoDB Collections', level=2)
    
    mongo_text = """MongoDB is used for flexible, document-based data storage:

1. menus Collection:
Stores restaurant menus with nested categories and items. Supports flexible schema for customizations, dietary preferences, and dynamic pricing.

2. reviews Collection:
Customer reviews and ratings with embedded user information. Aggregation pipelines calculate average ratings and review summaries.

3. order_events Collection:
Chronological event logging for order tracking. Provides detailed timeline of order status changes."""
    
    p = doc.add_paragraph(mongo_text)
    set_paragraph_format(p)
    
    mongo_example = """{
  "_id": ObjectId("..."),
  "restaurant_id": 1,
  "restaurant_name": "Pizza Palace",
  "categories": [
    {
      "name": "Pizza",
      "items": [
        {
          "name": "Margherita Pizza",
          "price": 299,
          "veg": true,
          "description": "Classic pizza with cheese",
          "customizations": [
            { "name": "Extra Cheese", "price": 50 }
          ]
        }
      ]
    }
  ]
}"""
    p = doc.add_paragraph(mongo_example)
    p.style = 'Normal'
    for run in p.runs:
        run.font.name = 'Courier New'
        run.font.size = Pt(9)
    
    add_page_break(doc)
    
    # ==================== 5. DATABASE CONFIGURATION ====================
    add_heading_custom(doc, '5. DATABASE CONFIGURATION', level=1)
    
    add_heading_custom(doc, '5.1 AWS RDS (MySQL)', level=2)
    rds_text = """Amazon RDS (Relational Database Service) hosts our production MySQL database:

Configuration:
• Database Engine: MySQL 8.0 Community Edition
• Instance Class: db.t3.micro (Free Tier)
• Storage: 20 GB General Purpose SSD
• Region: Asia Pacific (Mumbai) - ap-south-1
• Endpoint: food-delivery-db.chcisgcswz7m.ap-south-1.rds.amazonaws.com
• Port: 3306
• Database Name: food_delivery

The AWS RDS dashboard provides monitoring, backup management, and performance insights. Security groups control network access to the database instance."""
    
    p = doc.add_paragraph(rds_text)
    set_paragraph_format(p)
    
    doc.add_paragraph('[AWS RDS Console Screenshot would appear here]')
    
    add_heading_custom(doc, '5.2 MongoDB Atlas', level=2)
    atlas_text = """MongoDB Atlas is used for cloud-hosted MongoDB deployment:

Configuration:
• Cluster Name: FoodDeliveryCluster
• Cloud Provider: AWS
• Region: Mumbai (ap-south-1)
• Cluster Tier: M0 (Free Tier)
• Database: food_delivery
• Connection String: mongodb+srv://fooddelivery_user:***@fooddeliverycluster.dhuthmo.mongodb.net/

Features:
• Automated backups and point-in-time recovery
• Real-time performance monitoring
• Flexible schema with schema validation
• Text search indexes for menu item queries"""
    
    p = doc.add_paragraph(atlas_text)
    set_paragraph_format(p)
    
    doc.add_paragraph('[MongoDB Atlas Console Screenshot would appear here]')
    
    add_heading_custom(doc, '5.3 Database Tools', level=2)
    
    dbeaver_text = """DBeaver Universal Database Tool:
• Used for MySQL database management and query execution
• Provides ER diagram visualization
• Supports data export/import operations
• Shows table relationships and foreign keys"""
    
    p = doc.add_paragraph(dbeaver_text)
    set_paragraph_format(p)
    
    doc.add_paragraph('[DBeaver Interface Screenshot would appear here]')
    
    compass_text = """MongoDB Compass:
• Official GUI for MongoDB database management
• Visual query builder and aggregation pipeline designer
• Document validation and schema analysis
• Index management and performance optimization"""
    
    p = doc.add_paragraph(compass_text)
    set_paragraph_format(p)
    
    doc.add_paragraph('[MongoDB Compass Screenshot would appear here]')
    
    add_page_break(doc)
    
    # ==================== 6. ADVANCED DATABASE CONCEPTS ====================
    add_heading_custom(doc, '6. ADVANCED DATABASE CONCEPTS', level=1)
    
    add_heading_custom(doc, '6.1 Triggers', level=2)
    trigger_text = """Database triggers automatically execute in response to specific events. Our system implements a trigger to maintain data consistency:"""
    p = doc.add_paragraph(trigger_text)
    set_paragraph_format(p)
    
    trigger_sql = """DELIMITER $$
CREATE TRIGGER cancel_order_on_refund
AFTER UPDATE ON payments
FOR EACH ROW
BEGIN
  -- Automatically cancel order when payment is refunded
  IF NEW.status = 'REFUNDED' AND OLD.status != 'REFUNDED' THEN
    UPDATE orders 
    SET status = 'CANCELLED' 
    WHERE order_id = NEW.order_id;
  END IF;
END$$
DELIMITER ;"""
    
    p = doc.add_paragraph(trigger_sql)
    p.style = 'Normal'
    for run in p.runs:
        run.font.name = 'Courier New'
        run.font.size = Pt(9)
    
    trigger_desc = """This AFTER UPDATE trigger ensures that whenever a payment is refunded, the associated order is automatically cancelled, maintaining consistency between the payments and orders tables."""
    p = doc.add_paragraph(trigger_desc)
    set_paragraph_format(p)
    
    add_heading_custom(doc, '6.2 Stored Procedures', level=2)
    sp_text = """Stored procedures encapsulate business logic in the database layer. Key procedures implemented:"""
    p = doc.add_paragraph(sp_text)
    set_paragraph_format(p)
    
    sp_sql = """DELIMITER $$
CREATE PROCEDURE assign_partner(IN p_order_id INT)
BEGIN
  DECLARE v_partner_id INT DEFAULT NULL;
  DECLARE v_order_status VARCHAR(20);
  
  -- Validate order status
  SELECT status INTO v_order_status
  FROM orders WHERE order_id = p_order_id;
  
  IF v_order_status != 'ACCEPTED' THEN
    SIGNAL SQLSTATE '45000'
    SET MESSAGE_TEXT = 'Order must be ACCEPTED';
  END IF;
  
  -- Find available delivery partner
  SELECT partner_id INTO v_partner_id
  FROM delivery_partners
  WHERE is_available = TRUE
  LIMIT 1;
  
  IF v_partner_id IS NOT NULL THEN
    START TRANSACTION;
    
    UPDATE orders 
    SET partner_id = v_partner_id, status = 'PREPARING'
    WHERE order_id = p_order_id;
    
    UPDATE delivery_partners 
    SET is_available = FALSE 
    WHERE partner_id = v_partner_id;
    
    COMMIT;
  END IF;
END$$
DELIMITER ;

-- Usage: CALL assign_partner(15);"""
    
    p = doc.add_paragraph(sp_sql)
    p.style = 'Normal'
    for run in p.runs:
        run.font.name = 'Courier New'
        run.font.size = Pt(9)
    
    sp_desc = """This stored procedure demonstrates:
• Variable declaration and usage
• Conditional logic (IF-THEN-ELSE)
• Transaction management (START TRANSACTION, COMMIT)
• Error handling (SIGNAL SQLSTATE)
• Multiple table updates in a single transaction"""
    p = doc.add_paragraph(sp_desc)
    set_paragraph_format(p)
    
    add_heading_custom(doc, '6.3 Views', level=2)
    view_text = """Views provide abstracted, pre-computed query results:"""
    p = doc.add_paragraph(view_text)
    set_paragraph_format(p)
    
    view_sql = """CREATE VIEW restaurant_revenue AS
SELECT 
  r.restaurant_id,
  r.name AS restaurant_name,
  r.city,
  r.cuisine_type,
  COUNT(o.order_id) AS total_orders,
  COALESCE(SUM(o.total_amount), 0) AS total_revenue,
  COALESCE(AVG(o.total_amount), 0) AS avg_order_value
FROM restaurants r
LEFT JOIN orders o ON r.restaurant_id = o.restaurant_id 
  AND o.status = 'DELIVERED'
GROUP BY r.restaurant_id, r.name, r.city, r.cuisine_type
ORDER BY total_revenue DESC;

-- Query the view
SELECT * FROM restaurant_revenue WHERE city = 'Mumbai';"""
    
    p = doc.add_paragraph(view_sql)
    p.style = 'Normal'
    for run in p.runs:
        run.font.name = 'Courier New'
        run.font.size = Pt(9)
    
    add_heading_custom(doc, '6.4 Aggregation Pipelines (MongoDB)', level=2)
    agg_text = """MongoDB aggregation framework enables complex data transformations:"""
    p = doc.add_paragraph(agg_text)
    set_paragraph_format(p)
    
    agg_code = """// Calculate average rating per restaurant
db.reviews.aggregate([
  {
    $match: { restaurant_id: 1 }
  },
  {
    $group: {
      _id: "$restaurant_id",
      avg_rating: { $avg: "$rating" },
      total_reviews: { $sum: 1 },
      ratings_distribution: {
        $push: "$rating"
      }
    }
  }
]);

// Get popular menu items
db.menus.aggregate([
  { $unwind: "$categories" },
  { $unwind: "$categories.items" },
  { $match: { "categories.items.veg": true } },
  { $project: {
      item_name: "$categories.items.name",
      price: "$categories.items.price",
      restaurant: "$restaurant_name"
    }
  },
  { $sort: { price: 1 } },
  { $limit: 10 }
]);"""
    
    p = doc.add_paragraph(agg_code)
    p.style = 'Normal'
    for run in p.runs:
        run.font.name = 'Courier New'
        run.font.size = Pt(9)
    
    add_page_break(doc)
    
    # ==================== 7. APPLICATION FEATURES ====================
    add_heading_custom(doc, '7. APPLICATION FEATURES', level=1)
    
    add_heading_custom(doc, '7.1 User Roles', level=2)
    roles_text = """The system supports four distinct user roles, each with specific functionalities:

1. Customer Role:
• Browse restaurants by cuisine, location, and rating
• View detailed menus with prices and customizations
• Add items to shopping cart
• Place orders with delivery address
• Track order status in real-time
• View order history and past orders
• Submit reviews and ratings after delivery

2. Restaurant Owner Role:
• Manage restaurant information and menu items
• View incoming orders in real-time
• Accept or reject orders based on availability
• Update order preparation status
• View sales analytics and revenue reports
• Track performance metrics

3. Delivery Partner Role:
• View available delivery orders
• Accept delivery requests
• Update delivery status (Picked up, Delivered)
• Track earnings and delivery count
• View active deliveries with customer contact info

4. Admin Role:
• System-wide analytics dashboard
• Monitor all restaurants, orders, and users
• View top-rated restaurants
• Analyze order trends and patterns
• Manage system configurations"""
    
    p = doc.add_paragraph(roles_text)
    set_paragraph_format(p)
    
    add_heading_custom(doc, '7.2 Key Features', level=2)
    
    features = [
        'Real-time Order Tracking: WebSocket-ready architecture for live status updates',
        'Intelligent Partner Assignment: Stored procedure-based automatic delivery partner allocation',
        'Transaction Safety: ACID-compliant order processing with rollback capabilities',
        'Advanced Search: MongoDB text indexes enabling fast menu item search',
        'Analytics Dashboard: Comprehensive metrics using views and aggregation pipelines',
        'Responsive Design: Mobile-friendly UI adapting to different screen sizes',
        'RESTful API: 43+ endpoints following REST principles',
        'Error Handling: Comprehensive error messages and validation'
    ]
    
    for feature in features:
        p = doc.add_paragraph(feature, style='List Bullet')
        set_paragraph_format(p, space_after=Pt(6))
    
    add_page_break(doc)
    
    # ==================== 8. USER INTERFACE ====================
    add_heading_custom(doc, '8. USER INTERFACE', level=1)
    
    add_heading_custom(doc, '8.1 Landing Page', level=2)
    landing_text = """The landing page provides role selection for users to access their respective dashboards. Clean design with four role options presented as cards with descriptions."""
    p = doc.add_paragraph(landing_text)
    set_paragraph_format(p)
    
    doc.add_paragraph()
    p = doc.add_paragraph('Figure 1: Landing Page - Role Selection Interface')
    p.alignment = WD_ALIGN_PARAGRAPH.CENTER
    for run in p.runs:
        run.font.italic = True
        run.font.size = Pt(10)
    doc.add_paragraph()
    p = doc.add_paragraph('[INSERT: Landing page screenshot showing four role cards - Customer, Restaurant Owner, Delivery Partner, and Admin]')
    p.alignment = WD_ALIGN_PARAGRAPH.CENTER
    for run in p.runs:
        run.font.color.rgb = RGBColor(128, 128, 128)
        run.font.size = Pt(10)
    doc.add_paragraph()
    
    add_heading_custom(doc, '8.2 Customer Dashboard', level=2)
    customer_text = """The customer dashboard provides a comprehensive shopping experience with restaurant discovery, menu browsing, and order management capabilities.

Key Features:
• Restaurant listing with search and filters by cuisine type
• Detailed menu browsing with images and descriptions  
• Shopping cart with quantity adjustments
• Order placement workflow with address selection
• Real-time order tracking timeline
• Order history with reorder functionality
• Review submission after delivery completion"""
    p = doc.add_paragraph(customer_text)
    set_paragraph_format(p)
    
    doc.add_paragraph()
    p = doc.add_paragraph('Figure 2: Customer Dashboard - Restaurant Browsing')
    p.alignment = WD_ALIGN_PARAGRAPH.CENTER
    for run in p.runs:
        run.font.italic = True
        run.font.size = Pt(10)
    doc.add_paragraph()
    p = doc.add_paragraph('[INSERT: Customer dashboard screenshot showing restaurant cards with ratings, cuisine types, and "View Menu" buttons]')
    p.alignment = WD_ALIGN_PARAGRAPH.CENTER
    for run in p.runs:
        run.font.color.rgb = RGBColor(128, 128, 128)
        run.font.size = Pt(10)
    doc.add_paragraph()
    
    add_heading_custom(doc, '8.3 Restaurant Dashboard', level=2)
    rest_dash_text = """The restaurant owner dashboard enables efficient order management and business analytics.

Dashboard Components:
• Real-time incoming orders with status badges
• Order management controls (Accept/Reject buttons)
• Status progression buttons (Preparing, Ready for Pickup)
• Revenue and order statistics cards
• Restaurant performance metrics
• Order filtering by status
• Detailed order information including customer details and delivery address"""
    p = doc.add_paragraph(rest_dash_text)
    set_paragraph_format(p)
    
    doc.add_paragraph()
    p = doc.add_paragraph('Figure 3: Restaurant Dashboard - Order Management')
    p.alignment = WD_ALIGN_PARAGRAPH.CENTER
    for run in p.runs:
        run.font.italic = True
        run.font.size = Pt(10)
    doc.add_paragraph()
    p = doc.add_paragraph('[INSERT: Restaurant dashboard screenshot showing order cards with Accept/Reject buttons and status indicators]')
    p.alignment = WD_ALIGN_PARAGRAPH.CENTER
    for run in p.runs:
        run.font.color.rgb = RGBColor(128, 128, 128)
        run.font.size = Pt(10)
    doc.add_paragraph()
    
    add_heading_custom(doc, '8.4 Delivery Partner Dashboard', level=2)
    delivery_text = """The delivery partner dashboard optimizes the delivery workflow with clear order information and earnings tracking.

Interface Elements:
• Available orders list with pickup location
• Delivery destination with customer contact
• One-click order acceptance
• Active deliveries section
• Earnings calculator showing 10% delivery fee
• Delivery history and completion statistics
• Vehicle type and availability status"""
    p = doc.add_paragraph(delivery_text)
    set_paragraph_format(p)
    
    doc.add_paragraph()
    p = doc.add_paragraph('Figure 4: Delivery Partner Dashboard')
    p.alignment = WD_ALIGN_PARAGRAPH.CENTER
    for run in p.runs:
        run.font.italic = True
        run.font.size = Pt(10)
    doc.add_paragraph()
    p = doc.add_paragraph('[INSERT: Delivery partner dashboard screenshot showing available orders and earnings display]')
    p.alignment = WD_ALIGN_PARAGRAPH.CENTER
    for run in p.runs:
        run.font.color.rgb = RGBColor(128, 128, 128)
        run.font.size = Pt(10)
    doc.add_paragraph()
    
    add_heading_custom(doc, '8.5 Admin Dashboard', level=2)
    admin_text = """The admin dashboard provides system-wide visibility and analytics for monitoring platform performance.

Analytics and Monitoring:
• Key metrics cards (Total restaurants, orders, users)
• Revenue metrics with trend indicators
• Top-rated restaurants table with ratings
• Recent orders monitoring list
• System health indicators
• Order status distribution visualization
• User role distribution statistics
• Peak hour analysis"""
    p = doc.add_paragraph(admin_text)
    set_paragraph_format(p)
    
    doc.add_paragraph()
    p = doc.add_paragraph('Figure 5: Admin Dashboard - System Analytics')
    p.alignment = WD_ALIGN_PARAGRAPH.CENTER
    for run in p.runs:
        run.font.italic = True
        run.font.size = Pt(10)
    doc.add_paragraph()
    p = doc.add_paragraph('[INSERT: Admin dashboard screenshot showing metric cards and analytics tables]')
    p.alignment = WD_ALIGN_PARAGRAPH.CENTER
    for run in p.runs:
        run.font.color.rgb = RGBColor(128, 128, 128)
        run.font.size = Pt(10)
    
    add_page_break(doc)
    
    # Additional Database Screenshots Section
    add_heading_custom(doc, '8.6 Database Management Interfaces', level=2)
    
    dbeaver_section = """DBeaver Interface:
The DBeaver universal database tool provides a comprehensive view of the MySQL schema, showing all tables, relationships, and data. The ER diagram view visualizes the database structure with foreign key relationships clearly indicated."""
    p = doc.add_paragraph(dbeaver_section)
    set_paragraph_format(p)
    
    doc.add_paragraph()
    p = doc.add_paragraph('Figure 6: DBeaver - MySQL Database View')
    p.alignment = WD_ALIGN_PARAGRAPH.CENTER
    for run in p.runs:
        run.font.italic = True
        run.font.size = Pt(10)
    doc.add_paragraph()
    p = doc.add_paragraph('[INSERT: DBeaver screenshot showing tables list and data grid with order_items table]')
    p.alignment = WD_ALIGN_PARAGRAPH.CENTER
    for run in p.runs:
        run.font.color.rgb = RGBColor(128, 128, 128)
        run.font.size = Pt(10)
    doc.add_paragraph()
    
    compass_section = """MongoDB Compass Interface:
MongoDB Compass provides an intuitive GUI for exploring the menus collection, showing the nested document structure with categories and items. The aggregation pipeline builder enables visual construction of complex queries."""
    p = doc.add_paragraph(compass_section)
    set_paragraph_format(p)
    
    doc.add_paragraph()
    p = doc.add_paragraph('Figure 7: MongoDB Compass - Menus Collection')
    p.alignment = WD_ALIGN_PARAGRAPH.CENTER
    for run in p.runs:
        run.font.italic = True
        run.font.size = Pt(10)
    doc.add_paragraph()
    p = doc.add_paragraph('[INSERT: MongoDB Compass screenshot showing menu document with nested categories]')
    p.alignment = WD_ALIGN_PARAGRAPH.CENTER
    for run in p.runs:
        run.font.color.rgb = RGBColor(128, 128, 128)
        run.font.size = Pt(10)
    doc.add_paragraph()
    
    aws_section = """AWS RDS Console:
The AWS RDS dashboard displays the MySQL database instance configuration, monitoring metrics, backup settings, and connection details. It provides centralized management of the cloud-hosted database."""
    p = doc.add_paragraph(aws_section)
    set_paragraph_format(p)
    
    doc.add_paragraph()
    p = doc.add_paragraph('Figure 8: AWS RDS Console - Database Instance')
    p.alignment = WD_ALIGN_PARAGRAPH.CENTER
    for run in p.runs:
        run.font.italic = True
        run.font.size = Pt(10)
    doc.add_paragraph()
    p = doc.add_paragraph('[INSERT: AWS RDS console screenshot showing database instance details]')
    p.alignment = WD_ALIGN_PARAGRAPH.CENTER
    for run in p.runs:
        run.font.color.rgb = RGBColor(128, 128, 128)
        run.font.size = Pt(10)
    doc.add_paragraph()
    
    atlas_section = """MongoDB Atlas Console:
The MongoDB Atlas interface shows the cluster configuration, real-time metrics, backup schedules, and connection strings. The monitoring section displays query performance and database operations."""
    p = doc.add_paragraph(atlas_section)
    set_paragraph_format(p)
    
    doc.add_paragraph()
    p = doc.add_paragraph('Figure 9: MongoDB Atlas - Cluster Overview')
    p.alignment = WD_ALIGN_PARAGRAPH.CENTER
    for run in p.runs:
        run.font.italic = True
        run.font.size = Pt(10)
    doc.add_paragraph()
    p = doc.add_paragraph('[INSERT: MongoDB Atlas console screenshot showing cluster monitoring]')
    p.alignment = WD_ALIGN_PARAGRAPH.CENTER
    for run in p.runs:
        run.font.color.rgb = RGBColor(128, 128, 128)
        run.font.size = Pt(10)
    
    add_page_break(doc)
    
    # ==================== 9. CONCLUSION ====================
    add_heading_custom(doc, '9. CONCLUSION', level=1)
    
    conclusion_text = """The Food Delivery System successfully demonstrates the implementation of a modern hybrid database architecture that leverages both relational and NoSQL databases for optimal performance and flexibility. The project showcases comprehensive understanding of database management concepts including normalization, ACID properties, triggers, stored procedures, views, and aggregation pipelines.

Key Achievements:
The system implements a fully functional food delivery platform with 43+ RESTful API endpoints, supporting four distinct user roles with comprehensive dashboards. The hybrid architecture using MySQL for transactional integrity and MongoDB for flexible document storage provides an excellent example of choosing the right database for specific use cases.

Technical Implementation:
Advanced SQL concepts including triggers for automated actions, stored procedures for business logic encapsulation, and views for data abstraction are properly implemented. MongoDB aggregation pipelines enable complex analytical queries, while proper indexing ensures optimal query performance.

Learning Outcomes:
This project provides practical experience with full-stack development, database design principles, cloud database services (AWS RDS, MongoDB Atlas), API development, and modern frontend frameworks. It demonstrates how theoretical database concepts translate into real-world applications.

Future Enhancements:
Potential improvements include implementing JWT authentication, adding WebSocket for real-time updates, integrating payment gateways, implementing caching with Redis, and deploying to cloud platforms for production use.

The Food Delivery System serves as an excellent portfolio project demonstrating proficiency in database management, full-stack development, and system architecture design."""
    
    p = doc.add_paragraph(conclusion_text)
    set_paragraph_format(p)
    
    # ==================== 10. REFERENCES ====================
    add_heading_custom(doc, '10. REFERENCES', level=1)
    
    references = [
        'MySQL 8.0 Reference Manual - https://dev.mysql.com/doc/',
        'MongoDB Documentation - https://docs.mongodb.com/',
        'Express.js Guide - https://expressjs.com/en/guide/routing.html',
        'React Documentation - https://react.dev/',
        'AWS RDS Documentation - https://docs.aws.amazon.com/rds/',
        'MongoDB Atlas Documentation - https://www.mongodb.com/docs/atlas/',
        'Material-UI Component Library - https://mui.com/',
        'Node.js API Documentation - https://nodejs.org/api/',
        'RESTful API Design Best Practices - https://restfulapi.net/',
        'Database Normalization Theory - Academic Database Management Textbooks'
    ]
    
    for i, ref in enumerate(references, 1):
        p = doc.add_paragraph(f'{i}. {ref}')
        set_paragraph_format(p, space_after=Pt(6))
    
    # Save the document
    doc.save('Food_Delivery_System_Project_Report.docx')
    print("Report created successfully: Food_Delivery_System_Project_Report.docx")

if __name__ == '__main__':
    create_report()
