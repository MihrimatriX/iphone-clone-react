import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";
import { Glass } from "../ui/Glass";
import { spring } from "../ui/motion";
import s from "./NotifCard.module.css";
import { dismissNotif, NotifCard, Swipeable } from "./NotifCard";
import type { Notif } from "./store";

const STACK_FROM = 3;
// Three keeps the fanned-out stack clear of the clock widgets even with Now Playing above it.
const MAX_EXPANDED = 3;

/** Lock screen notifications: three or more collapse into one stack with cards peeking behind; a tap fans them out. */
export function NotifStack({ notifs, now, onOpen }: { notifs: Notif[]; now: number; onOpen: (n: Notif) => void }) {
  const [expanded, setExpanded] = useState(false);
  const top = notifs[0];
  if (!top) return null;
  if (notifs.length >= STACK_FROM && !expanded) {
    return (
      <motion.div className={s.stack} layout transition={spring()}>
        <span className={`${s.behind} ${s.depth2}`} aria-hidden="true" />
        <span className={`${s.behind} ${s.depth1}`} aria-hidden="true" />
        <Swipeable onDismiss={() => dismissNotif(top.id)}>
          <NotifCard notif={top} now={now} more={notifs.length - 1} onOpen={() => setExpanded(true)} />
        </Swipeable>
      </motion.div>
    );
  }
  return (
    <>
      {notifs.length >= STACK_FROM && (
        <Glass interactive shape="pill" className={s.less} onClick={() => setExpanded(false)}>
          Daha az göster
        </Glass>
      )}
      <AnimatePresence initial={false}>
        {notifs.slice(0, MAX_EXPANDED).map((n, i) => (
          <motion.div
            key={n.id}
            layout="position"
            initial={{ opacity: 0, y: -24 * i, scale: 0.94 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0 }}
            transition={spring()}
          >
            <Swipeable onDismiss={() => dismissNotif(n.id)}>
              <NotifCard notif={n} now={now} onOpen={() => onOpen(n)} />
            </Swipeable>
          </motion.div>
        ))}
      </AnimatePresence>
    </>
  );
}
