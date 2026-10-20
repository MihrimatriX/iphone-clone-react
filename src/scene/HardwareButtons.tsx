import { RoundedBox, useCursor } from "@react-three/drei";
import { useFrame, useThree } from "@react-three/fiber";
import { useRef, useState } from "react";
import type { Mesh } from "three";
import { hardware } from "../os/hardware";

/** Outer face of the model's side buttons (cm from the centre line), measured from its vertices. */
const SIDE_X = 3.886;
const SIZE = { thickness: 0.14, depth: 0.3, radius: 0.05 };
const TRAVEL = 0.04;
/** Black titanium, brushed along the long axis like the band it sits in. */
const RING = { color: "#3a3a3c", metalness: 1, roughness: 0.3, anisotropy: 0.7, anisotropyRotation: Math.PI / 2, envMapIntensity: 2.4 };

/** `visible`: only Camera Control is drawn here; the others are hit areas over the model's own buttons. */
type ButtonSpec = { name: string; side: 1 | -1; y: number; length: number; press: () => void; visible?: boolean };

/** Positions measured from the iPhone model's vertices (centre y and length along the band, cm). */
const BUTTONS: ButtonSpec[] = [
  { name: "power", side: 1, y: 2.37, length: 1.8, press: hardware.power },
  { name: "action", side: -1, y: 4.8, length: 0.65, press: hardware.action },
  { name: "volumeUp", side: -1, y: 3.45, length: 1.15, press: () => hardware.volume(1) },
  { name: "volumeDown", side: -1, y: 2.05, length: 1.15, press: () => hardware.volume(-1) },
  // The model is a 15 Pro Max; this adds the 16 Pro's Camera Control: low on the right, a sapphire crystal in a ring.
  { name: "camera", side: 1, y: -2.3, length: 1.9, press: hardware.camera, visible: true },
];

/** A side button: a click target, and for Camera Control a visible key that dips into the band while pressed. */
function HardwareButton({ side, y, length, press, visible }: ButtonSpec) {
  const mesh = useRef<Mesh>(null);
  const [pressed, setPressed] = useState(false);
  const [hovered, setHovered] = useState(false);
  const invalidate = useThree(s => s.invalidate);
  useCursor(hovered);
  // Proud of the band by ~0.01 when drawn; a hit area straddles the model's button surface instead.
  const rest = side * (SIDE_X - SIZE.thickness / 2 + (visible ? 0.005 : 0.03));

  useFrame(() => {
    const m = mesh.current;
    if (!m || !visible) return;
    const target = rest - (pressed ? side * TRAVEL : 0);
    m.position.x += (target - m.position.x) * 0.4;
    if (Math.abs(target - m.position.x) > 1e-4) invalidate();
  });

  const release = () => {
    setPressed(false);
    invalidate();
  };

  return (
    <RoundedBox
      ref={mesh}
      args={[SIZE.thickness, length, SIZE.depth]}
      radius={SIZE.radius}
      position={[rest, y, 0]}
      onPointerDown={e => {
        e.stopPropagation();
        setPressed(true);
        invalidate();
        press();
      }}
      onPointerUp={release}
      onPointerOver={() => setHovered(true)}
      onPointerOut={() => {
        setHovered(false);
        release();
      }}
    >
      {visible ? <meshPhysicalMaterial {...RING} /> : <meshBasicMaterial colorWrite={false} depthWrite={false} />}
      {visible && (
        <mesh position-x={side * (SIZE.thickness / 2 + 0.002)}>
          <boxGeometry args={[0.01, length - 0.22, SIZE.depth - 0.08]} />
          <meshPhysicalMaterial color="#14161c" roughness={0.04} metalness={0.3} clearcoat={1} envMapIntensity={2} />
        </mesh>
      )}
    </RoundedBox>
  );
}

export function HardwareButtons() {
  return (
    <group>
      {BUTTONS.map(b => (
        <HardwareButton key={b.name} {...b} />
      ))}
    </group>
  );
}
