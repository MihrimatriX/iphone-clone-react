import { useEffect, useState } from "react";

export const cx = (...names: (string | false | null | undefined)[]) => names.filter(Boolean).join(" ");

export const clamp = (v: number, min: number, max: number) => Math.min(max, Math.max(min, v));

/** Re-renders every `intervalMs` with the current timestamp. */
export function useNow(intervalMs = 1000): number {
  const [now, setNow] = useState(Date.now);
  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), intervalMs);
    return () => clearInterval(id);
  }, [intervalMs]);
  return now;
}

/** Local calendar date as "YYYY-MM-DD" (toISOString would shift it to UTC). */
export function isoDate(d: Date): string {
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

export const addDays = (d: Date, days: number) => new Date(d.getFullYear(), d.getMonth(), d.getDate() + days);

export const fmtTime = (t: number | Date) =>
  new Date(t).toLocaleTimeString("tr-TR", { hour: "2-digit", minute: "2-digit" });

export const fmtDate = (t: number | Date) =>
  new Date(t).toLocaleDateString("tr-TR", { weekday: "long", day: "numeric", month: "long" });

/** 75_000 -> "1:15", with hundredths when asked (stopwatch). */
export function fmtDuration(ms: number, hundredths = false): string {
  const total = Math.max(0, ms);
  const h = Math.floor(total / 3_600_000);
  const m = Math.floor(total / 60_000) % 60;
  const sec = Math.floor(total / 1000) % 60;
  const pad = (n: number) => String(n).padStart(2, "0");
  const base = h > 0 ? `${h}:${pad(m)}:${pad(sec)}` : `${m}:${pad(sec)}`;
  return hundredths ? `${pad(m)}:${pad(sec)},${pad(Math.floor(total / 10) % 100)}` : base;
}

/** "5 dk önce" style relative time for notifications and lists. */
export function fmtAgo(t: number, now = Date.now()): string {
  const min = Math.round((now - t) / 60_000);
  if (min < 1) return "şimdi";
  if (min < 60) return `${min} dk önce`;
  if (min < 1440) return `${Math.round(min / 60)} sa önce`;
  return new Date(t).toLocaleDateString("tr-TR", { day: "numeric", month: "short" });
}

/** Logical-px per screen-px ratio of the phone screen, which may be scaled or in 3D. */
export function screenScale(el: Element | null): number {
  const root = el?.closest("[data-screen]");
  return root ? root.getBoundingClientRect().height / 844 : 1;
}

/** Centre of `el` in logical screen px; the app open/close animation grows from here. */
export function originOf(el: Element): { x: number; y: number } {
  const screen = el.closest("[data-screen]")?.getBoundingClientRect();
  const rect = el.getBoundingClientRect();
  if (!screen) return { x: 195, y: 422 };
  const k = screen.width / 390;
  return { x: (rect.left + rect.width / 2 - screen.left) / k, y: (rect.top + rect.height / 2 - screen.top) / k };
}
