import { useEffect, useState } from "react";
import { useOS } from "./store";

type BatteryManager = EventTarget & { level: number; charging: boolean };
export type BatteryState = { level: number; charging: boolean; lowPower: boolean };

/** iOS colours the battery only in Low Power Mode (yellow, even while charging), while charging (green) or when low (red); otherwise it follows the foreground. */
export const batteryColor = ({ level, charging, lowPower }: BatteryState) => {
  if (lowPower) return "var(--yellow)";
  if (charging) return "var(--green)";
  return level <= 0.2 ? "var(--red)" : "currentColor";
};

/** Real battery where the Battery API exists (Chromium), a plausible constant elsewhere. */
export function useBattery(): BatteryState {
  const lowPower = useOS(s => s.lowPower);
  const [state, setState] = useState({ level: 0.82, charging: false });
  useEffect(() => {
    const nav = navigator as Navigator & { getBattery?: () => Promise<BatteryManager> };
    let battery: BatteryManager | undefined;
    const update = () => battery && setState({ level: battery.level, charging: battery.charging });
    void nav.getBattery?.().then(b => {
      battery = b;
      update();
      b.addEventListener("levelchange", update);
      b.addEventListener("chargingchange", update);
    });
    return () => {
      battery?.removeEventListener("levelchange", update);
      battery?.removeEventListener("chargingchange", update);
    };
  }, []);
  return { ...state, lowPower };
}
