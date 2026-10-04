import { AnimatePresence, motion } from "motion/react";
import type { ReactNode } from "react";
import { spring } from "./motion";
import s from "./Sheet.module.css";

type SheetProps = { open: boolean; onClose: () => void; title?: string; children: ReactNode };

const DISMISS_PX = 120;

/** Bottom sheet with scrim; drag down or tap outside to dismiss. */
export function Sheet({ open, onClose, title, children }: SheetProps) {
  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            key="scrim"
            className={s.scrim}
            onClick={onClose}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          />
          <motion.div
            key="sheet"
            role="dialog"
            aria-modal="true"
            aria-label={title}
            className={s.sheet}
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={spring()}
            drag="y"
            dragConstraints={{ top: 0, bottom: 0 }}
            dragElastic={{ top: 0, bottom: 0.7 }}
            onDragEnd={(_, info) => info.offset.y > DISMISS_PX && onClose()}
          >
            <div className={s.grabber} />
            {title && <h2 className={s.title}>{title}</h2>}
            {children}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
