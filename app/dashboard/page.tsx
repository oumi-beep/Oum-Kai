"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Plus, Calendar, Bell, User, BookOpen, LogOut } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { toast } from "@/components/ui/use-toast"
import { WeeklyCalendar } from "@/components/weekly-calendar"
import { TaskList } from "@/components/task-list"
import { NotificationCenter } from "@/components/notification-center"
import { useAuth } from "@/lib/auth-context"
import * as localStorage from "@/lib/local-storage"

export default function DashboardPage() {
  const [activeTab, setActiveTab] = useState("calendar")
  const [isAddTaskOpen, setIsAddTaskOpen] = useState(false)
  const [tasks, setTasks] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const { user, signOut } = useAuth()
  const router = useRouter()

  // Load tasks for the current user
  useEffect(() => {
    const fetchTasks = async () => {
      if (!user) return

      try {
        const userTasks = localStorage.getUserTasks(user.id)
        setTasks(userTasks)
      } catch (error) {
        console.error("Error fetching tasks:", error)
        toast({
          title: "Error loading tasks",
          description: "There was a problem loading your tasks.",
          variant: "destructive",
        })
      } finally {
        setIsLoading(false)
      }
    }

    fetchTasks()
  }, [user, toast])

  const addTask = async (newTask) => {
    if (!user) return

    try {
      const task = localStorage.createTask(
        user.id,
        newTask.title,
        newTask.description,
        newTask.day,
        newTask.time,
        newTask.priority,
      )

      setTasks([...tasks, task])
      setIsAddTaskOpen(false)

      toast({
        title: "Task added",
        description: "Your new task has been added to your schedule.",
      })
    } catch (error) {
      console.error("Error adding task:", error)
      toast({
        title: "Failed to add task",
        description: "There was a problem adding your task.",
        variant: "destructive",
      })
    }
  }

  const toggleTaskCompletion = async (taskId) => {
    if (!user) return

    try {
      const updatedTask = localStorage.toggleTaskCompletion(taskId, user.id)

      // Update local state
      setTasks(tasks.map((t) => (t.id === taskId ? updatedTask : t)))
    } catch (error) {
      console.error("Error toggling task completion:", error)
      toast({
        title: "Failed to update task",
        description: "There was a problem updating your task.",
        variant: "destructive",
      })
    }
  }

  const deleteTask = async (taskId) => {
    if (!user) return

    try {
      localStorage.deleteTask(taskId, user.id)

      // Update local state
      setTasks(tasks.filter((t) => t.id !== taskId))

      toast({
        title: "Task deleted",
        description: "The task has been removed from your schedule.",
      })
    } catch (error) {
      console.error("Error deleting task:", error)
      toast({
        title: "Failed to delete task",
        description: "There was a problem deleting your task.",
        variant: "destructive",
      })
    }
  }

  return (
    <div className="flex min-h-screen flex-col">
      <header className="border-b">
        <div className="container flex h-16 items-center justify-between py-4">
          <div className="flex items-center gap-2">
            <Calendar className="h-6 w-6 text-teal-500" />
            <h1 className="text-xl font-bold">WeeklyPlanner</h1>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-sm text-muted-foreground hidden md:inline-block">
              Welcome, {user?.user_metadata?.full_name || user?.email}
            </span>
            <Button variant="outline" size="icon" onClick={() => router.push("/quotes")}>
              <BookOpen className="h-4 w-4" />
              <span className="sr-only">Quotes</span>
            </Button>
            <Button variant="outline" size="icon" onClick={() => setActiveTab("notifications")}>
              <Bell className="h-4 w-4" />
              <span className="sr-only">Notifications</span>
            </Button>
            <Button variant="outline" size="icon" onClick={() => router.push("/profile")}>
              <User className="h-4 w-4" />
              <span className="sr-only">Profile</span>
            </Button>
            <Button variant="outline" onClick={signOut}>
              <LogOut className="h-4 w-4 mr-2" />
              Sign Out
            </Button>
          </div>
        </div>
      </header>
      <main className="flex-1 container py-6">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
          <Dialog open={isAddTaskOpen} onOpenChange={setIsAddTaskOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Add Task
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle>Add New Task</DialogTitle>
                <DialogDescription>
                  Create a new task for your weekly schedule. Click save when you're done.
                </DialogDescription>
              </DialogHeader>
              <form
                onSubmit={(e) => {
                  e.preventDefault()
                  const formData = new FormData(e.target)
                  const newTask = {
                    title: formData.get("title"),
                    description: formData.get("description"),
                    day: formData.get("day"),
                    time: formData.get("time"),
                    priority: formData.get("priority"),
                  }
                  addTask(newTask)
                }}
              >
                <div className="grid gap-4 py-4">
                  <div className="grid gap-2">
                    <Label htmlFor="title">Title</Label>
                    <Input id="title" name="title" required />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="description">Description</Label>
                    <Textarea id="description" name="description" />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="grid gap-2">
                      <Label htmlFor="day">Day</Label>
                      <Select name="day" defaultValue="Monday">
                        <SelectTrigger id="day">
                          <SelectValue placeholder="Select day" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Monday">Monday</SelectItem>
                          <SelectItem value="Tuesday">Tuesday</SelectItem>
                          <SelectItem value="Wednesday">Wednesday</SelectItem>
                          <SelectItem value="Thursday">Thursday</SelectItem>
                          <SelectItem value="Friday">Friday</SelectItem>
                          <SelectItem value="Saturday">Saturday</SelectItem>
                          <SelectItem value="Sunday">Sunday</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="time">Time</Label>
                      <Input id="time" name="time" type="time" />
                    </div>
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="priority">Priority</Label>
                    <Select name="priority" defaultValue="medium">
                      <SelectTrigger id="priority">
                        <SelectValue placeholder="Select priority" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="low">Low</SelectItem>
                        <SelectItem value="medium">Medium</SelectItem>
                        <SelectItem value="high">High</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <DialogFooter>
                  <Button type="submit">Save Task</Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
          <TabsList>
            <TabsTrigger value="calendar">Calendar View</TabsTrigger>
            <TabsTrigger value="list">List View</TabsTrigger>
            <TabsTrigger value="notifications">Notifications</TabsTrigger>
          </TabsList>
          <TabsContent value="calendar" className="space-y-4">
            <WeeklyCalendar tasks={tasks} onToggleCompletion={toggleTaskCompletion} onDeleteTask={deleteTask} />
          </TabsContent>
          <TabsContent value="list" className="space-y-4">
            <TaskList tasks={tasks} onToggleCompletion={toggleTaskCompletion} onDeleteTask={deleteTask} />
          </TabsContent>
          <TabsContent value="notifications" className="space-y-4">
            <NotificationCenter tasks={tasks} />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  )
}
