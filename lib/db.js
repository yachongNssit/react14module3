import mysql from "mysql2/promise";

// OBJECTIVE: Connecting Next.js to a database (MongoDB, MySQL)
//
// This is the ONLY file that's different from Module 10's app — every
// route, page, and component that imports getAllNotes/createNote/
// updateNote/deleteNote keeps working unchanged. Module 10 connected
// to SQLite (a local file); this connects to a real MySQL server
// instead (tested against MAMP).
//
// Every function below is async, and every call site needs `await` —
// unlike SQLite's synchronous driver. MySQL is a separate server
// process, reached over the network (even "localhost" is a real round
// trip), so the code has to wait on real I/O.

const DB_HOST = process.env.MYSQL_HOST || "127.0.0.1";
const DB_PORT = Number(process.env.MYSQL_PORT) || 3306;
const DB_USER = process.env.MYSQL_USER || "root";
const DB_PASSWORD = process.env.MYSQL_PASSWORD || "";
const DB_NAME = process.env.MYSQL_DATABASE || "nextjs_notes_demo";

// Cloud MySQL providers (TiDB Cloud, PlanetScale, AWS RDS, etc.) require
// TLS on their public endpoint — MAMP's local MySQL doesn't use it at
// all. Toggled by an env var rather than hardcoded, so the same file
// works against either without editing code, only .env.local.
const USE_SSL = process.env.MYSQL_SSL === "true";
const sslOption = USE_SSL
  ? { ssl: { minVersion: "TLSv1.2", rejectUnauthorized: true } }
  : {};

let pool;
function getPool() {
  if (!pool) {
    pool = mysql.createPool({
      host: DB_HOST,
      port: DB_PORT,
      user: DB_USER,
      password: DB_PASSWORD,
      database: DB_NAME,
      waitForConnections: true,
      connectionLimit: 5,
      ...sslOption,
    });
  }
  return pool;
}

let initPromise = null;
function ready() {
  if (!initPromise) initPromise = init();
  return initPromise;
}

async function init() {
  // A fresh MAMP/MySQL install won't have this database yet — connect
  // without selecting one first, and create it if missing. (On TiDB
  // Cloud the database already exists, created via the console — this
  // step is a harmless no-op there, as long as the user has CREATE
  // privileges; if it doesn't, see the troubleshooting note below.)
  const bootstrap = await mysql.createConnection({
    host: DB_HOST,
    port: DB_PORT,
    user: DB_USER,
    password: DB_PASSWORD,
    ...sslOption,
  });
  await bootstrap.query(`CREATE DATABASE IF NOT EXISTS \`${DB_NAME}\``);
  await bootstrap.end();

  const p = getPool();
  await p.query(`
    CREATE TABLE IF NOT EXISTS notes (
      id   INT AUTO_INCREMENT PRIMARY KEY,
      text VARCHAR(200) NOT NULL
    )
  `);

  const [[{ count }]] = await p.query("SELECT COUNT(*) AS count FROM notes");
  if (count === 0) {
    await p.query(
      "INSERT INTO notes (text) VALUES (?), (?)",
      ["Review Module 11 slides", "Try triggering a validation error below"]
    );
  }
}

function rowToNote(row) {
  return { id: String(row.id), text: row.text };
}

export async function getAllNotes() {
  await ready();
  const [rows] = await getPool().query("SELECT * FROM notes ORDER BY id");
  return rows.map(rowToNote);
}

export async function createNote(text) {
  await ready();
  const p = getPool();
  const [result] = await p.query("INSERT INTO notes (text) VALUES (?)", [text]);
  const [rows] = await p.query("SELECT * FROM notes WHERE id = ?", [result.insertId]);
  return rowToNote(rows[0]);
}

export async function updateNote(id, text) {
  await ready();
  const p = getPool();
  const numericId = Number(id);
  const [existingRows] = await p.query("SELECT * FROM notes WHERE id = ?", [numericId]);
  if (existingRows.length === 0) return null;
  await p.query("UPDATE notes SET text = ? WHERE id = ?", [text, numericId]);
  return rowToNote({ id: numericId, text });
}

export async function deleteNote(id) {
  await ready();
  const p = getPool();
  const [result] = await p.query("DELETE FROM notes WHERE id = ?", [Number(id)]);
  return result.affectedRows > 0;
}

// Used by tests / the CLI inspect script to close the connection pool
// cleanly, so nothing hangs waiting on an open connection.
export async function closePool() {
  if (pool) {
    await pool.end();
    pool = undefined;
  }
}
