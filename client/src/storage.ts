const KEY = "deepl-gui";

export function save(state: any) {
  localStorage.setItem(KEY, JSON.stringify(state));
}

export function load() {
  const raw = localStorage.getItem(KEY);
  return raw ? JSON.parse(raw) : null;
}
