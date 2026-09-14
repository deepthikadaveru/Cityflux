/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        darkbg: '#0b0f19',
        cardbg: '#111827',
        accentblue: '#3b82f6',
        accentcyan: '#06b6d4',
        accentred: '#ef4444',
        accentamber: '#f59e0b',
        accentemerald: '#10b981'
      }
    },
  },
  plugins: [],
}
