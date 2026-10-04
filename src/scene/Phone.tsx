import { Html } from "@react-three/drei";
import { useFrame, useThree } from "@react-three/fiber";
import { Suspense, useEffect, useMemo, useRef, type ReactNode, type RefObject } from "react";
import { Matrix4, type Group } from "three";
import { useOS } from "../os/store";
import { PHONE, PX, REFLECTION_ONLY, roundedRect, SCREEN, SCREEN_LAYER } from "./geometry";
import { HardwareButtons } from "./HardwareButtons";
import { IPhone } from "./IPhone";
import { RevealFrame } from "./RevealFrame";

const SHAKE = { freq: 42, decay: 12 };
/** Cool spill from the lit screen onto the stand and desk, scaled by brightness. */
const GLOW = { intensity: 6, distance: 14, color: "#b9c6ff" };
/** Quiet time after the last camera move before the screen is re-rasterised crisp. */
const SETTLE_MS = 180;

/**
 * Chrome re-rasterises the CSS3D screen at every new scale while the camera moves, so glyphs snap to a
 * different pixel grid each frame and text shimmers. `will-change: transform` pins the raster during
 * motion (smooth, slightly soft); dropping it once the camera rests gives one crisp raster at the final scale.
 */
function usePinnedRasterWhileMoving(layer: RefObject<HTMLDivElement | null>) {
  const last = useRef(new Matrix4());
  const idle = useRef<ReturnType<typeof setTimeout>>(undefined);
  useEffect(() => () => clearTimeout(idle.current), []);
  useFrame(({ camera }) => {
    const el = layer.current;
    if (!el || last.current.equals(camera.matrixWorld)) return;
    last.current.copy(camera.matrixWorld);
    el.style.willChange = "transform";
    clearTimeout(idle.current);
    idle.current = setTimeout(() => (el.style.willChange = ""), SETTLE_MS);
  });
}

/** The phone, centred on its origin: the iPhone model with the live DOM screen in place of its display, plus buttons. */
export function Phone({ screen, portal, onLoad }: { screen: ReactNode; portal: RefObject<HTMLElement>; onLoad?: () => void }) {
  const group = useRef<Group>(null);
  const layer = useRef<HTMLDivElement>(null);
  usePinnedRasterWhileMoving(layer);
  const invalidate = useThree(s => s.invalidate);
  const glow = useOS(s => (s.screenOn ? s.brightness : 0));
  useEffect(() => invalidate(), [glow, invalidate]);
  const screenHole = useMemo(() => roundedRect(SCREEN.w, SCREEN.h, SCREEN.radius), []);

  // frameloop="demand": a haptic impulse has to request frames itself.
  useEffect(
    () =>
      useOS.subscribe((s, prev) => {
        if (s.shake !== prev.shake) invalidate();
      }),
    [invalidate],
  );

  // The phone rests on its stand; only a haptic impulse moves it, as a short decaying buzz.
  useFrame(() => {
    const g = group.current;
    if (!g) return;
    const { amp, at } = useOS.getState().shake;
    const since = (performance.now() - at) / 1000;
    const shake = amp * Math.exp(-since * SHAKE.decay) * Math.sin(since * SHAKE.freq);
    // Time-based, not value-based: sin() crosses zero, so |shake| alone would stop the loop early.
    const active = amp > 0 && since * SHAKE.decay < 6;
    g.position.x = active ? shake : 0;
    g.rotation.z = active ? shake * 0.3 : 0;
    if (active) invalidate();
  });

  return (
    <group ref={group}>
      <Suspense fallback={<RevealFrame onReveal={onLoad} />}>
        <IPhone />
      </Suspense>
      {/*
        Cover glass over the DOM screen. The canvas sits above the DOM (occlude="blending"), so a black,
        reflection-only layer here adds highlights on top of the live screen: the lamp, the room, Fresnel at grazing angles.
      */}
      <mesh position-z={PHONE.d / 2 + 0.03} raycast={() => null}>
        <shapeGeometry args={[screenHole, 24]} />
        <meshPhysicalMaterial color="#000" roughness={0.1} metalness={0} {...REFLECTION_ONLY} />
      </mesh>
      <Html
        ref={layer}
        wrapperClass={SCREEN_LAYER}
        transform
        occlude="blending"
        geometry={<shapeGeometry args={[screenHole, 24]} />}
        distanceFactor={PX * 400}
        // Clear of the front glass by more than depth precision at max orbit distance, or the glass z-fights through.
        position-z={PHONE.d / 2 + 0.01}
        zIndexRange={[10, 0]}
        // A fixed portal: the default target switches once R3F connects events, remounting the screen root.
        portal={portal}
      >
        {screen}
      </Html>
      {/* Below the screen, so its mirror image in the cover glass falls off the screen. */}
      <pointLight position={[0, -PHONE.h / 2 - 1.5, 2.5]} {...GLOW} intensity={GLOW.intensity * glow} />
      <HardwareButtons />
    </group>
  );
}
