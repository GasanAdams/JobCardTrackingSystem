jQuery(document).ready(($) => {
  // Admin-specific JavaScript for Job Card Tracking System

  let isLoading = false
  const jct_ajax = window.jct_ajax

  // Initialize admin functionality
  init()

  function init() {
    setupEventListeners()
    loadAdminStats()
    loadAdminJobs()
  }

  function setupEventListeners() {
    // Bulk actions
    $(document).on("change", "#bulk-action-selector-top, #bulk-action-selector-bottom", function () {
      const action = $(this).val()
      const $button = $(this).siblings(".button")

      if (action === "-1") {
        $button.prop("disabled", true)
      } else {
        $button.prop("disabled", false)
      }
    })

    // Apply bulk actions
    $(document).on("click", "#doaction, #doaction2", function (e) {
      e.preventDefault()

      const $selector = $(this).siblings("select")
      const action = $selector.val()

      if (action === "-1") {
        return
      }

      const selectedJobs = []
      $(".jct-job-checkbox:checked").each(function () {
        selectedJobs.push($(this).val())
      })

      if (selectedJobs.length === 0) {
        alert("Please select at least one job.")
        return
      }

      if (confirm("Are you sure you want to perform this action on " + selectedJobs.length + " job(s)?")) {
        performBulkAction(action, selectedJobs)
      }
    })

    // Select all checkbox
    $(document).on("change", "#cb-select-all-1, #cb-select-all-2", function () {
      const isChecked = $(this).prop("checked")
      $(".jct-job-checkbox").prop("checked", isChecked)
    })

    // Individual checkbox change
    $(document).on("change", ".jct-job-checkbox", () => {
      updateSelectAllCheckbox()
    })

    // Quick edit
    $(document).on("click", ".jct-quick-edit", function (e) {
      e.preventDefault()
      const jobId = $(this).data("job-id")
      showQuickEdit(jobId)
    })

    // Save quick edit
    $(document).on("click", ".jct-save-quick-edit", (e) => {
      e.preventDefault()
      saveQuickEdit()
    })

    // Cancel quick edit
    $(document).on("click", ".jct-cancel-quick-edit", (e) => {
      e.preventDefault()
      hideQuickEdit()
    })

    // Export functionality
    $(document).on("click", ".jct-export-btn", function (e) {
      e.preventDefault()
      const format = $(this).data("format")
      exportJobs(format)
    })

    // Refresh data
    $(document).on("click", ".jct-refresh-btn", (e) => {
      e.preventDefault()
      loadAdminStats()
      loadAdminJobs()
      showAdminNotice("Data refreshed successfully!", "success")
    })

    // Search functionality
    let searchTimeout
    $(document).on("input", ".jct-admin-search", function () {
      clearTimeout(searchTimeout)
      const searchTerm = $(this).val()

      searchTimeout = setTimeout(() => {
        loadAdminJobs({ search: searchTerm })
      }, 500)
    })

    // Filter functionality
    $(document).on("change", ".jct-admin-filter", () => {
      const filters = {}
      $(".jct-admin-filter").each(function () {
        const key = $(this).data("filter")
        const value = $(this).val()
        if (value && value !== "all") {
          filters[key] = value
        }
      })

      loadAdminJobs(filters)
    })

    // Delete job functionality
    $(document).on("click", ".jct-delete-job", function (e) {
      e.preventDefault()
      const jobId = $(this).data("job-id")
      const jobTitle = $(this).data("job-title")

      if (confirm(`Are you sure you want to delete "${jobTitle}"? This action cannot be undone.`)) {
        deleteJob(jobId)
      }
    })
  }

  function loadAdminStats() {
    $.ajax({
      url: jct_ajax.ajax_url,
      type: "GET",
      data: {
        action: "jct_get_stats",
        nonce: jct_ajax.nonce,
      },
      success: (response) => {
        if (response.success) {
          updateAdminStatsDisplay(response.data)
        }
      },
      error: (xhr, status, error) => {
        console.error("Failed to load admin stats:", error)
      },
    })
  }

  function updateAdminStatsDisplay(stats) {
    $(".jct-admin-stat-total .jct-admin-stat-number").text(stats.total || 0)
    $(".jct-admin-stat-pending .jct-admin-stat-number").text(stats.pending || 0)
    $(".jct-admin-stat-in-progress .jct-admin-stat-number").text(stats.in_progress || 0)
    $(".jct-admin-stat-completed .jct-admin-stat-number").text(stats.completed || 0)
    $(".jct-admin-stat-overdue .jct-admin-stat-number").text(stats.overdue || 0)
  }

  function loadAdminJobs(filters = {}) {
    if (isLoading) return

    isLoading = true
    $(".jct-admin-loading").show()

    const data = {
      action: "jct_get_jobs",
      nonce: jct_ajax.nonce,
      limit: 100,
      offset: 0,
      ...filters,
    }

    $.ajax({
      url: jct_ajax.ajax_url,
      type: "GET",
      data: data,
      success: (response) => {
        if (response.success) {
          renderAdminJobsTable(response.data.jobs)
          updateJobCount(response.data.total)
        } else {
          showAdminNotice("Failed to load jobs: " + response.data, "error")
        }
      },
      error: (xhr, status, error) => {
        console.error("Failed to load admin jobs:", error)
        showAdminNotice("Network error while loading jobs", "error")
      },
      complete: () => {
        isLoading = false
        $(".jct-admin-loading").hide()
      },
    })
  }

  function renderAdminJobsTable(jobs) {
    const $tbody = $(".jct-admin-jobs-table tbody")
    $tbody.empty()

    if (jobs.length === 0) {
      $tbody.append('<tr><td colspan="8" style="text-align: center; padding: 40px;">No jobs found.</td></tr>')
      return
    }

    jobs.forEach((job) => {
      const row = createAdminJobRow(job)
      $tbody.append(row)
    })
  }

  function createAdminJobRow(job) {
    const dueDate = job.due_date ? new Date(job.due_date).toLocaleDateString() : "Not set"
    const isOverdue = job.due_date && new Date(job.due_date) < new Date() && job.status !== "completed"

    return `
      <tr class="${isOverdue ? "jct-overdue-row" : ""}">
        <td class="check-column">
          <input type="checkbox" class="jct-job-checkbox" value="${escapeHtml(job.job_id)}">
        </td>
        <td>
          <strong>${escapeHtml(job.job_id)}</strong>
          <div class="row-actions">
            <span class="edit">
              <a href="#" class="jct-quick-edit" data-job-id="${escapeHtml(job.job_id)}">Quick Edit</a> |
            </span>
            <span class="trash">
              <a href="#" class="jct-delete-job" data-job-id="${escapeHtml(job.job_id)}" data-job-title="${escapeHtml(job.title)}">Delete</a>
            </span>
          </div>
        </td>
        <td>
          <strong>${escapeHtml(job.title)}</strong>
          <div style="color: #666; font-size: 12px; margin-top: 4px;">
            ${escapeHtml(job.description ? job.description.substring(0, 100) + "..." : "No description")}
          </div>
        </td>
        <td>${escapeHtml(job.assignee)}</td>
        <td>${escapeHtml(job.department || "Not set")}</td>
        <td>
          <span class="jct-status-badge jct-status-${job.status.replace("-", "-")}">
            ${job.status.replace("-", " ").replace(/\b\w/g, (l) => l.toUpperCase())}
          </span>
        </td>
        <td>
          <span class="jct-priority-badge jct-priority-${job.priority}">
            ${job.priority.charAt(0).toUpperCase() + job.priority.slice(1)}
          </span>
        </td>
        <td class="${isOverdue ? "jct-overdue-text" : ""}">${dueDate}</td>
      </tr>
    `
  }

  function performBulkAction(action, jobIds) {
    if (isLoading) return

    isLoading = true

    const data = {
      action: "jct_bulk_action",
      nonce: jct_ajax.nonce,
      bulk_action: action,
      job_ids: jobIds,
    }

    $.ajax({
      url: jct_ajax.ajax_url,
      type: "POST",
      data: data,
      success: (response) => {
        if (response.success) {
          showAdminNotice(`Bulk action "${action}" completed successfully!`, "success")
          loadAdminJobs()
          loadAdminStats()
        } else {
          showAdminNotice("Bulk action failed: " + response.data, "error")
        }
      },
      error: (xhr, status, error) => {
        console.error("Bulk action failed:", error)
        showAdminNotice("Network error during bulk action", "error")
      },
      complete: () => {
        isLoading = false
      },
    })
  }

  function showQuickEdit(jobId) {
    // Implementation for quick edit functionality
    console.log("Quick edit for job:", jobId)
    // This would show an inline edit form
  }

  function saveQuickEdit() {
    // Implementation for saving quick edit
    console.log("Saving quick edit")
  }

  function hideQuickEdit() {
    // Implementation for hiding quick edit
    console.log("Hiding quick edit")
  }

  function exportJobs(format) {
    const url =
      jct_ajax.ajax_url +
      "?" +
      $.param({
        action: "jct_export_jobs",
        nonce: jct_ajax.nonce,
        format: format,
      })

    window.open(url, "_blank")
  }

  function updateSelectAllCheckbox() {
    const totalCheckboxes = $(".jct-job-checkbox").length
    const checkedCheckboxes = $(".jct-job-checkbox:checked").length

    const $selectAll = $("#cb-select-all-1, #cb-select-all-2")

    if (checkedCheckboxes === 0) {
      $selectAll.prop("checked", false).prop("indeterminate", false)
    } else if (checkedCheckboxes === totalCheckboxes) {
      $selectAll.prop("checked", true).prop("indeterminate", false)
    } else {
      $selectAll.prop("checked", false).prop("indeterminate", true)
    }
  }

  function updateJobCount(total) {
    $(".jct-job-count").text(total + " job" + (total !== 1 ? "s" : ""))
  }

  function showAdminNotice(message, type = "info") {
    $(".jct-admin-notice").remove()

    const noticeClass =
      type === "error"
        ? "notice-error"
        : type === "success"
          ? "notice-success"
          : type === "warning"
            ? "notice-warning"
            : "notice-info"

    const $notice = $(`
      <div class="jct-admin-notice notice ${noticeClass} is-dismissible">
        <p>${escapeHtml(message)}</p>
        <button type="button" class="notice-dismiss">
          <span class="screen-reader-text">Dismiss this notice.</span>
        </button>
      </div>
    `)

    $(".wrap h1").after($notice)

    // Auto-dismiss after 5 seconds
    setTimeout(() => {
      $notice.fadeOut(function () {
        $(this).remove()
      })
    }, 5000)

    // Manual dismiss
    $notice.find(".notice-dismiss").on("click", () => {
      $notice.fadeOut(function () {
        $(this).remove()
      })
    })
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
          showAdminNotice("Job deleted successfully!", "success")
          loadAdminJobs()
          loadAdminStats()
        } else {
          showAdminNotice("Failed to delete job: " + response.data, "error")
        }
      },
      error: (xhr, status, error) => {
        console.error("Failed to delete job:", error)
        showAdminNotice("Network error while deleting job", "error")
      },
    })
  }
})
