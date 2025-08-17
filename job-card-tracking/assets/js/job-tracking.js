jQuery(document).ready(($) => {
  // Declare jQuery variable
  const jQuery = window.jQuery

  // Declare jct_ajax variable
  const jct_ajax = window.jct_ajax

  // Auto-refresh functionality
  let autoRefreshInterval = null
  let autoRefreshCountdown = null
  let autoRefreshTimeLeft = 0

  // Initialize auto-refresh from localStorage
  const savedAutoRefresh = localStorage.getItem("jct_auto_refresh")
  if (savedAutoRefresh && savedAutoRefresh !== "off") {
    setAutoRefresh(Number.parseInt(savedAutoRefresh))
    updateAutoRefreshUI()
  }

  // Auto-refresh dropdown handlers
  $(document).on("click", ".jct-auto-refresh-option", function (e) {
    e.preventDefault()
    const interval = Number.parseInt($(this).data("interval"))
    setAutoRefresh(interval)
    updateAutoRefreshUI()

    // Save to localStorage
    localStorage.setItem("jct_auto_refresh", interval.toString())

    // Show confirmation
    showNotification("Auto-refresh updated to " + (interval === 0 ? "Off" : interval / 60000 + " minutes"))
  })

  function setAutoRefresh(intervalMs) {
    // Clear existing intervals
    if (autoRefreshInterval) {
      clearInterval(autoRefreshInterval)
      autoRefreshInterval = null
    }
    if (autoRefreshCountdown) {
      clearInterval(autoRefreshCountdown)
      autoRefreshCountdown = null
    }

    if (intervalMs > 0) {
      autoRefreshTimeLeft = intervalMs / 1000

      // Set up the main refresh interval
      autoRefreshInterval = setInterval(() => {
        if (!$(".jct-loading").is(":visible")) {
          loadJobs()
          autoRefreshTimeLeft = intervalMs / 1000
        }
      }, intervalMs)

      // Set up the countdown timer
      autoRefreshCountdown = setInterval(() => {
        autoRefreshTimeLeft--
        updateCountdownDisplay()

        if (autoRefreshTimeLeft <= 0) {
          autoRefreshTimeLeft = intervalMs / 1000
        }
      }, 1000)

      updateCountdownDisplay()
    }
  }

  function updateAutoRefreshUI() {
    const savedInterval = localStorage.getItem("jct_auto_refresh") || "off"
    const $button = $(".jct-auto-refresh-btn")
    const $indicator = $(".jct-auto-refresh-indicator")
    const $countdown = $(".jct-auto-refresh-countdown")

    if (savedInterval === "off" || savedInterval === "0") {
      $button
        .removeClass("active")
        .find(".dashicons")
        .removeClass("dashicons-controls-play")
        .addClass("dashicons-controls-pause")
      $indicator.hide()
      $countdown.hide()
    } else {
      $button
        .addClass("active")
        .find(".dashicons")
        .removeClass("dashicons-controls-pause")
        .addClass("dashicons-controls-play")
      $indicator.show()
      $countdown.show()
    }

    // Update mobile status
    const $mobileStatus = $(".jct-mobile-auto-refresh-status")
    if (savedInterval === "off" || savedInterval === "0") {
      $mobileStatus.text("Off").removeClass("active")
    } else {
      const minutes = Number.parseInt(savedInterval) / 60000
      $mobileStatus.text("Every " + minutes + " min").addClass("active")
    }
  }

  function updateCountdownDisplay() {
    const minutes = Math.floor(autoRefreshTimeLeft / 60)
    const seconds = autoRefreshTimeLeft % 60
    const display = minutes + ":" + (seconds < 10 ? "0" : "") + seconds
    $(".jct-auto-refresh-countdown").text(display)
  }

  function showNotification(message) {
    // Create WordPress-style admin notice
    const $notice = $('<div class="notice notice-success is-dismissible"><p>' + message + "</p></div>")
    $(".wrap h1").after($notice)

    // Auto-dismiss after 3 seconds
    setTimeout(() => {
      $notice.fadeOut(function () {
        $(this).remove()
      })
    }, 3000)
  }

  // Job management functionality
  let currentJobs = []
  let currentView = "grid"
  const currentFilters = {
    search: "",
    status: "all",
    priority: "all",
    department: "",
  }

  // Initialize
  loadJobs()
  loadStats()

  // Search functionality
  let searchTimeout
  $(document).on("input", ".jct-search-input", function () {
    clearTimeout(searchTimeout)
    const searchTerm = $(this).val()

    searchTimeout = setTimeout(() => {
      currentFilters.search = searchTerm
      loadJobs()
    }, 300)
  })

  // Filter handlers
  $(document).on("change", ".jct-status-filter", function () {
    currentFilters.status = $(this).val()
    loadJobs()
  })

  $(document).on("change", ".jct-priority-filter", function () {
    currentFilters.priority = $(this).val()
    loadJobs()
  })

  $(document).on("input", ".jct-department-filter", function () {
    currentFilters.department = $(this).val()
    loadJobs()
  })

  // View toggle
  $(document).on("click", ".jct-view-toggle", function () {
    const view = $(this).data("view")
    currentView = view

    $(".jct-view-toggle").removeClass("active")
    $(this).addClass("active")

    renderJobs()
  })

  // Status update
  $(document).on("change", ".jct-status-select", function () {
    const jobId = $(this).data("job-id")
    const newStatus = $(this).val()
    updateJobStatus(jobId, newStatus)
  })

  // Delete job
  $(document).on("click", ".jct-delete-job", function () {
    const jobId = $(this).data("job-id")
    const jobTitle = $(this).data("job-title")

    if (confirm('Are you sure you want to delete "' + jobTitle + '"? This action cannot be undone.')) {
      deleteJob(jobId)
    }
  })

  // Create job form
  $(document).on("submit", ".jct-create-job-form", function (e) {
    e.preventDefault()

    const formData = new FormData(this)
    formData.append("action", "jct_create_job")
    formData.append("nonce", jct_ajax.nonce)

    const $submitBtn = $(this).find('button[type="submit"]')
    $submitBtn.prop("disabled", true).text("Creating...")

    $.ajax({
      url: jct_ajax.ajax_url,
      type: "POST",
      data: formData,
      processData: false,
      contentType: false,
      success: (response) => {
        if (response.success) {
          showNotification("Job created successfully!")
          $(".jct-create-job-form")[0].reset()
          loadJobs()
          loadStats()
        } else {
          alert("Error: " + response.data)
        }
      },
      error: () => {
        alert("An error occurred while creating the job.")
      },
      complete: () => {
        $submitBtn.prop("disabled", false).text("Create Job")
      },
    })
  })

  function loadJobs() {
    $(".jct-loading").show()

    $.ajax({
      url: jct_ajax.ajax_url,
      type: "GET",
      data: {
        action: "jct_get_jobs",
        nonce: jct_ajax.nonce,
        search: currentFilters.search,
        status: currentFilters.status,
        priority: currentFilters.priority,
        department: currentFilters.department,
        limit: 50,
        offset: 0,
      },
      success: (response) => {
        if (response.success) {
          currentJobs = response.data.jobs
          renderJobs()
          updateJobCount(response.data.total)
        } else {
          console.error("Failed to load jobs:", response.data)
        }
      },
      error: () => {
        console.error("AJAX error while loading jobs")
      },
      complete: () => {
        $(".jct-loading").hide()
      },
    })
  }

  function renderJobs() {
    const $container = $(".jct-jobs-container")

    if (currentJobs.length === 0) {
      $container.html('<div class="jct-no-jobs"><p>No jobs found matching your criteria.</p></div>')
      return
    }

    let html = ""

    if (currentView === "grid") {
      html = '<div class="jct-jobs-grid">'
      currentJobs.forEach((job) => {
        html += renderJobCard(job)
      })
      html += "</div>"
    } else {
      html = '<div class="jct-jobs-list">'
      html += '<div class="jct-list-header">'
      html += '<div class="jct-list-col">Job ID</div>'
      html += '<div class="jct-list-col">Title</div>'
      html += '<div class="jct-list-col">Assignee</div>'
      html += '<div class="jct-list-col">Status</div>'
      html += '<div class="jct-list-col">Priority</div>'
      html += '<div class="jct-list-col">Due Date</div>'
      html += '<div class="jct-list-col">Actions</div>'
      html += "</div>"

      currentJobs.forEach((job) => {
        html += renderJobRow(job)
      })
      html += "</div>"
    }

    $container.html(html)
  }

  function renderJobCard(job) {
    const statusClass = "jct-status-" + job.status.replace("-", "_")
    const priorityClass = "jct-priority-" + job.priority
    const dueDate = job.due_date ? new Date(job.due_date).toLocaleDateString() : "No due date"
    const isOverdue = job.due_date && new Date(job.due_date) < new Date() && job.status !== "completed"

    return `
            <div class="jct-job-card ${statusClass} ${priorityClass} ${isOverdue ? "jct-overdue" : ""}">
                <div class="jct-job-header">
                    <div class="jct-job-id">${job.job_id}</div>
                    <div class="jct-job-actions">
                        <button class="jct-delete-job" data-job-id="${job.job_id}" data-job-title="${job.title}" title="Delete Job">
                            <span class="dashicons dashicons-trash"></span>
                        </button>
                    </div>
                </div>
                <div class="jct-job-content">
                    <h3 class="jct-job-title">${job.title}</h3>
                    <p class="jct-job-description">${job.description || "No description"}</p>
                    <div class="jct-job-meta">
                        <div class="jct-job-assignee">
                            <span class="dashicons dashicons-admin-users"></span>
                            ${job.assignee}
                        </div>
                        <div class="jct-job-department">
                            <span class="dashicons dashicons-building"></span>
                            ${job.department || "No department"}
                        </div>
                        <div class="jct-job-due-date ${isOverdue ? "jct-overdue-text" : ""}">
                            <span class="dashicons dashicons-calendar-alt"></span>
                            ${dueDate}
                        </div>
                    </div>
                </div>
                <div class="jct-job-footer">
                    <select class="jct-status-select" data-job-id="${job.job_id}">
                        <option value="pending" ${job.status === "pending" ? "selected" : ""}>Pending</option>
                        <option value="in-progress" ${job.status === "in-progress" ? "selected" : ""}>In Progress</option>
                        <option value="completed" ${job.status === "completed" ? "selected" : ""}>Completed</option>
                        <option value="on-hold" ${job.status === "on-hold" ? "selected" : ""}>On Hold</option>
                        <option value="cancelled" ${job.status === "cancelled" ? "selected" : ""}>Cancelled</option>
                    </select>
                    <div class="jct-job-priority jct-priority-${job.priority}">
                        ${job.priority.charAt(0).toUpperCase() + job.priority.slice(1)}
                    </div>
                </div>
            </div>
        `
  }

  function renderJobRow(job) {
    const statusClass = "jct-status-" + job.status.replace("-", "_")
    const priorityClass = "jct-priority-" + job.priority
    const dueDate = job.due_date ? new Date(job.due_date).toLocaleDateString() : "No due date"
    const isOverdue = job.due_date && new Date(job.due_date) < new Date() && job.status !== "completed"

    return `
            <div class="jct-list-row ${statusClass} ${priorityClass} ${isOverdue ? "jct-overdue" : ""}">
                <div class="jct-list-col">${job.job_id}</div>
                <div class="jct-list-col">${job.title}</div>
                <div class="jct-list-col">${job.assignee}</div>
                <div class="jct-list-col">
                    <select class="jct-status-select" data-job-id="${job.job_id}">
                        <option value="pending" ${job.status === "pending" ? "selected" : ""}>Pending</option>
                        <option value="in-progress" ${job.status === "in-progress" ? "selected" : ""}>In Progress</option>
                        <option value="completed" ${job.status === "completed" ? "selected" : ""}>Completed</option>
                        <option value="on-hold" ${job.status === "on-hold" ? "selected" : ""}>On Hold</option>
                        <option value="cancelled" ${job.status === "cancelled" ? "selected" : ""}>Cancelled</option>
                    </select>
                </div>
                <div class="jct-list-col">
                    <span class="jct-priority-badge jct-priority-${job.priority}">
                        ${job.priority.charAt(0).toUpperCase() + job.priority.slice(1)}
                    </span>
                </div>
                <div class="jct-list-col ${isOverdue ? "jct-overdue-text" : ""}">${dueDate}</div>
                <div class="jct-list-col">
                    <button class="jct-delete-job" data-job-id="${job.job_id}" data-job-title="${job.title}" title="Delete Job">
                        <span class="dashicons dashicons-trash"></span>
                    </button>
                </div>
            </div>
        `
  }

  function updateJobStatus(jobId, newStatus) {
    $.ajax({
      url: jct_ajax.ajax_url,
      type: "POST",
      data: {
        action: "jct_update_job_status",
        nonce: jct_ajax.nonce,
        job_id: jobId,
        status: newStatus,
      },
      success: (response) => {
        if (response.success) {
          loadJobs()
          loadStats()
          showNotification("Job status updated successfully!")
        } else {
          alert("Error: " + response.data)
        }
      },
      error: () => {
        alert("An error occurred while updating the job status.")
      },
    })
  }

  function deleteJob(jobId) {
    $.ajax({
      url: jct_ajax.ajax_url,
      type: "POST",
      data: {
        action: "jct_delete_job",
        nonce: jct_ajax.nonce,
        job_id: jobId,
      },
      success: (response) => {
        if (response.success) {
          loadJobs()
          loadStats()
          showNotification("Job deleted successfully!")
        } else {
          alert("Error: " + response.data)
        }
      },
      error: () => {
        alert("An error occurred while deleting the job.")
      },
    })
  }

  function loadStats() {
    $.ajax({
      url: jct_ajax.ajax_url,
      type: "GET",
      data: {
        action: "jct_get_stats",
        nonce: jct_ajax.nonce,
      },
      success: (response) => {
        if (response.success) {
          updateStatsDisplay(response.data)
        }
      },
      error: () => {
        console.error("Failed to load statistics")
      },
    })
  }

  function updateStatsDisplay(stats) {
    $(".jct-stat-total .jct-stat-number").text(stats.total || 0)
    $(".jct-stat-pending .jct-stat-number").text(stats.pending || 0)
    $(".jct-stat-in-progress .jct-stat-number").text(stats.in_progress || 0)
    $(".jct-stat-completed .jct-stat-number").text(stats.completed || 0)
    $(".jct-stat-overdue .jct-stat-number").text(stats.overdue || 0)
  }

  function updateJobCount(total) {
    $(".jct-job-count").text(total + " job" + (total !== 1 ? "s" : ""))
  }

  // Theme toggle functionality
  $(document).on("click", ".jct-theme-toggle", function () {
    const currentTheme = $("body").hasClass("jct-dark-theme") ? "dark" : "light"
    const newTheme = currentTheme === "dark" ? "light" : "dark"

    $("body").toggleClass("jct-dark-theme")
    localStorage.setItem("jct_theme", newTheme)

    // Update icon
    const $icon = $(this).find(".dashicons")
    if (newTheme === "dark") {
      $icon.removeClass("dashicons-lightbulb").addClass("dashicons-moon")
    } else {
      $icon.removeClass("dashicons-moon").addClass("dashicons-lightbulb")
    }
  })

  // Initialize theme
  const savedTheme = localStorage.getItem("jct_theme")
  if (savedTheme === "dark") {
    $("body").addClass("jct-dark-theme")
    $(".jct-theme-toggle .dashicons").removeClass("dashicons-lightbulb").addClass("dashicons-moon")
  }
})
