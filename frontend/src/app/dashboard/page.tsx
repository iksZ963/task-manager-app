"use client"
import { useAuth } from "@/contexts/AuthContext"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Plus, CheckSquare, Clock, User, LogOut, List, ArrowRight } from "lucide-react"
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

export default function DashboardPage() {
  const { user, logout, token } = useAuth()
  const router = useRouter()
  const [tasks, setTasks] = useState<Task[]>([])
  const [loading, setLoading] = useState(true)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingTask, setEditingTask] = useState<Task | null>(null)
  const [modalMode, setModalMode] = useState<"create" | "edit">("create")
  const [filter, setFilter] = useState<FilterType>("all")

  const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api"

  useEffect(() => {
    if (!user) {
      router.push("/")
      return
    }
    fetchTasks()
  }, [user, router])

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
          console.log("Error response:", error)
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
          throw new Error("Failed to update task")
        }

        const updatedTask = await response.json()
        setTasks((prev) => prev.map((task) => (task.id === updatedTask.id ? updatedTask : task)))
      }
    } catch (error) {
      console.log("Error in saving task:", error)
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

  const handleLogout = () => {
    logout()
    router.push("/")
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-accent mx-auto"></div>
          <p className="mt-2 text-muted-foreground">Loading...</p>
        </div>
      </div>
    )
  }

  const completedTasks = tasks.filter((task) => task.completed).length
  const pendingTasks = tasks.filter((task) => !task.completed).length

  const filteredTasks = tasks.filter((task) => {
    if (filter === "completed") return task.completed
    if (filter === "pending") return !task.completed
    return true
  })

  const displayTasks = filteredTasks.slice(0, 5)

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center gap-3">
              <CheckSquare className="w-8 h-8 text-accent" />
              <h1 className="text-2xl font-bold font-sans text-foreground">TaskManager</h1>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <User className="w-4 h-4" />
                <span>{user.name}</span>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={handleLogout}
                className="flex items-center gap-2 bg-transparent"
              >
                <LogOut className="w-4 h-4" />
                Sign Out
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h2 className="text-3xl font-bold font-sans text-foreground mb-2">Welcome, {user.name}!</h2>
          <p className="text-muted-foreground">Here's an overview of your tasks and productivity.</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Tasks</CardTitle>
              <CheckSquare className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{tasks.length}</div>
              <p className="text-xs text-muted-foreground">All your tasks</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Completed</CardTitle>
              <CheckSquare className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{completedTasks}</div>
              <p className="text-xs text-muted-foreground">Tasks completed</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pending</CardTitle>
              <Clock className="h-4 w-4 text-orange-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-orange-600">{pendingTasks}</div>
              <p className="text-xs text-muted-foreground">Tasks remaining</p>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Plus className="w-5 h-5" />
                Quick Actions
              </CardTitle>
              <CardDescription>Common actions to manage your tasks efficiently.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Button onClick={handleCreateTask} className="w-full bg-accent hover:bg-accent/90" size="lg">
                <Plus className="w-4 h-4 mr-2" />
                Create New Task
              </Button>
              <div className="grid grid-cols-2 gap-3">
                <Link href="/dashboard/tasks">
                  <Button variant="outline" className="w-full bg-transparent">
                    <List className="w-4 h-4 mr-2" />
                    View All
                  </Button>
                </Link>
                <Button
                  variant="outline"
                  onClick={() => setFilter(filter === "pending" ? "all" : "pending")}
                  className={`w-full ${
                    filter === "pending"
                      ? "bg-orange-100 border-orange-300 text-orange-700 hover:bg-orange-200"
                      : "bg-transparent"
                  }`}
                >
                  <Clock className="w-4 h-4 mr-2" />
                  Pending
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Recent Tasks */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Recent Tasks</CardTitle>
                  <CardDescription>
                    {filter === "all"
                      ? "Your latest tasks and their current status."
                      : filter === "pending"
                        ? "Showing only pending tasks."
                        : "Showing only completed tasks."}
                  </CardDescription>
                </div>
                {tasks.length > 5 && (
                  <Link href="/dashboard/tasks">
                    <Button variant="outline" size="sm" className="bg-transparent">
                      View All
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </Button>
                  </Link>
                )}
              </div>
              {filter !== "all" && (
                <div className="flex items-center gap-2 mt-2">
                  <span className="text-sm text-muted-foreground">Filtered by: {filter}</span>
                  <Button variant="ghost" size="sm" onClick={() => setFilter("all")} className="h-6 px-2 text-xs">
                    Clear filter
                  </Button>
                </div>
              )}
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="flex items-center justify-center py-8">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-accent"></div>
                </div>
              ) : displayTasks.length === 0 ? (
                <div className="text-center py-8">
                  <CheckSquare className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground mb-4">
                    {filter === "all"
                      ? "No tasks yet. Create your first task to get started!"
                      : filter === "pending"
                        ? "No pending tasks! All your tasks are completed."
                        : "No completed tasks yet. Complete some tasks to see them here."}
                  </p>
                  {filter === "all" && (
                    <Button onClick={handleCreateTask} className="bg-accent hover:bg-accent/90">
                      <Plus className="w-4 h-4 mr-2" />
                      Create Task
                    </Button>
                  )}
                </div>
              ) : (
                <div className="space-y-3">
                  {displayTasks.map((task) => (
                    <TaskItem
                      key={task.id}
                      task={task}
                      onToggleComplete={handleToggleComplete}
                      onEdit={handleEditTask}
                      onDelete={handleDeleteTask}
                    />
                  ))}
                  {filteredTasks.length > 5 && (
                    <p className="text-sm text-muted-foreground text-center pt-2">
                      Showing 5 of {filteredTasks.length} {filter === "all" ? "" : filter} tasks
                    </p>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
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
