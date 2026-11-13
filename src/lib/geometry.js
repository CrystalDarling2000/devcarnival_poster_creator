// Place an image inside a box: scaled to fit ("contain"), shrunk by `size`
// (0-1) and aligned with ax / ay (0 = left / top, 0.5 = centre, 1 = right / bottom).
export function placeImage({ imgW, imgH, box, size = 1, ax = 0.5, ay = 0.5 }) {
  const scale = Math.min(box.width / imgW, box.height / imgH) * size;
  const width = imgW * scale;
  const height = imgH * scale;
  return {
    x: box.x + (box.width - width) * ax,
    y: box.y + (box.height - height) * ay,
    width,
    height,
  };
}
