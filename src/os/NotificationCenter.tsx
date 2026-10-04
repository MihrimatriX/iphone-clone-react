import { useDrag } from "@use-gesture/react";
import { useRef } from "react";
import { AnimatePresence, motion } from "motion/react";
import { haptic } from "../lib/haptics";
import { fmtDate, fmtTime, screenScale, useNow } from "../lib/util";
import { Glass } from "../ui/Glass";
import { spring } from "../ui/motion";
import { SWIPE } from "./gestures";
import { dismissNotif, NotifCard, Swipeable } from "./NotifCard";
import s from "./NotificationCenter.module.css";
import { useOS, type Notif } from "./store";

const close = () => useOS.setState({ overlay: null });

function openNotif(n: Notif) {
  dismissNotif(n.id);
  useOS.getState().launch(n.app);
}

export function NotificationCenter() {
  const notifs = useOS(st => st.notifs);
  const now = useNow(1000);
  const gestureRef = useRef<HTMLDivElement>(null);
  useDrag(
    ({ movement: [, my], last, event }) => {
      if (last && my / screenScale(event.target as Element) < -SWIPE.edgeOpen) close();
    },
    { axis: "y", filterTaps: true, target: gestureRef },
  );
  const clearAll = () => {
    haptic("medium");
    useOS.setState({ notifs: [] });
  };

  return (
    <motion.div
      className={s.center}
      data-tone="dark"
      initial={{ y: "-100%" }}
      animate={{ y: 0 }}
      exit={{ y: "-100%" }}
      transition={spring()}
      onClick={e => e.target === e.currentTarget && close()}
      ref={gestureRef}
    >
      <div className={s.clock}>
        <span>{fmtDate(now)}</span>
        <b>{fmtTime(now)}</b>
      </div>
      <div className={s.header}>
        <h2>Bildirim Merkezi</h2>
        {notifs.length > 0 && (
          <Glass interactive shape="pill" className={s.clear} onClick={clearAll}>
            Temizle
          </Glass>
        )}
      </div>
      <div className={s.list}>
        <AnimatePresence initial={false}>
          {notifs.map(n => (
            <motion.div key={n.id} layout="position" exit={{ opacity: 0, scale: 0.9 }} transition={spring()}>
              <Swipeable onDismiss={() => dismissNotif(n.id)}>
                <NotifCard notif={n} now={now} onOpen={() => openNotif(n)} />
              </Swipeable>
            </motion.div>
          ))}
        </AnimatePresence>
        {notifs.length === 0 && <p className={s.empty}>Bildirim yok</p>}
      </div>
    </motion.div>
  );
}
