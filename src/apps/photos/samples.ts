import { savePhoto } from "../../lib/storage";

const SIZE = { w: 1080, h: 1440 };
const PALETTES = [
  ["#ff9a8b", "#ff6a88", "#ff99ac"],
  ["#21d4fd", "#b721ff", "#3a1c71"],
  ["#08aeea", "#2af598", "#f9f586"],
  ["#fa8bff", "#2bd2ff", "#2bff88"],
  ["#ffcc70", "#c850c0", "#4158d0"],
  ["#0f2027", "#2c5364", "#ffd194"],
];

/** Abstract gradient "photo": a mesh of soft radial blobs plus a horizon line. */
function paint(colors: string[], seed: number): Promise<Blob | null> {
  const canvas = document.createElement("canvas");
  canvas.width = SIZE.w;
  canvas.height = SIZE.h;
  const ctx = canvas.getContext("2d");
  if (!ctx) return Promise.resolve(null);
  ctx.fillStyle = colors[2] ?? "#000";
  ctx.fillRect(0, 0, SIZE.w, SIZE.h);
  colors.forEach((color, i) => {
    const x = SIZE.w * (0.2 + ((seed * 37 + i * 53) % 60) / 100);
    const y = SIZE.h * (0.15 + ((seed * 23 + i * 41) % 70) / 100);
    const blob = ctx.createRadialGradient(x, y, 0, x, y, SIZE.w * 0.8);
    blob.addColorStop(0, color);
    blob.addColorStop(1, "transparent");
    ctx.fillStyle = blob;
    ctx.fillRect(0, 0, SIZE.w, SIZE.h);
  });
  ctx.fillStyle = "rgba(0,0,0,0.18)";
  ctx.fillRect(0, SIZE.h * 0.72, SIZE.w, SIZE.h * 0.28);
  return new Promise(resolve => canvas.toBlob(resolve, "image/jpeg", 0.85));
}

/** Seeds the library with generated sample photos (spaced a day apart). */
export async function addSamplePhotos() {
  const day = 86_400_000;
  for (const [i, colors] of PALETTES.entries()) {
    const blob = await paint(colors, i + 1);
    if (blob) await savePhoto(blob, Date.now() - (i + 1) * day);
  }
}
