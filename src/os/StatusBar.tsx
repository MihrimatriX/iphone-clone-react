import { useId } from "react";
import { useShallow } from "zustand/react/shallow";
import { fmtTime, useNow } from "../lib/util";
import { Icon } from "../ui/icons";
import { batteryColor, useBattery, type BatteryState } from "./battery";
import s from "./StatusBar.module.css";
import { useOS } from "./store";

function Signal() {
  return (
    <svg width="18" height="12" viewBox="0 0 18 12" aria-hidden="true">
      {[0, 1, 2, 3].map(i => (
        <rect key={i} x={i * 4.8} y={8.4 - i * 2.8} width="3.2" height={3.6 + i * 2.8} rx="1.1" fill="currentColor" />
      ))}
    </svg>
  );
}

const BOLT = "M13.6 2.2 8.9 7.3h3.1l-1.4 3.6 4.7-5.1h-3.1z";

/** iOS battery: faint outline, level-proportional fill, bolt cut out of the fill while charging. */
function Battery(battery: BatteryState) {
  const mask = useId();
  const width = Math.max(1.5, 20.5 * battery.level);
  return (
    <svg width="27" height="13" viewBox="0 0 27 13" aria-hidden="true">
      <mask id={mask}>
        <rect width="27" height="13" fill="#fff" />
        {battery.charging && <path d={BOLT} fill="#000" stroke="#000" strokeWidth="1.2" strokeLinejoin="round" />}
      </mask>
      <rect x="0.5" y="0.5" width="23.5" height="12" rx="4" fill="none" stroke="currentColor" opacity="0.35" />
      <rect x="2" y="2" width={width} height="9" rx="2.5" fill={batteryColor(battery)} mask={`url(#${mask})`} />
      {battery.charging && <path d={BOLT} fill="currentColor" />}
      <path d="M25.5 4.6v3.8a2 2 0 0 0 0-3.8z" fill="currentColor" opacity="0.4" />
    </svg>
  );
}

export function StatusBar({ tone }: { tone: "light" | "dark" }) {
  const now = useNow(5000);
  const battery = useBattery();
  const { wifi, airplane, focus, silent } = useOS(
    useShallow(st => ({ wifi: st.wifi, airplane: st.airplane, focus: st.focus, silent: st.silent })),
  );
  const percent = Math.round(battery.level * 100);
  return (
    <div className={s.bar} style={{ color: tone === "light" ? "#000" : "#fff" }}>
      <span className={s.time}>
        {fmtTime(now)}
        {focus && <Icon name="moon" size={13} />}
      </span>
      <span className={s.right} aria-label={`Pil %${percent}${battery.charging ? ", şarj oluyor" : ""}`}>
        {silent && <Icon name="bellSlash" size={13} />}
        {airplane ? <Icon name="airplane" size={15} /> : <Signal />}
        {wifi && !airplane && <Icon name="wifi" size={16} />}
        <Battery {...battery} />
      </span>
    </div>
  );
}
