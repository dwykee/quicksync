/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        primary: '#111111',
        secondary: '#f1f5f9',
        accent: '#3b82f6',
        background: '#FDF8F6',
        surface: '#ffffff',
        'surface-dim': '#f1f5f9',
      },
      boxShadow: {
        'soft': '0 12px 44px rgba(15,23,42,0.06)',
        'soft-lg': '0 20px 64px rgba(15,23,42,0.12)',
        'glass': '0 8px 32px 0 rgba(31, 38, 135, 0.07)',
      },
      fontFamily: {
        sans: ['"Inter"', 'sans-serif'],
      },
      borderRadius: {
        '3xl': '1.5rem',
        '4xl': '2rem',
        'full': '9999px',
      }
    },
  },
  plugins: [],
}
