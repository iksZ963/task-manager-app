const express = require("express")
const cors = require("cors")
const dotenv = require("dotenv")
const authRoutes = require("./routes/auth")
const taskRoutes = require("./routes/tasks")

dotenv.config()

const app = express()
const PORT = process.env.PORT || 5000

// Middleware
app.use(
  cors({
    origin: process.env.FRONTEND_URL || "http://localhost:3000",
    credentials: true,
  }),
)
app.use(express.json())

// Routes
app.use("/api/auth", authRoutes)
app.use("/api/tasks", taskRoutes)

// Health check
app.get("/api/health", (req, res) => {
  res.json({ message: "Task Manager API is running!" })
})

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})
