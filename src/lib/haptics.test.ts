import { expect, test } from "bun:test";
import { HAPTICS, hapticSpec, REDUCED_MOTION_SHAKE } from "./haptics";

test("every kind has a valid on/off pattern", () => {
  for (const { pattern } of Object.values(HAPTICS)) {
    expect(pattern.length % 2).toBe(1); // starts and ends with a pulse
    expect(pattern.every(ms => ms > 0)).toBe(true);
  }
});

test("heavier kinds shake more; plain taps don't shake the phone", () => {
  expect(HAPTICS.heavy.shake).toBeGreaterThan(HAPTICS.medium.shake);
  expect(HAPTICS.medium.shake).toBeGreaterThan(HAPTICS.light.shake);
  expect(HAPTICS.light.shake).toBe(0);
  expect(HAPTICS.selection.shake).toBe(0);
});

test("reduced motion damps the shake but keeps the pattern", () => {
  const spec = hapticSpec("heavy", true);
  expect(spec.shake).toBeCloseTo(HAPTICS.heavy.shake * REDUCED_MOTION_SHAKE);
  expect(spec.pattern).toEqual(HAPTICS.heavy.pattern);
});
