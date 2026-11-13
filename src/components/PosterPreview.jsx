import { useEffect, useRef } from "react";
import { TEMPLATE } from "../config/poster";
import { renderPoster } from "../lib/renderPoster";

export default function PosterPreview({ template, logo, align, qr, name, label }) {
  const canvasRef = useRef(null);
  useEffect(() => {
    if (canvasRef.current) renderPoster(canvasRef.current, { template, logo, align, qr, name, placeholders: true });
  }, [template, logo, align, qr, name]);
  return (
    <canvas
      ref={canvasRef}
      className="poster-canvas"
      width={TEMPLATE.width}
      height={TEMPLATE.height}
      role="img"
      aria-label={label}
    />
  );
}
