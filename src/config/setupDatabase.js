const mysql = require("mysql2/promise");
require("dotenv").config();

const setupDatabase = async () => {
  let connection;

  try {
    connection = await mysql.createConnection({
      host: process.env.DB_HOST || "localhost",
      port: process.env.DB_PORT || 3306,
      user: process.env.DB_USER || "root",
      password: process.env.DB_PASSWORD || "",
      database: process.env.DB_NAME
    });

    const dbName = process.env.DB_NAME || "school_management";

    /*
    await connection.query(
      `CREATE DATABASE IF NOT EXISTS \`${dbName}\` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci`
    );
    */
    console.log(`Database '${dbName}' created or already exists`);

    
 //   await connection.query(`USE \`${dbName}\``);

    
    await connection.query(`
      CREATE TABLE IF NOT EXISTS schools (
        id          INT           NOT NULL AUTO_INCREMENT,
        name        VARCHAR(255)  NOT NULL,
        address     VARCHAR(500)  NOT NULL,
        latitude    FLOAT(10, 6)  NOT NULL,
        longitude   FLOAT(10, 6)  NOT NULL,
        created_at  TIMESTAMP     DEFAULT CURRENT_TIMESTAMP,
        updated_at  TIMESTAMP     DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        PRIMARY KEY (id),
        INDEX idx_lat_lng (latitude, longitude)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);
    console.log("Table 'schools' created or already exists");

    
    const [existing] = await connection.query(
      "SELECT COUNT(*) AS count FROM schools"
    );
    if (existing[0].count === 0) {
      await connection.query(`
        INSERT INTO schools (name, address, latitude, longitude) VALUES
        ('Delhi Public School', 'Mathura Road, New Delhi, Delhi 110022', 28.5672, 77.2100),
        ('Ryan International School', 'Sector 31, Gurugram, Haryana 122001', 28.4595, 77.0266),
        ('St. Xavier School', 'Park Street, Kolkata, West Bengal 700016', 22.5520, 88.3503),
        ('Kendriya Vidyalaya', 'Sector 8, RK Puram, New Delhi 110022', 28.5672, 77.1855),
        ('The Doon School', 'Mall Road, Dehradun, Uttarakhand 248001', 30.3165, 78.0322),
        ('Cathedral and John Connon School', 'Mahatma Gandhi Road, Mumbai 400001', 18.9318, 72.8354),
        ('Bishop Cotton School', 'Shimla, Himachal Pradesh 171002', 31.1048, 77.1734),
        ('Mayo College', 'Mayo Link Road, Ajmer, Rajasthan 305001', 26.4499, 74.6399)
      `);
      console.log("Sample school data inserted");
    }

    console.log("\n Database setup complete! You can now start the server.");
  } catch (err) {
    console.error("Setup failed:", err.message);
    process.exit(1);
  } finally {
    if (connection) await connection.end();
  }
};

setupDatabase();