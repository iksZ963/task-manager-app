const express = require("express")
const db = require("../config/database")
const { authenticateToken } = require("../middleware/auth")

const router = express.Router()

// Get all tasks for authenticated user
router.get("/", authenticateToken, (req, res) => {
  const userId = req.user.userId

  db.all("SELECT * FROM tasks WHERE user_id = ? ORDER BY created_at DESC", [userId], (err, tasks) => {
    if (err) {
      return res.status(500).json({ error: "Failed to fetch tasks" })
    }
    res.json(tasks)
  })
})

// Create new task
router.post("/", authenticateToken, (req, res) => {
  const { title, description } = req.body
  const userId = req.user.userId

  if (!title) {
    return res.status(400).json({ error: "Title is required" })
  }

  db.run(
    "INSERT INTO tasks (title, description, user_id) VALUES (?, ?, ?)",
    [title, description || "", userId],
    function (err) {
      if (err) {
        return res.status(500).json({ error: "Failed to create task" })
      }

      db.get("SELECT * FROM tasks WHERE id = ?", [this.lastID], (err, task) => {
        if (err) {
          return res.status(500).json({ error: "Failed to fetch created task" })
        }
        res.status(201).json(task)
      })
    },
  )
})

// Update task
router.put("/:id", authenticateToken, (req, res) => {
  const taskId = req.params.id
  const userId = req.user.userId
  const { title, description, completed } = req.body

  db.run(
    "UPDATE tasks SET title = ?, description = ?, completed = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ? AND user_id = ?",
    [title, description, completed ? 1 : 0, taskId, userId],
    function (err) {
      if (err) {
        return res.status(500).json({ error: "Failed to update task" })
      }

      if (this.changes === 0) {
        return res.status(404).json({ error: "Task not found" })
      }

      db.get("SELECT * FROM tasks WHERE id = ?", [taskId], (err, task) => {
        if (err) {
          return res.status(500).json({ error: "Failed to fetch updated task" })
        }
        res.json(task)
      })
    },
  )
})

// Delete task
router.delete("/:id", authenticateToken, (req, res) => {
  const taskId = req.params.id
  const userId = req.user.userId

  db.run("DELETE FROM tasks WHERE id = ? AND user_id = ?", [taskId, userId], function (err) {
    if (err) {
      return res.status(500).json({ error: "Failed to delete task" })
    }

    if (this.changes === 0) {
      return res.status(404).json({ error: "Task not found" })
    }

    res.json({ message: "Task deleted successfully" })
  })
})

module.exports = router
