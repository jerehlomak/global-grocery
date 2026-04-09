export function formatCurrency(amount: number, currencyCode: string): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: currencyCode,
    minimumFractionDigits: 2,
  }).format(amount)
}

export function formatCompact(amount: number, currencyCode: string): string {
  if (amount >= 1_000_000) {
    return `${(amount / 1_000_000).toFixed(1)}M ${currencyCode}`
  }
  if (amount >= 1_000) {
    return `${(amount / 1_000).toFixed(1)}K ${currencyCode}`
  }
  return formatCurrency(amount, currencyCode)
}
