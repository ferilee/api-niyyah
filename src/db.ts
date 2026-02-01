import { Database } from "bun:sqlite";

const db = new Database("users.db", { create: true });

// Initialize database
db.run(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    nama TEXT NOT NULL,
    jenis_kelamin TEXT NOT NULL,
    username TEXT UNIQUE,
    password TEXT
  )
`);

// Migrations for existing database
try {
  db.run("ALTER TABLE users ADD COLUMN username TEXT");
} catch (e) { }
try {
  db.run("CREATE UNIQUE INDEX IF NOT EXISTS idx_users_username ON users(username)");
} catch (e) { }
try {
  db.run("ALTER TABLE users ADD COLUMN password TEXT");
} catch (e) { }
try {
  db.run("ALTER TABLE users ADD COLUMN stats TEXT");
} catch (e) { }

export default db;
