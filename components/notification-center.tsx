"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Bell, BellOff, Clock } from "lucide-react"

export function NotificationCenter({ tasks }) {
  const [notificationsEnabled, setNotificationsEnabled] = useState(true)
  const [upcomingTasks, setUpcomingTasks] = useState([])
  const [todaysTasks, setTodaysTasks] = useState([])

  useEffect(() => {
    // Get current day and time
    const now = new Date()
    const currentDay = now.toLocaleDateString("en-US", { weekday: "long" })

    // Filter today's tasks
    const tasksToday = tasks.filter((task) => task.day === currentDay && !task.completed)
    setTodaysTasks(tasksToday)

    // Filter upcoming tasks (next 3 days)
    const daysOfWeek = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"]
    const currentDayIndex = daysOfWeek.indexOf(currentDay)

    const upcomingDays = []
    for (let i = 1; i <= 3; i++) {
      const nextDayIndex = (currentDayIndex + i) % 7
      upcomingDays.push(daysOfWeek[nextDayIndex])
    }

    const upcoming = tasks.filter((task) => upcomingDays.includes(task.day) && !task.completed)

    setUpcomingTasks(upcoming)
  }, [tasks])

  const getPriorityColor = (priority) => {
    switch (priority) {
      case "high":
        return "text-red-500 bg-red-50"
      case "medium":
        return "text-amber-500 bg-amber-50"
      case "low":
        return "text-green-500 bg-green-50"
      default:
        return "text-slate-500 bg-slate-50"
    }
  }

  const requestNotificationPermission = async () => {
    if (!("Notification" in window)) {
      alert("This browser does not support desktop notifications")
      return
    }

    try {
      const permission = await Notification.requestPermission()
      if (permission === "granted") {
        setNotificationsEnabled(true)
      } else {
        setNotificationsEnabled(false)
      }
    } catch (error) {
      console.error("Error requesting notification permission:", error)
    }
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>Notification Settings</CardTitle>
          <CardDescription>Configure how you want to receive notifications for your tasks.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between space-x-2">
              <Label htmlFor="notifications" className="flex flex-col space-y-1">
                <span>Enable Notifications</span>
                <span className="font-normal text-sm text-muted-foreground">
                  Receive alerts for upcoming tasks and deadlines
                </span>
              </Label>
              <Switch id="notifications" checked={notificationsEnabled} onCheckedChange={setNotificationsEnabled} />
            </div>
            {!notificationsEnabled && (
              <Button variant="outline" onClick={requestNotificationPermission}>
                <Bell className="mr-2 h-4 w-4" />
                Enable Browser Notifications
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Today's Tasks</CardTitle>
          <CardDescription>Tasks scheduled for today that require your attention.</CardDescription>
        </CardHeader>
        <CardContent>
          {todaysTasks.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-8 text-center">
              <div className="rounded-full bg-muted p-3">
                <BellOff className="h-6 w-6 text-muted-foreground" />
              </div>
              <h3 className="mt-4 text-lg font-semibold">No Tasks Today</h3>
              <p className="mt-2 text-sm text-muted-foreground">You don't have any tasks scheduled for today.</p>
            </div>
          ) : (
            <div className="space-y-2">
              {todaysTasks.map((task) => (
                <div key={task.id} className="flex items-start justify-between rounded-lg border p-4">
                  <div className="grid gap-1">
                    <div className="flex items-center gap-2">
                      <h4 className="font-medium">{task.title}</h4>
                      <Badge className={getPriorityColor(task.priority)} variant="outline">
                        {task.priority}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-1">
                      <Clock className="h-3 w-3 text-muted-foreground" />
                      <span className="text-xs text-muted-foreground">{task.time}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Upcoming Tasks</CardTitle>
          <CardDescription>Tasks scheduled for the next few days.</CardDescription>
        </CardHeader>
        <CardContent>
          {upcomingTasks.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-8 text-center">
              <div className="rounded-full bg-muted p-3">
                <BellOff className="h-6 w-6 text-muted-foreground" />
              </div>
              <h3 className="mt-4 text-lg font-semibold">No Upcoming Tasks</h3>
              <p className="mt-2 text-sm text-muted-foreground">
                You don't have any tasks scheduled for the upcoming days.
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              {upcomingTasks.map((task) => (
                <div key={task.id} className="flex items-start justify-between rounded-lg border p-4">
                  <div className="grid gap-1">
                    <div className="flex items-center gap-2">
                      <h4 className="font-medium">{task.title}</h4>
                      <Badge className={getPriorityColor(task.priority)} variant="outline">
                        {task.priority}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-4">
                      <span className="text-xs font-medium">{task.day}</span>
                      <div className="flex items-center gap-1">
                        <Clock className="h-3 w-3 text-muted-foreground" />
                        <span className="text-xs text-muted-foreground">{task.time}</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
