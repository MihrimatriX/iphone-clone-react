import { AnimatePresence, motion } from "motion/react";
import { useState, type CSSProperties } from "react";
import { haptic } from "../../lib/haptics";
import { cx, isoDate } from "../../lib/util";
import { useOS, type Reminder, type ReminderList } from "../../os/store";
import { AppFrame } from "../../ui/AppFrame";
import { Icon } from "../../ui/icons";
import { dueLabel, LISTS, SMART, type SmartId } from "./lists";
import { NewReminder } from "./NewReminder";
import s from "./Reminders.module.css";

export type View = { kind: "smart"; id: SmartId } | { kind: "list"; id: ReminderList };

/** Time the filled checkbox stays visible before a completed item leaves an open list. */
const COMPLETE_DELAY_MS = 450;

const setReminders = (fn: (all: Reminder[]) => Reminder[]) => useOS.setState(st => ({ reminders: fn(st.reminders) }));

export function ListView({ view, onBack }: { view: View; onBack: () => void }) {
  const reminders = useOS(st => st.reminders);
  const [completing, setCompleting] = useState<string[]>([]);
  const [adding, setAdding] = useState(false);
  const today = isoDate(new Date());
  const smart = view.kind === "smart" ? SMART.find(sm => sm.id === view.id) : undefined;
  const list = view.kind === "list" ? LISTS.find(l => l.id === view.id) : undefined;
  const color = smart?.color ?? list?.color ?? "var(--tint)";
  const items = reminders.filter(r => (smart ? smart.match(r, today) : r.list === view.id && !r.done));
  const showList = view.kind === "smart";

  const toggle = (r: Reminder) => {
    if (r.done) return setReminders(all => all.map(x => (x.id === r.id ? { ...x, done: false } : x)));
    haptic("success");
    setCompleting(ids => [...ids, r.id]);
    setTimeout(() => {
      setReminders(all => all.map(x => (x.id === r.id ? { ...x, done: true } : x)));
      setCompleting(ids => ids.filter(id => id !== r.id));
    }, COMPLETE_DELAY_MS);
  };
  const remove = (id: string) => setReminders(all => all.filter(r => r.id !== id));
  const clearDone = () => {
    haptic("warning");
    setReminders(all => all.filter(r => !r.done));
  };

  return (
    <AppFrame
      title={smart?.name ?? list?.name}
      onBack={onBack}
      backLabel="Listeler"
      footer={
        view.id === "done" ? undefined : (
          <button className={s.newButton} style={{ color }} onClick={() => setAdding(true)}>
            <Icon name="plus" size={18} /> Yeni Hatırlatıcı
          </button>
        )
      }
    >
      <ul className={s.items} style={{ "--list": color } as CSSProperties}>
        <AnimatePresence initial={false}>
          {items.map(r => {
            const checked = r.done || completing.includes(r.id);
            const overdue = !r.done && r.due !== null && r.due < today;
            return (
              <motion.li key={r.id} className={s.item} layout exit={{ opacity: 0, height: 0 }}>
                <button role="checkbox" aria-checked={checked} aria-label={r.text} className={cx(s.check, checked && s.checked)} onClick={() => toggle(r)} />
                <span className={cx(s.text, checked && s.struck)}>
                  {r.text}
                  <small className={overdue ? s.overdue : undefined}>
                    {[r.due && dueLabel(r.due), showList && LISTS.find(l => l.id === r.list)?.name].filter(Boolean).join(" · ")}
                  </small>
                </span>
                {r.done && (
                  <button className={s.remove} aria-label={`${r.text} sil`} onClick={() => remove(r.id)}>
                    <Icon name="trash" size={16} />
                  </button>
                )}
              </motion.li>
            );
          })}
        </AnimatePresence>
      </ul>
      {items.length === 0 && <p className={s.empty}>Hatırlatıcı yok</p>}
      {view.id === "done" && items.length > 0 && (
        <button className={s.clear} onClick={clearDone}>Tümünü Temizle</button>
      )}
      <NewReminder
        open={adding}
        onClose={() => setAdding(false)}
        list={view.kind === "list" ? view.id : undefined}
        due={view.id === "today" ? today : undefined}
      />
    </AppFrame>
  );
}
