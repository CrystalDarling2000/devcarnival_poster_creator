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

function graphemes(word) {
  if (typeof Intl !== "undefined" && typeof Intl.Segmenter === "function") {
    return Array.from(new Intl.Segmenter().segment(word), (part) => part.segment);
  }
  return Array.from(word);
}

// Greedy word wrap; words wider than maxWidth are broken between characters.
export function wrapText(measure, text, maxWidth) {
  const words = String(text).trim().split(/\s+/).filter(Boolean);
  const lines = [];
  let line = "";
  for (const word of words) {
    const candidate = line ? `${line} ${word}` : word;
    if (measure(candidate) <= maxWidth) { line = candidate; continue; }
    if (line) { lines.push(line); line = ""; }
    if (measure(word) <= maxWidth) { line = word; continue; }
    let chunk = "";
    for (const piece of graphemes(word)) {
      if (chunk && measure(chunk + piece) > maxWidth) { lines.push(chunk); chunk = piece; }
      else chunk += piece;
    }
    line = chunk;
  }
  if (line) lines.push(line);
  return lines;
}

// Largest size (stepping down) at which the text wraps into maxLines or fewer.
// At minSize the last line is cut with an ellipsis.
export function fitText(measureAt, text, { maxWidth, maxLines, maxSize, minSize, step = 1 }) {
  if (!String(text).trim()) return { size: maxSize, lines: [] };
  for (let size = maxSize; size >= minSize; size -= step) {
    const lines = wrapText((value) => measureAt(value, size), text, maxWidth);
    if (lines.length <= maxLines) return { size, lines };
  }
  const kept = wrapText((value) => measureAt(value, minSize), text, maxWidth).slice(0, maxLines);
  const last = Array.from(kept[maxLines - 1]);
  while (last.length > 1 && measureAt(`${last.join("")}…`, minSize) > maxWidth) last.pop();
  kept[maxLines - 1] = `${last.join("")}…`;
  return { size: minSize, lines: kept };
}
