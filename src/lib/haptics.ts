import { useOS } from "../os/store";
import { buzz, tick } from "./sound";

export type HapticKind = "selection" | "light" | "medium" | "heavy" | "success" | "warning" | "error";

/**
 * One vibrate pattern (on, off, on ...) drives every layer; shake is the 3D impulse in world units.
 * Taps and selection ticks don't move the 3D phone: a shake on every touch reads as jitter.
 */
export const HAPTICS: Record<HapticKind, { pattern: number[]; shake: number }> = {
  selection: { pattern: [8], shake: 0 },
  light: { pattern: [12], shake: 0 },
  medium: { pattern: [25], shake: 0.012 },
  heavy: { pattern: [40], shake: 0.025 },
  success: { pattern: [20, 60, 30], shake: 0.015 },
  warning: { pattern: [30, 80, 30], shake: 0.02 },
  error: { pattern: [40, 50, 40, 50, 40], shake: 0.03 },
};

export const REDUCED_MOTION_SHAKE = 0.25;

export function hapticSpec(kind: HapticKind, reducedMotion: boolean) {
  const { pattern, shake } = HAPTICS[kind];
  return { pattern, shake: reducedMotion ? shake * REDUCED_MOTION_SHAKE : shake };
}

let iosSwitch: HTMLLabelElement | null | undefined;

/** iOS 18+ Safari has no vibrate API, but toggling a native `<input switch>` fires the system haptic. */
function makeIosSwitch(): HTMLLabelElement | null {
  const ua = navigator.userAgent;
  const isIOS = /iP(hone|ad|od)/.test(ua) || (/Macintosh/.test(ua) && navigator.maxTouchPoints > 1);
  if (!isIOS) return null;
  const label = document.createElement("label");
  const input = document.createElement("input");
  input.type = "checkbox";
  input.setAttribute("switch", "");
  label.append(input);
  label.setAttribute("aria-hidden", "true");
  label.style.cssText = "position:fixed;left:-200px;opacity:0;pointer-events:none";
  document.body.append(label);
  return label;
}

const reducedMotion = typeof window !== "undefined" ? matchMedia("(prefers-reduced-motion: reduce)") : null;

export function haptic(kind: HapticKind) {
  const os = useOS.getState();
  if (!os.haptics) return;
  const { pattern, shake } = hapticSpec(kind, reducedMotion?.matches ?? false);
  // Chrome logs an intervention warning for vibrate() before the first user gesture.
  if (navigator.userActivation?.hasBeenActive) {
    if ("vibrate" in navigator) navigator.vibrate(pattern);
    else {
      iosSwitch ??= makeIosSwitch();
      iosSwitch?.click();
    }
  }
  // Only physical-feeling kinds buzz and shake; taps get a soft tick like iOS keyboard clicks.
  if (shake > 0) {
    os.kick(shake);
    buzz(pattern);
  } else {
    tick();
  }
}
