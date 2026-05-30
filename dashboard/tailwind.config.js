/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        baltic: {
          deep:    '#0a1628',
          navy:    '#0e2448',
          mid:     '#1a3a6b',
          teal:    '#1b6ca8',
          cyan:    '#2ab4d0',
          seafoam: '#4ecdc4',
          sand:    '#e8d5b0',
          amber:   '#f4a261',
          coral:   '#e76f51',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
    },
  },
  plugins: [],
}
