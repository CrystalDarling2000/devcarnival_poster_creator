import { TEMPLATE } from "../config/poster";
import { placeImage } from "./geometry";
import { fitLine } from "./text";

const FONT = '"Segoe UI", "Helvetica Neue", Arial, sans-serif';
const HINT = "rgba(27, 21, 80, 0.42)";

function roundedRect(ctx, x, y, w, h, r) {
  const radius = Math.min(r, w / 2, h / 2);
  ctx.beginPath();
  ctx.moveTo(x + radius, y);
  ctx.arcTo(x + w, y, x + w, y + h, radius);
  ctx.arcTo(x + w, y + h, x, y + h, radius);
  ctx.arcTo(x, y + h, x, y, radius);
  ctx.arcTo(x, y, x + w, y, radius);
  ctx.closePath();
}

function hint(ctx, text, cx, cy, size) {
  ctx.save();
  ctx.fillStyle = HINT;
  ctx.font = `700 ${size}px ${FONT}`;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText(text, cx, cy);
  ctx.restore();
}

function drawFrame(ctx) {
  const { divider, partner } = TEMPLATE;
  ctx.save();
  ctx.strokeStyle = divider.color;
  ctx.lineWidth = divider.width;
  ctx.lineCap = "round";
  ctx.beginPath();
  ctx.moveTo(divider.x, divider.y1);
  ctx.lineTo(divider.x, divider.y2);
  ctx.stroke();
  ctx.fillStyle = partner.color;
  ctx.font = `700 ${partner.size}px ${FONT}`;
  if ("letterSpacing" in ctx) ctx.letterSpacing = "1.5px";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText(partner.text, partner.cx, partner.cy);
  ctx.restore();
}

function drawName(ctx, name, rect, area) {
  const spec = TEMPLATE.name;
  ctx.save();
  const measureAt = (value, size) => {
    ctx.font = `800 ${size}px ${FONT}`;
    return ctx.measureText(value).width;
  };
  const fit = fitLine(measureAt, name, { maxWidth: area.width, maxSize: spec.maxSize, minSize: spec.minSize });
  ctx.font = `800 ${fit.size}px ${FONT}`;
  ctx.fillStyle = spec.color;
  ctx.textBaseline = "middle";
  ctx.textAlign = "center";
  const half = ctx.measureText(fit.text).width / 2;
  // Centre under the logo, but never leave the logo area.
  const cx = Math.min(area.x + area.width - half, Math.max(area.x + half, rect.x + rect.width / 2));
  ctx.fillText(fit.text, cx, rect.y + rect.height + spec.gap + (fit.size * 1.2) / 2);
  ctx.restore();
}

function drawLogo(ctx, logo, align, placeholders, name) {
  const full = TEMPLATE.logoBox;
  const withName = Boolean(name);
  const box = { x: full.x, y: withName ? full.yWithName : full.y, width: full.width, height: full.height };
  if (!logo) {
    if (!placeholders) return;
    ctx.save();
    ctx.setLineDash([12, 9]);
    ctx.lineWidth = 3;
    ctx.strokeStyle = "rgba(27, 21, 80, 0.25)";
    roundedRect(ctx, box.x, box.y, box.width, box.height, 28);
    ctx.stroke();
    ctx.restore();
    hint(ctx, "YOUR COMMUNITY LOGO", box.x + box.width / 2, box.y + box.height / 2, 30);
    return;
  }
  const rect = placeImage({ imgW: logo.img.naturalWidth, imgH: logo.img.naturalHeight, box, ...align });
  ctx.save();
  if (logo.whiteBg) ctx.globalCompositeOperation = "multiply";
  ctx.drawImage(logo.img, rect.x, rect.y, rect.width, rect.height);
  ctx.restore();
  if (withName) drawName(ctx, name, rect, full);
}

function drawQr(ctx, qr, placeholders) {
  const slot = TEMPLATE.qrSlot;
  if (!qr && !placeholders) return;
  ctx.save();
  roundedRect(ctx, slot.x + 3, slot.y + 3, slot.width - 6, slot.height - 6, slot.radius - 3);
  ctx.fillStyle = "#ffffff";
  ctx.fill();
  ctx.clip();
  if (qr) {
    const box = {
      x: slot.x + slot.padding,
      y: slot.y + slot.padding,
      width: slot.width - slot.padding * 2,
      height: slot.height - slot.padding * 2,
    };
    const rect = placeImage({ imgW: qr.naturalWidth, imgH: qr.naturalHeight, box });
    ctx.drawImage(qr, rect.x, rect.y, rect.width, rect.height);
    ctx.restore();
    return;
  }
  ctx.restore();
  hint(ctx, "YOUR QR CODE", slot.x + slot.width / 2, slot.y + slot.height / 2, 26);
}

/**
 * Draws the whole poster. Synchronous: every image must already be loaded.
 * `logo` is an asset { img, whiteBg }, `qr` an HTMLImageElement.
 * `placeholders` adds grey hints for missing inputs (preview only, never exported).
 */
export function renderPoster(canvas, { template, logo = null, align, qr = null, name = "", placeholders = false }) {
  const { width, height } = TEMPLATE;
  if (canvas.width !== width) canvas.width = width;
  if (canvas.height !== height) canvas.height = height;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Canvas is not supported in this browser.");
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = "high";
  ctx.clearRect(0, 0, width, height);
  ctx.drawImage(template, 0, 0, width, height);
  drawFrame(ctx);
  drawLogo(ctx, logo, align, placeholders, name.trim());
  drawQr(ctx, qr, placeholders);
}
