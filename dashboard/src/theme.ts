export const colors = {
  // Baltic palette
  deep:    '#0a1628',
  navy:    '#0e2448',
  mid:     '#1a3a6b',
  teal:    '#1b6ca8',
  cyan:    '#2ab4d0',
  seafoam: '#4ecdc4',
  sand:    '#e8d5b0',
  amber:   '#f4a261',
  coral:   '#e76f51',
  // UI tokens
  bg:            '#0a1628',
  surface:       '#0e2448',
  elevated:      '#122b52',
  border:        '#1a3a6b',
  textPrimary:   '#e8d5b0',
  textSecondary: '#a0b4c8',
  textMuted:     '#5a7387',
  // Semantic species
  sprat:   '#4ecdc4',
  herring: '#f4a261',
  rust:    '#e76f51',
} as const

export const chartColors = {
  primary:   colors.cyan,
  secondary: colors.seafoam,
  accent:    colors.amber,
  danger:    colors.coral,
  muted:     colors.teal,
} as const
