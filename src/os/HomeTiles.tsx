import { motion } from "motion/react";
import { useRef, type MouseEvent, type PointerEvent } from "react";
import { projectById } from "../apps/projects/data";
import { openProject } from "../apps/projects/open";
import { appById, iconProps } from "../apps/registry";
import { haptic } from "../lib/haptics";
import { cx, originOf } from "../lib/util";
import { Glass } from "../ui/Glass";
import { AppIcon } from "../ui/AppIcon";
import { spring } from "../ui/motion";
import s from "./HomeTiles.module.css";
import { useOS } from "./store";

export type Folder = { folder: string; apps: string[] };

const LONG_PRESS = { ms: 500, slop: 8 };

/** Long press enters jiggle mode; the click that ends a long press is swallowed. */
function useLongPress(onLong: () => void) {
  const timer = useRef<ReturnType<typeof setTimeout>>(undefined);
  const start = useRef({ x: 0, y: 0 });
  const fired = useRef(false);
  const cancel = () => clearTimeout(timer.current);
  return {
    onPointerDown: (e: PointerEvent) => {
      fired.current = false;
      start.current = { x: e.clientX, y: e.clientY };
      timer.current = setTimeout(() => {
        fired.current = true;
        onLong();
      }, LONG_PRESS.ms);
    },
    onPointerMove: (e: PointerEvent) => {
      if (Math.hypot(e.clientX - start.current.x, e.clientY - start.current.y) > LONG_PRESS.slop) cancel();
    },
    onPointerUp: cancel,
    onPointerLeave: cancel,
    onClickCapture: (e: MouseEvent) => fired.current && e.stopPropagation(),
  };
}

function enterJiggle() {
  haptic("medium");
  useOS.setState({ jiggle: true });
}

export function AppTile({ id, label = true }: { id: string; label?: boolean }) {
  const app = appById(id);
  const jiggle = useOS(st => st.jiggle);
  const longPress = useLongPress(enterJiggle);
  const badge = useOS(st => app?.badge?.(st) ?? 0);
  if (!app) return null;
  const open = (e: MouseEvent<HTMLButtonElement>) => {
    if (jiggle) return;
    const icon = e.currentTarget.firstElementChild;
    useOS.getState().launch(id, icon ? originOf(icon) : undefined);
  };
  return (
    <button className={cx(s.tile, jiggle && s.jiggle)} onClick={open} aria-label={app.name} {...longPress}>
      <AppIcon {...iconProps(app)} badge={badge} />
      {label && <span className={s.name}>{app.name}</span>}
    </button>
  );
}

/** A project installed from App Store: opens Projelerim on that project. */
export function ProjectTile({ id }: { id: string }) {
  const project = projectById(id);
  const jiggle = useOS(st => st.jiggle);
  const longPress = useLongPress(enterJiggle);
  if (!project) return null;
  const open = (e: MouseEvent<HTMLButtonElement>) => {
    if (jiggle) return;
    const icon = e.currentTarget.firstElementChild;
    openProject(id, icon ? originOf(icon) : undefined);
  };
  return (
    <button className={cx(s.tile, jiggle && s.jiggle)} onClick={open} aria-label={project.name} {...longPress}>
      <AppIcon icon={project.icon} accent={project.accent} />
      <span className={s.name}>{project.name}</span>
    </button>
  );
}

export function FolderTile({ folder, onOpen }: { folder: Folder; onOpen: () => void }) {
  return (
    <button className={s.tile} onClick={onOpen} aria-label={`${folder.folder} klasörü`}>
      <Glass className={s.folderIcon}>
        {folder.apps.map(id => {
          const app = appById(id);
          return app && <AppIcon key={id} {...iconProps(app)} size={18} />;
        })}
      </Glass>
      <span className={s.name}>{folder.folder}</span>
    </button>
  );
}

/** Open folder: blurred scrim with the apps on a glass panel; any tap closes it. */
export function FolderOverlay({ folder, onClose }: { folder: Folder; onClose: () => void }) {
  return (
    <motion.div className={s.folderScrim} onClick={onClose} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
      <h2 className={s.folderTitle}>{folder.folder}</h2>
      <Glass className={s.folderPanel} initial={{ scale: 0.6 }} animate={{ scale: 1 }} exit={{ scale: 0.6 }} transition={spring()}>
        {folder.apps.map(id => (
          <AppTile key={id} id={id} />
        ))}
      </Glass>
    </motion.div>
  );
}
