// Merging saved admin changes on top of the website's built-in content.

const isPlainObject = (v) => v !== null && typeof v === 'object' && !Array.isArray(v);

/**
 * Objects merge key by key; arrays come from the saved value, but each item is merged with the
 * default item at the same position (so hidden fields like photos/links stay intact).
 */
export function mergeContent(base, saved) {
  if (saved === undefined || saved === null) return base;
  if (Array.isArray(saved)) {
    return saved.map((item, i) => (isPlainObject(item) && isPlainObject(base?.[i]) ? mergeContent(base[i], item) : item));
  }
  if (isPlainObject(saved) && isPlainObject(base)) {
    const out = { ...base };
    for (const [key, value] of Object.entries(saved)) out[key] = mergeContent(base[key], value);
    return out;
  }
  return saved;
}

/** Photos are managed in the Photos tab, so they are never stored inside text sections. */
export function stripImages(value) {
  if (Array.isArray(value)) return value.map(stripImages);
  if (isPlainObject(value)) {
    const out = {};
    for (const [key, v] of Object.entries(value)) if (key !== 'image') out[key] = stripImages(v);
    return out;
  }
  return value;
}
