import type { CSSProperties, ReactNode } from "react";
import { skip, togglePlay } from "../apps/music/engine";
import { tracks } from "../apps/music/tracks";
import { cx } from "../lib/util";
import { Glass } from "../ui/Glass";
import { Icon, type IconName } from "../ui/icons";
import s from "./ControlCenter.module.css";
import { useOS } from "./store";

/** Control Center-only glyphs (24×24, stroke), kept here so ui/icons stays the app-wide set. */
const CC_GLYPHS = {
  cellular: "M12 11v10M9 21h6M8.5 6.5a5 5 0 0 0 0 7M15.5 6.5a5 5 0 0 1 0 7M5.5 3.5a9 9 0 0 0 0 13M18.5 3.5a9 9 0 0 1 0 13M12 10h.01",
  rotationLock: "M9 11h6v6H9zM10.5 11V9.5a1.5 1.5 0 0 1 3 0V11M4 12a8 8 0 0 1 13.7-5.6M17.7 2.8v3.6h-3.6M20 12a8 8 0 0 1-13.7 5.6M6.3 21.2v-3.6h3.6",
  mirroring: "M3 5.5h13v9H3zM8 10.5h13v9H8z",
  battery: "M3 8h15.5v8H3zM21 11v2M5.5 10.5h5v3h-5z",
  qr: "M3 3h7v7H3zM14 3h7v7h-7zM3 14h7v7H3zM14 14h3v3h-3zM18 18h3v3h-3zM18 14h3M14 21h1M6.5 6.5h.01M17.5 6.5h.01M6.5 17.5h.01",
  appearance: "M12 3a9 9 0 1 0 0 18a9 9 0 1 0 0-18zM12 3v18",
} as const;

type CCGlyphName = keyof typeof CC_GLYPHS;
export type GlyphName = IconName | CCGlyphName;

/** Any app-wide icon or Control Center glyph. */
export function Glyph({ name, size = 24 }: { name: GlyphName; size?: number }) {
  if (!(name in CC_GLYPHS)) return <Icon name={name as IconName} size={size} />;
  return (
    <svg viewBox="0 0 24 24" width={size} height={size} fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d={CC_GLYPHS[name as CCGlyphName]} />
      {name === "appearance" && <path d="M12 3a9 9 0 0 0 0 18z" fill="currentColor" />}
    </svg>
  );
}

type CircleProps = {
  label: string;
  /** Toggles pass their state; plain actions (Timer, Camera...) leave it out. */
  on?: boolean;
  /** Fill when on. Connectivity uses accent colours; other toggles use white with `onFg` glyph. */
  onBg?: string;
  onFg?: string;
  small?: boolean;
  onPress: () => void;
  children: ReactNode;
};

/** Round Control Center button. iOS: off = glass, on = filled with a contrasting glyph. */
export function CircleButton({ label, on, onBg, onFg, small, onPress, children }: CircleProps) {
  const style = { "--on-bg": onBg, "--on-fg": onFg } as CSSProperties;
  return (
    <Glass interactive shape="circle" className={cx(s.circle, small && s.small)} style={style} aria-label={label} aria-pressed={on} onClick={onPress}>
      {children}
    </Glass>
  );
}

/** The wide Focus tile: moon badge plus the active mode's name. */
export function FocusTile({ on, onPress }: { on: boolean; onPress: () => void }) {
  return (
    <Glass interactive className={s.focus} aria-label="Odak" aria-pressed={on} onClick={onPress}>
      <span className={s.focusBadge}>
        <Icon name="moon" size={18} />
      </span>
      <span className={s.focusText}>
        <b>{on ? "Rahatsız Etme" : "Odak"}</b>
        {on && <small>Açık</small>}
      </span>
    </Glass>
  );
}

export function MusicModule() {
  const music = useOS(st => st.music);
  const track = tracks[music.track] ?? tracks[0]!;
  return (
    <Glass className={s.music}>
      <span className={s.cover} style={{ background: track.cover }} />
      <b>{track.title}</b>
      <small>{track.artist}</small>
      <span className={s.controls}>
        <button aria-label="Önceki" onClick={() => skip(-1)}><Icon name="prev" size={20} /></button>
        <button aria-label="Oynat/Duraklat" onClick={togglePlay}><Icon name={music.playing ? "pause" : "play"} size={24} /></button>
        <button aria-label="Sonraki" onClick={() => skip(1)}><Icon name="next" size={20} /></button>
      </span>
    </Glass>
  );
}

/** iOS 18 page indicator on the right edge: favourites, music, home, connectivity. */
export function PageRail() {
  return (
    <div className={s.rail} aria-hidden="true">
      <Icon name="starFill" size={11} />
      <Icon name="music" size={11} />
      <Icon name="wifi" size={11} />
    </div>
  );
}
