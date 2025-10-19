const mysql = require('mysql2/promise');
const fs = require('fs');

async function run() {
  const conn = await mysql.createConnection({
    host: 'localhost',
    port: 3307,
    user: 'root',
    password: '',
    database: 'heartguard'
  });
  
  try {
    // Read the SQL file
    const sql = fs.readFileSync('./migrations/011_create_portion_guidelines_table.sql', 'utf8');
    
    // Split the SQL into individual statements
    const statements = sql.split(';').filter(stmt => stmt.trim() !== '');
    
    console.log(`Executing ${statements.length} SQL statements...`);
    
    // Execute each statement
    for (const statement of statements) {
      if (statement.trim() !== '') {
        try {
          await conn.query(statement);
          console.log("Statement executed successfully");
        } catch (error) {
          if (error.code === 'ER_TABLE_EXISTS_ERROR') {
            console.log("Table already exists, skipping...");
          } else {
            console.error("Error executing statement:", error.message);
          }
        }
      }
    }
    
    console.log("Portion guidelines table created successfully!");
  } catch (error) {
    console.error("Error creating portion guidelines table:", error);
  } finally {
    await conn.end();
  }
}

run().catch(console.error);