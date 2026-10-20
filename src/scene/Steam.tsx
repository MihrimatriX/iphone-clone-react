import { Billboard } from "@react-three/drei";
import { useFrame, useThree } from "@react-three/fiber";
import { useEffect, useMemo } from "react";
import { DoubleSide, PlaneGeometry, ShaderMaterial } from "three";
import { noiseTexture } from "./textures";

/** Steam column above the cup (cm) and how often it asks for a frame; the scene is otherwise frameloop="demand". */
const STEAM = { w: 5, h: 15, fps: 30 };

const vertexShader = /* glsl */ `
  uniform float uTime;
  uniform sampler2D uNoise;
  varying vec2 vUv;
  void main() {
    vUv = uv;
    vec3 p = position;
    // Higher up, the column twists and drifts more, like warm air losing its shape.
    float twist = texture2D(uNoise, vec2(0.5, uv.y * 0.2 - uTime * 0.005)).r * 8.0 * uv.y;
    p.xz = mat2(cos(twist), sin(twist), -sin(twist), cos(twist)) * p.xz;
    vec2 wind = vec2(
      texture2D(uNoise, vec2(0.25, uTime * 0.01)).r - 0.5,
      texture2D(uNoise, vec2(0.75, uTime * 0.01)).r - 0.5
    ) * pow(uv.y, 2.0) * 6.0;
    p.xz += wind;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(p, 1.0);
  }
`;

const fragmentShader = /* glsl */ `
  uniform float uTime;
  uniform sampler2D uNoise;
  varying vec2 vUv;
  void main() {
    float smoke = texture2D(uNoise, vUv * vec2(0.5, 0.3) - vec2(0.0, uTime * 0.04)).r;
    // Octave-summed value noise clusters around 0.5, so the threshold sits inside its real range.
    smoke = smoothstep(0.45, 0.8, smoke);
    // Soft edges all round; fades in just above the coffee and thins out toward the top.
    smoke *= smoothstep(0.0, 0.2, vUv.x) * smoothstep(1.0, 0.8, vUv.x);
    smoke *= smoothstep(0.0, 0.12, vUv.y) * smoothstep(1.0, 0.45, vUv.y);
    gl_FragColor = vec4(0.92, 0.88, 0.82, smoke * 0.6);
  }
`;

/** Wisps of steam rising from hot coffee: a camera-facing noise shader, ticking at 30 fps. */
export function Steam({ y }: { y: number }) {
  const invalidate = useThree(s => s.invalidate);
  const { geometry, material } = useMemo(() => {
    const geometry = new PlaneGeometry(STEAM.w, STEAM.h, 16, 64).translate(0, STEAM.h / 2, 0);
    const material = new ShaderMaterial({
      vertexShader,
      fragmentShader,
      uniforms: { uTime: { value: 0 }, uNoise: { value: noiseTexture() } },
      transparent: true,
      depthWrite: false,
      side: DoubleSide,
    });
    return { geometry, material };
  }, []);

  useEffect(() => {
    const id = setInterval(() => invalidate(), 1000 / STEAM.fps);
    return () => clearInterval(id);
  }, [invalidate]);
  useFrame(({ clock }) => {
    if (material.uniforms.uTime) material.uniforms.uTime.value = clock.elapsedTime;
  });

  return (
    <Billboard position-y={y} lockX lockZ>
      <mesh geometry={geometry} material={material} raycast={() => null} />
    </Billboard>
  );
}
