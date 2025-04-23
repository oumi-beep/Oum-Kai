import { NextResponse } from "next/server"
import { cookies } from "next/headers"

export async function POST() {
  // Clear the user cookie
  cookies().delete("user")

  return NextResponse.json({ success: true })
}
