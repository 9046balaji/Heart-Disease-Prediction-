import { createConnection } from 'mysql2/promise';
import { readFileSync } from 'fs';
import { resolve } from 'path';

// MySQL connection configuration for XAMPP
const DATABASE_CONFIG = {
  host: 'localhost',
  port: 3307,
  user: 'root',
  password: '',
  database: 'heartguard',
};

async function createMissingTables() {
  console.log("Connecting to MySQL database...");
  
  let connection;
  
  try {
    connection = await createConnection(DATABASE_CONFIG);
    console.log("Connected to MySQL database successfully!");
    
    // Read the SQL file
    console.log("Reading SQL file...");
    const sql = readFileSync(resolve('./migrations/004_add_missing_tables.sql'), 'utf8');
    
    // Split the SQL into individual statements
    const statements = sql.split(';').filter(stmt => stmt.trim() !== '');
    
    console.log(`Executing ${statements.length} SQL statements...`);
    
    // Execute each statement
    for (const statement of statements) {
      if (statement.trim() !== '') {
        try {
          await connection.query(statement);
          console.log("Statement executed successfully");
        } catch (error: any) {
          if (error.code === 'ER_TABLE_EXISTS_ERROR') {
            console.log("Table already exists, skipping...");
          } else {
            console.error("Error executing statement:", error);
            throw error;
          }
        }
      }
    }
    
    console.log("All missing tables created successfully!");
  } catch (error) {
    console.error("Error creating missing tables:", error);
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

// Run the function
createMissingTables();