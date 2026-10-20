import { motion } from "motion/react";
import { spring } from "./motion";
import s from "./Toggle.module.css";

type ToggleProps = { on: boolean; onChange: (on: boolean) => void; label: string; color?: string };

/** iOS switch: real button with role="switch" so keyboard and screen readers work. */
export function Toggle({ on, onChange, label, color = "var(--green)" }: ToggleProps) {
  return (
    <button
      role="switch"
      aria-checked={on}
      aria-label={label}
      className={s.track}
      style={{ background: on ? color : "var(--toggle-off)" }}
      onClick={() => onChange(!on)}
    >
      <motion.span className={s.knob} animate={{ x: on ? 22 : 0 }} whileTap={{ scaleX: 1.25 }} transition={spring()} />
    </button>
  );
}
