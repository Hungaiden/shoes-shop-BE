export function sortObject(obj: { [key: string]: any }) {
  const sorted: { [key: string]: any } = {}
  const keys = Object.keys(obj).sort()
  for (const key of keys) {
    sorted[key] = obj[key]
  }
  return sorted
}
