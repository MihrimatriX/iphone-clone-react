import { useEffect, useRef, useState } from "react";
import { skip, togglePlay } from "../apps/music/engine";
import { tracks } from "../apps/music/tracks";
import { haptic } from "../lib/haptics";
import { cx } from "../lib/util";
import { Glass } from "../ui/Glass";
import { Icon, type IconName } from "../ui/icons";
import { unlock } from "./LockScreen";
import s from "./LockScreen.module.css";
import { useOS } from "./store";

const HOLD_MS = 350;

export function NowPlaying() {
  const music = useOS(st => st.music);
  const track = tracks[music.track] ?? tracks[0]!;
  return (
    <Glass className={s.player}>
      <span className={s.cover} style={{ background: track.cover }} />
      <span className={s.meta}>
        <b>{track.title}</b>
        <small>{track.artist}</small>
      </span>
      <button aria-label="Önceki" onClick={() => skip(-1)}><Icon name="prev" size={20} /></button>
      <button aria-label="Oynat/Duraklat" onClick={togglePlay}><Icon name={music.playing ? "pause" : "play"} size={24} /></button>
      <button aria-label="Sonraki" onClick={() => skip(1)}><Icon name="next" size={20} /></button>
    </Glass>
  );
}

type HoldProps = { icon: IconName; label: string; on?: boolean; onTrigger: () => void };

/** iOS lock-screen shortcut: press and hold; the button swells and a ring grows until it fires. */
function HoldButton({ icon, label, on, onTrigger }: HoldProps) {
  const [holding, setHolding] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout>>(undefined);
  const fire = () => {
    haptic("medium");
    onTrigger();
  };
  const cancel = () => {
    clearTimeout(timer.current);
    setHolding(false);
  };
  const start = () => {
    setHolding(true);
    timer.current = setTimeout(() => {
      setHolding(false);
      fire();
    }, HOLD_MS);
  };
  useEffect(() => () => clearTimeout(timer.current), []);
  return (
    <Glass
      interactive
      shape="circle"
      className={cx(s.shortcut, on && s.on, holding && s.holding)}
      aria-label={label}
      aria-pressed={on}
      whileTap={{ scale: 1.16 }}
      onPointerMoveCapture={undefined}
      onPointerDown={start}
      onPointerUp={cancel}
      onPointerLeave={cancel}
      onPointerCancel={cancel}
      // Keyboard activation (click with detail 0) fires at once; pointers must hold.
      onClick={e => e.detail === 0 && fire()}
    >
      <span className={s.ring} aria-hidden="true" />
      <Icon name={icon} size={22} />
    </Glass>
  );
}

/** Flashlight and camera buttons at the bottom corners. */
export function Shortcuts() {
  const flashlight = useOS(st => st.flashlight);
  return (
    <div className={s.shortcuts}>
      <HoldButton icon="flashlight" label="El feneri" on={flashlight} onTrigger={() => useOS.setState({ flashlight: !flashlight })} />
      <HoldButton icon="camera" label="Kamera" onTrigger={() => unlock("camera")} />
    </div>
  );
}
