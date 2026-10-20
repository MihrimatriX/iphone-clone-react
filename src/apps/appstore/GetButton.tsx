import { motion } from "motion/react";
import { useState, type MouseEvent } from "react";
import { haptic } from "../../lib/haptics";
import { originOf } from "../../lib/util";
import { useOS } from "../../os/store";
import { openProject } from "../projects/open";
import s from "./GetButton.module.css";

const DOWNLOAD_S = 1.2;
const RING_R = 14;

const install = (id: string) =>
  useOS.setState(st => ({ installed: st.installed.includes(id) ? st.installed : [...st.installed, id] }));

export const uninstall = (id: string) => useOS.setState(st => ({ installed: st.installed.filter(i => i !== id) }));

/** App Store pill: AL → progress ring (fake download) → AÇ, which deep links into Projelerim. */
export function GetButton({ id }: { id: string }) {
  const installed = useOS(st => st.installed.includes(id));
  const [loading, setLoading] = useState(false);
  const finish = () => {
    install(id);
    haptic("success");
    setLoading(false);
  };

  if (loading) {
    return (
      <motion.span className={s.ring} role="progressbar" aria-label="Yükleniyor" initial={{ scale: 0.5, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}>
        <svg viewBox="0 0 32 32" width={32} height={32}>
          <circle cx={16} cy={16} r={RING_R} className={s.track} />
          <motion.circle
            cx={16}
            cy={16}
            r={RING_R}
            className={s.progress}
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ duration: DOWNLOAD_S, ease: "easeInOut" }}
            onAnimationComplete={finish}
          />
          <rect x={12} y={12} width={8} height={8} rx={1.5} fill="currentColor" />
        </svg>
      </motion.span>
    );
  }

  const press = (e: MouseEvent<HTMLButtonElement>) => {
    haptic("light");
    if (installed) openProject(id, originOf(e.currentTarget));
    else setLoading(true);
  };
  return (
    <button className={s.get} onClick={press} aria-label={installed ? "Aç" : "Al"}>
      {installed ? "AÇ" : "AL"}
    </button>
  );
}
