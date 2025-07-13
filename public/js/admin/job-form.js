document.addEventListener("DOMContentLoaded", async () => {
  const urlParams = new URLSearchParams(window.location.search)
  const jobId = urlParams.get("id") // Will be null for new job creation

  const loadingMessage = document.getElementById("loading-message")
  const errorMessage = document.getElementById("error-message")
  const jobNotFoundMessage = document.getElementById("job-not-found-message")
  const jobForm = document.getElementById("job-form") // Renamed from edit-job-form
  const cancelBtn = document.getElementById("cancel-btn")
  const formTitle = document.querySelector("h2") // Get the h2 element to change its text

  const formElements = {
    title: document.getElementById("title"),
    description: document.getElementById("description"),
    location: document.getElementById("location"),
    skills: document.getElementById("skills"),
    salary: document.getElementById("salary"),
    deadline: document.getElementById("deadline"),
    employment_type: document.getElementById("employment_type"),
    experience_level: document.getElementById("experience_level"),
    status: document.getElementById("status"),
  }

  if (jobId) {
    // Editing an existing job
    formTitle.textContent = "Edit Job Listing"
    if (loadingMessage) loadingMessage.classList.remove("hidden")
    if (jobForm) jobForm.classList.add("hidden")

    try {
      const response = await fetch(`/api/admin/jobs.php?id=${jobId}`)
      if (!response.ok) {
        if (response.status === 404) {
          if (loadingMessage) loadingMessage.classList.add("hidden")
          if (jobNotFoundMessage) jobNotFoundMessage.classList.remove("hidden")
          return
        }
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      const job = await response.json()
      console.log("Fetched job for editing:", job)

      if (loadingMessage) loadingMessage.classList.add("hidden")
      if (jobForm) jobForm.classList.remove("hidden")

      // Populate form fields
      for (const key in formElements) {
        if (formElements[key] && job[key] !== undefined && job[key] !== null) {
          if (formElements[key].type === "date") {
            formElements[key].value = job[key].split(" ")[0] // Take only YYYY-MM-DD part
          } else {
            formElements[key].value = job[key]
          }
        }
      }
    } catch (error) {
      console.error("Error fetching job details for editing:", error)
      if (loadingMessage) loadingMessage.classList.add("hidden")
      if (errorMessage) errorMessage.classList.remove("hidden")
      return
    }
  } else {
    // Creating a new job
    formTitle.textContent = "Add New Job Listing"
    if (loadingMessage) loadingMessage.classList.add("hidden") // No loading needed for new job
    if (jobNotFoundMessage) jobNotFoundMessage.classList.add("hidden")
    if (errorMessage) errorMessage.classList.add("hidden")
    if (jobForm) jobForm.classList.remove("hidden")
    // Set default status to 'open' for new jobs
    if (formElements.status) formElements.status.value = "open"
  }

  // Handle form submission
  if (jobForm) {
    jobForm.addEventListener("submit", async (event) => {
    event.preventDefault()

    const formData = new FormData(jobForm)
    const jobData = {}
    for (const [key, value] of formData.entries()) {
      jobData[key] = value
    }

    let method = "POST"
    let url = "/api/admin/jobs.php"
    let successMessage = "Job created successfully!"
    let errorMessageText = "Failed to create job. Please try again."

    if (jobId) {
      method = "PUT"
      url = `/api/admin/jobs.php?id=${jobId}`
      successMessage = "Job updated successfully!"
      errorMessageText = "Failed to update job. Please try again."
    }

    console.log(`${method}ing job with data:`, jobData)

    try {
      const response = await fetch(url, {
        method: method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(jobData),
      })

      if (!response.ok) {
        const errorResult = await response.json()
        console.error("Server error:", errorResult)
        throw new Error(`HTTP error! status: ${response.status}, Details: ${JSON.stringify(errorResult)}`)
      }

      const result = await response.json()
      console.log("Job operation successful:", result)
      alert(successMessage)
      window.location.href = "/admin/jobs.html" // Redirect back to all jobs
    } catch (error) {
      console.error(`Error ${method.toLowerCase()}ing job:`, error)
      alert(errorMessageText)
    }
  })
}

  // Handle cancel button
  if (cancelBtn) {
  cancelBtn.addEventListener("click", () => {
    window.location.href = "/admin/jobs.html"
  })
}
})
