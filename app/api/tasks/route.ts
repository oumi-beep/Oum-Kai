import { NextResponse } from "next/server"
import { cookies } from "next/headers"

// This would be replaced with a real database in production
// For now, we'll simulate user-specific tasks

export async function GET(request: Request) {
  // Get the user from the request (in a real app, this would use JWT or session)
  const userCookie = cookies().get("user")

  if (!userCookie?.value) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const user = JSON.parse(userCookie.value)

  // In a real app, you would query your database for tasks belonging to this user
  // For this example, we'll return mock data
  const tasks = [
    {
      id: "1",
      userId: user.id,
      title: "Team Meeting",
      description: "Weekly sync with the product team",
      day: "Monday",
      time: "10:00 AM",
      priority: "high",
      completed: false,
    },
    {
      id: "2",
      userId: user.id,
      title: "Workout Session",
      description: "Cardio and strength training",
      day: "Wednesday",
      time: "06:30 AM",
      priority: "medium",
      completed: false,
    },
    {
      id: "3",
      userId: user.id,
      title: "Project Deadline",
      description: "Submit final project report",
      day: "Friday",
      time: "05:00 PM",
      priority: "high",
      completed: false,
    },
  ]

  // Filter tasks to only return those belonging to the current user
  const userTasks = tasks.filter((task) => task.userId === user.id)

  return NextResponse.json(userTasks)
}

// POST a new task
export async function POST(request: Request) {
  // Get the user from the request
  const userCookie = cookies().get("user")

  if (!userCookie?.value) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const user = JSON.parse(userCookie.value)

  // Get the task data from the request
  const taskData = await request.json()

  // Create a new task with the user ID
  const newTask = {
    ...taskData,
    id: Date.now().toString(),
    userId: user.id,
    completed: false,
  }

  // In a real app, you would save this to your database

  return NextResponse.json(newTask, { status: 201 })
}
