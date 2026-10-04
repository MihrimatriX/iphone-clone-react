import { useEffect, useState } from "react";
import { fmtDuration, useNow } from "../../lib/util";
import { useOS } from "../../os/store";
import { Row, Section } from "../../ui/List";
import s from "./Clock.module.css";
import { cancelTimer, pauseTimer, resumeTimer, startTimer, timerRemaining } from "./timer";

/** Re-render on every animation frame while `active`, for the hundredths display. */
function useFrameNow(active: boolean): number {
  const [now, setNow] = useState(Date.now);
  useEffect(() => {
    if (!active) return;
    let id = requestAnimationFrame(function loop() {
      setNow(Date.now());
      id = requestAnimationFrame(loop);
    });
    return () => cancelAnimationFrame(id);
  }, [active]);
  return now;
}

function RoundButton({ label, color, onClick }: { label: string; color: "green" | "red" | "gray" | "orange"; onClick: () => void }) {
  return (
    <button className={`${s.round} ${s[color]}`} onClick={onClick}>
      <span>{label}</span>
    </button>
  );
}

export function Stopwatch() {
  const sw = useOS(st => st.stopwatch);
  const now = useFrameNow(sw.start !== null);
  // Button handlers read the clock themselves: the frame-driven `now` can lag (hidden tab, throttled rAF).
  const elapsedAt = (t: number) => sw.acc + (sw.start ? t - sw.start : 0);
  const elapsed = elapsedAt(now);
  const set = (patch: Partial<typeof sw>) => useOS.setState(st => ({ stopwatch: { ...st.stopwatch, ...patch } }));
  const toggle = () => (sw.start ? set({ start: null, acc: elapsedAt(Date.now()) }) : set({ start: Date.now() }));
  const lapOrReset = () => (sw.start ? set({ laps: [elapsedAt(Date.now()), ...sw.laps] }) : set({ acc: 0, laps: [] }));
  const lapTimes = sw.laps.map((t, i) => t - (sw.laps[i + 1] ?? 0));

  return (
    <>
      <div className={s.bigTime}>{fmtDuration(elapsed, true)}</div>
      <div className={s.buttons}>
        <RoundButton label={sw.start ? "Tur" : "Sıfırla"} color="gray" onClick={lapOrReset} />
        <RoundButton label={sw.start ? "Durdur" : "Başlat"} color={sw.start ? "red" : "green"} onClick={toggle} />
      </div>
      <Section>
        {lapTimes.map((t, i) => (
          <Row key={sw.laps.length - i} label={`Tur ${sw.laps.length - i}`} detail={fmtDuration(t, true)} />
        ))}
      </Section>
    </>
  );
}

const range = (n: number) => Array.from({ length: n }, (_, i) => i);

export function TimerView() {
  const timer = useOS(st => st.timer);
  useNow(250);
  const [pick, setPick] = useState({ h: 0, m: 5, s: 0 });
  const active = timer.endsAt !== null || timer.left > 0;

  if (!active) {
    const ms = ((pick.h * 60 + pick.m) * 60 + pick.s) * 1000;
    return (
      <>
        <div className={s.picker}>
          {(["h", "m", "s"] as const).map(unit => (
            <label key={unit}>
              <select value={pick[unit]} onChange={e => setPick({ ...pick, [unit]: Number(e.target.value) })}>
                {range(unit === "h" ? 24 : 60).map(n => <option key={n} value={n}>{n}</option>)}
              </select>
              {{ h: "sa", m: "dk", s: "sn" }[unit]}
            </label>
          ))}
        </div>
        <div className={s.buttons}>
          <RoundButton label="İptal" color="gray" onClick={() => setPick({ h: 0, m: 0, s: 0 })} />
          <RoundButton label="Başlat" color="green" onClick={() => ms > 0 && startTimer(ms)} />
        </div>
      </>
    );
  }

  const left = timerRemaining(Date.now());
  const progress = timer.total ? left / timer.total : 0;
  return (
    <>
      <div className={s.ring} style={{ background: `conic-gradient(var(--orange) ${progress * 360}deg, #333 0)` }}>
        <span>{fmtDuration(left + 999)}</span>
      </div>
      <div className={s.buttons}>
        <RoundButton label="İptal" color="gray" onClick={cancelTimer} />
        {timer.endsAt ? <RoundButton label="Duraklat" color="orange" onClick={pauseTimer} /> : <RoundButton label="Devam" color="green" onClick={resumeTimer} />}
      </div>
    </>
  );
}
