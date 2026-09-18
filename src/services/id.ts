/** Lightweight unique-ish id generator for local-only records. Not cryptographic. */
export function generateId(prefix = 'id'): string {
  const random = Math.random().toString(36).slice(2, 10);
  const timestamp = Date.now().toString(36);
  return `${prefix}_${timestamp}${random}`;
}
