import { useState } from "react";
import { dtmf } from "../../lib/sound";
import { cx, fmtAgo, fmtDuration, useNow } from "../../lib/util";
import { useOS } from "../../os/store";
import { AppFrame, type Tab } from "../../ui/AppFrame";
import { Avatar } from "../../ui/Avatar";
import { Icon, type IconName } from "../../ui/icons";
import { Row, Section } from "../../ui/List";
import { endCall, startCall } from "./call";
import s from "./Phone.module.css";

const TABS: Tab[] = [
  { id: "favorites", label: "Favoriler", icon: "star" },
  { id: "recents", label: "Son Aramalar", icon: "clock" },
  { id: "contacts", label: "Kişiler", icon: "person" },
  { id: "keypad", label: "Tuş Takımı", icon: "keypad" },
];
const KEYS: [string, string][] = [
  ["1", ""], ["2", "ABC"], ["3", "DEF"], ["4", "GHI"], ["5", "JKL"], ["6", "MNO"],
  ["7", "PQRS"], ["8", "TUV"], ["9", "WXYZ"], ["*", ""], ["0", "+"], ["#", ""],
];

function CallScreen() {
  const call = useOS(st => st.call);
  const now = useNow(1000);
  const [toggles, setToggles] = useState<Record<string, boolean>>({});
  const options: [string, IconName][] = [["Sessiz", "speakerSlash"], ["Tuşlar", "keypad"], ["Hoparlör", "speaker"]];
  if (!call) return null;
  return (
    <div className={s.call}>
      <span className={s.callName}>{call.name}</span>
      <span className={s.callTime}>{now - call.at < 2000 ? "aranıyor…" : fmtDuration(now - call.at)}</span>
      <div className={s.options}>
        {options.map(([label, icon]) => (
          <button key={label} className={cx(s.option, toggles[label] && s.optionOn)} aria-pressed={!!toggles[label]} onClick={() => setToggles(t => ({ ...t, [label]: !t[label] }))}>
            <Icon name={icon} size={28} />
            <small>{label}</small>
          </button>
        ))}
      </div>
      <button className={s.hangup} aria-label="Aramayı bitir" onClick={endCall}>
        <Icon name="phone" size={34} />
      </button>
    </div>
  );
}

const digitsOf = (phone: string) => phone.replace(/\D/g, "");

function Keypad() {
  const [number, setNumber] = useState("");
  const contacts = useOS(st => st.contacts);
  const match = number ? contacts.find(c => digitsOf(c.phone) === digitsOf(number)) : undefined;
  const press = (key: string) => {
    dtmf(key);
    setNumber(n => (n + key).slice(0, 15));
  };
  return (
    <div className={s.keypadWrap}>
      <div className={s.number} aria-live="polite">{number}</div>
      <div className={s.match}>{match?.name}</div>
      <div className={s.keypad}>
        {KEYS.map(([digit, letters]) => (
          <button key={digit} className={s.key} onClick={() => press(digit)} aria-label={digit}>
            <span>{digit}</span>
            <small>{letters}</small>
          </button>
        ))}
        <span />
        <button className={s.dial} aria-label="Ara" onClick={() => number && startCall(match?.name ?? number)}>
          <Icon name="phone" size={30} />
        </button>
        {number ? (
          <button className={s.erase} aria-label="Sil" onClick={() => setNumber(n => n.slice(0, -1))}>
            <Icon name="chevronLeft" size={26} />
          </button>
        ) : (
          <span />
        )}
      </div>
    </div>
  );
}

export default function Phone() {
  const [tab, setTab] = useState("keypad");
  const calls = useOS(st => st.calls);
  const contacts = useOS(st => st.contacts);
  const sorted = [...contacts].sort((a, b) => a.name.localeCompare(b.name, "tr"));
  const inCall = useOS(st => st.call !== null);
  if (inCall) return <AppFrame dark background="linear-gradient(#2b3a4a, #0e141b)"><CallScreen /></AppFrame>;
  const title = tab === "keypad" ? undefined : TABS.find(t => t.id === tab)?.label;

  return (
    <AppFrame title={title} tabs={TABS} tab={tab} onTab={setTab}>
      {tab === "keypad" && <Keypad />}
      {tab === "recents" && (
        <Section>
          {calls.map(c => (
            <Row key={`${c.name}-${c.at}`} label={c.name} sub={c.out ? "Giden arama" : "Gelen arama"} detail={fmtAgo(c.at)} onClick={() => startCall(c.name)} />
          ))}
        </Section>
      )}
      {(tab === "contacts" || tab === "favorites") && (
        <Section>
          {sorted
            .filter(c => tab === "contacts" || c.fav)
            .map(c => (
              <Row key={c.id} label={<span className={s.person}><Avatar name={c.name} size={32} />{c.name}</span>} detail={c.phone} onClick={() => startCall(c.name)} />
            ))}
        </Section>
      )}
    </AppFrame>
  );
}
