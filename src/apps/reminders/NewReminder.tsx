import { useEffect, useState, type FormEvent } from "react";
import { haptic } from "../../lib/haptics";
import { addDays, cx, isoDate } from "../../lib/util";
import { useOS, type ReminderList } from "../../os/store";
import { Sheet } from "../../ui/Sheet";
import { LISTS } from "./lists";
import s from "./Reminders.module.css";

type NewReminderProps = { open: boolean; onClose: () => void; list?: ReminderList; due?: string };

/** Quick add: text, which list, and an optional due day. */
export function NewReminder({ open, onClose, list = "kisisel", due }: NewReminderProps) {
  const [text, setText] = useState("");
  const [target, setTarget] = useState<ReminderList>(list);
  const [day, setDay] = useState<string | null>(due ?? null);
  const today = isoDate(new Date());
  const tomorrow = isoDate(addDays(new Date(), 1));
  const chips: [string, string | null][] = [["Yok", null], ["Bugün", today], ["Yarın", tomorrow]];

  useEffect(() => {
    if (!open) return;
    setText("");
    setTarget(list);
    setDay(due ?? null);
  }, [open, list, due]);

  const save = (e: FormEvent) => {
    e.preventDefault();
    if (!text.trim()) return;
    const reminder = { id: crypto.randomUUID(), text: text.trim(), done: false, list: target, due: day };
    useOS.setState(st => ({ reminders: [...st.reminders, reminder] }));
    haptic("success");
    onClose();
  };

  return (
    <Sheet open={open} onClose={onClose} title="Yeni Hatırlatıcı">
      <form className={s.form} onSubmit={save}>
        <input className={s.field} autoFocus value={text} onChange={e => setText(e.target.value)} placeholder="Ne hatırlatılsın?" aria-label="Hatırlatıcı" />
        <div className={s.chips} role="radiogroup" aria-label="Liste">
          {LISTS.map(l => (
            <button key={l.id} type="button" role="radio" aria-checked={target === l.id} className={cx(s.chip, target === l.id && s.chipOn)} onClick={() => setTarget(l.id)}>
              <i style={{ background: l.color }} /> {l.name}
            </button>
          ))}
        </div>
        <div className={s.chips} role="radiogroup" aria-label="Tarih">
          {chips.map(([label, value]) => (
            <button key={label} type="button" role="radio" aria-checked={day === value} className={cx(s.chip, day === value && s.chipOn)} onClick={() => setDay(value)}>
              {label}
            </button>
          ))}
          <input type="date" className={s.date} value={day ?? ""} onChange={e => setDay(e.target.value || null)} aria-label="Özel tarih" />
        </div>
        <button type="submit" className={s.save} disabled={!text.trim()}>Ekle</button>
      </form>
    </Sheet>
  );
}
