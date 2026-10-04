import { useGLTF } from "@react-three/drei";
import { useMemo } from "react";
import { Color, MeshPhysicalMaterial, type Material, type Mesh, type MeshStandardMaterial, type Texture } from "three";
import { DESK } from "./Desk";
import { REFLECTION_ONLY } from "./geometry";
import { posterTexture } from "./textures";

/** Poly Haven models are in metres; the scene is in centimetres. */
const CM = 100;
const FLOOR = -DESK.height;
const WALL_Z = DESK.front - DESK.d;

/**
 * Poly Haven's glass ships as BLEND over a JPG (no alpha), so in three.js it renders opaque and hides
 * the picture or dial behind it. This replaces it: black with reflection-only blending, it just adds highlights.
 */
const GLASS = new MeshPhysicalMaterial({ color: "#000", roughness: 0.05, metalness: 0, ...REFLECTION_ONLY });

type ModelProps = { id: string; position: [number, number, number]; rotation?: number; scale?: number; art?: Texture };

/** A CC0 glTF from public/assets/models/<id>/, at real-world size, casting and receiving shadows; `art` replaces its artwork. */
export function Model({ id, position, rotation = 0, scale = 1, art }: ModelProps) {
  const { scene } = useGLTF(`/assets/models/${id}/${id}.gltf`);
  const object = useMemo(() => {
    const copy = scene.clone();
    copy.traverse(o => {
      const mesh = o as Mesh;
      if (!mesh.isMesh) return;
      const name = (mesh.material as Material).name;
      const glass = /glass/i.test(name);
      mesh.castShadow = mesh.receiveShadow = !glass;
      if (glass) mesh.material = GLASS;
      else if (art && /artwork/i.test(name)) {
        // A faint emissive copy of the art stands in for a picture light: the wall is otherwise in the dark.
        const lit = { map: art, emissiveMap: art, emissive: new Color("#fff"), emissiveIntensity: 0.45 };
        mesh.material = Object.assign((mesh.material as MeshStandardMaterial).clone(), lit);
      }
    });
    return copy;
  }, [scene, art]);
  return <primitive object={object} position={position} rotation-y={rotation} scale={CM * scale} />;
}

/** Everything in the room that isn't hand-built: desk-top clutter, wall pieces and floor furniture. */
export function Decor() {
  const poster = useMemo(posterTexture, []);
  return (
    <group>
      {/* Desk, back row: encyclopedias against the wall on the left; a succulent and a photo on the right, clear of the laptop. */}
      <Model id="book_encyclopedia_set_01" position={[-60, 0, -39]} rotation={0.12} scale={0.8} />
      <Model id="potted_plant_04" position={[54, 0, -37]} rotation={0.6} />
      {/* The photo faces the model's +x; this turns it to face front-left, toward the middle of the desk. */}
      <Model id="standing_picture_frame_01" position={[55, 0, -15]} rotation={-1.99} scale={0.85} />
      <Model id="alarm_clock_01" position={[-44, 0, -6]} rotation={0.55} />
      {/* Wall. */}
      <Model id="hanging_picture_frame_01" position={[-26, 58, WALL_Z]} scale={0.8} art={poster} />
      <Model id="wall_clock" position={[36, 52, WALL_Z]} />
      {/* Floor, left of the desk. */}
      <Model id="potted_plant_02" position={[-102, FLOOR, -18]} rotation={0.4} />
      <Model id="ceramic_vase_01" position={[-82, FLOOR, -36]} />
    </group>
  );
}
