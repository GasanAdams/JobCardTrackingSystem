"use client"

import { useState, useEffect, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer, PieChart, Pie, Cell } from "recharts"
import {
  Plus,
  Search,
  MoreVertical,
  Calendar,
  Clock,
  User,
  Building,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Pause,
  RotateCcw,
  Trash2,
  Edit,
  Eye,
  RefreshCw,
  Grid,
  List,
  Menu,
  Sun,
  Moon,
  Timer,
  Play,
  Square,
} from "lucide-react"
import { useTheme } from "next-themes"
import Image from "next/image"

interface JobCard {
  id: string
  title: string
  description: string
  assignee: string
  department: string
  priority: "low" | "medium" | "high" | "urgent"
  status: "pending" | "in-progress" | "completed" | "on-hold" | "cancelled"
  dueDate: string
  estimatedHours: number
  tags: string[]
  createdAt: string
  updatedAt: string
}

interface JobData {
  jobs: JobCard[]
  timestamp: number
  version: number
}

const STORAGE_KEY = "job-card-tracking-system"

const priorityColors = {
  low: "priority-low",
  medium: "priority-medium",
  high: "priority-high",
  urgent: "priority-urgent",
}

const statusColors = {
  pending: "status-pending",
  "in-progress": "status-in-progress",
  completed: "status-completed",
  "on-hold": "status-on-hold",
  cancelled: "status-cancelled",
}

const statusIcons = {
  pending: Clock,
  "in-progress": RotateCcw,
  completed: CheckCircle,
  "on-hold": Pause,
  cancelled: XCircle,
}

const autoRefreshOptions = [
  { value: "off", label: "Off", ms: 0 },
  { value: "2min", label: "2 minutes", ms: 2 * 60 * 1000 },
  { value: "5min", label: "5 minutes", ms: 5 * 60 * 1000 },
  { value: "10min", label: "10 minutes", ms: 10 * 60 * 1000 },
]

export default function JobCardTrackingSystem() {
  const [jobs, setJobs] = useState<JobCard[]>([])
  const [filteredJobs, setFilteredJobs] = useState<JobCard[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [priorityFilter, setPriorityFilter] = useState("all")
  const [departmentFilter, setDepartmentFilter] = useState("all")
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid")
  const [isAddJobOpen, setIsAddJobOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [lastSync, setLastSync] = useState<Date | null>(null)
  const [deletingJobId, setDeletingJobId] = useState<string | null>(null)
  const [autoRefresh, setAutoRefresh] = useState("off")
  const [refreshInterval, setRefreshInterval] = useState<NodeJS.Timeout | null>(null)
  const [nextRefresh, setNextRefresh] = useState<Date | null>(null)
  const { theme, setTheme } = useTheme()

  const [newJob, setNewJob] = useState({
    title: "",
    description: "",
    assignee: "",
    department: "",
    priority: "medium" as const,
    status: "pending" as const,
    dueDate: "",
    estimatedHours: 0,
    tags: "",
  })

  // Load jobs from localStorage on component mount
  useEffect(() => {
    loadJobs()

    // Listen for storage changes from other tabs
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === STORAGE_KEY) {
        loadJobs()
      }
    }

    // Listen for custom sync events
    const handleSyncEvent = () => {
      loadJobs()
    }

    window.addEventListener("storage", handleStorageChange)
    window.addEventListener("job-cards-sync", handleSyncEvent)

    return () => {
      window.removeEventListener("storage", handleStorageChange)
      window.removeEventListener("job-cards-sync", handleSyncEvent)
    }
  }, [])

  // Filter jobs whenever search term or filters change
  useEffect(() => {
    filterJobs()
  }, [jobs, searchTerm, statusFilter, priorityFilter, departmentFilter])

  // Auto refresh functionality
  useEffect(() => {
    if (refreshInterval) {
      clearInterval(refreshInterval)
    }

    const selectedOption = autoRefreshOptions.find((option) => option.value === autoRefresh)
    if (selectedOption && selectedOption.ms > 0) {
      const interval = setInterval(() => {
        loadJobs()
        setNextRefresh(new Date(Date.now() + selectedOption.ms))
      }, selectedOption.ms)

      setRefreshInterval(interval)
      setNextRefresh(new Date(Date.now() + selectedOption.ms))
    } else {
      setNextRefresh(null)
    }

    return () => {
      if (refreshInterval) {
        clearInterval(refreshInterval)
      }
    }
  }, [autoRefresh])

  // Cleanup interval on unmount
  useEffect(() => {
    return () => {
      if (refreshInterval) {
        clearInterval(refreshInterval)
      }
    }
  }, [refreshInterval])

  const loadJobs = useCallback(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY)
      if (stored) {
        const data: JobData = JSON.parse(stored)
        setJobs(data.jobs || [])
        setLastSync(new Date(data.timestamp))
      }
    } catch (error) {
      console.error("Error loading jobs:", error)
    } finally {
      setIsLoading(false)
    }
  }, [])

  const saveJobs = useCallback((updatedJobs: JobCard[]) => {
    try {
      const data: JobData = {
        jobs: updatedJobs,
        timestamp: Date.now(),
        version: Date.now(),
      }
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data))
      setLastSync(new Date())

      // Dispatch custom event for cross-tab sync
      window.dispatchEvent(new CustomEvent("job-cards-sync"))
    } catch (error) {
      console.error("Error saving jobs:", error)
    }
  }, [])

  const generateJobId = useCallback(() => {
    const existingIds = jobs.map((job) => Number.parseInt(job.id.replace("JOB-", ""))).filter((id) => !isNaN(id))
    const maxId = existingIds.length > 0 ? Math.max(...existingIds) : 0
    return `JOB-${String(maxId + 1).padStart(3, "0")}`
  }, [jobs])

  const addJob = () => {
    if (!newJob.title.trim()) return

    const job: JobCard = {
      id: generateJobId(),
      title: newJob.title,
      description: newJob.description,
      assignee: newJob.assignee,
      department: newJob.department,
      priority: newJob.priority,
      status: newJob.status,
      dueDate: newJob.dueDate,
      estimatedHours: newJob.estimatedHours,
      tags: newJob.tags
        .split(",")
        .map((tag) => tag.trim())
        .filter((tag) => tag),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }

    const updatedJobs = [...jobs, job]
    setJobs(updatedJobs)
    saveJobs(updatedJobs)

    // Reset form
    setNewJob({
      title: "",
      description: "",
      assignee: "",
      department: "",
      priority: "medium",
      status: "pending",
      dueDate: "",
      estimatedHours: 0,
      tags: "",
    })
    setIsAddJobOpen(false)
  }

  const updateJobStatus = (jobId: string, newStatus: JobCard["status"]) => {
    const updatedJobs = jobs.map((job) =>
      job.id === jobId ? { ...job, status: newStatus, updatedAt: new Date().toISOString() } : job,
    )
    setJobs(updatedJobs)
    saveJobs(updatedJobs)
  }

  const deleteJob = (jobId: string) => {
    setDeletingJobId(jobId)
    setTimeout(() => {
      const updatedJobs = jobs.filter((job) => job.id !== jobId)
      setJobs(updatedJobs)
      saveJobs(updatedJobs)
      setDeletingJobId(null)
    }, 300)
  }

  const filterJobs = () => {
    let filtered = jobs

    if (searchTerm) {
      filtered = filtered.filter(
        (job) =>
          job.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
          job.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
          job.assignee.toLowerCase().includes(searchTerm.toLowerCase()) ||
          job.department.toLowerCase().includes(searchTerm.toLowerCase()) ||
          job.tags.some((tag) => tag.toLowerCase().includes(searchTerm.toLowerCase())),
      )
    }

    if (statusFilter !== "all") {
      filtered = filtered.filter((job) => job.status === statusFilter)
    }

    if (priorityFilter !== "all") {
      filtered = filtered.filter((job) => job.priority === priorityFilter)
    }

    if (departmentFilter !== "all") {
      filtered = filtered.filter((job) => job.department === departmentFilter)
    }

    setFilteredJobs(filtered)
  }

  const refreshData = () => {
    setIsLoading(true)
    setTimeout(() => {
      loadJobs()
    }, 500)
  }

  const getStats = () => {
    return {
      total: jobs.length,
      pending: jobs.filter((job) => job.status === "pending").length,
      inProgress: jobs.filter((job) => job.status === "in-progress").length,
      completed: jobs.filter((job) => job.status === "completed").length,
      overdue: jobs.filter((job) => new Date(job.dueDate) < new Date() && job.status !== "completed").length,
    }
  }

  const getChartData = () => {
    const statusData = [
      { name: "Pending", value: jobs.filter((job) => job.status === "pending").length, color: "#333333" },
      { name: "In Progress", value: jobs.filter((job) => job.status === "in-progress").length, color: "#1a1a1a" },
      { name: "Completed", value: jobs.filter((job) => job.status === "completed").length, color: "#0a0a0a" },
      { name: "On Hold", value: jobs.filter((job) => job.status === "on-hold").length, color: "#2a2a2a" },
      { name: "Cancelled", value: jobs.filter((job) => job.status === "cancelled").length, color: "#1a0a0a" },
    ]

    const priorityData = [
      { name: "Low", value: jobs.filter((job) => job.priority === "low").length },
      { name: "Medium", value: jobs.filter((job) => job.priority === "medium").length },
      { name: "High", value: jobs.filter((job) => job.priority === "high").length },
      { name: "Urgent", value: jobs.filter((job) => job.priority === "urgent").length },
    ]

    return { statusData, priorityData }
  }

  const formatTimeUntilRefresh = () => {
    if (!nextRefresh) return ""
    const now = new Date()
    const diff = nextRefresh.getTime() - now.getTime()
    if (diff <= 0) return "Refreshing..."

    const minutes = Math.floor(diff / 60000)
    const seconds = Math.floor((diff % 60000) / 1000)
    return `${minutes}:${seconds.toString().padStart(2, "0")}`
  }

  const stats = getStats()
  const { statusData, priorityData } = getChartData()
  const departments = [...new Set(jobs.map((job) => job.department).filter(Boolean))]

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="text-muted-foreground">Loading job cards...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="carbon-header sticky top-0 z-50 border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Image src="/carbon-bros-logo.png" alt="Carbon Bros" width={120} height={40} className="h-8 w-auto" />
              <div className="hidden md:block">
                <h1 className="text-2xl font-bold carbon-text-gradient">Job Card Tracking System</h1>
                <p className="text-sm text-muted-foreground">Real-time job management and tracking</p>
              </div>
            </div>

            <div className="flex items-center space-x-2">
              {/* Auto Refresh Controls */}
              <div className="hidden md:flex items-center space-x-2">
                <Select value={autoRefresh} onValueChange={setAutoRefresh}>
                  <SelectTrigger
                    className={`w-[140px] carbon-btn-secondary ${autoRefresh !== "off" ? "auto-refresh-active" : ""}`}
                  >
                    <div className="flex items-center space-x-2">
                      <Timer className="h-4 w-4" />
                      <SelectValue />
                    </div>
                  </SelectTrigger>
                  <SelectContent className="carbon-card">
                    {autoRefreshOptions.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        <div className="flex items-center space-x-2">
                          {option.value === "off" ? <Square className="h-3 w-3" /> : <Play className="h-3 w-3" />}
                          <span>{option.label}</span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                {nextRefresh && <div className="text-xs text-muted-foreground">Next: {formatTimeUntilRefresh()}</div>}
              </div>

              {lastSync && (
                <div className="hidden md:flex items-center space-x-2 text-xs text-muted-foreground">
                  <span>Last sync: {lastSync.toLocaleTimeString()}</span>
                  <Button variant="ghost" size="sm" onClick={refreshData}>
                    <RefreshCw className="h-3 w-3" />
                  </Button>
                </div>
              )}

              <Button
                variant="ghost"
                size="icon"
                onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
                className="carbon-btn-secondary"
              >
                {theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
              </Button>

              <div className="flex items-center space-x-2">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setViewMode(viewMode === "grid" ? "list" : "grid")}
                  className="hidden md:flex carbon-btn-secondary"
                >
                  {viewMode === "grid" ? <List className="h-4 w-4" /> : <Grid className="h-4 w-4" />}
                </Button>

                <Dialog open={isAddJobOpen} onOpenChange={setIsAddJobOpen}>
                  <DialogTrigger asChild>
                    <Button className="carbon-btn-primary">
                      <Plus className="h-4 w-4 mr-2" />
                      <span className="hidden md:inline">Add Job</span>
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="carbon-card">
                    <DialogHeader>
                      <DialogTitle className="carbon-text-gradient">Create New Job Card</DialogTitle>
                      <DialogDescription>Fill in the details to create a new job card for tracking.</DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                      <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="title" className="text-right">
                          Title
                        </Label>
                        <Input
                          id="title"
                          value={newJob.title}
                          onChange={(e) => setNewJob({ ...newJob, title: e.target.value })}
                          className="col-span-3"
                          placeholder="Enter job title"
                        />
                      </div>
                      <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="description" className="text-right">
                          Description
                        </Label>
                        <Textarea
                          id="description"
                          value={newJob.description}
                          onChange={(e) => setNewJob({ ...newJob, description: e.target.value })}
                          className="col-span-3"
                          placeholder="Enter job description"
                        />
                      </div>
                      <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="assignee" className="text-right">
                          Assignee
                        </Label>
                        <Input
                          id="assignee"
                          value={newJob.assignee}
                          onChange={(e) => setNewJob({ ...newJob, assignee: e.target.value })}
                          className="col-span-3"
                          placeholder="Enter assignee name"
                        />
                      </div>
                      <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="department" className="text-right">
                          Department
                        </Label>
                        <Input
                          id="department"
                          value={newJob.department}
                          onChange={(e) => setNewJob({ ...newJob, department: e.target.value })}
                          className="col-span-3"
                          placeholder="Enter department"
                        />
                      </div>
                      <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="priority" className="text-right">
                          Priority
                        </Label>
                        <Select
                          value={newJob.priority}
                          onValueChange={(value: any) => setNewJob({ ...newJob, priority: value })}
                        >
                          <SelectTrigger className="col-span-3">
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
                      <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="dueDate" className="text-right">
                          Due Date
                        </Label>
                        <Input
                          id="dueDate"
                          type="date"
                          value={newJob.dueDate}
                          onChange={(e) => setNewJob({ ...newJob, dueDate: e.target.value })}
                          className="col-span-3"
                        />
                      </div>
                      <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="estimatedHours" className="text-right">
                          Est. Hours
                        </Label>
                        <Input
                          id="estimatedHours"
                          type="number"
                          value={newJob.estimatedHours}
                          onChange={(e) =>
                            setNewJob({ ...newJob, estimatedHours: Number.parseInt(e.target.value) || 0 })
                          }
                          className="col-span-3"
                          placeholder="0"
                        />
                      </div>
                      <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="tags" className="text-right">
                          Tags
                        </Label>
                        <Input
                          id="tags"
                          value={newJob.tags}
                          onChange={(e) => setNewJob({ ...newJob, tags: e.target.value })}
                          className="col-span-3"
                          placeholder="Enter tags separated by commas"
                        />
                      </div>
                    </div>
                    <div className="flex justify-end space-x-2">
                      <Button variant="outline" onClick={() => setIsAddJobOpen(false)}>
                        Cancel
                      </Button>
                      <Button onClick={addJob} className="carbon-btn-primary">
                        Create Job
                      </Button>
                    </div>
                  </DialogContent>
                </Dialog>

                {/* Mobile Menu */}
                <Sheet>
                  <SheetTrigger asChild>
                    <Button variant="ghost" size="icon" className="md:hidden carbon-btn-secondary">
                      <Menu className="h-4 w-4" />
                    </Button>
                  </SheetTrigger>
                  <SheetContent side="right" className="carbon-card">
                    <SheetHeader>
                      <SheetTitle className="carbon-text-gradient">Filters & Actions</SheetTitle>
                      <SheetDescription>Filter jobs and access quick actions</SheetDescription>
                    </SheetHeader>
                    <div className="space-y-4 mt-6">
                      {/* Mobile Auto Refresh */}
                      <div>
                        <Label htmlFor="mobile-auto-refresh">Auto Refresh</Label>
                        <Select value={autoRefresh} onValueChange={setAutoRefresh}>
                          <SelectTrigger className={`${autoRefresh !== "off" ? "auto-refresh-active" : ""}`}>
                            <div className="flex items-center space-x-2">
                              <Timer className="h-4 w-4" />
                              <SelectValue />
                            </div>
                          </SelectTrigger>
                          <SelectContent>
                            {autoRefreshOptions.map((option) => (
                              <SelectItem key={option.value} value={option.value}>
                                <div className="flex items-center space-x-2">
                                  {option.value === "off" ? (
                                    <Square className="h-3 w-3" />
                                  ) : (
                                    <Play className="h-3 w-3" />
                                  )}
                                  <span>{option.label}</span>
                                </div>
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        {nextRefresh && (
                          <div className="text-xs text-muted-foreground mt-1">
                            Next refresh: {formatTimeUntilRefresh()}
                          </div>
                        )}
                      </div>

                      <div>
                        <Label htmlFor="mobile-search">Search</Label>
                        <div className="relative">
                          <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
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
                        <Label htmlFor="mobile-status">Status</Label>
                        <Select value={statusFilter} onValueChange={setStatusFilter}>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="all">All Status</SelectItem>
                            <SelectItem value="pending">Pending</SelectItem>
                            <SelectItem value="in-progress">In Progress</SelectItem>
                            <SelectItem value="completed">Completed</SelectItem>
                            <SelectItem value="on-hold">On Hold</SelectItem>
                            <SelectItem value="cancelled">Cancelled</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div>
                        <Label htmlFor="mobile-priority">Priority</Label>
                        <Select value={priorityFilter} onValueChange={setPriorityFilter}>
                          <SelectTrigger>
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

                      <div>
                        <Label htmlFor="mobile-view">View Mode</Label>
                        <div className="flex space-x-2 mt-2">
                          <Button
                            variant={viewMode === "grid" ? "default" : "outline"}
                            size="sm"
                            onClick={() => setViewMode("grid")}
                            className="flex-1"
                          >
                            <Grid className="h-4 w-4 mr-2" />
                            Grid
                          </Button>
                          <Button
                            variant={viewMode === "list" ? "default" : "outline"}
                            size="sm"
                            onClick={() => setViewMode("list")}
                            className="flex-1"
                          >
                            <List className="h-4 w-4 mr-2" />
                            List
                          </Button>
                        </div>
                      </div>
                    </div>
                  </SheetContent>
                </Sheet>
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-6 space-y-6">
        {/* Stats Overview */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          <Card className="carbon-stats-card">
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <div className="p-2 bg-primary/10 rounded-full">
                  <Building className="h-4 w-4 text-primary" />
                </div>
                <div>
                  <p className="text-2xl font-bold carbon-stats-number">{stats.total}</p>
                  <p className="text-xs text-muted-foreground">Total Jobs</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="carbon-stats-card">
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <div className="p-2 bg-yellow-500/10 rounded-full">
                  <Clock className="h-4 w-4 text-yellow-500" />
                </div>
                <div>
                  <p className="text-2xl font-bold carbon-stats-number">{stats.pending}</p>
                  <p className="text-xs text-muted-foreground">Pending</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="carbon-stats-card">
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <div className="p-2 bg-blue-500/10 rounded-full">
                  <RotateCcw className="h-4 w-4 text-blue-500" />
                </div>
                <div>
                  <p className="text-2xl font-bold carbon-stats-number">{stats.inProgress}</p>
                  <p className="text-xs text-muted-foreground">In Progress</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="carbon-stats-card">
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <div className="p-2 bg-green-500/10 rounded-full">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                </div>
                <div>
                  <p className="text-2xl font-bold carbon-stats-number">{stats.completed}</p>
                  <p className="text-xs text-muted-foreground">Completed</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="carbon-stats-card">
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <div className="p-2 bg-red-500/10 rounded-full">
                  <AlertTriangle className="h-4 w-4 text-red-500" />
                </div>
                <div>
                  <p className="text-2xl font-bold carbon-stats-number">{stats.overdue}</p>
                  <p className="text-xs text-muted-foreground">Overdue</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Analytics Dashboard */}
        <Tabs defaultValue="overview" className="space-y-4">
          <TabsList className="carbon-card">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-4">
            {/* Filters */}
            <Card className="carbon-card">
              <CardContent className="p-4">
                <div className="flex flex-col md:flex-row gap-4">
                  <div className="flex-1">
                    <div className="relative">
                      <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input
                        placeholder="Search jobs..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10"
                      />
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <Select value={statusFilter} onValueChange={setStatusFilter}>
                      <SelectTrigger className="w-[140px]">
                        <SelectValue placeholder="Status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Status</SelectItem>
                        <SelectItem value="pending">Pending</SelectItem>
                        <SelectItem value="in-progress">In Progress</SelectItem>
                        <SelectItem value="completed">Completed</SelectItem>
                        <SelectItem value="on-hold">On Hold</SelectItem>
                        <SelectItem value="cancelled">Cancelled</SelectItem>
                      </SelectContent>
                    </Select>

                    <Select value={priorityFilter} onValueChange={setPriorityFilter}>
                      <SelectTrigger className="w-[140px]">
                        <SelectValue placeholder="Priority" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Priorities</SelectItem>
                        <SelectItem value="low">Low</SelectItem>
                        <SelectItem value="medium">Medium</SelectItem>
                        <SelectItem value="high">High</SelectItem>
                        <SelectItem value="urgent">Urgent</SelectItem>
                      </SelectContent>
                    </Select>

                    {departments.length > 0 && (
                      <Select value={departmentFilter} onValueChange={setDepartmentFilter}>
                        <SelectTrigger className="w-[140px]">
                          <SelectValue placeholder="Department" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All Departments</SelectItem>
                          {departments.map((dept) => (
                            <SelectItem key={dept} value={dept}>
                              {dept}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Job Cards */}
            {filteredJobs.length === 0 ? (
              <Card className="carbon-card">
                <CardContent className="p-12 text-center">
                  <div className="space-y-4">
                    <div className="mx-auto w-16 h-16 bg-muted rounded-full flex items-center justify-center">
                      <Building className="h-8 w-8 text-muted-foreground" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold carbon-text-gradient">No Job Cards Found</h3>
                      <p className="text-muted-foreground">
                        {jobs.length === 0
                          ? "Get started by creating your first job card to track work progress."
                          : "No jobs match your current filters. Try adjusting your search criteria."}
                      </p>
                    </div>
                    {jobs.length === 0 && (
                      <Button onClick={() => setIsAddJobOpen(true)} className="carbon-btn-primary">
                        <Plus className="h-4 w-4 mr-2" />
                        Create Your First Job Card
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            ) : (
              <div
                className={viewMode === "grid" ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4" : "space-y-4"}
              >
                {filteredJobs.map((job) => {
                  const StatusIcon = statusIcons[job.status]
                  const isOverdue = new Date(job.dueDate) < new Date() && job.status !== "completed"
                  const isDeleting = deletingJobId === job.id

                  return (
                    <Card
                      key={job.id}
                      className={`carbon-card transition-all duration-300 hover:shadow-lg ${
                        isOverdue ? "border-red-500" : ""
                      } ${isDeleting ? "opacity-50 scale-95" : ""}`}
                    >
                      <CardHeader className="pb-3">
                        <div className="flex items-start justify-between">
                          <div className="space-y-1">
                            <CardTitle className="text-lg carbon-text-gradient">{job.title}</CardTitle>
                            <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                              <span>{job.id}</span>
                              {job.department && (
                                <>
                                  <span>•</span>
                                  <span>{job.department}</span>
                                </>
                              )}
                            </div>
                          </div>

                          <div className="flex items-center space-x-2">
                            <Badge className={priorityColors[job.priority]}>{job.priority}</Badge>

                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon" className="h-8 w-8">
                                  <MoreVertical className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end" className="carbon-card">
                                <DropdownMenuItem>
                                  <Eye className="h-4 w-4 mr-2" />
                                  View Details
                                </DropdownMenuItem>
                                <DropdownMenuItem>
                                  <Edit className="h-4 w-4 mr-2" />
                                  Edit Job
                                </DropdownMenuItem>
                                <AlertDialog>
                                  <AlertDialogTrigger asChild>
                                    <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                                      <Trash2 className="h-4 w-4 mr-2" />
                                      Delete Job
                                    </DropdownMenuItem>
                                  </AlertDialogTrigger>
                                  <AlertDialogContent className="carbon-card">
                                    <AlertDialogHeader>
                                      <AlertDialogTitle>Delete Job Card</AlertDialogTitle>
                                      <AlertDialogDescription>
                                        Are you sure you want to delete "{job.title}"? This action cannot be undone.
                                      </AlertDialogDescription>
                                    </AlertDialogHeader>
                                    <AlertDialogFooter>
                                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                                      <AlertDialogAction
                                        onClick={() => deleteJob(job.id)}
                                        className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                      >
                                        Delete
                                      </AlertDialogAction>
                                    </AlertDialogFooter>
                                  </AlertDialogContent>
                                </AlertDialog>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </div>
                        </div>
                      </CardHeader>

                      <CardContent className="space-y-4">
                        {job.description && (
                          <p className="text-sm text-muted-foreground line-clamp-2">{job.description}</p>
                        )}

                        <div className="flex items-center justify-between">
                          <Select
                            value={job.status}
                            onValueChange={(value: JobCard["status"]) => updateJobStatus(job.id, value)}
                          >
                            <SelectTrigger className="w-[140px]">
                              <div className="flex items-center space-x-2">
                                <StatusIcon className="h-4 w-4" />
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

                          <Badge className={statusColors[job.status]}>{job.status.replace("-", " ")}</Badge>
                        </div>

                        <div className="flex items-center justify-between text-sm text-muted-foreground">
                          <div className="flex items-center space-x-1">
                            <User className="h-4 w-4" />
                            <span>{job.assignee || "Unassigned"}</span>
                          </div>
                          {job.dueDate && (
                            <div className={`flex items-center space-x-1 ${isOverdue ? "text-red-500" : ""}`}>
                              <Calendar className="h-4 w-4" />
                              <span>{new Date(job.dueDate).toLocaleDateString()}</span>
                            </div>
                          )}
                        </div>

                        {job.estimatedHours > 0 && (
                          <div className="flex items-center space-x-1 text-sm text-muted-foreground">
                            <Clock className="h-4 w-4" />
                            <span>{job.estimatedHours}h estimated</span>
                          </div>
                        )}

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
                          <div className="flex items-center space-x-2 text-red-500 bg-red-50 dark:bg-red-950/20 p-2 rounded">
                            <AlertTriangle className="h-4 w-4" />
                            <span className="text-sm font-medium">Overdue</span>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  )
                })}
              </div>
            )}
          </TabsContent>

          <TabsContent value="analytics" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card className="carbon-card">
                <CardHeader>
                  <CardTitle className="carbon-text-gradient">Status Distribution</CardTitle>
                </CardHeader>
                <CardContent>
                  <ChartContainer
                    config={{
                      value: {
                        label: "Jobs",
                        color: "hsl(var(--chart-1))",
                      },
                    }}
                    className="h-[300px]"
                  >
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={statusData}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                          outerRadius={80}
                          fill="#8884d8"
                          dataKey="value"
                        >
                          {statusData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <ChartTooltip content={<ChartTooltipContent />} />
                      </PieChart>
                    </ResponsiveContainer>
                  </ChartContainer>
                </CardContent>
              </Card>

              <Card className="carbon-card">
                <CardHeader>
                  <CardTitle className="carbon-text-gradient">Priority Breakdown</CardTitle>
                </CardHeader>
                <CardContent>
                  <ChartContainer
                    config={{
                      value: {
                        label: "Jobs",
                        color: "hsl(var(--chart-2))",
                      },
                    }}
                    className="h-[300px]"
                  >
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={priorityData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="name" />
                        <YAxis />
                        <ChartTooltip content={<ChartTooltipContent />} />
                        <Bar dataKey="value" fill="var(--color-value)" />
                      </BarChart>
                    </ResponsiveContainer>
                  </ChartContainer>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
