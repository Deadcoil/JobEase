document.addEventListener("DOMContentLoaded", async () => {
  const urlParams = new URLSearchParams(window.location.search)
  const jobId = urlParams.get("id")

  const loadingMessage = document.getElementById("loading-message")
  const errorMessage = document.getElementById("error-message")
  const jobContent = document.getElementById("job-content")
  const jobTitle = document.getElementById("job-title")
  const jobStatusBadge = document.getElementById("job-status-badge")
  const jobLocation = document.getElementById("job-location")
  const jobSalary = document.getElementById("job-salary")
  const jobDeadline = document.getElementById("job-deadline")
  const jobDescription = document.getElementById("job-description")
  const jobSkills = document.getElementById("job-skills")
  const jobEmploymentType = document.getElementById("job-employment-type")
  const jobExperienceLevel = document.getElementById("job-experience-level")
  const jobInactiveMessage = document.getElementById("job-inactive-message")
  const checkApplicantsBtn = document.getElementById("check-applicants-btn")

  if (!jobId) {
    loadingMessage.classList.add("hidden")
    errorMessage.textContent = "Job ID not found in URL."
    errorMessage.classList.remove("hidden")
    return
  }

  try {
    // Replace with your actual API endpoint for fetching a single job
    const response = await fetch(`/api/admin/index.php?id=${jobId}`)
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }
    const job = await response.json()

    console.log("Fetched job details:", job)

    loadingMessage.classList.add("hidden")
    jobContent.classList.remove("hidden")

    // Populate job details
    jobTitle.textContent = job.title || "N/A"
    jobLocation.textContent = job.location || "N/A"
    jobSalary.textContent = job.salary || "N/A"
    jobDescription.textContent = job.description || "N/A"
    jobEmploymentType.textContent = job.employment_type || "N/A"
    jobExperienceLevel.textContent = job.experience_level || "N/A"

    // Format deadline and check status
    const deadlineDate = job.deadline ? new Date(job.deadline) : null
    const currentDate = new Date()
    currentDate.setHours(0, 0, 0, 0) // Normalize current date to compare only dates

    let statusText = job.status || "Unknown"
    let statusClass = "bg-gray-200 text-gray-800" // Default neutral

    if (job.status && job.status.toLowerCase() === "open") {
      if (deadlineDate && deadlineDate < currentDate) {
        statusText = "Closed (Deadline Passed)"
        statusClass = "bg-red-100 text-red-800"
        jobInactiveMessage.classList.remove("hidden")
      } else {
        statusText = "Active"
        statusClass = "bg-green-100 text-green-800"
      }
    } else if (job.status && job.status.toLowerCase() === "closed") {
      statusText = "Closed"
      statusClass = "bg-red-100 text-red-800"
      jobInactiveMessage.classList.remove("hidden")
    }

    jobStatusBadge.textContent = statusText
    jobStatusBadge.className = `px-3 py-1 rounded-full text-sm font-semibold ${statusClass}`
    jobDeadline.textContent = deadlineDate
      ? deadlineDate.toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })
      : "N/A"

    // Populate skills
    jobSkills.innerHTML = ""
    if (job.skills) {
      const skillsArray = job.skills.split(",").map((skill) => skill.trim())
      skillsArray.forEach((skill) => {
        if (skill) {
          const skillBadge = document.createElement("span")
          skillBadge.className = "bg-blue-100 text-blue-800 text-xs font-medium px-2.5 py-0.5 rounded-full"
          skillBadge.textContent = skill
          jobSkills.appendChild(skillBadge)
        }
      })
    } else {
      jobSkills.innerHTML = '<span class="text-gray-500">No skills listed.</span>'
    }

    // Set "Check Applicants" button link
    checkApplicantsBtn.href = `/admin/applications.html?jobId=${job.id}`
  } catch (error) {
    console.error("Error fetching job details:", error)
    loadingMessage.classList.add("hidden")
    errorMessage.textContent = "Failed to load job details. Please try again."
    errorMessage.classList.remove("hidden")
  }
})
