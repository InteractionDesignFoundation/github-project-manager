export function get(valueName) {
  return localStorage.getItem(valueName);
}

export function set(valueName, newValue) {
  localStorage.setItem(valueName, newValue);
}
