// A quick way to see exactly what's in the database — no need to open
// MAMP's phpMyAdmin just to check what's stored.
//
// Run it with: npm run db:inspect
require("dotenv").config({ path: ".env.local" });
const mysql = require("mysql2/promise");

async function main() {
  const conn = await mysql.createConnection({
    host: process.env.MYSQL_HOST || "127.0.0.1",
    port: Number(process.env.MYSQL_PORT) || 3306,
    user: process.env.MYSQL_USER || "root",
    password: process.env.MYSQL_PASSWORD || "",
    database: process.env.MYSQL_DATABASE || "nextjs_notes_demo",
  });

  const [rows] = await conn.query("SELECT * FROM notes ORDER BY id");
  console.table(rows);

  await conn.end();
}

main().catch((err) => {
  console.error("Could not inspect the database:", err.message);
  process.exit(1);
});
