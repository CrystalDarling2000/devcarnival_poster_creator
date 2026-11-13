// Pure helpers (no DOM) so they can be unit-tested with `npm test`.

export function slugify(value, max = 40) {
  return String(value)
    .toLowerCase()
    .replace(/[^\p{L}\p{M}\p{N}]+/gu, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, max)
    .replace(/-+$/g, "");
}

// "devcarnival.io" -> "https://devcarnival.io". Anything that already has a
// scheme, or free text containing spaces, is encoded exactly as typed.
export function normalizeQrText(input) {
  const text = String(input).trim();
  if (!text) return "";
  const hasScheme = /^[a-z][a-z0-9+.-]*:/i.test(text) && !/^[a-z0-9.-]+:\d+(\/|$)/i.test(text);
  if (hasScheme || /\s/.test(text)) return text;
  return `https://${text}`;
}

// Single-line fit: the largest size (stepping down) that fits maxWidth;
// at minSize the text is cut with an ellipsis.
export function fitLine(measureAt, text, { maxWidth, maxSize, minSize, step = 1 }) {
  const value = String(text).trim();
  for (let size = maxSize; size >= minSize; size -= step) {
    if (measureAt(value, size) <= maxWidth) return { size, text: value };
  }
  const chars = Array.from(value);
  while (chars.length > 1 && measureAt(`${chars.join("")}…`, minSize) > maxWidth) chars.pop();
  return { size: minSize, text: `${chars.join("")}…` };
}
