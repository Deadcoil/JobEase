/** @type {import('tailwindcss').Config} */
    module.exports = {
      content: [
        "./public/**/*.{html,js,php}", // Scan all HTML, JS, PHP files in public/
        "./app/views/**/*.php", // If you add PHP views later
      ],
      theme: {
        extend: {},
      },
      plugins: [],
    }