function loadImage(src) {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.onload = () => resolve(image);
    image.onerror = () => reject(new Error("An image could not be loaded for the poster."));
    image.src = src;
  });
}

function drawCover(context, image, x, y, width, height, zoom = 1, offsetX = 0, offsetY = 0) {
  const scale = Math.max(width / image.width, height / image.height) * zoom;
  const drawWidth = image.width * scale;
  const drawHeight = image.height * scale;
  const left = x + (width - drawWidth) / 2 + offsetX * width;
  const top = y + (height - drawHeight) / 2 + offsetY * height;
  context.save();
  context.beginPath();
  context.rect(x, y, width, height);
  context.clip();
  context.drawImage(image, left, top, drawWidth, drawHeight);
  context.restore();
}

function drawContain(context, image, x, y, width, height) {
  const scale = Math.min(width / image.width, height / image.height);
  const drawWidth = image.width * scale;
  const drawHeight = image.height * scale;
  context.drawImage(image, x + (width - drawWidth) / 2, y + (height - drawHeight) / 2, drawWidth, drawHeight);
}

function drawWrappedText(context, text, x, y, maxWidth, lineHeight, maxLines) {
  const words = text.trim().split(/\s+/).filter(Boolean);
  let line = "";
  let lineNumber = 0;
  for (const word of words) {
    const candidate = line ? `${line} ${word}` : word;
    if (context.measureText(candidate).width > maxWidth && line) {
      context.fillText(line, x, y + lineNumber * lineHeight);
      lineNumber += 1;
      line = word;
      if (lineNumber >= maxLines - 1) break;
    } else {
      line = candidate;
    }
  }
  if (line && lineNumber < maxLines) {
    let finalLine = line;
    if (lineNumber === maxLines - 1 && words.length > 1) {
      while (context.measureText(`${finalLine}…`).width > maxWidth && finalLine.length > 1) {
        finalLine = finalLine.slice(0, -1);
      }
      if (words.join(" ") !== finalLine) finalLine = `${finalLine}…`;
    }
    context.fillText(finalLine, x, y + lineNumber * lineHeight);
  }
}

export async function renderPoster(canvas, template, category, values) {
  if (!canvas || !template?.image) throw new Error("A valid template and canvas are required.");
  const width = Number(template.originalWidth) || 1080;
  const height = Number(template.originalHeight) || 1350;
  canvas.width = width;
  canvas.height = height;
  const context = canvas.getContext("2d");
  if (!context) throw new Error("Canvas rendering is unavailable in this browser.");
  const background = await loadImage(template.image);
  context.clearRect(0, 0, width, height);
  context.drawImage(background, 0, 0, width, height);
  const fields = template.editableFields || {};

  if (category === "collaboration") {
    const logoField = fields.communityLogo;
    if (logoField?.enabled && values.logo) {
      const logo = await loadImage(values.logo);
      context.save();
      context.beginPath();
      context.roundRect(logoField.x * width, logoField.y * height, logoField.width * width, logoField.height * height, 18);
      context.clip();
      drawContain(context, logo, logoField.x * width, logoField.y * height, logoField.width * width, logoField.height * height);
      context.restore();
    }
    const nameField = fields.communityName;
    if (nameField?.enabled && values.name?.trim()) {
      context.fillStyle = "#182033";
      context.font = `700 ${Math.round(height * 0.033)}px Arial, sans-serif`;
      context.textBaseline = "top";
      drawWrappedText(context, values.name, nameField.x * width, nameField.y * height, nameField.maxWidth * width, height * 0.04, 2);
    }
  } else if (category === "attendee") {
    const photoField = fields.attendeePhoto;
    if (photoField?.enabled && values.photo) {
      const photo = await loadImage(values.photo);
      const x = photoField.x * width;
      const y = photoField.y * height;
      const boxWidth = photoField.width * width;
      const boxHeight = photoField.height * height;
      context.save();
      context.beginPath();
      context.ellipse(x + boxWidth / 2, y + boxHeight / 2, boxWidth / 2, boxHeight / 2, 0, 0, Math.PI * 2);
      context.clip();
      drawCover(context, photo, x, y, boxWidth, boxHeight, values.zoom || 1, values.offsetX || 0, values.offsetY || 0);
      context.restore();
    }
    const nameField = fields.attendeeName;
    if (nameField?.enabled && values.name?.trim()) {
      context.fillStyle = "#182033";
      context.textAlign = "center";
      context.font = `700 ${Math.round(height * 0.035)}px Arial, sans-serif`;
      context.textBaseline = "top";
      drawWrappedText(context, values.name, (nameField.x + nameField.maxWidth / 2) * width, nameField.y * height, nameField.maxWidth * width, height * 0.04, 2);
      context.textAlign = "start";
    }
  } else if (category === "leads") {
    const photoField = fields.leadPhoto;
    if (photoField?.enabled && values.photo) {
      const photo = await loadImage(values.photo);
      const x = photoField.x * width;
      const y = photoField.y * height;
      const boxWidth = photoField.width * width;
      const boxHeight = photoField.height * height;
      context.save();
      context.beginPath();
      context.roundRect(x, y, boxWidth, boxHeight, 24);
      context.clip();
      drawCover(context, photo, x, y, boxWidth, boxHeight, values.zoom || 1, values.offsetX || 0, values.offsetY || 0);
      context.restore();
    }
    const nameField = fields.communityName;
    if (nameField?.enabled && values.name?.trim()) {
      context.fillStyle = "#182033";
      context.font = `700 ${Math.round(height * 0.039)}px Arial, sans-serif`;
      context.textBaseline = "top";
      drawWrappedText(context, values.name, nameField.x * width, nameField.y * height, nameField.maxWidth * width, height * 0.045, 2);
    }
    const descriptionField = fields.communityDescription;
    if (descriptionField?.enabled && values.description?.trim()) {
      context.fillStyle = "#526075";
      context.font = `400 ${Math.round(height * 0.021)}px Arial, sans-serif`;
      context.textBaseline = "top";
      drawWrappedText(context, values.description, descriptionField.x * width, descriptionField.y * height, descriptionField.maxWidth * width, height * 0.031, Math.max(1, Math.floor(descriptionField.maxHeight * height / (height * 0.031))));
    }
  }
}
