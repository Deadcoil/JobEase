// public/js/admin/dashboard.js - Admin dashboard functionality

function showElement(element) {
  if (element) {
    // Add null check
    element.style.display = "block"
  }
}

function hideElement(element) {
  if (element) {
    // Add null check
    element.style.display = "none"
  }
}

function escapeHtml(text) {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;")
}

function formatDate(dateString) {
  const date = new Date(dateString)
  return date.toLocaleDateString()
}

const adminAuth = {
  authenticatedRequest: async (url, options = {}) => {
    // const token = localStorage.getItem('admin_token');
    // if (token) {
    //     options.headers = {
    //         ...options.headers,
    //         'Authorization': `Bearer ${token}`
    //     };
    // }

    const response = await fetch(url, options)
    if (!response.ok) {
      // If not authenticated, redirect to login page
      if (response.status === 401 || response.status === 403) {
        localStorage.removeItem("admin_authenticated")
        window.location.href = "/login.html"
      }
      throw new Error(`HTTP error! status: ${response.status}`)
    }
    return response.json()
  },
}

class AdminDashboard {
  constructor() {
    this.jobs = []
    this.applications = []
    this.stats = {
      totalJobs: 0,
      openJobs: 0,
      totalApplications: 0,
      recentApplications: 0,
    }

    this.initializeElements()
    this.checkAuthenticationAndLoadData()
  }

  initializeElements() {
    this.loadingElement = document.getElementById("loading")
    this.dashboardContent = document.getElementById("dashboard-content")

    // Stats elements
    this.totalJobsElement = document.getElementById("total-jobs")
    this.openJobsElement = document.getElementById("open-jobs")
    this.totalApplicationsElement = document.getElementById("total-applications")
    this.recentApplicationsElement = document.getElementById("recent-applications")

    // Lists
    this.jobsList = document.getElementById("jobs-list")
    this.jobsLoading = document.getElementById("jobs-loading")
    this.applicationsList = document.getElementById("applications-list")
    this.applicationsLoading = document.getElementById("applications-loading")

    // Export button
    this.exportCsvBtn = document.getElementById("export-csv-btn")
    if (this.exportCsvBtn) {
      this.exportCsvBtn.addEventListener("click", () => this.exportApplicationsToCSV())
    }

    // Logout button
    this.logoutButton = document.getElementById("logoutButton")
    if (this.logoutButton) {
      this.logoutButton.addEventListener("click", () => this.logout())
    }
  }

  async checkAuthenticationAndLoadData() {
    const isAuthenticated = localStorage.getItem("admin_authenticated") === "true"
    if (!isAuthenticated) {
      window.location.href = "/login.html"
      return
    }
    // In a real app, you'd also call an auth_check.php endpoint here
    // to verify the session/token on the server side.
    this.loadDashboardData()
  }

  async loadDashboardData() {
  try {
    const response = await fetch("/api/admin/dashboard_data.php");
    const data = await response.json();

    if (data.success) {
      // Update stats
      document.getElementById("total-jobs").textContent = data.totalJobs;
      document.getElementById("open-jobs").textContent = data.openJobs;
      document.getElementById("total-applications").textContent = data.totalApplications;
      document.getElementById("recent-applications").textContent = data.recentApplications;

      // Render recent jobs
      const jobList = document.getElementById("jobs-list");
      jobList.innerHTML = "";
      data.jobs.forEach((job) => {
        const jobEl = document.createElement("div");
        jobEl.className = "p-4 border rounded bg-white shadow-sm";
        jobEl.innerHTML = `
          <h4 class="text-lg font-bold">${job.title}</h4>
          <p class="text-sm text-gray-600">${job.company} - ${job.location}</p>
          <p class="text-sm text-gray-500">Status: ${job.status}</p>
        `;
        jobList.appendChild(jobEl);
      });

      // Render recent applications
      const appList = document.getElementById("applications-list");
      appList.innerHTML = "";
      data.applications.forEach((app) => {
        const appEl = document.createElement("div");
        appEl.className = "p-4 border rounded bg-white shadow-sm";
        appEl.innerHTML = `
          <h4 class="font-bold">${app.full_name}</h4>
          <p class="text-sm text-gray-600">${app.email} | ${app.phone}</p>
          <p class="text-sm text-gray-500">Applied at: ${app.applied_at}</p>
        `;
        appList.appendChild(appEl);
      });

      document.getElementById("jobs-loading").style.display = "none"
      document.getElementById("applications-loading").style.display = "none"

      // Show dashboard, hide loading spinner
      document.getElementById("dashboard-content").classList.remove("hidden");
      document.getElementById("loading").classList.add("hidden");
    } else {
      console.error("Dashboard API error:", data.error);
    }
  } catch (error) {
    console.error("Error loading dashboard data:", error);
  }
}

  calculateStats() {
    this.stats.totalJobs = this.jobs.length
    this.stats.openJobs = this.jobs.filter((job) => job.status === "open").length
    this.stats.totalApplications = this.applications.length

    // Calculate recent applications (last 7 days)
    const weekAgo = new Date()
    weekAgo.setDate(weekAgo.getDate() - 7)

    this.stats.recentApplications = this.applications.filter((app) => {
      const appDate = new Date(app.applied_at)
      return appDate > weekAgo
    }).length
  }

  renderStats() {
    if (this.totalJobsElement) this.totalJobsElement.textContent = this.stats.totalJobs
    if (this.openJobsElement) this.openJobsElement.textContent = this.stats.openJobs
    if (this.totalApplicationsElement) this.totalApplicationsElement.textContent = this.stats.totalApplications
    if (this.recentApplicationsElement) this.recentApplicationsElement.textContent = this.stats.recentApplications
  }

  renderJobs() {
    hideElement(this.jobsLoading)

    if (this.jobs.length === 0) {
      if (this.jobsList) {
        // Add null check
        this.jobsList.innerHTML = `
                <div class="text-center py-8">
                    <svg class="h-12 w-12 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2-2v2m8 0V6a2 2 0 012 2v6M8 6V4a2 2 0 012-2h4a2 2 0 012 2v2m-8 0V6a2 2 0 00-2 2v6"></path>
                    </svg>
                    <p class="text-gray-600">No jobs created yet</p>
                    <a href="/new-job.html" class="text-blue-600 hover:text-blue-800 mt-2 inline-block">Create your first job</a>
                </div>
            `
      }
      return
    }

    // Show first 5 jobs
    const jobsToShow = this.jobs.slice(0, 5)

    if (this.jobsList) {
      // Add null check
      this.jobsList.innerHTML = jobsToShow
        .map((job) => {
          const applicationCount = this.applications.filter((app) => app.job_id == job.id).length
          const statusClass = job.status === "open" ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800"

          return `
                  <div class="flex items-center justify-between p-4 border rounded-lg hover:shadow-md transition-shadow">
                      <div class="flex-1">
                          <h3 class="font-semibold text-gray-900">${escapeHtml(job.title)}</h3>
                          <p class="text-sm text-gray-600">${escapeHtml(job.location)}</p>
                          <div class="flex items-center mt-2">
                              <span class="px-2 py-1 rounded-full text-xs font-medium ${statusClass}">${job.status}</span>
                              <span class="text-xs text-gray-500 ml-2">${applicationCount} applications</span>
                          </div>
                      </div>
                      <div class="flex items-center space-x-2">
                          <a href="/admin-applications.html?job_id=${job.id}" 
                             class="bg-blue-100 text-blue-800 px-3 py-1 rounded-md text-sm hover:bg-blue-200">
                              <svg class="w-4 h-4 inline mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path>
                                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"></path>
                              </svg>
                              View
                          </a>
                          <a href="/edit-job.html?id=${job.id}" 
                             class="bg-yellow-100 text-yellow-800 px-3 py-1 rounded-md text-sm hover:bg-yellow-200">
                              <svg class="w-4 h-4 inline mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path>
                              </svg>
                              Edit
                          </a>
                          <button onclick="adminDashboard.toggleJobStatus(${job.id}, '${job.status}')" 
                                  class="bg-gray-100 text-gray-800 px-3 py-1 rounded-md text-sm hover:bg-gray-200">
                              ${job.status === "open" ? "Close" : "Open"}
                          </button>
                          <button onclick="adminDashboard.deleteJob(${job.id})" 
                                  class="bg-red-100 text-red-800 px-3 py-1 rounded-md text-sm hover:bg-red-200">
                              <svg class="w-4 h-4 inline" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
                              </svg>
                          </button>
                      </div>
                  </div>
              `
        })
        .join("")

      // Add "View All" link if there are more than 5 jobs
      if (this.jobs.length > 5) {
        this.jobsList.innerHTML += `
                  <div class="text-center pt-4">
                      <a href="/admin-jobs.html" class="text-blue-600 hover:text-blue-800">
                          View All Jobs (${this.jobs.length})
                      </a>
                  </div>
              `
      }
    }
  }

  renderApplications() {
    hideElement(this.applicationsLoading)

    if (this.applications.length === 0) {
      if (this.applicationsList) {
        // Add null check
        this.applicationsList.innerHTML = `
                <div class="text-center py-8">
                    <svg class="h-12 w-12 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h3m-3 4h3m-6 0h6"></path>
                    </svg>
                    <p class="text-gray-600">No applications received yet</p>
                </div>
            `
      }
      return
    }

    // Show first 5 applications
    const applicationsToShow = this.applications.slice(0, 5)

    if (this.applicationsList) {
      // Add null check
      this.applicationsList.innerHTML = applicationsToShow
        .map((application) => {
          return `
                  <div class="flex items-center justify-between p-4 border rounded-lg hover:shadow-md transition-shadow">
                      <div class="flex-1">
                          <h3 class="font-semibold text-gray-900">${escapeHtml(application.full_name)}</h3>
                          <p class="text-sm text-gray-600">${escapeHtml(application.email)}</p>
                          <p class="text-xs text-gray-500">
                              Applied ${formatDate(application.applied_at)}
                              ${application.job_title ? ` for ${escapeHtml(application.job_title)}` : ""}
                          </p>
                      </div>
                      <div class="flex items-center space-x-2">
                          <a href="${application.resume_url}" target="_blank" rel="noopener noreferrer"
                             class="bg-green-100 text-green-800 px-3 py-1 rounded-md text-sm hover:bg-green-200">
                              <svg class="w-4 h-4 inline mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
                              </svg>
                              Resume
                          </a>
                      </div>
                  </div>
              `
        })
        .join("")

      // Add "View All" link if there are more than 5 applications
      if (this.applications.length > 5) {
        this.applicationsList.innerHTML += `
                  <div class="text-center pt-4">
                      <a href="/admin-applications.html" class="text-blue-600 hover:text-blue-800">
                          View All Applications (${this.applications.length})
                      </a>
                  </div>
              `
      }
    }
  }

  async toggleJobStatus(jobId, currentStatus) {
    const newStatus = currentStatus === "open" ? "closed" : "open"
    const action = newStatus === "open" ? "open" : "close"

    if (!confirm(`Are you sure you want to ${action} this job?`)) {
      return
    }

    try {
      await adminAuth.authenticatedRequest(`/api/admin/jobs.php?id=${jobId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ status: newStatus }),
      })

      // Refresh dashboard data
      this.loadDashboardData()
    } catch (error) {
      console.error("Error updating job status:", error)
      alert("Failed to update job status. Please try again.")
    }
  }

  async deleteJob(jobId) {
    if (
      !confirm(
        "Are you sure you want to delete this job? This will also delete all applications for this job. This action cannot be undone.",
      )
    ) {
      return
    }

    try {
      await adminAuth.authenticatedRequest(`/api/admin/jobs.php?id=${jobId}`, {
        method: "DELETE",
      })

      // Refresh dashboard data
      this.loadDashboardData()
    } catch (error) {
      console.error("Error deleting job:", error)
      alert("Failed to delete job. Please try again.")
    }
  }

  exportApplicationsToCSV() {
    if (this.applications.length === 0) {
      alert("No applications to export")
      return
    }

    const csvContent = [
      ["Name", "Email", "Phone", "Job Title", "Applied Date", "Resume Filename"],
      ...this.applications.map((app) => [
        app.full_name,
        app.email,
        app.phone || "",
        app.job_title || "",
        formatDate(app.applied_at),
        app.resume_filename || "",
      ]),
    ]
      .map((row) => row.map((field) => `"${field}"`).join(","))
      .join("\n")

    const blob = new Blob([csvContent], { type: "text/csv" })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `jobease_applications_${new Date().toISOString().split("T")[0]}.csv`
    a.click()
    window.URL.revokeObjectURL(url)
  }

  logout() {
    localStorage.removeItem("admin_authenticated")
    // In a real application, you would also call a logout.php endpoint
    // to destroy the server-side session.
    window.location.href = "/login.html"
  }
}

// Initialize dashboard when DOM is loaded
let adminDashboard
document.addEventListener("DOMContentLoaded", () => {
  const loginForm = document.getElementById("adminLoginForm")
  const usernameInput = document.getElementById("username")
  const passwordInput = document.getElementById("password")
  const loginButton = document.getElementById("loginButton")
  const loadingSpinner = document.getElementById("loadingSpinner")
  const buttonText = document.getElementById("buttonText")
  const loginError = document.getElementById("loginError")

  if (loginForm) {
    loginForm.addEventListener("submit", async (e) => {
      e.preventDefault() // Prevent default form submission
      loginError.classList.add("hidden")
      loginButton.disabled = true
      loadingSpinner.classList.remove("hidden")
      buttonText.textContent = "Signing in..."

      const username = usernameInput.value
      const password = passwordInput.value

      try {
        const response = await fetch("/api/admin/login.php", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ username, password }),
        })

        const data = await response.json()

        if (data.success) {
          localStorage.setItem("admin_authenticated", "true")
          window.location.href = "/dashboard.html" // Redirect to admin dashboard
        } else {
          loginError.textContent = data.message || "Invalid username or password"
          loginError.classList.remove("hidden")
        }
      } catch (error) {
        console.error("Login error:", error)
        loginError.textContent = "An error occurred during login. Please try again."
        loginError.classList.remove("hidden")
      } finally {
        loginButton.disabled = false
        loadingSpinner.classList.add("hidden")
        buttonText.textContent = "Sign In"
      }
    })
  }

  // Initialize AdminDashboard only if on a dashboard-related page
  // This prevents errors if the script is loaded on the login page
  if (document.getElementById("dashboard-content")) {
    adminDashboard = new AdminDashboard()
  }
})
