import { RoundedBox } from "@react-three/drei";
import { useMemo } from "react";
import { Mug } from "./Mug";
import { leatherTexture, pagesTexture } from "./surfaces";

const BOOK = { w: 15, d: 21, cover: 0.24, pages: 0.72 };
const TOP = BOOK.cover + BOOK.pages;
const HEIGHT = TOP + BOOK.cover;
const BAND_X = BOOK.w / 2 - 2;
const STEEL = { color: "#c4c4c8", metalness: 1, roughness: 0.22, envMapIntensity: 2 };

/** Pebbled leather: the grain darkens the colour a touch and raises a fine bump; sheen gives the soft rim light. */
function useLeather() {
  return useMemo(() => {
    const grain = leatherTexture();
    grain.repeat.set(4, 4);
    return { map: grain, bumpMap: grain, bumpScale: 1.5, color: "#33503f", roughness: 0.62, sheen: 0.4, sheenColor: "#9fb8a8" };
  }, []);
}

/** Black lacquer pen with a steel clip, centre band and tip, lying across the notebook. */
function Pen() {
  return (
    <group position={[1.5, 0.35, 1]} rotation={[0, 0.5, Math.PI / 2]}>
      <mesh castShadow>
        <cylinderGeometry args={[0.35, 0.33, 12, 32]} />
        <meshPhysicalMaterial color="#0d0d0f" roughness={0.25} clearcoat={1} clearcoatRoughness={0.05} />
      </mesh>
      <mesh position-y={1.2}>
        <cylinderGeometry args={[0.36, 0.36, 0.5, 32]} />
        <meshStandardMaterial {...STEEL} />
      </mesh>
      <mesh position-y={-6.55}>
        <coneGeometry args={[0.33, 1.1, 32]} />
        <meshStandardMaterial {...STEEL} />
      </mesh>
      <mesh position-y={6}>
        <sphereGeometry args={[0.35, 24, 12, 0, Math.PI * 2, 0, Math.PI / 2]} />
        <meshStandardMaterial {...STEEL} />
      </mesh>
      <RoundedBox args={[0.14, 3.4, 0.32]} radius={0.06} position={[0.42, 4.1, 0]}>
        <meshStandardMaterial {...STEEL} />
      </RoundedBox>
    </group>
  );
}

/** Leather notebook with a cream page block, an elastic band round the cover, a ribbon bookmark and a pen on top. */
function Notebook() {
  const leather = useLeather();
  const edges = useMemo(pagesTexture, []);
  return (
    <group position={[22, 0, 4]} rotation-y={-0.35}>
      {[0, TOP].map(at => (
        <RoundedBox key={at} args={[BOOK.w, BOOK.cover, BOOK.d]} radius={0.1} position-y={at + BOOK.cover / 2} castShadow receiveShadow>
          <meshPhysicalMaterial {...leather} />
        </RoundedBox>
      ))}
      <RoundedBox args={[0.5, HEIGHT, BOOK.d]} radius={0.2} position={[-BOOK.w / 2 + 0.25, HEIGHT / 2, 0]} castShadow>
        <meshPhysicalMaterial {...leather} />
      </RoundedBox>
      <mesh position={[0.2, BOOK.cover + BOOK.pages / 2, 0]} receiveShadow>
        <boxGeometry args={[BOOK.w - 0.6, BOOK.pages, BOOK.d - 0.5]} />
        <meshStandardMaterial map={edges} roughness={0.95} />
      </mesh>
      {/* Elastic band: a strip over the top cover and down both ends, not a solid slab. */}
      <mesh position={[BAND_X, HEIGHT + 0.015, 0]}>
        <boxGeometry args={[0.4, 0.03, BOOK.d + 0.06]} />
        <meshStandardMaterial color="#121212" roughness={0.85} />
      </mesh>
      {[1, -1].map(side => (
        <mesh key={side} position={[BAND_X, HEIGHT / 2, side * (BOOK.d / 2 + 0.03)]}>
          <boxGeometry args={[0.4, HEIGHT + 0.06, 0.03]} />
          <meshStandardMaterial color="#121212" roughness={0.85} />
        </mesh>
      ))}
      {/* Satin ribbon slipping out of the pages and down onto the desk. */}
      <mesh position={[-2.5, 0.29, BOOK.d / 2 + 1.05]} rotation-x={0.2} castShadow>
        <boxGeometry args={[0.6, 0.02, 2.7]} />
        <meshPhysicalMaterial color="#7a1f2b" roughness={0.4} sheen={1} sheenColor="#e07a88" />
      </mesh>
      <group position-y={HEIGHT}>
        <Pen />
      </group>
    </group>
  );
}

/** The mug of coffee, and the notebook in front-right. */
export function Props() {
  return (
    <group>
      <Mug />
      <Notebook />
    </group>
  );
}
