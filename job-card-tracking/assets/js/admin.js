;(($) => {
  // Admin-specific functionality
  $(document).ready(() => {
    initializeAdminFeatures()
    loadDashboardData()
  })

  function initializeAdminFeatures() {
    // Admin-specific event handlers
    bindAdminEvents()

    // Initialize admin widgets
    initializeAdminWidgets()

    // Setup admin notifications
    setupAdminNotifications()
  }

  function bindAdminEvents() {
    // Bulk actions
    $(document).on("change", ".jct-bulk-select-all", function () {
      $(".jct-bulk-select").prop("checked", $(this).prop("checked"))
      updateBulkActions()
    })

    $(document).on("change", ".jct-bulk-select", () => {
      updateBulkActions()
    })

    $(document).on("click", "#jct-bulk-action-apply", () => {
      const action = $("#jct-bulk-action-select").val()
      const selectedJobs = $(".jct-bulk-select:checked")
        .map(function () {
          return $(this).val()
        })
        .get()

      if (action && selectedJobs.length > 0) {
        performBulkAction(action, selectedJobs)
      }
    })

    // Export functionality
    $(document).on("click", "#jct-export-jobs", () => {
      exportJobs()
    })

    // Import functionality
    $(document).on("click", "#jct-import-jobs", () => {
      $("#jct-import-modal").show()
    })

    // Settings save
    $(document).on("submit", "#jct-settings-form", (e) => {
      e.preventDefault()
      saveSettings()
    })
  }

  function initializeAdminWidgets() {
    // Initialize dashboard widgets
    loadRecentActivity()
    loadQuickStats()
    loadUpcomingDeadlines()
  }

  function setupAdminNotifications() {
    // Check for overdue jobs and show admin notices
    checkOverdueJobs()

    // Setup periodic checks
    setInterval(checkOverdueJobs, 300000) // Check every 5 minutes
  }

  function updateBulkActions() {
    const selectedCount = $(".jct-bulk-select:checked").length
    const $bulkActions = $(".jct-bulk-actions")

    if (selectedCount > 0) {
      $bulkActions.show()
      $("#jct-bulk-selected-count").text(selectedCount)
    } else {
      $bulkActions.hide()
    }
  }

  function performBulkAction(action, jobIds) {
    const confirmMessage = `Are you sure you want to ${action} ${jobIds.length} job(s)?`

    if (!confirm(confirmMessage)) {
      return
    }

    const jct_ajax = window.jct_ajax // Declare jct_ajax variable
    $.ajax({
      url: jct_ajax.ajax_url,
      type: "POST",
      data: {
        action: "jct_bulk_action",
        nonce: jct_ajax.nonce,
        bulk_action: action,
        job_ids: jobIds,
      },
      success: (response) => {
        if (response.success) {
          showAdminNotice(`Bulk action "${action}" completed successfully`, "success")
          location.reload() // Refresh the page
        } else {
          showAdminNotice("Error performing bulk action: " + response.data, "error")
        }
      },
      error: () => {
        showAdminNotice("Network error performing bulk action", "error")
      },
    })
  }

  function exportJobs() {
    const format = $("#jct-export-format").val() || "csv"
    const filters = {
      status: $("#jct-status-filter").val(),
      priority: $("#jct-priority-filter").val(),
      department: $("#jct-department-filter").val(),
      search: $("#jct-search").val(),
    }

    // Create download link
    const params = new URLSearchParams({
      action: "jct_export_jobs",
      nonce: window.jct_ajax.nonce, // Declare jct_ajax variable
      format: format,
      ...filters,
    })

    const downloadUrl = window.jct_ajax.ajax_url + "?" + params.toString() // Declare jct_ajax variable

    // Trigger download
    const link = document.createElement("a")
    link.href = downloadUrl
    link.download = `jobs-export-${new Date().toISOString().split("T")[0]}.${format}`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)

    showAdminNotice("Export started. Download should begin shortly.", "info")
  }

  function saveSettings() {
    const formData = $("#jct-settings-form").serialize()

    $.ajax({
      url: window.jct_ajax.ajax_url, // Declare jct_ajax variable
      type: "POST",
      data: formData + "&action=jct_save_settings&nonce=" + window.jct_ajax.nonce, // Declare jct_ajax variable
      success: (response) => {
        if (response.success) {
          showAdminNotice("Settings saved successfully", "success")
        } else {
          showAdminNotice("Error saving settings: " + response.data, "error")
        }
      },
      error: () => {
        showAdminNotice("Network error saving settings", "error")
      },
    })
  }

  function loadDashboardData() {
    // Load dashboard-specific data
    loadAnalyticsData()
    loadSystemInfo()
  }

  function loadAnalyticsData() {
    $.ajax({
      url: window.jct_ajax.ajax_url, // Declare jct_ajax variable
      type: "GET",
      data: {
        action: "jct_get_analytics_data",
        nonce: window.jct_ajax.nonce, // Declare jct_ajax variable
        period: "30d",
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
    // This would integrate with Chart.js or similar library
    // For now, we'll just update some basic stats
    if (data.completion_rate) {
      $("#completion-rate").text(data.completion_rate + "%")
    }
    if (data.avg_completion_time) {
      $("#avg-completion-time").text(data.avg_completion_time + "h")
    }
    if (data.overdue_rate) {
      $("#overdue-rate").text(data.overdue_rate + "%")
    }
    if (data.productivity_score) {
      $("#productivity-score").text(data.productivity_score)
    }
  }

  function loadSystemInfo() {
    // Load system information for the settings page
    $.ajax({
      url: window.jct_ajax.ajax_url, // Declare jct_ajax variable
      type: "GET",
      data: {
        action: "jct_get_system_info",
        nonce: window.jct_ajax.nonce, // Declare jct_ajax variable
      },
      success: (response) => {
        if (response.success) {
          updateSystemInfo(response.data)
        }
      },
    })
  }

  function updateSystemInfo(info) {
    // Update system information display
    if (info.total_jobs) {
      $(".jct-system-total-jobs").text(info.total_jobs)
    }
    if (info.db_version) {
      $(".jct-system-db-version").text(info.db_version)
    }
  }

  function loadRecentActivity() {
    $.ajax({
      url: window.jct_ajax.ajax_url, // Declare jct_ajax variable
      type: "GET",
      data: {
        action: "jct_get_recent_activity",
        nonce: window.jct_ajax.nonce, // Declare jct_ajax variable
        limit: 10,
      },
      success: (response) => {
        if (response.success) {
          renderRecentActivity(response.data)
        }
      },
    })
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

  function loadQuickStats() {
    // This would load quick statistics for dashboard widgets
    // Implementation would depend on specific requirements
  }

  function loadUpcomingDeadlines() {
    $.ajax({
      url: window.jct_ajax.ajax_url, // Declare jct_ajax variable
      type: "GET",
      data: {
        action: "jct_get_upcoming_deadlines",
        nonce: window.jct_ajax.nonce, // Declare jct_ajax variable
        days: 7,
      },
      success: (response) => {
        if (response.success) {
          renderUpcomingDeadlines(response.data)
        }
      },
    })
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
      url: window.jct_ajax.ajax_url, // Declare jct_ajax variable
      type: "GET",
      data: {
        action: "jct_get_overdue_count",
        nonce: window.jct_ajax.nonce, // Declare jct_ajax variable
      },
      success: (response) => {
        if (response.success && response.data.count > 0) {
          showOverdueNotice(response.data.count)
        }
      },
    })
  }

  function showOverdueNotice(count) {
    // Only show if not already shown
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

    // Auto-dismiss after 5 seconds
    setTimeout(() => {
      notice.fadeOut(function () {
        $(this).remove()
      })
    }, 5000)
  }
})(window.jQuery) // Declare jQuery variable
