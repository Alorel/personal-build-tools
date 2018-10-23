export function isGlob(path: string): boolean {
  return path.includes('*') || path.includes('{');
}
