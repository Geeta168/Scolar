import pool from "./server/db.js";

async function setupDiscussions() {
  try {
    // 1. Create public_discussions table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS public_discussions (
        discussion_id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT NOT NULL,
        content TEXT NOT NULL,
        is_anonymous BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(user_id)
      );
    `);
    console.log("public_discussions table ensured!");

    // 2. Create discussion_comments table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS discussion_comments (
        comment_id INT AUTO_INCREMENT PRIMARY KEY,
        discussion_id INT NOT NULL,
        user_id INT NOT NULL,
        content TEXT NOT NULL,
        is_anonymous BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (discussion_id) REFERENCES public_discussions(discussion_id) ON DELETE CASCADE,
        FOREIGN KEY (user_id) REFERENCES users(user_id)
      );
    `);
    console.log("discussion_comments table ensured!");

    process.exit(0);
  } catch (err) {
    console.error("DATABASE SETUP ERROR:", err);
    process.exit(1);
  }
}

setupDiscussions();
