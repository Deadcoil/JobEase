// public/js/admin/statistics.js - Advanced statistics for admin dashboard


class JobStatistics {
  constructor() {
    this.initializeCharts()
  }

  async loadStatistics() {
    try {
      const data = await adminAuth.authenticatedRequest("/api/admin/statistics")
      this.renderApplicationsChart(data.applicationsOverTime)
      this.renderJobStatusChart(data.jobsByStatus)
      this.renderTopLocationsChart(data.topLocations)
    } catch (error) {
      console.error("Error loading statistics:", error)
    }
  }

  initializeCharts() {
    // Create chart containers
    const chartsContainer = document.createElement("div")
    chartsContainer.className = "grid grid-cols-1 lg:grid-cols-2 gap-8 mt-8"
    chartsContainer.innerHTML = `
            <div class="bg-white rounded-lg shadow-sm border p-6">
                <h3 class="text-lg font-semibold mb-4">Applications Over Time</h3>
                <canvas id="applications-chart" width="400" height="200"></canvas>
            </div>
            
            <div class="bg-white rounded-lg shadow-sm border p-6">
                <h3 class="text-lg font-semibold mb-4">Jobs by Status</h3>
                <canvas id="job-status-chart" width="400" height="200"></canvas>
            </div>
            
            <div class="bg-white rounded-lg shadow-sm border p-6">
                <h3 class="text-lg font-semibold mb-4">Top Locations</h3>
                <div id="top-locations-chart"></div>
            </div>
            
            <div class="bg-white rounded-lg shadow-sm border p-6">
                <h3 class="text-lg font-semibold mb-4">Recent Activity</h3>
                <div id="recent-activity"></div>
            </div>
        `

    // Insert after dashboard content
    const dashboardContent = document.getElementById("dashboard-content")
    if (dashboardContent) {
      dashboardContent.appendChild(chartsContainer)
    }

    this.loadStatistics()
  }

  renderApplicationsChart(data) {
    const canvas = document.getElementById("applications-chart")
    if (!canvas) return

    const ctx = canvas.getContext("2d")

    // Simple line chart implementation
    const labels = data.map((item) => item.date)
    const values = data.map((item) => item.count)

    this.drawLineChart(ctx, labels, values, canvas.width, canvas.height)
  }

  renderJobStatusChart(data) {
    const canvas = document.getElementById("job-status-chart")
    if (!canvas) return

    const ctx = canvas.getContext("2d")

    // Simple pie chart implementation
    this.drawPieChart(ctx, data, canvas.width, canvas.height)
  }

  renderTopLocationsChart(data) {
    const container = document.getElementById("top-locations-chart")
    if (!container) return

    container.innerHTML = data
      .map(
        (location) => `
            <div class="flex justify-between items-center py-2 border-b">
                <span class="font-medium">${location.location}</span>
                <span class="text-blue-600 font-semibold">${location.count} jobs</span>
            </div>
        `,
      )
      .join("")
  }

  drawLineChart(ctx, labels, values, width, height) {
    const padding = 40
    const chartWidth = width - 2 * padding
    const chartHeight = height - 2 * padding

    ctx.clearRect(0, 0, width, height)

    // Draw axes
    ctx.strokeStyle = "#e5e7eb"
    ctx.lineWidth = 1

    // Y-axis
    ctx.beginPath()
    ctx.moveTo(padding, padding)
    ctx.lineTo(padding, height - padding)
    ctx.stroke()

    // X-axis
    ctx.beginPath()
    ctx.moveTo(padding, height - padding)
    ctx.lineTo(width - padding, height - padding)
    ctx.stroke()

    if (values.length === 0) return

    const maxValue = Math.max(...values)
    const stepX = chartWidth / (labels.length - 1)

    // Draw line
    ctx.strokeStyle = "#3b82f6"
    ctx.lineWidth = 2
    ctx.beginPath()

    values.forEach((value, index) => {
      const x = padding + index * stepX
      const y = height - padding - (value / maxValue) * chartHeight

      if (index === 0) {
        ctx.moveTo(x, y)
      } else {
        ctx.lineTo(x, y)
      }
    })

    ctx.stroke()

    // Draw points
    ctx.fillStyle = "#3b82f6"
    values.forEach((value, index) => {
      const x = padding + index * stepX
      const y = height - padding - (value / maxValue) * chartHeight

      ctx.beginPath()
      ctx.arc(x, y, 4, 0, 2 * Math.PI)
      ctx.fill()
    })
  }

  drawPieChart(ctx, data, width, height) {
    const centerX = width / 2
    const centerY = height / 2
    const radius = Math.min(width, height) / 2 - 20

    ctx.clearRect(0, 0, width, height)

    const total = data.reduce((sum, item) => sum + item.count, 0)
    let currentAngle = -Math.PI / 2

    const colors = ["#3b82f6", "#ef4444", "#10b981", "#f59e0b"]

    data.forEach((item, index) => {
      const sliceAngle = (item.count / total) * 2 * Math.PI

      ctx.fillStyle = colors[index % colors.length]
      ctx.beginPath()
      ctx.moveTo(centerX, centerY)
      ctx.arc(centerX, centerY, radius, currentAngle, currentAngle + sliceAngle)
      ctx.closePath()
      ctx.fill()

      // Draw label
      const labelAngle = currentAngle + sliceAngle / 2
      const labelX = centerX + Math.cos(labelAngle) * (radius + 15)
      const labelY = centerY + Math.sin(labelAngle) * (radius + 15)

      ctx.fillStyle = "#374151"
      ctx.font = "12px sans-serif"
      ctx.textAlign = "center"
      ctx.fillText(`${item.status} (${item.count})`, labelX, labelY)

      currentAngle += sliceAngle
    })
  }
}

// Initialize statistics when dashboard loads
document.addEventListener("DOMContentLoaded", () => {
  // Wait for dashboard to load first
  setTimeout(() => {
    if (document.getElementById("dashboard-content")) {
      new JobStatistics()
    }
  }, 1000)
})