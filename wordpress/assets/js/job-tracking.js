;(($) => {
  let currentTheme = localStorage.getItem("jct-theme") || "light"
  const jct_ajax = window.jct_ajax // Declare jct_ajax variable

  // Initialize the plugin
  $(document).ready(() => {
    initializeTheme()
    loadJobs()
    bindEvents()
    updateStats()

    // Auto-refresh every 30 seconds
    setInterval(() => {
      loadJobs()
      updateStats()
    }, 30000)
  })

  function initializeTheme() {
    document.documentElement.setAttribute("data-theme", currentTheme)
    updateThemeToggleText()
  }

  function toggleTheme() {
    currentTheme = currentTheme === "light" ? "dark" : "light"
    document.documentElement.setAttribute("data-theme", currentTheme)
    localStorage.setItem("jct-theme", currentTheme)
    updateThemeToggleText()
  }

  function updateThemeToggleText() {
    const toggleBtn = $("#jct-theme-toggle")
    const icon = currentTheme === "light" ? "admin-appearance" : "lightbulb"
    toggleBtn
      .find(".dashicons")
      .removeClass()
      .addClass("dashicons dashicons-" + icon)
  }

  function bindEvents() {
    // Theme toggle
    $(document).on("click", "#jct-theme-toggle", toggleTheme)

    // Create job modal
    $(document).on("click", "#jct-create-job", () => {
      $("#jct-create-modal").show()
    })

    // Close modal
    $(document).on("click", ".jct-close, .jct-cancel", () => {
      $("#jct-create-modal").hide()
    })

    // Create job form submission
    $(document).on("submit", "#jct-create-form", (e) => {
      e.preventDefault()
      createJob()
    })

    // Status change
    $(document).on("change", ".jct-job-status", function () {
      const jobId = $(this).data("job-id")
      const newStatus = $(this).val()
      updateJobStatus(jobId, newStatus)
    })

    // Search and filters
    $(document).on("input", "#jct-search", debounce(loadJobs, 300))
    $(document).on("change", "#jct-status-filter, #jct-priority-filter", loadJobs)

    // Close modal when clicking outside
    $(document).on("click", ".jct-modal", function (e) {
      if (e.target === this) {
        $(this).hide()
      }
    })
  }

  function loadJobs() {
    const search = $("#jct-search").val()
    const status = $("#jct-status-filter").val()
    const priority = $("#jct-priority-filter").val()

    $.ajax({
      url: jct_ajax.ajax_url,
      type: "GET",
      data: {
        action: "jct_get_jobs",
        nonce: jct_ajax.nonce,
        search: search,
        status: status,
        priority: priority,
      },
      success: (response) => {
        if (response.success) {
          renderJobs(response.data)
          updateStats()
        }
      },
      error: () => {
        showNotification("Error loading jobs", "error")
      },
    })
  }

  function renderJobs(jobs) {
    const container = $("#jct-jobs-container")
    container.empty()

    if (jobs.length === 0) {
      container.html('<div class="jct-no-jobs">No jobs found matching your criteria.</div>')
      return
    }

    jobs.forEach((job) => {
      const jobCard = createJobCard(job)
      container.append(jobCard)
    })
  }

  function createJobCard(job) {
    const isOverdue = new Date() > new Date(job.due_date) && job.status !== "completed"
    const tags = job.tags ? job.tags.split(",") : []

    const tagsHtml = tags.map((tag) => `<span class="jct-tag">${tag.trim()}</span>`).join("")

    const overdueHtml = isOverdue
      ? '<div class="jct-overdue-indicator"><span class="dashicons dashicons-warning"></span> Overdue</div>'
      : ""

    return `
            <div class="jct-job-card ${isOverdue ? "overdue" : ""}">
                <div class="jct-job-header">
                    <div>
                        <h3 class="jct-job-title">${job.title}</h3>
                        <div class="jct-job-id">${job.job_id}</div>
                    </div>
                    <span class="jct-priority-badge ${job.priority}">${job.priority}</span>
                </div>
                
                <div class="jct-job-description">${job.description || ""}</div>
                
                <div class="jct-job-meta">
                    <div>
                        <div class="jct-job-assignee">${job.assignee}</div>
                        <div class="jct-job-department">${job.department || ""}</div>
                    </div>
                    <select class="jct-job-status" data-job-id="${job.job_id}">
                        <option value="pending" ${job.status === "pending" ? "selected" : ""}>Pending</option>
                        <option value="in-progress" ${job.status === "in-progress" ? "selected" : ""}>In Progress</option>
                        <option value="completed" ${job.status === "completed" ? "selected" : ""}>Completed</option>
                        <option value="on-hold" ${job.status === "on-hold" ? "selected" : ""}>On Hold</option>
                        <option value="cancelled" ${job.status === "cancelled" ? "selected" : ""}>Cancelled</option>
                    </select>
                </div>
                
                <div class="jct-job-footer">
                    <div>Due: ${formatDate(job.due_date)}</div>
                    <div>${job.actual_hours ? job.actual_hours + "h" : "Est: " + job.estimated_hours + "h"}</div>
                </div>
                
                ${tagsHtml ? `<div class="jct-job-tags">${tagsHtml}</div>` : ""}
                ${overdueHtml}
            </div>
        `
  }

  function createJob() {
    const formData = {
      action: "jct_create_job",
      nonce: jct_ajax.nonce,
      title: $("#job-title").val(),
      description: $("#job-description").val(),
      priority: $("#job-priority").val(),
      assignee: $("#job-assignee").val(),
      department: $("#job-department").val(),
      estimated_hours: $("#job-estimated-hours").val(),
      due_date: $("#job-due-date").val(),
      tags: $("#job-tags").val(),
    }

    $.ajax({
      url: jct_ajax.ajax_url,
      type: "POST",
      data: formData,
      success: (response) => {
        if (response.success) {
          $("#jct-create-modal").hide()
          $("#jct-create-form")[0].reset()
          loadJobs()
          showNotification("Job created successfully!", "success")
        } else {
          showNotification("Error creating job: " + response.data, "error")
        }
      },
      error: () => {
        showNotification("Error creating job", "error")
      },
    })
  }

  function updateJobStatus(jobId, status) {
    $.ajax({
      url: jct_ajax.ajax_url,
      type: "POST",
      data: {
        action: "jct_update_job_status",
        nonce: jct_ajax.nonce,
        job_id: jobId,
        status: status,
      },
      success: (response) => {
        if (response.success) {
          showNotification("Status updated successfully!", "success")
          updateStats()
        } else {
          showNotification("Error updating status: " + response.data, "error")
        }
      },
      error: () => {
        showNotification("Error updating status", "error")
      },
    })
  }

  function updateStats() {
    // This would typically make an AJAX call to get updated stats
    // For now, we'll count from the current DOM
    const totalJobs = $(".jct-job-card").length
    const pendingJobs = $('.jct-job-status option[value="pending"]:selected').length
    const inProgressJobs = $('.jct-job-status option[value="in-progress"]:selected').length
    const completedJobs = $('.jct-job-status option[value="completed"]:selected').length

    $("#total-jobs").text(totalJobs)
    $("#pending-jobs").text(pendingJobs)
    $("#in-progress-jobs").text(inProgressJobs)
    $("#completed-jobs").text(completedJobs)
  }

  function formatDate(dateString) {
    if (!dateString) return "Not set"
    const date = new Date(dateString)
    return date.toLocaleDateString()
  }

  function showNotification(message, type) {
    // Create a simple notification system
    const notification = $(`
            <div class="jct-notification jct-notification-${type}">
                ${message}
            </div>
        `)

    $("body").append(notification)

    setTimeout(() => {
      notification.fadeOut(function () {
        $(this).remove()
      })
    }, 3000)
  }

  function debounce(func, wait) {
    let timeout
    return function executedFunction(...args) {
      const later = () => {
        clearTimeout(timeout)
        func(...args)
      }
      clearTimeout(timeout)
      timeout = setTimeout(later, wait)
    }
  }
})(window.jQuery) // Use window.jQuery to ensure jQuery is declared
