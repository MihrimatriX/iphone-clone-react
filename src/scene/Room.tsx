import { FairyLights } from "./FairyLights";
import { Laptop } from "./Laptop";

/** Night-room set dressing: the laptop's glow, fairy lights, and cool moonlight from an unseen window. */
export function Room() {
  return (
    <group>
      <Laptop />
      <FairyLights />
      <directionalLight position={[60, 70, -80]} intensity={0.45} color="#8fa8ff" />
    </group>
  );
}
