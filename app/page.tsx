"use client"

import { useState, useEffect } from "react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Search,
  Plus,
  Clock,
  CheckCircle,
  AlertCircle,
  XCircle,
  Users,
  TrendingUp,
  Calendar,
  Filter,
  Moon,
  Sun,
  Download,
  Trash2,
  Edit,
  MoreVertical,
  RefreshCw,
} from "lucide-react"
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  XAxis,
  YAxis,
  CartesianGrid,
  Legend,
} from "recharts"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { useTheme } from "next-themes"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"

type JobStatus = "pending" | "in-progress" | "completed" | "cancelled" | "on-hold"
type Priority = "low" | "medium" | "high" | "urgent"

interface JobCard {
  id: string
  title: string
  description: string
  status: JobStatus
  priority: Priority
  assignee: string
  createdAt: Date
  updatedAt: Date
  dueDate: Date
  estimatedHours: number
  actualHours?: number
  department: string
  tags: string[]
}

const statusConfig = {
  pending: { icon: Clock, color: "bg-yellow-500", label: "Pending" },
  "in-progress": { icon: TrendingUp, color: "bg-blue-500", label: "In Progress" },
  completed: { icon: CheckCircle, color: "bg-green-500", label: "Completed" },
  cancelled: { icon: XCircle, color: "bg-red-500", label: "Cancelled" },
  "on-hold": { icon: AlertCircle, color: "bg-orange-500", label: "On Hold" },
}

const priorityConfig = {
  low: { color: "bg-gray-500", label: "Low" },
  medium: { color: "bg-blue-500", label: "Medium" },
  high: { color: "bg-orange-500", label: "High" },
  urgent: { color: "bg-red-500", label: "Urgent" },
}

// Storage key for job cards
const STORAGE_KEY = "job-card-tracking-system"
const SYNC_EVENT_KEY = "job-cards-sync"

// Utility functions for localStorage sync
const saveJobsToStorage = (jobs: JobCard[]) => {
  const data = {
    jobs,
    lastUpdated: new Date().toISOString(),
    version: Date.now(), // Version for sync detection
  }
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data))

  // Dispatch custom event for cross-tab sync
  window.dispatchEvent(new CustomEvent(SYNC_EVENT_KEY, { detail: data }))
}

const loadJobsFromStorage = (): JobCard[] => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (!stored) return []

    const data = JSON.parse(stored)
    if (!data.jobs || !Array.isArray(data.jobs)) return []

    return data.jobs.map((job: any) => ({
      ...job,
      createdAt: new Date(job.createdAt),
      updatedAt: new Date(job.updatedAt),
      dueDate: new Date(job.dueDate),
    }))
  } catch (error) {
    console.error("Error loading jobs from storage:", error)
    return []
  }
}

const generateJobId = (existingJobs: JobCard[]): string => {
  const maxId = existingJobs.reduce((max, job) => {
    const idNum = Number.parseInt(job.id.replace("JOB-", ""))
    return idNum > max ? idNum : max
  }, 0)
  return `JOB-${String(maxId + 1).padStart(3, "0")}`
}

export default function JobCardTrackingSystem() {
  const [jobs, setJobs] = useState<JobCard[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState<JobStatus | "all">("all")
  const [priorityFilter, setPriorityFilter] = useState<Priority | "all">("all")
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [isMobileFiltersOpen, setIsMobileFiltersOpen] = useState(false)
  const [deleteJobId, setDeleteJobId] = useState<string | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)
  const [newJob, setNewJob] = useState({
    title: "",
    description: "",
    priority: "medium" as Priority,
    assignee: "",
    dueDate: "",
    estimatedHours: "",
    department: "",
    tags: "",
  })
  const [selectedDateRange, setSelectedDateRange] = useState("7d")
  const [showAnalytics, setShowAnalytics] = useState(false)
  const [lastSyncTime, setLastSyncTime] = useState<Date | null>(null)
  const { theme, setTheme } = useTheme()

  // Initialize jobs from localStorage
  useEffect(() => {
    const loadedJobs = loadJobsFromStorage()
    setJobs(loadedJobs)
    setIsLoading(false)
    setLastSyncTime(new Date())
  }, [])

  // Cross-tab synchronization
  useEffect(() => {
    const handleStorageSync = (event: CustomEvent) => {
      const { jobs: syncedJobs } = event.detail
      if (syncedJobs) {
        const parsedJobs = syncedJobs.map((job: any) => ({
          ...job,
          createdAt: new Date(job.createdAt),
          updatedAt: new Date(job.updatedAt),
          dueDate: new Date(job.dueDate),
        }))
        setJobs(parsedJobs)
        setLastSyncTime(new Date())
      }
    }

    // Listen for storage changes from other tabs
    const handleStorageChange = (event: StorageEvent) => {
      if (event.key === STORAGE_KEY && event.newValue) {
        try {
          const data = JSON.parse(event.newValue)
          if (data.jobs) {
            const parsedJobs = data.jobs.map((job: any) => ({
              ...job,
              createdAt: new Date(job.createdAt),
              updatedAt: new Date(job.updatedAt),
              dueDate: new Date(job.dueDate),
            }))
            setJobs(parsedJobs)
            setLastSyncTime(new Date())
          }
        } catch (error) {
          console.error("Error syncing jobs:", error)
        }
      }
    }

    window.addEventListener(SYNC_EVENT_KEY as any, handleStorageSync)
    window.addEventListener("storage", handleStorageChange)

    return () => {
      window.removeEventListener(SYNC_EVENT_KEY as any, handleStorageSync)
      window.removeEventListener("storage", handleStorageChange)
    }
  }, [])

  // Auto-refresh every 30 seconds to check for updates
  useEffect(() => {
    const interval = setInterval(() => {
      // Just update the last sync time to show the system is active
      setLastSyncTime(new Date())
    }, 30000)

    return () => clearInterval(interval)
  }, [])

  // Manual refresh function
  const refreshJobs = () => {
    const loadedJobs = loadJobsFromStorage()
    setJobs(loadedJobs)
    setLastSyncTime(new Date())
  }

  // Export functionality
  const exportToCSV = () => {
    const headers = [
      "ID",
      "Title",
      "Status",
      "Priority",
      "Assignee",
      "Department",
      "Due Date",
      "Estimated Hours",
      "Actual Hours",
    ]
    const csvContent = [
      headers.join(","),
      ...filteredJobs.map((job) =>
        [
          job.id,
          `"${job.title}"`,
          job.status,
          job.priority,
          `"${job.assignee}"`,
          `"${job.department}"`,
          job.dueDate.toISOString().split("T")[0],
          job.estimatedHours,
          job.actualHours || "",
        ].join(","),
      ),
    ].join("\n")

    const blob = new Blob([csvContent], { type: "text/csv" })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `job-cards-${new Date().toISOString().split("T")[0]}.csv`
    a.click()
    window.URL.revokeObjectURL(url)
  }

  const filteredJobs = jobs.filter((job) => {
    const matchesSearch =
      job.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      job.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      job.assignee.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = statusFilter === "all" || job.status === statusFilter
    const matchesPriority = priorityFilter === "all" || job.priority === priorityFilter

    return matchesSearch && matchesStatus && matchesPriority
  })

  const updateJobStatus = (jobId: string, newStatus: JobStatus) => {
    const updatedJobs = jobs.map((job) =>
      job.id === jobId ? { ...job, status: newStatus, updatedAt: new Date() } : job,
    )
    setJobs(updatedJobs)
    saveJobsToStorage(updatedJobs)
  }

  const deleteJob = async (jobId: string) => {
    setIsDeleting(true)

    // Simulate API call delay
    await new Promise((resolve) => setTimeout(resolve, 500))

    const updatedJobs = jobs.filter((job) => job.id !== jobId)
    setJobs(updatedJobs)
    saveJobsToStorage(updatedJobs)

    setDeleteJobId(null)
    setIsDeleting(false)
  }

  const handleDeleteClick = (jobId: string) => {
    setDeleteJobId(jobId)
  }

  const confirmDelete = () => {
    if (deleteJobId) {
      deleteJob(deleteJobId)
    }
  }

  const cancelDelete = () => {
    setDeleteJobId(null)
  }

  const createJob = () => {
    if (!newJob.title || !newJob.assignee) return

    const job: JobCard = {
      id: generateJobId(jobs),
      title: newJob.title,
      description: newJob.description,
      status: "pending",
      priority: newJob.priority,
      assignee: newJob.assignee,
      createdAt: new Date(),
      updatedAt: new Date(),
      dueDate: new Date(newJob.dueDate),
      estimatedHours: Number.parseInt(newJob.estimatedHours) || 0,
      department: newJob.department,
      tags: newJob.tags
        .split(",")
        .map((tag) => tag.trim())
        .filter(Boolean),
    }

    const updatedJobs = [...jobs, job]
    setJobs(updatedJobs)
    saveJobsToStorage(updatedJobs)

    setNewJob({
      title: "",
      description: "",
      priority: "medium",
      assignee: "",
      dueDate: "",
      estimatedHours: "",
      department: "",
      tags: "",
    })
    setIsCreateDialogOpen(false)
  }

  const getStatusCounts = () => {
    return {
      total: jobs.length,
      pending: jobs.filter((job) => job.status === "pending").length,
      inProgress: jobs.filter((job) => job.status === "in-progress").length,
      completed: jobs.filter((job) => job.status === "completed").length,
      onHold: jobs.filter((job) => job.status === "on-hold").length,
    }
  }

  const statusCounts = getStatusCounts()

  const getCompletionTrends = () => {
    const last7Days = Array.from({ length: 7 }, (_, i) => {
      const date = new Date()
      date.setDate(date.getDate() - (6 - i))
      const dayJobs = jobs.filter((job) => {
        const jobDate = new Date(job.createdAt)
        return jobDate.toDateString() === date.toDateString()
      })
      const completedJobs = jobs.filter((job) => {
        const jobDate = new Date(job.updatedAt)
        return jobDate.toDateString() === date.toDateString() && job.status === "completed"
      })
      return {
        date: date.toLocaleDateString("en-US", { month: "short", day: "numeric" }),
        completed: completedJobs.length,
        created: dayJobs.length,
      }
    })
    return last7Days
  }

  const getStatusDistribution = () => {
    return [
      { name: "Completed", value: statusCounts.completed, color: "#10b981" },
      { name: "In Progress", value: statusCounts.inProgress, color: "#3b82f6" },
      { name: "Pending", value: statusCounts.pending, color: "#f59e0b" },
      { name: "On Hold", value: statusCounts.onHold, color: "#f97316" },
    ]
  }

  const getDepartmentPerformance = () => {
    const departments = [...new Set(jobs.map((job) => job.department).filter(Boolean))]
    return departments.map((dept) => ({
      department: dept,
      completed: jobs.filter((job) => job.department === dept && job.status === "completed").length,
      total: jobs.filter((job) => job.department === dept).length,
      efficiency:
        Math.round(
          (jobs.filter((job) => job.department === dept && job.status === "completed").length /
            jobs.filter((job) => job.department === dept).length) *
            100,
        ) || 0,
    }))
  }

  const getPriorityDistribution = () => {
    return [
      { name: "Low", value: jobs.filter((job) => job.priority === "low").length, color: "#6b7280" },
      { name: "Medium", value: jobs.filter((job) => job.priority === "medium").length, color: "#3b82f6" },
      { name: "High", value: jobs.filter((job) => job.priority === "high").length, color: "#f97316" },
      { name: "Urgent", value: jobs.filter((job) => job.priority === "urgent").length, color: "#ef4444" },
    ]
  }

  const getTimeTrackingData = () => {
    return jobs
      .filter((job) => job.actualHours)
      .map((job) => ({
        id: job.id,
        title: job.title.substring(0, 20) + "...",
        estimated: job.estimatedHours,
        actual: job.actualHours || 0,
        variance: (((job.actualHours || 0) - job.estimatedHours) / job.estimatedHours) * 100,
      }))
  }

  const getAssigneePerformance = () => {
    const assignees = [...new Set(jobs.map((job) => job.assignee).filter(Boolean))]
    return assignees.map((assignee) => {
      const assigneeJobs = jobs.filter((job) => job.assignee === assignee)
      const completedJobs = assigneeJobs.filter((job) => job.status === "completed")
      return {
        assignee: assignee.split(" ")[0], // First name only for chart
        completed: completedJobs.length,
        total: assigneeJobs.length,
        avgHours: completedJobs.reduce((sum, job) => sum + (job.actualHours || 0), 0) / completedJobs.length || 0,
      }
    })
  }

  const jobToDelete = jobs.find((job) => job.id === deleteJobId)

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="text-muted-foreground">Loading job tracking system...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Mobile Header */}
      <div className="lg:hidden sticky top-0 z-50 bg-background border-b px-4 py-3">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold">Job Tracker</h1>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <span>{statusCounts.total} jobs</span>
              {lastSyncTime && <span>• Synced {lastSyncTime.toLocaleTimeString()}</span>}
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="icon" onClick={refreshJobs}>
              <RefreshCw className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="icon" onClick={() => setTheme(theme === "light" ? "dark" : "light")}>
              <Sun className="h-4 w-4 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
              <Moon className="absolute h-4 w-4 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
            </Button>
            <Sheet open={isMobileFiltersOpen} onOpenChange={setIsMobileFiltersOpen}>
              <SheetTrigger asChild>
                <Button variant="outline" size="icon">
                  <Filter className="h-4 w-4" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-80">
                <SheetHeader>
                  <SheetTitle>Filters & Actions</SheetTitle>
                  <SheetDescription>Filter jobs and access quick actions</SheetDescription>
                </SheetHeader>
                <div className="space-y-4 mt-6">
                  <div>
                    <Label htmlFor="mobile-search">Search</Label>
                    <div className="relative mt-1">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                      <Input
                        id="mobile-search"
                        placeholder="Search jobs..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10"
                      />
                    </div>
                  </div>
                  <div>
                    <Label>Status Filter</Label>
                    <Select value={statusFilter} onValueChange={(value: JobStatus | "all") => setStatusFilter(value)}>
                      <SelectTrigger className="mt-1">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Statuses</SelectItem>
                        <SelectItem value="pending">Pending</SelectItem>
                        <SelectItem value="in-progress">In Progress</SelectItem>
                        <SelectItem value="completed">Completed</SelectItem>
                        <SelectItem value="on-hold">On Hold</SelectItem>
                        <SelectItem value="cancelled">Cancelled</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>Priority Filter</Label>
                    <Select
                      value={priorityFilter}
                      onValueChange={(value: Priority | "all") => setPriorityFilter(value)}
                    >
                      <SelectTrigger className="mt-1">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Priorities</SelectItem>
                        <SelectItem value="low">Low</SelectItem>
                        <SelectItem value="medium">Medium</SelectItem>
                        <SelectItem value="high">High</SelectItem>
                        <SelectItem value="urgent">Urgent</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="pt-4 space-y-2">
                    <Button onClick={exportToCSV} className="w-full bg-transparent" variant="outline">
                      <Download className="w-4 h-4 mr-2" />
                      Export CSV
                    </Button>
                    <Button
                      onClick={() => setShowAnalytics(!showAnalytics)}
                      className="w-full"
                      variant={showAnalytics ? "default" : "outline"}
                    >
                      <TrendingUp className="w-4 h-4 mr-2" />
                      {showAnalytics ? "Hide Analytics" : "Show Analytics"}
                    </Button>
                  </div>
                </div>
              </SheetContent>
            </Sheet>
            <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
              <DialogTrigger asChild>
                <Button size="icon">
                  <Plus className="h-4 w-4" />
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-sm mx-4">
                <DialogHeader>
                  <DialogTitle>Create Job Card</DialogTitle>
                  <DialogDescription>Fill in the details to create a new job card.</DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="title">Title</Label>
                    <Input
                      id="title"
                      value={newJob.title}
                      onChange={(e) => setNewJob({ ...newJob, title: e.target.value })}
                      placeholder="Job title"
                    />
                  </div>
                  <div>
                    <Label htmlFor="description">Description</Label>
                    <Textarea
                      id="description"
                      value={newJob.description}
                      onChange={(e) => setNewJob({ ...newJob, description: e.target.value })}
                      placeholder="Job description"
                      rows={3}
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="priority">Priority</Label>
                      <Select
                        value={newJob.priority}
                        onValueChange={(value: Priority) => setNewJob({ ...newJob, priority: value })}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="low">Low</SelectItem>
                          <SelectItem value="medium">Medium</SelectItem>
                          <SelectItem value="high">High</SelectItem>
                          <SelectItem value="urgent">Urgent</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="estimatedHours">Est. Hours</Label>
                      <Input
                        id="estimatedHours"
                        type="number"
                        value={newJob.estimatedHours}
                        onChange={(e) => setNewJob({ ...newJob, estimatedHours: e.target.value })}
                        placeholder="8"
                      />
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="assignee">Assignee</Label>
                    <Input
                      id="assignee"
                      value={newJob.assignee}
                      onChange={(e) => setNewJob({ ...newJob, assignee: e.target.value })}
                      placeholder="John Doe"
                    />
                  </div>
                  <div>
                    <Label htmlFor="department">Department</Label>
                    <Input
                      id="department"
                      value={newJob.department}
                      onChange={(e) => setNewJob({ ...newJob, department: e.target.value })}
                      placeholder="IT"
                    />
                  </div>
                  <div>
                    <Label htmlFor="dueDate">Due Date</Label>
                    <Input
                      id="dueDate"
                      type="datetime-local"
                      value={newJob.dueDate}
                      onChange={(e) => setNewJob({ ...newJob, dueDate: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label htmlFor="tags">Tags (comma separated)</Label>
                    <Input
                      id="tags"
                      value={newJob.tags}
                      onChange={(e) => setNewJob({ ...newJob, tags: e.target.value })}
                      placeholder="maintenance, urgent"
                    />
                  </div>
                  <Button onClick={createJob} className="w-full">
                    Create Job Card
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </div>

      {/* Desktop Header */}
      <div className="hidden lg:block p-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">Job Card Tracking System</h1>
              <div className="flex items-center gap-4 text-gray-600 dark:text-gray-400 mt-1">
                <p>Real-time job management and tracking dashboard</p>
                {lastSyncTime && <span className="text-sm">• Last synced: {lastSyncTime.toLocaleTimeString()}</span>}
              </div>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="icon" onClick={refreshJobs}>
                <RefreshCw className="h-4 w-4" />
              </Button>
              <Button variant="outline" size="icon" onClick={() => setTheme(theme === "light" ? "dark" : "light")}>
                <Sun className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
                <Moon className="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
                <span className="sr-only">Toggle theme</span>
              </Button>
              <Button variant="outline" onClick={exportToCSV}>
                <Download className="w-4 h-4 mr-2" />
                Export CSV
              </Button>
              <Button variant={showAnalytics ? "default" : "outline"} onClick={() => setShowAnalytics(!showAnalytics)}>
                <TrendingUp className="w-4 h-4 mr-2" />
                {showAnalytics ? "Hide Analytics" : "Show Analytics"}
              </Button>
              <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
                <DialogTrigger asChild>
                  <Button>
                    <Plus className="w-4 h-4 mr-2" />
                    Create Job Card
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-md">
                  <DialogHeader>
                    <DialogTitle>Create New Job Card</DialogTitle>
                    <DialogDescription>Fill in the details to create a new job card.</DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="title">Title</Label>
                      <Input
                        id="title"
                        value={newJob.title}
                        onChange={(e) => setNewJob({ ...newJob, title: e.target.value })}
                        placeholder="Job title"
                      />
                    </div>
                    <div>
                      <Label htmlFor="description">Description</Label>
                      <Textarea
                        id="description"
                        value={newJob.description}
                        onChange={(e) => setNewJob({ ...newJob, description: e.target.value })}
                        placeholder="Job description"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="priority">Priority</Label>
                        <Select
                          value={newJob.priority}
                          onValueChange={(value: Priority) => setNewJob({ ...newJob, priority: value })}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="low">Low</SelectItem>
                            <SelectItem value="medium">Medium</SelectItem>
                            <SelectItem value="high">High</SelectItem>
                            <SelectItem value="urgent">Urgent</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label htmlFor="estimatedHours">Est. Hours</Label>
                        <Input
                          id="estimatedHours"
                          type="number"
                          value={newJob.estimatedHours}
                          onChange={(e) => setNewJob({ ...newJob, estimatedHours: e.target.value })}
                          placeholder="8"
                        />
                      </div>
                    </div>
                    <div>
                      <Label htmlFor="assignee">Assignee</Label>
                      <Input
                        id="assignee"
                        value={newJob.assignee}
                        onChange={(e) => setNewJob({ ...newJob, assignee: e.target.value })}
                        placeholder="John Doe"
                      />
                    </div>
                    <div>
                      <Label htmlFor="department">Department</Label>
                      <Input
                        id="department"
                        value={newJob.department}
                        onChange={(e) => setNewJob({ ...newJob, department: e.target.value })}
                        placeholder="IT"
                      />
                    </div>
                    <div>
                      <Label htmlFor="dueDate">Due Date</Label>
                      <Input
                        id="dueDate"
                        type="datetime-local"
                        value={newJob.dueDate}
                        onChange={(e) => setNewJob({ ...newJob, dueDate: e.target.value })}
                      />
                    </div>
                    <div>
                      <Label htmlFor="tags">Tags (comma separated)</Label>
                      <Input
                        id="tags"
                        value={newJob.tags}
                        onChange={(e) => setNewJob({ ...newJob, tags: e.target.value })}
                        placeholder="maintenance, urgent, server"
                      />
                    </div>
                    <Button onClick={createJob} className="w-full">
                      Create Job Card
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          </div>
        </div>
      </div>

      <div className="px-4 lg:px-6 pb-6">
        <div className="max-w-7xl mx-auto space-y-6">
          {/* Delete Confirmation Dialog */}
          <AlertDialog open={!!deleteJobId} onOpenChange={() => setDeleteJobId(null)}>
            <AlertDialogContent className="mx-4 max-w-sm lg:max-w-lg lg:mx-auto">
              <AlertDialogHeader>
                <AlertDialogTitle>Delete Job Card</AlertDialogTitle>
                <AlertDialogDescription>
                  Are you sure you want to delete "{jobToDelete?.title}"? This action cannot be undone and will
                  permanently remove the job card and all its data.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter className="flex-col sm:flex-row gap-2">
                <AlertDialogCancel onClick={cancelDelete} disabled={isDeleting} className="w-full sm:w-auto">
                  Cancel
                </AlertDialogCancel>
                <AlertDialogAction
                  onClick={confirmDelete}
                  disabled={isDeleting}
                  className="bg-red-600 hover:bg-red-700 focus:ring-red-600 w-full sm:w-auto"
                >
                  {isDeleting ? (
                    <>
                      <div className="loading-spinner mr-2" />
                      Deleting...
                    </>
                  ) : (
                    <>
                      <Trash2 className="w-4 h-4 mr-2" />
                      Delete Job
                    </>
                  )}
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>

          {/* Empty State */}
          {jobs.length === 0 && (
            <Card className="text-center py-12">
              <CardContent>
                <div className="space-y-4">
                  <div className="mx-auto w-16 h-16 bg-muted rounded-full flex items-center justify-center">
                    <Users className="w-8 h-8 text-muted-foreground" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold">No Job Cards Yet</h3>
                    <p className="text-muted-foreground">Get started by creating your first job card.</p>
                  </div>
                  <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
                    <DialogTrigger asChild>
                      <Button>
                        <Plus className="w-4 h-4 mr-2" />
                        Create Your First Job Card
                      </Button>
                    </DialogTrigger>
                  </Dialog>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Show content only if there are jobs */}
          {jobs.length > 0 && (
            <>
              {/* Mobile Stats Cards */}
              <div className="lg:hidden grid grid-cols-2 gap-3">
                <Card className="p-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs text-muted-foreground">Total</p>
                      <p className="text-lg font-bold">{statusCounts.total}</p>
                    </div>
                    <Users className="h-4 w-4 text-muted-foreground" />
                  </div>
                </Card>
                <Card className="p-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs text-muted-foreground">Pending</p>
                      <p className="text-lg font-bold text-yellow-600">{statusCounts.pending}</p>
                    </div>
                    <Clock className="h-4 w-4 text-yellow-600" />
                  </div>
                </Card>
                <Card className="p-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs text-muted-foreground">In Progress</p>
                      <p className="text-lg font-bold text-blue-600">{statusCounts.inProgress}</p>
                    </div>
                    <TrendingUp className="h-4 w-4 text-blue-600" />
                  </div>
                </Card>
                <Card className="p-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs text-muted-foreground">Completed</p>
                      <p className="text-lg font-bold text-green-600">{statusCounts.completed}</p>
                    </div>
                    <CheckCircle className="h-4 w-4 text-green-600" />
                  </div>
                </Card>
              </div>

              {/* Desktop Stats Cards */}
              <div className="hidden lg:grid grid-cols-1 md:grid-cols-5 gap-4">
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Total Jobs</CardTitle>
                    <Users className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{statusCounts.total}</div>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Pending</CardTitle>
                    <Clock className="h-4 w-4 text-yellow-600" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-yellow-600">{statusCounts.pending}</div>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">In Progress</CardTitle>
                    <TrendingUp className="h-4 w-4 text-blue-600" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-blue-600">{statusCounts.inProgress}</div>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Completed</CardTitle>
                    <CheckCircle className="h-4 w-4 text-green-600" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-green-600">{statusCounts.completed}</div>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">On Hold</CardTitle>
                    <AlertCircle className="h-4 w-4 text-orange-600" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-orange-600">{statusCounts.onHold}</div>
                  </CardContent>
                </Card>
              </div>

              {/* Analytics Dashboard */}
              {showAnalytics && (
                <div className="space-y-6">
                  <Card>
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <CardTitle className="flex items-center gap-2">
                          <TrendingUp className="w-5 h-5" />
                          Performance Analytics
                        </CardTitle>
                        <Select value={selectedDateRange} onValueChange={setSelectedDateRange}>
                          <SelectTrigger className="w-32">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="7d">Last 7 days</SelectItem>
                            <SelectItem value="30d">Last 30 days</SelectItem>
                            <SelectItem value="90d">Last 90 days</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </CardHeader>
                  </Card>

                  {/* Charts Grid */}
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Job Completion Trends */}
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-base lg:text-lg">Job Completion Trends</CardTitle>
                        <CardDescription className="text-sm">
                          Daily job creation vs completion over the last 7 days
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <ChartContainer
                          config={{
                            completed: {
                              label: "Completed",
                              color: "hsl(var(--chart-1))",
                            },
                            created: {
                              label: "Created",
                              color: "hsl(var(--chart-2))",
                            },
                          }}
                          className="h-[250px] lg:h-[300px]"
                        >
                          <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={getCompletionTrends()}>
                              <CartesianGrid strokeDasharray="3 3" />
                              <XAxis dataKey="date" fontSize={12} />
                              <YAxis fontSize={12} />
                              <ChartTooltip content={<ChartTooltipContent />} />
                              <Area
                                type="monotone"
                                dataKey="completed"
                                stackId="1"
                                stroke="var(--color-completed)"
                                fill="var(--color-completed)"
                                fillOpacity={0.6}
                              />
                              <Area
                                type="monotone"
                                dataKey="created"
                                stackId="1"
                                stroke="var(--color-created)"
                                fill="var(--color-created)"
                                fillOpacity={0.6}
                              />
                            </AreaChart>
                          </ResponsiveContainer>
                        </ChartContainer>
                      </CardContent>
                    </Card>

                    {/* Status Distribution */}
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-base lg:text-lg">Status Distribution</CardTitle>
                        <CardDescription className="text-sm">Current distribution of job statuses</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <ChartContainer
                          config={{
                            completed: { label: "Completed", color: "#10b981" },
                            inProgress: { label: "In Progress", color: "#3b82f6" },
                            pending: { label: "Pending", color: "#f59e0b" },
                            onHold: { label: "On Hold", color: "#f97316" },
                          }}
                          className="h-[250px] lg:h-[300px]"
                        >
                          <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                              <Pie
                                data={getStatusDistribution()}
                                cx="50%"
                                cy="50%"
                                innerRadius={40}
                                outerRadius={80}
                                paddingAngle={5}
                                dataKey="value"
                              >
                                {getStatusDistribution().map((entry, index) => (
                                  <Cell key={`cell-${index}`} fill={entry.color} />
                                ))}
                              </Pie>
                              <ChartTooltip content={<ChartTooltipContent />} />
                              <Legend />
                            </PieChart>
                          </ResponsiveContainer>
                        </ChartContainer>
                      </CardContent>
                    </Card>

                    {/* Department Performance */}
                    {getDepartmentPerformance().length > 0 && (
                      <Card>
                        <CardHeader>
                          <CardTitle className="text-base lg:text-lg">Department Performance</CardTitle>
                          <CardDescription className="text-sm">Completion efficiency by department</CardDescription>
                        </CardHeader>
                        <CardContent>
                          <ChartContainer
                            config={{
                              efficiency: {
                                label: "Efficiency %",
                                color: "hsl(var(--chart-3))",
                              },
                            }}
                            className="h-[250px] lg:h-[300px]"
                          >
                            <ResponsiveContainer width="100%" height="100%">
                              <BarChart data={getDepartmentPerformance()}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="department" fontSize={12} />
                                <YAxis fontSize={12} />
                                <ChartTooltip content={<ChartTooltipContent />} />
                                <Bar dataKey="efficiency" fill="var(--color-efficiency)" radius={[4, 4, 0, 0]} />
                              </BarChart>
                            </ResponsiveContainer>
                          </ChartContainer>
                        </CardContent>
                      </Card>
                    )}

                    {/* Priority Distribution */}
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-base lg:text-lg">Priority Distribution</CardTitle>
                        <CardDescription className="text-sm">Jobs breakdown by priority level</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <ChartContainer
                          config={{
                            low: { label: "Low", color: "#6b7280" },
                            medium: { label: "Medium", color: "#3b82f6" },
                            high: { label: "High", color: "#f97316" },
                            urgent: { label: "Urgent", color: "#ef4444" },
                          }}
                          className="h-[250px] lg:h-[300px]"
                        >
                          <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={getPriorityDistribution()} layout="horizontal">
                              <CartesianGrid strokeDasharray="3 3" />
                              <XAxis type="number" fontSize={12} />
                              <YAxis dataKey="name" type="category" fontSize={12} />
                              <ChartTooltip content={<ChartTooltipContent />} />
                              <Bar dataKey="value" radius={[0, 4, 4, 0]}>
                                {getPriorityDistribution().map((entry, index) => (
                                  <Cell key={`cell-${index}`} fill={entry.color} />
                                ))}
                              </Bar>
                            </BarChart>
                          </ResponsiveContainer>
                        </ChartContainer>
                      </CardContent>
                    </Card>
                  </div>

                  {/* Time Tracking Analysis */}
                  {getTimeTrackingData().length > 0 && (
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-base lg:text-lg">Time Tracking Analysis</CardTitle>
                        <CardDescription className="text-sm">
                          Estimated vs actual hours for completed jobs
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <ChartContainer
                          config={{
                            estimated: {
                              label: "Estimated Hours",
                              color: "hsl(var(--chart-4))",
                            },
                            actual: {
                              label: "Actual Hours",
                              color: "hsl(var(--chart-5))",
                            },
                          }}
                          className="h-[300px] lg:h-[400px]"
                        >
                          <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={getTimeTrackingData()}>
                              <CartesianGrid strokeDasharray="3 3" />
                              <XAxis dataKey="title" angle={-45} textAnchor="end" height={100} fontSize={10} />
                              <YAxis fontSize={12} />
                              <ChartTooltip content={<ChartTooltipContent />} />
                              <Legend />
                              <Bar dataKey="estimated" fill="var(--color-estimated)" name="Estimated Hours" />
                              <Bar dataKey="actual" fill="var(--color-actual)" name="Actual Hours" />
                            </BarChart>
                          </ResponsiveContainer>
                        </ChartContainer>
                      </CardContent>
                    </Card>
                  )}

                  {/* Assignee Performance */}
                  {getAssigneePerformance().length > 0 && (
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-base lg:text-lg">Assignee Performance</CardTitle>
                        <CardDescription className="text-sm">
                          Job completion and average hours by team member
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                          <div>
                            <h4 className="text-sm font-medium mb-4">Jobs Completed</h4>
                            <ChartContainer
                              config={{
                                completed: {
                                  label: "Completed Jobs",
                                  color: "hsl(var(--chart-1))",
                                },
                              }}
                              className="h-[200px] lg:h-[250px]"
                            >
                              <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={getAssigneePerformance()}>
                                  <CartesianGrid strokeDasharray="3 3" />
                                  <XAxis dataKey="assignee" fontSize={12} />
                                  <YAxis fontSize={12} />
                                  <ChartTooltip content={<ChartTooltipContent />} />
                                  <Bar dataKey="completed" fill="var(--color-completed)" radius={[4, 4, 0, 0]} />
                                </BarChart>
                              </ResponsiveContainer>
                            </ChartContainer>
                          </div>
                          <div>
                            <h4 className="text-sm font-medium mb-4">Average Hours per Job</h4>
                            <ChartContainer
                              config={{
                                avgHours: {
                                  label: "Average Hours",
                                  color: "hsl(var(--chart-2))",
                                },
                              }}
                              className="h-[200px] lg:h-[250px]"
                            >
                              <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={getAssigneePerformance()}>
                                  <CartesianGrid strokeDasharray="3 3" />
                                  <XAxis dataKey="assignee" fontSize={12} />
                                  <YAxis fontSize={12} />
                                  <ChartTooltip content={<ChartTooltipContent />} />
                                  <Bar dataKey="avgHours" fill="var(--color-avgHours)" radius={[4, 4, 0, 0]} />
                                </BarChart>
                              </ResponsiveContainer>
                            </ChartContainer>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  )}

                  {/* Key Performance Indicators */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-base lg:text-lg">Key Performance Indicators</CardTitle>
                      <CardDescription className="text-sm">Important metrics and insights</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                        <div className="text-center p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
                          <div className="text-xl lg:text-2xl font-bold text-green-600">
                            {statusCounts.total > 0
                              ? Math.round((statusCounts.completed / statusCounts.total) * 100)
                              : 0}
                            %
                          </div>
                          <div className="text-xs lg:text-sm text-green-700 dark:text-green-400">Completion Rate</div>
                        </div>
                        <div className="text-center p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                          <div className="text-xl lg:text-2xl font-bold text-blue-600">
                            {jobs.filter((job) => new Date() > job.dueDate && job.status !== "completed").length}
                          </div>
                          <div className="text-xs lg:text-sm text-blue-700 dark:text-blue-400">Overdue Jobs</div>
                        </div>
                        <div className="text-center p-4 bg-orange-50 dark:bg-orange-900/20 rounded-lg">
                          <div className="text-xl lg:text-2xl font-bold text-orange-600">
                            {Math.round(
                              jobs
                                .filter((job) => job.actualHours)
                                .reduce((sum, job) => sum + (job.actualHours || 0), 0) /
                                jobs.filter((job) => job.actualHours).length,
                            ) || 0}
                            h
                          </div>
                          <div className="text-xs lg:text-sm text-orange-700 dark:text-orange-400">
                            Avg. Job Duration
                          </div>
                        </div>
                        <div className="text-center p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                          <div className="text-xl lg:text-2xl font-bold text-purple-600">
                            {jobs.filter((job) => job.priority === "urgent").length}
                          </div>
                          <div className="text-xs lg:text-sm text-purple-700 dark:text-purple-400">Urgent Jobs</div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              )}

              {/* Desktop Filters */}
              <Card className="hidden lg:block">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Filter className="w-5 h-5" />
                    Filters & Search
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-col md:flex-row gap-4">
                    <div className="flex-1">
                      <div className="relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                        <Input
                          placeholder="Search jobs, assignees, or descriptions..."
                          value={searchTerm}
                          onChange={(e) => setSearchTerm(e.target.value)}
                          className="pl-10"
                        />
                      </div>
                    </div>
                    <Select value={statusFilter} onValueChange={(value: JobStatus | "all") => setStatusFilter(value)}>
                      <SelectTrigger className="w-full md:w-48">
                        <SelectValue placeholder="Filter by status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Statuses</SelectItem>
                        <SelectItem value="pending">Pending</SelectItem>
                        <SelectItem value="in-progress">In Progress</SelectItem>
                        <SelectItem value="completed">Completed</SelectItem>
                        <SelectItem value="on-hold">On Hold</SelectItem>
                        <SelectItem value="cancelled">Cancelled</SelectItem>
                      </SelectContent>
                    </Select>
                    <Select
                      value={priorityFilter}
                      onValueChange={(value: Priority | "all") => setPriorityFilter(value)}
                    >
                      <SelectTrigger className="w-full md:w-48">
                        <SelectValue placeholder="Filter by priority" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Priorities</SelectItem>
                        <SelectItem value="low">Low</SelectItem>
                        <SelectItem value="medium">Medium</SelectItem>
                        <SelectItem value="high">High</SelectItem>
                        <SelectItem value="urgent">Urgent</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </CardContent>
              </Card>

              {/* Job Cards */}
              <Tabs defaultValue="grid" className="w-full">
                <TabsList className="hidden lg:inline-flex">
                  <TabsTrigger value="grid">Grid View</TabsTrigger>
                  <TabsTrigger value="list">List View</TabsTrigger>
                </TabsList>

                <TabsContent value="grid">
                  {/* Mobile Grid */}
                  <div className="lg:hidden space-y-4">
                    {filteredJobs.map((job) => {
                      const StatusIcon = statusConfig[job.status].icon
                      const isOverdue = new Date() > job.dueDate && job.status !== "completed"

                      return (
                        <Card
                          key={job.id}
                          className={`${isOverdue ? "border-red-300 bg-red-50 dark:bg-red-900/20" : ""}`}
                        >
                          <CardHeader className="pb-3">
                            <div className="flex items-start justify-between">
                              <div className="space-y-1 flex-1">
                                <CardTitle className="text-base leading-tight">{job.title}</CardTitle>
                                <CardDescription className="text-xs">{job.id}</CardDescription>
                              </div>
                              <div className="flex items-center gap-2 ml-2">
                                <Badge
                                  variant="outline"
                                  className={`${priorityConfig[job.priority].color} text-white text-xs`}
                                >
                                  {priorityConfig[job.priority].label}
                                </Badge>
                                <DropdownMenu>
                                  <DropdownMenuTrigger asChild>
                                    <Button variant="ghost" size="icon" className="h-8 w-8">
                                      <MoreVertical className="h-4 w-4" />
                                    </Button>
                                  </DropdownMenuTrigger>
                                  <DropdownMenuContent align="end">
                                    <DropdownMenuItem>
                                      <Edit className="w-4 h-4 mr-2" />
                                      Edit
                                    </DropdownMenuItem>
                                    <DropdownMenuItem
                                      onClick={() => handleDeleteClick(job.id)}
                                      className="text-red-600"
                                    >
                                      <Trash2 className="w-4 h-4 mr-2" />
                                      Delete
                                    </DropdownMenuItem>
                                  </DropdownMenuContent>
                                </DropdownMenu>
                              </div>
                            </div>
                          </CardHeader>
                          <CardContent className="space-y-3">
                            <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2">{job.description}</p>

                            <div className="flex items-center justify-between">
                              <Select
                                value={job.status}
                                onValueChange={(value: JobStatus) => updateJobStatus(job.id, value)}
                              >
                                <SelectTrigger className="w-28 h-8">
                                  <div className="flex items-center gap-1">
                                    <StatusIcon className="w-3 h-3" />
                                    <SelectValue />
                                  </div>
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="pending">Pending</SelectItem>
                                  <SelectItem value="in-progress">In Progress</SelectItem>
                                  <SelectItem value="completed">Completed</SelectItem>
                                  <SelectItem value="on-hold">On Hold</SelectItem>
                                  <SelectItem value="cancelled">Cancelled</SelectItem>
                                </SelectContent>
                              </Select>

                              <div className="text-right">
                                <div className="text-sm font-medium">{job.assignee}</div>
                                <div className="text-xs text-gray-500 dark:text-gray-400">{job.department}</div>
                              </div>
                            </div>

                            <div className="flex items-center justify-between text-xs">
                              <div className="flex items-center gap-1 text-gray-500 dark:text-gray-400">
                                <Calendar className="w-3 h-3" />
                                <span>Due: {job.dueDate.toLocaleDateString()}</span>
                              </div>
                              <div className="text-gray-500 dark:text-gray-400">
                                {job.actualHours ? `${job.actualHours}h` : `Est: ${job.estimatedHours}h`}
                              </div>
                            </div>

                            {job.tags.length > 0 && (
                              <div className="flex flex-wrap gap-1">
                                {job.tags.slice(0, 3).map((tag, index) => (
                                  <Badge key={index} variant="secondary" className="text-xs px-2 py-0">
                                    {tag}
                                  </Badge>
                                ))}
                                {job.tags.length > 3 && (
                                  <Badge variant="secondary" className="text-xs px-2 py-0">
                                    +{job.tags.length - 3}
                                  </Badge>
                                )}
                              </div>
                            )}

                            {isOverdue && (
                              <div className="flex items-center gap-1 text-red-600 text-xs font-medium">
                                <AlertCircle className="w-3 h-3" />
                                Overdue
                              </div>
                            )}
                          </CardContent>
                        </Card>
                      )
                    })}
                  </div>

                  {/* Desktop Grid */}
                  <div className="hidden lg:grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredJobs.map((job) => {
                      const StatusIcon = statusConfig[job.status].icon
                      const isOverdue = new Date() > job.dueDate && job.status !== "completed"

                      return (
                        <Card
                          key={job.id}
                          className={`relative job-card-hover ${isOverdue ? "border-red-300 bg-red-50 dark:bg-red-900/20" : ""}`}
                        >
                          <CardHeader className="pb-3">
                            <div className="flex items-start justify-between">
                              <div className="space-y-1">
                                <CardTitle className="text-lg">{job.title}</CardTitle>
                                <CardDescription className="text-sm">{job.id}</CardDescription>
                              </div>
                              <div className="flex items-center gap-2">
                                <Badge variant="outline" className={`${priorityConfig[job.priority].color} text-white`}>
                                  {priorityConfig[job.priority].label}
                                </Badge>
                              </div>
                            </div>
                          </CardHeader>
                          <CardContent className="space-y-4">
                            <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2">{job.description}</p>

                            <div className="flex items-center justify-between">
                              <Select
                                value={job.status}
                                onValueChange={(value: JobStatus) => updateJobStatus(job.id, value)}
                              >
                                <SelectTrigger className="w-32">
                                  <div className="flex items-center gap-2">
                                    <StatusIcon className="w-4 h-4" />
                                    <SelectValue />
                                  </div>
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="pending">Pending</SelectItem>
                                  <SelectItem value="in-progress">In Progress</SelectItem>
                                  <SelectItem value="completed">Completed</SelectItem>
                                  <SelectItem value="on-hold">On Hold</SelectItem>
                                  <SelectItem value="cancelled">Cancelled</SelectItem>
                                </SelectContent>
                              </Select>

                              <div className="text-right">
                                <div className="text-sm font-medium">{job.assignee}</div>
                                <div className="text-xs text-gray-500 dark:text-gray-400">{job.department}</div>
                              </div>
                            </div>

                            <div className="flex items-center justify-between text-sm">
                              <div className="flex items-center gap-1 text-gray-500 dark:text-gray-400">
                                <Calendar className="w-4 h-4" />
                                <span>Due: {job.dueDate.toLocaleDateString()}</span>
                              </div>
                              <div className="text-gray-500 dark:text-gray-400">
                                {job.actualHours ? `${job.actualHours}h` : `Est: ${job.estimatedHours}h`}
                              </div>
                            </div>

                            {job.tags.length > 0 && (
                              <div className="flex flex-wrap gap-1">
                                {job.tags.map((tag, index) => (
                                  <Badge key={index} variant="secondary" className="text-xs">
                                    {tag}
                                  </Badge>
                                ))}
                              </div>
                            )}

                            {isOverdue && (
                              <div className="flex items-center gap-1 text-red-600 text-sm font-medium">
                                <AlertCircle className="w-4 h-4" />
                                Overdue
                              </div>
                            )}

                            {/* Action Buttons */}
                            <div className="flex items-center justify-between pt-2 border-t">
                              <Button variant="outline" size="sm" className="flex items-center gap-2 bg-transparent">
                                <Edit className="w-4 h-4" />
                                Edit
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleDeleteClick(job.id)}
                                className="flex items-center gap-2 text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20"
                              >
                                <Trash2 className="w-4 h-4" />
                                Delete
                              </Button>
                            </div>
                          </CardContent>
                        </Card>
                      )
                    })}
                  </div>
                </TabsContent>

                <TabsContent value="list">
                  <Card className="hidden lg:block">
                    <CardHeader>
                      <CardTitle>Job Cards List</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        {filteredJobs.map((job) => {
                          const StatusIcon = statusConfig[job.status].icon
                          const isOverdue = new Date() > job.dueDate && job.status !== "completed"

                          return (
                            <div
                              key={job.id}
                              className={`flex items-center justify-between p-4 border rounded-lg ${isOverdue ? "border-red-300 bg-red-50 dark:bg-red-900/20" : "border-gray-200 dark:border-gray-700"}`}
                            >
                              <div className="flex items-center space-x-4">
                                <div className={`w-3 h-3 rounded-full ${statusConfig[job.status].color}`} />
                                <div>
                                  <div className="font-medium">{job.title}</div>
                                  <div className="text-sm text-gray-500 dark:text-gray-400">
                                    {job.id} • {job.assignee} • {job.department}
                                  </div>
                                </div>
                              </div>
                              <div className="flex items-center space-x-4">
                                <Badge variant="outline" className={`${priorityConfig[job.priority].color} text-white`}>
                                  {priorityConfig[job.priority].label}
                                </Badge>
                                <div className="text-sm text-gray-500 dark:text-gray-400">
                                  Due: {job.dueDate.toLocaleDateString()}
                                </div>
                                <Select
                                  value={job.status}
                                  onValueChange={(value: JobStatus) => updateJobStatus(job.id, value)}
                                >
                                  <SelectTrigger className="w-32">
                                    <div className="flex items-center gap-2">
                                      <StatusIcon className="w-4 h-4" />
                                      <SelectValue />
                                    </div>
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="pending">Pending</SelectItem>
                                    <SelectItem value="in-progress">In Progress</SelectItem>
                                    <SelectItem value="completed">Completed</SelectItem>
                                    <SelectItem value="on-hold">On Hold</SelectItem>
                                    <SelectItem value="cancelled">Cancelled</SelectItem>
                                  </SelectContent>
                                </Select>
                                <div className="flex items-center gap-2">
                                  <Button variant="outline" size="sm">
                                    <Edit className="w-4 h-4" />
                                  </Button>
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => handleDeleteClick(job.id)}
                                    className="text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20"
                                  >
                                    <Trash2 className="w-4 h-4" />
                                  </Button>
                                </div>
                              </div>
                            </div>
                          )
                        })}
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>
              </Tabs>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
