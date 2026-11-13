import { DEFAULT_NAME_STYLE, TEMPLATE } from "../config/poster";
import { placeImage } from "./geometry";
import { fitLine, fitText } from "./text";

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

function measurer(ctx) {
  return (value, size) => {
    ctx.font = `800 ${size}px ${FONT}`;
    return ctx.measureText(value).width;
  };
}

// Name BESIDE the logo (left or right): up to two lines, vertically aligned (ay)
// in the header area. Returns the width it occupies so the logo can use the rest.
function layoutNameSide(ctx, name, style) {
  const spec = TEMPLATE.name.side;
  const measureAt = measurer(ctx);
  const fit = fitText(measureAt, name, {
    maxWidth: spec.maxWidth,
    maxLines: spec.maxLines,
    maxSize: Math.round(spec.maxSize * style.size),
    minSize: spec.minSize,
  });
  const width = Math.max(...fit.lines.map((line) => measureAt(line, fit.size)));
  return { fit, width: Math.ceil(width) };
}

// Draws the side name hugging the logo (gap px away), vertically aligned (ay)
// against the logo itself. Lines are right-aligned when the name is on the left.
function drawNameSide(ctx, { fit, width }, style, rect) {
  const area = TEMPLATE.logoBox;
  const gap = TEMPLATE.name.side.gap;
  const lineHeight = fit.size * TEMPLATE.name.side.lineHeight;
  const onRight = style.position === "right";
  const clamp = (value, min, max) => Math.min(max, Math.max(min, value));
  const x = clamp(onRight ? rect.x + rect.width + gap : rect.x - gap - width, area.x, area.x + area.width - width);
  const blockHeight = lineHeight * fit.lines.length;
  const top = clamp(rect.y + (rect.height - blockHeight) * style.ay, area.y, area.y + area.height - blockHeight);
  ctx.save();
  ctx.font = `800 ${fit.size}px ${FONT}`;
  ctx.fillStyle = TEMPLATE.name.color;
  ctx.textAlign = onRight ? "left" : "right";
  ctx.textBaseline = "middle";
  const anchor = onRight ? x : x + width;
  fit.lines.forEach((line, index) => ctx.fillText(line, anchor, top + lineHeight * (index + 0.5)));
  ctx.restore();
}

// Name BELOW the logo, aligned (ax) to the logo's left edge, centre or right edge.
function drawNameBelow(ctx, name, rect, style) {
  const spec = TEMPLATE.name.below;
  const area = TEMPLATE.logoBox;
  const measureAt = measurer(ctx);
  const fit = fitLine(measureAt, name, {
    maxWidth: area.width,
    maxSize: Math.round(spec.maxSize * style.size),
    minSize: spec.minSize,
  });
  const width = measureAt(fit.text, fit.size);
  const wanted = rect.x + (rect.width - width) * style.ax;
  const x = Math.min(area.x + area.width - width, Math.max(area.x, wanted));
  ctx.save();
  ctx.font = `800 ${fit.size}px ${FONT}`;
  ctx.fillStyle = TEMPLATE.name.color;
  ctx.textAlign = "left";
  ctx.textBaseline = "middle";
  ctx.fillText(fit.text, x, rect.y + rect.height + spec.gap + (fit.size * 1.2) / 2);
  ctx.restore();
}

function drawHeader(ctx, { logo, align, placeholders, name, nameStyle }) {
  const area = TEMPLATE.logoBox;
  const below = Boolean(name) && nameStyle.position === "below";
  const side = Boolean(name) && (nameStyle.position === "left" || nameStyle.position === "right");
  let box = { x: area.x, y: below ? area.yWithName : area.y, width: area.width, height: area.height };
  let layout = null;
  if (side) {
    // Reserve room for the name; the logo is placed in what is left and the name
    // then sits next to it, so name + logo read as one centred group.
    layout = layoutNameSide(ctx, name, nameStyle);
    const used = layout.width + TEMPLATE.name.side.gap;
    box = { ...box, x: nameStyle.position === "left" ? box.x + used : box.x, width: box.width - used };
  }
  if (!logo) {
    if (placeholders) {
      ctx.save();
      ctx.setLineDash([12, 9]);
      ctx.lineWidth = 3;
      ctx.strokeStyle = "rgba(27, 21, 80, 0.25)";
      roundedRect(ctx, box.x, box.y, box.width, box.height, 28);
      ctx.stroke();
      ctx.restore();
      hint(ctx, "YOUR LOGO", box.x + box.width / 2, box.y + box.height / 2, 30);
    }
    if (side) drawNameSide(ctx, layout, nameStyle, box);
    return;
  }
  const rect = placeImage({ imgW: logo.img.naturalWidth, imgH: logo.img.naturalHeight, box, ...align });
  ctx.save();
  if (logo.whiteBg) ctx.globalCompositeOperation = "multiply";
  ctx.drawImage(logo.img, rect.x, rect.y, rect.width, rect.height);
  ctx.restore();
  if (below) drawNameBelow(ctx, name, rect, nameStyle);
  if (side) drawNameSide(ctx, layout, nameStyle, rect);
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
export function renderPoster(canvas, { template, logo = null, align, qr = null, name = "", nameStyle = DEFAULT_NAME_STYLE, placeholders = false }) {
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
  drawHeader(ctx, { logo, align, placeholders, name: name.trim(), nameStyle });
  drawQr(ctx, qr, placeholders);
}
