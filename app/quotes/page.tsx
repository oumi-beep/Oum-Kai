"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { CalendarDays, Plus, Heart, Quote, Search, Loader2, X, Edit, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent } from "@/components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Switch } from "@/components/ui/switch"
import { useToast } from "@/components/ui/use-toast"
import { useAuth } from "@/lib/auth-context"
import * as localStorage from "@/lib/local-storage"
import { ProtectedRoute } from "@/components/protected-route"
import { cn } from "@/lib/utils"

export default function QuotesPage() {
  const [quotes, setQuotes] = useState<localStorage.Quote[]>([])
  const [publicQuotes, setPublicQuotes] = useState<localStorage.Quote[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [isAddQuoteOpen, setIsAddQuoteOpen] = useState(false)
  const [isEditQuoteOpen, setIsEditQuoteOpen] = useState(false)
  const [currentQuote, setCurrentQuote] = useState<localStorage.Quote | null>(null)
  const [quoteText, setQuoteText] = useState("")
  const [quoteAuthor, setQuoteAuthor] = useState("")
  const [isPublic, setIsPublic] = useState(false)
  const [activeTab, setActiveTab] = useState("my-quotes")

  const { toast } = useToast()
  const { user } = useAuth()
  const router = useRouter()

  useEffect(() => {
    const fetchQuotes = async () => {
      if (!user) return

      try {
        // Fetch user's quotes
        const userQuotes = localStorage.getUserQuotes(user.id)
        setQuotes(userQuotes || [])

        // Fetch public quotes from other users
        const otherQuotes = localStorage.getPublicQuotes(user.id)
        setPublicQuotes(otherQuotes || [])
      } catch (error) {
        console.error("Error fetching quotes:", error)
        toast({
          title: "Error loading quotes",
          description: "There was a problem loading your quotes.",
          variant: "destructive",
        })
      } finally {
        setIsLoading(false)
      }
    }

    fetchQuotes()
  }, [user, toast])

  const handleAddQuote = async () => {
    if (!user || !quoteText || !quoteAuthor) return

    try {
      const newQuote = localStorage.createQuote(user.id, quoteText, quoteAuthor, isPublic)

      // Update quotes list
      setQuotes([newQuote, ...quotes])
      setIsAddQuoteOpen(false)
      setQuoteText("")
      setQuoteAuthor("")
      setIsPublic(false)

      toast({
        title: "Quote added",
        description: "Your quote has been added successfully.",
      })
    } catch (error) {
      console.error("Error adding quote:", error)
      toast({
        title: "Failed to add quote",
        description: error instanceof Error ? error.message : "There was a problem adding your quote.",
        variant: "destructive",
      })
    }
  }

  const handleEditQuote = async () => {
    if (!user || !currentQuote || !quoteText || !quoteAuthor) return

    try {
      const updatedQuote = localStorage.updateQuote(currentQuote.id, user.id, {
        text: quoteText,
        author: quoteAuthor,
        is_public: isPublic,
      })

      // Update quotes list
      setQuotes(quotes.map((q) => (q.id === updatedQuote.id ? updatedQuote : q)))
      setIsEditQuoteOpen(false)
      setCurrentQuote(null)
      setQuoteText("")
      setQuoteAuthor("")
      setIsPublic(false)

      toast({
        title: "Quote updated",
        description: "Your quote has been updated successfully.",
      })
    } catch (error) {
      console.error("Error updating quote:", error)
      toast({
        title: "Failed to update quote",
        description: error instanceof Error ? error.message : "There was a problem updating your quote.",
        variant: "destructive",
      })
    }
  }

  const handleDeleteQuote = async (quoteId: string) => {
    if (!user) return

    try {
      localStorage.deleteQuote(quoteId, user.id)

      // Update local state
      setQuotes(quotes.filter((quote) => quote.id !== quoteId))

      toast({
        title: "Quote deleted",
        description: "Your quote has been deleted successfully.",
      })
    } catch (error) {
      console.error("Error deleting quote:", error)
      toast({
        title: "Failed to delete quote",
        description: error instanceof Error ? error.message : "There was a problem deleting your quote.",
        variant: "destructive",
      })
    }
  }

  const handleToggleFavorite = async (quoteId: string, isFavorite: boolean) => {
    if (!user) return

    try {
      const updatedQuote = localStorage.toggleQuoteFavorite(quoteId, user.id)

      // Update local state
      setQuotes(quotes.map((quote) => (quote.id === quoteId ? updatedQuote : quote)))

      toast({
        title: isFavorite ? "Removed from favorites" : "Added to favorites",
        description: `Quote has been ${isFavorite ? "removed from" : "added to"} your favorites.`,
      })
    } catch (error) {
      console.error("Error updating favorite status:", error)
      toast({
        title: "Failed to update",
        description: error instanceof Error ? error.message : "There was a problem updating the favorite status.",
        variant: "destructive",
      })
    }
  }

  const filteredQuotes =
    activeTab === "my-quotes"
      ? quotes.filter(
          (quote) =>
            quote.text.toLowerCase().includes(searchQuery.toLowerCase()) ||
            quote.author.toLowerCase().includes(searchQuery.toLowerCase()),
        )
      : publicQuotes.filter(
          (quote) =>
            quote.text.toLowerCase().includes(searchQuery.toLowerCase()) ||
            quote.author.toLowerCase().includes(searchQuery.toLowerCase()),
        )

  if (isLoading) {
    return (
      <ProtectedRoute>
        <div className="flex min-h-screen items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-teal-500" />
        </div>
      </ProtectedRoute>
    )
  }

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gradient-to-b from-white to-teal-50">
        <header className="border-b bg-white">
          <div className="container flex h-16 items-center justify-between py-4">
            <div className="flex items-center gap-2">
              <CalendarDays className="h-6 w-6 text-teal-500" />
              <h1 className="text-xl font-bold">WeeklyPlanner</h1>
            </div>
            <Button variant="outline" onClick={() => router.push("/dashboard")}>
              Back to Dashboard
            </Button>
          </div>
        </header>

        <main className="container py-8">
          <div className="mx-auto max-w-4xl">
            <div className="mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between">
              <h1 className="text-3xl font-bold">Motivational Quotes</h1>
              <Dialog open={isAddQuoteOpen} onOpenChange={setIsAddQuoteOpen}>
                <DialogTrigger asChild>
                  <Button className="mt-4 sm:mt-0">
                    <Plus className="mr-2 h-4 w-4" />
                    Add Quote
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Add New Quote</DialogTitle>
                    <DialogDescription>Add a motivational quote to your collection.</DialogDescription>
                  </DialogHeader>
                  <div className="grid gap-4 py-4">
                    <div className="grid gap-2">
                      <Label htmlFor="quote-text">Quote</Label>
                      <Textarea
                        id="quote-text"
                        value={quoteText}
                        onChange={(e) => setQuoteText(e.target.value)}
                        placeholder="Enter the quote text"
                        className="min-h-[100px]"
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="quote-author">Author</Label>
                      <Input
                        id="quote-author"
                        value={quoteAuthor}
                        onChange={(e) => setQuoteAuthor(e.target.value)}
                        placeholder="Enter the author's name"
                      />
                    </div>
                    <div className="flex items-center space-x-2">
                      <Switch id="public" checked={isPublic} onCheckedChange={setIsPublic} />
                      <Label htmlFor="public">Make this quote public</Label>
                    </div>
                  </div>
                  <DialogFooter>
                    <Button variant="outline" onClick={() => setIsAddQuoteOpen(false)}>
                      Cancel
                    </Button>
                    <Button onClick={handleAddQuote} disabled={!quoteText || !quoteAuthor}>
                      Add Quote
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>

              <Dialog open={isEditQuoteOpen} onOpenChange={setIsEditQuoteOpen}>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Edit Quote</DialogTitle>
                    <DialogDescription>Update your motivational quote.</DialogDescription>
                  </DialogHeader>
                  <div className="grid gap-4 py-4">
                    <div className="grid gap-2">
                      <Label htmlFor="edit-quote-text">Quote</Label>
                      <Textarea
                        id="edit-quote-text"
                        value={quoteText}
                        onChange={(e) => setQuoteText(e.target.value)}
                        placeholder="Enter the quote text"
                        className="min-h-[100px]"
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="edit-quote-author">Author</Label>
                      <Input
                        id="edit-quote-author"
                        value={quoteAuthor}
                        onChange={(e) => setQuoteAuthor(e.target.value)}
                        placeholder="Enter the author's name"
                      />
                    </div>
                    <div className="flex items-center space-x-2">
                      <Switch id="edit-public" checked={isPublic} onCheckedChange={setIsPublic} />
                      <Label htmlFor="edit-public">Make this quote public</Label>
                    </div>
                  </div>
                  <DialogFooter>
                    <Button variant="outline" onClick={() => setIsEditQuoteOpen(false)}>
                      Cancel
                    </Button>
                    <Button onClick={handleEditQuote} disabled={!quoteText || !quoteAuthor}>
                      Update Quote
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>

            <div className="mb-6 flex flex-col space-y-4 sm:flex-row sm:items-center sm:justify-between sm:space-y-0">
              <div className="flex space-x-2">
                <Button
                  variant={activeTab === "my-quotes" ? "default" : "outline"}
                  onClick={() => setActiveTab("my-quotes")}
                >
                  My Quotes
                </Button>
                <Button
                  variant={activeTab === "public-quotes" ? "default" : "outline"}
                  onClick={() => setActiveTab("public-quotes")}
                >
                  Public Quotes
                </Button>
              </div>
              <div className="relative w-full sm:w-64">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  type="search"
                  placeholder="Search quotes..."
                  className="pl-8"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
                {searchQuery && (
                  <button
                    className="absolute right-2.5 top-2.5 text-muted-foreground hover:text-foreground"
                    onClick={() => setSearchQuery("")}
                  >
                    <X className="h-4 w-4" />
                    <span className="sr-only">Clear search</span>
                  </button>
                )}
              </div>
            </div>

            <div className="space-y-4">
              {filteredQuotes.length === 0 ? (
                <Card>
                  <CardContent className="flex flex-col items-center justify-center py-12 text-center">
                    <Quote className="mb-4 h-12 w-12 text-muted-foreground opacity-50" />
                    <h3 className="text-lg font-semibold">No quotes found</h3>
                    <p className="mt-2 text-sm text-muted-foreground">
                      {activeTab === "my-quotes"
                        ? searchQuery
                          ? "No quotes match your search criteria."
                          : "You haven't added any quotes yet. Click 'Add Quote' to get started."
                        : searchQuery
                          ? "No public quotes match your search criteria."
                          : "There are no public quotes available at the moment."}
                    </p>
                    {activeTab === "my-quotes" && !searchQuery && (
                      <Button className="mt-4" onClick={() => setIsAddQuoteOpen(true)}>
                        <Plus className="mr-2 h-4 w-4" />
                        Add Your First Quote
                      </Button>
                    )}
                  </CardContent>
                </Card>
              ) : (
                filteredQuotes.map((quote) => (
                  <Card
                    key={quote.id}
                    className={cn(
                      "transition-all duration-300 hover:shadow-md",
                      quote.is_favorite && activeTab === "my-quotes" ? "border-teal-200 bg-teal-50" : "",
                    )}
                  >
                    <CardContent className="pt-6">
                      <div className="flex items-start justify-between">
                        <div className="space-y-2">
                          <div className="flex items-center gap-2">
                            <Quote className="h-5 w-5 text-teal-500" />
                            <p className="text-lg font-medium italic">"{quote.text}"</p>
                          </div>
                          <p className="text-sm text-muted-foreground">— {quote.author}</p>
                        </div>
                        {activeTab === "my-quotes" && (
                          <div className="flex space-x-1">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleToggleFavorite(quote.id, quote.is_favorite)}
                              className={cn(
                                quote.is_favorite
                                  ? "text-red-500 hover:text-red-600"
                                  : "text-muted-foreground hover:text-foreground",
                              )}
                            >
                              <Heart className="h-4 w-4" fill={quote.is_favorite ? "currentColor" : "none"} />
                              <span className="sr-only">
                                {quote.is_favorite ? "Remove from favorites" : "Add to favorites"}
                              </span>
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => {
                                setCurrentQuote(quote)
                                setQuoteText(quote.text)
                                setQuoteAuthor(quote.author)
                                setIsPublic(quote.is_public)
                                setIsEditQuoteOpen(true)
                              }}
                            >
                              <Edit className="h-4 w-4" />
                              <span className="sr-only">Edit</span>
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleDeleteQuote(quote.id)}
                              className="text-muted-foreground hover:text-red-600"
                            >
                              <Trash2 className="h-4 w-4" />
                              <span className="sr-only">Delete</span>
                            </Button>
                          </div>
                        )}
                      </div>
                      {activeTab === "my-quotes" && (
                        <div className="mt-4 flex items-center">
                          <span className="text-xs text-muted-foreground">
                            {quote.is_public ? "Public" : "Private"}
                          </span>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </div>
        </main>
      </div>
    </ProtectedRoute>
  )
}
