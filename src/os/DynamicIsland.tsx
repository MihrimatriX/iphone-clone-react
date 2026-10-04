import { AnimatePresence, motion } from "motion/react";
import { useEffect, useState, type ReactNode } from "react";
import { useShallow } from "zustand/react/shallow";
import { useNow } from "../lib/util";
import s from "./DynamicIsland.module.css";
import { CallLive, FaceId, MusicLive, TimerLive, Toast } from "./LiveActivities";
import { useOS } from "./store";

const TOAST_MS = 1800;
/** Island morphs overshoot a little, like iOS; the shared UI spring is too damped for it. */
const ISLAND_SPRING = { type: "spring", bounce: 0.3, visualDuration: 0.45 } as const;
const SIZE = {
  idle: { width: 126, height: 37, borderRadius: 18.5 },
  compact: { width: 240, height: 37, borderRadius: 18.5 },
  faceId: { width: 130, height: 130, borderRadius: 44 },
  expanded: { width: 370, height: 88, borderRadius: 44 },
};

type Activity = "faceId" | "toast" | "call" | "timer" | "music" | null;

/** Highest-priority live activity right now. */
function useActivity(): Activity {
  const { faceId, toast, call, timerOn, playing } = useOS(
    useShallow(st => ({
      faceId: st.faceId,
      toast: st.toast,
      call: st.call,
      timerOn: st.timer.endsAt !== null || st.timer.left > 0,
      playing: st.music.playing,
    })),
  );
  const [toastOn, setToastOn] = useState(false);
  useEffect(() => {
    if (!toast) return;
    setToastOn(true);
    const id = setTimeout(() => setToastOn(false), TOAST_MS);
    return () => clearTimeout(id);
  }, [toast]);
  if (faceId) return "faceId";
  if (toastOn) return "toast";
  if (call) return "call";
  if (timerOn) return "timer";
  if (playing) return "music";
  return null;
}

export function DynamicIsland() {
  const activity = useActivity();
  const [expanded, setExpanded] = useState(false);
  // Only call/timer show seconds; otherwise a slow tick keeps idle re-renders away.
  const now = useNow(activity === "call" || activity === "timer" ? 1000 : 60_000);
  const canExpand = activity === "call" || activity === "timer" || activity === "music";
  const isExpanded = expanded && canExpand;
  let size = activity ? SIZE.compact : SIZE.idle;
  if (activity === "faceId") size = SIZE.faceId;
  if (isExpanded) size = SIZE.expanded;

  const content: Record<NonNullable<Activity>, ReactNode> = {
    faceId: <FaceId />,
    toast: <Toast />,
    call: <CallLive expanded={isExpanded} now={now} />,
    timer: <TimerLive expanded={isExpanded} />,
    music: <MusicLive expanded={isExpanded} />,
  };

  return (
    <motion.div
      className={s.island}
      animate={size}
      transition={ISLAND_SPRING}
      role={canExpand ? "button" : undefined}
      aria-label={canExpand ? "Canlı etkinlik" : undefined}
      aria-expanded={canExpand ? isExpanded : undefined}
      tabIndex={canExpand ? 0 : undefined}
      onClick={() => canExpand && setExpanded(v => !v)}
      onKeyDown={e => {
        if (canExpand && (e.key === "Enter" || e.key === " ")) setExpanded(v => !v);
      }}
    >
      <AnimatePresence mode="popLayout">
        <motion.div
          key={`${activity}-${isExpanded}`}
          className={s.content}
          initial={{ opacity: 0, scale: 0.9, filter: "blur(4px)" }}
          animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
          exit={{ opacity: 0, scale: 0.9, filter: "blur(4px)" }}
          transition={{ duration: 0.2, delay: 0.04 }}
        >
          {activity && content[activity]}
        </motion.div>
      </AnimatePresence>
    </motion.div>
  );
}
