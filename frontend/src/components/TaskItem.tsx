"use client"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { CheckSquare, Square, Edit, Trash2, Clock } from "lucide-react"

interface Task {
  id: number
  title: string
  description: string
  completed: boolean
  created_at: string
  updated_at: string
}

interface TaskItemProps {
  task: Task
  onToggleComplete: (taskId: number, completed: boolean) => Promise<void>
  onEdit: (task: Task) => void
  onDelete: (taskId: number) => Promise<void>
}

export default function TaskItem({ task, onToggleComplete, onEdit, onDelete }: TaskItemProps) {
  const [loading, setLoading] = useState(false)
  const [deleteLoading, setDeleteLoading] = useState(false)

  const handleToggleComplete = async () => {
    setLoading(true)
    try {
      await onToggleComplete(task.id, !task.completed)
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async () => {
    if (window.confirm("Are you sure you want to delete this task?")) {
      setDeleteLoading(true)
      try {
        await onDelete(task.id)
      } finally {
        setDeleteLoading(false)
      }
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    })
  }

  return (
    <div className="flex items-start gap-4 p-4 border border-border rounded-lg hover:bg-accent/5 transition-colors group">
      <button
        onClick={handleToggleComplete}
        disabled={loading}
        className="mt-1 flex-shrink-0 transition-colors hover:scale-105"
      >
        {task.completed ? (
          <CheckSquare className="w-5 h-5 text-green-600" />
        ) : (
          <Square className="w-5 h-5 text-muted-foreground hover:text-accent" />
        )}
      </button>

      <div className="flex-1 min-w-0">
        <h3
          className={`font-medium text-sm ${task.completed ? "line-through text-muted-foreground" : "text-foreground"}`}
        >
          {task.title}
        </h3>
        {task.description && <p className="text-sm text-muted-foreground mt-1 break-words">{task.description}</p>}
        <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
          <div className="flex items-center gap-1">
            <Clock className="w-3 h-3" />
            <span>Created {formatDate(task.created_at)}</span>
          </div>
          <span
            className={`px-2 py-1 rounded-full text-xs ${
              task.completed ? "bg-green-100 text-green-800" : "bg-orange-100 text-orange-800"
            }`}
          >
            {task.completed ? "Completed" : "Pending"}
          </span>
        </div>
      </div>

      <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
        <Button variant="ghost" size="sm" onClick={() => onEdit(task)} className="h-8 w-8 p-0">
          <Edit className="w-4 h-4" />
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={handleDelete}
          disabled={deleteLoading}
          className="h-8 w-8 p-0 text-destructive hover:text-destructive hover:bg-destructive/10"
        >
          <Trash2 className="w-4 h-4" />
        </Button>
      </div>
    </div>
  )
}
