"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Check, Clock, MoreHorizontal, Trash2 } from "lucide-react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { cn } from "@/lib/utils"

const daysOfWeek = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"]

export function WeeklyCalendar({ tasks, onToggleCompletion, onDeleteTask }) {
  const [selectedDay, setSelectedDay] = useState("Monday")

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

  const getTasksForDay = (day) => {
    return tasks.filter((task) => task.day === day)
  }

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-7 gap-2">
        {daysOfWeek.map((day) => (
          <Button
            key={day}
            variant={selectedDay === day ? "default" : "outline"}
            className={cn("h-12", selectedDay === day ? "bg-teal-500 hover:bg-teal-600" : "")}
            onClick={() => setSelectedDay(day)}
          >
            {day.substring(0, 3)}
            {getTasksForDay(day).length > 0 && <Badge className="ml-2 bg-teal-700">{getTasksForDay(day).length}</Badge>}
          </Button>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{selectedDay}'s Schedule</CardTitle>
          <CardDescription>
            You have {getTasksForDay(selectedDay).length} tasks scheduled for {selectedDay}.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {getTasksForDay(selectedDay).length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <div className="rounded-full bg-muted p-3">
                  <Clock className="h-6 w-6 text-muted-foreground" />
                </div>
                <h3 className="mt-4 text-lg font-semibold">No Tasks Scheduled</h3>
                <p className="mt-2 text-sm text-muted-foreground">
                  You don't have any tasks scheduled for {selectedDay}. Add a new task to get started.
                </p>
              </div>
            ) : (
              getTasksForDay(selectedDay).map((task) => (
                <div
                  key={task.id}
                  className={cn(
                    "flex items-start justify-between rounded-lg border p-4",
                    task.completed ? "bg-muted/50" : "",
                  )}
                >
                  <div className="grid gap-1">
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="icon"
                        className={cn(
                          "h-6 w-6 rounded-full",
                          task.completed ? "bg-teal-500 text-white hover:bg-teal-600" : "",
                        )}
                        onClick={() => onToggleCompletion(task.id)}
                      >
                        {task.completed && <Check className="h-3 w-3" />}
                      </Button>
                      <h4 className={cn("font-medium", task.completed ? "line-through text-muted-foreground" : "")}>
                        {task.title}
                      </h4>
                      <Badge className={getPriorityColor(task.priority)} variant="outline">
                        {task.priority}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">{task.description}</p>
                    <div className="flex items-center gap-2 mt-2">
                      <Clock className="h-3 w-3 text-muted-foreground" />
                      <span className="text-xs text-muted-foreground">{task.time}</span>
                    </div>
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <MoreHorizontal className="h-4 w-4" />
                        <span className="sr-only">Open menu</span>
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => onToggleCompletion(task.id)}>
                        {task.completed ? "Mark as incomplete" : "Mark as complete"}
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => onDeleteTask(task.id)}>
                        <Trash2 className="mr-2 h-4 w-4" />
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
