// public/js/advanced-search.js - Advanced search functionality

class AdvancedJobSearch {
  constructor() {
    this.filters = {
      search: "",
      location: "",
      salaryMin: "",
      salaryMax: "",
      skills: [],
      datePosted: "",
      jobType: "",
    }

    this.initializeAdvancedFilters()
    this.bindEvents()
  }

  initializeAdvancedFilters() {
    const filtersContainer = document.querySelector(".job-filters")
    if (!filtersContainer) return

    // Add advanced filter toggle
    const advancedToggle = document.createElement("div")
    advancedToggle.className = "mt-4"
    advancedToggle.innerHTML = `
            <button id="advanced-toggle" class="text-blue-600 hover:text-blue-800 text-sm font-medium">
                <svg class="w-4 h-4 inline mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path>
                </svg>
                Advanced Filters
            </button>
        `

    filtersContainer.appendChild(advancedToggle)

    // Add advanced filters panel
    const advancedPanel = document.createElement("div")
    advancedPanel.id = "advanced-filters"
    advancedPanel.className = "mt-4 p-4 border rounded-lg bg-gray-50 hidden"
    advancedPanel.innerHTML = `
            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <div>
                    <label class="block text-sm font-medium text-gray-700 mb-1">Salary Range</label>
                    <div class="flex space-x-2">
                        <input type="number" id="salary-min" placeholder="Min" 
                               class="w-full px-3 py-2 border border-gray-300 rounded-md text-sm">
                        <input type="number" id="salary-max" placeholder="Max" 
                               class="w-full px-3 py-2 border border-gray-300 rounded-md text-sm">
                    </div>
                </div>
                
                <div>
                    <label class="block text-sm font-medium text-gray-700 mb-1">Skills</label>
                    <input type="text" id="skills-filter" placeholder="e.g. React, Python" 
                           class="w-full px-3 py-2 border border-gray-300 rounded-md text-sm">
                    <div id="skills-tags" class="mt-2 flex flex-wrap gap-1"></div>
                </div>
                
                <div>
                    <label class="block text-sm font-medium text-gray-700 mb-1">Date Posted</label>
                    <select id="date-posted" class="w-full px-3 py-2 border border-gray-300 rounded-md text-sm">
                        <option value="">Any time</option>
                        <option value="1">Last 24 hours</option>
                        <option value="7">Last week</option>
                        <option value="30">Last month</option>
                    </select>
                </div>
                
                <div>
                    <label class="block text-sm font-medium text-gray-700 mb-1">Job Type</label>
                    <select id="job-type" class="w-full px-3 py-2 border border-gray-300 rounded-md text-sm">
                        <option value="">All types</option>
                        <option value="full-time">Full-time</option>
                        <option value="part-time">Part-time</option>
                        <option value="contract">Contract</option>
                        <option value="remote">Remote</option>
                    </select>
                </div>
                
                <div class="md:col-span-2 lg:col-span-1">
                    <label class="block text-sm font-medium text-gray-700 mb-1">Sort By</label>
                    <select id="sort-by" class="w-full px-3 py-2 border border-gray-300 rounded-md text-sm">
                        <option value="newest">Newest first</option>
                        <option value="oldest">Oldest first</option>
                        <option value="salary-high">Salary: High to Low</option>
                        <option value="salary-low">Salary: Low to High</option>
                        <option value="deadline">Deadline</option>
                    </select>
                </div>
            </div>
            
            <div class="mt-4 flex justify-between">
                <button id="clear-advanced" class="text-gray-600 hover:text-gray-800 text-sm">
                    Clear Advanced Filters
                </button>
                <button id="apply-advanced" class="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 text-sm">
                    Apply Filters
                </button>
            </div>
        `

    filtersContainer.appendChild(advancedPanel)
  }

  bindEvents() {
    // Toggle advanced filters
    const advancedToggle = document.getElementById("advanced-toggle")
    const advancedPanel = document.getElementById("advanced-filters")

    if (advancedToggle && advancedPanel) {
      advancedToggle.addEventListener("click", () => {
        const isHidden = advancedPanel.classList.contains("hidden")

        if (isHidden) {
          advancedPanel.classList.remove("hidden")
          advancedToggle.innerHTML = `
                        <svg class="w-4 h-4 inline mr-1 transform rotate-180" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path>
                        </svg>
                        Hide Advanced Filters
                    `
        } else {
          advancedPanel.classList.add("hidden")
          advancedToggle.innerHTML = `
                        <svg class="w-4 h-4 inline mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path>
                        </svg>
                        Advanced Filters
                    `
        }
      })
    }

    // Skills input handling
    const skillsInput = document.getElementById("skills-filter")
    if (skillsInput) {
      skillsInput.addEventListener("keypress", (e) => {
        if (e.key === "Enter" || e.key === ",") {
          e.preventDefault()
          this.addSkillTag(skillsInput.value.trim())
          skillsInput.value = ""
        }
      })
    }

    // Apply filters button
    const applyBtn = document.getElementById("apply-advanced")
    if (applyBtn) {
      applyBtn.addEventListener("click", () => {
        this.applyAdvancedFilters()
      })
    }

    // Clear filters button
    const clearBtn = document.getElementById("clear-advanced")
    if (clearBtn) {
      clearBtn.addEventListener("click", () => {
        this.clearAdvancedFilters()
      })
    }
  }

  addSkillTag(skill) {
    if (!skill || this.filters.skills.includes(skill)) return

    this.filters.skills.push(skill)
    this.renderSkillTags()
  }

  removeSkillTag(skill) {
    this.filters.skills = this.filters.skills.filter((s) => s !== skill)
    this.renderSkillTags()
  }

  renderSkillTags() {
    const container = document.getElementById("skills-tags")
    if (!container) return

    container.innerHTML = this.filters.skills
      .map(
        (skill) => `
            <span class="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                ${skill}
                <button onclick="advancedSearch.removeSkillTag('${skill}')" class="ml-1 text-blue-600 hover:text-blue-800">
                    <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
                    </svg>
                </button>
            </span>
        `,
      )
      .join("")
  }

  applyAdvancedFilters() {
    // Collect filter values
    this.filters.salaryMin = document.getElementById("salary-min")?.value || ""
    this.filters.salaryMax = document.getElementById("salary-max")?.value || ""
    this.filters.datePosted = document.getElementById("date-posted")?.value || ""
    this.filters.jobType = document.getElementById("job-type")?.value || ""

    const sortBy = document.getElementById("sort-by")?.value || "newest"

    // Apply filters to job listings
    this.filterJobs(sortBy)
  }

  clearAdvancedFilters() {
    this.filters = {
      search: "",
      location: "",
      salaryMin: "",
      salaryMax: "",
      skills: [],
      datePosted: "",
      jobType: "",
    }

    // Clear form inputs
    document.getElementById("salary-min").value = ""
    document.getElementById("salary-max").value = ""
    document.getElementById("skills-filter").value = ""
    document.getElementById("date-posted").value = ""
    document.getElementById("job-type").value = ""
    document.getElementById("sort-by").value = "newest"

    this.renderSkillTags()
    this.filterJobs("newest")
  }

  async filterJobs(sortBy = "newest") {
    try {
      // Build query parameters
      const params = new URLSearchParams()

      Object.keys(this.filters).forEach((key) => {
        if (this.filters[key] && this.filters[key].length > 0) {
          if (key === "skills") {
            params.append(key, this.filters[key].join(","))
          } else {
            params.append(key, this.filters[key])
          }
        }
      })

      params.append("sort", sortBy)

      const response = await fetch(`/api/jobs.php?${params.toString()}`)
      const data = await response.json()

      if (data.jobs) {
        this.renderFilteredJobs(data.jobs)
      }
    } catch (error) {
      console.error("Error filtering jobs:", error)
    }
  }

  renderFilteredJobs(jobs) {
    // This would integrate with the existing job listing display
    // For now, we'll dispatch a custom event that the main jobs page can listen to
    const event = new CustomEvent("jobsFiltered", {
      detail: { jobs: jobs },
    })
    document.dispatchEvent(event)
  }
}

// Initialize advanced search
let advancedSearch
document.addEventListener("DOMContentLoaded", () => {
  if (document.querySelector(".job-filters")) {
    advancedSearch = new AdvancedJobSearch()
  }
})
