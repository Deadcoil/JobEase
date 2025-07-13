// public/js/main.js - Common utilities and functions

// Utility function to format dates
function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });
}

// Utility function to check if a date has passed
function isDatePassed(dateString) {
    const date = new Date(dateString);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return date < today;
}

// Utility function to show/hide elements
function showElement(element) {
    if (element) element.style.display = 'block';
}

function hideElement(element) {
    if (element) element.style.display = 'none';
}

// Utility function to make API requests
async function apiRequest(url, options = {}) {
    try {
        const response = await fetch(url, {
            headers: {
                'Content-Type': 'application/json',
                ...options.headers
            },
            ...options
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        return await response.json();
    } catch (error) {
        console.error('API request failed:', error);
        throw error;
    }
}

// Utility function to show error messages
function showError(message, container = null) {
    if (container) {
        container.textContent = message;
        container.style.display = 'block';
    } else {
        alert(message); // Fallback to alert
    }
}

// Utility function to clear error messages
function clearErrors(form) {
    const errorElements = form.querySelectorAll('.error-message');
    errorElements.forEach(element => {
        element.style.display = 'none';
        element.textContent = '';
    });
}

// Utility function to validate file upload
function validateFile(file, maxSizeMB = 5, allowedTypes = ['application/pdf']) {
    if (!file) {
        return 'Please select a file';
    }

    if (!allowedTypes.includes(file.type)) {
        return 'Only PDF files are allowed';
    }

    if (file.size > maxSizeMB * 1024 * 1024) {
        return `File size must be less than ${maxSizeMB}MB`;
    }

    return null; // No error
}

// Utility function to create skill badges
function createSkillBadges(skillsString, container) {
    if (!skillsString || !container) return;

    const skills = skillsString.split(',').map(skill => skill.trim());
    container.innerHTML = '';

    skills.forEach(skill => {
        const badge = document.createElement('span');
        badge.className = 'inline-block bg-blue-100 text-blue-800 text-sm px-3 py-1 rounded-full';
        badge.textContent = skill;
        container.appendChild(badge);
    });
}

// Utility function to get URL parameters
function getUrlParameter(name) {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get(name);
}

// Utility function to get job ID from URL path
function getJobIdFromUrl() {
    const pathParts = window.location.pathname.split('/');
    const jobIndex = pathParts.indexOf('jobs');
    if (jobIndex !== -1 && pathParts[jobIndex + 1]) {
        return parseInt(pathParts[jobIndex + 1]);
    }
    return null;
}