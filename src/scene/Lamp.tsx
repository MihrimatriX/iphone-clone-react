import { Vector3 } from "three";
import { Model } from "./Decor";

const Y = new Vector3(0, 1, 0);
/** Where the lamp's pin enters the desk, and its turn so the head reaches over towards the phone. */
const MOUNT = new Vector3(-29, 0, -25);
const TURN = -2.09;
/** Bulb centre in the model (cm), from its "_light" primitive's bounds. */
const BULB = new Vector3(-0.45, 69.55, -17.65).applyAxisAngle(Y, TURN).add(MOUNT);
const TARGET = new Vector3(0, 3, 0);
/** Just below the bulb, toward the target, so the bulb's own mesh never sits on the light. */
const SOURCE = BULB.clone().add(TARGET.clone().sub(BULB).setLength(6));
/** Warm bulb ~70 cm up; its soft-edged pool is the scene's key light and vignette. */
const LIGHT = { intensity: 7500, angle: 0.36, penumbra: 1, color: "#ffd9a8" };

/** Arm desk lamp pinned to the back-left of the desk, with the scene's key spot light at its bulb. */
export function Lamp() {
  return (
    <group>
      <Model id="desk_lamp_arm_01" position={MOUNT.toArray()} rotation={TURN} />
      {/* Default target is the origin, i.e. the stand's foot. */}
      <spotLight
        position={SOURCE}
        {...LIGHT}
        castShadow
        shadow-mapSize={2048}
        shadow-bias={-0.0002}
        shadow-normalBias={0.03}
        shadow-radius={6}
        shadow-camera-near={5}
        shadow-camera-far={160}
      />
    </group>
  );
}
