export function sortObjectByKey<T extends object>(inp: T): T {
  const out: T = <any>{};

  return Object.keys(inp)
    .sort()
    .reduce<T>(
      (acc, k) => {
        acc[k] = inp[k];

        return acc;
      },
      out
    );
}
