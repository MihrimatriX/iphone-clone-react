import { useEffect, type MouseEvent } from "react";
import { condition, refreshWeatherIfStale } from "../apps/weather/api";
import { byTime } from "../apps/calendar/dates";
import { isoDate, originOf, useNow } from "../lib/util";
import { Icon } from "../ui/icons";
import { useOS } from "./store";
import s from "./Widgets.module.css";

export type WidgetKind = "weather" | "calendar" | "clock";

const open = (id: string) => (e: MouseEvent) => useOS.getState().launch(id, originOf(e.currentTarget));

function WeatherWidget() {
  const weather = useOS(st => st.weather);
  useEffect(refreshWeatherIfStale, []);
  const sky = condition(weather?.code ?? 0, weather?.isDay ?? true);
  const today = weather?.daily[0];
  return (
    <button className={`${s.widget} ${s.weather}`} onClick={open("weather")} aria-label="Hava Durumu">
      <span className={s.place}>
        {weather?.place ?? "İstanbul"} <Icon name="location" size={12} />
      </span>
      <span className={s.temp}>{weather ? `${weather.temp}°` : "--°"}</span>
      <span className={s.bottom}>
        <Icon name={sky.icon} size={20} />
        <span>{sky.label}</span>
        {today && <span className={s.dim}>Y:{today.hi}° D:{today.lo}°</span>}
      </span>
    </button>
  );
}

function CalendarWidget() {
  const now = useNow(60_000);
  const events = useOS(st => st.events);
  const date = new Date(now);
  const today = events.filter(e => e.date === isoDate(date)).sort(byTime).slice(0, 2);
  return (
    <button className={`${s.widget} ${s.calendar}`} onClick={open("calendar")} aria-label="Takvim">
      <span className={s.weekday}>{date.toLocaleDateString("tr-TR", { weekday: "long" })}</span>
      <span className={s.day}>{date.getDate()}</span>
      <span className={s.events}>
        {today.map(e => (
          <span key={e.id} className={s.eventLine}>
            <b>{e.title}</b>
            {e.time || "Tüm gün"}
          </span>
        ))}
        {today.length === 0 && <span className={s.event}>Bugün etkinlik yok</span>}
      </span>
    </button>
  );
}

function ClockWidget() {
  const now = new Date(useNow(1000));
  const minute = now.getMinutes() + now.getSeconds() / 60;
  const hand = (deg: number, length: number, width: number, color = "currentColor") => (
    <line x1="50" y1="50" x2="50" y2={50 - length} stroke={color} strokeWidth={width} strokeLinecap="round" transform={`rotate(${deg} 50 50)`} />
  );
  return (
    <button className={`${s.widget} ${s.clock}`} onClick={open("clock")} aria-label="Saat">
      <svg viewBox="0 0 100 100" width="100%" height="100%" aria-hidden="true">
        <text x="50" y="34" textAnchor="middle" fontSize="8" fontWeight="600" fill="currentColor" opacity="0.55">İST</text>
        {Array.from({ length: 12 }, (_, i) => (
          <text key={i} x={50 + 38 * Math.sin((i + 1) * (Math.PI / 6))} y={53.5 - 38 * Math.cos((i + 1) * (Math.PI / 6))} textAnchor="middle" fontSize="10" fontWeight="500" fill="currentColor">
            {i + 1}
          </text>
        ))}
        {hand((now.getHours() % 12) * 30 + minute / 2, 22, 4)}
        {hand(minute * 6, 32, 3)}
        {hand(now.getSeconds() * 6, 36, 1.2, "#ff9f0a")}
        <circle cx="50" cy="50" r="2.5" fill="#ff9f0a" />
      </svg>
    </button>
  );
}

const WIDGETS = {
  weather: { Body: WeatherWidget, caption: "Hava Durumu" },
  calendar: { Body: CalendarWidget, caption: "Takvim" },
  clock: { Body: ClockWidget, caption: "Saat" },
};

/** A 2×2 home screen widget with its name underneath, as iOS shows it. */
export function Widget({ kind }: { kind: WidgetKind }) {
  const { Body, caption } = WIDGETS[kind];
  return (
    <div className={s.cell}>
      <Body />
      <span className={s.caption} aria-hidden="true">{caption}</span>
    </div>
  );
}
