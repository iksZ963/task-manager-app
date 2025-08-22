const express = require("express")
const bcrypt = require("bcryptjs")
const jwt = require("jsonwebtoken")
const db = require("../config/database")

const router = express.Router()

// Register
router.post("/register", async (req, res) => {
  try {
    const { name, email, password } = req.body

    if (!name || !email || !password) {
      return res.status(400).json({ error: "All fields are required" })
    }

    // Check if user exists
    db.get("SELECT * FROM users WHERE email = ?", [email], async (err, user) => {
      if (err) {
        return res.status(500).json({ error: "Database error" })
      }

      if (user) {
        return res.status(400).json({ error: "User already exists" })
      }

      // Hash password
      const hashedPassword = await bcrypt.hash(password, 10)

      // Create user
      db.run(
        "INSERT INTO users (name, email, password) VALUES (?, ?, ?)",
        [name, email, hashedPassword],
        function (err) {
          if (err) {
            return res.status(500).json({ error: "Failed to create user" })
          }

          const token = jwt.sign({ userId: this.lastID, email }, process.env.JWT_SECRET || "your-secret-key", {
            expiresIn: "24h",
          })

          res.status(201).json({
            message: "User created successfully",
            token,
            user: { id: this.lastID, name, email },
          })
        },
      )
    })
  } catch (error) {
    res.status(500).json({ error: "Server error" })
  }
})

// Login
router.post("/login", (req, res) => {
  try {
    const { email, password } = req.body

    if (!email || !password) {
      return res.status(400).json({ error: "Email and password are required" })
    }

    db.get("SELECT * FROM users WHERE email = ?", [email], async (err, user) => {
      if (err) {
        return res.status(500).json({ error: "Database error" })
      }

      if (!user) {
        return res.status(400).json({ error: "Invalid credentials" })
      }

      const isValidPassword = await bcrypt.compare(password, user.password)
      if (!isValidPassword) {
        return res.status(400).json({ error: "Invalid credentials" })
      }

      const token = jwt.sign({ userId: user.id, email: user.email }, process.env.JWT_SECRET || "your-secret-key", {
        expiresIn: "24h",
      })

      res.json({
        message: "Login successful",
        token,
        user: { id: user.id, name: user.name, email: user.email },
      })
    })
  } catch (error) {
    res.status(500).json({ error: "Server error" })
  }
})

module.exports = router
