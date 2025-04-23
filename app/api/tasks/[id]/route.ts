import { NextResponse } from "next/server"
import { cookies } from "next/headers"

export async function GET(request: Request, { params }: { params: { id: string } }) {
  const id = params.id

  // Get the user from the request
  const userCookie = cookies().get("user")

  if (!userCookie?.value) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const user = JSON.parse(userCookie.value)

  // In a real app, you would query your database for this specific task
  // For this example, we'll return mock data if the ID matches

  // Check if the task exists and belongs to the user
  // This would be a database query in a real application
  const task = {
    id,
    userId: user.id,
    title: "Sample Task",
    description: "This is a sample task",
    day: "Monday",
    time: "10:00 AM",
    priority: "medium",
    completed: false,
  }

  if (task.userId !== user.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 })
  }

  return NextResponse.json(task)
}

export async function PUT(request: Request, { params }: { params: { id: string } }) {
  const id = params.id

  // Get the user from the request
  const userCookie = cookies().get("user")

  if (!userCookie?.value) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const user = JSON.parse(userCookie.value)

  // Get the updated task data
  const updatedTask = await request.json()

  // Ensure the user can only update their own tasks
  if (updatedTask.userId !== user.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 })
  }

  // In a real app, you would update this in your database

  return NextResponse.json(updatedTask)
}

export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  const id = params.id

  // Get the user from the request
  const userCookie = cookies().get("user")

  if (!userCookie?.value) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const user = JSON.parse(userCookie.value)

  // In a real app, you would check if the task belongs to the user before deleting
  // For this example, we'll assume it does

  // Delete the task from the database
  // This would be a database operation in a real application

  return NextResponse.json({ success: true })
}
