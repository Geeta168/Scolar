import pool from "./server/db.js";

async function fixDB() {
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS guidance_chats (
        id INT AUTO_INCREMENT PRIMARY KEY,
        post_id INT NOT NULL,
        user_id INT NOT NULL,
        role ENUM('user', 'ai') NOT NULL,
        message TEXT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(user_id)
      );
    `);
    console.log("guidance_chats table ensured!");
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

fixDB();
