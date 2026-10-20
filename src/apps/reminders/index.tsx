import { useState } from "react";
import { isoDate } from "../../lib/util";
import { useOS } from "../../os/store";
import { AppFrame } from "../../ui/AppFrame";
import { Icon } from "../../ui/icons";
import { Row, Section } from "../../ui/List";
import { LISTS, SMART } from "./lists";
import { ListView, type View } from "./ListView";
import { NewReminder } from "./NewReminder";
import s from "./Reminders.module.css";

export default function Reminders() {
  const reminders = useOS(st => st.reminders);
  const [view, setView] = useState<View | null>(null);
  const [adding, setAdding] = useState(false);
  const today = isoDate(new Date());

  if (view) return <ListView view={view} onBack={() => setView(null)} />;

  return (
    <AppFrame
      title="Hatırlatıcılar"
      footer={
        <button className={s.newButton} onClick={() => setAdding(true)}>
          <Icon name="plus" size={18} /> Yeni Hatırlatıcı
        </button>
      }
    >
      <div className={s.smart}>
        {SMART.map(sm => (
          <button key={sm.id} className={s.card} onClick={() => setView({ kind: "smart", id: sm.id })}>
            <span className={s.cardIcon} style={{ background: sm.color }}>
              <Icon name={sm.icon} size={18} />
            </span>
            <b className={s.count}>{reminders.filter(r => sm.match(r, today)).length}</b>
            <span className={s.cardName}>{sm.name}</span>
          </button>
        ))}
      </div>
      <Section header="Listelerim">
        {LISTS.map(list => (
          <Row
            key={list.id}
            label={list.name}
            icon="list"
            iconColor={list.color}
            detail={reminders.filter(r => r.list === list.id && !r.done).length}
            chevron
            onClick={() => setView({ kind: "list", id: list.id })}
          />
        ))}
      </Section>
      <NewReminder open={adding} onClose={() => setAdding(false)} />
    </AppFrame>
  );
}
