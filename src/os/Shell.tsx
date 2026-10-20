import { AnimatePresence, motion, useMotionValueEvent } from "motion/react";
import { useEffect, useState, type CSSProperties, type PointerEvent } from "react";
import { useShallow } from "zustand/react/shallow";
import { useClockWatcher } from "../apps/clock/timer";
import { appById } from "../apps/registry";
import { haptic } from "../lib/haptics";
import { cx } from "../lib/util";
import { GlassDefs, refractionSupported } from "../ui/Glass";
import { Icon } from "../ui/icons";
import { AppLayer } from "./AppLayer";
import { AppSwitcher } from "./AppSwitcher";
import { ControlCenter } from "./ControlCenter";
import { DynamicIsland } from "./DynamicIsland";
import { Edges, homeSwipe } from "./Edges";
import { Home } from "./Home";
import { LockScreen } from "./LockScreen";
import { NotificationCenter } from "./NotificationCenter";
import s from "./Shell.module.css";
import { Spotlight } from "./Spotlight";
import { StatusBar } from "./StatusBar";
import { useOS } from "./store";
import { wallpaperOf } from "./wallpapers";

const HUD_MS = 1500;
const TAPPABLE = "button, a, input, textarea, select, [role=button], [role=switch], [role=tab]";
const MIN_BRIGHTNESS = 0.3;

/** Every tap on a control gets a light haptic; specific actions add their own stronger ones. */
function tapFeedback(e: PointerEvent) {
  if ((e.target as Element).closest(TAPPABLE)) haptic("light");
}

function VolumeHud() {
  const { volume, at } = useOS(useShallow(st => ({ volume: st.volume, at: st.volumeHudAt })));
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    if (!at) return;
    setVisible(true);
    const id = setTimeout(() => setVisible(false), HUD_MS);
    return () => clearTimeout(id);
  }, [at]);
  return (
    <AnimatePresence>
      {visible && (
        <motion.div className={s.hud} role="status" aria-label={`Ses %${Math.round(volume * 100)}`} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
          <span className={s.hudFill} style={{ height: `${volume * 100}%` }} />
          <Icon name={volume === 0 ? "speakerSlash" : "speaker"} size={16} className={s.hudIcon} />
        </motion.div>
      )}
    </AnimatePresence>
  );
}

/** The 390×844 phone screen: one stack of layers, identical in 3D and flat mode. */
export function Shell() {
  const os = useOS(
    useShallow(st => ({
      dark: st.dark, brightness: st.brightness, textScale: st.textScale, wallpaper: st.wallpaper,
      locked: st.locked, screenOn: st.screenOn, overlay: st.overlay, openApp: st.openApp,
    })),
  );
  useClockWatcher();
  const [swiping, setSwiping] = useState(false);
  useMotionValueEvent(homeSwipe, "change", v => setSwiping(v > 0));
  const wall = wallpaperOf(os.wallpaper);
  const app = appById(os.openApp);
  // Hidden home = its backdrop-filters are not painted under a full-screen app or the lock screen.
  const homeCovered = (os.locked || app !== undefined) && !swiping;
  let tone = wall.tone;
  if (app && !os.locked) tone = app.dark || os.dark ? "dark" : "light";
  if (os.overlay && !os.locked) tone = "dark";

  const style = { "--ts": os.textScale, filter: `brightness(${MIN_BRIGHTNESS + os.brightness * (1 - MIN_BRIGHTNESS)})` } as CSSProperties;

  return (
    <div
      data-screen
      className={s.screen}
      data-theme={os.dark ? "dark" : "light"}
      data-lg={refractionSupported || undefined}
      style={style}
      onPointerDownCapture={tapFeedback}
    >
      <GlassDefs />
      <div className={s.wallpaper} style={{ background: wall.css }} />
      <div className={cx(s.homeLayer, homeCovered && s.covered)} inert={homeCovered}>
        <Home />
      </div>
      <AppLayer />
      <AnimatePresence>{os.overlay === "spotlight" && <Spotlight key="spotlight" />}</AnimatePresence>
      <AnimatePresence>{os.locked && <LockScreen key="lock" />}</AnimatePresence>
      <AnimatePresence>
        {os.overlay === "control" && <ControlCenter key="control" />}
        {os.overlay === "notifications" && <NotificationCenter key="notifications" />}
        {os.overlay === "switcher" && <AppSwitcher key="switcher" />}
      </AnimatePresence>
      <StatusBar tone={tone} />
      <DynamicIsland />
      <Edges tone={tone} />
      <VolumeHud />
      <div
        className={s.off}
        style={{ opacity: os.screenOn ? 0 : 1, pointerEvents: os.screenOn ? "none" : "auto" }}
        onClick={() => useOS.getState().power()}
        aria-hidden={os.screenOn}
      />
    </div>
  );
}
