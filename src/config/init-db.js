import pool from "./database.js"

async function initDatabase() {
  try {
    const connection = await pool.getConnection()

    // Create database if not exists
    await connection.query("CREATE DATABASE IF NOT EXISTS noble_corner_ledger")
    await connection.query("USE noble_corner_ledger")

    // Create users table
    await connection.query(`
      CREATE TABLE IF NOT EXISTS users (
        id INT AUTO_INCREMENT PRIMARY KEY,
        email VARCHAR(255) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `)

    // Create vendors table
    await connection.query(`
      CREATE TABLE IF NOT EXISTS vendors (
        id INT AUTO_INCREMENT PRIMARY KEY,
        company_name VARCHAR(255) NOT NULL,
        supplier_name VARCHAR(255) NOT NULL,
        contact_number VARCHAR(20),
        bank_details TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `)

    // Create ledgers table
    await connection.query(`
      CREATE TABLE IF NOT EXISTS ledgers (
        id INT AUTO_INCREMENT PRIMARY KEY,
        vendor_id INT,
        date DATE NOT NULL,
        challan_no VARCHAR(255),
        description TEXT,
        quantity INT,
        debit DECIMAL(10, 2),
        credit DECIMAL(10, 2),
        payment_method ENUM('cash', 'cheque') NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (vendor_id) REFERENCES vendors(id)
      )
    `)

    console.log("Database and tables created successfully")
    connection.release()
  } catch (error) {
    console.error("Error initializing database:", error)
  }
}

initDatabase()

