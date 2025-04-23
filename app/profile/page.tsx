"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Image from "next/image"
import { CalendarDays, User, Clock, CheckCircle, Edit, Camera, Loader2, Save } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useToast } from "@/components/ui/use-toast"
import { useAuth } from "@/lib/auth-context"
import * as localStorage from "@/lib/local-storage"
import { ProtectedRoute } from "@/components/protected-route"

export default function ProfilePage() {
  const [profile, setProfile] = useState<localStorage.Profile | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isEditing, setIsEditing] = useState(false)
  const [fullName, setFullName] = useState("")
  const [bio, setBio] = useState("")
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null)
  const [uploadingAvatar, setUploadingAvatar] = useState(false)
  const [stats, setStats] = useState({
    totalTasks: 0,
    completedTasks: 0,
    pendingTasks: 0,
  })

  const { toast } = useToast()
  const { user } = useAuth()
  const router = useRouter()

  useEffect(() => {
    const fetchProfile = async () => {
      if (!user) return

      try {
        // Fetch profile data
        const userProfile = localStorage.getUserProfile(user.id)

        if (!userProfile) {
          throw new Error("Profile not found")
        }

        setProfile(userProfile)
        setFullName(userProfile.full_name || "")
        setBio(userProfile.bio || "")
        setAvatarUrl(userProfile.avatar_url)

        // Fetch task statistics
        const taskStats = localStorage.getUserTaskStats(user.id)
        setStats(taskStats)
      } catch (error) {
        console.error("Error fetching profile:", error)
        toast({
          title: "Error loading profile",
          description: "There was a problem loading your profile data.",
          variant: "destructive",
        })
      } finally {
        setIsLoading(false)
      }
    }

    fetchProfile()
  }, [user, toast])

  const handleSaveProfile = async () => {
    if (!user) return

    setIsLoading(true)

    try {
      const updatedProfile = localStorage.updateUserProfile(user.id, {
        full_name: fullName,
        bio,
      })

      setProfile(updatedProfile)
      setIsEditing(false)

      toast({
        title: "Profile updated",
        description: "Your profile has been successfully updated.",
      })
    } catch (error) {
      console.error("Error updating profile:", error)
      toast({
        title: "Update failed",
        description: "There was a problem updating your profile.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleAvatarUpload = async (event) => {
    const file = event.target.files?.[0]
    if (!file || !user) return

    setUploadingAvatar(true)

    try {
      // Convert the file to a data URL
      const reader = new FileReader()

      reader.onloadend = async () => {
        const dataUrl = reader.result as string

        // Update profile with new avatar URL
        const updatedProfile = localStorage.updateUserProfile(user.id, {
          avatar_url: dataUrl,
        })

        setAvatarUrl(dataUrl)
        setProfile(updatedProfile)

        toast({
          title: "Avatar updated",
          description: "Your profile picture has been updated successfully.",
        })

        setUploadingAvatar(false)
      }

      reader.readAsDataURL(file)
    } catch (error) {
      console.error("Error uploading avatar:", error)
      toast({
        title: "Upload failed",
        description: "There was a problem uploading your profile picture.",
        variant: "destructive",
      })
      setUploadingAvatar(false)
    }
  }

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
            <h1 className="mb-8 text-3xl font-bold">Your Profile</h1>

            <div className="grid gap-6 md:grid-cols-[300px_1fr]">
              <div className="space-y-6">
                <Card>
                  <CardContent className="pt-6">
                    <div className="flex flex-col items-center">
                      <div className="relative mb-4">
                        {uploadingAvatar ? (
                          <div className="flex h-32 w-32 items-center justify-center rounded-full bg-muted">
                            <Loader2 className="h-8 w-8 animate-spin text-teal-500" />
                          </div>
                        ) : (
                          <>
                            <div className="relative h-32 w-32 overflow-hidden rounded-full border-4 border-white shadow">
                              {avatarUrl ? (
                                <Image
                                  src={avatarUrl || "/placeholder.svg"}
                                  alt="Profile"
                                  fill
                                  className="object-cover"
                                />
                              ) : (
                                <div className="flex h-full w-full items-center justify-center bg-muted">
                                  <User className="h-16 w-16 text-muted-foreground" />
                                </div>
                              )}
                            </div>
                            <label
                              htmlFor="avatar-upload"
                              className="absolute bottom-0 right-0 cursor-pointer rounded-full bg-teal-500 p-2 text-white shadow-sm hover:bg-teal-600"
                            >
                              <Camera className="h-4 w-4" />
                              <span className="sr-only">Upload avatar</span>
                              <input
                                id="avatar-upload"
                                type="file"
                                accept="image/*"
                                className="hidden"
                                onChange={handleAvatarUpload}
                                disabled={uploadingAvatar}
                              />
                            </label>
                          </>
                        )}
                      </div>
                      <h2 className="text-xl font-semibold">{profile?.full_name}</h2>
                      <p className="text-sm text-muted-foreground">{user?.email}</p>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Statistics</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Clock className="h-4 w-4 text-muted-foreground" />
                          <span>Total Tasks</span>
                        </div>
                        <span className="font-medium">{stats.totalTasks}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <CheckCircle className="h-4 w-4 text-teal-500" />
                          <span>Completed</span>
                        </div>
                        <span className="font-medium">{stats.completedTasks}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Clock className="h-4 w-4 text-amber-500" />
                          <span>Pending</span>
                        </div>
                        <span className="font-medium">{stats.pendingTasks}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              <div>
                <Tabs defaultValue="profile">
                  <TabsList className="mb-6">
                    <TabsTrigger value="profile">Profile Information</TabsTrigger>
                    <TabsTrigger value="security">Security</TabsTrigger>
                  </TabsList>

                  <TabsContent value="profile">
                    <Card>
                      <CardHeader>
                        <div className="flex items-center justify-between">
                          <div>
                            <CardTitle>Profile Information</CardTitle>
                            <CardDescription>Update your personal information</CardDescription>
                          </div>
                          {!isEditing && (
                            <Button variant="outline" size="sm" onClick={() => setIsEditing(true)}>
                              <Edit className="mr-2 h-4 w-4" />
                              Edit
                            </Button>
                          )}
                        </div>
                      </CardHeader>
                      <CardContent>
                        {isEditing ? (
                          <div className="space-y-4">
                            <div className="space-y-2">
                              <Label htmlFor="fullName">Full Name</Label>
                              <Input id="fullName" value={fullName} onChange={(e) => setFullName(e.target.value)} />
                            </div>
                            <div className="space-y-2">
                              <Label htmlFor="email">Email</Label>
                              <Input id="email" value={user?.email || ""} disabled className="bg-muted" />
                              <p className="text-xs text-muted-foreground">Email cannot be changed</p>
                            </div>
                            <div className="space-y-2">
                              <Label htmlFor="bio">Bio</Label>
                              <Textarea
                                id="bio"
                                value={bio}
                                onChange={(e) => setBio(e.target.value)}
                                placeholder="Tell us a little about yourself"
                                className="min-h-[100px]"
                              />
                            </div>
                          </div>
                        ) : (
                          <div className="space-y-4">
                            <div className="space-y-1">
                              <p className="text-sm font-medium text-muted-foreground">Full Name</p>
                              <p>{profile?.full_name}</p>
                            </div>
                            <div className="space-y-1">
                              <p className="text-sm font-medium text-muted-foreground">Email</p>
                              <p>{user?.email}</p>
                            </div>
                            <div className="space-y-1">
                              <p className="text-sm font-medium text-muted-foreground">Bio</p>
                              <p>{profile?.bio || "No bio provided"}</p>
                            </div>
                          </div>
                        )}
                      </CardContent>
                      {isEditing && (
                        <CardFooter className="flex justify-end space-x-2">
                          <Button
                            variant="outline"
                            onClick={() => {
                              setIsEditing(false)
                              setFullName(profile?.full_name || "")
                              setBio(profile?.bio || "")
                            }}
                          >
                            Cancel
                          </Button>
                          <Button onClick={handleSaveProfile} disabled={isLoading}>
                            {isLoading ? (
                              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            ) : (
                              <Save className="mr-2 h-4 w-4" />
                            )}
                            Save Changes
                          </Button>
                        </CardFooter>
                      )}
                    </Card>
                  </TabsContent>

                  <TabsContent value="security">
                    <Card>
                      <CardHeader>
                        <CardTitle>Security</CardTitle>
                        <CardDescription>Manage your password and security settings</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-4">
                          <div className="space-y-2">
                            <h3 className="text-lg font-medium">Change Password</h3>
                            <p className="text-sm text-muted-foreground">
                              To change your password, use the password reset functionality.
                            </p>
                            <Button variant="outline" onClick={() => router.push("/forgot-password")}>
                              Reset Password
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </TabsContent>
                </Tabs>
              </div>
            </div>
          </div>
        </main>
      </div>
    </ProtectedRoute>
  )
}
