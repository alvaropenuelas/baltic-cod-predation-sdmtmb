/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        // CSS-variable-based theme-aware colors (dark/light mode)
        bg:       'var(--color-bg)',
        surface:  'var(--color-surface)',
        elevated: 'var(--color-elevated)',
        border:   'var(--color-border)',
        text: {
          primary:   'var(--color-text-primary)',
          secondary: 'var(--color-text-secondary)',
          muted:     'var(--color-text-muted)',
        },
        accent: {
          kelp:    '#5fa384',
          kelpDim: '#3d7a5f',
          sand:    '#d4a574',
          sandDim: '#a37a4f',
          rust:    '#c45a4a',
          ice:     '#a8c8d6',
        },
        sprat:   '#5fa384',
        herring: '#d4a574',
        // Legacy baltic palette — keeps existing components unstyled-safe
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
        sans:    ['Inter', 'system-ui', 'sans-serif'],
        mono:    ['JetBrains Mono', 'monospace'],
        display: ['Fraunces', 'Georgia', 'serif'],
      },
    },
  },
  plugins: [],
}
