import { useGLTF } from "@react-three/drei";
import { useThree } from "@react-three/fiber";
import { useEffect, useMemo } from "react";
import type { Mesh, MeshStandardMaterial } from "three";
import { useOS } from "../os/store";

/**
 * "Apple iPhone 15 Pro Max Black" by polyman (sketchfab.com/Polyman_3D), CC BY 4.0. Draco-compressed;
 * the decoder is served locally rather than from Google's CDN.
 */
const MODEL = "/assets/models/iphone_15_pro_max/iphone.glb";
const DRACO = "/assets/draco/";
/** What the live DOM screen replaces: the display, and the Dynamic Island pill with its camera dot. */
const HIDDEN = new Set(["xXDHkMplTIDAXLN", "DjdhycfQYjKMDyn", "usFLmqcyrnltBUr"]);
const FLASH = "IkoiNqATMVoZFKD";
/** Raw units are cm. The front glass sits at z −0.616 and the back near +0.21; this centres the body. */
const BODY_OFFSET = -0.203;
/** Flash LED after the model is turned to face +z, and the light it throws out of the back. */
export const FLASH_AT: [number, number, number] = [0.62, 6.96, -0.95];
const FLASH_ON = { emissive: 8, light: 40 };

/** The phone model, turned to face +z, with its metals given more of the dim room's reflections. */
export function IPhone() {
  const { scene } = useGLTF(MODEL, DRACO);
  const flashlight = useOS(s => s.flashlight);
  const invalidate = useThree(s => s.invalidate);
  const { object, flash } = useMemo(() => {
    const copy = scene.clone();
    let flash: MeshStandardMaterial | null = null;
    copy.traverse(o => {
      const mesh = o as Mesh;
      if (!mesh.isMesh) return;
      mesh.visible = !HIDDEN.has(mesh.name);
      mesh.castShadow = true;
      const material = (mesh.material as MeshStandardMaterial).clone();
      // Metals are almost all reflection; the room's environment is kept dim for everything else.
      if (material.metalness > 0.4) material.envMapIntensity = 2.4;
      if (mesh.name === FLASH) flash = material;
      mesh.material = material;
    });
    return { object: copy, flash: flash as MeshStandardMaterial | null };
  }, [scene]);

  useEffect(() => {
    if (flash) flash.emissiveIntensity = flashlight ? FLASH_ON.emissive : 1;
    invalidate();
  }, [flash, flashlight, invalidate]);

  return (
    <group>
      <primitive object={object} rotation-y={Math.PI} position-z={BODY_OFFSET} scale={100} />
      <pointLight position={FLASH_AT} intensity={flashlight ? FLASH_ON.light : 0} distance={14} color="#fff2d8" />
    </group>
  );
}

useGLTF.preload(MODEL, DRACO);
