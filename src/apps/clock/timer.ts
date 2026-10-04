import { useEffect } from "react";
import { haptic } from "../../lib/haptics";
import { chime } from "../../lib/sound";
import { isoDate } from "../../lib/util";
import { useOS } from "../../os/store";

/** Timer state is global so it keeps running (and shows in the Dynamic Island) with the app closed. */
const setTimer = (timer: { endsAt: number | null; left: number; total: number }) => useOS.setState({ timer });

export const startTimer = (ms: number) => setTimer({ endsAt: Date.now() + ms, left: ms, total: ms });
export const cancelTimer = () => setTimer({ endsAt: null, left: 0, total: 0 });

export function pauseTimer() {
  const { timer } = useOS.getState();
  if (timer.endsAt) setTimer({ ...timer, endsAt: null, left: timer.endsAt - Date.now() });
}

export function resumeTimer() {
  const { timer } = useOS.getState();
  if (!timer.endsAt && timer.left > 0) setTimer({ ...timer, endsAt: Date.now() + timer.left });
}

export function timerRemaining(now: number): number {
  const { timer } = useOS.getState();
  return timer.endsAt ? Math.max(0, timer.endsAt - now) : timer.left;
}

const minuteKey = (d: Date) => `${d.toDateString()} ${d.getHours()}:${d.getMinutes()}`;
const hhmm = (d: Date) => `${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;

function checkTimer(now: Date) {
  const os = useOS.getState();
  if (!os.timer.endsAt || os.timer.endsAt > now.getTime()) return;
  cancelTimer();
  chime();
  haptic("success");
  os.notify({ app: "clock", title: "Zamanlayıcı", body: "Süre doldu." });
  os.showToast("timer", "Zamanlayıcı bitti");
}

function checkAlarm(now: Date) {
  const os = useOS.getState();
  const due = os.alarms.find(alarm => alarm.on && alarm.time === hhmm(now));
  if (!due) return;
  chime();
  haptic("warning");
  os.notify({ app: "clock", title: "Alarm", body: `${due.time} alarmı çalıyor.` });
  os.showToast("alarm", `Alarm ${due.time}`);
}

function checkEvents(now: Date) {
  const os = useOS.getState();
  const due = os.events.find(e => e.date === isoDate(now) && e.time === hhmm(now));
  if (!due) return;
  chime();
  haptic("success");
  os.notify({ app: "calendar", title: due.title, body: `Şimdi · ${due.time}` });
  os.showToast("calendar", due.title);
}

/** Fires finished timers, due alarms and starting calendar events while the page is open. Mounted once by the Shell. */
export function useClockWatcher() {
  useEffect(() => {
    let lastMinute = "";
    const id = setInterval(() => {
      const now = new Date();
      checkTimer(now);
      // Alarms and events match on the minute; only fire once per minute.
      if (lastMinute === minuteKey(now)) return;
      lastMinute = minuteKey(now);
      checkAlarm(now);
      checkEvents(now);
    }, 500);
    return () => clearInterval(id);
  }, []);
}
