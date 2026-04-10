export function normalizeAadhaar(value: string): string {
  return value.replace(/\s/g, '')
}

export function isValidAadhaar(value: string): boolean {
  const d = normalizeAadhaar(value)
  return /^\d{12}$/.test(d)
}
