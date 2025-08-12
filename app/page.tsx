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

const initialJobs: JobCard[] = [
  {
    id: "JOB-001",
    title: "Server Maintenance",
    description: "Routine server maintenance and updates",
    status: "in-progress",
    priority: "high",
    assignee: "John Smith",
    createdAt: new Date("2024-01-10T09:00:00"),
    updatedAt: new Date("2024-01-10T14:30:00"),
    dueDate: new Date("2024-01-12T17:00:00"),
    estimatedHours: 8,
    actualHours: 5,
    department: "IT",
    tags: ["maintenance", "server", "critical"],
  },
  {
    id: "JOB-002",
    title: "Database Backup",
    description: "Weekly database backup and verification",
    status: "completed",
    priority: "medium",
    assignee: "Sarah Johnson",
    createdAt: new Date("2024-01-09T08:00:00"),
    updatedAt: new Date("2024-01-10T10:00:00"),
    dueDate: new Date("2024-01-11T12:00:00"),
    estimatedHours: 4,
    actualHours: 3,
    department: "IT",
    tags: ["backup", "database", "routine"],
  },
  {
    id: "JOB-003",
    title: "Equipment Inspection",
    description: "Monthly safety inspection of manufacturing equipment",
    status: "pending",
    priority: "urgent",
    assignee: "Mike Wilson",
    createdAt: new Date("2024-01-10T07:00:00"),
    updatedAt: new Date("2024-01-10T07:00:00"),
    dueDate: new Date("2024-01-11T16:00:00"),
    estimatedHours: 6,
    department: "Manufacturing",
    tags: ["inspection", "safety", "equipment"],
  },
  {
    id: "JOB-004",
    title: "Network Security Audit",
    description: "Quarterly network security assessment",
    status: "on-hold",
    priority: "high",
    assignee: "Lisa Chen",
    createdAt: new Date("2024-01-08T10:00:00"),
    updatedAt: new Date("2024-01-10T11:00:00"),
    dueDate: new Date("2024-01-15T17:00:00"),
    estimatedHours: 12,
    actualHours: 2,
    department: "Security",
    tags: ["security", "audit", "network"],
  },
  {
    id: "JOB-005",
    title: "Software Update Deployment",
    description: "Deploy latest software updates across all systems",
    status: "completed",
    priority: "medium",
    assignee: "John Smith",
    createdAt: new Date("2024-01-07T09:00:00"),
    updatedAt: new Date("2024-01-09T16:00:00"),
    dueDate: new Date("2024-01-10T17:00:00"),
    estimatedHours: 6,
    actualHours: 7,
    department: "IT",
    tags: ["software", "deployment", "update"],
  },
  {
    id: "JOB-006",
    title: "Quality Control Check",
    description: "Weekly quality control inspection of production line",
    status: "completed",
    priority: "high",
    assignee: "Mike Wilson",
    createdAt: new Date("2024-01-06T08:00:00"),
    updatedAt: new Date("2024-01-08T15:00:00"),
    dueDate: new Date("2024-01-09T17:00:00"),
    estimatedHours: 4,
    actualHours: 4,
    department: "Manufacturing",
    tags: ["quality", "inspection", "production"],
  },
  {
    id: "JOB-007",
    title: "Employee Training Session",
    description: "Conduct cybersecurity awareness training for new employees",
    status: "in-progress",
    priority: "low",
    assignee: "Lisa Chen",
    createdAt: new Date("2024-01-09T10:00:00"),
    updatedAt: new Date("2024-01-10T12:00:00"),
    dueDate: new Date("2024-01-14T16:00:00"),
    estimatedHours: 8,
    actualHours: 3,
    department: "Security",
    tags: ["training", "cybersecurity", "employees"],
  },
  {
    id: "JOB-008",
    title: "Inventory Management",
    description: "Update and reconcile inventory database",
    status: "pending",
    priority: "medium",
    assignee: "Sarah Johnson",
    createdAt: new Date("2024-01-10T11:00:00"),
    updatedAt: new Date("2024-01-10T11:00:00"),
    dueDate: new Date("2024-01-13T17:00:00"),
    estimatedHours: 5,
    department: "Operations",
    tags: ["inventory", "database", "reconciliation"],
  },
]

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

export default function JobCardTrackingSystem() {
  const [jobs, setJobs] = useState<JobCard[]>(initialJobs)
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState<JobStatus | "all">("all")
  const [priorityFilter, setPriorityFilter] = useState<Priority | "all">("all")
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
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
  const { theme, setTheme } = useTheme()

  // Simulate real-time updates
  useEffect(() => {
    const interval = setInterval(() => {
      setJobs((prevJobs) =>
        prevJobs.map((job) => ({
          ...job,
          updatedAt: new Date(),
        })),
      )
    }, 30000) // Update every 30 seconds

    return () => clearInterval(interval)
  }, [])

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
    setJobs((prevJobs) =>
      prevJobs.map((job) => (job.id === jobId ? { ...job, status: newStatus, updatedAt: new Date() } : job)),
    )
  }

  const deleteJob = async (jobId: string) => {
    setIsDeleting(true)

    // Simulate API call delay
    await new Promise((resolve) => setTimeout(resolve, 500))

    setJobs((prevJobs) => prevJobs.filter((job) => job.id !== jobId))
    setDeleteJobId(null)
    setIsDeleting(false)

    // Show success message (you could implement a toast notification here)
    console.log(`Job ${jobId} deleted successfully`)
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
      id: `JOB-${String(jobs.length + 1).padStart(3, "0")}`,
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

    setJobs((prevJobs) => [...prevJobs, job])
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
      return {
        date: date.toLocaleDateString("en-US", { month: "short", day: "numeric" }),
        completed: Math.floor(Math.random() * 5) + 1,
        created: Math.floor(Math.random() * 8) + 2,
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
    const departments = [...new Set(jobs.map((job) => job.department))]
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
    const assignees = [...new Set(jobs.map((job) => job.assignee))]
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

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">Job Card Tracking System</h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">Real-time job management and tracking dashboard</p>
          </div>
          <div className="flex gap-2">
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

        {/* Delete Confirmation Dialog */}
        <AlertDialog open={!!deleteJobId} onOpenChange={() => setDeleteJobId(null)}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Delete Job Card</AlertDialogTitle>
              <AlertDialogDescription>
                Are you sure you want to delete "{jobToDelete?.title}"? This action cannot be undone and will
                permanently remove the job card and all its data.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel onClick={cancelDelete} disabled={isDeleting}>
                Cancel
              </AlertDialogCancel>
              <AlertDialogAction
                onClick={confirmDelete}
                disabled={isDeleting}
                className="bg-red-600 hover:bg-red-700 focus:ring-red-600"
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

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
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
                  <CardTitle>Job Completion Trends</CardTitle>
                  <CardDescription>Daily job creation vs completion over the last 7 days</CardDescription>
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
                    className="h-[300px]"
                  >
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={getCompletionTrends()}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="date" />
                        <YAxis />
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
                  <CardTitle>Status Distribution</CardTitle>
                  <CardDescription>Current distribution of job statuses</CardDescription>
                </CardHeader>
                <CardContent>
                  <ChartContainer
                    config={{
                      completed: { label: "Completed", color: "#10b981" },
                      inProgress: { label: "In Progress", color: "#3b82f6" },
                      pending: { label: "Pending", color: "#f59e0b" },
                      onHold: { label: "On Hold", color: "#f97316" },
                    }}
                    className="h-[300px]"
                  >
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={getStatusDistribution()}
                          cx="50%"
                          cy="50%"
                          innerRadius={60}
                          outerRadius={100}
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
              <Card>
                <CardHeader>
                  <CardTitle>Department Performance</CardTitle>
                  <CardDescription>Completion efficiency by department</CardDescription>
                </CardHeader>
                <CardContent>
                  <ChartContainer
                    config={{
                      efficiency: {
                        label: "Efficiency %",
                        color: "hsl(var(--chart-3))",
                      },
                    }}
                    className="h-[300px]"
                  >
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={getDepartmentPerformance()}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="department" />
                        <YAxis />
                        <ChartTooltip content={<ChartTooltipContent />} />
                        <Bar dataKey="efficiency" fill="var(--color-efficiency)" radius={[4, 4, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </ChartContainer>
                </CardContent>
              </Card>

              {/* Priority Distribution */}
              <Card>
                <CardHeader>
                  <CardTitle>Priority Distribution</CardTitle>
                  <CardDescription>Jobs breakdown by priority level</CardDescription>
                </CardHeader>
                <CardContent>
                  <ChartContainer
                    config={{
                      low: { label: "Low", color: "#6b7280" },
                      medium: { label: "Medium", color: "#3b82f6" },
                      high: { label: "High", color: "#f97316" },
                      urgent: { label: "Urgent", color: "#ef4444" },
                    }}
                    className="h-[300px]"
                  >
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={getPriorityDistribution()} layout="horizontal">
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis type="number" />
                        <YAxis dataKey="name" type="category" />
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
            <Card>
              <CardHeader>
                <CardTitle>Time Tracking Analysis</CardTitle>
                <CardDescription>Estimated vs actual hours for completed jobs</CardDescription>
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
                  className="h-[400px]"
                >
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={getTimeTrackingData()}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="title" angle={-45} textAnchor="end" height={100} />
                      <YAxis />
                      <ChartTooltip content={<ChartTooltipContent />} />
                      <Legend />
                      <Bar dataKey="estimated" fill="var(--color-estimated)" name="Estimated Hours" />
                      <Bar dataKey="actual" fill="var(--color-actual)" name="Actual Hours" />
                    </BarChart>
                  </ResponsiveContainer>
                </ChartContainer>
              </CardContent>
            </Card>

            {/* Assignee Performance */}
            <Card>
              <CardHeader>
                <CardTitle>Assignee Performance</CardTitle>
                <CardDescription>Job completion and average hours by team member</CardDescription>
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
                      className="h-[250px]"
                    >
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={getAssigneePerformance()}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="assignee" />
                          <YAxis />
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
                      className="h-[250px]"
                    >
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={getAssigneePerformance()}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="assignee" />
                          <YAxis />
                          <ChartTooltip content={<ChartTooltipContent />} />
                          <Bar dataKey="avgHours" fill="var(--color-avgHours)" radius={[4, 4, 0, 0]} />
                        </BarChart>
                      </ResponsiveContainer>
                    </ChartContainer>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Key Performance Indicators */}
            <Card>
              <CardHeader>
                <CardTitle>Key Performance Indicators</CardTitle>
                <CardDescription>Important metrics and insights</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div className="text-center p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
                    <div className="text-2xl font-bold text-green-600">
                      {Math.round((statusCounts.completed / statusCounts.total) * 100)}%
                    </div>
                    <div className="text-sm text-green-700 dark:text-green-400">Completion Rate</div>
                  </div>
                  <div className="text-center p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                    <div className="text-2xl font-bold text-blue-600">
                      {jobs.filter((job) => new Date() > job.dueDate && job.status !== "completed").length}
                    </div>
                    <div className="text-sm text-blue-700 dark:text-blue-400">Overdue Jobs</div>
                  </div>
                  <div className="text-center p-4 bg-orange-50 dark:bg-orange-900/20 rounded-lg">
                    <div className="text-2xl font-bold text-orange-600">
                      {Math.round(
                        jobs.filter((job) => job.actualHours).reduce((sum, job) => sum + (job.actualHours || 0), 0) /
                          jobs.filter((job) => job.actualHours).length,
                      ) || 0}
                      h
                    </div>
                    <div className="text-sm text-orange-700 dark:text-orange-400">Avg. Job Duration</div>
                  </div>
                  <div className="text-center p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                    <div className="text-2xl font-bold text-purple-600">
                      {jobs.filter((job) => job.priority === "urgent").length}
                    </div>
                    <div className="text-sm text-purple-700 dark:text-purple-400">Urgent Jobs</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Filters */}
        <Card>
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
              <Select value={priorityFilter} onValueChange={(value: Priority | "all") => setPriorityFilter(value)}>
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
          <TabsList>
            <TabsTrigger value="grid">Grid View</TabsTrigger>
            <TabsTrigger value="list">List View</TabsTrigger>
          </TabsList>

          <TabsContent value="grid">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
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
                        <Select value={job.status} onValueChange={(value: JobStatus) => updateJobStatus(job.id, value)}>
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
            <Card>
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
      </div>
    </div>
  )
}
