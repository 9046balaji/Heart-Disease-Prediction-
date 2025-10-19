import { createConnection } from 'mysql2/promise';
import { readFileSync, readdirSync } from 'fs';
import { resolve, join } from 'path';

// MySQL connection configuration for XAMPP
const MYSQL_CONFIG = {
  host: 'localhost',
  port: 3307,
  user: 'root',
  password: '', // Default XAMPP password is empty
};

const DATABASE_NAME = 'heartguard';

// Function to safely execute SQL statements and ignore specific errors
async function safeExecute(connection: any, sql: string, ignoreErrors: string[] = []) {
  try {
    await connection.query(sql);
    return true;
  } catch (error) {
    const errorMessage = (error as any).message;
    for (const ignoreError of ignoreErrors) {
      if (errorMessage.includes(ignoreError)) {
        console.log(`Ignoring error: ${ignoreError}`);
        return false;
      }
    }
    throw error;
  }
}

// Function to extract UP section from a migration file
function extractUpSection(sql: string): string {
  // Find the UP section
  const upStart = sql.indexOf('-- UP:');
  const downStart = sql.indexOf('-- DOWN:');
  
  if (upStart === -1) {
    // No UP section found, return the entire SQL
    return sql;
  }
  
  let end = sql.length;
  if (downStart !== -1 && downStart > upStart) {
    end = downStart;
  }
  
  return sql.substring(upStart, end);
}

async function initDatabase() {
  console.log("Initializing MySQL database...");
  
  let connection;
  
  try {
    // Connect to MySQL server without specifying a database
    console.log("Connecting to MySQL server...");
    connection = await createConnection(MYSQL_CONFIG);
    
    // Create the database if it doesn't exist
    console.log(`Creating database '${DATABASE_NAME}' if it doesn't exist...`);
    await connection.query(`CREATE DATABASE IF NOT EXISTS ${DATABASE_NAME}`);
    
    // Use the database
    console.log(`Using database '${DATABASE_NAME}'...`);
    await connection.query(`USE ${DATABASE_NAME}`);
    
    // Get all migration files sorted by name
    const migrationsDir = resolve('../migrations');
    const migrationFiles = readdirSync(migrationsDir)
      .filter(file => file.endsWith('.sql'))
      .sort();
    
    console.log(`Found ${migrationFiles.length} migration files`);
    
    // Run each migration
    for (const file of migrationFiles) {
      console.log(`Running migration: ${file}`);
      
      try {
        const sql = readFileSync(join(migrationsDir, file), 'utf8');
        
        // Extract only the UP section for migration files that have it
        const upSql = extractUpSection(sql);
        
        // Split the SQL into statements
        const statements = upSql.split(';').map(stmt => stmt.trim()).filter(stmt => stmt.length > 0);
        
        for (const statement of statements) {
          if (statement.trim()) {
            // Skip comments
            if (!statement.startsWith('--') && !statement.startsWith('/*')) {
              await safeExecute(connection, statement, [
                'already exists', 
                'Duplicate column name', 
                'Duplicate entry', 
                'Duplicate key name',
                'Duplicate foreign key constraint name'
              ]);
            }
          }
        }
        
        console.log(`Migration ${file} completed successfully`);
      } catch (error) {
        console.error(`Error running migration ${file}:`, error);
        throw error;
      }
    }
    
    // Run seed data
    console.log("Seeding initial data...");
    try {
      const seedSql = readFileSync(resolve('../scripts/seed.sql'), 'utf8');
      const seedStatements = seedSql.split(';').map(stmt => stmt.trim()).filter(stmt => stmt.length > 0);
      
      for (const statement of seedStatements) {
        if (statement.trim()) {
          // Skip comments
          if (!statement.startsWith('--') && !statement.startsWith('/*')) {
            await safeExecute(connection, statement, [
              'Duplicate entry'
            ]);
          }
        }
      }
      
      console.log("Seeding completed successfully!");
    } catch (error) {
      console.error("Error seeding data:", error);
    }
    
    console.log("Database initialized successfully!");
  } catch (error) {
    console.error("Error initializing database:", error);
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

// Run the initialization
initDatabase();