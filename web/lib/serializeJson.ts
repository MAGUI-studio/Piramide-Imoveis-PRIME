// Escape HTML script delimiters without changing the parsed JSON values.
export function serializeJson(data: unknown): string {
  return JSON.stringify(data).replace(/</g, '\\u003c')
}
