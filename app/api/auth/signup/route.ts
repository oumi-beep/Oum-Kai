import { NextResponse } from "next/server"
import { cookies } from "next/headers"

export async function POST(request: Request) {
  const { name, email, password } = await request.json()

  // Validate input
  if (!name || !email || !password) {
    return NextResponse.json({ error: "Name, email, and password are required" }, { status: 400 })
  }

  // In a real app, you would:
  // 1. Check if the user already exists
  // 2. Hash the password
  // 3. Store the user in your database

  // For this example, we'll create a simple user object
  const newUser = {
    id: Date.now().toString(),
    name,
    email,
    // In a real app, you would hash this password
    password,
  }

  // In a real app, you would save this to your database
  // For this example, we'll simulate by returning a success response

  // Create a user object without the password to return
  const { password: _, ...userWithoutPassword } = newUser

  // Set a cookie with the user info (in a real app, this would be a JWT token)
  cookies().set({
    name: "user",
    value: JSON.stringify(userWithoutPassword),
    httpOnly: true,
    path: "/",
  })

  return NextResponse.json(userWithoutPassword, { status: 201 })
}
