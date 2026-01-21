/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      animation: {
        'breathe': 'breathe 10s ease-in-out infinite',
        'breathe-in': 'breatheIn 4s ease-out forwards',
        'breathe-out': 'breatheOut 6s ease-in forwards',
        'fade-slow': 'fadeSlow 30s ease-out forwards',
        'pulse-slow': 'pulseSlow 3s ease-in-out infinite',
      },
      keyframes: {
        breathe: {
          '0%, 100%': { transform: 'scale(1)', opacity: '0.6' },
          '50%': { transform: 'scale(1.3)', opacity: '0.9' },
        },
        breatheIn: {
          '0%': { transform: 'scale(1)', opacity: '0.6' },
          '100%': { transform: 'scale(1.4)', opacity: '0.95' },
        },
        breatheOut: {
          '0%': { transform: 'scale(1.4)', opacity: '0.95' },
          '100%': { transform: 'scale(1)', opacity: '0.6' },
        },
        fadeSlow: {
          '0%': { opacity: '1' },
          '100%': { opacity: '0.1' },
        },
        pulseSlow: {
          '0%, 100%': { opacity: '0.6', transform: 'scale(1)' },
          '50%': { opacity: '0.9', transform: 'scale(1.05)' },
        },
      },
    },
  },
  plugins: [],
}
