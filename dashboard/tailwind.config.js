/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        // CSS-variable-based theme-aware colors
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
          kelp:    '#4A8B6F',  // fisheries stable (sage green — sprat series)
          kelpDim: '#2C6E4F',  // fisheries recovering (deeper green)
          sand:    '#D9A856',  // fisheries depleted (warm amber — herring series)
          sandDim: '#C77D2E',  // fisheries overexploited (burnt orange)
          rust:    '#B33A3A',  // fisheries collapsed
          ice:     '#6B8FAE',  // fisheries declining (dusty blue)
          heading: 'var(--color-accent-heading)',
        },
        // Data series — fisheries-aligned
        sprat:   '#4A8B6F',  // fisheries stable
        herring: '#D9A856',  // fisheries depleted
        // Baltic palette — fisheries-aligned where not brand
        baltic: {
          deep:    'rgb(var(--rgb-baltic-deep) / <alpha-value>)',
          navy:    'rgb(var(--rgb-baltic-navy) / <alpha-value>)',
          mid:     'rgb(var(--rgb-baltic-mid)  / <alpha-value>)',
          teal:    '#1B3A4B',  // fisheries accent
          cyan:    '#2C5868',  // fisheries teal-light
          seafoam: '#4A8B6F',  // fisheries stable (sage)
          sand:    'rgb(var(--rgb-baltic-sand) / <alpha-value>)',
          amber:   '#D9A856',  // fisheries depleted
          coral:   '#B33A3A',  // fisheries collapsed
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
