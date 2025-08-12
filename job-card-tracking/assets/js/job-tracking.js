;(($) => {
  let currentTheme = localStorage.getItem("jct-theme") || "light"
  let currentPage = 0
  const itemsPerPage = 20
  let totalItems = 0
  let isLoading = false
  let refreshInterval
  const jct_ajax = window.jct_ajax // Declare jct_ajax variable
  const jQuery = window.jQuery // Declare jQuery variable

  // Initialize the plugin
  $(document).ready(() => {
    initializeTheme()
    loadJobs()
    bindEvents()
    updateStats()
    startAutoRefresh()

    // Initialize view toggle
    initializeViewToggle()
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

    // Show notification
    showNotification("Theme switched to " + currentTheme + " mode", "info")
  }

  function updateThemeToggleText() {
    const toggleBtn = $("#jct-theme-toggle")
    const icon = currentTheme === "light" ? "admin-appearance" : "lightbulb"
    toggleBtn
      .find(".dashicons")
      .removeClass()
      .addClass("dashicons dashicons-" + icon)
  }

  function initializeViewToggle() {
    const container = $("#jct-frontend-jobs, #jct-jobs-container")
    const currentView = container.attr("data-view") || "grid"

    $(`.jct-view-btn[data-view="${currentView}"]`).addClass("active")
    container.attr("data-view", currentView)
  }

  function startAutoRefresh() {
    const refreshRate = Number.parseInt(jct_ajax.auto_refresh || 30) * 1000

    refreshInterval = setInterval(() => {
      if (!isLoading && !$(".jct-modal:visible").length) {
        loadJobs(true) // Silent refresh
        updateStats()
      }
    }, refreshRate)
  }

  function bindEvents() {
    // Theme toggle
    $(document).on("click", "#jct-theme-toggle", toggleTheme)

    // Create job modal
    $(document).on("click", "#jct-create-job", () => {
      $("#jct-create-modal").show()
      $("#job-title").focus()
    })

    // Close modal
    $(document).on("click", ".jct-close, .jct-cancel", () => {
      $(".jct-modal").hide()
      clearForm()
    })

    // Create job form submission
    $(document).on("submit", "#jct-create-form", (e) => {
      e.preventDefault()
      createJob()
    })

    // Edit job
    $(document).on("click", ".jct-edit-job", function () {
      const jobId = $(this).data("job-id")
      editJob(jobId)
    })

    // Delete job
    $(document).on("click", ".jct-delete-job", function () {
      const jobId = $(this).data("job-id")
      const jobTitle = $(this).data("job-title")

      if (confirm(`Are you sure you want to delete "${jobTitle}"? This action cannot be undone.`)) {
        deleteJob(jobId)
      }
    })

    // Status change
    $(document).on("change", ".jct-job-status", function () {
      const jobId = $(this).data("job-id")
      const newStatus = $(this).val()
      updateJobStatus(jobId, newStatus)
    })

    // Search and filters
    $(document).on(
      "input",
      "#jct-search, #frontend-search",
      debounce(() => {
        currentPage = 0
        loadJobs()
      }, 300),
    )

    $(document).on(
      "change",
      "#jct-status-filter, #jct-priority-filter, #jct-department-filter, #frontend-status-filter, #frontend-priority-filter, #frontend-department-filter",
      () => {
        currentPage = 0
        loadJobs()
      },
    )

    // View toggle
    $(document).on("click", ".jct-view-btn", function () {
      const view = $(this).data("view")
      $(".jct-view-btn").removeClass("active")
      $(this).addClass("active")

      const container = $("#jct-frontend-jobs, #jct-jobs-container")
      container.attr("data-view", view)

      // Save preference
      localStorage.setItem("jct-preferred-view", view)
    })

    // Pagination
    $(document).on("click", "#jct-prev-page", () => {
      if (currentPage > 0) {
        currentPage--
        loadJobs()
      }
    })

    $(document).on("click", "#jct-next-page", () => {
      if ((currentPage + 1) * itemsPerPage < totalItems) {
        currentPage++
        loadJobs()
      }
    })

    // Refresh button
    $(document).on("click", "#jct-refresh-jobs", () => {
      loadJobs()
      updateStats()
      showNotification("Jobs refreshed successfully", "success")
    })

    // Close modal when clicking outside
    $(document).on("click", ".jct-modal", function (e) {
      if (e.target === this) {
        $(this).hide()
        clearForm()
      }
    })

    // Keyboard shortcuts
    $(document).on("keydown", (e) => {
      // ESC to close modals
      if (e.key === "Escape") {
        $(".jct-modal").hide()
        clearForm()
      }

      // Ctrl/Cmd + N to create new job
      if ((e.ctrlKey || e.metaKey) && e.key === "n" && jct_ajax.can_edit) {
        e.preventDefault()
        $("#jct-create-job").click()
      }

      // Ctrl/Cmd + R to refresh
      if ((e.ctrlKey || e.metaKey) && e.key === "r") {
        e.preventDefault()
        loadJobs()
      }
    })
  }

  function loadJobs(silent = false) {
    if (isLoading) return

    isLoading = true

    if (!silent) {
      $("#jct-loading").show()
      $("#jct-jobs-container, #jct-frontend-jobs").hide()
    }

    const search = $("#jct-search, #frontend-search").val() || ""
    const status = $("#jct-status-filter, #frontend-status-filter").val() || "all"
    const priority = $("#jct-priority-filter, #frontend-priority-filter").val() || "all"
    const department = $("#jct-department-filter, #frontend-department-filter").val() || ""

    $.ajax({
      url: jct_ajax.ajax_url,
      type: "GET",
      data: {
        action: "jct_get_jobs",
        nonce: jct_ajax.nonce,
        search: search,
        status: status,
        priority: priority,
        department: department,
        limit: itemsPerPage,
        offset: currentPage * itemsPerPage,
      },
      success: (response) => {
        isLoading = false
        $("#jct-loading").hide()

        if (response.success) {
          totalItems = response.data.total
          renderJobs(response.data.jobs)
          updatePagination()
          updateDepartmentFilter(response.data.jobs)

          if (!silent) {
            $("#jct-jobs-container, #jct-frontend-jobs").show()
          }
        } else {
          showNotification("Error loading jobs: " + response.data, "error")
        }
      },
      error: (xhr, status, error) => {
        isLoading = false
        $("#jct-loading").hide()
        showNotification("Network error loading jobs", "error")
        console.error("AJAX Error:", error)
      },
    })
  }

  function renderJobs(jobs) {
    const container = $("#jct-jobs-container, #jct-frontend-jobs")
    const isAdmin = container.attr("id") === "jct-jobs-container"

    container.empty()

    if (jobs.length === 0) {
      const noJobsHtml = `
                <div class="jct-no-jobs">
                    <div class="jct-no-jobs-icon">
                        <span class="dashicons dashicons-clipboard"></span>
                    </div>
                    <h3>No Jobs Found</h3>
                    <p>No jobs match your current search criteria.</p>
                </div>
            `
      container.html(noJobsHtml)
      return
    }

    jobs.forEach((job) => {
      const jobCard = createJobCard(job, isAdmin)
      container.append(jobCard)
    })

    // Initialize tooltips or other enhancements
    initializeJobCardEnhancements()
  }

  function createJobCard(job, isAdmin = false) {
    const isOverdue = new Date() > new Date(job.due_date) && job.status !== "completed"
    const tags = job.tags ? job.tags.split(",") : []
    const canEdit = jct_ajax.can_edit

    const tagsHtml = tags.map((tag) => `<span class="jct-tag">${escapeHtml(tag.trim())}</span>`).join("")

    const overdueHtml = isOverdue
      ? '<div class="jct-overdue-indicator"><span class="dashicons dashicons-warning"></span> Overdue</div>'
      : ""

    const actionsHtml =
      isAdmin && canEdit
        ? `
            <div class="jct-job-actions">
                <button class="jct-btn jct-btn-secondary jct-edit-job" data-job-id="${job.job_id}" title="Edit Job">
                    <span class="dashicons dashicons-edit"></span>
                    Edit
                </button>
                <button class="jct-btn jct-btn-danger jct-delete-job" data-job-id="${job.job_id}" data-job-title="${escapeHtml(job.title)}" title="Delete Job">
                    <span class="dashicons dashicons-trash"></span>
                    Delete
                </button>
            </div>
        `
        : ""

    const statusSelectHtml = canEdit
      ? `
            <select class="jct-job-status" data-job-id="${job.job_id}">
                <option value="pending" ${job.status === "pending" ? "selected" : ""}>Pending</option>
                <option value="in-progress" ${job.status === "in-progress" ? "selected" : ""}>In Progress</option>
                <option value="completed" ${job.status === "completed" ? "selected" : ""}>Completed</option>
                <option value="on-hold" ${job.status === "on-hold" ? "selected" : ""}>On Hold</option>
                <option value="cancelled" ${job.status === "cancelled" ? "selected" : ""}>Cancelled</option>
            </select>
        `
      : `<div class="jct-status-badge ${job.status}">${job.status.replace("-", " ")}</div>`

    return `
            <div class="jct-job-card ${isOverdue ? "overdue" : ""}" data-job-id="${job.job_id}">
                <div class="jct-job-header">
                    <div>
                        <h3 class="jct-job-title">${escapeHtml(job.title)}</h3>
                        <div class="jct-job-id">${job.job_id}</div>
                    </div>
                    <span class="jct-priority-badge ${job.priority}">${job.priority}</span>
                </div>
                
                <div class="jct-job-description">${escapeHtml(job.description || "")}</div>
                
                <div class="jct-job-meta">
                    <div>
                        <div class="jct-job-assignee">${escapeHtml(job.assignee)}</div>
                        <div class="jct-job-department">${escapeHtml(job.department || "")}</div>
                    </div>
                    ${statusSelectHtml}
                </div>
                
                <div class="jct-job-footer">
                    <div class="jct-job-date">
                        <span class="dashicons dashicons-calendar-alt"></span>
                        Due: ${formatDate(job.due_date)}
                    </div>
                    <div class="jct-job-hours">
                        <span class="dashicons dashicons-clock"></span>
                        ${job.actual_hours ? Number.parseFloat(job.actual_hours) + "h" : "Est: " + Number.parseFloat(job.estimated_hours) + "h"}
                    </div>
                </div>
                
                ${tagsHtml ? `<div class="jct-job-tags">${tagsHtml}</div>` : ""}
                ${overdueHtml}
                ${actionsHtml}
            </div>
        `
  }

  function initializeJobCardEnhancements() {
    // Add hover effects, tooltips, etc.
    $(".jct-job-card").each(function () {
      const $card = $(this)
      const jobId = $card.data("job-id")

      // Add click handler for card selection (optional)
      $card.on("click", (e) => {
        if (!$(e.target).is("select, button, .jct-btn")) {
          $card.toggleClass("selected")
        }
      })
    })
  }

  function createJob() {
    const formData = {
      action: "jct_create_job",
      nonce: jct_ajax.nonce,
      title: $("#job-title").val().trim(),
      description: $("#job-description").val().trim(),
      priority: $("#job-priority").val(),
      assignee: $("#job-assignee").val().trim(),
      department: $("#job-department").val().trim(),
      estimated_hours: $("#job-estimated-hours").val() || 0,
      due_date: $("#job-due-date").val(),
      tags: $("#job-tags").val().trim(),
    }

    // Validate required fields
    if (!formData.title || !formData.assignee) {
      showNotification("Title and Assignee are required fields", "error")
      return
    }

    // Show loading state
    const submitBtn = $('#jct-create-form button[type="submit"]')
    const originalText = submitBtn.html()
    submitBtn.prop("disabled", true).html('<span class="dashicons dashicons-update-alt"></span> Creating...')

    $.ajax({
      url: jct_ajax.ajax_url,
      type: "POST",
      data: formData,
      success: (response) => {
        submitBtn.prop("disabled", false).html(originalText)

        if (response.success) {
          $("#jct-create-modal").hide()
          clearForm()
          loadJobs()
          updateStats()
          showNotification('Job "' + formData.title + '" created successfully!', "success")
        } else {
          showNotification("Error creating job: " + response.data, "error")
        }
      },
      error: (xhr, status, error) => {
        submitBtn.prop("disabled", false).html(originalText)
        showNotification("Network error creating job", "error")
        console.error("AJAX Error:", error)
      },
    })
  }

  function editJob(jobId) {
    // This would open an edit modal with pre-filled data
    // For now, we'll show a simple alert
    showNotification("Edit functionality coming soon!", "info")
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
          updateStats()
          showNotification("Job deleted successfully", "success")
        } else {
          showNotification("Error deleting job: " + response.data, "error")
        }
      },
      error: (xhr, status, error) => {
        showNotification("Network error deleting job", "error")
        console.error("AJAX Error:", error)
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
          updateStats()
          showNotification("Status updated successfully", "success")

          // Update the card's appearance
          const $card = $(`.jct-job-card[data-job-id="${jobId}"]`)
          $card.removeClass("overdue") // Remove overdue class if status changed

          if (status === "completed") {
            $card.addClass("completed")
          }
        } else {
          showNotification("Error updating status: " + response.data, "error")
          // Revert the select value
          $(`.jct-job-status[data-job-id="${jobId}"]`).val(status)
        }
      },
      error: (xhr, status, error) => {
        showNotification("Network error updating status", "error")
        console.error("AJAX Error:", error)
      },
    })
  }

  function updateStats() {
    $.ajax({
      url: jct_ajax.ajax_url,
      type: "GET",
      data: {
        action: "jct_get_stats",
        nonce: jct_ajax.nonce,
      },
      success: (response) => {
        if (response.success) {
          const stats = response.data

          // Update stat numbers
          $("#total-jobs, #frontend-total-jobs").text(stats.total)
          $("#pending-jobs, #frontend-pending-jobs").text(stats.pending)
          $("#in-progress-jobs, #frontend-in-progress-jobs").text(stats.in_progress)
          $("#completed-jobs, #frontend-completed-jobs").text(stats.completed)
          $("#overdue-jobs").text(stats.overdue)

          // Update department filter
          updateDepartmentFilterOptions(stats.departments)
        }
      },
      error: (xhr, status, error) => {
        console.error("Error updating stats:", error)
      },
    })
  }

  function updateDepartmentFilter(jobs) {
    const departments = [...new Set(jobs.map((job) => job.department).filter((dept) => dept))]
    const $filter = $("#jct-department-filter, #frontend-department-filter")
    const currentValue = $filter.val()

    // Clear existing options except "All Departments"
    $filter.find("option:not(:first)").remove()

    // Add department options
    departments.forEach((dept) => {
      $filter.append(`<option value="${escapeHtml(dept)}">${escapeHtml(dept)}</option>`)
    })

    // Restore selected value if it still exists
    if (currentValue && departments.includes(currentValue)) {
      $filter.val(currentValue)
    }
  }

  function updateDepartmentFilterOptions(departments) {
    const $filter = $("#jct-department-filter, #frontend-department-filter")
    const currentValue = $filter.val()

    // Clear existing options except "All Departments"
    $filter.find("option:not(:first)").remove()

    // Add department options from stats
    departments.forEach((dept) => {
      $filter.append(
        `<option value="${escapeHtml(dept.department)}">${escapeHtml(dept.department)} (${dept.count})</option>`,
      )
    })

    // Restore selected value if it still exists
    if (currentValue) {
      $filter.val(currentValue)
    }
  }

  function updatePagination() {
    const $pagination = $("#jct-pagination")
    const totalPages = Math.ceil(totalItems / itemsPerPage)

    if (totalPages <= 1) {
      $pagination.hide()
      return
    }

    $pagination.show()

    // Update pagination info
    const startItem = currentPage * itemsPerPage + 1
    const endItem = Math.min((currentPage + 1) * itemsPerPage, totalItems)
    $("#jct-page-info").text(`${startItem}-${endItem} of ${totalItems} jobs`)

    // Update button states
    $("#jct-prev-page").prop("disabled", currentPage === 0)
    $("#jct-next-page").prop("disabled", currentPage >= totalPages - 1)
  }

  function clearForm() {
    $("#jct-create-form")[0].reset()
    $("#jct-edit-form")[0].reset()
  }

  function formatDate(dateString) {
    if (!dateString) return "Not set"
    const date = new Date(dateString)
    const now = new Date()
    const diffTime = date - now
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))

    if (diffDays === 0) {
      return "Today"
    } else if (diffDays === 1) {
      return "Tomorrow"
    } else if (diffDays === -1) {
      return "Yesterday"
    } else if (diffDays > 0 && diffDays <= 7) {
      return `In ${diffDays} days`
    } else if (diffDays < 0 && diffDays >= -7) {
      return `${Math.abs(diffDays)} days ago`
    } else {
      return date.toLocaleDateString()
    }
  }

  function showNotification(message, type = "info") {
    // Remove existing notifications
    $(".jct-notification").remove()

    const notification = $(`
            <div class="jct-notification jct-notification-${type}">
                ${escapeHtml(message)}
            </div>
        `)

    $("body").append(notification)

    // Auto-remove after 4 seconds
    setTimeout(() => {
      notification.fadeOut(function () {
        $(this).remove()
      })
    }, 4000)
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

  // Cleanup on page unload
  $(window).on("beforeunload", () => {
    if (refreshInterval) {
      clearInterval(refreshInterval)
    }
  })
})(window.jQuery)
