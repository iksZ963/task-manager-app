"use client"

import { useAuth } from "@/contexts/AuthContext"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Plus, CheckSquare, ArrowLeft, Filter, Search } from "lucide-react"
import { Input } from "@/components/ui/input"
import TaskModal from "@/components/TaskModal"
import TaskItem from "@/components/TaskItem"
import Link from "next/link"

interface Task {
  id: number
  title: string
  description: string
  completed: boolean
  created_at: string
  updated_at: string
}

type FilterType = "all" | "pending" | "completed"

export default function TasksPage() {
  const { user, token } = useAuth()
  const router = useRouter()
  const [tasks, setTasks] = useState<Task[]>([])
  const [filteredTasks, setFilteredTasks] = useState<Task[]>([])
  const [loading, setLoading] = useState(true)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingTask, setEditingTask] = useState<Task | null>(null)
  const [modalMode, setModalMode] = useState<"create" | "edit">("create")
  const [filter, setFilter] = useState<FilterType>("all")
  const [searchQuery, setSearchQuery] = useState("")

  const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api"

  useEffect(() => {
    if (!user) {
      router.push("/")
      return
    }
    fetchTasks()
  }, [user, router])

  useEffect(() => {
    let filtered = tasks

    // Apply filter
    if (filter === "completed") {
      filtered = filtered.filter((task) => task.completed)
    } else if (filter === "pending") {
      filtered = filtered.filter((task) => !task.completed)
    }

    // Apply search
    if (searchQuery.trim()) {
      filtered = filtered.filter(
        (task) =>
          task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          task.description.toLowerCase().includes(searchQuery.toLowerCase()),
      )
    }

    setFilteredTasks(filtered)
  }, [tasks, filter, searchQuery])

  const fetchTasks = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/tasks`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (response.ok) {
        const data = await response.json()
        setTasks(data)
      }
    } catch (error) {
      console.error("Failed to fetch tasks:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleCreateTask = () => {
    setEditingTask(null)
    setModalMode("create")
    setIsModalOpen(true)
  }

  const handleEditTask = (task: Task) => {
    setEditingTask(task)
    setModalMode("edit")
    setIsModalOpen(true)
  }

  const handleSaveTask = async (taskData: Task) => {
    try {
      if (modalMode === "create") {
        const response = await fetch(`${API_BASE_URL}/tasks`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            title: taskData.title,
            description: taskData.description,
          }),
        })

        if (!response.ok) {
          const error = await response.json()
          throw new Error(error.error || "Failed to create task")
        }

        const newTask = await response.json()
        setTasks((prev) => [newTask, ...prev])
      } else {
        const response = await fetch(`${API_BASE_URL}/tasks/${taskData.id}`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            title: taskData.title,
            description: taskData.description,
            completed: taskData.completed,
          }),
        })

        if (!response.ok) {
          const error = await response.json()
          throw new Error(error.error || "Failed to update task")
        }

        const updatedTask = await response.json()
        setTasks((prev) => prev.map((task) => (task.id === updatedTask.id ? updatedTask : task)))
      }
    } catch (error) {
      throw error
    }
  }

  const handleToggleComplete = async (taskId: number, completed: boolean) => {
    try {
      const task = tasks.find((t) => t.id === taskId)
      if (!task) return

      const response = await fetch(`${API_BASE_URL}/tasks/${taskId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          title: task.title,
          description: task.description,
          completed,
        }),
      })

      if (!response.ok) {
        throw new Error("Failed to update task")
      }

      const updatedTask = await response.json()
      setTasks((prev) => prev.map((task) => (task.id === updatedTask.id ? updatedTask : task)))
    } catch (error) {
      console.error("Failed to toggle task:", error)
    }
  }

  const handleDeleteTask = async (taskId: number) => {
    try {
      const response = await fetch(`${API_BASE_URL}/tasks/${taskId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (!response.ok) {
        throw new Error("Failed to delete task")
      }

      setTasks((prev) => prev.filter((task) => task.id !== taskId))
    } catch (error) {
      console.error("Failed to delete task:", error)
    }
  }

  if (!user) {
    return null
  }

  const completedTasks = tasks.filter((task) => task.completed).length
  const pendingTasks = tasks.filter((task) => !task.completed).length

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between py-4">
            <div className="flex items-center gap-4">
              <Link href="/dashboard">
                <Button variant="ghost" size="sm" className="flex items-center gap-2">
                  <ArrowLeft className="w-4 h-4" />
                  Back to Dashboard
                </Button>
              </Link>
              <div className="flex items-center gap-3">
                <CheckSquare className="w-8 h-8 text-accent" />
                <h1 className="text-2xl font-bold font-sans text-foreground">All Tasks</h1>
              </div>
            </div>
            <Button onClick={handleCreateTask} className="bg-accent hover:bg-accent/90">
              <Plus className="w-4 h-4 mr-2" />
              Add Task
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Search and Filter */}
        <div className="flex flex-col sm:flex-row gap-4 mb-8">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search tasks..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-muted-foreground" />
            <div className="flex gap-2">
              <Button
                variant={filter === "all" ? "default" : "outline"}
                size="sm"
                onClick={() => setFilter("all")}
                className={filter === "all" ? "bg-accent hover:bg-accent/90" : "bg-transparent"}
              >
                All ({tasks.length})
              </Button>
              <Button
                variant={filter === "pending" ? "default" : "outline"}
                size="sm"
                onClick={() => setFilter("pending")}
                className={filter === "pending" ? "bg-accent hover:bg-accent/90" : "bg-transparent"}
              >
                Pending ({pendingTasks})
              </Button>
              <Button
                variant={filter === "completed" ? "default" : "outline"}
                size="sm"
                onClick={() => setFilter("completed")}
                className={filter === "completed" ? "bg-accent hover:bg-accent/90" : "bg-transparent"}
              >
                Completed ({completedTasks})
              </Button>
            </div>
          </div>
        </div>

        {/* Tasks List */}
        <Card>
          <CardHeader>
            <CardTitle>
              {filter === "all" ? "All Tasks" : filter === "pending" ? "Pending Tasks" : "Completed Tasks"}
            </CardTitle>
            <CardDescription>
              {filteredTasks.length === 0
                ? `No ${filter === "all" ? "" : filter} tasks found`
                : `Showing ${filteredTasks.length} ${filter === "all" ? "" : filter} task${
                    filteredTasks.length === 1 ? "" : "s"
                  }`}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-accent"></div>
              </div>
            ) : filteredTasks.length === 0 ? (
              <div className="text-center py-12">
                <CheckSquare className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                <h4 className="text-lg font-medium text-foreground mb-2">
                  {searchQuery ? "No matching tasks found" : filter === "all" ? "No tasks yet" : `No ${filter} tasks`}
                </h4>
                <p className="text-muted-foreground mb-6">
                  {searchQuery
                    ? "Try adjusting your search terms or filters"
                    : filter === "all"
                      ? "Create your first task to get started!"
                      : `You don't have any ${filter} tasks at the moment.`}
                </p>
                {!searchQuery && filter === "all" && (
                  <Button onClick={handleCreateTask} className="bg-accent hover:bg-accent/90">
                    <Plus className="w-4 h-4 mr-2" />
                    Create Your First Task
                  </Button>
                )}
              </div>
            ) : (
              <div className="space-y-3">
                {filteredTasks.map((task) => (
                  <TaskItem
                    key={task.id}
                    task={task}
                    onToggleComplete={handleToggleComplete}
                    onEdit={handleEditTask}
                    onDelete={handleDeleteTask}
                  />
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </main>

      {/* Task Modal */}
      <TaskModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSaveTask}
        task={editingTask}
        mode={modalMode}
      />
    </div>
  )
}
