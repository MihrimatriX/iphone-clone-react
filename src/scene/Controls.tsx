import { OrbitControls } from "@react-three/drei";
import { useFrame, useThree } from "@react-three/fiber";
import { useEffect, useRef, type RefObject } from "react";
import type { Vector3 } from "three";
import type { OrbitControls as OrbitControlsImpl } from "three-stdlib";
import { SCREEN_CENTER, SCREEN_NORMAL } from "./Desk";
import { PHONE, SCREEN, SCREEN_LAYER } from "./geometry";

export const CAMERA = { fov: 30, homeMargin: 1.6, focusMargin: 1.12, homeLift: 0.08, homeDrop: 1.6 };
/** Azimuth stays under ~80°: any wider and, zoomed out, the camera ends up behind the wall. */
const ORBIT = { minDistance: 12, maxDistance: 95, minPolar: 0.6, maxPolar: 1.55, azimuth: 1.4 };
/** Extra room around the phone in the home shot so the stand and desk show. */
const STAND_ROOM = { w: 5, h: 4 };

/** Camera distance at which a w×h rectangle just fills the view, times margin. */
function fitDistance(w: number, h: number, aspect: number, margin: number) {
  const halfTan = Math.tan((CAMERA.fov * Math.PI) / 360);
  return Math.max(h / 2 / halfTan, w / 2 / (halfTan * aspect)) * margin;
}

type Shot = { position: Vector3; target: Vector3 };

/** Home: a little above the screen normal with desk in view. Focus: square-on to the screen. */
function shots(aspect: number): { home: Shot; focus: Shot } {
  const homeTarget = SCREEN_CENTER.clone().setY(SCREEN_CENTER.y - CAMERA.homeDrop);
  const homeDir = SCREEN_NORMAL.clone().setY(SCREEN_NORMAL.y + CAMERA.homeLift).normalize();
  const homeDistance = fitDistance(PHONE.w + STAND_ROOM.w, PHONE.h + STAND_ROOM.h, aspect, CAMERA.homeMargin);
  const focusDistance = fitDistance(SCREEN.w, SCREEN.h, aspect, CAMERA.focusMargin);
  return {
    home: { position: homeTarget.clone().addScaledVector(homeDir, homeDistance), target: homeTarget },
    focus: { position: SCREEN_CENTER.clone().addScaledVector(SCREEN_NORMAL, focusDistance), target: SCREEN_CENTER.clone() },
  };
}

/** Limited orbit plus a double-click tween that frames the screen (and back). */
export function Controls({ stage }: { stage: RefObject<HTMLDivElement> }) {
  const controls = useRef<OrbitControlsImpl>(null);
  const tween = useRef<Shot | null>(null);
  const { camera, invalidate, get } = useThree();

  useEffect(() => {
    const { width, height } = get().size;
    const { home } = shots(width / height);
    camera.position.copy(home.position);
    controls.current?.target.copy(home.target);
    controls.current?.update();
    invalidate();
  }, [camera, get, invalidate]);

  // On the stage, not the canvas: the screen DOM is portalled beside the canvas, not inside it.
  useEffect(() => {
    const el = stage.current;
    const onDoubleClick = (e: MouseEvent) => {
      const { width, height } = get().size;
      const { home, focus } = shots(width / height);
      // From the screen it only ever zooms in, so a quick double tap inside an app never throws the camera back.
      const fromScreen = e.target instanceof Element && e.target.closest(`.${SCREEN_LAYER}`);
      const focused = camera.position.distanceTo(focus.position) < 0.5;
      tween.current = focused && !fromScreen ? home : focus;
      invalidate();
    };
    el.addEventListener("dblclick", onDoubleClick);
    return () => el.removeEventListener("dblclick", onDoubleClick);
  }, [camera, invalidate, stage, get]);

  useFrame((_, dt) => {
    const shot = tween.current;
    if (!shot || !controls.current) return;
    const k = 1 - Math.exp(-dt * 7);
    camera.position.lerp(shot.position, k);
    controls.current.target.lerp(shot.target, k);
    controls.current.update();
    if (camera.position.distanceTo(shot.position) < 0.01) tween.current = null;
    else invalidate();
  });

  return (
    <OrbitControls
      ref={controls}
      makeDefault
      enablePan={false}
      minDistance={ORBIT.minDistance}
      maxDistance={ORBIT.maxDistance}
      minPolarAngle={ORBIT.minPolar}
      maxPolarAngle={ORBIT.maxPolar}
      minAzimuthAngle={-ORBIT.azimuth}
      maxAzimuthAngle={ORBIT.azimuth}
      onStart={() => (tween.current = null)}
    />
  );
}
