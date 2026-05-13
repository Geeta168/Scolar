import pool from "./server/db.js";

async function queryPosts() {
  try {
    const [rows, fields] = await pool.query("SELECT * FROM posts LIMIT 1");
    if (fields) {
      console.log(fields.map(f => f.name));
    }
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

queryPosts();
