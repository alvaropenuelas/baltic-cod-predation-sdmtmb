export const colors = {
  bg:            'var(--color-bg)',
  surface:       'var(--color-surface)',
  elevated:      'var(--color-elevated)',
  border:        'var(--color-border)',
  textPrimary:   'var(--color-text-primary)',
  textSecondary: 'var(--color-text-secondary)',
  textMuted:     'var(--color-text-muted)',
  // Accent colors stay fixed — don't change between modes
  sprat:   '#5fa384',  // brand (kept)
  herring: '#d4a574',  // brand (kept)
  ice:     '#6B8FAE',  // fisheries declining
  rust:    '#B33A3A',  // fisheries collapsed
  // Aliases — fisheries-aligned
  seafoam: '#4A8B6F',  // fisheries stable
  amber:   '#D9A856',  // fisheries depleted
} as const

export const mapPalette = [
  "#0F1F28", "#1B3A4B", "#2C5868", "#6B8FAE",
  "#F2EDE3", "#D9A856", "#C77D2E", "#B33A3A", "#7A2A2A",
]

export const chartColors = {
  primary:   colors.sprat,
  secondary: colors.ice,
  accent:    colors.herring,
  danger:    colors.rust,
} as const
