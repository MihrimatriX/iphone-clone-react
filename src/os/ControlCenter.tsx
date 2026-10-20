import { useDrag } from "@use-gesture/react";
import { motion } from "motion/react";
import { useRef } from "react";
import { useShallow } from "zustand/react/shallow";
import { screenScale } from "../lib/util";
import { Glass } from "../ui/Glass";
import { spring } from "../ui/motion";
import { Slider } from "../ui/Slider";
import s from "./ControlCenter.module.css";
import { CircleButton, FocusTile, Glyph, MusicModule, PageRail, type GlyphName } from "./ControlTiles";
import { SWIPE } from "./gestures";
import { useOS, type OS } from "./store";

type ToggleKey = "airplane" | "cellular" | "wifi" | "bluetooth" | "focus" | "flashlight" | "dark" | "lowPower" | "rotationLock";

const CONNECTIVITY: { key: ToggleKey; glyph: GlyphName; label: string; color: string }[] = [
  { key: "airplane", glyph: "airplane", label: "Uçak Modu", color: "var(--orange)" },
  { key: "cellular", glyph: "cellular", label: "Hücresel Veri", color: "var(--green)" },
  { key: "wifi", glyph: "wifi", label: "Wi-Fi", color: "var(--tint)" },
  { key: "bluetooth", glyph: "bluetooth", label: "Bluetooth", color: "var(--tint)" },
];

/** On = white circle; the glyph takes the colour iOS gives that control. */
const SYSTEM_TOGGLES: { key: ToggleKey; glyph: GlyphName; label: string; fg: string }[] = [
  { key: "dark", glyph: "appearance", label: "Karanlık Mod", fg: "#1c1c1e" },
  { key: "lowPower", glyph: "battery", label: "Düşük Güç", fg: "#e0a800" },
];

const LAUNCHERS: { app: string; glyph: GlyphName; label: string }[] = [
  { app: "clock", glyph: "timer", label: "Zamanlayıcı" },
  { app: "calculator", glyph: "calculator", label: "Hesap Makinesi" },
  { app: "camera", glyph: "camera", label: "Kamera" },
];


const close = () => useOS.setState({ overlay: null });
/** `launch` also clears the overlay, so Control Center closes as the app opens. */
const launch = (id: string) => useOS.getState().launch(id);
const toggle = (key: ToggleKey) => useOS.setState(st => ({ [key]: !st[key] }));

export function ControlCenter() {
  const os = useOS(
    useShallow((st: OS) => ({
      airplane: st.airplane, cellular: st.cellular, wifi: st.wifi, bluetooth: st.bluetooth, focus: st.focus,
      flashlight: st.flashlight, dark: st.dark, lowPower: st.lowPower, rotationLock: st.rotationLock,
      brightness: st.brightness, volume: st.volume,
    })),
  );
  const gestureRef = useRef<HTMLDivElement>(null);
  useDrag(
    ({ movement: [, my], last, event }) => {
      // Dragging a slider up must not close the panel.
      if ((event.target as Element).closest("[role=slider]")) return;
      if (last && my / screenScale(event.target as Element) < -SWIPE.edgeOpen) close();
    },
    { axis: "y", filterTaps: true, target: gestureRef },
  );

  return (
    <motion.div className={s.scrim} data-tone="dark" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={e => e.target === e.currentTarget && close()} ref={gestureRef}>
      <motion.div
        className={s.grid}
        style={{ transformOrigin: "100% 0%" }}
        initial={{ scale: 0.85, y: -40 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.85, y: -40 }}
        transition={spring()}
      >
        <Glass className={s.connectivity}>
          {CONNECTIVITY.map(c => (
            <CircleButton key={c.key} small label={c.label} on={os[c.key]} onBg={c.color} onFg="#fff" onPress={() => toggle(c.key)}>
              <Glyph name={c.glyph} size={22} />
            </CircleButton>
          ))}
        </Glass>
        <MusicModule />
        <CircleButton label="Yön Kilidi" on={os.rotationLock} onFg="var(--red)" onPress={() => toggle("rotationLock")}>
          <Glyph name="rotationLock" />
        </CircleButton>
        <CircleButton label="Ekran Yansıtma" onPress={() => useOS.getState().showToast("tabs", "Yakında aygıt bulunamadı")}>
          <Glyph name="mirroring" />
        </CircleButton>
        <Slider vertical className={s.slider} icon="sun" label="Parlaklık" value={os.brightness} onChange={brightness => useOS.setState({ brightness })} />
        <Slider vertical className={s.slider} icon="speaker" label="Ses" value={os.volume} onChange={volume => useOS.setState({ volume })} />
        <FocusTile on={os.focus} onPress={() => toggle("focus")} />
        <CircleButton label="El Feneri" on={os.flashlight} onFg="#1c1c1e" onPress={() => toggle("flashlight")}>
          <Glyph name="flashlight" />
        </CircleButton>
        {LAUNCHERS.map(l => (
          <CircleButton key={l.app} label={l.label} onPress={() => launch(l.app)}>
            <Glyph name={l.glyph} />
          </CircleButton>
        ))}
        {SYSTEM_TOGGLES.map(t => (
          <CircleButton key={t.key} label={t.label} on={os[t.key]} onFg={t.fg} onPress={() => toggle(t.key)}>
            <Glyph name={t.glyph} />
          </CircleButton>
        ))}
        <CircleButton label="Kod Tarayıcı" onPress={() => launch("camera")}>
          <Glyph name="qr" />
        </CircleButton>
      </motion.div>
      <PageRail />
    </motion.div>
  );
}
