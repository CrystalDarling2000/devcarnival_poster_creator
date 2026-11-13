function loadImage(source) {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.onload = () => resolve(image);
    image.onerror = () => reject(new Error("An image could not be loaded for the poster."));
    image.src = source;
  });
}

function drawContainedImage(context, image, x, y, size) {
  const scale = Math.min(size / image.width, size / image.height);
  const width = image.width * scale;
  const height = image.height * scale;
  context.drawImage(image, x + (size - width) / 2, y + (size - height) / 2, width, height);
}

function fitFontSize(context, text, width, preferredSize) {
  let size = preferredSize;
  while (size > 14) {
    context.font = `700 ${size}px Arial, sans-serif`;
    if (context.measureText(text).width <= width) break;
    size -= 1;
  }
  return size;
}

export async function renderPoster(template, { name, logo, corner = "top-left", logoScale = 0.085 }) {
  if (!template?.image) throw new Error("Upload a poster template before previewing.");
  const image = await loadImage(template.image);
  const canvas = document.createElement("canvas");
  canvas.width = Number(template.width || template.originalWidth) || image.naturalWidth;
  canvas.height = Number(template.height || template.originalHeight) || image.naturalHeight;

  const context = canvas.getContext("2d");
  if (!context) throw new Error("Canvas rendering is not supported by this browser.");
  context.drawImage(image, 0, 0, canvas.width, canvas.height);

  const text = String(name || "").trim();
  if (!text && !logo) return canvas;

  const { width, height } = canvas;
  const insetX = width * 0.045;
  const insetY = height * 0.04;
  const size = Math.min(width * Math.max(0.05, Math.min(0.15, Number(logoScale) || 0.085)), height * 0.15);
  const gap = Math.max(10, width * 0.014);
  const preferredFontSize = Math.max(18, Math.min(52, width * 0.034));
  const maxTextWidth = width - insetX * 2 - (logo ? size + gap : 0);
  const fontSize = fitFontSize(context, text, maxTextWidth, preferredFontSize);
  context.font = `700 ${fontSize}px Arial, sans-serif`;
  const textWidth = text ? Math.min(context.measureText(text).width, maxTextWidth) : 0;
  const groupWidth = (logo ? size + (text ? gap : 0) : 0) + textWidth;
  const groupHeight = Math.max(logo ? size : 0, text ? fontSize : 0);
  const rightAligned = corner.endsWith("right");
  const bottomAligned = corner.startsWith("bottom");
  const groupX = rightAligned ? width - insetX - groupWidth : insetX;
  const groupY = bottomAligned ? height - insetY - groupHeight : insetY;
  const textX = groupX + (logo ? size + (text ? gap : 0) : 0);

  if (logo) {
    const logoImage = await loadImage(logo);
    drawContainedImage(context, logoImage, groupX, groupY, size);
  }

  if (text) {
    context.save();
    context.font = `700 ${fontSize}px Arial, sans-serif`;
    context.textBaseline = "middle";
    context.textAlign = "left";
    context.fillStyle = "#182033";
    context.fillText(text, textX, groupY + groupHeight / 2, maxTextWidth);
    context.restore();
  }
  return canvas;
}
