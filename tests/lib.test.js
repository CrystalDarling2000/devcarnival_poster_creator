import test from "node:test";
import assert from "node:assert/strict";
import { slugify, normalizeQrText } from "../src/lib/text.js";
import { placeImage } from "../src/lib/geometry.js";

test("slugify keeps letters from any script and can return empty", () => {
  assert.equal(slugify("AI Geeks Chennai!"), "ai-geeks-chennai");
  assert.equal(slugify("  --  "), "");
  assert.ok(slugify("தமிழ் சமூகம்").length > 0);
  assert.ok(slugify("x".repeat(100)).length <= 40);
});

test("normalizeQrText adds https only to bare domains", () => {
  assert.equal(normalizeQrText(" devcarnival.io "), "https://devcarnival.io");
  assert.equal(normalizeQrText("https://x.dev/a?b=1"), "https://x.dev/a?b=1");
  assert.equal(normalizeQrText("mailto:hi@x.dev"), "mailto:hi@x.dev");
  assert.equal(normalizeQrText("Join our group"), "Join our group");
  assert.equal(normalizeQrText("localhost:3000"), "https://localhost:3000");
  assert.equal(normalizeQrText("   "), "");
});

test("placeImage contains, scales and aligns inside the box", () => {
  const box = { x: 100, y: 100, width: 200, height: 100 };
  assert.deepEqual(placeImage({ imgW: 400, imgH: 400, box }), { x: 150, y: 100, width: 100, height: 100 });
  assert.deepEqual(placeImage({ imgW: 400, imgH: 400, box, size: 0.5, ax: 0, ay: 0 }), { x: 100, y: 100, width: 50, height: 50 });
  assert.deepEqual(placeImage({ imgW: 400, imgH: 400, box, size: 0.5, ax: 1, ay: 1 }), { x: 250, y: 150, width: 50, height: 50 });
  assert.deepEqual(placeImage({ imgW: 800, imgH: 200, box }), { x: 100, y: 125, width: 200, height: 50 });
});

test("fitLine shrinks first, then truncates with an ellipsis", async () => {
  const { fitLine } = await import("../src/lib/text.js");
  const at = (s, size) => s.length * size;
  const spec = { maxWidth: 400, maxSize: 40, minSize: 20 };
  assert.deepEqual(fitLine(at, "Short", spec), { size: 40, text: "Short" });
  assert.equal(fitLine(at, "x".repeat(15), spec).size, 26);
  const cut = fitLine(at, "x".repeat(60), spec);
  assert.equal(cut.size, 20);
  assert.ok(cut.text.endsWith("…") && at(cut.text, 20) <= 400);
});
