// Everything that depends on the artwork lives here. Coordinates are pixels of
// the 1254 x 1254 Dev Carnival template, measured from the artwork itself.
import templateUrl from "../assets/dev-carnival-template.png";

export const TEMPLATE = {
  url: templateUrl,
  width: 1254,
  height: 1254,
  // Wide area at the top-left where the community logo is placed.
  // The box keeps the same size whether or not the name is printed, so the
  // logo never shrinks; with a name it simply moves up (yWithName) to leave
  // room underneath.
  logoBox: { x: 70, y: 50, width: 780, height: 250, yWithName: 22 },
  // Optional community name printed directly under the logo.
  name: { gap: 6, maxSize: 30, minSize: 18, color: "#14123a" },
  // Thin vertical rule between the community logo and the Dev Carnival logo.
  divider: { x: 877, y1: 82, y2: 294, width: 3, color: "#1b1550" },
  // Caption printed between the two dashes under the Dev Carnival logo.
  partner: { text: "COMMUNITY PARTNER", cx: 1036, cy: 292, size: 14, color: "#1b1550" },
  // The white rounded square printed on the artwork; the QR code is drawn inside it.
  qrSlot: { x: 851, y: 427, width: 322, height: 313, radius: 34, padding: 20 },
};

export const LIMITS = {
  nameMax: 60,
  imageMaxBytes: 8 * 1024 * 1024,
  imageTypes: ["image/png", "image/jpeg", "image/webp"],
  imageAccept: "image/png,image/jpeg,image/webp",
};

export const DEFAULT_ALIGNMENT = { ax: 0.5, ay: 0.5, size: 1 };
