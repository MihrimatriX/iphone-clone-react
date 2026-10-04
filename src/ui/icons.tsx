import type { CSSProperties } from "react";

/** Circle as a path segment, so every glyph stays a single `d` string. */
const o = (cx: number, cy: number, r: number) => `M${cx - r} ${cy}a${r} ${r} 0 1 0 ${2 * r} 0a${r} ${r} 0 1 0 ${-2 * r} 0`;

const cloud = "M7 17a4 4 0 0 1-.5-8A6 6 0 0 1 18 8a4.5 4.5 0 0 1-.5 9z";
const bell = "M6 16v-5a6 6 0 0 1 12 0v5l2 2H4zM10 21h4";
const handset = "M5 3.5h3.5l2 5L8 10a11 11 0 0 0 6 6l1.5-2.5 5 2V19a2 2 0 0 1-2 2A16.5 16.5 0 0 1 3 5.5a2 2 0 0 1 2-2z";

/** Original 24×24 glyphs. Stroke icons by default; `fill` ones are solid. */
const GLYPHS = {
  wifi: { d: "M2.5 9a14 14 0 0 1 19 0M5.5 12.5a9.5 9.5 0 0 1 13 0M8.7 16a5 5 0 0 1 6.6 0M12 19.5h.01" },
  bluetooth: { d: "M7 7l10 10-5 4.5V2.5L17 7 7 17" },
  airplane: {
    d: "M12 2c.8 0 1.4.7 1.4 1.5V9l7.6 4.8v2L13.4 13.5V18l2 1.5V21L12 20l-3.4 1v-1.5l2-1.5v-4.5L3 15.8v-2L10.6 9V3.5C10.6 2.7 11.2 2 12 2z",
    fill: true,
  },
  moon: { d: "M20 14.5A8.5 8.5 0 1 1 9.5 4a7 7 0 0 0 10.5 10.5z", fill: true },
  sun: { d: `${o(12, 12, 4.5)}M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4` },
  flashlight: { d: "M8 2h8v4l-2 4v11a1 1 0 0 1-1 1h-2a1 1 0 0 1-1-1V10L8 6zM8 6h8M12 13v2" },
  camera: { d: `M3 8a2 2 0 0 1 2-2h2.5L9 4h6l1.5 2H19a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z${o(12, 13, 3.5)}` },
  bell: { d: bell },
  bellSlash: { d: `${bell}M3 3l18 18` },
  search: { d: `${o(10.5, 10.5, 6.5)}M15.5 15.5L21 21` },
  chevronLeft: { d: "M15 4l-8 8 8 8" },
  chevronRight: { d: "M9 4l8 8-8 8" },
  plus: { d: "M12 5v14M5 12h14" },
  xmark: { d: "M6 6l12 12M18 6L6 18" },
  check: { d: "M5 12.5l4.5 4.5L19 7" },
  trash: { d: "M4 7h16M9 7V4h6v3M6 7l1 13h10l1-13M10 11v6M14 11v6" },
  compose: { d: "M12 4H6a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-6M18.5 3.5l2 2L13 13l-3 1 1-3z" },
  share: { d: "M12 3v12M8 7l4-4 4 4M5 12v7a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-7" },
  tabs: { d: "M8 8h11v11H8zM5 16V5h11" },
  globe: { d: `${o(12, 12, 9)}M3 12h18M12 3c3 3.5 3 14.5 0 18M12 3c-3 3.5-3 14.5 0 18` },
  speaker: { d: "M4 9h4l5-4v14l-5-4H4zM16.5 8.5a5 5 0 0 1 0 7M19 6a8.5 8.5 0 0 1 0 12" },
  speakerSlash: { d: "M4 9h4l5-4v14l-5-4H4zM17 9l5 6M22 9l-5 6" },
  keypad: { d: [5, 12, 19].flatMap(y => [6, 12, 18].map(x => o(x, y, 1.6))).join(""), fill: true },
  clock: { d: `${o(12, 12, 9)}M12 7v5l3 2` },
  alarm: { d: `${o(12, 13, 8)}M12 9v4l2.5 1.5M5 3L2 6M19 3l3 3` },
  timer: { d: `${o(12, 13.5, 8)}M12 9.5v4l2.5 1.5M9.5 2.5h5` },
  stopwatch: { d: `${o(12, 13.5, 8)}M12 13.5V9M9.5 2.5h5M18.5 6l1.5-1.5` },
  person: { d: `${o(12, 8, 4)}M4 21a8 8 0 0 1 16 0` },
  star: { d: "M12 3l2.7 5.6 6.1.9-4.4 4.3 1 6.1L12 17l-5.4 2.9 1-6.1-4.4-4.3 6.1-.9z" },
  location: { d: `M12 21s7-6.2 7-11.5A7 7 0 0 0 5 9.5C5 14.8 12 21 12 21z${o(12, 9.5, 2.5)}` },
  lock: { d: "M6 11h12v10H6zM8.5 11V8a3.5 3.5 0 0 1 7 0v3" },
  faceid: {
    d: "M3 8V5a2 2 0 0 1 2-2h3M16 3h3a2 2 0 0 1 2 2v3M21 16v3a2 2 0 0 1-2 2h-3M8 21H5a2 2 0 0 1-2-2v-3M9 9v1.5M15 9v1.5M12 9v4h-1M9 16c1.7 1.3 4.3 1.3 6 0",
  },
  refresh: { d: "M4 12a8 8 0 0 1 14-5.3M20 12a8 8 0 0 1-14 5.3M18 3v4h-4M6 21v-4h4" },
  photo: { d: "M3 5h18v14H3zM3 16l5-5 4 4 3-3 6 6M15.5 8.5h.01" },
  note: { d: "M5 3h14v18H5zM8 8h8M8 12h8M8 16h5" },
  music: { d: `M9 18V5l11-2v13${o(6, 18, 3)}${o(17, 16, 3)}` },
  gear: { d: `${o(12, 12, 3)}${o(12, 12, 7.5)}M12 1.5v3M12 19.5v3M1.5 12h3M19.5 12h3M4.6 4.6l2.1 2.1M17.3 17.3l2.1 2.1M4.6 19.4l2.1-2.1M17.3 6.7l2.1-2.1` },
  message: { d: "M12 4c5 0 9 3.1 9 7s-4 7-9 7c-1 0-2-.1-2.9-.4L5 19.5l1.2-3.6C4.2 14.6 3 12.9 3 11c0-3.9 4-7 9-7z", fill: true },
  phone: { d: handset, fill: true },
  calculator: { d: "M6 2h12a2 2 0 0 1 2 2v16a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2zM8 6h8v4H8zM8 14h.01M12 14h.01M16 14h.01M8 18h.01M12 18h.01M16 18h.01" },
  compass: { d: `${o(12, 12, 9)}M15.5 8.5l-2 5-5 2 2-5z` },
  cloud: { d: cloud },
  sunCloud: { d: `M8 3v1M3.5 5.5l.7.7M2 10h1M12.5 5.5l-.7.7M5.3 11.5A3 3 0 0 1 10.6 8M9 20a3.5 3.5 0 0 1-.4-7A5 5 0 0 1 18 12a4 4 0 0 1-.5 8z` },
  rain: { d: `M7 15a4 4 0 0 1-.5-8A6 6 0 0 1 18 6a4.5 4.5 0 0 1-.5 9zM8 18l-1 3M12 18l-1 3M16 18l-1 3` },
  snow: { d: `M7 15a4 4 0 0 1-.5-8A6 6 0 0 1 18 6a4.5 4.5 0 0 1-.5 9zM8 19h.01M12 21h.01M16 19h.01` },
  bolt: { d: "M13 2L4 14h7l-1 8 9-12h-7z", fill: true },
  fog: { d: "M4 9h16M2 13h20M5 17h14" },
  play: { d: "M7 4.5v15a1 1 0 0 0 1.5.9l12-7.5a1 1 0 0 0 0-1.8l-12-7.5A1 1 0 0 0 7 4.5z", fill: true },
  pause: { d: "M6 4h4v16H6zM14 4h4v16h-4z", fill: true },
  next: { d: "M3 5v14l9-7zM12 5v14l9-7z", fill: true },
  prev: { d: "M21 5v14l-9-7zM12 5v14l-9-7z", fill: true },
  stop: { d: "M6 6h12v12H6z", fill: true },
  mic: { d: "M9 5a3 3 0 0 1 6 0v6a3 3 0 0 1-6 0zM5 11a7 7 0 0 0 14 0M12 18v3" },
  arrowUp: { d: "M12 19V5M5 12l7-7 7 7" },
  reload: { d: "M20 12a8 8 0 1 1-2.3-5.7M20 4v5h-5" },
  book: { d: "M5 4h11a3 3 0 0 1 3 3v13H8a3 3 0 0 1-3-3zM5 17a3 3 0 0 1 3-3h11" },
  calendar: { d: "M4 5h16v16H4zM4 10h16M8 3v4M16 3v4" },
  palette: { d: "M12 3a9 9 0 0 0 0 18c1 0 1.5-.7 1.5-1.5 0-1-.8-1.5-.8-2.5 0-.8.7-1.5 1.5-1.5H17a4 4 0 0 0 4-4c0-4.7-4-8.5-9-8.5zM7.5 11h.01M10 7h.01M15 7h.01" },
  hand: { d: "M9 11V5a2 2 0 0 1 4 0v5l4 .8a2 2 0 0 1 1.6 2.3L18 18a3 3 0 0 1-3 3h-3.5a3 3 0 0 1-2.4-1.2L5.5 15a1.5 1.5 0 0 1 2.3-1.9L9 14.5" },
  textSize: { d: "M3 19l5-13 5 13M4.8 14.5h6.4M14 19l3.5-9 3.5 9M15.2 16h4.6" },
  info: { d: `${o(12, 12, 9)}M12 11v5M12 8h.01` },
  list: { d: "M9 6h11M9 12h11M9 18h11M4 6h.01M4 12h.01M4 18h.01" },
  starFill: { d: "M12 3l2.7 5.6 6.1.9-4.4 4.3 1 6.1L12 17l-5.4 2.9 1-6.1-4.4-4.3 6.1-.9z", fill: true },
  tray: { d: "M3 13l3-8h12l3 8v6H3zM3 13h5l1 2h6l1-2h5" },
  ellipsis: { d: `${o(5, 12, 1.6)}${o(12, 12, 1.6)}${o(19, 12, 1.6)}`, fill: true },
  briefcase: { d: "M3 8h18v12H3zM8 8V5a1 1 0 0 1 1-1h6a1 1 0 0 1 1 1v3M3 13h18" },
  appStore: { d: "M14 4.5l-8 14M10 4.5l8 14M4.5 14.5h15" },
  robot: { d: "M6 11a6 6 0 0 1 12 0zM8 3.5l1.5 2.5M16 3.5L14.5 6M6 13h12v6a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2zM10 8.5h.01M14 8.5h.01" },
  window: { d: "M3 5h18v14H3zM3 9h18M6 7h.01M8.5 7h.01M11 7h.01" },
  flag: { d: "M5 21V4M5 4c3-2 6 2 9 0s5-1 5-1v9s-2-1-5 1-6-2-9 0" },
  tiles: { d: "M3 3h8v8H3zM13 3h8v8h-8zM3 13h8v8H3zM13 13h8v8h-8z", fill: true },
  gamepad: { d: "M7 7h10a5 5 0 0 1 4.6 7l-1.1 2.6a2.5 2.5 0 0 1-4.3.5L14.5 15h-5l-1.7 2.1a2.5 2.5 0 0 1-4.3-.5L2.4 14A5 5 0 0 1 7 7zM7 10v3M5.5 11.5h3M15 11h.01M17.5 12.5h.01" },
} satisfies Record<string, { d: string; fill?: boolean }>;

export type IconName = keyof typeof GLYPHS;

type IconProps = { name: IconName; size?: number; style?: CSSProperties; className?: string; label?: string };

export function Icon({ name, size = 22, style, className, label }: IconProps) {
  const glyph: { d: string; fill?: boolean } = GLYPHS[name];
  return (
    <svg
      viewBox="0 0 24 24"
      width={size}
      height={size}
      style={style}
      className={className}
      role={label ? "img" : undefined}
      aria-label={label}
      aria-hidden={label ? undefined : true}
      fill={glyph.fill ? "currentColor" : "none"}
      stroke={glyph.fill ? "none" : "currentColor"}
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d={glyph.d} />
    </svg>
  );
}
