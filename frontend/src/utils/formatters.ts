export function formatMoney(amount: string, currency: string): string {
  return `${Number(amount).toLocaleString('pl-PL', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })} ${currency}`
}
