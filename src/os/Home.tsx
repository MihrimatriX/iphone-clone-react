import { useDrag } from "@use-gesture/react";
import { animate, AnimatePresence, motion, useMotionValue } from "motion/react";
import { useEffect, useState, type MouseEvent } from "react";
import { useShallow } from "zustand/react/shallow";
import { haptic } from "../lib/haptics";
import { cx, screenScale } from "../lib/util";
import { Glass } from "../ui/Glass";
import { Icon } from "../ui/icons";
import { spring } from "../ui/motion";
import { pageAfterSwipe, SWIPE } from "./gestures";
import s from "./Home.module.css";
import { AppTile, FolderOverlay, FolderTile, ProjectTile, type Folder } from "./HomeTiles";
import { useOS } from "./store";
import { wallpaperOf } from "./wallpapers";
import { Widget, type WidgetKind } from "./Widgets";

type Cell = string | { widget: WidgetKind } | Folder | { project: string };

/**
 * iOS grid: 4 columns × 6 rows, a widget takes 2×2. Page 1 is full: 12 non-dock apps minus the two in the
 * folder leave 11 icons, so the clock widget fills rows 5–6 and the last cell stays empty like on an iPhone.
 */
const PAGE_ONE: Cell[] = [
  { widget: "weather" },
  { widget: "calendar" },
  ...["calendar", "photos", "camera", "weather", "notes", "reminders", "contacts", "settings", "appstore", "projects"],
  { widget: "clock" },
  { folder: "Araçlar", apps: ["calculator", "clock"] },
];
const DOCK = ["phone", "safari", "messages", "music"];
const PAGE_W = 390;
/** iOS zooms the home screen into the tapped icon while the app grows out of it. */
const APP_OPEN_ZOOM = 1.08;

function renderCell(cell: Cell, openFolder: (f: Folder) => void) {
  if (typeof cell === "string") return <AppTile key={cell} id={cell} />;
  if ("widget" in cell) return <Widget key={`widget-${cell.widget}`} kind={cell.widget} />;
  if ("project" in cell) return <ProjectTile key={`project-${cell.project}`} id={cell.project} />;
  return <FolderTile key={cell.folder} folder={cell} onOpen={() => openFolder(cell)} />;
}

/** App Store installs get page 2, which only exists once something is installed. */
// ponytail: page 2 holds 24 icons (7 projects exist); paginate when data outgrows it.
const pagesWith = (installed: string[]): Cell[][] =>
  installed.length ? [PAGE_ONE, installed.map(project => ({ project }))] : [PAGE_ONE];

export function Home() {
  const os = useOS(
    useShallow(st => ({ wallpaper: st.wallpaper, jiggle: st.jiggle, installed: st.installed, appOpen: st.openApp !== null, origin: st.origin })),
  );
  const pages = pagesWith(os.installed);
  const [page, setPage] = useState(0);
  const [swiping, setSwiping] = useState(false);
  const [folder, setFolder] = useState<Folder | null>(null);
  const x = useMotionValue(0);
  const tone = wallpaperOf(os.wallpaper).tone;
  const exitJiggleOnBackground = (e: MouseEvent) => {
    if (os.jiggle && !(e.target as Element).closest("button")) useOS.setState({ jiggle: false });
  };

  const goToPage = (next: number) => {
    setPage(next);
    animate(x, -next * PAGE_W, spring());
  };
  // Uninstalling the last project removes page 2 under the user's feet.
  useEffect(() => {
    if (page >= pages.length) goToPage(pages.length - 1);
  }, [pages.length]);

  const bind = useDrag(
    ({ movement: [mx, my], velocity: [vx], axis, last, event }) => {
      const k = screenScale(event.target as Element);
      if (axis === "x") {
        setSwiping(!last);
        if (!last) return x.set(-page * PAGE_W + mx / k);
        const next = pageAfterSwipe(page, mx / k, vx / k, pages.length);
        if (next !== page) haptic("selection");
        goToPage(next);
      } else if (last && my / k > SWIPE.edgeOpen && !os.jiggle) {
        useOS.setState({ overlay: "spotlight" });
      }
    },
    { axis: "lock", filterTaps: true },
  );
  const showDots = (swiping || os.jiggle) && pages.length > 1;
  const zoomOrigin = os.origin ? `${os.origin.x}px ${os.origin.y}px` : "50% 50%";

  return (
    <div className={s.home} data-tone={tone} onClick={exitJiggleOnBackground}>
      <motion.div
        className={s.content}
        style={{ transformOrigin: zoomOrigin }}
        animate={{ scale: os.appOpen ? APP_OPEN_ZOOM : 1 }}
        transition={spring()}
      >
        <div className={s.viewport} {...bind()}>
          <motion.div className={s.pages} style={{ x }} data-swiping={swiping || undefined}>
            {pages.map((cells, i) => (
              <div key={i} className={s.page} aria-hidden={i !== page} inert={i !== page}>
                {cells.map(cell => renderCell(cell, setFolder))}
              </div>
            ))}
          </motion.div>
        </div>
        <AnimatePresence initial={false}>
          {showDots ? (
            <Glass key="dots" shape="pill" className={s.dots} aria-label={`Sayfa ${page + 1} / ${pages.length}`} {...fade}>
              {pages.map((_, i) => (
                <span key={i} className={cx(s.dot, i === page && s.dotOn)} />
              ))}
            </Glass>
          ) : (
            <Glass key="search" interactive shape="pill" className={s.search} onClick={() => useOS.setState({ overlay: "spotlight" })} {...fade}>
              <Icon name="search" size={13} />
              Ara
            </Glass>
          )}
        </AnimatePresence>
        <Glass className={s.dock}>
          {DOCK.map(id => (
            <AppTile key={id} id={id} label={false} />
          ))}
        </Glass>
      </motion.div>
      <motion.div className={s.dim} initial={false} animate={{ opacity: os.appOpen ? 1 : 0 }} transition={{ duration: 0.3 }} />
      {os.jiggle && (
        <Glass interactive shape="pill" className={s.done} onClick={() => useOS.setState({ jiggle: false })}>
          Bitti
        </Glass>
      )}
      <AnimatePresence>{folder && <FolderOverlay folder={folder} onClose={() => setFolder(null)} />}</AnimatePresence>
    </div>
  );
}

const fade = { initial: { opacity: 0, scale: 0.9 }, animate: { opacity: 1, scale: 1 }, exit: { opacity: 0, scale: 0.9 }, transition: { duration: 0.18 } };
