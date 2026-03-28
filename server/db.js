import mysql from "mysql2/promise";

const pool=mysql.createPool({
    host:"localhost",
    user:"root",
    password:"935377",
    database:"scolarapp",
});


const [dbName] = await pool.query("SELECT DATABASE()");
console.log("Current DB:", dbName);

export default pool;