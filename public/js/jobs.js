// public/js/jobs.js - Handles fetching and displaying job listings

class JobListings {
  constructor() {
    this.jobs = []
    this.filteredJobs = []
    this.searchTerm = ""
    this.locationFilter = "all"
    this.salaryRangeFilter = "all"
    this.currentPage = 1
    this.jobsPerPage = 6 // Matching the Next.js component's pagination

    this.initializeElements()
    this.bindEvents()
    this.fetchJobs()
  }

  initializeElements() {
    this.jobListingsContainer = document.getElementById("job-listings-container")
    this.loadingIndicator = document.getElementById("loading-indicator")
    this.noJobsFound = document.getElementById("no-jobs-found")
    this.paginationContainer = document.getElementById("pagination-container")
    this.jobCountDisplay = document.getElementById("job-count-display")
    this.totalJobCountDisplay = document.getElementById("total-job-count-display")

    // References to filter elements (expected to be present in jobs.html)
    this.searchTermInput = document.getElementById("search-term-input")
    this.locationSelect = document.getElementById("location-select")
    this.salarySelect = document.getElementById("salary-select")
    this.clearFiltersBtn = document.getElementById("clear-filters-btn")
  }

  bindEvents() {
    if (this.searchTermInput) {
      this.searchTermInput.addEventListener("input", (e) => {
        this.searchTerm = e.target.value
        this.applyFilters()
      })
    }
    if (this.locationSelect) {
      this.locationSelect.addEventListener("change", (e) => {
        this.locationFilter = e.target.value
        this.applyFilters()
      })
    }
    if (this.salarySelect) {
      this.salarySelect.addEventListener("change", (e) => {
        this.salaryRangeFilter = e.target.value
        this.applyFilters()
      })
    }
    if (this.clearFiltersBtn) {
      this.clearFiltersBtn.addEventListener("click", () => {
        this.clearFilters()
      })
    }

    // Listen for custom event from advanced-search.js
    document.addEventListener("jobsFiltered", (event) => {
      this.jobs = event.detail.jobs // Update base jobs with filtered results from advanced search
      this.applyFilters() // Re-apply local filters if any (e.g. search, location, salary)
    })
  }

  async fetchJobs() {
    this.showLoading(true)
    try {
      // Adjust the URL to your PHP backend endpoint
      const response = await fetch("/api/jobs.php")
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`)
      }
      const data = await response.json()
      this.jobs = data.jobs || []
      this.applyFilters() // Apply filters once jobs are fetched
    } catch (error) {
      console.error("Error fetching jobs:", error)
      this.jobListingsContainer.innerHTML = `
                <div class="text-center py-12 text-red-600">
                    <h3 class="text-xl font-semibold mb-2">Failed to load jobs</h3>
                    <p class="text-gray-600">Please ensure your PHP server is running and the API is accessible.</p>
                </div>
            `
    } finally {
      this.showLoading(false)
    }
  }

  applyFilters() {
    let currentFiltered = this.jobs.filter((job) => job.status === "open")

    // Basic search filter
    if (this.searchTerm) {
      const lowerCaseSearchTerm = this.searchTerm.toLowerCase()
      currentFiltered = currentFiltered.filter(
        (job) =>
          job.title.toLowerCase().includes(lowerCaseSearchTerm) ||
          job.description.toLowerCase().includes(lowerCaseSearchTerm) ||
          job.skills.toLowerCase().includes(lowerCaseSearchTerm),
      )
    }

    // Location filter
    if (this.locationFilter !== "all") {
      currentFiltered = currentFiltered.filter((job) => job.location === this.locationFilter)
    }

    // Salary range filter
    if (this.salaryRangeFilter !== "all") {
      const [min, max] = this.salaryRangeFilter.split("-").map(Number)
      currentFiltered = currentFiltered.filter((job) => {
        // Extract numeric part from salary string (e.g., "$100,000 - $130,000")
        const salaryMatch = job.salary.match(/\d+/)
        const salaryNum = salaryMatch ? Number.parseInt(salaryMatch[0]) : 0
        return salaryNum >= min && salaryNum <= max
      })
    }

    this.filteredJobs = currentFiltered
    this.currentPage = 1 // Reset to first page on filter change
    this.renderJobs()
    this.updateJobCounts()
    this.updateLocationFilterOptions()
  }

  clearFilters() {
    this.searchTerm = ""
    this.locationFilter = "all"
    this.salaryRangeFilter = "all"

    if (this.searchTermInput) this.searchTermInput.value = ""
    if (this.locationSelect) this.locationSelect.value = "all"
    if (this.salarySelect) this.salarySelect.value = "all"

    this.applyFilters()
  }

  updateJobCounts() {
    if (this.jobCountDisplay) this.jobCountDisplay.textContent = this.filteredJobs.length
    if (this.totalJobCountDisplay)
      this.totalJobCountDisplay.textContent = this.jobs.filter((job) => job.status === "open").length
  }

  updateLocationFilterOptions() {
    if (this.locationSelect) {
      const uniqueLocations = [...new Set(this.jobs.map((job) => job.location))]
      const currentSelected = this.locationSelect.value // Preserve current selection if possible
      this.locationSelect.innerHTML = '<option value="all">All Locations</option>'
      uniqueLocations.sort().forEach((loc) => {
        const option = document.createElement("option")
        option.value = loc
        option.textContent = loc
        this.locationSelect.appendChild(option)
      })
      // Restore selection or default to 'all' if the selected location is no longer available
      if (uniqueLocations.includes(currentSelected)) {
        this.locationSelect.value = currentSelected
      } else {
        this.locationSelect.value = "all"
        this.locationFilter = "all" // Update internal state
      }
    }
  }

  renderJobs() {
    this.jobListingsContainer.innerHTML = "" // Clear previous listings
    this.paginationContainer.innerHTML = "" // Clear previous pagination

    const startIndex = (this.currentPage - 1) * this.jobsPerPage
    const endIndex = startIndex + this.jobsPerPage
    const jobsToDisplay = this.filteredJobs.slice(startIndex, endIndex)

    if (jobsToDisplay.length === 0) {
      this.showElement(this.noJobsFound)
      return
    } else {
      this.hideElement(this.noJobsFound)
    }

    jobsToDisplay.forEach((job) => {
      const jobCardHtml = this.createJobCard(job)
      this.jobListingsContainer.insertAdjacentHTML("beforeend", jobCardHtml)
    })

    this.renderPagination()
  }

  createJobCard(job) {
    const isExpired = new Date(job.deadline) < new Date()
    const isClosed = job.status === "closed"
    const badgeVariant = isClosed ? "secondary" : isExpired ? "destructive" : "default"
    const statusText = isClosed ? "Closed" : isExpired ? "Expired" : "Open"
    const buttonText = isExpired || isClosed ? "Application Closed" : "View Details"
    const buttonDisabled = isExpired || isClosed ? "disabled" : ""

    // Safely parse and display skills, showing first 3 and then count
    const skillsArray = job.skills
      ? job.skills
          .split(",")
          .map((s) => s.trim())
          .filter((s) => s)
      : []
    const displaySkills = skillsArray
      .slice(0, 3)
      .map(
        (skill) =>
          `<span class="inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 border-gray-200 text-gray-900">
                ${this.escapeHtml(skill)}
            </span>`,
      )
      .join("")
    const moreSkills =
      skillsArray.length > 3
        ? `<span class="inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 border-gray-200 text-gray-900">
                +${skillsArray.length - 3} more
            </span>`
        : ""

    // Dummy "job.category" and "job.tags" for now as the simple API does not return them,
    // they are used by enhanced-job-card but for basic jobs.js, we rely on core job data.
    const categoryBadge =
      job.category && job.category.name
        ? `<span class="inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2" style="border-color:${job.category.color};color:${job.category.color};">
                ${this.escapeHtml(job.category.name)}
            </span>`
        : ""
    const tagsBadges =
      job.tags && job.tags.length > 0
        ? job.tags
            .slice(0, 2)
            .map(
              (
                tag,
              ) => `<span class="inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 bg-gray-100 text-gray-800">
                ${this.escapeHtml(tag.name)}
            </span>`,
            )
            .join("") +
          (job.tags.length > 2
            ? `<span class="inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 bg-gray-100 text-gray-800"> +${job.tags.length - 2} more </span>`
            : "")
        : ""

    const employmentTypeBadge = job.employment_type
      ? `<span class="inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 bg-blue-100 text-blue-800">
                ${this.escapeHtml(job.employment_type.replace("-", " "))}
            </span>`
      : ""
    const experienceLevelBadge = job.experience_level
      ? `<span class="inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 bg-purple-100 text-purple-800">
                ${this.escapeHtml(job.experience_level)} level
            </span>`
      : ""

    return `
            <div class="rounded-lg border bg-card text-card-foreground shadow-sm h-full transition-shadow hover:shadow-lg ${isExpired || isClosed ? "opacity-75" : ""}">
                <div class="flex flex-col space-y-1.5 p-6 pb-3">
                    <div class="flex justify-between items-start">
                        <div class="flex-1">
                            <h3 class="text-xl font-bold text-gray-900 line-clamp-2 mb-2">${this.escapeHtml(job.title)}</h3>
                            <div class="flex flex-wrap gap-2 mb-2">
                                ${categoryBadge}
                                ${employmentTypeBadge}
                                ${experienceLevelBadge}
                            </div>
                        </div>
                        <span class="inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 ${badgeVariant === "secondary" ? "bg-gray-100 text-gray-800" : badgeVariant === "destructive" ? "bg-red-100 text-red-800" : "bg-blue-100 text-blue-800"}">
                            ${statusText}
                        </span>
                    </div>
                </div>
                <div class="p-6 pt-0 pb-3 space-y-3">
                    <p class="text-gray-600 line-clamp-3 text-sm">${this.escapeHtml(job.description)}</p>
                    <div class="space-y-2">
                        <div class="flex items-center text-sm text-gray-500">
                            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="w-4 h-4 mr-2 flex-shrink-0"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/></svg>
                            <span class="truncate">${this.escapeHtml(job.location)}</span>
                        </div>
                        <div class="flex items-center text-sm text-gray-500">
                            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="w-4 h-4 mr-2 flex-shrink-0"><line x1="12" x2="12" y1="2" y2="22"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>
                            <span class="truncate">${this.escapeHtml(job.salary)}</span>
                        </div>
                        <div class="flex items-center text-sm text-gray-500">
                            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="w-4 h-4 mr-2 flex-shrink-0"><rect width="18" height="18" x="3" y="4" rx="2" ry="2"/><line x1="16" x2="16" y1="2" y2="6"/><line x1="8" x2="8" y1="2" y2="6"/><line x1="3" x2="21" y1="10" y2="10"/></svg>
                            <span>Deadline: ${new Date(job.deadline).toLocaleDateString()}</span>
                        </div>
                    </div>
                    <div class="flex flex-wrap gap-1">
                        ${displaySkills}
                        ${moreSkills}
                    </div>
                    ${tagsBadges ? `<div class="flex flex-wrap gap-1">${tagsBadges}</div>` : ""}
                </div>
                <div class="flex items-center p-6 pt-3">
                    <a href="/job-detail.html?id=${job.id}" class="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground shadow h-10 px-4 py-2 w-full ${buttonDisabled ? "opacity-50 cursor-not-allowed" : ""}" ${buttonDisabled}>
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="w-4 h-4 mr-2"><rect width="18" height="18" x="3" y="4" rx="2" ry="2"/><line x1="16" x2="16" y1="2" y2="6"/><line x1="8" x2="8" y1="2" y2="6"/><line x1="3" x2="21" y1="10" y2="10"/></svg>
                        ${buttonText}
                    </a>
                </div>
            </div>
        `
  }

  renderPagination() {
    const totalPages = Math.ceil(this.filteredJobs.length / this.jobsPerPage)
    if (totalPages <= 1) {
      this.paginationContainer.innerHTML = ""
      return
    }

    let paginationHtml = `
            <button id="prev-page-btn" class="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-input bg-background shadow-sm hover:bg-accent hover:text-accent-foreground h-9 px-4 py-2" ${this.currentPage === 1 ? "disabled" : ""}>
                Previous
            </button>
        `

    for (let i = 1; i <= totalPages; i++) {
      paginationHtml += `
                <button class="page-btn inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-input bg-background shadow-sm hover:bg-accent hover:text-accent-foreground h-9 px-4 py-2 ${this.currentPage === i ? "bg-blue-600 text-white hover:bg-blue-700 hover:text-white" : ""}" data-page="${i}">
                    ${i}
                </button>
            `
    }

    paginationHtml += `
            <button id="next-page-btn" class="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-input bg-background shadow-sm hover:bg-accent hover:text-accent-foreground h-9 px-4 py-2" ${this.currentPage === totalPages ? "disabled" : ""}>
                Next
            </button>
        `

    this.paginationContainer.innerHTML = paginationHtml

    document.getElementById("prev-page-btn").addEventListener("click", () => {
      this.goToPage(this.currentPage - 1)
    })
    document.getElementById("next-page-btn").addEventListener("click", () => {
      this.goToPage(this.currentPage + 1)
    })
    document.querySelectorAll(".page-btn").forEach((btn) => {
      btn.addEventListener("click", (e) => {
        this.goToPage(Number.parseInt(e.target.dataset.page))
      })
    })
  }

  goToPage(page) {
    this.currentPage = Math.max(1, Math.min(page, Math.ceil(this.filteredJobs.length / this.jobsPerPage)))
    this.renderJobs()
  }

  showLoading(show) {
    if (show) {
      this.showElement(this.loadingIndicator)
      this.hideElement(this.jobListingsContainer)
      this.hideElement(this.noJobsFound)
      this.hideElement(this.paginationContainer)
    } else {
      this.hideElement(this.loadingIndicator)
      this.showElement(this.jobListingsContainer)
      if (this.filteredJobs.length > 0) {
        this.showElement(this.paginationContainer)
      }
    }
  }

  showElement(element) {
    if (element) element.style.display = "block"
  }

  hideElement(element) {
    if (element) element.style.display = "none"
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

// Initialize job listings when the DOM is fully loaded
document.addEventListener("DOMContentLoaded", () => {
  // Check if job-listings-container exists to ensure we're on the right page
  if (document.getElementById("job-listings-container")) {
    new JobListings()
  }
})
