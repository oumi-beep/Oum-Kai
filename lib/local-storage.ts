// Helper functions for working with localStorage

// Types
export type Profile = {
  id: string
  email: string
  full_name: string
  avatar_url: string | null
  bio: string | null
  created_at: string
}

export type User = {
  id: string
  email: string
  password: string // In a real app, this would be hashed
  user_metadata: {
    full_name: string
  }
  created_at: string
}

export type Quote = {
  id: string
  user_id: string
  text: string
  author: string
  is_favorite: boolean
  is_public: boolean
  created_at: string
}

export type Task = {
  id: string
  user_id: string
  title: string
  description: string | null
  day: string
  time: string
  priority: "low" | "medium" | "high"
  completed: boolean
  created_at: string
}

export type ResetToken = {
  email: string
  token: string
  expires: number // timestamp
}

// Storage keys
const USERS_KEY = "weekly_planner_users"
const PROFILES_KEY = "weekly_planner_profiles"
const CURRENT_USER_KEY = "weekly_planner_current_user"
const TASKS_KEY = "weekly_planner_tasks"
const QUOTES_KEY = "weekly_planner_quotes"
const RESET_TOKENS_KEY = "weekly_planner_reset_tokens"

// Helper functions
export const getUsers = (): User[] => {
  const users = localStorage.getItem(USERS_KEY)
  return users ? JSON.parse(users) : []
}

export const saveUsers = (users: User[]) => {
  localStorage.setItem(USERS_KEY, JSON.stringify(users))
}

export const getProfiles = (): Profile[] => {
  const profiles = localStorage.getItem(PROFILES_KEY)
  return profiles ? JSON.parse(profiles) : []
}

export const saveProfiles = (profiles: Profile[]) => {
  localStorage.setItem(PROFILES_KEY, JSON.stringify(profiles))
}

export const getCurrentUser = (): User | null => {
  const user = localStorage.getItem(CURRENT_USER_KEY)
  return user ? JSON.parse(user) : null
}

export const saveCurrentUser = (user: User | null) => {
  if (user) {
    localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(user))
  } else {
    localStorage.removeItem(CURRENT_USER_KEY)
  }
}

export const getTasks = (): Task[] => {
  const tasks = localStorage.getItem(TASKS_KEY)
  return tasks ? JSON.parse(tasks) : []
}

export const saveTasks = (tasks: Task[]) => {
  localStorage.setItem(TASKS_KEY, JSON.stringify(tasks))
}

export const getQuotes = (): Quote[] => {
  const quotes = localStorage.getItem(QUOTES_KEY)
  return quotes ? JSON.parse(quotes) : []
}

export const saveQuotes = (quotes: Quote[]) => {
  localStorage.setItem(QUOTES_KEY, JSON.stringify(quotes))
}

export const getResetTokens = (): ResetToken[] => {
  const tokens = localStorage.getItem(RESET_TOKENS_KEY)
  return tokens ? JSON.parse(tokens) : []
}

export const saveResetTokens = (tokens: ResetToken[]) => {
  localStorage.setItem(RESET_TOKENS_KEY, JSON.stringify(tokens))
}

// User management functions
export const createUser = (email: string, password: string, fullName: string): User => {
  const users = getUsers()

  // Check if user already exists
  if (users.some((user) => user.email === email)) {
    throw new Error("User with this email already exists")
  }

  const newUser: User = {
    id: Date.now().toString(),
    email,
    password, // In a real app, this would be hashed
    user_metadata: {
      full_name: fullName,
    },
    created_at: new Date().toISOString(),
  }

  // Save user
  users.push(newUser)
  saveUsers(users)

  // Create profile
  const profiles = getProfiles()
  const newProfile: Profile = {
    id: newUser.id,
    email,
    full_name: fullName,
    avatar_url: null,
    bio: null,
    created_at: new Date().toISOString(),
  }
  profiles.push(newProfile)
  saveProfiles(profiles)

  return newUser
}

export const authenticateUser = (email: string, password: string): User => {
  const users = getUsers()
  const user = users.find((u) => u.email === email && u.password === password)

  if (!user) {
    throw new Error("Invalid email or password")
  }

  return user
}

export const getUserProfile = (userId: string): Profile | null => {
  const profiles = getProfiles()
  return profiles.find((p) => p.id === userId) || null
}

export const updateUserProfile = (userId: string, data: Partial<Profile>): Profile => {
  const profiles = getProfiles()
  const index = profiles.findIndex((p) => p.id === userId)

  if (index === -1) {
    throw new Error("Profile not found")
  }

  const updatedProfile = {
    ...profiles[index],
    ...data,
    id: userId, // Ensure ID doesn't change
  }

  profiles[index] = updatedProfile
  saveProfiles(profiles)

  return updatedProfile
}

export const updateUserPassword = (userId: string, newPassword: string): void => {
  const users = getUsers()
  const index = users.findIndex((u) => u.id === userId)

  if (index === -1) {
    throw new Error("User not found")
  }

  users[index].password = newPassword
  saveUsers(users)
}

export const createResetToken = (email: string): string => {
  const users = getUsers()
  const user = users.find((u) => u.email === email)

  if (!user) {
    throw new Error("User not found")
  }

  const token = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15)
  const tokens = getResetTokens()

  // Remove any existing tokens for this email
  const filteredTokens = tokens.filter((t) => t.email !== email)

  // Add new token (expires in 1 hour)
  filteredTokens.push({
    email,
    token,
    expires: Date.now() + 3600000, // 1 hour
  })

  saveResetTokens(filteredTokens)
  return token
}

export const validateResetToken = (token: string): string => {
  const tokens = getResetTokens()
  const resetToken = tokens.find((t) => t.token === token)

  if (!resetToken) {
    throw new Error("Invalid or expired token")
  }

  if (resetToken.expires < Date.now()) {
    // Remove expired token
    saveResetTokens(tokens.filter((t) => t.token !== token))
    throw new Error("Token has expired")
  }

  return resetToken.email
}

export const resetPassword = (token: string, newPassword: string): void => {
  const email = validateResetToken(token)
  const users = getUsers()
  const userIndex = users.findIndex((u) => u.email === email)

  if (userIndex === -1) {
    throw new Error("User not found")
  }

  // Update password
  users[userIndex].password = newPassword
  saveUsers(users)

  // Remove used token
  const tokens = getResetTokens()
  saveResetTokens(tokens.filter((t) => t.token !== token))
}

// Quote management functions
export const getUserQuotes = (userId: string): Quote[] => {
  const quotes = getQuotes()
  return quotes.filter((q) => q.user_id === userId)
}

export const getPublicQuotes = (excludeUserId: string): Quote[] => {
  const quotes = getQuotes()
  return quotes.filter((q) => q.user_id !== excludeUserId && q.is_public)
}

export const createQuote = (userId: string, text: string, author: string, isPublic: boolean): Quote => {
  const quotes = getQuotes()

  const newQuote: Quote = {
    id: Date.now().toString(),
    user_id: userId,
    text,
    author,
    is_favorite: false,
    is_public: isPublic,
    created_at: new Date().toISOString(),
  }

  quotes.push(newQuote)
  saveQuotes(quotes)

  return newQuote
}

export const updateQuote = (quoteId: string, userId: string, data: Partial<Quote>): Quote => {
  const quotes = getQuotes()
  const index = quotes.findIndex((q) => q.id === quoteId && q.user_id === userId)

  if (index === -1) {
    throw new Error("Quote not found or you don't have permission to edit it")
  }

  const updatedQuote = {
    ...quotes[index],
    ...data,
    id: quoteId, // Ensure ID doesn't change
    user_id: userId, // Ensure user_id doesn't change
  }

  quotes[index] = updatedQuote
  saveQuotes(quotes)

  return updatedQuote
}

export const deleteQuote = (quoteId: string, userId: string): void => {
  const quotes = getQuotes()
  const filteredQuotes = quotes.filter((q) => !(q.id === quoteId && q.user_id === userId))

  if (filteredQuotes.length === quotes.length) {
    throw new Error("Quote not found or you don't have permission to delete it")
  }

  saveQuotes(filteredQuotes)
}

export const toggleQuoteFavorite = (quoteId: string, userId: string): Quote => {
  const quotes = getQuotes()
  const index = quotes.findIndex((q) => q.id === quoteId && q.user_id === userId)

  if (index === -1) {
    throw new Error("Quote not found or you don't have permission to edit it")
  }

  quotes[index].is_favorite = !quotes[index].is_favorite
  saveQuotes(quotes)

  return quotes[index]
}

// Task management functions
export const getUserTasks = (userId: string): Task[] => {
  const tasks = getTasks()
  return tasks.filter((t) => t.user_id === userId)
}

export const createTask = (
  userId: string,
  title: string,
  description: string | null,
  day: string,
  time: string,
  priority: "low" | "medium" | "high",
): Task => {
  const tasks = getTasks()

  const newTask: Task = {
    id: Date.now().toString(),
    user_id: userId,
    title,
    description,
    day,
    time,
    priority,
    completed: false,
    created_at: new Date().toISOString(),
  }

  tasks.push(newTask)
  saveTasks(tasks)

  return newTask
}

export const updateTask = (taskId: string, userId: string, data: Partial<Task>): Task => {
  const tasks = getTasks()
  const index = tasks.findIndex((t) => t.id === taskId && t.user_id === userId)

  if (index === -1) {
    throw new Error("Task not found or you don't have permission to edit it")
  }

  const updatedTask = {
    ...tasks[index],
    ...data,
    id: taskId, // Ensure ID doesn't change
    user_id: userId, // Ensure user_id doesn't change
  }

  tasks[index] = updatedTask
  saveTasks(tasks)

  return updatedTask
}

export const deleteTask = (taskId: string, userId: string): void => {
  const tasks = getTasks()
  const filteredTasks = tasks.filter((t) => !(t.id === taskId && t.user_id === userId))

  if (filteredTasks.length === tasks.length) {
    throw new Error("Task not found or you don't have permission to delete it")
  }

  saveTasks(filteredTasks)
}

export const toggleTaskCompletion = (taskId: string, userId: string): Task => {
  const tasks = getTasks()
  const index = tasks.findIndex((t) => t.id === taskId && t.user_id === userId)

  if (index === -1) {
    throw new Error("Task not found or you don't have permission to edit it")
  }

  tasks[index].completed = !tasks[index].completed
  saveTasks(tasks)

  return tasks[index]
}

// Statistics functions
export const getUserTaskStats = (userId: string) => {
  const tasks = getUserTasks(userId)
  const completedTasks = tasks.filter((t) => t.completed).length

  return {
    totalTasks: tasks.length,
    completedTasks,
    pendingTasks: tasks.length - completedTasks,
  }
}
