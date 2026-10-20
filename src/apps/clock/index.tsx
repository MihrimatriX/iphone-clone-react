import { useState } from "react";
import { AppFrame, type Tab } from "../../ui/AppFrame";
import { Alarms, WorldClock } from "./Alarms";
import { Stopwatch, TimerView } from "./Timers";

const TABS: Tab[] = [
  { id: "world", label: "Dünya Saati", icon: "globe" },
  { id: "alarm", label: "Alarmlar", icon: "alarm" },
  { id: "stopwatch", label: "Kronometre", icon: "stopwatch" },
  { id: "timer", label: "Zamanlayıcı", icon: "timer" },
];

const VIEWS = { world: WorldClock, alarm: Alarms, stopwatch: Stopwatch, timer: TimerView };
type View = keyof typeof VIEWS;

export default function Clock() {
  const [tab, setTab] = useState<View>("world");
  const current = TABS.find(t => t.id === tab);
  const View = VIEWS[tab];
  return (
    <AppFrame dark background="#000" title={current?.label} tabs={TABS} tab={tab} onTab={id => setTab(id as View)}>
      <View />
    </AppFrame>
  );
}
