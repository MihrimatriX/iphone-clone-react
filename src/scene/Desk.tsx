import { RoundedBox, useTexture } from "@react-three/drei";
import { useMemo, type ReactNode } from "react";
import { RepeatWrapping, SRGBColorSpace, Vector3 } from "three";
import { PHONE } from "./geometry";

const X_AXIS = new Vector3(1, 0, 0);
/** Phone lean on the stand, from vertical. */
export const LEAN = (14 * Math.PI) / 180;
const STAND = { width: 7.8, base: 0.36, back: 9.5, plate: 0.32, lip: { h: 0.75, d: 0.4 } };
const ALUMINIUM = { color: "#3d4046", metalness: 0.8, roughness: 0.38 };
/** Desk top at y = 0, front edge at z = front, back edge against the wall. */
export const DESK = { w: 130, d: 64, thickness: 3, front: 18, height: 74 };
const ROOM = { w: 400, h: 220 };
const LEG = 5;

/** Where the phone's bottom-back edge rests on the stand (world). */
export const MOUNT = new Vector3(0, STAND.base, 0.4);
/** Screen centre and its outward normal in world space, for camera framing. */
export const SCREEN_CENTER = new Vector3(0, PHONE.h / 2, PHONE.d / 2).applyAxisAngle(X_AXIS, -LEAN).add(MOUNT);
export const SCREEN_NORMAL = new Vector3(0, 0, 1).applyAxisAngle(X_AXIS, -LEAN);

const BASE_FRONT = MOUNT.z + PHONE.d * Math.cos(LEAN) + STAND.lip.d + 0.15;
const BASE_BACK = MOUNT.z - STAND.back * Math.sin(LEAN) - 0.6;
const BACK = DESK.front - DESK.d;

/** Leans its children (the phone) back against the stand's support plate. */
export function Mount({ children }: { children: ReactNode }) {
  return (
    <group position={MOUNT} rotation-x={-LEAN}>
      <group position={[0, PHONE.h / 2, PHONE.d / 2]}>{children}</group>
      {/* Ends below the camera plateau so the bump never touches it. */}
      <RoundedBox args={[STAND.width - 1.6, STAND.back, STAND.plate]} radius={0.12} position={[0, STAND.back / 2, -STAND.plate / 2]} castShadow>
        <meshStandardMaterial {...ALUMINIUM} />
      </RoundedBox>
    </group>
  );
}

export function Stand() {
  return (
    <group>
      <RoundedBox args={[STAND.width, STAND.base, BASE_FRONT - BASE_BACK]} radius={0.12} position={[0, STAND.base / 2, (BASE_FRONT + BASE_BACK) / 2]} castShadow receiveShadow>
        <meshStandardMaterial {...ALUMINIUM} />
      </RoundedBox>
      <RoundedBox args={[STAND.width, STAND.lip.h, STAND.lip.d]} radius={0.12} position={[0, STAND.base + STAND.lip.h / 2 - 0.05, BASE_FRONT - STAND.lip.d / 2 - 0.15]} castShadow>
        <meshStandardMaterial {...ALUMINIUM} />
      </RoundedBox>
    </group>
  );
}

/**
 * A Poly Haven PBR set from public/assets/textures/<id>/: colour, OpenGL normal, and the packed
 * AO/roughness/metalness ("arm") map, tiled `repeat` times. Texture size is ~1 m, i.e. 100 scene units.
 */
function usePbr(id: string, repeat: [number, number]) {
  const dir = `/assets/textures/${id}`;
  const { map, normalMap, arm } = useTexture({ map: `${dir}/diff.jpg`, normalMap: `${dir}/nor.jpg`, arm: `${dir}/arm.jpg` });
  return useMemo(() => {
    for (const t of [map, normalMap, arm]) {
      t.wrapS = t.wrapT = RepeatWrapping;
      t.repeat.set(...repeat);
      t.anisotropy = 8;
    }
    map.colorSpace = SRGBColorSpace;
    return { map, normalMap, aoMap: arm, roughnessMap: arm, metalnessMap: arm, metalness: 1 };
    // `repeat` is a literal at each call site, so the cached textures are configured once.
  }, [map, normalMap, arm]);
}

/** Walnut desk on four legs, a parquet floor below and a plastered wall behind; dithered so dark gradients don't band. */
export function Desk() {
  const walnut = usePbr("black_walnut_veneer_01", [DESK.w / 100, DESK.d / 100]);
  const parquet = usePbr("herringbone_parquet", [ROOM.w / 120, ROOM.w / 120]);
  const plaster = usePbr("painted_plaster_wall", [ROOM.w / 150, ROOM.h / 150]);
  const legs = [-1, 1].flatMap(sx => [-1, 1].map(sz => [sx * (DESK.w / 2 - LEG), -DESK.height / 2, (DESK.front + BACK) / 2 + sz * (DESK.d / 2 - LEG)] as const));
  return (
    <group>
      <mesh position={[0, -DESK.thickness / 2, DESK.front - DESK.d / 2]} receiveShadow castShadow>
        <boxGeometry args={[DESK.w, DESK.thickness, DESK.d]} />
        {/* Satin varnish over the veneer: a soft clearcoat sheen where the lamp hits. */}
        <meshPhysicalMaterial {...walnut} color="#9a7a64" clearcoat={0.3} clearcoatRoughness={0.3} dithering />
      </mesh>
      {legs.map(p => (
        <mesh key={p.join()} position={p} castShadow>
          <boxGeometry args={[LEG, DESK.height - DESK.thickness, LEG]} />
          <meshStandardMaterial {...walnut} color="#9a7a64" />
        </mesh>
      ))}
      <mesh position={[0, -DESK.height, 0]} rotation-x={-Math.PI / 2} receiveShadow>
        <planeGeometry args={[ROOM.w, ROOM.w]} />
        <meshStandardMaterial {...parquet} color="#8a7d72" dithering />
      </mesh>
      <mesh position={[0, ROOM.h / 2 - DESK.height, BACK]} receiveShadow>
        <planeGeometry args={[ROOM.w, ROOM.h]} />
        {/* Tinted toward a deep slate so the warm lamp reads against it. */}
        <meshStandardMaterial {...plaster} color="#59606c" dithering />
      </mesh>
    </group>
  );
}
