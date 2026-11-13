import { LIMITS } from "../config/poster";

export function validateImageFile(file) {
  if (!LIMITS.imageTypes.includes(file.type)) return "Please choose a PNG, JPG or WebP image.";
  if (file.size > LIMITS.imageMaxBytes) return "That image is larger than 8 MB. Please choose a smaller file.";
  return "";
}

export function loadImageUrl(url) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => (img.naturalWidth && img.naturalHeight ? resolve(img) : reject(new Error("empty image")));
    img.onerror = () => reject(new Error("decode failed"));
    img.src = url;
  });
}

// True when the image has an opaque, near-white background (typical JPG logos).
// Such logos are blended with "multiply" so the white disappears on the poster.
function hasWhiteBackground(img) {
  try {
    const size = 48;
    const canvas = document.createElement("canvas");
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext("2d", { willReadFrequently: true });
    ctx.drawImage(img, 0, 0, size, size);
    const last = size - 1;
    const mid = Math.floor(size / 2);
    const points = [[0, 0], [last, 0], [0, last], [last, last], [mid, 0], [mid, last], [0, mid], [last, mid]];
    return points.every(([x, y]) => {
      const [r, g, b, a] = ctx.getImageData(x, y, 1, 1).data;
      return a >= 250 && r >= 235 && g >= 235 && b >= 235;
    });
  } catch {
    return false;
  }
}

// Crops empty margins (transparent, or white for opaque-white logos) so that
// "100% size" really fills the logo area. Falls back to the original image.
async function trimMargins(img, whiteBg) {
  try {
    const w = img.naturalWidth;
    const h = img.naturalHeight;
    const scale = Math.min(1, 800 / Math.max(w, h));
    const aw = Math.max(1, Math.round(w * scale));
    const ah = Math.max(1, Math.round(h * scale));
    const probe = document.createElement("canvas");
    probe.width = aw;
    probe.height = ah;
    const pctx = probe.getContext("2d", { willReadFrequently: true });
    pctx.drawImage(img, 0, 0, aw, ah);
    const { data } = pctx.getImageData(0, 0, aw, ah);
    let minX = aw, minY = ah, maxX = -1, maxY = -1;
    for (let y = 0; y < ah; y += 1) {
      for (let x = 0; x < aw; x += 1) {
        const i = (y * aw + x) * 4;
        const empty = data[i + 3] < 16 || (whiteBg && data[i] >= 244 && data[i + 1] >= 244 && data[i + 2] >= 244);
        if (empty) continue;
        if (x < minX) minX = x;
        if (x > maxX) maxX = x;
        if (y < minY) minY = y;
        if (y > maxY) maxY = y;
      }
    }
    if (maxX < 0) return img;
    const sx = Math.max(0, Math.floor((minX - 1) / scale));
    const sy = Math.max(0, Math.floor((minY - 1) / scale));
    const sw = Math.min(w - sx, Math.ceil((maxX - minX + 3) / scale));
    const sh = Math.min(h - sy, Math.ceil((maxY - minY + 3) / scale));
    if (sw >= w * 0.98 && sh >= h * 0.98) return img;
    const out = Math.min(1, 2400 / Math.max(sw, sh));
    const canvas = document.createElement("canvas");
    canvas.width = Math.max(1, Math.round(sw * out));
    canvas.height = Math.max(1, Math.round(sh * out));
    canvas.getContext("2d").drawImage(img, sx, sy, sw, sh, 0, 0, canvas.width, canvas.height);
    return await loadImageUrl(canvas.toDataURL("image/png"));
  } catch {
    return img;
  }
}

// Returns { img, url, name, whiteBg }. Release with releaseAsset when replaced.
export async function loadImageAsset(file) {
  const url = URL.createObjectURL(file);
  try {
    const original = await loadImageUrl(url);
    const whiteBg = hasWhiteBackground(original);
    const img = await trimMargins(original, whiteBg);
    return { img, url, name: file.name, whiteBg };
  } catch {
    URL.revokeObjectURL(url);
    throw new Error("That file could not be read as an image. Please try another one.");
  }
}

export function releaseAsset(asset) {
  if (asset?.url) URL.revokeObjectURL(asset.url);
}
