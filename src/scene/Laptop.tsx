import { useGLTF } from "@react-three/drei";
import { useMemo } from "react";
import { MeshBasicMaterial, Quaternion, Vector3, type Mesh } from "three";
import { RectAreaLightUniformsLib } from "three/examples/jsm/lights/RectAreaLightUniformsLib.js";
import { screenTexture } from "./laptopScreen";

// Area lights need their LTC lookup tables registered once before any material compiles.
RectAreaLightUniformsLib.init();

/**
 * "macbook pro M3 16 inch 2024" by jackbaeten (sketchfab.com/jackbaeten), CC BY 4.0. Draco-compressed;
 * decoder served locally. Raw units are cm; every node is turned +90° about x, so world y = −raw z.
 */
const MODEL = "/assets/models/macbook_pro_m3/macbook.glb";
const DRACO = "/assets/draco/";
/** The display panel; its own wallpaper is swapped for our editor screen. */
const SCREEN_MESH = "Object_123";
/** Scaled from the 16-inch model down to a 14-inch footprint; lifted so the feet (raw z +1.07) sit on the desk. */
const SCALE = 0.88;
const LIFT = 1.07 * SCALE;
/** Display centre, size and outward normal in the model (it leans ~20° back), for the area light. */
const DISPLAY = { centre: new Vector3(0, 11.75, -16.96), w: 34.4, h: 22.25, normal: new Vector3(0, 0.342, 0.94) };
/** The open screen washes the desk in a soft, cool rectangle of light. */
const SCREEN_LIGHT = { intensity: 1.2, color: "#a9bbff" };

/** Open laptop behind the phone, showing an editor; its screen is a real area light. */
export function Laptop() {
  const { scene } = useGLTF(MODEL, DRACO);
  const object = useMemo(() => {
    const copy = scene.clone();
    const display = screenTexture();
    // Unlike the rest of the glTF, this panel's UVs are laid out bottom-up, so the canvas keeps its default flipY.
    copy.traverse(o => {
      const mesh = o as Mesh;
      if (!mesh.isMesh) return;
      mesh.castShadow = mesh.receiveShadow = true;
      // An unlit screen: it emits, it isn't lit by the lamp.
      if (mesh.name === SCREEN_MESH) mesh.material = new MeshBasicMaterial({ map: display, color: "#a3a8b4", toneMapped: false });
    });
    return copy;
  }, [scene]);
  // Lights face their −Z; turn that onto the display's normal.
  const facing = useMemo(() => new Quaternion().setFromUnitVectors(new Vector3(0, 0, -1), DISPLAY.normal), []);

  return (
    <group position={[26, LIFT, -20]} rotation-y={-0.25} scale={SCALE}>
      <primitive object={object} />
      <rectAreaLight
        args={[SCREEN_LIGHT.color, SCREEN_LIGHT.intensity, DISPLAY.w, DISPLAY.h]}
        position={DISPLAY.centre.clone().addScaledVector(DISPLAY.normal, 0.2)}
        quaternion={facing}
      />
    </group>
  );
}

useGLTF.preload(MODEL, DRACO);
