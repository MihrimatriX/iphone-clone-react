import { addDays, isoDate } from "../lib/util";
import type { Alarm, CalEvent } from "./types";

export type UpNext = { kind: "event" | "alarm"; title: string; when: string };

const DAY_MS = 86_400_000;
/** "YYYY-MM-DD" + "HH:MM" as a local timestamp (the date-time form without Z parses as local). */
const at = (date: string, time: string) => new Date(`${date}T${time || "00:00"}`).getTime();

/** "" today, "Yarın" tomorrow, else the short weekday ("Cmt"). */
function dayLabel(t: number, now: number): string {
  const startOf = (x: number) => at(isoDate(new Date(x)), "");
  const days = Math.round((startOf(t) - startOf(now)) / DAY_MS);
  if (days === 0) return "";
  if (days === 1) return "Yarın";
  return new Date(t).toLocaleDateString("tr-TR", { weekday: "short" });
}

/** The lock screen's next calendar event or enabled alarm, whichever comes first. */
export function upNext(events: CalEvent[], alarms: Alarm[], now: number): UpNext | null {
  const today = isoDate(new Date(now));
  const candidates: (UpNext & { t: number })[] = [];
  for (const e of events) {
    const t = at(e.date, e.time);
    // All-day events stay "upcoming" for their whole day.
    if (e.time ? t < now : e.date < today) continue;
    candidates.push({ kind: "event", title: e.title, when: e.time, t });
  }
  for (const a of alarms.filter(a => a.on)) {
    let t = at(today, a.time);
    if (t <= now) t = at(isoDate(addDays(new Date(now), 1)), a.time);
    candidates.push({ kind: "alarm", title: "Alarm", when: a.time, t });
  }
  const next = candidates.sort((a, b) => a.t - b.t)[0];
  if (!next) return null;
  const when = [dayLabel(next.t, now), next.when || "Tüm gün"].filter(Boolean).join(" ");
  return { kind: next.kind, title: next.title, when };
}
