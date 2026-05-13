import pool from "./server/db.js";

const setupDB = async () => {
  try {
    // Create comments table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS comments (
        id INT AUTO_INCREMENT PRIMARY KEY,
        post_id INT NOT NULL,
        user_id INT NOT NULL,
        content TEXT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (post_id) REFERENCES posts(post_id) ON DELETE CASCADE,
        FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE
      )
    `);

    // Create comment replies table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS comment_replies (
        id INT AUTO_INCREMENT PRIMARY KEY,
        comment_id INT NOT NULL,
        user_id INT NOT NULL,
        content TEXT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (comment_id) REFERENCES comments(id) ON DELETE CASCADE,
        FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE
      )
    `);

    // Add vote_type column to votes table (upvote or downvote)
    const checkColumn = await pool.query(`
      SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS 
      WHERE TABLE_NAME='votes' AND COLUMN_NAME='vote_type'
    `);

    if (checkColumn[0].length === 0) {
      await pool.query(`
        ALTER TABLE votes ADD COLUMN vote_type ENUM('upvote', 'downvote') DEFAULT 'upvote'
      `);
    }

    console.log("✅ Database tables created/updated successfully!");
  } catch (error) {
    console.error("❌ Database setup error:", error.message);
  }
};

setupDB();
