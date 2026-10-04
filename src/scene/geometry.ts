import { CustomBlending, OneFactor, Shape, ZeroFactor } from "three";

/** World units ≈ cm, sized to the iPhone 15 Pro Max model. Its display is 19.5:9 and maps 1:1 onto the 390×844 logical px DOM screen. */
export const PHONE = { w: 7.57, h: 15.85, d: 0.826 };
export const SCREEN = { w: 7.128, h: (7.128 * 844) / 390, radius: (55 * 7.128) / 390 };
export const PX = SCREEN.w / 390;

/** Rounded rectangle outline centred on the origin, for <shapeGeometry args={[shape, segments]} />. */
export function roundedRect(w: number, h: number, r: number): Shape {
  const s = new Shape();
  const x = -w / 2;
  const y = -h / 2;
  s.moveTo(x + r, y);
  s.lineTo(x + w - r, y);
  s.quadraticCurveTo(x + w, y, x + w, y + r);
  s.lineTo(x + w, y + h - r);
  s.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
  s.lineTo(x + r, y + h);
  s.quadraticCurveTo(x, y + h, x, y + h - r);
  s.lineTo(x, y + r);
  s.quadraticCurveTo(x, y, x + r, y);
  return s;
}

/** RoundedBox caps its radius at depth/2; stretching depth then scaling z back gives a big corner with a tight edge. */
export function roundedSlab(w: number, h: number, depth: number, corner: number, edge: number) {
  return {
    args: [w, h, (depth * corner) / edge] as [number, number, number],
    radius: corner,
    scale: [1, 1, edge / corner] as [number, number, number],
  };
}

/** Class on the screen's DOM wrapper, so stage-level handlers can tell a tap on the screen from one on the scene. */
export const SCREEN_LAYER = "phone-screen";

/**
 * Material props for glass that only adds reflections: colour is summed onto what's behind, alpha is left
 * untouched. Plain AdditiveBlending also writes alpha, which would turn the screen's see-through hole opaque black.
 */
export const REFLECTION_ONLY = {
  transparent: true,
  depthWrite: false,
  blending: CustomBlending,
  blendSrc: OneFactor,
  blendDst: OneFactor,
  blendSrcAlpha: ZeroFactor,
  blendDstAlpha: OneFactor,
} as const;
