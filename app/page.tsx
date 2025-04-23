import Link from "next/link"
import { CalendarDays, AlertCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"

export default function Home() {
  // Check if Supabase is configured
  const isSupabaseConfigured = process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  return (
    <div className="flex flex-col min-h-screen">
      <header className="border-b">
        <div className="container flex items-center justify-between py-4">
          <div className="flex items-center gap-2">
            <CalendarDays className="h-6 w-6 text-teal-500" />
            <h1 className="text-xl font-bold">WeeklyPlanner</h1>
          </div>
          <nav className="flex items-center gap-4">
            <Link href="/login" className="text-sm font-medium hover:underline">
              Login
            </Link>
            <Button asChild>
              <Link href="/signup">Sign Up</Link>
            </Button>
          </nav>
        </div>
      </header>
      <main className="flex-1">
        {!isSupabaseConfigured && (
          <div className="container py-4">
            <Alert variant="warning" className="mb-6">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Supabase not configured</AlertTitle>
              <AlertDescription>
                Please set up your Supabase integration by adding the NEXT_PUBLIC_SUPABASE_URL and
                NEXT_PUBLIC_SUPABASE_ANON_KEY environment variables. Some features will be limited until this is
                configured.
              </AlertDescription>
            </Alert>
          </div>
        )}
        <section className="py-20 md:py-32 bg-gradient-to-b from-white to-teal-50">
          <div className="container flex flex-col items-center text-center">
            <h1 className="text-4xl md:text-6xl font-bold tracking-tight">
              Plan Your Week with <span className="text-teal-500">Purpose</span>
            </h1>
            <p className="mt-6 max-w-2xl text-lg text-muted-foreground">
              Stay organized, focused, and motivated with our intuitive weekly planning tool. Create, edit, and track
              your weekly goals with ease.
            </p>
            <div className="mt-10 flex flex-col sm:flex-row gap-4">
              <Button size="lg" asChild>
                <Link href="/signup">Get Started</Link>
              </Button>
              <Button size="lg" variant="outline" asChild>
                <Link href="#features">Learn More</Link>
              </Button>
            </div>
          </div>
        </section>

        <section id="features" className="py-20 bg-white">
          <div className="container">
            <h2 className="text-3xl font-bold text-center mb-12">Features</h2>
            <div className="grid md:grid-cols-3 gap-8">
              <div className="flex flex-col items-center text-center p-6 rounded-lg border bg-card shadow-sm">
                <div className="p-3 rounded-full bg-teal-100 mb-4">
                  <CalendarDays className="h-6 w-6 text-teal-500" />
                </div>
                <h3 className="text-xl font-bold mb-2">Intuitive Planning</h3>
                <p className="text-muted-foreground">
                  Easily create and organize your weekly schedule with our drag-and-drop interface.
                </p>
              </div>
              <div className="flex flex-col items-center text-center p-6 rounded-lg border bg-card shadow-sm">
                <div className="p-3 rounded-full bg-teal-100 mb-4">
                  <CalendarDays className="h-6 w-6 text-teal-500" />
                </div>
                <h3 className="text-xl font-bold mb-2">Smart Reminders</h3>
                <p className="text-muted-foreground">
                  Never miss an important task with customizable notifications and reminders.
                </p>
              </div>
              <div className="flex flex-col items-center text-center p-6 rounded-lg border bg-card shadow-sm">
                <div className="p-3 rounded-full bg-teal-100 mb-4">
                  <CalendarDays className="h-6 w-6 text-teal-500" />
                </div>
                <h3 className="text-xl font-bold mb-2">Progress Tracking</h3>
                <p className="text-muted-foreground">
                  Stay motivated by tracking your accomplishments and weekly progress.
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>
      <footer className="border-t py-6 bg-muted/50">
        <div className="container flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-sm text-muted-foreground">© 2025 WeeklyPlanner. All rights reserved.</p>
          <nav className="flex items-center gap-4">
            <Link href="#" className="text-sm text-muted-foreground hover:underline">
              Terms
            </Link>
            <Link href="#" className="text-sm text-muted-foreground hover:underline">
              Privacy
            </Link>
            <Link href="#" className="text-sm text-muted-foreground hover:underline">
              Contact
            </Link>
          </nav>
        </div>
      </footer>
    </div>
  )
}
