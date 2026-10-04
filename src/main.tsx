import { lazy, Suspense, useEffect, useState } from "react";
import { createRoot } from "react-dom/client";
import { hardware } from "./os/hardware";
import { Shell } from "./os/Shell";
import { useOS } from "./os/store";
import "./ui/tokens.css";

// Dev-only console handle: `os.getState()`, `os.setState({ overlay: "switcher" })`.
if (process.env.NODE_ENV !== "production") Object.assign(window, { os: useOS });

// three.js stays out of the bundle on phones, where flat mode is the default.
const Scene = lazy(() => import("./scene/Scene"));

const SHORTCUTS: Record<string, () => void> = {
  f: () => useOS.setState(s => ({ flat: !s.flat })),
  l: hardware.power,
  "+": () => hardware.volume(1),
  "=": () => hardware.volume(1),
  "-": () => hardware.volume(-1),
  m: hardware.action,
  k: hardware.camera,
  c: () => useOS.setState({ overlay: "control" }),
  n: () => useOS.setState({ overlay: "notifications" }),
  s: () => useOS.setState({ overlay: "switcher" }),
  // Escape peels one layer: an open overlay first, then the app.
  Escape: () => (useOS.getState().overlay ? useOS.setState({ overlay: null }) : useOS.getState().goHome()),
};

function useShortcuts() {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const typing = e.target instanceof HTMLElement && e.target.closest("input, textarea, [contenteditable]");
      if (typing || e.ctrlKey || e.metaKey || e.altKey) return;
      SHORTCUTS[e.key.length === 1 ? e.key.toLowerCase() : e.key]?.();
    };
    addEventListener("keydown", onKey);
    return () => removeEventListener("keydown", onKey);
  }, []);
}

const fitScale = () => Math.min(innerWidth / 390, innerHeight / 844) * (matchMedia("(pointer: coarse)").matches ? 1 : 0.94);

/** 2D mode: the screen scaled to fit the viewport. */
function FlatView() {
  const [scale, setScale] = useState(fitScale);
  useEffect(() => {
    const onResize = () => setScale(fitScale());
    addEventListener("resize", onResize);
    return () => removeEventListener("resize", onResize);
  }, []);
  return (
    <div style={{ position: "fixed", inset: 0, display: "grid", placeItems: "center", background: "var(--scene-bg)" }}>
      <div style={{ width: 390 * scale, height: 844 * scale }}>
        <div style={{ transform: `scale(${scale})`, transformOrigin: "0 0" }}>
          <Shell />
        </div>
      </div>
    </div>
  );
}

function Root() {
  const flat = useOS(s => s.flat);
  useShortcuts();
  return flat ? (
    <FlatView />
  ) : (
    <Suspense fallback={null}>
      <Scene />
    </Suspense>
  );
}

// No StrictMode: drei <Html> owns a nested React root, and StrictMode's double effect
// unmounts it asynchronously after the remount, leaving the phone screen empty.
(import.meta.hot.data.root ??= createRoot(document.getElementById("root")!)).render(<Root />);
