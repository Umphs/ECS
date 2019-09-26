export function createRecord<T, K extends number | string = string>() {
  const record: Record<K, T> = Object.create(null);
  return {
    has(k: K) { return record[k] as unknown as boolean; },
    get(k: K) { return record[k]; },
    delete(k: K) { delete record[k]; },
    set(k: K, value: T) { record[k] = value; },
  };
}

export function debounce(fn: () => void) {
  let skip = false;
  const cb = () => { fn(); skip = true; };
  return () => {
    if (skip) return; skip = true;
    setTimeout(cb, 0);
  };
}