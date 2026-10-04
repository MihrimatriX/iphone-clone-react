import { NoColorSpace, RepeatWrapping, type CanvasTexture } from "three";
import { mulberry32, paint } from "./textures";

/** Speckled stoneware glaze: warm cream with iron flecks, like a hand-thrown mug. Tiles around the lathe. */
export function glazeTexture(): CanvasTexture {
  const size = 512;
  const rand = mulberry32(21);
  const texture = paint(size, size, ctx => {
    ctx.fillStyle = "#e4dccd";
    ctx.fillRect(0, 0, size, size);
    for (let i = 0; i < 700; i++) {
      const dark = rand() < 0.8;
      ctx.fillStyle = dark ? `rgba(74,52,36,${0.2 + rand() * 0.4})` : `rgba(255,252,244,${0.3 + rand() * 0.4})`;
      ctx.beginPath();
      ctx.arc(rand() * size, rand() * size, 0.4 + rand() * (dark ? 1.1 : 1.8), 0, Math.PI * 2);
      ctx.fill();
    }
  });
  texture.wrapS = texture.wrapT = RepeatWrapping;
  return texture;
}

/** Coffee seen from above: dark centre, caramel crema toward the rim, a ring of fine foam bubbles. */
export function cremaTexture(): CanvasTexture {
  const size = 512;
  const c = size / 2;
  const rand = mulberry32(5);
  return paint(size, size, ctx => {
    const g = ctx.createRadialGradient(c, c, 0, c, c, c);
    for (const [at, color] of [[0, "#24130a"], [0.45, "#3b2010"], [0.78, "#6e4524"], [0.93, "#9c7146"], [1, "#4a2c16"]] as const) {
      g.addColorStop(at, color);
    }
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, size, size);
    for (let i = 0; i < 700; i++) {
      const a = rand() * Math.PI * 2;
      const r = c * (0.7 + rand() * 0.27);
      ctx.strokeStyle = `rgba(214,176,128,${0.15 + rand() * 0.35})`;
      ctx.lineWidth = 0.8;
      ctx.beginPath();
      ctx.arc(c + Math.cos(a) * r, c + Math.sin(a) * r, 0.8 + rand() * 2.4, 0, Math.PI * 2);
      ctx.stroke();
    }
  });
}

/** Pebbled leather grain (grey data): darkens the cover colour slightly and doubles as its bump map. */
export function leatherTexture(): CanvasTexture {
  const size = 512;
  const rand = mulberry32(13);
  const texture = paint(size, size, ctx => {
    ctx.fillStyle = "#d0d0d0";
    ctx.fillRect(0, 0, size, size);
    for (let i = 0; i < 9000; i++) {
      ctx.fillStyle = `rgba(0,0,0,${0.06 + rand() * 0.16})`;
      ctx.beginPath();
      ctx.ellipse(rand() * size, rand() * size, 0.8 + rand() * 2.2, 0.6 + rand() * 1.6, rand() * Math.PI, 0, Math.PI * 2);
      ctx.fill();
    }
  });
  texture.wrapS = texture.wrapT = RepeatWrapping;
  texture.colorSpace = NoColorSpace;
  return texture;
}

/** The page block's edge: hundreds of thin cream sheets, each a slightly different shade. */
export function pagesTexture(): CanvasTexture {
  const [w, h] = [32, 512];
  const rand = mulberry32(17);
  return paint(w, h, ctx => {
    for (let y = 0; y < h; y += 2) {
      const tone = 214 + Math.floor(rand() * 26);
      ctx.fillStyle = `rgb(${tone},${tone - 8},${tone - 26})`;
      ctx.fillRect(0, y, w, 2);
    }
  });
}
