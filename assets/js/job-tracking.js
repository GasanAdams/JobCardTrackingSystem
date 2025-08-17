// Ensure jQuery is available
const jQuery = window.jQuery
if (!jQuery) {
  console.error("jQuery is not defined")
}

// Ensure jct_ajax is available
const jct_ajax = window.jct_ajax
if (typeof jct_ajax === "undefined") {
  console.error("jct_ajax is not defined")
}

jQuery(document).ready(($) => {
  // Global variables
  let currentJobs = []
  let currentView = "grid"
  let autoRefreshInterval = null
  let autoRefreshCountdown = null
  let autoRefreshTimeLeft = 0
  let isLoading = false

  const currentFilters = {
    search: "",
    status: "all",
    priority: "all",
    department: "",
  }

  // Initialize
  init()

  function init() {
    setupEventListeners()
    loadJobs()
    loadStats()
    initializeAutoRefresh()
    initializeTheme()
  }

  function setupEventListeners() {
    // Create job modal
    $(document).on("click", "#jct-create-job-btn", (e) => {
      e.preventDefault()
      $("#jct-create-job-modal").show()
      $("#jct-job-title").focus()
    })

    // Close modal
    $(document).on("click", ".jct-modal-close", () => {
      $(".jct-modal").hide()
      resetCreateForm()
    })

    // Close modal on backdrop click
    $(document).on("click", ".jct-modal", function (e) {
      if (e.target === this) {
        $(this).hide()
        resetCreateForm()
      }
    })

    // Create job form submission
    $(document).on("submit", ".jct-create-job-form", (e) => {
      e.preventDefault()
      createJob()
    })

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

    // Status update - FIXED
    $(document).on("change", ".jct-status-select", function () {
      const jobId = $(this).data("job-id")
      const newStatus = $(this).val()
      const $select = $(this)

      // Store original value in case we need to revert
      const originalStatus = $select.data("original-status") || getCurrentJobStatus(jobId)
      $select.data("original-status", originalStatus)

      updateJobStatus(jobId, newStatus, $select, originalStatus)
    })

    // Delete job
    $(document).on("click", ".jct-delete-job", function () {
      const jobId = $(this).data("job-id")
      const jobTitle = $(this).data("job-title")

      if (confirm('Are you sure you want to delete "' + jobTitle + '"? This action cannot be undone.')) {
        deleteJob(jobId)
      }
    })

    // Theme toggle
    $(document).on("click", ".jct-theme-toggle", () => {
      toggleTheme()
    })

    // Auto-refresh controls
    $(document).on("click", ".jct-auto-refresh-option", function (e) {
      e.preventDefault()
      const interval = Number.parseInt($(this).data("interval"))
      setAutoRefresh(interval)
      updateAutoRefreshUI()
      localStorage.setItem("jct_auto_refresh", interval.toString())
      showNotification("Auto-refresh updated to " + (interval === 0 ? "Off" : interval / 60000 + " minutes"))
    })

    // Keyboard shortcuts
    $(document).on("keydown", (e) => {
      if (e.key === "Escape") {
        $(".jct-modal").hide()
        resetCreateForm()
      }

      if ((e.ctrlKey || e.metaKey) && e.key === "n") {
        e.preventDefault()
        $("#jct-create-job-btn").click()
      }
    })
  }

  function createJob() {
    if (isLoading) return

    const $form = $(".jct-create-job-form")
    const $submitBtn = $form.find('button[type="submit"]')
    const originalText = $submitBtn.text()

    // Validate required fields
    const title = $("#jct-job-title").val().trim()
    const assignee = $("#jct-job-assignee").val().trim()

    if (!title || !assignee) {
      showNotification("Title and Assignee are required fields", "error")
      return
    }

    isLoading = true
    $submitBtn.prop("disabled", true).text("Creating...")

    const formData = {
      action: "jct_create_job",
      nonce: jct_ajax.nonce,
      title: title,
      description: $("#jct-job-description").val().trim(),
      assignee: assignee,
      department: $("#jct-job-department").val().trim(),
      priority: $("#jct-job-priority").val(),
      estimated_hours: $("#jct-job-estimated-hours").val() || 0,
      due_date: $("#jct-job-due-date").val(),
      tags: $("#jct-job-tags").val().trim(),
    }

    $.ajax({
      url: jct_ajax.ajax_url,
      type: "POST",
      data: formData,
      success: (response) => {
        if (response.success) {
          showNotification('Job "' + title + '" created successfully!', "success")
          $("#jct-create-job-modal").hide()
          resetCreateForm()
          loadJobs()
          loadStats()
        } else {
          showNotification("Error: " + response.data, "error")
        }
      },
      error: (xhr, status, error) => {
        console.error("AJAX Error:", error, xhr.responseText)
        showNotification("Network error while creating job", "error")
      },
      complete: () => {
        isLoading = false
        $submitBtn.prop("disabled", false).text(originalText)
      },
    })
  }

  function loadJobs() {
    if (isLoading) return

    isLoading = true
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
          showNotification("Error loading jobs: " + response.data, "error")
        }
      },
      error: (xhr, status, error) => {
        console.error("AJAX Error:", error, xhr.responseText)
        showNotification("Network error while loading jobs", "error")
      },
      complete: () => {
        isLoading = false
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
                    <div class="jct-job-id">${escapeHtml(job.job_id)}</div>
                    <div class="jct-job-actions">
                        <button class="jct-delete-job" data-job-id="${escapeHtml(job.job_id)}" data-job-title="${escapeHtml(job.title)}" title="Delete Job">
                            <span class="dashicons dashicons-trash"></span>
                        </button>
                    </div>
                </div>
                <div class="jct-job-content">
                    <h3 class="jct-job-title">${escapeHtml(job.title)}</h3>
                    <p class="jct-job-description">${escapeHtml(job.description || "No description")}</p>
                    <div class="jct-job-meta">
                        <div class="jct-job-assignee">
                            <span class="dashicons dashicons-admin-users"></span>
                            ${escapeHtml(job.assignee)}
                        </div>
                        <div class="jct-job-department">
                            <span class="dashicons dashicons-building"></span>
                            ${escapeHtml(job.department || "No department")}
                        </div>
                        <div class="jct-job-due-date ${isOverdue ? "jct-overdue-text" : ""}">
                            <span class="dashicons dashicons-calendar-alt"></span>
                            ${dueDate}
                        </div>
                    </div>
                </div>
                <div class="jct-job-footer">
                    <select class="jct-status-select" data-job-id="${escapeHtml(job.job_id)}" data-original-status="${escapeHtml(job.status)}">
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
                <div class="jct-list-col">${escapeHtml(job.job_id)}</div>
                <div class="jct-list-col">${escapeHtml(job.title)}</div>
                <div class="jct-list-col">${escapeHtml(job.assignee)}</div>
                <div class="jct-list-col">
                    <select class="jct-status-select" data-job-id="${escapeHtml(job.job_id)}" data-original-status="${escapeHtml(job.status)}">
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
                    <button class="jct-delete-job" data-job-id="${escapeHtml(job.job_id)}" data-job-title="${escapeHtml(job.title)}" title="Delete Job">
                        <span class="dashicons dashicons-trash"></span>
                    </button>
                </div>
            </div>
        `
  }

  // FIXED: Status update function with proper error handling
  function updateJobStatus(jobId, newStatus, $select, originalStatus) {
    // Disable the select while updating
    $select.prop("disabled", true)

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
          // Update the original status
          $select.data("original-status", newStatus)
          loadJobs()
          loadStats()
          showNotification("Job status updated successfully!", "success")
        } else {
          // Revert to original status
          $select.val(originalStatus)
          showNotification("Error updating status: " + response.data, "error")
        }
      },
      error: (xhr, status, error) => {
        console.error("AJAX Error:", error, xhr.responseText)
        // Revert to original status
        $select.val(originalStatus)
        showNotification("Network error while updating job status", "error")
      },
      complete: () => {
        // Re-enable the select
        $select.prop("disabled", false)
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
          showNotification("Job deleted successfully!", "success")
        } else {
          showNotification("Error: " + response.data, "error")
        }
      },
      error: (xhr, status, error) => {
        console.error("AJAX Error:", error, xhr.responseText)
        showNotification("Network error while deleting job", "error")
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
        } else {
          console.error("Failed to load stats:", response.data)
        }
      },
      error: (xhr, status, error) => {
        console.error("AJAX Error:", error, xhr.responseText)
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

  function getCurrentJobStatus(jobId) {
    const job = currentJobs.find((j) => j.job_id === jobId)
    return job ? job.status : "pending"
  }

  function resetCreateForm() {
    $(".jct-create-job-form")[0].reset()
  }

  function showNotification(message, type = "info") {
    $(".jct-notification").remove()

    const notificationClass =
      type === "error"
        ? "jct-notification-error"
        : type === "success"
          ? "jct-notification-success"
          : "jct-notification-info"

    const $notification = $(`
            <div class="jct-notification ${notificationClass}">
                ${escapeHtml(message)}
                <button class="jct-notification-close">&times;</button>
            </div>
        `)

    $("body").append($notification)

    // Close button handler
    $notification.find(".jct-notification-close").on("click", () => {
      $notification.fadeOut(function () {
        $(this).remove()
      })
    })

    setTimeout(() => {
      $notification.fadeOut(function () {
        $(this).remove()
      })
    }, 5000)
  }

  function escapeHtml(text) {
    if (!text) return ""
    const map = {
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&#039;",
    }
    return text.replace(/[&<>"']/g, (m) => map[m])
  }

  // Theme functionality
  function initializeTheme() {
    const savedTheme = localStorage.getItem("jct_theme")
    if (savedTheme === "dark") {
      $("body").addClass("jct-dark-theme")
      $(".jct-theme-toggle .dashicons").removeClass("dashicons-lightbulb").addClass("dashicons-moon")
    }
  }

  function toggleTheme() {
    const currentTheme = $("body").hasClass("jct-dark-theme") ? "dark" : "light"
    const newTheme = currentTheme === "dark" ? "light" : "dark"

    $("body").toggleClass("jct-dark-theme")
    localStorage.setItem("jct_theme", newTheme)

    const $icon = $(".jct-theme-toggle .dashicons")
    if (newTheme === "dark") {
      $icon.removeClass("dashicons-lightbulb").addClass("dashicons-moon")
    } else {
      $icon.removeClass("dashicons-moon").addClass("dashicons-lightbulb")
    }

    showNotification("Theme switched to " + newTheme + " mode")
  }

  // Auto-refresh functionality
  function initializeAutoRefresh() {
    const savedAutoRefresh = localStorage.getItem("jct_auto_refresh")
    if (savedAutoRefresh && savedAutoRefresh !== "off") {
      setAutoRefresh(Number.parseInt(savedAutoRefresh))
      updateAutoRefreshUI()
    }
  }

  function setAutoRefresh(intervalMs) {
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

      autoRefreshInterval = setInterval(() => {
        if (!isLoading && !$(".jct-modal:visible").length) {
          loadJobs()
          loadStats()
          autoRefreshTimeLeft = intervalMs / 1000
        }
      }, intervalMs)

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
  }

  function updateCountdownDisplay() {
    const minutes = Math.floor(autoRefreshTimeLeft / 60)
    const seconds = autoRefreshTimeLeft % 60
    const display = minutes + ":" + (seconds < 10 ? "0" : "") + seconds
    $(".jct-auto-refresh-countdown").text(display)
  }

  // Cleanup on page unload
  $(window).on("beforeunload", () => {
    if (autoRefreshInterval) {
      clearInterval(autoRefreshInterval)
    }
    if (autoRefreshCountdown) {
      clearInterval(autoRefreshCountdown)
    }
  })
})
