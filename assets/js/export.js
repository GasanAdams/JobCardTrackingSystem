;(($) => {
  // Export functionality
  $(document).ready(() => {
    initializeExportFeatures()
    loadExportStats()
  })

  function initializeExportFeatures() {
    bindExportEvents()
    setupExportValidation()
  }

  function bindExportEvents() {
    // Quick export from main page
    $(document).on("click", "#jct-export-jobs", () => {
      $("#jct-quick-export-modal").show()
    })

    // Quick export buttons
    $(document).on("click", ".jct-quick-export", function () {
      const format = $(this).data("format")
      performQuickExport(format)
    })

    // Full export form
    $(document).on("submit", "#jct-export-form", (e) => {
      e.preventDefault()
      performFullExport()
    })

    // Preview export
    $(document).on("click", "#jct-preview-export", () => {
      previewExport()
    })

    // Confirm export from preview
    $(document).on("click", "#jct-confirm-export", () => {
      $("#jct-export-preview-modal").hide()
      performFullExport()
    })

    // Close modals
    $(document).on("click", ".jct-close, .jct-cancel", function () {
      $(this).closest(".jct-modal").hide()
    })

    // Format change handler
    $(document).on("change", "#export-format", function () {
      updateFormatDescription($(this).val())
    })
  }

  function setupExportValidation() {
    // Add validation for date ranges
    $(document).on("change", "#export-date-from, #export-date-to", () => {
      validateDateRange()
    })
  }

  function performQuickExport(format) {
    const currentFilters = getCurrentFilters()
    const exportParams = {
      ...currentFilters,
      format: format,
      action: "jct_export_jobs",
      nonce: window.jct_ajax.nonce,
    }

    showExportProgress()
    triggerDownload(exportParams)
  }

  function performFullExport() {
    const formData = $("#jct-export-form").serialize()
    const exportParams = {
      action: "jct_export_jobs",
      nonce: window.jct_ajax.nonce,
    }

    // Parse form data
    const formArray = $("#jct-export-form").serializeArray()
    formArray.forEach((item) => {
      exportParams[item.name] = item.value
    })

    showExportProgress()
    triggerDownload(exportParams)

    // Update last export date
    updateLastExportDate()
  }

  function previewExport() {
    const formData = $("#jct-export-form").serialize()

    $.ajax({
      url: window.jct_ajax.ajax_url,
      type: "GET",
      data: formData + "&action=jct_get_jobs&nonce=" + window.jct_ajax.nonce,
      success: (response) => {
        if (response.success) {
          showExportPreview(response.data)
        } else {
          showNotification("Error loading preview: " + response.data, "error")
        }
      },
      error: () => {
        showNotification("Network error loading preview", "error")
      },
    })
  }

  function showExportPreview(data) {
    const jobs = data.jobs
    const total = data.total

    let previewHtml = `
            <div class="jct-preview-summary">
                <h3>Export Preview</h3>
                <p><strong>Total jobs to export:</strong> ${total}</p>
            </div>
            <div class="jct-preview-table">
                <table class="wp-list-table widefat fixed striped">
                    <thead>
                        <tr>
                            <th>Job ID</th>
                            <th>Title</th>
                            <th>Status</th>
                            <th>Priority</th>
                            <th>Assignee</th>
                            <th>Department</th>
                        </tr>
                    </thead>
                    <tbody>
        `

    jobs.slice(0, 10).forEach((job) => {
      previewHtml += `
                <tr>
                    <td>${job.job_id}</td>
                    <td>${job.title}</td>
                    <td><span class="jct-status jct-status-${job.status}">${formatStatus(job.status)}</span></td>
                    <td><span class="jct-priority jct-priority-${job.priority}">${formatPriority(job.priority)}</span></td>
                    <td>${job.assignee}</td>
                    <td>${job.department || "N/A"}</td>
                </tr>
            `
    })

    previewHtml += `
                    </tbody>
                </table>
            </div>
        `

    if (total > 10) {
      previewHtml += `<p class="description">Showing first 10 of ${total} jobs. All ${total} jobs will be included in the export.</p>`
    }

    $("#jct-export-preview-content").html(previewHtml)
    $("#jct-export-preview-modal").show()
  }

  function showExportProgress() {
    $("#jct-export-progress-modal").show()
    animateProgress()
  }

  function animateProgress() {
    let progress = 0
    const progressBar = $("#export-progress-fill")
    const progressText = $("#export-progress-text")

    const interval = setInterval(() => {
      progress += Math.random() * 15
      if (progress > 90) progress = 90

      progressBar.css("width", progress + "%")

      if (progress < 30) {
        progressText.text("Preparing export...")
      } else if (progress < 60) {
        progressText.text("Processing data...")
      } else if (progress < 90) {
        progressText.text("Generating file...")
      } else {
        progressText.text("Almost ready...")
      }

      if (progress >= 90) {
        clearInterval(interval)
        setTimeout(() => {
          progressBar.css("width", "100%")
          progressText.text("Download starting...")
          setTimeout(() => {
            $("#jct-export-progress-modal").hide()
            progressBar.css("width", "0%")
          }, 1000)
        }, 500)
      }
    }, 200)
  }

  function triggerDownload(params) {
    // Create download URL
    const url = new URL(window.jct_ajax.ajax_url)
    Object.keys(params).forEach((key) => {
      url.searchParams.append(key, params[key])
    })

    // Create temporary link and trigger download
    const link = document.createElement("a")
    link.href = url.toString()
    link.style.display = "none"
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)

    // Close any open modals
    $(".jct-modal").hide()

    showNotification("Export started. Download should begin shortly.", "success")
  }

  function getCurrentFilters() {
    return {
      search: $("#jct-search").val() || "",
      status: $("#jct-status-filter").val() || "all",
      priority: $("#jct-priority-filter").val() || "all",
      department: $("#jct-department-filter").val() || "",
    }
  }

  function loadExportStats() {
    if ($("#total-jobs-count").length === 0) return

    $.ajax({
      url: window.jct_ajax.ajax_url,
      type: "GET",
      data: {
        action: "jct_get_export_status",
        nonce: window.jct_ajax.nonce,
      },
      success: (response) => {
        if (response.success) {
          updateExportStats(response.data)
        }
      },
      error: () => {
        console.error("Error loading export stats")
      },
    })
  }

  function updateExportStats(stats) {
    $("#total-jobs-count").text(stats.total_jobs)
    $("#last-export-date").text(stats.last_export || "Never")
  }

  function updateLastExportDate() {
    const now = new Date().toLocaleString()
    $("#last-export-date").text(now)

    // Update server-side option
    $.ajax({
      url: window.jct_ajax.ajax_url,
      type: "POST",
      data: {
        action: "jct_update_export_date",
        nonce: window.jct_ajax.nonce,
        date: now,
      },
    })
  }

  function validateDateRange() {
    const fromDate = $("#export-date-from").val()
    const toDate = $("#export-date-to").val()

    if (fromDate && toDate && new Date(fromDate) > new Date(toDate)) {
      showNotification("End date must be after start date", "error")
      $("#export-date-to").val("")
    }
  }

  function updateFormatDescription(format) {
    const descriptions = {
      csv: "Best for spreadsheet applications like Excel, Google Sheets",
      excel: "Native Excel format with formatting",
      json: "Structured data format for developers and APIs",
      pdf: "Print-ready format for reports and documentation",
    }

    // Update description if element exists
    const descElement = $(".format-description")
    if (descElement.length) {
      descElement.text(descriptions[format] || "")
    }
  }

  function formatStatus(status) {
    return status
      .split("-")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ")
  }

  function formatPriority(priority) {
    return priority.charAt(0).toUpperCase() + priority.slice(1)
  }

  function showNotification(message, type = "info") {
    // Create notification element
    const notification = $(`
            <div class="notice notice-${type} is-dismissible jct-export-notice">
                <p>${message}</p>
            </div>
        `)

    // Add to page
    $(".wrap h1").after(notification)

    // Auto-dismiss after 5 seconds
    setTimeout(() => {
      notification.fadeOut(function () {
        $(this).remove()
      })
    }, 5000)
  }

  // Export keyboard shortcuts
  $(document).on("keydown", (e) => {
    // Ctrl/Cmd + E for quick export
    if ((e.ctrlKey || e.metaKey) && e.key === "e") {
      e.preventDefault()
      $("#jct-export-jobs").click()
    }
  })
})(window.jQuery)
