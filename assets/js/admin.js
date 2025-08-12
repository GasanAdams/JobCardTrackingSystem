;(($) => {
  $(document).ready(() => {
    initializeAdminFeatures()
    loadDashboardData()
  })

  function initializeAdminFeatures() {
    bindAdminEvents()
    initializeAdminWidgets()
    setupAdminNotifications()
  }

  function bindAdminEvents() {
    $(document).on("submit", "#jct-export-form", (e) => {
      e.preventDefault()
      performAdvancedExport()
    })

    $(document).on("click", "#preview-export", () => {
      previewExport()
    })
  }

  function initializeAdminWidgets() {
    loadRecentActivity()
    loadUpcomingDeadlines()
  }

  function setupAdminNotifications() {
    checkOverdueJobs()
    setInterval(checkOverdueJobs, 300000)
  }

  function performAdvancedExport() {
    const formData = $("#jct-export-form").serialize()
    const params = new URLSearchParams(formData + "&action=jct_export_jobs&nonce=" + window.jct_ajax.nonce)

    const downloadUrl = window.jct_ajax.ajax_url + "?" + params.toString()

    const link = document.createElement("a")
    link.href = downloadUrl
    const format = $("#export-format").val()
    link.download = `jobs-export-${new Date().toISOString().split("T")[0]}.${format}`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)

    showAdminNotice("Export started. Download should begin shortly.", "success")
  }

  function previewExport() {
    const formData = $("#jct-export-form").serialize()

    $.ajax({
      url: window.jct_ajax.ajax_url,
      type: "GET",
      data: formData + "&action=jct_get_jobs&nonce=" + window.jct_ajax.nonce + "&limit=5",
      success: (response) => {
        if (response.success) {
          const jobs = response.data.jobs
          let previewHtml = `<p><strong>Preview (first 5 jobs):</strong></p>`

          if (jobs.length === 0) {
            previewHtml += `<p>No jobs match the selected criteria.</p>`
          } else {
            previewHtml += `<p>Total jobs to export: ${response.data.total}</p>`
            previewHtml += `<table class="wp-list-table widefat fixed striped">`
            previewHtml += `<thead><tr><th>Job ID</th><th>Title</th><th>Status</th><th>Assignee</th></tr></thead><tbody>`

            jobs.forEach((job) => {
              previewHtml += `<tr>
                <td>${job.job_id}</td>
                <td>${job.title}</td>
                <td>${job.status}</td>
                <td>${job.assignee}</td>
              </tr>`
            })

            previewHtml += `</tbody></table>`
          }

          $("#preview-content").html(previewHtml)
          $("#export-preview").show()
        }
      },
      error: () => {
        showAdminNotice("Error loading preview", "error")
      },
    })
  }

  function loadDashboardData() {
    loadAnalyticsData()
  }

  function loadAnalyticsData() {
    $.ajax({
      url: window.jct_ajax.ajax_url,
      type: "GET",
      data: {
        action: "jct_get_stats",
        nonce: window.jct_ajax.nonce,
      },
      success: (response) => {
        if (response.success) {
          renderAnalyticsCharts(response.data)
        }
      },
      error: () => {
        console.error("Error loading analytics data")
      },
    })
  }

  function renderAnalyticsCharts(data) {
    if (data.total > 0) {
      const completionRate = Math.round((data.completed / data.total) * 100)
      const overdueRate = Math.round((data.overdue / data.total) * 100)

      $("#completion-rate").text(completionRate + "%")
      $("#overdue-rate").text(overdueRate + "%")
      $("#avg-completion-time").text("6.5h") // Sample data
      $("#productivity-score").text("85") // Sample data
    }
  }

  function loadRecentActivity() {
    // Sample recent activity data
    const activities = [
      {
        type: "job_created",
        description: "New job 'Server Maintenance' created",
        created_at: new Date().toISOString(),
      },
      {
        type: "status_changed",
        description: "Job 'Database Backup' marked as completed",
        created_at: new Date(Date.now() - 3600000).toISOString(),
      },
    ]

    renderRecentActivity(activities)
  }

  function renderRecentActivity(activities) {
    const $container = $("#jct-recent-activity")
    if (!$container.length) return

    if (activities.length === 0) {
      $container.html("<p>No recent activity</p>")
      return
    }

    const html = activities
      .map(
        (activity) => `
            <div class="jct-activity-item">
                <div class="jct-activity-icon">
                    <span class="dashicons dashicons-${getActivityIcon(activity.type)}"></span>
                </div>
                <div class="jct-activity-content">
                    <div class="jct-activity-text">${activity.description}</div>
                    <div class="jct-activity-time">${formatRelativeTime(activity.created_at)}</div>
                </div>
            </div>
        `,
      )
      .join("")

    $container.html(html)
  }

  function getActivityIcon(type) {
    const icons = {
      job_created: "plus",
      job_updated: "edit",
      job_completed: "yes",
      job_deleted: "trash",
      status_changed: "update",
    }
    return icons[type] || "admin-generic"
  }

  function formatRelativeTime(dateString) {
    const date = new Date(dateString)
    const now = new Date()
    const diffMs = now - date
    const diffMins = Math.floor(diffMs / 60000)
    const diffHours = Math.floor(diffMs / 3600000)
    const diffDays = Math.floor(diffMs / 86400000)

    if (diffMins < 1) return "Just now"
    if (diffMins < 60) return `${diffMins} minutes ago`
    if (diffHours < 24) return `${diffHours} hours ago`
    if (diffDays < 7) return `${diffDays} days ago`
    return date.toLocaleDateString()
  }

  function loadUpcomingDeadlines() {
    // This would load from the database in a real implementation
    const upcomingJobs = [
      {
        title: "Equipment Inspection",
        assignee: "Mike Wilson",
        due_date: new Date(Date.now() + 86400000).toISOString(),
      },
    ]

    renderUpcomingDeadlines(upcomingJobs)
  }

  function renderUpcomingDeadlines(jobs) {
    const $container = $("#jct-upcoming-deadlines")
    if (!$container.length) return

    if (jobs.length === 0) {
      $container.html("<p>No upcoming deadlines</p>")
      return
    }

    const html = jobs
      .map(
        (job) => `
            <div class="jct-deadline-item">
                <div class="jct-deadline-job">
                    <strong>${job.title}</strong>
                    <span class="jct-deadline-assignee">${job.assignee}</span>
                </div>
                <div class="jct-deadline-date ${isOverdue(job.due_date) ? "overdue" : ""}">
                    ${formatDate(job.due_date)}
                </div>
            </div>
        `,
      )
      .join("")

    $container.html(html)
  }

  function isOverdue(dateString) {
    return new Date(dateString) < new Date()
  }

  function formatDate(dateString) {
    const date = new Date(dateString)
    return date.toLocaleDateString()
  }

  function checkOverdueJobs() {
    $.ajax({
      url: window.jct_ajax.ajax_url,
      type: "GET",
      data: {
        action: "jct_get_stats",
        nonce: window.jct_ajax.nonce,
      },
      success: (response) => {
        if (response.success && response.data.overdue > 0) {
          showOverdueNotice(response.data.overdue)
        }
      },
    })
  }

  function showOverdueNotice(count) {
    if ($(".jct-overdue-notice").length > 0) return

    const notice = $(`
            <div class="notice notice-warning jct-overdue-notice">
                <p>
                    <strong>Job Card Tracking:</strong> 
                    You have ${count} overdue job${count > 1 ? "s" : ""} that need attention.
                    <a href="admin.php?page=job-card-tracking&status=overdue">View overdue jobs</a>
                </p>
            </div>
        `)

    $(".wrap h1").after(notice)
  }

  function showAdminNotice(message, type = "info") {
    const notice = $(`
            <div class="notice notice-${type} is-dismissible jct-admin-notice">
                <p>${message}</p>
            </div>
        `)

    $(".wrap h1").after(notice)

    setTimeout(() => {
      notice.fadeOut(function () {
        $(this).remove()
      })
    }, 5000)
  }
})(window.jQuery)
