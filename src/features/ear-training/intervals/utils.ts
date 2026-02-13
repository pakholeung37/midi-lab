export function formatPercent(value: number): string {
  return `${Math.round(value * 100)}%`
}

export function formatRelativeTime(timestamp: number): string {
  const diffMs = Date.now() - timestamp
  const diffMinutes = Math.floor(diffMs / (1000 * 60))

  if (diffMinutes < 1) return 'just now'
  if (diffMinutes < 60) return `${diffMinutes} m. ago`

  const diffHours = Math.floor(diffMinutes / 60)
  if (diffHours < 24) return `${diffHours} h. ago`

  const diffDays = Math.floor(diffHours / 24)
  return `${diffDays} d. ago`
}
