export const colors = {
  bg:            'var(--color-bg)',
  surface:       'var(--color-surface)',
  elevated:      'var(--color-elevated)',
  border:        'var(--color-border)',
  textPrimary:   'var(--color-text-primary)',
  textSecondary: 'var(--color-text-secondary)',
  textMuted:     'var(--color-text-muted)',
  // Accent colors — fisheries-aligned
  sprat:   '#4A8B6F',  // fisheries stable (primary data — sage green)
  herring: '#D9A856',  // fisheries depleted (secondary — warm amber)
  ice:     '#6B8FAE',  // fisheries declining (tertiary — dusty blue)
  rust:    '#B33A3A',  // fisheries collapsed
  // Aliases
  seafoam: '#4A8B6F',
  amber:   '#D9A856',
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
