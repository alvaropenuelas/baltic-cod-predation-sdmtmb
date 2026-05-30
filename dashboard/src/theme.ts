export const colors = {
  bg:            'var(--color-bg)',
  surface:       'var(--color-surface)',
  elevated:      'var(--color-elevated)',
  border:        'var(--color-border)',
  textPrimary:   'var(--color-text-primary)',
  textSecondary: 'var(--color-text-secondary)',
  textMuted:     'var(--color-text-muted)',
  // Accent colors stay fixed — don't change between modes
  sprat:   '#5fa384',
  herring: '#d4a574',
  ice:     '#a8c8d6',
  rust:    '#c45a4a',
  // Aliases kept for component compatibility
  seafoam: '#4ecdc4',
  amber:   '#f4a261',
} as const

export const mapPalette = [
  "#0a1a24", "#1d3a52", "#3d6478", "#a8c8d6",
  "#e8eef2", "#d4a574", "#c8884f", "#a55a2f", "#7a3919",
]

export const chartColors = {
  primary:   colors.sprat,
  secondary: colors.ice,
  accent:    colors.herring,
  danger:    colors.rust,
} as const
