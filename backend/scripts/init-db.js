const db = require("../config/database")

console.log("Initializing database...")

db.serialize(() => {
  console.log("Creating tables...")

  // Users table
  db.run(
    `
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      email TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `,
    (err) => {
      if (err) {
        console.error("Error creating users table:", err)
      } else {
        console.log("Users table created successfully")
      }
    },
  )

  // Tasks table
  db.run(
    `
    CREATE TABLE IF NOT EXISTS tasks (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      description TEXT,
      completed BOOLEAN DEFAULT 0,
      user_id INTEGER NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
    )
  `,
    (err) => {
      if (err) {
        console.error("Error creating tasks table:", err)
      } else {
        console.log("Tasks table created successfully")
      }
    },
  )
})

db.close((err) => {
  if (err) {
    console.error("Error closing database:", err)
  } else {
    console.log("Database initialization complete")
  }
})
