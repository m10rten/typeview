export function normalizeToLines(input?: string | string[]): string[] {
  if (!input) return [];
  if (Array.isArray(input)) return input.flatMap(splitLines);
  return splitLines(input);
}

export function splitLines(s: string): string[] {
  return s.split(/\r?\n/);
}
