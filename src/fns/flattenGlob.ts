export function flattenGlob<T>(acc: T[], src: T[]): T[] {
  acc.push(...src);

  return acc;
}
