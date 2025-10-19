const mysql = require('mysql2/promise');

async function run() {
  const conn = await mysql.createConnection({
    host: 'localhost',
    port: 3307,
    user: 'root',
    password: '',
    database: 'heartguard'
  });
  
  const sql = `
    CREATE TABLE weekly_challenges (
      id varchar(36) NOT NULL,
      title text NOT NULL,
      description text NOT NULL,
      category enum('diet','exercise','medication','sleep','stress','other') NOT NULL,
      difficulty enum('beginner','intermediate','advanced') NOT NULL,
      points int NOT NULL,
      duration_days int NOT NULL,
      start_date datetime NOT NULL,
      end_date datetime NOT NULL,
      is_active boolean NOT NULL DEFAULT true,
      created_at datetime NOT NULL,
      CONSTRAINT weekly_challenges_id PRIMARY KEY(id)
    );
  `;
  
  await conn.query(sql);
  console.log('weekly_challenges table created');
  await conn.end();
}

run().catch(console.error);