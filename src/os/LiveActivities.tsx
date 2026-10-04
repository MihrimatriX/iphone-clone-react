import type { MouseEvent } from "react";
import { cancelTimer, pauseTimer, resumeTimer, timerRemaining } from "../apps/clock/timer";
import { skip, togglePlay } from "../apps/music/engine";
import { tracks } from "../apps/music/tracks";
import { endCall } from "../apps/phone/call";
import { fmtDuration } from "../lib/util";
import { Icon, type IconName } from "../ui/icons";
import s from "./DynamicIsland.module.css";
import { useOS } from "./store";

/** Dynamic Island live-activity views: compact by default, controls when expanded. */
const Bars = () => (
  <span className={s.bars} aria-hidden="true">
    {[0, 1, 2, 3].map(i => (
      <i key={i} style={{ animationDelay: `${i * 0.15}s` }} />
    ))}
  </span>
);

/** Island buttons must not also toggle the island. */
function IslandButton({ icon, label, onPress, className = s.round }: { icon: IconName; label: string; onPress: () => void; className?: string }) {
  const onClick = (e: MouseEvent) => {
    e.stopPropagation();
    onPress();
  };
  return (
    <button className={className} aria-label={label} onClick={onClick}>
      <Icon name={icon} size={20} />
    </button>
  );
}

export function CallLive({ expanded, now }: { expanded: boolean; now: number }) {
  const call = useOS(st => st.call);
  const time = fmtDuration(now - (call?.at ?? now));
  if (!expanded) return <span className={s.row}><Icon name="phone" size={16} className={s.green} /><span className={s.green}>{time}</span><Bars /></span>;
  return (
    <span className={s.row}>
      <span className={s.big}>{call?.name}<small>{time}</small></span>
      <IslandButton icon="phone" label="Aramayı bitir" onPress={endCall} className={s.end} />
    </span>
  );
}

export function TimerLive({ expanded }: { expanded: boolean }) {
  const running = useOS(st => st.timer.endsAt !== null);
  const left = fmtDuration(timerRemaining(Date.now()) + 999);
  if (!expanded) return <span className={s.row}><Icon name="timer" size={18} className={s.orange} /><span className={s.orange}>{left}</span></span>;
  return (
    <span className={s.row}>
      <span className={s.big}><small>Zamanlayıcı</small>{left}</span>
      <IslandButton icon={running ? "pause" : "play"} label={running ? "Duraklat" : "Devam"} onPress={running ? pauseTimer : resumeTimer} />
      <IslandButton icon="xmark" label="İptal" onPress={cancelTimer} />
    </span>
  );
}

export function MusicLive({ expanded }: { expanded: boolean }) {
  const music = useOS(st => st.music);
  const track = tracks[music.track] ?? tracks[0]!;
  if (!expanded) return <span className={s.row}><span className={s.cover} style={{ background: track.cover }} /><Bars /></span>;
  return (
    <span className={s.row}>
      <span className={s.cover} style={{ background: track.cover, width: 52, height: 52 }} />
      <span className={s.big}>{track.title}<small>{track.artist}</small></span>
      <IslandButton icon="prev" label="Önceki" onPress={() => skip(-1)} className={s.icon} />
      <IslandButton icon={music.playing ? "pause" : "play"} label="Oynat/Duraklat" onPress={togglePlay} className={s.icon} />
      <IslandButton icon="next" label="Sonraki" onPress={() => skip(1)} className={s.icon} />
    </span>
  );
}

export function Toast() {
  const toast = useOS(st => st.toast);
  if (!toast) return null;
  return <span className={s.row}><Icon name={toast.icon} size={18} className={s.accent} /><span className={s.label}>{toast.text}</span></span>;
}

export function FaceId() {
  const ok = useOS(st => st.faceId === "ok");
  return <Icon name={ok ? "check" : "faceid"} size={60} className={ok ? s.ok : s.scan} />;
}
