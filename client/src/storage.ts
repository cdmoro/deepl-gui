export function setItem(key: string, value: string | number) {
  localStorage.setItem(key, value.toString());
}

export function getItem(key: string): string | null {
  return localStorage.getItem(key);
}

export function saveAll(obj: Record<string, string | number>) {
  Object.entries(obj).forEach(([key, value]) => {
    localStorage.setItem(key, value.toString());
  });
}

export function load(keys: string[]): Record<string, string | null> {
  const result: Record<string, string | null> = {};
  keys.forEach((key) => {
    result[key] = localStorage.getItem(key);
  });
  return result;
}
