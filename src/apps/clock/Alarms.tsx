import { useState } from "react";
import { useNow } from "../../lib/util";
import { useOS } from "../../os/store";
import { Icon } from "../../ui/icons";
import { Row, Section } from "../../ui/List";
import { Sheet } from "../../ui/Sheet";
import { Toggle } from "../../ui/Toggle";
import s from "./Clock.module.css";

const CITIES = [
  { name: "İstanbul", zone: "Europe/Istanbul" },
  { name: "Londra", zone: "Europe/London" },
  { name: "New York", zone: "America/New_York" },
  { name: "Tokyo", zone: "Asia/Tokyo" },
  { name: "Sidney", zone: "Australia/Sydney" },
];

/** Hours ahead of local time and whether the city is already on another calendar day. */
function zoneInfo(zone: string, now: Date) {
  const there = new Date(now.toLocaleString("en-US", { timeZone: zone }));
  const hours = Math.round((there.getTime() - now.getTime()) / 3_600_000);
  const dayDiff = there.getDate() - now.getDate();
  let day = "Bugün";
  if (dayDiff === 1 || dayDiff < -1) day = "Yarın";
  if (dayDiff === -1 || dayDiff > 1) day = "Dün";
  return `${day}, ${hours >= 0 ? "+" : ""}${hours} SA`;
}

export function WorldClock() {
  const now = new Date(useNow(10_000));
  return (
    <Section>
      {CITIES.map(city => (
        <Row
          key={city.zone}
          label={city.name}
          sub={zoneInfo(city.zone, now)}
          detail={<span className={s.cityTime}>{now.toLocaleTimeString("tr-TR", { hour: "2-digit", minute: "2-digit", timeZone: city.zone })}</span>}
        />
      ))}
    </Section>
  );
}

export function Alarms() {
  const alarms = useOS(st => st.alarms);
  const [adding, setAdding] = useState(false);
  const [time, setTime] = useState("07:30");
  const update = (id: string, on: boolean) => useOS.setState(st => ({ alarms: st.alarms.map(a => (a.id === id ? { ...a, on } : a)) }));
  const remove = (id: string) => useOS.setState(st => ({ alarms: st.alarms.filter(a => a.id !== id) }));
  const add = () => {
    useOS.setState(st => ({ alarms: [...st.alarms, { id: crypto.randomUUID(), time, on: true }].sort((a, b) => a.time.localeCompare(b.time)) }));
    setAdding(false);
  };

  return (
    <>
      <div className={s.toolbar}>
        <button className={s.plus} aria-label="Alarm ekle" onClick={() => setAdding(true)}><Icon name="plus" size={22} /></button>
      </div>
      <Section footer="Alarmlar yalnızca bu sayfa açıkken çalar.">
        {alarms.map(a => (
          <Row key={a.id} label={<span className={s.alarmTime}>{a.time}</span>} sub="Alarm">
            <button className={s.delete} aria-label={`${a.time} alarmını sil`} onClick={() => remove(a.id)}><Icon name="trash" size={18} /></button>
            <Toggle on={a.on} label={`${a.time} alarmı`} onChange={on => update(a.id, on)} />
          </Row>
        ))}
        {alarms.length === 0 && <Row label="Alarm yok" />}
      </Section>
      <Sheet open={adding} onClose={() => setAdding(false)} title="Alarm Ekle">
        <input className={s.timeInput} type="time" value={time} onChange={e => setTime(e.target.value)} aria-label="Alarm saati" />
        <button className={s.save} onClick={add}>Kaydet</button>
      </Sheet>
    </>
  );
}
