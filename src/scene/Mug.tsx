import { useMemo } from "react";
import { CubicBezierCurve3, LatheGeometry, Vector2, Vector3 } from "three";
import { Steam } from "./Steam";
import { cremaTexture, glazeTexture } from "./surfaces";

/**
 * Half cross-section of the mug as [radius, height] in cm, spun into a solid with real wall thickness:
 * recessed base → foot ring → slightly tapered outer wall → rounded lip → inner wall → inner floor.
 * Order matters: LatheGeometry takes face winding and normals from it, and walking it the other way
 * turns the mug inside out (outer wall culled, inner wall seen from behind — it read as glass).
 */
const PROFILE: [number, number][] = [
  [0, 0.18], [2.52, 0.14], [2.62, 0], [3.12, 0],
  [3.34, 0.08], [3.58, 0.38], [3.72, 1.0], [4.0, 9.2],
  [3.96, 9.42], [3.83, 9.52], [3.7, 9.47], [3.62, 9.3],
  [3.35, 1.1], [3.0, 0.75], [0, 0.75],
];
const COFFEE = { y: 8, r: 3.58 };
/**
 * LatheGeometry spreads texture v by point index, not distance, so a long straight wall between two
 * points gets one sliver of the texture. Re-sampling evenly along the profile's length keeps the
 * glaze flecks round (and smooths the curves too).
 */
function resample(points: [number, number][], count: number): Vector2[] {
  const pts = points.map(([r, y]) => new Vector2(r, y));
  const lengths = pts.map((p, i) => (i === 0 ? 0 : p.distanceTo(pts[i - 1] ?? p)));
  const total = lengths.reduce((a, b) => a + b, 0);
  const out: Vector2[] = [];
  for (let k = 0, i = 1, walked = 0; k < count; k++) {
    const target = (k / (count - 1)) * total;
    while (i < pts.length - 1 && walked + (lengths[i] ?? 0) < target) walked += lengths[i++] ?? 0;
    const [a, b] = [pts[i - 1] ?? pts[0]!, pts[i] ?? pts[0]!];
    out.push(a.clone().lerp(b, Math.min(1, (target - walked) / (lengths[i] || 1))));
  }
  return out;
}

/** Glossy glaze: a clear coat over the speckled body, with stronger reflections than the dim room alone gives. */
const GLAZE = { roughness: 0.45, clearcoat: 1, clearcoatRoughness: 0.12, envMapIntensity: 2.2 };

/** Stoneware mug of black coffee with crema, a looped handle, and steam rising off it. */
export function Mug() {
  const body = useMemo(() => new LatheGeometry(resample(PROFILE, 90), 96), []);
  const handle = useMemo(
    () => new CubicBezierCurve3(new Vector3(3.9, 7.7, 0), new Vector3(7.4, 8.6, 0), new Vector3(7.4, 2.4, 0), new Vector3(3.75, 2.9, 0)),
    [],
  );
  const glaze = useMemo(() => {
    const t = glazeTexture();
    // ~8 cm tiles both ways: round the 25 cm girth, and along the ~21 cm profile.
    t.repeat.set(3, 2.6);
    return t;
  }, []);
  const crema = useMemo(cremaTexture, []);
  return (
    <group position={[-19, 0, -9]} rotation-y={0.6}>
      <mesh geometry={body} castShadow receiveShadow>
        <meshPhysicalMaterial map={glaze} {...GLAZE} />
      </mesh>
      {/* Squashed tube: an oval grip, flatter front to back like a pulled handle. */}
      <mesh scale={[1, 1, 1.5]} castShadow>
        <tubeGeometry args={[handle, 48, 0.42, 20]} />
        <meshPhysicalMaterial map={glaze} {...GLAZE} />
      </mesh>
      <mesh position-y={COFFEE.y} rotation-x={-Math.PI / 2}>
        <circleGeometry args={[COFFEE.r, 64]} />
        <meshPhysicalMaterial map={crema} roughness={0.35} clearcoat={0.8} clearcoatRoughness={0.1} />
      </mesh>
      <Steam y={COFFEE.y} />
    </group>
  );
}
