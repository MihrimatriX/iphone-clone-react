import { useDrag } from "@use-gesture/react";
import { animate, motion, useMotionValue, useTransform } from "motion/react";
import { useRef, type ReactNode } from "react";
import { appById } from "../apps/registry";
import { haptic } from "../lib/haptics";
import { fmtAgo, screenScale } from "../lib/util";
import { Glass } from "../ui/Glass";
import { Icon } from "../ui/icons";
import { spring } from "../ui/motion";
import { SWIPE } from "./gestures";
import s from "./NotifCard.module.css";
import { useOS, type Notif } from "./store";

const DISMISS_PX = 110;
const THROW_PX = -440;

export const dismissNotif = (id: string) => useOS.setState(st => ({ notifs: st.notifs.filter(x => x.id !== id) }));

type CardProps = { notif: Notif; now: number; onOpen: () => void; more?: number };

/** iOS notification: app icon, bold title with the time on the right, two-line body. Shared with the lock screen. */
export function NotifCard({ notif, now, onOpen, more = 0 }: CardProps) {
  const app = appById(notif.app);
  return (
    // No jelly stretch: a full-width card stretching while it is swiped reads as a glitch.
    <Glass interactive className={s.notif} onClick={onOpen} whileTap={{ scale: 0.97 }} onPointerMoveCapture={undefined}>
      <span className={s.icon} style={{ background: app?.accent }}>{app && <Icon name={app.icon} size={20} />}</span>
      <span className={s.text}>
        <span className={s.head}>
          <b>{notif.title}</b>
          <small>{fmtAgo(notif.at, now)}</small>
        </span>
        <span className={s.body}>{notif.body}</span>
        {more > 0 && <span className={s.more}>+{more} bildirim daha</span>}
      </span>
    </Glass>
  );
}

/** Swipe left past the threshold (or flick) to throw the card away; a drag never also counts as a tap. */
export function Swipeable({ onDismiss, children }: { onDismiss: () => void; children: ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);
  const dragged = useRef(false);
  const x = useMotionValue(0);
  const opacity = useTransform(x, [-320, -140, 0], [0, 1, 1]);
  useDrag(
    ({ movement: [mx], velocity: [vx], direction: [dx], last, tap, event }) => {
      const offset = Math.min(0, mx / screenScale(event.target as Element));
      if (!last) return x.set(offset);
      dragged.current = !tap;
      if (offset < -DISMISS_PX || (dx < 0 && vx > SWIPE.flick)) {
        haptic("light");
        void animate(x, THROW_PX, spring()).then(onDismiss);
      } else animate(x, 0, spring());
    },
    { axis: "x", filterTaps: true, target: ref },
  );
  return (
    <motion.div
      ref={ref}
      className={s.swipe}
      style={{ x, opacity }}
      onPointerDownCapture={() => (dragged.current = false)}
      onClickCapture={e => dragged.current && e.stopPropagation()}
    >
      {children}
    </motion.div>
  );
}
