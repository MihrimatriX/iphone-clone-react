import { useDrag } from "@use-gesture/react";
import { useRef } from "react";
import { animate, AnimatePresence, motion, useMotionValue, type MotionValue } from "motion/react";
import { appById, iconProps } from "../apps/registry";
import { haptic } from "../lib/haptics";
import { clamp, screenScale } from "../lib/util";
import { AppIcon } from "../ui/AppIcon";
import { spring } from "../ui/motion";
import s from "./AppSwitcher.module.css";
import { shouldDismissCard } from "./gestures";
import { useOS } from "./store";

const CARD_STEP = 250;

/** One recent app: drag up to close it, sideways to scroll, tap to reopen. */
function Card({ id, rowX, count }: { id: string; rowX: MotionValue<number>; count: number }) {
  const app = appById(id);
  const y = useMotionValue(0);
  const gestureRef = useRef<HTMLDivElement>(null);
  useDrag(
    ({ movement: [mx, my], velocity: [, vy], direction: [, dy], axis, last, memo, event }) => {
      const k = screenScale(event.target as Element);
      const startX: number = memo ?? rowX.get();
      if (axis === "x") {
        const x = clamp(startX + mx / k, -(count - 1) * CARD_STEP, 0);
        if (!last) rowX.set(x);
        else animate(rowX, Math.round(x / CARD_STEP) * CARD_STEP, spring());
        return startX;
      }
      if (!last) {
        y.set(Math.min(0, my / k));
        return startX;
      }
      // Closing updates state right away; AnimatePresence throws the card out from where it is.
      if (shouldDismissCard(my / k, (vy / k) * dy)) {
        haptic("light");
        useOS.getState().closeApp(id);
      } else {
        animate(y, 0, spring());
      }
      return startX;
    },
    { axis: "lock", filterTaps: true, target: gestureRef },
  );
  if (!app) return null;
  return (
    <motion.div className={s.card} style={{ y }} ref={gestureRef} exit={{ y: -900, opacity: 0 }} transition={{ duration: 0.25 }}>
      <span className={s.label}>
        <AppIcon {...iconProps(app)} size={28} />
        {app.name}
      </span>
      <button className={s.preview} style={{ background: app.accent }} onClick={() => useOS.getState().launch(id)} aria-label={`${app.name} uygulamasını aç`}>
        <AppIcon {...iconProps(app)} size={96} />
      </button>
    </motion.div>
  );
}

export function AppSwitcher() {
  const recents = useOS(st => st.recents);
  const rowX = useMotionValue(0);
  return (
    <motion.div
      className={s.switcher}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={e => e.target === e.currentTarget && useOS.getState().goHome()}
    >
      {recents.length === 0 && <p className={s.empty}>Açık uygulama yok</p>}
      <motion.div className={s.row} style={{ x: rowX }} initial={{ scale: 1.15 }} animate={{ scale: 1 }} transition={spring()}>
        <AnimatePresence>
          {recents.map(id => (
            <Card key={id} id={id} rowX={rowX} count={recents.length} />
          ))}
        </AnimatePresence>
      </motion.div>
    </motion.div>
  );
}
