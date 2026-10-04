import { useDrag } from "@use-gesture/react";
import { useRef } from "react";
import { animate, motion, useMotionValue, useTransform } from "motion/react";
import { useShallow } from "zustand/react/shallow";
import { haptic } from "../lib/haptics";
import { fmtDate, fmtTime, screenScale, useNow } from "../lib/util";
import { spring } from "../ui/motion";
import { SWIPE } from "./gestures";
import { NowPlaying, Shortcuts } from "./LockControls";
import s from "./LockScreen.module.css";
import { LockWidgets } from "./LockWidgets";
import { NotifStack } from "./NotifStack";
import { useOS, type AppId } from "./store";
import { wallpaperOf } from "./wallpapers";

const FACE_ID_MS = { scan: 650, ok: 400 };
const UNLOCK_PX = 110;

/** Face ID runs in the Dynamic Island, then the lock screen slides away. */
export function unlock(then?: AppId) {
  const os = useOS.getState();
  if (os.faceId) return;
  useOS.setState({ faceId: "scan" });
  setTimeout(() => {
    haptic("success");
    useOS.setState({ faceId: "ok" });
    setTimeout(() => {
      useOS.setState({ faceId: null, locked: false });
      if (then) useOS.getState().launch(then);
    }, FACE_ID_MS.ok);
  }, FACE_ID_MS.scan);
}

export function LockScreen() {
  const { wallpaper, notifs, music } = useOS(useShallow(st => ({ wallpaper: st.wallpaper, notifs: st.notifs, music: st.music })));
  const now = useNow(1000);
  const y = useMotionValue(0);
  const fade = useTransform(y, [-300, 0], [0, 1]);
  const hintFade = useTransform(y, [-80, 0], [0, 1]);
  const wall = wallpaperOf(wallpaper);

  const gestureRef = useRef<HTMLDivElement>(null);
  useDrag(
    ({ movement: [, my], velocity: [, vy], direction: [, dy], last, event }) => {
      const offset = Math.min(0, my / screenScale(event.target as Element));
      if (!last) return y.set(offset);
      const flicked = dy < 0 && vy > SWIPE.flick;
      animate(y, 0, spring());
      if (offset < -UNLOCK_PX || flicked) unlock();
    },
    { axis: "y", filterTaps: true, target: gestureRef },
  );

  return (
    <motion.div
      className={s.lock}
      data-tone={wall.tone}
      style={{ background: wall.css, y }}
      initial={false}
      exit={{ y: -844, transition: { duration: 0.35, ease: [0.3, 0, 0.2, 1] } }}
      ref={gestureRef}
    >
      <motion.div className={s.clock} style={{ opacity: fade }}>
        <span className={s.date}>{fmtDate(now)}</span>
        <span className={s.time}>{fmtTime(now)}</span>
        <LockWidgets />
      </motion.div>
      <div className={s.stack}>
        {(music.playing || music.track > 0) && <NowPlaying />}
        <NotifStack notifs={notifs} now={now} onOpen={n => unlock(n.app)} />
      </div>
      <Shortcuts />
      <motion.div className={s.hintWrap} style={{ opacity: hintFade }}>
        {/* Also a button, so keyboard and switch users can unlock without the swipe. */}
        <button className={s.hint} onClick={() => unlock()}>
          Açmak için yukarı kaydırın
        </button>
      </motion.div>
    </motion.div>
  );
}
