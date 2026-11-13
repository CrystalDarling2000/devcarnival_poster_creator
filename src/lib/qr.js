import QRCode from "qrcode";
import { loadImageUrl } from "./images";

// Dark modules on white with a one-module quiet zone; the poster's white square
// adds the rest.
export async function createQrImage(text) {
  const url = await QRCode.toDataURL(text, {
    errorCorrectionLevel: "M",
    margin: 1,
    width: 720,
    color: { dark: "#0d0b2e", light: "#ffffff" },
  });
  return loadImageUrl(url);
}
