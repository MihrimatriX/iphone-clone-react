import { CanvasTexture, NoColorSpace, RepeatWrapping, SRGBColorSpace } from "three";

/** Small seeded PRNG so procedural textures are the same on every load. */
export function mulberry32(seed: number) {
  let a = seed;
  return () => {
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** Paints a w×h canvas and wraps it as an sRGB texture. */
export function paint(w: number, h: number, draw: (ctx: CanvasRenderingContext2D) => void): CanvasTexture {
  const canvas = document.createElement("canvas");
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext("2d");
  if (ctx) draw(ctx);
  const texture = new CanvasTexture(canvas);
  texture.colorSpace = SRGBColorSpace;
  texture.anisotropy = 8;
  return texture;
}

/** Soft round halo for additive sprites: a cheap stand-in for bloom around small bright bulbs. */
export function glowTexture(): CanvasTexture {
  const size = 128;
  return paint(size, size, ctx => {
    const g = ctx.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2);
    g.addColorStop(0, "rgba(255,255,255,1)");
    g.addColorStop(0.2, "rgba(255,255,255,0.45)");
    g.addColorStop(1, "rgba(255,255,255,0)");
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, size, size);
  });
}

/**
 * Wall poster, 2:3 like the frame's 51×76 cm artwork: a soft orb in the phone wallpaper's colours over
 * near-black, with a short line of type. flipY off to match glTF UVs.
 */
export function posterTexture(): CanvasTexture {
  const [w, h] = [683, 1024];
  const texture = paint(w, h, ctx => {
    ctx.fillStyle = "#0d0c12";
    ctx.fillRect(0, 0, w, h);
    for (const [x, y, r, color] of [[0.62, 0.34, 0.5, "#7b3fe4"], [0.3, 0.48, 0.42, "#e0457b"], [0.7, 0.58, 0.36, "#1fb5b5"]] as const) {
      const g = ctx.createRadialGradient(x * w, y * h, 0, x * w, y * h, r * w);
      g.addColorStop(0, color);
      g.addColorStop(1, "rgba(13,12,18,0)");
      ctx.globalCompositeOperation = "lighter";
      ctx.fillStyle = g;
      ctx.fillRect(0, 0, w, h);
    }
    ctx.globalCompositeOperation = "source-over";
    ctx.fillStyle = "#f2eee8";
    ctx.font = "300 64px 'Segoe UI', Inter, system-ui, sans-serif";
    ["Geceler uzun,", "fikirler parlak."].forEach((line, i) => ctx.fillText(line, 56, h - 170 + i * 76));
    ctx.font = "600 22px 'Segoe UI', Inter, system-ui, sans-serif";
    ctx.fillStyle = "rgba(242,238,232,0.55)";
    ctx.fillText("AFU · 2026", 58, 84);
  });
  texture.flipY = false;
  return texture;
}

/** Seamless fractal value noise (grey data, tiles both ways): drives the coffee steam's shape and drift. */
export function noiseTexture(): CanvasTexture {
  const size = 256;
  const rand = mulberry32(3);
  const octaves = [8, 16, 32].map(cells => ({ cells, grid: Array.from({ length: cells * cells }, () => rand()) }));
  const smooth = (t: number) => t * t * (3 - 2 * t);
  const texture = paint(size, size, ctx => {
    const img = ctx.createImageData(size, size);
    for (let y = 0; y < size; y++) {
      for (let x = 0; x < size; x++) {
        let v = 0;
        let amp = 0.52;
        for (const { cells, grid } of octaves) {
          const [fx, fy] = [(x / size) * cells, (y / size) * cells];
          const [x0, y0] = [Math.floor(fx), Math.floor(fy)];
          const at = (i: number, j: number) => grid[(j % cells) * cells + (i % cells)] ?? 0;
          const [tx, ty] = [smooth(fx - x0), smooth(fy - y0)];
          const top = at(x0, y0) + (at(x0 + 1, y0) - at(x0, y0)) * tx;
          const bottom = at(x0, y0 + 1) + (at(x0 + 1, y0 + 1) - at(x0, y0 + 1)) * tx;
          v += (top + (bottom - top) * ty) * amp;
          amp /= 2;
        }
        const i = (y * size + x) * 4;
        img.data[i] = img.data[i + 1] = img.data[i + 2] = Math.min(255, (v / 0.91) * 255);
        img.data[i + 3] = 255;
      }
    }
    ctx.putImageData(img, 0, 0);
  });
  texture.wrapS = texture.wrapT = RepeatWrapping;
  texture.colorSpace = NoColorSpace;
  return texture;
}
