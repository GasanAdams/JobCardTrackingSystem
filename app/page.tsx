"use client"

import { useState, useEffect, useCallback } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer, PieChart, Pie, Cell } from "recharts"
import {
  Plus,
  Search,
  Filter,
  MoreVertical,
  Clock,
  User,
  Calendar,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Pause,
  RotateCcw,
  Trash2,
  Grid,
  List,
  RefreshCw,
  Sun,
  Moon,
} from "lucide-react"
import { useTheme } from "next-themes"
import Image from "next/image"

interface JobCard {
  id: string
  title: string
  description: string
  status: "pending" | "in-progress" | "completed" | "on-hold" | "cancelled"
  priority: "low" | "medium" | "high" | "urgent"
  assignee: string
  department: string
  createdDate: string
  dueDate: string
  estimatedHours: number
  actualHours: number
  tags: string[]
  lastUpdated: string
}

interface JobData {
  jobs: JobCard[]
  timestamp: number
  version: number
}

const STORAGE_KEY = "job-card-tracking-system"

const priorityColors = {
  low: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300",
  medium: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300",
  high: "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300",
  urgent: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300 animate-pulse",
}

const statusColors = {
  pending: "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300",
  "in-progress": "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300",
  completed: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300",
  "on-hold": "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300",
  cancelled: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300",
}

const statusIcons = {
  pending: Clock,
  "in-progress": RotateCcw,
  completed: CheckCircle,
  "on-hold": Pause,
  cancelled: XCircle,
}

export default function JobCardTrackingSystem() {
  const [jobs, setJobs] = useState<JobCard[]>([])
  const [filteredJobs, setFilteredJobs] = useState<JobCard[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [priorityFilter, setPriorityFilter] = useState<string>("all")
  const [departmentFilter, setDepartmentFilter] = useState<string>("all")
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid")
  const [isAddJobOpen, setIsAddJobOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [lastSync, setLastSync] = useState<Date | null>(null)
  const [isMobile, setIsMobile] = useState(false)
  const { theme, setTheme } = useTheme()

  const [newJob, setNewJob] = useState({
    title: "",
    description: "",
    status: "pending" as JobCard["status"],
    priority: "medium" as JobCard["priority"],
    assignee: "",
    department: "",
    dueDate: "",
    estimatedHours: 0,
    tags: "",
  })

  // Load jobs from localStorage with sync
  const loadJobs = useCallback(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY)
      if (stored) {
        const data: JobData = JSON.parse(stored)
        setJobs(data.jobs || [])
        setLastSync(new Date(data.timestamp))
      } else {
        setJobs([])
        setLastSync(new Date())
      }
    } catch (error) {
      console.error("Error loading jobs:", error)
      setJobs([])
    } finally {
      setIsLoading(false)
    }
  }, [])

  // Save jobs to localStorage with sync
  const saveJobs = useCallback((jobsToSave: JobCard[]) => {
    try {
      const data: JobData = {
        jobs: jobsToSave,
        timestamp: Date.now(),
        version: Math.floor(Date.now() / 1000),
      }
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data))
      setLastSync(new Date())

      // Dispatch custom event for cross-tab sync
      window.dispatchEvent(new CustomEvent("job-cards-sync", { detail: data }))
    } catch (error) {
      console.error("Error saving jobs:", error)
    }
  }, [])

  // Generate next job ID
  const generateJobId = useCallback((existingJobs: JobCard[]) => {
    const maxId = existingJobs.reduce((max, job) => {
      const idNum = Number.parseInt(job.id.replace("JOB-", ""))
      return idNum > max ? idNum : max
    }, 0)
    return `JOB-${String(maxId + 1).padStart(3, "0")}`
  }, [])

  // Handle mobile detection
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768)
    }

    checkMobile()
    window.addEventListener("resize", checkMobile)
    return () => window.removeEventListener("resize", checkMobile)
  }, [])

  // Initialize and set up sync listeners
  useEffect(() => {
    loadJobs()

    // Listen for localStorage changes (cross-tab sync)
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === STORAGE_KEY && e.newValue) {
        try {
          const data: JobData = JSON.parse(e.newValue)
          setJobs(data.jobs || [])
          setLastSync(new Date(data.timestamp))
        } catch (error) {
          console.error("Error syncing jobs:", error)
        }
      }
    }

    // Listen for custom sync events
    const handleSyncEvent = (e: CustomEvent) => {
      const data = e.detail as JobData
      setJobs(data.jobs || [])
      setLastSync(new Date(data.timestamp))
    }

    window.addEventListener("storage", handleStorageChange)
    window.addEventListener("job-cards-sync", handleSyncEvent as EventListener)

    return () => {
      window.removeEventListener("storage", handleStorageChange)
      window.removeEventListener("job-cards-sync", handleSyncEvent as EventListener)
    }
  }, [loadJobs])

  // Filter jobs based on search and filters
  useEffect(() => {
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
  }, [jobs, searchTerm, statusFilter, priorityFilter, departmentFilter])

  const addJob = () => {
    if (!newJob.title.trim()) return

    const job: JobCard = {
      id: generateJobId(jobs),
      title: newJob.title,
      description: newJob.description,
      status: newJob.status,
      priority: newJob.priority,
      assignee: newJob.assignee,
      department: newJob.department,
      createdDate: new Date().toISOString().split("T")[0],
      dueDate: newJob.dueDate,
      estimatedHours: newJob.estimatedHours,
      actualHours: 0,
      tags: newJob.tags
        .split(",")
        .map((tag) => tag.trim())
        .filter((tag) => tag),
      lastUpdated: new Date().toISOString(),
    }

    const updatedJobs = [...jobs, job]
    setJobs(updatedJobs)
    saveJobs(updatedJobs)

    setNewJob({
      title: "",
      description: "",
      status: "pending",
      priority: "medium",
      assignee: "",
      department: "",
      dueDate: "",
      estimatedHours: 0,
      tags: "",
    })
    setIsAddJobOpen(false)
  }

  const updateJobStatus = (jobId: string, newStatus: JobCard["status"]) => {
    const updatedJobs = jobs.map((job) =>
      job.id === jobId ? { ...job, status: newStatus, lastUpdated: new Date().toISOString() } : job,
    )
    setJobs(updatedJobs)
    saveJobs(updatedJobs)
  }

  const deleteJob = (jobId: string) => {
    const updatedJobs = jobs.filter((job) => job.id !== jobId)
    setJobs(updatedJobs)
    saveJobs(updatedJobs)
  }

  const refreshData = () => {
    setIsLoading(true)
    setTimeout(() => {
      loadJobs()
    }, 500)
  }

  const getStats = () => {
    const total = jobs.length
    const pending = jobs.filter((job) => job.status === "pending").length
    const inProgress = jobs.filter((job) => job.status === "in-progress").length
    const completed = jobs.filter((job) => job.status === "completed").length
    const overdue = jobs.filter((job) => {
      const dueDate = new Date(job.dueDate)
      const today = new Date()
      return dueDate < today && job.status !== "completed"
    }).length

    return { total, pending, inProgress, completed, overdue }
  }

  const stats = getStats()
  const departments = [...new Set(jobs.map((job) => job.department))].filter(Boolean)

  const chartData = [
    { name: "Pending", value: stats.pending, color: "#6b7280" },
    { name: "In Progress", value: stats.inProgress, color: "#3b82f6" },
    { name: "Completed", value: stats.completed, color: "#10b981" },
    { name: "On Hold", value: jobs.filter((job) => job.status === "on-hold").length, color: "#f59e0b" },
    { name: "Cancelled", value: jobs.filter((job) => job.status === "cancelled").length, color: "#ef4444" },
  ]

  const performanceData = departments.map((dept) => ({
    department: dept,
    completed: jobs.filter((job) => job.department === dept && job.status === "completed").length,
    total: jobs.filter((job) => job.department === dept).length,
  }))

  const MobileFilters = () => (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="outline" size="sm" className="md:hidden bg-transparent">
          <Filter className="h-4 w-4 mr-2" />
          Filters
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="w-80">
        <SheetHeader>
          <SheetTitle>Filters & Actions</SheetTitle>
        </SheetHeader>
        <div className="space-y-4 mt-6">
          <div className="space-y-2">
            <Label htmlFor="mobile-search">Search</Label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                id="mobile-search"
                placeholder="Search jobs..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label>Status</Label>
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

          <div className="space-y-2">
            <Label>Priority</Label>
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

          <div className="space-y-2">
            <Label>Department</Label>
            <Select value={departmentFilter} onValueChange={setDepartmentFilter}>
              <SelectTrigger>
                <SelectValue />
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
          </div>

          <div className="pt-4 border-t">
            <Dialog open={isAddJobOpen} onOpenChange={setIsAddJobOpen}>
              <DialogTrigger asChild>
                <Button className="w-full">
                  <Plus className="h-4 w-4 mr-2" />
                  Add New Job
                </Button>
              </DialogTrigger>
            </Dialog>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  )

  const JobCard = ({ job }: { job: JobCard }) => {
    const StatusIcon = statusIcons[job.status]
    const isOverdue = new Date(job.dueDate) < new Date() && job.status !== "completed"

    if (isMobile) {
      return (
        <Card
          className={`transition-all duration-200 hover:shadow-md ${isOverdue ? "border-red-200 dark:border-red-800" : ""}`}
        >
          <CardHeader className="pb-3">
            <div className="flex items-start justify-between">
              <div className="flex-1 min-w-0">
                <CardTitle className="text-base font-semibold truncate">{job.title}</CardTitle>
                <p className="text-xs text-muted-foreground mt-1">{job.id}</p>
              </div>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                    <MoreVertical className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => updateJobStatus(job.id, "pending")}>
                    <Clock className="h-4 w-4 mr-2" />
                    Set Pending
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => updateJobStatus(job.id, "in-progress")}>
                    <RotateCcw className="h-4 w-4 mr-2" />
                    Set In Progress
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => updateJobStatus(job.id, "completed")}>
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Set Completed
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => updateJobStatus(job.id, "on-hold")}>
                    <Pause className="h-4 w-4 mr-2" />
                    Set On Hold
                  </DropdownMenuItem>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                        <Trash2 className="h-4 w-4 mr-2" />
                        Delete Job
                      </DropdownMenuItem>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Delete Job Card</AlertDialogTitle>
                        <AlertDialogDescription>
                          Are you sure you want to delete "{job.title}"? This action cannot be undone.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={() => deleteJob(job.id)} className="bg-red-600 hover:bg-red-700">
                          Delete
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </CardHeader>
          <CardContent className="pt-0 space-y-3">
            <div className="flex items-center gap-2">
              <Badge className={priorityColors[job.priority]} variant="secondary">
                {job.priority}
              </Badge>
              <Badge className={statusColors[job.status]} variant="secondary">
                <StatusIcon className="h-3 w-3 mr-1" />
                {job.status.replace("-", " ")}
              </Badge>
            </div>

            {job.description && <p className="text-sm text-muted-foreground line-clamp-2">{job.description}</p>}

            <div className="space-y-2 text-xs text-muted-foreground">
              {job.assignee && (
                <div className="flex items-center gap-1">
                  <User className="h-3 w-3" />
                  <span className="truncate">{job.assignee}</span>
                </div>
              )}
              {job.dueDate && (
                <div className="flex items-center gap-1">
                  <Calendar className="h-3 w-3" />
                  <span>{new Date(job.dueDate).toLocaleDateString()}</span>
                  {isOverdue && <AlertTriangle className="h-3 w-3 text-red-500 ml-1" />}
                </div>
              )}
              {job.estimatedHours > 0 && (
                <div className="flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  <span>{job.estimatedHours}h estimated</span>
                </div>
              )}
            </div>

            {job.tags.length > 0 && (
              <div className="flex flex-wrap gap-1">
                {job.tags.slice(0, 2).map((tag, index) => (
                  <Badge key={index} variant="outline" className="text-xs px-1 py-0">
                    {tag}
                  </Badge>
                ))}
                {job.tags.length > 2 && (
                  <Badge variant="outline" className="text-xs px-1 py-0">
                    +{job.tags.length - 2}
                  </Badge>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      )
    }

    return (
      <Card
        className={`transition-all duration-200 hover:shadow-lg hover:-translate-y-1 ${isOverdue ? "border-red-200 dark:border-red-800" : ""}`}
      >
        <CardHeader>
          <div className="flex items-start justify-between">
            <div>
              <CardTitle className="text-lg font-semibold">{job.title}</CardTitle>
              <p className="text-sm text-muted-foreground mt-1">{job.id}</p>
            </div>
            <div className="flex items-center gap-2">
              <Badge className={priorityColors[job.priority]} variant="secondary">
                {job.priority}
              </Badge>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm">
                    <MoreVertical className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  <DropdownMenuItem onClick={() => updateJobStatus(job.id, "pending")}>
                    <Clock className="h-4 w-4 mr-2" />
                    Set Pending
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => updateJobStatus(job.id, "in-progress")}>
                    <RotateCcw className="h-4 w-4 mr-2" />
                    Set In Progress
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => updateJobStatus(job.id, "completed")}>
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Set Completed
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => updateJobStatus(job.id, "on-hold")}>
                    <Pause className="h-4 w-4 mr-2" />
                    Set On Hold
                  </DropdownMenuItem>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                        <Trash2 className="h-4 w-4 mr-2" />
                        Delete Job
                      </DropdownMenuItem>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Delete Job Card</AlertDialogTitle>
                        <AlertDialogDescription>
                          Are you sure you want to delete "{job.title}"? This action cannot be undone.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={() => deleteJob(job.id)} className="bg-red-600 hover:bg-red-700">
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
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Badge className={statusColors[job.status]} variant="secondary">
                <StatusIcon className="h-3 w-3 mr-1" />
                {job.status.replace("-", " ")}
              </Badge>
            </div>

            {job.description && <p className="text-sm text-muted-foreground">{job.description}</p>}

            <div className="grid grid-cols-2 gap-4 text-sm">
              {job.assignee && (
                <div className="flex items-center gap-2">
                  <User className="h-4 w-4 text-muted-foreground" />
                  <span>{job.assignee}</span>
                </div>
              )}
              {job.department && <div className="text-muted-foreground">Dept: {job.department}</div>}
              {job.dueDate && (
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <span>{new Date(job.dueDate).toLocaleDateString()}</span>
                  {isOverdue && <AlertTriangle className="h-4 w-4 text-red-500" />}
                </div>
              )}
              {job.estimatedHours > 0 && (
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  <span>{job.estimatedHours}h estimated</span>
                </div>
              )}
            </div>

            {job.tags.length > 0 && (
              <div className="flex flex-wrap gap-1">
                {job.tags.map((tag, index) => (
                  <Badge key={index} variant="outline" className="text-xs">
                    {tag}
                  </Badge>
                ))}
              </div>
            )}

            {isOverdue && (
              <div className="flex items-center gap-2 text-red-600 dark:text-red-400 text-sm font-medium">
                <AlertTriangle className="h-4 w-4" />
                Overdue
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    )
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading job cards...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Image src="/carbon-bros-logo.png" alt="Carbon Bros" width={120} height={40} className="h-8 w-auto" />
              <div className="hidden md:block">
                <h1 className="text-2xl font-bold">Job Card Tracking System</h1>
                <p className="text-sm text-muted-foreground">Real-time job management dashboard</p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {lastSync && (
                <div className="hidden md:flex items-center gap-2 text-xs text-muted-foreground">
                  <span>Last sync: {lastSync.toLocaleTimeString()}</span>
                  <Button variant="ghost" size="sm" onClick={refreshData}>
                    <RefreshCw className="h-3 w-3" />
                  </Button>
                </div>
              )}

              <Button variant="ghost" size="sm" onClick={() => setTheme(theme === "dark" ? "light" : "dark")}>
                {theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
              </Button>

              <div className="flex items-center gap-1 border rounded-md p-1">
                <Button
                  variant={viewMode === "grid" ? "default" : "ghost"}
                  size="sm"
                  onClick={() => setViewMode("grid")}
                  className="h-8 w-8 p-0"
                >
                  <Grid className="h-4 w-4" />
                </Button>
                <Button
                  variant={viewMode === "list" ? "default" : "ghost"}
                  size="sm"
                  onClick={() => setViewMode("list")}
                  className="h-8 w-8 p-0"
                >
                  <List className="h-4 w-4" />
                </Button>
              </div>

              <MobileFilters />

              <Dialog open={isAddJobOpen} onOpenChange={setIsAddJobOpen}>
                <DialogTrigger asChild>
                  <Button className="hidden md:flex">
                    <Plus className="h-4 w-4 mr-2" />
                    Add Job
                  </Button>
                </DialogTrigger>
              </Dialog>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-6">
        {/* Stats Overview */}
        <div className={`grid gap-4 mb-6 ${isMobile ? "grid-cols-2" : "grid-cols-2 md:grid-cols-5"}`}>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-full">
                  <Calendar className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{stats.total}</p>
                  <p className="text-xs text-muted-foreground">Total Jobs</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-yellow-100 dark:bg-yellow-900 rounded-full">
                  <Clock className="h-4 w-4 text-yellow-600 dark:text-yellow-400" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{stats.pending}</p>
                  <p className="text-xs text-muted-foreground">Pending</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-full">
                  <RotateCcw className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{stats.inProgress}</p>
                  <p className="text-xs text-muted-foreground">In Progress</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-green-100 dark:bg-green-900 rounded-full">
                  <CheckCircle className="h-4 w-4 text-green-600 dark:text-green-400" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{stats.completed}</p>
                  <p className="text-xs text-muted-foreground">Completed</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className={isMobile ? "col-span-2" : ""}>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-red-100 dark:bg-red-900 rounded-full">
                  <AlertTriangle className="h-4 w-4 text-red-600 dark:text-red-400" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{stats.overdue}</p>
                  <p className="text-xs text-muted-foreground">Overdue</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Desktop Filters */}
        {!isMobile && (
          <Card className="mb-6">
            <CardContent className="p-4">
              <div className="flex flex-wrap gap-4 items-center">
                <div className="flex-1 min-w-[200px]">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                    <Input
                      placeholder="Search jobs..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>

                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-[150px]">
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
                  <SelectTrigger className="w-[150px]">
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

                <Select value={departmentFilter} onValueChange={setDepartmentFilter}>
                  <SelectTrigger className="w-[150px]">
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
              </div>
            </CardContent>
          </Card>
        )}

        {/* Main Content */}
        <Tabs defaultValue="jobs" className="space-y-6">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="jobs">Job Cards ({filteredJobs.length})</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
          </TabsList>

          <TabsContent value="jobs">
            {filteredJobs.length === 0 ? (
              <Card>
                <CardContent className="flex flex-col items-center justify-center py-16">
                  <div className="text-center space-y-4">
                    <div className="mx-auto w-16 h-16 bg-muted rounded-full flex items-center justify-center">
                      <Calendar className="h-8 w-8 text-muted-foreground" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold">No job cards found</h3>
                      <p className="text-muted-foreground">
                        {jobs.length === 0
                          ? "Get started by creating your first job card"
                          : "Try adjusting your search or filter criteria"}
                      </p>
                    </div>
                    {jobs.length === 0 && (
                      <Dialog open={isAddJobOpen} onOpenChange={setIsAddJobOpen}>
                        <DialogTrigger asChild>
                          <Button>
                            <Plus className="h-4 w-4 mr-2" />
                            Create First Job
                          </Button>
                        </DialogTrigger>
                      </Dialog>
                    )}
                  </div>
                </CardContent>
              </Card>
            ) : (
              <div
                className={
                  viewMode === "grid"
                    ? `grid gap-4 ${isMobile ? "grid-cols-1" : "grid-cols-1 md:grid-cols-2 lg:grid-cols-3"}`
                    : "space-y-4"
                }
              >
                {filteredJobs.map((job) => (
                  <JobCard key={job.id} job={job} />
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="analytics">
            <div className="grid gap-6 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle>Status Distribution</CardTitle>
                </CardHeader>
                <CardContent>
                  <ChartContainer
                    config={{
                      pending: { label: "Pending", color: "#6b7280" },
                      "in-progress": { label: "In Progress", color: "#3b82f6" },
                      completed: { label: "Completed", color: "#10b981" },
                      "on-hold": { label: "On Hold", color: "#f59e0b" },
                      cancelled: { label: "Cancelled", color: "#ef4444" },
                    }}
                    className="h-[300px]"
                  >
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={chartData}
                          cx="50%"
                          cy="50%"
                          outerRadius={80}
                          fill="#8884d8"
                          dataKey="value"
                          label={({ name, value }) => `${name}: ${value}`}
                        >
                          {chartData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <ChartTooltip content={<ChartTooltipContent />} />
                      </PieChart>
                    </ResponsiveContainer>
                  </ChartContainer>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Department Performance</CardTitle>
                </CardHeader>
                <CardContent>
                  <ChartContainer
                    config={{
                      completed: { label: "Completed", color: "#10b981" },
                      total: { label: "Total", color: "#6b7280" },
                    }}
                    className="h-[300px]"
                  >
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={performanceData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="department" />
                        <YAxis />
                        <ChartTooltip content={<ChartTooltipContent />} />
                        <Bar dataKey="completed" fill="#10b981" name="Completed" />
                        <Bar dataKey="total" fill="#6b7280" name="Total" />
                      </BarChart>
                    </ResponsiveContainer>
                  </ChartContainer>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>

      {/* Add Job Dialog */}
      <Dialog open={isAddJobOpen} onOpenChange={setIsAddJobOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Add New Job Card</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="title">Job Title *</Label>
                <Input
                  id="title"
                  value={newJob.title}
                  onChange={(e) => setNewJob({ ...newJob, title: e.target.value })}
                  placeholder="Enter job title"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="assignee">Assignee</Label>
                <Input
                  id="assignee"
                  value={newJob.assignee}
                  onChange={(e) => setNewJob({ ...newJob, assignee: e.target.value })}
                  placeholder="Assign to"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={newJob.description}
                onChange={(e) => setNewJob({ ...newJob, description: e.target.value })}
                placeholder="Job description"
                rows={3}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="status">Status</Label>
                <Select
                  value={newJob.status}
                  onValueChange={(value: JobCard["status"]) => setNewJob({ ...newJob, status: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="in-progress">In Progress</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                    <SelectItem value="on-hold">On Hold</SelectItem>
                    <SelectItem value="cancelled">Cancelled</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="priority">Priority</Label>
                <Select
                  value={newJob.priority}
                  onValueChange={(value: JobCard["priority"]) => setNewJob({ ...newJob, priority: value })}
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

              <div className="space-y-2">
                <Label htmlFor="department">Department</Label>
                <Input
                  id="department"
                  value={newJob.department}
                  onChange={(e) => setNewJob({ ...newJob, department: e.target.value })}
                  placeholder="Department"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="dueDate">Due Date</Label>
                <Input
                  id="dueDate"
                  type="date"
                  value={newJob.dueDate}
                  onChange={(e) => setNewJob({ ...newJob, dueDate: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="estimatedHours">Estimated Hours</Label>
                <Input
                  id="estimatedHours"
                  type="number"
                  value={newJob.estimatedHours}
                  onChange={(e) => setNewJob({ ...newJob, estimatedHours: Number.parseInt(e.target.value) || 0 })}
                  placeholder="0"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="tags">Tags (comma-separated)</Label>
              <Input
                id="tags"
                value={newJob.tags}
                onChange={(e) => setNewJob({ ...newJob, tags: e.target.value })}
                placeholder="urgent, client-work, maintenance"
              />
            </div>
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setIsAddJobOpen(false)}>
              Cancel
            </Button>
            <Button onClick={addJob} disabled={!newJob.title.trim()}>
              Add Job Card
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
