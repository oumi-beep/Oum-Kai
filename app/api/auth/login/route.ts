import { NextResponse } from "next/server"
import { cookies } from "next/headers"

export async function POST(request: Request) {
  const { email, password } = await request.json()

  // Validate input
  if (!email || !password) {
    return NextResponse.json({ error: "Email and password are required" }, { status: 400 })
  }

  // In a real app, you would:
  // 1. Look up the user in your database
  // 2. Verify the password hash
  // 3. Generate a JWT token

  // For this example, we'll simulate a successful login
  const user = {
    id: "123456",
    name: "John Doe",
    email: email,
  }

  // Set a cookie with the user info (in a real app, this would be a JWT token)
  cookies().set({
    name: "user",
    value: JSON.stringify(user),
    httpOnly: true,
    path: "/",
  })

  return NextResponse.json(user)
}
