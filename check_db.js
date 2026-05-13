import pool from "./server/db.js";

async function checkDB() {
  try {
    const [tables] = await pool.query("SHOW TABLES");
    console.log("Current Tables:", JSON.stringify(tables));
    process.exit(0);
  } catch (err) {
    console.error("CHECK ERROR:", err);
    process.exit(1);
  }
}

checkDB();
