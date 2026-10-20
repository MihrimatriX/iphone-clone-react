import { motion, useSpring, type HTMLMotionProps } from "motion/react";
import { useMemo, useRef, type PointerEvent } from "react";
import s from "./Glass.module.css";
import { cx } from "../lib/util";
import { token } from "./motion";

type GlassProps = HTMLMotionProps<"button"> & {
  variant?: "regular" | "clear";
  shape?: "pill" | "rounded" | "circle";
  interactive?: boolean;
};

/** `backdrop-filter: url(#svg)` only renders in Chromium; Safari parses it but draws nothing. */
export const refractionSupported =
  typeof CSS !== "undefined" && CSS.supports("backdrop-filter", "url(#lg)") && /Chrome\//.test(navigator.userAgent);

/** The single Liquid Glass surface used across the OS. */
export function Glass(props: GlassProps) {
  const { variant = "regular", shape = "rounded", interactive = false, className = "", ...rest } = props;
  const Tag = (interactive ? motion.button : motion.div) as typeof motion.button;
  const jelly = useJelly(interactive);
  const classes = cx(s.glass, s[variant], s[shape], interactive && s.interactive, className);
  return (
    <Tag
      {...(interactive ? { type: "button", whileTap: { scale: 0.96 } } : {})}
      {...jelly.handlers}
      {...rest}
      className={classes}
      // Jelly motion values only on buttons, so static glass can still animate its own x/y.
      style={interactive ? { x: jelly.x, y: jelly.y, scaleX: jelly.sx, scaleY: jelly.sy, ...rest.style } : rest.style}
    />
  );
}

const JELLY_DEAD_ZONE = 8;
const deadZone = (d: number) => Math.sign(d) * Math.max(0, Math.abs(d) - JELLY_DEAD_ZONE);

/** Spring-driven "jelly" stretch toward the finger while pressed. Capture-phase so callers keep their own handlers. */
function useJelly(enabled: boolean) {
  const x = useSpring(0);
  const y = useSpring(0);
  const sx = useSpring(1);
  const sy = useSpring(1);
  const start = useRef<{ x: number; y: number } | null>(null);
  const release = () => {
    start.current = null;
    x.set(0);
    y.set(0);
    sx.set(1);
    sy.set(1);
  };
  const handlers = enabled
    ? {
        onPointerDownCapture: (e: PointerEvent) => (start.current = { x: e.clientX, y: e.clientY }),
        onPointerMoveCapture: (e: PointerEvent) => {
          if (!start.current) return;
          // Dead zone: a click's few px of mouse wobble must not move the button.
          const dx = deadZone(e.clientX - start.current.x);
          const dy = deadZone(e.clientY - start.current.y);
          const follow = token("--jelly-follow");
          const stretch = token("--jelly-stretch");
          x.set(dx * follow);
          y.set(dy * follow);
          sx.set(1 + Math.min(Math.abs(dx), 80) * stretch - Math.min(Math.abs(dy), 80) * stretch * 0.5);
          sy.set(1 + Math.min(Math.abs(dy), 80) * stretch - Math.min(Math.abs(dx), 80) * stretch * 0.5);
        },
        onPointerUpCapture: release,
        onPointerCancelCapture: release,
        onPointerLeave: release,
      }
    : {};
  return { x, y, sx, sy, handlers };
}

/** -1..1 push: strongest at the edges, zero across the middle band. */
function edgePush(t: number, band: number) {
  const distance = Math.min(t, 1 - t);
  if (distance >= band) return 0;
  const k = 1 - distance / band;
  return Math.sign(t - 0.5) * k * k;
}

/** Displacement map for feDisplacementMap: R = x push, G = y push, 128 = none. */
function displacementMap(size = 96, band = 0.3): string {
  const canvas = document.createElement("canvas");
  canvas.width = canvas.height = size;
  const ctx = canvas.getContext("2d");
  if (!ctx) return "";
  const img = ctx.createImageData(size, size);
  for (let py = 0; py < size; py++) {
    for (let px = 0; px < size; px++) {
      const i = (py * size + px) * 4;
      img.data[i] = 128 + edgePush(px / (size - 1), band) * 127;
      img.data[i + 1] = 128 + edgePush(py / (size - 1), band) * 127;
      img.data[i + 2] = 128;
      img.data[i + 3] = 255;
    }
  }
  ctx.putImageData(img, 0, 0);
  return canvas.toDataURL();
}

/** SVG filter referenced by `backdrop-filter: url(#lg)`. Render once per screen. */
export function GlassDefs() {
  const map = useMemo(() => displacementMap(), []);
  return (
    <svg className={s.defs} aria-hidden="true">
      <filter id="lg" x="0" y="0" width="1" height="1" primitiveUnits="objectBoundingBox" colorInterpolationFilters="sRGB">
        <feImage href={map} x="0" y="0" width="1" height="1" preserveAspectRatio="none" result="map" />
        <feDisplacementMap
          in="SourceGraphic"
          in2="map"
          scale={token("--glass-refract")}
          xChannelSelector="R"
          yChannelSelector="G"
        />
      </filter>
    </svg>
  );
}
