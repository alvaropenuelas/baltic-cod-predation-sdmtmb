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
          kelp:    '#5fa384',
          kelpDim: '#3d7a5f',
          sand:    '#d4a574',
          sandDim: '#a37a4f',
          rust:    '#c45a4a',
          ice:     '#a8c8d6',
          heading: 'var(--color-accent-heading)',
        },
        sprat:   '#5fa384',
        herring: '#d4a574',
        // Baltic palette — key colors backed by CSS vars (supports opacity modifiers)
        baltic: {
          deep:    'rgb(var(--rgb-baltic-deep) / <alpha-value>)',
          navy:    'rgb(var(--rgb-baltic-navy) / <alpha-value>)',
          mid:     'rgb(var(--rgb-baltic-mid)  / <alpha-value>)',
          teal:    '#1b6ca8',
          cyan:    '#2ab4d0',
          seafoam: '#4ecdc4',
          sand:    'rgb(var(--rgb-baltic-sand) / <alpha-value>)',
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
