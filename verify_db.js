import pool from "./server/db.js";

async function verifyTables() {
  try {
    const [tables] = await pool.query("SHOW TABLES");
    console.log("TABLES FOUND:", tables.map(t => Object.values(t)[0]));
    
    const [discussions] = await pool.query("DESCRIBE public_discussions");
    console.log("public_discussions schema verified");
    
    const [comments] = await pool.query("DESCRIBE discussion_comments");
    console.log("discussion_comments schema verified");
    
    await pool.end();
    process.exit(0);
  } catch (err) {
    console.error("VERIFICATION ERROR:", err.message);
    // If table doesn't exist, try to create it here
    try {
        console.log("Attempting to create tables...");
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
        console.log("Tables created successfully!");
        await pool.end();
        process.exit(0);
    } catch (createErr) {
        console.error("CREATE ERROR:", createErr.message);
        await pool.end();
        process.exit(1);
    }
  }
}

verifyTables();
