// Tiny external store tracking in-flight API requests, so any component can
// show global loading feedback without prop drilling or a context provider.
let count = 0;
const listeners = new Set<() => void>();

export function increment() {
  count++;
  listeners.forEach((l) => l());
}

export function decrement() {
  count = Math.max(0, count - 1);
  listeners.forEach((l) => l());
}

export function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function getSnapshot() {
  return count;
}

export function getServerSnapshot() {
  return 0;
}
