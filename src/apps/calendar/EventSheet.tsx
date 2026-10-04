import { useEffect, useState, type FormEvent } from "react";
import { haptic } from "../../lib/haptics";
import { useOS } from "../../os/store";
import { Sheet } from "../../ui/Sheet";
import { Toggle } from "../../ui/Toggle";
import s from "./Calendar.module.css";

type EventSheetProps = { open: boolean; date: string; onClose: () => void };

/** New event form: title, day, and a time unless it is all day. */
export function EventSheet({ open, date, onClose }: EventSheetProps) {
  const [title, setTitle] = useState("");
  const [day, setDay] = useState(date);
  const [time, setTime] = useState("09:00");
  const [allDay, setAllDay] = useState(false);

  // Each time the sheet opens it starts from the day selected in the grid.
  useEffect(() => {
    if (!open) return;
    setTitle("");
    setDay(date);
    setAllDay(false);
  }, [open, date]);

  const save = (e: FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !day) return;
    const event = { id: crypto.randomUUID(), date: day, time: allDay ? "" : time, title: title.trim() };
    useOS.setState(st => ({ events: [...st.events, event] }));
    haptic("success");
    onClose();
  };

  return (
    <Sheet open={open} onClose={onClose} title="Yeni Etkinlik">
      <form className={s.form} onSubmit={save}>
        <input className={s.field} autoFocus value={title} onChange={e => setTitle(e.target.value)} placeholder="Başlık" aria-label="Başlık" />
        <label className={s.line}>
          Tarih
          <input type="date" value={day} onChange={e => setDay(e.target.value)} required />
        </label>
        <label className={s.line}>
          Tüm gün
          <Toggle on={allDay} label="Tüm gün" onChange={setAllDay} />
        </label>
        {!allDay && (
          <label className={s.line}>
            Saat
            <input type="time" value={time} onChange={e => setTime(e.target.value)} required />
          </label>
        )}
        <button type="submit" className={s.save} disabled={!title.trim()}>Ekle</button>
      </form>
    </Sheet>
  );
}
