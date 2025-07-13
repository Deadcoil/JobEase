document.addEventListener("DOMContentLoaded", () => {
  const jobsTableBody = document.querySelector("table tbody")

  // Function to fetch and display jobs
  async function fetchAndDisplayJobs() {
    try {
      // Replace with your actual API endpoint for fetching jobs
      const response = await fetch("/api/admin/jobs.php")
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      const jobs = await response.json()

      console.log("Fetched jobs data:", jobs) // Log the data for debugging

      // Clear existing table rows
      jobsTableBody.innerHTML = ""

      if (jobs.length === 0) {
        const noJobsRow = document.createElement("tr")
        noJobsRow.innerHTML = `
          <td colspan="5" class="py-4 px-4 text-center text-gray-500">No jobs available.</td>
        `
        jobsTableBody.appendChild(noJobsRow)
        return
      }

      // Populate the table with fetched jobs
      jobs.forEach((job) => {
        // Determine status display
        let statusText = job.status
        let statusClass = "bg-gray-100 text-gray-800" // Default neutral

        if (job.status && job.status.toLowerCase() === "open") {
          statusText = "Active" // Display as Active
          statusClass = "bg-green-100 text-green-800"
        } else if (job.status && job.status.toLowerCase() === "closed") {
          statusText = "Closed"
          statusClass = "bg-red-100 text-red-800"
        } else {
          // For any other status, display as is with a yellow background
          statusClass = "bg-yellow-100 text-yellow-800"
        }

        const row = document.createElement("tr")
        row.innerHTML = `
          <td class="py-3 px-4 whitespace-nowrap text-sm font-medium text-gray-900">${job.title}</td>
          <td class="py-3 px-4 whitespace-nowrap text-sm text-gray-600">${job.employment_type || "N/A"}</td>
          <td class="py-3 px-4 whitespace-nowrap text-sm text-gray-600">${job.location}</td>
          <td class="py-3 px-4 whitespace-nowrap text-sm">
            <span class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${statusClass}">
              ${statusText}
            </span>
          </td>
          <td class="py-3 px-4 whitespace-nowrap text-right text-sm font-medium">
            <a href="/admin/job-detail.html?id=${job.id}" class="text-blue-600 hover:text-blue-900 mr-4">View</a>
            <a href="/admin/jobs/edit.html?id=${job.id}" class="text-indigo-600 hover:text-indigo-900 mr-4">Edit</a>
            <button data-job-id="${job.id}" class="text-red-600 hover:text-red-900 delete-job-btn">Delete</button>
          </td>
        `
        jobsTableBody.appendChild(row)
      })

      // Add event listeners for delete buttons
      jobsTableBody.querySelectorAll(".delete-job-btn").forEach((button) => {
        button.addEventListener("click", (event) => {
          const jobId = event.target.dataset.jobId
          if (confirm(`Are you sure you want to delete job ID: ${jobId}?`)) {
            deleteJob(jobId)
          }
        })
      })
    } catch (error) {
      console.error("Error fetching jobs:", error)
      jobsTableBody.innerHTML = `
        <tr>
          <td colspan="5" class="py-4 px-4 text-center text-red-500">Failed to load jobs. Please try again later.</td>
        </tr>
      `
    }
  }

  // Placeholder function for deleting a job
  async function deleteJob(jobId) {
    console.log(`Attempting to delete job with ID: ${jobId}`)
    try {
      // Replace with your actual API endpoint for deleting jobs
      const response = await fetch(`/api/admin/jobs.php?id=${jobId}`, {
        method: "DELETE",
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      console.log(`Job ${jobId} deleted successfully.`)
      // Re-fetch and display jobs to update the list
      fetchAndDisplayJobs()
    } catch (error) {
      console.error(`Error deleting job ${jobId}:`, error)
      alert(`Failed to delete job ${jobId}.`)
    }
  }

  // Initial fetch when the page loads
  fetchAndDisplayJobs()
})
