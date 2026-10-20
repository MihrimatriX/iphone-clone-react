import { useDrag } from "@use-gesture/react";
import { animate, motionValue } from "motion/react";
import { haptic } from "../lib/haptics";
import { screenScale } from "../lib/util";
import { spring } from "../ui/motion";
import s from "./Edges.module.css";
import { classifyBottomSwipe, classifyTopSwipe, type BottomSwipe } from "./gestures";
import { unlock } from "./LockScreen";
import { useOS } from "./store";

/** Upward travel (logical px) of a live bottom-edge swipe; AppLayer shrinks the app with it. */
export const homeSwipe = motionValue(0);

function perform(kind: BottomSwipe) {
  const os = useOS.getState();
  if (!kind) return;
  if (os.locked) {
    if (kind === "home") unlock();
    return;
  }
  if (kind === "home") {
    haptic("light");
    if (os.jiggle) useOS.setState({ jiggle: false });
    os.goHome();
  } else if (kind === "switcher") {
    haptic("medium");
    useOS.setState({ overlay: "switcher", jiggle: false });
  } else {
    const previous = os.recents[1];
    if (previous) os.launch(previous);
  }
}

/** Home indicator plus the invisible edge zones that own the system gestures. */
export function Edges({ tone }: { tone: "light" | "dark" }) {
  const bindBottom = useDrag(
    ({ movement: [mx, my], velocity: [, vy], direction: [, dy], last, event }) => {
      const k = screenScale(event.target as Element);
      const hasApp = useOS.getState().openApp !== null;
      if (!last) {
        if (hasApp) homeSwipe.set(Math.max(0, -my / k));
        return;
      }
      animate(homeSwipe, 0, spring());
      perform(classifyBottomSwipe(mx / k, my / k, (vy / k) * dy));
    },
    { filterTaps: true },
  );

  const bindTop = useDrag(
    ({ movement: [, my], initial: [startX], last, event }) => {
      if (!last) return;
      const screen = (event.target as Element).closest("[data-screen]")?.getBoundingClientRect();
      const k = screenScale(event.target as Element);
      const overlay = classifyTopSwipe((startX - (screen?.left ?? 0)) / k, my / k, 390);
      if (!overlay) return;
      haptic("light");
      useOS.setState({ overlay });
    },
    { axis: "y", filterTaps: true },
  );

  return (
    <>
      <div className={`${s.top} ${s.left}`} {...bindTop()} aria-hidden="true" />
      <div className={`${s.top} ${s.right}`} {...bindTop()} aria-hidden="true" />
      <div className={s.bottom} {...bindBottom()} aria-hidden="true">
        <span className={s.indicator} style={{ background: tone === "light" ? "#000" : "#fff" }} />
      </div>
    </>
  );
}
