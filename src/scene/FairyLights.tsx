import { useMemo } from "react";
import { AdditiveBlending, CatmullRomCurve3, Vector3 } from "three";
import { DESK } from "./Desk";
import { glowTexture } from "./textures";

/** Two swags of warm bulbs pinned along the wall above the desk. */
const STRING = { from: -62, to: 62, swags: 2, top: 17, sag: 4, bulbs: 15, z: DESK.front - DESK.d + 2.5 };
const WARM = "#ffc77a";

/** Points along each swag: a sine dip between pins approximates the hanging catenary. */
function stringPoints(): Vector3[] {
  const span = (STRING.to - STRING.from) / STRING.swags;
  const points: Vector3[] = [];
  for (let s = 0; s < STRING.swags; s++) {
    for (let i = s === 0 ? 0 : 1; i <= STRING.bulbs; i++) {
      const t = i / STRING.bulbs;
      points.push(new Vector3(STRING.from + span * (s + t), STRING.top - STRING.sag * Math.sin(Math.PI * t), STRING.z));
    }
  }
  return points;
}

/** Warm fairy lights: a dark wire, glowing bulbs with soft halos, and two faint lights washing the wall. */
export function FairyLights() {
  const { curve, bulbs } = useMemo(() => {
    const points = stringPoints();
    // Bulbs hang between the pins, not on them.
    return { curve: new CatmullRomCurve3(points), bulbs: points.filter((_, i) => i % STRING.bulbs !== 0) };
  }, []);
  const glow = useMemo(glowTexture, []);
  return (
    <group>
      <mesh>
        <tubeGeometry args={[curve, 240, 0.07, 6]} />
        <meshStandardMaterial color="#111" roughness={0.6} />
      </mesh>
      {bulbs.map(p => (
        <group key={p.x} position={[p.x, p.y - 0.5, p.z + 0.3]}>
          <mesh>
            <sphereGeometry args={[0.32, 12, 12]} />
            <meshStandardMaterial color="#fff2d8" emissive={WARM} emissiveIntensity={4} />
          </mesh>
          <sprite scale={[3.4, 3.4, 1]}>
            <spriteMaterial map={glow} color={WARM} blending={AdditiveBlending} depthWrite={false} transparent opacity={0.55} />
          </sprite>
        </group>
      ))}
      {[-31, 31].map(x => (
        <pointLight key={x} position={[x, STRING.top - 6, STRING.z + 3]} intensity={60} distance={45} color={WARM} />
      ))}
    </group>
  );
}
