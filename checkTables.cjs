const mysql = require('mysql2/promise');

async function run() {
  const conn = await mysql.createConnection({
    host: 'localhost',
    port: 3307,
    user: 'root',
    password: '',
    database: 'heartguard'
  });
  
  try {
    const [rows] = await conn.query('SHOW TABLES LIKE "portion_guidelines"');
    if (rows.length > 0) {
      console.log('portion_guidelines table exists');
    } else {
      console.log('portion_guidelines table does not exist');
    }
  } catch (e) {
    console.log('Error:', e.message);
  }
  
  await conn.end();
}

run().catch(console.error);