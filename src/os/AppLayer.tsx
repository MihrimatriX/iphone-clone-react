import { AnimatePresence, motion, useTransform } from "motion/react";
import { Component, Suspense, type ReactNode } from "react";
import { useShallow } from "zustand/react/shallow";
import { appById } from "../apps/registry";
import { token } from "../ui/motion";
import s from "./AppLayer.module.css";
import { homeSwipe } from "./Edges";
import { useOS } from "./store";

const CENTER = { x: 195, y: 422 };
const ICON_SCALE = 62 / 390;
/** Icon corner (14 px) divided by ICON_SCALE, so the shrunken app has the icon's rounding. */
const ICON_RADIUS = 14 / ICON_SCALE;

/** iOS: ~0.45 s open with a hint of overshoot, a slightly quicker critically damped close. */
const appSpring = (kind: "open" | "close") => ({
  type: "spring" as const,
  stiffness: token(`--app-${kind}-stiffness`),
  damping: token(`--app-${kind}-damping`),
});

/** A crashing app shows a message instead of taking the whole OS down. */
class AppBoundary extends Component<{ children: ReactNode }, { failed: boolean }> {
  override state = { failed: false };
  static getDerivedStateFromError() {
    return { failed: true };
  }
  override render() {
    return this.state.failed ? <div className={s.error}>Uygulama beklenmedik şekilde kapandı.</div> : this.props.children;
  }
}

/**
 * Opens/closes apps by springing scale from the tapped icon. motion's layoutId was the plan, but it
 * measures with getBoundingClientRect, which is distorted by the CSS3D transform around the screen.
 */
export function AppLayer() {
  const { openApp, origin } = useOS(useShallow(st => ({ openApp: st.openApp, origin: st.origin })));
  const app = appById(openApp);
  const from = origin ?? CENTER;
  // Bottom-edge swipe drags the app down toward a card while the finger is up.
  const dragScale = useTransform(homeSwipe, [0, 300], [1, 0.62]);
  const dragY = useTransform(homeSwipe, v => -v * 0.35);

  return (
    <motion.div className={s.layer} style={{ scale: dragScale, y: dragY }}>
      <AnimatePresence>
        {app && (
          <motion.div
            key={app.id}
            className={s.app}
            style={{ transformOrigin: `${from.x}px ${from.y}px` }}
            initial={{ scale: ICON_SCALE, opacity: 0, borderRadius: ICON_RADIUS }}
            animate={{ scale: 1, opacity: 1, borderRadius: 55, transition: { ...appSpring("open"), opacity: { duration: 0.12 } } }}
            exit={{
              scale: ICON_SCALE,
              opacity: 0,
              borderRadius: ICON_RADIUS,
              // Stays opaque while it shrinks, then hands over to the icon at the end.
              transition: { ...appSpring("close"), opacity: { duration: 0.16, delay: 0.16 } },
            }}
          >
            <AppBoundary>
              <Suspense fallback={<div className={s.loading} style={{ background: app.accent }} />}>
                <app.Component />
              </Suspense>
            </AppBoundary>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
