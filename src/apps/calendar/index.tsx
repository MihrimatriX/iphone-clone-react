import { useDrag } from "@use-gesture/react";
import { useMemo, useState } from "react";
import { haptic } from "../../lib/haptics";
import { cx, isoDate } from "../../lib/util";
import { useOS } from "../../os/store";
import { AppFrame } from "../../ui/AppFrame";
import { Glass } from "../../ui/Glass";
import { Icon } from "../../ui/icons";
import { Row, Section } from "../../ui/List";
import s from "./Calendar.module.css";
import { byTime, monthGrid, shiftMonth, weekdayLabels } from "./dates";
import { EventSheet } from "./EventSheet";

const SWIPE_PX = 50;
const WEEKDAYS = weekdayLabels();

const longDate = (iso: string) =>
  new Date(`${iso}T00:00`).toLocaleDateString("tr-TR", { weekday: "long", day: "numeric", month: "long" });

export default function Calendar() {
  const events = useOS(st => st.events);
  const now = new Date();
  const today = isoDate(now);
  const [cursor, setCursor] = useState({ year: now.getFullYear(), month: now.getMonth() });
  const [selected, setSelected] = useState(today);
  const [adding, setAdding] = useState(false);
  const days = monthGrid(cursor.year, cursor.month);
  const busyDays = useMemo(() => new Set(events.map(e => e.date)), [events]);
  const dayEvents = events.filter(e => e.date === selected).sort(byTime);
  const title = new Date(cursor.year, cursor.month).toLocaleDateString("tr-TR", { month: "long", year: "numeric" });

  const move = (delta: number) => {
    haptic("selection");
    setCursor(c => shiftMonth(c.year, c.month, delta));
  };
  const goToday = () => {
    setCursor({ year: now.getFullYear(), month: now.getMonth() });
    setSelected(today);
  };
  const remove = (id: string) => {
    haptic("warning");
    useOS.setState(st => ({ events: st.events.filter(e => e.id !== id) }));
  };
  const bindSwipe = useDrag(
    ({ movement: [mx], last }) => {
      if (last && Math.abs(mx) > SWIPE_PX) move(mx < 0 ? 1 : -1);
    },
    { axis: "x", filterTaps: true },
  );

  const trailing = (
    <>
      <Glass interactive shape="pill" className={s.today} onClick={goToday}>Bugün</Glass>
      <Glass interactive shape="circle" className={s.add} aria-label="Etkinlik ekle" onClick={() => setAdding(true)}>
        <Icon name="plus" size={20} />
      </Glass>
    </>
  );

  return (
    <AppFrame title={title} trailing={trailing}>
      <div className={s.nav}>
        <button aria-label="Önceki ay" onClick={() => move(-1)}><Icon name="chevronLeft" size={20} /></button>
        <div className={s.weekdays}>{WEEKDAYS.map(w => <span key={w}>{w}</span>)}</div>
        <button aria-label="Sonraki ay" onClick={() => move(1)}><Icon name="chevronRight" size={20} /></button>
      </div>
      <div className={s.grid} {...bindSwipe()}>
        {days.map(d => {
          const iso = isoDate(d);
          return (
            <button
              key={iso}
              className={cx(s.day, d.getMonth() !== cursor.month && s.outside, iso === today && s.isToday, iso === selected && s.selected)}
              aria-label={longDate(iso)}
              aria-pressed={iso === selected}
              onClick={() => setSelected(iso)}
            >
              <span>{d.getDate()}</span>
              {busyDays.has(iso) && <i className={s.dot} />}
            </button>
          );
        })}
      </div>
      <Section header={longDate(selected)}>
        {dayEvents.map(e => (
          <Row key={e.id} label={e.title} sub={e.time || "Tüm gün"} icon="calendar" iconColor="var(--red)">
            <button className={s.remove} aria-label={`${e.title} etkinliğini sil`} onClick={() => remove(e.id)}>
              <Icon name="trash" size={18} />
            </button>
          </Row>
        ))}
        {dayEvents.length === 0 && <Row label="Etkinlik yok" />}
      </Section>
      <EventSheet open={adding} date={selected} onClose={() => setAdding(false)} />
    </AppFrame>
  );
}
