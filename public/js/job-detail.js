// public/js/job-detail.js - Handles fetching and displaying job details and application form

class JobDetailPage {
  constructor() {
    this.jobId = this.getJobIdFromUrl()
    this.job = null

    this.initializeElements()
    this.bindEvents()

    if (this.jobId) {
      this.fetchJobDetails()
    } else {
      this.showJobNotFound()
    }
  }

  getJobIdFromUrl() {
    const urlParams = new URLSearchParams(window.location.search)
    const id = urlParams.get("id")
    return id ? Number.parseInt(id, 10) : null
  }

  initializeElements() {
    this.loadingIndicator = document.getElementById("loading-indicator")
    this.jobNotFoundElement = document.getElementById("job-not-found")
    this.jobDetailContent = document.getElementById("job-detail-content")

    // Job details elements
    this.jobTitleElement = document.getElementById("job-title")
    this.jobStatusBadge = document.getElementById("job-status-badge")
    this.jobLocationElement = document.getElementById("job-location")
    this.jobSalaryElement = document.getElementById("job-salary")
    this.jobDeadlineElement = document.getElementById("job-deadline")
    this.jobDescriptionElement = document.getElementById("job-description")
    this.jobSkillsElement = document.getElementById("job-skills")

    // Application form elements
    this.applicationForm = document.getElementById("application-form")
    this.fullNameInput = document.getElementById("full_name")
    this.emailInput = document.getElementById("email")
    this.phoneInput = document.getElementById("phone_number")
    this.resumeInput = document.getElementById("resume")
    this.submitApplicationBtn = document.getElementById("submit-application-btn")

    // Application status messages
    this.applicationSuccess = document.getElementById("application-success")
    this.applicationClosed = document.getElementById("application-closed")
    this.applicationClosedMessage = document.getElementById("application-closed-message")

    // Error message elements
    this.fullNameError = document.getElementById("fullName-error")
    this.emailError = document.getElementById("email-error")
    this.phoneError = document.getElementById("phone-error")
    this.resumeError = document.getElementById("resume-error")
    this.submitError = document.getElementById("submit-error")
  }

  bindEvents() {
    if (this.applicationForm) {
      this.applicationForm.addEventListener("submit", (e) => this.handleSubmit(e))
    }

    // Real-time validation for form inputs
    const inputs = [this.fullNameInput, this.emailInput, this.phoneInput, this.resumeInput]
    inputs.forEach((input) => {
      if (input) {
        input.addEventListener("input", () => this.clearError(input.id))
        input.addEventListener("change", () => this.clearError(input.id)) // For file input
      }
    })
  }

  async fetchJobDetails() {
    this.showLoading(true)
    try {
      const response = await fetch(`/api/jobs.php?id=${this.jobId}`)
      if (response.ok) {
        const data = await response.json()
        this.job = data.job
        if (this.job) {
          this.renderJobDetails()
          this.showLoading(false)
          this.showElement(this.jobDetailContent)
        } else {
          this.showJobNotFound()
        }
      } else if (response.status === 404) {
        this.showJobNotFound()
      } else {
        throw new Error(`HTTP error! Status: ${response.status}`)
      }
    } catch (error) {
      console.error("Error fetching job details:", error)
      this.showJobNotFound("Failed to load job details. Please try again.")
    }
  }

  renderJobDetails() {
    if (!this.job) return

    this.jobTitleElement.textContent = this.escapeHtml(this.job.title)
    this.jobLocationElement.textContent = this.escapeHtml(this.job.location)
    this.jobSalaryElement.textContent = this.escapeHtml(this.job.salary)
    this.jobDescriptionElement.innerHTML = this.escapeHtml(this.job.description).replace(/\n/g, "<br>") // Preserve line breaks

    const deadlineDate = new Date(this.job.deadline)
    this.jobDeadlineElement.textContent = deadlineDate.toLocaleDateString()

    // Status badge
    const isExpired = deadlineDate < new Date()
    const isClosed = this.job.status === "closed"
    let statusText = "Open"
    let badgeClass = "bg-blue-100 text-blue-800"

    if (isClosed) {
      statusText = "Closed"
      badgeClass = "bg-gray-100 text-gray-800"
    } else if (isExpired) {
      statusText = "Expired"
      badgeClass = "bg-red-100 text-red-800"
    }
    this.jobStatusBadge.textContent = statusText
    this.jobStatusBadge.className = `inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 ${badgeClass}`

    // Skills
    this.jobSkillsElement.innerHTML = ""
    if (this.job.skills) {
      this.job.skills
        .split(",")
        .map((s) => s.trim())
        .filter((s) => s)
        .forEach((skill) => {
          const badge = document.createElement("span")
          badge.className =
            "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 border-gray-200 text-gray-900"
          badge.textContent = this.escapeHtml(skill)
          this.jobSkillsElement.appendChild(badge)
        })
    }

    // Handle application form visibility
    if (isExpired || isClosed) {
      this.hideElement(this.applicationForm)
      this.showElement(this.applicationClosed)
      this.applicationClosedMessage.textContent = isClosed
        ? "This position is no longer accepting applications."
        : "The application deadline has passed."
    } else {
      this.showElement(this.applicationForm)
      this.hideElement(this.applicationClosed)
    }
  }

  async handleSubmit(e) {
    e.preventDefault()

    this.clearAllErrors()
    this.hideElement(this.submitError)

    if (!this.validateForm()) {
      return
    }

    this.submitApplicationBtn.disabled = true
    const originalText = this.submitApplicationBtn.innerHTML
    this.submitApplicationBtn.innerHTML = `
            <div class="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
            Submitting...
        `

    try {
      const formData = new FormData()
      formData.append("job_id", this.jobId.toString())
      formData.append("full_name", this.fullNameInput.value)
      formData.append("email", this.emailInput.value)
      formData.append("phone", this.phoneInput.value)
      formData.append("resume", this.resumeInput.files[0])

      const response = await fetch("/api/applications.php", {
        method: "POST",
        body: formData,
      })

      const result = await response.json()

      if (response.ok) {
        this.hideElement(this.applicationForm)
        this.showElement(this.applicationSuccess)
      } else {
        this.showError(result.error || "Failed to submit application", this.submitError)
      }
    } catch (error) {
      console.error("Error submitting application:", error)
      this.showError("Failed to submit application. Please try again.", this.submitError)
    } finally {
      this.submitApplicationBtn.disabled = false
      this.submitApplicationBtn.innerHTML = originalText
    }
  }

  validateForm() {
    let isValid = true

    // Full Name
    if (!this.fullNameInput.value.trim()) {
      this.showError("Full name is required", this.fullNameError)
      isValid = false
    }

    // Email
    if (!this.emailInput.value.trim()) {
      this.showError("Email is required", this.emailError)
      isValid = false
    } else if (!/\S+@\S+\.\S+/.test(this.emailInput.value)) {
      this.showError("Email is invalid", this.emailError)
      isValid = false
    }

    // Phone
    if (!this.phoneInput.value.trim()) {
      this.showError("Phone number is required", this.phoneError)
      isValid = false
    }

    // Resume
    if (!this.resumeInput.files || this.resumeInput.files.length === 0) {
      this.showError("Resume is required", this.resumeError)
      isValid = false
    } else {
      const resumeFile = this.resumeInput.files[0]
      if (resumeFile.type !== "application/pdf") {
        this.showError("Resume must be a PDF file", this.resumeError)
        isValid = false
      } else if (resumeFile.size > 5 * 1024 * 1024) {
        this.showError("Resume must be less than 5MB", this.resumeError)
        isValid = false
      }
    }

    return isValid
  }

  showLoading(show) {
    if (show) {
      this.showElement(this.loadingIndicator)
      this.hideElement(this.jobDetailContent)
      this.hideElement(this.jobNotFoundElement)
    } else {
      this.hideElement(this.loadingIndicator)
    }
  }

  showJobNotFound(message = "Job not found or failed to load. Please ensure the job ID is valid and try again.") {
    this.hideElement(this.loadingIndicator)
    this.hideElement(this.jobDetailContent)
    this.showElement(this.jobNotFoundElement)
    // Optionally update a message within job-not-found if needed
    // const notFoundMessage = this.jobNotFoundElement.querySelector('p');
    // if (notFoundMessage) notFoundMessage.textContent = message;
  }

  showElement(element) {
    if (element) element.classList.remove("hidden")
  }

  hideElement(element) {
    if (element) element.classList.add("hidden")
  }

  showError(message, errorElement) {
    if (errorElement) {
      errorElement.textContent = message
      this.showElement(errorElement)
      // Add red border to input if it's a direct input error
      const inputId = errorElement.id.replace("-error", "")
      const inputElement = document.getElementById(inputId)
      if (inputElement) {
        inputElement.classList.add("border-red-500")
      }
    }
  }

  clearError(inputId) {
    const errorElement = document.getElementById(`${inputId}-error`)
    if (errorElement) {
      this.hideElement(errorElement)
      errorElement.textContent = ""
    }
    const inputElement = document.getElementById(inputId)
    if (inputElement) {
      inputElement.classList.remove("border-red-500")
    }
  }

  clearAllErrors() {
    this.clearError("fullName")
    this.clearError("email")
    this.clearError("phone")
    this.clearError("resume")
    this.hideElement(this.submitError)
    this.submitError.textContent = ""
  }

  escapeHtml(text) {
    return text
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;")
  }
}

// Initialize job detail page when the DOM is fully loaded
document.addEventListener("DOMContentLoaded", () => {
  // Check if job-detail-content exists to ensure we're on the right page
  if (document.getElementById("job-detail-content")) {
    new JobDetailPage()
  }
})
