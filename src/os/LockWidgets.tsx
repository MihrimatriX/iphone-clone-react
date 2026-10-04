import { useEffect } from "react";
import { useShallow } from "zustand/react/shallow";
import { condition, refreshWeatherIfStale } from "../apps/weather/api";
import { useNow } from "../lib/util";
import { Icon } from "../ui/icons";
import { useBattery } from "./battery";
import { unlock } from "./LockScreen";
import s from "./LockWidgets.module.css";
import { useOS } from "./store";
import { upNext } from "./upNext";

const RING_R = 22;
const RING_C = 2 * Math.PI * RING_R;

/** Circular accessory gauge, like iOS's Batteries widget. */
function BatteryRing() {
  const { level, charging } = useBattery();
  const percent = Math.round(level * 100);
  return (
    <div className={s.circle} role="img" aria-label={`Pil %${percent}${charging ? ", şarj oluyor" : ""}`}>
      <svg viewBox="0 0 52 52" className={s.ring} aria-hidden="true">
        <circle cx="26" cy="26" r={RING_R} className={s.track} />
        <circle cx="26" cy="26" r={RING_R} className={s.level} strokeDasharray={`${RING_C * level} ${RING_C}`} />
      </svg>
      {charging && <Icon name="bolt" size={10} className={s.bolt} />}
      <b>{percent}</b>
    </div>
  );
}

function WeatherCircle() {
  const weather = useOS(st => st.weather);
  useEffect(refreshWeatherIfStale, []);
  const sky = condition(weather?.code ?? 0, weather?.isDay ?? true);
  const temp = weather ? `${Math.round(weather.temp)}°` : "--°";
  return (
    <button className={s.circle} aria-label={`Hava durumu: ${temp}, ${sky.label}`} onClick={() => unlock("weather")}>
      <Icon name={weather ? sky.icon : "cloud"} size={20} />
      <b>{temp}</b>
    </button>
  );
}

/** Rectangular widget: next calendar event or alarm; falls back to "no events". */
function UpNextRect() {
  const now = useNow(60_000);
  const { events, alarms } = useOS(useShallow(st => ({ events: st.events, alarms: st.alarms })));
  const next = upNext(events, alarms, now);
  const app = next?.kind === "alarm" ? "clock" : "calendar";
  return (
    <button className={s.rect} onClick={() => unlock(app)} aria-label={next ? `${next.title}, ${next.when}` : "Takvim"}>
      <span className={s.when}>
        <Icon name={next?.kind === "alarm" ? "alarm" : "calendar"} size={13} />
        {next?.when ?? "Bugün"}
      </span>
      <span className={s.title}>{next?.title ?? "Etkinlik yok"}</span>
    </button>
  );
}

/** iOS lock screen accessory row under the clock: small, monochrome, glassy. */
export function LockWidgets() {
  return (
    <div className={s.row}>
      <BatteryRing />
      <WeatherCircle />
      <UpNextRect />
    </div>
  );
}
