"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { X, Plus, Edit } from "lucide-react"

interface Task {
  id?: number
  title: string
  description: string
  completed?: boolean
}

interface TaskModalProps {
  isOpen: boolean
  onClose: () => void
  onSave: (task: Task) => Promise<void>
  task?: Task | null
  mode: "create" | "edit"
}

export default function TaskModal({ isOpen, onClose, onSave, task, mode }: TaskModalProps) {
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  useEffect(() => {
    if (task && mode === "edit") {
      setTitle(task.title)
      setDescription(task.description)
    } else {
      setTitle("")
      setDescription("")
    }
    setError("")
  }, [task, mode, isOpen])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")

    if (!title.trim()) {
      setError("Title is required")
      return
    }

    setLoading(true)

    try {
      await onSave({
        id: task?.id,
        title: title.trim(),
        description: description.trim(),
        completed: task?.completed || false,
      })
      onClose()
    } catch (err: any) {
      setError(err.message || "Failed to save task")
    } finally {
      setLoading(false)
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <Card className="w-full max-w-md bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-lg">
        <CardHeader className="bg-white dark:bg-gray-800">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {mode === "create" ? <Plus className="w-5 h-5" /> : <Edit className="w-5 h-5" />}
              <CardTitle>{mode === "create" ? "Create New Task" : "Edit Task"}</CardTitle>
            </div>
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="w-4 h-4" />
            </Button>
          </div>
          <CardDescription>
            {mode === "create" ? "Add a new task to your list" : "Update your task details"}
          </CardDescription>
        </CardHeader>
        <CardContent className="bg-white dark:bg-gray-800">
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="p-3 text-sm text-destructive bg-destructive/10 border border-destructive/20 rounded-md">
                {error}
              </div>
            )}

            <div className="space-y-2">
              <label htmlFor="title" className="text-sm font-medium text-foreground">
                Task Title *
              </label>
              <Input
                id="title"
                type="text"
                placeholder="Enter task title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
                className="w-full"
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="description" className="text-sm font-medium text-foreground">
                Description
              </label>
              <textarea
                id="description"
                placeholder="Enter task description (optional)"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 resize-none"
                rows={3}
              />
            </div>

            <div className="flex gap-3 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
                className="flex-1 bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600"
              >
                Cancel
              </Button>
              <Button 
                type="submit" 
                disabled={loading} 
                variant="outline"
                className="flex-1 items-center gap-2 bg-transparent">
                {loading ? "Saving..." : mode === "create" ? "Create Task" : "Update Task"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
