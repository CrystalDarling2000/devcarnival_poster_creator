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
  // Optional community name: below the logo (one line) or beside it, left or
  // right (up to two lines). Sizes are the 100% values; the size slider scales them.
  name: {
    color: "#14123a",
    below: { gap: 6, maxSize: 30, minSize: 18 },
    side: { gap: 26, maxSize: 38, minSize: 18, maxLines: 2, maxWidth: 300, lineHeight: 1.2 },
  },
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

// position: "below" | "left" | "right". ax aligns a name below the logo (0 left,
// 0.5 centre, 1 right); ay aligns a name beside it (0 top, 0.5 middle, 1 bottom).
export const DEFAULT_NAME_STYLE = { position: "below", ax: 0.5, ay: 0.5, size: 1 };
