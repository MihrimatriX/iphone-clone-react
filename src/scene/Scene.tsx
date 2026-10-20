import { ContactShadows, Environment, Lightformer } from "@react-three/drei";
import { Canvas } from "@react-three/fiber";
import { Suspense, useCallback, useRef, useState } from "react";
import { setConsoleFunction } from "three";
import { Shell } from "../os/Shell";
import { CAMERA, Controls } from "./Controls";
import { Decor } from "./Decor";
import { Desk, Mount, Stand } from "./Desk";
import { Lamp } from "./Lamp";
import { Phone } from "./Phone";
import { Props } from "./Props";
import { RevealFrame } from "./RevealFrame";
import { Room } from "./Room";
import s from "./Scene.module.css";

// Third-party noise only: R3F 9 still constructs THREE.Clock (deprecated in r183) and ANGLE on
// Windows reports HLSL precision notes as shader "warnings". Everything else is forwarded.
const THREE_NOISE = /Clock: This module has been deprecated|Program Info Log:[\s\S]*X4122/;
setConsoleFunction((type, message, ...params) => {
  if (type === "warn" && THREE_NOISE.test(message)) return;
  console[type](message, ...params);
});

/** Studio light box baked once into the environment map; kept dim so it mostly feeds reflections. */
function Studio() {
  return (
    <Environment resolution={256} frames={1} environmentIntensity={0.3}>
      <color attach="background" args={["#1e1b19"]} />
      <Lightformer form="rect" intensity={6} position={[0, 7, 9]} scale={[16, 5, 1]} />
      <Lightformer form="rect" intensity={4} position={[-9, 1, 4]} scale={[3, 16, 1]} />
      <Lightformer form="rect" intensity={3} position={[9, -1, 4]} scale={[3, 16, 1]} />
      <Lightformer form="ring" intensity={4} position={[0, 2, -10]} scale={8} />
      <Lightformer form="rect" intensity={1.5} position={[0, -9, 2]} scale={[16, 6, 1]} />
    </Environment>
  );
}

export default function Scene() {
  const stage = useRef<HTMLDivElement>(null!);
  // Contact shadows are baked once (frames={1}); re-bake them each time a batch of models (room, phone) arrives.
  const [bakes, setBakes] = useState(0);
  const onReveal = useCallback(() => setBakes(n => n + 1), []);
  return (
    <div ref={stage} className={s.stage}>
      <Canvas
        dpr={[1, 2]}
        frameloop="demand"
        shadows="percentage"
        gl={{ alpha: true, antialias: true }}
        camera={{ fov: CAMERA.fov, near: 1, far: 600, position: [0, 0, 34] }}
      >
        {/* Everything fades to the room tone outside the lamp's reach. */}
        <fog attach="fog" args={["#0b0a0c", 70, 190]} />
        <Studio />
        {/* Models and PBR textures stream in on their own; the phone never waits for them. */}
        <Suspense fallback={<RevealFrame onReveal={onReveal} />}>
          <Desk />
          <Lamp />
          <Decor />
          <Room />
        </Suspense>
        <Props />
        <Stand />
        <Mount>
          <Phone screen={<Shell />} portal={stage} onLoad={onReveal} />
        </Mount>
        <ContactShadows key={bakes} position={[0, 0.01, -14]} opacity={0.6} scale={[130, 64]} resolution={1024} blur={2} far={20} frames={1} />
        <Controls stage={stage} />
      </Canvas>
      <p className={s.hint}>Sürükle: döndür · Çift tık: ekrana odaklan · F: düz mod · L: kilit · +/−: ses · M: eylem · K: kamera</p>
    </div>
  );
}
