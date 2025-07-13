document.addEventListener("DOMContentLoaded", async () => {
  const urlParams = new URLSearchParams(window.location.search)
  const jobId = urlParams.get("jobId")

  const mainTitle = document.getElementById("main-title")
  const jobTitleDisplay = document.getElementById("job-title-display")
  const loadingMessage = document.getElementById("loading-message")
  const errorMessage = document.getElementById("error-message")
  const noApplicationsMessage = document.getElementById("no-applications-message")
  const applicationsTable = document.getElementById("applications-table")
  const applicationsTableBody = document.getElementById("applications-table-body")
  const backLink = document.getElementById("back-link")
  const backLinkText = document.getElementById("back-link-text")

  // Set initial state for messages
  loadingMessage.classList.remove("hidden")
  errorMessage.classList.add("hidden")
  noApplicationsMessage.classList.add("hidden")
  applicationsTable.classList.add("hidden")

  if (jobId) {
    // Scenario 1: Display applications for a specific job
    mainTitle.innerHTML = `Applications for: <span id="job-title-display" class="text-blue-600">Loading Job...</span>`
    backLink.href = "/admin/jobs.html"
    backLinkText.textContent = "Back to All Jobs"

    // First, fetch the job title to display it
    try {
      const jobResponse = await fetch(`/api/admin/jobs.php?id=${jobId}`)
      if (!jobResponse.ok) {
        throw new Error(`HTTP error! status: ${jobResponse.status}`)
      }
      const job = await jobResponse.json()
      if (job && job.title) {
        document.getElementById("job-title-display").textContent = job.title
      } else {
        document.getElementById("job-title-display").textContent = "Unknown Job"
      }
    } catch (error) {
      console.error("Error fetching job title:", error)
      document.getElementById("job-title-display").textContent = "Error Loading Job Title"
    }

    // Then, fetch and display applications for this job
    try {
      const applicationsResponse = await fetch(`/api/admin/applications.php?jobId=${jobId}`)
      if (!applicationsResponse.ok) {
        throw new Error(`HTTP error! status: ${applicationsResponse.status}`)
      }
      const applications = await applicationsResponse.json()
      renderApplications(applications)
    } catch (error) {
      console.error("Error fetching applications:", error)
      loadingMessage.classList.add("hidden")
      errorMessage.classList.remove("hidden")
      applicationsTable.classList.add("hidden")
      noApplicationsMessage.classList.add("hidden")
    }
  } else {
    // Scenario 2: Display all applications
    mainTitle.innerHTML = `All Job Applications <button id="export-csv-btn" class="bg-gray-200 text-gray-800 px-3 py-1 rounded-md text-sm hover:bg-gray-300">
                                    <svg class="w-4 h-4 inline mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"></path>
                                    </svg>
                                    Export CSV
                                </button>`
    backLink.href = "/dashboard.html" // Link back to dashboard
    backLinkText.textContent = "Back to Dashboard"

    // Attach event listener for Export CSV button
    setTimeout(() => {
    const exportCsvBtn = document.getElementById("export-csv-btn")
    if (exportCsvBtn) {
        exportCsvBtn.addEventListener("click", () => {
        window.location.href = "/api/admin/export_applications.php"
        })
    }
    }, 0)


    try {
      const applicationsResponse = await fetch(`/api/admin/applications.php`) // Fetch all applications
      if (!applicationsResponse.ok) {
        throw new Error(`HTTP error! status: ${applicationsResponse.status}`)
      }
      const applications = await applicationsResponse.json()
      renderApplications(applications)
    } catch (error) {
      console.error("Error fetching all applications:", error)
      loadingMessage.classList.add("hidden")
      errorMessage.classList.remove("hidden")
      applicationsTable.classList.add("hidden")
      noApplicationsMessage.classList.add("hidden")
    }
  }

  // Function to render applications into the table
  function renderApplications(applications) {
    loadingMessage.classList.add("hidden")
    applicationsTableBody.innerHTML = "" // Clear existing rows

    if (applications.length === 0) {
      noApplicationsMessage.classList.remove("hidden")
      applicationsTable.classList.add("hidden")
    } else {
      applicationsTable.classList.remove("hidden")
      noApplicationsMessage.classList.add("hidden")

      applications.forEach((app) => {
        const row = document.createElement("tr")
        row.innerHTML = `
          <td class="py-3 px-4 whitespace-nowrap text-sm font-medium text-gray-900">${app.applicant_name || "N/A"}</td>
          <td class="py-3 px-4 whitespace-nowrap text-sm text-gray-600">${app.applicant_email || "N/A"}</td>
          <td class="py-3 px-4 whitespace-nowrap text-sm text-gray-600">${app.phone_number || "N/A"}</td>
          <td class="py-3 px-4 whitespace-nowrap text-sm">
            <span class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full">
              ${app.resume_name || "N/A"}
            </span>
          </td>
          <td class="py-3 px-4 whitespace-nowrap text-sm text-gray-600">${formatDate(app.applied_at)}</td>
          <td class="py-3 px-4 whitespace-nowrap text-right text-sm font-medium">
            <a href="${app.resume_path || "#"}" target="_blank" class="text-blue-600 hover:text-blue-900 mr-4 ${app.resume_path ? "" : "opacity-50 cursor-not-allowed"}" ${app.resume_path ? "" : 'onclick="event.preventDefault();"'} >View Resume</a>
          </td>
        `
        applicationsTableBody.appendChild(row)
      })

      // Add event listeners for buttons (e.g., for edit/delete functionality later)
      applicationsTableBody.querySelectorAll(".edit-app-btn").forEach((button) => {
        button.addEventListener("click", (event) => {
          alert(`Edit application ID: ${event.target.dataset.appId}`)
          // Implement edit logic here
        })
      })
      applicationsTableBody.querySelectorAll(".delete-app-btn").forEach((button) => {
        button.addEventListener("click", (event) => {
          if (confirm(`Are you sure you want to delete application ID: ${event.target.dataset.appId}?`)) {
            alert(`Delete application ID: ${event.target.dataset.appId}`)
            // Implement delete logic here
          }
        })
      })
    }
  }

  // Helper function to get status badge class
  function getAppStatusClass(status) {
    if (!status) return "bg-gray-200 text-gray-800"
    const lowerStatus = status.toLowerCase()
    if (lowerStatus === "pending") return "bg-yellow-100 text-yellow-800"
    if (lowerStatus === "reviewed") return "bg-blue-100 text-blue-800"
    if (lowerStatus === "accepted") return "bg-green-100 text-green-800"
    if (lowerStatus === "rejected") return "bg-red-100 text-red-800"
    return "bg-gray-200 text-gray-800"
  }

  // Helper function to format date
  function formatDate(dateString) {
    if (!dateString) return "N/A"
    const date = new Date(dateString)
    return date.toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" })
  }
})
